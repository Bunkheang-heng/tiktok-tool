import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';
import { Scheduler } from '../../core/scheduling/Scheduler';

export class TrayManager {
  private tray: Tray | null = null;

  constructor(
    private mainWindow: BrowserWindow,
    private scheduler: Scheduler
  ) {}

  public init(): void {
    // Create a 16x16 or 32x32 clean tray icon dynamically with a colored canvas/buffer if file doesn't exist
    const icon = this.createTrayIcon();
    this.tray = new Tray(icon);
    this.tray.setToolTip('Ben10 FX Content Automation');

    this.updateMenu();

    this.tray.on('double-click', () => {
      this.showWindow();
    });
  }

  public updateMenu(): void {
    if (!this.tray) return;

    const upcoming = this.scheduler.getNextUpcomingSlot();
    const isRunning = this.scheduler.isRunning();
    const nextTimeStr = upcoming ? upcoming.nextRun.toLocaleTimeString() : 'None scheduled';

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Ben10 FX Automation', enabled: false },
      { type: 'separator' },
      { label: `Status: ${isRunning ? 'Active Running' : 'Paused'}`, enabled: false },
      { label: `Next Job: ${nextTimeStr}`, enabled: false },
      { type: 'separator' },
      {
        label: 'Open Dashboard',
        click: () => this.showWindow()
      },
      {
        label: 'Generate Now',
        click: async () => {
          try {
            await this.scheduler.triggerGenerateNow();
          } catch (e) {
            console.error('Tray Generate Now error:', e);
          }
        }
      },
      { type: 'separator' },
      isRunning
        ? {
            label: 'Pause Automation',
            click: () => {
              this.scheduler.stop();
              this.updateMenu();
            }
          }
        : {
            label: 'Resume Automation',
            click: () => {
              this.scheduler.start();
              this.updateMenu();
            }
          },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private showWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  private createTrayIcon(): Electron.NativeImage {
    // 16x16 PNG buffer for tray icon
    // A clean green dot or trading icon representation
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      buffer[i * 4] = 16;     // R
      buffer[i * 4 + 1] = 185; // G (Teal/Emerald #10b981)
      buffer[i * 4 + 2] = 129; // B
      buffer[i * 4 + 3] = 255; // A
    }
    return nativeImage.createFromBuffer(buffer, { width: size, height: size });
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
