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
