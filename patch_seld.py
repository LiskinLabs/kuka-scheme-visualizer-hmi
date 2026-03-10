filepath = 'production_metrics.js'
with open(filepath, 'r') as f:
    content = f.read()

safe_seld = """
    selD(id) {
        if (id >= this.config.defW.length || id < 0) id = 2; // Default to D2
        this.state.dizilimId = id;
        this.state.width = this.config.defW[id] || 200;
        this.state.length = this.config.defL[id] || 1000;
        if (this.dom.inW) this.dom.inW.value = this.state.width;
        if (this.dom.inL) this.dom.inL.value = this.state.length;
        this.state.isDualPallet = this.state.length > 1500;
        this.updateDizilimActiveState();
        this.render();
    },
"""

content = content.replace("""    selD(id) {
        this.state.dizilimId = id;
        this.state.width = this.config.defW[id];
        this.state.length = this.config.defL[id];
        if (this.dom.inW) this.dom.inW.value = this.state.width;
        if (this.dom.inL) this.dom.inL.value = this.state.length;
        this.state.isDualPallet = this.state.length > 1500;
        this.updateDizilimActiveState();
        this.render();
    },""", safe_seld.strip("\n"))

with open(filepath, 'w') as f:
    f.write(content)

print("Applied safe selD fallback.")
