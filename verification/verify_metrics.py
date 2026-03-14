from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Block external resources that might cause timeouts
        page.route("**/*", lambda route: route.abort() if any(domain in route.request.url for domain in ["fonts.googleapis.com", "cdnjs.cloudflare.com", "unpkg.com", "cdn.tailwindcss.com", "kit.fontawesome.com", "ka-f.fontawesome.com"]) else route.continue_())

        # Determine the absolute path to the HTML file
        cwd = os.path.dirname(os.path.abspath(__file__))
        if cwd.endswith('verification'):
            cwd = os.path.dirname(cwd)
        file_path = f"file://{cwd}/scheme_hmi_v3_industrial.html"

        print(f"Navigating to: {file_path}")
        try:
            page.goto(file_path, wait_until="commit")

            # Wait for the page to render (init js)
            page.wait_for_timeout(1000)

            # Take a screenshot of the full page
            page.screenshot(path="verification/screenshot.png", full_page=True, animations="disabled")
            print("Screenshot saved to verification/screenshot.png")
        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
