import re
with open('/app/kuka_design_system.css', 'r') as f:
    css = f.read()

# Ensure we remove border-style and border-color effectively
css = re.sub(r'(\.dim-line\s*\{[^\}]*)border-style:\s*solid;([^\}]*\})', r'\1\2', css)
css = re.sub(r'(\.dim-line\s*\{[^\}]*)border-color:\s*#FF6B2C;([^\}]*\})', r'\1\2', css)

# Add margin/padding 0 to be safe
if 'padding: 0 !important;' not in css.split('.dim-line {')[1]:
    css = css.replace('.dim-line {', '.dim-line {\n    padding: 0 !important;\n    margin: 0 !important;\n    border-width: 0 !important;')

with open('/app/kuka_design_system.css', 'w') as f:
    f.write(css)
