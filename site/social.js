import { PROFILE_FIELDS, POST_TYPES, saveProfile, savePost } from './social-model.js';
const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name = c => c.snapshots.at(-1).name;
const stamp = s => new Date(s).toLocaleString();
const options = (values,selected) => Object.entries(values).map(([v,label])=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(label)}</option>`).join('');
export function activityCards(state, characterId='') {
  const posts=(state.social?.posts||[]).filter(p=>!characterId||p.characterId===characterId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return posts.length ? posts.map(p=>{
    const c=state.characters.find(c=>c.id===p.characterId);
    return `<article class="panel social-entry"><div class="detail-meta"><span class="chip social-${esc(p.type)}">${esc(POST_TYPES[p.type])}</span><span class="chip">Private</span></div><h3><a href="#character/${encodeURIComponent(p.characterId)}">${esc(name(c))}</a></h3><p class="social-prose">${esc(p.body)}</p><small>${esc(stamp(p.createdAt))}${p.updatedAt!==p.createdAt?' · Edited':''}</small></article>`;
  }).join('') : '<section class="panel"><h3>Your next chapter starts here</h3><p>Open a character’s RP & story tab to write an IC moment, an OOC note, or an adventure journal entry.</p></section>';
}
export function socialFeed(state) {
  return `<div class="page-heading"><div><span class="eyebrow">CHARACTER STORIES</span><h1>My character activity</h1><p>A private journal across your characters. Entries are not published to other players.</p></div></div><label>Character<select id="social-character-filter"><option value="">All my characters</option>${state.characters.map(c=>`<option value="${esc(c.id)}">${esc(name(c))}</option>`).join('')}</select></label><div id="social-feed">${activityCards(state)}</div>`;
}
export function socialProfile(c,state) {
  const p=state.social?.profiles.find(p=>p.characterId===c.id), f=p?.fields||{};
  const main=state.characters.find(x=>x.id===p?.mainCharacterId);
  const groups=[['Identity',['title','atAGlance','status','lookingFor','occupation','birthplace','residence']],['Appearance & personality',['appearance','personality','preferences']],['Stories & knowledge',['biography','commonKnowledge','rumors']],['Private notes',['secrets']]];
  return `<section class="panel"><span class="eyebrow">RP & STORY · PRIVATE</span><h2>${esc(f.title||name(c))}</h2><p class="social-prose">${esc(f.atAGlance||'Give your character a voice. All fields are optional.')}</p>${main?`<p>Alt of <a href="#character/${encodeURIComponent(main.id)}">${esc(name(main))}</a> · Visible only to you</p>`:''}<p><small>Only you can read this profile and its entries. Public sharing is a separate opt-in step in Character community; guild and relationship sharing are not enabled.</small></p><details><summary>Edit RP profile</summary><form id="rp-form">${groups.map(([label,keys],i)=>`<details ${i===0?'open':''}><summary>${label}</summary>${keys.map(key=>`<label>${PROFILE_FIELDS[key][0]}${PROFILE_FIELDS[key][1]>300?`<textarea name="${key}" maxlength="${PROFILE_FIELDS[key][1]}" rows="4">${esc(f[key])}</textarea>`:`<input name="${key}" maxlength="${PROFILE_FIELDS[key][1]}" value="${esc(f[key])}">`}</label>`).join('')}</details>`).join('')}<label>Main / alt relationship<select name="mainCharacterId"><option value="">Independent / main character</option>${state.characters.filter(x=>x.id!==c.id).map(x=>`<option value="${esc(x.id)}" ${x.id===p?.mainCharacterId?'selected':''}>Alt of ${esc(name(x))}</option>`).join('')}</select></label><p class="error" role="alert" data-social-error></p><button class="primary" type="submit">Save RP profile</button></form></details></section>${groups.map(([label,keys])=>keys.some(k=>f[k])?`<section class="panel"><h2>${label}</h2>${keys.filter(k=>f[k]).map(k=>`<h3>${PROFILE_FIELDS[k][0]}</h3><p class="social-prose">${esc(f[k])}</p>`).join('')}</section>`:'').join('')}<section class="panel"><h2>Write a chapter</h2><form id="character-post-form"><label>Entry type<select name="type">${options(POST_TYPES,'ic')}</select></label><label>Your words<textarea name="body" required maxlength="6000" rows="5" placeholder="What happened on your journey?"></textarea></label><p><small>Saved privately as ${esc(name(c))}. No post is shared with other players.</small></p><p class="error" role="alert" data-social-error></p><button class="primary" type="submit">Save entry</button></form></section><h2>Character journal</h2>${editableEntries(state,c.id)}`;
}
function editableEntries(state,id) {
  return (state.social?.posts||[]).filter(p=>p.characterId===id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(p=>`<article class="panel social-entry"><span class="chip social-${esc(p.type)}">${esc(POST_TYPES[p.type])} · Private</span><p class="social-prose">${esc(p.body)}</p><small>${esc(stamp(p.createdAt))}</small><details><summary>Edit entry</summary><form data-edit-post="${esc(p.id)}"><label>Entry type<select name="type">${options(POST_TYPES,p.type)}</select></label><label>Entry<textarea name="body" required maxlength="6000" rows="5">${esc(p.body)}</textarea></label><p class="error" role="alert" data-social-error></p><button type="submit">Save changes</button></form></details></article>`).join('') || '<p>No entries yet.</p>';
}
export function bindSocial(root,state,characterId,commit,render) {
  root.querySelector('#social-character-filter')?.addEventListener('change',e=>root.querySelector('#social-feed').innerHTML=activityCards(state,e.target.value));
  const bind=(form,build)=>form?.addEventListener('submit',async e=>{
    e.preventDefault(); const button=form.querySelector('button[type="submit"]'); button.disabled=true;
    try { await commit(build(new FormData(form))); render(); }
    catch(error) { form.querySelector('[data-social-error]').textContent=error.message; button.disabled=false; }
  });
  bind(root.querySelector('#rp-form'),data=>saveProfile(state,characterId,Object.fromEntries(Object.keys(PROFILE_FIELDS).map(k=>[k,data.get(k)])),data.get('mainCharacterId')));
  bind(root.querySelector('#character-post-form'),data=>savePost(state,characterId,data.get('type'),data.get('body')));
  root.querySelectorAll('[data-edit-post]').forEach(form=>bind(form,data=>savePost(state,characterId,data.get('type'),data.get('body'),form.dataset.editPost)));
}
