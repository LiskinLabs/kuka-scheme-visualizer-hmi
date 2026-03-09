from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on('console', lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on('pageerror', lambda exc: print(f"ERROR: {exc}"))

    page.goto('file:///app/scheme_hmi_v3_industrial.html')
    time.sleep(2)
    page.screenshot(path='/tmp/error_check.png')
    browser.close()
