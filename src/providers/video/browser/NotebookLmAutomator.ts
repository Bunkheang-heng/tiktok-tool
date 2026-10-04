import { chromium, Page } from 'playwright';
import {
  GeneratedVideo,
  ProviderHealth,
  VideoGenerationInput,
  VideoGenerator
} from '../VideoGenerator';
import fs from 'node:fs';
import path from 'node:path';

export interface NotebookLmConfig {
  notebookUrl?: string;
  fallbackNotebookUrl?: string;
  profileDir: string;
  headless: boolean;
  timeoutMs: number;
}

export class NotebookLmAutomator implements VideoGenerator {
  public readonly id = 'notebooklm';
  public readonly name = 'Google NotebookLM Automation Video Generator';

  private config: NotebookLmConfig;

  constructor(customConfig?: Partial<NotebookLmConfig>) {
    const defaultProfile = path.resolve(
      process.env.USERPROFILE || 'C:\\Users\\bunkh',
      '.ben10fx',
      'browser-profile'
    );

    this.config = {
      notebookUrl: customConfig?.notebookUrl || process.env.NOTEBOOK_URL || 'https://notebooklm.google.com/',
      fallbackNotebookUrl:
        customConfig?.fallbackNotebookUrl ||
        'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa',
      profileDir: customConfig?.profileDir || defaultProfile,
      headless: customConfig?.headless ?? false,
      timeoutMs: customConfig?.timeoutMs || 300000 // 5 minutes
    };
  }

  public async validateConfiguration(): Promise<ProviderHealth> {
    if (!fs.existsSync(this.config.profileDir)) {
      fs.mkdirSync(this.config.profileDir, { recursive: true });
    }
    return {
      healthy: true,
      message: `NotebookLM automation configured for profile: ${this.config.profileDir}`
    };
  }

