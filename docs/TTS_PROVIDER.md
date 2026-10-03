# Khmer Voice / TTS Provider Architecture

Ben10 FX Content Automation features an independent Khmer narration voice pipeline:

```typescript
export interface TtsProvider {
  readonly id: string;
  readonly name: string;
  synthesize(input: TtsInput): Promise<TtsResult>;
}
```

---

## Supported Khmer Voice Engines

### 1. Google Khmer Voice (`google`)
- Built-in, high-speed Khmer speech synthesis.
- Requires no external API keys or subscription fees.
- Splits script sentences into natural chunks and outputs clean MP3 audio.

### 2. Edge Neural TTS (`edge`)
- High-quality natural voices for Khmer:
  - `km-KH-PisethNeural` (Male)
  - `km-KH-SreymomNeural` (Female)

### 3. Mock Audio Provider (`mock`)
- Instant offline audio simulation for testing pipeline speed.
