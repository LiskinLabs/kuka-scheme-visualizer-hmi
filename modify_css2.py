import re

with open('kuka_design_system.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Let's fix duplicate and overly strict rules we added which might be conflicting
css = re.sub(r'\.rad-24050 \.pkg-body\s*\{.*?\}', '', css, count=1, flags=re.DOTALL) # remove first instance
css = re.sub(r'\.rad-24050\s*\{[^}]*\}', '', css, count=1) # remove first .rad-24050 block

# Clean up .rad hover
css = re.sub(r'\.rad:hover\s*\{[^}]*\}', r'.rad:hover { z-index: 100; box-shadow: 0 0 0 1px var(--line-active); }', css, count=1)

with open('kuka_design_system.css', 'w', encoding='utf-8') as f:
    f.write(css)
