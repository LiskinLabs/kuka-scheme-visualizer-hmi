import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Let's fix the header in buildMatrixModal
# Replace (24048/49) with (24048/49/50)
content = content.replace("(24048/49)", "(24048/49/50)")

# Ensure 'is50' check doesn't block center dimensions
# if (!isMiniature && !is50 && this.state.showDimCenter) {
content = content.replace("if (!isMiniature && !is50 && this.state.showDimCenter) {", "if (!isMiniature && this.state.showDimCenter) {")

with open('production_metrics.js', 'w') as f:
    f.write(content)
