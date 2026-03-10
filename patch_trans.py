import re

filepath = 'production_metrics.js'
with open(filepath, 'r') as f:
    content = f.read()

# Make double sure the translations for ru match exactly. They do seem to be there based on grep, but let's confirm.
match = re.search(r"ru: \{(.*?)\}", content)
if match:
    ru_trans = match.group(1)
    print("Found RU: ", ru_trans)
else:
    print("NOT FOUND")
