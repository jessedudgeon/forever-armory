export const LOCATIONS=['bags','bank','mail','auction','account-bank','guild-bank'];
const text=(v,n=150)=>typeof v==='string'?v.trim().slice(0,n):'';
export function inventoryItem(o){
 if(!o||!Number.isSafeInteger(o.id)||o.id<1||o.id>100000000||!Number.isSafeInteger(o.count??1)||(o.count??1)<1||(o.count??1)>1000000)throw Error('Invalid inventory item ID or quantity.');
 return {id:o.id,name:text(o.name)||`Item ${o.id}`,count:o.count??1,...(Number.isInteger(o.slot)?{slot:o.slot}:{}),...(Number.isInteger(o.bag)?{bag:o.bag}:{}),link:text(o.link,700)};
}
export function normalizeInventories(o,observedAt){
 const input=o.inventories??(Array.isArray(o.inventory)?[{location:'bags',observedAt,items:o.inventory}]:[]);
 if(!Array.isArray(input)||input.length>12)throw Error('Invalid inventory containers.');
 const seen=new Set();return input.map(s=>{
  if(!LOCATIONS.includes(s.location)||!Array.isArray(s.items)||s.items.length>2500)throw Error('Invalid inventory location or too many items.');
  const scopeId=text(s.scopeId,200),key=s.location+':'+scopeId;
  if(seen.has(key))throw Error('Duplicate inventory location.');seen.add(key);
  if(['account-bank','guild-bank'].includes(s.location)&&!scopeId)throw Error('Shared storage needs a stable scopeId to prevent double counting.');
  return {location:s.location,scopeId,observedAt:new Date(s.observedAt||observedAt).toISOString(),complete:s.complete===true,source:text(s.source,80)||text(o.source,80)||'Imported snapshot',items:s.items.map(inventoryItem)};
 });
}
// Select the newest observation for each storage scope; never sum historical snapshots.
// An absent location is unknown. An explicitly captured empty location clears its older contents.
export function inventoryRows(state,{account='all',character='all',location='all',query=''}={}){
 const scopes=new Map();
 for(const c of state.characters){const latest=c.snapshots.at(-1),accountId=latest.accountId||'default';
  for(const snapshot of c.snapshots){
   const stores=[...(snapshot.inventories||[])];
   if(snapshot.source!=='Manual'&&snapshot.gear?.length)stores.push({location:'equipment',scopeId:'',observedAt:snapshot.observedAt,complete:true,source:snapshot.source,items:snapshot.gear.map(i=>({...i,count:1}))});
   for(const s of stores){const shared=['guild-bank','account-bank'].includes(s.location),key=shared?`${s.location}:${s.scopeId}`:`${c.id}:${s.location}`;
    const existing=scopes.get(key);if(!existing||s.observedAt>=existing.observedAt)scopes.set(key,{...s,characterId:c.id,character:latest.name,accountId,shared});
   }
  }
 }
 const q=query.trim().toLowerCase(),rows=[];
 for(const s of scopes.values()){
  if(account!=='all'&&s.accountId!==account||character!=='all'&&s.characterId!==character||location!=='all'&&s.location!==location)continue;
  for(const i of s.items)if(!q||`${i.id} ${i.name} ${s.character}`.toLowerCase().includes(q))rows.push({...i,location:s.location,scopeId:s.scopeId,characterId:s.characterId,character:s.character,accountId:s.accountId,observedAt:s.observedAt,complete:s.complete,source:s.source,shared:s.shared});
 }
 return rows.sort((a,b)=>a.name.localeCompare(b.name)||a.character.localeCompare(b.character));
}
export function itemTotals(rows){const out=new Map();for(const r of rows){const t=out.get(r.id)||{id:r.id,name:r.name,count:0,locations:[]};t.count+=r.count;t.locations.push(r);out.set(r.id,t);}return [...out.values()];}
