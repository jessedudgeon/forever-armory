// Shared guild data is independent of private guild plans and addon observations.
export const GUILD_ROLES = ['master', 'officer', 'member'];
export const GUILD_EVENT_TYPES = ['raid', 'dungeon', 'rp', 'meeting', 'pvp', 'social', 'custom'];
export const GUILD_POST_TYPES = ['announcement', 'ic', 'ooc', 'screenshot', 'adventure', 'achievement', 'loot', 'profession', 'journal'];
export function bounded(value, max, required = false) {
  if (typeof value !== 'string' || value.length > max) throw Error(`Text must be no longer than ${max} characters.`);
  const result = value.trim();
  if (required && !result) throw Error('Complete the required fields.');
  return result;
}
export function httpsUrl(value = '') {
  value = bounded(value, 1000);
  if (!value) return '';
  let url; try { url = new URL(value); } catch { throw Error('Enter a complete HTTPS URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw Error('Use an HTTPS URL without credentials.');
  return url.href;
}
export function guildFields(input) {
  if (!['Horde', 'Alliance', 'Both'].includes(input.faction)) throw Error('Choose a faction.');
  if (!['public', 'private'].includes(input.visibility)) throw Error('Choose guild visibility.');
  return {
    name: bounded(input.name, 100, true), tag: bounded(input.tag || '', 16),
    description: bounded(input.description || '', 3000), rules: bounded(input.rules || '', 4000),
    playStyle: bounded(input.playStyle || '', 40), faction: input.faction,
    recruiting: input.recruiting === true, visibility: input.visibility,
    discordUrl: httpsUrl(input.discordUrl), websiteUrl: httpsUrl(input.websiteUrl),
    imageUrl: httpsUrl(input.imageUrl), bannerUrl: httpsUrl(input.bannerUrl),
  };
}
export function guildEventFields(input) {
  if (!GUILD_EVENT_TYPES.includes(input.type)) throw Error('Choose an event type.');
  const start = new Date(input.startsAt);
  if (!Number.isFinite(start.getTime())) throw Error('Choose a valid event time.');
  const capacity = Number(input.capacity || 0);
  if (!Number.isInteger(capacity) || capacity < 0 || capacity > 500) throw Error('Capacity must be 0 (unlimited) through 500.');
  return {name: bounded(input.name, 150, true), description: bounded(input.description || '', 4000),
    requirements: bounded(input.requirements || '', 2000), notes: bounded(input.notes || '', 2000),
    type: input.type, startsAt: start, capacity};
}
export function filterRoster(rows, filters = {}) {
  return rows.filter(r => (!filters.class || r.class === filters.class)
    && (!filters.rank || r.role === filters.rank)
    && (!filters.profession || (r.professions || []).some(p => p.toLowerCase().includes(filters.profession.toLowerCase())))
    && (!filters.minLevel || r.level >= Number(filters.minLevel))
    && (!filters.maxLevel || r.level <= Number(filters.maxLevel)));
}
