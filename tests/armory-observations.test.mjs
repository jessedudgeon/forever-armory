import test from 'node:test';
import assert from 'node:assert/strict';
import {questRows,questPage,questJournal,observationDetails,reputationDetails} from '../site/armory-observations.js';
import {readFile} from 'node:fs/promises';
const event=(id,questId=123)=>({eventId:String(id),questId,name:'The Dead Fields',completedAt:`2026-09-${String(id).padStart(2,'0')}T12:00:00Z`,zone:'Silverpine'});
test('quest journal preserves repeatable turn-ins, adds only untimed IDs, and never mutates observations',()=>{
 const snapshot={questHistory:[event(1),event(2)],completedQuestIDs:[123,456]}, before=structuredClone(snapshot);
 const rows=questRows(snapshot);assert.equal(rows.length,3);assert.equal(rows[0].eventId,'2');assert.equal(rows[1].eventId,'1');assert.deepEqual(rows[2],{questId:456,name:'',completedAt:null});assert.deepEqual(snapshot,before);
 assert.equal(questPage(rows,{query:'SILVERpine'}).total,2);assert.equal(questPage(rows,{query:'456'}).total,1);
 assert.equal(questPage(rows,{mode:'backfill'}).total,1);assert.equal(questPage(rows,{mode:'timed'}).total,2);
});
test('large completion lists paginate without dropping records and clamp stale page numbers',()=>{
 const rows=questRows({completedQuestIDs:Array.from({length:20000},(_,i)=>i+1)});
 assert.equal(questPage(rows).rows.length,50);assert.equal(questPage(rows).pages,400);
 assert.equal(questPage(rows,{page:399}).rows.at(-1).questId,20000);
 const filtered=questPage(rows,{query:'20000',page:399});assert.equal(filtered.page,0);assert.equal(filtered.rows[0].questId,20000);
 assert.equal(questPage(rows,{query:'not a quest'}).total,0);
});
test('observations render bounded selected scalar facts, preserve zero, and escape imported markup',()=>{
 const html=observationDetails({gameIdentity:{guid:'<img>'},source:'manual',reputations:[null,{name:'<script>',standing:0,min:0,max:3000,value:0},{name:{bad:'data'}}],rawAddon:{addonVersion:'0.3.0',schemaVersion:1,character:{observedAt:'2026-09-29T00:00:00Z',sex:2,secrets:'DO NOT SHOW'}}});
 assert.ok(html.includes('&lt;img&gt;'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('<td>0</td>'));assert.ok(!html.includes('DO NOT SHOW'));assert.ok(!html.includes('[object Object]'));
 assert.ok(reputationDetails({}).includes('not been captured'));assert.ok(reputationDetails({reputations:[]}).includes('No reputation entries'));
 assert.ok(questJournal({}).includes('No quest history captured'));assert.ok(questJournal({questHistoryStatus:{truncated:true}}).includes('truncated'));
});
test('index configuration preserves intentionally indexed lookup fields',async()=>{
 const {fieldOverrides}=JSON.parse(await readFile(new URL('../firestore.indexes.json',import.meta.url)));
 for(const [collectionGroup,fieldPath] of [['records','characterId'],['records','kind'],['communityOwners','characterKey']])assert.ok(!fieldOverrides.some(x=>x.collectionGroup===collectionGroup&&x.fieldPath===fieldPath));
 assert.ok(fieldOverrides.some(x=>x.collectionGroup==='records'&&x.fieldPath==='payload'&&x.indexes.length===0));
});
