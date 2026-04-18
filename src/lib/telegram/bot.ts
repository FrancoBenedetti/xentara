import { SupabaseClient } from '@supabase/supabase-js';
import { inngest } from '@/inngest/client';
import { Bot, InlineKeyboard } from 'grammy';
import { createAdminClient } from '@/utils/supabase/admin';
import { escapeHTML } from './formatter';
import { BASE_REACTION_SET, DEFAULT_REACTIONS, ReactionKey, buildReactionButtons } from '@/lib/engagement/reactions';
// Initialize the bot with the token from environment variables
// It's safe to cast since we'll check it in the webhook route before calling
export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || 'dummy_token_for_build');

// /start - Welcome message with instructions
bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id;
  let isLinked = false;

  if (telegramId) {
    const adminClient = createAdminClient();
    const { data: identity } = await adminClient
      .from('messenger_identities')
      .select('id')
      .eq('platform', 'telegram')
      .eq('platform_user_id', telegramId.toString())
      .eq('is_verified', true)
      .maybeSingle();
    
    isLinked = !!identity;
  }

  const welcomeText = 
    "🧠 <b>Xentara Intelligence Bot</b>\n\n" +
    "I deliver curated intelligence from Xentara Hubs directly to your Telegram.\n\n" +
    (isLinked 
      ? "✅ <b>Your account is linked!</b> You are ready to receive intelligence updates."
      : "<b>Getting Started:</b>\n" +
        "1. Create an account at <a href=\"https://xentara-reader.growthhq.biz\">Xentara Browser</a>\n" +
        "2. Copy your 6-digit link code from your Profile\n" +
        "3. Use /link <code>&lt;code&gt;</code> to connect this chat\n\n" +
        "Once linked, you can subscribe to hubs to receive intelligence feeds.") +
    "\n\n<b>Commands:</b>\n" +
    "/link <code>&lt;token&gt;</code> — Link your account\n" +
    "/subscribe <code>&lt;hub&gt;</code> — Subscribe to hub feeds\n" +
    "/myhubs — Manage your subscriptions\n" +
    "/help — Show instructions";

  const keyboard = new InlineKeyboard();
  
  if (!isLinked) {
    keyboard.url("🔑 Register on PWA", "https://xentara-reader.growthhq.biz").row();
    keyboard.text("❓ How it works", "how_it_works");
  } else {
    keyboard.text("📋 My Hubs", "my_subscriptions");
    keyboard.text("🔍 Explore Hubs", "browse_hubs").row();
    keyboard.url("🌐 Visit Xentara Browser", "https://xentara-reader.growthhq.biz").row();
    keyboard.text("❓ Help", "help");
  }

  await ctx.reply(welcomeText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard,
    link_preview_options: { is_disabled: true }
  });
});

// Handle "How it works" callback
bot.callbackQuery("how_it_works", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "<b>How Xentara works:</b>\n\n" +
    "1️⃣ <b>Create Profile:</b> Visit the <a href=\"https://xentara-reader.growthhq.biz\">Xentara Browser</a> and sign up.\n" +
    "2️⃣ <b>Link Telegram:</b> Go to your Profile on the website, find the Telegram section, and generate a 6-digit code.\n" +
    "3️⃣ <b>Connect:</b> Type <code>/link &lt;your-code&gt;</code> in this chat.\n" +
    "4️⃣ <b>Subscribe:</b> Browse hubs on the website or use <code>/subscribe &lt;hub-slug&gt;</code> to start receiving intelligence.",
    { parse_mode: 'HTML', link_preview_options: { is_disabled: true } }
  );
});

