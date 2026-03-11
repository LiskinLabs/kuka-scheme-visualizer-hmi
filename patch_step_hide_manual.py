import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# We need to change these lines in updateManualUI:
# if(this.dom.radPositionsPanel) this.dom.radPositionsPanel.style.display = this.state.isManualMode || is50 ? '' : 'none';
# if(this.dom.radPosResetBtn) this.dom.radPosResetBtn.style.display = this.state.isManualMode || is50 ? '' : 'none';
# if(this.dom.palletSizeControls) this.dom.palletSizeControls.style.display = this.state.isManualMode || is50 ? 'flex' : 'none';

# To:
# if(this.dom.radPositionsPanel) this.dom.radPositionsPanel.style.display = this.state.isManualMode ? '' : 'none';
# if(this.dom.radPosResetBtn) this.dom.radPosResetBtn.style.display = this.state.isManualMode ? '' : 'none';
# if(this.dom.palletSizeControls) this.dom.palletSizeControls.style.display = this.state.isManualMode ? 'flex' : 'none';

content = content.replace("this.dom.radPositionsPanel.style.display = this.state.isManualMode || is50 ? '' : 'none';",
                          "this.dom.radPositionsPanel.style.display = this.state.isManualMode ? '' : 'none';")

content = content.replace("this.dom.radPosResetBtn.style.display = this.state.isManualMode || is50 ? '' : 'none';",
                          "this.dom.radPosResetBtn.style.display = this.state.isManualMode ? '' : 'none';")

content = content.replace("this.dom.palletSizeControls.style.display = this.state.isManualMode || is50 ? 'flex' : 'none';",
                          "this.dom.palletSizeControls.style.display = this.state.isManualMode ? 'flex' : 'none';")

with open('production_metrics.js', 'w') as f:
    f.write(content)
