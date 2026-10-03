import { DatabaseClient } from '../client/DatabaseClient';
import { ScheduleSlot, ScheduleSlotDTO } from '../../core/types/schedule';
import { randomUUID } from 'node:crypto';

interface ScheduleSlotRow {
  id: string;
  name: string;
  enabled: number;
  local_time: string;
  days_of_week_json: string;
  created_at: string;
  updated_at: string;
}

export class ScheduleRepository {
  constructor(private db: DatabaseClient) {}

  private mapRowToSlot(row: ScheduleSlotRow): ScheduleSlot {
    return {
      id: row.id,
      name: row.name,
      enabled: row.enabled === 1,
      localTime: row.local_time,
      daysOfWeekJson: row.days_of_week_json,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  public toDTO(slot: ScheduleSlot): ScheduleSlotDTO {
    let days: number[] = [0, 1, 2, 3, 4, 5, 6];
    try {
      days = JSON.parse(slot.daysOfWeekJson);
    } catch {
      days = [0, 1, 2, 3, 4, 5, 6];
    }
    return {
      id: slot.id,
      name: slot.name,
      enabled: slot.enabled,
      localTime: slot.localTime,
      daysOfWeek: days,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt
    };
  }

  public create(data: {
    id?: string;
    name: string;
    enabled?: boolean;
    localTime: string;
    daysOfWeek?: number[];
  }): ScheduleSlot {
    const id = data.id || randomUUID();
    const now = new Date().toISOString();
    const daysJson = JSON.stringify(data.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]);

    this.db.run(
      `INSERT INTO schedule_slots (
        id, name, enabled, local_time, days_of_week_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.enabled ?? true ? 1 : 0,
        data.localTime,
        daysJson,
        now,
        now
      ]
    );

    const slot = this.findById(id);
    if (!slot) throw new Error(`Failed to create schedule slot ${id}`);
    return slot;
  }

  public findById(id: string): ScheduleSlot | null {
    const row = this.db.get<ScheduleSlotRow>('SELECT * FROM schedule_slots WHERE id = ?', [id]);
    if (!row) return null;
    return this.mapRowToSlot(row);
  }

  public findAll(enabledOnly: boolean = false): ScheduleSlot[] {
    let sql = 'SELECT * FROM schedule_slots';
    if (enabledOnly) {
      sql += ' WHERE enabled = 1';
    }
    sql += ' ORDER BY local_time ASC';
    const rows = this.db.all<ScheduleSlotRow>(sql);
    return rows.map((r) => this.mapRowToSlot(r));
  }

  public update(id: string, updates: {
    name?: string;
    enabled?: boolean;
    localTime?: string;
    daysOfWeek?: number[];
  }): ScheduleSlot | null {
    const fields: string[] = [];
    const values: (string | number | bigint | null | Buffer)[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(updates.enabled ? 1 : 0);
    }
    if (updates.localTime !== undefined) {
      fields.push('local_time = ?');
      values.push(updates.localTime);
    }
    if (updates.daysOfWeek !== undefined) {
      fields.push('days_of_week_json = ?');
      values.push(JSON.stringify(updates.daysOfWeek));
    }

    const now = new Date().toISOString();
    fields.push('updated_at = ?');
    values.push(now);

    values.push(id);
    this.db.run(`UPDATE schedule_slots SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  public delete(id: string): boolean {
    const res = this.db.run('DELETE FROM schedule_slots WHERE id = ?', [id]);
    return Number(res.changes) > 0;
  }

  public seedDefaults(): void {
    const existing = this.findAll();
    if (existing.length === 0) {
      this.create({
        id: 'slot-morning',
        name: 'Morning Drop',
        enabled: true,
        localTime: '08:30',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      });
      this.create({
        id: 'slot-afternoon',
        name: 'Afternoon Drop',
        enabled: true,
        localTime: '13:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      });
      this.create({
        id: 'slot-evening',
        name: 'Evening Drop',
        enabled: true,
        localTime: '19:30',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      });
    }
  }
}
