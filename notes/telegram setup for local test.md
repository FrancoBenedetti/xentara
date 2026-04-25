# Telegram Bot Setup

Two separate bots are maintained — one for local development, one for production.

| Environment    | Bot Token (prefix)      | Webhook URL                           |
|:-------------- |:----------------------- |:------------------------------------- |
| **Local Dev**  | `8712476847:AAEkCTN...` | ngrok tunnel                          |
| **Production** | `8677092013:AAHVZ9X...` | `https://xentara-studio.growthhq.biz` |

---

## Local Development (ngrok)

Get a new ngrok link using `ngrok http 3000` and substitute the URL below:

```bash
curl -X POST "https://api.telegram.org/bot8712476847:AAEkCTN_TDT2b306LGSPw4eRzP7Sstuwzk8/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
           "url": "https://a475-196-210-32-145.ngrok-free.app/api/v1/webhooks/telegram",
           "secret_token": "1325f1b150a909e54b834f867d668a02"
         }'
```

### Verify local webhook

```bash
curl "https://api.telegram.org/bot8712476847:AAEkCTN_TDT2b306LGSPw4eRzP7Sstuwzk8/getWebhookInfo"
```

> ⚠️ Remember to restore the production webhook when done with local testing (see below).

---

## Production (xentara-studio.growthhq.biz)

Run once DNS has propagated and the Vercel deployment is live, or to restore after local testing:

```bash
curl -X POST "https://api.telegram.org/bot8677092013:AAHVZ9XagNDriHFX_r5oOMRHpMhUJafbIq0/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
           "url": "https://xentara-studio.growthhq.biz/api/v1/webhooks/telegram",
           "secret_token": "1325f1b150a909e54b834f867d668a02"
         }'
```

### Verify production webhook

```bash
curl "https://api.telegram.org/bot8677092013:AAHVZ9XagNDriHFX_r5oOMRHpMhUJafbIq0/getWebhookInfo"
```

Expected response: `"url": "https://xentara-studio.growthhq.biz/api/v1/webhooks/telegram"`