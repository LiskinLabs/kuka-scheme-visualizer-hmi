from playwright.sync_api import sync_playwright
import os
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        # Determine the absolute path to the HTML file
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = f"file://{root_dir}/scheme_hmi_v3_industrial.html"

        print(f"Navigating to: {file_path}")

        # Block external resources to avoid timeouts
        page.route("**/*.{woff,woff2,ttf,otf,eot}", lambda route: route.abort())
        page.route("https://fonts.googleapis.com/**", lambda route: route.abort())
        page.route("https://fonts.gstatic.com/**", lambda route: route.abort())
        page.route("https://cdnjs.cloudflare.com/**", lambda route: route.abort())
        page.route("https://cdn.tailwindcss.com/**", lambda route: route.abort())

        # Helper to test a gapH value
        def test_gaph(input_value, expected_value):
            # 1. Load the page once to set the origin for localStorage
            page.goto(file_path, wait_until="commit")

            # 2. Set localStorage with invalid gapH
            page.evaluate(f"""
                localStorage.setItem('kuka_hmi_state', JSON.stringify({{
                    gapH: {input_value},
                    width: 200,
                    length: 500
                }}));
            """)

            # 3. Reload the page to trigger loadState() during init
            page.reload(wait_until="commit")

            # Wait for HmiApp to initialize
            page.wait_for_function("typeof HmiApp !== 'undefined' && HmiApp.state", timeout=10000)

            # 4. Verify gapH
            actual_value = page.evaluate("HmiApp.state.gapH")

            if actual_value == expected_value:
                print(f"PASS: Input gapH={input_value} -> Result gapH={actual_value}")
            else:
                print(f"FAIL: Input gapH={input_value} -> Result gapH={actual_value} (Expected {expected_value})")
                exit(1)

        print("Running gapH edge case tests...")

        test_gaph(14, 200)
        test_gaph(49, 200)
        test_gaph(50, 50)
        test_gaph(100, 100)

        print("All gapH edge case tests passed!")
        browser.close()

if __name__ == "__main__":
    run()
