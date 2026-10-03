import { app } from 'electron';

export class StartupManager {
  public static setStartWithWindows(enabled: boolean): void {
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: enabled,
        path: process.execPath,
        args: ['--autostart']
      });
    }
  }

  public static isStartWithWindowsEnabled(): boolean {
    if (!app.isPackaged) return false;
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  }
}
