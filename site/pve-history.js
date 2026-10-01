// Optional private observations, separate from editable progress summaries.
// Stable producer event IDs make repeated/overlapping addon exports idempotent.
const TYPES = new Set(['boss-kill', 'instance-completed', 'loot-received']);
export function normalizePveHistory(value, guid) {
  if (!Array.isArray(value) || value.length > 5000) throw Error('Invalid PvE history size.');
  const required = (v, max = 150) => {
    if (typeof v !== 'string' || !v.trim() || v.length > max) throw Error('Invalid PvE history identifier.');
    return v.trim();
  };
  const rows = value.map(e => {
    if (!e || !TYPES.has(e.type) || typeof e.occurredAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(e.occurredAt) || !Number.isFinite(Date.parse(e.occurredAt))) throw Error('Invalid PvE history event.');
    if (guid && e.characterGuid && guid !== e.characterGuid) throw Error('PvE event belongs to another character.');
    const row = {eventId: required(e.eventId, 500), type: e.type,
      instanceId: required(e.instanceId), occurredAt: new Date(e.occurredAt).toISOString()};
    for (const key of ['encounterId', 'sessionId', 'runId', 'difficulty', 'characterGuid'])
      if (e[key] !== undefined) row[key] = required(e[key], key === 'sessionId' ? 500 : 150);
    if (e.type === 'boss-kill' && !row.encounterId) throw Error('Boss kills require an encounter ID.');
    if (e.type === 'loot-received') {
      if (!Number.isSafeInteger(e.itemId) || e.itemId < 1 || !Number.isSafeInteger(e.quantity ?? 1) || (e.quantity ?? 1) < 1 || (e.quantity ?? 1) > 1000000) throw Error('Invalid PvE loot event.');
      row.itemId = e.itemId; row.quantity = e.quantity ?? 1;
    }
    return row;
  });
  if (new Set(rows.map(e => e.eventId)).size !== rows.length) throw Error('Duplicate PvE history event IDs.');
  return rows.sort((a,b) => a.occurredAt.localeCompare(b.occurredAt) || a.eventId.localeCompare(b.eventId));
}
export function mergePveHistory(previous, incoming) {
  const rows = new Map(previous.map(e => [e.eventId, e]));
  for (const e of incoming) {
    const prior = rows.get(e.eventId);
    if (prior && JSON.stringify(prior) !== JSON.stringify(e)) throw Error('Conflicting PvE history event ID.');
    rows.set(e.eventId, e);
  }
  return normalizePveHistory([...rows.values()]);
}
