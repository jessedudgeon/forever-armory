import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('staging candidate isolates project, domain and release identity; refuses production or credentials', () => {
  const dir = mkdtempSync(join(tmpdir(), 'forever-staging-'));
  const path = join(dir, 'config.json');
  const original = readFileSync('site/firebase-config.js', 'utf8');
  const config = {projectId: 'demo-forever-staging', authDomain: 'demo-forever-staging.firebaseapp.com', apiKey: 'test-only', appId: 'test-only'};
  try {
    writeFileSync(path, JSON.stringify(config));
    execFileSync('python3', ['scripts/build-staging.py', '--firebase-config', path]);
    assert.equal(readFileSync('site/firebase-config.js', 'utf8'), original);
    assert.ok(!existsSync('.staging-dist/CNAME'));
    assert.match(readFileSync('.staging-dist/firebase-config.js', 'utf8'), /demo-forever-staging/);
    assert.doesNotMatch(readFileSync('.staging-dist/firebase-config.js', 'utf8'), /"projectId": "forever-armory"/);
    const manifest = JSON.parse(readFileSync('.staging-dist/staging-manifest.json', 'utf8'));
    assert.equal(manifest.projectId, config.projectId);
    assert.match(manifest.revision, /^[a-f0-9]{40}$/);
    assert.ok(readFileSync('.staging-dist/index.html', 'utf8').includes(`app.js?v=${manifest.assetVersion}`));
    for (const invalid of [{...config, projectId: 'forever-armory'}, {...config, authDomain: 'forever-armory.firebaseapp.com'}, {...config, private_key: 'never-copy'}, {...config, appId: ''}]) {
      writeFileSync(path, JSON.stringify(invalid));
      assert.equal(spawnSync('python3', ['scripts/build-staging.py', '--firebase-config', path]).status, 1);
    }
  } finally { rmSync(dir, {recursive:true, force:true}); }
});
