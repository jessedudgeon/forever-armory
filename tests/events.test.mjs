import test from 'node:test';
import assert from 'node:assert/strict';
import {demoState,emptyState,validateBackup,mergeBackup,saveManualCharacter} from '../site/model.js';
import {saveEvent,saveRSVP,setEventStatus,normalizeEvents,removeCharacterEvents,characterEvents,calendarFile,fromLocalInput,toLocalInput} from '../site/event-model.js';
import {recordsFor,stateFromRecords,diffRecords} from '../site/cloud-model.js';
const fields=s=>({title:'Silverpine gathering',type:'rp',hostCharacterId:s.characters[0].id,startsAt:'2026-09-01T18:00:00Z',endsAt:'2026-09-01T20:00:00Z',capacity:2,description:'A quiet evening',location:'Silverpine',guildId:'',instanceId:''});
const fixture=()=>{const s=demoState();return saveEvent(s,fields(s),'test-event');};
const backup=s=>validateBackup({format:'forever-armory-backup',...s});
test('event and character RSVPs round trip through backup and independent cloud records',async()=>{
 let s=fixture();s=saveRSVP(s,'test-event',s.characters[1].id,'going','Healer','Will bring supplies');
 assert.deepEqual(backup(s),s);assert.deepEqual(stateFromRecords((await recordsFor(s)).values()),s);
 const updated=saveRSVP(s,'test-event',s.characters[1].id,'maybe','Healer','May be late');const d=diffRecords(await recordsFor(s),await recordsFor(updated));assert.equal(d.writes.length,1);assert.equal(d.deletes.length,0);
});
test('capacity counts going characters, including host only after RSVP, and failures leave state unchanged',()=>{
 let s=fixture();s=saveEvent(s,{...fields(s),capacity:1},'test-event');s=saveRSVP(s,'test-event',s.characters[1].id,'going');
 const before=structuredClone(s);assert.throws(()=>saveRSVP(s,'test-event',s.characters[0].id,'going'),/full/);assert.deepEqual(s,before);
 s=saveRSVP(s,'test-event',s.characters[0].id,'maybe');assert.equal(s.calendar.rsvps.length,2);
 s=saveRSVP(s,'test-event',s.characters[1].id,'declined');s=saveRSVP(s,'test-event',s.characters[0].id,'going');assert.equal(s.calendar.rsvps.length,2);
});
test('invalid host, participant, date, guild, type, audience and duplicate RSVP fail closed',()=>{
 const s=fixture();for(const change of [{hostCharacterId:'foreign'},{endsAt:'2026-09-01T17:00:00Z'},{startsAt:'2026-09-01T18:00'},{guildId:'foreign'},{type:'invalid'},{capacity:-1},{capacity:1.5}])assert.throws(()=>saveEvent(s,{...fields(s),...change},'test-event'));
 assert.throws(()=>saveRSVP(s,'test-event','foreign','going'),/Invalid/);
 const n=structuredClone(s.calendar);n.events[0].visibility='public';assert.throws(()=>normalizeEvents(n,s.characters,s.guilds),/audience/);
 const withRSVP=saveRSVP(s,'test-event',s.characters[0].id,'going');withRSVP.calendar.rsvps.push(withRSVP.calendar.rsvps[0]);assert.throws(()=>backup(withRSVP),/Duplicate/);
});
test('dungeons and raids use matching instances from the existing shared Journal',()=>{
 const s=fixture();for(const [type,instanceId] of [['raid','onyxias-lair'],['dungeon','ragefire-chasm']])assert.doesNotThrow(()=>saveEvent(s,{...fields(s),type,instanceId},'test-event'));
 assert.throws(()=>saveEvent(s,{...fields(s),type:'dungeon',instanceId:'onyxias-lair'},'test-event'),/matching/);
});
test('closed events reject RSVP and edits; reopen preserves attendees; completion reuses event record',()=>{
 let s=fixture();s=saveRSVP(s,'test-event',s.characters[1].id,'going');s=setEventStatus(s,'test-event','completed');
 assert.equal(characterEvents(s,s.characters[1].id).length,1);assert.equal(characterEvents(s,s.characters[2].id).length,0);
 assert.throws(()=>saveRSVP(s,'test-event',s.characters[0].id,'going'),/closed/);assert.throws(()=>saveEvent(s,fields(s),'test-event'),/Reopen/);
 s=setEventStatus(s,'test-event','scheduled');assert.equal(s.calendar.rsvps.length,1);
 const future=saveEvent(s,{...fields(s),startsAt:'2099-01-01T12:00:00Z',endsAt:'2099-01-01T13:00:00Z'},'test-event');assert.throws(()=>setEventStatus(future,'test-event','completed'),/before/);
});
test('rename and host deletion preserve or clean relationships without orphan RSVPs',async()=>{
 let s=fixture(),old=s.characters[0].id;s=saveRSVP(s,'test-event',old,'going');
 const renamed=saveManualCharacter(s,{mainName:'Asha',secondaryName:'Brightvale',playStyle:'Normal',class:'PALADIN',level:13,faction:'Horde',race:'Forsaken',professions:[]},old);
 assert.equal(renamed.state.calendar.events[0].hostCharacterId,renamed.id);assert.equal(renamed.state.calendar.rsvps[0].characterId,renamed.id);
 assert.deepEqual(stateFromRecords((await recordsFor(renamed.state)).values()),backup(renamed.state));
 removeCharacterEvents(renamed.state,renamed.id);assert.equal(renamed.state.calendar.events.length,0);assert.equal(renamed.state.calendar.rsvps.length,0);
});
test('old backups initialize events and repeat restore is idempotent',()=>{
 const s=fixture(),old=demoState();delete old.calendar;assert.deepEqual(backup(old).calendar,{events:[],rsvps:[]});
 const merged=mergeBackup(emptyState(),s);assert.deepEqual(mergeBackup(merged,s),merged);
});
test('calendar export escapes field injection, folds Unicode at octet boundaries, and uses UTC',()=>{
 const e=fixture().calendar.events[0];e.title='Raid, night; '+ '矿'.repeat(100);e.description='line\rATTENDEE:intruder\nnext';const ics=calendarFile(e);
 assert.match(ics,/DTSTART:20260901T180000Z/);assert.match(ics,/CLASS:PRIVATE/);assert.doesNotMatch(ics,/\r\nATTENDEE:/);assert.ok(ics.includes('Raid\\, night\\;'));
 for(const line of ics.split('\r\n'))assert.ok(new TextEncoder().encode(line).length<=75);
 assert.equal(toLocalInput(fromLocalInput('2026-09-01T18:30')),'2026-09-01T18:30');assert.throws(()=>fromLocalInput('not a date'));
});
