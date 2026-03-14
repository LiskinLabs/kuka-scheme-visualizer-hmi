from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_feature(page: Page):
  # Use localhost
  url = "http://localhost:8000/scheme_hmi_v3_industrial.html"
  print(f"Loading {url}")

  # Block EVERYTHING external to avoid timeouts
  def handle_route(route):
      url = route.request.url
      if "localhost" in url:
          route.continue_()
      else:
          route.abort()

  page.route("**/*", handle_route)

  page.goto(url, wait_until="commit", timeout=5000)
  page.wait_for_timeout(1000)

  # Check Width Dropdown in desktop view
  page.wait_for_selector("#inW", state="attached", timeout=5000)
  page.screenshot(path="/home/jules/verification/verification_desktop.png")
  page.wait_for_timeout(500)

  # Check #inW options
  widths = page.eval_on_selector("#inW", "el => Array.from(el.options).map(o => o.value)")
  print(f"Main Width options: {widths}")

  page.wait_for_timeout(1000)

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Desktop view
    context = browser.new_context(record_video_dir="/home/jules/verification/video")
    page = context.new_page()
    try:
      verify_feature(page)
    finally:
      context.close()
      browser.close()

  # Mobile view verification in a separate session/video
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    iphone_13 = p.devices['iPhone 13']
    context = browser.new_context(**iphone_13, record_video_dir="/home/jules/verification/video")
    page = context.new_page()
    try:
        # Re-apply routing
        def handle_route(route):
            url = route.request.url
            if "localhost" in url:
                route.continue_()
            else:
                route.abort()
        page.route("**/*", handle_route)

        page.goto("http://localhost:8000/scheme_hmi_v3_industrial.html", wait_until="commit", timeout=5000)
        page.wait_for_timeout(1000)

        # Click mobile fab to show bottom sheet
        page.click("#mobile-fab")
        page.wait_for_timeout(1000)

        page.screenshot(path="/home/jules/verification/verification_mobile.png")
        page.wait_for_timeout(1000)
    finally:
        context.close()
        browser.close()
