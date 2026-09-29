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
  assert.equal(findInstance("molten-core").encounters.length, 10);
  assert.equal(findInstance("blackwing-lair").encounters.length, 8);
});
test("tracking one raid boss preserves legacy names, notes, unrelated progress, and explicit instance status", () => {
  const prior = [
    {
      id: "onyxias-lair",
      notes: "Bring potions",
      status: "Planned",
      completed: false,
      bosses: [{ name: "Onyxia", completed: false }],
    },
    { id: "another", bosses: [] },
  ];
  const next = encounterProgress(prior, "onyxias-lair", "onyxia", true);
  const entry = next.find((p) => p.id === "onyxias-lair");
  assert.equal(entry.bosses.length, 1);
  assert.equal(entry.bosses[0].id, "onyxia");
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
  assert.equal(saved.progress[1].bosses[0].id, "onyxia");
  assert.equal(
    encounterProgress(next, "onyxias-lair", "onyxia", false)[1].bosses[0]
      .completed,
    false,
  );
  assert.throws(
    () => encounterProgress(next, "onyxias-lair", "made-up", true),
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
  assert.ok(instanceLoot("onyxias-lair").some((i) => i.id === 17068));
  assert.equal(itemSources(17068)[0].encounterId, "onyxia");
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
        id: "onyxias-lair",
        type: "raid",
        bosses: [
          {
            id: "onyxia",
            name: "Onyxia",
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
    "onyxias-lair",
    "onyxia",
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
