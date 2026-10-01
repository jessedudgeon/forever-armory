import test from "node:test";
import assert from "node:assert/strict";
import {
  instances,
  findInstance,
  findEncounter,
  lootFor,
  encounterProgress,
  referenceItems,
} from "../site/pve-data.js";
import { normalize } from "../site/model.js";
test("canonical encounters have unique stable routes and valid shared item references", () => {
  for (const d of instances) {
    assert.equal(
      new Set(d.encounters.map((e) => e.id)).size,
      d.encounters.length,
    );
    for (const e of d.encounters) {
      assert.equal(findEncounter(d.id, e.id), e);
      assert.match(e.id, /^[a-z0-9-]+$/);
      for (const i of lootFor(e)) {
        assert.ok(i.name);
        assert.ok(referenceItems().some((r) => r.id === i.id));
      }
    }
  }
  assert.equal(findInstance("hall-of-thanes").encounters.length, 4);
  assert.equal(findInstance("ruins-of-lordaeron").encounters.length, 6);
});
test("tracking one raid boss preserves legacy names, notes, unrelated progress, and explicit instance status", () => {
  const prior = [
    {
      id: "hall-of-thanes",
      notes: "Bring potions",
      status: "Planned",
      completed: false,
      bosses: [{ name: "Faldrim Anvilmar", completed: false }],
    },
    { id: "another", bosses: [] },
  ];
  const next = encounterProgress(prior, "hall-of-thanes", "faldrim-anvilmar", true);
  const entry = next.find((p) => p.id === "hall-of-thanes");
  assert.equal(entry.bosses.length, 1);
  assert.equal(entry.bosses[0].id, "faldrim-anvilmar");
  assert.equal(entry.bosses[0].completed, true);
  assert.equal(entry.completed, false);
  assert.equal(entry.notes, "Bring potions");
  assert.deepEqual(next[0], prior[1]);
  assert.equal(prior[0].bosses[0].completed, false);
  const saved = normalize({
    name: "A B",
    playStyle: "Normal",
    class: "MAGE",
    level: 60,
    progress: next,
  });
  assert.equal(saved.progress[1].bosses[0].id, "faldrim-anvilmar");
  assert.equal(
    encounterProgress(next, "hall-of-thanes", "faldrim-anvilmar", false)[1].bosses[0]
      .completed,
    false,
  );
  assert.throws(
    () => encounterProgress(next, "hall-of-thanes", "made-up", true),
    /Unknown/,
  );
});

test("loot filters retain unknown class eligibility and filter explicit restrictions, slots and bosses", async () => {
  const { filterLoot, itemSources, instanceLoot } =
    await import("../site/pve-data.js");
  const rows = [
    {
      id: 1,
      name: "Sword",
      slot: "Main Hand",
      subclass: "Sword",
      quality: "Epic",
      allowedClasses: ["WARRIOR"],
      encounterId: "a",
    },
    { id: 2, name: "Unknown", encounterId: "b" },
  ];
  assert.deepEqual(
    filterLoot(rows, { class: "MAGE" }).map((i) => i.id),
    [2],
  );
  assert.equal(
    filterLoot(rows, {
      class: "warrior",
      slot: "main hand",
      boss: "a",
      quality: "epic",
    }).length,
    1,
  );
  assert.equal(filterLoot(rows, { type: "Axe" }).length, 0);
  assert.ok(instanceLoot("hall-of-thanes").some((i) => i.id === 271097));
  assert.equal(itemSources(271097)[0].encounterId, "faldrim-anvilmar");
});
test("imported kills, quests and attunements survive cloud and manual boss edits", async () => {
  const { emptyState, addSnapshot } = await import("../site/model.js");
  const { recordsFor, stateFromRecords } =
    await import("../site/cloud-model.js");
  const s = normalize({
    name: "Test Keeper",
    playStyle: "Normal",
    class: "MAGE",
    level: 60,
    progress: [
      {
        id: "hall-of-thanes",
        type: "raid",
        bosses: [
          {
            id: "faldrim-anvilmar",
            name: "Faldrim Anvilmar",
            completed: true,
            kills: 3,
            lastKilledAt: "2026-09-29T00:00:00Z",
          },
        ],
        quests: [{ id: 1, name: "Quest", completed: true }],
        attunements: [{ id: "access", name: "Access", status: "In progress" }],
      },
    ],
  });
  const changed = encounterProgress(
    s.progress,
    "hall-of-thanes",
    "faldrim-anvilmar",
    false,
  );
  assert.equal(changed[0].bosses[0].kills, 3);
  assert.equal(changed[0].quests[0].completed, true);
  const state = addSnapshot(emptyState(), s).state;
  assert.deepEqual(stateFromRecords((await recordsFor(state)).values()), state);
  assert.throws(() =>
    normalize({ ...s, progress: [{ bosses: [{ kills: -1 }] }] }),
  );
  assert.throws(() =>
    normalize({ ...s, progress: [{ bosses: [{ lastKilledAt: "invalid" }] }] }),
  );
});

