import re

css_file = '/app/kuka_design_system.css'

with open(css_file, 'r') as f:
    content = f.read()

# Make the rotated version of .rad match the non-rotated style, only changing the repeating-linear-gradient direction
content = re.sub(
    r'\.rad-rotated \{\n\s*background-image:\n\s*linear-gradient\(160deg,\n\s*rgba\(255, 255, 255, 0\.1\) 0%,\n\s*transparent 50%,\n\s*rgba\(0, 0, 0, 0\.1\) 100%\),\n\s*repeating-linear-gradient\(90deg,\n\s*rgba\(255, 255, 255, 0\.12\) 0px,\n\s*transparent 1px,\n\s*rgba\(0, 0, 0, 0\.15\) 2px,',
    '''.rad-rotated {
        background-image:
            linear-gradient(160deg,
                rgba(255, 255, 255, 0.1) 0%,
                transparent 50%,
                rgba(0, 0, 0, 0.1) 100%),
            repeating-linear-gradient(90deg,
                rgba(255, 255, 255, 0.12) 0px,
                transparent 1px,
                rgba(0, 0, 0, 0.15) 2px,
                transparent 3px,
                transparent 4px);
        background-size: 100% 100%, 4px 100%;
    }''',
    content,
    flags=re.DOTALL
)

# Replace the entire block for .rad and .rad-rotated to be completely identical but correct sizes
# We can just re-write the background properties directly if it's easier.

with open(css_file, 'w') as f:
    f.write(content)
print("CSS Radiator patched")
