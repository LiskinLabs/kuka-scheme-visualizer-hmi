with open('production_metrics.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the condition for overhang to include this.state.showDimEdges
old_code = """                if (!isMiniature) {
                    if (ovX > 0) radiatorsHTML += this.getDimLineHTML(radLeft + (p.x > 0 ? rw : -20), radTop + rh / 2, 20, 0, Math.round(ovX), 'overhang');
                    if (ovY > 0) radiatorsHTML += this.getDimLineHTML(radLeft + rw / 2, radTop + (p.y > 0 ? -20 : rh), 0, 20, Math.round(ovY), 'overhang');
                }"""

new_code = """                if (!isMiniature && this.state.showDimEdges) {
                    if (ovX > 0) radiatorsHTML += this.getDimLineHTML(radLeft + (p.x > 0 ? rw : -20), radTop + rh / 2, 20, 0, Math.round(ovX), 'overhang');
                    if (ovY > 0) radiatorsHTML += this.getDimLineHTML(radLeft + rw / 2, radTop + (p.y > 0 ? -20 : rh), 0, 20, Math.round(ovY), 'overhang');
                }"""

js = js.replace(old_code, new_code)

with open('production_metrics.js', 'w', encoding='utf-8') as f:
    f.write(js)
