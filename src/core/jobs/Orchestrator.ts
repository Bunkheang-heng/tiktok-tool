import { JobStateMachine } from './StateMachine';
import { JobRepository } from '../../database/repositories/JobRepository';
import { TopicRepository } from '../../database/repositories/TopicRepository';
import { ContentRepository } from '../../database/repositories/ContentRepository';
import { EventRepository } from '../../database/repositories/EventRepository';
import { LlmProvider } from '../../providers/llm/LlmProvider';
import { VideoGenerator } from '../../providers/video/VideoGenerator';
import { TtsProvider } from '../../providers/tts/TtsProvider';
import { SubtitleService } from '../../media/subtitles/SubtitleService';
import { VideoRenderer } from '../../media/ffmpeg/VideoRenderer';
import { TelegramService } from '../../providers/telegram/TelegramService';
import { Job, JobStep } from '../types/job';
import fs from 'node:fs';

export interface OrchestratorDependencies {
  jobRepo: JobRepository;
  topicRepo: TopicRepository;
  contentRepo: ContentRepository;
  eventRepo: EventRepository;
  stateMachine: JobStateMachine;
  llm: LlmProvider;
  videoGenerator: VideoGenerator;
  tts: TtsProvider;
  subtitleService: SubtitleService;
  renderer: VideoRenderer;
  telegram: TelegramService;
}

export class Orchestrator {
  constructor(private deps: OrchestratorDependencies) {}

  public async executeJob(jobId: string, jobName: string = 'Automated Content Run'): Promise<Job> {
    const {
      jobRepo,
      topicRepo,
      contentRepo,
      eventRepo,
      stateMachine,
      llm,
      videoGenerator,
      tts,
      subtitleService,
      renderer,
      telegram
    } = this.deps;

    let job = jobRepo.findById(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);

    // Ensure directory exists
    if (!fs.existsSync(job.outputDirectory)) {
      fs.mkdirSync(job.outputDirectory, { recursive: true });
    }

    try {
      // 1. STARTING
      job = stateMachine.transition(jobId, 'STARTING', {
        step: 'INITIALIZING',
        message: 'Job started executing'
      });

      const scheduledTimeStr = job.scheduledAt
        ? new Date(job.scheduledAt).toLocaleTimeString()
        : 'Immediate';

      await telegram.notifyJobStart(jobName, scheduledTimeStr);

      // 2. TOPIC_SELECTING
      job = stateMachine.transition(jobId, 'TOPIC_SELECTING', {
        step: 'TOPIC_SELECTION',
        message: 'Selecting trading education topic'
      });

      let topic = job.topicId ? topicRepo.findById(job.topicId) : null;
      if (!topic) {
        topic = topicRepo.selectNextTopic();
        if (!topic) {
          throw new Error('No eligible trading topics available');
        }
        job = jobRepo.update(jobId, { topicId: topic.id })!;
      }

      await telegram.notifyTopicSelected(topic.title, topic.khmerTitle);

      // 3. SCRIPT_GENERATING
      job = stateMachine.transition(jobId, 'SCRIPT_GENERATING', {
        step: 'SCRIPT_GENERATION',
        message: `Generating Khmer script for topic: ${topic.title}`
      });

      const content = await llm.generateContent({
        topic: topic.title,
        topicKhmer: topic.khmerTitle,
        category: topic.category
      });

      contentRepo.save(jobId, content);

      // 4. SCRIPT_READY
      job = stateMachine.transition(jobId, 'SCRIPT_READY', {
        step: 'SCRIPT_GENERATION',
        message: 'Khmer script and video prompt generated successfully'
      });

      // 5. VIDEO_GENERATING
      job = stateMachine.transition(jobId, 'VIDEO_GENERATING', {
        step: 'VIDEO_GENERATION',
        message: 'Starting visual video generation'
      });

      await telegram.notifyVideoGenerationStarted(topic.title);

      const generatedVideo = await videoGenerator.generate({
        jobId,
        topic: topic.title,
        topicKhmer: topic.khmerTitle,
        prompt: content.videoPrompt,
        script: content.scriptKhmer,
        aspectRatio: '9:16',
        outputDirectory: job.outputDirectory
      });

      // 6. VIDEO_READY
      job = stateMachine.transition(jobId, 'VIDEO_READY', {
        step: 'VIDEO_GENERATION',
        message: 'Source video ready'
      });

      // 7. AUDIO_GENERATING
      job = stateMachine.transition(jobId, 'AUDIO_GENERATING', {
        step: 'AUDIO_GENERATION',
        message: 'Synthesizing Khmer narration audio'
      });

      const narration = await tts.synthesize({
        jobId,
        text: content.scriptKhmer,
        outputDirectory: job.outputDirectory
      });

      // 8. SUBTITLE_GENERATING
      job = stateMachine.transition(jobId, 'SUBTITLE_GENERATING', {
        step: 'SUBTITLE_GENERATION',
        message: 'Generating timed Khmer subtitles'
      });

      const subtitles = await subtitleService.generateSubtitles({
        text: content.scriptKhmer,
        totalDurationSeconds: narration.durationSeconds,
        outputDirectory: job.outputDirectory
      });

      // 9. RENDERING
      job = stateMachine.transition(jobId, 'RENDERING', {
        step: 'RENDERING',
        message: 'Encoding final vertical 1080x1920 MP4'
      });

      const renderResult = await renderer.render({
        jobId,
        sourceVideoPath: generatedVideo.filePath,
        narrationAudioPath: narration.audioPath,
        subtitlesAssPath: subtitles.assPath,
        outputDirectory: job.outputDirectory
      });

      job = jobRepo.update(jobId, { finalVideoPath: renderResult.finalVideoPath })!;

      // 10. METADATA_GENERATING
      job = stateMachine.transition(jobId, 'METADATA_GENERATING', {
        step: 'METADATA_GENERATION',
        message: 'Finalizing TikTok metadata'
      });

      // Mark topic as used now that content is successfully produced
      topicRepo.markUsed(topic.id);

      // 11. TELEGRAM_SENDING
      job = stateMachine.transition(jobId, 'TELEGRAM_SENDING', {
        step: 'TELEGRAM_DELIVERY',
        message: 'Sending final video package to Telegram'
      });

      await telegram.notifyJobSuccess({
        videoPath: renderResult.finalVideoPath,
        topic: topic.title,
        title: content.titleKhmer,
        description: content.descriptionKhmer,
        hashtags: content.hashtags
      });

      // 12. DELIVERED
      job = stateMachine.transition(jobId, 'DELIVERED', {
        step: 'TELEGRAM_DELIVERY',
        message: 'Video package delivered successfully to Telegram'
      });

      return job;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Determine current step
      const currentStep: JobStep = job.currentStep || 'INITIALIZING';

      eventRepo.record({
        jobId,
        level: 'error',
        type: 'JOB_ERROR',
        message: `Execution failed at step ${currentStep}: ${errorMessage}`
      });

      if (job.retryCount < job.maxRetries) {
        stateMachine.transition(jobId, 'FAILED', {
          error: errorMessage,
          step: currentStep
        });

        await telegram.notifyStepRetry(
          jobName,
          currentStep,
          job.retryCount + 1,
          job.maxRetries,
          errorMessage
        );

        // Mark retrying
        job = stateMachine.transition(jobId, 'RETRYING', { step: currentStep });
      } else {
        // Exceeded max retries
        stateMachine.transition(jobId, 'FAILED', {
          error: errorMessage,
          step: currentStep
        });
        job = stateMachine.transition(jobId, 'FAILED_FINAL', {
          error: errorMessage,
          step: currentStep
        });

        await telegram.notifyJobFailure({
          jobName,
          topic: job.topicId ? topicRepo.findById(job.topicId)?.title : undefined,
          failedStep: currentStep,
          retryCount: job.retryCount,
          error: errorMessage
        });
      }

      throw err;
    }
  }

