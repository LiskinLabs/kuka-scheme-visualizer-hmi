const fs = require('fs');
let code = fs.readFileSync('production_metrics.js', 'utf8');
let openCount = 0;
for(let i = 0; i < code.length; i++) {
    if (code[i] === '{') openCount++;
    if (code[i] === '}') openCount--;
}
console.log("Final balance: " + openCount);
