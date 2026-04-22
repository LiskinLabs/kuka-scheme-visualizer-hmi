from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Abort slow external resources
        page.route("**/*", lambda route: route.abort() if any(domain in route.request.url for domain in [
            "fonts.googleapis.com", "cdnjs.cloudflare.com", "unpkg.com", "cdn.tailwindcss.com", "kit.fontawesome.com"
        ]) else route.continue_())

        cwd = os.getcwd()
        file_path = f"file://{cwd}/scheme_hmi_v3_industrial.html"

        print(f"Navigating to: {file_path}")
        page.goto(file_path, wait_until="commit")

        page.wait_for_timeout(2000)

        # Trigger manual mode and alignment
        page.evaluate("""() => {
            HmiApp.state.isManualMode = true;
            HmiApp.updateManualUI();
            HmiApp.state.manualPositions = [
                {n:1, x:0, y:0, angle:0, w:200, l:500},
                {n:2, x:100, y:100, angle:90, w:200, l:500},
                {n:3, x:200, y:200, angle:0, w:200, l:500}
            ];
            HmiApp.alignManualRadiators();
        }""")

        page.wait_for_timeout(1000)
        page.screenshot(path="verification/manual_alignment_verify.png", full_page=True)
        print("Screenshot saved to verification/manual_alignment_verify.png")
        browser.close()

if __name__ == "__main__":
    run()
