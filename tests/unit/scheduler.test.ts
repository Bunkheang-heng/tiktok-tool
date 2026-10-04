import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDatabaseService, DatabaseService } from '../../src/database';
import { Scheduler } from '../../src/core/scheduling/Scheduler';

describe('Scheduler and Duplicate Protection', () => {
  let dbService: DatabaseService;
  let scheduler: Scheduler;

  beforeEach(async () => {
    dbService = await createDatabaseService(':memory:');
    dbService.seedIfEmpty();
    scheduler = new Scheduler(dbService.schedules, dbService.jobs);
  });


  afterEach(() => {
    scheduler.stop();
    dbService.close();
  });

  it('calculates the next upcoming slot accurately', () => {
    const upcoming = scheduler.getNextUpcomingSlot();
    expect(upcoming).not.toBeNull();
    expect(upcoming?.slot).toBeDefined();
    expect(upcoming?.nextRun.getTime()).toBeGreaterThan(Date.now() - 1000);
  });

  it('triggers a scheduled job when time matches and prevents duplicate runs', async () => {
    // Pick the morning slot and set its time to match our test time: 08:30
    const slot = dbService.schedules.findById('slot-morning')!;
    expect(slot).toBeDefined();

    // Create a mock date representing 2026-10-04 at 08:30:00 AM
    const mockDate = new Date('2026-10-04T08:30:00');

    // First trigger check: should create job
    const job1 = await scheduler.checkAndTriggerSlots(mockDate);
    expect(job1).not.toBeNull();
    expect(job1?.scheduleSlotId).toBe('slot-morning');

    // Second trigger check at same minute: should NOT create duplicate job
    const job2 = await scheduler.checkAndTriggerSlots(mockDate);
    expect(job2).toBeNull();

    // Verify only 1 job was created in the database
    const jobs = dbService.jobs.findAll();
    expect(jobs.length).toBe(1);
  });

  it('supports generate-now for on-demand execution', async () => {
    let triggered = false;
    const testScheduler = new Scheduler(dbService.schedules, dbService.jobs, './storage', {
      onJobTriggered: async (job) => {
        triggered = true;
        expect(job.status).toBe('SCHEDULED');
      }
    });

    const job = await testScheduler.triggerGenerateNow();
    expect(job).toBeDefined();
    expect(job.scheduleSlotId).toBeNull();
    expect(triggered).toBe(true);
  });
});
