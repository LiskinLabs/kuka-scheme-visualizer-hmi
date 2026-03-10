import re

with open('scheme_hmi_v3_industrial.html', 'r') as f:
    content = f.read()

# Add keyboard support to the accordion headers
old_html = """                <div class="accordion-item">
                    <div class="accordion-header" onclick="toggleAcc(this)" aria-expanded="true" role="button" tabindex="0">"""

new_html = """                <div class="accordion-item">
                    <div class="accordion-header" onclick="toggleAcc(this)" onkeydown="if(event.key==='Enter'||event.key===' ') {event.preventDefault(); toggleAcc(this);}" aria-expanded="true" role="button" tabindex="0">"""

content = content.replace(old_html, new_html)

old_html2 = """                <div id="manualControlsGroup" class="accordion-item border-t border-cad-accent/30 mt-2">
                    <div class="accordion-header text-cad-accent" onclick="toggleAcc(this)" aria-expanded="true" role="button" tabindex="0">"""

new_html2 = """                <div id="manualControlsGroup" class="accordion-item border-t border-cad-accent/30 mt-2">
                    <div class="accordion-header text-cad-accent" onclick="toggleAcc(this)" onkeydown="if(event.key==='Enter'||event.key===' ') {event.preventDefault(); toggleAcc(this);}" aria-expanded="true" role="button" tabindex="0">"""

content = content.replace(old_html2, new_html2)

with open('scheme_hmi_v3_industrial.html', 'w') as f:
    f.write(content)
