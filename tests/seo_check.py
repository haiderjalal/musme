from pathlib import Path
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:3011"
ROUTES = {
    "/": "Less busywork.",
    "/about": "AI should remove the busywork",
    "/services/ai-automation": "Turn repetitive work into a reliable system.",
    "/services/web-development": "Digital products built around the job",
    "/services/ai-content": "A repeatable content engine",
    "/case-studies": "Digital work shaped around real customer journeys.",
    "/contact": "Start with the problem, not the technology.",
}


def check_response(page, route: str, expected_text: str) -> None:
    response = page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
    assert response is not None and response.status == 200, f"{route} did not return 200"
    raw_html = response.text()
    assert expected_text in raw_html, f"{route} essential content missing from initial HTML"
    assert 'name="robots" content="noindex' not in raw_html.lower(), f"{route} contains noindex"
    assert 'rel="canonical"' in raw_html, f"{route} has no canonical URL"
    assert page.locator("h1").is_visible(), f"{route} has no visible H1"
    assert page.locator('script[type="application/ld+json"]').count() >= 1, f"{route} has no JSON-LD"


Path("test-artifacts").mkdir(exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    errors: list[str] = []
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    page = context.new_page()
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)

    for route, expected_text in ROUTES.items():
        check_response(page, route, expected_text)

    robots = context.request.get(f"{BASE_URL}/robots.txt")
    assert robots.status == 200
    assert "User-agent: OAI-SearchBot" in robots.text()
    assert "Sitemap: https://www.musme.co/sitemap.xml" in robots.text()

    sitemap = context.request.get(f"{BASE_URL}/sitemap.xml")
    assert sitemap.status == 200
    sitemap_text = sitemap.text()
    for route in ROUTES:
        expected_url = f"https://www.musme.co{route}"
        assert expected_url in sitemap_text, f"{expected_url} missing from sitemap"

    assert not errors, f"Browser console errors: {errors}"

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto(f"{BASE_URL}/services/ai-automation", wait_until="networkidle")
    assert mobile.locator("h1").is_visible()
    assert mobile.locator("body").evaluate("element => element.scrollWidth <= window.innerWidth")
    mobile.screenshot(path="test-artifacts/seo-mobile-ai-automation.png", full_page=True)

    browser.close()

print("SEO routes, initial HTML, metadata, crawler files, and mobile layout passed.")
