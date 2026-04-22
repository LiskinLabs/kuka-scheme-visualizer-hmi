const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('production_metrics.js', 'utf8');

// Mock browser environment
const mockDocument = {
    getElementById: (id) => ({
        value: '',
        textContent: '',
        style: { setProperty: () => {} },
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        appendChild: () => {},
        innerHTML: ''
    }),
    querySelector: (selector) => ({
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        style: { setProperty: () => {} }
    }),
    querySelectorAll: (selector) => [],
    createElement: (tag) => ({ appendChild: () => {}, style: {} }),
    body: { appendChild: () => {} }
};

const mockWindow = {
    addEventListener: () => {},
    onload: null
};

const mockLocalStorage = {
    getItem: () => null,
    setItem: () => {}
};

const sandbox = {
    window: mockWindow,
    document: mockDocument,
    localStorage: mockLocalStorage,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    parseInt: parseInt,
    Math: Math,
    Number: Number,
    Object: Object
};

vm.createContext(sandbox);
vm.runInContext(code, sandbox);

let HmiApp = sandbox.HmiApp;
if (!HmiApp) {
    HmiApp = vm.runInContext('HmiApp', sandbox);
}

// Global test setup
HmiApp.render = () => { HmiApp.renderCalled = true; };
HmiApp.state.width = 400;
HmiApp.state.length = 600;
HmiApp.state.gapW = 50;
HmiApp.state.gapH = 200;
HmiApp.state.isManualMode = true;

function runTest(name, positions, expected) {
    console.log(`Running test: ${name}`);
    HmiApp.state.manualPositions = JSON.parse(JSON.stringify(positions));
    HmiApp.renderCalled = false;

    HmiApp.alignManualRadiators();

    const actual = HmiApp.state.manualPositions;
    let failed = false;

    if (actual.length !== expected.length) {
        console.error(`❌ Length mismatch: expected ${expected.length}, got ${actual.length}`);
        failed = true;
    } else {
        expected.forEach((exp, i) => {
            const act = actual[i];
            if (act.x !== exp.x || act.y !== exp.y || act.n !== exp.n) {
                console.error(`❌ Position ${i} mismatch: expected x=${exp.x},y=${exp.y},n=${exp.n}; got x=${act.x},y=${act.y},n=${act.n}`);
                failed = true;
            }
        });
    }

    if (!HmiApp.renderCalled) {
        console.error('❌ Render was not called');
        failed = true;
    }

    if (failed) {
        process.exit(1);
    } else {
        console.log('✅ Passed');
    }
}

// Test 1: Single element
runTest('Single element edge case',
    [{ n: 99, x: 500, y: 500, angle: 0, w: 400, l: 600 }],
    [{ x: 0, y: 0, n: 1 }]
);

// Test 2: Two elements on the same row (Y difference <= 50)
runTest('Two elements same row',
    [
        { n: 1, x: -100, y: 10, angle: 0, w: 400, l: 600 },
        { n: 2, x: 100, y: 0, angle: 0, w: 400, l: 600 }
    ],
    [
        { x: -225, y: 0, n: 1 }, // totalW = 400 + 50 + 400 = 850. curX = -425. p1.x = -425 + 200 = -225. p2.x = -225 + 200 + 50 + 200 = 225.
        { x: 225, y: 0, n: 2 }
    ]
);

// Test 3: Two elements on different rows (Y difference > 50)
// Higher Y comes first in arr.sort((a, b) => b.y - a.y)
runTest('Two elements different rows',
    [
        { n: 1, x: 0, y: 100, angle: 0, w: 400, l: 600 },
        { n: 2, x: 0, y: 0, angle: 0, w: 400, l: 600 }
    ],
    [
        { x: 0, y: 400, n: 1 }, // totalH = 600 + 200 + 600 = 1400. curY = 700. row1.y = 700 - 300 = 400. row2.y = 400 - 300 - 200 - 300 = -400.
        { x: 0, y: -400, n: 2 }
    ]
);
