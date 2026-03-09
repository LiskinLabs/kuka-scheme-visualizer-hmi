import re

with open('/app/production_metrics.js', 'r') as f:
    js = f.read()

old_getdim = """if (dx !== 0) { if (dx < 0) finalX = x + dx; styleLine = `width:${absDx}px; height:1px; border-top:1px dashed ${color};`; }
        else { if (dy < 0) finalY = y + dy; styleLine = `width:1px; height:${absDy}px; border-left:1px dashed ${color};`; }"""

new_getdim = """let extraTransform = '';
        if (dx !== 0) {
            if (dx < 0) finalX = x + dx;
            styleLine = `width:${absDx}px; height:1px; border-top:1px dashed ${color}; border-bottom:0; border-left:0; border-right:0;`;
            if (type === 'gap-dim') extraTransform = 'translateY(15px)';
            if (type === 'manual-dim') extraTransform = 'translateY(-15px)';
        }
        else {
            if (dy < 0) finalY = y + dy;
            styleLine = `width:1px; height:${absDy}px; border-left:1px dashed ${color}; border-right:0; border-top:0; border-bottom:0;`;
            if (type === 'gap-dim') extraTransform = 'translateX(15px)';
            if (type === 'manual-dim') extraTransform = 'translateX(-15px)';
        }"""

if old_getdim in js:
    js = js.replace(old_getdim, new_getdim)

js = js.replace("""transform: translate(-50%, -50%);""", """transform: translate(-50%, -50%) ${extraTransform};""")

old_space = "let spaceRight = (palSize.x / 2) - maxX, spaceLeft = minX - (-palSize.x / 2), spaceTop = (palSize.y / 2) - maxY, spaceBottom = minY - (-palSize.y / 2);"
new_space = """const isDoubleL = [2, 4, 7, 10, 11, 13].includes(this.state.dizilimId) && !this.state.is50Group;
                const rBound = isDoubleL ? (1200 + palSize.x / 2) : (palSize.x / 2);
                let spaceRight = rBound - maxX, spaceLeft = minX - (-palSize.x / 2), spaceTop = (palSize.y / 2) - maxY, spaceBottom = minY - (-palSize.y / 2);"""
js = js.replace(old_space, new_space)

old_gap = "blueprintHTML += this.getDimLineHTML(palLeft, palTop - 30, palW, 0, `${palSize.x} mm`, 'gap-dim');"
new_gap = """const isDoubleL = [2, 4, 7, 10, 11, 13].includes(this.state.dizilimId) && !this.state.is50Group;
            const tPalW = isDoubleL ? (1200 * s) + palW : palW;
            blueprintHTML += this.getDimLineHTML(palLeft, palTop - 30, tPalW, 0, `${isDoubleL ? 1200 + palSize.x : palSize.x} mm`, 'gap-dim');"""
js = js.replace(old_gap, new_gap)

old_gap2 = "blueprintHTML += this.getDimLineHTML(palLeft + palW + 30, palTop, 0, palH, `${palSize.y} mm`, 'gap-dim');"
new_gap2 = "blueprintHTML += this.getDimLineHTML(palLeft + tPalW + 30, palTop, 0, palH, `${palSize.y} mm`, 'gap-dim');"
js = js.replace(old_gap2, new_gap2)

with open('/app/production_metrics.js', 'w') as f:
    f.write(js)
