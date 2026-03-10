import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# We need to make sure the outer wrapper handles rotation correctly without clipping or breaking its border.
# In kuka_design_system.css .rad-24050 has some absolute pos and clip-path?
# Actually .rad-24050 might have overflow visible and we just use it as a positioning box.
# Let's inspect CSS to be safe.
