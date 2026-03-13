with open('production_metrics.js', 'r') as f:
    text = f.read()

open_br = text.count('{')
close_br = text.count('}')
print(f"Open brackets: {open_br}")
print(f"Close brackets: {close_br}")