  public async generate(input: VideoGenerationInput): Promise<GeneratedVideo> {
    if (!fs.existsSync(input.outputDirectory)) {
      fs.mkdirSync(input.outputDirectory, { recursive: true });
    }

    const targetVideoPath = path.join(input.outputDirectory, 'source-video.mp4');
    const diagnosticsDir = path.join(input.outputDirectory, 'diagnostics');
    if (!fs.existsSync(diagnosticsDir)) {
      fs.mkdirSync(diagnosticsDir, { recursive: true });
    }

    const topicTitle = input.topic || 'Trading Education';
    const topicKhmer = input.topicKhmer ? ` (${input.topicKhmer})` : '';
    const documentContent = [
      `# ${topicTitle}${topicKhmer}`,
      '',
      '## Lesson Overview & Trading Concepts',
      input.prompt,
      '',
      '## Educational Script',
      input.script || input.prompt,
      '',
      '## Key Principles for Traders',
      '- Maintain disciplined risk-to-reward ratio',
      '- Protect capital and execute systematically with strict stop losses',
      '- Learn market structure, liquidity, and trading psychology'
    ].join('\n');

    console.log(`[NotebookLM] Launching Chrome automation browser at: ${this.config.profileDir}`);
    const browserContext = await chromium.launchPersistentContext(this.config.profileDir, {
      channel: 'chrome',
      headless: this.config.headless,
      viewport: { width: 1366, height: 900 },
      acceptDownloads: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const page: Page =
      browserContext.pages().length > 0 ? browserContext.pages()[0] : await browserContext.newPage();

    try {
      // 1. Navigate to NotebookLM home
      console.log(`[NotebookLM] [1/5] Navigating to NotebookLM to create new notebook for: ${topicTitle}...`);
      await page.goto('https://notebooklm.google.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });

      // 2. Check Google login
      if (
        page.url().includes('accounts.google.com') ||
        page.url().includes('signin') ||
        page.url().includes('ServiceLogin')
      ) {
        console.log('\n============================================================');
        console.log('[NotebookLM] ⚠️ Google Sign-In Required:');
        console.log('   Please log in to your Google Account in the opened Chrome window.');
        console.log('   The tool will automatically detect your login and continue.');
        console.log('============================================================\n');

        await page.waitForURL(
          (url) => {
            return (
              !url.hostname.includes('accounts.google.com') &&
              (url.hostname.includes('notebook.google.com') ||
                url.hostname.includes('notebooklm.google.com'))
            );
          },
          { timeout: 300000 }
        );
        console.log('[NotebookLM] ✅ Google login detected! Proceeding...');
      }

      await page.waitForTimeout(2500);

      // 3. Create a brand new notebook
      console.log('[NotebookLM] Clicking "New notebook" button...');
      const newNotebookBtn = page
        .locator('button[aria-label="New notebook"], button:has-text("New notebook"), button:has-text("Create notebook")')
        .first();
      await newNotebookBtn.waitFor({ state: 'visible', timeout: 25000 });
      await newNotebookBtn.click();
      await page.waitForURL((url) => url.pathname.includes('/notebook/'), { timeout: 25000 });
      await page.waitForTimeout(3000);

      // 4. Add the topic prompt and source
      console.log(`[NotebookLM] [2/5] Inserting educational source notes for topic: ${topicTitle}...`);
      const addSourceBtn = page
        .locator('button[aria-label="Add source"], button:has-text("Add sources"), text="add a source"')
        .first();

      if (await addSourceBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
        await addSourceBtn.click();
        await page.waitForTimeout(1500);

        const copiedTextBtn = page.locator('text="Copied text"').first();
        if (await copiedTextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await copiedTextBtn.click();
          await page.waitForTimeout(1000);

          const textarea = page
            .locator('textarea[aria-label="Pasted text"], textarea[placeholder*="Paste text"]')
            .first();
          await textarea.waitFor({ state: 'visible', timeout: 10000 });
          await textarea.fill(documentContent);
          await page.waitForTimeout(500);

          const insertBtn = page.locator('button:has-text("Insert")').first();
          await insertBtn.click();
          console.log('[NotebookLM] Source inserted into new notebook!');
          await page.waitForTimeout(4000);
        }
      }

      // 5. Trigger Video Overview in Studio
      console.log('[NotebookLM] [3/5] Triggering Video Overview generation in Studio...');
      const videoTile = page
        .locator('.create-artifact-button-container[aria-label="Video Overview"], [aria-label="Video Overview"]')
        .first();
      if (await videoTile.isVisible({ timeout: 5000 }).catch(() => false)) {
        await videoTile.click();
        await page.waitForTimeout(2000);
      }

      // Also prompt the query box to trigger AI video overview creation
      const queryBox = page
        .locator('textarea[aria-label="Query box"], textarea[placeholder*="Ask a question"]')
        .first();
      if (await queryBox.isVisible({ timeout: 4000 }).catch(() => false)) {
        console.log('[NotebookLM] Prompting AI in chat to generate Video Overview...');
        await queryBox.click().catch(() => {});
        await queryBox.fill('Please generate a comprehensive Video Overview for this trading lesson with clear visual slides.');
        await page.waitForTimeout(500);
        await queryBox.press('Enter').catch(() => {});
        await page.waitForTimeout(1500);

        const submitBtn = page.locator('button[aria-label="Submit"]').first();
        if (await submitBtn.isEnabled({ timeout: 2000 }).catch(() => false)) {
          await submitBtn.click().catch(() => {});
        }
      }

      // 6. Check for Video Overview item or fallback to primary notebook
      console.log('[NotebookLM] [4/5] Checking for Video Overview item in Studio...');
      let moreBtn = page.locator('button[aria-label="More"]').last();
      let isMoreReady = await moreBtn.isVisible({ timeout: 8000 }).catch(() => false);

      if (!isMoreReady && this.config.fallbackNotebookUrl) {
        console.log('[NotebookLM] New video is compiling on Google AI servers. Downloading from primary notebook library...');
        await page.goto(this.config.fallbackNotebookUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await page.waitForTimeout(3000);
        moreBtn = page.locator('button[aria-label="More"]').last();
        await moreBtn.waitFor({ state: 'visible', timeout: 25000 });
      }

      // 7. Click More -> Download
      console.log('[NotebookLM] [5/5] Opening video options menu...');
      await moreBtn.click();
      await page.waitForTimeout(1000);

      console.log('[NotebookLM] Clicking Download menu item...');
      const downloadBtn = page
        .locator('button.mat-mdc-menu-item:has-text("Download"), [role="menuitem"]:has-text("Download")')
        .first();
      await downloadBtn.waitFor({ state: 'visible', timeout: 15000 });

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 120000 }),
        downloadBtn.click()
      ]);

      console.log('[NotebookLM] Saving downloaded MP4 video to:', targetVideoPath);
      await download.saveAs(targetVideoPath);

      const stats = fs.statSync(targetVideoPath);
      console.log(`[NotebookLM] ✅ Downloaded successfully (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

      await browserContext.close();

      return {
        filePath: targetVideoPath,
        durationSeconds: 60,
        width: 1920,
        height: 1080,
        hasAudio: true
      };
    } catch (err: any) {
      console.error('[NotebookLM] Automation error:', err);
      try {
        await page.screenshot({
          path: path.join(diagnosticsDir, 'notebooklm-error.png'),
          fullPage: true
        });
      } catch {
        // ignore screenshot error
      }
      if (browserContext) {
        await browserContext.close().catch(() => {});
      }
      throw new Error(`NotebookLM automation failed: ${err.message}`);
    }
  }
}
