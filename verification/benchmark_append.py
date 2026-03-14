from playwright.sync_api import sync_playwright
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        cwd = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = f"file://{cwd}/scheme_hmi_v3_industrial.html"

        page.route("**/*", lambda route: route.continue_() if not route.request.url.startswith("http") else route.abort())
        page.goto(file_path, wait_until="networkidle")

        # Benchmark script
        benchmark_js = """
        () => {
            // In ES modules, top-level const is not attached to window automatically
            // But window.onload = () => HmiApp.init(); is at the end of the file.
            // If it's a module, HmiApp might not be global.

            let app = window.HmiApp;
            if (!app) {
               // Try to find it if it was somehow exposed
               app = typeof HmiApp !== 'undefined' ? HmiApp : null;
            }

            if (!app) {
                return "HmiApp NOT FOUND (even without window.)";
            }
            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                app.initLengths();
            }
            const end = performance.now();
            return (end - start) / iterations;
        }
        """

        result = page.evaluate(benchmark_js)
        if isinstance(result, str):
            print(result)
        else:
            print(f"BASELINE: Average execution time of initLengths: {result:.6f} ms")

        browser.close()

if __name__ == "__main__":
    run()
