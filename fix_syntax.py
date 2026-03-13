import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Fix the trailing comma or extra brackets near `uz` obj
content = re.sub(r'ttDownload: \'Tasvirni Yuklab Olish\'\n            \}\n        \},', r'ttDownload: \'Tasvirni Yuklab Olish\'\n            }\n        }', content)
# Just to be sure, let's fix any syntax errors inside the object manually
content = content.replace("toggleAllShow: 'Barchasini ko'rsatish',", "toggleAllShow: 'Barchasini ko\\'rsatish',")

with open('production_metrics.js', 'w') as f:
    f.write(content)
