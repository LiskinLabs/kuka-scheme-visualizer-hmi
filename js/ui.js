export const ui = {
    dom: {},
    init() {
        this.cacheDom();
        this.initEventListeners();
        this.initLengths();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.loadState();
        this.selectProject();
        this.syncPanelsUI();
        this.setLang(this.state.lang); // Apply initial translation
        console.log("HMI Visualizer v3.2 Industrial Restored");
    },

    cacheDom() {
        const ids = ['projectSelect', 'inW', 'inL', 'm-inW', 'm-inL', 'gapW', 'gapH', 'palletArea', 'pallet', 'pallet2', 'centerMark', 'axisX', 'axisY', 'vizTitle', 'statCount', 'statAngle', 'exportToggle', 'radPositionsPanel', 'radPosResetBtn', 'palletSizeControls', 'palW50', 'palH50', 'iW', 'iL', 'iA', 'iC', 'iP', 'iLyr', 'iTot', 'btnRU', 'btnTR', 'btnUZ', 'btnToggleAll', 'lblToggleAll', 'singleViewArea', 'allLayoutsGrid', 'btnMatrix', 'lblMatrix', 'manualModeToggle', 'btnAutoMode', 'btnManualMode', 'manualAddPanel', 'manW', 'manL', 'dizilimGridContainer', 'leftPanel', 'rightPanel', 'leftPanelIcon', 'rightPanelIcon', 'btnOpenLeft', 'btnOpenRight', 'contextMenu', 'ctxRotate', 'ctxDelete', 'btnDomestic', 'btnExport', 'mTopRadSize', 'mTopPalSize', 'm-exportModeSection', 'm-btnDomestic', 'm-btnExport'];
        ids.forEach(id => this.dom[id] = document.getElementById(id));
        this.dom.dizilimGrid = document.querySelector('.dizilim-grid');
        this.dom.palletModeSelector = document.getElementById('palletModeSelector');
        this.dom.manualControlsGroup = document.getElementById('manualControlsGroup');

        this.dom.dizilimButtons = [];
        for (let i = 1; i <= 12; i++) {
            this.dom.dizilimButtons[i] = document.getElementById('b' + i);
        }
        this.dom.modeButtons = [document.getElementById('m1'), document.getElementById('m2')];
        this.dom.exportButtons = [document.getElementById('btnDomestic'), document.getElementById('btnExport')];
    },

    initLengths() {
        const populate = (el, values) => {
            if (!el) return;
            el.innerHTML = '';
            const fragment = document.createDocumentFragment();
            values.forEach(v => {
                const opt = document.createElement('option');
                opt.value = opt.textContent = v;
                fragment.appendChild(opt);
            });
            el.appendChild(fragment);
        };

        const widths = [200, 300, 400, 500, 600, 900];
        const lengths = [];
        for (let i = 400; i <= 3000; i += 100) lengths.push(i);

        populate(this.dom.inW, widths);
        populate(this.dom['m-inW'], widths);
        populate(this.dom.inL, lengths);
        populate(this.dom['m-inL'], lengths);

        if (this.dom.inW) this.dom.inW.value = 200;
        if (this.dom.inL) this.dom.inL.value = 400;
    },

    updateClock() {
        // Clock removed from UI
    },

    closeAllPanels() {
        this.state.isLeftPanelOpen = false;
        this.state.isRightPanelOpen = false;
        const isMobile = window.innerWidth <= 640;
        const leftOffset = isMobile ? '-100%' : '-120%';
        const rightOffset = isMobile ? '100%' : '120%';
        if (this.dom.leftPanel) {
            if(this.dom.leftPanel) this.dom.leftPanel.style.transform = `translateX(${leftOffset})`;
            if (this.dom.leftPanelIcon) this.dom.leftPanelIcon.className = 'fas fa-chevron-right';
        }
        if (this.dom.rightPanel) {
            if(this.dom.rightPanel) this.dom.rightPanel.style.transform = `translateX(${rightOffset})`;
            if (this.dom.rightPanelIcon) this.dom.rightPanelIcon.className = 'fas fa-chevron-left';
        }
        if (this.dom.btnOpenLeft) this.dom.btnOpenLeft.classList.remove('hidden');
        if (this.dom.btnOpenRight) this.dom.btnOpenRight.classList.remove('hidden');
        const backdrop = document.getElementById('mobileBackdrop');
        if (backdrop) backdrop.classList.add('hidden');
    },

    syncPanelsUI() {
        const isMobile = window.innerWidth <= 640;
        if (isMobile) {
            this.toggleManualMode(false);
            this.state.showDimCenter = false;
            this.state.showDimGap = false;
            if (document.getElementById('chkDimCenter')) document.getElementById('chkDimCenter').checked = false;
            if (document.getElementById('chkDimGap')) document.getElementById('chkDimGap').checked = false;
            if (document.getElementById('chkDimCenter-m')) document.getElementById('chkDimCenter-m').checked = false;
            if (document.getElementById('chkDimGap-m')) document.getElementById('chkDimGap-m').checked = false;
            this.closeAllPanels();
        } else {
            this.state.isLeftPanelOpen = true;
            this.state.isRightPanelOpen = true;
            if (this.dom.leftPanel) {
                if(this.dom.leftPanel) this.dom.leftPanel.style.transform = 'translateX(0)';
                if (this.dom.leftPanelIcon) this.dom.leftPanelIcon.className = 'fas fa-chevron-left';
            }
            if (this.dom.rightPanel) {
                if(this.dom.rightPanel) this.dom.rightPanel.style.transform = 'translateX(0)';
                if (this.dom.rightPanelIcon) this.dom.rightPanelIcon.className = 'fas fa-chevron-right';
            }
            if (this.dom.btnOpenLeft) this.dom.btnOpenLeft.classList.add('hidden');
            if (this.dom.btnOpenRight) this.dom.btnOpenRight.classList.add('hidden');
            const backdrop = document.getElementById('mobileBackdrop');
            if (backdrop) backdrop.classList.add('hidden');
        }
    },

    toggleLeftPanel() {
        const isMobile = window.innerWidth <= 640;
        if (isMobile && this.state.isRightPanelOpen && !this.state.isLeftPanelOpen) {
            this.state.isRightPanelOpen = false;
            if (this.dom.rightPanel) if(this.dom.rightPanel) this.dom.rightPanel.style.transform = 'translateX(100%)';
            if (this.dom.btnOpenRight) this.dom.btnOpenRight.classList.remove('hidden');
        }
        this.state.isLeftPanelOpen = !this.state.isLeftPanelOpen;
        const offset = isMobile ? '-100%' : '-120%';
        if (this.dom.leftPanel) {
            if (this.state.isLeftPanelOpen) {
                if(this.dom.leftPanel) this.dom.leftPanel.style.transform = 'translateX(0)';
                if (this.dom.leftPanelIcon) this.dom.leftPanelIcon.className = 'fas fa-chevron-left';
            } else {
                if(this.dom.leftPanel) this.dom.leftPanel.style.transform = `translateX(${offset})`;
                if (this.dom.leftPanelIcon) this.dom.leftPanelIcon.className = 'fas fa-chevron-right';
            }
        }
        if (this.dom.btnOpenLeft) {
            if (this.state.isLeftPanelOpen) {
                this.dom.btnOpenLeft.classList.add('hidden');
            } else {
                this.dom.btnOpenLeft.classList.remove('hidden');
            }
        }
        const backdrop = document.getElementById('mobileBackdrop');
        if (backdrop) {
            if (isMobile && (this.state.isLeftPanelOpen || this.state.isRightPanelOpen)) {
                backdrop.classList.remove('hidden');
            } else {
                backdrop.classList.add('hidden');
            }
        }
    },

    toggleRightPanel() {
        const isMobile = window.innerWidth <= 640;
        if (isMobile && this.state.isLeftPanelOpen && !this.state.isRightPanelOpen) {
            this.state.isLeftPanelOpen = false;
            if (this.dom.leftPanel) if(this.dom.leftPanel) this.dom.leftPanel.style.transform = 'translateX(-100%)';
            if (this.dom.btnOpenLeft) this.dom.btnOpenLeft.classList.remove('hidden');
        }
        this.state.isRightPanelOpen = !this.state.isRightPanelOpen;
        const offset = isMobile ? '100%' : '120%';
        if (this.dom.rightPanel) {
            if (this.state.isRightPanelOpen) {
                if(this.dom.rightPanel) this.dom.rightPanel.style.transform = 'translateX(0)';
                if (this.dom.rightPanelIcon) this.dom.rightPanelIcon.className = 'fas fa-chevron-right';
            } else {
                if(this.dom.rightPanel) this.dom.rightPanel.style.transform = `translateX(${offset})`;
                if (this.dom.rightPanelIcon) this.dom.rightPanelIcon.className = 'fas fa-chevron-left';
            }
        }
        if (this.dom.btnOpenRight) {
            if (this.state.isRightPanelOpen) {
                this.dom.btnOpenRight.classList.add('hidden');
            } else {
                this.dom.btnOpenRight.classList.remove('hidden');
            }
        }
        const backdrop = document.getElementById('mobileBackdrop');
        if (backdrop) {
            if (isMobile && (this.state.isLeftPanelOpen || this.state.isRightPanelOpen)) {
                backdrop.classList.remove('hidden');
            } else {
                backdrop.classList.add('hidden');
            }
        }
    },

    toggleTheme() {
        this.state.isLightTheme = !this.state.isLightTheme;
        if (this.state.isLightTheme) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        this.saveState();
    },

    selectProject() {
        this.state.currentProject = this.dom.projectSelect?.value || '24048';
        const is50 = this.state.currentProject === '24050';
        if (this.dom.manualModeToggle) this.dom.manualModeToggle.style.display = 'grid';
        if(this.dom.exportToggle) this.dom.exportToggle.style.display = is50 ? 'flex' : 'none';
        if(this.dom['m-exportModeSection']) this.dom['m-exportModeSection'].style.display = is50 ? 'flex' : 'none';
        if (this.dom.palletModeSelector) this.dom.palletModeSelector.style.display = is50 ? 'none' : 'grid';
        if (this.dom.btnMatrix) this.dom.btnMatrix.style.display = 'block';
        if (is50) {
            this.state.isDualPallet = false;
            this.state.palOverrideX = 0;
            this.state.palOverrideY = 0;
            this.state.rad50UserEdited = false;
        }
        this.updateManualUI();
        this.calc();
    },

    toggleManualMode(isManual) {
        this.state.isManualMode = isManual;
        this.updateManualUI();
        this.calc();
    },

    updateManualUI() {
        const is50 = this.state.currentProject === '24050';
        if (this.dom.btnAutoMode) this.dom.btnAutoMode.classList.toggle('active', !this.state.isManualMode);
        if (this.dom.btnManualMode) this.dom.btnManualMode.classList.toggle('active', this.state.isManualMode);
        if (this.dom.manualAddPanel) this.dom.manualAddPanel.style.display = this.state.isManualMode ? 'block' : 'none';
        if (this.dom.dizilimGridContainer) this.dom.dizilimGridContainer.style.display = this.state.isManualMode ? 'none' : 'grid';
        if(this.dom.radPositionsPanel) this.dom.radPositionsPanel.style.display = this.state.isManualMode ? '' : 'none';
        if(this.dom.radPosResetBtn) this.dom.radPosResetBtn.style.display = this.state.isManualMode ? '' : 'none';
        if(this.dom.palletSizeControls) this.dom.palletSizeControls.style.display = this.state.isManualMode ? 'flex' : 'none';
        if (this.dom.gapW) this.dom.gapW.disabled = !this.state.isManualMode;
        if (this.dom.gapH) this.dom.gapH.disabled = !this.state.isManualMode;
        if (this.dom.manualControlsGroup) {
            if(this.dom.manualControlsGroup) this.dom.manualControlsGroup.style.opacity = this.state.isManualMode ? '1' : '0.4';
            if(this.dom.manualControlsGroup) this.dom.manualControlsGroup.style.pointerEvents = this.state.isManualMode ? 'auto' : 'none';
        }
    },

    addManualRadiator() {

        const w = parseInt(this.dom.manW?.value) || this.state.width;
        const l = parseInt(this.dom.manL?.value) || this.state.length;
        this.state.manualPositions.push({
            n: this.state.manualPositions.length + 1,
            x: 0, y: 0, angle: 0, w: w, l: l
        });
        this.render();
    },

    toggleDim(type, isChecked) {
        if (type === 'center') this.state.showDimCenter = isChecked;
        if (type === 'gap') this.state.showDimGap = isChecked;
        if (type === 'edges') this.state.showDimEdges = isChecked;
        this.render();
    },

    setMode(isDual) {
        this.state.isDualPallet = !!isDual;
        if (this.dom.modeButtons[0]) this.dom.modeButtons[0].classList.toggle('active', !isDual);
        if (this.dom.modeButtons[1]) this.dom.modeButtons[1].classList.toggle('active', isDual);
        this.calc();
    },

    toggleExport(mode) {
        this.state.exportMode = mode;
        if (this.dom.exportButtons[0]) this.dom.exportButtons[0].classList.toggle('active', !mode);
        if (this.dom.exportButtons[1]) this.dom.exportButtons[1].classList.toggle('active', mode);
        if (this.dom['m-btnDomestic']) this.dom['m-btnDomestic'].classList.toggle('active', !mode);
        if (this.dom['m-btnExport']) this.dom['m-btnExport'].classList.toggle('active', mode);
        this.calc();
    },

    calc() {
        if (!this.dom.inW || !this.dom.inL) return;
        this.state.width = parseInt(this.dom.inW.value);
        this.state.length = parseInt(this.dom.inL.value);
        if (this.dom.gapW) this.state.gapW = parseInt(this.dom.gapW.value) || 0;
        if (this.dom.gapH) this.state.gapH = parseInt(this.dom.gapH.value) || 0;
        if (this.state.currentProject === '24050') {
            this.state.dizilimId = this.autoDizilim24050(this.state.width, this.state.length, this.state.exportMode);
            this.state.rad50UserEdited = false;
        } else {
            this.state.dizilimId = this.getDiz(this.state.width, this.state.length);
            this.state.isDualPallet = this.state.length > 1500;
        }
        this.updateDizilimActiveState();
        this.render();
    },

    selD(id) {
        if (id >= this.config.defW.length || id < 0) id = 2; // Default to D2
        this.state.dizilimId = id;
        this.state.width = this.config.defW[id] || 200;
        this.state.length = this.config.defL[id] || 1000;
        if (this.dom.inW) this.dom.inW.value = this.state.width;
        if (this.dom.inL) this.dom.inL.value = this.state.length;
        this.state.isDualPallet = this.state.length > 1500;
        this.updateDizilimActiveState();
        this.render();
    },

    updateDizilimActiveState() {
        const is50 = this.state.currentProject === '24050';
        for (let i = 1; i <= 12; i++) {
            const btn = this.dom.dizilimButtons[i];
            if (btn) {
                const shouldHide = is50 ? (i > 7) : (i === 1 || i === 5);
                if (shouldHide) {
                    btn.style.setProperty('display', 'none', 'important');
                } else {
                    btn.style.setProperty('display', 'flex', 'important');
                    btn.classList.toggle('active', i === this.state.dizilimId);
                    btn.textContent = `D${i}`;
                }
            }
        }
        if (this.dom.modeButtons[0]) this.dom.modeButtons[0].classList.toggle('active', !this.state.isDualPallet);
        if (this.dom.modeButtons[1]) this.dom.modeButtons[1].classList.toggle('active', this.state.isDualPallet);
    },

    toggleAllLayouts() {
        this.state.showAll = !this.state.showAll;
        if (!this.dom.btnToggleAll || !this.dom.singleViewArea || !this.dom.allLayoutsGrid) return;
        this.state.zoom = 1; this.state.panX = 0; this.state.panY = 0;
        this.applyTransform();
        if (this.state.showAll) {
            const txt = this.config.translations[this.state.lang].toggleAllHide;
            this.dom.btnToggleAll.innerHTML = '<i class="fas fa-eye-slash text-xs"></i><span id="lblToggleAll" class="hidden"></span>';
            const lbl = this.dom.btnToggleAll.querySelector("#lblToggleAll");
            if (lbl) lbl.textContent = txt;
            this.dom.btnToggleAll.classList.add('active');
            if (this.dom.palletArea) if(this.dom.palletArea) this.dom.palletArea.style.display = 'none';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.display = 'flex';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.flexDirection = 'column';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.gap = '40px';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.padding = '40px';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.transformOrigin = '0 0';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.position = 'absolute';

            document.querySelectorAll('.info-card').forEach(el => el.style.display = 'none');
            if(this.dom.btnManualMode) this.dom.btnManualMode.style.display = 'none';
            if(this.dom.btnAutoMode) this.dom.btnAutoMode.style.display = 'none';
            this.renderAllLayouts();
        } else {
            const txt = this.config.translations[this.state.lang].toggleAllShow;
            this.dom.btnToggleAll.innerHTML = '<i class="fas fa-th-large text-xs"></i><span id="lblToggleAll" class="hidden"></span>';
            const lbl = this.dom.btnToggleAll.querySelector("#lblToggleAll");
            if (lbl) lbl.textContent = txt;
            this.dom.btnToggleAll.classList.remove('active');
            if (this.dom.palletArea) if(this.dom.palletArea) this.dom.palletArea.style.display = 'flex';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.display = 'none';

            document.querySelectorAll('.info-card').forEach(el => el.style.display = '');
            if(this.dom.btnManualMode) this.dom.btnManualMode.style.display = '';
            if(this.dom.btnAutoMode) this.dom.btnAutoMode.style.display = '';
            this.render();
        }
    },

    resetView() { this.state.zoom = 1; this.state.panX = 0; this.state.panY = 0; this.applyTransform(); },

    applyTransform() {
        const transform = `translate3d(${this.state.panX}px, ${this.state.panY}px, 0) scale(${this.state.zoom})`;
        if (this.state.showAll && this.dom.allLayoutsGrid) {
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.transform = transform;

        } else if (this.dom.palletArea) {
            if(this.dom.palletArea) this.dom.palletArea.style.transform = transform;
        }
    },

    exportToImage() {
        const area = document.getElementById('singleViewArea'); if (!area) return;
        const targetElement = this.state.showAll ? this.dom.allLayoutsGrid : area;

        const oldPanX = this.state.panX, oldPanY = this.state.panY, oldZoom = this.state.zoom, oldOverflow = area.style.overflow, oldBg = area.style.backgroundColor;
        this.state.panX = 0; this.state.panY = 0; this.state.zoom = 1; this.applyTransform();

        area.style.overflow = 'visible'; area.style.backgroundColor = '#16161a';
        area.classList.add('export-active'); this.render();

        setTimeout(() => {
            html2canvas(targetElement, { backgroundColor: '#16161a', scale: 2, useCORS: true, scrollX: 0, scrollY: 0 }).then(canvas => {
                const link = document.createElement('a');
                let filename = this.state.showAll ? `KUKA_All_Schemes_${this.state.width}x${this.state.length}.png` : `KUKA_Scheme_${this.state.currentProject}_D${this.state.dizilimId}_${this.state.width}x${this.state.length}.png`;
                link.download = filename;
                link.href = canvas.toDataURL('image/png');
                link.click();

                this.state.panX = oldPanX; this.state.panY = oldPanY; this.state.zoom = oldZoom; this.applyTransform();
                area.style.overflow = oldOverflow; area.style.backgroundColor = oldBg; area.classList.remove('export-active');
            });
        }, 1000);
    },

    shareImage() {
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
    },

    updateRadPosition(idx, field, val) {
        if (this.state.isManualMode) { this.state.manualPositions[idx][field] = parseInt(val) || 0; }
        else { this.state.rad50Positions[idx][field] = parseInt(val) || 0; this.state.rad50UserEdited = true; }
        this.render();
    },

    rotateManualRad(idx) { if (!this.state.isManualMode) return; this.state.manualPositions[idx].angle = ((this.state.manualPositions[idx].angle || 0) + 90) % 360; this.render(); },

    removeManualRad(idx) { if (!this.state.isManualMode) return; this.state.manualPositions.splice(idx, 1); this.state.manualPositions.forEach((p, i) => p.n = i + 1); this.render(); },

    contextRotate() { if (this.state.contextRadIdx !== null) this.rotateManualRad(this.state.contextRadIdx); },

    contextDelete() { if (this.state.contextRadIdx !== null) this.removeManualRad(this.state.contextRadIdx); },

    resetRadPositions() { if (this.state.isManualMode) { this.state.manualPositions = []; } else { this.state.rad50UserEdited = false; } this.render(); },

    updatePalletSize() { this.state.palOverrideX = parseInt(this.dom.palW50?.value) || 0; this.state.palOverrideY = parseInt(this.dom.palH50?.value) || 0; this.render(); },

    resetPalletSize() { this.state.palOverrideX = 0; this.state.palOverrideY = 0; if (this.dom.palW50) this.dom.palW50.value = 0; if (this.dom.palH50) this.dom.palH50.value = 0; this.render(); },

    openMatrixModal() { let modal = document.getElementById('matrixModal'); if (!modal) { modal = this.buildMatrixModal(); } modal.style.display = 'flex'; },

    closeMatrixModal() { const modal = document.getElementById('matrixModal'); if (modal) modal.style.display = 'none'; },

    buildMatrixModal() {
        const overlay = document.createElement('div'); overlay.id = 'matrixModal'; overlay.className = 'modal-overlay'; overlay.onclick = (e) => { if (e.target === overlay) this.closeMatrixModal(); };
        const content = document.createElement('div'); content.className = 'modal-content'; content.style.width = '90vw'; content.style.maxWidth = '1200px';

        const header = document.createElement('div');
        header.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 2px solid var(--kuka-orange); padding-bottom: 10px;";
        const h3 = document.createElement('h3');
        h3.style.cssText = "margin:0; color:var(--kuka-orange);";
        h3.innerHTML = `<i class="fas fa-table"></i> ${this.escapeHTML(this.config.translations[this.state.lang].matrix)} (24048/49/50)`;
        header.appendChild(h3);
        const closeBtn = document.createElement('button');
        closeBtn.onclick = () => this.closeMatrixModal();
        closeBtn.style.cssText = "background:none;border:none;color:white;font-size:30px;cursor:pointer;";
        closeBtn.innerHTML = '&times;';
        header.appendChild(closeBtn);
        content.appendChild(header);

        const widths = [200, 300, 400, 500, 600, 900];
        const container = document.createElement('div');
        container.style.cssText = "max-height: 70vh; overflow-y: auto; padding-right: 10px;";

        widths.forEach(w => {
            const h4 = document.createElement('h4');
            h4.style.cssText = "color:#FFF; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px; margin-top:20px; font-size:18px;";
            h4.textContent = `Genişlik: ${w} mm`;
            container.appendChild(h4);

            const grid = document.createElement('div');
            grid.style.cssText = "display:flex; flex-wrap:wrap; gap:8px;";

            for (let l = 400; l <= 3000; l += 100) {
                let d = this.getDiz(w, l), isPal2 = l > 1500, bgClass = isPal2 ? 'pal-2' : 'pal-1', palText = isPal2 ? '2 Palet' : '1 Palet';
                const cell = document.createElement('div');
                cell.className = `matrix-cell ${bgClass}`;
                cell.style.cssText = "padding:10px; border:1px solid rgba(255,255,255,0.1); border-radius:4px; text-align:center; min-width:80px;";
                cell.onclick = () => this.selectFromMatrix(w, l);

                const lDiv = document.createElement('div'); lDiv.style.cssText = "font-size:16px; color:#fff; margin-bottom: 4px;"; lDiv.textContent = `L: ${l}`;
                const dDiv = document.createElement('div'); dDiv.style.cssText = "font-size:15px; color:var(--kuka-orange); font-weight:bold; margin-bottom: 2px;"; dDiv.textContent = `D${d}`;
                const pDiv = document.createElement('div'); pDiv.style.cssText = "font-size:11px; opacity:0.8;"; pDiv.textContent = palText;

                cell.appendChild(lDiv); cell.appendChild(dDiv); cell.appendChild(pDiv);
                grid.appendChild(cell);
            }
            container.appendChild(grid);
        });
        content.appendChild(container);

        const footer = document.createElement('div');
        footer.style.cssText = "margin-top:15px; font-size:13px; display:flex; gap:15px; justify-content: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);";
        footer.innerHTML = `<div style="display:flex; align-items:center; gap:5px;"><div style="width:15px;height:15px; border-radius:3px;" class="pal-1"></div> <= 1500mm (1 Palet)</div><div style="display:flex; align-items:center; gap:5px;"><div style="width:15px;height:15px; border-radius:3px;" class="pal-2"></div> >= 1600mm (2 Palet)</div>`;
        content.appendChild(footer);

        overlay.appendChild(content); document.body.appendChild(overlay); return overlay;
    },

    selectFromMatrix(w, l) { if (this.dom.inW) this.dom.inW.value = w; if (this.dom.inL) this.dom.inL.value = l; this.closeMatrixModal(); this.calc(); },

    setLang(lang) {
        this.state.lang = lang;
        ['ru', 'tr', 'uz'].forEach(l => {
            const btns = document.querySelectorAll('.lang-btn-' + l);
            const isActive = l === lang;
            btns.forEach(btn => {
                if (isActive) {
                    btn.classList.add('bg-[#FF6B2C]', 'text-[#121212]');
                    btn.classList.remove('text-cad-muted', 'hover:text-white');
                } else {
                    btn.classList.remove('bg-[#FF6B2C]', 'text-[#121212]');
                    btn.classList.add('text-cad-muted', 'hover:text-white');
                }
            });
        });
        const t = this.config.translations[lang];
        const map = { lblControls: 'controls', lblProject: 'project', lblWidth: 'width', lblLength: 'length', lblCalc: 'calc', lblLayout: 'layout', lblInfo: 'info', lblRadiator: 'radiator', lblW2: 'widthL', lblL2: 'lengthL', lblPlacement: 'placement', lblAngle: 'angle', lblPcs: 'pcs', lblLayers: 'layers', lblTotal: 'total', lblPallet: 'pallet', lblPalSize: 'palSize', lblLegend: 'legend', lblLegRad: 'legRad', lblLegPal: 'legPal', lbl1Pal: 'p1', lbl2Pal: 'p2', lblDom: 'dom', lblExp: 'exp', lblReset: 'reset', lblToggleAll: this.state.showAll ? 'toggleAllHide' : 'toggleAllShow', lblPrint: 'print', lblMatrix: 'matrix',
            lblProperties: 'properties', lblViewDims: 'viewDims', lblManualConfig: 'manualConfig', lblAddRadiator: 'addRadiator', lblAddBtn: 'addBtn', lblAutoAlign: 'autoAlign', lblOverrideSize: 'overrideSize', lblOptions: 'options', lblDimensions: 'dimensions', lblPlacementMode: 'placementMode', lblToggleGrid: 'toggleGrid', lblShareImage: 'shareImage', lblCtxRotate: 'ctxRotate', lblCtxDelete: 'ctxDelete', lblWidthM: 'width', lblLengthM: 'length'
        };
        Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = t[map[id]]; });

        // Handle class-based replacements for multiple elements
        document.querySelectorAll('.lblCenterDimsTxt').forEach(el => el.textContent = t['centerDims']);
        document.querySelectorAll('.lblGapDimsTxt').forEach(el => el.textContent = t['gapDims']);
        document.querySelectorAll('.lblEdgeDimsTxt').forEach(el => el.textContent = t['edgeDims']);

        // Handle Tooltips (titles)
        const tooltips = { btnAutoModeT: 'ttAutoMode', btnManualModeT: 'ttManualMode', btnResetViewT: 'ttResetView', m1T: 'p1', m2T: 'p2', btnDomesticT: 'dom', btnExportT: 'exp', btnToggleAllT: 'ttShowAll', btnMatrixT: 'matrix', btnPrintT: 'print', btnExportImgT: 'ttDownload'};
        Object.keys(tooltips).forEach(id => { const el = document.getElementById(id); if (el) el.title = t[tooltips[id]]; });
        this.render();
    }
};
