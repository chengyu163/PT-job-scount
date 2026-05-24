import { chromium, Browser } from "playwright";

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) return browserInstance;
  // Force cleanup any leftover instance
  if (browserInstance) {
    try { await browserInstance.close(); } catch {}
    browserInstance = null;
  }
  browserInstance = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-gpu"],
  });
  return browserInstance;
}

export async function getStealthBrowser(): Promise<Browser> {
  return getBrowser();
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
