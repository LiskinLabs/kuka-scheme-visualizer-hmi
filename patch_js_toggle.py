import re

with open('scheme_hmi_v3_industrial.html', 'r') as f:
    content = f.read()

old_toggle = """        function toggleAcc(el) {
            const content = el.nextElementSibling;
            const icon = el.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (content.classList.contains('open')) {
                content.classList.remove('open');
                if(icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
            } else {
                content.classList.add('open');
                if(icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
            }
        }"""

new_toggle = """        function toggleAcc(el) {
            const content = el.nextElementSibling;
            const icon = el.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (content.classList.contains('open')) {
                content.classList.remove('open');
                el.setAttribute('aria-expanded', 'false');
                if(icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
            } else {
                content.classList.add('open');
                el.setAttribute('aria-expanded', 'true');
                if(icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
            }
        }"""

content = content.replace(old_toggle, new_toggle)

with open('scheme_hmi_v3_industrial.html', 'w') as f:
    f.write(content)
