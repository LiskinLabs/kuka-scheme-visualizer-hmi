from playwright.sync_api import sync_playwright
import time

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox", "--disable-setuid-sandbox"], headless=True)
        page = browser.new_page()

        page.goto("file:///app/scheme_hmi_v3_industrial.html", wait_until="networkidle")
        time.sleep(1) # wait for js calculations

        # Manually inject css to force everything into print mode visual style for normal rendering
        # This will prove if our CSS rules actually work to turn everything b&w
        page.add_style_tag(content="""
            * { transition: none !important; animation: none !important; box-shadow: none !important; }
            body { background: white !important; color: black !important; }
            #toolbar, #topBar, #rightPanel, #leftPanel, #schemes-tabs, #minimapContainer { display: none !important; }
            .rad, .rad-24050 {
                background-color: white !important;
                background-image: none !important;
                border: 1px solid black !important;
            }
            .dim-text, .dim-line, .center-mark { color: black !important; border-color: black !important; background-color: white !important; }
            .center-mark { background-color: black !important; }
            .print-data-block { display: block !important; border: 2px solid black !important; color: black !important; }
        """)

        page.screenshot(path="verification/print_forced_css.png")
        print("Captured forced CSS screenshot.")

        browser.close()

if __name__ == "__main__":
    main()
