const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('production_metrics.js', 'utf8');

let clockInnerText = '';
let clockExists = true;

// Mock browser environment
const mockDocument = {
    getElementById: (id) => {
        if (id === 'clock' && clockExists) {
            return {
                get innerText() { return clockInnerText; },
                set innerText(val) { clockInnerText = val; }
            };
        }
        return null;
    },
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
    setItem: () => {}
};

// Mock Date object to return a predictable time
class MockDate {
    toLocaleTimeString(locales, options) {
        return "14:30:00"; // Mocked predictable time
    }
}

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
    Object: Object,
    Date: MockDate
};

vm.createContext(sandbox);
vm.runInContext(code, sandbox);

let HmiApp = sandbox.HmiApp;
if (!HmiApp) {
    HmiApp = vm.runInContext('HmiApp', sandbox);
}

let failed = false;

// Test 1: Clock element exists
console.log("Running test: Clock element exists");
clockExists = true;
clockInnerText = '';
HmiApp.updateClock();

if (clockInnerText !== "14:30:00") {
    console.error(`❌ Test failed: Expected clock innerText to be '14:30:00', got '${clockInnerText}'`);
    failed = true;
} else {
    console.log("✅ Passed");
}

// Test 2: Clock element does not exist
console.log("Running test: Clock element does not exist");
clockExists = false;
clockInnerText = 'untouched';
try {
    HmiApp.updateClock();
    if (clockInnerText !== 'untouched') {
        console.error(`❌ Test failed: innerText was modified even though element shouldn't exist`);
        failed = true;
    } else {
        console.log("✅ Passed");
    }
} catch (e) {
    console.error(`❌ Test failed: Exception thrown when element does not exist - ${e.message}`);
    failed = true;
}

if (failed) {
    process.exit(1);
} else {
    console.log("All updateClock tests passed.");
    process.exit(0);
}