test('raid catalog, search, prerequisites and legacy dungeon routes share one service', async () => {
  const {searchInstances} = await import('../site/pve-data.js');
  assert.equal(new Set(instances.map(d=>d.id)).size, instances.length);
  assert.equal(searchInstances('', 'raids').length, 2);
  assert.equal(searchInstances('Old Ironforge Incursion')[0].id, 'hall-of-thanes');
  assert.equal(searchInstances('Meteor Shard')[0].id, 'shadowfang-keep');
  for (const d of instances) for (const q of d.quests) {
    const seen = new Set();
    for (const step of q.prerequisites || []) {
      assert.ok(!seen.has(step.id));
      for (const id of step.prerequisiteIds || []) assert.ok(seen.has(id), 'prerequisite must precede its dependent');
      seen.add(step.id);
    }
  }
});

test('quest turn-ins, readiness and unknown coverage remain distinct', async () => {
  const {journalQuestStatus, journalProgress, instanceProgress} = await import('../site/pve-data.js');
  const q = {id:'verified-test-quest',gameQuestId:123};
  assert.equal(journalQuestStatus({}, 'hall-of-thanes', q), 'Not recorded');
  assert.equal(journalQuestStatus({quests:[{id:123,completed:true}]}, 'hall-of-thanes', q), 'Ready to turn in');
  assert.equal(journalQuestStatus({completedQuestIDs:[123]}, 'hall-of-thanes', q), 'Turned in');
  assert.equal(journalQuestStatus({questHistory:[{questId:123}]}, 'hall-of-thanes', q), 'Turned in');
  assert.equal(journalQuestStatus({completedQuestIDs:[123]}, 'hall-of-thanes', {id:'123'}), 'Not recorded');
  const d=findInstance('hall-of-thanes');
  const progress=encounterProgress([], d.id, 'faldrim-anvilmar', true);
  assert.equal(journalProgress({progress},d).completed,false);
  const completed=instanceProgress(progress,d.id,true);
  assert.equal(journalProgress({progress:completed},d).completed,true);
  assert.deepEqual(completed[0].bosses,progress[0].bosses);
  assert.equal(instanceProgress(completed,d.id,false)[0].completed,false);
});

test('future PvE events survive version 1 imports, overlapping exports, old partial imports, backups and cloud', async () => {
  const {parseImport, emptyState, addSnapshot, validateBackup} = await import('../site/model.js');
  const {recordsFor,stateFromRecords} = await import('../site/cloud-model.js');
  const {normalizePveHistory} = await import('../site/pve-history.js');
  const base={name:'Raid Tester',class:'MAGE',level:60,playStyle:'Normal',guid:'Player-Test',realm:'Test'};
  const event={eventId:'run-1-kill',type:'boss-kill',instanceId:'hall-of-thanes',encounterId:'faldrim-anvilmar',occurredAt:'2026-09-29T12:00:00Z',characterGuid:'Player-Test'};
  const parse=(at,events)=>parseImport(JSON.stringify({format:'forever-armory',version:1,character:{...base,observedAt:at,...(events === undefined?{}:{pveHistory:events})}}));
  let state=addSnapshot(emptyState(),parse('2026-09-29T13:00:00Z',[event])).state;
  const loot={eventId:'run-1-loot',type:'loot-received',instanceId:'hall-of-thanes',itemId:271097,quantity:1,occurredAt:'2026-09-29T12:01:00Z'};
  const second=parse('2026-09-29T14:00:00Z',[event,loot]);
  state=addSnapshot(state,second).state;
  assert.equal(addSnapshot(state,second).duplicate,true);
  state=addSnapshot(state,parse('2026-09-29T15:00:00Z')).state;
  assert.equal(state.characters[0].snapshots.at(-1).pveHistory.length,2);
  const historic=addSnapshot(state,parse('2026-09-28T15:00:00Z',[])).state;
  assert.equal(historic.characters[0].snapshots[0].pveHistory.length,0);
  assert.deepEqual(stateFromRecords((await recordsFor(state)).values()), state);
  assert.deepEqual(validateBackup({format:"forever-armory-backup",...state}),state);
  assert.throws(()=>normalizePveHistory([event,event]),/Duplicate/);
  assert.throws(()=>normalizePveHistory([event],'Someone-else'),/another character/);
  assert.throws(()=>normalizePveHistory([{...event,occurredAt:'bad'}]),/Invalid/);
  assert.throws(()=>normalizePveHistory([{...loot,quantity:0}]),/Invalid/);
  assert.throws(()=>addSnapshot(state,parse('2026-09-29T16:00:00Z',[{...event,encounterId:'changed'}])),/Conflicting/);
  // New/unknown catalog IDs remain valid private history for future catalog releases.
  assert.equal(normalizePveHistory([{...event,instanceId:'future-raid'}])[0].instanceId,'future-raid');
});


