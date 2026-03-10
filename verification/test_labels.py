from playwright.sync_api import sync_playwright

def test_labels():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        import os
        pwd = os.getcwd()
        page.goto(f"file://{pwd}/scheme_hmi_v3_industrial.html", wait_until="networkidle")

        # Check ARIA labels
        print("ARIA labels:")
        print("Auto Mode:", page.locator("#btnAutoMode").get_attribute("aria-label"))
        print("Manual Mode:", page.locator("#btnManualMode").get_attribute("aria-label"))
        print("Toggle All:", page.locator("#btnToggleAll").get_attribute("aria-label"))

        # Check 'for' attributes
        print("\nForm labels:")
        print("Project 'for' attribute:", page.locator("#lblProject").get_attribute("for"))
        print("Width 'for' attribute:", page.locator("#lblWidth").get_attribute("for"))
        print("Length 'for' attribute:", page.locator("#lblLength").get_attribute("for"))

        browser.close()

if __name__ == "__main__":
    test_labels()
