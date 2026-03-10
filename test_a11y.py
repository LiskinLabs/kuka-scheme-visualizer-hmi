import re

with open('scheme_hmi_v3_industrial.html', 'r') as f:
    content = f.read()

assert 'aria-label="Auto Mode"' in content
assert 'aria-label="Manual Mode"' in content
assert 'for="inL"' in content
assert 'aria-expanded="true"' in content
assert "el.setAttribute('aria-expanded', 'false');" in content
assert "el.setAttribute('aria-expanded', 'true');" in content

print("All tests passed.")
