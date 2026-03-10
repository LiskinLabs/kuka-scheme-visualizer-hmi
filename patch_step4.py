import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# 1. Show Dimension Lines for 24050
# Find: if (!isMiniature && !is50 && this.state.showDimCenter) {
content = re.sub(r'if \(!isMiniature && !is50 && this\.state\.showDimCenter\) \{',
                 r'if (!isMiniature && this.state.showDimCenter) {', content)

# 2. Update Matrix Modal Title
# Find: `(24048/49)` inside buildMatrixModal
content = re.sub(r'\(24048/49\)', r'(24048/49/50)', content)

# Also update the language dictionary if it's there
# ru: matrix: 'Матрица укладки'
# tr: matrix: 'Dizilim Matrisi'
# uz: matrix: 'Matritsa'
# The 24048/49 is hardcoded in buildMatrixModal header.
# Let's double check if it's in showMatrixModal.
# buildMatrixModal() { ... h3 style=...> ${this.config.translations[this.state.lang].matrix} (24048/49/50)</h3>

with open('production_metrics.js', 'w') as f:
    f.write(content)
