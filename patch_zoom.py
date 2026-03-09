import re

html_file = '/app/scheme_hmi_v3_industrial.html'

with open(html_file, 'r') as f:
    content = f.read()

new_handle_zoom = """                    const originalHandleZoom = HmiApp.handleZoom;
                    HmiApp.handleZoom = function(e) {
                        if (!this.state.showAll) {
                            originalHandleZoom.call(this, e);
                            return;
                        }

                        e.preventDefault();

                        // Smoother zoom multiplier instead of additive steps
                        const zoomFactor = 1.1;
                        let newZoom = this.state.zoom;

                        if (e.deltaY < 0) {
                            newZoom = Math.min(this.state.zoom * zoomFactor, 4);
                        } else {
                            newZoom = Math.max(this.state.zoom / zoomFactor, 0.15);
                        }

                        if (newZoom !== this.state.zoom) {
                            const rect = this.dom.singleViewArea.getBoundingClientRect();

                            // Get mouse position relative to container
                            const mouseX = e.clientX - rect.left;
                            const mouseY = e.clientY - rect.top;

                            // The formula to keep the point under the mouse stationary:
                            // We find the normalized coordinate of the mouse within the scaled content
                            const elementX = (mouseX - this.state.panX) / this.state.zoom;
                            const elementY = (mouseY - this.state.panY) / this.state.zoom;

                            this.state.zoom = newZoom;

                            // Reposition pan so the element point is still under the mouse
                            this.state.panX = mouseX - (elementX * this.state.zoom);
                            this.state.panY = mouseY - (elementY * this.state.zoom);

                            this.applyTransform();
                        }
                    };"""

content = re.sub(
    r'HmiApp\.handleZoom = function\(e\) \{.*?this\.applyTransform\(\);\n\s*\}\n\s*\};',
    new_handle_zoom.strip(),
    content,
    flags=re.DOTALL
)

with open(html_file, 'w') as f:
    f.write(content)
print("Zoom patched successfully")
