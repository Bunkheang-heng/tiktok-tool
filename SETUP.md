# Setup Guide — Ben10 FX Content Automation

Follow these instructions to set up and run Ben10 FX Content Automation on your Windows machine.

---

## 1. Prerequisites

### Node.js
Install Node.js version 20, 22, or 24 from [nodejs.org](https://nodejs.org).
Verify installation in PowerShell:
```powershell
node -v
npm -v
```

### FFmpeg
Ensure FFmpeg is installed and accessible in your system PATH:
```powershell
ffmpeg -version
```
If you need to install FFmpeg on Windows:
1. Download a build from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) or install via winget:
   ```powershell
   winget install Gyan.FFmpeg
   ```
2. Restart your terminal to refresh PATH.

---

## 2. Project Installation

Open PowerShell in the project directory:
```powershell
npm install
```

---

## 3. Configuration

You can either configure settings through `.env` or using the **Settings** screen inside the desktop application:

```bash
# Set mode to 'mock' for free testing, or 'production' for real runs
APP_MODE=mock

# Telegram Bot credentials (from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Google Gemini API Key (from Google AI Studio)
GEMINI_API_KEY=your_gemini_key
```

---

## 4. Running the Application

### Development Mode
```powershell
npm run dev
```
This launches Vite and opens the Electron desktop application.

### Running Unit Tests
```powershell
npm test
```
All unit tests run in sub-second time using Vitest.

### Packaging Windows Installer
```powershell
npm run package:win
```
This generates an installer in the `release/` folder.
