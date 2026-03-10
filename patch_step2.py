import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# 1. In addManualRadiator, remove early return for 24050
content = re.sub(r'addManualRadiator\(\) \{\n\s*if \(this\.state\.currentProject === \'24050\'\) return;', r'addManualRadiator() {\n', content)

# 2. In getPositions, return manualPositions for 24050 when in manual mode
# Find getPositions
match = re.search(r'getPositions\(\) \{.*?\}', content, re.DOTALL)
if match:
    get_pos = match.group(0)

    # Existing code handles 24050 like this:
    # if (this.state.currentProject === '24050') {
    #     if (!this.state.rad50UserEdited) this.state.rad50Positions = this.getDefaultPositions24050(d, w, l);
    #     return { positions: this.state.rad50Positions, angle: 0, isPerPieceAngle: true };
    # }

    # We want:
    # if (this.state.currentProject === '24050') {
    #     if (this.state.isManualMode) return { positions: this.state.manualPositions, angle: 0, isPerPieceAngle: true, isManual: true };
    #     if (!this.state.rad50UserEdited) this.state.rad50Positions = this.getDefaultPositions24050(d, w, l);
    #     return { positions: this.state.rad50Positions, angle: 0, isPerPieceAngle: true };
    # }

    new_get_pos = re.sub(r"if \(this\.state\.currentProject === '24050'\) \{",
                         r"if (this.state.currentProject === '24050') {\n            if (this.state.isManualMode) return { positions: this.state.manualPositions, angle: 0, isPerPieceAngle: true, isManual: true };", get_pos)

    content = content.replace(get_pos, new_get_pos)

with open('production_metrics.js', 'w') as f:
    f.write(content)
