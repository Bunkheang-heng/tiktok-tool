# MASTER BUILD PROMPT — Ben10 FX Content Automation

You are a senior full-stack desktop application engineer and automation architect.

Your task is to build a production-quality Windows desktop application named **Ben10 FX Content Automation**.

The application automatically prepares short Khmer-language trading education videos on a schedule and delivers the final content package to the owner's Telegram account.

## 1. Core Goal

Build a Windows Electron application that:

1. Runs locally on a Windows laptop.
2. Starts automatically with Windows if enabled.
3. Runs scheduled content-generation jobs **3 times per day by default**, with the times editable by the user.
4. Sends a Telegram notification immediately when each scheduled job starts.
5. Automatically selects a trading education topic while avoiding recent duplicates.
6. Uses an LLM to generate:
   - Khmer video script
   - video-generation prompt
   - TikTok title
   - TikTok description
   - hashtags
7. Uses a pluggable video-generation provider.
8. Supports browser automation through Playwright for providers that do not expose a suitable API.
9. Supports a separate Khmer voice/TTS pipeline.
10. Supports Khmer subtitles.
11. Uses FFmpeg to assemble/render the final vertical video.
12. Sends the finished MP4 through Telegram together with:
   - topic
   - title
   - description
   - hashtags
13. Does **NOT** automatically post to TikTok.
14. Stores job history, topic history, failures, retry counts, and generated asset paths in SQLite.
15. Automatically retries recoverable failures.
16. Provides a clean Electron dashboard showing job states and history.
17. Can be minimized to the Windows system tray and continue running.

The owner will manually download the video from Telegram and manually upload it to TikTok.

---

## 2. Mandatory Tech Stack

Use:

- **Electron**
- **TypeScript**
- **React**
- **Vite**
- **Node.js**
- **SQLite**
- **Prisma** or a lightweight typed SQLite layer
- **Playwright** for browser automation where required
- **FFmpeg** for media processing
- **Telegram Bot API**
- A configurable LLM provider, with **Gemini API** as the default provider
- Secure local secret storage using **keytar / Windows Credential Manager** where practical
- Structured logging using **Pino** or **Winston**

Do not hardcode secrets.

Create a `.env.example`.

---

## 3. Product Philosophy

This is not a fragile macro.

Build it as a modular content automation platform with clear adapters:

- LLM adapter
- Topic engine
- Video-generation adapter
- TTS adapter
- Subtitle adapter
- Video-rendering service
- Telegram delivery adapter
- Scheduler
- Job queue
- Persistence layer

Every external provider must be replaceable without rewriting the entire application.

---

## 4. Important Product Constraint

The application must **not automate TikTok posting**.

The final step is:

```text
Generate content
→ Render final MP4
→ Send MP4 + title + description + hashtags to Telegram
→ User manually uploads to TikTok
```

Do not implement TikTok login, TikTok browser automation, or TikTok posting APIs in V1.

---

## 5. Job Lifecycle

Every scheduled content job must follow this state machine:

```text
SCHEDULED
→ STARTING
→ TOPIC_SELECTING
→ SCRIPT_GENERATING
→ SCRIPT_READY
→ VIDEO_GENERATING
→ VIDEO_READY
→ AUDIO_GENERATING
→ SUBTITLE_GENERATING
→ RENDERING
→ METADATA_GENERATING
→ TELEGRAM_SENDING
→ DELIVERED
```

Failure path:

```text
ANY STATE
→ FAILED
→ RETRYING
→ previous failed step
```

After maximum retries:

```text
FAILED_FINAL
```

Persist every transition.

---

## 6. Telegram Notifications

Telegram is both the notification channel and final-delivery channel.

### On Job Start

Immediately send:

```text
🚀 BEN10 FX AUTOMATION STARTED

Job: Morning / Afternoon / Evening
Scheduled Time: <time>
Topic: Selecting...
Status: Starting content generation
```

### After Topic Selection

Send:

```text
🧠 TOPIC SELECTED

Topic: <topic>

Generating Khmer script...
```

### When Video Generation Begins

Send:

```text
🎬 VIDEO GENERATION STARTED

Topic: <topic>

The video engine is now generating the visual content.
```

### On Retry

Send:

```text
⚠️ STEP FAILED — RETRYING

Job: <job name>
Step: <failed step>
Retry: <current>/<max>
Error: <safe short error message>
```

### Final Success

Send the MP4 file plus a message:

