export const events = {
    initEventListeners() {
        window.addEventListener('beforeprint', () => this.handleBeforePrint());
        window.addEventListener('afterprint', () => this.handleAfterPrint());

        window.addEventListener('resize', () => {
            this.syncPanelsUI();
            this.render();
        });

        this.initInteractionListeners();
        this.initInputListeners();

        document.addEventListener('click', (e) => {
            if (this.dom.contextMenu && !this.dom.contextMenu.classList.contains('hidden')) {
                this.hideContextMenu();
            }
        });
    },

    handleBeforePrint() {
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
    },

    handleAfterPrint() {
        if (this.state.showAll && this.dom.allLayoutsGrid) {
            this.dom.allLayoutsGrid.style.removeProperty('transform');
            this.dom.allLayoutsGrid.style.removeProperty('transform-origin');
            this.dom.allLayoutsGrid.style.removeProperty('margin');
        } else if (this.dom.palletArea) {
            this.dom.palletArea.style.removeProperty('transform');
            this.dom.palletArea.style.removeProperty('transform-origin');
        }
        this.applyTransform();
    },

    initInteractionListeners() {
        if (this.dom.singleViewArea) {
            this.dom.singleViewArea.addEventListener('wheel', (e) => this.handleZoom(e), { passive: false });
            this.dom.singleViewArea.addEventListener('mousedown', (e) => this.startPan(e));
            this.dom.singleViewArea.addEventListener('touchstart', (e) => this.startPan(e), { passive: false });
            this.dom.singleViewArea.addEventListener('touchmove', (e) => this.handleZoomTouch(e), { passive: false });
            this.dom.singleViewArea.addEventListener('touchend', (e) => { this.state.lastZoomDist = null; });
            this.dom.singleViewArea.addEventListener('touchcancel', (e) => { this.state.lastZoomDist = null; });
        }
    },

    initInputListeners() {
        if (this.dom.inW) this.dom.inW.oninput = this.debounce(() => this.calc(), 200);
        if (this.dom.inL) this.dom.inL.oninput = this.debounce(() => this.calc(), 200);
        if (this.dom.gapW) this.dom.gapW.oninput = this.debounce(() => this.calc(), 200);
        if (this.dom.gapH) this.dom.gapH.oninput = this.debounce(() => this.calc(), 200);
        if (this.dom.palW50) this.dom.palW50.oninput = this.debounce(() => this.updatePalletSize(), 200);
        if (this.dom.palH50) this.dom.palH50.oninput = this.debounce(() => this.updatePalletSize(), 200);
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

    showContextMenu(e, idx) {
        if (!this.state.isManualMode) return; e.preventDefault(); this.state.contextRadIdx = idx;
        if (this.dom.contextMenu) { this.dom.contextMenu.style.left = `${e.clientX}px`; this.dom.contextMenu.style.top = `${e.clientY}px`; this.dom.contextMenu.classList.remove('hidden'); }
    },

    hideContextMenu() { if (this.dom.contextMenu) this.dom.contextMenu.classList.add('hidden'); this.state.contextRadIdx = null; },

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
    }
};
