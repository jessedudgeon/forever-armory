// Explicit opt-in projection. Never spread a private snapshot or RP profile here.
export const PUBLIC_POST_TYPES = ['ic','ooc','adventure','journal','profession','progression','screenshot','achievement','loot'];
const text=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error(`Text exceeds ${max} characters.`);return v.trim();};
export function publicCharacter(character,profile) {
  const s=character.snapshots.at(-1),f=profile?.fields||{};
  return {name:text(s.name,150),class:text(s.class,30),race:text(s.race||'',80),faction:text(s.faction||'',30),level:s.level,playStyle:text(s.playStyle||'',40),title:text(f.title||'',120),bio:text(f.atAGlance||'',500),status:text(f.status||'',300)};
}
export function publicPost(type,body) {
  if(!PUBLIC_POST_TYPES.includes(type))throw Error('Choose a supported post type.');
  body=text(body,6000);if(!body)throw Error('Write something before publishing.');return {type,body};
}
export const publicIdValid=id=>typeof id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(id);
// A k-way merge keeps pagination chronological across independent character feeds.
// Each source owns its Firestore cursor; no giant feed document or copied posts.
export function mergedFeed(ids,loadPage) {
  const sources=[...new Set(ids)].map(id=>({id,rows:[],cursor:null,done:false}));
  async function fill(s) {if(!s.rows.length&&!s.done){const page=await loadPage(s.id,s.cursor);s.rows=page.rows;s.cursor=page.cursor;s.done=page.done;}}
  return {async next(limit=20) {
    const before=sources.map(s=>({...s,rows:[...s.rows]}));
    const result=[];
    try {
    const loaded=await Promise.allSettled(sources.map(fill));
    const failed=loaded.find(r=>r.status==='rejected');
    if(failed)throw failed.reason;
    while(result.length<limit) {
      const candidates=sources.filter(s=>s.rows.length).sort((a,b)=>b.rows[0].sortTime-a.rows[0].sortTime||a.rows[0].id.localeCompare(b.rows[0].id));
      if(!candidates.length)break;
      const source=candidates[0];result.push(source.rows.shift());await fill(source);
    }
    return {rows:result,done:sources.every(s=>s.done&&!s.rows.length)};
    } catch(error) { sources.forEach((s,i)=>Object.assign(s,before[i])); throw error; }
  }};
}
