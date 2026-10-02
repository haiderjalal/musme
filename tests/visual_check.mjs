import path from "node:path";
import fs from "node:fs";
import { chromium } from "file:///C:/Users/PMYLS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const output = path.resolve("test-artifacts");
fs.mkdirSync(output, { recursive: true });

async function inspect(page, label) {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("http://127.0.0.1:3010", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(output, `${label}-hero.png`) });

  if (!(await page.getByRole("heading", { name: "Less busywork. More business." }).isVisible())) {
    throw new Error(`Hero heading is not visible on ${label}`);
  }
  if (!(await page.getByRole("link", { name: /Start a project/ }).first().isVisible())) {
    throw new Error(`Primary action is not visible on ${label}`);
  }
  if (!(await page.locator("canvas").isVisible())) {
    throw new Error(`WebGL canvas is not visible on ${label}`);
  }
  if (!(await page.locator(".site-nav .brand-mark").isVisible())) {
    throw new Error(`Header logo is not visible on ${label}`);
  }
  if ((await page.locator(".sector-image img").count()) !== 1) {
    throw new Error(`Sector image did not render on ${label}`);
  }
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  if (hasOverflow) throw new Error(`Horizontal overflow detected on ${label}`);

  if ((await page.locator(".project-slide").count()) !== 4) {
    throw new Error(`Project showcase is incomplete on ${label}`);
  }
  if ((await page.locator(".project-detail a[target='_blank']").count()) !== 4) {
    throw new Error(`Project links are incomplete on ${label}`);
  }

  await page.evaluate(() => {
    const scroller = document.querySelector(".projects-scroll");
    if (!scroller) return;
    const top = scroller.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "instant" });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(output, `${label}-projects-start.png`) });

  if ((await page.viewportSize()).width > 780) {
    await page.evaluate(() => {
      const scroller = document.querySelector(".projects-scroll");
      if (!scroller) return;
      const top = scroller.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + scroller.clientHeight * 0.72, behavior: "instant" });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(output, `${label}-projects-end.png`) });
  }

  await page.locator("#capabilities").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(output, `${label}-capabilities.png`) });
  if ((await page.locator(".capability-panel").count()) !== 4) {
    throw new Error(`Capability panels are incomplete on ${label}`);
  }

  await page.locator("#industries").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(output, `${label}-industries.png`) });
  if (!(await page.getByRole("heading", { name: "More time for care." }).isVisible())) {
    throw new Error(`Healthcare story is not visible on ${label}`);
  }
  if (!(await page.getByRole("heading", { name: "Service that starts before the table." }).isVisible())) {
    throw new Error(`Restaurant story is not visible on ${label}`);
  }

  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(output, `${label}-footer.png`) });
  if (!(await page.locator(".site-footer .brand-mark").isVisible())) {
    throw new Error(`Footer logo is not visible on ${label}`);
  }

  if (consoleErrors.length) {
    throw new Error(`Browser console errors on ${label}: ${consoleErrors.join(" | ")}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await inspect(desktop, "desktop");
    await desktop.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await inspect(mobile, "mobile");
    await mobile.close();

    console.log("Visual checks passed for desktop and mobile.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
