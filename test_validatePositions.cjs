const fs = require('fs');
const vm = require('vm');

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

function testValidatePositions() {
    console.log("Starting tests for HmiApp.validatePositions...");

    let passed = 0;
    let failed = 0;

    function assertNull(input, name) {
        const result = HmiApp.validatePositions(input);
        if (result === null) {
            console.log(`[PASS] ${name} returned null`);
            passed++;
        } else {
            console.error(`[FAIL] ${name} expected null, got ${JSON.stringify(result)}`);
            failed++;
        }
    }

    // Edge cases
    assertNull(null, "Input null");
    assertNull(undefined, "Input undefined");
    assertNull("not an array", "Input string");
    assertNull(123, "Input number");
    assertNull({}, "Input object");

    // Valid array cases
    function assertValid(input, expectedStr, name) {
        const result = HmiApp.validatePositions(input);
        const resultStr = JSON.stringify(result);
        if (resultStr === expectedStr) {
            console.log(`[PASS] ${name} returned correct array`);
            passed++;
        } else {
            console.error(`[FAIL] ${name} mismatch: Expected ${expectedStr}, got ${resultStr}`);
            failed++;
        }
    }

    assertValid(
        [{n: 1, x: 10, y: 20, angle: 90}],
        JSON.stringify([{n: 1, x: 10, y: 20, angle: 90}]), // w and l become undefined which JSON.stringify drops
        "Valid minimal array"
    );

    assertValid(
        [{n: 1, x: 10, y: 20, angle: 90, w: 200, l: 500}],
        JSON.stringify([{n: 1, x: 10, y: 20, angle: 90, w: 200, l: 500}]),
        "Valid full array"
    );

    assertValid(
        [{n: 1, x: 10, y: 20, angle: 90}, {invalid: true}, {n: 2, x: 30, y: 40, angle: 0}],
        JSON.stringify([{n: 1, x: 10, y: 20, angle: 90}, {n: 2, x: 30, y: 40, angle: 0}]),
        "Array with mixed valid and invalid elements"
    );


    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
        process.exit(1);
    }
}

testValidatePositions();
