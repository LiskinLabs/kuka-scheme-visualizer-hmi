filepath = 'production_metrics.js'
with open(filepath, 'r') as f:
    content = f.read()

# Make lblToggleAll hidden in JS injection to match standard tool-btn behaviour
content = content.replace(
    '`<i class="fas fa-eye-slash text-xs"></i><span id="lblToggleAll" class="ml-2 text-xs"></span>`',
    '`<i class="fas fa-eye-slash text-xs"></i><span id="lblToggleAll" class="hidden"></span>`'
)

content = content.replace(
    '`<i class="fas fa-th-large text-xs"></i><span id="lblToggleAll" class="ml-2 text-xs"></span>`',
    '`<i class="fas fa-th-large text-xs"></i><span id="lblToggleAll" class="hidden"></span>`'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Applied JS toggle class fix.")
