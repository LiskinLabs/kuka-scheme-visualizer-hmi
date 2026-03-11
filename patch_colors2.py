import re

with open('production_metrics.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Make sure gap-dim is handled with the new fine-grained colors if we want, but wait, the plan just said 'gap-dim' starts with gap-dim.
# There is a small indentation issue with getDimLineHTML. Let's fix that.
js = js.replace("        getDimLineHTML(x, y", "    getDimLineHTML(x, y")

with open('production_metrics.js', 'w', encoding='utf-8') as f:
    f.write(js)
