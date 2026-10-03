import {
  SubtitleResult,
  SubtitleService,
  SubtitleTimingInput
} from './SubtitleService';
import fs from 'node:fs';
import path from 'node:path';

export class MockSubtitleService implements SubtitleService {
  public async generateSubtitles(input: SubtitleTimingInput): Promise<SubtitleResult> {
    if (!fs.existsSync(input.outputDirectory)) {
      fs.mkdirSync(input.outputDirectory, { recursive: true });
    }

    const srtPath = path.join(input.outputDirectory, 'subtitles.srt');
    const assPath = path.join(input.outputDirectory, 'subtitles.ass');

    // Split text into readable chunks (by sentence boundaries or punctuation)
    const sentences = input.text
      .split(/[។!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const count = sentences.length > 0 ? sentences.length : 1;
    const segmentDuration = input.totalDurationSeconds / count;

    let srtContent = '';
    const assEvents: string[] = [];

    const formatSrtTime = (seconds: number): string => {
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = Math.floor(seconds % 60).toString().padStart(2, '0');
      const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
      return `${h}:${m}:${s},${ms}`;
    };

    const formatAssTime = (seconds: number): string => {
      const h = Math.floor(seconds / 3600).toString();
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = Math.floor(seconds % 60).toString().padStart(2, '0');
      const cs = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
      return `${h}:${m}:${s}.${cs}`;
    };

    sentences.forEach((sentence, idx) => {
      const start = idx * segmentDuration;
      const end = (idx + 1) * segmentDuration;

      // SRT block
      srtContent += `${idx + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${sentence}\n\n`;

      // ASS event
      assEvents.push(
        `Dialogue: 0,${formatAssTime(start)},${formatAssTime(end)},Default,,0,0,0,,${sentence}`
      );
    });

    const assHeader = `[Script Info]
Title: Ben10 FX Khmer Trading Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Khmer OS Battambang,56,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,40,40,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${assEvents.join('\n')}
`;

    fs.writeFileSync(srtPath, srtContent, 'utf-8');
    fs.writeFileSync(assPath, assHeader, 'utf-8');

    return {
      srtPath,
      assPath,
      entryCount: count
    };
  }
}
