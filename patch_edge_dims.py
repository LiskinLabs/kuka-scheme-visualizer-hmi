with open('production_metrics.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Current logic draws the spaceRight dimension starting at (palLeft + palWidth - spaceRight*s) going right by spaceRight*s horizontally at mid-height
# Current logic draws the spaceLeft dimension starting at palLeft going right by spaceLeft*s horizontally at mid-height.
# Current logic draws the spaceTop dimension starting at palTop going down by spaceTop*s vertically at mid-width.
# Current logic draws the spaceBottom dimension starting at palTop+palH - spaceBottom*s going down vertically at mid-width.

old_edges = """                if (Math.round(spaceRight) > 0) blueprintHTML += this.getDimLineHTML(Math.round(palLeft + (palSize.x * s / 2) + maxX * s), palTop + palH / 2, spaceRight * s, 0, `${Math.round(spaceRight)} mm`, 'edge-dim-x');
                if (Math.round(spaceLeft) > 0) blueprintHTML += this.getDimLineHTML(palLeft, palTop + palH / 2, spaceLeft * s, 0, `${Math.round(spaceLeft)} mm`, 'edge-dim-x');
                if (Math.round(spaceTop) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, Math.round(palTop + (palSize.y * s / 2) - maxY * s) - spaceTop * s, 0, spaceTop * s, `${Math.round(spaceTop)} mm`, 'edge-dim-y');
                if (Math.round(spaceBottom) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, palTop + palH - spaceBottom * s, 0, spaceBottom * s, `${Math.round(spaceBottom)} mm`, 'edge-dim-y');"""

# We'll re-route the left/right gaps to top/bottom:
# spaceLeft: Draw horizontally from palLeft to palLeft + spaceLeft*s, but at the top (palTop - 15)
# spaceRight: Draw horizontally from palLeft + palW - spaceRight*s to palLeft + palW, but at the bottom (palTop + palH + 15)
# spaceTop: Draw vertically as normal
# spaceBottom: Draw vertically as normal

new_edges = """                // We shift X-axis dimensions (left/right) to display above/below the pallet so they don't clip on narrow mobile screens
                if (Math.round(spaceLeft) > 0) blueprintHTML += this.getDimLineHTML(palLeft, palTop - 15, spaceLeft * s, 0, `${Math.round(spaceLeft)} mm`, 'edge-dim-x');
                if (Math.round(spaceRight) > 0) blueprintHTML += this.getDimLineHTML(Math.round(palLeft + (palSize.x * s / 2) + maxX * s), palTop + palH + 15, spaceRight * s, 0, `${Math.round(spaceRight)} mm`, 'edge-dim-x');
                // Y-axis dimensions remain vertical
                if (Math.round(spaceTop) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, Math.round(palTop + (palSize.y * s / 2) - maxY * s) - spaceTop * s, 0, spaceTop * s, `${Math.round(spaceTop)} mm`, 'edge-dim-y');
                if (Math.round(spaceBottom) > 0) blueprintHTML += this.getDimLineHTML(palLeft + palW / 2, palTop + palH - spaceBottom * s, 0, spaceBottom * s, `${Math.round(spaceBottom)} mm`, 'edge-dim-y');"""

js = js.replace(old_edges, new_edges)

with open('production_metrics.js', 'w', encoding='utf-8') as f:
    f.write(js)
