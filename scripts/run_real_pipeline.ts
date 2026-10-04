import { GeminiLlmProvider } from '../src/providers/llm/GeminiLlmProvider';
import { KhmerTtsProvider } from '../src/providers/tts/KhmerTtsProvider';
import { MockSubtitleService } from '../src/media/subtitles/MockSubtitleService';
import { RealTelegramService } from '../src/providers/telegram/RealTelegramService';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8884039162:AAEXDW30sIAUzD3d40ziClGPxM0vhHb_3lE';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1099911298';
const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDw17nb34vJWCkEyJtWdnSLrybRjcx0wvE';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

async function runRealVideoPipeline() {
  console.log('========================================================');
  console.log('🚀 BEN10 FX: RUNNING REAL VIDEO GENERATION TEST');
  console.log('========================================================');

  const outputDir = path.resolve(process.cwd(), 'storage', 'real_test_run');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const telegram = new RealTelegramService(BOT_TOKEN, CHAT_ID);
  const llm = new GeminiLlmProvider(GEMINI_KEY, GEMINI_MODEL);
  const tts = new KhmerTtsProvider();
  const subtitleService = new MockSubtitleService();

  // 1. Notify Telegram: Job Started
  console.log('\n[1/6] Sending job start notification to Telegram...');
  await telegram.notifyJobStart('Ben10 FX Live Real Test', new Date().toLocaleTimeString(), 'What is leverage?');
  console.log('✅ Telegram: Job Start sent');

  // 2. AI Content Generation with Gemini
  console.log('\n[2/6] Generating Khmer educational script with Gemini AI...');
  const topic = 'What is leverage?';
  const topicKhmer = 'តើ Leverage គឺជាអ្វី? ដាវមុខពីរក្នុងការ Trade';

  const content = await llm.generateContent({
    topic,
    topicKhmer,
    category: 'Beginner'
  });

  console.log('✅ Gemini generated content:');
  console.log(' - Title:', content.titleKhmer);
  console.log(' - Hook:', content.hook);
  console.log(' - Script length:', content.scriptKhmer.length, 'chars');
  console.log(' - Hashtags:', content.hashtags.join(' '));

  await telegram.notifyTopicSelected(content.topic, content.titleKhmer);

  // 3. Khmer Narration Synthesis
  console.log('\n[3/6] Synthesizing natural spoken Khmer voice audio...');
  const audioResult = await tts.synthesize({
    jobId: 'real-run',
    text: content.scriptKhmer,
    outputDirectory: outputDir
  });

  const narrationPath = audioResult.audioPath;
  const duration = Math.max(15, audioResult.durationSeconds);
  console.log(`✅ Khmer voice audio generated: ${narrationPath} (~${duration}s)`);

  // 4. Khmer Subtitles Generation
  console.log('\n[4/6] Generating synchronized Khmer subtitles...');
  const subResult = await subtitleService.generateSubtitles({
    text: content.scriptKhmer,
    totalDurationSeconds: duration,
    outputDirectory: outputDir
  });
  console.log(`✅ Subtitles generated: ${subResult.entryCount} dialogue blocks`);

  // 5. FFmpeg Video Rendering (1080x1920 9:16 Vertical Video)
  console.log('\n[5/6] Rendering final 1080x1920 vertical MP4 with FFmpeg...');
  const finalVideoPath = path.join(outputDir, 'final_ben10fx_video.mp4');
  if (fs.existsSync(finalVideoPath)) fs.unlinkSync(finalVideoPath);

  // Use FFmpeg to create a dynamic financial aesthetic visual background with audio
  // 1080x1920 vertical canvas, dark cyan/emerald aesthetic, combined with Khmer narration audio
  const ffmpegArgs = [
    '-y',
    '-f', 'lavfi',
    // Generate a sleek dark gradient pattern with moving visual elements (1080x1920 vertical)
    '-i', `gradients=s=1080x1920:c0=0x0a101f:c1=0x0d2822:speed=0.01:d=${duration}`,
    '-i', narrationPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    finalVideoPath
  ];

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('ffmpeg', ffmpegArgs);
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg error (code ${code}):\n${stderr.slice(-500)}`));
    });
  });

  const videoStats = fs.statSync(finalVideoPath);
  console.log(`✅ Final 1080x1920 MP4 rendered: ${(videoStats.size / (1024 * 1024)).toFixed(2)} MB`);

  // 6. Telegram Delivery: Send Video + Full Metadata
  console.log('\n[6/6] Delivering final video package to Telegram...');
  await telegram.notifyJobSuccess({
    videoPath: finalVideoPath,
    topic: content.topic,
    title: content.titleKhmer,
    description: content.descriptionKhmer,
    hashtags: content.hashtags
  });

  console.log('\n========================================================');
  console.log('🎉 PIPELINE COMPLETED SUCCESSFULLY!');
  console.log('📱 The real video and complete script are now in your Telegram!');
  console.log('========================================================');
}

runRealVideoPipeline().catch((err) => {
  console.error('\n❌ Real video pipeline error:', err);
  process.exit(1);
});
