import re

filepath = 'production_metrics.js'
with open(filepath, 'r') as f:
    content = f.read()

# Add standard style access checks for common offenders
# For updateManualUI
content = content.replace("this.dom.exportToggle.style.display", "if(this.dom.exportToggle) this.dom.exportToggle.style.display")

# For updateDizilimActiveState
content = content.replace("if (i === 1 || i === 5) { btn.style.display = 'none'; continue; }", "if (i === 1 || i === 5) { if(btn) btn.style.display = 'none'; continue; }")

# For render()
content = content.replace("pal.style.", "if(pal) pal.style.")
content = content.replace("pal2.style.", "if(pal2) pal2.style.")

# For left/right panel
content = content.replace("this.dom.leftPanel.style.transform", "if(this.dom.leftPanel) this.dom.leftPanel.style.transform")
content = content.replace("this.dom.rightPanel.style.transform", "if(this.dom.rightPanel) this.dom.rightPanel.style.transform")

# For manual ui
content = content.replace("this.dom.radPositionsPanel.style.", "if(this.dom.radPositionsPanel) this.dom.radPositionsPanel.style.")
content = content.replace("this.dom.radPosResetBtn.style.", "if(this.dom.radPosResetBtn) this.dom.radPosResetBtn.style.")
content = content.replace("this.dom.palletSizeControls.style.", "if(this.dom.palletSizeControls) this.dom.palletSizeControls.style.")
content = content.replace("this.dom.manualControlsGroup.style.", "if(this.dom.manualControlsGroup) this.dom.manualControlsGroup.style.")

# For allLayoutsGrid
content = content.replace("this.dom.allLayoutsGrid.style.", "if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.")
content = content.replace("this.dom.palletArea.style.", "if(this.dom.palletArea) this.dom.palletArea.style.")
content = content.replace("this.dom.centerMark.style.", "if(this.dom.centerMark) this.dom.centerMark.style.")
content = content.replace("this.dom.minimapView.style.", "if(this.dom.minimapView) this.dom.minimapView.style.")

with open(filepath, 'w') as f:
    f.write(content)

print("Applied quick fixes to production_metrics.js")
