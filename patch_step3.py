import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# 1. Update _renderSinglePalletInside rotation math for 24050
# Currently:
# const rw = is50 ? currentL : (pAngle % 180 === 0 ? currentW : currentL);
# const rh = is50 ? currentW : (pAngle % 180 === 0 ? currentL : currentW);
# This means 24050 never swaped L and W. We want it to swap if pAngle % 180 !== 0.
# Actually, the base 24050 rads are drawn with length horizontally and width vertically.
# So if angle=0 or 180, it's L x W. If angle=90 or 270, it should be W x L.
# Let's fix rw, rh, realW, realH in all places.

# Replace:
# const rw = is50 ? currentL : (pAngle % 180 === 0 ? currentW : currentL);
# const rh = is50 ? currentW : (pAngle % 180 === 0 ? currentL : currentW);

# With:
# const rw = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);
# const rh = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);

content = re.sub(r"const rw = is50 \? currentL : \(pAngle % 180 === 0 \? currentW : currentL\);",
                 r"const rw = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);", content)
content = re.sub(r"const rh = is50 \? currentW : \(pAngle % 180 === 0 \? currentL : currentW\);",
                 r"const rh = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);", content)

content = re.sub(r"const rw = is50 \? \(currentL \* s\) : \(thisAngle % 180 === 0 \? currentW \* s : currentL \* s\);",
                 r"const rw = is50 ? (thisAngle % 180 === 0 ? currentL * s : currentW * s) : (thisAngle % 180 === 0 ? currentW * s : currentL * s);", content)
content = re.sub(r"const rh = is50 \? \(currentW \* s\) : \(thisAngle % 180 === 0 \? currentL \* s : currentW \* s\);",
                 r"const rh = is50 ? (thisAngle % 180 === 0 ? currentW * s : currentL * s) : (thisAngle % 180 === 0 ? currentL * s : currentW * s);", content)

content = re.sub(r"let realW = is50 \? currentL : \(pAngle % 180 === 0 \? currentW : currentL\);",
                 r"let realW = is50 ? (pAngle % 180 === 0 ? currentL : currentW) : (pAngle % 180 === 0 ? currentW : currentL);", content)
content = re.sub(r"let realH = is50 \? currentW : \(pAngle % 180 === 0 \? currentL : currentW\);",
                 r"let realH = is50 ? (pAngle % 180 === 0 ? currentW : currentL) : (pAngle % 180 === 0 ? currentL : currentW);", content)

content = re.sub(r"let realW = is50 \? currentL : \(thisAngle % 180 === 0 \? currentW : currentL\);",
                 r"let realW = is50 ? (thisAngle % 180 === 0 ? currentL : currentW) : (thisAngle % 180 === 0 ? currentW : currentL);", content)
content = re.sub(r"let realH = is50 \? currentW : \(thisAngle % 180 === 0 \? currentL : currentW\);",
                 r"let realH = is50 ? (thisAngle % 180 === 0 ? currentW : currentL) : (thisAngle % 180 === 0 ? currentL : currentW);", content)

with open('production_metrics.js', 'w') as f:
    f.write(content)
