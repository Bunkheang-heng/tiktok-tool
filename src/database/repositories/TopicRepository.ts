import { DatabaseClient } from '../client/DatabaseClient';
import { Topic, TopicCategory } from '../../core/types/topic';
import { randomUUID } from 'node:crypto';

interface TopicRow {
  id: string;
  title: string;
  khmer_title: string;
  category: string;
  enabled: number;
  use_count: number;
  last_used_at: string | null;
  cooldown_days: number;
  pinned_for_next: number;
  created_at: string;
  updated_at: string;
}

export class TopicRepository {
  constructor(private db: DatabaseClient) {}

  private mapRowToTopic(row: TopicRow): Topic {
    return {
      id: row.id,
      title: row.title,
      khmerTitle: row.khmer_title,
      category: row.category as TopicCategory,
      enabled: row.enabled === 1,
      useCount: row.use_count,
      lastUsedAt: row.last_used_at,
      cooldownDays: row.cooldown_days,
      pinnedForNext: row.pinned_for_next === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  public create(data: {
    id?: string;
    title: string;
    khmerTitle: string;
    category: TopicCategory | string;
    enabled?: boolean;
    cooldownDays?: number;
    pinnedForNext?: boolean;
  }): Topic {
    const id = data.id || randomUUID();
    const now = new Date().toISOString();
    this.db.run(
      `INSERT INTO topics (
        id, title, khmer_title, category, enabled,
        use_count, last_used_at, cooldown_days, pinned_for_next,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.khmerTitle,
        data.category,
        data.enabled ?? true ? 1 : 0,
        data.cooldownDays ?? 7,
        data.pinnedForNext ? 1 : 0,
        now,
        now
      ]
    );

    const topic = this.findById(id);
    if (!topic) throw new Error(`Failed to create topic with id ${id}`);
    return topic;
  }

  public findById(id: string): Topic | null {
    const row = this.db.get<TopicRow>('SELECT * FROM topics WHERE id = ?', [id]);
    if (!row) return null;
    return this.mapRowToTopic(row);
  }

  public findAll(filter?: { category?: string; enabledOnly?: boolean }): Topic[] {
    let sql = 'SELECT * FROM topics';
    const params: (string | number | bigint | null | Buffer)[] = [];
    const conditions: string[] = [];

    if (filter?.category) {
      conditions.push('category = ?');
      params.push(filter.category);
    }
    if (filter?.enabledOnly) {
      conditions.push('enabled = 1');
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY pinned_for_next DESC, use_count ASC, created_at ASC';
    const rows = this.db.all<TopicRow>(sql, params);
    return rows.map((r) => this.mapRowToTopic(r));
  }

  public update(id: string, updates: Partial<Omit<Topic, 'id' | 'createdAt'>>): Topic | null {
    const fields: string[] = [];
    const values: (string | number | bigint | null | Buffer)[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.khmerTitle !== undefined) {
      fields.push('khmer_title = ?');
      values.push(updates.khmerTitle);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(updates.enabled ? 1 : 0);
    }
    if (updates.cooldownDays !== undefined) {
      fields.push('cooldown_days = ?');
      values.push(updates.cooldownDays);
    }
    if (updates.pinnedForNext !== undefined) {
      fields.push('pinned_for_next = ?');
      values.push(updates.pinnedForNext ? 1 : 0);
    }
    if (updates.lastUsedAt !== undefined) {
      fields.push('last_used_at = ?');
      values.push(updates.lastUsedAt);
    }
    if (updates.useCount !== undefined) {
      fields.push('use_count = ?');
      values.push(updates.useCount);
    }

    const now = new Date().toISOString();
    fields.push('updated_at = ?');
    values.push(now);

    values.push(id);
    this.db.run(`UPDATE topics SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  public setPinned(id: string, pinned: boolean): void {
    if (pinned) {
      // Unpin any other topic first to ensure only 1 pinned
      this.db.run('UPDATE topics SET pinned_for_next = 0 WHERE pinned_for_next = 1');
    }
    this.db.run('UPDATE topics SET pinned_for_next = ? WHERE id = ?', [pinned ? 1 : 0, id]);
  }

  public markUsed(id: string): void {
    const now = new Date().toISOString();
    this.db.run(
      'UPDATE topics SET use_count = use_count + 1, last_used_at = ?, pinned_for_next = 0, updated_at = ? WHERE id = ?',
      [now, now, id]
    );
  }

  public selectNextTopic(): Topic | null {
    // 1. Check if any topic is pinned
    const pinnedRow = this.db.get<TopicRow>(
      'SELECT * FROM topics WHERE enabled = 1 AND pinned_for_next = 1 LIMIT 1'
    );
    if (pinnedRow) {
      return this.mapRowToTopic(pinnedRow);
    }

    // 2. Select eligible topics where cooldown period has expired
    const allEnabled = this.findAll({ enabledOnly: true });
    if (allEnabled.length === 0) return null;

    const now = new Date();
    const eligible = allEnabled.filter((t) => {
      if (!t.lastUsedAt) return true;
      const lastUsed = new Date(t.lastUsedAt);
      const diffDays = (now.getTime() - lastUsed.getTime()) / (1000 * 3600 * 24);
      return diffDays >= t.cooldownDays;
    });

    if (eligible.length > 0) {
      // Sort by useCount ascending, then least recently used
      eligible.sort((a, b) => {
        if (a.useCount !== b.useCount) return a.useCount - b.useCount;
        if (!a.lastUsedAt) return -1;
        if (!b.lastUsedAt) return 1;
        return new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
      });
      return eligible[0];
    }

    // Fallback: if all topics are within cooldown, pick the least recently used
    allEnabled.sort((a, b) => {
      if (!a.lastUsedAt) return -1;
      if (!b.lastUsedAt) return 1;
      return new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
    });
    return allEnabled[0];
  }

  public count(): number {
    const res = this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM topics');
    return res?.count ?? 0;
  }

  public delete(id: string): boolean {
    const res = this.db.run('DELETE FROM topics WHERE id = ?', [id]);
    return Number(res.changes) > 0;
  }
}
