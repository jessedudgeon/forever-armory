import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildCatalog,searchCatalog} from '../site/catalog.js';
test('database preserves provenance and search routes',async()=>{const talent=JSON.parse(await readFile('site/data/talents/paladin.json','utf8')),rows=buildCatalog([talent]);assert.equal(new Set(rows.map(r=>r.key)).size,rows.length);assert.ok(searchCatalog(rows,'Meteor Shard','item').length);assert.ok(rows.filter(r=>r.type==='talent').every(r=>r.status.includes('unverified')));assert.ok(rows.filter(r=>r.type==='item').every(r=>r.status==='Classic reference'));assert.equal(searchCatalog(rows,'','quest').length,0);});
