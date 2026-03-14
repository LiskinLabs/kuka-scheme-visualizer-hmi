from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    # Emulate a mobile device
    iphone_13 = p.devices['iPhone 13']
    context = browser.new_context(**iphone_13)
    page = context.new_page()
    page.on('console', lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on('pageerror', lambda exc: print(f"ERROR: {exc}"))

    # Use localhost
    url = "http://localhost:8000/scheme_hmi_v3_industrial.html"
    print(f"Loading {url}")

    # Block EVERYTHING external
    def handle_route(route):
        url = route.request.url
        if "localhost" in url:
            route.continue_()
        else:
            route.abort()

    page.route("**/*", handle_route)

    try:
        page.goto(url, wait_until="commit", timeout=5000)
    except Exception as e:
        print(f"Navigation timed out or failed: {e}")

    # Give JS time to execute
    time.sleep(5)

    # Check #inW options (main dropdown, even if hidden on mobile, it should be in DOM)
    try:
        widths = page.eval_on_selector("#inW", "el => Array.from(el.options).map(o => o.value)")
        print(f"Main Width options: {widths}")
        expected_widths = ["200", "300", "400", "500", "600", "900"]
        if all(w in widths for w in expected_widths):
            print("SUCCESS: All expected main width options found.")
        else:
            print(f"FAILURE: Expected {expected_widths}, found {widths}")
    except Exception as e:
        print(f"Error checking #inW: {e}")

    # Toggle bottom sheet
    try:
        print("Attempting to click #mobile-fab")
        page.wait_for_selector("#mobile-fab", state="visible", timeout=5000)
        page.click("#mobile-fab")
        time.sleep(2)
        m_widths = page.eval_on_selector("#m-inW", "el => Array.from(el.options).map(o => o.value)")
        print(f"Mobile Width options: {m_widths}")
        if all(w in m_widths for w in expected_widths):
             print("SUCCESS: All expected mobile width options found.")
        else:
             print(f"FAILURE: Mobile width options incorrect. Found: {m_widths}")
    except Exception as e:
        print(f"Error checking mobile width: {e}")

    browser.close()
