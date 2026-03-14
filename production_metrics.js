/**
 * KUKA HMI VISUALIZER - Core Logic v3.2 (Industrial Restoration)
 * Restored industrial scheme logic while maintaining performance optimizations.
 */

const HmiApp = {
    // --- State ---

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

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
        lastZoomDist: null,
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
            ru: { controls: 'Панель управления', project: 'Проект', width: 'Ширина (мм)', length: 'Длина (мм)', calc: 'Рассчитать', layout: 'Схема укладки', info: 'Информация', radiator: 'Радиатор', widthL: 'Ширина:', lengthL: 'Длина:', placement: 'Размещение', angle: 'Угол:', pcs: 'Шт/слой:', layers: 'Слоев:', total: 'Всего:', pallet: 'Паллета', palSize: 'Размер:', overflow: 'Выход:', legend: 'ЛЕГЕНДА', legRad: 'Радиатор', legPal: 'Паллета', copyKrl: 'Копировать KRL', krlCopied: 'KRL скопирован!', toggleAllShow: 'Показать все', toggleAllHide: 'Режим 1 схемы', print: 'Печать', p1: '1 Паллета', p2: '2 Паллеты', dom: 'Внутренний', exp: 'На экспорт', reset: 'Сброс позиций', matrix: 'Матрица укладки',
                properties: 'Свойства', viewDims: 'Вид / Размеры', centerDims: 'Размеры от центра', gapDims: 'Размеры зазоров', edgeDims: 'Размеры от краев', manualConfig: 'Ручная настройка', addRadiator: 'Добавить Радиатор:', addBtn: 'Добавить', autoAlign: 'Авто выравнивание', overrideSize: 'Изменить размер:', options: 'Опции', dimensions: 'Размеры', placementMode: 'Режим Размещения', toggleGrid: 'Переключить сетку', shareImage: 'Поделиться изображением', ctxRotate: 'Повернуть 90°', ctxDelete: 'Удалить',
                ttAutoMode: 'Автоматический режим', ttManualMode: 'Ручной режим', ttResetView: 'Сбросить вид / По размеру', ttShowAll: 'Показать все схемы', ttDownload: 'Скачать изображение'
            },
            tr: { controls: 'Kontrol Paneli', project: 'Proje', width: 'Genişlik (mm)', length: 'Uzunluk (mm)', calc: 'Hesapla', layout: 'Dizilim Şeması', info: 'Bilgiler', radiator: 'Radyatör', widthL: 'Genişlik:', lengthL: 'Uzunluk:', placement: 'Yerleşim', angle: 'Açı:', pcs: 'Adet/kat:', layers: 'Kat Sayısı:', total: 'Toplam:', pallet: 'Palet', palSize: 'Boyut:', overflow: 'Taşma:', legend: 'LEJANT', legRad: 'Radyatör', legPal: 'Palet', copyKrl: 'KRL Kopyala', krlCopied: 'KRL Kopyalandı!', toggleAllShow: 'Tümünü Göster', toggleAllHide: 'Tekli Görünüme Dön', print: 'Yazdır (Print)', p1: '1 Palet', p2: '2 Palet', dom: 'Domestic', exp: 'Export', reset: 'Reset Positions', matrix: 'Dizilim Matrisi',
                properties: 'Özellikler', viewDims: 'Görünüm / Boyutlar', centerDims: 'Merkez Boyutları', gapDims: 'Boşluk Boyutları', edgeDims: 'Kenar Boyutları', manualConfig: 'Manuel Yapılandırma', addRadiator: 'Radyatör Ekle:', addBtn: 'Ekle', autoAlign: 'Otomatik Hizala', overrideSize: 'Boyutu Geçersiz Kıl:', options: 'Seçenekler', dimensions: 'Boyutlar', placementMode: 'Yerleşim Modu', toggleGrid: 'Izgara Görünümünü Değiştir', shareImage: 'Görüntüyü Paylaş', ctxRotate: '90° Döndür', ctxDelete: 'Sil',
                ttAutoMode: 'Otomatik Mod', ttManualMode: 'Manuel Mod', ttResetView: 'Görünümü Sıfırla / Sığdır', ttShowAll: 'Tüm Dizilimleri Göster', ttDownload: 'Görüntüyü İndir'
            },
            uz: { controls: 'Boshqaruv paneli', project: 'Loyiha', width: 'Kenglik (mm)', length: 'Uzunlik (mm)', calc: 'Hisoblash', layout: 'Joylashtirish sxemasi', info: 'Ma\'lumot', radiator: 'Radiator', widthL: 'Kenglik:', lengthL: 'Uzunlik:', placement: 'Joylashtirish', angle: 'Burchak:', pcs: 'Dona/qat:', layers: 'Qatlamlar:', total: 'Jami:', pallet: 'Palet', palSize: 'O\'lcham:', overflow: 'Chiqish:', legend: 'LEGEND', legRad: 'Radiator', legPal: 'Palet', copyKrl: 'KRL Nusxalash', krlCopied: 'KRL Nusxalandi!', toggleAllShow: 'Barchasini ko\'rsatish', toggleAllHide: 'Yagona Ko\'rinishga Qaytish', print: 'Chop etish', p1: '1 Palet', p2: '2 Palet', dom: 'Mahalliy', exp: 'Eksport', reset: 'Holatni tiklash', matrix: 'Matritsa',
                properties: 'Xususiyatlar', viewDims: 'Ko\'rinish / O\'lchamlar', centerDims: 'Markaziy O\'lchamlar', gapDims: 'Oraliq O\'lchamlar', edgeDims: 'Chekka O\'lchamlar', manualConfig: 'Qo\'lda Sozlash', addRadiator: 'Radiator Qo\'shish:', addBtn: 'Qo\'shish', autoAlign: 'Avto Tekislash', overrideSize: 'O\'lchamni O\'zgartirish:', options: 'Variantlar', dimensions: 'O\'lchamlar', placementMode: 'Joylashtirish Rejimi', toggleGrid: 'To\'r Ko\'rinishini O\'zgartirish', shareImage: 'Tasvirni Ulashish', ctxRotate: '90° Burish', ctxDelete: 'O\'chirish',
                ttAutoMode: 'Avtomatik Rejim', ttManualMode: 'Qo\'lda Rejim', ttResetView: 'Ko\'rinishni Tiklash', ttShowAll: 'Barcha sxemalarni ko\'rsatish', ttDownload: 'Tasvirni Yuklab Olish'
            }
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
        this.selectProject(); 
        this.syncPanelsUI();
        this.setLang(this.state.lang); // Apply initial translation
        console.log("HMI Visualizer v3.2 Industrial Restored");
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
                if (p.width) this.state.width = p.width;
                if (p.length) this.state.length = p.length;
                if (p.gapH !== undefined) this.state.gapH = p.gapH;
                if (this.state.gapH < 50) this.state.gapH = 200; // Force reset old residue values like 14

                if (p.gapW !== undefined) this.state.gapW = p.gapW;
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
                if (p.palOverrideX !== undefined) this.state.palOverrideX = p.palOverrideX;
                if (p.palOverrideY !== undefined) this.state.palOverrideY = p.palOverrideY;

                if (this.state.isLightTheme) {
                    document.body.classList.add('light-theme');
                }

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
            console.error('Failed to load state from localStorage', e);
        }
    },

    cacheDom() {
        const ids = ['projectSelect', 'inW', 'inL', 'gapW', 'gapH', 'palletArea', 'pallet', 'pallet2', 'centerMark', 'axisX', 'axisY', 'vizTitle', 'statCount', 'statAngle', 'exportToggle', 'radPositionsPanel', 'radPosResetBtn', 'palletSizeControls', 'palW50', 'palH50', 'iW', 'iL', 'iA', 'iC', 'iP', 'iLyr', 'iTot', 'btnRU', 'btnTR', 'btnUZ', 'btnToggleAll', 'lblToggleAll', 'singleViewArea', 'allLayoutsGrid', 'btnMatrix', 'lblMatrix', 'manualModeToggle', 'btnAutoMode', 'btnManualMode', 'manualAddPanel', 'manW', 'manL', 'dizilimGridContainer', 'leftPanel', 'rightPanel', 'leftPanelIcon', 'rightPanelIcon', 'btnOpenLeft', 'btnOpenRight', 'contextMenu', 'ctxRotate', 'ctxDelete', 'btnDomestic', 'btnExport', 'mTopRadSize', 'mTopPalSize', 'm-exportModeSection', 'm-btnDomestic', 'm-btnExport'];
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

    initEventListeners() {
        window.addEventListener('beforeprint', () => {
            if (this.state.showAll && this.dom.allLayoutsGrid) {
                let scale = Math.min(1000 / 1400, 700 / 1000);
                if (scale > 0.6) scale = 0.6;
                this.dom.allLayoutsGrid.style.setProperty('transform', `scale(${scale})`, 'important');
                this.dom.allLayoutsGrid.style.setProperty('transform-origin', 'center center', 'important');
                this.dom.allLayoutsGrid.style.setProperty('margin', 'auto', 'important');
            } else if (this.dom.palletArea) {
                let s = this.state.scale || 1;
                const palSize = this.getPalletSize();
                const palW = palSize.x * s;
                const palH = palSize.y * s;

                // Allow extra space for the bottom table (approx 350px)
                let maxBoundsX = palW + 300;
                let maxBoundsY = palH + 450;

                // A4 landscape internal canvas roughly 1000x700
                let scaleX = 1000 / maxBoundsX;
                let scaleY = 700 / maxBoundsY;
                let scale = Math.min(scaleX, scaleY);
                if (scale > 0.6) scale = 0.6;

                this.dom.palletArea.style.setProperty('transform', `scale(${scale})`, 'important');
                this.dom.palletArea.style.setProperty('transform-origin', 'center center', 'important');
            }
        });
        window.addEventListener('afterprint', () => {
            if (this.state.showAll && this.dom.allLayoutsGrid) {
                this.dom.allLayoutsGrid.style.removeProperty('transform');
                this.dom.allLayoutsGrid.style.removeProperty('transform-origin');
                this.dom.allLayoutsGrid.style.removeProperty('margin');
            } else if (this.dom.palletArea) {
                this.dom.palletArea.style.removeProperty('transform');
                this.dom.palletArea.style.removeProperty('transform-origin');
            }
            this.applyTransform();
        });

        window.addEventListener('resize', () => {
            this.syncPanelsUI();
            this.render();
        });

        if (this.dom.singleViewArea) {
            this.dom.singleViewArea.addEventListener('wheel', (e) => this.handleZoom(e), { passive: false });
            this.dom.singleViewArea.addEventListener('mousedown', (e) => this.startPan(e));
            this.dom.singleViewArea.addEventListener('touchstart', (e) => this.startPan(e), { passive: false });
            this.dom.singleViewArea.addEventListener('touchmove', (e) => this.handleZoomTouch(e), { passive: false });
            this.dom.singleViewArea.addEventListener('touchend', (e) => { this.state.lastZoomDist = null; });
            this.dom.singleViewArea.addEventListener('touchcancel', (e) => { this.state.lastZoomDist = null; });
        }

        if (this.dom.inW) this.dom.inW.oninput = this.debounce(() => this.calc(), 200);
        if (this.dom.inL) this.dom.inL.oninput = this.debounce(() => this.calc(), 200);
        if (this.dom.gapW) this.dom.gapW.oninput = this.debounce(() => this.calc(), 200);
        if (this.dom.gapH) this.dom.gapH.oninput = this.debounce(() => this.calc(), 200);
        if (this.dom.palW50) this.dom.palW50.oninput = this.debounce(() => this.updatePalletSize(), 200);
        if (this.dom.palH50) this.dom.palH50.oninput = this.debounce(() => this.updatePalletSize(), 200);

        document.addEventListener('click', (e) => {
            if (this.dom.contextMenu && !this.dom.contextMenu.classList.contains('hidden')) {
                this.hideContextMenu();
            }
        });
    },

    initLengths() {
        if (!this.dom.inL) return;
        this.dom.inL.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (let i = 400; i <= 3000; i += 100) {
            const opt = document.createElement('option');
            opt.value = opt.textContent = i;
            fragment.appendChild(opt);
        }
        this.dom.inL.appendChild(fragment);
        this.dom.inL.value = 400;
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

    alignManualRadiators() {
        if (!this.state.isManualMode || this.state.manualPositions.length === 0) return;
        let arr = this.state.manualPositions;
        let rows = [];
        arr.sort((a, b) => b.y - a.y); 
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
        rows.forEach((row) => {
            row.sort((a, b) => a.x - b.x); 
            let totalW = row.reduce((sum, p, i) => {
                let realW = (p.angle % 180 === 0 ? (p.w || this.state.width) : (p.l || this.state.length));
                return sum + realW + (i > 0 ? this.state.gapW : 0);
            }, 0);
            let curX = -totalW / 2;
            row.forEach(p => {
                let realW = (p.angle % 180 === 0 ? (p.w || this.state.width) : (p.l || this.state.length));
                p.x = Math.round(curX + realW / 2);
                curX += realW + this.state.gapW;
            });
        });
        let totalH = rows.reduce((sum, row, i) => {
            let maxH = Math.max(...row.map(p => (p.angle % 180 === 0 ? (p.l || this.state.length) : (p.w || this.state.width))));
            return sum + maxH + (i > 0 ? this.state.gapH : 0);
        }, 0);
        let curY = totalH / 2;
        rows.forEach((row) => {
            let maxH = Math.max(...row.map(p => (p.angle % 180 === 0 ? (p.l || this.state.length) : (p.w || this.state.width))));
            row.forEach(p => {
                p.y = Math.round(curY - maxH / 2);
            });
            curY -= (maxH + this.state.gapH);
        });
        let n = 1;
        rows.forEach(row => { row.forEach(p => p.n = n++); });
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

    getPalletSize() {
        const proj = this.config.projects[this.state.currentProject];
        if (proj.type === 'fixed') return this.state.isDualPallet ? proj.pallets.double : proj.pallets.single;
        if (this.state.palOverrideX > 0 && this.state.palOverrideY > 0) return { x: this.state.palOverrideX, y: this.state.palOverrideY };
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
            if (this.state.isManualMode) return { positions: this.state.manualPositions, angle: 0, isPerPieceAngle: true, isManual: true };
            if (!this.state.rad50UserEdited) this.state.rad50Positions = this.getDefaultPositions24050(d, w, l);
            return { positions: this.state.rad50Positions, angle: 0, isPerPieceAngle: true };
        }
        if (this.state.isManualMode) return { positions: this.state.manualPositions, angle: 0, isPerPieceAngle: true, isManual: true };
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
        const xOff = 0;
        if (d == 1) { p.push({ n: 1, x: xOff, y: m(w / 2 + 15), angle: 0 }, { n: 2, x: -xOff, y: m(-w / 2 - 15), angle: 180 }); }
        else if (d == 2) {
            p.push({ n: 1, x: m(-l / 2 + xOff - 10), y: w + 100, angle: 0 }, { n: 2, x: m(l / 2 + xOff + 12), y: w + 100, angle: 0 },
                { n: 3, x: m(-l / 2 + xOff - 10), y: 50, angle: 0 }, { n: 4, x: m(l / 2 + xOff + 12), y: 50, angle: 0 },
                { n: 5, x: m(l / 2 - xOff + 12), y: -w, angle: 180 }, { n: 6, x: m(-l / 2 - xOff - 10), y: -w, angle: 180 });
        }
        else if (d == 3) {
            p.push({ n: 1, x: m(-l / 2 + xOff - 12), y: m(w / 2 + 16), angle: 0 }, { n: 2, x: m(l / 2 + xOff + 12), y: m(w / 2 + 16), angle: 0 },
                { n: 3, x: m(l / 2 - xOff + 12), y: m(-w / 2 - 16), angle: 180 }, { n: 4, x: m(-l / 2 - xOff - 12), y: m(-w / 2 - 16), angle: 180 });
        }
        else if (d == 4) {
            p.push({ n: 1, x: xOff, y: m(w * 1.5 + 45), angle: 0 }, { n: 2, x: -xOff, y: m(w / 2 + 15), angle: 180 },
                { n: 3, x: xOff, y: m(-w / 2 - 15), angle: 0 }, { n: 4, x: -xOff, y: m(-w * 1.5 - 45), angle: 180 });
        }
        else if (d == 5) p.push({ n: 1, x: xOff, y: 0, angle: 0 });
        else if (d == 6) {
            p.push({ n: 1, x: m(l / 2 + xOff + 15), y: 0, angle: 0 }, { n: 2, x: m(-l / 2 - xOff - 15), y: 0, angle: 180 });
        }
        else if (d == 7) {
            p.push({ n: 1, x: xOff, y: w + 29, angle: 0 }, { n: 2, x: -xOff, y: 0, angle: 180 }, { n: 3, x: -xOff, y: -w - 29, angle: 180 });
        }
        return p;
    },

    toggleAllLayouts() {
        this.state.showAll = !this.state.showAll;
        if (!this.dom.btnToggleAll || !this.dom.singleViewArea || !this.dom.allLayoutsGrid) return;
        this.state.zoom = 1; this.state.panX = 0; this.state.panY = 0;
        this.applyTransform();
        if (this.state.showAll) {
            const txt = this.config.translations[this.state.lang].toggleAllHide;
            this.dom.btnToggleAll.innerHTML = `<i class="fas fa-eye-slash text-xs"></i><span id="lblToggleAll" class="hidden"></span>`;
            this.dom.btnToggleAll.querySelector("#lblToggleAll").textContent = txt;
            this.dom.btnToggleAll.classList.add('active');
            if (this.dom.palletArea) if(this.dom.palletArea) this.dom.palletArea.style.display = 'none';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.display = 'flex';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.flexDirection = 'column';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.gap = '40px';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.padding = '40px';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.transformOrigin = '0 0';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.position = 'absolute';

            document.querySelectorAll('.info-card').forEach(el => el.style.display = 'none');
            this.renderAllLayouts();
        } else {
            const txt = this.config.translations[this.state.lang].toggleAllShow;
            this.dom.btnToggleAll.innerHTML = `<i class="fas fa-th-large text-xs"></i><span id="lblToggleAll" class="hidden"></span>`;
            this.dom.btnToggleAll.querySelector("#lblToggleAll").textContent = txt;
            this.dom.btnToggleAll.classList.remove('active');
            if (this.dom.palletArea) if(this.dom.palletArea) this.dom.palletArea.style.display = 'flex';
            if(this.dom.allLayoutsGrid) this.dom.allLayoutsGrid.style.display = 'none';

            document.querySelectorAll('.info-card').forEach(el => el.style.display = '');
            this.render();
        }
    },

    renderAllLayouts() {
        const grid = this.dom.allLayoutsGrid;
        if (!grid) return;
        grid.innerHTML = '';
        const is50 = this.state.currentProject === '24050';
        const backupD = this.state.dizilimId;
        const backupW = this.state.width;
        const backupL = this.state.length;
        const backupDual = this.state.isDualPallet;
        const widths = [200, 300, 400, 500, 600, 900];
        const lengths = [400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000, 2500, 3000];
        const renderRow = (widthIndex) => {
            if (widthIndex >= widths.length) {
                this.state.dizilimId = backupD; this.state.width = backupW; this.state.length = backupL; this.state.isDualPallet = backupDual;
                return;
            }
            const w = widths[widthIndex];
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex'; rowDiv.style.gap = '20px';
            const label = document.createElement('div');
            label.style.writingMode = 'vertical-rl'; label.style.transform = 'rotate(180deg)'; label.style.fontSize = '24px'; label.style.fontWeight = 'bold'; label.style.color = '#F97316'; label.textContent = `W: ${w}`;
            rowDiv.appendChild(label);
            const itemsContainer = document.createElement('div');
            itemsContainer.style.display = 'flex'; itemsContainer.style.gap = '20px';
            rowDiv.appendChild(itemsContainer);
            grid.appendChild(rowDiv);
            let lengthIndex = 0;
            const renderNextItem = () => {
                if (lengthIndex >= lengths.length) { setTimeout(() => renderRow(widthIndex + 1), 0); return; }
                const chunkEnd = Math.min(lengthIndex + 10, lengths.length);
                for (let i = lengthIndex; i < chunkEnd; i++) {
                    const l = lengths[i];
                    this.state.width = w; this.state.length = l;
                    if (is50) { this.state.dizilimId = this.autoDizilim24050(w, l, this.state.exportMode); this.state.isDualPallet = false; }
                    else { this.state.dizilimId = this.getDiz(w, l); this.state.isDualPallet = l > 1500; }
                    const card = document.createElement('div');
                    card.className = 'info-card bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3';
                    const title = document.createElement('div');
                    title.className = 'text-sm font-bold text-slate-300'; title.textContent = `L: ${l} (D${this.state.dizilimId})`;
                    const area = document.createElement('div');
                    area.className = 'pallet-area-mini'; area.style.width = '300px'; area.style.height = '200px'; area.style.position = 'relative'; area.style.display = 'flex'; area.style.alignItems = 'center'; area.style.justifyContent = 'center';
                    card.appendChild(title); card.appendChild(area); itemsContainer.appendChild(card);
                    this._renderSinglePalletInside(area, true);
                }
                lengthIndex = chunkEnd;
                requestAnimationFrame(renderNextItem);
            };
            renderNextItem();
        };
        renderRow(0);
    },

    render() {
        if (!this.dom.palletArea || !this.dom.pallet) return;
        this.saveState();
        if (this.state.showAll) { this.renderAllLayouts(); return; }
        this._renderSinglePalletInside(this.dom.palletArea, false);
    },

    _renderSinglePalletInside(area, isMiniature) {
        let pal = area.querySelector('.pallet') || area.querySelector('.pallet-wood');
        let pal2 = area.querySelector('.pallet2');
        let radLayer = area.querySelector('.rad-layer');
        if (!pal) {
            pal = document.createElement('div'); pal.className = 'pallet'; area.appendChild(pal);
            pal2 = document.createElement('div'); pal2.className = 'pallet2'; area.appendChild(pal2);
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
        let maxExtentX = palSize.x / 2, maxExtentY = palSize.y / 2;
        positions.forEach(p => {
            let currentW = p.w !== undefined ? p.w : this.state.width;
            let currentL = p.l !== undefined ? p.l : this.state.length;
            let pAngle = isPerPieceAngle ? p.angle : angle;
            const rw = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);
            const rh = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);
            maxExtentX = Math.max(maxExtentX, Math.abs(p.x) + rw / 2);
            maxExtentY = Math.max(maxExtentY, Math.abs(p.y) + rh / 2);
        });
                // Move maxOv calculation up
        let maxOv = 0;
        positions.forEach(p => {
            let currentW = p.w !== undefined ? p.w : this.state.width;
            let currentL = p.l !== undefined ? p.l : this.state.length;
            let pAngle = isPerPieceAngle ? p.angle : angle;
            let realW = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);
            let realH = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);
            const ovX = Math.max(0, Math.abs(p.x) + realW / 2 - palSize.x / 2);
            const ovY = Math.max(0, Math.abs(p.y) + realH / 2 - palSize.y / 2);
            maxOv = Math.max(maxOv, Math.max(ovX, ovY));
        });

        let s;
        let padTop = 20, padBottom = 20, padLeft = 20, padRight = 20;

        if (isMiniature) {
            s = 0.12;
        } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;

            // Dynamic padding based on visible UI elements (Option 3)
            padTop = 50;   // Top pallet dimension line
            padRight = 90; // Right pallet dimension line + text

            if (this.state.showDimCenter) {
                padLeft = Math.max(padLeft, 60);
                padBottom = Math.max(padBottom, 50);
            }
            if (this.state.showDimEdges) {
                padTop = Math.max(padTop, 60);
                padBottom = Math.max(padBottom, 50);
            }
            if (maxOv > 0) {
                padLeft = Math.max(padLeft, 50);
                padRight = Math.max(padRight, 100);
                padTop = Math.max(padTop, 50);
                padBottom = Math.max(padBottom, 50);
            }

            const extraPxX = padLeft + padRight;
            const extraPxY = padTop + padBottom;

            const sX = Math.max(0.05, (areaW - extraPxX) / (maxExtentX * 2));
            const sY = Math.max(0.05, (areaH - extraPxY) / (maxExtentY * 2));
            s = Math.min(sX, sY);
        }
        this.state.scale = s;
        pal.className = is50 ? 'pallet-wood' : 'pallet';
        if(pal) pal.style.setProperty('--rad-scale', s);
        const palW = Math.round(palSize.x * s), palH = Math.round(palSize.y * s);
        const totalW = (this.state.isDualPallet && !is50) ? Math.round(2400 * s) : palW;

        let palLeft = 0, palTop = 0;
        if (isMiniature) {
            palLeft = Math.round((area.clientWidth - totalW) / 2);
            palTop = Math.round((area.clientHeight - palH) / 2);
        } else {
            const areaW = area.clientWidth, areaH = area.clientHeight;
            const extraPxX = padLeft + padRight;
            const extraPxY = padTop + padBottom;

            // Calculate remaining space after applying required padding
            const leftoverX = areaW - (maxExtentX * 2 * s);
            const leftoverY = areaH - (maxExtentY * 2 * s);

            // Distribute leftover space evenly
            const leftEdge = padLeft + (leftoverX - extraPxX) / 2;
            const topEdge = padTop + (leftoverY - extraPxY) / 2;

            const palCenterX = leftEdge + (maxExtentX * s);
            const palCenterY = topEdge + (maxExtentY * s);

            // Position relative to pallet center
            palLeft = Math.round(palCenterX - (totalW / 2));
            palTop = Math.round(palCenterY - (palH / 2));
        }
        if(pal) pal.style.width = palW + 'px'; if(pal) pal.style.height = palH + 'px'; if(pal) pal.style.left = palLeft + 'px'; if(pal) pal.style.top = palTop + 'px';
        if (!is50 && this.state.isDualPallet) {
            if(pal2) pal2.style.display = 'block'; if(pal2) pal2.style.setProperty('--rad-scale', s);
            if(pal2) pal2.style.width = Math.round(1200 * s) + 'px'; if(pal2) pal2.style.height = palH + 'px';
            if(pal2) pal2.style.left = (palLeft + Math.round(1200 * s)) + 'px'; if(pal2) pal2.style.top = palTop + 'px';
        } else { if(pal2) pal2.style.display = 'none'; }
        if (!isMiniature && this.dom.centerMark) {
            if(this.dom.centerMark) this.dom.centerMark.style.left = (palLeft + (palSize.x * s / 2) - 5) + 'px';
            if(this.dom.centerMark) this.dom.centerMark.style.top = (palTop + (palSize.y * s / 2) - 5) + 'px';
            if (this.dom.axisX) this.dom.axisX.textContent = palSize.x + ' mm';
            if (this.dom.axisY) this.dom.axisY.textContent = palSize.y + ' mm';
        }
        let radiatorsHTML = '';
        positions.forEach((p, i) => {
            const thisAngle = isPerPieceAngle ? p.angle : angle;
            const isFlipped = is50 && thisAngle === 180;
            const isRotated = thisAngle % 180 !== 0;
            const dualClass = (!is50 && this.state.isDualPallet) ? ' rad-dual' : '';
            const className = is50 ? 'rad-24050' : (isRotated ? 'rad rad-rotated' + dualClass : 'rad' + dualClass);
            let currentW = p.w !== undefined ? p.w : this.state.width;
            let currentL = p.l !== undefined ? p.l : this.state.length;
            const rw = is50 ? (thisAngle % 180 === 0 ? currentL * s : currentW * s) : (thisAngle % 180 === 0 ? currentW * s : currentL * s);
            const rh = is50 ? (thisAngle % 180 === 0 ? currentW * s : currentL * s) : (thisAngle % 180 === 0 ? currentL * s : currentW * s);
            const wPx = Math.round(rw), hPx = Math.round(rh);
            const radLeft = Math.round(palLeft + (palSize.x * s / 2) + (p.x * s) - (rw / 2));
            const radTop = Math.round(palTop + (palSize.y * s / 2) - (p.y * s) - (rh / 2));
            const numLabel = `${p.n}${isFlipped ? '↻' : ''}`;
            const innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped, thisAngle, s, currentW, currentL);
            let realW = is50 ? (thisAngle % 180 === 0 ? currentL : currentW) : (thisAngle % 180 === 0 ? currentW : currentL);
            let realH = is50 ? (thisAngle % 180 === 0 ? currentW : currentL) : (thisAngle % 180 === 0 ? currentL : currentW);
            const ovX = Math.max(0, Math.abs(p.x) + realW / 2 - palSize.x / 2), ovY = Math.max(0, Math.abs(p.y) + realH / 2 - palSize.y / 2);
            const ov = Math.max(ovX, ovY); let extraClass = '';
            if (ov > 1) {
                extraClass = ' rad-overflow'; maxOv = Math.max(maxOv, ov);
                if (!isMiniature && this.state.showDimEdges) {
                    if (ovX > 0) radiatorsHTML += this.getDimLineHTML(radLeft + (p.x > 0 ? rw : -20), radTop + rh / 2, 20, 0, Math.round(ovX), 'overhang');
                    if (ovY > 0) radiatorsHTML += this.getDimLineHTML(radLeft + rw / 2, radTop + (p.y > 0 ? -20 : rh), 0, 20, Math.round(ovY), 'overhang');
                }
            }
            if (!isMiniature && this.state.showDimCenter) {
                radiatorsHTML += this.getDimLineHTML(radLeft + rw / 2, radTop + rh + 10, -p.x * s, 0, Math.round(p.x), 'manual-dim-x');
                radiatorsHTML += this.getDimLineHTML(radLeft - 10, radTop + rh / 2, 0, p.y * s, Math.round(p.y), 'manual-dim-y');
            }
            radiatorsHTML += `<div class="${className}${extraClass}" style="--rad-scale:${s}; width:${wPx}px; height:${hPx}px; left:${radLeft}px; top:${radTop}px; pointer-events:${this.state.isManualMode ? 'auto' : 'none'};" onmousedown="HmiApp.startDrag(event, ${i})" oncontextmenu="HmiApp.showContextMenu(event, ${i})">${innerHTML}</div>`;
        });
        if (!isMiniature && this.state.showDimGap) {
            let boxes = positions.map(p => {
                let pAngle = isPerPieceAngle ? p.angle : angle;
                let currentW = p.w !== undefined ? p.w : this.state.width, currentL = p.l !== undefined ? p.l : this.state.length;
                let realW = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);
                let realH = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);
                return { left: p.x - realW / 2, right: p.x + realW / 2, top: p.y + realH / 2, bottom: p.y - realH / 2, x: p.x, y: p.y, rw: realW, rh: realH };
            });
            for(let i=0; i<boxes.length; i++) {
                let b1 = boxes[i]; let rightNeighbor = null, minGapX = Infinity;
                for(let j=0; j<boxes.length; j++) {
                    if (i===j) continue;
                    let b2 = boxes[j];
                    if (b2.left >= b1.right - 2 && Math.min(b1.top, b2.top) > Math.max(b1.bottom, b2.bottom)) {
                        let gap = b2.left - b1.right; if (gap < minGapX) { minGapX = gap; rightNeighbor = b2; }
                    }
                }
                if (rightNeighbor && minGapX >= 0 && minGapX < 2000) {
                    let midY = (Math.max(b1.bottom, rightNeighbor.bottom) + Math.min(b1.top, rightNeighbor.top)) / 2;
                    let scrX = Math.round(palLeft + (palSize.x * s / 2) + b1.right * s), scrY = Math.round(palTop + (palSize.y * s / 2) - midY * s);
                    radiatorsHTML += this.getDimLineHTML(scrX, scrY, minGapX * s, 0, Math.round(minGapX), 'gap-dim');
                }
                let bottomNeighbor = null, minGapY = Infinity;
                for(let j=0; j<boxes.length; j++) {
                    if (i===j) continue;
                    let b2 = boxes[j];
                    if (b2.top <= b1.bottom + 2 && Math.min(b1.right, b2.right) > Math.max(b1.left, b2.left)) {
                        let gap = b1.bottom - b2.top; if (gap < minGapY) { minGapY = gap; bottomNeighbor = b2; }
                    }
                }
                if (bottomNeighbor && minGapY >= 0 && minGapY < 2000) {
                    let midX = (Math.max(b1.left, bottomNeighbor.left) + Math.min(b1.right, bottomNeighbor.right)) / 2;
                    let scrX = Math.round(palLeft + (palSize.x * s / 2) + midX * s), scrY = Math.round(palTop + (palSize.y * s / 2) - b1.bottom * s);
                    radiatorsHTML += this.getDimLineHTML(scrX, scrY, 0, minGapY * s, Math.round(minGapY), 'gap-dim');
                }
            }
        }
        if (!isMiniature) {
            let blueprintHTML = `<div class="${this.state.showDimEdges ? '' : 'blueprint-only'}" style="position: absolute; inset: 0; pointer-events: none;">`;
            blueprintHTML += this.getDimLineHTML(palLeft, palTop - 30, palW, 0, `${palSize.x} mm`, 'gap-dim');
            blueprintHTML += this.getDimLineHTML(palLeft + palW + 30, palTop, 0, palH, `${palSize.y} mm`, 'gap-dim');
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            if (positions.length > 0) {
                positions.forEach(p => {
                    let pAngle = isPerPieceAngle ? p.angle : angle;
                    let currentW = p.w !== undefined ? p.w : this.state.width, currentL = p.l !== undefined ? p.l : this.state.length;
                    let realW = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);
                    let realH = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);
                    minX = Math.min(minX, p.x - realW / 2); maxX = Math.max(maxX, p.x + realW / 2); minY = Math.min(minY, p.y - realH / 2); maxY = Math.max(maxY, p.y + realH / 2);
                });
                let spaceRight = (palSize.x / 2) - maxX, spaceLeft = minX - (-palSize.x / 2), spaceTop = (palSize.y / 2) - maxY, spaceBottom = minY - (-palSize.y / 2);
                // We shift X-axis dimensions (left/right) to display above/below the pallet so they don't clip on narrow mobile screens
                if (Math.round(spaceLeft) > 0) blueprintHTML += this.getDimLineHTML(palLeft, palTop - 15, spaceLeft * s, 0, `${Math.round(spaceLeft)} mm`, 'edge-dim-x');
                if (Math.round(spaceRight) > 0) blueprintHTML += this.getDimLineHTML(Math.round(palLeft + (palSize.x * s / 2) + maxX * s), palTop + palH + 15, spaceRight * s, 0, `${Math.round(spaceRight)} mm`, 'edge-dim-x');
                // Y-axis dimensions remain vertical
                if (Math.round(spaceTop) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, Math.round(palTop + (palSize.y * s / 2) - maxY * s) - spaceTop * s, 0, spaceTop * s, `${Math.round(spaceTop)} mm`, 'edge-dim-y');
                if (Math.round(spaceBottom) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, palTop + palH - spaceBottom * s, 0, spaceBottom * s, `${Math.round(spaceBottom)} mm`, 'edge-dim-y');
            }
            const dStr = new Date().toLocaleString(this.state.lang);
            const prjStr = `Proj ${this.state.currentProject}`, schStr = `Scheme D${this.state.dizilimId}`, radStr = `${this.state.width}x${this.state.length}mm`, cntStr = `${positions.length} pcs`, palStr = `${palSize.x}x${palSize.y}mm`;

            // Wait, we need to correctly compute titleBlockY taking into account the pallet boundaries and radiator offsets
            let bottomBound = Math.max(palH + palTop, palTop + (palSize.y * s / 2) + maxY * s);
            let titleBlockY = Math.round(bottomBound) + 60;

            // To make it centered: it's a fixed width element (e.g. 400px wide) relative to the palletArea
            let blockWidth = 500;
            // palLeft is the X start of pallet, palW is width. The visual center of pallet is palLeft + palW/2
            let blockLeft = palLeft + (palW / 2) - (blockWidth / 2);

            blueprintHTML += `<div class="blueprint-only print-data-block" style="position: absolute; top: ${titleBlockY}px; left: ${blockLeft}px; background: #fff; color: #000; border: 2px solid #000; padding: 10px; font-family: monospace; font-size: 14px; width: ${blockWidth}px; text-align: left; z-index: 1000; box-sizing: border-box;">
                <div style="border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold; font-size: 18px; text-align: center; text-transform: uppercase;">KUKA CELL VISUALIZER - TECH DATA</div>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <tr><td style="width: 35%; font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Project:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${prjStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Scheme / Layout:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${schStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Radiator Size:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${radStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Quantity / Layer:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${cntStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Pallet Size:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${palStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px;">Date Generated:</td><td style="padding: 4px;">${dStr}</td></tr>
                </table>
            </div>`;
            blueprintHTML += '</div>'; radiatorsHTML += blueprintHTML;
        }
        radLayer.innerHTML = radiatorsHTML;
        if (!isMiniature && this.dom.iW) {
            this.dom.iW.textContent = this.state.width + ' mm'; this.dom.iL.textContent = this.state.length + ' mm';
            this.dom.iA.textContent = is50 ? '0°/180°' : angle + '°'; this.dom.iC.textContent = positions.length + ' ' + (this.config.translations[this.state.lang].pcs);
            this.dom.iP.textContent = `${palSize.x} × ${palSize.y} (Taшma: ${Math.round(maxOv)}mm)`;
            if (is50 || this.state.isManualMode) this.renderRadTable(positions);
            this.updateVizHeader(positions.length, angle, is50);
            if (this.dom.mTopRadSize) this.dom.mTopRadSize.textContent = `${this.state.width}x${this.state.length} mm (${positions.length} pcs)`;
            if (this.dom.mTopPalSize) this.dom.mTopPalSize.textContent = `${palSize.x}x${palSize.y} mm`;
            document.querySelectorAll('.ext-info-row').forEach(el => el.style.display = is50 ? 'none' : 'flex');
            if (!is50) { if (this.dom.iLyr) this.dom.iLyr.textContent = '10'; if (this.dom.iTot) this.dom.iTot.textContent = (positions.length * 10).toString(); }
        }
    },

    getRadiatorHTML(is50, isMiniature, numLabel, isFlipped, angle, s, currentW, currentL) {
        if (is50) {
            const isRotated90 = angle === 90 || angle === 270;
            // The unrotated base dimensions (where length is horizontal)
            const baseW = Math.round(currentL * s);
            const baseH = Math.round(currentW * s);
            const transform = isRotated90 ? `transform: rotate(${angle}deg); transform-origin: center center;` : `transform: rotate(${angle === 180 ? 180 : 0}deg);`;

            // To keep the number upright, we counter-rotate it
            const numStyle = isRotated90 ? `style="transform: rotate(-${angle}deg);"` : (angle === 180 ? `style="transform: rotate(-180deg);"` : '');

            if (isMiniature) {
                return `<div style="position:absolute; width:${baseW}px; height:${baseH}px; left:50%; top:50%; margin-left:-${baseW/2}px; margin-top:-${baseH/2}px; ${transform}">
                            <div class="pkg-body"></div><div class="pkg-card left"></div><div class="pkg-card right"></div><div class="pkg-num" ${numStyle}>${numLabel}</div>
                        </div>`;
            }
            return `<div style="position:absolute; width:${baseW}px; height:${baseH}px; left:50%; top:50%; margin-left:-${baseW/2}px; margin-top:-${baseH/2}px; ${transform}">
                        <div class="pkg-body"></div><div class="pkg-card left"></div><div class="pkg-card right"></div><div class="pkg-corner tl"></div><div class="pkg-corner bl"></div><div class="pkg-corner tr"></div><div class="pkg-corner br"></div><div class="pkg-label"><div class="pkg-label-red">LIDER</div><div class="pkg-label-white"><span>СТАЛЬНОЙ<br>РАДИАТОР</span></div></div><div class="pkg-num" ${numStyle}>${numLabel}</div>
                    </div>`;
        }
        if (isMiniature) return `<div class="heat-plate" style="width:100%;height:100%;"><div class="pattern-area"><div class="rad-num" style="font-size:9px;padding:1px 3px;">${numLabel}</div></div><div class="long-pipe top"></div><div class="long-pipe bottom"></div></div>`;
        return `<div class="heat-plate"><div class="pattern-area"><div class="rad-num">${numLabel}</div></div><div class="clip tl"></div><div class="clip tr"></div><div class="clip bl"></div><div class="clip br"></div><div class="long-pipe top"></div><div class="long-pipe bottom"></div><div class="port top-left"></div><div class="port top-right"></div><div class="port bottom-left"></div><div class="port bottom-right"></div></div>`;
    },

    updateVizHeader(count, angle, is50) {
        if (this.dom.vizTitle) this.dom.vizTitle.textContent = `D${this.state.dizilimId}: ${this.state.width}x${this.state.length}mm ${is50 ? (this.state.exportMode ? '[Export]' : '[Domestic]') : ''}`;
        if (this.dom.statCount) this.dom.statCount.textContent = count + ' ' + (this.config.translations[this.state.lang].pcs);
        if (this.dom.statAngle) this.dom.statAngle.textContent = is50 ? '0°/180°' : angle + '°';
    },

    handleZoom(e) {
        if (!this.state.showAll) return; e.preventDefault();
        const zoomStep = 0.15;
        let newZoom = (e.deltaY < 0) ? Math.min(this.state.zoom + zoomStep, 4) : Math.max(this.state.zoom - zoomStep, 0.15);
        
        if (newZoom !== this.state.zoom) {
            const rect = this.dom.singleViewArea.getBoundingClientRect();
            
            // Get mouse position relative to container
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // For a flex container with center/center alignment, the natural unscaled
            // origin of the element is at the center of the container.
            // The current center of the element is the container center offset by panX/panY.
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Distance from the element's current center to the mouse pointer
            const deltaX = mouseX - (centerX + this.state.panX);
            const deltaY = mouseY - (centerY + this.state.panY);

            // Adjust pan so the point under the mouse remains stationary
            this.state.panX = this.state.panX - deltaX * (newZoom / this.state.zoom - 1);
            this.state.panY = this.state.panY - deltaY * (newZoom / this.state.zoom - 1);

            this.state.zoom = newZoom;
            this.applyTransform();
        }
    },

    handleZoomTouch(e) {
        if (!this.state.showAll || e.touches.length !== 2) return;
        e.preventDefault();
        
        const t1 = e.touches[0], t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        
        if (this.state.lastZoomDist) {
            const ratio = dist / this.state.lastZoomDist;
            let newZoom = Math.max(0.15, Math.min(this.state.zoom * ratio, 4));
            
            if (newZoom !== this.state.zoom) {
                const rect = this.dom.singleViewArea.getBoundingClientRect();
                
                // Calculate the center point between the two fingers
                const touchCenterX = (t1.clientX + t2.clientX) / 2;
                const touchCenterY = (t1.clientY + t2.clientY) / 2;

                // Calculate touch position relative to the top-left of the singleViewArea container
                const mouseX = touchCenterX - rect.left;
                const mouseY = touchCenterY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Distance from the element's current center to the pinch center
                const deltaX = mouseX - (centerX + this.state.panX);
                const deltaY = mouseY - (centerY + this.state.panY);

                // Adjust pan so the point under the pinch remains stationary
                this.state.panX = this.state.panX - deltaX * (newZoom / this.state.zoom - 1);
                this.state.panY = this.state.panY - deltaY * (newZoom / this.state.zoom - 1);

                this.state.zoom = newZoom;
                this.applyTransform();
            }
        }
        this.state.lastZoomDist = dist;
    },

    resetView() { this.state.zoom = 1; this.state.panX = 0; this.state.panY = 0; this.applyTransform(); },

    startPan(e) {
        if (!this.state.showAll) return;
        const isTouch = e.type === 'touchstart';
        if (isTouch && e.touches.length > 1) return; // Ignore if more than 1 touch (pinch-zoom handles that)
        if (!isTouch && e.button !== 1 && e.button !== 0) return;
        if (e.target.closest('.rad') || e.target.closest('.rad-24050')) return;
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON') e.preventDefault();
        
        let startX = isTouch ? e.touches[0].clientX : e.clientX;
        let startY = isTouch ? e.touches[0].clientY : e.clientY;
        let startPanX = this.state.panX, startPanY = this.state.panY;

        const onMove = (ev) => {
            let cx = isTouch ? ev.touches[0].clientX : ev.clientX;
            let cy = isTouch ? ev.touches[0].clientY : ev.clientY;
            this.state.panX = startPanX + (cx - startX);
            this.state.panY = startPanY + (cy - startY);
            this.applyTransform();
        };

        const onUp = () => {
            if (isTouch) {
                this.state.lastZoomDist = null;
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onUp);
            } else {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
        };

        if (isTouch) {
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onUp);
        } else {
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        }
    },

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

    renderRadTable(positions) {
        if (!this.dom.radPositionsPanel) return;
        let isManual = this.state.isManualMode;
        let html = '<table class="rad-pos-table"><tr><th>#</th><th>X</th><th>Y</th><th>A°</th>' + (isManual ? '<th>Act</th>' : '') + '</tr>';
        positions.forEach((p, i) => {
            html += `<tr><td class="rad-pos-num">${p.n}</td><td><input type="number" class="rad-pos-input" value="${p.x}" onchange="HmiApp.updateRadPosition(${i}, 'x', this.value)"></td><td><input type="number" class="rad-pos-input" value="${p.y}" onchange="HmiApp.updateRadPosition(${i}, 'y', this.value)"></td><td class="rad-pos-angle">${isManual ? `<span style="cursor:pointer;" onclick="HmiApp.rotateManualRad(${i})">${p.angle}° <i class="fas fa-sync-alt" style="font-size:10px;margin-left:2px;"></i></span>` : `${p.angle}°`}</td>${isManual ? `<td><button onclick="HmiApp.removeManualRad(${i})" style="color:#FF3D00; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td>` : ''}</tr>`;
        });
        this.dom.radPositionsPanel.innerHTML = html + '</table>';
    },

    getDimLineHTML(x, y, dx, dy, text, type) {
        let styleLine, finalX = x, finalY = y, absDx = Math.abs(dx), absDy = Math.abs(dy);

        // Define varied colors based on the dimension type
        let color = '#FF3D00'; // Default orange-red
        if (type.startsWith('gap-dim')) color = '#4CAF50'; // Green
        else if (type === 'manual-dim-x') color = '#03A9F4'; // Light Blue
        else if (type === 'manual-dim-y') color = '#9C27B0'; // Purple
        else if (type === 'edge-dim-x') color = '#FFC107'; // Amber
        else if (type === 'edge-dim-y') color = '#E91E63'; // Pink
        else if (type === 'overhang') color = '#FF3D00'; // Red

        let extraTransform = '';
        if (dx !== 0) {
            if (dx < 0) finalX = x + dx;
            styleLine = `width:${absDx}px; height:1px; border-top:1px dashed ${color};`;
            if (type.startsWith('gap-dim')) extraTransform = 'translateY(15px)'; // Shift gap label down
            if (type.startsWith('manual-dim') || type.startsWith('edge-dim')) extraTransform = 'translateY(-15px)'; // Shift manual/edge label up
        }
        else {
            if (dy < 0) finalY = y + dy;
            styleLine = `width:1px; height:${absDy}px; border-left:1px dashed ${color};`;
            if (type.startsWith('gap-dim')) extraTransform = 'translateX(15px)'; // Shift gap label right
            if (type.startsWith('manual-dim') || type.startsWith('edge-dim')) extraTransform = 'translateX(-15px)'; // Shift manual/edge label left
        }
        return `<div class="dim-line ${type}" style="left:${finalX}px; top:${finalY}px; ${styleLine}"></div><div class="dim-label" style="left:${finalX + absDx / 2}px; top:${finalY + absDy / 2}px; transform: translate(-50%, -50%) ${extraTransform}; background:#111; color:${color}; border:1px solid ${color}; border-radius:2px; z-index: 50; padding: 2px 4px; font-size: 10px;">${text}</div>`;
    },

    updateRadPosition(idx, field, val) {
        if (this.state.isManualMode) { this.state.manualPositions[idx][field] = parseInt(val) || 0; }
        else { this.state.rad50Positions[idx][field] = parseInt(val) || 0; this.state.rad50UserEdited = true; }
        this.render();
    },

    rotateManualRad(idx) { if (!this.state.isManualMode) return; this.state.manualPositions[idx].angle = ((this.state.manualPositions[idx].angle || 0) + 90) % 360; this.render(); },

    removeManualRad(idx) { if (!this.state.isManualMode) return; this.state.manualPositions.splice(idx, 1); this.state.manualPositions.forEach((p, i) => p.n = i + 1); this.render(); },

    showContextMenu(e, idx) {
        if (!this.state.isManualMode) return; e.preventDefault(); this.state.contextRadIdx = idx;
        if (this.dom.contextMenu) { this.dom.contextMenu.style.left = `${e.clientX}px`; this.dom.contextMenu.style.top = `${e.clientY}px`; this.dom.contextMenu.classList.remove('hidden'); }
    },

    hideContextMenu() { if (this.dom.contextMenu) this.dom.contextMenu.classList.add('hidden'); this.state.contextRadIdx = null; },

    contextRotate() { if (this.state.contextRadIdx !== null) this.rotateManualRad(this.state.contextRadIdx); },
    contextDelete() { if (this.state.contextRadIdx !== null) this.removeManualRad(this.state.contextRadIdx); },

    startDrag(e, idx) {
        if (!this.state.isManualMode) return; e.preventDefault();
        let arr = this.state.isManualMode ? this.state.manualPositions : this.state.rad50Positions;
        let startX = e.clientX, startY = e.clientY, initialPx = arr[idx].x, initialPy = arr[idx].y;
        const s = this.state.scale;
        const onMouseMove = (ev) => {
            arr[idx].x = Math.round(initialPx + (ev.clientX - startX) / s);
            arr[idx].y = Math.round(initialPy - (ev.clientY - startY) / s);
            if (this.state.currentProject === '24050') this.state.rad50UserEdited = true; this.render();
        };
        const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
        document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
    },

    resetRadPositions() { if (this.state.isManualMode) { this.state.manualPositions = []; } else { this.state.rad50UserEdited = false; } this.render(); },

    updatePalletSize() { this.state.palOverrideX = parseInt(this.dom.palW50?.value) || 0; this.state.palOverrideY = parseInt(this.dom.palH50?.value) || 0; this.render(); },

    resetPalletSize() { this.state.palOverrideX = 0; this.state.palOverrideY = 0; if (this.dom.palW50) this.dom.palW50.value = 0; if (this.dom.palH50) this.dom.palH50.value = 0; this.render(); },

    openMatrixModal() { let modal = document.getElementById('matrixModal'); if (!modal) { modal = this.buildMatrixModal(); } modal.style.display = 'flex'; },
    closeMatrixModal() { const modal = document.getElementById('matrixModal'); if (modal) modal.style.display = 'none'; },

    buildMatrixModal() {
        const overlay = document.createElement('div'); overlay.id = 'matrixModal'; overlay.className = 'modal-overlay'; overlay.onclick = (e) => { if (e.target === overlay) this.closeMatrixModal(); };
        const content = document.createElement('div'); content.className = 'modal-content'; content.style.width = '90vw'; content.style.maxWidth = '1200px';
        let header = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 2px solid var(--kuka-orange); padding-bottom: 10px;"><h3 style="margin:0; color:var(--kuka-orange);"><i class="fas fa-table"></i> ${this.config.translations[this.state.lang].matrix} (24048/49/50)</h3><button onclick="HmiApp.closeMatrixModal()" style="background:none;border:none;color:white;font-size:30px;cursor:pointer;">&times;</button></div>`;
        const widths = [200, 300, 400, 500, 600, 900];
        let containerHtml = `<div style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">`;
        widths.forEach(w => {
            containerHtml += `<h4 style="color:#FFF; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px; margin-top:20px; font-size:18px;">Genişlik: ${w} mm</h4><div style="display:flex; flex-wrap:wrap; gap:8px;">`;
            for (let l = 400; l <= 3000; l += 100) {
                let d = this.getDiz(w, l), isPal2 = l > 1500, bgClass = isPal2 ? 'pal-2' : 'pal-1', palText = isPal2 ? '2 Palet' : '1 Palet';
                containerHtml += `<div class="matrix-cell ${bgClass}" style="padding:10px; border:1px solid rgba(255,255,255,0.1); border-radius:4px; text-align:center; min-width:80px;" onclick="HmiApp.selectFromMatrix(${w}, ${l})"><div style="font-size:16px; color:#fff; margin-bottom: 4px;">L: ${l}</div><div style="font-size:15px; color:var(--kuka-orange); font-weight:bold; margin-bottom: 2px;">D${d}</div><div style="font-size:11px; opacity:0.8;">${palText}</div></div>`;
            }
            containerHtml += `</div>`;
        });
        containerHtml += `</div><div style="margin-top:15px; font-size:13px; display:flex; gap:15px; justify-content: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);"><div style="display:flex; align-items:center; gap:5px;"><div style="width:15px;height:15px; border-radius:3px;" class="pal-1"></div> <= 1500mm (1 Palet)</div><div style="display:flex; align-items:center; gap:5px;"><div style="width:15px;height:15px; border-radius:3px;" class="pal-2"></div> >= 1600mm (2 Palet)</div></div>`;
        content.innerHTML = header + containerHtml; overlay.appendChild(content); document.body.appendChild(overlay); return overlay;
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

window.onload = () => HmiApp.init();
