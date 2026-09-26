const CLASS_ICONS={
 DRUID:'./assets/icons/classicon_druid.jpg',
 HUNTER:'./assets/icons/classicon_hunter.jpg',
 MAGE:'./assets/icons/classicon_mage.jpg',
 PALADIN:'./assets/icons/classicon_paladin.jpg',
 PRIEST:'./assets/icons/classicon_priest.jpg',
 ROGUE:'./assets/icons/classicon_rogue.jpg',
 SHAMAN:'./assets/icons/classicon_shaman.jpg',
 WARLOCK:'./assets/icons/classicon_warlock.jpg',
 WARRIOR:'./assets/icons/classicon_warrior.jpg'
};

const TREE_ICONS={
 balance:'./assets/icons/spell_nature_starfall.jpg',
 'feral combat':'./assets/icons/ability_druid_catform.jpg',
 restoration:'./assets/icons/spell_nature_healingtouch.jpg',
 'beast mastery':'./assets/icons/ability_hunter_beasttaming.jpg',
 marksmanship:'./assets/icons/ability_marksmanship.jpg',
 survival:'./assets/icons/ability_hunter_swiftstrike.jpg',
 arcane:'./assets/icons/spell_arcane_arcane01.jpg',
 fire:'./assets/icons/spell_fire_flamebolt.jpg',
 frost:'./assets/icons/spell_frost_frostbolt02.jpg',
 holy:'./assets/icons/spell_holy_holybolt.jpg',
 protection:'./assets/icons/ability_warrior_defensivestance.jpg',
 retribution:'./assets/icons/spell_holy_auraoflight.jpg',
 discipline:'./assets/icons/spell_holy_powerwordshield.jpg',
 shadow:'./assets/icons/spell_shadow_shadowwordpain.jpg',
 assassination:'./assets/icons/ability_rogue_eviscerate.jpg',
 combat:'./assets/icons/ability_backstab.jpg',
 subtlety:'./assets/icons/ability_stealth.jpg',
 elemental:'./assets/icons/spell_nature_lightning.jpg',
 enhancement:'./assets/icons/spell_nature_lightningshield.jpg',
 affliction:'./assets/icons/spell_shadow_deathcoil.jpg',
 demonology:'./assets/icons/spell_shadow_metamorphosis.jpg',
 destruction:'./assets/icons/spell_fire_incinerate.jpg',
 arms:'./assets/icons/ability_warrior_savageblow.jpg',
 fury:'./assets/icons/ability_warrior_innerrage.jpg'
};

const CLASS_NAMES=Object.fromEntries(Object.keys(CLASS_ICONS).map(k=>[k,k[0]+k.slice(1).toLowerCase()]));
// Samwise Didier's classic race heraldry, arranged in a 4×3 sprite.
// Skyborne has no published race banner here, so use its chosen faction crest.
const RACE_BANNER_TILES={
 Human:[1,1],Dwarf:[0,2],'Night Elf':[0,1],Gnome:[1,2],
 Orc:[2,1],Undead:[3,2],Forsaken:[3,2],Tauren:[3,1],Troll:[2,2]
};
function applyRaceBanner(el,race='',faction=''){
 const key=RACE_BANNER_TILES[race]?race:'Skyborne';
 const [col,row]=RACE_BANNER_TILES[key]||(faction==='Horde'?[2,0]:[1,0]);
 el.style.backgroundPosition=`${col*100/3}% ${row*50}%`;
 el.setAttribute('aria-label',key==='Skyborne'?`Skyborne · ${faction||'Alliance'} faction banner`:`${race} racial banner`);
 el.title=key==='Skyborne'?`Skyborne · ${faction||'Alliance'} faction banner`:`${race} racial banner`;
}
function raceBanner(race,faction,cls){const el=document.createElement('span');el.className=`race-banner ${cls}`;el.setAttribute('role','img');applyRaceBanner(el,race,faction);return el;}

function classFromText(text=''){
 const lower=text.toLowerCase();
 return Object.keys(CLASS_ICONS).find(k=>lower.includes(CLASS_NAMES[k].toLowerCase()))||'';
}
function raceFromLine(text='',classKey=''){
 const cn=CLASS_NAMES[classKey]||'';
 return text.replace(new RegExp(`\\s*${cn}$`,'i'),'').trim();
}
function img(src,cls,alt=''){const el=document.createElement('img');el.src=src;el.className=cls;el.alt=alt;el.loading='lazy';el.referrerPolicy='no-referrer';return el;}

function enhanceCards(){
 document.querySelectorAll('.character:not([data-visual])').forEach(card=>{
  card.dataset.visual='1';
  const line=card.querySelector('.class-line');
  const classKey=classFromText(line?.textContent||'');
  if(!classKey)return;
  const race=raceFromLine(line?.textContent||'',classKey);
  const sigil=card.querySelector('.sigil');
  if(sigil){sigil.textContent='';sigil.append(img(CLASS_ICONS[classKey],'class-icon',CLASS_NAMES[classKey]));}
  const head=card.querySelector('.card-head');
  if(head){const faction=card.dataset.faction||'';head.prepend(raceBanner(race,faction,'race-crest'));}
  card.style.setProperty('--card-art',`url("${CLASS_ICONS[classKey]}")`);
 });
}

