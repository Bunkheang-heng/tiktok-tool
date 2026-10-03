import { DatabaseClient } from '../client/DatabaseClient';
import { Job, JobStatus, JobStep } from '../../core/types/job';

interface JobRow {
  id: string;
  schedule_slot_id: string | null;
  topic_id: string | null;
  status: string;
  current_step: string | null;
  retry_count: number;
  max_retries: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  last_error: string | null;
  output_directory: string;
  final_video_path: string | null;
  created_at: string;
  updated_at: string;
}

export class JobRepository {
  constructor(private db: DatabaseClient) {}

  private mapRowToJob(row: JobRow): Job {
    return {
      id: row.id,
      scheduleSlotId: row.schedule_slot_id,
      topicId: row.topic_id,
      status: row.status as JobStatus,
      currentStep: (row.current_step as JobStep) || null,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      scheduledAt: row.scheduled_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      failedAt: row.failed_at,
      lastError: row.last_error,
      outputDirectory: row.output_directory,
      finalVideoPath: row.final_video_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  public create(data: {
    id: string;
    scheduleSlotId?: string | null;
    topicId?: string | null;
    status: JobStatus;
    currentStep?: JobStep | null;
    retryCount?: number;
    maxRetries?: number;
    scheduledAt?: string | null;
    outputDirectory: string;
  }): Job {
    const now = new Date().toISOString();
    this.db.run(
      `INSERT INTO jobs (
        id, schedule_slot_id, topic_id, status, current_step,
        retry_count, max_retries, scheduled_at, output_directory,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.scheduleSlotId || null,
        data.topicId || null,
        data.status,
        data.currentStep || null,
        data.retryCount ?? 0,
        data.maxRetries ?? 3,
        data.scheduledAt || null,
        data.outputDirectory,
        now,
        now
      ]
    );

    const job = this.findById(data.id);
    if (!job) throw new Error(`Failed to create job with id ${data.id}`);
    return job;
  }

  public findById(id: string): Job | null {
    const row = this.db.get<JobRow>('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!row) return null;
    return this.mapRowToJob(row);
  }

  public update(id: string, updates: Partial<Omit<Job, 'id' | 'createdAt'>>): Job | null {
    const fields: string[] = [];
    const values: (string | number | bigint | null | Buffer)[] = [];

    if (updates.scheduleSlotId !== undefined) {
      fields.push('schedule_slot_id = ?');
      values.push(updates.scheduleSlotId);
    }
    if (updates.topicId !== undefined) {
      fields.push('topic_id = ?');
      values.push(updates.topicId);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.currentStep !== undefined) {
      fields.push('current_step = ?');
      values.push(updates.currentStep);
    }
    if (updates.retryCount !== undefined) {
      fields.push('retry_count = ?');
      values.push(updates.retryCount);
    }
    if (updates.maxRetries !== undefined) {
      fields.push('max_retries = ?');
      values.push(updates.maxRetries);
    }
    if (updates.startedAt !== undefined) {
      fields.push('started_at = ?');
      values.push(updates.startedAt);
    }
    if (updates.completedAt !== undefined) {
      fields.push('completed_at = ?');
      values.push(updates.completedAt);
    }
    if (updates.failedAt !== undefined) {
      fields.push('failed_at = ?');
      values.push(updates.failedAt);
    }
    if (updates.lastError !== undefined) {
      fields.push('last_error = ?');
      values.push(updates.lastError);
    }
    if (updates.finalVideoPath !== undefined) {
      fields.push('final_video_path = ?');
      values.push(updates.finalVideoPath);
    }

    const now = new Date().toISOString();
    fields.push('updated_at = ?');
    values.push(now);

    values.push(id);
    this.db.run(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`, values);

    return this.findById(id);
  }

  public findAll(options?: { status?: JobStatus; limit?: number; offset?: number }): Job[] {
    let sql = 'SELECT * FROM jobs';
    const params: (string | number | bigint | null | Buffer)[] = [];

    if (options?.status) {
      sql += ' WHERE status = ?';
      params.push(options.status);
    }

    sql += ' ORDER BY created_at DESC';

    if (options?.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
      if (options?.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const rows = this.db.all<JobRow>(sql, params);
    return rows.map((r) => this.mapRowToJob(r));
  }

  public findActive(): Job[] {
    const activeStatuses: JobStatus[] = [
      'STARTING',
      'TOPIC_SELECTING',
      'SCRIPT_GENERATING',
      'SCRIPT_READY',
      'VIDEO_GENERATING',
      'VIDEO_READY',
      'AUDIO_GENERATING',
      'SUBTITLE_GENERATING',
      'RENDERING',
      'METADATA_GENERATING',
      'TELEGRAM_SENDING',
      'RETRYING'
    ];
    const placeholders = activeStatuses.map(() => '?').join(',');
    const rows = this.db.all<JobRow>(
      `SELECT * FROM jobs WHERE status IN (${placeholders}) ORDER BY created_at DESC`,
      activeStatuses
    );
    return rows.map((r) => this.mapRowToJob(r));
  }

  public findScheduledForSlotAndDate(slotId: string, scheduledDateStr: string): Job | null {
    // scheduledDateStr format: YYYY-MM-DD
    const row = this.db.get<JobRow>(
      `SELECT * FROM jobs WHERE schedule_slot_id = ? AND scheduled_at LIKE ?`,
      [slotId, `${scheduledDateStr}%`]
    );
    if (!row) return null;
    return this.mapRowToJob(row);
  }

  public delete(id: string): boolean {
    const res = this.db.run('DELETE FROM jobs WHERE id = ?', [id]);
    return Number(res.changes) > 0;
  }
}
