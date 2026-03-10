filepath = 'scheme_hmi_v3_industrial.html'
with open(filepath, 'r') as f:
    content = f.read()

new_print_css = """
        /* Print styles */
        @media print {
            body { background: white !important; margin: 0; padding: 0; }
            body * { visibility: hidden; }
            #main-view, #main-view * { visibility: visible; }
            #main-view { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; background: white !important; display: flex; align-items: center; justify-content: center; overflow: hidden;}
            .cad-grid-bg { background-image: none !important; background-color: white !important;}
            #schemes-tabs, #top-nav, #btnDomestic, #btnExport, #leftPanel, #rightPanel, .info-card { display: none !important; }

            /* Black and White CAD styling */
            .radiator { border: 1px solid black !important; background: white !important; border-radius: 0 !important; color: black !important; }
            .radiator-top, .radiator-bottom, .radiator-grid { display: none !important; }
            .pallet { border: 2px solid black !important; background: transparent !important; border-radius: 0 !important; }
            .pallet2 { border: 2px dashed black !important; background: transparent !important; border-radius: 0 !important; }
            .center-mark { background: black !important; }

            .dim-line { border-bottom: 1px solid black !important; border-left: 1px solid black !important; border-right: 1px solid black !important; }
            .dim-text { color: black !important; background: white !important; font-weight: bold; }
            .print-data-block { color: black !important; background: white !important; border: 2px solid black !important; }
            .print-data-block table td { border-bottom: 1px solid #ccc; color: black !important; padding: 4px; }

            #singleViewArea { position: static; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
            #palletArea { transform-origin: center center !important; position: relative !important; top: auto !important; left: auto !important; margin: auto !important;}
        }
"""

import re
content = re.sub(r"/\* Print styles \*/.*?@media print \{.*?\}(?=\n        \n        \.all-layouts-grid)", new_print_css.strip(), content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

print("Applied strict B&W CAD print CSS.")
