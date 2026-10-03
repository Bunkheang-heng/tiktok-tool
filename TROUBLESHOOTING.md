# Troubleshooting Guide — Ben10 FX Content Automation

Common issues and solutions.

---

## 1. Telegram Notifications Not Arriving

### Cause: Invalid Bot Token or Chat ID
- **Solution**: Open the **Settings** screen in the application. Ensure your bot token has the format `123456789:AAH...` and your chat ID is numeric (e.g. `987654321`).
- Press the **Test Connection** button in Settings.
- Make sure you have opened a chat with your bot and clicked `/start` in Telegram.

---

## 2. FFmpeg Not Detected

### Cause: FFmpeg is not in system PATH
- **Symptom**: `Failed to start FFmpeg process: spawn ffmpeg ENOENT`
- **Solution**:
  1. Open PowerShell and run `ffmpeg -version`.
  2. If it is not recognized, enter the full path to `ffmpeg.exe` inside **Settings > FFmpeg Executable Path** (e.g., `C:\ProgramData\chocolatey\bin\ffmpeg.exe` or `C:\ffmpeg\bin\ffmpeg.exe`).
  3. Click **Save Settings**.

---

## 3. Gemini API Rate Limits or Schema Errors

### Cause: Free tier rate limits or invalid key
- **Solution**: The application automatically handles retries and includes repair prompts if the model produces non-standard formatting.
- Check your Gemini quota in Google AI Studio.
- Verify your API key has access to the `gemini-2.0-flash` model.

---

## 4. Application Closed Accidentally

### Behavior: Running in System Tray
- If "Minimize to Windows system tray" is enabled, closing the main window hides it to the Windows notification area (system tray) near the clock.
- Double-click the green Ben10 FX tray icon to restore the window.
- To completely exit the application, right-click the tray icon and choose **Quit**.

---

## 5. Stale / Interrupted Jobs After Computer Reboot

### Behavior: Automatic Recovery
- If your laptop restarts or powers off while a job is generating, Ben10 FX automatically detects the active job upon startup, flags it as `INTERRUPTED`, and records a crash-recovery log event.
- You can simply click **Retry** on the Queue page to resume.
