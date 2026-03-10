import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# 1. In selectProject
# Find selectProject
sel_proj_match = re.search(r'selectProject\(\) \{.*?\}', content, re.DOTALL)
if sel_proj_match:
    sel_proj = sel_proj_match.group(0)
    # Remove: if (is50) this.state.isManualMode = false;
    sel_proj = re.sub(r'if\s*\(\s*is50\s*\)\s*this\.state\.isManualMode\s*=\s*false;\s*', '', sel_proj)
    # Show Matrix for 24050
    sel_proj = re.sub(r"if\s*\(\s*this\.dom\.btnMatrix\s*\)\s*this\.dom\.btnMatrix\.style\.display\s*=\s*is50\s*\?\s*'none'\s*:\s*'block';",
                      r"if (this.dom.btnMatrix) this.dom.btnMatrix.style.display = 'block';", sel_proj)

    # We also need to fix palletModeSelector (which is 1 / 2 pallets). It was hidden for 24050.
    # In manual mode it shouldn't be hidden either, or maybe we leave it hidden for 24050 auto, but what about manual?
    # In 24050, it calculates the pallet size automatically. Let's leave palletModeSelector alone for now.

    content = content[:sel_proj_match.start()] + sel_proj + content[sel_proj_match.end():]

# 2. In updateManualUI
upd_ui_match = re.search(r'updateManualUI\(\) \{.*?\}', content, re.DOTALL)
if upd_ui_match:
    upd_ui = upd_ui_match.group(0)
    # The current block:
    # if (!is50) { ... } else { ... }
    # Let's replace the whole if (!is50) block with universal logic.

    new_logic = """
        if (this.dom.manualAddPanel) this.dom.manualAddPanel.style.display = this.state.isManualMode ? 'block' : 'none';
        if (this.dom.dizilimGridContainer) this.dom.dizilimGridContainer.style.display = this.state.isManualMode ? 'none' : 'grid';
        if(this.dom.radPositionsPanel) this.dom.radPositionsPanel.style.display = this.state.isManualMode || is50 ? '' : 'none';
        if(this.dom.radPosResetBtn) this.dom.radPosResetBtn.style.display = this.state.isManualMode || is50 ? '' : 'none';
        if(this.dom.palletSizeControls) this.dom.palletSizeControls.style.display = this.state.isManualMode || is50 ? '' : 'none';
    """

    # regex replace the entire if (!is50) { ... } else { ... } with new_logic
    upd_ui = re.sub(r'if\s*\(!is50\)\s*\{.*?\}\s*else\s*\{.*?\}', new_logic.strip(), upd_ui, flags=re.DOTALL)

    content = content[:upd_ui_match.start()] + upd_ui + content[upd_ui_match.end():]

with open('production_metrics.js', 'w') as f:
    f.write(content)
