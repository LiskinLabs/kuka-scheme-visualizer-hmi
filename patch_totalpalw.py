import re

with open('/app/production_metrics.js', 'r') as f:
    code = f.read()

# Replace palW with totalPalW for the horizontal top dimension line
old_gap1 = "blueprintHTML += this.getDimLineHTML(palLeft, palTop - 30, palW, 0, `${palSize.x} mm`, 'gap-dim');"
new_gap1 = """const isDoubleLyt = [2, 4, 7, 10, 11, 13].includes(this.state.dizilimId) && !this.state.is50Group;
            const totalWidthPx = isDoubleLyt ? (1200 * s) + palW : palW;
            blueprintHTML += this.getDimLineHTML(palLeft, palTop - 30, totalWidthPx, 0, `${isDoubleLyt ? 1200 + palSize.x : palSize.x} mm`, 'gap-dim');"""

if old_gap1 in code:
    code = code.replace(old_gap1, new_gap1)
    with open('/app/production_metrics.js', 'w') as f:
        f.write(code)
    print("Patched top gap dim.")
else:
    print("Could not find old top gap dim logic.")
