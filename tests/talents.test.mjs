import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {classes,nodes,validate,change,encode,decode,budget,total} from '../site/talents.js';
for(const cls of classes)test(`${cls}: database integrity and build round trip`,async()=>{
 const d=JSON.parse(await readFile(new URL(`../site/data/talents/${cls}.json`,import.meta.url))),ns=nodes(d);
 assert.equal(d.trees.length,3);assert.equal(new Set(ns.map(n=>n.key)).size,ns.length);
 for(const tree of d.trees){assert.equal(new Set(tree.talents.map(n=>n.row+':'+n.col)).size,tree.talents.length);for(const n of tree.talents)for(const r of n.requires||[])assert.ok(tree.talents.some(x=>x.id===r.talent&&x.maxRank>=r.rank));}
 let b={};for(let i=0;i<51;i++){let added=false;for(const n of ns){try{b=change(d,b,60,n.key,1);added=true;break;}catch{}}if(!added)break;}
 assert.equal(total(b),51);assert.deepEqual(decode(d,60,encode(d,b,60).split('/')[2]),Object.fromEntries(ns.map(n=>[n.key,b[n.key]||0])));
 assert.throws(()=>validate(d,b,13));assert.equal(budget(d,13),4);assert.equal(budget(d,1),0);
 assert.throws(()=>change(d,{},60,ns.find(n=>n.row>0).key,1));
 assert.throws(()=>decode(d,60,'999'));assert.throws(()=>validate(d,{unknown:1},60));
});
test('refunds preserve unlocked rows and prerequisite talents',()=>{
 const d={rules:{maxPoints:51,firstPointLevel:10,pointsPerRow:5},trees:[{id:'a',talents:[{id:'base',row:0,maxRank:5},{id:'child',row:1,maxRank:1,requires:[{talent:'base',rank:5}]}]}]};
 const b={'a:base':5,'a:child':1};assert.throws(()=>change(d,b,60,'a:base',-1));assert.equal(change(d,b,60,'a:child',-1)['a:child'],0);
});