// Handle "My Hubs" button callback
bot.callbackQuery("my_subscriptions", async (ctx) => {
  await ctx.answerCallbackQuery();
  // We can just trigger the command handler logic
  // For simplicity, we just tell them to use the command or we could extract the logic.
  // Let's just point them to the command for now or call the handler if we had it as a separate function.
  // Actually, we can reuse the logic easily.
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  try {
    const adminClient = createAdminClient();
    const { data: identity } = await adminClient
      .from('messenger_identities')
      .select('consumer_id')
      .eq('platform', 'telegram')
      .eq('platform_user_id', telegramId.toString())
      .single();

    if (!identity) {
      return ctx.reply("Account not linked.");
    }

    const { data: subs } = await adminClient
      .from('hub_subscriptions')
      .select('hubs (name, slug)')
      .eq('consumer_id', identity.consumer_id);

    if (!subs || subs.length === 0) {
      return ctx.reply('You are not currently subscribed to any hubs.');
    }

    const hubList = subs.map((s: any) => `• <b>${escapeHTML(s.hubs.name)}</b> (<code>${escapeHTML(s.hubs.slug)}</code>)`).join('\n');
    await ctx.reply(`<b>Your Hub Subscriptions:</b>\n\n${hubList}`, { parse_mode: 'HTML' });
  } catch (e) {
    await ctx.reply("Error fetching subscriptions.");
  }
});

