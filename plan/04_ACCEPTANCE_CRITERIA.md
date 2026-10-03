# ACCEPTANCE CRITERIA — Ben10 FX Content Automation

Use this checklist before declaring V1 complete.

## Core Application

- [ ] Runs on Windows.
- [ ] Built with Electron + TypeScript + React.
- [ ] Can minimize to tray.
- [ ] Does not stop automation when dashboard window is hidden.
- [ ] Optional start-with-Windows setting works.

## Scheduler

- [ ] Three default daily schedule slots exist.
- [ ] User can edit schedule times.
- [ ] User can disable individual slots.
- [ ] User can choose days of week.
- [ ] A slot does not execute twice for the same scheduled occurrence.
- [ ] "Generate now" works.

## Telegram

- [ ] User can configure bot token.
- [ ] User can configure chat ID.
- [ ] Test notification works.
- [ ] Telegram receives notification at job start.
- [ ] Telegram receives important progress notifications according to configured verbosity.
- [ ] Telegram receives retry notification.
- [ ] Telegram receives final-failure notification.
- [ ] Telegram receives final MP4.
- [ ] Telegram receives title.
- [ ] Telegram receives description.
- [ ] Telegram receives hashtags.

## Topics

- [ ] Topic categories exist.
- [ ] Topics can be enabled/disabled.
- [ ] Topic cooldown works.
- [ ] Recently used topic is not immediately selected again.
- [ ] User can add custom topic.
- [ ] User can pin the next topic.

## LLM

- [ ] Gemini provider exists behind an interface.
- [ ] LLM response is validated.
- [ ] Invalid JSON is repaired/retried.
- [ ] Khmer script is stored.
- [ ] Video prompt is stored.
- [ ] Title is stored.
- [ ] Description is stored.
- [ ] Hashtags are stored.
- [ ] No API key appears in logs.

## Video Generation

- [ ] Video provider uses an interface.
- [ ] Mock provider exists.
- [ ] Real provider can be configured.
- [ ] Playwright code, if used, is isolated.
- [ ] Browser failure produces diagnostic screenshot.
- [ ] Downloaded source video is attached to its job.

## Khmer Narration

- [ ] TTS provider interface exists.
- [ ] At least one Khmer-capable provider works.
- [ ] User can configure voice.
- [ ] Generated audio is persisted.

## Subtitles

- [ ] Khmer Unicode text works.
- [ ] SRT can be generated.
- [ ] ASS can be generated.
- [ ] Burned subtitles are readable on 9:16 video.

## FFmpeg

- [ ] FFmpeg health check exists.
- [ ] Rendering happens outside UI thread.
- [ ] Final output is 1080×1920 or configured vertical resolution.
- [ ] Final output is MP4/H.264.
- [ ] Khmer narration is present.
- [ ] Khmer subtitles are present when enabled.

## Database

- [ ] Jobs persist across restart.
- [ ] Job events persist.
- [ ] Schedules persist.
- [ ] Topics persist.
- [ ] Generated content persists.
- [ ] Settings persist.
- [ ] Failed jobs can be inspected.

## Reliability

- [ ] Network timeout exists.
- [ ] Video-provider timeout exists.
- [ ] Telegram timeout exists.
- [ ] FFmpeg timeout exists.
- [ ] Retry limit exists.
- [ ] Retry delay exists.
- [ ] Crash recovery exists.
- [ ] Duplicate job protection exists.
- [ ] Completed video survives Telegram-send failure.

## Security

- [ ] `.env` is not committed.
- [ ] `.env.example` exists.
- [ ] Secrets are redacted from logs.
- [ ] Sensitive values use secure storage where practical.
- [ ] Renderer has no unrestricted Node access.
- [ ] IPC is validated.
- [ ] User-provided paths are validated.
- [ ] FFmpeg command arguments are safely passed.

## UI

- [ ] Dashboard shows system state.
- [ ] Dashboard shows current job.
- [ ] Dashboard shows next run.
- [ ] Queue shows pending/running/completed/failed.
- [ ] History shows previous jobs.
- [ ] Settings page exists.
- [ ] Logs page exists.
- [ ] Retry action exists.
- [ ] Resend-to-Telegram action exists.
- [ ] Open-output-folder action exists.

## Explicitly Not Included

- [ ] No TikTok login automation exists.
- [ ] No TikTok browser upload exists.
- [ ] No TikTok auto-post exists.

## End-to-End Test

This exact workflow must succeed:

```text
1. Scheduler reaches a configured slot.
2. A new job is created once.
3. Telegram receives "Automation Started".
4. Topic is selected.
5. Khmer content is generated.
6. Source video is produced.
7. Khmer narration is produced.
8. Khmer subtitles are produced.
9. FFmpeg creates final vertical MP4.
10. Metadata is finalized.
11. Telegram receives the final MP4.
12. Telegram receives title, description and hashtags.
13. Job becomes DELIVERED.
14. Restarting the app still shows the complete job history.
```

If this works reliably, V1 is accepted.
