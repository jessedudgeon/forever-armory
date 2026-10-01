import test from 'node:test';
import assert from 'node:assert/strict';
import {DUNGEONS,findDungeon,searchDungeons} from '../site/dungeons.js';

test('dungeon directory has unique routes and boss/item names',()=>{
 assert.equal(new Set(DUNGEONS.map(d=>d.id)).size,DUNGEONS.length);
 for(const dungeon of DUNGEONS){
  assert.equal(findDungeon(dungeon.id),dungeon);
  assert.equal(new Set(dungeon.bosses.map(([boss])=>boss)).size,dungeon.bosses.length);
  for(const [boss,items] of dungeon.bosses){assert.ok(boss);assert.ok(items.every(item=>item.name&&Number.isSafeInteger(item.id)&&item.id>0));}
  if(dungeon.bosses.length)assert.match(dungeon.source,/^https:\/\/(www\.wowhead\.com\/classic\/guide\/|news\.blizzard\.com\/en-us\/article\/)/);
 }
});
test('search finds a boss or item and new dungeons do not imply verified drops',()=>{
 assert.deepEqual(searchDungeons('Meteor Shard').map(d=>d.id),['shadowfang-keep']);
 assert.deepEqual(searchDungeons('Taragaman').map(d=>d.id),['ragefire-chasm']);
 assert.ok(searchDungeons('','new').every(d=>d.new&&!d.bosses.length));
 assert.ok(!searchDungeons('','classic').some(d=>d.new));
});

test('raids and dungeons filter separately',()=>{assert.equal(searchDungeons('','raids').length,7);assert.ok(searchDungeons('','dungeons').every(d=>d.kind==='dungeon'));assert.ok(searchDungeons('Ragnaros').some(d=>d.kind==='raid'));});
