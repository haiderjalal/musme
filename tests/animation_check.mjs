import fs from "node:fs";
import path from "node:path";
import { chromium } from "file:///C:/Users/PMYLS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const output = path.resolve("test-artifacts");
fs.mkdirSync(output, { recursive: true });

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (overflow) throw new Error(`Horizontal overflow on ${label}`);
}

async function inspect(page, label) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("http://127.0.0.1:3010", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(output, `${label}-motion-hero.png`) });
  await assertNoOverflow(page, label);

  const stops = [
    ["#services", "services"],
    ["#work", "work"],
    ["#products", "products"],
    ["#industries", "industries"],
    ["#process", "process"],
    ["#faq", "faq"],
    ["#quote", "quote"],
  ];

  for (const [selector, name] of stops) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(850);
    if (!(await section.isVisible())) throw new Error(`${name} is not visible on ${label}`);
    await assertNoOverflow(page, `${label}-${name}`);
    if (["services", "work", "industries", "quote"].includes(name)) {
      await page.screenshot({ path: path.join(output, `${label}-motion-${name}.png`) });
    }
  }

  if ((await page.locator(".service-row").count()) !== 4) throw new Error("Service motion rows are incomplete");
  if ((await page.locator(".work-card").count()) !== 4) throw new Error("Work motion cards are incomplete");
  if ((await page.locator(".process-rows > li").count()) !== 4) throw new Error("Process motion rows are incomplete");
  if (errors.length) throw new Error(`Console errors on ${label}: ${errors.join(" | ")}`);
}

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await inspect(desktop, "desktop");
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await inspect(mobile, "mobile");
  await mobile.close();

  const reduced = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  await reduced.goto("http://127.0.0.1:3010", { waitUntil: "networkidle", timeout: 60000 });
  await reduced.locator("#quote").scrollIntoViewIfNeeded();
  await reduced.waitForTimeout(300);
  if (!(await reduced.locator(".quote-form").isVisible())) throw new Error("Quote form is hidden with reduced motion");
  await assertNoOverflow(reduced, "reduced-motion");
  await reduced.close();

  console.log("Site-wide motion checks passed for desktop, mobile, and reduced motion.");
} finally {
  await browser.close();
}
