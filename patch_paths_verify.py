import os
import re

def fix_python_script(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()

    # Replacing absolute paths with dynamic os-based paths

    if "os.getcwd()" in content:
        content = content.replace("os.getcwd()", "os.path.dirname(os.path.abspath(__file__))")
        # Since verify_metrics.py is in 'verification', dirname(__file__) returns verification folder
        # The html is in the parent directory, so we need to adjust
        content = content.replace("file_path = f\"file://{cwd}/scheme_hmi_v3_industrial.html\"", "cwd = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))\n        file_path = f\"file://{cwd}/scheme_hmi_v3_industrial.html\"")

    with open(filepath, 'w') as f:
        f.write(content)

    print(f"Fixed {filepath}")

fix_python_script('verification/verify_metrics.py')
