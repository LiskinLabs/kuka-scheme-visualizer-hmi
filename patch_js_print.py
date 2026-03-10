import re

filepath = 'production_metrics.js'
with open(filepath, 'r') as f:
    content = f.read()

new_beforeprint = """
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
"""

content = re.sub(r"window\.addEventListener\('beforeprint', \(\) => \{.*?\}\);", new_beforeprint.strip(), content, flags=re.DOTALL)

new_afterprint = """
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
"""

content = re.sub(r"window\.addEventListener\('afterprint', \(\) => \{.*?\}\);", new_afterprint.strip(), content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

print("Applied strict JS print transform.")
