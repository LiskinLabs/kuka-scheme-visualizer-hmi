const fs = require('fs');
const code = fs.readFileSync('production_metrics.js', 'utf8');
if (code.includes('sX = Math.max(0.05, (areaW - extraPxX) / (maxExtentX * 2))')) {
    console.log("Clamp is implemented correctly.");
} else {
    console.log("Clamp check failed.");
}
