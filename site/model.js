export const newId=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,"0")).join("");
export const CLASSES={WARRIOR:['Warrior','#cba57f'],PALADIN:['Paladin','#e8a6c6'],HUNTER:['Hunter','#b5d28f'],ROGUE:['Rogue','#e6d37c'],PRIEST:['Priest','#e5e4da'],SHAMAN:['Shaman','#80b4e6'],MAGE:['Mage','#8ccee3'],WARLOCK:['Warlock','#b9a1e1'],DRUID:['Druid','#e6ad79']};
export const PLAY_STYLES=['Normal','PvP','Roleplaying','Hardcore'];
export function playStyleOf(c){const value=String(c.playStyle||c.realm||'').trim();return ({normal:'Normal',pve:'Normal',pvp:'PvP',roleplaying:'Roleplaying',rp:'Roleplaying',hardcore:'Hardcore'})[value.toLowerCase()]||'';}
export const playStyleLabel=c=>playStyleOf(c)||'Play style not recorded';
export const SLOTS=['','Head','Neck','Shoulders','Shirt','Chest','Waist','Legs','Feet','Wrists','Hands','Ring 1','Ring 2','Trinket 1','Trinket 2','Back','Main hand','Off hand','Ranged','Tabard'];
const str=(v,max=200)=>typeof v==='string'?v.trim().slice(0,max):'';
function num(v,min,max,optional=false){if(v==null&&optional)return null;if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error('A numeric field is missing or out of range.');return v;}
export const keyOf=c=>JSON.stringify([c.name.toLowerCase(),c.realm.toLowerCase()]);
export function normalize(o){
 if(!o||typeof o!=='object'||Array.isArray(o))throw new Error('Expected one character object.');
 const mainName=str(o.mainName,48),secondaryName=str(o.secondaryName,48);
 const name=mainName&&secondaryName?`${mainName} ${secondaryName}`:str(o.name,100),playStyle=playStyleOf(o),realm=str(o.realm,100)||playStyle,cls=str(o.class,24).toUpperCase();
 if(!name||!realm)throw new Error('Character name and play style are missing from this record.');
 if(!CLASSES[cls])throw new Error('Choose a supported Forever class.');
 const bounded=(v,n)=>{if(v==null)return [];if(!Array.isArray(v)||v.length>n)throw new Error('An imported list is invalid or too large.');return v;};
 const prof=bounded(o.professions,20).map(p=>typeof p==='string'?{name:str(p,60),rank:null,max:null}:{name:str(p?.name,60),rank:num(p?.rank,0,10000,true),max:num(p?.max,0,10000,true)}).filter(p=>p.name);
 const gear=bounded(o.gear,30).map(g=>({slot:num(g.slot,1,19),id:num(g.id,1,100000000),name:str(g.name,150)||`Item ${g.id}`,quality:num(g.quality,0,8,true),link:str(g.link,700)}));
 if(new Set(gear.map(g=>g.slot)).size!==gear.length)throw new Error('Duplicate equipment slots in this export.');
 const talents=bounded(o.talents,300).map(t=>typeof t==='string'?str(t,120):`${str(t?.name,100)}${t?.rank!=null?' · '+num(t.rank,0,100):''}`).filter(Boolean);
 const observedAt=o.observedAt?new Date(o.observedAt).toISOString():new Date().toISOString();
 return {name,realm,...(mainName?{mainName}:{}),...(secondaryName?{secondaryName}:{}),...(playStyle?{playStyle}:{}),class:cls,race:str(o.race,40),faction:str(o.faction,20),level:num(o.level,1,100),xp:num(o.xp,0,1e10,true),xpMax:num(o.xpMax,0,1e10,true),money:num(o.money,0,1e14,true),zone:str(o.zone,100),professions:prof,gear,talents,observedAt,source:str(o.source,40)||'Manual',warnings:bounded(o.warnings,30).map(x=>str(x,200))};
}
export function parseImport(text){
 if(typeof text!=='string'||text.length>1e6)throw new Error('Use an export smaller than 1 MB.');
 text=text.trim();
 if(text.startsWith('WFB1;')){
  const p=Object.fromEntries(text.split(';').slice(1).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)];}));
  return normalize({name:p.n,realm:p.r,class:p.c,race:p.ra,faction:p.f,level:Number(p.l),professions:p.p?p.p.split(','):[],talents:p.t?[`Talent trees: ${p.t}`]:[],source:'WoW Forever Builds',warnings:['This export contains basic character data only; equipment, XP, and gold are unavailable.']});
 }
 let o;try{o=JSON.parse(text);}catch{throw new Error('Paste a Forever Armory JSON export or a WFB1 export from /wfb.');}
 if(o.format==='forever-armory-backup')throw new Error('This is a backup. Use Restore backup on the Import & backups page.');
 if(o.format!=='forever-armory'||o.version!==1)throw new Error('Unsupported export. Use /farmory in the included addon, /wfb, or add a character manually.');
 return normalize({...o.character,source:'Forever Armory addon'});
}
export const emptyState=()=>({version:1,characters:[],tasks:[]});
export function addSnapshot(state,c){
 const id=keyOf(c);const copy=structuredClone(state);let found=copy.characters.find(x=>x.id===id);
 if(!found){found={id,snapshots:[]};copy.characters.push(found);}
 const last=found.snapshots.at(-1);const meaningful=x=>JSON.stringify({...x,observedAt:undefined});
 if(last&&meaningful(last)===meaningful(c))return {state,duplicate:true,id};
 found.snapshots.push(c);found.snapshots.sort((a,b)=>a.observedAt.localeCompare(b.observedAt));return {state:copy,duplicate:false,id};
}
export function validateBackup(o){
 if(o?.format!=='forever-armory-backup'||o.version!==1||!Array.isArray(o.characters)||!Array.isArray(o.tasks))throw new Error('Not a supported Forever Armory backup.');
 if(o.characters.length>500||o.tasks.length>10000)throw new Error('Backup is too large.');
 const characters=o.characters.map(c=>{if(!Array.isArray(c.snapshots)||!c.snapshots.length||c.snapshots.length>10000)throw new Error('Invalid snapshot history.');const snapshots=c.snapshots.map(normalize).sort((a,b)=>a.observedAt.localeCompare(b.observedAt));const id=keyOf(snapshots[0]);if(snapshots.some(s=>keyOf(s)!==id))throw new Error('Mismatched character history.');return {id,snapshots};});
 if(new Set(characters.map(c=>c.id)).size!==characters.length)throw new Error('Duplicate character in backup.');
 const ids=new Set(characters.map(c=>c.id));
 const tasks=o.tasks.map(t=>{if(!ids.has(t.characterId)||!str(t.title,200)||!str(t.id,100))throw new Error('Invalid journal entry.');return {id:str(t.id,100),characterId:t.characterId,title:str(t.title,200),category:['Zone','Dungeon','Gear','Profession','Other'].includes(t.category)?t.category:'Other',notes:str(t.notes,2000),done:t.done===true};});
 if(new Set(tasks.map(t=>t.id)).size!==tasks.length)throw new Error('Duplicate journal entry.');
 return {version:1,characters,tasks};
}
export function mergeBackup(current,incoming){let out=structuredClone(current);for(const c of incoming.characters)for(const s of c.snapshots){const existing=out.characters.find(x=>x.id===c.id);if(!existing?.snapshots.some(x=>JSON.stringify(x)===JSON.stringify(s)))out=addSnapshot(out,s).state;}for(const t of incoming.tasks){const existing=out.tasks.find(x=>x.id===t.id);if(!existing)out.tasks.push(t);else if(JSON.stringify(existing)!==JSON.stringify(t))out.tasks.push({...t,id:newId()});}return out;}
export function demoState(){let state=emptyState();const start=new Date();start.setDate(start.getDate()-6);const dates=[start.toISOString(),new Date().toISOString()];for(const [i,name,cls,race,level,zone,prof] of [[0,'Ashwarden','PALADIN','Undead',18,'Silverpine Forest','Mining'],[1,'Duskmere','PRIEST','Undead',12,'Tirisfal Glades','Tailoring'],[2,'Bramblehorn','DRUID','Tauren',9,'Mulgore','Herbalism']]){for(let d=0;d<2;d++)state=addSnapshot(state,normalize({name,class:cls,realm:'Example Realm',race,faction:'Horde',level:level-(d?0:3),zone,professions:[{name:prof,rank:45+i*5,max:75}],money:13245+i*7500,xp:3500,xpMax:10000,observedAt:dates[d],source:'Demo',gear:[{slot:5,id:1,name:'Example adventurer’s armor',quality:2}],talents:['Example talent allocation']})).state;}
 state.tasks=[{id:'demo-1',characterId:state.characters[0].id,title:'Prepare for the next dungeon',category:'Dungeon',notes:'Gather quests, empty bags, and bring food and water.',done:false},{id:'demo-2',characterId:state.characters[0].id,title:'Pick up the next flight path',category:'Zone',notes:'An example goal. Replace with your own route.',done:false}];return state;}

