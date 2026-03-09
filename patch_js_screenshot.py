import re

html_file = '/app/production_metrics.js'

with open(html_file, 'r') as f:
    content = f.read()

# Make the blueprint title block blend into the dark theme for print/screenshot
content = content.replace(
    '''background: white; color: black; border: 2px solid black;''',
    '''background: #111; color: #FF6B2C; border: 2px solid #FF6B2C;'''
)

content = content.replace(
    '''border-bottom: 1px solid black;''',
    '''border-bottom: 1px solid #FF6B2C;'''
)

with open(html_file, 'w') as f:
    f.write(content)

print("JS blueprint screenshot patched")
