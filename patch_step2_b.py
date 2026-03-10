import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Replace getPositions
old_code = """        if (this.state.currentProject === '24050') {
            if (!this.state.rad50UserEdited) this.state.rad50Positions = this.getDefaultPositions24050(d, w, l);
            return { positions: this.state.rad50Positions, angle: 0, isPerPieceAngle: true };
        }"""

new_code = """        if (this.state.currentProject === '24050') {
            if (this.state.isManualMode) return { positions: this.state.manualPositions, angle: 0, isPerPieceAngle: true, isManual: true };
            if (!this.state.rad50UserEdited) this.state.rad50Positions = this.getDefaultPositions24050(d, w, l);
            return { positions: this.state.rad50Positions, angle: 0, isPerPieceAngle: true };
        }"""

content = content.replace(old_code, new_code)

with open('production_metrics.js', 'w') as f:
    f.write(content)
