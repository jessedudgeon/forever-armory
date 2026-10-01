import {newId} from './identity.js';
import {profileDetails,followingList} from './profile-ui.js';
import {guildContent} from './guild-ui.js';
import {publicCharacter, PUBLIC_POST_TYPES} from './community-model.js';
import {saveProfile} from './social-model.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options=(rows,selected)=>rows.map(r=>`<option value="${esc(r.id)}" ${r.id===selected?'selected':''}>${esc(r.name)}</option>`).join('');
const time=t=>t?.toDate? t.toDate().toLocaleString():'';
const selectedActors=new Map();
export const communityView=()=>'<div id="community-root" aria-live="polite"><h1>Character community</h1><p>Loading community availability…</p></div>';
export async function bindCommunity(root,service,state,account,routeId,commit,render,notify) {
  if(!root)return;
  const error=e=>{root.innerHTML=`<h1>Character community</h1><p class="error" role="alert">${esc(e.message)}</p><button id="community-retry">Try again</button>`;root.querySelector('#community-retry').onclick=render;};
  if(!service){root.innerHTML='<h1>Character community</h1><p>Connecting to Firebase…</p><button id="community-retry">Retry connection</button>';root.querySelector('#community-retry').onclick=render;return;}
  try {
    if(!await service.available()){root.innerHTML='<h1>Character community</h1><section class="panel"><h2>Shared community is not enabled yet</h2><p>Public profiles, following, posts and reactions are awaiting secure database activation. Your RP profiles, journals and event plans remain private.</p><p><a href="#roster">Open your characters</a> · <a href="#activity">Private stories</a> · <a href="#events">Event planner</a></p></section>';return;}
    const ownership=account?await service.owned():[];
    const owned=await Promise.all(ownership.map(async o=>(await service.profile(o.id))||{id:o.id,name:(state.characters.find(c=>c.id===o.characterKey)?.snapshots.at(-1)?.name||'Character')+' (unpublished)',unpublished:true}));
    let actor=owned.find(c=>c.id===selectedActors.get(account?.uid))?.id||owned[0]?.id||'';
    const chrome=`<div class="page-heading"><div><span class="eyebrow">CHARACTERS & STORIES</span><h1>Character community</h1><p>Player-authored profiles. Names and game achievements are not verified.</p></div></div><div class="actions"><a href="#community">Directory</a><a href="#community/feed">Following feed</a><a href="#community/following">Following list</a><a href="#community/guilds">Guilds & invitations</a><a href="#community/publish">Publish my character</a></div>${owned.length?`<label>Act as character<select id="community-actor">${options(owned,actor)}</select></label>`:'<p>Publish a character to follow others and react to posts.</p>'}<p id="community-error" class="error" role="alert"></p><div id="community-content"></div>`;
    root.innerHTML=chrome;
    const content=root.querySelector('#community-content'),report=e=>{if(root.isConnected)root.querySelector('#community-error').textContent=e.message;else notify?.(e.message);};
    let busy=0;
    const lockActor=delta=>{busy+=delta;content.inert=busy>0;content.setAttribute('aria-busy',String(busy>0));const select=root.querySelector('#community-actor');if(select)select.disabled=busy>0;};
    const act=async(button,fn)=>{button.disabled=true;lockActor(1);try{await fn();}catch(e){report(e);}finally{button.disabled=false;lockActor(-1);}};
    const postList=(rows)=>rows.map(p=>`<article class="panel social-entry" data-public-post="${esc(p.id)}" data-author="${esc(p.authorId)}"><span class="chip">${esc(p.type.toUpperCase())} · Public</span><h3><a href="#community/${esc(p.authorId)}">${esc(p.authorName)}</a></h3><p class="social-prose">${esc(p.body)}</p><small>${esc(time(p.createdAt))}</small>${actor?'<p><button data-appreciate>Appreciate</button></p>':''}${ownership.some(o=>o.id===p.authorId)?`<details><summary>Edit my post</summary><form data-edit-public><label>Post type<select name="type">${PUBLIC_POST_TYPES.map(t=>`<option ${t===p.type?'selected':''}>${t}</option>`).join('')}</select></label><label>Content<textarea name="body" required maxlength="6000">${esc(p.body)}</textarea></label><button type="submit">Save public changes</button></form></details>`:''}</article>`).join('');
    const bindPosts=async()=>{
      for(const card of content.querySelectorAll('[data-public-post]')){
        const author=card.dataset.author,id=card.dataset.publicPost,button=card.querySelector('[data-appreciate]');
        if(button){let reacted=await service.reactions(author,id,actor);button.textContent=reacted?'Remove appreciation':'Appreciate';button.onclick=()=>act(button,async()=>{await service.react(author,id,actor,!reacted);reacted=!reacted;button.textContent=reacted?'Remove appreciation':'Appreciate';});}
        const edit=card.querySelector('[data-edit-public]');if(edit)edit.onsubmit=e=>{e.preventDefault();const f=new FormData(edit);void act(edit.querySelector('button'),async()=>{await service.post(author,f.get('type'),f.get('body'),id);await show();});};
      }
    };
    async function feed(ids){
      const reader=service.feed(ids);content.insertAdjacentHTML('beforeend','<div id="community-posts"></div><button id="community-more">Load more posts</button>');
      const more=content.querySelector('#community-more'),target=content.querySelector('#community-posts');
      const page=async()=>{const p=await reader.next();target.insertAdjacentHTML('beforeend',postList(p.rows));if(!target.children.length)target.innerHTML='<p>No public posts yet.</p>';more.hidden=p.done;await bindPosts();};
      more.onclick=()=>act(more,page);await act(more,page);
    }
    async function show(){lockActor(1);try{await renderContent();}finally{lockActor(-1);}}
    async function renderContent(){
      content.innerHTML='<p>Loading…</p>';root.querySelector('#community-error').textContent='';
      if(routeId==='guilds'||routeId?.startsWith('guild-')) { await guildContent({content,service,actor,owned,routeId,act,show});return; }
      if(routeId==='publish') {
        if(!account){content.innerHTML='<p><a href="#account">Sign in with Google</a> to publish a character.</p>';return;}
        if(!state.characters.length){content.innerHTML='<p><a href="#roster">Add a character</a> first.</p>';return;}
        content.innerHTML=`<section class="panel"><h2>Choose what becomes public</h2><label>Your character<select id="publish-character">${options(state.characters.map(c=>({id:c.id,name:c.snapshots.at(-1).name})))}</select></label><div id="projection-preview"></div><p>Your Google identity, game account, alts, secrets, inventory and private journals are excluded. Public posts are authored separately.</p><label><input type="checkbox" id="publish-consent"> I want these displayed fields publicly visible.</label><p><button id="publish-character-button">Publish / update profile</button></p></section><section class="panel"><h2>My published characters</h2>${owned.filter(p=>!p.unpublished).map(p=>`<p><a href="#community/${p.id}">${esc(p.name)}</a> <button data-unpublish="${p.id}">Unpublish</button></p>`).join('')||'<p>None yet.</p>'}<p><small>Unpublishing hides the profile and its posts. The stable identity and posts are retained; publishing the same character again restores their visibility.</small></p></section>`;
        const select=content.querySelector('#publish-character'),preview=()=>{const c=state.characters.find(c=>c.id===select.value),p=state.social.profiles.find(p=>p.characterId===c.id),projection=publicCharacter(c,p);content.querySelector('#projection-preview').innerHTML=`<dl>${Object.entries(projection).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v||'—')}</dd>`).join('')}</dl>`;content.querySelector('#publish-consent').checked=false;};select.onchange=preview;preview();
        const button=content.querySelector('#publish-character-button');button.onclick=()=>act(button,async()=>{if(!content.querySelector('#publish-consent').checked)throw Error('Review the fields and confirm public visibility first.');const c=state.characters.find(c=>c.id===select.value),old=state.social.profiles.find(p=>p.characterId===c.id);const next=saveProfile(state,c.id,old?.fields||{},old?.mainCharacterId||'');const p=next.social.profiles.find(p=>p.characterId===c.id);p.publicId ||= newId();await commit(next);await service.publish(p.publicId,c,p);location.hash='community/'+p.publicId;render();});
        content.querySelectorAll('[data-unpublish]').forEach(b=>b.onclick=()=>act(b,async()=>{await service.unpublish(b.dataset.unpublish);render();}));return;
      }
      if(routeId==='following'){await followingList({content,service,actor,act});return;}
      if(routeId==='feed'){
        if(!actor){content.innerHTML='<p>Publish a character first to build a following feed.</p>';return;}
        const follows=await service.following(actor);content.innerHTML=`<h2>Following as ${esc(owned.find(p=>p.id===actor)?.name)}</h2><p>Your posts and up to 20 followed characters, in chronological order. Following uses your character identity, never your Google account.</p><p>${follows.length} follows loaded.</p>`;await feed([actor,...follows]);return;
      }
      if(routeId){
        const profile=await service.profile(routeId);if(!profile){content.innerHTML='<h2>Character unavailable</h2><p>This profile may have been unpublished.</p>';return;}
        content.innerHTML=`<section class="panel"><span class="eyebrow">${esc(profile.faction)} · ${esc(profile.playStyle)}</span><h2>${esc(profile.name)}</h2><p>Level ${profile.level} ${esc(profile.race)} ${esc(profile.class)}</p><h3>${esc(profile.title)}</h3><p class="social-prose">${esc(profile.bio)}</p><p>${esc(profile.status)}</p>${actor&&actor!==routeId?'<button id="community-follow">Follow</button>':''}</section>`;
        await profileDetails({content,service,profile,isOwner:ownership.some(o=>o.id===routeId),act,show});
        const follow=content.querySelector('#community-follow');if(follow){let on=await service.isFollowing(actor,routeId);follow.textContent=on?'Unfollow':'Follow';follow.title='Following makes your character identity visible to this profile’s visitors.';follow.onclick=()=>act(follow,async()=>{await service.follow(actor,routeId,!on);on=!on;follow.textContent=on?'Unfollow':'Follow';});}
        if(ownership.some(o=>o.id===routeId)){content.insertAdjacentHTML('beforeend','<section class="panel"><h2>Post publicly as this character</h2><form id="public-post-form"><label>Post type<select name="type">'+PUBLIC_POST_TYPES.map(t=>`<option>${t}</option>`).join('')+'</select></label><label>Content<textarea name="body" required maxlength="6000" rows="5"></textarea></label><p>This post will be readable by everyone.</p><button type="submit">Publish public post</button></form></section>');const form=content.querySelector('#public-post-form');form.onsubmit=e=>{e.preventDefault();const f=new FormData(form);void act(form.querySelector('button'),async()=>{await service.post(routeId,f.get('type'),f.get('body'));await show();});};}await feed([routeId]);return;
      }
      content.innerHTML='<h2>Public character directory</h2><div id="community-directory" class="home-grid"></div><button id="directory-more">Load more characters</button>';
      let cursor=null;const more=content.querySelector('#directory-more'),list=content.querySelector('#community-directory');const page=async()=>{const p=await service.directory(cursor);cursor=p.cursor;list.insertAdjacentHTML('beforeend',p.rows.map(c=>`<a class="panel home-card" href="#community/${c.id}"><h3>${esc(c.name)}</h3><p>Level ${c.level} ${esc(c.race)} ${esc(c.class)}</p><p>${esc(c.bio)}</p></a>`).join(''));if(!list.children.length)list.innerHTML='<p>No characters have opted in yet.</p>';more.hidden=p.done;};more.onclick=()=>act(more,page);await act(more,page);
    }
    root.querySelector('#community-actor')?.addEventListener('change',async e=>{actor=e.target.value;selectedActors.set(account?.uid,actor);try{await show();}catch(e){report(e);}});
    await show();
  }catch(e){error(e);}
}
