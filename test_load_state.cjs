const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Mock storage for localStorage
let store = {};
const mockLocalStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
};

// Mock elements for HmiApp.dom
const mockElements = {
    projectSelect: { value: '' },
    inW: { value: '' },
    inL: { value: '' },
    gapW: { value: '' },
    gapH: { value: '' }
};

// Mock document
const mockDocument = {
    getElementById: (id) => mockElements[id] || null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, appendChild: () => {}, onclick: null }),
    body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }
};

const mockWindow = {
    onload: null,
    location: { href: '' }
};

const code = fs.readFileSync('production_metrics.js', 'utf8');

function createSandbox() {
    store = {};
    Object.keys(mockElements).forEach(k => mockElements[k].value = '');

    const context = vm.createContext({
        window: mockWindow,
        document: mockDocument,
        localStorage: mockLocalStorage,
        console: console,
        setTimeout: setTimeout,
        setInterval: setInterval,
        parseInt: parseInt,
        Math: Math,
        Number: Number,
        Object: Object
    });

    // Evaluate script
    vm.runInContext(code, context);

    let HmiApp = context.HmiApp;
    if (!HmiApp) {
        HmiApp = vm.runInContext('HmiApp', context);
    }

    // Explicitly set dom mock to avoid crashing
    HmiApp.dom = mockElements;

    // Need a config structure for selectProject validation
    HmiApp.config = {
        projects: {
            "projA": {},
            "projB": {}
        }
    };

    return { HmiApp, context };
}

console.log("Setting up sandbox for test_load_state.cjs...");
createSandbox();
console.log("Sandbox initialized successfully.");


let testsRun = 0;
let testsPassed = 0;

function runTest(name, testFn) {
    testsRun++;
    console.log(`Running: ${name}`);
    try {
        testFn();
        console.log(`✅ Passed: ${name}`);
        testsPassed++;
    } catch (e) {
        console.error(`❌ Failed: ${name}`);
        console.error(`   ${e.message}`);
    }
}

// 1. Happy path
runTest("Happy Path - Loads valid state", () => {
    const { HmiApp } = createSandbox();
    const validState = {
        width: 300,
        length: 500,
        gapW: 50,
        gapH: 100,
        dizilimId: 2,
        currentProject: "projA",
        isDualPallet: true,
        isManualMode: true,
        showDimCenter: true,
        showDimGap: false,
        showDimEdges: true,
        exportMode: 1,
        isLightTheme: true,
        palOverrideX: 1000,
        palOverrideY: 2000
    };

    mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify(validState));
    HmiApp.loadState();

    assert.strictEqual(HmiApp.state.width, 300);
    assert.strictEqual(HmiApp.state.length, 500);
    assert.strictEqual(HmiApp.state.gapW, 50);
    assert.strictEqual(HmiApp.state.gapH, 100);
    assert.strictEqual(HmiApp.state.dizilimId, 2);
    assert.strictEqual(HmiApp.state.currentProject, "projA");
    assert.strictEqual(HmiApp.state.isDualPallet, true);
    assert.strictEqual(HmiApp.state.isManualMode, true);
    assert.strictEqual(HmiApp.state.showDimCenter, true);
    assert.strictEqual(HmiApp.state.showDimGap, false);
    assert.strictEqual(HmiApp.state.showDimEdges, true);
    assert.strictEqual(HmiApp.state.exportMode, 1);
    assert.strictEqual(HmiApp.state.isLightTheme, true);
    assert.strictEqual(HmiApp.state.palOverrideX, 1000);
    assert.strictEqual(HmiApp.state.palOverrideY, 2000);

    // Check DOM updates
    assert.strictEqual(HmiApp.dom.projectSelect.value, "projA");
    assert.strictEqual(HmiApp.dom.inW.value, 300);
    assert.strictEqual(HmiApp.dom.inL.value, 500);
    assert.strictEqual(HmiApp.dom.gapW.value, 50);
    assert.strictEqual(HmiApp.dom.gapH.value, 100);
});

// 2. Invalid JSON handling
runTest("Invalid JSON in localStorage doesn't crash", () => {
    const { HmiApp } = createSandbox();

    // Save initial state to ensure it doesn't change
    const initialWidth = HmiApp.state.width;

    mockLocalStorage.setItem('kuka_hmi_state', "{ invalid json ");

    // This should not throw
    assert.doesNotThrow(() => {
        HmiApp.loadState();
    });

    // State should be untouched
    assert.strictEqual(HmiApp.state.width, initialWidth);
});