```text
✅ BEN10 FX VIDEO READY

Topic:
<topic>

TikTok Title:
<title>

Description:
<description>

Hashtags:
<hashtags>

Status:
Ready for manual posting.
```

### Final Failure

Send:

```text
❌ JOB FAILED

Job: <job name>
Topic: <topic if available>
Failed Step: <step>
Retries: <count>

Please check the desktop application logs.
```

Notification verbosity should be configurable:

- Minimal
- Normal
- Detailed

Default: **Normal**

---

## 7. Default Schedule

Ship with 3 configurable daily slots.

Do not permanently hardcode the exact times in business logic.

Example defaults may be:

- Morning
- Afternoon
- Evening

The user must be able to modify or disable each slot from Settings.

The scheduler must survive app restarts.

On startup:

1. Load schedule.
2. Inspect pending jobs.
3. Detect interrupted jobs.
4. Mark stale running jobs as interrupted.
5. Offer automatic safe retry/resume.
6. Calculate the next scheduled runs.

---

## 8. Trading Topic Engine

Seed the application with topic categories.

### Beginner

- What is trading?
- What is forex?
- What is gold trading?
- What is a broker?
- Buy vs Sell
- What is leverage?
- What is lot size?
- What is spread?
- What is stop loss?
- What is take profit?

### Technical Analysis

- Support and resistance
- Trend
- Market structure
- BOS
- CHOCH
- Liquidity
- Order blocks
- Fair value gaps
- Moving averages
- RSI
- Bollinger Bands

### Risk Management

- Position sizing
- Risk per trade
- Overleveraging
- Revenge trading
- Drawdown
- Risk-to-reward
- Daily loss limits
- Why stop losses matter

### Psychology

- FOMO
- Fear
- Greed
- Discipline
- Patience
- Overtrading
- Trading plan
- Journaling

### Macro

- Inflation
- CPI
- NFP
- Interest rates
- Federal Reserve
- USD strength
- Gold and yields
- Economic calendar

Rules:

- Do not use the same topic again within a configurable cooldown period.
- Store `last_used_at`.
- Store category.
- Store number of times used.
- Support manually creating/customizing topics.
- Support disabling topics.
- Support pinning a topic for the next job.

---

## 9. LLM Content Generation

Use Gemini as the default LLM provider, behind an interface.

The LLM must generate structured JSON.

Expected response:

```json
{
  "topic": "What is leverage?",
  "topicKhmer": "...",
  "hook": "...",
  "scriptKhmer": "...",
  "videoPrompt": "...",
  "titleKhmer": "...",
  "descriptionKhmer": "...",
  "hashtags": [
    "#TradingKhmer",
    "#ForexKhmer",
    "#Ben10FX"
  ]
}
```

Validate the response with a schema such as Zod.

If parsing fails:

1. Attempt a repair prompt.
2. Retry.
3. Record failure.

### Content Rules

The content should:

- Be educational.
- Be understandable by Khmer-speaking beginners.
- Prefer Khmer wording where natural.
- Avoid unnecessary English jargon.
- Explain unavoidable trading terms clearly.
- Avoid profit guarantees.
- Avoid "get rich quick" framing.
- Avoid deceptive claims.
- Include risk-awareness naturally where relevant.
- Target approximately 45–75 seconds unless changed in settings.
- Use a strong but non-hype hook.

---

## 10. Video Generation Architecture

Create a provider interface:

```ts
interface VideoGenerator {
  generate(input: VideoGenerationInput): Promise<GeneratedVideo>;
}
```

The rest of the application must not depend on a specific video website.

Create at least these implementations/stubs:

```text
VideoGenerator
├── MockVideoGenerator
├── BrowserVideoGenerator
└── ApiVideoGenerator
```

### Browser Video Generator

Use Playwright in a dedicated worker/process.

Responsibilities:

- Maintain a persistent browser profile.
- Detect whether login is required.
- Navigate to the selected video tool.
- Submit the generated prompt.
- Start generation.
- Poll/wait safely.
- Detect completion.
- Download the result.
- Detect common failures.
- Save screenshots on error.
- Record useful diagnostics.

Do not put website selectors throughout the codebase.

Keep them in one provider-specific module.

Make browser automation optional and replaceable.

---

## 11. Khmer Audio/TTS

Create:

```ts
interface TTSProvider {
  synthesize(input: TTSInput): Promise<AudioResult>;
}
```

The user must be able to configure:

- TTS provider
- voice
- speaking speed
- pitch if supported
- volume

Do not tie the application permanently to one TTS vendor.

