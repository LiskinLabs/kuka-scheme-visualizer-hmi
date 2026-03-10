import re

filepath = 'production_metrics.js'
with open(filepath, 'r') as f:
    content = f.read()

# Add touchcancel and touchend listener to singleViewArea to clear lastZoomDist
new_listeners = """
            this.dom.singleViewArea.addEventListener('touchmove', (e) => this.handleZoomTouch(e), { passive: false });
            this.dom.singleViewArea.addEventListener('touchend', (e) => { this.state.lastZoomDist = null; });
            this.dom.singleViewArea.addEventListener('touchcancel', (e) => { this.state.lastZoomDist = null; });
"""

content = content.replace("this.dom.singleViewArea.addEventListener('touchmove', (e) => this.handleZoomTouch(e), { passive: false });", new_listeners.strip())

with open(filepath, 'w') as f:
    f.write(content)

print("Applied touch cancel/end fix to production_metrics.js")
