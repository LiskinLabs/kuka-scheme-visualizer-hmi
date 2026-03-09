import re

with open('/app/production_metrics.js', 'r') as f:
    code = f.read()

# Replace border-top/left with just border to prevent thick boxes if border-style is ever messed up, and remove dashed.
# Actually, the user wants "1px" border, dashed is fine.
# We will just ensure no border-style: solid interferes by adding border-bottom:0, border-left:0 etc.
old_getdim = """if (dx !== 0) {
            if (dx < 0) finalX = x + dx;
            styleLine = `width:${absDx}px; height:1px; border-top:1px dashed ${color};`;
            if (type === 'gap-dim') extraTransform = 'translateY(15px)'; // Shift gap label down
            if (type === 'manual-dim') extraTransform = 'translateY(-15px)'; // Shift manual label up
        }
        else {
            if (dy < 0) finalY = y + dy;
            styleLine = `width:1px; height:${absDy}px; border-left:1px dashed ${color};`;
            if (type === 'gap-dim') extraTransform = 'translateX(15px)'; // Shift gap label right
            if (type === 'manual-dim') extraTransform = 'translateX(-15px)'; // Shift manual label left
        }"""

new_getdim = """if (dx !== 0) {
            if (dx < 0) finalX = x + dx;
            styleLine = `width:${absDx}px; height:1px; border-top:1px dashed ${color}; border-bottom:0; border-left:0; border-right:0;`;
            if (type === 'gap-dim') extraTransform = 'translateY(15px)'; // Shift gap label down
            if (type === 'manual-dim') extraTransform = 'translateY(-15px)'; // Shift manual label up
        }
        else {
            if (dy < 0) finalY = y + dy;
            styleLine = `width:1px; height:${absDy}px; border-left:1px dashed ${color}; border-right:0; border-top:0; border-bottom:0;`;
            if (type === 'gap-dim') extraTransform = 'translateX(15px)'; // Shift gap label right
            if (type === 'manual-dim') extraTransform = 'translateX(-15px)'; // Shift manual label left
        }"""

if old_getdim in code:
    code = code.replace(old_getdim, new_getdim)
    with open('/app/production_metrics.js', 'w') as f:
        f.write(code)
    print("Patched getdim inline styles.")
else:
    print("Could not find getdim old logic.")
