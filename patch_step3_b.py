import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Add rotation to 24050 HTML element in getRadiatorHTML
# the signature is: getRadiatorHTML(is50, isMiniature, numLabel, isFlipped)
# We also need to know the angle. Let's change the signature to include angle.
# Wait, instead of changing the signature, we can do it outside in _renderSinglePalletInside.

# In _renderSinglePalletInside:
# const innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped);
# let's change that to:
# let innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped, thisAngle);

# Find: const innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped);
# Replace with: const innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped, thisAngle, wPx, hPx);
content = content.replace(
    "const innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped);",
    "const innerHTML = this.getRadiatorHTML(is50, isMiniature, numLabel, isFlipped, thisAngle, s, currentW, currentL);"
)

# Update getRadiatorHTML method
old_getHTML = """    getRadiatorHTML(is50, isMiniature, numLabel, isFlipped) {
        if (is50) {
            if (isMiniature) return `<div class="pkg-body"></div><div class="pkg-card left"></div><div class="pkg-card right"></div><div class="pkg-num">${numLabel}</div>`;
            return `<div class="pkg-body"></div><div class="pkg-card left"></div><div class="pkg-card right"></div><div class="pkg-corner tl"></div><div class="pkg-corner bl"></div><div class="pkg-corner tr"></div><div class="pkg-corner br"></div><div class="pkg-label"><div class="pkg-label-red">LIDER</div><div class="pkg-label-white"><span>СТАЛЬНОЙ<br>РАДИАТОР</span></div></div><div class="pkg-num">${numLabel}</div>`;
        }
        if (isMiniature) return `<div class="heat-plate" style="width:100%;height:100%;"><div class="pattern-area"><div class="rad-num" style="font-size:9px;padding:1px 3px;">${numLabel}</div></div><div class="long-pipe top"></div><div class="long-pipe bottom"></div></div>`;
        return `<div class="heat-plate"><div class="pattern-area"><div class="rad-num">${numLabel}</div></div><div class="clip tl"></div><div class="clip tr"></div><div class="clip bl"></div><div class="clip br"></div><div class="long-pipe top"></div><div class="long-pipe bottom"></div><div class="port top-left"></div><div class="port top-right"></div><div class="port bottom-left"></div><div class="port bottom-right"></div></div>`;
    },"""

new_getHTML = """    getRadiatorHTML(is50, isMiniature, numLabel, isFlipped, angle, s, currentW, currentL) {
        if (is50) {
            const isRotated90 = angle === 90 || angle === 270;
            // The unrotated base dimensions (where length is horizontal)
            const baseW = Math.round(currentL * s);
            const baseH = Math.round(currentW * s);
            const transform = isRotated90 ? `transform: rotate(${angle}deg); transform-origin: center center;` : `transform: rotate(${angle === 180 ? 180 : 0}deg);`;

            // To keep the number upright, we counter-rotate it
            const numStyle = isRotated90 ? `style="transform: rotate(-${angle}deg);"` : (angle === 180 ? `style="transform: rotate(-180deg);"` : '');

            if (isMiniature) {
                return `<div style="position:absolute; width:${baseW}px; height:${baseH}px; left:50%; top:50%; margin-left:-${baseW/2}px; margin-top:-${baseH/2}px; ${transform}">
                            <div class="pkg-body"></div><div class="pkg-card left"></div><div class="pkg-card right"></div><div class="pkg-num" ${numStyle}>${numLabel}</div>
                        </div>`;
            }
            return `<div style="position:absolute; width:${baseW}px; height:${baseH}px; left:50%; top:50%; margin-left:-${baseW/2}px; margin-top:-${baseH/2}px; ${transform}">
                        <div class="pkg-body"></div><div class="pkg-card left"></div><div class="pkg-card right"></div><div class="pkg-corner tl"></div><div class="pkg-corner bl"></div><div class="pkg-corner tr"></div><div class="pkg-corner br"></div><div class="pkg-label"><div class="pkg-label-red">LIDER</div><div class="pkg-label-white"><span>СТАЛЬНОЙ<br>РАДИАТОР</span></div></div><div class="pkg-num" ${numStyle}>${numLabel}</div>
                    </div>`;
        }
        if (isMiniature) return `<div class="heat-plate" style="width:100%;height:100%;"><div class="pattern-area"><div class="rad-num" style="font-size:9px;padding:1px 3px;">${numLabel}</div></div><div class="long-pipe top"></div><div class="long-pipe bottom"></div></div>`;
        return `<div class="heat-plate"><div class="pattern-area"><div class="rad-num">${numLabel}</div></div><div class="clip tl"></div><div class="clip tr"></div><div class="clip bl"></div><div class="clip br"></div><div class="long-pipe top"></div><div class="long-pipe bottom"></div><div class="port top-left"></div><div class="port top-right"></div><div class="port bottom-left"></div><div class="port bottom-right"></div></div>`;
    },"""

content = content.replace(old_getHTML, new_getHTML)

# We also need to fix className for 24050 rotated elements.
# If they are rotated, maybe we shouldn't use rad-24050-flipped class on the outer div anymore,
# because we're rotating the inner div.
# But for now let's modify className logic.

# In _renderSinglePalletInside:
# const className = is50 ? (isFlipped ? 'rad-24050 rad-24050-flipped' : 'rad-24050') : (isRotated ? 'rad rad-rotated' + dualClass : 'rad' + dualClass);
# Let's just use 'rad-24050' and handle everything in the inner div.

content = content.replace(
    "const className = is50 ? (isFlipped ? 'rad-24050 rad-24050-flipped' : 'rad-24050') : (isRotated ? 'rad rad-rotated' + dualClass : 'rad' + dualClass);",
    "const className = is50 ? 'rad-24050' : (isRotated ? 'rad rad-rotated' + dualClass : 'rad' + dualClass);"
)

with open('production_metrics.js', 'w') as f:
    f.write(content)
