import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionExportText} from '../site/session-import.js';
import {parseImport,addSnapshot,emptyState,validateBackup} from '../site/model.js';
import {recordsFor,stateFromRecords} from '../site/cloud-model.js';
import {progressChanges} from '../site/import-schema.js';
const event=(n,id=123)=>({eventId:`fa:q:1:Test:Player-1:${n}`,type:'quest-turned-in',questId:id,name:'The Dead Fields',completedAt:`2026-09-29T22:${String(n).padStart(2,'0')}:00Z`,characterGuid:'Player-1',level:15,zone:'Silverpine',sessionId:'fa:s:1:Test:Player-1:1'});
const payload=()=>({format:'forever-armory',version:1,addonVersion:'0.3.0',schemaVersion:1,character:{name:'Lasmus',realm:'Classic Beta PvE',class:'PALADIN',level:15,race:'Undead',faction:'Horde',observedAt:'2026-09-29T22:30:00Z',gameIdentity:{guid:'Player-1',realm:'Classic Beta PvE'},questHistory:[event(1),event(2)],completedQuestIDs:[123,456],session:{id:'fa:s:1:Test:Player-1:1',startedAt:'2026-09-29T22:00:00Z',endedAt:'2026-09-29T22:30:00Z',status:'ended'}}});
const saved=p=>'ForeverArmoryRecipes = {}\nForeverArmorySessionExport = '+JSON.stringify(JSON.stringify(p))+'\nForeverArmoryJournal = {}\n';
test('SavedVariables session extracts only JSON and preserves Unicode, escapes and literal malicious Lua',()=>{
 const p=payload();p.character.questHistory[0].name='Étoile 😀 "quote" \\ line\nnext';
 assert.deepEqual(JSON.parse(sessionExportText(saved(p))),p);
 assert.equal(parseImport(saved(p)).questHistory[0].name,p.character.questHistory[0].name);
 const decimal=saved(p).replace('É','\\195\\137');assert.deepEqual(JSON.parse(sessionExportText(decimal)),p);
 assert.deepEqual(JSON.parse(sessionExportText('os.execute("evil")\n'+saved(p))),p);
 for(const input of ['ForeverArmoryCache = {}','ForeverArmorySessionExport = os.execute("evil")',saved(p)+saved(p),'ForeverArmorySessionExport = "unfinished','ForeverArmorySessionExport = "\\999"','ForeverArmorySessionExport = "\\q"'])assert.throws(()=>sessionExportText(input));
});
test('quest events survive backup/cloud, imports deduplicate, repeatable completions stay distinct',async()=>{
 const s=parseImport(saved(payload()));let state=addSnapshot(emptyState(),s).state;
 assert.equal(state.characters[0].snapshots[0].questHistory.length,2);
 assert.equal(addSnapshot(state,parseImport(saved(payload()))).duplicate,true);
 const p=payload();p.character.observedAt='2026-09-29T23:00:00Z';p.character.questHistory=[event(2),event(3,789)];p.character.completedQuestIDs=[789];
 state=addSnapshot(state,parseImport(JSON.stringify(p))).state;const latest=state.characters[0].snapshots.at(-1);
 assert.equal(latest.questHistory.length,3);assert.deepEqual(latest.completedQuestIDs,[123,456,789]);
 assert.equal(progressChanges(s,latest).filter(x=>x.startsWith('Quest completed:')).length,1);
 assert.deepEqual(validateBackup({format:'forever-armory-backup',...state}).characters,state.characters);
 assert.deepEqual(stateFromRecords((await recordsFor(state)).values()).characters,state.characters);
 const legacy=payload();delete legacy.character.questHistory;delete legacy.character.completedQuestIDs;legacy.character.observedAt='2026-09-30T00:00:00Z';
 state=addSnapshot(state,parseImport(JSON.stringify(legacy))).state;assert.equal(state.characters[0].snapshots.at(-1).questHistory.length,3);
});
test('invalid history, GUID mixing and duplicate IDs fail without modifying prior state',()=>{
 const state=addSnapshot(emptyState(),parseImport(saved(payload()))).state,before=structuredClone(state);
 for(const mutate of [p=>p.character.questHistory.push(event(1)),p=>p.character.questHistory[0].characterGuid='Other',p=>p.character.questHistory[0].completedAt='bad',p=>p.character.completedQuestIDs=[-1]]) {
  const p=payload();mutate(p);assert.throws(()=>parseImport(saved(p)));assert.deepEqual(state,before);
 }
 const other=payload();other.character.name='Other';other.character.gameIdentity.guid='Player-2';other.character.questHistory=[];
 const next=addSnapshot(state,parseImport(saved(other))).state;assert.equal(next.characters.length,2);assert.equal(next.characters[1].snapshots[0].questHistory.length,0);
});
