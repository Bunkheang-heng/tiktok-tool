# Ben10 FX Content Automation 🚀

A production-quality Windows desktop application built with Electron, React, TypeScript, and SQLite that automatically prepares short Khmer-language trading education videos on a schedule and delivers the finished content package directly to your Telegram account.

---

## 🌟 Key Features

- **Automated Daily Scheduling**: 3 configurable daily slots (Morning, Afternoon, Evening) with custom time, day selection, and duplicate-run protection.
- **Trading Education Topic Engine**: Seeded with 40+ curated trading topics across 5 categories (Beginner, Technical Analysis, Risk Management, Psychology, Macro) with cooldown rotation and "Pin Next" support.
- **Khmer AI Content Generation**: Google Gemini 2.0 Flash integration behind a structured schema generating spoken Khmer scripts, English visual prompts, catchy TikTok titles, descriptions, and hashtags.
- **Local Spoken Khmer TTS**: Converts Khmer scripts into clear, natural narration audio.
- **Automated Khmer Subtitles**: Generates synchronized SRT and ASS subtitle files with Unicode styling.
- **FFmpeg 1080×1920 9:16 Video Rendering**: Replaces video audio with Khmer narration, burns in subtitles, and encodes high-quality MP4 videos ready for TikTok upload.
- **Telegram Delivery**: Immediate notifications when jobs start, progress updates, and automatic delivery of the final MP4 video with full metadata captions.
- **Zero-Credit Mock Mode**: Complete offline simulation pipeline (`APP_MODE=mock`) allowing full testing without incurring API fees.
- **Windows System Tray & Startup**: Runs in background, minimizes to tray, and optional Windows autostart.
- **Strict Privacy & Safety**: Manual TikTok posting—no TikTok login credentials required, keeping your TikTok account 100% safe from automated bot flags.

---

## 🏗 Architecture

```
Scheduled Trigger
   │
   ▼
Telegram: "Automation Started"
   │
   ▼
Topic Selection (Smart Cooldown)
   │
   ▼
Gemini: Khmer Script & Visual Prompt
   │
   ▼
Video Generation (Browser / API / Mock)
   │
   ▼
Khmer Voice TTS (Narration Audio)
   │
   ▼
Timed Khmer Subtitles (ASS / SRT)
   │
   ▼
FFmpeg Rendering (1080x1920 MP4)
   │
   ▼
Telegram: Final Video + Title + Description + Hashtags Delivered!
   │
   ▼
Manual 1-Click Upload to TikTok by Owner
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ (Node 24 supported)
- **FFmpeg**: Installed and in system PATH

### 2. Installation
```bash
git clone <repo-url>
cd Tiktok_Tool
npm install
```

### 3. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Or configure your API keys and Telegram Bot credentials directly inside the application's **Settings** screen!

### 4. Running Development
```bash
npm run dev
```

### 5. Running Tests
```bash
npm test
```

### 6. Building Production Bundle
```bash
npm run build
```

---

## 📚 Documentation

- [Architecture Guide](ARCHITECTURE.md)
- [Setup & Installation](SETUP.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Telegram Bot Setup Guide](docs/TELEGRAM_SETUP.md)
- [Gemini API Setup Guide](docs/GEMINI_SETUP.md)
- [Video Provider Configuration](docs/VIDEO_PROVIDER.md)
- [Khmer TTS Voice Configuration](docs/TTS_PROVIDER.md)
- [Windows Build & Packaging](docs/WINDOWS_BUILD.md)

---

## ⚖️ License
MIT License. Built for Ben10 FX Trading Community.
