from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
out=root/'site/downloads/ForeverArmory.zip'
out.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(out,'w',ZIP_DEFLATED) as z:
    for p in sorted((root/'addon').rglob('*')):
        if p.is_file(): z.write(p,p.relative_to(root/'addon'))
print('Packaged ForeverArmory.zip')
