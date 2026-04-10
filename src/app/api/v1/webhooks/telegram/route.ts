import { webhookCallback } from 'grammy';
import { bot } from '@/lib/telegram/bot';

const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

let isBotInitialized = false;

export async function POST(request: Request) {
  try {
    const incomingSecret = request.headers.get('x-telegram-bot-api-secret-token');

    // Verify secret if it is configured
    if (secretToken && incomingSecret !== secretToken) {
      console.warn('[Telegram Webhook] Unauthorized request. Secret mismatch.');
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    console.log('[Telegram Webhook] Parsing update ID:', body.update_id);

    // Initialize bot explicitly once per cold-start
    if (!isBotInitialized) {
      await bot.init();
      isBotInitialized = true;
    }

    // Process the update with the grammY bot instance
    await bot.handleUpdate(body);
    
    // Must return 200 OK so Telegram stops retrying
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[Telegram Webhook] Internal server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
