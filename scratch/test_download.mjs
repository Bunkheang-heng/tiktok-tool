import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function main() {
  const profileDir = path.resolve('C:\\Users\\bunkh\\.ben10fx\\browser-profile');
  const targetDir = path.resolve('storage/test_output');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  const targetFile = path.join(targetDir, 'test_download.mp4');

  console.log('Testing download from existing notebook...');
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1366, height: 900 },
    acceptDownloads: true
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  await page.goto('https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa');
  await page.waitForTimeout(4000);

  const moreBtn = page.locator('button[aria-label="More"]').last();
  await moreBtn.waitFor({ state: 'visible', timeout: 20000 });
  console.log('Clicking More button...');
  await moreBtn.click();
  await page.waitForTimeout(1000);

  const downloadBtn = page.locator('button.mat-mdc-menu-item:has-text("Download"), [role="menuitem"]:has-text("Download")').first();
  await downloadBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Clicking Download menu item...');

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60000 }),
    downloadBtn.click()
  ]);

  console.log('Downloading file...');
  await download.saveAs(targetFile);
  const stats = fs.statSync(targetFile);
  console.log(`✅ Downloaded successfully! Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

  await context.close();
}

main().catch(err => {
  console.error('Download test error:', err);
  process.exit(1);
});
