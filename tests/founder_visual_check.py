from pathlib import Path
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:3012/about"
Path("test-artifacts").mkdir(exist_ok=True)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    console_errors: list[str] = []

    desktop = browser.new_page(viewport={"width": 1440, "height": 1000})
    desktop.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    response = desktop.goto(BASE_URL, wait_until="networkidle")
    assert response is not None and response.status == 200

    founder = desktop.locator(".founder-section")
    founder.scroll_into_view_if_needed()
    desktop.wait_for_timeout(900)
    portrait = founder.locator("img")
    assert portrait.is_visible()
    assert portrait.evaluate("image => image.complete && image.naturalWidth > 1000")
    assert founder.get_by_role("heading", name="Haider Jalal").is_visible()
    assert founder.get_by_text("Founder · Musme").is_visible()
    founder.screenshot(path="test-artifacts/founder-desktop.png")

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto(BASE_URL, wait_until="networkidle")
    mobile_founder = mobile.locator(".founder-section")
    mobile_founder.scroll_into_view_if_needed()
    mobile.wait_for_timeout(900)
    assert mobile_founder.locator("img").is_visible()
    assert mobile_founder.get_by_role("heading", name="Haider Jalal").is_visible()
    assert mobile.locator("body").evaluate("element => element.scrollWidth <= window.innerWidth")
    mobile_founder.screenshot(path="test-artifacts/founder-mobile.png")

    reduced = browser.new_page(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    reduced.goto(BASE_URL, wait_until="networkidle")
    reduced_founder = reduced.locator(".founder-section")
    reduced_founder.scroll_into_view_if_needed()
    reduced.wait_for_timeout(800)
    transform = reduced.locator(".founder-portrait-media").evaluate("element => getComputedStyle(element).transform")
    assert transform in ("none", "matrix(1, 0, 0, 1, 0, 0)")

    assert not console_errors, f"Browser console errors: {console_errors}"
    browser.close()

print("Founder portrait passed desktop, mobile, reduced-motion, and console checks.")
