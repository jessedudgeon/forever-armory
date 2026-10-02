// Curated evidence is mandatory. A Forever-looking URL alone proves nothing.
export const CONTENT_STATUS = Object.freeze({confirmed:'Confirmed in Forever',observed:'Reported for Forever','likely-inherited':'Needs Forever verification',unknown:'Not yet verified'});
export function hasEvidence(e) {
  return !!e && ['confirmed','observed'].includes(e.status)
    && ['official-announcement','forever-guide','forever-database','addon','user-observation','forever-api'].includes(e.sourceType)
    && typeof e.source === 'string' && /^https:\/\//.test(e.source)
    && /^\d{4}-\d\d-\d\d$/.test(e.verifiedAt || '') && Number.isFinite(Date.parse(e.verifiedAt));
}
export const isPublished = record => hasEvidence(record?.evidence);
export function evidenceLabel(record) {
  return record?.evidence?.sourceType === 'official-announcement' && isPublished(record)
    ? 'Announced for Forever' : CONTENT_STATUS[record?.evidence?.status] || CONTENT_STATUS.unknown;
}
// Explicit field overrides prevent an announcement from validating levels, entrances, etc.
export function projectFields(record) {
  const projected={...record};
  for(const [field,e] of Object.entries(record.fieldEvidence || {})) {
    if(!hasEvidence(e)) projected[field]=Array.isArray(record[field])?[]:null;
  }
  return projected;
}
export function publishedLoot(rows = []) {
  return rows.filter(isPublished).map(row=>{
    const item=projectFields(row);
    // Drop association evidence never establishes a percentage.
    if(!hasEvidence(row.fieldEvidence?.dropRate) || !Number.isFinite(row.dropRate) || row.dropRate<0 || row.dropRate>100) delete item.dropRate;
    return item;
  });
}
export function publicCatalog(records) {
  return records.filter(isPublished).map(raw=>{
    const d=projectFields(raw);
    return {minimumLevel:null,playerSize:null,map:null,accessRequirements:[],attunement:[],preparation:[],lockout:null,wings:[],mechanics:[],...d,
      loot:publishedLoot(d.loot),
      quests:(d.quests || []).filter(isPublished).map(q=>({...projectFields(q),prerequisites:(q.prerequisites || []).filter(isPublished)})),
      encounters:(d.encounters || []).filter(isPublished).map(e=>({abilities:[],mechanics:[],tankNotes:[],healerNotes:[],dpsNotes:[],strategy:'',questIds:[],prerequisites:[],artwork:null,wingId:null,...projectFields(e),order:hasEvidence(e.orderEvidence)?e.order:null,loot:publishedLoot(e.loot)}))
        .sort((a,b)=>(a.order??Infinity)-(b.order??Infinity)||a.id.localeCompare(b.id)),
    };
  });
}
