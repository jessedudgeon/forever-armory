// Route destinations stay centralized; add future database sections only when useful.
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const esc = escapeHTML;
export const navigation = [
  {name:'Game Guide', key:'game-guide', links:[['Game Guide overview','#game-guide'],['Dungeons & Raids','#pve'],['Dungeons','#pve/dungeons'],['Raids','#pve/raids'],['Items','#items']]},
  {name:'Characters', key:'characters', links:[['My characters','#roster'],['Character & import history','#roster/history'],['Professions & craftbooks','#professions'],['Adventure journal','#journal'],['Legacy system','#legacy']]},
  {name:'Community', key:'community', links:[['Community overview','#community-home'],['Following feed','#community/feed'],['Character directory','#community'],['Guilds & invitations','#community/guilds'],['Following list','#community/following'],['Publish my character','#community/publish']]},
  {name:'Tools', key:'tools', links:[['Tools overview','#tools'],['Talent calculator','#talents'],['Find my items','#storage'],['Import & backups','#guide'],['Private event planner','#events'],['Private character stories','#activity'],['Private guild planner','#guilds']]},
];
export function sectionFor(hash) {
  const route = hash.replace(/^#/, '').split('/')[0];
  if (['roster','character','journal','legacy','professions'].includes(route)) return 'characters';
  if (['game-guide','pve','dungeons','items'].includes(route)) return 'game-guide';
  if (['community','community-home'].includes(route)) return 'community';
  if (['tools','talents','storage','guide','events','activity','guilds'].includes(route)) return 'tools';
  if (route === 'account') return 'account';
  if (route === 'search') return 'search';
  return route === '' || route === 'home' ? 'home' : '';
}
const hubCards = rows => `<section class="home-grid">${rows.map(([name,description,href])=>`<a class="panel home-card" href="${href}"><h2>${esc(name)}</h2><p>${esc(description)}</p><small>Explore →</small></a>`).join('')}</section>`;
export function hubView(section) {
  const hubs = {
    'game-guide': ['Game Guide','Explore sourced Forever content and your character observations.',[
      ['Dungeons & Raids','Find instances, bosses, related quests, reference loot and private encounter tracking.','#pve'],
      ['Items','Look up items and follow their Journal sources. Only sourced Forever drops and your captured items are searchable.','#items'],
    ]],
    tools: ['Tools','Plan builds, organize your collection and bring in observations from the game.',[
      ['Talent calculator','Explore class talent trees and save character builds.','#talents'],
      ['Find my items','Search equipment, bags and captured bank contents across your own characters.','#storage'],
      ['Import & backups','Get ForeverArmory, import a character and manage collection backups.','#guide'],
      ['Private event planner','Plan gatherings with characters in your collection. Shared events live in each community guild.','#events'],
      ['Private guild planner','Organize a private roster and recruitment notes.','#guilds'],
      ['Private character stories','Read and write your collection’s private journal entries.','#activity'],
    ]],
    'community-home': ['Community','Connect through your characters. Public profiles, shared guilds and private plans remain distinct.',[
      ['Following feed','Read recent posts from the characters you follow. Choose a published character to begin.','#community/feed'],
      ['Character directory','Discover published character profiles, stories and posts.','#community'],
      ['Guilds & events','Find guilds, review invitations and open a guild for its roster, posts and shared events.','#community/guilds'],
      ['My published characters','Preview and manage what each character shares publicly.','#community/publish'],
      ['Following list','Manage the characters your selected character follows.','#community/following'],
      ['Private event planner','Keep personal gathering plans separate from shared guild events.','#events'],
    ]],
  };
  const [name,description,rows] = hubs[section];
  return breadcrumbs([[name]])+`<div class="page-heading"><div><h1>${name}</h1><p>${description}</p></div></div>`+hubCards(rows);
}
function links(rows) { return rows.map(([name,href])=>`<a href="${href}">${esc(name)}</a>`).join(''); }
function groups() { return `<a href="#home" data-section="home">Home</a>` + navigation.map(g=>`<details data-section="${g.key}"><summary>${g.name}</summary><div class="nav-popover">${links(g.links)}</div></details>`).join(''); }
export function initializeNavigation() {
  document.querySelector('#desktop-navigation').innerHTML = groups();
  document.querySelector('#mobile-navigation').innerHTML = groups();
  document.querySelector('.skip').onclick=e=>{e.preventDefault();document.querySelector('#main').focus();document.querySelector('#main').scrollIntoView();};
  const drawer = document.querySelector('#navigation-drawer');
  const trigger = document.querySelector('#open-navigation');
  trigger.onclick = () => { drawer.showModal(); trigger.setAttribute('aria-expanded','true'); document.body.classList.add('drawer-open'); };
  document.querySelector('#close-navigation').onclick = () => drawer.close();
  drawer.addEventListener('close', () => { trigger.setAttribute('aria-expanded','false'); document.body.classList.remove('drawer-open'); trigger.focus(); });
  drawer.addEventListener('click', e => { if(e.target === drawer) { const r=drawer.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) drawer.close(); } });
  document.addEventListener('click', e => {
    if(e.target.closest('.site-header a, #navigation-drawer a')) { document.querySelectorAll('.site-header details[open]').forEach(d=>d.open=false); if(drawer.open)drawer.close(); }
    document.querySelectorAll('.site-header details[open]').forEach(d => { if(!d.contains(e.target)) d.open=false; });
  });
  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape')return;
    const menu=e.target.closest('.site-header details[open]');
    if(menu) { menu.open=false; menu.querySelector('summary').focus(); e.preventDefault(); }
  });
  document.querySelectorAll('#desktop-navigation details').forEach(d=>d.addEventListener('toggle',()=>{
    if(d.open)document.querySelectorAll('#desktop-navigation details').forEach(other=>{if(other!==d)other.open=false;});
  }));
  matchMedia('(min-width: 1100px)').addEventListener('change', e=>{if(e.matches&&drawer.open)drawer.close();});
}
export function updateNavigation(hash, account, status) {
  document.querySelectorAll('[data-section]').forEach(el=>{
    const active=el.dataset.section===sectionFor(hash); el.classList.toggle('active-section',active);
    if(el.tagName==='A'&&active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
  });
  document.querySelectorAll('#desktop-navigation .nav-popover a, #mobile-navigation .nav-popover a').forEach(a=>{
    const active=a.getAttribute('href')===hash; if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  const rows=[['My characters','#roster'],['My WoW accounts','#roster/accounts'],['Import character & backups','#guide'],['Character & import history','#roster/history'],['Account settings','#account']];
  const menu=`${account?`<p class="account-identity">Website account<br><strong>${esc(account.name)}</strong></p>`:''}${links(rows)}${account?'<button type="button" data-signout>Sign out</button>':'<a href="#account">Sign in with Google</a>'}`;
  document.querySelector('#account-header').innerHTML=`<details class="account-menu"><summary>${account?'My account':'Account / Sign in'}</summary><div class="nav-popover">${menu}</div></details>`;
  document.querySelector('#mobile-account').innerHTML=`<details><summary>Account</summary><div class="nav-popover">${menu}</div></details>`;
  document.querySelector('#account-status').textContent=status;
}
export function breadcrumbs(rows) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${[['Home','#home'],...rows].map(([name,href],i,all)=>`<li>${href&&i<all.length-1?`<a href="${esc(href)}">${esc(name)}</a>`:`<span aria-current="page">${esc(name)}</span>`}</li>`).join('')}</ol></nav>`;
}
export function sectionNavigation(label, rows) {
  return `<nav class="section-navigation" aria-label="${esc(label)}">${rows.map(([name,id])=>`<button type="button" data-jump="${esc(id)}">${esc(name)}</button>`).join('')}</nav>`;
}

export function bindSectionNavigation(root) {
  if(root.dataset.sectionNavigationBound)return;
  root.dataset.sectionNavigationBound="true";
  root.addEventListener("click", e=>{
    if(e.target.closest('[data-jump]')) {
      const target = document.getElementById(e.target.closest('[data-jump]').dataset.jump);
      if(target) { if(target.tagName === 'DETAILS')target.open = true; target.tabIndex = -1; target.focus({preventScroll:true}); target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
    }
  });
}
