with open('scheme_hmi_v3_industrial.html', 'r', encoding='utf-8') as f:
    html = f.read()

toggle_js = """function toggleBottomSheet() {
            const sheet = document.getElementById('mobile-sheet');
            sheet.classList.toggle('open');

            const fab = document.getElementById('mobile-fab');
            if(fab) {
                if(sheet.classList.contains('open')) {
                    fab.style.display = 'none';
                } else {
                    fab.style.display = 'flex';
                }
            }

            // Sync mobile dropdowns with real ones"""

html = html.replace("""function toggleBottomSheet() {
            const sheet = document.getElementById('mobile-sheet');
            sheet.classList.toggle('open');

            // Sync mobile dropdowns with real ones""", toggle_js)

with open('scheme_hmi_v3_industrial.html', 'w', encoding='utf-8') as f:
    f.write(html)
