from playwright.sync_api import sync_playwright, expect
import os

def verify_init_lengths(page):
    cwd = os.getcwd()
    file_path = f"file://{cwd}/scheme_hmi_v3_industrial.html"

    # Block external resources to avoid timeouts
    page.route("**/*", lambda route: route.continue_() if not route.request.url.startswith("http") else route.abort())

    page.goto(file_path, wait_until="commit")

    # Check the inL select element
    inL = page.locator("#inL")
    expect(inL).to_be_visible()

    # Count options - should be from 400 to 3000 inclusive, step 100
    # (3000 - 400) / 100 + 1 = 26 + 1 = 27 options
    options = inL.locator("option")
    expect(options).to_have_count(27)

    # Check first and last values using text_content or evaluate
    first_val = options.first.evaluate("el => el.value")
    last_val = options.last.evaluate("el => el.value")

    assert first_val == "400", f"Expected 400, got {first_val}"
    assert last_val == "3000", f"Expected 3000, got {last_val}"

    # Screenshot the top property bar
    page.locator("#top-property-bar").screenshot(path="verification/init_lengths_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_init_lengths(page)
            print("Frontend verification successful.")
        finally:
            browser.close()
