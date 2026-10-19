import test from 'node:test';
import assert from 'node:assert/strict';
import {readSavedVariables} from '../site/lua-data.js';
import {parseAutobiographer,biographySnapshot,characterBiography} from '../site/autobiographer.js';
import {normalize,emptyState,addSnapshot,validateBackup} from '../site/model.js';
import {recordsFor,stateFromRecords} from '../site/cloud-model.js';
import {biographyView} from '../site/autobiographer-ui.js';
const source=`AUTOBIOGRAPHER_INFO_CHAR = { ["PlayerGuid"] = "Player-1-42", ["DatabaseVersion"] = 20 }
AUTOBIOGRAPHER_CATALOGS_CHAR = { ["TalentCatalog"] = { [100] = { ["Name"] = "Protection" } } }
AUTOBIOGRAPHER_EVENTS_CHAR = {
 { ["Timestamp"] = 1792400000, ["Type"] = 2, ["SubType"] = 6, ["LevelNum"] = 13 },
 { ["Timestamp"] = 1792400010, ["Type"] = 12, ["SubType"] = 8, ["QuestTitle"] = "A quest" },
 { ["Timestamp"] = 1792400010, ["Type"] = 12, ["SubType"] = 8, ["QuestTitle"] = "A quest" },
}
AUTOBIOGRAPHER_GEAR_CHAR = { ["Changes"] = {{Timestamp=1792400005, SlotId=16, ItemId=0}}, Snapshot={} }
AUTOBIOGRAPHER_SNAPSHOTS_CHAR = { Levels = { [13] = { Timestamp=1792400000, Level=13, Equipment={[16]=123}, Talents={[100]=2}, Pending=true } }, Raids={} }
AUTOBIOGRAPHER_LEVELS_CHAR = { [13] = { Statistics = { Damage=456 } } }
`;
const initial=()=>addSnapshot(emptyState(),normalize({name:'Gravemoor',class:'PALADIN',realm:'Classic Beta PvE',level:13,gear:[{slot:16,id:999}],notes:'Keep my story',observedAt:'2026-10-18T12:00:00Z'})).state;
const apply=(state,h)=>addSnapshot(state,normalize(biographySnapshot(state.characters[0],h)),{targetId:state.characters[0].id});
test('reads actual v5 SavedVariables shapes with events, gear, milestones and statistics',()=>{const h=parseAutobiographer(source);assert.equal(h.events.length,5);assert.equal(new Set(h.events.map(e=>e.key)).size,5);assert.equal(h.guid,'Player-1-42');assert.equal(h.levels[13].Statistics.Damage,456);assert.equal(h.events.filter(e=>e.title==='Turned in A quest').length,2);});
test('safe Lua reader preserves UTF-8 decimal escapes, zero, false and comments',()=>{const x=readSavedVariables('DATA={name="\\195\\169 😀",zero=0,no=false, [7]="hi", -- hi\n}');assert.equal(x.DATA.name,'é 😀');assert.equal(x.DATA.zero,0);assert.equal(x.DATA.no,false);});
test('rejects executable code, prototype keys, duplicate globals, truncation and excessive nesting',()=>{for(const text of ['DATA=os.execute("bad")','DATA={__proto__={}}','DATA={} DATA={}','DATA={name="unfinished','DATA='+ '{'.repeat(50)+'}'.repeat(50)])assert.throws(()=>readSavedVariables(text));assert.throws(()=>parseAutobiographer('AUTOBIOGRAPHER_SETTINGS = {}'),/per-character/);});
test('import is idempotent, preserves current observations and identity, rejects wrong GUID',()=>{const state=initial(),h=parseAutobiographer(source),one=apply(state,h);assert.equal(one.state.characters.length,1);const c=one.state.characters[0],s=c.snapshots.at(-1);assert.equal(s.gear[0].id,999);assert.equal(s.observedAt,'2026-10-18T12:00:00.000Z');assert.equal(s.notes,'Keep my story');assert.equal(c.id,state.characters[0].id);assert.equal(apply(one.state,h).duplicate,true);assert.throws(()=>apply(one.state,{...h,guid:'other'}),/different character GUID/);});
test('old uploads retain newer events and completed milestone updates do not duplicate',()=>{const old=parseAutobiographer(source),newer=parseAutobiographer(source.replace('Pending=true','Pending=false, Skills={[164]={Rank=75,MaxRank=150}}'));let state=apply(initial(),old).state;state=apply(state,newer).state;assert.equal(characterBiography(state.characters[0]).events.length,5);state=apply(state,old).state;assert.equal(characterBiography(state.characters[0]).events.find(e=>e.category==='Snapshot').raw.Skills[164].Rank,75);const fewer={...newer,events:newer.events.slice(0,2)};state=apply(state,fewer).state;assert.equal(characterBiography(state.characters[0]).events.length,5);});
test('private history survives backup and cloud record round trips',async()=>{const state=apply(initial(),parseAutobiographer(source)).state;const backup=validateBackup({format:'forever-armory-backup',version:1,...state});assert.equal(characterBiography(backup.characters[0]).events.length,5);assert.deepEqual(stateFromRecords((await recordsFor(state)).values()),state);});
test('rendering escapes untrusted addon strings',()=>{const state=apply(initial(),parseAutobiographer(source.replace('Protection','<script>alert(1)</script>'))).state;const html=biographyView(state.characters[0]);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));});
