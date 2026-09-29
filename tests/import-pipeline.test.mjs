import test from 'node:test';
import assert from 'node:assert/strict';
import {parseImport,addSnapshot,emptyState,validateBackup,saveManualCharacter} from '../site/model.js';
import {recordsFor,stateFromRecords} from '../site/cloud-model.js';
import {accountInventory} from '../site/storage.js';
import {progressChanges} from '../site/import-schema.js';
import {saveProfile} from '../site/social-model.js';
// Representative fixture from the owner's handoff, not a complete raw capture.
// GUID and talent IDs below are synthetic test identifiers, never production mappings.
const fixture=()=>({format:'forever-armory',version:1,character:{name:'Lasmus',class:'PALADIN',race:'Undead',faction:'Horde',level:15,xp:5627,xpMax:14400,money:3723,realm:'Classic Beta PvE',zone:'Orgrimmar',observedAt:'2026-09-29T21:22:36Z',gameIdentity:{guid:'Player-TEST-1',realm:'Classic Beta PvE'},stats:{health:500,strength:40},location:{zone:'Orgrimmar',subZone:'Valley',mapID:1},gear:[{slot:16,id:246164,link:'[Skullthumper]'},{slot:17,id:246265,link:'[Salvaged Wooden Tower Shield]'}],bags:[{bag:0,slot:7,id:2840,count:20,link:'[Copper Bar]'},{bag:0,slot:8,id:2840,count:13,link:'[Copper Bar]'}],professions:[{name:'Blacksmithing',rank:35,max:75},{name:'Mining',rank:54,max:150},{name:'First Aid',rank:71,max:150},{name:'Fishing',rank:26,max:75},{name:'Cooking',rank:32,max:75}],talents:[{name:'Redoubt',rank:2,treeID:100,nodeID:101,entryID:102,spellID:103},{name:'Toughness',rank:3},{name:'Anticipation',rank:1}],quests:[{id:123,title:'Test quest',level:14,isComplete:0}],recipes:[],reputations:[],warnings:['Reputation APIs unavailable.','No recipes scanned yet; open each profession and run /farmory recipes.']}});
const parse=x=>parseImport(JSON.stringify(x));
test('Lasmus representative export retains raw identifiers, slots, ranks, quests and optional fields through cloud/backup',async()=>{
 const raw=fixture(),s=parse(raw);assert.deepEqual(s.rawAddon,raw);assert.equal(s.realm,raw.character.realm);assert.equal(s.playStyle,'Normal');assert.equal(s.talentDetails[0].spellID,103);assert.equal(s.quests[0].id,123);assert.equal(s.statistics.health,500);assert.equal(s.inventory[0].container,'0');assert.equal(s.inventory[0].slot,7);assert.equal(s.gear[0].name,'Skullthumper');assert.ok(s.importedAt);assert.notEqual(s.importedAt,s.observedAt);
 const state=addSnapshot(emptyState(),s).state,round=stateFromRecords((await recordsFor(state)).values());
 assert.deepEqual(round.characters,state.characters);
 const restored=validateBackup({format:'forever-armory-backup',...state});assert.deepEqual(restored.characters,state.characters);
 const bar=accountInventory(state,{query:'Copper Bar'})[0];assert.equal(bar.total,33);assert.equal(bar.stacks.length,2);
});
test('same export does not duplicate snapshots; GUID rename preserves URL, history and RP',async()=>{
 let state=addSnapshot(emptyState(),parse(fixture())).state;const id=state.characters[0].id;
 state=saveProfile(state,id,{biography:'Private story'});
 assert.equal(addSnapshot(state,parse(fixture())).duplicate,true);
 const raw=fixture();raw.character.name='Lasmus Renamed';raw.character.observedAt='2026-09-30T21:22:36Z';
 const result=addSnapshot(state,parse(raw));assert.equal(result.id,id);assert.equal(result.state.characters.length,1);assert.equal(result.state.characters[0].snapshots[0].name,'Lasmus');assert.equal(result.state.social.profiles[0].fields.biography,'Private story');
 assert.deepEqual(stateFromRecords((await recordsFor(result.state)).values()).characters,result.state.characters);
 assert.equal(validateBackup({format:'forever-armory-backup',...result.state}).characters[0].id,id);
});
test('multiple accounts remain separate and GUID account conflicts cannot silently move characters',()=>{
 let state=addSnapshot(emptyState(),parse(fixture())).state;state.gameAccounts.push({id:'second',name:'WoW 2'});
 assert.throws(()=>addSnapshot(state,{...parse(fixture()),accountId:'second'}),/another WoW account/);
 const raw=fixture();raw.character.gameIdentity.guid='Player-TEST-2';state=addSnapshot(state,{...parse(raw),accountId:'second'}).state;
 assert.equal(state.characters.length,2);assert.equal(accountInventory(state,{query:'2840'})[0].total,66);assert.equal(accountInventory(state,{query:'2840',accountId:'second'})[0].total,33);
});
test('partial bag and recipe imports retain prior bank and scanned recipes',()=>{
 const raw=fixture();raw.character.recipes=[{id:'1',name:'Test craft',profession:'Blacksmithing'}];let snapshot=parse(raw);snapshot.inventory.push({id:1,name:'Bank item',quantity:2,location:'bank',container:'',slot:1,quality:null});snapshot.storageStatus.bank={captured:true,observedAt:snapshot.observedAt};
 let state=addSnapshot(emptyState(),snapshot).state;const next=fixture();next.character.observedAt='2026-09-30T21:22:36Z';state=addSnapshot(state,parse(next)).state;const s=state.characters[0].snapshots.at(-1);assert.equal(s.inventory.filter(i=>i.location==='bank').length,1);assert.equal(s.recipes.length,1);assert.equal(s.inventory.filter(i=>i.id===2840).length,2);
 next.character.recipes=[{id:'2',name:'Bandage',profession:'First Aid'}];next.character.observedAt='2026-10-01T21:22:36Z';state=addSnapshot(state,parse(next)).state;assert.equal(state.characters[0].snapshots.at(-1).recipes.length,2);
});
test('meaningful history reports gear, talent, profession, recipe and quest changes without XP/gold noise',()=>{
 const a=parse(fixture()),b=structuredClone(a);b.level=16;b.professions[1].rank=55;b.gear[0].id=2;b.gear[0].name='New weapon';b.talentDetails[0].rank=3;b.recipes=[{id:'2',profession:'First Aid',name:'Bandage',known:true}];b.quests[0].completed=true;b.xp=1;b.money=1;
 const changes=progressChanges(a,b).join(' | ');for(const word of ['level 16','Mining increased to 55','New weapon','Redoubt rank 3','Learned 1 recipes','ready to turn in'])assert.ok(changes.includes(word));assert.equal(progressChanges(a,{...a,money:99,xp:99}).length,0);
});
test('invalid formats, versions and optional malformed data fail understandably',()=>{
 for(const value of ['null','{}','bad',JSON.stringify({...fixture(),version:2}),JSON.stringify({...fixture(),format:'other'})])assert.throws(()=>parseImport(value));
 const raw=fixture();raw.character.bags[0].count=-1;assert.throws(()=>parse(raw));
 const missing=fixture();delete missing.character.gameIdentity;delete missing.character.reputations;assert.ok(parse(missing));
});
test('old manual records match exact full name and safe play style without changing the route',()=>{
 let state=saveManualCharacter(emptyState(),{mainName:'Lasmus',secondaryName:'Grave',playStyle:'Normal',faction:'Horde',race:'Forsaken',class:'PALADIN',level:15,professions:[]}).state;
 const id=state.characters[0].id,raw=fixture();raw.character.name='Lasmus Grave';delete raw.character.gameIdentity;
 const result=addSnapshot(state,parse(raw));assert.equal(result.id,id);assert.equal(result.state.characters.length,1);assert.equal(validateBackup({format:'forever-armory-backup',...result.state}).characters[0].id,id);
});
test('explicit first-import link preserves manual profile URL without guessing a missing surname',()=>{
 const state=saveManualCharacter(emptyState(),{mainName:'Lasmus',secondaryName:'Grave',playStyle:'Normal',faction:'Horde',race:'Forsaken',class:'PALADIN',level:15,professions:[]}).state,id=state.characters[0].id;
 const result=addSnapshot(state,parse(fixture()),{targetId:id});assert.equal(result.state.characters.length,1);assert.equal(result.id,id);assert.equal(validateBackup({format:'forever-armory-backup',...result.state}).characters[0].id,id);
 const wrong=fixture();wrong.character.gameIdentity.guid='Player-DIFFERENT';assert.throws(()=>addSnapshot(result.state,parse(wrong),{targetId:id}),/GUID/);
});
test('missing addon gear and talent APIs retain earlier observations without inventing empty slots',()=>{
 let state=addSnapshot(emptyState(),parse(fixture())).state;const raw=fixture();delete raw.character.gear;delete raw.character.talents;delete raw.character.professions;raw.character.observedAt='2026-10-01T21:22:36Z';
 state=addSnapshot(state,parse(raw)).state;const s=state.characters[0].snapshots.at(-1);assert.equal(s.gear.length,2);assert.equal(s.professions.length,5);assert.equal(s.talents.length,3);assert.equal(s.gearObservedAt,'2026-09-29T21:22:36.000Z');
});
test('manual corrections after an older GUID import preserve identity and historical names',()=>{
 let state=saveManualCharacter(emptyState(),{mainName:'Lasmus',secondaryName:'Grave',playStyle:'Normal',faction:'Horde',race:'Forsaken',class:'PALADIN',level:15,professions:[]}).state;
 const id=state.characters[0].id;state=addSnapshot(state,parse(fixture()),{targetId:id}).state;
 state=saveManualCharacter(state,{mainName:'Lasmus',secondaryName:'Gravemoor',playStyle:'Normal',faction:'Horde',race:'Forsaken',class:'PALADIN',level:15,professions:[]},id).state;
 assert.equal(state.characters[0].id,id);assert.equal(validateBackup({format:'forever-armory-backup',...state}).characters[0].id,id);assert.equal(state.characters[0].snapshots[0].name,'Lasmus');
});
test('addon payload cannot overwrite website notes, guild associations or calculator plans',()=>{
 const raw=fixture();raw.character.notes='replace';raw.character.guildId='replace';raw.character.builds=[{code:'bad'}];const s=parse(raw);
 assert.equal(s.notes,undefined);assert.equal(s.guildId,undefined);assert.equal(s.builds,undefined);assert.equal(s.rawAddon.character.notes,'replace');
});
test('cached bank scans use scan time, replace newer cache and never overwrite a fresher bank',()=>{
 const raw=fixture();delete raw.character.bags;
 raw.character.inventory=[{id:1,count:2,location:'bank',slot:1}];raw.character.storageStatus={bank:{captured:true,status:'cached',observedAt:'2026-09-28T00:00:00Z'}};
 let state=addSnapshot(emptyState(),parse(raw)).state;
 raw.character.observedAt='2026-10-01T00:00:00Z';raw.character.storageStatus.bank.observedAt='2026-09-30T00:00:00Z';raw.character.inventory[0].count=3;
 state=addSnapshot(state,parse(raw)).state;assert.equal(state.characters[0].snapshots.at(-1).inventory[0].quantity,3);
 raw.character.observedAt='2026-10-02T00:00:00Z';raw.character.storageStatus.bank.observedAt='2026-09-29T00:00:00Z';raw.character.inventory[0].count=1;
 state=addSnapshot(state,parse(raw)).state;assert.equal(state.characters[0].snapshots.at(-1).inventory[0].quantity,3);
 raw.character.observedAt='2026-10-03T00:00:00Z';raw.character.storageStatus.bank.observedAt='2026-10-03T00:00:00Z';raw.character.inventory=[];
 state=addSnapshot(state,parse(raw)).state;assert.equal(state.characters[0].snapshots.at(-1).inventory.length,0);
});
