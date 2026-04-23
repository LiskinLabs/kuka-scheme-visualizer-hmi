export const layout = {
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
        const rowData = rows.map(row => {
            row.sort((a, b) => a.x - b.x);
            const items = row.map(p => {
                const is90or270 = p.angle % 180 !== 0;
                const realW = is90or270 ? (p.l || this.state.length) : (p.w || this.state.width);
                const realH = is90or270 ? (p.w || this.state.width) : (p.l || this.state.length);
                return { p, realW, realH };
            });
            const totalW = items.reduce((sum, item, i) => sum + item.realW + (i > 0 ? this.state.gapW : 0), 0);
            const maxH = items.reduce((max, item) => Math.max(max, item.realH), 0);
            return { row, items, totalW, maxH };
        });

        rowData.forEach(({ items, totalW }) => {
            let curX = -totalW / 2;
            items.forEach(({ p, realW }) => {
                p.x = Math.round(curX + realW / 2);
                curX += realW + this.state.gapW;
            });
        });

        const totalH = rowData.reduce((sum, { maxH }, i) => sum + maxH + (i > 0 ? this.state.gapH : 0), 0);
        let curY = totalH / 2;

        rowData.forEach(({ items, maxH }) => {
            items.forEach(({ p }) => {
                p.y = Math.round(curY - maxH / 2);
            });
            curY -= (maxH + this.state.gapH);
        });
        let n = 1;
        rows.forEach(row => { row.forEach(p => p.n = n++); });
        this.render();
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
    }
};