If a generated video already contains narration, support:

- mute original audio
- reduce original audio
- preserve background audio
- replace narration with Khmer TTS

---

## 12. Khmer Subtitles

Generate subtitle timing from:

1. TTS timestamps if available, or
2. speech alignment/transcription, or
3. deterministic sentence timing as a fallback

Support:

- SRT
- ASS

For burned-in subtitles, ASS is preferred.

Allow settings for:

- font size
- vertical position
- max words per line
- maximum line width
- subtitle background/outline
- safe margins

The renderer must correctly support Unicode Khmer text.

---

## 13. FFmpeg Rendering

Final video target:

```text
1080 × 1920
9:16
H.264 MP4
AAC audio
```

Build a reusable FFmpeg service.

It should support:

- resize/crop
- narration replacement
- background audio mixing
- volume normalization
- burned-in Khmer subtitles
- intro/outro overlays later
- watermark/logo later
- thumbnail frame extraction

Do not execute raw user input directly inside shell commands.

Validate every path and parameter.

---

## 14. Telegram Delivery

Create:

```ts
interface TelegramService {
  sendMessage(...)
  sendVideo(...)
  sendDocument(...)
  notify(...)
}
```

Settings:

- bot token
- allowed chat ID
- notification verbosity

The bot must only respond/send to the configured authorized user/chat in V1.

Potential V2 commands may include:

```text
/status
/generate
/topic <text>
/retry
/today
```

Do not make command control mandatory for V1.

---

## 15. Local Storage

Use this conceptual structure:

```text
storage/
├── jobs/
│   └── <job-id>/
│       ├── source-video.mp4
│       ├── narration.mp3
│       ├── subtitles.ass
│       ├── final.mp4
│       ├── thumbnail.jpg
│       ├── script.txt
│       ├── title.txt
│       ├── description.txt
│       └── metadata.json
├── logs/
└── temp/
```

Add a retention setting such as:

- keep forever
- 30 days
- 90 days
- delete temporary assets after delivery

Never delete final content without the user's configured policy.

---

## 16. Database Models

At minimum implement:

### Job

- id
- scheduleSlotId
- topicId
- status
- currentStep
- retryCount
- maxRetries
- scheduledAt
- startedAt
- completedAt
- failedAt
- lastError
- outputDirectory
- finalVideoPath
- createdAt
- updatedAt

### Topic

- id
- title
- khmerTitle
- category
- enabled
- useCount
- lastUsedAt
- cooldownDays
- createdAt
- updatedAt

### ScheduleSlot

- id
- name
- enabled
- localTime
- daysOfWeek
- createdAt
- updatedAt

### GeneratedContent

- id
- jobId
- hook
- scriptKhmer
- videoPrompt
- titleKhmer
- descriptionKhmer
- hashtagsJson
- rawLlmResponse
- createdAt

### JobEvent

- id
- jobId
- level
- type
- message
- metadataJson
- createdAt

### AppSetting

- key
- value
- updatedAt

---

## 17. Electron UI

Create these screens:

### Dashboard

Show:

- system state
- scheduler state
- current job
- current step
- next scheduled run
- last completed job
- failed job count
- recent activity

### Queue

Show:

- pending jobs
- running jobs
- completed jobs
- failed jobs

Actions:

- retry
- cancel if safe
- open output folder
- send again to Telegram

### Schedule

- enable/disable slot
- edit time
- choose days
- add/remove slot

### Topics

- list topics
- category
- enable/disable
- add
- edit
- delete
- pin next topic

### History

- date
- topic
- status
- title
- output
- Telegram delivery status

### Settings

Sections:

- General
- Startup
- LLM
- Video Generator
- TTS
- Subtitles
- Telegram
- FFmpeg
- Storage
- Notifications
- Advanced

### Logs

Show structured logs in a readable UI.

Provide a button to open the log directory.

---

## 18. System Tray

When minimized:

- application continues running
- tray icon remains visible

Tray menu:

```text
Ben10 FX Automation

Status: Running
Next Job: <time>

Open Dashboard
Generate Now
Pause Automation
Resume Automation
Quit
```

Closing the window should optionally minimize to tray instead of quitting.

---

## 19. Windows Startup

Add a setting:

```text
Start Ben10 FX Automation when Windows starts
```

It should be disabled/enabled by the user.

Do not require Administrator access unless unavoidable.

---

## 20. Reliability Requirements

Implement:

