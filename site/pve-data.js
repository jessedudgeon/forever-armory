import { PVE_INSTANCES } from "./data/pve.js";
import { REFERENCE_ITEMS } from "./data/items.js";
import {publicCatalog, isPublished, projectFields, publishedLoot} from "./content-evidence.js";
export const instances = publicCatalog(PVE_INSTANCES);
// Private compatibility only; never use this registry to populate public choices/search.
export const recordedInstanceKind = id => PVE_INSTANCES.find(d => d.id === id)?.kind;
export const findInstance = (id) => instances.find((d) => d.id === id);
export const findEncounter = (instanceId, encounterId) =>
  findInstance(instanceId)?.encounters.find((e) => e.id === encounterId);
export const lootFor = (encounter) =>
  publishedLoot(encounter.loot).map((ref) => ({
    ...(isPublished(REFERENCE_ITEMS[ref.itemId]) ? projectFields(REFERENCE_ITEMS[ref.itemId]) : {}),
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
          ...lootFor(d).map(i => i.name),
          ...d.encounters.flatMap((e) => [
            e.name,
            ...lootFor(e).map((i) => i.name),
          ]),
        ].some((s) => String(s ?? "").toLocaleLowerCase().includes(q))),
  );
}
export function referenceItems() {
  return Object.values(REFERENCE_ITEMS).filter(isPublished).map(item => ({
    ...projectFields(item), source: itemSources(item.id).map(s => `${s.instance} · ${s.encounter || s.sourceName} (Forever report)`).join("; "),
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

export function lootRows(d) {
  return [
    ...d.encounters.flatMap(e => lootFor(e).map(item => ({...item, sourceType:'boss', sourceName:e.name, encounterId:e.id, encounter:e.name, instanceId:d.id}))),
    ...lootFor(d).map(item => ({...item, encounterId:null, instanceId:d.id})),
  ];
}
export function itemSources(itemId) {
  return instances.flatMap(d => lootRows(d).filter(r => r.id === Number(itemId)).map(r => ({...r, instance:d.name, kind:d.kind})));
}
export function instanceLoot(instanceId) {
  const d=findInstance(instanceId);
  return d ? lootRows(d) : [];
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
      (!filters.sourceType || i.sourceType === filters.sourceType) &&
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
