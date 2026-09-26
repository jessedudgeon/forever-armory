// Blizzard's September 2026 Legacy guide: 65 challenges, shared within a Battle.net account.
export const LEGACY_SOURCE='https://news.blizzard.com/en-us/article/24307383/get-to-know-the-world-of-warcraft-forever-legacy-system';
const classes=['Warrior','Paladin','Hunter','Rogue','Priest','Shaman','Mage','Warlock','Druid'];
const trades=['Alchemy','Blacksmithing','Enchanting','Engineering','Leatherworking','Tailoring'];
const challenge=(group,id,label)=>({group,id,label});
export const CHALLENGES=[
 ...classes.flatMap(c=>[25,45,60].map(l=>challenge('Classes',`class-${c.toLowerCase()}-${l}`,`${c} level ${l}`))),
 ...trades.flatMap(t=>[150,225,300].map(l=>challenge('Tradeskills',`trade-${t.toLowerCase()}-${l}`,`${t} skill ${l}`))),
 ...[3,7,10,13,14].map(l=>challenge('PvP',`pvp-rank-${l}`,`Reach PvP rank ${l}`)),
 ...[1,2,3,4].map(i=>challenge('PvP',`pvp-reputation-${i}`,`Battleground reputation ${i}: reach Exalted`)),
 ...[4,7,10].map(w=>challenge('PvP',`pvp-field-${w}`,`Field of Honor week ${w} quest`)),
 challenge('Adventure','explore-world','Explore the entire world map on one character'),challenge('Adventure','valthalak','Complete the Lord Valthalak dungeon set questline'),
 ...['15–25','26–45','46–60'].map((x,i)=>challenge('Dungeons',`dungeons-${i}`,`Defeat the final boss in all level ${x} dungeons`)),
 challenge('Raids','onyxia','Defeat Onyxia'),challenge('Raids','hyjal','Defeat all 13 Hyjal Summit bosses'),challenge('Raids','barrow','Defeat all 8 Barrow Deeps bosses')
];
export const PERKS={
 Professions:[['working-overtime','Working Overtime','Higher tradeskill gain chance'],['bountiful-harvest','Bountiful Harvest','Extra scarce gathering resources'],['bartering','Bartering','Lower vendor prices'],['performance-bonus','Performance Bonus','More Merchant’s Favor sometimes'],['master-chef','Master Chef','Chance for extra cooked items'],['luremaster','Luremaster','Chance for extra fish'],['dedicated-study','Dedicated Study','Daily tradeskill help or Elemental Essences']],
 Adventure:[['well-rested','Well Rested','Faster rested XP and a higher cap'],['thrill-of-adventure','Thrill of Adventure','Health and mana after a non-trivial kill'],['high-alert','High Alert','Stealth detection outside battlegrounds'],['field-guide','Field Guide','Shorter camping cooldown'],['field-medicine','Field Medicine','Shorter Recently Bandaged duration outside instances and battlegrounds'],['talented','Talented','Talent points up to five levels earlier'],['frequent-flier','Frequent Flier','Cheaper, faster flights']],
 Resourcefulness:[['gourmand','Gourmand','Longer food buffs'],['quick-and-dead','The Quick and the Dead','Faster corpse run and free group buffs after resurrection'],['reinforce','Reinforce','Less durability loss on death'],['for-great-honor','For Great Honor','More Honor'],['permanence','Permanence','Longer party, raid, and camping buffs'],['diplomat','Diplomat','More reputation'],['reagent-economy','Reagent Economy','No purchased class reagents or Tier 1 camping materials']]
};
export const PERK_KEYS=new Set(Object.values(PERKS).flatMap(x=>x.map(p=>p[0])));
export function earnedChallenges(state){
 const earned=new Set(state.legacy?.challenges||[]);
 for(const character of state.characters){const s=character.snapshots.at(-1);if(s.playStyle==='Hardcore')continue;
  for(const level of [25,45,60])if(s.level>=level)earned.add(`class-${s.class.toLowerCase()}-${level}`);
  for(const p of s.professions)for(const level of [150,225,300])if(p.rank>=level&&trades.some(t=>t.toLowerCase()===p.name.toLowerCase()))earned.add(`trade-${p.name.toLowerCase()}-${level}`);
 }
 return earned;
}
export function legacyPoints(state){const known=new Set(CHALLENGES.map(c=>c.id));return [...earnedChallenges(state)].filter(id=>known.has(id)).length;}
export function perkTotal(allocation={}){return Object.values(allocation).reduce((a,b)=>a+b,0);}
export function setPerkRank(state,characterId,key,delta){
 if(!PERK_KEYS.has(key)||![-1,1].includes(delta))throw Error('Unknown Legacy perk.');
 const c=state.characters.find(c=>c.id===characterId);if(!c)throw Error('Character not found.');
 if(c.snapshots.at(-1).playStyle==='Hardcore')throw Error('Hardcore Legacy progression is separate and is not available yet.');
 const next=structuredClone(state),allocation={...(next.legacy.perks[characterId]||{})},rank=(allocation[key]||0)+delta;
 if(rank<0||rank>16)throw Error('Invalid perk rank.');if(rank)allocation[key]=rank;else delete allocation[key];
 if(perkTotal(allocation)>Math.min(16,legacyPoints(state)))throw Error('Earn more Legacy Points before allocating another rank.');
 next.legacy.perks[characterId]=allocation;return next;
}
