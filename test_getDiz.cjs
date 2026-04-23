const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Mock browser environment
const mockDom = {};
const mockWindow = {
    onload: null,
    location: { href: '' },
    addEventListener: () => {}
};
const mockDocument = {
    getElementById: (id) => null,
    querySelectorAll: (selector) => [],
    createElement: (tag) => ({ style: {}, appendChild: () => {}, onclick: null }),
    body: { appendChild: () => {} }
};
const mockLocalStorage = {
    getItem: () => null,
    setItem: () => {}
};


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


const context = vm.createContext({
    window: mockWindow,
    document: mockDocument,
    localStorage: mockLocalStorage,
    console: console,
    setTimeout: setTimeout,
    setInterval: setInterval
});

vm.runInContext(scriptCode, context);
const HmiApp = context.HmiApp;

function testGetDiz() {
    console.log("Starting tests for HmiApp.getDiz...");

    const testCases = [
        // w = 200: (l <= 500 ? 2 : (l <= 800 ? 3 : 4))
        { w: 200, l: 400, expected: 2 },
        { w: 200, l: 500, expected: 2 },
        { w: 200, l: 501, expected: 3 },
        { w: 200, l: 800, expected: 3 },
        { w: 200, l: 801, expected: 4 },

        // w = 300: (l <= 500 ? 6 : (l <= 800 ? 7 : 8))
        { w: 300, l: 400, expected: 6 },
        { w: 300, l: 500, expected: 6 },
        { w: 300, l: 501, expected: 7 },
        { w: 300, l: 800, expected: 7 },
        { w: 300, l: 801, expected: 8 },

        // w = 400: (l <= 800 ? 9 : 10)
        { w: 400, l: 799, expected: 9 },
        { w: 400, l: 800, expected: 9 },
        { w: 400, l: 801, expected: 10 },

        // w = 500: (l <= 800 ? 9 : 10)
        { w: 500, l: 799, expected: 9 },
        { w: 500, l: 800, expected: 9 },
        { w: 500, l: 801, expected: 10 },

        // w = 600: (l <= 500 ? 12 : 10)
        { w: 600, l: 499, expected: 12 },
        { w: 600, l: 500, expected: 12 },
        { w: 600, l: 501, expected: 10 },

        // w = 900: (l == 400 ? 12 : (l <= 800 ? 11 : 10))
        { w: 900, l: 400, expected: 12 },
        { w: 900, l: 401, expected: 11 },
        { w: 900, l: 800, expected: 11 },
        { w: 900, l: 801, expected: 10 },

        // Default case
        { w: 700, l: 1000, expected: 10 },
        { w: 100, l: 500, expected: 10 }
    ];

    let passed = 0;
    testCases.forEach((tc, index) => {
        const result = HmiApp.getDiz(tc.w, tc.l);
        try {
            assert.strictEqual(result, tc.expected, `Test case ${index} failed: w=${tc.w}, l=${tc.l}. Expected ${tc.expected}, got ${result}`);
            passed++;
        } catch (e) {
            console.error(e.message);
        }
    });

    console.log(`Passed ${passed}/${testCases.length} tests.`);
    if (passed !== testCases.length) {
        process.exit(1);
    }
}

testGetDiz();
