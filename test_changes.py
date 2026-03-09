import re
with open('/app/kuka_design_system.css', 'r') as f:
    css = f.read()

css = re.sub(r'(\.dim-line\s*\{[^\}]*)border-style:\s*solid;([^\}]*\})', r'\1\2', css)
css = re.sub(r'(\.dim-line\s*\{[^\}]*)border-color:\s*#FF6B2C;([^\}]*\})', r'\1\2', css)

with open('/app/kuka_design_system.css', 'w') as f:
    f.write(css)
