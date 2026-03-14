from playwright.sync_api import sync_playwright
import os

def test_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Block external resources
        page.route("**/*", lambda route: route.abort() if any(domain in route.request.url for domain in ["fonts.googleapis.com", "cdnjs.cloudflare.com", "unpkg.com", "cdn.tailwindcss.com", "kit.fontawesome.com", "ka-f.fontawesome.com"]) else route.continue_())

        # We need to serve the directory first, or use file:///
        pwd = os.getcwd()
        page.goto(f"file://{pwd}/scheme_hmi_v3_industrial.html", wait_until="commit")
        page.wait_for_timeout(1000)

        # Click the Radiator accordion to toggle it
        # Note: the text is "Radiator", but the icon is inside it
        radiator_header = page.locator(".accordion-header:has-text('Radiator')")

        # Verify initial state
        aria_expanded = radiator_header.get_attribute("aria-expanded")
        print(f"Initial aria-expanded: {aria_expanded}")

        # Take screenshot of initial state
        page.screenshot(path="verification/initial_state.png", animations="disabled")

        # Click it to close
        radiator_header.click()
        page.wait_for_timeout(500) # wait for animation/js

        # Verify new state
        aria_expanded = radiator_header.get_attribute("aria-expanded")
        print(f"After click aria-expanded: {aria_expanded}")

        # Take screenshot of closed state
        page.screenshot(path="verification/closed_state.png", animations="disabled")

        # Click it again using keyboard
        radiator_header.focus()
        page.keyboard.press("Enter")
        page.wait_for_timeout(500)

        aria_expanded = radiator_header.get_attribute("aria-expanded")
        print(f"After keyboard Enter aria-expanded: {aria_expanded}")

        browser.close()

if __name__ == "__main__":
    test_ui()
