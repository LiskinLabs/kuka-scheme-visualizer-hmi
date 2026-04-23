const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('production_metrics.js', 'utf8');

let lastSetItemKey = null;
let lastSetItemValue = null;
let shouldThrow = false;

// Mock browser environment
const mockDocument = {
    getElementById: () => null,
    querySelector: () => ({
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        style: { setProperty: () => {} }
    }),
    querySelectorAll: () => [],
    createElement: () => ({ appendChild: () => {}, style: {} }),
    body: { appendChild: () => {} }
};

const mockWindow = {
    addEventListener: () => {},
    onload: null,
    innerWidth: 1000,
    innerHeight: 1000
};

const mockLocalStorage = {
    getItem: () => null,
    setItem: (key, value) => {
        if (shouldThrow) throw new Error("QuotaExceededError");
        lastSetItemKey = key;
        lastSetItemValue = value;
    }
};

const sandbox = {
    window: mockWindow,
    document: mockDocument,
    localStorage: mockLocalStorage,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
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

let failed = false;

console.log("Running test: saveState correctly serializes state and saves to localStorage");
// Set up mock state
HmiApp.state = {
    width: 600,
    length: 2000,
    gapW: 10,
    gapH: 20,
    dizilimId: 2,
    currentProject: '24050',
    isDualPallet: true,
    isManualMode: true,
    manualPositions: [{ x: 10, y: 20 }],
    rad50Positions: [{ x: 30, y: 40 }],
    rad50UserEdited: true,
    showDimCenter: false,
    showDimGap: true,
    showDimEdges: false,
    exportMode: 1,
    isLightTheme: true,
    palOverrideX: 100,
    palOverrideY: 200
};

lastSetItemKey = null;
lastSetItemValue = null;

HmiApp.saveState();

if (lastSetItemKey !== 'kuka_hmi_state') {
    console.error(`❌ Test failed: Expected key 'kuka_hmi_state', got '${lastSetItemKey}'`);
    failed = true;
} else {
    try {
        const parsed = JSON.parse(lastSetItemValue);
        const expected = {
            width: 600,
            length: 2000,
            gapW: 10,
            gapH: 20,
            dizilimId: 2,
            currentProject: '24050',
            isDualPallet: true,
            isManualMode: true,
            manualPositions: [{ x: 10, y: 20 }],
            rad50Positions: [{ x: 30, y: 40 }],
            rad50UserEdited: true,
            showDimCenter: false,
            showDimGap: true,
            showDimEdges: false,
            exportMode: 1,
            isLightTheme: true,
            palOverrideX: 100,
            palOverrideY: 200
        };

        let match = true;
        for (const key in expected) {
            if (JSON.stringify(parsed[key]) !== JSON.stringify(expected[key])) {
                console.error(`❌ Test failed: Mismatch on property '${key}'. Expected ${JSON.stringify(expected[key])}, got ${JSON.stringify(parsed[key])}`);
                match = false;
            }
        }
        if (match) {
            console.log("✅ Passed");
        } else {
            failed = true;
        }
    } catch (e) {
        console.error(`❌ Test failed: Failed to parse saved JSON - ${e.message}`);
        failed = true;
    }
}

console.log("Running test: saveState correctly serializes empty/null state arrays");
HmiApp.state.manualPositions = [];
HmiApp.state.rad50Positions = null;
lastSetItemKey = null;
lastSetItemValue = null;
HmiApp.saveState();
try {
    const parsed = JSON.parse(lastSetItemValue);
    if (!Array.isArray(parsed.manualPositions) || parsed.manualPositions.length !== 0) {
        console.error(`❌ Test failed: Expected manualPositions to be empty array, got ${JSON.stringify(parsed.manualPositions)}`);
        failed = true;
    } else if (parsed.rad50Positions !== null) {
        console.error(`❌ Test failed: Expected rad50Positions to be null, got ${JSON.stringify(parsed.rad50Positions)}`);
        failed = true;
    } else {
        console.log("✅ Passed");
    }
} catch (e) {
     console.error(`❌ Test failed: Failed to parse saved JSON - ${e.message}`);
     failed = true;
}

console.log("Running test: saveState throws exception when localStorage.setItem fails");
shouldThrow = true;
try {
    HmiApp.saveState();
    console.error(`❌ Test failed: Expected saveState to throw an exception but it didn't.`);
    failed = true;
} catch(e) {
    if (e.message === "QuotaExceededError") {
        console.log("✅ Passed");
    } else {
        console.error(`❌ Test failed: Expected 'QuotaExceededError', got '${e.message}'`);
        failed = true;
    }
}
shouldThrow = false;

if (failed) {
    process.exit(1);
} else {
    console.log("All saveState tests passed.");
    process.exit(0);
}
