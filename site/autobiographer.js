import {readSavedVariables} from './lua-data.js';
const TYPES=['Battleground','Death','Level','Gathering','Guild','Instance','Item','Kill','Map','Miscellaneous','Money','PvP','Quest','Skill','Spell','Talent','Time','XP','Reputation','Arena','Custom','Statistic'];
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const canonical=v=>JSON.stringify(v,(_,x)=>object(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const rows=v=>Object.values(v||{});
const iso=n=>{if(!Number.isFinite(n)||n<=0||n>8640000000000)throw Error('Invalid AutoBiographer timestamp.');return new Date(n*1000).toISOString();};
const label=(catalog,id,fallback)=>catalog?.[id]?.Name||`${fallback} ${id}`;
function describe(e,c){switch(e.SubType){
  case 0:return `Defeated ${e.BossName||`boss ${e.BossId}`}`;
  case 1:return `First acquired ${label(c.ItemCatalog,e.CatalogItemId,'item')}`;
  case 2:return `First killed ${label(c.UnitCatalog,e.CatalogUnitId,'creature')}`;
  case 3:return `Joined ${e.GuildName}`;case 4:return `Left ${e.GuildName}`;case 5:return `Guild rank changed to ${e.GuildRankName}`;
  case 6:return `Reached level ${e.LevelNum}`;case 7:return e.KillerCuid?`Killed by ${label(c.UnitCatalog,e.KillerCuid,'unit')}`:`Died${e.EnvironmentalType?' — '+e.EnvironmentalType:''}`;
  case 8:return `Turned in ${e.QuestTitle||'quest'}`;case 9:return `${e.SkillName} increased to ${e.SkillLevel}`;
  case 10:return `Learned ${label(c.SpellCatalog,e.SpellId,'spell')}`;
  case 11:return `Discovered ${e.SubZoneName}`;case 12:return `Discovered ${e.ZoneName}`;
  case 13:return `${e.Faction}: reputation ${e.ReputationLevel}`;
  case 14:return 'Joined battleground';case 15:return 'Lost battleground';case 16:return 'Won battleground';
  case 17:return 'Joined arena';case 18:return 'Lost arena';case 19:return 'Won arena';
  case 20:case 21:return e.Text||'Recorded milestone';default:return `Recorded ${TYPES[e.Type]||'event'} (subtype ${e.SubType})`;
}}
// Stable source data plus occurrence index preserves genuinely repeated identical events.
function eventRows(values,kind,describeRow){const counts=new Map();return values.map(raw=>{
  if(!object(raw))throw Error('Invalid AutoBiographer event.');const key=canonical(raw),n=(counts.get(key)||0)+1;counts.set(key,n);
  return {key:kind==='snapshot'?`snapshot:${raw.MilestoneGroup}:${raw.MilestoneId}:${raw.Timestamp}`:`${kind}:${key}:${n}`,at:iso(raw.Timestamp),category:kind==='event'?(TYPES[raw.Type]||'Other'):kind==='gear'?'Equipment':'Snapshot',title:describeRow(raw),raw};
});}
export function parseAutobiographer(source){
  const data=readSavedVariables(source),info=data.AUTOBIOGRAPHER_INFO_CHAR;
  if(!object(info)||!object(data.AUTOBIOGRAPHER_EVENTS_CHAR))throw Error('Choose the per-character SavedVariables/AutoBiographer.lua, not the account-wide file.');
  if(typeof info.PlayerGuid!=='string'||!info.PlayerGuid)throw Error('This file has no character GUID. Log in with AutoBiographer enabled, then log out and try again.');
  const catalogs=data.AUTOBIOGRAPHER_CATALOGS_CHAR||{};
  const events=eventRows(rows(data.AUTOBIOGRAPHER_EVENTS_CHAR),'event',e=>describe(e,catalogs));
  events.push(...eventRows(rows(data.AUTOBIOGRAPHER_GEAR_CHAR?.Changes),'gear',e=>`${e.ItemId===0?'Unequipped':'Equipped item '+e.ItemId} · slot ${e.SlotId}`));
  const milestones=[];
  for(const [group,collection]of Object.entries(data.AUTOBIOGRAPHER_SNAPSHOTS_CHAR||{}))for(const [id,s]of Object.entries(collection||{})){
    if(!['Levels','Raids'].includes(group))continue;
    milestones.push({...s,MilestoneGroup:group,MilestoneId:id});
  }
  events.push(...eventRows(milestones,'snapshot',e=>`${e.MilestoneGroup==='Levels'?'Level '+e.Level:label(catalogs.RaidCatalog,e.MilestoneId,'Raid')} snapshot${e.Incomplete||e.Pending?' (incomplete)':''}`));
  return normalizeAutobiography({guid:info.PlayerGuid,databaseVersion:info.DatabaseVersion??null,events,catalogs,levels:data.AUTOBIOGRAPHER_LEVELS_CHAR||{},info});
}
export function normalizeAutobiography(value){
  if(!object(value)||typeof value.guid!=='string'||!value.guid||value.guid.length>150||!Array.isArray(value.events)||value.events.length>50000)throw Error('Invalid AutoBiographer history.');
  if(JSON.stringify(value).length>2e6)throw Error('AutoBiographer history exceeds the 2 MB supported history limit. No history was saved; keep your original file.');
  const out=structuredClone(value),keys=new Set();
  for(const e of out.events){if(!object(e)||typeof e.key!=='string'||!e.key||keys.has(e.key)||!Number.isFinite(Date.parse(e.at))||typeof e.title!=='string'||typeof e.category!=='string'||!object(e.raw))throw Error('Invalid AutoBiographer history event.');keys.add(e.key);}
  out.events.sort((a,b)=>a.at.localeCompare(b.at)||a.key.localeCompare(b.key));return out;
}
export function characterBiography(character){
  const histories=character.snapshots.map(s=>s.autobiography).filter(Boolean);if(!histories.length)return null;
  const events=new Map();for(const h of histories)for(const e of h.events)events.set(e.key,e);
  return {...histories.at(-1),events:[...events.values()].sort((a,b)=>a.at.localeCompare(b.at)||a.key.localeCompare(b.key))};
}
export function biographySnapshot(character,incoming,importedAt=new Date().toISOString()){
  const base=character.snapshots.at(-1),known=character.snapshots.find(s=>s.gameIdentity?.guid)?.gameIdentity?.guid;
  if(known&&known!==incoming.guid)throw Error('This file belongs to a different character GUID. Select the correct character.');
  const prior=characterBiography(character);if(prior&&prior.guid!==incoming.guid)throw Error('This character already has a different AutoBiographer GUID.');
  const events=new Map((prior?.events||[]).map(e=>[e.key,e]));
  for(const e of incoming.events){
    const old=events.get(e.key);
    // A pre-retry saved file must not remove completed milestone sections.
    if(old && e.category==='Snapshot'){
      const raw={...e.raw};
      for(const field of ['Equipment','Enchants','Talents','Skills','Attributes','MaxHealth','MaxMana','TotalTimePlayed','Money','EquipmentCollectedAt','TalentsCollectedAt','SkillsCollectedAt','StatsCollectedAt'])if(raw[field]==null&&old.raw[field]!=null)raw[field]=old.raw[field];
      if(old.raw.Pending===false)raw.Pending=false;
      events.set(e.key,{...e,raw,title:old.raw.Pending===false?old.title:e.title});
    }else events.set(e.key,e);
  }
  const biography=normalizeAutobiography({...incoming,events:[...events.values()]});
  // History import does not pretend to refresh present-day equipment, money or identity.
  return {...base,gameIdentity:base.gameIdentity||{guid:incoming.guid,realm:base.realm},autobiography:biography,importedAt};
}
