"""Stage Pages assets with one content-derived release token for local modules.

Never edit source in place. A fresh HTML page requests new module URLs,
bypassing stale browser caches from prior releases. Existing tabs must reload.
"""
import hashlib
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'site'
OUTPUT = ROOT / '.pages-dist'

def build():
    files = sorted(p for p in SOURCE.rglob('*') if p.is_file())
    digest = hashlib.sha256()
    for path in files:
        if path.suffix in ('.js', '.css', '.html', '.json'):
            digest.update(str(path.relative_to(SOURCE)).encode())
            digest.update(path.read_bytes())
    version = digest.hexdigest()[:16]
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    shutil.copytree(SOURCE, OUTPUT)
    # Every local static import and HTML asset URL receives the same token.
    # Remote Firebase module URLs and JSON fetches remain unchanged.
    pattern = re.compile(r'''(["'])(\./[\w./-]+\.(?:js|css))\1''')
    for path in OUTPUT.rglob('*'):
        if path.suffix in ('.js', '.html', '.css'):
            source = path.read_text()
            path.write_text(pattern.sub(lambda m: f'{m[1]}{m[2]}?v={version}{m[1]}', source))
    print(f'Staged Pages release {version} in {OUTPUT.name}')
    return version

if __name__ == '__main__':
    build()
