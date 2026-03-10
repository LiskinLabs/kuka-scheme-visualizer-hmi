from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = browser.new_page()

        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(err.message))

        page.goto("file:///app/scheme_hmi_v3_industrial.html", wait_until="networkidle")

        if errors:
            print("Errors found:")
            for e in errors:
                print(e)

        # Emulate print media
        page.emulate_media(media="print")

        # Trigger beforeprint logic manually since emulate_media doesn't fire it
        page.evaluate("() => { window.dispatchEvent(new Event('beforeprint')); }")

        # Take screenshot of print view
        page.screenshot(path="verification/print_view_final.png")
        print("Captured print_view_final.png")

        # Emulate show all layouts
        page.emulate_media(media="screen")
        page.evaluate("() => { window.dispatchEvent(new Event('afterprint')); }")
        page.evaluate("() => { HmiApp.toggleAllLayouts(); }")

        page.emulate_media(media="print")
        page.evaluate("() => { window.dispatchEvent(new Event('beforeprint')); }")
        page.screenshot(path="verification/print_all_view_final.png")
        print("Captured print_all_view_final.png")

        browser.close()

if __name__ == "__main__":
    main()
