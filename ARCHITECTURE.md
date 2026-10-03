# ARCHITECTURE — Ben10 FX Content Automation

## 1. System Overview

**Ben10 FX Content Automation** is an Electron desktop application running locally on Windows. It automates the preparation of daily Khmer-language trading education videos and sends the final content package (video + title + description + hashtags) directly to Telegram for manual posting to TikTok.

```
┌────────────────────────────────────────────────────────┐
│                   React UI (Renderer)                  │
│   Dashboard | Queue | Schedule | Topics | Settings     │
└───────────────────────────┬────────────────────────────┘
                            │ Safe IPC (contextBridge)
┌───────────────────────────▼────────────────────────────┐
│                  Electron Main Process                 │
│                                                        │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────┐  │
│  │   Scheduler   │  │  Orchestrator  │  │   Mutex   │  │
│  └───────┬───────┘  └────────┬───────┘  └─────┬─────┘  │
│          │                   │                │        │
│          ▼                   ▼                ▼        │
│  ┌──────────────────────────────────────────────────┐  │
│  │       SQLite Database & Event Subsystem          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────┬──────────────┬───────────┘
              │               │              │
              ▼               ▼              ▼
     ┌─────────────────┐ ┌─────────┐ ┌───────────────┐
     │  Providers      │ │ Workers │ │ Media Pipeline│
     │  - Gemini LLM   │ │ - Browser│ │ - FFmpeg     │
     │  - Khmer TTS    │ │ - Render │ │ - Subtitles  │
     │  - Telegram     │ └─────────┘ └───────────────┘
     └─────────────────┘
```

---

## 2. Process Separation & Security

1. **Renderer Process (UI):**
   - React 18 with modern Dark Theme styling.
   - Strictly isolated from Node.js APIs (`nodeIntegration: false`, `contextIsolation: true`).
   - All communication is routed through a typed IPC interface exposed in `preload.ts`.

2. **Main Process (Backend):**
   - Runs SQLite database operations, scheduling logic, state machine, and provider management.
   - Validates all incoming IPC payloads using typed schemas.
   - Manages Windows Tray and autostart capabilities.

3. **External Workers / Subprocesses:**
   - Media rendering (FFmpeg) and browser automation (Playwright) run outside the UI thread to guarantee zero UI stuttering or freezes.

---

## 3. Core Database Models

SQLite is used for local persistence with the following schema:

- **`jobs`**: Tracks each execution (id, scheduleSlotId, topicId, status, currentStep, retryCount, maxRetries, timings, paths, lastError).
- **`topics`**: Trading education topics with categories, cooldown days, usage counts, and last used timestamps.
- **`schedule_slots`**: Configurable daily execution times (Morning, Afternoon, Evening, etc.) and active days.
- **`generated_contents`**: LLM-generated Khmer script, video prompt, title, description, and hashtags.
- **`job_events`**: Audit log of all state transitions and operational messages.
- **`app_settings`**: Key-value settings store for configuration and secrets.

---

## 4. Job State Machine & Lifecycle

```
SCHEDULED
   │
   ▼
STARTING ────────────► Telegram: "Automation Started"
   │
   ▼
TOPIC_SELECTING ─────► Telegram: "Topic Selected"
   │
   ▼
SCRIPT_GENERATING ───► Gemini generates structured Khmer content
   │
   ▼
SCRIPT_READY
   │
   ▼
VIDEO_GENERATING ────► Video provider / Playwright / Mock
   │
   ▼
VIDEO_READY
   │
   ▼
AUDIO_GENERATING ────► Khmer TTS produces narration audio
   │
   ▼
SUBTITLE_GENERATING ─► Timing alignment generates SRT & ASS
   │
   ▼
RENDERING ───────────► FFmpeg encodes 1080x1920 vertical MP4
   │
   ▼
METADATA_GENERATING ─► Finalize titles, description, hashtags
   │
   ▼
TELEGRAM_SENDING ────► Send MP4 + metadata package to Telegram
   │
   ▼
DELIVERED ✅
```

Failure & Retry handling:
```
ANY STEP ──(Error)──► FAILED ──(Retries left)──► RETRYING ──► Previous Step
                               └──(Retries exhausted)──► FAILED_FINAL
```

---

## 5. Pluggable Provider Interfaces

All external dependencies implement standardized TypeScript interfaces:

- **`LlmProvider`**: `generateContent(input: ContentInput): Promise<GeneratedContent>`
- **`VideoGenerator`**: `generate(input: VideoInput): Promise<GeneratedVideo>`
- **`TtsProvider`**: `synthesize(input: TtsInput): Promise<TtsResult>`
- **`SubtitleService`**: `createSubtitles(input: SubtitleInput): Promise<SubtitleResult>`
- **`VideoRenderer`**: `render(input: RenderInput): Promise<RenderResult>`
- **`TelegramService`**: `sendMessage(msg)`, `sendVideo(video)`, `notify(event)`

Each provider has a full **Mock implementation** allowing offline development and testing without incurring API fees or external dependencies.

---

## 6. Duplicate Protection & Crash Recovery

- **Scheduling Mutex**: Prevents concurrent execution of the same slot or simultaneous conflicting renders.
- **Boot Recovery**: On application launch, stale jobs in active states are flagged as `INTERRUPTED` and can be safely resumed from the last confirmed artifact checkpoint.
