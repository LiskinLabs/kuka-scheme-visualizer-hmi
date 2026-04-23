export const render = {
    render() {
        if (!this.dom.palletArea || !this.dom.pallet) return;
        this.saveState();
        if (this.state.showAll) { if(this.dom.btnManualMode) this.dom.btnManualMode.style.display = 'none';
            if(this.dom.btnAutoMode) this.dom.btnAutoMode.style.display = 'none';
            this.renderAllLayouts(); return; }
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
        let maxExtentX = palSize.x / 2, maxExtentY = palSize.y / 2, maxOv = 0;
        positions.forEach(p => {
            let currentW = p.w !== undefined ? p.w : this.state.width;
            let currentL = p.l !== undefined ? p.l : this.state.length;
            let pAngle = isPerPieceAngle ? p.angle : angle;
            const rw = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);
            const rh = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);
            maxExtentX = Math.max(maxExtentX, Math.abs(p.x) + rw / 2);
            maxExtentY = Math.max(maxExtentY, Math.abs(p.y) + rh / 2);
            const ovX = Math.max(0, Math.abs(p.x) + rw / 2 - palSize.x / 2);
            const ovY = Math.max(0, Math.abs(p.y) + rh / 2 - palSize.y / 2);
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
            const dStr = this.escapeHTML(new Date().toLocaleString(this.state.lang));
            const prjStr = this.escapeHTML(`Proj ${this.state.currentProject}`),
                  schStr = this.escapeHTML(`Scheme D${this.state.dizilimId}`),
                  radStr = this.escapeHTML(`${this.state.width}x${this.state.length}mm`),
                  cntStr = this.escapeHTML(`${positions.length} pcs`),
                  palStr = this.escapeHTML(`${palSize.x}x${palSize.y}mm`);

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

    renderRadTable(positions) {
        if (!this.dom.radPositionsPanel) return;
        let isManual = this.state.isManualMode;
        this.dom.radPositionsPanel.textContent = '';
        const table = document.createElement('table');
        table.className = 'rad-pos-table';
        const thead = document.createElement('tr');
        ['#', 'X', 'Y', 'A°'].forEach(txt => {
            const th = document.createElement('th'); th.textContent = txt; thead.appendChild(th);
        });
        if (isManual) {
            const th = document.createElement('th'); th.textContent = 'Act'; thead.appendChild(th);
        }
        table.appendChild(thead);

        positions.forEach((p, i) => {
            const tr = document.createElement('tr');

            const tdN = document.createElement('td');
            tdN.className = 'rad-pos-num';
            tdN.textContent = p.n;
            tr.appendChild(tdN);

            ['x', 'y'].forEach(field => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'rad-pos-input';
                input.value = p[field];
                input.onchange = (e) => this.updateRadPosition(i, field, e.target.value);
                td.appendChild(input);
                tr.appendChild(td);
            });

            const tdA = document.createElement('td');
            tdA.className = 'rad-pos-angle';
            if (isManual) {
                const span = document.createElement('span');
                span.style.cursor = 'pointer';
                span.onclick = () => this.rotateManualRad(i);
                span.textContent = `${p.angle}° `;
                const icon = document.createElement('i');
                icon.className = 'fas fa-sync-alt';
                icon.style.fontSize = '10px';
                icon.style.marginLeft = '2px';
                span.appendChild(icon);
                tdA.appendChild(span);
            } else {
                tdA.textContent = `${p.angle}°`;
            }
            tr.appendChild(tdA);

            if (isManual) {
                const tdAct = document.createElement('td');
                const btn = document.createElement('button');
                btn.onclick = () => this.removeManualRad(i);
                btn.style.color = '#FF3D00';
                btn.style.background = 'none';
                btn.style.border = 'none';
                btn.style.cursor = 'pointer';
                const icon = document.createElement('i');
                icon.className = 'fas fa-trash';
                btn.appendChild(icon);
                tdAct.appendChild(btn);
                tr.appendChild(tdAct);
            }
            table.appendChild(tr);
        });
        this.dom.radPositionsPanel.appendChild(table);
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
    }
};
