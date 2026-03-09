import re

html_file = '/app/scheme_hmi_v3_industrial.html'

with open(html_file, 'r') as f:
    content = f.read()

# Replace exactly
old_code = """                    const originalApplyTransform = HmiApp.applyTransform;
                    HmiApp.applyTransform = function() {
                        if (this.state.showAll && this.dom.allLayoutsGrid) {

                            // Get the actual rendered size of the grid container (approximate based on contents)
                            const gridW = this.dom.allLayoutsGrid.scrollWidth || 3000;
                            const gridH = this.dom.allLayoutsGrid.scrollHeight || 3000;

                            const viewW = this.dom.singleViewArea.clientWidth;
                            const viewH = this.dom.singleViewArea.clientHeight;

                            const scaledW = gridW * this.state.zoom;
                            const scaledH = gridH * this.state.zoom;

                            // Calculate bounds. We allow panning so the grid edges reach the view edges,
                            // plus a padding margin.
                            const padding = 50;

                            // If scaled grid is smaller than view, center it.
                            if (scaledW < viewW) {
                                // this.state.panX = (viewW - scaledW) / 2;
                            } else {
                                const minX = viewW - scaledW - padding;
                                const maxX = padding;
                                if (this.state.panX < minX) this.state.panX = minX;
                                if (this.state.panX > maxX) this.state.panX = maxX;
                            }

                            if (scaledH < viewH) {
                                // this.state.panY = (viewH - scaledH) / 2;
                            } else {
                                const minY = viewH - scaledH - padding;
                                const maxY = padding;
                                if (this.state.panY < minY) this.state.panY = minY;
                                if (this.state.panY > maxY) this.state.panY = maxY;
                            }

                            this.dom.allLayoutsGrid.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.zoom})`;
                            this.dom.allLayoutsGrid.style.transformOrigin = '0 0';
                        } else {
                            originalApplyTransform.call(this);
                        }
                    };"""

new_code = """                    const originalApplyTransform = HmiApp.applyTransform;
                    HmiApp.applyTransform = function() {
                        if (this.state.showAll && this.dom.allLayoutsGrid) {
                            const gridW = this.dom.allLayoutsGrid.scrollWidth || 3000;
                            const gridH = this.dom.allLayoutsGrid.scrollHeight || 3000;

                            const viewW = this.dom.singleViewArea.clientWidth;
                            const viewH = this.dom.singleViewArea.clientHeight;

                            const scaledW = gridW * this.state.zoom;
                            const scaledH = gridH * this.state.zoom;

                            // Pad so we can see edges comfortably
                            const padX = viewW * 0.7;
                            const padY = viewH * 0.7;

                            const minX = -(scaledW) + (viewW - padX);
                            const maxX = padX;
                            if (this.state.panX < minX) this.state.panX = minX;
                            if (this.state.panX > maxX) this.state.panX = maxX;

                            const minY = -(scaledH) + (viewH - padY);
                            const maxY = padY;
                            if (this.state.panY < minY) this.state.panY = minY;
                            if (this.state.panY > maxY) this.state.panY = maxY;

                            this.dom.allLayoutsGrid.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.zoom})`;
                            this.dom.allLayoutsGrid.style.transformOrigin = '0 0';
                        } else {
                            originalApplyTransform.call(this);
                        }
                    };"""

content = content.replace(old_code, new_code)

with open(html_file, 'w') as f:
    f.write(content)

print("Pan replace successful")
