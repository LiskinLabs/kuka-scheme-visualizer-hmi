import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Make sure there is a comma before dom:
content = re.sub(r'ttDownload: \'Tasvirni Yuklab Olish\'\n            }\n        }', 'ttDownload: \'Tasvirni Yuklab Olish\'\n            }\n        },', content)

with open('production_metrics.js', 'w') as f:
    f.write(content)
