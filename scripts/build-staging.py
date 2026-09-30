"""Build an isolated Firebase staging candidate without editing production sources."""
import argparse
import importlib.util
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '.staging-dist'
ALLOWED = {'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'}
REQUIRED = {'apiKey', 'authDomain', 'projectId', 'appId'}


def build(config_path):
    config = json.loads(Path(config_path).read_text())
    if not isinstance(config, dict) or set(config) - ALLOWED:
        raise ValueError('Supply only the Firebase web app config; credentials and extra keys are not accepted.')
    if any(not isinstance(config.get(key), str) or not config[key].strip() for key in REQUIRED):
        raise ValueError('Web config requires non-empty apiKey, authDomain, projectId and appId strings.')
    if any(not isinstance(value, str) for value in config.values()):
        raise ValueError('Web config values must be strings.')
    production = (ROOT / 'site/firebase-config.js').read_text()
    project = re.search(r'projectId:\s*[\"\']([^\"\']+)', production).group(1)
    if config['projectId'] == project:
        raise ValueError('Staging must use a different Firebase project from production.')
    if config['authDomain'] == f'{project}.firebaseapp.com':
        raise ValueError('Staging must not use the production authentication domain.')
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location('site_builder', ROOT / 'scripts/build-site.py')
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    with tempfile.TemporaryDirectory() as directory:
        source = Path(directory) / 'site'
        builder.shutil.copytree(ROOT / 'site', source)
        (source / 'firebase-config.js').write_text('export const firebaseConfig = ' + json.dumps(config, indent=2) + ';\n')
        (source / 'CNAME').unlink(missing_ok=True)
        (source / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
        builder.SOURCE, builder.OUTPUT = source, OUTPUT
        version = builder.build()
    revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    dirty = bool(subprocess.check_output(['git', 'status', '--porcelain', '--untracked-files=no'], cwd=ROOT, text=True).strip())
    (OUTPUT / 'staging-manifest.json').write_text(json.dumps({'projectId': config['projectId'], 'revision': revision, 'workingTreeModified': dirty, 'assetVersion': version, 'environment': 'staging'}, indent=2) + '\n')
    print('Staging candidate prepared. No hosting, rules, indexes or community gate were changed.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--firebase-config', required=True, help='JSON containing the staging Firebase web app config')
    args = parser.parse_args()
    try:
        build(args.firebase_config)
    except (ValueError, OSError) as error:
        parser.exit(1, f'{error}\n')
