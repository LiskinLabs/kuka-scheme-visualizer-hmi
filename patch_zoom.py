with open('scheme_hmi_v3_industrial.html', 'r', encoding='utf-8') as f:
    html = f.read()

zoom_js = """// Override Zoom
                    const originalHandleZoom = HmiApp.handleZoom;
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
                    };

                    // Override Touch Zoom
                    const originalHandleZoomTouch = HmiApp.handleZoomTouch;
                    HmiApp.handleZoomTouch = function(e) {
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
                        }
                        this.state.lastZoomDist = dist;
                    };"""

import re
html = re.sub(r'// Override Zoom\s+const originalHandleZoom.*?(?=// Override Pan to ensure)', zoom_js + '\n\n                    ', html, flags=re.DOTALL)

with open('scheme_hmi_v3_industrial.html', 'w', encoding='utf-8') as f:
    f.write(html)
