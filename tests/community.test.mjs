import {communityView} from '../site/community.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {publicCharacter,publicPost,mergedFeed} from '../site/community-model.js';
import {demoState,saveManualCharacter,validateBackup} from '../site/model.js';
import {saveProfile} from '../site/social-model.js';
test('public projection excludes account, private notes, alt links, inventory and rich biography',()=>{
 const c=demoState().characters[0];c.snapshots.at(-1).secret='never';
 const out=publicCharacter(c,{mainCharacterId:'another',fields:{title:'Traveler',atAGlance:'Hello',secrets:'NEVER',biography:'PRIVATE'}});
 assert.deepEqual(Object.keys(out).sort(),['name','class','race','faction','level','playStyle','title','bio','status'].sort());assert.equal(out.bio,'Hello');assert.ok(!JSON.stringify(out).includes('NEVER'));
});
test('public posts validate type and bounded nonempty body',()=>{assert.deepEqual(publicPost('ic',' Story '),{type:'ic',body:'Story'});for(const [type,body]of[['ic',''],['unknown','Story'],['ic','a'.repeat(6001)]])assert.throws(()=>publicPost(type,body));});
test('merged feed remains chronological across page boundaries without duplicates or skipped posts',async()=>{
 const rows={a:[100,90,80,70],b:[99,98,97,60],c:[95,94,93,50]};
 const feed=mergedFeed(['a','b','c','a'],async(id,cursor)=>{const start=cursor||0;const values=rows[id].slice(start,start+2);return {rows:values.map(t=>({id:id+t,sortTime:t})),cursor:start+2,done:start+2>=rows[id].length};});
 const all=[];for(let i=0;i<5;i++){const page=await feed.next(3);all.push(...page.rows);if(page.done)break;}
 assert.deepEqual(all.map(p=>p.sortTime),[100,99,98,97,95,94,93,90,80,70,60,50]);assert.equal(new Set(all.map(p=>p.id)).size,12);
});
test('stable public identity survives private profile edits and name corrections',()=>{
 let s=demoState(),id=s.characters[0].id;s=saveProfile(s,id,{title:'A'});s.social.profiles[0].publicId='stable-id';s=saveProfile(s,id,{title:'B'});assert.equal(s.social.profiles[0].publicId,'stable-id');
 const r=saveManualCharacter(s,{mainName:'Asha',secondaryName:'Brightvale',playStyle:'Normal',class:'PALADIN',level:13,faction:'Horde',race:'Forsaken',professions:[]},id);
 assert.equal(r.state.social.profiles[0].publicId,'stable-id');assert.equal(validateBackup({format:'forever-armory-backup',...r.state}).social.profiles[0].publicId,'stable-id');
});
test('a failed feed page can be retried without losing already buffered posts',async()=>{
 let fail=true;const values=[100,90,80,70];
 const reader=mergedFeed(['a'],async(id,cursor)=>{const start=cursor||0;if(start===2&&fail){fail=false;throw Error('network');}return {rows:values.slice(start,start+2).map(t=>({id:String(t),sortTime:t})),cursor:start+2,done:start+2>=values.length};});
 await assert.rejects(()=>reader.next(3),/network/);assert.deepEqual((await reader.next(3)).rows.map(r=>r.sortTime),[100,90,80]);assert.deepEqual((await reader.next(3)).rows.map(r=>r.sortTime),[70]);
});

test('parallel source failure settles all cursors before retrying',async()=>{
 let fail=true,release;const pending=new Promise(resolve=>release=resolve);
 const reader=mergedFeed(['a','b'],async(id,cursor)=>{
   if(id==='a'&&fail){fail=false;queueMicrotask(release);throw Error('network');}
   if(id==='b')await pending;
   return {rows:[{id,sortTime:id==='a'?2:1}],cursor:1,done:true};
 });
 await assert.rejects(()=>reader.next(),/network/);
 assert.deepEqual((await reader.next()).rows.map(r=>r.id),['a','b']);
});
