import { ScheduleRepository } from '../../database/repositories/ScheduleRepository';
import { JobRepository } from '../../database/repositories/JobRepository';
import { ScheduleSlotDTO } from '../types/schedule';
import { Job } from '../types/job';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

export interface SchedulerEvents {
  onJobTriggered?: (job: Job, slot: ScheduleSlotDTO | null) => Promise<void> | void;
}

export class Scheduler {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  private executionMutex: boolean = false;

  constructor(
    private scheduleRepo: ScheduleRepository,
    private jobRepo: JobRepository,
    private storageBaseDir: string = './storage',
    private events?: SchedulerEvents
  ) {}

  public getNextRun(slot: ScheduleSlotDTO, fromDate: Date = new Date()): Date {
    const [targetHour, targetMinute] = slot.localTime.split(':').map((v) => parseInt(v, 10));

    // Check from today up to 7 days ahead
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const candidate = new Date(fromDate.getTime());
      candidate.setDate(fromDate.getDate() + dayOffset);
      candidate.setHours(targetHour, targetMinute, 0, 0);

      const dayOfWeek = candidate.getDay(); // 0 = Sun, 1 = Mon ...
      if (slot.daysOfWeek.includes(dayOfWeek)) {
        if (candidate.getTime() > fromDate.getTime()) {
          return candidate;
        }
      }
    }

    // Default fallback to 24h later
    const fallback = new Date(fromDate.getTime() + 24 * 3600 * 1000);
    fallback.setHours(targetHour, targetMinute, 0, 0);
    return fallback;
  }

  public getNextUpcomingSlot(): { slot: ScheduleSlotDTO; nextRun: Date } | null {
    const slots = this.scheduleRepo.findAll(true).map((s) => this.scheduleRepo.toDTO(s));
    if (slots.length === 0) return null;

    const now = new Date();
    let earliest: { slot: ScheduleSlotDTO; nextRun: Date } | null = null;

    for (const slot of slots) {
      const nextRun = this.getNextRun(slot, now);
      if (!earliest || nextRun.getTime() < earliest.nextRun.getTime()) {
        earliest = { slot, nextRun };
      }
    }

    return earliest;
  }

  public async checkAndTriggerSlots(now: Date = new Date()): Promise<Job | null> {
    if (this.isProcessing || this.executionMutex) {
      return null;
    }

    this.isProcessing = true;
    try {
      const slots = this.scheduleRepo.findAll(true).map((s) => this.scheduleRepo.toDTO(s));
      const currentDayOfWeek = now.getDay();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

      for (const slot of slots) {
        if (!slot.daysOfWeek.includes(currentDayOfWeek)) {
          continue;
        }

        // Compare slot local time with current time (e.g. "08:30" === "08:30")
        if (slot.localTime === currentTimeStr) {
          // DUPLICATE PROTECTION: Check if job already created for this slot today
          const existingJob = this.jobRepo.findScheduledForSlotAndDate(slot.id, currentDateStr);
          if (existingJob) {
            // Already triggered today for this slot, skip
            continue;
          }

          // Create scheduled job with duplicate protection
          const jobId = randomUUID();
          const jobDir = path.resolve(this.storageBaseDir, 'jobs', jobId);

          const job = this.jobRepo.create({
            id: jobId,
            scheduleSlotId: slot.id,
            status: 'SCHEDULED',
            scheduledAt: now.toISOString(),
            outputDirectory: jobDir
          });

          if (this.events?.onJobTriggered) {
            this.executionMutex = true;
            try {
              await this.events.onJobTriggered(job, slot);
            } finally {
              this.executionMutex = false;
            }
          }

          return job;
        }
      }

      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  public async triggerGenerateNow(): Promise<Job> {
    if (this.executionMutex) {
      throw new Error('Another job is currently running or rendering. Please wait.');
    }

    const jobId = randomUUID();
    const jobDir = path.resolve(this.storageBaseDir, 'jobs', jobId);
    const now = new Date();

    const job = this.jobRepo.create({
      id: jobId,
      scheduleSlotId: null, // manual trigger
      status: 'SCHEDULED',
      scheduledAt: now.toISOString(),
      outputDirectory: jobDir
    });

    if (this.events?.onJobTriggered) {
      this.executionMutex = true;
      try {
        await this.events.onJobTriggered(job, null);
      } finally {
        this.executionMutex = false;
      }
    }

    return job;
  }

  public start(intervalMs: number = 30000): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.checkAndTriggerSlots().catch((err) => {
        console.error('Scheduler check error:', err);
      });
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public isRunning(): boolean {
    return this.timer !== null;
  }
}
