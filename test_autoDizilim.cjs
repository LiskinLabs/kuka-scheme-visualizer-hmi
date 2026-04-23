const fs = require('fs');
const path = require('path');
const vm = require('vm');


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


const sandbox = {
    HmiApp: null,
    module: { exports: {} },
    window: { addEventListener: () => {} },
    document: {
        getElementById: () => ({ oninput: null }),
        querySelector: () => ({ style: { setProperty: () => {} } }),
        querySelectorAll: () => []
    },
    localStorage: {
        getItem: () => null,
        setItem: () => {}
    },
    navigator: {},
    setInterval: () => {},
    console: console
};

vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

const HmiApp = sandbox.HmiApp;

if (!HmiApp) {
    console.error('Failed to load HmiApp');
    process.exit(1);
}

const tests = [
    // Export mode
    { w: 900, l: 1000, isExport: 1, expected: 6 },
    { w: 900, l: 1100, isExport: 1, expected: 5 },
    { w: 200, l: 500,  isExport: 1, expected: 1 },

    // Domestic mode (isExport = 0)
    // w = 200
    { w: 200, l: 600,  isExport: 0, expected: 2 },
    { w: 200, l: 700,  isExport: 0, expected: 4 },

    // w = 300
    { w: 300, l: 600,  isExport: 0, expected: 3 },
    { w: 300, l: 2400, isExport: 0, expected: 4 },
    { w: 300, l: 2500, isExport: 0, expected: 1 },

    // w = 400
    { w: 400, l: 600,  isExport: 0, expected: 3 },
    { w: 400, l: 2400, isExport: 0, expected: 7 },
    { w: 400, l: 2500, isExport: 0, expected: 1 },

    // w = 500 or 600
    { w: 500, l: 600,  isExport: 0, expected: 3 },
    { w: 500, l: 700,  isExport: 0, expected: 1 },
    { w: 600, l: 600,  isExport: 0, expected: 3 },
    { w: 600, l: 700,  isExport: 0, expected: 1 },

    // w = 900
    { w: 900, l: 1000, isExport: 0, expected: 6 },
    { w: 900, l: 1100, isExport: 0, expected: 5 },

    // Default case
    { w: 100, l: 500,  isExport: 0, expected: 1 }
];

let failed = 0;
console.log('Running autoDizilim24050 tests...');

tests.forEach(({ w, l, isExport, expected }, index) => {
    const result = HmiApp.autoDizilim24050(w, l, isExport);
    if (result === expected) {
        console.log(`[PASS] Test ${index + 1}: w=${w}, l=${l}, isExport=${isExport} => ${result}`);
    } else {
        console.error(`[FAIL] Test ${index + 1}: w=${w}, l=${l}, isExport=${isExport} | Expected: ${expected}, Got: ${result}`);
        failed++;
    }
});

if (failed === 0) {
    console.log('\nAll tests passed successfully! ✅');
    process.exit(0);
} else {
    console.error(`\n${failed} tests failed! ❌`);
    process.exit(1);
}
