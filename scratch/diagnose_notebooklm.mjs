import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function diagnosePage() {
  const profileDir = path.resolve(
    process.env.USERPROFILE || 'C:\\Users\\bunkh',
    '.ben10fx',
    'browser-profile'
  );

  console.log('Launching browser with profile:', profileDir);
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1366, height: 900 }
  });

  const page = await context.newPage();
  const url = 'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa';
  console.log('Navigating to:', url);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  const title = await page.title();
  console.log('Current URL:', currentUrl);
  console.log('Page Title:', title);

  const screenshotPath = path.resolve(process.cwd(), 'storage', 'diagnose-notebooklm.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot saved to:', screenshotPath);

  // Print all visible button / tab text
  const buttons = await page.locator('button, [role="tab"], a').allInnerTexts();
  console.log('Visible clickable texts (sample 20):', buttons.slice(0, 20));

  await context.close();
}

diagnosePage().catch(console.error);
