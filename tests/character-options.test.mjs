import test from 'node:test';
import assert from 'node:assert/strict';
import {racesForFaction,classesForSelection,isValidCharacterCombination} from '../site/character-options.js';

test('races are limited by faction',()=>{
 assert.deepEqual(racesForFaction('Alliance'),['Human','Dwarf','Night Elf','Gnome','Skyborne']);
 assert.deepEqual(racesForFaction('Horde'),['Orc','Undead','Tauren','Troll','Skyborne']);
 assert.deepEqual(racesForFaction(''),[]);
});

test('Forever-specific race class combinations are available',()=>{
 assert.equal(isValidCharacterCombination('Horde','Undead','PALADIN'),true);
 assert.equal(isValidCharacterCombination('Horde','Orc','MAGE'),true);
 assert.equal(isValidCharacterCombination('Horde','Troll','WARLOCK'),true);
 assert.equal(isValidCharacterCombination('Alliance','Dwarf','SHAMAN'),true);
 assert.equal(isValidCharacterCombination('Alliance','Gnome','PRIEST'),true);
 assert.equal(isValidCharacterCombination('Alliance','Human','HUNTER'),true);
});

test('Skyborne class list changes with faction',()=>{
 assert.deepEqual(classesForSelection('Alliance','Skyborne'),['DRUID','HUNTER','MAGE','ROGUE','WARRIOR']);
 assert.deepEqual(classesForSelection('Horde','Skyborne'),['DRUID','HUNTER','ROGUE','SHAMAN','WARRIOR']);
});

test('invalid combinations stay unavailable',()=>{
 assert.equal(isValidCharacterCombination('Alliance','Human','SHAMAN'),false);
 assert.equal(isValidCharacterCombination('Horde','Tauren','PALADIN'),false);
 assert.equal(isValidCharacterCombination('Horde','Undead','SHAMAN'),false);
});
