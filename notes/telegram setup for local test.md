## Local Development (ngrok)

Get a new ngrok link using `ngrok http 3000` and substitute the URL below:

```bash
curl -X POST "https://api.telegram.org/bot8712476847:AAEkCTN_TDT2b306LGSPw4eRzP7Sstuwzk8/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
           "url": "https://<ngrok-id>.ngrok-free.app/api/v1/webhooks/telegram",
           "secret_token": "1325f1b150a909e54b834f867d668a02"
         }'
```

---

## Production (xentara-studio.growthhq.biz)

Run once DNS has propagated and the Vercel deployment is live:

```bash
curl -X POST "https://api.telegram.org/bot8712476847:AAEkCTN_TDT2b306LGSPw4eRzP7Sstuwzk8/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
           "url": "https://xentara-studio.growthhq.biz/api/v1/webhooks/telegram",
           "secret_token": "1325f1b150a909e54b834f867d668a02"
         }'
```

### Verify current webhook

```bash
curl "https://api.telegram.org/bot8712476847:AAEkCTN_TDT2b306LGSPw4eRzP7Sstuwzk8/getWebhookInfo"
```

Expected production response: `"url": "https://xentara-studio.growthhq.biz/api/v1/webhooks/telegram"`