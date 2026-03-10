import os

filepath = 'check_errors.py'
with open(filepath, 'r') as f:
    content = f.read()

if "import os" not in content:
    content = "import os\n" + content

with open(filepath, 'w') as f:
    f.write(content)
