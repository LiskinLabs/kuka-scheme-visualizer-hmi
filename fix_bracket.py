import re

with open('production_metrics.js', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "Object.keys(tooltips).forEach(id => { const el = document.getElementById(id); if (el) el.title = t[tooltips[id]]; });" in line:
        new_lines.append("        this.render();\n")
        new_lines.append("    }\n")
    if "this.render();" in line and "Object.keys(tooltips)" not in ''.join(new_lines[-5:]):
        pass # don't double append

# It's probably easier to just find the setLang function.
with open('production_metrics.js', 'r') as f:
    text = f.read()

# Original code had:
#     setLang(lang) {
#         this.state.lang = lang;
#         ['ru', 'tr', 'uz'].forEach(l => { ... });
#         const t = this.config.translations[lang];
#         const map = { ... };
#         Object.keys(map).forEach(id => { ... });
#         this.render();
#     }

# The previous script `patch_js3.py` replaced:
#         Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = t[map[id]]; });
# With the expanded map AND the new tooltips logic, but maybe it overrode `this.render();\n    }`?
# Wait, looking at the grep output earlier:
#         Object.keys(tooltips).forEach(id => { const el = document.getElementById(id); if (el) el.title = t[tooltips[id]]; });
#         this.render();
#     }
# };

# Wait, `setLang(lang) {` was missing a closing bracket before `this.render();`?
# Let's count properly:
# setLang(lang) {  <- 1
#     ['ru', 'tr', 'uz'].forEach(l => { <- 2
#         btns.forEach(btn => { <- 3
#             if (isActive) { <- 4
#             } else { <- 5 (closes 4, opens 5)
#             } <- closes 5
#         }); <- closes 3
#     }); <- closes 2
#     ...
#     Object.keys(map).forEach(id => { ... });
#     this.render();
# } <- closes 1

# Let's see the full text of `setLang` to see where the bracket is missing.
