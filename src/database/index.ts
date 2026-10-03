import { DatabaseClient } from './client/DatabaseClient';
import { JobRepository } from './repositories/JobRepository';
import { TopicRepository } from './repositories/TopicRepository';
import { ScheduleRepository } from './repositories/ScheduleRepository';
import { ContentRepository } from './repositories/ContentRepository';
import { EventRepository } from './repositories/EventRepository';
import { SettingRepository } from './repositories/SettingRepository';
import { DEFAULT_TOPICS } from './seeds/defaultTopics';
import path from 'node:path';

export interface DatabaseService {
  client: DatabaseClient;
  jobs: JobRepository;
  topics: TopicRepository;
  schedules: ScheduleRepository;
  contents: ContentRepository;
  events: EventRepository;
  settings: SettingRepository;
  seedIfEmpty(): void;
  close(): void;
}

export function createDatabaseService(dbPath: string = ':memory:'): DatabaseService {
  const client = new DatabaseClient(dbPath);
  client.runMigrations();

  const jobs = new JobRepository(client);
  const topics = new TopicRepository(client);
  const schedules = new ScheduleRepository(client);
  const contents = new ContentRepository(client);
  const events = new EventRepository(client);
  const settings = new SettingRepository(client);

  const seedIfEmpty = () => {
    // Seed default schedule slots if none exist
    schedules.seedDefaults();

    // Seed default topics if none exist
    if (topics.count() === 0) {
      for (const t of DEFAULT_TOPICS) {
        topics.create(t);
      }
    }
  };

  return {
    client,
    jobs,
    topics,
    schedules,
    contents,
    events,
    settings,
    seedIfEmpty,
    close: () => client.close()
  };
}

let defaultService: DatabaseService | null = null;

export function getDatabaseService(customDbPath?: string): DatabaseService {
  if (!defaultService) {
    const dbPath = customDbPath || path.resolve(process.cwd(), 'storage', 'ben10fx.db');
    defaultService = createDatabaseService(dbPath);
    defaultService.seedIfEmpty();
  }
  return defaultService;
}