// 3. Null or non-object handling
runTest("Null or non-object in localStorage is ignored", () => {
    const { HmiApp } = createSandbox();

    const initialWidth = HmiApp.state.width;

    mockLocalStorage.setItem('kuka_hmi_state', "null");
    HmiApp.loadState();
    assert.strictEqual(HmiApp.state.width, initialWidth);

    mockLocalStorage.setItem('kuka_hmi_state', '"string"');
    HmiApp.loadState();
    assert.strictEqual(HmiApp.state.width, initialWidth);
});

// 4. Out of range values
runTest("Out of range values are ignored", () => {
    const { HmiApp } = createSandbox();

    // Save initial states
    const initW = HmiApp.state.width;
    const initL = HmiApp.state.length;
    const initDiz = HmiApp.state.dizilimId;
    const initExport = HmiApp.state.exportMode;
    const initPalX = HmiApp.state.palOverrideX;

    const invalidState = {
        width: 100, // < 200
        length: 4000, // > 3000
        dizilimId: 20, // > 12
        exportMode: 5, // not 0 or 1
        palOverrideX: 6000 // > 5000
    };

    mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify(invalidState));
    HmiApp.loadState();

    assert.strictEqual(HmiApp.state.width, initW, "Width should not update if out of range");
    assert.strictEqual(HmiApp.state.length, initL, "Length should not update if out of range");
    assert.strictEqual(HmiApp.state.dizilimId, initDiz, "dizilimId should not update if out of range");
    assert.strictEqual(HmiApp.state.exportMode, initExport, "exportMode should not update if out of range");
    assert.strictEqual(HmiApp.state.palOverrideX, initPalX, "palOverrideX should not update if out of range");
});

// 5. GapH Edge case (0 < gapH < 50 => 200)
runTest("gapH edge case logic works", () => {
    const { HmiApp } = createSandbox();

    // Test a gapH between 0 and 50
    mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify({ gapH: 25 }));
    HmiApp.loadState();

    assert.strictEqual(HmiApp.state.gapH, 200, "gapH between 0 and 50 should be adjusted to 200");

    // Test gapH = 0
    mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify({ gapH: 0 }));
    HmiApp.loadState();
    assert.strictEqual(HmiApp.state.gapH, 0, "gapH = 0 should be kept as 0");

    // Test gapH >= 50
    mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify({ gapH: 50 }));
    HmiApp.loadState();
    assert.strictEqual(HmiApp.state.gapH, 50, "gapH = 50 should be kept as 50");
});

// 6. Unknown project handling
runTest("Unknown project is ignored", () => {
    const { HmiApp } = createSandbox();

    const initProject = HmiApp.state.currentProject;

    mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify({ currentProject: "nonExistentProject" }));
    HmiApp.loadState();

    assert.strictEqual(HmiApp.state.currentProject, initProject, "Unknown project should not be loaded");
});

// 7. Validate positions tests
runTest("Positions validation", () => {
    const { HmiApp } = createSandbox();

    const validPositions = [{n: 1, x: 0, y: 0, angle: 0, w: undefined, l: undefined}, {n: 2, x: 100, y: 100, angle: 90, w: undefined, l: undefined}];
    const invalidPositions = [{x: 0}, {y: 100}];

    // Mock validatePositions behavior if it isn't robust enough
    // But testing the existing code as-is:

    mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify({ manualPositions: validPositions }));
    HmiApp.loadState();
    // Since deepStrictEqual struggles with explicit undefined properties vs implicit missing ones
    assert.strictEqual(HmiApp.state.manualPositions.length, 2);
    assert.strictEqual(HmiApp.state.manualPositions[0].n, 1);
    assert.strictEqual(HmiApp.state.manualPositions[0].x, 0);
    assert.strictEqual(HmiApp.state.manualPositions[1].angle, 90);

    // Setup clean state
    HmiApp.state.manualPositions = [];

    mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify({ manualPositions: invalidPositions }));
    HmiApp.loadState();

    // In production_metrics.js:
    // const valid = this.validatePositions(p.manualPositions);
    // if (valid) this.state.manualPositions = valid;
    // validatePositions returns valid array or false

    // Check if it was handled properly (either unmodified [] or rejected by validatePositions)
    assert.strictEqual(HmiApp.state.manualPositions.length === 0, true, "Invalid positions should be rejected");
});


console.log(`\nTest Summary: ${testsPassed}/${testsRun} passed.`);
if (testsPassed !== testsRun) {
    process.exit(1);
} else {
    process.exit(0);
}
