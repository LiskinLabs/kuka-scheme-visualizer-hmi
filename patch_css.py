import re

css_file = '/app/kuka_design_system.css'

with open(css_file, 'r') as f:
    content = f.read()

# Make dim lines orange and solid
content = re.sub(r'\.dim-line \{\n\s*position: absolute;', '.dim-line {\n    position: absolute;\n    border-style: solid;\n    border-color: #FF6B2C;', content)

# Update dim labels
content = re.sub(r'\.dim-label \{\n\s*position: absolute;\n\s*transform: translate\(-50%, -50%\);\n\s*background: var\(--error\);\n\s*color: white;', '.dim-label {\n    position: absolute;\n    transform: translate(-50%, -50%);\n    background: #111 !important;\n    color: #FF6B2C !important;\n    border: 1px solid #FF6B2C !important;\n    border-radius: 2px !important;', content)

# Adjust width dimensions to sit outside (bottom)
content = re.sub(r'\.dim-w \{\n\s*bottom: 2px;', '.dim-w {\n    bottom: -20px;', content)

# Adjust height dimensions to sit outside (left)
content = re.sub(r'\.dim-h \{\n\s*left: 2px;', '.dim-h {\n    left: -20px;', content)

# Make sure dim labels inside radiators are strictly hidden
content = re.sub(r'\.rad \.dim-w,\n\.rad \.dim-h \{\n\s*display: none;\n\}', '.rad .dim-w,\n.rad .dim-h,\n.rad-24050 .dim-w,\n.rad-24050 .dim-h {\n    display: none !important;\n}', content)

with open(css_file, 'w') as f:
    f.write(content)
print("CSS patched successfully")
