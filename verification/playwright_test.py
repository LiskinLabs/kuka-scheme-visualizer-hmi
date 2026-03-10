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

        # Click Manual Mode
        await page.click('#btnManualMode')
        await page.wait_for_timeout(500)

        # Add radiator
        await page.fill('#manW', '300')
        await page.fill('#manL', '800')
        await page.click('#manualAddPanel button')
        await page.wait_for_timeout(500)

        # Screenshot
        await page.screenshot(path='verification/24050_manual_mode.png', full_page=True)
        print("Screenshot saved to verification/24050_manual_mode.png")

        # Rotate radiator
        await page.click('.rad-pos-angle span')
        await page.wait_for_timeout(500)
        await page.screenshot(path='verification/24050_manual_rotated.png', full_page=True)
        print("Screenshot saved to verification/24050_manual_rotated.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
