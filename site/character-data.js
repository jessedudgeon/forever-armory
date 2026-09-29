// Shared validation boundary for manual input, backups, cloud records, and addon imports.
export const text = (v, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
export function list(v, max = 2000) {
  if (v == null) return [];
  if (!Array.isArray(v) || v.length > max)
    throw Error("A data list is invalid or too large.");
  return v;
}
export function integer(v, min = 0, max = 100000000) {
  if (!Number.isInteger(v) || v < min || v > max)
    throw Error("An item or progress number is invalid.");
  return v;
}
export const LOCATIONS = [
  "equipment",
  "backpack",
  "bags",
  "bank",
  "keyring",
  "other",
  "account",
];
export function itemInstance(raw, defaultLocation = "bags") {
  if (!raw || typeof raw !== "object") throw Error("Invalid inventory item.");
  const id = integer(raw.id ?? raw.itemId, 1),
    location = raw.location ?? (raw.bag === 0 ? "backpack" : defaultLocation);
  if (!LOCATIONS.includes(location))
    throw Error(
      "Unknown inventory location. Use other with a storage label for custom storage.",
    );
  const item = {
    id,
    name: text(raw.name, 150) || `Item ${id}`,
    quantity: integer(raw.quantity ?? raw.count ?? 1, 1, 1000000),
    location,
    container: text(String(raw.container ?? raw.bag ?? ""), 60),
    slot: raw.slot == null ? null : integer(raw.slot, 0, 10000),
    quality: raw.quality == null ? null : integer(raw.quality, 0, 8),
    binding: text(raw.binding, 80),
    enchantments: list(raw.enchantments, 10).map((x) => text(String(x), 150)),
    gems: list(raw.gems, 10).map((x) => integer(x, 1)),
    link: text(raw.link ?? raw.itemLink, 700),
    icon: text(raw.icon, 150),
    storageLabel: text(raw.storageLabel, 100),
  };
  if (raw.durability != null)
    item.durability = {
      current: integer(raw.durability.current),
      max: integer(raw.durability.max),
    };
  if (raw.observedAt) item.observedAt = new Date(raw.observedAt).toISOString();
  return item;
}
export function normalizeInventory(raw, at) {
  const items = list(raw, 2000).map((x) => ({
    ...itemInstance(x),
    observedAt: x.observedAt ? new Date(x.observedAt).toISOString() : at,
  }));
  const slots = items
    .filter((x) => x.slot !== null)
    .map((x) => JSON.stringify([x.location, x.container, x.slot]));
  if (new Set(slots).size !== slots.length)
    throw Error("Duplicate storage slots in this import.");
  return items;
}
export function recipe(raw) {
  if (!raw || typeof raw !== "object") throw Error("Invalid recipe.");
  return {
    id: text(String(raw.id ?? ""), 80),
    name: text(raw.name, 150),
    profession: text(raw.profession, 60),
    skill: raw.skill == null ? null : integer(raw.skill, 0, 10000),
    known: raw.known !== false,
    craftedItem: raw.craftedItem == null ? null : integer(raw.craftedItem, 1),
    quantity: integer(raw.quantity ?? 1, 1, 1000),
    reagents: list(raw.reagents, 30).map((x) => ({
      id: integer(x.id, 1),
      quantity: integer(x.quantity, 1, 10000),
    })),
    source: text(raw.source, 400),
  };
}
export function progression(raw) {
  return list(raw, 500).map((x) => ({
    id: text(String(x.id ?? x.name ?? ""), 150),
    name: text(x.name, 150),
    type: ["dungeon", "raid", "reputation", "achievement", "other"].includes(
      x.type,
    )
      ? x.type
      : "other",
    status: text(x.status, 100),
    completed: x.completed === true,
    bosses: list(x.bosses, 100).map((b) => ({
      ...(b.id ? { id: text(b.id, 150) } : {}),
      name: text(b.name, 150),
      completed: b.completed === true,
    })),
    notes: text(x.notes, 1000),
  }));
}
export function characterExtras(o, at) {
  const out = {};
  if (o.inventory !== undefined)
    out.inventory = normalizeInventory(o.inventory, at);
  if (o.storageStatus !== undefined) {
    out.storageStatus = {};
    for (const [key, value] of Object.entries(o.storageStatus || {})) {
      if (!LOCATIONS.includes(key)) throw Error("Invalid storage coverage.");
      out.storageStatus[key] = {
        captured: value?.captured === true,
        observedAt: value?.observedAt
          ? new Date(value.observedAt).toISOString()
          : at,
      };
    }
  }
  if (o.recipes !== undefined) {
    out.recipes = list(o.recipes, 2000).map(recipe);
    if (
      out.recipes.some((r) => !r.id || !r.name || !r.profession) ||
      new Set(out.recipes.map((r) => r.profession + ":" + r.id)).size !==
        out.recipes.length
    )
      throw Error("Recipes need unique IDs, names, and professions.");
  }
  if (o.progress !== undefined) out.progress = progression(o.progress);
  if (o.gearObservedAt)
    out.gearObservedAt = new Date(o.gearObservedAt).toISOString();
  if (o.notes !== undefined) out.notes = text(o.notes, 4000);
  if (o.guildId !== undefined) out.guildId = text(o.guildId, 100);
  if (o.guildRank !== undefined) out.guildRank = text(o.guildRank, 80);
  if (o.statistics !== undefined) {
    out.statistics = {};
    for (const [key, value] of Object.entries(o.statistics || {}).slice(
      0,
      80,
    )) {
      if (
        !/^[\w -]{1,60}$/.test(key) ||
        typeof value !== "number" ||
        !Number.isFinite(value)
      )
        throw Error("Invalid character statistic.");
      out.statistics[key] = value;
    }
  }
  if (o.builds !== undefined)
    out.builds = list(o.builds, 40).map((b) => {
      if (!/^[a-z]+\/[0-9]{1,2}\/[0-9]{1,200}$/.test(b.code))
        throw Error("Invalid saved talent code.");
      return {
        name: text(b.name, 100),
        code: b.code,
        updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : at,
      };
    });
  return out;
}
export function normalizeGuild(g) {
  if (
    !g ||
    !text(g.id, 100) ||
    !/^[a-zA-Z0-9_-]+$/.test(g.id) ||
    !text(g.name, 100) ||
    !["Horde", "Alliance", "Both"].includes(g.faction)
  )
    throw Error("Enter a guild name and faction.");
  return {
    id: text(g.id, 100),
    name: text(g.name, 100),
    faction: g.faction,
    description: text(g.description, 3000),
    recruitment: text(g.recruitment, 2000),
    ranks: list(g.ranks, 30).map((r) => text(r, 80)),
    officers: list(g.officers, 100).map((r) => text(r, 150)),
    progress: progression(g.progress),
    events: list(g.events, 100).map((e) => ({
      title: text(e.title, 150),
      date: text(e.date, 40),
      notes: text(e.notes, 1000),
    })),
    updatedAt: g.updatedAt
      ? new Date(g.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}
export function inventoryFor(character) {
  return [
    ...(character.gear || []).map((g) => ({
      ...g,
      quantity: 1,
      location: "equipment",
      container: "",
      observedAt: character.gearObservedAt || character.observedAt,
    })),
    ...(character.inventory || []).filter(
      (i) =>
        i.location !== "equipment" ||
        !(character.gear || []).some((g) => g.slot === i.slot),
    ),
  ];
}
export function searchInventory(
  character,
  { query = "", location = "all", quality = "all", duplicates = false } = {},
) {
  const all = inventoryFor(character),
    counts = new Map();
  for (const i of all) counts.set(i.id, (counts.get(i.id) || 0) + 1);
  const q = query.trim().toLowerCase();
  return all.filter(
    (i) =>
      (location === "all" || i.location === location) &&
      (quality === "all" || i.quality === Number(quality)) &&
      (!duplicates || counts.get(i.id) > 1) &&
      (!q ||
        `${i.id} ${i.name} ${i.location} ${i.storageLabel || ""}`
          .toLowerCase()
          .includes(q)),
  );
}
