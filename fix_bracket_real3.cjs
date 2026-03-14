const fs = require('fs');
let code = fs.readFileSync('production_metrics.js', 'utf8');

let fixed = code.replace("        },\n\n    // --- DOM Cache ---", "        }\n    },\n\n    // --- DOM Cache ---");
fs.writeFileSync('production_metrics.js', fixed);