// Handle "Explore Hubs" callback
bot.callbackQuery("browse_hubs", async (ctx) => {
  await ctx.answerCallbackQuery();
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  try {
    const adminClient = createAdminClient();
    
    // Check if user is linked
    const { data: identity } = await adminClient
      .from('messenger_identities')
      .select('consumer_id')
      .eq('platform', 'telegram')
      .eq('platform_user_id', telegramId.toString())
      .single();

    if (!identity) {
      return ctx.reply("Please link your account first using the 🔑 Register button above.");
    }

    // Get all hubs
    const { data: hubs } = await adminClient
      .from('hubs')
      .select('name, slug')
      .order('name', { ascending: true });

    // Get current subscriptions
    const { data: subs } = await adminClient
      .from('hub_subscriptions')
      .select('hubs (slug)')
      .eq('consumer_id', identity.consumer_id);

    if (!hubs || hubs.length === 0) {
      return ctx.reply('No hubs available at the moment.');
    }

    const subSlugs = new Set((subs || []).map((s: any) => s.hubs.slug));

    const keyboard = new InlineKeyboard();
    hubs.forEach((hub, index) => {
      const isSubscribed = subSlugs.has(hub.slug);
      const label = isSubscribed ? `✅ Subscribed: ${hub.name}` : `➕ Subscribe: ${hub.name}`;
      keyboard.text(label, `sub_${hub.slug}`);
      keyboard.row();
    });
    
    keyboard.text("❓ Help", "help");

    await ctx.reply("🔍 <b>Explore Xentara Hubs</b>\n\nChoose a hub below to start/stop receiving its intelligence feed directly in this chat:", {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch (e) {
    console.error('Browse hubs error:', e);
    await ctx.reply("Error fetching hubs.");
  }
});

// Handle Dynamic Subscription callback (Toggle)
bot.callbackQuery(/^sub_(.+)$/, async (ctx) => {
  const slug = ctx.match[1];
  const telegramId = ctx.from?.id;
  if (!telegramId || !slug) return;

  try {
    const adminClient = createAdminClient();
    
    // Find hub
    const { data: hub } = await adminClient
      .from('hubs')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (!hub) {
      await ctx.answerCallbackQuery("Hub not found.");
      return;
    }

    // Find identity
    const { data: identity } = await adminClient
      .from('messenger_identities')
      .select('consumer_id')
      .eq('platform', 'telegram')
      .eq('platform_user_id', telegramId.toString())
      .single();

    if (!identity) {
      await ctx.answerCallbackQuery("Account not linked.");
      return;
    }

    // Check for existing subscription
    const { data: existingSub } = await adminClient
      .from('hub_subscriptions')
      .select('id')
      .eq('consumer_id', identity.consumer_id)
      .eq('hub_id', hub.id)
      .maybeSingle();

    if (existingSub) {
      // Unsubscribe
      await adminClient
        .from('hub_subscriptions')
        .delete()
        .eq('id', existingSub.id);
      await ctx.answerCallbackQuery(`Unsubscribed from ${hub.name}`);
    } else {
      // Subscribe
      await adminClient
        .from('hub_subscriptions')
        .insert({
          consumer_id: identity.consumer_id,
          hub_id: hub.id,
        });
      await ctx.answerCallbackQuery(`Subscribed to ${hub.name}!`);
    }

    // UPDATE KEYBOARD IN REAL-TIME
    const { data: allHubs } = await adminClient
      .from('hubs')
      .select('name, slug')
      .order('name', { ascending: true });

    const { data: allSubs } = await adminClient
      .from('hub_subscriptions')
      .select('hubs (slug)')
      .eq('consumer_id', identity.consumer_id);

    const updatedSubSlugs = new Set((allSubs || []).map((s: any) => s.hubs.slug));
    const newKeyboard = new InlineKeyboard();
    
    (allHubs || []).forEach((h) => {
      const active = updatedSubSlugs.has(h.slug);
      const label = active ? `✅ Subscribed: ${h.name}` : `➕ Subscribe: ${h.name}`;
      newKeyboard.text(label, `sub_${h.slug}`).row();
    });

    try {
      await ctx.editMessageReplyMarkup({ reply_markup: newKeyboard });
    } catch (err) {
      // Ignore if markup is same
    }
    
  } catch (error) {
    console.error('Toggle subscription error:', error);
    await ctx.answerCallbackQuery("Action failed.");
  }
});

// --- INLINE MODE SEARCH ---
// Note: To enable this, you must go to @BotFather -> /setinline -> Choose your bot
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query.trim();
  
  try {
    const adminClient = createAdminClient();
    let supabaseQuery = adminClient.from('hubs').select('id, name, slug');
    
    if (query) {
      supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
    }

    const { data: hubs } = await supabaseQuery.limit(10);

    const results = (hubs || []).map((hub): any => ({
      type: "article",
      id: `hub_${hub.id}`,
      title: hub.name,
      description: `Subscribe to ${hub.name} (${hub.slug})`,
      input_message_content: {
        message_text: `/subscribe ${hub.slug}`,
        parse_mode: 'HTML'
      },
      reply_markup: new InlineKeyboard().text(`➕ Subscribe to ${hub.name}`, `sub_${hub.slug}`)
    }));

    await ctx.answerInlineQuery(results, { cache_time: 300 });
  } catch (err) {
    console.error('Inline search error:', err);
  }
});

// /link <code> - Complete identity hydration from Phase 7
bot.command('link', async (ctx) => {
  const code = ctx.match?.trim();
  
  if (!code || code.length !== 6) {
    return ctx.reply('Please provide a 6-digit link code. Example: `/link 123456`', { parse_mode: 'Markdown' });
  }

  const telegramId = ctx.from?.id;
  const username = ctx.from?.username;
  
  if (!telegramId) {
    return ctx.reply('Could not identify your Telegram account.');
  }

  try {
    const adminClient = createAdminClient();
    
    // First, verify the token by joining with messenger_identities
    const { data: linkToken, error: tokenError } = await adminClient
      .from('link_tokens')
      .select('id, messenger_identity_id, messenger_identities!inner(platform, consumer_id)')
      .eq('token', code)
      .is('claimed_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !linkToken) {
      console.error('[Telegram Webhook] Token verification error:', tokenError);
      return ctx.reply('❌ Invalid or expired code. Please generate a new one from the Xentara Studio.');
    }

    // Verify it's a telegram token
    const identity = linkToken.messenger_identities as unknown as { platform: string, consumer_id: string };
    if (identity.platform !== 'telegram') {
      return ctx.reply('❌ This code is not for Telegram.');
    }

    // Update the existing messenger identity with the real verified Telegram ID and username
    const identityData = {
      platform_user_id: telegramId.toString(),
      platform_username: username || null,
      is_verified: true,
      linked_at: new Date().toISOString()
    };

    const { error: updateError } = await adminClient
      .from('messenger_identities')
      .update(identityData)
      .eq('id', linkToken.messenger_identity_id);

    if (updateError) throw updateError;

    // Mark token as claimed by the consumer profile
    await adminClient
      .from('link_tokens')
      .update({ claimed_at: new Date().toISOString(), claimed_by: identity.consumer_id })
      .eq('id', linkToken.id);

    return ctx.reply('✅ *Success!*\n\nYour Telegram account is now linked to your Xentara profile.', { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error linking Telegram account:', error);
    return ctx.reply('❌ Something went wrong while linking your account. Please try again later.');
  }
});

// /subscribe <hub-slug> - Subscribe to a hub
bot.command('subscribe', async (ctx) => {
  const slug = ctx.match?.trim();
  
  if (!slug) {
    const keyboard = new InlineKeyboard().url("🌐 Browse Hubs", "https://xentara-reader.growthhq.biz");
    return ctx.reply('Please specify a hub slug. Example: `/subscribe tech-news` \n\nYou can find slugs on the Xentara Browser.', { 
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
  }
  
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  try {
    const adminClient = createAdminClient();
    
    // Find the hub
    const { data: hub, error: hubError } = await adminClient
      .from('hubs')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (hubError || !hub) {
      return ctx.reply(`❌ Could not find a hub with the slug "${slug}".`);
    }

    // Check if the user has a linked profile
    const { data: identity } = await adminClient
      .from('messenger_identities')
      .select('consumer_id')
      .eq('platform', 'telegram')
      .eq('platform_user_id', telegramId.toString())
      .single();

    if (!identity || !identity.consumer_id) {
       return ctx.reply('⚠️ You must link your Xentara account first before you can subscribe.\n\nPlease visit the Xentara Studio to get your link code, then use `/link <code>`.', { parse_mode: 'Markdown' });
    }

    // Create subscription
    const { error: subError } = await adminClient
      .from('hub_subscriptions')
      .upsert({
        consumer_id: identity.consumer_id,
        hub_id: hub.id,
      }, { onConflict: 'consumer_id,hub_id' });

    if (subError) throw subError;

    return ctx.reply(`✅ Successfully subscribed to <b>${escapeHTML(hub.name)}</b>!\n\nYou will now receive updates based on your notification preferences.`, { parse_mode: 'HTML' });

  } catch (error) {
    console.error('Subscription error:', error);
    return ctx.reply('❌ An error occurred while subscribing. Please try again later.');
  }
});

// /myhubs - List subscriptions
bot.command('myhubs', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  try {
    const adminClient = createAdminClient();
    
    // Find consumer_id
    const { data: identity } = await adminClient
      .from('messenger_identities')
      .select('consumer_id')
      .eq('platform', 'telegram')
      .eq('platform_user_id', telegramId.toString())
      .single();

    if (!identity || !identity.consumer_id) {
       return ctx.reply('You are not linked to a Xentara account. Use `/link <code>` to get started.', { parse_mode: 'Markdown' });
    }

    // Get active subscriptions
    const { data: subs, error } = await adminClient
      .from('hub_subscriptions')
      .select('hubs (name, slug)')
      .eq('consumer_id', identity.consumer_id);

    if (error || !subs || subs.length === 0) {
      return ctx.reply('You are not currently subscribed to any hubs.');
    }

    const hubList = subs.map((s: any) => `• <b>${escapeHTML(s.hubs.name)}</b> (<code>${escapeHTML(s.hubs.slug)}</code>)`).join('\n');
    return ctx.reply(`<b>Your Hub Subscriptions:</b>\n\n${hubList}`, { parse_mode: 'HTML' });
    
  } catch (error) {
    console.error('Myhubs error:', error);
    return ctx.reply('❌ An error occurred while fetching your subscriptions.');
  }
});

// /chatid - Helper to get the ID of the current chat (especially for groups)
bot.command('chatid', async (ctx) => {
  const chatId = ctx.chat.id;
  const chatType = ctx.chat.type;
  await ctx.reply(`🆔 <b>Chat Info</b>\n\n<b>Type:</b> ${chatType}\n<b>Target ID:</b> <code>${chatId}</code>\n\n<i>Copy this ID and add it to your Hub Distribution settings.</i>`, { parse_mode: 'HTML' });
});


// /help - Detailed instructions
bot.command('help', async (ctx) => {
  const telegramId = ctx.from?.id;
  let isLinked = false;

  if (telegramId) {
    const adminClient = createAdminClient();
    const { data: identity } = await adminClient
      .from('messenger_identities')
      .select('id')
      .eq('platform', 'telegram')
      .eq('platform_user_id', telegramId.toString())
      .eq('is_verified', true)
      .maybeSingle();
    isLinked = !!identity;
  }

  const helpText = 
    "❓ <b>Xentara Help & Instructions</b>\n\n" +
    "To use this bot, you must connect it to your Xentara Profile.\n\n" +
    "<b>Steps to connect:</b>\n" +
    "1. Register at <a href=\"https://xentara-reader.growthhq.biz\">Xentara Browser</a>\n" +
    "2. Visit your Profile and generate a 6-digit Link Code\n" +
    "3. Use /link <code>&lt;your-code&gt;</code> here\n\n" +
    "<b>Commands:</b>\n" +
    "/link — Link your profile\n" +
    "/subscribe — Follow a hub (e.g. <code>/subscribe technology</code>)\n" +
    "/myhubs — List your active feeds\n" +
    "/chatid — Technical chat info\n\n" +
    "<b>⚡ Inline Search:</b>\n" +
    "You can search for hubs from any chat! Just type <code>@bot_username keyword</code> to find and share hub subscription links.";

  const keyboard = new InlineKeyboard();
  if (!isLinked) {
    keyboard.url("🔑 Register on PWA", "https://xentara-reader.growthhq.biz").row();
    keyboard.text("❓ How it works", "how_it_works");
  } else {
    keyboard.text("📋 My Hubs", "my_subscriptions");
    keyboard.text("🔍 Explore Hubs", "browse_hubs").row();
    keyboard.url("🌐 Visit PWA", "https://xentara-reader.growthhq.biz");
  }

  await ctx.reply(helpText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard,
    link_preview_options: { is_disabled: true }
  });
});

// Alias "help" callback to command
bot.callbackQuery("help", async (ctx) => {
  await ctx.answerCallbackQuery();
  // We manually call the logic or we can just send the message.
  // In grammy, we can't easily trigger the command handler with a dummy context
  // So we just re-execute the start logic here or move instructions to a helper.
  // For now, let's just use the shared callback query handler logic if we extract it.
  // But let's keep it simple: just reply with the help text.
  await ctx.reply("Type /help to see all instructions and commands.");
});

// Error handler
bot.catch((err) => {
  console.error(`Error while handling update ${err.ctx.update.update_id}:`);
  console.error(err.error);
});

// Helper for finding or creating an unlinked messenger identity
async function findOrCreateMessengerIdentity(
  adminClient: SupabaseClient,
  telegramId: number,
  username?: string
) {
  const { data: existing } = await adminClient
    .from('messenger_identities')
    .select('id, consumer_id')
    .eq('platform', 'telegram')
    .eq('platform_user_id', telegramId.toString())
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await adminClient
    .from('messenger_identities')
    .insert({
      platform: 'telegram',
      platform_user_id: telegramId.toString(),
      platform_username: username || null,
      is_verified: false
    })
    .select('id, consumer_id')
    .single();

  return created!;
}

// Reaction Handler
bot.callbackQuery(/^react_(.+)_(.+)$/, async (ctx) => {
  const publicationId = ctx.match[1];
  const reactionType = ctx.match[2]; // 'insight' | 'helpful' | 'irrelevant'
  const telegramId = ctx.from?.id;
  if (!telegramId || !publicationId) return;

  const adminClient = createAdminClient();

  let identity = await findOrCreateMessengerIdentity(adminClient, telegramId, ctx.from?.username);

  const { data: pub } = await adminClient
    .from('publications')
    .select('hub_id')
    .eq('id', publicationId)
    .single();

  if (!pub) {
    return ctx.answerCallbackQuery("Publication not found.");
  }

  const { data: config } = await adminClient
    .from('hub_engagement_config')
    .select('reactions_enabled')
    .eq('hub_id', pub.hub_id)
    .maybeSingle();

  const allowed: string[] = config?.reactions_enabled ?? DEFAULT_REACTIONS;

  if (!allowed.includes(reactionType)) {
    return ctx.answerCallbackQuery("This reaction is no longer available for this hub.");
  }

  const { error } = await adminClient
    .from('publication_engagement')
    .insert({
      publication_id: publicationId,
      hub_id: pub.hub_id,
      consumer_id: identity.consumer_id || null,
      messenger_identity_id: identity.id,
      platform: 'telegram',
      type: 'reaction',
      value: reactionType,
      metadata: { chat_id: ctx.chat?.id }
    } as any);

  if (error && error.code === '23505') {
    // Unique violation means they are toggling OFF
    await adminClient
      .from('publication_engagement')
      .delete()
      .eq('publication_id', publicationId)
      .eq('messenger_identity_id', identity.id)
      .eq('type', 'reaction')
      .eq('value', reactionType);

    await ctx.answerCallbackQuery("Reaction removed.");
  } else if (error) {
    console.error("Error inserting reaction:", error);
    await ctx.answerCallbackQuery("Error saving reaction.");
  } else {
    const callbackLabel = BASE_REACTION_SET[reactionType as ReactionKey]?.callbackLabel ?? "Recorded!";
    await ctx.answerCallbackQuery(callbackLabel);
  }

  // Update inline keyboard to show toggle state/counts
  try {
    const { data: engagements } = await adminClient
      .from('publication_engagement')
      .select('value')
      .eq('publication_id', publicationId)
      .eq('type', 'reaction');
      
    const counts: Record<string, number> = {};
    for (const eng of (engagements || [])) {
      counts[eng.value] = (counts[eng.value] || 0) + 1;
    }

    const newReactionRow = buildReactionButtons(publicationId, allowed, counts);
    
    const existingKeyboard = ctx.callbackQuery.message?.reply_markup?.inline_keyboard;
    if (existingKeyboard && existingKeyboard.length > 0) {
       const newKeyboard = [...existingKeyboard];
       newKeyboard[newKeyboard.length - 1] = newReactionRow;
       
       await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: newKeyboard } });
    }
  } catch (err) {
    console.error('Error updating markup:', err);
  }
});

