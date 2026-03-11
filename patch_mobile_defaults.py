with open('production_metrics.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update syncPanelsUI to uncheck gap dims on mobile
old_sync_panels = """    syncPanelsUI() {
        const isMobile = window.innerWidth <= 640;
        if (isMobile) {
            this.toggleManualMode(false);

            this.closeAllPanels();"""

new_sync_panels = """    syncPanelsUI() {
        const isMobile = window.innerWidth <= 640;
        if (isMobile) {
            this.toggleManualMode(false);
            this.state.showDimCenter = false;
            this.state.showDimGap = false;
            if (document.getElementById('chkDimCenter')) document.getElementById('chkDimCenter').checked = false;
            if (document.getElementById('chkDimGap')) document.getElementById('chkDimGap').checked = false;
            this.closeAllPanels();"""

js = js.replace(old_sync_panels, new_sync_panels)

# 2. Update scaling to 90%
old_scale = "const paddingScale = isMobile ? 0.65 : 0.85;"
new_scale = "const paddingScale = isMobile ? 0.90 : 0.85;"

js = js.replace(old_scale, new_scale)

with open('production_metrics.js', 'w', encoding='utf-8') as f:
    f.write(js)
