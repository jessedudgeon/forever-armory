import test from "node:test";
import assert from "node:assert/strict";
import {
  normalize,
  emptyState,
  addSnapshot,
  validateBackup,
  saveManualCharacter,
  keyOf,
} from "../site/model.js";
import { recordsFor, stateFromRecords } from "../site/cloud-model.js";
import {
  inventoryFor,
  searchInventory,
  normalizeGuild,
} from "../site/character-data.js";
const base = {
  mainName: "Asha",
  secondaryName: "Brightvale",
  playStyle: "Normal",
  class: "PALADIN",
  race: "Undead",
  faction: "Horde",
  level: 13,
  observedAt: "2026-09-28T12:00:00Z",
};
const rich = () =>
  normalize({
    ...base,
    inventory: [
      { id: 10, name: "Ore", quantity: 3, location: "backpack", slot: 1 },
      {
        id: 10,
        name: "Ore",
        quantity: 5,
        location: "bank",
        container: "main",
        slot: 1,
        binding: "Soulbound",
        enchantments: ["test"],
        gems: [20],
        durability: { current: 10, max: 30 },
      },
    ],
    storageStatus: { backpack: { captured: true }, bank: { captured: true } },
    recipes: [
      {
        id: "smith-1",
        name: "Metal",
        profession: "Blacksmithing",
        skill: 10,
        craftedItem: 11,
        reagents: [{ id: 10, quantity: 2 }],
      },
    ],
    notes: "Private notes",
    progress: [{ id: "onyxia", name: "Onyxia", type: "raid", completed: true }],
    statistics: { Strength: 42 },
    builds: [{ name: "Plan", code: "paladin/13/000" }],
  });
test("rich data survives backups and private cloud records without a second local cache", async () => {
  let state = addSnapshot(emptyState(), rich()).state;
  state.guilds.push(
    normalizeGuild({
      id: "guild1",
      name: "Keepers",
      faction: "Horde",
      recruitment: "Tanks",
      ranks: ["Officer"],
      officers: ["Asha"],
    }),
  );
  state.gameAccounts[0].legacyStatus = "Pending verification";
  assert.deepEqual(
    stateFromRecords((await recordsFor(state)).values()),
    validateBackup({ format: "forever-armory-backup", ...state }),
  );
});
test("complete inventory searches locations, quantities, quality and duplicate stacks", () => {
  const c = rich();
  assert.equal(inventoryFor(c).length, 2);
  assert.equal(searchInventory(c, { duplicates: true }).length, 2);
  assert.equal(
    searchInventory(c, { query: "10", location: "bank" })[0].quantity,
    5,
  );
  assert.equal(searchInventory(c, { quality: 4 }).length, 0);
});
test("partial imports preserve bank and explicitly empty captured bags", () => {
  let state = addSnapshot(emptyState(), rich()).state;
  state = addSnapshot(
    state,
    normalize({
      ...base,
      observedAt: "2026-09-28T13:00:00Z",
      inventory: [],
      storageStatus: { backpack: { captured: true } },
    }),
  ).state;
  const s = state.characters[0].snapshots.at(-1);
  assert.equal(s.inventory.length, 1);
  assert.equal(s.inventory[0].location, "bank");
  assert.equal(s.notes, "Private notes");
  assert.equal(s.recipes.length, 1);
  assert.equal(s.storageStatus.bank.observedAt, "2026-09-28T12:00:00.000Z");
});
test("older snapshots do not acquire future inventory", () => {
  let state = addSnapshot(emptyState(), rich()).state;
  state = addSnapshot(
    state,
    normalize({ ...base, observedAt: "2026-09-27T12:00:00Z" }),
  ).state;
  assert.equal(state.characters[0].snapshots[0].inventory, undefined);
});
test("malformed item counts, slots, lists, dates and recipes are rejected before save", () => {
  for (const value of [
    { inventory: [{ id: 1, quantity: -2 }] },
    {
      inventory: [
        { id: 1, slot: 1 },
        { id: 2, slot: 1 },
      ],
    },
    { inventory: [{ id: 1, location: "invented" }] },
    { inventory: [{ id: 1, gems: ["bad"] }] },
    { recipes: [{ name: "Missing identity" }] },
    { observedAt: "invalid" },
  ])
    assert.throws(() => normalize({ ...base, ...value }));
});
test("normal character edits retain Legacy perks and rich fields", () => {
  let state = addSnapshot(emptyState(), rich()).state;
  const id = state.characters[0].id;
  state.legacy.perks[id] = { talented: 1 };
  const result = saveManualCharacter(state, { ...base, level: 14 }, id);
  assert.deepEqual(result.state.legacy.perks[id], { talented: 1 });
  assert.equal(result.state.characters[0].snapshots.at(-1).inventory.length, 2);
  assert.throws(
    () => saveManualCharacter(state, { ...base, race: "Human" }, id),
    /combination/,
  );
});
test("account assignment distinguishes otherwise identical character identities", () => {
  const a = normalize(base),
    b = normalize({ ...base, accountId: "second" });
  assert.notEqual(keyOf(a), keyOf(b));
});
test("inventory equipment is visible and canonical gear wins for duplicate equipment slots", () => {
  const c = normalize({
    ...base,
    gear: [{ id: 1, slot: 1 }],
    inventory: [
      { id: 2, location: "equipment", slot: 1 },
      { id: 3, location: "equipment", slot: 2 },
    ],
  });
  assert.deepEqual(
    inventoryFor(c).map((i) => i.id),
    [1, 3],
  );
});
