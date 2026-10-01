export const normalized = value => String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
// Providers return the same public rendering contract. No private data is fetched.
export function groupResults(entries,query,limit=100) {
  const tokens=normalized(query).split(/\s+/).filter(Boolean);
  if(normalized(query).length<2)return {groups:[],total:0,shown:0};
  const seen=new Set(),matches=[];
  for(const e of entries){const key=e.type+'|'+e.href+'|'+e.name;if(seen.has(key))continue;seen.add(key);if(tokens.every(t=>normalized(`${e.name} ${e.meta}`).includes(t)))matches.push(e);}
  const groups=new Map();
  for(const e of matches.slice(0,limit)){if(!groups.has(e.type))groups.set(e.type,[]);groups.get(e.type).push(e);}
  return {groups:[...groups],total:matches.length,shown:Math.min(matches.length,limit)};
}
export function publicSearchRows(characters,guilds) {
  return [...characters.map(c=>({type:'Public character',name:c.name,meta:`Level ${c.level} · ${c.race} ${c.class} · ${c.faction}`,href:'#community/'+encodeURIComponent(c.id)})),...guilds.map(g=>({type:'Public guild',name:g.name,meta:`${g.faction} · ${g.recruiting?'Recruiting':'Recruitment closed'}`,href:'#community/guild-'+encodeURIComponent(g.id)}))];
}
