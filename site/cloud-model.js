import {emptyState,keyOf,normalize,validateBackup} from './model.js';
// Records keep snapshots separate so one long-lived character cannot hit a document size limit.
export async function recordsFor(state){
 const records=new Map();
 for(const c of state.characters)for(const snapshot of c.snapshots){
  const payload=JSON.stringify(snapshot);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload));
  const id='s-'+Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  records.set(id,{kind:'snapshot',characterId:c.id,payload});
 }
 for(const task of state.tasks)records.set('t-'+task.id,{kind:'task',characterId:task.characterId,payload:JSON.stringify(task)});
 // Existing Firestore rules accept snapshot/task records. Reserved task identities
 // carry account metadata without changing the deployed security policy.
 for(const account of state.gameAccounts||[])if(account.id!=='default'||account.name!=='WoW 1')records.set('a-'+account.id,{kind:'task',characterId:'@game-account',payload:JSON.stringify(account)});
 if(state.legacy&&(state.legacy.challenges.length||Object.keys(state.legacy.perks).length))records.set('legacy-progress',{kind:'task',characterId:'@legacy-progress',payload:JSON.stringify(state.legacy)});
 return records;
}
export function stateFromRecords(records){
 const out=emptyState(),chars=new Map();
 for(const record of records){
  if(typeof record?.payload!=='string')throw new Error('A cloud record is invalid. Your stored data has not been changed.');
  const payload=JSON.parse(record.payload);
  if(record.kind==='snapshot'){
   const s=normalize(payload),id=keyOf(s);
   if(id!==record.characterId)throw new Error('A character record has an inconsistent identity.');
   if(!chars.has(id))chars.set(id,{id,snapshots:[]});
   chars.get(id).snapshots.push(s);
  }else if(record.kind==='task'&&record.characterId==='@game-account'){
   if(!payload.id||!payload.name)throw new Error('Invalid game account record.');
   if(record.payload&&payload.id==='default')out.gameAccounts[0]=payload;
   else out.gameAccounts.push(payload);
  }else if(record.kind==='task'&&record.characterId==='@legacy-progress'){
   out.legacy=payload;
  }else if(record.kind==='task'){
   if(payload.characterId!==record.characterId)throw new Error('A goal record has an inconsistent identity.');
   out.tasks.push(payload);
  }else throw new Error('Unknown cloud record format.');
 }
 out.characters=[...chars.values()];
 return validateBackup({format:'forever-armory-backup',...out});
}
export function diffRecords(before,after){
 const writes=[],deletes=[];
 for(const[id,data]of after)if(JSON.stringify(before.get(id))!==JSON.stringify(data))writes.push({id,data});
 for(const[id]of before)if(!after.has(id))deletes.push(id);
 // One atomic transaction, including the revision document, avoids partially restored accounts.
 if(writes.length+deletes.length>450)throw new Error('This change affects more than 450 cloud records. Import a smaller backup or remove characters individually. Your cloud data has not changed.');
 let bytes=0;for(const w of writes){const size=new TextEncoder().encode(JSON.stringify(w.data)).length;if(size>180000)throw new Error('One snapshot is too large to sync.');bytes+=size;}
 if(bytes>7000000)throw new Error('This upload is too large for one sync. Use a smaller backup.');
 return {writes,deletes};
}
