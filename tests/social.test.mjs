import test from 'node:test';
import assert from 'node:assert/strict';
import {demoState,emptyState,validateBackup,mergeBackup,saveManualCharacter,addSnapshot,normalize} from '../site/model.js';
import {saveProfile,savePost,normalizeSocial,removeSocialCharacter} from '../site/social-model.js';
import {recordsFor,stateFromRecords,diffRecords} from '../site/cloud-model.js';
const backup=s=>validateBackup({format:'forever-armory-backup',...s});
const fixture=()=>{let s=demoState(),id=s.characters[0].id;s=saveProfile(s,id,{atAGlance:'An old traveler',secrets:'Owner only'});return savePost(s,id,'ic','The road calls.','post-one');};
test('social profiles and posts round trip through cloud and backup without rewriting snapshots',async()=>{
 const s=fixture();assert.deepEqual(backup(s),s);assert.deepEqual(stateFromRecords((await recordsFor(s)).values()),s);
 const before=structuredClone(s);before.social={profiles:[],posts:[]};const d=diffRecords(await recordsFor(before),await recordsFor(s));assert.equal(d.writes.length,2);assert.ok(d.writes.every(w=>w.data.kind==='task'));assert.equal(d.deletes.length,0);
});
test('addon observations do not overwrite manually authored RP profiles and stories',()=>{
 const s=fixture(),next=addSnapshot(s,normalize({...s.characters[0].snapshots.at(-1),level:20,observedAt:'2026-09-30T12:00:00Z'})).state;assert.deepEqual(next.social,s.social);
});
test('old backups default to empty social data; restoring twice is idempotent',()=>{
 const s=fixture(); const old=demoState();delete old.social;assert.deepEqual(backup(old).social,{profiles:[],posts:[]});
 const first=mergeBackup(emptyState(),s);assert.deepEqual(mergeBackup(first,s),first);
});
test('invalid identity, visibility, oversized text, duplicate posts and spoofed editing fail closed',()=>{
 const s=fixture(),id=s.characters[0].id;assert.throws(()=>saveProfile(s,'missing',{}),/unavailable/);assert.throws(()=>savePost(s,id,'ic',''),/Write/);assert.throws(()=>savePost(s,id,'ic','x'.repeat(6001)),/6000/);
 assert.throws(()=>savePost(s,s.characters[1].id,'ic','Hijack','post-one'),/another/);
 for(const visibility of ['public','guild','friends','authenticated']) {const data=structuredClone(s.social);data.profiles[0].visibility=visibility;assert.throws(()=>normalizeSocial(data,s.characters),/private/);}
 const d=structuredClone(s.social);d.posts.push(d.posts[0]);assert.throws(()=>normalizeSocial(d,s.characters),/Duplicate/);
});
test('main-alt associations cannot cycle or target missing characters',()=>{
 let s=demoState();const [a,b]=s.characters.map(c=>c.id);s=saveProfile(s,a,{},b);assert.throws(()=>saveProfile(s,b,{},a),/main character/);assert.throws(()=>saveProfile(s,a,{},a),/own alt/);assert.throws(()=>saveProfile(s,a,{},'missing'),/unavailable/);
});
test('renaming character preserves posts, profiles and alt associations',async()=>{
 let s=fixture(),old=s.characters[0].id; s=saveProfile(s,s.characters[1].id,{},old);
 const result=saveManualCharacter(s,{mainName:'Asha',secondaryName:'Brightvale',playStyle:'Normal',class:'PALADIN',level:13,faction:'Horde',race:'Forsaken',professions:[]},old);
 assert.equal(result.state.social.posts[0].characterId,result.id);assert.equal(result.state.social.profiles[0].characterId,result.id);assert.equal(result.state.social.profiles[1].mainCharacterId,result.id);
 assert.deepEqual(stateFromRecords((await recordsFor(result.state)).values()),backup(result.state));
});
test('character removal clears stories and resets other characters alt links',()=>{
 let s=fixture(),id=s.characters[0].id;s=saveProfile(s,s.characters[1].id,{},id);removeSocialCharacter(s,id);s.characters=s.characters.filter(c=>c.id!==id);s.tasks=s.tasks.filter(t=>t.characterId!==id);
 assert.equal(s.social.posts.length,0);assert.equal(s.social.profiles[0].mainCharacterId,'');assert.doesNotThrow(()=>backup(s));
});
