export const stateMethods = {
    saveState() {
        const stateToSave = {
            width: this.state.width,
            length: this.state.length,
            gapW: this.state.gapW,
            gapH: this.state.gapH,
            dizilimId: this.state.dizilimId,
            currentProject: this.state.currentProject,
            isDualPallet: this.state.isDualPallet,
            isManualMode: this.state.isManualMode,
            manualPositions: this.state.manualPositions,
            rad50Positions: this.state.rad50Positions,
            rad50UserEdited: this.state.rad50UserEdited,
            showDimCenter: this.state.showDimCenter,
            showDimGap: this.state.showDimGap,
            showDimEdges: this.state.showDimEdges,
            exportMode: this.state.exportMode,
            isLightTheme: this.state.isLightTheme,
            palOverrideX: this.state.palOverrideX,
            palOverrideY: this.state.palOverrideY
        };
        localStorage.setItem('kuka_hmi_state', JSON.stringify(stateToSave));
    },

    loadState() {
        try {
            const saved = localStorage.getItem('kuka_hmi_state');
            if (saved) {
                const p = JSON.parse(saved);
                if (!p || typeof p !== 'object') return;

                const inRange = (v, min, max) => this.isNum(v) && v >= min && v <= max;

                if (inRange(p.width, 200, 900)) this.state.width = p.width;
                if (inRange(p.length, 400, 3000)) this.state.length = p.length;
                if (inRange(p.gapH, 0, 500)) {
                    this.state.gapH = p.gapH;
                    if (this.state.gapH < 50 && this.state.gapH > 0) this.state.gapH = 200;
                }

                if (inRange(p.gapW, 0, 500)) this.state.gapW = p.gapW;
                if (inRange(p.dizilimId, 1, 12)) this.state.dizilimId = p.dizilimId;
                if (typeof p.currentProject === 'string' && this.config.projects[p.currentProject]) {
                    this.state.currentProject = p.currentProject;
                }

                if (this.isBool(p.isDualPallet)) this.state.isDualPallet = p.isDualPallet;
                if (this.isBool(p.isManualMode)) this.state.isManualMode = p.isManualMode;

                if (p.manualPositions) {
                    const valid = this.validatePositions(p.manualPositions);
                    if (valid) this.state.manualPositions = valid;
                }
                if (p.rad50Positions) {
                    const valid = this.validatePositions(p.rad50Positions);
                    if (valid) this.state.rad50Positions = valid;
                }

                if (this.isBool(p.rad50UserEdited)) this.state.rad50UserEdited = p.rad50UserEdited;
                if (this.isBool(p.showDimCenter)) this.state.showDimCenter = p.showDimCenter;
                if (this.isBool(p.showDimGap)) this.state.showDimGap = p.showDimGap;
                if (this.isBool(p.showDimEdges)) this.state.showDimEdges = p.showDimEdges;
                if (inRange(p.exportMode, 0, 1)) this.state.exportMode = p.exportMode;
                if (this.isBool(p.isLightTheme)) {
                    this.state.isLightTheme = p.isLightTheme;
                    if (this.state.isLightTheme) document.body.classList.add('light-theme');
                }
                if (inRange(p.palOverrideX, 0, 5000)) this.state.palOverrideX = p.palOverrideX;
                if (inRange(p.palOverrideY, 0, 5000)) this.state.palOverrideY = p.palOverrideY;

                if (this.dom.projectSelect) this.dom.projectSelect.value = this.state.currentProject;
                if (this.dom.inW) this.dom.inW.value = this.state.width;
                if (this.dom.inL) this.dom.inL.value = this.state.length;
                if (this.dom.gapW) this.dom.gapW.value = this.state.gapW;
                if (this.dom.gapH) this.dom.gapH.value = this.state.gapH;
                if (this.dom.palW50) this.dom.palW50.value = this.state.palOverrideX;
                if (this.dom.palH50) this.dom.palH50.value = this.state.palOverrideY;

                if (document.getElementById('chkDimCenter')) document.getElementById('chkDimCenter').checked = this.state.showDimCenter;
                if (document.getElementById('chkDimGap')) document.getElementById('chkDimGap').checked = this.state.showDimGap;
                if (document.getElementById('chkDimEdges')) document.getElementById('chkDimEdges').checked = this.state.showDimEdges;
                if (document.getElementById('chkDimCenter-m')) document.getElementById('chkDimCenter-m').checked = this.state.showDimCenter;
                if (document.getElementById('chkDimGap-m')) document.getElementById('chkDimGap-m').checked = this.state.showDimGap;
                if (document.getElementById('chkDimEdges-m')) document.getElementById('chkDimEdges-m').checked = this.state.showDimEdges;
            }
        } catch (e) {
            // Silently handle localStorage or JSON.parse errors
        }
    }
};
