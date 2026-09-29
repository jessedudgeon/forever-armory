import {readFile} from 'node:fs/promises';
import {test,before,after} from 'node:test';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,collection,getDoc,getDocs,setDoc,deleteDoc,serverTimestamp,runTransaction} from 'firebase/firestore';
let env,alice,bob,guest,nonGoogle;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-forever-armory',firestore:{rules:await readFile('firestore.rules','utf8')}});alice=env.authenticatedContext('alice',{firebase:{sign_in_provider:'google.com'}}).firestore();bob=env.authenticatedContext('bob',{firebase:{sign_in_provider:'google.com'}}).firestore();guest=env.unauthenticatedContext().firestore();nonGoogle=env.authenticatedContext('alice',{firebase:{sign_in_provider:'password'}}).firestore();});
after(async()=>{await env?.cleanup();});
const record={kind:'snapshot',characterId:'["hero","realm"]',payload:'{"name":"Hero"}'};
test('Google owner can create/read a private armory and snapshot',async()=>{await assertSucceeds(setDoc(doc(alice,'armories/alice'),{version:1,revision:1,updatedAt:serverTimestamp()}));await assertSucceeds(setDoc(doc(alice,'armories/alice/records/s-test'),record));await assertSucceeds(getDoc(doc(alice,'armories/alice')));await assertSucceeds(getDocs(collection(alice,'armories/alice/records')));});
test('another Google user cannot read, list, write or delete someone else’s records',async()=>{await assertFails(getDoc(doc(bob,'armories/alice')));await assertFails(getDocs(collection(bob,'armories/alice/records')));await assertFails(setDoc(doc(bob,'armories/alice/records/s-test'),record));await assertFails(deleteDoc(doc(bob,'armories/alice/records/s-test')));});
test('signed-out and non-Google clients cannot access an armory',async()=>{for(const db of [guest,nonGoogle]){await assertFails(getDoc(doc(db,'armories/alice')));await assertFails(setDoc(doc(db,'armories/alice/records/s-test'),record));}});
test('users cannot enumerate accounts or write outside their armory',async()=>{await assertFails(getDocs(collection(alice,'armories')));await assertFails(setDoc(doc(alice,'public/anything'),record));});
test('revision is advanced atomically, stale revision and invalid payload are denied',async()=>{await assertSucceeds(runTransaction(alice,async tx=>{const ref=doc(alice,'armories/alice');const root=await tx.get(ref);tx.set(ref,{version:1,revision:root.data().revision+1,updatedAt:serverTimestamp()});tx.set(doc(alice,'armories/alice/records/t-goal'),{...record,kind:'task'});}));await assertFails(setDoc(doc(alice,'armories/alice'),{version:1,revision:2,updatedAt:serverTimestamp()}));await assertFails(setDoc(doc(alice,'armories/alice/records/bad'),{...record,unexpected:'field'}));await assertFails(setDoc(doc(alice,'armories/alice/records/bad'),{...record,payload:'x'.repeat(180001)}));});
test('account and guild envelopes remain private and cannot grant public access',async()=>{
 for(const [id,characterId,payload] of [['a-second','@game-account',{id:'second',name:'WoW 2',legacyStatus:'Notes'}],['g-test','@guild',{id:'test',name:'Guild',officers:['bob'],public:true}]]){
  const path='armories/alice/records/'+id;
  await assertSucceeds(setDoc(doc(alice,path),{kind:'task',characterId,payload:JSON.stringify(payload)}));
  for(const db of [bob,guest]){await assertFails(getDoc(doc(db,path)));await assertFails(setDoc(doc(db,path),{kind:'task',characterId,payload:'{}'}));}
 }
});
test('large snapshot fragments save atomically under existing rules and remain owner-only',async()=>{
 const {recordsFor,stateFromRecords}=await import('../../site/cloud-model.js');
 const {emptyState,normalize,addSnapshot}=await import('../../site/model.js');
 const state=addSnapshot(emptyState(),normalize({name:'Big Bags',playStyle:'Normal',class:'MAGE',level:60,inventory:Array.from({length:2000},(_,slot)=>({id:2770,name:'Ore',quantity:20,slot,location:'bank'}))})).state;
 const records=await recordsFor(state),owner=env.authenticatedContext('large-owner',{firebase:{sign_in_provider:'google.com'}}).firestore();
 await assertSucceeds(runTransaction(owner,async tx=>{tx.set(doc(owner,'armories/large-owner'),{version:1,revision:1,updatedAt:serverTimestamp()});for(const[id,data]of records)tx.set(doc(owner,'armories/large-owner/records/'+id),data);}));
 const actual=await getDocs(collection(owner,'armories/large-owner/records'));
 const restored=stateFromRecords(actual.docs.map(d=>d.data()));
 if(restored.characters[0].snapshots[0].inventory.length!==2000)throw Error('Incomplete inventory');
 const part=[...records.keys()].find(id=>id.startsWith('p-'));
 for(const db of[bob,guest]){await assertFails(getDoc(doc(db,'armories/large-owner/records/'+part)));await assertFails(deleteDoc(doc(db,'armories/large-owner/records/'+part)));}
});
test('RP profiles and character posts never expose private fields or grant another character owner access',async()=>{
 for(const [id,characterId] of [['rp-test','@rp-profile'],['post-test','@character-post']]) {
  const path='armories/alice/records/'+id;
  const data={kind:'task',characterId,payload:JSON.stringify({characterId:'bob-character',visibility:'public',fields:{secrets:'Private'}})};
  await assertSucceeds(setDoc(doc(alice,path),data));
  for(const db of [bob,guest,nonGoogle]) {
   await assertFails(getDoc(doc(db,path)));await assertFails(setDoc(doc(db,path),data));await assertFails(deleteDoc(doc(db,path)));
  }
 }
});
test('event and RSVP records persist for Google owner and cannot be read or edited cross-account',async()=>{
 const {demoState}=await import('../../site/model.js');
 const {saveEvent,saveRSVP}=await import('../../site/event-model.js');
 const {recordsFor,stateFromRecords}=await import('../../site/cloud-model.js');
 let state=demoState();state=saveEvent(state,{title:'Guild night',type:'social',hostCharacterId:state.characters[0].id,startsAt:'2026-09-01T18:00:00Z',endsAt:'2026-09-01T20:00:00Z',capacity:5},'guild-night');
 state=saveRSVP(state,'guild-night',state.characters[1].id,'going','Healer');
 const owner=env.authenticatedContext('events-owner',{firebase:{sign_in_provider:'google.com'}}).firestore(),records=await recordsFor(state);
 await assertSucceeds(runTransaction(owner,async tx=>{tx.set(doc(owner,'armories/events-owner'),{version:1,revision:1,updatedAt:serverTimestamp()});for(const[id,data]of records)tx.set(doc(owner,'armories/events-owner/records/'+id),data);}));
 const stored=await getDocs(collection(owner,'armories/events-owner/records')),restored=stateFromRecords(stored.docs.map(d=>d.data()));
 if(restored.calendar.rsvps[0].role!=='Healer'||restored.calendar.events[0].title!=='Guild night')throw Error('Event persistence failed');
 for(const [id,data]of records)if(id.startsWith('event-')||id.startsWith('rsvp-'))for(const db of[bob,guest,nonGoogle]){const path='armories/events-owner/records/'+id;await assertFails(getDoc(doc(db,path)));await assertFails(setDoc(doc(db,path),data));await assertFails(deleteDoc(doc(db,path)));}
});
test('raw addon observations, stable identity, quests and inventory remain private through actual Firestore storage',async()=>{
 const {parseImport,addSnapshot,emptyState}=await import('../../site/model.js');
 const {recordsFor,stateFromRecords}=await import('../../site/cloud-model.js');
 const raw={format:'forever-armory',version:1,character:{name:'Importer Test',realm:'Classic Beta PvE',class:'PALADIN',level:15,observedAt:'2026-09-29T21:22:36Z',gameIdentity:{guid:'Player-TEST-PRIVATE',realm:'Classic Beta PvE'},bags:[{id:2840,count:33,bag:0,slot:1,link:'[Copper Bar]'}],quests:[{id:1,title:'Test quest'}],talents:[{name:'Test talent',rank:1,nodeID:2}]}};
 const state=addSnapshot(emptyState(),parseImport(JSON.stringify(raw))).state,records=await recordsFor(state),owner=env.authenticatedContext('import-owner',{firebase:{sign_in_provider:'google.com'}}).firestore();
 for(const[id,data]of records){const path='armories/import-owner/records/'+id;await assertSucceeds(setDoc(doc(owner,path),data));for(const db of[bob,guest]){await assertFails(getDoc(doc(db,path)));await assertFails(setDoc(doc(db,path),data));}}
 const stored=await getDocs(collection(owner,'armories/import-owner/records')),snapshot=stateFromRecords(stored.docs.map(d=>d.data())).characters[0].snapshots[0];
 if(snapshot.inventory[0].quantity!==33||snapshot.talentDetails[0].nodeID!==2||snapshot.rawAddon.character.gameIdentity.guid!=='Player-TEST-PRIVATE')throw Error('Import data was lost');
});
