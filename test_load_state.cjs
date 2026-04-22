const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser environment
const domElements = {};
const mockDocument = {
    getElementById: (id) => {
        if (!domElements[id]) {
            domElements[id] = {
                value: '',
                checked: false,
                style: {},
                classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
                addEventListener: () => {},
                appendChild: () => {},
                querySelector: () => null,
                querySelectorAll: () => []
            };
        }
        return domElements[id];
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { classList: { add: () => {}, remove: () => {} } },
    createElement: () => ({ style: {}, classList: { add: () => {} } }),
    createDocumentFragment: () => ({ appendChild: () => {} })
};

const mockLocalStorage = {
    state: {},
    getItem: (key) => mockLocalStorage.state[key] || null,
    setItem: (key, value) => { mockLocalStorage.state[key] = value; }
};

const mockWindow = {
    onload: null,
    addEventListener: () => {},
    innerWidth: 1024,
    localStorage: mockLocalStorage,
    document: mockDocument,
    setInterval: () => {},
    console: { log: () => {}, error: console.error },
    Number: Number,
    Array: Array,
    JSON: JSON,
    setTimeout: (fn) => fn(),
    clearTimeout: () => {}
};
mockWindow.window = mockWindow;

// Load the script
let code = fs.readFileSync('production_metrics.js', 'utf8');
// Change const HmiApp to var HmiApp so it becomes a property of the context
code = code.replace('const HmiApp = {', 'var HmiApp = {');
// Remove window.onload assignment
code = code.replace('window.onload = () => HmiApp.init();', '');

const script = new vm.Script(code);
const context = vm.createContext(mockWindow);
script.runInContext(context);

const HmiApp = context.HmiApp;

function assert(condition, message) {
    if (!condition) {
        throw new Error('Assertion failed: ' + message);
    }
}

console.log('Running HmiApp.validatePositions tests...');

// validatePositions tests
const vp = HmiApp.validatePositions.bind(HmiApp);

assert(vp(null) === null, 'null input should return null');
assert(vp(undefined) === null, 'undefined input should return null');
assert(vp('not an array') === null, 'string input should return null');
assert(vp({}) === null, 'object input should return null');

const validArr = [
    { n: 1, x: 10, y: 20, angle: 90 },
    { n: 2, x: 30, y: 40, angle: 0, w: 200, l: 500 }
];
const result1 = vp(validArr);
assert(result1.length === 2, 'should return all valid items');
assert(result1[0].n === 1 && result1[1].w === 200, 'should preserve properties');

const mixedArr = [
    { n: 1, x: 10, y: 20, angle: 90 },
    { x: 30, y: 40, angle: 0 }, // missing n
    { n: 3, x: '10', y: 20, angle: 0 }, // invalid x type
    null,
    undefined,
    3,
    { n: 4, x: 50, y: 60, angle: 180, w: '200' } // w is invalid type but n,x,y,angle are valid
];
const result2 = vp(mixedArr);
assert(result2.length === 2, 'should filter out invalid items');
assert(result2[0].n === 1, 'first valid item preserved');
assert(result2[1].n === 4, 'second valid item preserved');
assert(result2[1].w === undefined, 'invalid w should be dropped/undefined');

console.log('validatePositions tests passed!');

console.log('Running HmiApp.loadState tests...');

// Mock dom for loadState
HmiApp.cacheDom();

// Test loadState with valid data
const validState = {
    width: 300,
    length: 600,
    gapH: 150,
    currentProject: '24049',
    isDualPallet: true,
    manualPositions: [{ n: 1, x: 5, y: 5, angle: 0 }]
};
mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify(validState));
HmiApp.loadState();
assert(HmiApp.state.width === 300, 'width should be loaded');
assert(HmiApp.state.length === 600, 'length should be loaded');
assert(HmiApp.state.gapH === 150, 'gapH should be loaded');
assert(HmiApp.state.currentProject === '24049', 'currentProject should be loaded');
assert(HmiApp.state.isDualPallet === true, 'isDualPallet should be loaded');
assert(HmiApp.state.manualPositions.length === 1, 'manualPositions should be loaded');

// Test loadState with invalid data types
const invalidTypes = {
    width: 'high',
    length: null,
    isDualPallet: 1
};
mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify(invalidTypes));
// State should remain at last valid or defaults
HmiApp.loadState();
assert(HmiApp.state.width === 300, 'invalid width should not overwrite');
assert(HmiApp.state.length === 600, 'null length should not overwrite');
assert(HmiApp.state.isDualPallet === true, 'numeric isDualPallet should not overwrite');

// Test gapH < 50 reset
const badGapH = { gapH: 14 };
mockLocalStorage.setItem('kuka_hmi_state', JSON.stringify(badGapH));
HmiApp.loadState();
assert(HmiApp.state.gapH === 200, 'gapH < 50 should reset to 200');

// Test invalid JSON
mockLocalStorage.setItem('kuka_hmi_state', 'not json');
console.log('Expect an error log below about JSON parsing:');
HmiApp.loadState();
assert(HmiApp.state.width === 300, 'invalid JSON should not break state');

console.log('loadState tests passed!');

console.log('All tests passed successfully!');
