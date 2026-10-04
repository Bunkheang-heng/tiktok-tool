import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function runNotebookLmWorkflow() {
  const profileDir = path.resolve(
    process.env.USERPROFILE || 'C:\\Users\\bunkh',
    '.ben10fx',
    'browser-profile'
  );

  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  const downloadsDir = path.resolve(process.cwd(), 'storage', 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const targetFile = path.join(downloadsDir, 'notebooklm-video.mp4');

  console.log('============================================================');
  console.log('🤖 BEN10 FX: Automated Google NotebookLM Video Generator');
  console.log('Profile Path:', profileDir);
  console.log('Target Output:', targetFile);
  console.log('============================================================');

  let browserContext = null;
  let isCdp = false;

  // 1. Try connecting via CDP first if Chrome was started with debugging port
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 2000 });
    const contexts = browser.contexts();
    browserContext = contexts.length > 0 ? contexts[0] : await browser.newContext();
    isCdp = true;
    console.log('✅ Connected to existing Chrome instance via CDP (port 9222)!');
  } catch {
    console.log('Launching dedicated automation Chrome browser window...');
    browserContext = await chromium.launchPersistentContext(profileDir, {
      channel: 'chrome',
      headless: false,
      viewport: { width: 1366, height: 900 },
      acceptDownloads: true,
      args: ['--disable-blink-features=AutomationControlled']
    });
  }

  const page = await browserContext.newPage();
  const notebookUrl = 'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa';

  console.log(`[1/5] Navigating to Notebook: ${notebookUrl}`);
  await page.goto(notebookUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

  // 2. Check if Google Sign-in is needed
  if (page.url().includes('accounts.google.com') || page.url().includes('signin') || page.url().includes('ServiceLogin')) {
    console.log('\n============================================================');
    console.log('👉 ACTION REQUIRED IN BROWSER WINDOW:');
    console.log('   Please sign into your Google account (bunkheangheng99@gmail.com).');
    console.log('   Once you sign in, the tool will save your session permanently');
    console.log('   and you will never have to sign in again!');
    console.log('============================================================\n');

    await page.waitForURL((url) => url.toString().includes('notebook.google.com/notebook/'), {
      timeout: 180000 // 3 minutes for user to sign in
    });
    console.log('✅ Google sign-in detected successfully! Session saved.');
  }

  console.log('[2/5] Waiting for NotebookLM interface to load...');
  await page.waitForTimeout(3000);

  // Dismiss any welcome or cookie banners
  const dismissBtn = page.locator('button:has-text("Got it"), button:has-text("Dismiss"), button:has-text("I agree")').first();
  if (await dismissBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Dismissing welcome/banner modal...');
    await dismissBtn.click().catch(() => {});
  }

  console.log('[3/5] Locating and clicking "Studio" tab...');
  const studioTab = page.locator('text=Studio').or(page.locator('[role="tab"]:has-text("Studio")')).first();
  await studioTab.waitFor({ state: 'visible', timeout: 30000 });
  await studioTab.click();
  console.log('✅ Clicked Studio tab.');
  await page.waitForTimeout(2000);

  console.log('[4/5] Looking for Video Overview & Download button...');
  // Look for the More options (3 dots) button for Video Overview
  let moreBtn = page.locator('button[aria-label*="More options"], button[aria-label*="more_vert"], mat-icon:has-text("more_vert")').first();

  const isMoreVisible = await moreBtn.isVisible({ timeout: 5000 }).catch(() => false);

  if (!isMoreVisible) {
    const videoItem = page.locator('text=The Essentials of Trading and Market Mechanics').or(page.locator('text=Video Overview')).first();
    if (await videoItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Found video item, clicking to open player...');
      await videoItem.click();
      await page.waitForTimeout(2000);
      moreBtn = page.locator('button[aria-label*="More options"], mat-icon:has-text("more_vert")').first();
    }
  }

  await moreBtn.waitFor({ state: 'visible', timeout: 20000 });
  console.log('✅ Found More options (⋮) button. Clicking...');
  await moreBtn.click();
  await page.waitForTimeout(1000);

  // Click "Download" in menu
  console.log('[5/5] Clicking "Download" and capturing MP4 file...');
  const downloadItem = page.locator('button:has-text("Download"), [role="menuitem"]:has-text("Download"), span:has-text("Download")').first();
  await downloadItem.waitFor({ state: 'visible', timeout: 10000 });

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 180000 }),
    downloadItem.click()
  ]);

  console.log('📥 Download started! Receiving bytes from Google...');
  await download.saveAs(targetFile);

  const stats = fs.statSync(targetFile);
  console.log(`\n🎉 SUCCESS! Video successfully downloaded by automation!`);
  console.log(`   File: ${targetFile}`);
  console.log(`   Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

  if (!isCdp) {
    await browserContext.close();
  } else {
    await page.close();
  }
}

runNotebookLmWorkflow().catch((err) => {
  console.error('❌ Automation workflow error:', err);
  process.exit(1);
});
