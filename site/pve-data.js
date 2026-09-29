import { PVE_INSTANCES, PVE_ITEMS } from "./data/pve.js";
export const instances = PVE_INSTANCES;
export const findInstance = (id) => instances.find((d) => d.id === id);
export const findEncounter = (instanceId, encounterId) =>
  findInstance(instanceId)?.encounters.find((e) => e.id === encounterId);
export const lootFor = (encounter) =>
  encounter.loot.map((ref) => ({
    ...PVE_ITEMS[ref.itemId],
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
          ...d.encounters.flatMap((e) => [
            e.name,
            ...lootFor(e).map((i) => i.name),
          ]),
        ].some((s) => s.toLocaleLowerCase().includes(q))),
  );
}
export function referenceItems() {
  return Object.values(PVE_ITEMS).map((item) => ({
    ...item,
    source: instances
      .flatMap((d) =>
        d.encounters
          .filter((e) => e.loot.some((r) => r.itemId === item.id))
          .map((e) => `${d.name} · ${e.name} (Classic reference)`),
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
  const boss = { id: e.id, name: e.name, completed: completed === true };
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
