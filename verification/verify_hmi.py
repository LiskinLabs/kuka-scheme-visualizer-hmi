from playwright.sync_api import sync_playwright
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.on('console', lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on('pageerror', lambda exc: print(f"ERROR: {exc}"))

        cwd = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = f"file://{cwd}/scheme_hmi_v3_industrial.html"
        print(f"Navigating to: {file_path}")

        # Block external resources to avoid timeout and ensure offline run
        page.route("**/*", lambda route: route.continue_() if not route.request.url.startswith("http") else route.abort())

        page.goto(file_path, wait_until="commit")
        page.wait_for_timeout(2000)

        # 1. Check Toggle All Layouts Button
        toggle_btn = page.locator("#btnToggleAll")
        toggle_btn.hover()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/screenshot_hover_toggle.png", full_page=True)

        # Click Toggle All Layouts
        toggle_btn.click()
        page.wait_for_timeout(1000)

        # Screenshot the All Layouts grid
        page.screenshot(path="verification/screenshot_all_layouts.png", full_page=True)

        # 2. Change Language to RU and check translations
        ru_btn = page.locator("#btnRU")
        ru_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/screenshot_ru_lang.png", full_page=True)

        # 3. Emulate print (just for coverage, we can't easily screenshot the actual print dialog but we can trigger it and ensure no crash)
        # We test the export function instead to ensure it doesn't crash
        page.evaluate("HmiApp.exportToImage()")
        page.wait_for_timeout(2000)

        print("Verification complete.")
        browser.close()

if __name__ == "__main__":
    run()