function enhanceProfile(){
 document.querySelectorAll('.profile-hero:not([data-visual])').forEach(hero=>{
  hero.dataset.visual='1';
  const text=hero.textContent||'';const classKey=classFromText(text);if(!classKey)return;
  const emblem=hero.querySelector('.profile-emblem');if(emblem){emblem.textContent='';emblem.append(img(CLASS_ICONS[classKey],'profile-class-icon',CLASS_NAMES[classKey]));}
  const p=[...hero.querySelectorAll('p')].find(x=>/Level\s+\d+/.test(x.textContent||''));
  if(p){const raw=(p.textContent||'').replace(/^Level\s+\d+\s+·\s+/,'');const race=raceFromLine(raw,classKey);const faction=hero.querySelector('.eyebrow')?.textContent.includes('Alliance')?'Alliance':hero.querySelector('.eyebrow')?.textContent.includes('Horde')?'Horde':'';hero.append(raceBanner(race,faction,'profile-race-crest'));}
  hero.style.setProperty('--hero-art',`url("${CLASS_ICONS[classKey]}")`);
 });
}

function talentIcon(name='',treeName='',classKey=''){
 const n=name.toLowerCase();
 const keyword=[
  [/holy|divine|light|judg|seal/,'./assets/icons/spell_holy_holybolt.jpg'],
  [/fire|flame|burn|ignite/,'./assets/icons/spell_fire_flamebolt.jpg'],
  [/frost|ice|cold/,'./assets/icons/spell_frost_frostbolt02.jpg'],
  [/shadow|fear|curse|corrupt|demon/,'./assets/icons/spell_shadow_deathcoil.jpg'],
  [/star|moon|balance/,'./assets/icons/spell_nature_starfall.jpg'],
  [/cat|feral|claw|bite/,'./assets/icons/ability_druid_catform.jpg'],
  [/stealth|ambush|vanish|subtle/,'./assets/icons/ability_stealth.jpg'],
  [/shield|block|defen|armor|tough/,'./assets/icons/ability_warrior_defensivestance.jpg'],
  [/lightning|storm|thunder|shock/,'./assets/icons/spell_nature_lightning.jpg']
 ].find(([rx])=>rx.test(n));
 return keyword?.[1]||TREE_ICONS[treeName.toLowerCase()]||CLASS_ICONS[classKey]||CLASS_ICONS.PALADIN;
}

function enhanceTalents(){
 const toolbar=document.querySelector('.talent-toolbar');
 if(toolbar&&!toolbar.dataset.visual){toolbar.dataset.visual='1';const selected=toolbar.querySelector('#talent-class')?.value?.toUpperCase();if(selected&&CLASS_ICONS[selected]){const badge=img(CLASS_ICONS[selected],'talent-class-badge',CLASS_NAMES[selected]);toolbar.prepend(badge);}}
 document.querySelectorAll('.talent-tree:not([data-visual])').forEach(tree=>{
  tree.dataset.visual='1';const heading=tree.querySelector('h2');const treeName=(heading?.childNodes?.[0]?.textContent||heading?.textContent||'').trim();
  const selected=document.querySelector('#talent-class')?.value?.toUpperCase()||'';const treeSrc=TREE_ICONS[treeName.toLowerCase()]||CLASS_ICONS[selected];
  if(heading&&treeSrc)heading.prepend(img(treeSrc,'tree-icon',treeName));
  tree.style.setProperty('--tree-art',`url("${treeSrc}")`);
  tree.querySelectorAll('.talent-node').forEach(node=>{
   if(node.dataset.visual)return;node.dataset.visual='1';const strong=node.querySelector('strong');const name=strong?.textContent||'';const icon=img(talentIcon(name,treeName,selected),'talent-icon',name);node.prepend(icon);
  });
 });
}

function enhanceCharacterForm(){
 const form=document.querySelector('#manual-form');if(!form||form.querySelector('.character-create-preview'))return;
 const grid=form.querySelector('.form-grid');if(!grid)return;
 const preview=document.createElement('div');preview.className='character-create-preview';preview.innerHTML='<span class="race-banner create-race-crest" role="img"></span><img class="create-class-icon" alt=""><div><small>CHARACTER IDENTITY</small><strong>Choose a faction, race, and class</strong><span>Your choices will shape the visual identity of this character.</span></div>';
 grid.before(preview);
 const faction=form.elements.faction,race=form.elements.race,cls=form.elements.class;
 const update=()=>{const f=faction?.value||'',r=race?.value||'',c=cls?.value||'';const raceImg=preview.querySelector('.create-race-crest'),classImg=preview.querySelector('.create-class-icon');raceImg.hidden=!r;if(r)applyRaceBanner(raceImg,r,f);classImg.src=CLASS_ICONS[c]||'';classImg.hidden=!c;classImg.alt=c?CLASS_NAMES[c]:'Class';preview.querySelector('strong').textContent=[r,c&&CLASS_NAMES[c]].filter(Boolean).join(' ')||'Choose a faction, race, and class';preview.querySelector('span').textContent=f?`${f} · ${r||'Choose a race'} · ${c?CLASS_NAMES[c]:'Choose a class'}`:'Start with a faction to reveal available races.';};
 form.addEventListener('change',update);update();
}

function apply(){enhanceCards();enhanceProfile();enhanceTalents();enhanceCharacterForm();}
apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});window.addEventListener('hashchange',()=>setTimeout(apply));