test('PvE observations reject ambiguous times, oversized history and out-of-order conflicts without changing saved state', async()=>{
 const {parseImport,emptyState,addSnapshot}=await import('../site/model.js');
 const {normalizePveHistory,mergePveHistory}=await import('../site/pve-history.js');
 const event={eventId:'kill-1',type:'boss-kill',instanceId:'ruins-of-lordaeron',encounterId:'witherfang',occurredAt:'2026-09-29T12:00:00Z'};
 for(const occurredAt of ['2026-09-29','2026-09-29T12:00:00','1'])assert.throws(()=>normalizePveHistory([{...event,occurredAt}]),/Invalid/);
 const many=Array.from({length:5000},(_,i)=>({...event,eventId:'kill-'+i}));
 assert.throws(()=>mergePveHistory(many,[{...event,eventId:'overflow'}]),/size/);
 const parse=(at,events)=>parseImport(JSON.stringify({format:'forever-armory',version:1,character:{name:'History Tester',class:'MAGE',level:60,playStyle:'Normal',guid:'Player-History',realm:'Test',observedAt:at,pveHistory:events}}));
 const state=addSnapshot(emptyState(),parse('2026-09-30T12:00:00Z',[event])).state;
 const before=structuredClone(state);
 assert.throws(()=>addSnapshot(state,parse('2026-09-29T13:00:00Z',[{...event,encounterId:'changed'}])),/Conflicting/);
 assert.deepEqual(state,before);
 const earlier=addSnapshot(state,parse('2026-09-29T13:00:00Z',[])).state;
 assert.deepEqual(earlier.characters[0].snapshots[0].pveHistory,[]);
 assert.equal(earlier.characters[0].snapshots.at(-1).pveHistory.length,1);
 const emptyLater=addSnapshot(state,parse('2026-10-01T12:00:00Z',[])).state;
 assert.equal(emptyLater.characters[0].snapshots.at(-1).pveHistory.length,1);
});

test('public catalog requires Forever provenance and excludes unverified Classic raid/loot records', () => {
  for (const d of instances) {
    assert.match(d.source, /wowhead\.com\/forever\/|blizzard\.com\/en-us\/article\/24303862\//);
    assert.equal(d.checkedAt, '2026-10-01');
    assert.ok(d.availability);
    for (const e of d.encounters) {
      assert.match(e.source, /wowhead\.com\/forever\//);
      for (const loot of e.loot) assert.match(loot.sourceUrl, /wowhead\.com\/forever\//);
    }
  }
  for (const id of ['molten-core','onyxias-lair','blackwing-lair','zulgurub','ruins-of-ahnqiraj','temple-of-ahnqiraj','naxxramas']) assert.equal(findInstance(id), undefined);
  assert.equal(referenceItems().some(i => i.id === 17068), false);
  assert.equal(lootFor(findEncounter('hall-of-thanes','faldrim-anvilmar')).length,3);
  assert.equal(findInstance('ruins-of-lordaeron').encounters.reduce((n,e)=>n+e.loot.length,0),18);
});
