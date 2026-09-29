// Version-specific wire adapters. Raw observations stay private and are never a public projection.
export function addonV1(payload, importedAt = new Date().toISOString()) {
  const raw = payload.character;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('The export has no character object.');
  const out = {...raw, recordKey: undefined, rawAddon: structuredClone(payload), importedAt};
  for(const key of ['notes','guildId','guildRank','builds'])delete out[key];
  out.gameIdentity = raw.gameIdentity || (raw.guid ? {guid:raw.guid,realm:raw.realm} : undefined);
  out.statistics = raw.statistics || raw.stats;
  out.zone = raw.zone || raw.location?.zone;
  // Only exact known server labels are mapped; arbitrary realm strings are preserved.
  if (!raw.playStyle && raw.realm === 'Classic Beta PvE') out.playStyle = 'Normal';
  if (raw.bags !== undefined && raw.inventory === undefined) {
    if (!Array.isArray(raw.bags)) throw Error('Bag data must be a list of item stacks.');
    out.inventory = raw.bags;
    out.storageStatus = {...raw.storageStatus,backpack:{captured:true},bags:{captured:true}};
  }
  if (Array.isArray(raw.talents)) out.talentDetails = raw.talents.filter(t=>t && typeof t === 'object');
  if (Array.isArray(raw.recipes) && !raw.recipes.length &&
      (raw.recipesCaptured === false || raw.warnings?.some(w=>/no recipes scanned/i.test(w)))) delete out.recipes;
  return out;
}
export const IMPORT_ADAPTERS = new Map([[1, addonV1]]);
export function progressChanges(previous, current) {
  if (!previous) return ['First snapshot'];
  const changes=[];
  if (current.level !== previous.level) changes.push(`Reached level ${current.level}`);
  for (const g of current.gear || []) if (!previous.gear?.some(p=>p.slot===g.slot && p.id===g.id && p.link===g.link)) changes.push(`Equipped ${g.name}`);
  for (const p of current.professions || []) {
    const old=previous.professions?.find(x=>x.name===p.name);
    if(p.rank != null && (!old || p.rank>old.rank)) changes.push(`${p.name} increased to ${p.rank}`);
  }
  for (const t of current.talentDetails || []) {
    const same=x=>t.nodeID!=null ? x.nodeID===t.nodeID && x.treeID===t.treeID : x.name===t.name;
    const old=previous.talentDetails?.find(same);
    if(t.rank>0 && (!old || old.rank!==t.rank)) changes.push(`${t.name || 'Talent'} rank ${t.rank}`);
  }
  const added=(current.recipes||[]).filter(r=>r.known && !previous.recipes?.some(p=>p.id===r.id&&p.profession===r.profession&&p.known));
  if(added.length)changes.push(`Learned ${added.length} recipes`);
  for(const q of current.quests||[]) {
    const old=previous.quests?.find(p=>p.id===q.id);
    if(!old)changes.push(`Quest added: ${q.title}`);
    else if(q.completed&&!old.completed)changes.push(`Quest ready to turn in: ${q.title}`);
  }
  const priorEvents=new Set((previous.questHistory||[]).map(e=>e.eventId));
  for(const e of current.questHistory||[])if(!priorEvents.has(e.eventId))changes.push(`Quest completed: ${e.name || `Quest ${e.questId}`}`);
  return changes;
}
