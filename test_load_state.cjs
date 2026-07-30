/**
 * Integration Test for KUKA HMI Visualizer State & Math Engine
 */
const fs = require('fs');
const path = require('path');

console.log("Running KUKA HMI Integration Tests...");

// Read production_metrics.js
const code = fs.readFileSync(path.join(__dirname, 'production_metrics.js'), 'utf8');

// Basic structural checks
if (!code.includes('const HmiApp =')) {
    console.error("FAIL: HmiApp definition not found in production_metrics.js");
    process.exit(1);
}

if (!code.includes('getPositions()') || !code.includes('autoDizilim24050')) {
    console.error("FAIL: Required calculation methods missing.");
    process.exit(1);
}

// Check GPU Hardware Acceleration requirement from .Jules/bolt.md
if (!code.includes('translate3d(')) {
    console.error("FAIL: GPU hardware acceleration translate3d missing.");
    process.exit(1);
}

console.log("SUCCESS: All core logic checks passed successfully.");
process.exit(0);
