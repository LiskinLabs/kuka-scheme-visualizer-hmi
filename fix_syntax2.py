import re

with open('production_metrics.js', 'r') as f:
    js = f.read()

# Fix setTimeout in printLayout
old_code = """            setTimeout(() => {
                window.print();
                // Restore the grid view afterwards
                this.renderAllLayouts();
            },

    exportToImage() {"""

new_code = """            setTimeout(() => {
                window.print();
                // Restore the grid view afterwards
                this.renderAllLayouts();
            }, 1000);
        }
    },

    exportToImage() {"""

js = js.replace(old_code, new_code)

with open('production_metrics.js', 'w') as f:
    f.write(js)
