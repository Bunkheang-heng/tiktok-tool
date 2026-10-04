import { chromium } from 'playwright';
import path from 'node:path';

async function testLaunch() {
  const profileDir = path.resolve(process.cwd(), 'storage', 'chrome-automation-profile');
  console.log('Launching browser with profile:', profileDir);

  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  console.log('Navigating to NotebookLM...');
  await page.goto('https://notebooklm.google.com/', { waitUntil: 'domcontentloaded' });
  console.log('Page Title:', await page.title());
  console.log('Current URL:', page.url());

  // Wait 5 seconds to observe login state
  await page.waitForTimeout(5000);
  await context.close();
  console.log('Finished test launch successfully!');
}

testLaunch().catch(console.error);
