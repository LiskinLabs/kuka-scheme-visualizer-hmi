from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    cwd = os.getcwd()
    file_path = f"file://{cwd}/scheme_hmi_v3_industrial.html"

    # Block external resources
    page.route("**/*", lambda route: route.continue_() if not route.request.url.startswith("http") else route.abort())

    page.goto(file_path, wait_until="commit")
    page.wait_for_timeout(1000)

    # 1. Desktop verification
    # Ensure dropdowns are populated
    inW_count = page.evaluate("document.getElementById('inW').options.length")
    inL_count = page.evaluate("document.getElementById('inL').options.length")
    print(f"Desktop inW options: {inW_count}, inL options: {inL_count}")

    page.screenshot(path="/home/jules/verification/screenshots/desktop_populated.png")
    page.wait_for_timeout(500)

    # 2. Mobile verification
    # Set viewport to mobile size
    page.set_viewport_size({"width": 375, "height": 812})
    page.wait_for_timeout(500)

    # Click FAB to open bottom sheet
    page.click("#mobile-fab")
    page.wait_for_timeout(1000)

    m_inW_count = page.evaluate("document.getElementById('m-inW').options.length")
    m_inL_count = page.evaluate("document.getElementById('m-inL').options.length")
    print(f"Mobile m-inW options: {m_inW_count}, m-inL options: {m_inL_count}")

    page.screenshot(path="/home/jules/verification/screenshots/mobile_populated.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
