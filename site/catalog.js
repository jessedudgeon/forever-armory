import {DUNGEONS} from './dungeons.js';
import {CLASSES_BY_FACTION_RACE} from './character-options.js';
import {inventoryRows} from './inventory.js';
export const TALENT_SOURCE='https://github.com/Deradon/wow-forever-talent-calc/tree/0bc85aa239c2dfca79345986db07b57ccd7aaa9b';
export function buildCatalog(talents,state={characters:[]}){
 const rows=[];
 for(const d of DUNGEONS){rows.push({key:'dungeon:'+d.id,type:'dungeon',name:d.name,description:`${d.zone} · Level ${d.level}`,status:d.new?'Unverified directory':'Classic reference',source:d.source||'',route:'#dungeons/'+d.id});
  for(const [boss,loot]of d.bosses){rows.push({key:'boss:'+d.id+':'+boss,type:'boss',name:boss,description:d.name,status:'Classic reference',source:d.source,route:'#dungeons/'+d.id});
   for(const item of loot)rows.push({key:'item:'+item.id,type:'item',id:item.id,name:item.name,description:`Classic reference drop: ${boss} · ${d.name}`,status:'Classic reference',source:d.source,route:'#database/item:'+item.id});
  }
 }
 for(const d of talents)for(const tree of d.trees)for(const t of tree.talents)rows.push({key:`talent:${d.class}:${tree.id}:${t.id}`,type:'talent',name:t.name,description:`${d.className} / ${tree.name}: ${t.description}`,status:'Community beta · unverified',source:TALENT_SOURCE,route:'#talents/'+d.class,details:{maxRank:t.maxRank,ranks:t.ranks,rankSource:t.ranksSource,notes:t.ranksNote}});
 for(const [faction,races]of Object.entries(CLASSES_BY_FACTION_RACE))for(const [name,classes]of Object.entries(races))rows.push({key:`race:${faction}:${name}`,type:'race',name,description:`${faction} · ${classes.join(', ')}`,status:'Existing site data · unverified',source:''});
 for(const i of inventoryRows(state))rows.push({key:'owned:'+i.id,type:'item',id:i.id,name:i.name,description:`Privately observed in ${i.location}; item ownership does not verify a loot source.`,status:'Personal import',source:'',private:true,observedAt:i.observedAt});
 for(const c of state.characters){const s=c.snapshots.at(-1);for(const type of ['spell','quest'])for(const x of s[type+'s']||[])rows.push({key:`${type}:${x.id}`,type,id:x.id,name:x.name,description:x.description,status:'Personal import',private:true,observedAt:s.observedAt,source:''});}
 const dedup=new Map();for(const row of rows){const old=dedup.get(row.key);if(old&&!old.description.includes(row.description))old.description+='; '+row.description;else if(!old)dedup.set(row.key,row);}return [...dedup.values()];
}
export function searchCatalog(rows,q='',type='all'){q=q.toLowerCase().trim();return rows.filter(r=>(type==='all'||r.type===type)&&(!q||`${r.name} ${r.id||''} ${r.description}`.toLowerCase().includes(q)));}
