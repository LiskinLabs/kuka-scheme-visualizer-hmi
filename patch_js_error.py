import subprocess

out = subprocess.check_output(['node', '-c', 'production_metrics.js'], stderr=subprocess.STDOUT)
print(out.decode('utf-8'))
