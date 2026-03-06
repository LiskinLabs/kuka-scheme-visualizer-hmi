/**
 * KUKA HMI VISUALIZER - Core Logic v3.1 (Modern Web Edition)
 * Refactored for performance, maintainability, and modern browsers.
 */

const HmiApp = {
    // --- State ---
    state: {
        currentProject: '24048',
        isDualPallet: false,
        width: 200,
        length: 500,
        dizilimId: 2,
        lang: 'tr',
        gapW: 50,
        gapH: 200,
        exportMode: 0, // 0 = Domestic, 1 = Export
        rad50Positions: [],
        rad50UserEdited: false,
        isManualMode: false,
        manualPositions: [],
        showDimCenter: false,
        showDimGap: true,
            showDimEdges: false,
        palOverrideX: 0,
        palOverrideY: 0,
        scale: 0.22,
        showAll: false,
        zoom: 1,
        panX: 0,
        panY: 0,
        isLeftPanelOpen: true,
        isRightPanelOpen: true,
        isLightTheme: false,
        contextRadIdx: null
    },

    // --- Configuration ---
    config: {
        projects: {
            '24048': { type: 'fixed', pallets: { single: { x: 1200, y: 800 }, double: { x: 2400, y: 800 } } },
            '24049': { type: 'fixed', pallets: { single: { x: 1200, y: 800 }, double: { x: 2400, y: 800 } } },
            '24050': { type: 'dynamic', pallets: null }
        },
        defW: [0, 0, 200, 200, 200, 0, 300, 300, 300, 400, 400, 900, 600],
        defL: [0, 0, 500, 700, 900, 0, 500, 700, 900, 600, 900, 500, 400],
        translations: {
            ru: { controls: 'Панель управления', project: 'Проект', width: 'Ширина (мм)', length: 'Длина (мм)', calc: 'Рассчитать', layout: 'Схема укладки', info: 'Информация', radiator: 'Радиатор', widthL: 'Ширина:', lengthL: 'Длина:', placement: 'Размещение', angle: 'Угол:', pcs: 'Шт/слой:', layers: 'Слоев:', total: 'Всего:', pallet: 'Паллета', palSize: 'Размер:', overflow: 'Выход:', legend: 'ЛЕГЕНДА', legRad: 'Радиатор', legPal: 'Паллета', copyKrl: 'Копировать KRL', krlCopied: 'KRL скопирован!', toggleAllShow: 'Показать все', toggleAllHide: 'Режим 1 схемы', print: 'Печать', p1: '1 Паллета', p2: '2 Паллеты', dom: 'Внутренний', exp: 'На экспорт', reset: 'Сброс позиций', matrix: 'Матрица укладки' },
            tr: { controls: 'Kontrol Paneli', project: 'Proje', width: 'Genişlik (mm)', length: 'Uzunluk (mm)', calc: 'Hesapla', layout: 'Dizilim Şeması', info: 'Bilgiler', radiator: 'Radyatör', widthL: 'Genişlik:', lengthL: 'Uzunluk:', placement: 'Yerleşim', angle: 'Açı:', pcs: 'Adet/kat:', layers: 'Kat Sayısı:', total: 'Toplam:', pallet: 'Palet', palSize: 'Boyut:', overflow: 'Taşma:', legend: 'LEJANT', legRad: 'Radyatör', legPal: 'Palet', copyKrl: 'KRL Kopyala', krlCopied: 'KRL Kopyalandı!', toggleAllShow: 'Tümünü Göster', toggleAllHide: 'Tekli Görünüme Dön', print: 'Yazdır (Print)', p1: '1 Palet', p2: '2 Palet', dom: 'Domestic', exp: 'Export', reset: 'Reset Positions', matrix: 'Dizilim Matrisi' },
            uz: { controls: 'Boshqaruv paneli', project: 'Loyiha', width: 'Kenglik (mm)', length: 'Uzunlik (mm)', calc: 'Hisoblash', layout: 'Joylashtirish sxemasi', info: 'Ma\'lumot', radiator: 'Radiator', widthL: 'Kenglik:', lengthL: 'Uzunlik:', placement: 'Joylashtirish', angle: 'Burchak:', pcs: 'Dona/qat:', layers: 'Qatlamlar:', total: 'Jami:', pallet: 'Palet', palSize: 'O\'lcham:', overflow: 'Chiqish:', legend: 'LEGEND', legRad: 'Radiator', legPal: 'Palet', copyKrl: 'KRL Nusxalash', krlCopied: 'KRL Nusxalandi!', toggleAllShow: 'Barchasini ko\'rsatish', toggleAllHide: 'Yagona Ko\'rinishga Qaytish', print: 'Chop etish', p1: '1 Palet', p2: '2 Palet', dom: 'Mahalliy', exp: 'Eksport', reset: 'Holatni tiklash', matrix: 'Matritsa' }
        }
    },

    // --- DOM Cache ---
    dom: {},

    // --- Initialization ---
    init() {
        this.cacheDom();
        this.initEventListeners();
        this.initLengths();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.loadState();
        this.selectProject(); // Initial setup
        this.syncPanelsUI();
        console.log("HMI Visualizer v3.1 Ready");
    },

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
            isLightTheme: this.state.isLightTheme
        };
        localStorage.setItem('kuka_hmi_state', JSON.stringify(stateToSave));
    },

    loadState() {
        try {
            const saved = localStorage.getItem('kuka_hmi_state');
            if (saved) {
                const p = JSON.parse(saved);
                if (p.width) this.state.width = p.width;
                if (p.length) this.state.length = p.length;
                if (p.gapW !== undefined) this.state.gapW = p.gapW;
                if (p.gapH !== undefined) this.state.gapH = p.gapH;
                if (p.dizilimId) this.state.dizilimId = p.dizilimId;
                if (p.currentProject) this.state.currentProject = p.currentProject;
                if (p.isDualPallet !== undefined) this.state.isDualPallet = p.isDualPallet;
                if (p.isManualMode !== undefined) this.state.isManualMode = p.isManualMode;
                if (p.manualPositions) this.state.manualPositions = p.manualPositions;
                if (p.rad50Positions) this.state.rad50Positions = p.rad50Positions;
                if (p.rad50UserEdited !== undefined) this.state.rad50UserEdited = p.rad50UserEdited;
                if (p.showDimCenter !== undefined) this.state.showDimCenter = p.showDimCenter;
                if (p.showDimGap !== undefined) this.state.showDimGap = p.showDimGap;
                if (p.showDimEdges !== undefined) this.state.showDimEdges = p.showDimEdges;
                if (p.exportMode !== undefined) this.state.exportMode = p.exportMode;
                if (p.isLightTheme !== undefined) this.state.isLightTheme = p.isLightTheme;

                if (this.state.isLightTheme) {
                    document.body.classList.add('light-theme');
                    if (this.dom.themeIcon) this.dom.themeIcon.className = 'fas fa-sun text-lg';
                }

                if (this.dom.projectSelect) this.dom.projectSelect.value = this.state.currentProject;
                if (this.dom.inW) this.dom.inW.value = this.state.width;
                if (this.dom.inL) this.dom.inL.value = this.state.length;
                if (this.dom.gapW) this.dom.gapW.value = this.state.gapW;
                if (this.dom.gapH) this.dom.gapH.value = this.state.gapH;
                if (document.getElementById('chkDimCenter')) document.getElementById('chkDimCenter').checked = this.state.showDimCenter;
                if (document.getElementById('chkDimGap')) document.getElementById('chkDimGap').checked = this.state.showDimGap;
                if (document.getElementById('chkDimEdges')) document.getElementById('chkDimEdges').checked = this.state.showDimEdges;
            }
        } catch (e) {
            console.error('Failed to load state from localStorage', e);
        }
    },

    cacheDom() {
        const ids = ['projectSelect', 'inW', 'inL', 'gapW', 'gapH', 'palletArea', 'pallet', 'pallet2', 'centerMark', 'axisX', 'axisY', 'vizTitle', 'statCount', 'statAngle', 'cellNumber', 'currentTime', 'exportToggle', 'radPositionsPanel', 'radPosResetBtn', 'palletSizeControls', 'palW50', 'palH50', 'iW', 'iL', 'iA', 'iC', 'iP', 'iLyr', 'iTot', 'btnRU', 'btnTR', 'btnUZ', 'btnToggleAll', 'lblToggleAll', 'singleViewArea', 'allLayoutsGrid', 'btnMatrix', 'lblMatrix', 'manualModeToggle', 'btnAutoMode', 'btnManualMode', 'manualAddPanel', 'manW', 'manL', 'dizilimGridContainer', 'leftPanel', 'rightPanel', 'leftPanelIcon', 'rightPanelIcon', 'btnOpenLeft', 'btnOpenRight', 'themeIcon', 'contextMenu', 'ctxRotate', 'ctxDelete', 'minimapContainer', 'minimapView'];
        ids.forEach(id => this.dom[id] = document.getElementById(id));
        this.dom.dizilimGrid = document.querySelector('.dizilim-grid');
        this.dom.palletModeSelector = document.getElementById('palletModeSelector');
        this.dom.manualControlsGroup = document.getElementById('manualControlsGroup');

        // Cached Arrays
        this.dom.dizilimButtons = [];
        for (let i = 1; i <= 12; i++) {
            this.dom.dizilimButtons[i] = document.getElementById('b' + i);
        }
        this.dom.modeButtons = [document.getElementById('m1'), document.getElementById('m2')];
        this.dom.exportButtons = [document.getElementById('btnDomestic'), document.getElementById('btnExport')];
    },

    initEventListeners() {
        window.addEventListener('beforeprint', () => {
            if (this.dom.palletArea) {
                // Dynamically scale #palletArea to fit A4 page.
                // Using 1000x700 as approximate A4 bounding area limit.
                let s = this.state.s || 1;
                const palSize = this.state.schemes[this.state.activeScheme].pal;
                const palW = palSize.x * s;
                const palH = palSize.y * s;

                let maxBoundsX = palW + 300;
                let maxBoundsY = palH + 300;

                let scaleX = 1000 / maxBoundsX;
                let scaleY = 700 / maxBoundsY;
                let scale = Math.min(scaleX, scaleY);
                if (scale > 0.6) scale = 0.6; // cap scale to prevent huge zoom

                this.dom.palletArea.style.setProperty('transform', `scale(${scale})`, 'important');
                this.dom.palletArea.style.setProperty('transform-origin', 'top center', 'important');
                this.dom.palletArea.style.setProperty('position', 'absolute', 'important');
                this.dom.palletArea.style.setProperty('top', '0', 'important');
                this.dom.palletArea.style.setProperty('left', '0', 'important');
            }
        });
        window.addEventListener('afterprint', () => {
            if (this.dom.palletArea) {
                this.dom.palletArea.style.removeProperty('transform');
                this.dom.palletArea.style.removeProperty('transform-origin');
                this.dom.palletArea.style.removeProperty('position');
                this.dom.palletArea.style.removeProperty('top');
                this.dom.palletArea.style.removeProperty('left');
            }
            this.applyTransform();
        });

        window.addEventListener('resize', () => {
            this.syncPanelsUI();
            this.render();
        });
        if (this.dom.inW) this.dom.inW.onchange = () => this.calc();
        if (this.dom.inL) this.dom.inL.onchange = () => this.calc();
        if (this.dom.gapW) this.dom.gapW.onchange = () => this.calc();
        if (this.dom.gapH) this.dom.gapH.onchange = () => this.calc();
        
        // Context menu close click
        document.addEventListener('click', (e) => {
            if (this.dom.contextMenu && !this.dom.contextMenu.classList.contains('hidden')) {
                this.hideContextMenu();
            }
        });
    },

    initLengths() {
        if (!this.dom.inL) return;
        this.dom.inL.innerHTML = '';
        for (let i = 400; i <= 3000; i += 100) {
            const opt = document.createElement('option');
            opt.value = opt.textContent = i;
            this.dom.inL.appendChild(opt);
        }
        this.dom.inL.value = 400;
    },

    // --- Logic ---
    updateClock() {
        const now = new Date();
        if (this.dom.currentTime) {
            this.dom.currentTime.textContent = now.toLocaleTimeString();
        }
    },

    closeAllPanels() {
        this.state.isLeftPanelOpen = false;
        this.state.isRightPanelOpen = false;

        const isMobile = window.innerWidth <= 640;
        const leftOffset = isMobile ? '-100%' : '-120%';
        const rightOffset = isMobile ? '100%' : '120%';

        if (this.dom.leftPanel) {
            this.dom.leftPanel.style.transform = `translateX(${leftOffset})`;
            if (this.dom.leftPanelIcon) this.dom.leftPanelIcon.className = 'fas fa-chevron-right';
        }
        if (this.dom.rightPanel) {
            this.dom.rightPanel.style.transform = `translateX(${rightOffset})`;
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
            this.closeAllPanels();
        } else {
            this.state.isLeftPanelOpen = true;
            this.state.isRightPanelOpen = true;
            if (this.dom.leftPanel) {
                this.dom.leftPanel.style.transform = 'translateX(0)';
                if (this.dom.leftPanelIcon) this.dom.leftPanelIcon.className = 'fas fa-chevron-left';
            }
            if (this.dom.rightPanel) {
                this.dom.rightPanel.style.transform = 'translateX(0)';
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
            if (this.dom.rightPanel) this.dom.rightPanel.style.transform = 'translateX(100%)';
            if (this.dom.btnOpenRight) this.dom.btnOpenRight.classList.remove('hidden');
        }

        this.state.isLeftPanelOpen = !this.state.isLeftPanelOpen;
        const offset = isMobile ? '-100%' : '-120%';

        if (this.dom.leftPanel) {
            if (this.state.isLeftPanelOpen) {
                this.dom.leftPanel.style.transform = 'translateX(0)';
                if (this.dom.leftPanelIcon) this.dom.leftPanelIcon.className = 'fas fa-chevron-left';
            } else {
                this.dom.leftPanel.style.transform = `translateX(${offset})`;
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
            if (this.dom.leftPanel) this.dom.leftPanel.style.transform = 'translateX(-100%)';
            if (this.dom.btnOpenLeft) this.dom.btnOpenLeft.classList.remove('hidden');
        }

        this.state.isRightPanelOpen = !this.state.isRightPanelOpen;
        const offset = isMobile ? '100%' : '120%';

        if (this.dom.rightPanel) {
            if (this.state.isRightPanelOpen) {
                this.dom.rightPanel.style.transform = 'translateX(0)';
                if (this.dom.rightPanelIcon) this.dom.rightPanelIcon.className = 'fas fa-chevron-right';
            } else {
                this.dom.rightPanel.style.transform = `translateX(${offset})`;
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
            if (this.dom.themeIcon) this.dom.themeIcon.className = 'fas fa-sun text-lg';
        } else {
            document.body.classList.remove('light-theme');
            if (this.dom.themeIcon) this.dom.themeIcon.className = 'fas fa-moon text-lg';
        }
        this.saveState();
    },

    selectProject() {
        this.state.currentProject = this.dom.projectSelect?.value || '24048';
        const is50 = this.state.currentProject === '24050';

        // Reset manual mode when changing projects
        if (is50) {
            this.state.isManualMode = false;
        }

        // Toggle UI Panels
        if (this.dom.manualModeToggle) this.dom.manualModeToggle.style.display = 'grid'; // Enable manual mode for both projects
        this.dom.exportToggle.style.display = is50 ? 'flex' : 'none';
        
        if (this.dom.palletModeSelector) this.dom.palletModeSelector.style.display = is50 ? 'none' : 'grid';
        if (this.dom.btnMatrix) this.dom.btnMatrix.style.display = is50 ? 'none' : 'block';

        if (this.dom.cellNumber) this.dom.cellNumber.textContent = 'Cell ' + this.state.currentProject;

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

        if (!is50) {
            if (this.dom.manualAddPanel) this.dom.manualAddPanel.style.display = this.state.isManualMode ? 'block' : 'none';
            if (this.dom.dizilimGridContainer) this.dom.dizilimGridContainer.style.display = this.state.isManualMode ? 'none' : 'grid';
            
            this.dom.radPositionsPanel.style.display = this.state.isManualMode ? '' : 'none';
            this.dom.radPosResetBtn.style.display = this.state.isManualMode ? '' : 'none';
            this.dom.palletSizeControls.style.display = 'none'; // Not for 24048/49
        } else {
            if (this.dom.manualAddPanel) this.dom.manualAddPanel.style.display = 'none';
            if (this.dom.dizilimGridContainer) this.dom.dizilimGridContainer.style.display = '';
            
            this.dom.radPositionsPanel.style.display = '';
            this.dom.radPosResetBtn.style.display = '';
            this.dom.palletSizeControls.style.display = '';
        }

        // Apply disabled state for gap and pallet manual controls when in auto mode
        if (this.dom.gapW) this.dom.gapW.disabled = !this.state.isManualMode;
        if (this.dom.gapH) this.dom.gapH.disabled = !this.state.isManualMode;
        if (this.dom.modeButtons[0]) this.dom.modeButtons[0].disabled = !this.state.isManualMode;
        if (this.dom.modeButtons[1]) this.dom.modeButtons[1].disabled = !this.state.isManualMode;

        if (this.dom.manualControlsGroup) {
            this.dom.manualControlsGroup.style.opacity = this.state.isManualMode ? '1' : '0.4';
            this.dom.manualControlsGroup.style.pointerEvents = this.state.isManualMode ? 'auto' : 'none';
        }
    },

    addManualRadiator() {
        if (this.state.currentProject === '24050') return;
        const w = parseInt(this.dom.manW?.value) || this.state.width;
        const l = parseInt(this.dom.manL?.value) || this.state.length;
        
        this.state.manualPositions.push({
            n: this.state.manualPositions.length + 1,
            x: 0,
            y: 0,
            angle: 0,
            w: w,
            l: l
        });
        this.render();
    },

    toggleDim(type, isChecked) {
        if (type === 'center') this.state.showDimCenter = isChecked;
        if (type === 'gap') this.state.showDimGap = isChecked;
        if (type === 'edges') this.state.showDimEdges = isChecked;
        this.render();
    },

    alignManualRadiators() {
        if (!this.state.isManualMode || this.state.manualPositions.length === 0) return;
        let arr = this.state.manualPositions;
        
        // Group into rows based on Y proximity
        let rows = [];
        arr.sort((a, b) => b.y - a.y); // Top to bottom
        
        let currentRow = [];
        let currentY = arr[0].y;
        
        arr.forEach(p => {
            if (Math.abs(p.y - currentY) > 50) {
                rows.push(currentRow);
                currentRow = [];
                currentY = p.y;
            }
            currentRow.push(p);
        });
        if (currentRow.length > 0) rows.push(currentRow);
        
        // Align each row horizontally
        rows.forEach((row) => {
            row.sort((a, b) => a.x - b.x); // Left to right
            
            let totalW = row.reduce((sum, p, i) => {
                let realW = (p.angle === 0 || p.angle === 180 || p.angle === 360 ? (p.w || this.state.width) : (p.l || this.state.length));
                return sum + realW + (i > 0 ? this.state.gapW : 0);
            }, 0);
            
            let curX = -totalW / 2;
            
            row.forEach(p => {
                let realW = (p.angle === 0 || p.angle === 180 || p.angle === 360 ? (p.w || this.state.width) : (p.l || this.state.length));
                p.x = Math.round(curX + realW / 2);
                curX += realW + this.state.gapW;
            });
        });
        
        // Align rows vertically
        let totalH = rows.reduce((sum, row, i) => {
            let maxH = Math.max(...row.map(p => (p.angle === 0 || p.angle === 180 || p.angle === 360 ? (p.l || this.state.length) : (p.w || this.state.width))));
            return sum + maxH + (i > 0 ? this.state.gapH : 0);
        }, 0);
        
        let curY = totalH / 2;
        rows.forEach((row) => {
            let maxH = Math.max(...row.map(p => (p.angle === 0 || p.angle === 180 || p.angle === 360 ? (p.l || this.state.length) : (p.w || this.state.width))));
            row.forEach(p => {
                p.y = Math.round(curY - maxH / 2);
            });
            curY -= (maxH + this.state.gapH);
        });
        
        // Renumber from top-left to bottom-right
        let n = 1;
        rows.forEach(row => {
            row.forEach(p => p.n = n++);
        });
        
        this.render();
    },

    setMode(isDual) {
        this.state.isDualPallet = !!isDual;
        if (this.dom.modeButtons[0]) this.dom.modeButtons[0].classList.toggle('active', !isDual);
        if (this.dom.modeButtons[1]) this.dom.modeButtons[1].classList.toggle('active', isDual);
        this.render();
    },

    toggleExport(mode) {
        this.state.exportMode = mode;
        if (this.dom.exportButtons[0]) this.dom.exportButtons[0].classList.toggle('active', !mode);
        if (this.dom.exportButtons[1]) this.dom.exportButtons[1].classList.toggle('active', mode);
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
        if (this.state.showAll) {
            this.renderAllLayouts();
        } else {
            this.render();
        }
    },

    selD(id) {
        this.state.dizilimId = id;
        this.state.width = this.config.defW[id];
        this.state.length = this.config.defL[id];
        if (this.dom.inW) this.dom.inW.value = this.state.width;
        if (this.dom.inL) this.dom.inL.value = this.state.length;
        this.state.isDualPallet = this.state.length > 1500;
        this.updateDizilimActiveState();
        if (this.state.showAll) {
            this.renderAllLayouts();
        } else {
            this.render();
        }
    },

    updateDizilimActiveState() {
        const counts = [0, 0, 6, 5, 3, 0, 4, 3, 2, 2, 1, 1, 2];
        const angles = [0, 0, 90, 0, 90, 0, 90, 0, 90, 0, 90, 0, 90];

        for (let i = 1; i <= 12; i++) {
            const btn = this.dom.dizilimButtons[i];
            if (btn) {
                if (i === 1 || i === 5) {
                    btn.style.display = 'none'; // Hide removed schemes
                    continue;
                }
                btn.classList.toggle('active', i === this.state.dizilimId);
                if (this.state.currentProject !== '24050') {
                    btn.innerHTML = `D${i}<span style="font-size:11px; opacity:0.8; display:block; line-height:1.2; font-weight:normal; margin-top:2px;">${counts[i]} adet / ${angles[i]}°</span>`;
                } else {
                    btn.innerHTML = `D${i}`;
                }
            }
        }
        const m1 = this.dom.modeButtons[0];
        const m2 = this.dom.modeButtons[1];
        if (m1) m1.classList.toggle('active', !this.state.isDualPallet);
        if (m2) m2.classList.toggle('active', this.state.isDualPallet);
    },

    getDiz(w, l) {
        if (w == 200) return (l <= 500 ? 2 : (l <= 800 ? 3 : 4));
        if (w == 300) return (l <= 500 ? 6 : (l <= 800 ? 7 : 8));
        if (w == 400) return (l <= 800 ? 9 : 10);
        if (w == 500) return (l <= 800 ? 9 : 10);
        if (w == 600) return (l <= 500 ? 12 : 10);
        if (w == 900) return (l == 400 ? 12 : (l <= 800 ? 11 : 10));
        return 10;
    },

    autoDizilim24050(w, l, isExport) {
        if (isExport) return w == 900 ? (l <= 1000 ? 6 : 5) : 1;
        if (w == 200) return l <= 600 ? 2 : 4;
        if (w == 300) return l <= 600 ? 3 : (l <= 2400 ? 4 : 1);
        if (w == 400) return l <= 600 ? 3 : (l <= 2400 ? 7 : 1);
        if (w == 500 || w == 600) return l <= 600 ? 3 : 1;
        if (w == 900) return l <= 1000 ? 6 : 5;
        return 1;
    },

    // --- Rendering ---
    getPalletSize() {
        const proj = this.config.projects[this.state.currentProject];
        if (proj.type === 'fixed') {
            return this.state.isDualPallet ? proj.pallets.double : proj.pallets.single;
        }
        if (this.state.palOverrideX > 0 && this.state.palOverrideY > 0) {
            return { x: this.state.palOverrideX, y: this.state.palOverrideY };
        }
        // Dynamic calc for 24050
        const d = this.state.dizilimId;
        const { width: w, length: l } = this.state;
        let px, py;
        switch (d) {
            case 1: px = l + 40; py = (w * 2) + 40; break;
            case 2: px = (l * 2) + 40; py = (w * 3) + 40; break;
            case 3: px = (l * 2) + 40; py = (w * 2) + 40; break;
            case 4: px = l + 40; py = (w * 4) + 100; break;
            case 5: px = l + 40; py = w + 40; break;
            case 6: px = (l * 2) + 40; py = w + 40; break;
            case 7: px = l + 40; py = (w * 3) + 40; break;
            default: px = l + 40; py = (w * 2) + 40;
        }
        return { x: Math.round(px), y: Math.round(py) };
    },

    getPositions() {
        const { dizilimId: d, width: w, length: l } = this.state;
        const GW = this.state.gapW, GH = this.state.gapH;
        let pos = [];
        let globalAngle = 0;

        if (this.state.currentProject === '24050') {
            if (!this.state.rad50UserEdited) {
                this.state.rad50Positions = this.getDefaultPositions24050(d, w, l);
            }
            return { positions: this.state.rad50Positions, angle: 0, isPerPieceAngle: true };
        }

        if (this.state.isManualMode) {
            return { positions: this.state.manualPositions, angle: 0, isPerPieceAngle: true, isManual: true };
        }

        // Fixed Dizilims for 24048/24049
        const add = (x, y, n) => pos.push({ x, y, n, angle: globalAngle });

        switch (d) {
            case 2: globalAngle = -90; for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) add((c - 0.5) * (l + GH), (1 - r) * (w + GW), r * 2 + c + 1); break;
            case 3: globalAngle = 0; for (let c = 0; c < 5; c++) add((c - 2) * (w + GW), 0, c + 1); break;
            case 4: globalAngle = -90; for (let r = 0; r < 3; r++) add(0, (1 - r) * (w + GW), r + 1); break;
            case 6: globalAngle = -90; for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) add((c - 0.5) * (l + GH), (0.5 - r) * (w + GW), r * 2 + c + 1); break;
            case 7: globalAngle = 0; for (let c = 0; c < 3; c++) add((c - 1) * (w + GW), 0, c + 1); break;
            case 8: globalAngle = -90; for (let r = 0; r < 2; r++) add(0, (0.5 - r) * (w + GW), r + 1); break;
            case 9: globalAngle = 0; for (let c = 0; c < 2; c++) add((c - 0.5) * (w + GW), 0, c + 1); break;
            case 10: globalAngle = -90; add(0, 0, 1); break;
            case 11: globalAngle = 0; add(0, 0, 1); break;
            case 12: globalAngle = -90; for (let c = 0; c < 2; c++) add((c - 0.5) * (l + GH), 0, c + 1); break;
        }

        return { positions: pos, angle: globalAngle, isPerPieceAngle: false };
    },

    getDefaultPositions24050(d, w, l) {
        const p = [];
        const m = Math.round;
        if (d == 1) { p.push({ n: 1, x: 0, y: m(w / 2 + 14.5), angle: 0 }, { n: 2, x: 0, y: m(-w / 2 - 14.5), angle: 180 }); }
        else if (d == 2) {
            p.push({ n: 1, x: m(-l / 2 - 10), y: w + 90, angle: 0 }, { n: 2, x: m(l / 2 + 12), y: w + 90, angle: 0 },
                { n: 3, x: m(-l / 2 - 10), y: 50, angle: 0 }, { n: 4, x: m(l / 2 + 12), y: 50, angle: 0 },
                { n: 5, x: m(l / 2 + 12), y: -w, angle: 180 }, { n: 6, x: m(-l / 2 - 10), y: -w, angle: 180 });
        }
        else if (d == 3) {
            p.push({ n: 1, x: m(-l / 2 - 10), y: m(w / 2 + 16), angle: 0 }, { n: 2, x: m(l / 2 + 12), y: m(w / 2 + 16), angle: 0 },
                { n: 3, x: m(l / 2 + 12), y: m(-w / 2 - 16), angle: 180 }, { n: 4, x: m(-l / 2 - 10), y: m(-w / 2 - 16), angle: 180 });
        }
        else if (d == 4) {
            p.push({ n: 1, x: 0, y: m(w * 1.5 + 39), angle: 0 }, { n: 2, x: 0, y: m(w / 2 + 13), angle: 180 },
                { n: 3, x: 0, y: m(-w / 2 - 13), angle: 0 }, { n: 4, x: 0, y: m(-w * 1.5 - 39), angle: 180 });
        }
        else if (d == 5) p.push({ n: 1, x: 0, y: 0, angle: 0 });
        else if (d == 6) p.push({ n: 1, x: m(l / 2 + 13), y: 0, angle: 0 }, { n: 2, x: m(-l / 2 - 13), y: 0, angle: 180 });
        else if (d == 7) p.push({ n: 1, x: 0, y: w + 26, angle: 0 }, { n: 2, x: 0, y: 0, angle: 180 }, { n: 3, x: 0, y: -w - 26, angle: 180 });
        return p;
    },

    toggleAllLayouts() {
        this.state.showAll = !this.state.showAll;
        if (!this.dom.btnToggleAll || !this.dom.singleViewArea || !this.dom.allLayoutsGrid) return;
        
        this.state.zoom = 1;
        this.state.panX = 0;
        this.state.panY = 0;
        this.applyTransform();

        if (this.state.showAll) {
            const txt = this.config.translations[this.state.lang].toggleAllHide;
            this.dom.btnToggleAll.innerHTML = `<i class="fas fa-eye-slash"></i><span id="lblToggleAll">${txt}</span>`;
            this.dom.btnToggleAll.classList.add('active');
            
            // Re-use singleViewArea container for mouse events but hide inner palletArea
            if (this.dom.palletArea) this.dom.palletArea.style.display = 'none';
            this.dom.allLayoutsGrid.style.display = 'flex';
            this.dom.allLayoutsGrid.style.flexDirection = 'column';
            this.dom.allLayoutsGrid.style.gap = '40px';
            this.dom.allLayoutsGrid.style.padding = '40px';
            this.dom.allLayoutsGrid.style.transformOrigin = '0 0';
            this.dom.allLayoutsGrid.style.transition = 'transform 0.1s ease-out';
            this.dom.allLayoutsGrid.style.position = 'absolute'; // Important for panning
            
            if (this.dom.minimapContainer) this.dom.minimapContainer.classList.remove('hidden');
            document.querySelectorAll('.info-card').forEach(el => el.style.display = 'none');
            
            this.renderAllLayouts();
        } else {
            const txt = this.config.translations[this.state.lang].toggleAllShow;
            this.dom.btnToggleAll.innerHTML = `<i class="fas fa-th-large"></i><span id="lblToggleAll">${txt}</span>`;
            this.dom.btnToggleAll.classList.remove('active');

            // Explicitly reset single view zoom and pan to defaults
            this.state.zoom = 1;
            this.state.panX = 0;
            this.state.panY = 0;

            if (this.dom.palletArea) {
                this.dom.palletArea.style.display = 'flex'; // Use flex as per default CSS
            }
            this.dom.allLayoutsGrid.style.display = 'none';
            if (this.dom.minimapContainer) this.dom.minimapContainer.classList.add('hidden');
            document.querySelectorAll('.info-card').forEach(el => el.style.display = '');
            this.render();
            // Apply reset transforms to the single view pallet area
            this.applyTransform();
        }
    },

    handleZoomTouch(e) {
        if (!this.state.showAll) return;
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];

            const currentDist = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );

            if (this.state.lastZoomDist) {
                const zoomFactor = currentDist / this.state.lastZoomDist;
                let newZoom = this.state.zoom * zoomFactor;
                newZoom = Math.max(0.2, Math.min(newZoom, 3));

                if (newZoom !== this.state.zoom) {
                    const rect = this.dom.singleViewArea.getBoundingClientRect();

                    const centerClientX = (touch1.clientX + touch2.clientX) / 2;
                    const centerClientY = (touch1.clientY + touch2.clientY) / 2;

                    const relX = centerClientX - rect.left;
                    const relY = centerClientY - rect.top;

                    const scaleChange = newZoom - this.state.zoom;
                    this.state.panX -= (relX - this.state.panX) * (scaleChange / this.state.zoom);
                    this.state.panY -= (relY - this.state.panY) * (scaleChange / this.state.zoom);
                    this.state.zoom = newZoom;
                    this.applyTransform();
                }
            }
            this.state.lastZoomDist = currentDist;
        }
    },

    renderAllLayouts() {
        const grid = this.dom.allLayoutsGrid;
        if (!grid) return;
        grid.innerHTML = '';

        const is50 = this.state.currentProject === '24050';

        // Store current single-view state
        const backupD = this.state.dizilimId;
        const backupW = this.state.width;
        const backupL = this.state.length;
        const backupDual = this.state.isDualPallet;

        const widths = [200, 300, 400, 500, 600, 900];
        const lengths = [];
        for (let i = 400; i <= 3000; i += 100) lengths.push(i);

        const renderRow = (widthIndex) => {
            if (widthIndex >= widths.length) {
                // Restore state
                this.state.dizilimId = backupD;
                this.state.width = backupW;
                this.state.length = backupL;
                this.state.isDualPallet = backupDual;
                return;
            }

            const w = widths[widthIndex];
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.gap = '20px';
            rowDiv.style.alignItems = 'center';

            const rowTitle = document.createElement('div');
            rowTitle.style.fontSize = '24px';
            rowTitle.style.color = 'var(--kuka-orange)';
            rowTitle.style.fontWeight = 'bold';
            rowTitle.style.writingMode = 'vertical-rl';
            rowTitle.style.transform = 'rotate(180deg)';
            rowTitle.style.minWidth = '40px';
            rowTitle.style.textAlign = 'center';
            rowTitle.textContent = `W: ${w}`;
            rowDiv.appendChild(rowTitle);

            const itemsContainer = document.createElement('div');
            itemsContainer.style.display = 'flex';
            itemsContainer.style.gap = '15px';
            
            rowDiv.appendChild(itemsContainer);
            grid.appendChild(rowDiv);

            // Chunk the inner items to prevent main thread freezing
            let lengthIndex = 0;
            
            const renderNextItem = () => {
                if (lengthIndex >= lengths.length) {
                    // Row is finished, move to next row
                    setTimeout(() => renderRow(widthIndex + 1), 10);
                    return;
                }
                
                // Process 3 items per chunk
                const chunkEnd = Math.min(lengthIndex + 3, lengths.length);
                
                for (let i = lengthIndex; i < chunkEnd; i++) {
                    const l = lengths[i];
                    this.state.width = w;
                    this.state.length = l;
                    this.state.isDualPallet = l > 1500;

                    if (is50) {
                        this.state.dizilimId = this.autoDizilim24050(w, l, this.state.exportMode);
                    } else {
                        this.state.dizilimId = this.getDiz(w, l);
                    }

                    const card = document.createElement('div');
                    card.className = 'layout-card';

                    const title = document.createElement('div');
                    title.className = 'layout-card-title';
                    title.textContent = `Dizilim ${this.state.dizilimId} (${w}x${l}mm)`;

                    const area = document.createElement('div');
                    area.className = 'pallet-area';
                    area.style.position = 'relative';
                    area.style.marginTop = '10px';

                    card.appendChild(title);
                    card.appendChild(area);
                    itemsContainer.appendChild(card);

                    // Render loop onto this specific container using exact single visualizer logic
                    this._renderSinglePalletInside(area, true);
                }
                
                lengthIndex = chunkEnd;
                // Yield to browser and process next chunk
                requestAnimationFrame(renderNextItem);
            };

            // Start inner row chunking
            renderNextItem();
        };

        // Start processing rows
        renderRow(0);
    },

    render() {
        if (!this.dom.palletArea || !this.dom.pallet) return;
        
        // Save state at every render cycle
        this.saveState();

        if (this.state.showAll) {
            this.renderAllLayouts();
            return;
        }
        this._renderSinglePalletInside(this.dom.palletArea, false);
    },

    _renderSinglePalletInside(area, isMiniature) {
        // Find or create pallet elements inside the specific area
        let pal = area.querySelector('.pallet') || area.querySelector('.pallet-wood');
        let pal2 = area.querySelector('.pallet2');
        let radLayer = area.querySelector('.rad-layer');

        if (!pal) {
            pal = document.createElement('div');
            pal.className = 'pallet';
            area.appendChild(pal);
        }
        if (!pal2) {
            pal2 = document.createElement('div');
            pal2.className = 'pallet2';
            area.appendChild(pal2);
        }
        if (!radLayer) {
            radLayer = document.createElement('div');
            radLayer.className = 'rad-layer';
            radLayer.style.position = 'absolute';
            radLayer.style.top = '0';
            radLayer.style.left = '0';
            radLayer.style.width = '100%';
            radLayer.style.height = '100%';
            radLayer.style.pointerEvents = 'none';
            area.appendChild(radLayer);
        }

        const is50 = this.state.currentProject === '24050';
        const palSize = this.getPalletSize();
        const { positions, angle, isPerPieceAngle } = this.getPositions();

        // Calculate Scale
        let maxExtentX = palSize.x / 2, maxExtentY = palSize.y / 2;

        positions.forEach(p => {
            let currentW = p.w !== undefined ? p.w : this.state.width;
            let currentL = p.l !== undefined ? p.l : this.state.length;
            let pAngle = isPerPieceAngle ? p.angle : angle;

            const rw = is50 ? currentL : (pAngle === 0 || pAngle === 180 ? currentW : currentL);
            const rh = is50 ? currentW : (pAngle === 0 || pAngle === 180 ? currentL : currentW);

        maxExtentX = Math.max(maxExtentX, Math.abs(p.x) + rw / 2);
        maxExtentY = Math.max(maxExtentY, Math.abs(p.y) + rh / 2);
        });

        let s;
        let effectiveAreaW;
        let effectiveAreaH;

        if (isMiniature) {
            s = 0.12; // Fixed global proportional scale for all miniatures
            const totalW = (this.state.isDualPallet && !is50) ? 2400 : palSize.x;
            effectiveAreaW = totalW * s + 40;
            effectiveAreaH = palSize.y * s + 40;
            area.style.width = effectiveAreaW + 'px';
            area.style.height = effectiveAreaH + 'px';
            area.style.margin = '0 auto';
        } else {
            effectiveAreaW = area.offsetWidth || 300;
            effectiveAreaH = area.offsetHeight || 280;
            const areaW = effectiveAreaW - 40;
            const areaH = effectiveAreaH - 40;
            s = Math.min(areaW / (maxExtentX * 2), areaH / (maxExtentY * 2), 1.0);
        }

        this.state.scale = s;

        // Render Pallet
        pal.className = is50 ? 'pallet-wood' : 'pallet';
        pal.style.setProperty('--rad-scale', s);
        
        let palW = Math.round(palSize.x * s);
        let palH = Math.round(palSize.y * s);
        let palLeft = Math.round((effectiveAreaW - palW) / 2);
        let palTop = Math.round((effectiveAreaH - palH) / 2);

        if (this.state.isDualPallet && !is50) {
            const totalW = Math.round(2400 * s);
            palLeft = Math.round((effectiveAreaW - totalW) / 2);
            pal.style.width = Math.round(1200 * s) + 'px';
            pal.style.height = palH + 'px';
            pal.style.left = palLeft + 'px';
            pal.style.top = palTop + 'px';

            pal2.style.display = 'block';
            pal2.style.setProperty('--rad-scale', s);
            pal2.style.width = Math.round(1200 * s) + 'px';
            pal2.style.height = palH + 'px';
            pal2.style.top = palTop + 'px';
            pal2.style.left = (palLeft + Math.round(1200 * s)) + 'px';
        } else {
            pal.style.width = palW + 'px';
            pal.style.height = palH + 'px';
            pal.style.left = palLeft + 'px';
            pal.style.top = palTop + 'px';
            pal2.style.display = 'none';
        }

        // Labels - Only for main area, not miniatures
        if (!isMiniature && this.dom.axisX && this.dom.centerMark) {
            this.dom.axisX.textContent = palSize.x + ' mm';
            this.dom.axisY.textContent = palSize.y + ' mm';
            this.dom.centerMark.style.left = (parseInt(pal.style.left) + (palSize.x * s / 2) - 5) + 'px';
            this.dom.centerMark.style.top = (parseInt(pal.style.top) + (palSize.y * s / 2) - 5) + 'px';
        }

        // Render Radiators
        let radiatorsHTML = '';
        let maxOv = 0;

        radLayer.innerHTML = '';

        positions.forEach((p, i) => {
            const thisAngle = isPerPieceAngle ? p.angle : angle;
            const isFlipped = is50 && thisAngle === 180;
            const isRotated = thisAngle === -90 || thisAngle === 90 || thisAngle === 270;

            const dualClass = (!is50 && this.state.isDualPallet) ? ' rad-dual' : '';
            const className = is50 ? (isFlipped ? 'rad-24050 rad-24050-flipped' : 'rad-24050') : (isRotated ? 'rad rad-rotated' + dualClass : 'rad' + dualClass);

            let currentW = p.w !== undefined ? p.w : this.state.width;
            let currentL = p.l !== undefined ? p.l : this.state.length;

            const rw = is50 ? (currentL * s) : (thisAngle === 0 || thisAngle === 180 ? currentW * s : currentL * s);
            const rh = is50 ? (currentW * s) : (thisAngle === 0 || thisAngle === 180 ? currentL * s : currentW * s);

            const wPx = Math.round(rw);
            const hPx = Math.round(rh);
            const radLeft = Math.round(parseInt(pal.style.left) + (palSize.x * s / 2) + (p.x * s) - (rw / 2));
            const radTop = Math.round(parseInt(pal.style.top) + (palSize.y * s / 2) - (p.y * s) - (rh / 2));

            const numLabel = `${p.n}${isFlipped ? '↻' : ''}`;
            const innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped);
            const animDelay = (i * 0.05) + 's';

            // Overflow Check
            let realW = is50 ? currentL : (thisAngle === 0 || thisAngle === 180 ? currentW : currentL);
            let realH = is50 ? currentW : (thisAngle === 0 || thisAngle === 180 ? currentL : currentW);
            
            const ovX = Math.max(0, Math.abs(p.x) + realW / 2 - palSize.x / 2);
            const ovY = Math.max(0, Math.abs(p.y) + realH / 2 - palSize.y / 2);
            const ov = Math.max(ovX, ovY);
            let extraClass = '';
            if (ov > 1) {
                extraClass = ' rad-overflow';
                maxOv = Math.max(maxOv, ov);
                // Draw overhang dimensions only on single view
                if (!isMiniature) {
                    if (ovX > 0) radiatorsHTML += this.getDimLineHTML(radLeft + (p.x > 0 ? rw : -20), radTop + rh / 2, 20, 0, Math.round(ovX), 'overhang');
                    if (ovY > 0) radiatorsHTML += this.getDimLineHTML(radLeft + rw / 2, radTop + (p.y > 0 ? -20 : rh), 0, 20, Math.round(ovY), 'overhang');
                }
            }
            
            // Render dimensions to edges
            if (!isMiniature && !is50 && this.state.showDimCenter) {
                // X dimension to center
                radiatorsHTML += this.getDimLineHTML(radLeft + rw / 2, radTop + rh + 10, -p.x * s, 0, Math.round(p.x), 'manual-dim');
                // Y dimension to center
                radiatorsHTML += this.getDimLineHTML(radLeft - 10, radTop + rh / 2, 0, p.y * s, Math.round(p.y), 'manual-dim');
            }

            radiatorsHTML += `<div class="${className}${extraClass}" style="--rad-scale:${s}; width:${wPx}px; height:${hPx}px; left:${radLeft}px; top:${radTop}px; animation-delay:${animDelay}; pointer-events:auto;" onmousedown="HmiApp.startDrag(event, ${i})" oncontextmenu="HmiApp.showContextMenu(event, ${i})">${innerHTML}</div>`;
        });

        // --- GAP DRAWING (Inter-Radiator Distances) ---
        if (!isMiniature && this.state.showDimGap) {
            let boxes = positions.map(p => {
                let pAngle = isPerPieceAngle ? p.angle : angle;
                let currentW = p.w !== undefined ? p.w : this.state.width;
                let currentL = p.l !== undefined ? p.l : this.state.length;
                let realW = is50 ? currentL : (pAngle === 0 || pAngle === 180 || pAngle === 360 ? currentW : currentL);
                let realH = is50 ? currentW : (pAngle === 0 || pAngle === 180 || pAngle === 360 ? currentL : currentW);
                return {
                    left: p.x - realW / 2,
                    right: p.x + realW / 2,
                    top: p.y + realH / 2,
                    bottom: p.y - realH / 2,
                    x: p.x,
                    y: p.y,
                    rw: realW,
                    rh: realH
                };
            });
            
            for(let i=0; i<boxes.length; i++) {
                let b1 = boxes[i];
                
                // Find nearest right neighbor
                let rightNeighbor = null;
                let minGapX = Infinity;
                for(let j=0; j<boxes.length; j++) {
                    if (i===j) continue;
                    let b2 = boxes[j];
                    if (b2.left >= b1.right - 2) { 
                        if (Math.min(b1.top, b2.top) > Math.max(b1.bottom, b2.bottom)) { 
                            let gap = b2.left - b1.right;
                            if (gap < minGapX) {
                                minGapX = gap;
                                rightNeighbor = b2;
                            }
                        }
                    }
                }
                
                if (rightNeighbor && minGapX >= 0 && minGapX < 2000) {
                    let b2 = rightNeighbor;
                    let midY = (Math.max(b1.bottom, b2.bottom) + Math.min(b1.top, b2.top)) / 2;
                    let scrX = Math.round((palSize.x * s / 2) + b1.right * s);
                    let scrY = Math.round((palSize.y * s / 2) - midY * s);
                    radiatorsHTML += this.getDimLineHTML(scrX, scrY, minGapX * s, 0, Math.round(minGapX), 'gap-dim');
                }
                
                // Find nearest bottom neighbor (smaller Y)
                let bottomNeighbor = null;
                let minGapY = Infinity;
                for(let j=0; j<boxes.length; j++) {
                    if (i===j) continue;
                    let b2 = boxes[j];
                    if (b2.top <= b1.bottom + 2) { 
                        if (Math.min(b1.right, b2.right) > Math.max(b1.left, b2.left)) { 
                            let gap = b1.bottom - b2.top;
                            if (gap < minGapY) {
                                minGapY = gap;
                                bottomNeighbor = b2;
                            }
                        }
                    }
                }
                
                if (bottomNeighbor && minGapY >= 0 && minGapY < 2000) {
                    let b2 = bottomNeighbor;
                    let midX = (Math.max(b1.left, b2.left) + Math.min(b1.right, b2.right)) / 2;
                    let scrX = Math.round((palSize.x * s / 2) + midX * s);
                    let scrY = Math.round((palSize.y * s / 2) - b1.bottom * s);
                    radiatorsHTML += this.getDimLineHTML(scrX, scrY, 0, minGapY * s, Math.round(minGapY), 'gap-dim');
                }
            }
        }
        // --- END GAP DRAWING ---

        // --- COLLISION DETECTION ---
        if (!isMiniature) {
            let boxes = positions.map((p, i) => {
                let pAngle = isPerPieceAngle ? p.angle : angle;
                let currentW = p.w !== undefined ? p.w : this.state.width;
                let currentL = p.l !== undefined ? p.l : this.state.length;
                let realW = is50 ? currentL : (pAngle === 0 || pAngle === 180 || pAngle === 360 ? currentW : currentL);
                let realH = is50 ? currentW : (pAngle === 0 || pAngle === 180 || pAngle === 360 ? currentL : currentW);
                return {
                    id: i,
                    left: p.x - realW / 2,
                    right: p.x + realW / 2,
                    top: p.y + realH / 2,
                    bottom: p.y - realH / 2,
                    x: p.x,
                    y: p.y,
                    rw: realW,
                    rh: realH
                };
            });

            for (let i = 0; i < boxes.length; i++) {
                for (let j = i + 1; j < boxes.length; j++) {
                    let b1 = boxes[i];
                    let b2 = boxes[j];

                    // Check overlap
                    if (b1.left < b2.right && b1.right > b2.left && b1.top > b2.bottom && b1.bottom < b2.top) {
                        // Intersection area
                        let ixLeft = Math.max(b1.left, b2.left);
                        let ixRight = Math.min(b1.right, b2.right);
                        let ixBottom = Math.max(b1.bottom, b2.bottom);
                        let ixTop = Math.min(b1.top, b2.top);

                        let ixW = ixRight - ixLeft;
                        let ixH = ixTop - ixBottom;
                        let ixX = ixLeft + ixW / 2;
                        let ixY = ixBottom + ixH / 2;

                        let scrX = Math.round(parseInt(pal.style.left) + (palSize.x * s / 2) + ixX * s - (ixW * s / 2));
                        let scrY = Math.round(parseInt(pal.style.top) + (palSize.y * s / 2) - ixY * s - (ixH * s / 2));

                        radiatorsHTML += `<div class="collision-box" style="width:${Math.round(ixW * s)}px; height:${Math.round(ixH * s)}px; left:${scrX}px; top:${scrY}px; position:absolute; background:repeating-linear-gradient(45deg, rgba(255,0,0,0.5), rgba(255,0,0,0.5) 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px); border:1px solid red; pointer-events:none; z-index:50;"></div>`;
                    }
                }
            }
        }
        // --- END COLLISION DETECTION ---

        // --- BLUEPRINT OVERLAYS (Title Block & Edge Dimensions) ---
        if (!isMiniature) {
            let blueprintHTML = `<div class="${this.state.showDimEdges ? '' : 'blueprint-only'}" style="position: absolute; inset: 0; pointer-events: none;">`;

            // 1. Overall Pallet Dimensions
            const palScrX = parseInt(pal.style.left);
            const palScrY = parseInt(pal.style.top);

            // Top width dimension
            blueprintHTML += this.getDimLineHTML(0, -30, palW, 0, `${palSize.x} mm`, 'gap-dim');
            // Right height dimension
            blueprintHTML += this.getDimLineHTML(palW + 30, 0, 0, palH, `${palSize.y} mm`, 'gap-dim');

            // 2. Edge spaces / Overhangs
            let minX = 0, maxX = 0, minY = 0, maxY = 0;
            if (positions.length > 0) {
                // Determine bounding box of all radiators (in mm relative to pallet center)
                minX = Infinity; maxX = -Infinity; minY = Infinity; maxY = -Infinity;

                positions.forEach(p => {
                    let pAngle = isPerPieceAngle ? p.angle : angle;
                    let currentW = p.w !== undefined ? p.w : this.state.width;
                    let currentL = p.l !== undefined ? p.l : this.state.length;
                    let realW = is50 ? currentL : (pAngle === 0 || pAngle === 180 || pAngle === 360 ? currentW : currentL);
                    let realH = is50 ? currentW : (pAngle === 0 || pAngle === 180 || pAngle === 360 ? currentL : currentW);

                    minX = Math.min(minX, p.x - realW / 2);
                    maxX = Math.max(maxX, p.x + realW / 2);
                    minY = Math.min(minY, p.y - realH / 2);
                    maxY = Math.max(maxY, p.y + realH / 2);
                });

                // Distances from pallet edges (positive = space, negative = overhang)
                // Pallet is centered at (0,0), so right edge is palSize.x/2, top edge is palSize.y/2
                let spaceRight = (palSize.x / 2) - maxX;
                let spaceLeft = minX - (-palSize.x / 2);
                let spaceTop = (palSize.y / 2) - maxY;
                let spaceBottom = minY - (-palSize.y / 2);

                // Draw edge dimensions if space is non-zero (show negative for overhang)
                if (Math.abs(Math.round(spaceRight)) > 0) {
                    let scrX = Math.round((palSize.x * s / 2) + maxX * s);
                    let scrY = palH / 2;
                    blueprintHTML += this.getDimLineHTML(scrX, scrY, spaceRight * s, 0, `${Math.round(spaceRight)} mm`, 'manual-dim');
                }
                if (Math.abs(Math.round(spaceLeft)) > 0) {
                    let scrX = 0;
                    let scrY = palH / 2;
                    blueprintHTML += this.getDimLineHTML(scrX, scrY, spaceLeft * s, 0, `${Math.round(spaceLeft)} mm`, 'manual-dim');
                }
                if (Math.abs(Math.round(spaceTop)) > 0) {
                    let scrX = palW / 2;
                    let scrY = Math.round((palSize.y * s / 2) - maxY * s);
                    blueprintHTML += this.getDimLineHTML(scrX, scrY - spaceTop * s, 0, spaceTop * s, `${Math.round(spaceTop)} mm`, 'manual-dim');
                }
                if (Math.abs(Math.round(spaceBottom)) > 0) {
                    let scrX = palW / 2;
                    let scrY = palH;
                    blueprintHTML += this.getDimLineHTML(scrX, scrY - spaceBottom * s, 0, spaceBottom * s, `${Math.round(spaceBottom)} mm`, 'manual-dim');
                }
            }

            // 3. Title Block (Stamp)
            const dStr = new Date().toLocaleString(this.state.lang);

            // Basic HTML escaping
            const escapeHtml = (unsafe) => {
                return String(unsafe)
                     .replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
            };

            const prjStr = `Proj ${escapeHtml(this.state.currentProject)}`;
            const schStr = `Scheme D${escapeHtml(this.state.dizilimId)}`;
            const radStr = `${escapeHtml(this.state.width)}x${escapeHtml(this.state.length)}mm`;
            const cntStr = `${escapeHtml(positions.length)} pcs`;

            // Position title block dynamically below the lowest extent (pallet or radiators)
            let titleBlockY = Math.round(Math.max(palH, palSize.y * s / 2 + maxY * s)) + 40;

            blueprintHTML += `
                <div class="blueprint-only" style="position: absolute; top: ${titleBlockY}px; right: 0; background: white; color: black; border: 2px solid black; padding: 5px; font-family: monospace; font-size: 10px; width: 250px; text-align: left; z-index: 1000; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
                    <div style="border-bottom: 1px solid black; padding-bottom: 3px; margin-bottom: 3px; font-weight: bold; font-size: 12px; text-align: center;">KUKA CELL VISUALIZER</div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="width: 40%; font-weight: bold;">Project:</td><td>${prjStr}</td></tr>
                        <tr><td style="font-weight: bold;">Scheme:</td><td>${schStr}</td></tr>
                        <tr><td style="font-weight: bold;">Radiator:</td><td>${radStr}</td></tr>
                        <tr><td style="font-weight: bold;">Quantity:</td><td>${cntStr}</td></tr>
                        <tr><td style="font-weight: bold;">Date:</td><td>${escapeHtml(dStr)}</td></tr>
                    </table>
                </div>
            `;

            blueprintHTML += '</div>';
            radiatorsHTML += blueprintHTML;
        }
        // --- END BLUEPRINT OVERLAYS ---

        radLayer.innerHTML = radiatorsHTML;

        // Info Panel - Only update if not miniature loop
        if (!isMiniature && this.dom.iW) {
            this.dom.iW.textContent = this.state.width + ' mm';
            this.dom.iL.textContent = this.state.length + ' mm';
            this.dom.iA.textContent = is50 ? '0°/180°' : angle + '°';
            this.dom.iC.textContent = positions.length + ' ' + (this.config.translations[this.state.lang].pcs);
            this.dom.iP.textContent = `${palSize.x} × ${palSize.y} (Taşma: ${Math.round(maxOv)}mm)`;

            if (is50 || this.state.isManualMode) this.renderRadTable(positions);
            this.updateVizHeader(positions.length, angle, is50);

            // Additional info for 24048-49
            document.querySelectorAll('.ext-info-row').forEach(el => {
                el.style.display = is50 ? 'none' : 'flex';
            });
            if (!is50) {
                if (this.dom.iLyr) this.dom.iLyr.textContent = '10';
                if (this.dom.iTot) this.dom.iTot.textContent = (positions.length * 10).toString();
            }
        }
    },

    getRadiatorHTML(is50, isMiniature, numLabel, isFlipped) {
        if (is50) {
            if (isMiniature) {
                // Lightweight miniature for 24050 — just body + ribs + number
                return `
                      <div class="pkg-body"></div>
                      <div class="pkg-card left"></div>
                      <div class="pkg-card right"></div>
                      <div class="pkg-num">${numLabel}</div>`;
            } else {
                // Full packaged radiator render
                return `
                      <div class="pkg-body"></div>
                      <div class="pkg-card left"></div>
                      <div class="pkg-card right"></div>
                      <div class="pkg-corner tl"></div>
                      <div class="pkg-corner bl"></div>
                      <div class="pkg-corner tr"></div>
                      <div class="pkg-corner br"></div>
                      <div class="pkg-label">
                        <div class="pkg-label-red">LIDER</div>
                        <div class="pkg-label-white">
                          <span>СТАЛЬНОЙ<br>РАДИАТОР</span>
                        </div>
                      </div>
                      <div class="pkg-num">${numLabel}</div>`;
            }
        } else if (isMiniature) {
            // Lightweight version for miniatures — just the plate + number
            return `
                  <div class="heat-plate" style="width:100%;height:100%;">
                    <div class="pattern-area">
                      <div class="rad-num" style="font-size:9px;padding:1px 3px;">${numLabel}</div>
                    </div>
                    <div class="long-pipe top"></div>
                    <div class="long-pipe bottom"></div>
                  </div>`;
        } else {
            return `
                  <div class="heat-plate">
                    <div class="pattern-area">
                      <div class="rad-num">${numLabel}</div>
                    </div>
                    <div class="clip tl"></div>
                    <div class="clip tr"></div>
                    <div class="clip bl"></div>
                    <div class="clip br"></div>
                    <div class="long-pipe top"></div>
                    <div class="long-pipe bottom"></div>
                    <div class="port top-left"></div>
                    <div class="port top-right"></div>
                    <div class="port bottom-left"></div>
                    <div class="port bottom-right"></div>
                  </div>`;
        }
    },

    updateVizHeader(count, angle, is50) {
        this.dom.vizTitle.textContent = `D${this.state.dizilimId}: ${this.state.width}x${this.state.length}mm ${is50 ? (this.state.exportMode ? '[Export]' : '[Domestic]') : ''}`;
        this.dom.statCount.textContent = count + ' ' + (this.config.translations[this.state.lang].pcs);
        this.dom.statAngle.textContent = is50 ? '0°/180°' : angle + '°';
    },

    handleZoom(e) {
        if (!this.state.showAll) return;
        e.preventDefault();
        const zoomStep = 0.1;
        let newZoom = this.state.zoom;
        if (e.deltaY < 0) {
            newZoom = Math.min(this.state.zoom + zoomStep, 3);
        } else {
            newZoom = Math.max(this.state.zoom - zoomStep, 0.2);
        }

        if (newZoom !== this.state.zoom) {
            const rect = this.dom.singleViewArea.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            const scaleChange = newZoom - this.state.zoom;
            this.state.panX -= (relX - this.state.panX) * (scaleChange / this.state.zoom);
            this.state.panY -= (relY - this.state.panY) * (scaleChange / this.state.zoom);
            this.state.zoom = newZoom;
            this.applyTransform();
        }
    },

    resetView() {
        this.state.zoom = 1;
        this.state.panX = 0;
        this.state.panY = 0;
        this.applyTransform();
    },

    startPan(e) {
        if (!this.state.showAll) return;
        
        // Support touch
        const isTouch = e.type === 'touchstart';
        if (isTouch && e.touches.length > 1) return; // handled by pinch zoom

        // Allow pan with middle mouse button OR left click
        if (!isTouch && e.button !== 1 && e.button !== 0) return;
        
        // Prevent panning when clicking on a radiator (allow drag instead)
        if (e.target.closest('.rad') || e.target.closest('.rad-24050')) return;

        // Prevent default only if not clicking a form element
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
        }

        let startX = isTouch ? e.touches[0].clientX : e.clientX;
        let startY = isTouch ? e.touches[0].clientY : e.clientY;
        let startPanX = this.state.panX;
        let startPanY = this.state.panY;

        const onMouseMove = (ev) => {
            let cx = isTouch ? ev.touches[0].clientX : ev.clientX;
            let cy = isTouch ? ev.touches[0].clientY : ev.clientY;
            this.state.panX = startPanX + (cx - startX);
            this.state.panY = startPanY + (cy - startY);
            this.applyTransform();
        };

        const onMouseUp = () => {
            if (isTouch) {
                this.state.lastZoomDist = null; // Reset pinch-zoom state
                document.removeEventListener('touchmove', onMouseMove);
                document.removeEventListener('touchend', onMouseUp);
                document.removeEventListener('touchcancel', onMouseUp);
            } else {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        };

        if (isTouch) {
            document.addEventListener('touchmove', onMouseMove, { passive: false });
            document.addEventListener('touchend', onMouseUp);
            document.addEventListener('touchcancel', onMouseUp);
        } else {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    },

    applyTransform() {
        if (this.state.showAll && this.dom.allLayoutsGrid) {
            this.dom.allLayoutsGrid.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.zoom})`;
            this.updateMinimap();
        } else if (this.dom.palletArea) {
            this.dom.palletArea.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.zoom})`;
        }
    },

    updateMinimap() {
        if (!this.state.showAll || !this.dom.minimapContainer || !this.dom.minimapView || !this.dom.allLayoutsGrid || !this.dom.singleViewArea) return;
        
        // Use scrollWidth/scrollHeight to determine total actual grid bounds
        const gridW = this.dom.allLayoutsGrid.scrollWidth || 2000;
        const gridH = this.dom.allLayoutsGrid.scrollHeight || 2000;
        
        const viewW = this.dom.singleViewArea.clientWidth;
        const viewH = this.dom.singleViewArea.clientHeight;
        
        const minimapW = this.dom.minimapContainer.clientWidth;
        const minimapH = this.dom.minimapContainer.clientHeight;
        
        // Scale representation
        const scaleX = minimapW / gridW;
        const scaleY = minimapH / gridH;
        
        // Minimum visible size clamp
        const indicatorW = Math.max(10, Math.min(minimapW, (viewW / this.state.zoom) * scaleX));
        const indicatorH = Math.max(10, Math.min(minimapH, (viewH / this.state.zoom) * scaleY));
        
        const indicatorX = Math.max(0, Math.min(minimapW - indicatorW, (-this.state.panX / this.state.zoom) * scaleX));
        const indicatorY = Math.max(0, Math.min(minimapH - indicatorH, (-this.state.panY / this.state.zoom) * scaleY));

        this.dom.minimapView.style.width = indicatorW + 'px';
        this.dom.minimapView.style.height = indicatorH + 'px';
        this.dom.minimapView.style.left = indicatorX + 'px';
        this.dom.minimapView.style.top = indicatorY + 'px';
    },

    exportToImage() {
        const area = document.getElementById('singleViewArea');
        if (!area) return;
        
        // Temporarily reset transform and hide overflow for clean screenshot
        const oldPanX = this.state.panX;
        const oldPanY = this.state.panY;
        const oldZoom = this.state.zoom;
        const oldOverflow = area.style.overflow;
        const oldBg = area.style.backgroundColor;
        
        this.state.panX = 0;
        this.state.panY = 0;
        this.state.zoom = 1;
        this.applyTransform();
        area.style.overflow = 'visible';
        // Add a solid background color based on current theme to prevent transparency
        area.style.backgroundColor = this.state.isLightTheme ? '#f8fafc' : '#0f172a';

        // Add export-active class to show blueprint-only elements and disable animations
        area.classList.add('export-active');

        // Force re-render to calculate and position blueprint overlays correctly
        this.render();

        // Allow 1500ms delay for DOM to settle and animations to finish
        setTimeout(() => {
            html2canvas(area, {
                backgroundColor: this.state.isLightTheme ? '#f8fafc' : '#0f172a',
                scale: 2, // High resolution
                useCORS: true,
                scrollX: 0,
                scrollY: 0
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `KUKA_Scheme_${this.state.currentProject}_D${this.state.dizilimId}_${this.state.width}x${this.state.length}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

                // Restore transform and styles
                this.state.panX = oldPanX;
                this.state.panY = oldPanY;
                this.state.zoom = oldZoom;
                this.applyTransform();
                area.style.overflow = oldOverflow;
                area.style.backgroundColor = oldBg;

                // Remove export-active class
                area.classList.remove('export-active');
            });
        }, 1500);
    },

    renderRadTable(positions) {
        if (!this.dom.radPositionsPanel) return;
        let isManual = this.state.isManualMode;
        let html = '<table class="rad-pos-table"><tr><th>#</th><th>X</th><th>Y</th><th>A°</th>' + (isManual ? '<th>Act</th>' : '') + '</tr>';
        positions.forEach((p, i) => {
            html += `<tr>
                <td class="rad-pos-num">${p.n}</td>
                <td><input type="number" class="rad-pos-input" value="${p.x}" onchange="HmiApp.updateRadPosition(${i}, 'x', this.value)"></td>
                <td><input type="number" class="rad-pos-input" value="${p.y}" onchange="HmiApp.updateRadPosition(${i}, 'y', this.value)"></td>
                <td class="rad-pos-angle">
                    ${isManual ? `<span style="cursor:pointer;" onclick="HmiApp.rotateManualRad(${i})">${p.angle}° <i class="fas fa-sync-alt" style="font-size:10px;margin-left:2px;"></i></span>` : `${p.angle}°`}
                </td>
                ${isManual ? `<td><button onclick="HmiApp.removeManualRad(${i})" style="color:#FF3D00; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td>` : ''}
            </tr>`;
        });
        this.dom.radPositionsPanel.innerHTML = html + '</table>';
    },

    getDimLineHTML(x, y, dx, dy, text, type) {
        let styleLine;
        let finalX = x;
        let finalY = y;
        let absDx = Math.abs(dx);
        let absDy = Math.abs(dy);

        let color = type === 'gap-dim' ? '#4CAF50' : (type === 'manual-dim' ? '#03A9F4' : '#FF3D00');

        if (dx !== 0) {
            if (dx < 0) finalX = x + dx;
            styleLine = `width:${absDx}px; height:1px; border-top:1px dashed ${color};`;
        } else {
            if (dy < 0) finalY = y + dy;
            styleLine = `width:1px; height:${absDy}px; border-left:1px dashed ${color};`;
        }

        return `<div class="dim-line ${type}" style="left:${finalX}px; top:${finalY}px; ${styleLine}"></div>
                <div class="dim-label" style="left:${finalX + absDx / 2}px; top:${finalY + absDy / 2}px; transform: translate(-50%, -50%); background:${color}; border-color:${color};">${text}</div>`;
    },

    updateRadPosition(idx, field, val) {
        if (this.state.isManualMode) {
            this.state.manualPositions[idx][field] = parseInt(val) || 0;
        } else {
            this.state.rad50Positions[idx][field] = parseInt(val) || 0;
            this.state.rad50UserEdited = true;
        }
        this.render();
    },

    rotateManualRad(idx) {
        if (!this.state.isManualMode) return;
        let ang = this.state.manualPositions[idx].angle || 0;
        ang = (ang + 90) % 360;
        this.state.manualPositions[idx].angle = ang;
        this.render();
    },

    removeManualRad(idx) {
        if (!this.state.isManualMode) return;
        this.state.manualPositions.splice(idx, 1);
        this.state.manualPositions.forEach((p, i) => p.n = i + 1);
        this.render();
    },

    showContextMenu(e, idx) {
        if (!this.state.isManualMode) return;
        e.preventDefault();
        this.state.contextRadIdx = idx;
        
        if (this.dom.contextMenu) {
            this.dom.contextMenu.style.left = `${e.clientX}px`;
            this.dom.contextMenu.style.top = `${e.clientY}px`;
            this.dom.contextMenu.classList.remove('hidden');
        }
    },

    hideContextMenu() {
        if (this.dom.contextMenu) {
            this.dom.contextMenu.classList.add('hidden');
        }
        this.state.contextRadIdx = null;
    },

    contextRotate() {
        if (this.state.contextRadIdx !== null) {
            this.rotateManualRad(this.state.contextRadIdx);
        }
    },

    contextDelete() {
        if (this.state.contextRadIdx !== null) {
            this.removeManualRad(this.state.contextRadIdx);
        }
    },

    startDrag(e, idx) {
        if (!this.state.isManualMode && this.state.currentProject !== '24050') return;
        e.preventDefault();
        
        let arr = this.state.isManualMode ? this.state.manualPositions : this.state.rad50Positions;
        let startX = e.clientX;
        let startY = e.clientY;
        let initialPx = arr[idx].x;
        let initialPy = arr[idx].y;
        
        const s = this.state.scale;

        const onMouseMove = (ev) => {
            let dx = ev.clientX - startX;
            let dy = ev.clientY - startY;
            
            arr[idx].x = Math.round(initialPx + dx / s);
            arr[idx].y = Math.round(initialPy - dy / s);
            
            if (this.state.currentProject === '24050') this.state.rad50UserEdited = true;
            this.render();
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    },

    resetRadPositions() {
        if (this.state.isManualMode) {
            this.state.manualPositions = [];
        } else {
            this.state.rad50UserEdited = false;
        }
        this.render();
    },

    updatePalletSize() {
        this.state.palOverrideX = parseInt(this.dom.palW50?.value) || 0;
        this.state.palOverrideY = parseInt(this.dom.palH50?.value) || 0;
        this.render();
    },

    resetPalletSize() {
        this.state.palOverrideX = 0;
        this.state.palOverrideY = 0;
        if (this.dom.palW50) this.dom.palW50.value = 0;
        if (this.dom.palH50) this.dom.palH50.value = 0;
        this.render();
    },

    openMatrixModal() {
        if (!document.getElementById('matrixModal')) {
            this.buildMatrixModal();
        }
        document.getElementById('matrixModal').style.display = 'flex';
    },

    closeMatrixModal() {
        if (document.getElementById('matrixModal')) {
            document.getElementById('matrixModal').style.display = 'none';
        }
    },

    buildMatrixModal() {
        const overlay = document.createElement('div');
        overlay.id = 'matrixModal';
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeMatrixModal();
        };

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.width = '90vw';
        content.style.maxWidth = '1200px';

        let header = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 2px solid var(--kuka-orange); padding-bottom: 10px;">
            <h3 style="margin:0; color:var(--kuka-orange);"><i class="fas fa-table"></i> ${this.config.translations[this.state.lang].matrix} (24048/49)</h3>
            <button onclick="HmiApp.closeMatrixModal()" style="background:none;border:none;color:white;font-size:30px;cursor:pointer;">&times;</button>
        </div>`;

        const widths = [200, 300, 400, 500, 600, 900];

        let containerHtml = `<div style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">`;

        widths.forEach(w => {
            containerHtml += `<h4 style="color:#FFF; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px; margin-top:20px; font-size:18px;">Genişlik: ${w} mm</h4>`;
            containerHtml += `<div style="display:flex; flex-wrap:wrap; gap:8px;">`;

            for (let l = 400; l <= 3000; l += 100) {
                let d = this.getDiz(w, l);
                let isPal2 = l > 1500;
                let bgClass = isPal2 ? 'pal-2' : 'pal-1';
                let palText = isPal2 ? '2 Palet' : '1 Palet';

                containerHtml += `<div class="matrix-cell ${bgClass}" style="padding:10px; border:1px solid rgba(255,255,255,0.1); border-radius:4px; text-align:center; min-width:80px;" onclick="HmiApp.selectFromMatrix(${w}, ${l})">
                    <div style="font-size:16px; color:#fff; margin-bottom: 4px;">L: ${l}</div>
                    <div style="font-size:15px; color:var(--kuka-orange); font-weight:bold; margin-bottom: 2px;">D${d}</div>
                    <div style="font-size:11px; opacity:0.8;">${palText}</div>
                </div>`;
            }
            containerHtml += `</div>`;
        });

        containerHtml += `</div>`; // Close scrollable container

        containerHtml += `<div style="margin-top:15px; font-size:13px; display:flex; gap:15px; justify-content: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="display:flex; align-items:center; gap:5px;"><div style="width:15px;height:15px; border-radius:3px;" class="pal-1"></div> <= 1500mm (1 Palet)</div>
            <div style="display:flex; align-items:center; gap:5px;"><div style="width:15px;height:15px; border-radius:3px;" class="pal-2"></div> >= 1600mm (2 Palet)</div>
            </div>`;

        content.innerHTML = header + containerHtml;
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    },

    selectFromMatrix(w, l) {
        if (this.dom.inW) this.dom.inW.value = w;
        if (this.dom.inL) this.dom.inL.value = l;
        this.closeMatrixModal();
        this.calc();
    },

    // --- Utilities ---
    setLang(lang) {
        this.state.lang = lang;
        ['RU', 'TR', 'UZ'].forEach(l => {
            const btn = document.getElementById('btn' + l);
            if (!btn) return;
            const isActive = l.toLowerCase() === lang;
            btn.classList.toggle('active', isActive);
            if (isActive) {
                btn.classList.remove('bg-slate-900/50', 'border-slate-700', 'text-slate-400', 'hover:bg-slate-700');
                btn.classList.add('bg-orange-500', 'border-orange-500', 'text-slate-900', 'hover:bg-orange-600');
            } else {
                btn.classList.remove('bg-orange-500', 'border-orange-500', 'text-slate-900', 'hover:bg-orange-600');
                btn.classList.add('bg-slate-900/50', 'border-slate-700', 'text-slate-400', 'hover:bg-slate-700');
            }
        });
        const t = this.config.translations[lang];
        const map = { lblControls: 'controls', lblProject: 'project', lblWidth: 'width', lblLength: 'length', lblCalc: 'calc', lblLayout: 'layout', lblInfo: 'info', lblRadiator: 'radiator', lblW2: 'widthL', lblL2: 'lengthL', lblPlacement: 'placement', lblAngle: 'angle', lblPcs: 'pcs', lblLayers: 'layers', lblTotal: 'total', lblPallet: 'pallet', lblPalSize: 'palSize', lblLegend: 'legend', lblLegRad: 'legRad', lblLegPal: 'legPal', lbl1Pal: 'p1', lbl2Pal: 'p2', lblDom: 'dom', lblExp: 'exp', lblReset: 'reset', lblToggleAll: this.state.showAll ? 'toggleAllHide' : 'toggleAllShow', lblPrint: 'print', lblMatrix: 'matrix' };
        Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = t[map[id]]; });
        this.render();
    }
};

window.onload = () => HmiApp.init();