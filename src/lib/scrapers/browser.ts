import { chromium, Browser, BrowserContext } from "playwright";

let browserInstance: Browser | null = null;

const LAUNCH_ARGS = [
  "--disable-dev-shm-usage",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-blink-features=AutomationControlled",
];

const STEALTH_SCRIPT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'languages', { get: () => ['pt-PT', 'pt', 'en'] });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  window.chrome = { runtime: {} };
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) =>
    parameters.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission })
      : originalQuery(parameters);
`;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) return browserInstance;
  if (browserInstance) {
    try { await browserInstance.close(); } catch {}
    browserInstance = null;
  }

  browserInstance = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: LAUNCH_ARGS,
  });
  return browserInstance;
}

export async function applyStealthScripts(context: BrowserContext): Promise<void> {
  await context.addInitScript(STEALTH_SCRIPT);
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    try {
      // Close all contexts first to release pages
      const contexts = browserInstance.contexts();
      for (const ctx of contexts) {
        try { await ctx.close(); } catch {}
      }
      await browserInstance.close();
    } catch {}
    browserInstance = null;
  }
}
