import os
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on('console', lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on('pageerror', lambda exc: print(f"ERROR: {exc}"))

    # Block external resources that might cause timeouts
    page.route("**/*", lambda route: route.abort() if any(domain in route.request.url for domain in ["fonts.googleapis.com", "cdnjs.cloudflare.com", "unpkg.com"]) else route.continue_())

    try:
        page.goto(f'file://{os.path.dirname(os.path.abspath(__file__))}/scheme_hmi_v3_industrial.html', wait_until="commit")
        time.sleep(2)
        # Use omit_background=True or avoid waiting for fonts
        page.screenshot(path='error_check.png', animations="disabled")
    except Exception as e:
        print(f"Caught exception: {e}")
    finally:
        browser.close()
