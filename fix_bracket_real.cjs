const fs = require('fs');
let code = fs.readFileSync('production_metrics.js', 'utf8');
let openCount = 0;
let lastOpen = 0;
for(let i = 0; i < code.length; i++) {
    if (code[i] === '{') openCount++;
    if (code[i] === '}') openCount--;
    if (openCount === -1) {
        console.log("Found an extra closing bracket at index " + i);
        console.log(code.substring(i - 100, i + 100));
        break;
    }
}
