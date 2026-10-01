import { PVE_INSTANCES } from "./data/pve.js";
import { REFERENCE_ITEMS } from "./data/items.js";
// Unknown values remain null/empty, never guessed from Classic conventions.
export const instances = PVE_INSTANCES.map((d) => ({
  minimumLevel: null,
  playerSize: null,
  map: null,
  accessRequirements: [],
  attunement: [],
  preparation: [],
  lockout: null,
  wings: [],
  mechanics: [],
  ...d,
  encounters: d.encounters.map((e) => ({
    abilities: [],
    tankNotes: [],
    healerNotes: [],
    dpsNotes: [],
    strategy: "",
    questIds: [],
    prerequisites: [],
    artwork: null,
    wingId: null,
    ...e,
  })),
}));
export const findInstance = (id) => instances.find((d) => d.id === id);
export const findEncounter = (instanceId, encounterId) =>
  findInstance(instanceId)?.encounters.find((e) => e.id === encounterId);
export const lootFor = (encounter) =>
  encounter.loot.map((ref) => ({
    ...REFERENCE_ITEMS[ref.itemId],
    ...ref,
    id: ref.itemId,
  }));
export function searchInstances(query = "", filter = "all") {
  const q = query.trim().toLocaleLowerCase();
  return instances.filter(
    (d) =>
      (filter === "all" ||
        (filter === "raids"
          ? d.kind === "raid"
          : filter === "dungeons"
            ? d.kind === "dungeon"
            : filter === "new"
              ? d.new
              : filter === "classic"
                ? !d.new
                : d.faction === filter || d.faction === "Both")) &&
      (!q ||
        [
          d.name,
          d.zone,
          ...d.quests.map(q => typeof q === "string" ? q : q.name),
          ...d.encounters.flatMap((e) => [
            e.name,
            ...lootFor(e).map((i) => i.name),
          ]),
        ].some((s) => s.toLocaleLowerCase().includes(q))),
  );
}
export function referenceItems() {
  return Object.values(REFERENCE_ITEMS).map((item) => ({
    ...item,
    source: instances
      .flatMap((d) =>
        d.encounters
          .filter((e) => e.loot.some((r) => r.itemId === item.id))
          .map((e) => `${d.name} · ${e.name} (Forever source)`),
      )
      .join("; "),
  }));
}
// Keep imported/legacy encounter names and unrelated milestones when updating one boss.
// Whole-instance completion is an explicit user decision, never inferred from partial data.
export function encounterProgress(
  progress,
  instanceId,
  encounterId,
  completed,
) {
  const d = findInstance(instanceId),
    e = findEncounter(instanceId, encounterId);
  if (!d || !e) throw Error("Unknown encounter.");
  const prior = (progress || []).find((p) => p.id === d.id);
  const bosses = [...(prior?.bosses || [])];
  const at = bosses.findIndex(
    (b) => b.id === e.id || (!b.id && b.name === e.name),
  );
  const boss = {
    ...(at >= 0 ? bosses[at] : {}),
    id: e.id,
    name: e.name,
    completed: completed === true,
  };
  if (at < 0) bosses.push(boss);
  else bosses[at] = boss;
  const entry = {
    ...prior,
    id: d.id,
    name: d.name,
    type: d.kind,
    bosses,
    completed: prior?.completed === true,
    status: prior?.status || "In progress",
    notes: prior?.notes || "",
  };
  return [...(progress || []).filter((p) => p.id !== d.id), entry];
}

export function itemSources(itemId) {
  return instances.flatMap((d) =>
    d.encounters.flatMap((e) =>
      e.loot
        .filter((r) => r.itemId === Number(itemId))
        .map((r) => ({
          instanceId: d.id,
          instance: d.name,
          kind: d.kind,
          encounterId: e.id,
          encounter: e.name,
          ...r,
        })),
    ),
  );
}
export function instanceLoot(instanceId) {
  const d = findInstance(instanceId);
  return d
    ? d.encounters.flatMap((e) =>
        lootFor(e).map((item) => ({
          ...item,
          encounterId: e.id,
          encounter: e.name,
          instanceId: d.id,
        })),
      )
    : [];
}
// Explicit class restrictions only. Missing metadata is not proof of eligibility.
export function filterLoot(rows, filters = {}) {
  const norm = (v) => String(v ?? "").toLowerCase();
  return rows.filter(
    (i) =>
      (!filters.query ||
        norm(i.name).includes(norm(filters.query)) ||
        String(i.id) === filters.query) &&
      (!filters.boss || i.encounterId === filters.boss) &&
      (!filters.slot || norm(i.slot) === norm(filters.slot)) &&
      (!filters.type || norm(i.subclass) === norm(filters.type)) &&
      (!filters.quality || norm(i.quality) === norm(filters.quality)) &&
      (!filters.class ||
        !i.allowedClasses?.length ||
        i.allowedClasses.some((c) => norm(c) === norm(filters.class))),
  );
}

// Missing completion is unknown, never inferred from the catalog or owned loot.
export function instanceProgress(progress, instanceId, completed) {
  const d = findInstance(instanceId);
  if (!d) throw Error("Unknown instance.");
  const prior = (progress || []).find(p => p.id === d.id);
  return [...(progress || []).filter(p => p.id !== d.id), {
    ...prior, id: d.id, name: d.name, type: d.kind,
    bosses: prior?.bosses || [], completed: completed === true,
    status: completed ? "Complete" : "In progress", notes: prior?.notes || "",
  }];
}
export function journalProgress(snapshot, instance) {
  const record = snapshot?.progress?.find(p => p.id === instance.id);
  const bosses = instance.encounters.map(e => ({...e,
    record: record?.bosses?.find(b => b.id === e.id || (!b.id && b.name === e.name)),
  }));
  return {record, bosses, completed: record?.completed === true,
    completedBosses: bosses.filter(b => b.record?.completed).length,
    history: (snapshot?.pveHistory || []).filter(e => e.instanceId === instance.id),
  };
}
// Numeric game IDs must be verified for Forever before a catalog entry supplies one.
export function journalQuestStatus(snapshot, instanceId, quest) {
  const explicit = snapshot?.progress?.find(p => p.id === instanceId)?.quests?.find(q => q.id === String(quest.id));
  if (explicit?.completed) return "Completion recorded";
  if (quest.gameQuestId != null) {
    if (snapshot?.completedQuestIDs?.includes(quest.gameQuestId) || snapshot?.questHistory?.some(e => e.questId === quest.gameQuestId)) return "Turned in";
    const active = snapshot?.quests?.find(q => q.id === quest.gameQuestId);
    if (active) return active.completed ? "Ready to turn in" : "In quest log";
  }
  return explicit ? "Not marked complete" : "Not recorded";
}
