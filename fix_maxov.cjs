const fs = require('fs');
let code = fs.readFileSync('production_metrics.js', 'utf8');

const regex = /let s;\s*let padTop = 20, padBottom = 20, padLeft = 20, padRight = 20;\s*if \(isMiniature\) {\s*s = 0\.12;\s*} else {\s*const areaW = area\.clientWidth, areaH = area\.clientHeight;\s*\/\/ Dynamic padding based on visible UI elements \(Option 3\)\s*padTop = 50;   \/\/ Top pallet dimension line\s*padRight = 90; \/\/ Right pallet dimension line \+ text\s*if \(this\.state\.showDimCenter\) {\s*padLeft = Math\.max\(padLeft, 60\);\s*padBottom = Math\.max\(padBottom, 50\);\s*}\s*if \(this\.state\.showDimEdges\) {\s*padTop = Math\.max\(padTop, 60\);\s*padBottom = Math\.max\(padBottom, 50\);\s*}\s*if \(maxOv > 0\) {\s*padLeft = Math\.max\(padLeft, 50\);\s*padRight = Math\.max\(padRight, 100\);\s*padTop = Math\.max\(padTop, 50\);\s*padBottom = Math\.max\(padBottom, 50\);\s*}\s*const extraPxX = padLeft \+ padRight;\s*const extraPxY = padTop \+ padBottom;\s*const sX = Math\.max\(0\.05, \(areaW - extraPxX\) \/ \(maxExtentX \* 2\)\);\s*const sY = Math\.max\(0\.05, \(areaH - extraPxY\) \/ \(maxExtentY \* 2\)\);\s*s = Math\.min\(sX, sY\);\s*}/m;

const replacement = `        // Move maxOv calculation up
        let maxOv = 0;
        positions.forEach(p => {
            let currentW = p.w !== undefined ? p.w : this.state.width;
            let currentL = p.l !== undefined ? p.l : this.state.length;
            let pAngle = isPerPieceAngle ? p.angle : angle;
            let realW = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);
            let realH = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);
            const ovX = Math.max(0, Math.abs(p.x) + realW / 2 - palSize.x / 2);
            const ovY = Math.max(0, Math.abs(p.y) + realH / 2 - palSize.y / 2);
            maxOv = Math.max(maxOv, Math.max(ovX, ovY));
        });

        let s;
        let padTop = 20, padBottom = 20, padLeft = 20, padRight = 20;

        if (isMiniature) {
            s = 0.12;
        } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;

            // Dynamic padding based on visible UI elements (Option 3)
            padTop = 50;   // Top pallet dimension line
            padRight = 90; // Right pallet dimension line + text

            if (this.state.showDimCenter) {
                padLeft = Math.max(padLeft, 60);
                padBottom = Math.max(padBottom, 50);
            }
            if (this.state.showDimEdges) {
                padTop = Math.max(padTop, 60);
                padBottom = Math.max(padBottom, 50);
            }
            if (maxOv > 0) {
                padLeft = Math.max(padLeft, 50);
                padRight = Math.max(padRight, 100);
                padTop = Math.max(padTop, 50);
                padBottom = Math.max(padBottom, 50);
            }

            const extraPxX = padLeft + padRight;
            const extraPxY = padTop + padBottom;

            const sX = Math.max(0.05, (areaW - extraPxX) / (maxExtentX * 2));
            const sY = Math.max(0.05, (areaH - extraPxY) / (maxExtentY * 2));
            s = Math.min(sX, sY);
        }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);

    // Now we also need to remove 'let maxOv = 0;' from later in the code to prevent redeclaration
    const oldMaxOvRegex = /let radiatorsHTML = ''; let maxOv = 0;/;
    code = code.replace(oldMaxOvRegex, "let radiatorsHTML = '';");

    fs.writeFileSync('production_metrics.js', code);
    console.log("Patched successfully");
} else {
    console.log("Regex not found");
}
