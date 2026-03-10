filepath = 'scheme_hmi_v3_industrial.html'
with open(filepath, 'r') as f:
    content = f.read()

# Make lblToggleAll hidden to match standard tool-btn behaviour
content = content.replace(
    '<span id="lblToggleAll" class="ml-2 text-xs">Show All</span>',
    '<span id="lblToggleAll" class="hidden">Show All</span>'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Applied HTML toggle class fix.")
