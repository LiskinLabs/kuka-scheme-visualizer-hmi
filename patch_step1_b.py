import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Fix updateManualUI manually as regex replacement failed
match = re.search(r'updateManualUI\(\) \{.*?if \(!is50\) \{.*?\} else \{.*?\}', content, re.DOTALL)
if match:
    full_str = match.group(0)

    new_str = re.sub(r'if \(!is50\) \{.*?\} else \{.*?\}', """if (this.dom.manualAddPanel) this.dom.manualAddPanel.style.display = this.state.isManualMode ? 'block' : 'none';
        if (this.dom.dizilimGridContainer) this.dom.dizilimGridContainer.style.display = this.state.isManualMode ? 'none' : 'grid';
        if(this.dom.radPositionsPanel) this.dom.radPositionsPanel.style.display = this.state.isManualMode || is50 ? '' : 'none';
        if(this.dom.radPosResetBtn) this.dom.radPosResetBtn.style.display = this.state.isManualMode || is50 ? '' : 'none';
        if(this.dom.palletSizeControls) this.dom.palletSizeControls.style.display = this.state.isManualMode || is50 ? 'flex' : 'none';""", full_str, flags=re.DOTALL)

    content = content.replace(full_str, new_str)

# In selectProject
match2 = re.search(r'selectProject\(\) \{.*?\}', content, re.DOTALL)
if match2:
    sel_proj = match2.group(0)
    sel_proj = re.sub(r'if\s*\(\s*is50\s*\)\s*this\.state\.isManualMode\s*=\s*false;\s*', '', sel_proj)
    sel_proj = re.sub(r'if\s*\(\s*this\.dom\.btnMatrix\s*\)\s*this\.dom\.btnMatrix\.style\.display\s*=\s*is50\s*\?\s*\'none\'\s*:\s*\'block\';', r"if (this.dom.btnMatrix) this.dom.btnMatrix.style.display = 'block';", sel_proj)
    content = content.replace(match2.group(0), sel_proj)

with open('production_metrics.js', 'w') as f:
    f.write(content)
