import re

with open('production_metrics.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update the getDimLineHTML function to support more colors based on type
new_get_dim_line = """    getDimLineHTML(x, y, dx, dy, text, type) {
        let styleLine, finalX = x, finalY = y, absDx = Math.abs(dx), absDy = Math.abs(dy);

        // Define varied colors based on the dimension type
        let color = '#FF3D00'; // Default orange-red
        if (type.startsWith('gap-dim')) color = '#4CAF50'; // Green
        else if (type === 'manual-dim-x') color = '#03A9F4'; // Light Blue
        else if (type === 'manual-dim-y') color = '#9C27B0'; // Purple
        else if (type === 'edge-dim-x') color = '#FFC107'; // Amber
        else if (type === 'edge-dim-y') color = '#E91E63'; // Pink
        else if (type === 'overhang') color = '#FF3D00'; // Red

        let extraTransform = '';
        if (dx !== 0) {
            if (dx < 0) finalX = x + dx;
            styleLine = `width:${absDx}px; height:1px; border-top:1px dashed ${color};`;
            if (type.startsWith('gap-dim')) extraTransform = 'translateY(15px)'; // Shift gap label down
            if (type.startsWith('manual-dim') || type.startsWith('edge-dim')) extraTransform = 'translateY(-15px)'; // Shift manual/edge label up
        }
        else {
            if (dy < 0) finalY = y + dy;
            styleLine = `width:1px; height:${absDy}px; border-left:1px dashed ${color};`;
            if (type.startsWith('gap-dim')) extraTransform = 'translateX(15px)'; // Shift gap label right
            if (type.startsWith('manual-dim') || type.startsWith('edge-dim')) extraTransform = 'translateX(-15px)'; // Shift manual/edge label left
        }
        return `<div class="dim-line ${type}" style="left:${finalX}px; top:${finalY}px; ${styleLine}"></div><div class="dim-label" style="left:${finalX + absDx / 2}px; top:${finalY + absDy / 2}px; transform: translate(-50%, -50%) ${extraTransform}; background:#111; color:${color}; border:1px solid ${color}; border-radius:2px; z-index: 50; padding: 2px 4px; font-size: 10px;">${text}</div>`;
    },"""

js = re.sub(r'getDimLineHTML\(x, y, dx, dy, text, type\) \{[\s\S]*?return `<div class="dim-line \$\{type\}" style="left:\$\{finalX\}px; top:\$\{finalY\}px; \$\{styleLine\}"><\/div><div class="dim-label" style="left:\$\{finalX \+ absDx \/ 2\}px; top:\$\{finalY \+ absDy \/ 2\}px; transform: translate\(-50%, -50%\) \$\{extraTransform\}; background:#111; color:\$\{color\}; border:1px solid \$\{color\}; border-radius:2px; z-index: 50; padding: 2px 4px; font-size: 10px;">\$\{text\}<\/div>`;\n    \},', new_get_dim_line, js)


# 2. Update the calls that draw the edge/bounds dimensions.
# They were previously "manual-dim" and checking `Math.abs(Math.round(space)) > 0`, which caused negative space to render.
# Now we check `Math.round(space) > 0` (only positive space) and pass fine-grained types.

old_bounds_dims = """                if (Math.abs(Math.round(spaceRight)) > 0) blueprintHTML += this.getDimLineHTML(Math.round(palLeft + (palSize.x * s / 2) + maxX * s), palTop + palH / 2, spaceRight * s, 0, `${Math.round(spaceRight)} mm`, 'manual-dim');
                if (Math.abs(Math.round(spaceLeft)) > 0) blueprintHTML += this.getDimLineHTML(palLeft, palTop + palH / 2, spaceLeft * s, 0, `${Math.round(spaceLeft)} mm`, 'manual-dim');
                if (Math.abs(Math.round(spaceTop)) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, Math.round(palTop + (palSize.y * s / 2) - maxY * s) - spaceTop * s, 0, spaceTop * s, `${Math.round(spaceTop)} mm`, 'manual-dim');
                if (Math.abs(Math.round(spaceBottom)) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, palTop + palH - spaceBottom * s, 0, spaceBottom * s, `${Math.round(spaceBottom)} mm`, 'manual-dim');"""

new_bounds_dims = """                if (Math.round(spaceRight) > 0) blueprintHTML += this.getDimLineHTML(Math.round(palLeft + (palSize.x * s / 2) + maxX * s), palTop + palH / 2, spaceRight * s, 0, `${Math.round(spaceRight)} mm`, 'edge-dim-x');
                if (Math.round(spaceLeft) > 0) blueprintHTML += this.getDimLineHTML(palLeft, palTop + palH / 2, spaceLeft * s, 0, `${Math.round(spaceLeft)} mm`, 'edge-dim-x');
                if (Math.round(spaceTop) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, Math.round(palTop + (palSize.y * s / 2) - maxY * s) - spaceTop * s, 0, spaceTop * s, `${Math.round(spaceTop)} mm`, 'edge-dim-y');
                if (Math.round(spaceBottom) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, palTop + palH - spaceBottom * s, 0, spaceBottom * s, `${Math.round(spaceBottom)} mm`, 'edge-dim-y');"""

js = js.replace(old_bounds_dims, new_bounds_dims)

# 3. Update the center dims
old_center_dims = """            if (!isMiniature && this.state.showDimCenter) {
                radiatorsHTML += this.getDimLineHTML(radLeft + rw / 2, radTop + rh + 10, -p.x * s, 0, Math.round(p.x), 'manual-dim');
                radiatorsHTML += this.getDimLineHTML(radLeft - 10, radTop + rh / 2, 0, p.y * s, Math.round(p.y), 'manual-dim');
            }"""

new_center_dims = """            if (!isMiniature && this.state.showDimCenter) {
                radiatorsHTML += this.getDimLineHTML(radLeft + rw / 2, radTop + rh + 10, -p.x * s, 0, Math.round(p.x), 'manual-dim-x');
                radiatorsHTML += this.getDimLineHTML(radLeft - 10, radTop + rh / 2, 0, p.y * s, Math.round(p.y), 'manual-dim-y');
            }"""
js = js.replace(old_center_dims, new_center_dims)

with open('production_metrics.js', 'w', encoding='utf-8') as f:
    f.write(js)
