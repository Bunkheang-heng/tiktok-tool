# Telegram Bot Setup Guide

Follow these steps to create your private Telegram bot for video delivery and notifications.

---

## Step 1: Create a Bot via @BotFather

1. Open Telegram and search for [@BotFather](https://t.me/botfather).
2. Start the chat and send the command:
   ```text
   /newbot
   ```
3. Enter a display name for your bot:
   ```text
   Ben10 FX Video Delivery
   ```
4. Enter a username ending in `bot` (e.g. `ben10_fx_video_bot`).
5. Copy the generated **HTTP API token** (e.g., `7123456789:AAH...`).

---

## Step 2: Get Your Personal Chat ID

1. Open Telegram and search for [@userinfobot](https://t.me/userinfobot) or [@IDBot](https://t.me/myidbot).
2. Click `/start`. The bot will reply with your numeric `Id` (e.g., `987654321`).
3. Copy this numeric ID.

---

## Step 3: Activate Your Bot

1. Search for your new bot in Telegram and click **Start** or send any message to it.
2. *(Important: A Telegram bot cannot send you messages until you have opened the chat first!)*

---

## Step 4: Configure in Ben10 FX Application

1. Open **Ben10 FX Content Automation**.
2. Navigate to **Settings > Telegram Bot Delivery**.
3. Paste your **Bot Token** and **Chat ID**.
4. Click **Test Connection**.
5. You should immediately receive a test notification on Telegram!