  public async cancelJob(jobId: string, reason: string = 'User cancelled'): Promise<Job> {
    const { jobRepo, topicRepo, stateMachine, telegram } = this.deps;
    const job = jobRepo.findById(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);

    const topic = job.topicId ? topicRepo.findById(job.topicId) : null;
    const updated = stateMachine.transition(jobId, 'CANCELLED', {
      message: `Job cancelled: ${reason}`
    });

    try {
      await telegram.sendMessage({
        text: `🛑 *BEN10 FX: JOB CANCELLED*\n\n*Job:* \`${job.id}\`\n*Topic:* ${topic ? topic.title : 'N/A'}\n*Status:* CANCELLED\n*Reason:* ${reason}`,
        parseMode: 'Markdown'
      });
    } catch (e) {
      console.error('Failed to push job cancellation to Telegram:', e);
    }

    return updated;
  }

  public async resendToTelegram(jobId: string): Promise<void> {
    const { jobRepo, topicRepo, contentRepo, stateMachine, telegram } = this.deps;

    const job = jobRepo.findById(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    if (!job.finalVideoPath || !fs.existsSync(job.finalVideoPath)) {
      throw new Error(`Final video not found for job: ${jobId}`);
    }

    const content = contentRepo.findByJobId(jobId);
    if (!content) {
      throw new Error(`Content metadata not found for job: ${jobId}`);
    }

    const topic = job.topicId ? topicRepo.findById(job.topicId) : null;

    stateMachine.transition(jobId, 'TELEGRAM_SENDING', {
      step: 'TELEGRAM_DELIVERY',
      message: 'Resending video to Telegram'
    });

    await telegram.notifyJobSuccess({
      videoPath: job.finalVideoPath,
      topic: topic ? topic.title : content.topic,
      title: content.titleKhmer,
      description: content.descriptionKhmer,
      hashtags: content.hashtags
    });

    stateMachine.transition(jobId, 'DELIVERED', {
      step: 'TELEGRAM_DELIVERY',
      message: 'Resent video to Telegram successfully'
    });
  }
}
