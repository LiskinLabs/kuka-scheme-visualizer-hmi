import re
with open('/app/kuka_design_system.css', 'r') as f:
    css = f.read()

# Add zero padding/margin to dim line to make sure
css = css.replace('.dim-line {', '.dim-line {\n    padding: 0 !important;\n    margin: 0 !important;\n    border-width: 0 !important;')

with open('/app/kuka_design_system.css', 'w') as f:
    f.write(css)
