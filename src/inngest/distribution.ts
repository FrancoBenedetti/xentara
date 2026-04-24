import { inngest } from "./client";
import { createAdminClient } from '@/utils/supabase/admin';
import { 
    formatPublicationForTelegram, 
    formatPreviewForTelegram 
} from '@/lib/telegram/formatter';
import { buildReactionButtons, DEFAULT_REACTIONS } from '@/lib/engagement/reactions';
import { Bot } from 'grammy';
// Note: We use the admin client because this runs server-side via Inngest triggers

export const distributePublication = (inngest as any).createFunction(
  {
    id: 'xentara-distribution-agent',
    triggers: [{ event: 'xentara/publication.published' }],
    concurrency: { limit: 5 },
    retries: 2,
  },
  async ({ event, step }: any) => {
    const { publicationId, hubId } = event.data;

    // Step 1: Fetch context
    const context = await step.run('fetch-distribution-context', async () => {
      const supabase = createAdminClient();
      
      // Get publication and hub
      const { data: publication } = await supabase
        .from('publications')
        .select('*')
        .eq('id', publicationId)
        .single();
        
      const { data: hub } = await supabase
        .from('hubs')
        .select('*')
        .eq('id', hubId)
        .single();

      if (!publication || !hub) {
        throw new Error("Missing publication or hub context");
      }

      // Get hub channels
      const { data: channels } = await supabase
        .from('hub_channels')
        .select('*')
        .eq('hub_id', hubId)
        .eq('is_active', true);

      // Get eligible subscribers (who have telegram linked)
      // First we get subscriptions
      const { data: subscriptions } = await supabase
        .from('hub_subscriptions')
        .select('consumer_id') // We could fetch preferences too if added to schema
        .eq('hub_id', hubId);

      const consumerIds = (subscriptions || []).map((s: any) => s.consumer_id);
      
      let eligibleSubscribers: any[] = [];
      if (consumerIds.length > 0) {
        const { data: identities } = await supabase
          .from('messenger_identities')
          .select('consumer_id, platform, platform_user_id')
          .in('consumer_id', consumerIds)
          .eq('platform', 'telegram');
          
        eligibleSubscribers = identities || [];
      }

      const { data: engagementConfig } = await supabase
        .from('hub_engagement_config')
        .select('reactions_enabled, comments_enabled')
        .eq('hub_id', hubId)
        .maybeSingle();

      return {
        publication,
        hub,
        channels: channels || [],
        eligibleSubscribers,
        engagementConfig: {
          reactionsEnabled: engagementConfig?.reactions_enabled ?? DEFAULT_REACTIONS,
          commentsEnabled: engagementConfig?.comments_enabled ?? true
        }
      };
    });

    // Step 2: Format content
    const formatted = await step.run('format-for-platforms', async () => {
      return {
        telegram: formatPublicationForTelegram(context.publication, context.hub),
        telegramPreview: formatPreviewForTelegram(context.publication, context.hub),
        whatsapp: '' // Deferred.
      };
    });

    // We instantiate bot here so we can send messages
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

    // Step 3: Broadcast to channels
    await step.run('broadcast-to-channels', async () => {
      if (!telegramToken) {
         console.warn("No TELEGRAM_BOT_TOKEN provided, skipping channel broadcast");
         return;
      }
      const bot = new Bot(telegramToken);
      const supabase = createAdminClient();

      for (const channel of context.channels) {
        try {
          if (channel.platform === 'telegram') {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const viewerUrl = `${appUrl}/p/${publicationId}`;
            
            const row1 = [
                { text: '🧠 Read Intelligence', url: viewerUrl }
            ];
            
            if (context.publication.source_url) {
                row1.push({ text: '🔗 Source Article', url: context.publication.source_url });
            }

            const row2 = buildReactionButtons(publicationId, context.engagementConfig.reactionsEnabled);
            const tagButtons = (context.publication.tags || []).slice(0, 3).map((tag: string) => ({
                text: `#${tag}`,
                switch_inline_query_current_chat: `#${tag}`
            }));
            
            const inlineKeyboard: any[] = [row1];
            if (tagButtons.length > 0) inlineKeyboard.push(tagButtons);
            if (row2.length > 0) inlineKeyboard.push(row2);

            const message = await bot.api.sendMessage(channel.channel_id, formatted.telegramPreview, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: inlineKeyboard
                }
            });
            
            await supabase.from('distribution_log').insert({
              publication_id: publicationId,
              hub_channel_id: channel.id,
              platform: 'telegram',
              target_id: channel.channel_id.toString(),
              status: 'sent',
              message_id: message.message_id.toString(),
              sent_at: new Date().toISOString()
            });
          }
        } catch (error: any) {
          console.error(`Failed to broadcast to ${channel.platform} channel ${channel.channel_id}:`, error);
          
          await supabase.from('distribution_log').insert({
              publication_id: publicationId,
              hub_channel_id: channel.id,
              platform: channel.platform,
              target_id: channel.channel_id.toString(),
              status: error.message?.includes('429') ? 'rate_limited' : 'failed',
              error_message: error.message
          });
        }
      }
    });

    // Step 4: Push to individual subscribers (DMs)
    await step.run('push-to-subscribers', async () => {
       if (!telegramToken) return;
       const bot = new Bot(telegramToken);
       const supabase = createAdminClient();

       // In a real app we would apply selective push logic here based on preferences
       // For now (Option C), we queue them sequentially or batch them with delay.
       
       for (const identity of context.eligibleSubscribers) {
          try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const viewerUrl = `${appUrl}/p/${publicationId}`;

            const row1 = [
                { text: '🧠 Read Intelligence', url: viewerUrl }
            ];
            
            if (context.publication.source_url) {
                row1.push({ text: '🔗 Source Article', url: context.publication.source_url });
            }

            const row2 = buildReactionButtons(publicationId, context.engagementConfig.reactionsEnabled);
            const tagButtons = (context.publication.tags || []).slice(0, 3).map((tag: string) => ({
                text: `#${tag}`,
                switch_inline_query_current_chat: `#${tag}`
            }));
            
            const inlineKeyboard: any[] = [row1];
            if (tagButtons.length > 0) inlineKeyboard.push(tagButtons);
            if (row2.length > 0) inlineKeyboard.push(row2);

            const message = await bot.api.sendMessage(identity.platform_user_id, formatted.telegramPreview, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: inlineKeyboard
                }
            });
            
            await supabase.from('distribution_log').insert({
              publication_id: publicationId,
              platform: 'telegram',
              target_id: identity.platform_user_id.toString(),
              status: 'sent',
              message_id: message.message_id.toString(),
              sent_at: new Date().toISOString()
            });

            // Very basic rate limiting between DMs
            await new Promise(resolve => setTimeout(resolve, 50)); 
          } catch (error: any) {
            console.error(`Failed to DM telegram user ${identity.platform_user_id}:`, error);
            
            await supabase.from('distribution_log').insert({
              publication_id: publicationId,
              platform: 'telegram',
              target_id: identity.platform_user_id.toString(),
              status: error.message?.includes('429') ? 'rate_limited' : 'failed',
              error_message: error.message
            });
          }
       }
    });

    return { 
      status: 'distributed', 
      channels: context.channels.length, 
      subscribers: context.eligibleSubscribers.length 
    };
  }
);
