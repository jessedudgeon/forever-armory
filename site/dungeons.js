// Classic reference tables are intentionally separate from verified Forever drops.
// Boss/item associations below come from the linked Classic guides, not a Forever loot API.
const classic=[
 {id:'ragefire-chasm',name:'Ragefire Chasm',level:'13–18',zone:'Orgrimmar',faction:'Horde',source:'https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic',bosses:[
  ['Oggleflint',[]],['Taragaman the Hungerer',['Crystalline Cuffs','Subterranean Cape','Cursed Felblade']],['Jergosh the Invoker',['Cavedweller Bracers','Robe of Evocation','Chanting Blade']],['Bazzalan',[]]]},
 {id:'wailing-caverns',name:'Wailing Caverns',level:'15–25',zone:'The Barrens',faction:'Both',source:'https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic',bosses:[
  ['Kresh',["Kresh’s Back",'Worn Turtle Shell Shield']],['Lady Anacondra',['Belt of the Fang',"Serpent’s Shoulders"]],['Lord Cobrahn',['Robe of the Moccasin',"Cobrahn’s Grasp",'Leggings of the Fang']],['Deviate Faerie Dragon (rare)',['Firebelcher','Feyscale Cloak']],['Lord Pythas',['Stinging Viper','Armor of the Fang']],['Skum',['Glowing Lizardscale Cloak','Tail Spike']],['Lord Serpentis',['Footpads of the Fang','Savage Trodders','Serpent Gloves','Venomstrike']],['Verdan the Everliving',['Sporid Cape','Living Root','Seedcloud Buckler']],['Mutanus the Devourer',['Mutant Scale Breastplate','Deep Fathom Ring','Slime-encrusted Pads']]]},
 {id:'deadmines',name:'The Deadmines',level:'18–23',zone:'Westfall',faction:'Both',source:'https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic',bosses:[
  ["Rhahk’Zor",["Rhahk’Zor’s Hammer",'Rockslicer']],['Miner Johnson (rare)',['Gold-plated Buckler',"Miner’s Cape"]],['Sneed',["Taskmaster Axe",'Gold-flecked Gloves','Buzzer Blade','Buzz Saw']],['Gilnid',['Smelting Pants','Lavishly Jeweled Ring']],['Mr. Smite',["Smite’s Mighty Hammer","Smite’s Reaver","Thief’s Blade"]],['Captain Greenskin',['Emberstone Staff','Impaling Harpoon','Blackened Defias Belt']],['Edwin VanCleef',['Cape of the Brotherhood',"Corsair’s Overshirt",'Cruel Barb','Blackened Defias Armor']],['Cookie',["Cookie’s Stirring Rod","Cookie’s Tenderizer"]]]},
 {id:'shadowfang-keep',name:'Shadowfang Keep',level:'22–30',zone:'Silverpine Forest',faction:'Both',source:'https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic',bosses:[
  ['Rethilgore',['Rugged Spaulders']],['Fel Steeds / Shadow Charger',['Fel Steed Saddlebags']],['Razorclaw the Butcher',['Bloody Apron',"Butcher’s Slicer","Butcher’s Cleaver"]],['Baron Silverlaine',["Baron’s Scepter","Silverlaine’s Family Seal"]],['Commander Springvale',['Arced War Axe',"Commander’s Crest"]],['Odo the Blindwatcher',['Girdle of the Blindwatcher',"Odo’s Ley Staff"]],['Deathsworn Captain (rare)',['Haunting Blade','Phantom Armor']],['Fenrus the Devourer',["Fenrus’ Hide",'Black Wolf Bracers']],['Wolf Master Nandos',['Feline Mantle','Wolfmaster Cape']],['Archmage Arugal',['Robes of Arugal','Belt of Arugal','Meteor Shard']]]}
];
// Item IDs are the Classic reference items linked in the source guides, in boss order.
const classicItemIds=[
 [14148,14149,14145,14147,14150,14151],
 [13245,6447,10412,5404,6465,6460,10410,5243,6632,6472,6473,6449,6448,10411,6459,5970,6469,6629,6631,6630,6627,6463,6461],
 [5187,872,5443,5444,5194,5195,2169,1937,5199,1156,7230,5196,5192,5201,5200,10403,5193,5202,5191,10399,5198,5197],
 [5254,932,6226,6633,1292,6323,6321,3191,6320,6319,6318,6641,6642,6340,3230,3748,6314,6324,6392,6220]
];
classic.forEach((d,index)=>{const ids=classicItemIds[index][Symbol.iterator]();d.bosses=d.bosses.map(([boss,items])=>[boss,items.map(name=>({name,id:ids.next().value}))]);});
const forever=[
 ['hall-of-thanes','The Hall of Thanes','13–18','Beneath Ironforge'],['ruins-of-lordaeron','Ruins of Lordaeron','15–20','Lordaeron'],['excavation-site-wetlands','Excavation Site: Wetlands','24–29','Wetlands'],['city-of-dalaran','City of Dalaran','28–33','Dalaran'],['drowned-city','The Drowned City','35–40','Stranglethorn coast'],['kroldok-stronghold','Krol’dok Stronghold','40–45','Location pending'],['alcaz-prison','Alcaz Prison','48–53','Alcaz Island'],['blackmaw-hold','Blackmaw Hold','55–60','Location pending'],['shapers-terrace','Shaper’s Terrace','58–60','Location pending']
].map(([id,name,level,zone])=>({id,name,level,zone,faction:'Both',new:true,bosses:[]}));
const moreClassic=[
 ['blackfathom-deeps','Blackfathom Deeps','24–32','Ashenvale'],['stockade','The Stockade','24–32','Stormwind'],['gnomeregan','Gnomeregan','29–38','Dun Morogh'],['razorfen-kraul','Razorfen Kraul','29–38','The Barrens'],['scarlet-monastery','Scarlet Monastery','30–46','Tirisfal Glades'],['razorfen-downs','Razorfen Downs','37–46','The Barrens'],['uldaman','Uldaman','41–51','Badlands'],['zulfarrak','Zul’Farrak','44–54','Tanaris'],['maraudon','Maraudon','46–55','Desolace'],['sunken-temple','Sunken Temple','50–60','Swamp of Sorrows'],['blackrock-depths','Blackrock Depths','52–60','Blackrock Mountain'],['dire-maul','Dire Maul','54–60','Feralas'],['blackrock-spire','Blackrock Spire','55–60','Blackrock Mountain'],['scholomance','Scholomance','58–60','Western Plaguelands'],['stratholme','Stratholme','58–60','Eastern Plaguelands']
].map(([id,name,level,zone])=>({id,name,level,zone,faction:'Both',bosses:[]}));
// Raid listings are Classic references, not claims about Forever launch availability.
const raids=[
 {id:'molten-core',name:'Molten Core',kind:'raid',level:'60',zone:'Blackrock Mountain',faction:'Both',source:'https://news.blizzard.com/en-us/article/24165121/20th-anniversary-realms-molten-core-and-onyxia-s-lair-now-live',bosses:[['Ragnaros',[]]],description:'A Classic raid beneath Blackrock Mountain. Full encounter and Forever loot coverage is pending.'},
 {id:'onyxias-lair',name:'Onyxia’s Lair',kind:'raid',level:'60',zone:'Dustwallow Marsh',faction:'Both',source:'https://news.blizzard.com/en-us/article/24165121/20th-anniversary-realms-molten-core-and-onyxia-s-lair-now-live',bosses:[['Onyxia',[]]],description:'A Classic dragon encounter. Forever mechanics and loot remain unverified.'},
 {id:'blackwing-lair',name:'Blackwing Lair',kind:'raid',level:'60',zone:'Blackrock Spire',faction:'Both',source:'https://news.blizzard.com/en-us/article/23302788/wow-classic-descend-into-the-depths-of-blackwing-lair',bosses:[],description:'A Classic raid at the top of Blackrock Spire. Encounter and loot tables are awaiting verified data.'}
];
export const DUNGEONS=[...forever,...classic,...moreClassic,...raids].map(d=>({kind:'dungeon',...d}));
export function findDungeon(id){return DUNGEONS.find(d=>d.id===id);}
export function searchDungeons(query='',filter='all'){
 const q=query.trim().toLocaleLowerCase();return DUNGEONS.filter(d=>(filter==='all'||(filter==='raids'?d.kind==='raid':filter==='dungeons'?d.kind==='dungeon':filter==='new'?d.new:filter==='classic'?!d.new:d.faction===filter||d.faction==='Both'))&&(!q||[d.name,d.zone,...d.bosses.flatMap(([name,loot])=>[name,...loot.map(item=>item.name)])].some(x=>x.toLocaleLowerCase().includes(q))));
}
