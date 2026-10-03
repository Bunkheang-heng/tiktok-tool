import { contextBridge, ipcRenderer } from 'electron';

export const API = {
  // Dashboard
  getDashboardState: () => ipcRenderer.invoke('dashboard:get-state'),

  // Jobs
  getJobs: (options?: { limit?: number; offset?: number }) =>
    ipcRenderer.invoke('jobs:get-all', options),
  getJobDetails: (jobId: string) => ipcRenderer.invoke('jobs:get-by-id', jobId),
  generateNow: () => ipcRenderer.invoke('jobs:trigger-generate-now'),
  retryJob: (jobId: string) => ipcRenderer.invoke('jobs:retry', jobId),
  resendToTelegram: (jobId: string) => ipcRenderer.invoke('jobs:resend-telegram', jobId),
  openJobFolder: (jobId: string) => ipcRenderer.invoke('jobs:open-folder', jobId),

  // Schedule
  getScheduleSlots: () => ipcRenderer.invoke('schedule:get-slots'),
  updateScheduleSlot: (id: string, updates: any) =>
    ipcRenderer.invoke('schedule:update-slot', id, updates),
  addScheduleSlot: (slot: any) => ipcRenderer.invoke('schedule:add-slot', slot),
  deleteScheduleSlot: (id: string) => ipcRenderer.invoke('schedule:delete-slot', id),

  // Topics
  getTopics: (filter?: any) => ipcRenderer.invoke('topics:get-all', filter),
  addTopic: (topic: any) => ipcRenderer.invoke('topics:add', topic),
  updateTopic: (id: string, updates: any) => ipcRenderer.invoke('topics:update', id, updates),
  deleteTopic: (id: string) => ipcRenderer.invoke('topics:delete', id),
  pinTopic: (id: string, pinned: boolean) => ipcRenderer.invoke('topics:set-pinned', id, pinned),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: any) => ipcRenderer.invoke('settings:update', settings),
  testTelegram: () => ipcRenderer.invoke('settings:test-telegram'),

  // Logs
  getRecentLogs: (limit?: number) => ipcRenderer.invoke('logs:get-recent', limit),
  openLogFolder: () => ipcRenderer.invoke('logs:open-folder')
};

contextBridge.exposeInMainWorld('api', API);