- mutex to prevent duplicate execution of the same scheduled job
- process restart recovery
- atomic job state changes
- bounded retries
- exponential retry delay
- timeout for every external operation
- browser timeout handling
- Telegram timeout handling
- FFmpeg timeout handling
- disk-space check
- internet connectivity check
- structured logs
- error screenshots for Playwright
- safe cancellation where possible

Never allow two workers to render the same job simultaneously.

---

## 21. Security Requirements

- Never log API keys or Telegram bot tokens.
- Never commit `.env`.
- Store secrets using secure OS-backed storage when possible.
- Restrict Telegram control to configured chat ID.
- Validate filenames and paths.
- Sanitize any text used in FFmpeg commands.
- Do not use `shell: true` unless absolutely necessary.
- Validate all external API responses.
- Use least-privilege architecture.

---

## 22. Development Mode

Provide a full mock mode.

```text
APP_MODE=mock
```

In mock mode:

- LLM returns fixture content.
- Video generator creates/uses a sample video.
- TTS may use a fixture audio file.
- Telegram can log instead of sending.
- FFmpeg pipeline still runs if installed.

This must allow the UI and job pipeline to be tested without spending API credits.

---

## 23. Developer Experience

Provide scripts such as:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run package:win
```

Create:

- `.env.example`
- setup documentation
- Windows installation notes
- FFmpeg installation notes
- Telegram bot setup guide
- Gemini API setup guide
- troubleshooting section

---

## 24. Testing

Write tests for at least:

- scheduler calculations
- duplicate-topic prevention
- state-machine transitions
- retry logic
- LLM JSON validation
- database repositories
- Telegram message formatting
- path handling
- failed job recovery

Mock external providers.

---

## 25. Build Order

Do not attempt every integration at once.

Implement in this order:

### Phase 1
Electron shell + React UI + SQLite + logging.

### Phase 2
Scheduler + job state machine + topic engine.

### Phase 3
Telegram notifications.

At this point prove:

```text
Schedule triggers
→ Telegram receives "job started"
→ mocked job completes
→ Telegram receives completion
```

### Phase 4
Gemini structured-content generation.

### Phase 5
FFmpeg + mock/source video + subtitles + narration pipeline.

### Phase 6
Real TTS provider.

### Phase 7
Real video-generation provider / Playwright adapter.

### Phase 8
Crash recovery, Windows autostart, system tray, retries.

### Phase 9
Packaging and installer.

Do not move to the next phase before the previous phase can be demonstrated.

---

## 26. Final Deliverables

The completed repository must include:

```text
README.md
ARCHITECTURE.md
SETUP.md
TROUBLESHOOTING.md
.env.example
package.json
src/
tests/
prisma/ or database/
assets/
scripts/
```

Also create:

```text
docs/
├── TELEGRAM_SETUP.md
├── GEMINI_SETUP.md
├── VIDEO_PROVIDER.md
├── TTS_PROVIDER.md
└── WINDOWS_BUILD.md
```

---

## 27. Coding Rules

- TypeScript strict mode.
- No `any` unless justified.
- Prefer small modules.
- Avoid god classes.
- Use dependency injection or service interfaces for providers.
- Separate renderer and main-process responsibilities.
- Never expose Node APIs directly to the renderer.
- Use Electron preload + contextBridge.
- Validate IPC payloads.
- Keep Playwright outside the UI thread.
- Keep FFmpeg outside the UI thread.
- Never freeze the Electron renderer.
- Every long-running operation must expose progress/status.

---

## 28. UX Requirement

The owner should be able to install the app, configure credentials, select the schedule, and then leave it running.

The normal daily experience should be:

```text
Telegram:
🚀 Automation started

Later...

Telegram:
✅ Video ready
📹 final.mp4
📝 title
📝 description
#️⃣ hashtags

Owner manually posts to TikTok.
```

The desktop app exists primarily for setup, monitoring, history, retries, and debugging.

---

## 29. Start Now

Begin by:

1. Creating the repository structure.
2. Writing `ARCHITECTURE.md`.
3. Defining TypeScript interfaces for all provider adapters.
4. Defining the database schema.
5. Implementing the job state machine.
6. Implementing a mock end-to-end job.
7. Implementing Telegram start/completion notifications.
8. Building the basic dashboard.

Do not start with browser automation.

The first milestone is:

> A scheduled mock job runs, persists its status, sends the Telegram "started" notification, processes through the state machine, creates a mock final artifact, and sends a completion notification.

After that milestone works, progressively replace mocks with real providers.
