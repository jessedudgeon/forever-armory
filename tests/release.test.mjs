import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
test('Pages release versions the entire static module graph without changing source',()=>{
 const source=readFileSync('site/app.js','utf8');
 execFileSync('python3',['scripts/build-site.py']);
 const html=readFileSync('.pages-dist/index.html','utf8');
 const token=html.match(/app\.js\?v=([a-f0-9]{16})/)[1];
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);
 for(const path of walk('.pages-dist').filter(p=>/\.(js|css|html)$/.test(p))) {
  const content=readFileSync(path,'utf8');
  assert.doesNotMatch(content,/["']\.\/[\w./-]+\.(?:js|css)["']/);
  for(const m of content.matchAll(/["'](\.\/[\w./-]+\.(?:js|css))\?v=([a-f0-9]+)["']/g)) {
   assert.equal(m[2],token);assert.ok(existsSync(resolve(dirname(path),m[1])),m[1]);
  }
 }
 assert.equal(readFileSync('site/app.js','utf8'),source);
 assert.equal(readFileSync('.pages-dist/CNAME','utf8'),readFileSync('site/CNAME','utf8'));
});
