export interface ScheduleSlot {
  id: string;
  name: string;
  enabled: boolean;
  localTime: string; // HH:mm format e.g. "08:30"
  daysOfWeekJson: string; // JSON array of numbers e.g. "[1,2,3,4,5]"
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSlotDTO {
  id: string;
  name: string;
  enabled: boolean;
  localTime: string;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  createdAt: string;
  updatedAt: string;
}
