# Adding a Telegram Distribution Channel

You can automatically distribute your Hub's curated content to a Telegram channel. Follow these steps to configure your channel and link it to Xentara.

---

## 1. Create a Telegram Channel
If you don't already have one, open Telegram and create a new channel. You can set it to either **Public** or **Private** based on your needs.

## 2. Add the Xentara Bot as Admin
To allow Xentara to post messages on your behalf, you need to add our bot to your channel as an administrator.
- Open your channel settings.
- Go to **Administrators** > **Add Admin**.
- Search for the Xentara bot username (check your specific hub settings for the exact bot name, usually it is your designated bot).
- Grant the bot permission to **Post Messages**.

## 3. Obtain the Channel ID
Xentara needs your Channel ID to know exactly where to send the content.
- For **Public Channels**: The Channel ID is simply the username with an `@` symbol (e.g., `@my_channel_name`).
- For **Private Channels**:
  - You can use a bot like `@JsonDumpBot`, `@RawDataBot`, or `@userinfobot`. Forward a message from your private channel to one of these bots to reveal the raw message data.
  - Look for the `chat.id` field in the response (it usually starts with `-100`, e.g., `-1001234567890`).

## 4. Link the Channel in Xentara
Once you have the Channel ID:
- Navigate to your Hub Settings at `/dashboard/[slug]/settings`.
- Locate the **Add Channel** dialogue in the Distribution Channels section.
- Select Telegram and paste your Channel ID into the required field.
- Save your settings to activate the distribution pipeline.
