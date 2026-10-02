import path from "node:path";
import fs from "node:fs";
import { chromium } from "file:///C:/Users/PMYLS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const projects = [
  ["pak-tribal-furniture", "https://paktribalfurniture.com/"],
  ["optisource-pk", "https://www.optisourcepk.com/"],
  ["divers-optics", "https://www.diversoptics.com/"],
  ["bubish", "https://bubish.vercel.app/"],
];

const output = path.resolve("public/images/projects");
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const [slug, url] of projects) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 960 },
      deviceScaleFactor: 1,
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(4500);
    const details = await page.evaluate(() => ({
      title: document.title,
      heading: document.querySelector("h1")?.textContent?.trim() ?? "",
      description:
        document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      url: window.location.href,
    }));
    await page.screenshot({
      path: path.join(output, `${slug}.png`),
      fullPage: false,
    });
    console.log(JSON.stringify({ slug, ...details }));
    await page.close();
  }
} finally {
  await browser.close();
}
