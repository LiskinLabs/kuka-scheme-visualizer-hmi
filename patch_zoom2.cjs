const fs = require('fs');
let code = fs.readFileSync('production_metrics.js', 'utf8');

const target1 = `        let s;
        if (isMiniature) { s = 0.12; } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;
            const isMobile = window.innerWidth <= 768;
            const paddingScale = isMobile ? 0.90 : 0.85; // Give more padding on mobile for dimensions
            const sX = (areaW * paddingScale) / (maxExtentX * 2), sY = (areaH * paddingScale) / (maxExtentY * 2);
            s = Math.min(sX, sY);
        }`;

const replacement1 = `        let s;
        let padTop = 20, padBottom = 20, padLeft = 20, padRight = 20;

        if (isMiniature) {
            s = 0.12;
        } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;

            // Dynamic padding based on visible UI elements (Option 3)
            padTop = 50;   // Top pallet dimension line
            padRight = 90; // Right pallet dimension line + text

            // Left padding needed for edge dimensions and overhangs
            padLeft = 80;
            // Bottom padding needed for edge dimensions
            padBottom = 80;

            if (this.state.showDimCenter) {
                padLeft = Math.max(padLeft, 60);
                padBottom = Math.max(padBottom, 50);
            }
            if (this.state.showDimEdges) {
                padTop = Math.max(padTop, 60);
                padBottom = Math.max(padBottom, 70);
            }
            // Always pad enough to not hit borders
            padLeft = Math.max(padLeft, 50);
            padRight = Math.max(padRight, 100);
            padTop = Math.max(padTop, 50);
            padBottom = Math.max(padBottom, 50);

            const extraPxX = padLeft + padRight;
            const extraPxY = padTop + padBottom;

            const sX = Math.max(0.05, (areaW - extraPxX) / (maxExtentX * 2));
            const sY = Math.max(0.05, (areaH - extraPxY) / (maxExtentY * 2));
            s = Math.min(sX, sY);
        }`;

const target2 = `        const palW = Math.round(palSize.x * s), palH = Math.round(palSize.y * s);
        const totalW = (this.state.isDualPallet && !is50) ? Math.round(2400 * s) : palW;
        const palLeft = Math.round((area.clientWidth - totalW) / 2);
        const palTop = Math.round((area.clientHeight - palH) / 2);`;

const replacement2 = `        const palW = Math.round(palSize.x * s), palH = Math.round(palSize.y * s);
        const totalW = (this.state.isDualPallet && !is50) ? Math.round(2400 * s) : palW;

        let palLeft = 0, palTop = 0;
        if (isMiniature) {
            palLeft = Math.round((area.clientWidth - totalW) / 2);
            palTop = Math.round((area.clientHeight - palH) / 2);
        } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;
            const extraPxX = padLeft + padRight;
            const extraPxY = padTop + padBottom;

            // Center the entire bounding box inside the remaining space
            const leftoverX = areaW - extraPxX - (maxExtentX * 2 * s);
            const leftoverY = areaH - extraPxY - (maxExtentY * 2 * s);

            const boxCenterX = padLeft + (leftoverX / 2) + (maxExtentX * s);
            const boxCenterY = padTop + (leftoverY / 2) + (maxExtentY * s);

            palLeft = Math.round(boxCenterX - (totalW / 2));
            palTop = Math.round(boxCenterY - (palH / 2));
        }`;

if (code.includes(target1) && code.includes(target2)) {
    code = code.replace(target1, replacement1);
    code = code.replace(target2, replacement2);
    fs.writeFileSync('production_metrics.js', code);
    console.log("Patched successfully");
} else {
    console.log("Targets not found in code");
}
