from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Determine the absolute path to the HTML file
        cwd = os.getcwd()
        file_path = f"file://{cwd}/scheme_hmi_v3_industrial.html"

        print(f"Navigating to: {file_path}")
        page.goto(file_path)

        # Wait for the page to render (init js)
        page.wait_for_timeout(1000)

        # Take a screenshot of the full page
        page.screenshot(path="verification/screenshot.png", full_page=True)
        print("Screenshot saved to verification/screenshot.png")

        browser.close()

if __name__ == "__main__":
    run()
