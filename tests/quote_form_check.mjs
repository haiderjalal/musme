import fs from "node:fs";
import path from "node:path";
import { chromium } from "file:///C:/Users/PMYLS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const output = path.resolve("test-artifacts");
fs.mkdirSync(output, { recursive: true });

async function openQuote(page, label) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("http://127.0.0.1:3010", { waitUntil: "networkidle", timeout: 60000 });
  await page.locator("#quote").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(output, `${label}-quote-start.png`) });
  if (!(await page.getByRole("heading", { name: "Let's find the leverage." }).isVisible())) throw new Error("Quote heading is not visible");
  if (!(await page.getByText("What should we build or improve?").isVisible())) throw new Error("First quote step is not visible");
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  if (!fits) throw new Error(`Horizontal overflow on ${label}`);
  return errors;
}

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktop.route("**/api/quote", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  const desktopErrors = await openQuote(desktop, "desktop");
  await desktop.getByRole("button", { name: "Continue" }).click();
  if (!(await desktop.getByText("Choose at least one area to explore.").isVisible())) throw new Error("Validation message is missing");
  await desktop.getByRole("button", { name: "AI automation" }).click();
  await desktop.getByRole("button", { name: "Website", exact: true }).click();
  await desktop.getByRole("button", { name: "Continue" }).click();
  await desktop.getByLabel("Your name *").fill("Test Lead");
  await desktop.getByLabel("Work email *").fill("lead@example.com");
  await desktop.getByLabel("Company").fill("Example Company");
  await desktop.getByRole("button", { name: "Continue" }).click();
  await desktop.getByRole("button", { name: "$5k–$10k" }).click();
  await desktop.getByRole("button", { name: "Within a month" }).click();
  await desktop.getByRole("button", { name: "Continue" }).click();
  await desktop.getByLabel("Tell us about the challenge, the repetitive work, or the idea *").fill("Our team manually qualifies incoming requests and needs an automated workflow.");
  await desktop.screenshot({ path: path.join(output, "desktop-quote-brief.png") });
  await desktop.getByRole("button", { name: "Send my brief" }).click();
  await desktop.getByText("Brief received").waitFor({ state: "visible" });
  await desktop.screenshot({ path: path.join(output, "desktop-quote-success.png") });
  if (desktopErrors.length) throw new Error(`Desktop console errors: ${desktopErrors.join(" | ")}`);
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const mobileErrors = await openQuote(mobile, "mobile");
  if (!(await mobile.getByRole("button", { name: "AI automation" }).isVisible())) throw new Error("Mobile service selector is not visible");
  if (mobileErrors.length) throw new Error(`Mobile console errors: ${mobileErrors.join(" | ")}`);
  await mobile.close();
  console.log("Quote form checks passed for desktop and mobile.");
} finally {
  await browser.close();
}
