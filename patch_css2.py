import re

css_file = '/app/kuka_design_system.css'

with open(css_file, 'r') as f:
    content = f.read()

# Make sure we don't have multiple conflicting definitions
content = re.sub(r'/\* CAD Dim Label \*/\n\.dim-label \{\n\s*background: #111 !important;\n\s*color: #FF6B2C !important;\n\s*border: 1px solid #FF6B2C !important;\n\s*border-radius: 2px !important;\n\}\n\.dim-line \{\n\s*border-style: solid !important;\n\s*border-color: #888 !important;\n\}', '', content)

with open(css_file, 'w') as f:
    f.write(content)
print("CSS patched successfully 2")
