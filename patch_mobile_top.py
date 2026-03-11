import re

with open('scheme_hmi_v3_industrial.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add CSS for #mobile-top-bar
css_addition = """
            #mobile-sheet {
                position: fixed;
                bottom: 0;
"""

css_replacement = """
            #mobile-top-bar {
                display: flex !important;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 35px;
                background: rgba(30, 30, 30, 0.9);
                backdrop-filter: blur(5px);
                border-bottom: 1px solid #333;
                z-index: 50;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                font-size: 10px;
                color: #e0e0e0;
            }

            #mobile-sheet {
                position: fixed;
                bottom: 0;
"""
html = html.replace(css_addition, css_replacement)

# Add #mobile-top-bar to HTML body
html_addition = """<div id="app-container">

        <!-- Top Property Bar -->"""

html_replacement = """<div id="app-container">

        <!-- Mobile Top Info Bar -->
        <div id="mobile-top-bar" style="display: none;">
            <div class="flex gap-2 items-center">
                <i class="fas fa-box text-cad-accent"></i>
                <span id="mTopRadSize" class="font-mono text-[9px] font-bold"></span>
            </div>
            <div class="flex gap-2 items-center">
                <i class="fas fa-pallet text-cad-accent"></i>
                <span id="mTopPalSize" class="font-mono text-[9px] font-bold text-cad-muted"></span>
            </div>
        </div>

        <!-- Top Property Bar -->"""
html = html.replace(html_addition, html_replacement)

with open('scheme_hmi_v3_industrial.html', 'w', encoding='utf-8') as f:
    f.write(html)
