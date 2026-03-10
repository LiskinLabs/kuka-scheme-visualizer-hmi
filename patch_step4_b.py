import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Make sure Matrix Button shows Matrix.
# selectFromMatrix(w, l) { if (this.dom.inW) this.dom.inW.value = w; if (this.dom.inL) this.dom.inL.value = l; this.closeMatrixModal(); this.calc(); }
# Currently Matrix uses getDiz(). getDiz() has logic:
# getDiz(w, l) { if (w==200) ... }
# autoDizilim24050(w, l, isExport) { ... }
# The Matrix modal renders cells by calling getDiz(w, l).
# Let's change this to use the correct dizilim function based on currentProject.
# Inside buildMatrixModal():
# let d = this.getDiz(w, l), isPal2 = l > 1500, bgClass = ...
# Instead of hardcoding getDiz, we should use `this.state.currentProject === '24050' ? this.autoDizilim24050(w, l, this.state.exportMode) : this.getDiz(w, l)`

match = re.search(r'buildMatrixModal\(\) \{.*?\}', content, re.DOTALL)
if match:
    build_matrix = match.group(0)

    # Replace `let d = this.getDiz(w, l),`
    build_matrix = re.sub(r'let d = this\.getDiz\(w, l\),',
                          r"let d = this.state.currentProject === '24050' ? this.autoDizilim24050(w, l, this.state.exportMode) : this.getDiz(w, l),",
                          build_matrix)

    content = content.replace(match.group(0), build_matrix)

with open('production_metrics.js', 'w') as f:
    f.write(content)
