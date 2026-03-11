const fs = require('fs');
let code = fs.readFileSync('production_metrics.js', 'utf8');

const regex = /let s;\s*if\s*\(isMiniature\)\s*{\s*s\s*=\s*0\.12;\s*}\s*else\s*{\s*const areaW = area\.clientWidth, areaH = area\.clientHeight;\s*const isMobile = window\.innerWidth <= 768;\s*const paddingScale = isMobile \? 0\.90 : 0\.85;\s*[^]*?s = Math\.min\(sX,\s*sY\);\s*}/;

const replacement = `let s;
        if (isMiniature) {
            s = 0.12;
        } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;

            // Fixed padding for UI elements instead of percentage paddingScale
            let padTop = 30, padBottom = 30, padLeft = 30, padRight = 30;

            // Add padding for specific dimension labels if enabled
            if (this.state.showDimCenter) {
                padLeft = Math.max(padLeft, 60);
                padBottom = Math.max(padBottom, 50);
            }
            if (this.state.showDimEdges) {
                padTop = Math.max(padTop, 60);
                padBottom = Math.max(padBottom, 70);
            }
            // Always ensure enough padding to not clip the fixed-size elements
            padLeft = Math.max(padLeft, 60);
            padRight = Math.max(padRight, 100);
            padTop = Math.max(padTop, 50);
            padBottom = Math.max(padBottom, 50);

            if (maxOv > 0) {
                // If there's overhang, give a bit more breathing room
                padLeft += 20;
                padRight += 20;
                padTop += 20;
                padBottom += 20;
            }

            const extraPxX = padLeft + padRight;
            const extraPxY = padTop + padBottom;

            // Calculate scale such that (logical_size * scale) + extra_pixels = available_screen
            const sX = Math.max(0.05, (areaW - extraPxX) / (maxExtentX * 2));
            const sY = Math.max(0.05, (areaH - extraPxY) / (maxExtentY * 2));
            s = Math.min(sX, sY);

            // Store for position calculation later
            this._computedPadLeft = padLeft;
            this._computedPadTop = padTop;
        }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);

    // Now replace the positioning logic
    const regex2 = /const palLeft = Math\.round\(\(area\.clientWidth - totalW\) \/ 2\);\s*const palTop = Math\.round\(\(area\.clientHeight - palH\) \/ 2\);/;

    const replacement2 = `let palLeft = 0, palTop = 0;
        if (isMiniature) {
            palLeft = Math.round((area.clientWidth - totalW) / 2);
            palTop = Math.round((area.clientHeight - palH) / 2);
        } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;
            const padLeft = this._computedPadLeft || 60;
            const padTop = this._computedPadTop || 50;

            // Calculate remaining space after padding is applied
            const padRight = padLeft === 60 ? 100 : padLeft; // Approximation for fallback
            const padBottom = padTop === 50 ? 50 : padTop;

            const leftoverX = areaW - (padLeft + 100) - (maxExtentX * 2 * s);
            const leftoverY = areaH - (padTop + 50) - (maxExtentY * 2 * s);

            // Base offset is the left/top padding, plus half of the remaining extra space
            const boxCenterX = padLeft + Math.max(0, leftoverX / 2) + (maxExtentX * s);
            const boxCenterY = padTop + Math.max(0, leftoverY / 2) + (maxExtentY * s);

            palLeft = Math.round(boxCenterX - (totalW / 2));
            palTop = Math.round(boxCenterY - (palH / 2));
        }`;

    if (code.match(regex2)) {
        code = code.replace(regex2, replacement2);
        fs.writeFileSync('production_metrics.js', code);
        console.log("Patched successfully");
    } else {
        console.log("Regex 2 not found");
    }
} else {
    console.log("Regex 1 not found");
}
