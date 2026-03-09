import re

html_file = '/app/scheme_hmi_v3_industrial.html'

with open(html_file, 'r') as f:
    content = f.read()

# Refine applyTransform override for infinite pan with some boundaries or better clamping
new_apply_transform = """
                    const originalApplyTransform = HmiApp.applyTransform;
                    HmiApp.applyTransform = function() {
                        if (this.state.showAll && this.dom.allLayoutsGrid) {

                            // Get the actual rendered size of the grid container
                            // Give generous scrollWidth to account for hidden elements or margins
                            const gridW = this.dom.allLayoutsGrid.scrollWidth || 5000;
                            const gridH = this.dom.allLayoutsGrid.scrollHeight || 5000;

                            const viewW = this.dom.singleViewArea.clientWidth;
                            const viewH = this.dom.singleViewArea.clientHeight;

                            const scaledW = gridW * this.state.zoom;
                            const scaledH = gridH * this.state.zoom;

                            // Increase padding to act as a buffer rather than a strict clamp
                            const paddingX = viewW * 0.8;
                            const paddingY = viewH * 0.8;

                            // Allow panning off screen up to 80% of the view width/height
                            const minX = -scaledW + (viewW - paddingX);
                            const maxX = paddingX;

                            if (this.state.panX < minX) this.state.panX = minX;
                            if (this.state.panX > maxX) this.state.panX = maxX;

                            const minY = -scaledH + (viewH - paddingY);
                            const maxY = paddingY;

                            if (this.state.panY < minY) this.state.panY = minY;
                            if (this.state.panY > maxY) this.state.panY = maxY;

                            this.dom.allLayoutsGrid.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.zoom})`;
                        } else {
                            originalApplyTransform.call(this);
                        }
                    };
"""

content = re.sub(
    r'const originalApplyTransform = HmiApp\.applyTransform;.*?originalApplyTransform\.call\(this\);\n\s*\}\n\s*\};',
    new_apply_transform.strip(),
    content,
    flags=re.DOTALL
)

with open(html_file, 'w') as f:
    f.write(content)
print("Pan clamping patched successfully")
