import {escapeHTML as esc} from './navigation.js';
const latest=c=>c.snapshots.at(-1);
const characterLink=(c,tab='profile')=>'#character/'+encodeURIComponent(c.id)+'/'+tab;
const when=value=>value?new Date(value).toLocaleString():'Date not recorded';
const row=(name,href,meta)=>`<div class="dashboard-row"><div><a href="${esc(href)}">${esc(name)}</a><small>${esc(meta)}</small></div></div>`;
export function dashboardView(state,{personal=false,loading=false}={}) {
  const search='<form id="home-search" class="home-search"><label>Search Forever<input name="query" type="search" placeholder="Character, item, dungeon or boss…" required minlength="2"></label><button type="submit">Search</button></form>';
  if(!personal)return `<div class="page-heading"><div><span class="eyebrow">YOUR WORLD. YOUR CHARACTERS.</span><h1>Find your next adventure.</h1><p>Explore WoW Forever references, keep your character’s story, and find your community.</p></div></div>${search}<section class="home-grid">${[
    ['Explore the game','Dungeons, raids, bosses and reference loot.','#game-guide'],['Build your armory','Import a character or start a private record.','#roster'],['Find your people','Discover characters, guilds and their gatherings.','#community/guilds'],['Look up an item','Browse the Classic reference and captured items.','#items'],['Plan your talents','Explore class trees and save a build.','#talents'],['Join the community','Browse public character profiles and stories.','#community'],
  ].map(([name,desc,href])=>`<a class="panel home-card" href="${href}"><h2>${name}</h2><p>${desc}</p><small>Explore →</small></a>`).join('')}</section><p class="note">Classic reference and imported observations are labeled separately. Classic listings do not confirm Forever availability. Community profiles are player-authored.</p>`;
  if(loading)return '<h1>Your Forever</h1><p role="status">Loading your private character collection…</p>';
  const chars=state.characters;
  const imports=chars.flatMap(c=>c.snapshots.filter(s=>s.importedAt).map(s=>({c,s}))).sort((a,b)=>Date.parse(b.s.importedAt)-Date.parse(a.s.importedAt)).slice(0,5);
  const events=(state.calendar?.events||[]).filter(e=>e.status==='scheduled'&&Date.parse(e.startsAt)>=Date.now()).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt)).slice(0,5);
  const recent=[...chars].sort((a,b)=>Date.parse(latest(b).observedAt)-Date.parse(latest(a).observedAt)).slice(0,6);
  return `<div class="page-heading"><div><span class="eyebrow">YOUR FOREVER</span><h1>Welcome to your armory.</h1><p>Your private collection, character invitations and next adventures.</p></div><a class="button" href="#guide">Import character</a></div>${search}<div class="dashboard-grid"><section class="panel"><div class="section-row"><h2>My characters</h2><a href="#roster">View all (${chars.length})</a></div>${recent.map(c=>row(latest(c).name,characterLink(c),`Level ${latest(c).level} · ${latest(c).race} ${latest(c).class}`)).join('')||'<p>No characters yet. <a href="#roster">Add your first character</a> or import a snapshot from the game.</p>'}</section><section class="panel"><h2>Character invitations</h2><div id="dashboard-community" aria-live="polite"><p>Loading community…</p></div><p><a href="#community/guilds">Guilds & invitations →</a></p></section><section class="panel"><h2>Recent imports</h2>${imports.map(({c,s})=>row(s.name,characterLink(c,'progress'),when(s.importedAt))).join('')||'<p>No imported snapshots recorded. <a href="#guide">Get the companion addon</a> to capture your character.</p>'}</section><section class="panel"><h2>Upcoming private plans</h2>${events.map(e=>row(e.title,'#events/'+encodeURIComponent(e.id),when(e.startsAt))).join('')||'<p>No upcoming private events. <a href="#events">Plan a gathering</a> or open your guild for shared events.</p>'}<p><a href="#community/guilds">Find guild events →</a></p></section><section class="panel"><h2>Latest character records</h2>${recent.map(c=>row(latest(c).name,characterLink(c,'progress'),`${when(latest(c).observedAt)} · ${c.snapshots.length} snapshots`)).join('')||'<p>Saved observations and progress history will appear after you add a character.</p>'}</section><section class="panel"><h2>Community & stories</h2><p>Continue through the world as a character.</p><div class="dashboard-list"><a href="#community/feed">Following feed →</a><a href="#community/following">Characters you follow →</a><a href="#activity">Your private character stories →</a><a href="#community/publish">Manage published characters →</a></div></section></div>`;
}
export function bindHome(root,service,account,state) {
  const form=root.querySelector('#home-search');
  if(form)form.onsubmit=e=>{e.preventDefault();location.hash='search/'+encodeURIComponent(new FormData(form).get('query').trim());};
  const target=root.querySelector('#dashboard-community');
  if(!target)return;
  if(!account){target.innerHTML='<p>Sign in and publish a character to receive guild invitations. Local and example characters stay private.</p>';return;}
  let serial=0;
  const load=async()=>{
    const request=++serial;
    target.innerHTML='<p role="status">Loading your character identities…</p>';
    try {
      if(!service)throw Error('Community is still connecting.');
      if(!await service.available()){target.innerHTML='<p>Shared community is currently unavailable.</p>';return;}
      const ownership=await service.owned();
      if(!target.isConnected||request!==serial)return;
      if(!ownership.length){target.innerHTML='<p><a href="#community/publish">Publish a character</a> to receive invitations.</p>';return;}
      const names=new Map((state.characters||[]).map(c=>[c.id,latest(c).name]));
      target.innerHTML=`<label>Invitations for character<select id="dashboard-actor">${ownership.map(o=>`<option value="${esc(o.id)}">${esc(names.get(o.characterKey)||'Published character '+o.id.slice(0,8))}</option>`).join('')}</select></label><div id="dashboard-invites"></div>`;
      const select=target.querySelector('select'),list=target.querySelector('#dashboard-invites');
      let inviteRequest=0;
      const show=async()=>{const token=++inviteRequest;list.innerHTML='<p role="status">Loading invitations…</p>';try{const [page,membership]=await Promise.all([service.guilds.invitations(select.value),service.guilds.membership(select.value)]);if(!list.isConnected||token!==inviteRequest)return;list.innerHTML=page.rows.map(i=>`<p><strong>${esc(i.guildName)}</strong><br><small>Pending invitation · choose this character in Guilds & invitations to review.</small></p>`).join('')||'<p>No pending invitations for this character.</p>';if(!page.done)list.innerHTML+='<p>More invitations are available in Guilds & invitations.</p>';if(membership)list.innerHTML+=`<p><a href="#community/guild-${esc(membership.guildId)}">Open this character’s guild →</a></p>`;}catch(e){if(list.isConnected&&token===inviteRequest){list.innerHTML=`<p role="alert">${esc(e.message)}</p><button data-retry-invites>Retry invitations</button>`;list.querySelector('button').onclick=show;}}};
      select.onchange=show;await show();
    }catch(e){if(target.isConnected&&request===serial){target.innerHTML=`<p role="alert">${esc(e.message)}</p><button data-dashboard-retry>Retry community</button>`;target.querySelector('button').onclick=load;}}
  };
  void load();
}
