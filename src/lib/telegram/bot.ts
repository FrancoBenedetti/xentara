import { Bot, InlineKeyboard } from 'grammy';
import { createAdminClient } from '@/utils/supabase/admin';
import { escapeHTML } from './formatter';

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
        "1. Create an account at <a href=\"https://xentara-consumer-pwa.vercel.app/\">Xentara Browser</a>\n" +
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
    keyboard.url("🔑 Register on PWA", "https://xentara-consumer-pwa.vercel.app/").row();
    keyboard.text("❓ How it works", "how_it_works");
  } else {
    keyboard.text("📋 My Hubs", "my_subscriptions").row();
    keyboard.url("🌐 Visit Xentara Browser", "https://xentara-consumer-pwa.vercel.app/");
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
    "1️⃣ <b>Create Profile:</b> Visit the <a href=\"https://xentara-consumer-pwa.vercel.app/\">Xentara Browser</a> and sign up.\n" +
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
    const keyboard = new InlineKeyboard().url("🌐 Browse Hubs", "https://xentara-consumer-pwa.vercel.app/");
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
    "1. Register at <a href=\"https://xentara-consumer-pwa.vercel.app/\">Xentara Browser</a>\n" +
    "2. Visit your Profile and generate a 6-digit Link Code\n" +
    "3. Use /link <code>&lt;your-code&gt;</code> here\n\n" +
    "<b>Commands:</b>\n" +
    "/link — Link your profile\n" +
    "/subscribe — Follow a hub (e.g. <code>/subscribe technology</code>)\n" +
    "/myhubs — List your active feeds\n" +
    "/chatid — Technical chat info";

  const keyboard = new InlineKeyboard();
  if (!isLinked) {
    keyboard.url("🔑 Register on PWA", "https://xentara-consumer-pwa.vercel.app/").row();
    keyboard.text("❓ How it works", "how_it_works");
  } else {
    keyboard.text("📋 My Hubs", "my_subscriptions").row();
    keyboard.url("🌐 Visit PWA", "https://xentara-consumer-pwa.vercel.app/");
  }

  await ctx.reply(helpText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard,
    link_preview_options: { is_disabled: true }
  });
});

// Error handler
bot.catch((err) => {
  console.error(`Error while handling update ${err.ctx.update.update_id}:`);
  console.error(err.error);
});
