import os
from playwright.sync_api import sync_playwright

def test_translations(page):
    # Setup listeners for errors
    page.on('console', lambda msg: print(f"CONSOLE: {msg.text}") if msg.type == 'error' else None)
    page.on('pageerror', lambda err: print(f"PAGE ERROR: {err}"))

    # Block external domains that might timeout
    page.route("**/*", lambda route: route.continue_() if "fonts.googleapis.com" not in route.request.url and "cdnjs.cloudflare.com" not in route.request.url and "cdn.tailwindcss.com" not in route.request.url else route.abort())

    print("Loading page...")
    # Load the local HTML file
    file_path = f"file://{os.path.abspath('scheme_hmi_v3_industrial.html')}"
    page.goto(file_path, wait_until="load")

    print("Setting language to Russian (ru)...")
    # Click RU button
    page.click("id=btnRU")
    page.wait_for_timeout(500)
    page.screenshot(path="verification/screenshot_ru.png")

    print("Setting language to Turkish (tr)...")
    # Click TR button
    page.click("id=btnTR")
    page.wait_for_timeout(500)
    page.screenshot(path="verification/screenshot_tr.png")

    print("Setting language to Uzbek (uz)...")
    # Click UZ button
    page.click("id=btnUZ")
    page.wait_for_timeout(500)
    page.screenshot(path="verification/screenshot_uz.png")

    print("Screenshots taken successfully.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        try:
            test_translations(page)
        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()
