const fs = require('fs');

const utilsCode = fs.readFileSync('js/utils.js', 'utf8').replace('export const utils', 'const utils');
const configCode = fs.readFileSync('js/config.js', 'utf8').replace('export const config', 'const config');
const stateCode = fs.readFileSync('js/state.js', 'utf8').replace('export const state', 'const state');
const stateMethodsCode = fs.readFileSync('js/stateMethods.js', 'utf8').replace('export const stateMethods', 'const stateMethods');
const layoutCode = fs.readFileSync('js/layout.js', 'utf8').replace('export const layout', 'const layout');
const renderCode = fs.readFileSync('js/render.js', 'utf8').replace('export const render', 'const render');
const eventsCode = fs.readFileSync('js/events.js', 'utf8').replace('export const events', 'const events');
const uiCode = fs.readFileSync('js/ui.js', 'utf8').replace('export const ui', 'const ui');
const appCode = fs.readFileSync('js/app.js', 'utf8')
    .replace(/import .*/g, '')
    .replace('export default HmiApp;', '');

const scriptCode = [
    utilsCode, configCode, stateCode, stateMethodsCode,
    layoutCode, renderCode, eventsCode, uiCode, appCode
].join('\n\n');
    if (scriptCode.includes('sX = Math.max(0.05, (areaW - extraPxX) / (maxExtentX * 2))')) {
    console.log("Clamp is implemented correctly.");
} else {
    console.log("Clamp check failed.");
}
