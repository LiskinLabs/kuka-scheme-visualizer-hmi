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
        length: 400,
        dizilimId: 1,
        lang: 'tr',
        gapW: 50,
        gapH: 14,
        exportMode: 0, // 0 = Domestic, 1 = Export
        rad50Positions: [],
        rad50UserEdited: false,
        palOverrideX: 0,
        palOverrideY: 0,
        scale: 0.22,
        showAll: false
    },

    // --- Configuration ---
    config: {
        projects: {
            '24048': { type: 'fixed', pallets: { single: { x: 1200, y: 800 }, double: { x: 2400, y: 800 } } },
            '24049': { type: 'fixed', pallets: { single: { x: 1200, y: 800 }, double: { x: 2400, y: 800 } } },
            '24050': { type: 'dynamic', pallets: null }
        },
        defW: [0, 200, 200, 200, 200, 300, 300, 300, 300, 400, 600, 500, 500],
        defL: [0, 400, 500, 700, 900, 400, 500, 700, 900, 600, 900, 400, 500],
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
        this.selectProject(); // Initial setup
        console.log("HMI Visualizer v3.1 Ready");
    },

    cacheDom() {
        const ids = ['projectSelect', 'inW', 'inL', 'gapW', 'gapH', 'palletArea', 'pallet', 'pallet2', 'centerMark', 'axisX', 'axisY', 'vizTitle', 'statCount', 'statAngle', 'cellNumber', 'currentTime', 'exportToggle', 'radPositionsPanel', 'radPosResetBtn', 'palletSizeControls', 'palW50', 'palH50', 'iW', 'iL', 'iA', 'iC', 'iP', 'iLyr', 'iTot', 'btnRU', 'btnTR', 'btnUZ', 'btnToggleAll', 'lblToggleAll', 'singleViewArea', 'allLayoutsGrid', 'btnMatrix', 'lblMatrix'];
        ids.forEach(id => this.dom[id] = document.getElementById(id));
        this.dom.dizilimGrid = document.querySelector('.dizilim-grid');
        this.dom.palletModeSelector = document.querySelector('.mode-selector');

        // Cached Arrays
        this.dom.dizilimButtons = [];
        for (let i = 1; i <= 12; i++) {
            this.dom.dizilimButtons[i] = document.getElementById('b' + i);
        }
        this.dom.modeButtons = [document.getElementById('m1'), document.getElementById('m2')];
        this.dom.exportButtons = [document.getElementById('btnDomestic'), document.getElementById('btnExport')];
    },

    initEventListeners() {
        window.addEventListener('resize', () => this.render());
        if (this.dom.inW) this.dom.inW.onchange = () => this.calc();
        if (this.dom.inL) this.dom.inL.onchange = () => this.calc();
        if (this.dom.gapW) this.dom.gapW.onchange = () => this.calc();
        if (this.dom.gapH) this.dom.gapH.onchange = () => this.calc();
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

    selectProject() {
        this.state.currentProject = this.dom.projectSelect?.value || '24048';
        const is50 = this.state.currentProject === '24050';

        // Toggle UI Panels
        this.dom.dizilimGrid.style.display = is50 ? 'none' : '';
        this.dom.exportToggle.style.display = is50 ? 'flex' : 'none';
        this.dom.radPositionsPanel.style.display = is50 ? '' : 'none';
        this.dom.radPosResetBtn.style.display = is50 ? '' : 'none';
        this.dom.palletSizeControls.style.display = is50 ? '' : 'none';
        if (this.dom.palletModeSelector) this.dom.palletModeSelector.style.display = is50 ? 'none' : 'grid';
        if (this.dom.btnMatrix) this.dom.btnMatrix.style.display = is50 ? 'none' : 'block';

        if (this.dom.cellNumber) this.dom.cellNumber.textContent = 'Cell ' + this.state.currentProject;

        if (is50) {
            this.state.isDualPallet = false;
            this.state.palOverrideX = 0;
            this.state.palOverrideY = 0;
            this.state.rad50UserEdited = false;
        }

        this.calc();
    },

    setMode(isDual) {
        this.state.isDualPallet = !!isDual;
        if (this.dom.modeButtons[0]) this.dom.modeButtons[0].className = isDual ? 'mode-btn' : 'mode-btn active';
        if (this.dom.modeButtons[1]) this.dom.modeButtons[1].className = isDual ? 'mode-btn active' : 'mode-btn';
        this.render();
    },

    toggleExport(mode) {
        this.state.exportMode = mode;
        if (this.dom.exportButtons[0]) this.dom.exportButtons[0].className = mode ? 'mode-btn' : 'mode-btn active';
        if (this.dom.exportButtons[1]) this.dom.exportButtons[1].className = mode ? 'mode-btn active' : 'mode-btn';
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
        const counts = [0, 8, 6, 5, 3, 6, 4, 3, 2, 2, 1, 3, 2];
        const angles = [0, 0, 90, 0, 90, 90, 90, 0, 90, 0, 90, 90, 90];

        for (let i = 1; i <= 12; i++) {
            const btn = this.dom.dizilimButtons[i];
            if (btn) {
                btn.className = (i === this.state.dizilimId) ? 'dizilim-btn active' : 'dizilim-btn';
                if (this.state.currentProject !== '24050') {
                    btn.innerHTML = `D${i}<span style="font-size:11px; opacity:0.8; display:block; line-height:1.2; font-weight:normal; margin-top:2px;">${counts[i]} adet / ${angles[i]}°</span>`;
                } else {
                    btn.innerHTML = `D${i}`;
                }
            }
        }
        const m1 = this.dom.modeButtons[0];
        const m2 = this.dom.modeButtons[1];
        if (m1) m1.className = this.state.isDualPallet ? 'mode-btn' : 'mode-btn active';
        if (m2) m2.className = this.state.isDualPallet ? 'mode-btn active' : 'mode-btn';
    },

    getDiz(w, l) {
        if (w == 200) return l == 400 ? 1 : (l <= 600 ? 2 : (l <= 800 ? 3 : 4));
        if (w == 300) return l == 400 ? 5 : (l <= 600 ? 6 : (l <= 800 ? 7 : 8));
        if (w == 400) return l == 400 ? 11 : (l <= 800 ? 9 : 10);
        if (w == 500) return l == 400 ? 11 : (l <= 600 ? 12 : (l <= 800 ? 9 : 10));
        return l == 400 ? 11 : (l <= 600 ? 12 : 10);
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

        // Fixed Dizilims for 24048/24049
        const add = (x, y, n) => pos.push({ x, y, n, angle: globalAngle });

        switch (d) {
            case 1: globalAngle = 0; for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) add((c - 1.5) * (w + GW), (0.5 - r) * (l + GH), r * 4 + c + 1); break;
            case 2: globalAngle = -90; for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) add((c - 0.5) * (l + GH), (1 - r) * (w + GW), r * 2 + c + 1); break;
            case 3: globalAngle = 0; for (let c = 0; c < 5; c++) add((c - 2) * (w + GW), 0, c + 1); break;
            case 4: globalAngle = -90; for (let r = 0; r < 3; r++) add(0, (1 - r) * (w + GW), r + 1); break;
            case 5: globalAngle = -90; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) add((c - 1) * (l + GH), (0.5 - r) * (w + GW), r * 3 + c + 1); break;
            case 6: globalAngle = -90; for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) add((c - 0.5) * (l + GH), (0.5 - r) * (w + GW), r * 2 + c + 1); break;
            case 7: globalAngle = 0; for (let c = 0; c < 3; c++) add((c - 1) * (w + GW), 0, c + 1); break;
            case 8: globalAngle = -90; for (let r = 0; r < 2; r++) add(0, (0.5 - r) * (w + GW), r + 1); break;
            case 9: globalAngle = 0; for (let c = 0; c < 2; c++) add((c - 0.5) * (w + GW), 0, c + 1); break;
            case 10: globalAngle = -90; add(0, 0, 1); break;
            case 11: globalAngle = -90; for (let c = 0; c < 3; c++) add((c - 1) * (l + GH), 0, c + 1); break;
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

        if (this.state.showAll) {
            const txt = this.config.translations[this.state.lang].toggleAllHide;
            this.dom.btnToggleAll.innerHTML = `<i class="fas fa-eye-slash"></i><span id="lblToggleAll">${txt}</span>`;
            this.dom.btnToggleAll.classList.add('active');
            this.dom.singleViewArea.style.display = 'none';
            this.dom.allLayoutsGrid.style.display = 'grid';
            this.renderAllLayouts();
        } else {
            const txt = this.config.translations[this.state.lang].toggleAllShow;
            this.dom.btnToggleAll.innerHTML = `<i class="fas fa-th-large"></i><span id="lblToggleAll">${txt}</span>`;
            this.dom.btnToggleAll.classList.remove('active');
            this.dom.singleViewArea.style.display = 'block';
            this.dom.allLayoutsGrid.style.display = 'none';
            this.render();
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

        const fragment = document.createDocumentFragment();

        widths.forEach(w => {
            lengths.forEach(l => {
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
                fragment.appendChild(card);

                // Render loop onto this specific container using exact single visualizer logic
                this._renderSinglePalletInside(area, true);
            });
        });

        grid.appendChild(fragment);

        // Restore state
        this.state.dizilimId = backupD;
        this.state.width = backupW;
        this.state.length = backupL;
        this.state.isDualPallet = backupDual;
    },

    render() {
        if (!this.dom.palletArea || !this.dom.pallet) return;
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
            pal2 = document.createElement('div');
            pal2.className = 'pallet2';
            radLayer = document.createElement('div');
            radLayer.className = 'rad-layer';
            radLayer.style.position = 'absolute';
            radLayer.style.top = '0';
            radLayer.style.left = '0';
            radLayer.style.width = '100%';
            radLayer.style.height = '100%';
            radLayer.style.pointerEvents = 'none';

            area.appendChild(pal);
            area.appendChild(pal2);
            area.appendChild(radLayer);
        }

        const is50 = this.state.currentProject === '24050';
        const palSize = this.getPalletSize();
        const { positions, angle, isPerPieceAngle } = this.getPositions();

        // Calculate Scale
        // FIX: For miniatures drawn in a loop, getting offsetWidth triggers reflow and reads wrong sizes BEFORE grid settles.
        // We enforce standard card dimensions (350x280 max) to ensure pure symmetrical rendering regardless of reflow state.
        const effectiveAreaW = isMiniature ? 300 : (area.offsetWidth || 300);
        const effectiveAreaH = isMiniature ? 280 : (area.offsetHeight || 280);

        const areaW = effectiveAreaW - 40;
        const areaH = effectiveAreaH - 40;
        let maxExtentX = palSize.x / 2, maxExtentY = palSize.y / 2;

        positions.forEach(p => {
            const rw = (is50 || p.angle === 0) ? this.state.width : this.state.length;
            const rh = (is50 || p.angle === 0) ? this.state.length : this.state.width;
            maxExtentX = Math.max(maxExtentX, Math.abs(p.x) + (is50 ? rh : rw) / 2);
            maxExtentY = Math.max(maxExtentY, Math.abs(p.y) + (is50 ? rw : rh) / 2);
        });

        this.state.scale = Math.min(areaW / (maxExtentX * 2), areaH / (maxExtentY * 2), 1.0);
        const s = this.state.scale;

        // Render Pallet
        pal.className = is50 ? 'pallet-wood' : 'pallet';
        pal.style.width = Math.round(palSize.x * s) + 'px';
        pal.style.height = Math.round(palSize.y * s) + 'px';
        pal.style.left = Math.round((effectiveAreaW - palSize.x * s) / 2) + 'px';
        pal.style.top = Math.round((effectiveAreaH - palSize.y * s) / 2) + 'px';

        if (this.state.isDualPallet && !is50) {
            pal2.style.display = 'block';
            const sw = Math.round(1200 * s);
            pal.style.width = sw + 'px';
            pal2.style.width = sw + 'px';
            pal2.style.height = pal.style.height;
            pal2.style.top = pal.style.top;
            pal2.style.left = (parseInt(pal.style.left) + sw) + 'px';
        } else {
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
            const isRotated = thisAngle === -90 || thisAngle === 90;

            const dualClass = (!is50 && this.state.isDualPallet) ? ' rad-dual' : '';
            const className = is50 ? (isFlipped ? 'rad-24050 rad-24050-flipped' : 'rad-24050') : (isRotated ? 'rad rad-rotated' + dualClass : 'rad' + dualClass);

            const rw = is50 ? (this.state.length * s) : (thisAngle === 0 ? this.state.width * s : this.state.length * s);
            const rh = is50 ? (this.state.width * s) : (thisAngle === 0 ? this.state.length * s : this.state.width * s);

            const wPx = Math.round(rw);
            const hPx = Math.round(rh);
            const radLeft = Math.round(parseInt(pal.style.left) + (palSize.x * s / 2) + (p.x * s) - (rw / 2));
            const radTop = Math.round(parseInt(pal.style.top) + (palSize.y * s / 2) - (p.y * s) - (rh / 2));

            const numLabel = `${p.n}${isFlipped ? '↻' : ''}`;
            const innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped);
            const animDelay = (i * 0.05) + 's';

            // Overflow Check
            const ovX = Math.max(0, Math.abs(p.x) + (is50 ? this.state.length : (thisAngle === 0 ? this.state.width : this.state.length)) / 2 - palSize.x / 2);
            const ovY = Math.max(0, Math.abs(p.y) + (is50 ? this.state.width : (thisAngle === 0 ? this.state.length : this.state.width)) / 2 - palSize.y / 2);
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

            radiatorsHTML += `<div class="${className}${extraClass}" style="width:${wPx}px; height:${hPx}px; left:${radLeft}px; top:${radTop}px; animation-delay:${animDelay}; pointer-events:auto;">${innerHTML}</div>`;
        });

        radLayer.innerHTML = radiatorsHTML;

        // Info Panel - Only update if not miniature loop
        if (!isMiniature && this.dom.iW) {
            this.dom.iW.textContent = this.state.width + ' mm';
            this.dom.iL.textContent = this.state.length + ' mm';
            this.dom.iA.textContent = is50 ? '0°/180°' : angle + '°';
            this.dom.iC.textContent = positions.length + ' ' + (this.config.translations[this.state.lang].pcs);
            this.dom.iP.textContent = `${palSize.x} × ${palSize.y} (Taşma: ${Math.round(maxOv)}mm)`;

            if (is50) this.renderRadTable(positions);
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

    renderRadTable(positions) {
        if (!this.dom.radPositionsPanel) return;
        let html = '<table class="rad-pos-table"><tr><th>#</th><th>X</th><th>Y</th><th>A°</th></tr>';
        positions.forEach((p, i) => {
            html += `<tr>
                <td class="rad-pos-num">${p.n}</td>
                <td><input type="number" class="rad-pos-input" value="${p.x}" onchange="HmiApp.updateRadPosition(${i}, 'x', this.value)"></td>
                <td><input type="number" class="rad-pos-input" value="${p.y}" onchange="HmiApp.updateRadPosition(${i}, 'y', this.value)"></td>
                <td class="rad-pos-angle">${p.angle}°</td>
            </tr>`;
        });
        this.dom.radPositionsPanel.innerHTML = html + '</table>';
    },

    getDimLineHTML(x, y, dx, dy, text, type) {
        let styleLine;
        if (dx > 0) {
            styleLine = `width:${dx}px; height:1px; border-top:1px dashed #FF3D00;`;
        } else {
            styleLine = `width:1px; height:${dy}px; border-left:1px dashed #FF3D00;`;
        }

        return `<div class="dim-line ${type}" style="left:${x}px; top:${y}px; ${styleLine}"></div>
                <div class="dim-label" style="left:${x + dx / 2}px; top:${y + dy / 2}px;">${text}</div>`;
    },

    updateRadPosition(idx, field, val) {
        this.state.rad50Positions[idx][field] = parseInt(val) || 0;
        this.state.rad50UserEdited = true;
        this.render();
    },

    resetRadPositions() {
        this.state.rad50UserEdited = false;
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
        ['RU', 'TR', 'UZ'].forEach(l => document.getElementById('btn' + l).className = (l.toLowerCase() === lang ? 'lang-btn active' : 'lang-btn'));
        const t = this.config.translations[lang];
        const map = { lblControls: 'controls', lblProject: 'project', lblWidth: 'width', lblLength: 'length', lblCalc: 'calc', lblLayout: 'layout', lblInfo: 'info', lblRadiator: 'radiator', lblW2: 'widthL', lblL2: 'lengthL', lblPlacement: 'placement', lblAngle: 'angle', lblPcs: 'pcs', lblLayers: 'layers', lblTotal: 'total', lblPallet: 'pallet', lblPalSize: 'palSize', lblLegend: 'legend', lblLegRad: 'legRad', lblLegPal: 'legPal', lbl1Pal: 'p1', lbl2Pal: 'p2', lblDom: 'dom', lblExp: 'exp', lblReset: 'reset', lblToggleAll: this.state.showAll ? 'toggleAllHide' : 'toggleAllShow', lblPrint: 'print', lblMatrix: 'matrix' };
        Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = t[map[id]]; });
        this.render();
    }
};

window.onload = () => HmiApp.init();
