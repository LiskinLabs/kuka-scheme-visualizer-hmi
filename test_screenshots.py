import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Test Mobile
        context_mobile = await browser.new_context(
            viewport={"width": 375, "height": 812},
            device_scale_factor=2,
            is_mobile=True,
        )
        page_mobile = await context_mobile.new_page()
        page_mobile.on("console", lambda msg: print(f"Mobile log: {msg.text}"))
        await page_mobile.goto('file:///app/scheme_hmi_v3_industrial.html', wait_until="networkidle")

        # Turn on all dims to ensure worst-case UI bounds
        await page_mobile.evaluate("""() => {
            if (typeof HmiApp !== 'undefined') {
                HmiApp.state.showDimCenter = true;
                HmiApp.state.showDimEdges = true;
                HmiApp.state.showDimGap = true;
                HmiApp.calc();
            }
        }""")
        await page_mobile.wait_for_timeout(1000)
        await page_mobile.screenshot(path='/tmp/mobile.png')
        print("Mobile screenshot saved.")

        # Test Desktop
        context_desktop = await browser.new_context(
            viewport={"width": 1280, "height": 800},
        )
        page_desktop = await context_desktop.new_page()
        page_desktop.on("console", lambda msg: print(f"Desktop log: {msg.text}"))
        await page_desktop.goto('file:///app/scheme_hmi_v3_industrial.html', wait_until="networkidle")

        # Turn on all dims
        await page_desktop.evaluate("""() => {
            if (typeof HmiApp !== 'undefined') {
                HmiApp.state.showDimCenter = true;
                HmiApp.state.showDimEdges = true;
                HmiApp.state.showDimGap = true;
                HmiApp.calc();
            }
        }""")
        await page_desktop.wait_for_timeout(1000)
        await page_desktop.screenshot(path='/tmp/desktop.png')
        print("Desktop screenshot saved.")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
