export const RACES_BY_FACTION=Object.freeze({
 Alliance:Object.freeze(['Human','Dwarf','Night Elf','Gnome','Skyborne']),
 Horde:Object.freeze(['Orc','Undead','Tauren','Troll','Skyborne'])
});

export const CLASSES_BY_FACTION_RACE=Object.freeze({
 Alliance:Object.freeze({
  Human:Object.freeze(['HUNTER','MAGE','PALADIN','PRIEST','ROGUE','WARLOCK','WARRIOR']),
  Dwarf:Object.freeze(['HUNTER','PALADIN','PRIEST','ROGUE','SHAMAN','WARRIOR']),
  'Night Elf':Object.freeze(['DRUID','HUNTER','PRIEST','ROGUE','WARRIOR']),
  Gnome:Object.freeze(['MAGE','PRIEST','ROGUE','WARLOCK','WARRIOR']),
  Skyborne:Object.freeze(['DRUID','HUNTER','MAGE','ROGUE','WARRIOR'])
 }),
 Horde:Object.freeze({
  Orc:Object.freeze(['HUNTER','MAGE','ROGUE','SHAMAN','WARLOCK','WARRIOR']),
  Undead:Object.freeze(['MAGE','PALADIN','PRIEST','ROGUE','WARLOCK','WARRIOR']),
  Tauren:Object.freeze(['DRUID','HUNTER','SHAMAN','WARRIOR']),
  Troll:Object.freeze(['HUNTER','MAGE','PRIEST','ROGUE','SHAMAN','WARLOCK','WARRIOR']),
  Skyborne:Object.freeze(['DRUID','HUNTER','ROGUE','SHAMAN','WARRIOR'])
 })
});

export function racesForFaction(faction){return RACES_BY_FACTION[faction]||[];}
export function classesForSelection(faction,race){return CLASSES_BY_FACTION_RACE[faction]?.[race]||[];}
export function isValidCharacterCombination(faction,race,characterClass){return classesForSelection(faction,race).includes(String(characterClass||'').toUpperCase());}
