import re

filepath = 'production_metrics.js'
with open(filepath, 'r') as f:
    content = f.read()

new_blueprint = """
            const dStr = new Date().toLocaleString(this.state.lang);
            const prjStr = `Proj ${this.state.currentProject}`, schStr = `Scheme D${this.state.dizilimId}`, radStr = `${this.state.width}x${this.state.length}mm`, cntStr = `${positions.length} pcs`, palStr = `${palSize.x}x${palSize.y}mm`;

            // Wait, we need to correctly compute titleBlockY taking into account the pallet boundaries and radiator offsets
            let bottomBound = Math.max(palH + palTop, palTop + (palSize.y * s / 2) + maxY * s);
            let titleBlockY = Math.round(bottomBound) + 60;

            // To make it centered: it's a fixed width element (e.g. 400px wide) relative to the palletArea
            let blockWidth = 500;
            // palLeft is the X start of pallet, palW is width. The visual center of pallet is palLeft + palW/2
            let blockLeft = palLeft + (palW / 2) - (blockWidth / 2);

            blueprintHTML += `<div class="blueprint-only print-data-block" style="position: absolute; top: ${titleBlockY}px; left: ${blockLeft}px; background: #fff; color: #000; border: 2px solid #000; padding: 10px; font-family: monospace; font-size: 14px; width: ${blockWidth}px; text-align: left; z-index: 1000; box-sizing: border-box;">
                <div style="border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold; font-size: 18px; text-align: center; text-transform: uppercase;">KUKA CELL VISUALIZER - TECH DATA</div>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <tr><td style="width: 35%; font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Project:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${prjStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Scheme / Layout:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${schStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Radiator Size:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${radStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Quantity / Layer:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${cntStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px; border-bottom: 1px solid #ccc;">Pallet Size:</td><td style="padding: 4px; border-bottom: 1px solid #ccc;">${palStr}</td></tr>
                    <tr><td style="font-weight: bold; padding: 4px;">Date Generated:</td><td style="padding: 4px;">${dStr}</td></tr>
                </table>
            </div>`;
"""

content = re.sub(r"const dStr = new Date\(\)\.toLocaleString\(this\.state\.lang\);.*?blueprintHTML \+= `<div class=\"blueprint-only\" style=\"position: absolute; top: \$\{titleBlockY\}px; right: 0; background: #111; color: #FF6B2C; border: 2px solid #FF6B2C; padding: 5px; font-family: monospace; font-size: 10px; width: 250px; text-align: left; z-index: 1000;\"><div style=\"border-bottom: 1px solid #FF6B2C; padding-bottom: 3px; margin-bottom: 3px; font-weight: bold; font-size: 12px; text-align: center;\">KUKA CELL VISUALIZER</div><table style=\"width: 100%; border-collapse: collapse;\"><tr><td style=\"width: 40%; font-weight: bold;\">Project:</td><td>\$\{prjStr\}</td></tr><tr><td style=\"font-weight: bold;\">Scheme:</td><td>\$\{schStr\}</td></tr><tr><td style=\"font-weight: bold;\">Radiator:</td><td>\$\{radStr\}</td></tr><tr><td style=\"font-weight: bold;\">Quantity:</td><td>\$\{cntStr\}</td></tr><tr><td style=\"font-weight: bold;\">Date:</td><td>\$\{dStr\}</td></tr></table></div>`;", new_blueprint.strip(), content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

print("Applied strict JS print data block template fix.")
