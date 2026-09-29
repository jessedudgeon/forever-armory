// Compatibility exports for older integrations. The PvE catalog is the only source.
import {
  instances,
  searchInstances,
  lootFor,
} from "./pve-data.js";
const legacy = (d) =>
  d && { ...d, bosses: d.encounters.map((e) => [e.name, lootFor(e)]) };
export const DUNGEONS = instances.map(legacy);
export const findDungeon = (id) => DUNGEONS.find((d) => d.id === id);
export const searchDungeons = (query, filter) =>
  searchInstances(query, filter).map(legacy);
