import re

with open('production_metrics.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update cacheDom
js = js.replace("'mTopRadSize', 'mTopPalSize']", "'mTopRadSize', 'mTopPalSize', 'm-exportModeSection', 'm-btnDomestic', 'm-btnExport']")

# 2. Update selectProject to show/hide mobile export mode
old_selectProject = """    selectProject() {
        this.state.currentProject = this.dom.projectSelect?.value || '24048';
        const is50 = this.state.currentProject === '24050';
        if (this.dom.manualModeToggle) this.dom.manualModeToggle.style.display = 'grid';
        if(this.dom.exportToggle) this.dom.exportToggle.style.display = is50 ? 'flex' : 'none';"""

new_selectProject = """    selectProject() {
        this.state.currentProject = this.dom.projectSelect?.value || '24048';
        const is50 = this.state.currentProject === '24050';
        if (this.dom.manualModeToggle) this.dom.manualModeToggle.style.display = 'grid';
        if(this.dom.exportToggle) this.dom.exportToggle.style.display = is50 ? 'flex' : 'none';
        if(this.dom['m-exportModeSection']) this.dom['m-exportModeSection'].style.display = is50 ? 'flex' : 'none';"""

js = js.replace(old_selectProject, new_selectProject)

# 3. Update toggleExport to also toggle mobile buttons
old_toggleExport = """    toggleExport(mode) {
        this.state.exportMode = mode;
        if (this.dom.exportButtons[0]) this.dom.exportButtons[0].classList.toggle('active', !mode);
        if (this.dom.exportButtons[1]) this.dom.exportButtons[1].classList.toggle('active', mode);
        this.calc();
    },"""

new_toggleExport = """    toggleExport(mode) {
        this.state.exportMode = mode;
        if (this.dom.exportButtons[0]) this.dom.exportButtons[0].classList.toggle('active', !mode);
        if (this.dom.exportButtons[1]) this.dom.exportButtons[1].classList.toggle('active', mode);
        if (this.dom['m-btnDomestic']) this.dom['m-btnDomestic'].classList.toggle('active', !mode);
        if (this.dom['m-btnExport']) this.dom['m-btnExport'].classList.toggle('active', mode);
        this.calc();
    },"""

js = js.replace(old_toggleExport, new_toggleExport)

# 4. Sync checkboxes on load and mobile init
old_sync_panels = """            this.state.showDimCenter = false;
            this.state.showDimGap = false;
            if (document.getElementById('chkDimCenter')) document.getElementById('chkDimCenter').checked = false;
            if (document.getElementById('chkDimGap')) document.getElementById('chkDimGap').checked = false;"""

new_sync_panels = """            this.state.showDimCenter = false;
            this.state.showDimGap = false;
            if (document.getElementById('chkDimCenter')) document.getElementById('chkDimCenter').checked = false;
            if (document.getElementById('chkDimGap')) document.getElementById('chkDimGap').checked = false;
            if (document.getElementById('chkDimCenter-m')) document.getElementById('chkDimCenter-m').checked = false;
            if (document.getElementById('chkDimGap-m')) document.getElementById('chkDimGap-m').checked = false;"""

js = js.replace(old_sync_panels, new_sync_panels)


# Add the sharing API
share_js = """    shareImage() {
        const area = document.getElementById('singleViewArea'); if (!area) return;
        const targetElement = this.state.showAll ? this.dom.allLayoutsGrid : area;

        const oldPanX = this.state.panX, oldPanY = this.state.panY, oldZoom = this.state.zoom, oldOverflow = area.style.overflow, oldBg = area.style.backgroundColor;
        this.state.panX = 0; this.state.panY = 0; this.state.zoom = 1; this.applyTransform();

        area.style.overflow = 'visible'; area.style.backgroundColor = '#16161a';
        area.classList.add('export-active'); this.render();

        setTimeout(() => {
            html2canvas(targetElement, { backgroundColor: '#16161a', scale: 2, useCORS: true, scrollX: 0, scrollY: 0 }).then(canvas => {
                this.state.panX = oldPanX; this.state.panY = oldPanY; this.state.zoom = oldZoom; this.applyTransform();
                area.style.overflow = oldOverflow; area.style.backgroundColor = oldBg; area.classList.remove('export-active');

                canvas.toBlob(blob => {
                    let filename = this.state.showAll ? `KUKA_All_Schemes_${this.state.width}x${this.state.length}.png` : `KUKA_Scheme_${this.state.currentProject}_D${this.state.dizilimId}_${this.state.width}x${this.state.length}.png`;
                    const file = new File([blob], filename, { type: "image/png" });

                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                        navigator.share({
                            files: [file],
                            title: 'KUKA CAD Layout',
                            text: 'KUKA Radiator Pallet Layout'
                        }).catch(console.error);
                    } else {
                        // Fallback if share is not supported
                        const link = document.createElement('a');
                        link.download = filename;
                        link.href = URL.createObjectURL(blob);
                        link.click();
                        URL.revokeObjectURL(link.href);
                    }
                }, 'image/png');
            });
        }, 1000);
    },"""

js = re.sub(r'    renderRadTable\(positions\) \{', share_js + '\n\n    renderRadTable(positions) {', js)


# Also ensure loadState syncs mobile checkboxes
old_loadState = """                if (document.getElementById('chkDimCenter')) document.getElementById('chkDimCenter').checked = this.state.showDimCenter;
                if (document.getElementById('chkDimGap')) document.getElementById('chkDimGap').checked = this.state.showDimGap;
                if (document.getElementById('chkDimEdges')) document.getElementById('chkDimEdges').checked = this.state.showDimEdges;
            }"""

new_loadState = """                if (document.getElementById('chkDimCenter')) document.getElementById('chkDimCenter').checked = this.state.showDimCenter;
                if (document.getElementById('chkDimGap')) document.getElementById('chkDimGap').checked = this.state.showDimGap;
                if (document.getElementById('chkDimEdges')) document.getElementById('chkDimEdges').checked = this.state.showDimEdges;
                if (document.getElementById('chkDimCenter-m')) document.getElementById('chkDimCenter-m').checked = this.state.showDimCenter;
                if (document.getElementById('chkDimGap-m')) document.getElementById('chkDimGap-m').checked = this.state.showDimGap;
                if (document.getElementById('chkDimEdges-m')) document.getElementById('chkDimEdges-m').checked = this.state.showDimEdges;
            }"""

js = js.replace(old_loadState, new_loadState)


with open('production_metrics.js', 'w', encoding='utf-8') as f:
    f.write(js)
