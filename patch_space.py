import re

with open('/app/production_metrics.js', 'r') as f:
    code = f.read()

# Replace spaceRight, spaceLeft logic
old_logic = "let spaceRight = (palSize.x / 2) - maxX, spaceLeft = minX - (-palSize.x / 2), spaceTop = (palSize.y / 2) - maxY, spaceBottom = minY - (-palSize.y / 2);"
new_logic = """const isDoubleLayout = [2, 4, 7, 10, 11, 13].includes(this.state.dizilimId) && !this.state.is50Group;
                const rightBoundary = isDoubleLayout ? (1200 + palSize.x / 2) : (palSize.x / 2);
                const leftBoundary = -palSize.x / 2;
                let spaceRight = rightBoundary - maxX, spaceLeft = minX - leftBoundary, spaceTop = (palSize.y / 2) - maxY, spaceBottom = minY - (-palSize.y / 2);"""

if old_logic in code:
    code = code.replace(old_logic, new_logic)
    with open('/app/production_metrics.js', 'w') as f:
        f.write(code)
    print("Patched space logic.")
else:
    print("Could not find old logic.")