// Explicit manual correction rekeys every snapshot and goal together; no silent merging.
export function saveManualCharacter(state,fields,existingId){
 const mainName=str(fields.mainName,48),secondaryName=str(fields.secondaryName,48),playStyle=playStyleOf({playStyle:fields.playStyle});
 if(!mainName||!secondaryName)throw new Error('Enter both the main name and secondary name.');
 if(/\s/.test(mainName)||/\s/.test(secondaryName))throw new Error('Enter one name in each name field, without spaces.');
 if(!playStyle)throw new Error('Choose a play style.');
 if(!Number.isInteger(Number(fields.level))||Number(fields.level)<1||Number(fields.level)>60)throw new Error('Enter a whole-number level from 1 to 60.');
 const next=structuredClone(state),existing=existingId?next.characters.find(c=>c.id===existingId):null;
 if(existingId&&!existing)throw new Error('This character is no longer available. Refresh and try again.');
 const prior=existing?.snapshots.at(-1),identity={mainName,secondaryName,name:mainName+' '+secondaryName,playStyle,realm:playStyle};
 const snapshot=normalize({...prior,...fields,...identity,level:Number(fields.level),xp:null,xpMax:null,observedAt:new Date().toISOString(),source:'Manual',warnings:prior?['Equipment, talents, and gold are carried forward from the prior snapshot; they were not refreshed by this manual update.']:[]});
 const id=keyOf(snapshot);
 if(next.characters.some(c=>c.id===id&&c.id!==existingId))throw new Error('A character with this full name and play style already exists. Open that profile to update it.');
 if(existing){existing.id=id;existing.snapshots=existing.snapshots.map(s=>({...s,...identity}));next.tasks=next.tasks.map(t=>t.characterId===existingId?{...t,characterId:id}:t);}
 return addSnapshot(next,snapshot);
}
