import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeIcon,iconUrl,parseItemGoalNotes,encodeItemGoalNotes,progressPercent,compactItem} from '../site/item-core.js';

test('normalizes addon texture paths into icon slugs',()=>{
 assert.equal(normalizeIcon('Interface\\Icons\\INV_Misc_Flower_02.blp'),'inv_misc_flower_02');
 assert.equal(normalizeIcon('INV_Sword_39'),'inv_sword_39');
 assert.equal(normalizeIcon(134400),'');
 assert.match(iconUrl('INV_Sword_39'),/inv_sword_39\.jpg$/);
});

test('item goals round trip inside ordinary notes',()=>{
 const text=encodeItemGoalNotes({id:2447,name:'Peacebloom',icon:'INV_Misc_Flower_02',quality:'Common',current:7,target:20},'Farm around Brill.');
 const parsed=parseItemGoalNotes(text);
 assert.equal(parsed.item.id,2447);
 assert.equal(parsed.item.current,7);
 assert.equal(parsed.item.target,20);
 assert.equal(parsed.item.icon,'inv_misc_flower_02');
 assert.equal(parsed.notes,'Farm around Brill.');
});

test('progress stays bounded and item records compact safely',()=>{
 assert.equal(progressPercent(5,20),25);
 assert.equal(progressPercent(30,20),100);
 assert.equal(progressPercent(-1,20),0);
 assert.deepEqual(compactItem({itemId:18665,name:'The Eye of Shadow',icon:'inv_misc_orb_04',quality:'Epic'}),{id:18665,name:'The Eye of Shadow',icon:'inv_misc_orb_04',quality:'Epic',class:'',subclass:'',slot:'',itemLevel:null,requiredLevel:null,tooltip:[],source:null,link:''});
});

test('item UI module can load without a browser DOM',async()=>{
 await import('../site/items.js');
});
