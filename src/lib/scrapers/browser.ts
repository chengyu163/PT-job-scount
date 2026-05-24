import { chromium, Browser } from "playwright";

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance?.isConnected()) return browserInstance;
  browserInstance = await chromium.launch({ headless: true });
  return browserInstance;
}

export async function getStealthBrowser(): Promise<Browser> {
  // Stealth plugin doesn't work reliably in Next.js server environment.
  // Falls back to regular browser with realistic user-agent.
  return getBrowser();
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
