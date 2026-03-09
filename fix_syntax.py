with open('production_metrics.js', 'r') as f:
    js = f.read()

js = js.replace("tif (this.dom.palletSizeControls) if (this.dom.palletSizeControls) {", "if (this.dom.palletSizeControls) {")

with open('production_metrics.js', 'w') as f:
    f.write(js)
