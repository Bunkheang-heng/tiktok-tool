# TECHNICAL ARCHITECTURE — Ben10 FX Content Automation

## High-Level Architecture

```text
┌──────────────────────────────────┐
│          Electron App            │
│                                  │
│ React UI                         │
│ Settings                         │
│ Queue                            │
│ History                          │
│ Logs                             │
└───────────────┬──────────────────┘
                │ IPC via preload
┌───────────────▼──────────────────┐
│       Electron Main Process      │
│                                  │
│ Scheduler                        │
│ Job Orchestrator                 │
│ State Machine                    │
│ Provider Registry                │
│ Persistence                      │
└───────────────┬──────────────────┘
                │
        ┌───────┼────────┬────────────┐
        │       │        │            │
        ▼       ▼        ▼            ▼
      LLM     Video     TTS        Telegram
        │       │        │            │
        └───────┼────────┘            │
                ▼                     │
              FFmpeg                  │
                │                     │
                ▼                     │
            Final MP4 ────────────────┘
```

---

## Processes

### Renderer Process

Responsibilities:

- presentation only
- user input
- dashboards
- settings forms
- progress display

The renderer must not receive unrestricted Node.js access.

Use:

```text
preload.ts
contextBridge
validated IPC
```

### Main Process

Responsibilities:

- schedule management
- database access
- orchestration
- worker control
- tray
- startup behavior
- secure settings

### Worker Processes

Use workers/child processes for:

- Playwright video automation
- FFmpeg rendering
- heavy media operations

Do not block the UI.

---

## Suggested Source Layout

```text
src/
├── main/
│   ├── main.ts
│   ├── preload.ts
│   ├── ipc/
│   ├── tray/
│   ├── startup/
│   ├── scheduler/
│   └── orchestration/
│
├── renderer/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── state/
│
├── core/
│   ├── jobs/
│   ├── topics/
│   ├── scheduling/
│   ├── events/
│   └── types/
│
├── providers/
│   ├── llm/
│   ├── video/
│   ├── tts/
│   └── telegram/
│
├── media/
│   ├── ffmpeg/
│   ├── subtitles/
│   └── audio/
│
├── database/
│   ├── client/
│   ├── repositories/
│   └── migrations/
│
└── workers/
    ├── video-worker/
    └── render-worker/
```

---

## Core Interfaces

### LLM Provider

```ts
export interface LlmProvider {
  generateContent(input: ContentGenerationInput): Promise<GeneratedContent>;
}
```

### Video Provider

```ts
export interface VideoGenerator {
  readonly id: string;
  validateConfiguration(): Promise<ProviderHealth>;
  generate(input: VideoGenerationInput): Promise<GeneratedVideo>;
}
```

### TTS Provider

```ts
export interface TtsProvider {
  readonly id: string;
  synthesize(input: TtsInput): Promise<TtsResult>;
}
```

### Telegram

```ts
export interface TelegramService {
  sendMessage(input: TelegramMessageInput): Promise<void>;
  sendVideo(input: TelegramVideoInput): Promise<void>;
}
```

### Renderer

```ts
export interface VideoRenderer {
  render(input: RenderInput): Promise<RenderResult>;
}
```

---

## Orchestration

The orchestrator should be the only component that understands the complete pipeline.

Pseudo-code:

```ts
async function executeJob(jobId: string) {
  await transition(jobId, "STARTING");
  await telegram.notifyStart(jobId);

  const topic = await topicService.select(jobId);

  await transition(jobId, "SCRIPT_GENERATING");
  const content = await llm.generateContent({ topic });

  await transition(jobId, "VIDEO_GENERATING");
  const video = await videoGenerator.generate({
    prompt: content.videoPrompt
  });

  await transition(jobId, "AUDIO_GENERATING");
  const narration = await tts.synthesize({
    text: content.scriptKhmer
  });

  await transition(jobId, "SUBTITLE_GENERATING");
  const subtitles = await subtitleService.create({
    text: content.scriptKhmer,
    narration
  });

  await transition(jobId, "RENDERING");
  const finalVideo = await renderer.render({
    video,
    narration,
    subtitles
  });

  await transition(jobId, "METADATA_GENERATING");
  const metadata = await metadataService.finalize(content);

  await transition(jobId, "TELEGRAM_SENDING");
  await telegram.sendVideo({
    file: finalVideo.path,
    metadata
  });

  await transition(jobId, "DELIVERED");
}
```

