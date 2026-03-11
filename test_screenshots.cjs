const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();

  // Test Mobile
  const contextMobile = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const pageMobile = await contextMobile.newPage();

  await pageMobile.goto('file:///app/scheme_hmi_v3_industrial.html', { waitUntil: 'networkidle' });

  // Turn on all dims to ensure worst-case UI bounds
  await pageMobile.evaluate(() => {
    HmiApp.state.showDimCenter = true;
    HmiApp.state.showDimEdges = true;
    HmiApp.state.showDimGap = true;
    HmiApp.calc();
  });
  await pageMobile.waitForTimeout(500);

  await pageMobile.screenshot({ path: '/tmp/mobile.png' });
  console.log("Mobile screenshot saved.");

  // Test Desktop
  const contextDesktop = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto('file:///app/scheme_hmi_v3_industrial.html', { waitUntil: 'networkidle' });

  // Turn on all dims
  await pageDesktop.evaluate(() => {
    HmiApp.state.showDimCenter = true;
    HmiApp.state.showDimEdges = true;
    HmiApp.state.showDimGap = true;
    HmiApp.calc();
  });
  await pageDesktop.waitForTimeout(500);

  await pageDesktop.screenshot({ path: '/tmp/desktop.png' });
  console.log("Desktop screenshot saved.");

  await browser.close();
})();
