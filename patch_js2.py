import re

with open('production_metrics.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update cacheDom
js = js.replace("'btnDomestic', 'btnExport']", "'btnDomestic', 'btnExport', 'mTopRadSize', 'mTopPalSize']")

# 2. Update scaling formula in _renderSinglePalletInside
old_scale_formula = """        if (isMiniature) { s = 0.12; } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;
            const sX = (areaW * 0.85) / (maxExtentX * 2), sY = (areaH * 0.85) / (maxExtentY * 2);
            s = Math.min(sX, sY);
        }"""

new_scale_formula = """        if (isMiniature) { s = 0.12; } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;
            const isMobile = window.innerWidth <= 768;
            const paddingScale = isMobile ? 0.65 : 0.85; // Give more padding on mobile for dimensions
            const sX = (areaW * paddingScale) / (maxExtentX * 2), sY = (areaH * paddingScale) / (maxExtentY * 2);
            s = Math.min(sX, sY);
        }"""

js = js.replace(old_scale_formula, new_scale_formula)

# 3. Update the mobile top bar text near the end of _renderSinglePalletInside
old_viz_header = "            this.updateVizHeader(positions.length, angle, is50);"
new_viz_header = """            this.updateVizHeader(positions.length, angle, is50);
            if (this.dom.mTopRadSize) this.dom.mTopRadSize.textContent = `${this.state.width}x${this.state.length} mm (${positions.length} pcs)`;
            if (this.dom.mTopPalSize) this.dom.mTopPalSize.textContent = `${palSize.x}x${palSize.y} mm`;"""

js = js.replace(old_viz_header, new_viz_header)

with open('production_metrics.js', 'w', encoding='utf-8') as f:
    f.write(js)
