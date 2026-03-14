import os
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on('console', lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on('pageerror', lambda exc: print(f"ERROR: {exc}"))

    # Block external resources
    page.route("**/*", lambda route: route.continue_() if not route.request.url.startswith("http") else route.abort())

    page.goto(f'file://{os.path.dirname(os.path.abspath(__file__))}/scheme_hmi_v3_industrial.html', wait_until="commit")
    time.sleep(2)
    page.screenshot(path='error_check.png')
    browser.close()
