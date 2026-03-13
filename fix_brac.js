const fs = require('fs');
let content = fs.readFileSync('production_metrics.js', 'utf8');
content = content.replace("};", "}"); // Trying to remove one specific trailing character, let's trace better.