// Reply-to-Comment Handler
bot.on('message', async (ctx) => {
  if (!ctx.message?.reply_to_message) return;
  if (!ctx.message.text) return;

  const repliedToMessageId = ctx.message.reply_to_message.message_id.toString();
  const chatId = ctx.chat.id.toString();
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const adminClient = createAdminClient();

  const { data: logEntry } = await adminClient
    .from('distribution_log')
    .select('publication_id, publication:publications!inner(hub_id)')
    .eq('message_id', repliedToMessageId)
    .eq('target_id', chatId)
    .eq('status', 'sent')
    .single() as any;

  if (!logEntry) return;

  const { data: config } = await adminClient
    .from('hub_engagement_config')
    .select('comments_enabled')
    .eq('hub_id', logEntry.publication.hub_id)
    .maybeSingle();

  if (config && config.comments_enabled === false) return;

  const identity = await findOrCreateMessengerIdentity(adminClient, telegramId, ctx.from?.username);

  await adminClient
    .from('publication_engagement')
    .insert({
      publication_id: logEntry.publication_id,
      hub_id: logEntry.publication.hub_id,
      consumer_id: identity.consumer_id || null,
      messenger_identity_id: identity.id,
      platform: 'telegram',
      type: 'comment',
      value: ctx.message.text.substring(0, 2000),
      metadata: {
        chat_id: chatId,
        message_id: ctx.message.message_id,
        reply_to_message_id: repliedToMessageId
      }
    } as any);

  try {
    await inngest.send({
      name: 'xentara/engagement.received',
      data: {
        publicationId: logEntry.publication_id,
        hubId: logEntry.publication.hub_id,
        type: 'comment',
        content: ctx.message.text.substring(0, 2000)
      }
    });
  } catch (e) {
    console.warn('Engagement event emission failed:', e);
  }
});
