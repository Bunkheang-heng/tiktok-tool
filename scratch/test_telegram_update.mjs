import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN || '8884039162:AAEXDW30sIAUzD3d40ziClGPxM0vhHb_3lE';
const chatId = process.env.TELEGRAM_CHAT_ID || '1099911298';

async function send() {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '⚙️ *BEN10 FX SYSTEM UPDATE*\n\n✅ *Failure & Retry Alerts*: Sent to Telegram\n✅ *Cancellation Alerts*: Sent to Telegram\n✅ *Retry State Machine*: Fixed (Supports retrying failed jobs without transition errors)',
      parse_mode: 'Markdown'
    })
  });
  const data = await res.json();
  console.log('Telegram API result:', data.ok ? 'SUCCESS' : data.description);
}

send();
