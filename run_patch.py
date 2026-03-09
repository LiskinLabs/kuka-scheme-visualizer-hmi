import re

# Let's cleanly patch kuka_design_system.css
with open('/app/kuka_design_system.css', 'r') as f:
    css = f.read()

css = re.sub(r'(\.dim-line\s*\{[^}]*)border-style:\s*solid;([^}]*\})', r'\1\2', css)
css = re.sub(r'(\.dim-line\s*\{[^}]*)border-color:\s*#FF6B2C;([^}]*\})', r'\1\2', css)

# Make sure it only has position: absolute, z-index, pointer-events
if '.dim-line {' in css:
    css = css.replace('.dim-line {\n    position: absolute;\n    \n    \n    z-index: 20;\n    pointer-events: none;\n}', '.dim-line {\n    position: absolute;\n    padding: 0;\n    margin: 0;\n    border-width: 0;\n    z-index: 20;\n    pointer-events: none;\n}')
    css = css.replace('.dim-line {\n    position: absolute;\n    border-style: solid;\n    border-color: #FF6B2C;\n    z-index: 20;\n    pointer-events: none;\n}', '.dim-line {\n    position: absolute;\n    padding: 0;\n    margin: 0;\n    border-width: 0;\n    z-index: 20;\n    pointer-events: none;\n}')

with open('/app/kuka_design_system.css', 'w') as f:
    f.write(css)
