import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        page.on('console', lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on('pageerror', lambda err: print(f"PAGE ERROR: {err}"))

        await page.goto(f'file://{os.getcwd()}/scheme_hmi_v3_industrial.html')

        # Select 24050
        await page.select_option('#projectSelect', '24050')
        await page.wait_for_timeout(500)

        # Verify elements are hidden in auto mode
        panel_visible = await page.is_visible('#radPositionsPanel')
        btn_visible = await page.is_visible('#radPosResetBtn')
        pal_visible = await page.is_visible('#palletSizeControls')

        print(f"Auto mode 24050 - radPositionsPanel visible: {panel_visible}")
        print(f"Auto mode 24050 - radPosResetBtn visible: {btn_visible}")
        print(f"Auto mode 24050 - palletSizeControls visible: {pal_visible}")

        await page.screenshot(path='verification/24050_auto_mode.png', full_page=True)
        print("Screenshot saved to verification/24050_auto_mode.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
