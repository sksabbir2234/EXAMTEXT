from pathlib import Path
from pathlib import Path
import subprocess
f = Path('src/pages/result.astro').read_text(encoding='utf-8')
s = f.index('<script is:inline>') + len('<script is:inline>')
e = f.index('</script>', s)
script = f[s:e]
script = script.replace('window.location.search', '""')
script = script.replace('navigator.share', 'false')
script = script.replace('navigator.clipboard.writeText', '(function(){})')
script = script.replace('window.showToast', '(function(){})')
Path('temp_script_parse.js').write_text(script, encoding='utf-8')
res = subprocess.run(['node', '-e', 'new Function(require("fs").readFileSync("temp_script_parse.js","utf8"));'], capture_output=True, text=True)
print('returncode', res.returncode)
print('stdout', res.stdout)
print('stderr', res.stderr)
Path('temp_script_parse.js').unlink()
