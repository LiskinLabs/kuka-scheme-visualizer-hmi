const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Mock browser environment
const mockDom = {};
const mockWindow = {
    onload: null,
    location: { href: '' }
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

const code = fs.readFileSync('production_metrics.js', 'utf8');
// Use var instead of const to expose HmiApp to the vm context
const scriptCode = code.replace('const HmiApp =', 'var HmiApp =');

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
