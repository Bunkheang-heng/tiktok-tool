export type TopicCategory =
  | 'Beginner'
  | 'Technical Analysis'
  | 'Risk Management'
  | 'Psychology'
  | 'Macro';

export interface Topic {
  id: string;
  title: string;
  khmerTitle: string;
  category: TopicCategory | string;
  enabled: boolean;
  useCount: number;
  lastUsedAt: string | null;
  cooldownDays: number;
  pinnedForNext: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopicSelectionResult {
  topic: Topic;
  reason: 'pinned' | 'scheduled_rotation' | 'manual_override';
}
