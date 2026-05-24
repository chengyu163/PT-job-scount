import { chromium, Browser } from "playwright";
import { chromium as chromiumExtra } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

chromiumExtra.use(StealthPlugin());

let browserInstance: Browser | null = null;
let stealthBrowserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance?.isConnected()) return browserInstance;
  browserInstance = await chromium.launch({ headless: true });
  return browserInstance;
}

export async function getStealthBrowser(): Promise<Browser> {
  if (stealthBrowserInstance?.isConnected()) return stealthBrowserInstance;
  stealthBrowserInstance = await chromiumExtra.launch({ headless: true });
  return stealthBrowserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
  if (stealthBrowserInstance) {
    await stealthBrowserInstance.close();
    stealthBrowserInstance = null;
  }
}
