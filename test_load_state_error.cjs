/**
 * Unit test for loadState error path in production_metrics.js
 */

async function runTest() {
    // Mock global environment for Node.js
    global.window = {};
    global.document = {
        getElementById: (id) => ({
            value: '',
            checked: false,
            textContent: '',
            style: {},
            classList: { add: () => {}, remove: () => {}, toggle: () => {} }
        }),
        querySelectorAll: () => [],
        body: { classList: { add: () => {}, remove: () => {} } },
        createElement: () => ({ appendChild: () => {}, innerHTML: '' })
    };

    // Mock localStorage
    let storage = {};
    global.localStorage = {
        getItem: (key) => storage[key] || null,
        setItem: (key, value) => { storage[key] = value; },
        removeItem: (key) => { delete storage[key]; }
    };

    // Mock setInterval
    global.setInterval = () => {};

    // Import HmiApp using dynamic import for ES modules
    const module = await import('./production_metrics.js');
    const HmiApp = module.default;

    // Test logic
    console.log("Running testLoadStateError...");

    // 1. Mock invalid JSON in localStorage
    storage['kuka_hmi_state'] = 'invalid-json';

    // 2. Spy on console.error
    let errorLogged = false;
    const originalConsoleError = console.error;
    console.error = (msg, err) => {
        if (msg === 'Failed to load state from localStorage') {
            errorLogged = true;
        }
        originalConsoleError(msg, err);
    };

    // 3. Trigger loadState
    try {
        HmiApp.loadState();
    } catch (e) {
        console.log("Caught unexpected error during loadState:", e);
    }

    // 4. Verify results
    if (errorLogged) {
        console.log("SUCCESS: Expected error message was logged.");
    } else {
        console.log("FAILURE: Expected error message was NOT logged.");
        process.exit(1);
    }

    // 5. Verify that state remains consistent (e.g., uses default values)
    if (HmiApp.state.currentProject === '24048') {
        console.log("SUCCESS: Default state maintained.");
    } else {
        console.log("FAILURE: Default state was corrupted.");
        process.exit(1);
    }

    // Restore console.error
    console.error = originalConsoleError;
}

runTest().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