Wrap each step with:

- timeout
- logging
- retry classification
- persistence
- notification rules

---

## Events

Use an internal event bus for job progress.

Example events:

```text
JOB_CREATED
JOB_STARTED
TOPIC_SELECTED
CONTENT_GENERATED
VIDEO_GENERATION_STARTED
VIDEO_GENERATED
TTS_STARTED
TTS_COMPLETED
SUBTITLES_COMPLETED
RENDER_STARTED
RENDER_COMPLETED
TELEGRAM_SEND_STARTED
TELEGRAM_SEND_COMPLETED
JOB_RETRYING
JOB_FAILED
JOB_COMPLETED
```

Consumers:

- database event logger
- UI state updates
- Telegram notifier
- file logger

This avoids tightly coupling Telegram to pipeline logic.

---

## Retry Strategy

Errors should be classified:

```text
Retryable
├── temporary network error
├── provider timeout
├── Telegram timeout
├── temporary browser failure
└── provider busy

Non-retryable
├── missing API key
├── unauthorized
├── invalid configuration
├── FFmpeg not found
└── invalid generated input after repair attempts
```

Recommended defaults:

```text
max retries: 3
base delay: 10 seconds
backoff: exponential
```

---

## Scheduler

Do not use bare `setInterval` as the scheduling source of truth.

Persist schedules in SQLite.

At runtime:

```text
ScheduleSlot
→ next run calculation
→ create Job
→ acquire execution lock
→ run orchestrator
```

The database is the source of truth.

---

## Duplicate Protection

Use one or more of:

- unique scheduled job key
- database transaction
- in-memory mutex
- lock table

Example unique key:

```text
<schedule-slot-id>:<scheduled-date-time>
```

---

## Crash Recovery

On app boot:

1. find jobs with active states
2. determine whether corresponding worker still exists
3. mark abandoned execution as `INTERRUPTED`
4. inspect latest completed step
5. resume only if safe
6. otherwise restart from the nearest safe checkpoint

Store the output artifact for each successful step.

---

## Video Provider Strategy

Keep browser automation isolated:

```text
providers/video/browser/
├── BrowserVideoGenerator.ts
├── browserProfile.ts
├── selectors.ts
├── downloader.ts
├── diagnostics.ts
└── providerConfig.ts
```

Selectors must not leak into orchestrator code.

Use a persistent Chromium profile so login sessions can survive restarts where appropriate.

---

## Media Pipeline

```text
source video
     │
     ├── scale/crop
     │
     ├── mute/lower original narration
     │
     ├── add Khmer narration
     │
     ├── add/mix music if configured
     │
     ├── burn Khmer ASS subtitles
     │
     └── encode final MP4
```

Output:

```text
1080x1920
30fps where appropriate
H.264
AAC
yuv420p
```

---

## Telegram Strategy

Use Telegram as:

1. process notification channel
2. final content-delivery channel

Do not require Telegram commands in V1.

Telegram delivery must not delete local assets.

If Telegram send fails, preserve the completed video and allow resend.

---

## Secret Storage

Keep non-secret config in SQLite.

Keep secrets in OS-backed storage where possible:

```text
Gemini API key
Telegram bot token
Provider access tokens
```

Do not serialize secrets into job metadata.

---

## Logging

Use structured logs.

Fields:

```json
{
  "timestamp": "...",
  "level": "info",
  "jobId": "...",
  "step": "RENDERING",
  "event": "render_started",
  "message": "..."
}
```

Redact secret-shaped values.

---

## Packaging

Target Windows first.

Produce an installer using Electron Builder or equivalent.

The app should run without a developer shell after installation.

Bundle or reliably locate FFmpeg according to licensing/distribution requirements.

Document the chosen approach.
