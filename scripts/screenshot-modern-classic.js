import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { webkit, devices } from 'playwright';

const LIVE_SITE = 'https://modernclassicbarbershop.com';
const OUTPUT_DIR = path.join(fileURLToPath(new URL('..', import.meta.url)), 'client-briefs', 'modern-classic', 'screenshots');
const DEVICE = devices['iPhone 14 Pro'];
const VIEWPORT = { width: 390, height: 844 };

const ARGV = process.argv.slice(2);
const ONLY_ARG = ARGV.find((arg) => arg.startsWith('--only='));
const ONLY_NAMES = ONLY_ARG
  ? ONLY_ARG
      .split('=')[1]
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  : null;

function shouldRun(name) {
  return !ONLY_NAMES || ONLY_NAMES.includes(name);
}

function getCredential(envName, promptText, { hidden = false } = {}) {
  const envValue = process.env[envName]?.trim();
  if (envValue) return envValue;
  return prompt(promptText, { hidden });
}

async function prompt(question, { hidden = false } = {}) {
  if (!process.stdin.isTTY || !process.stdout.isTTY || !hidden) {
    return promptVisible(question);
  }
  return promptHidden(question);
}

function promptVisible(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptHidden(question) {
  const stdin = process.stdin;
  const stdout = process.stdout;
  return new Promise((resolve, reject) => {
    const onData = (char) => {
      const str = String(char);
      switch (str) {
        case '\n':
        case '\r':
        case '\u0004': {
          stdout.write('\n');
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          resolve(value.trim());
          break;
        }
        case '\u0003': {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          reject(new Error('Aborted'));
          break;
        }
        case '\u007f': { // backspace
          if (value.length > 0) {
            value = value.slice(0, -1);
          }
          break;
        }
        default: {
          value += str;
          break;
        }
      }
    };

    let value = '';
    stdout.write(question);
    stdin.resume();
    stdin.setRawMode(true);
    stdin.on('data', onData);
  });
}

function screenshotFile(name) {
  return path.join(OUTPUT_DIR, `${name}.png`);
}

async function writeLog(message) {
  process.stdout.write(`${message}\n`);
}

async function captureScreenshot(page, name, options = {}) {
  const filePath = screenshotFile(name);
  await page.screenshot({
    path: filePath,
    fullPage: options.fullPage ?? true,
    clip: options.clip,
  });
  await writeLog(`✔ ${name} saved to ${filePath}`);
}

async function captureRoute(page, route, name, options = {}) {
  const url = `${LIVE_SITE}${route}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  if (options.waitFor) {
    await page.waitForSelector(options.waitFor, { timeout: options.timeout ?? 15000 });
  }
  await captureScreenshot(page, name, options.screenshot);
}

async function captureAdminRoute(page, route, name, waitFor, screenshotOptions = {}) {
  const url = `${LIVE_SITE}${route}`;
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (response && [401, 403].includes(response.status())) {
    throw new Error('Admin auth failed: invalid ADMIN_USER/ADMIN_PASS or prompt credentials.');
  }
  if (waitFor) {
    await page.waitForSelector(waitFor, { timeout: 30000 });
  }
  await captureScreenshot(page, name, screenshotOptions);
}

async function loginToBarberPortal(page, username, password) {
  await page.goto(`${LIVE_SITE}/barber/sign-in`, { waitUntil: 'domcontentloaded' });
  if (!username || !password) {
    throw new Error('Barber portal credentials are required for barber dashboard screenshots.');
  }
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Sign in")');

  const firstResult = await Promise.race([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).then(() => ({ type: 'nav' })).catch(() => null),
    page.waitForSelector('#signin-error:not([hidden])', { timeout: 20000 }).then(() => ({ type: 'error' })).catch(() => null),
  ]);

  if (!firstResult || firstResult.type === 'error' || page.url().includes('/barber/sign-in')) {
    throw new Error('Barber portal auth failed: invalid BARBER_USER/BARBER_PASS or prompt credentials.');
  }
}

async function captureCustomerScreenshots(browser) {
  const context = await browser.newContext({
    ...DEVICE,
    viewport: VIEWPORT,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const results = [];

  async function run(name, fn) {
    if (!shouldRun(name)) return;
    try {
      await fn(page);
      results.push({ name, ok: true });
    } catch (err) {
      results.push({ name, ok: false, error: err instanceof Error ? err.message : String(err) });
      await writeLog(`✖ ${name} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await run('homepage', async (page) => {
    await captureRoute(page, '/', 'customer-homepage', { waitFor: 'text=Book an Appointment' });
  });

  await run('booking-wizard-service-step', async (page) => {
    await captureRoute(page, '/book', 'booking-wizard-service-step', { waitFor: 'text=Choose a service' });
  });

  await run('booking-wizard-date-time-step', async (page) => {
    await page.goto(`${LIVE_SITE}/book`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Choose a service', { timeout: 15000 });
    await page.locator('.bw-step:has-text("Choose a service") .bw-card').first().click();
    await page.waitForSelector('text=Choose your barber', { timeout: 15000 });
    await page.locator('.bw-step:has-text("Choose your barber") .bw-card').first().click();
    await page.waitForSelector('text=Pick a date and time', { timeout: 15000 });
    await captureScreenshot(page, 'booking-wizard-date-time-step');
  });

  await run('booking-wizard-book-ahead-picker', async (page) => {
    await page.goto(`${LIVE_SITE}/book`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Choose a service', { timeout: 15000 });
    await page.locator('.bw-step:has-text("Choose a service") .bw-card').first().click();
    await page.waitForSelector('text=Choose your barber', { timeout: 15000 });
    await page.locator('.bw-step:has-text("Choose your barber") .bw-card').first().click();
    await page.waitForSelector('text=Pick a date and time', { timeout: 15000 });
    await page.waitForSelector('text=Book Ahead', { timeout: 15000 });
    await captureScreenshot(page, 'booking-wizard-book-ahead-picker');
  });

  await run('booking-wizard-confirm-step', async (page) => {
    await page.goto(`${LIVE_SITE}/book`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Choose a service', { timeout: 15000 });
    await page.locator('.bw-step:has-text("Choose a service") .bw-card').first().click();
    await page.waitForSelector('text=Choose your barber', { timeout: 15000 });
    await page.locator('.bw-step:has-text("Choose your barber") .bw-card').first().click();
    await page.waitForSelector('text=Pick a date and time', { timeout: 15000 });
    const slot = page.locator('.bw-slot:not([disabled])').first();
    await slot.waitFor({ timeout: 20000 });
    await slot.click();
    await page.waitForSelector('text=Your details', { timeout: 15000 });
    await page.fill('#bw-given', 'Test');
    await page.fill('#bw-family', 'Visitor');
    await page.fill('#bw-email', 'test+modernclassic@example.com');
    await page.fill('#bw-phone', '(555) 555-5555');
    await page.fill('#bw-note', 'Booking flow screenshot');
    await page.click('button:has-text("Review booking")');
    await page.waitForSelector('text=Confirm your booking', { timeout: 20000 });
    await captureScreenshot(page, 'booking-wizard-confirm-step');
  });

  await run('gallery', async (page) => {
    await captureRoute(page, '/gallery', 'gallery', {
      waitFor: 'h1#gallery-heading',
      timeout: 30000,
      screenshot: {
        fullPage: false,
        clip: { x: 0, y: 0, width: VIEWPORT.width, height: 2000 },
      },
    });
  });

  await run('reviews', async (page) => {
    await captureRoute(page, '/#reviews', 'reviews', { waitFor: 'text=Reviews' });
  });

  await context.close();
  return results;
}

async function captureAdminScreenshots(browser, adminCredentials) {
  const contextOptions = {
    ...DEVICE,
    viewport: VIEWPORT,
    isMobile: true,
    hasTouch: true,
  };
  if (adminCredentials.username && adminCredentials.password) {
    contextOptions.httpCredentials = {
      username: adminCredentials.username,
      password: adminCredentials.password,
    };
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const results = [];

  async function run(name, route, waitFor, options = {}) {
    if (!shouldRun(name)) return;
    try {
      await captureAdminRoute(page, route, name, waitFor, options.screenshot);
      results.push({ name, ok: true });
    } catch (err) {
      results.push({ name, ok: false, error: err instanceof Error ? err.message : String(err) });
      await writeLog(`✖ ${name} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await run('admin-overview', '/admin', 'text=Admin');
  await run('admin-todays-bookings', '/admin/today', 'text=Today', {
    screenshot: {
      fullPage: false,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: 2000 },
    },
  });
  await run('admin-no-show-charge-workflow', '/admin/bookings', 'text=Bookings');
  await run('admin-waitlist', '/admin/waitlist', 'text=Waitlist');

  await context.close();
  return results;
}

async function captureBarberScreenshots(browser, barberCredentials) {
  const context = await browser.newContext({
    ...DEVICE,
    viewport: VIEWPORT,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const results = [];

  async function run(name, fn) {
    if (!shouldRun(name)) return;
    try {
      await fn(page);
      results.push({ name, ok: true });
    } catch (err) {
      results.push({ name, ok: false, error: err instanceof Error ? err.message : String(err) });
      await writeLog(`✖ ${name} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await run('barber-dashboard-home', async (page) => {
    await loginToBarberPortal(page, barberCredentials.username, barberCredentials.password);
    await page.waitForSelector('text=Appointments', { timeout: 20000 }).catch(() => {});
    await captureScreenshot(page, 'barber-dashboard-home');
  });

  await run('barber-daily-schedule', async (page) => {
    await page.goto(`${LIVE_SITE}/barber/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Appointments', { timeout: 20000 }).catch(() => {});
    await captureScreenshot(page, 'barber-daily-schedule');
  });

  await run('barber-account', async (page) => {
    await page.goto(`${LIVE_SITE}/barber/account`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Account', { timeout: 15000 }).catch(() => {});
    await captureScreenshot(page, 'barber-account');
  });

  await context.close();
  return results;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const browser = await webkit.launch({ headless: true });

  const adminUsername = await getCredential('ADMIN_USER', 'Admin username: ');
  const adminPassword = await getCredential('ADMIN_PASS', 'Admin password: ', { hidden: true });
  const barberUsername = await getCredential('BARBER_USER', 'Barber portal username: ');
  const barberPassword = await getCredential('BARBER_PASS', 'Barber portal password: ', { hidden: true });

  const customerResults = await captureCustomerScreenshots(browser);
  const adminResults = await captureAdminScreenshots(browser, { username: adminUsername, password: adminPassword });
  const barberResults = await captureBarberScreenshots(browser, { username: barberUsername, password: barberPassword });

  await browser.close();

  const allResults = [...customerResults, ...adminResults, ...barberResults];
  const failed = allResults.filter((r) => !r.ok);

  await writeLog('\nScreenshot run complete.');
  await writeLog(`Saved screenshots to ${OUTPUT_DIR}`);
  if (failed.length === 0) {
    await writeLog('All screenshots completed successfully.');
    process.exit(0);
  }

  await writeLog(`${failed.length} screenshot task(s) failed:`);
  for (const result of failed) {
    await writeLog(`- ${result.name}: ${result.error}`);
  }
  process.exit(1);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
