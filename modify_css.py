import re

with open('kuka_design_system.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Base Dark CAD Colors and Variables
# We will override the core variables to make the whole UI dark gray / blueprint style.
css = re.sub(r'--bg-primary: #0A0E12;', r'--bg-primary: #1e1e1e;', css)
css = re.sub(r'--bg-secondary: #1A1F27;', r'--bg-secondary: #252526;', css)
css = re.sub(r'--bg-surface: #252D38;', r'--bg-surface: #2d2d30;', css)
css = re.sub(r'--glass-border: #475569;', r'--glass-border: #3e3e42;', css)
css = re.sub(r'--kuka-orange: #FF6B2C;', r'--kuka-orange: #569cd6; /* Blue for CAD active state */', css)
css = re.sub(r'--text-primary: #E8EEF4;', r'--text-primary: #cccccc;', css)

# 2. Square off the radius variables
css = re.sub(r'--radius-sm: 2px;', r'--radius-sm: 0px;', css)
css = re.sub(r'--radius-md: 2px;', r'--radius-md: 0px;', css)
css = re.sub(r'--radius-lg: 2px;', r'--radius-lg: 0px;', css)
css = re.sub(r'--radius-xl: 2px;', r'--radius-xl: 0px;', css)

# 3. Main Grid Background
# Make the grid look more like CAD and less like a glowing web background
grid_css = r'''
.pallet-area {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 400px;
    background: var(--bg-primary);
    background-image:
        linear-gradient(rgba(255, 255, 255, .1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, .1) 1px, transparent 1px),
        linear-gradient(rgba(255, 255, 255, .03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, .03) 1px, transparent 1px);
    background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
    background-position: center center;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0;
    margin-top: 0;
    overflow: hidden;
    border: none;
}
'''
css = re.sub(r'\.pallet-area\s*\{[^}]*\}', grid_css, css)

# 4. Pallets
# Instead of bright blue plastic gradients, make them dark slate metallic or wireframe-ish but filled
pallet_css = r'''
.pallet {
    position: absolute;
    background: #2a2a2a;
    border: 2px solid #569cd6;
    border-radius: 0;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.8), 0 5px 15px rgba(0,0,0,0.5);
    background-image:
        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(86,156,214,0.05) 10px, rgba(86,156,214,0.05) 20px);
}
.pallet2 {
    position: absolute;
    background: transparent;
    border: 2px solid #569cd6;
    border-left: 2px dashed rgba(86,156,214,0.5);
    border-radius: 0;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.8), 0 5px 15px rgba(0,0,0,0.5);
    background-image:
        repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(86,156,214,0.05) 10px, rgba(86,156,214,0.05) 20px);
}
'''
css = re.sub(r'\.pallet\s*\{.*?(?=\.pallet2 \{)', pallet_css, css, flags=re.DOTALL)
css = re.sub(r'\.pallet2\s*\{[^}]*background-position:[^}]*\}', '', css, flags=re.DOTALL) # remove leftover original pallet2

# Wood Pallet (project 24050)
wood_pallet_css = r'''
.pallet-wood {
    position: absolute;
    background-color: #3b3127; /* Darker, desaturated wood */
    border: 2px solid #5c4a3d;
    border-radius: 0;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    background-image:
        repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 40px);
}
'''
css = re.sub(r'\.pallet-wood\s*\{[^}]*\}', wood_pallet_css, css)


# 5. Radiators (Project 24048/24049 - Ribbed)
# Make them look like metallic/gray CAD objects, keeping ports and pipes visible but muted
# Remove heavy inner shadows and round borders. Use strict borders.
css = re.sub(r'\.rad \.heat-plate\s*\{[^}]*\}', r'.rad .heat-plate { position: relative; width: 100%; height: 100%; background-color: #3e3e42; border: 1px solid #5a5a5a; border-radius: 0; box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 2px; }', css)

# Adjust pattern-area to be subtle metallic
css = re.sub(r'\.rad \.pattern-area\s*\{[^}]*\}', r'.rad .pattern-area { width: 100%; height: 100%; border-radius: 0; background-color: #454545; background-image: repeating-linear-gradient(to right, #333 0%, #333 1px, transparent 1px, transparent 33.3px); background-size: calc(33.3px * var(--rad-scale, 1)) 100%; position: relative; display: flex; align-items: center; justify-content: center; }', css)

# Adjust long-pipes, ports, clips to dark grey metallic (No gradient, flat CAD style)
css = re.sub(r'background: linear-gradient\(to bottom, #333 0%, #888 20%, #ddd 50%, #777 80%, #222 100%\);', r'background: #5a5a5a;', css)
css = re.sub(r'background: linear-gradient\(to right, #444, #aaa 30%, #eee 50%, #888 80%, #222\);', r'background: #6a6a6a;', css)
css = re.sub(r'background: linear-gradient\(to right, #666 0%, #ccc 20%, #ececec 50%, #ccc 80%, #666 100%\);', r'background: #7a7a7a;', css)
# rotated variants
css = re.sub(r'background: linear-gradient\(to right, #333 0%, #888 20%, #ddd 50%, #777 80%, #222 100%\);', r'background: #5a5a5a;', css)
css = re.sub(r'background: linear-gradient\(to bottom, #444, #aaa 30%, #eee 50%, #888 80%, #222\);', r'background: #6a6a6a;', css)
css = re.sub(r'background: linear-gradient\(to bottom, #666 0%, #ccc 20%, #ececec 50%, #ccc 80%, #666 100%\);', r'background: #7a7a7a;', css)

# Make the rotated ribs flat as well
css = re.sub(r'\.rad\.rad-rotated \.pattern-area\s*\{[^}]*\}', r'.rad.rad-rotated .pattern-area { background-image: repeating-linear-gradient(to bottom, #333 0%, #333 1px, transparent 1px, transparent 33.3px); background-size: 100% calc(33.3px * var(--rad-scale, 1)); }', css)


# 6. Radiators (Project 24050 - Box/Packaged)
# Remove the white gloss, make it flat gray with sharp black lines
pkg_body_css = r'''
.rad-24050 .pkg-body {
    position: absolute;
    inset: 0;
    background-color: #d4d4d4; /* Light gray CAD fill */
    background-image:
        repeating-linear-gradient(to right, #a0a0a0 0px, #d4d4d4 1px, #d4d4d4 19px, #a0a0a0 20px);
    background-size: 20px 100%;
    border: 1px solid #5a5a5a;
    border-radius: 0;
}
.rad-24050 .pkg-body::after { display: none; } /* Remove gloss */
'''
css = re.sub(r'\.rad-24050 \.pkg-body\s*\{.*?(?=\.rad-24050 \.pkg-card \{)', pkg_body_css, css, flags=re.DOTALL)

# Cardboard to flat muted brown
css = re.sub(r'\.rad-24050 \.pkg-card\s*\{[^}]*\}', r'.rad-24050 .pkg-card { position: absolute; top: 0; bottom: 0; width: 12%; background-color: #8c7051; border: 1px solid #5c4a3d; z-index: 2; }', css)

# Corners to flat dark grey
css = re.sub(r'\.rad-24050 \.pkg-corner\s*\{[^}]*\}', r'.rad-24050 .pkg-corner { position: absolute; width: 14%; height: 20%; background-color: #2d2d30; border: 1px solid #1e1e1e; z-index: 3; }', css)

# Override the parent container background
css = re.sub(r'\.rad-24050\s*\{[^}]*background-color:[^}]*\}', r'.rad-24050 { position: absolute; background-color: transparent; border: none; box-shadow: none; z-index: 10; display: flex; align-items: center; justify-content: center; cursor: crosshair; }', css, count=1)


# 7. Hover/Select states
css = re.sub(r'\.rad:hover\s*\{[^}]*\}', r'.rad:hover { z-index: 100; box-shadow: 0 0 0 2px var(--line-active); }', css)
css = re.sub(r'\.rad-24050:hover\s*\{[^}]*\}', r'.rad-24050:hover { box-shadow: 0 0 0 2px var(--line-active); }', css)

# 8. Dimensions & Labels
css = re.sub(r'\.dim-w,\s*\.dim-h\s*\{[^}]*\}', r'.dim-w, .dim-h { position: absolute; font-size: 10px; color: #d4d4d4; font-family: var(--font-numbers); z-index: 1; pointer-events: none; background: #1e1e1e; padding: 0 2px; border: 1px solid #3e3e42;}', css)
css = re.sub(r'\.dim-line\s*\{[^}]*\}', r'.dim-line { position: absolute; z-index: 20; pointer-events: none; border-color: #808080 !important; border-style: solid !important; border-width: 1px !important; }', css)
css = re.sub(r'\.dim-label\s*\{[^}]*\}', r'.dim-label { position: absolute; transform: translate(-50%, -50%); background: #1e1e1e !important; color: #d4d4d4 !important; border: 1px solid #3e3e42 !important; font-size: 10px; font-family: var(--font-numbers); padding: 1px 3px; z-index: 21; border-radius: 0; }', css)

# Radiator Number Tag inside (flat gray)
css = re.sub(r'\.rad \.rad-num\s*\{[^}]*\}', r'.rad .rad-num { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 11px; font-weight: 500; font-family: var(--font-numbers); color: #ccc; background: #1e1e1e; padding: 2px 4px; border: 1px solid #3e3e42; z-index: 5; white-space: nowrap; pointer-events: none; }', css)

css = re.sub(r'\.rad span\s*\{[^}]*\}', r'.rad span { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 11px; font-family: var(--font-numbers); z-index: 2; background: #1e1e1e; color: #ccc; border: 1px solid #3e3e42; padding: 1px 4px; border-radius: 0; }', css)


with open('kuka_design_system.css', 'w', encoding='utf-8') as f:
    f.write(css)
