# Video Generation Provider Architecture

Ben10 FX Content Automation is built with a pluggable video generator interface:

```typescript
export interface VideoGenerator {
  readonly id: string;
  readonly name: string;
  validateConfiguration(): Promise<ProviderHealth>;
  generate(input: VideoGenerationInput): Promise<GeneratedVideo>;
}
```

---

## Supported Providers

### 1. Mock Video Generator (`mock`)
- Generates an instant local video file.
- Used in development and test modes to verify the entire pipeline without waiting for video generation or spending credits.

### 2. Browser Playwright Worker (`browser`)
- Runs in a dedicated worker process outside the UI thread.
- Uses a persistent Chromium profile stored in `storage/browser-profile` so logins survive restarts.
- Navigates to your configured video generation portal, fills the prompt, clicks generate, and downloads the resulting vertical MP4.
- Automatically saves diagnostic screenshots on error to `storage/jobs/<job-id>/diagnostics/`.

### 3. API Video Generator (`api`)
- Direct REST API integration for platforms that provide developer API keys.
