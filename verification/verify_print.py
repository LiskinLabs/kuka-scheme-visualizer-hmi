from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Block external requests
        page.route("**/*", lambda route: route.continue_() if not route.request.url.startswith("http") else route.abort())

        cwd = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = f"file://{cwd}/scheme_hmi_v3_industrial.html"

        page.goto(file_path, wait_until="commit")
        page.wait_for_timeout(2000)

        # Apply print media query to trigger the layout change and screenshot it
        page.emulate_media(media="print")
        page.wait_for_timeout(1000)

        # Take screenshot of the print emulation view
        page.screenshot(path="verification/screenshot_print_emulated.png", full_page=True)
        print("Emulated print mode screenshot captured.")

        browser.close()

if __name__ == "__main__":
    run()
