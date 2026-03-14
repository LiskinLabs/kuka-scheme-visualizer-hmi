import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Replace the map inside setLang
old_map_code = """const map = { lblControls: 'controls', lblProject: 'project', lblWidth: 'width', lblLength: 'length', lblCalc: 'calc', lblLayout: 'layout', lblInfo: 'info', lblRadiator: 'radiator', lblW2: 'widthL', lblL2: 'lengthL', lblPlacement: 'placement', lblAngle: 'angle', lblPcs: 'pcs', lblLayers: 'layers', lblTotal: 'total', lblPallet: 'pallet', lblPalSize: 'palSize', lblLegend: 'legend', lblLegRad: 'legRad', lblLegPal: 'legPal', lbl1Pal: 'p1', lbl2Pal: 'p2', lblDom: 'dom', lblExp: 'exp', lblReset: 'reset', lblToggleAll: this.state.showAll ? 'toggleAllHide' : 'toggleAllShow', lblPrint: 'print', lblMatrix: 'matrix' };
        Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = t[map[id]]; });"""

new_map_code = """const map = { lblControls: 'controls', lblProject: 'project', lblWidth: 'width', lblLength: 'length', lblCalc: 'calc', lblLayout: 'layout', lblInfo: 'info', lblRadiator: 'radiator', lblW2: 'widthL', lblL2: 'lengthL', lblPlacement: 'placement', lblAngle: 'angle', lblPcs: 'pcs', lblLayers: 'layers', lblTotal: 'total', lblPallet: 'pallet', lblPalSize: 'palSize', lblLegend: 'legend', lblLegRad: 'legRad', lblLegPal: 'legPal', lbl1Pal: 'p1', lbl2Pal: 'p2', lblDom: 'dom', lblExp: 'exp', lblReset: 'reset', lblToggleAll: this.state.showAll ? 'toggleAllHide' : 'toggleAllShow', lblPrint: 'print', lblMatrix: 'matrix',
            lblProperties: 'properties', lblViewDims: 'viewDims', lblManualConfig: 'manualConfig', lblAddRadiator: 'addRadiator', lblAddBtn: 'addBtn', lblAutoAlign: 'autoAlign', lblOverrideSize: 'overrideSize', lblOptions: 'options', lblDimensions: 'dimensions', lblPlacementMode: 'placementMode', lblToggleGrid: 'toggleGrid', lblShareImage: 'shareImage', lblCtxRotate: 'ctxRotate', lblCtxDelete: 'ctxDelete', lblWidthM: 'width', lblLengthM: 'length'
        };
        Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = t[map[id]]; });

        // Handle class-based replacements for multiple elements
        document.querySelectorAll('.lblCenterDimsTxt').forEach(el => el.textContent = t['centerDims']);
        document.querySelectorAll('.lblGapDimsTxt').forEach(el => el.textContent = t['gapDims']);
        document.querySelectorAll('.lblEdgeDimsTxt').forEach(el => el.textContent = t['edgeDims']);

        // Handle Tooltips (titles)
        const tooltips = { btnAutoModeT: 'ttAutoMode', btnManualModeT: 'ttManualMode', btnResetViewT: 'ttResetView', m1T: 'p1', m2T: 'p2', btnDomesticT: 'dom', btnExportT: 'exp', btnToggleAllT: 'ttShowAll', btnMatrixT: 'matrix', btnPrintT: 'print', btnExportImgT: 'ttDownload'};
        Object.keys(tooltips).forEach(id => { const el = document.getElementById(id); if (el) el.title = t[tooltips[id]]; });"""

content = content.replace(old_map_code, new_map_code)

# Add setLang to init
init_func_old = """this.syncPanelsUI();
        console.log("HMI Visualizer v3.2 Industrial Restored");"""
init_func_new = """this.syncPanelsUI();
        this.setLang(this.state.lang); // Apply initial translation
        console.log("HMI Visualizer v3.2 Industrial Restored");"""

content = content.replace(init_func_old, init_func_new)

with open('production_metrics.js', 'w') as f:
    f.write(content)
