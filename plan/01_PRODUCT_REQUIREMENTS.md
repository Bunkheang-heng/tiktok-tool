# PRODUCT REQUIREMENTS — Ben10 FX Content Automation

## Product

**Name:** Ben10 FX Content Automation  
**Platform:** Windows desktop  
**Application Type:** Electron  
**Primary User:** Single user / owner  
**Primary Language of Generated Content:** Khmer  
**Content Niche:** Trading education

---

## Problem

The owner wants to publish multiple Khmer trading education videos every day but does not want to manually:

- brainstorm topics
- write scripts
- prepare video prompts
- generate narration
- create subtitles
- render the final video
- write TikTok titles
- write TikTok descriptions
- create hashtags

TikTok posting itself remains manual.

---

## Primary Workflow

```text
Scheduled time
→ notify owner through Telegram that automation started
→ choose trading topic
→ generate Khmer script
→ generate video
→ generate Khmer narration
→ generate Khmer subtitles
→ render vertical MP4
→ generate title/description/hashtags
→ send final package to Telegram
→ owner manually posts to TikTok
```

---

## Functional Requirements

### FR-01 — Scheduling

The system shall support multiple daily schedule slots.

Default configuration should support 3 slots per day.

The user can:

- enable/disable each slot
- edit time
- choose days of week
- add additional slots
- remove slots

---

### FR-02 — Job Start Notification

When a scheduled job begins, Telegram must receive a start notification immediately.

Required information:

- job name
- scheduled time
- current status

---

### FR-03 — Topic Selection

The system shall select a trading topic automatically.

It must:

- respect enabled/disabled topics
- avoid recent duplicates
- support configurable topic cooldown
- support categories
- allow manual topic selection
- allow "generate now"

---

### FR-04 — Khmer Script

The LLM shall create a beginner-friendly Khmer script.

The script should normally target 45–75 seconds.

The user can configure target duration.

---

### FR-05 — Video Prompt

The LLM shall create a prompt suitable for the selected video provider.

The prompt should prioritize visual teaching and vertical-video composition.

---

### FR-06 — Video Generation

The video-generation layer must be provider-independent.

It must support:

- API-based providers
- Playwright/browser-based providers
- mock provider for development

---

### FR-07 — Khmer Narration

The system shall support generating Khmer narration independently of the visual video provider.

It shall be possible to replace or mix original video audio.

---

### FR-08 — Khmer Subtitles

The system shall produce Khmer subtitles and optionally burn them into the final video.

---

### FR-09 — Video Rendering

The system shall produce a TikTok-ready MP4.

Default:

- 1080×1920
- 9:16
- H.264
- AAC

---

### FR-10 — Metadata

For every video, generate:

- TikTok title
- description
- hashtags

Store these with the job.

---

### FR-11 — Telegram Delivery

When rendering is finished, Telegram shall receive:

1. the MP4
2. title
3. description
4. hashtags
5. topic
6. completion status

---

### FR-12 — Failure Notifications

When a recoverable error occurs:

- save the error
- retry automatically
- notify Telegram according to notification settings

When final failure occurs:

- mark `FAILED_FINAL`
- send Telegram error notification

---

### FR-13 — History

The desktop app shall show:

- scheduled jobs
- running jobs
- delivered jobs
- failed jobs
- topic
- timestamps
- final file path
- retry count

---

### FR-14 — Retry

The user can retry a failed job manually.

The system can retry failures automatically.

---

### FR-15 — Resend

The user can resend a previously generated final video to Telegram without regenerating the content.

---

### FR-16 — Windows Tray

The app shall continue running while minimized.

The tray shall allow:

- open dashboard
- generate now
- pause
- resume
- quit

---

### FR-17 — Windows Startup

The app shall offer an optional "start with Windows" setting.

---

### FR-18 — Local Persistence

SQLite shall persist:

- jobs
- topics
- schedule
- content
- settings
- job events

---

### FR-19 — Configuration

The user shall configure:

- Gemini API key
- Telegram bot token
- Telegram chat ID
- video provider
- TTS provider
- FFmpeg path
- schedule
- subtitle settings
- storage path
- retry settings

---

### FR-20 — No TikTok Automation

V1 shall not:

- open TikTok
- log into TikTok
- upload to TikTok
- click TikTok UI
- use TikTok posting API

TikTok posting is manual.

---

## Non-Functional Requirements

### Reliability

- no duplicate scheduled job execution
- safe restart
- retry support
- timeouts
- crash recovery
- structured logs

### Security

- secrets must not appear in logs
- sensitive credentials should use secure local storage
- IPC must be validated
- Telegram must be restricted to authorized chat ID if commands are added

### Maintainability

All external providers must use interfaces/adapters.

### Performance

Long operations must run off the Electron renderer/UI thread.

### Usability

A non-technical owner should be able to understand whether the automation is:

- running
- paused
- generating
- rendering
- delivered
- failed

---

## Out of Scope for V1

- automatic TikTok posting
- social analytics
- engagement-based topic optimization
- YouTube Shorts auto-posting
- Facebook Reels auto-posting
- multi-user accounts
- cloud backend
- team permissions
- mobile app

---

## Future V2 Ideas

- Telegram remote commands
- YouTube Shorts delivery/posting
- Facebook Reels delivery/posting
- analytics import
- AI topic ranking based on historical performance
- reusable branded templates
- multiple brands/channels
- cloud worker support
