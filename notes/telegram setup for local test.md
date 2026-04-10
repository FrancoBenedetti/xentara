Get a new ngkrok link using `ngrok http 3000` and substitue below:

```
curl -X POST "https://api.telegram.org/bot8712476847:AAEkCTN_TDT2b306LGSPw4eRzP7Sstuwzk8/setWebhook" \                                 
     -H "Content-Type: application/json" \
     -d '{                                                                              
           "url": "https://5c20-196-210-34-153.ngrok-free.app/api/v1/webhooks/telegram",
           "secret_token": "1325f1b150a909e54b834f867d668a02"
         }'
```