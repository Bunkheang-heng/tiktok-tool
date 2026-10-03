# IMPLEMENTATION PLAN — Ben10 FX Content Automation

Follow this order strictly.

Do not attempt browser automation first.

---

# Milestone 0 — Repository Bootstrap

Create:

- Electron
- React
- TypeScript
- Vite
- linting
- formatting
- tests
- base logging
- `.env.example`

Success condition:

```text
npm run dev
```

opens the desktop application.

---

# Milestone 1 — Database + Job Model

Implement SQLite and migrations.

Create:

- Job
- ScheduleSlot
- Topic
- GeneratedContent
- JobEvent
- AppSetting

Implement repositories.

Add tests.

Success condition:

- create job
- update status
- reload application
- job persists

---

# Milestone 2 — Job State Machine

Implement valid transitions.

Examples:

```text
SCHEDULED → STARTING
STARTING → TOPIC_SELECTING
TOPIC_SELECTING → SCRIPT_GENERATING
...
TELEGRAM_SENDING → DELIVERED
```

Prevent invalid transitions.

Every transition must generate `JobEvent`.

Success condition:

Unit tests confirm valid/invalid transitions.

---

# Milestone 3 — Scheduler

Implement schedule slots.

Features:

- default 3 daily slots
- editable time
- enable/disable
- day-of-week selection
- generate-now action

Implement duplicate-run protection.

Success condition:

A scheduled job is created exactly once.

---

# Milestone 4 — Telegram First

Do this before AI/video integrations.

Implement:

- bot-token configuration
- chat-ID configuration
- test message button
- job-start notification
- job-completed notification
- job-failed notification

For development, create a mock Telegram provider.

Success condition:

A mock scheduled job sends:

```text
🚀 Automation Started
```

and later:

```text
✅ Job Completed
```

---

# Milestone 5 — Mock End-to-End Pipeline

Implement fake providers.

```text
MockLLM
MockVideoGenerator
MockTTS
MockSubtitleService
MockRenderer
```

Run:

```text
schedule
→ topic
→ mock content
→ mock video
→ mock audio
→ mock subtitles
→ mock render
→ Telegram delivery
```

Success condition:

The entire product flow works without external AI services.

This is the first major checkpoint.

---

# Milestone 6 — Dashboard

Build:

- automation status
- current job
- next run
- recent history
- job progress
- retry button
- open output folder
- resend to Telegram

Do not over-design.

Prioritize clarity.

---

# Milestone 7 — Topic Engine

Seed trading topics.

Implement:

- categories
- cooldown
- last-used tracking
- enabled state
- pin-next-topic

Add UI.

Success condition:

Repeated scheduler runs do not reuse recent topics.

---

# Milestone 8 — Gemini LLM Provider

Implement Gemini behind `LlmProvider`.

Generate structured JSON.

Validate with Zod.

Implement repair retry.

Store:

- script
- prompt
- title
- description
- hashtags
- raw response

Success condition:

A real Gemini call produces valid persisted content.

---

# Milestone 9 — FFmpeg Detection

Create setup diagnostics.

Check:

- FFmpeg exists
- executable works
- version can be read
- output directory is writable

Add Settings UI.

Success condition:

The app can render a basic vertical MP4 from a fixture.

---

# Milestone 10 — TTS Adapter

Implement one real Khmer-capable TTS provider.

Keep interface generic.

Implement:

- voice setting
- speed
- output MP3/WAV
- duration reading

Success condition:

Khmer script produces usable audio.

---

# Milestone 11 — Subtitle Pipeline

Implement:

- segmentation
- timing
- SRT output
- ASS output
- Khmer-safe text rendering

Success condition:

Fixture video displays Khmer subtitles correctly.

---

# Milestone 12 — Real Render Pipeline

Implement:

```text
input video
+ Khmer narration
+ subtitles
→ final 1080x1920 MP4
```

Success condition:

Final local video is ready for TikTok manual upload.

---

# Milestone 13 — Real Telegram Video Delivery

Send final MP4.

Send metadata.

If video exceeds Telegram API/provider limitations, implement documented fallback such as document delivery or local error reporting.

Success condition:

Phone receives:

- final MP4
- title
- description
- hashtags

---

# Milestone 14 — Video Generator Interface

Finish generic provider interface.

Implement mock first.

Then implement the selected real provider.

If no suitable API exists, implement Playwright.

---

# Milestone 15 — Playwright Browser Worker

Use a dedicated browser worker.

Implement:

- persistent browser profile
- login-state detection
- navigation
- prompt entry
- generation start
- completion detection
- download
- failure screenshot
- timeout
- retry

Do not expose provider selectors outside this module.

Success condition:

A generated source video lands inside the job directory.

---

# Milestone 16 — Error Recovery

Implement:

- 3 retries default
- exponential backoff
- retryability classification
- interrupted-job recovery
- Telegram retry notifications

Success condition:

Kill the app during a mock job, restart it, and verify recovery behavior.

---

# Milestone 17 — Tray + Windows Startup

Implement:

- minimize to tray
- status
- generate now
- pause/resume
- quit
- start with Windows

Success condition:

Closing the main window can leave scheduler running.

---

# Milestone 18 — Installer

Create Windows package.

Test on a clean Windows machine or VM.

Verify:

- database initialization
- user-data path
- secrets
- FFmpeg strategy
- Playwright browser strategy
- autostart
- Telegram

---

# Milestone 19 — Production Hardening

Add:

- disk-space checks
- internet checks
- provider health tests
- log export
- redact secrets
- clear temp files
- stale-worker detection
- cancellation
- improved progress

---

# Final Definition of Done

The application is considered V1 complete when the following happens without manual desktop interaction:

```text
Scheduled slot occurs
→ Telegram immediately says automation started
→ a trading topic is selected
→ Khmer script is generated
→ source video is generated
→ Khmer narration is generated
→ Khmer subtitles are generated
→ final vertical MP4 is rendered
→ Khmer title/description/hashtags are prepared
→ Telegram receives the final video and metadata
```

The owner then manually uploads that video to TikTok.
