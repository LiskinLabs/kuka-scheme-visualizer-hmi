import re

filepath = 'production_metrics.js'
with open(filepath, 'r') as f:
    content = f.read()

# Fix beforeprint to handle showAll mode properly
new_beforeprint = """
        window.addEventListener('beforeprint', () => {
            if (this.state.showAll && this.dom.allLayoutsGrid) {
                // When in show-all mode, scale the entire grid
                let maxBoundsX = 1400; // Estimated A4 landscape width for the grid
                let maxBoundsY = 1000;
                let scale = Math.min(1000 / maxBoundsX, 700 / maxBoundsY);
                if (scale > 0.6) scale = 0.6;
                this.dom.allLayoutsGrid.style.setProperty('transform', `scale(${scale})`, 'important');
                this.dom.allLayoutsGrid.style.setProperty('transform-origin', 'top left', 'important');
                this.dom.allLayoutsGrid.style.setProperty('position', 'absolute', 'important');
                this.dom.allLayoutsGrid.style.setProperty('top', '0', 'important');
                this.dom.allLayoutsGrid.style.setProperty('left', '0', 'important');
            } else if (this.dom.palletArea) {
                let s = this.state.scale || 1;
                const palSize = this.getPalletSize();
                const palW = palSize.x * s;
                const palH = palSize.y * s;
                let maxBoundsX = palW + 300;
                let maxBoundsY = palH + 300;
                let scaleX = 1000 / maxBoundsX;
                let scaleY = 700 / maxBoundsY;
                let scale = Math.min(scaleX, scaleY);
                if (scale > 0.6) scale = 0.6;
                this.dom.palletArea.style.setProperty('transform', `scale(${scale})`, 'important');
                this.dom.palletArea.style.setProperty('transform-origin', 'top center', 'important');
                this.dom.palletArea.style.setProperty('position', 'absolute', 'important');
                this.dom.palletArea.style.setProperty('top', '0', 'important');
                this.dom.palletArea.style.setProperty('left', '0', 'important');
            }
        });
"""

content = re.sub(r"window\.addEventListener\('beforeprint', \(\) => \{.*?\}\);", new_beforeprint.strip(), content, flags=re.DOTALL)

new_afterprint = """
        window.addEventListener('afterprint', () => {
            if (this.state.showAll && this.dom.allLayoutsGrid) {
                this.dom.allLayoutsGrid.style.removeProperty('transform');
                this.dom.allLayoutsGrid.style.removeProperty('transform-origin');
                this.dom.allLayoutsGrid.style.removeProperty('position');
                this.dom.allLayoutsGrid.style.removeProperty('top');
                this.dom.allLayoutsGrid.style.removeProperty('left');
            } else if (this.dom.palletArea) {
                this.dom.palletArea.style.removeProperty('transform');
                this.dom.palletArea.style.removeProperty('transform-origin');
                this.dom.palletArea.style.removeProperty('position');
                this.dom.palletArea.style.removeProperty('top');
                this.dom.palletArea.style.removeProperty('left');
            }
            this.applyTransform();
        });
"""
content = re.sub(r"window\.addEventListener\('afterprint', \(\) => \{.*?\}\);", new_afterprint.strip(), content, flags=re.DOTALL)


# Fix exportToImage to handle showAll mode
new_export = """
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
        }, 1500);
    },
"""

content = re.sub(r"exportToImage\(\) \{.*?\},[\s]*renderRadTable\(positions\)", new_export.strip() + ",\n\n    renderRadTable(positions)", content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

print("Applied print and export fix")
