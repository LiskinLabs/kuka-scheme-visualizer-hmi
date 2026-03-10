from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = browser.new_page()

        page.goto("file:///app/scheme_hmi_v3_industrial.html", wait_until="networkidle")

        page.emulate_media(media="print")
        page.evaluate("() => { window.dispatchEvent(new Event('beforeprint')); }")

        print_block_display = page.evaluate("() => { let el = document.querySelector('.print-data-block'); return el ? window.getComputedStyle(el).display : 'Not Found'; }")
        print("print-data-block display:", print_block_display)

        rad_bg = page.evaluate("() => { let el = document.querySelector('.rad'); return el ? window.getComputedStyle(el).backgroundImage : 'Not Found'; }")
        print("rad background-image:", rad_bg)

        dim_text = page.evaluate("() => { let el = document.querySelector('.dim-text'); return el ? window.getComputedStyle(el).color : 'Not Found'; }")
        print("dim-text color:", dim_text)

        browser.close()

if __name__ == "__main__":
    main()
