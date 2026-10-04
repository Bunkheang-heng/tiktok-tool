import { chromium } from 'playwright';

async function testRealProfile() {
  const profileDir = 'C:\\Users\\bunkh\\AppData\\Local\\Google\\Chrome\\User Data';
  console.log('Testing launch with real profile:', profileDir);

  try {
    const context = await chromium.launchPersistentContext(profileDir, {
      channel: 'chrome',
      headless: false,
      args: ['--profile-directory=Default']
    });

    const page = await context.newPage();
    await page.goto('https://notebook.google.com/', { waitUntil: 'domcontentloaded' });
    console.log('Page Title:', await page.title());
    console.log('URL:', page.url());
    await page.waitForTimeout(3000);
    await context.close();
    console.log('SUCCESS with real profile!');
  } catch (err) {
    console.log('Profile lock error:', err.message);
  }
}

testRealProfile().catch(console.error);
