import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function testSignInAndAutomation() {
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
  console.log('🚀 BEN10 FX: Automated NotebookLM Studio Downloader');
  console.log('Profile Path:', profileDir);
  console.log('Target Output:', targetFile);
  console.log('============================================================');

  console.log('Launching Chrome automation window...');
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1366, height: 900 },
    acceptDownloads: true,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = await context.newPage();
  const notebookUrl = 'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa';

  console.log(`[1/5] Navigating to: ${notebookUrl}`);
  await page.goto(notebookUrl, { timeout: 45000 });

  // Wait 4 seconds for any redirects to settle
  await page.waitForTimeout(4000);
  console.log('Current URL after initial load:', page.url());

  // Check if redirected to Google sign-in
  if (page.url().includes('accounts.google.com') || page.url().includes('signin')) {
    console.log('\n============================================================');
    console.log('👉 GOOGLE LOGIN REQUIRED:');
    console.log('   Please log into bunkheangheng99@gmail.com in the Chrome window.');
    console.log('   (You only need to do this ONCE. Session will be saved forever)');
    console.log('============================================================\n');

    // Wait up to 5 minutes for user to finish signing in
    await page.waitForURL(
      (url) => {
        return !url.hostname.includes('accounts.google.com') &&
               (url.hostname.includes('notebook.google.com') || url.hostname.includes('notebooklm.google.com'));
      },
      { timeout: 300000 }
    );
    console.log('🎉 Login detected! Current URL:', page.url());
    await page.waitForTimeout(3000);
  }

  // Ensure we are on the target notebook
  if (!page.url().includes('2419265c-bfcb-4dfa-9ee8-52ad6926b5fa')) {
    console.log('Navigating directly to target notebook...');
    await page.goto(notebookUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }

  console.log('[2/5] Waiting for NotebookLM interface...');
  await page.waitForTimeout(4000);

  // Dismiss any "Got it" / welcome modal
  const dismissBtn = page.locator('button:has-text("Got it"), button:has-text("Dismiss"), button:has-text("I agree")').first();
  if (await dismissBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Dismissing welcome banner...');
    await dismissBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  console.log('[3/5] Locating and clicking "Studio" tab...');
  const studioTab = page
    .locator('button:has-text("Studio")')
    .or(page.locator('[role="tab"]:has-text("Studio")'))
    .or(page.locator('text=Studio'))
    .first();
  await studioTab.waitFor({ state: 'visible', timeout: 30000 });
  await studioTab.click();
  console.log('✅ Clicked Studio tab.');
  await page.waitForTimeout(2500);

  console.log('[4/5] Finding Video Overview item and More options (⋮) menu...');
  let moreBtn = page
    .locator('button[aria-label*="More options"], button[aria-label*="more_vert"], mat-icon:has-text("more_vert")')
    .first();

  const isMoreVisible = await moreBtn.isVisible({ timeout: 5000 }).catch(() => false);

  if (!isMoreVisible) {
    const videoItem = page
      .locator('text=The Essentials of Trading and Market Mechanics')
      .or(page.locator('text=Video Overview'))
      .first();

    if (await videoItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Clicking video card to open player...');
      await videoItem.click();
      await page.waitForTimeout(2500);
      moreBtn = page.locator('button[aria-label*="More options"], mat-icon:has-text("more_vert")').first();
    }
  }

  await moreBtn.waitFor({ state: 'visible', timeout: 20000 });
  console.log('✅ Found More options (⋮) button. Clicking...');
  await moreBtn.click();
  await page.waitForTimeout(1000);

  console.log('[5/5] Clicking "Download" and intercepting MP4 stream...');
  const downloadItem = page
    .locator('button:has-text("Download"), [role="menuitem"]:has-text("Download"), span:has-text("Download")')
    .first();
  await downloadItem.waitFor({ state: 'visible', timeout: 10000 });

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 180000 }),
    downloadItem.click()
  ]);

  console.log('📥 Download in progress... Streaming to disk...');
  await download.saveAs(targetFile);

  const stats = fs.statSync(targetFile);
  console.log('\n============================================================');
  console.log('🎉 100% AUTOMATED DOWNLOAD COMPLETE!');
  console.log(`   Saved to: ${targetFile}`);
  console.log(`   File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log('============================================================\n');

  await context.close();
}

testSignInAndAutomation().catch((err) => {
  console.error('❌ Error during automation:', err);
  process.exit(1);
});
