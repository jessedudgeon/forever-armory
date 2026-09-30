// Read-only views over private snapshots. Nothing here writes or publishes data.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scalar = value => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const timestamp = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString() : 'Not captured';

export function questRows(snapshot) {
  const events = [...(snapshot.questHistory || [])].sort((a,b) => b.completedAt.localeCompare(a.completedAt) || a.eventId.localeCompare(b.eventId));
  const timed = new Set(events.map(e => e.questId));
  return [...events, ...(snapshot.completedQuestIDs || []).filter(id => !timed.has(id)).map(questId => ({questId, name:'', completedAt:null}))];
}
export function questPage(rows, {query='', mode='all', page=0, size=50} = {}) {
  const needle = query.trim().toLocaleLowerCase();
  const matches = rows.filter(e => (mode==='all' || (mode==='timed' ? !!e.completedAt : !e.completedAt)) &&
    `${e.questId} ${e.name || ''} ${e.zone || ''}`.toLocaleLowerCase().includes(needle));
  size = Math.max(1, Math.min(100, Math.trunc(size) || 50));
  const pages = Math.max(1, Math.ceil(matches.length / size));
  page = Math.max(0, Math.min(pages-1, Math.trunc(page) || 0));
  return {rows:matches.slice(page*size,(page+1)*size), total:matches.length, page, pages};
}
export function questJournal(snapshot) {
  const captured = snapshot.questHistory !== undefined || snapshot.completedQuestIDs !== undefined;
  return `<section class="panel" id="quest-journal"><h2>Completed quest journal</h2><p>${snapshot.completedQuestIDs?.length ?? 0} known completed IDs · ${snapshot.questHistory?.length ?? 0} recorded turn-ins. Repeatable turn-ins remain separate; backfilled IDs have no invented date or quest name.</p>${!captured?'<p>No quest history captured. Import a ForeverArmory session export after playing.</p>':`<div class="observation-filters"><label>Search quests<input id="quest-search" type="search" placeholder="Quest name, ID or zone"></label><label>Records<select id="quest-mode"><option value="all">All completed records</option><option value="timed">Recorded turn-ins</option><option value="backfill">IDs without a recorded turn-in</option></select></label></div><p id="quest-results" role="status"></p><div class="table-wrap"><table><thead><tr><th>Turned in</th><th>Quest</th><th>Level</th><th>Zone</th></tr></thead><tbody id="quest-rows"></tbody></table></div><div class="actions"><button id="quest-prev">Previous</button><button id="quest-next">Next</button></div>`}${snapshot.questHistoryStatus?.truncated?'<p class="note">The addon marked this export’s timed history as truncated. Previously imported history is retained; this does not imply complete lifetime coverage.</p>':''}</section>`;
}
export function bindQuestJournal(root, snapshot) {
  const input=root.querySelector('#quest-search'); if(!input)return;
  const rows=questRows(snapshot), mode=root.querySelector('#quest-mode'); let page=0;
  const previous=root.querySelector('#quest-prev'), next=root.querySelector('#quest-next');
  const render=()=>{
    const result=questPage(rows,{query:input.value,mode:mode.value,page});page=result.page;
    root.querySelector('#quest-results').textContent=`${result.total} matching records · Page ${page+1} of ${result.pages}`;
    root.querySelector('#quest-rows').innerHTML=result.rows.map(e=>`<tr><td>${e.completedAt?esc(timestamp(e.completedAt)):'Date unknown'}</td><td>${esc(e.name)||`Quest ${e.questId}`}<small class="block">ID ${e.questId}</small></td><td>${e.level??'—'}</td><td>${esc(e.zone)||'—'}</td></tr>`).join('')||'<tr><td colspan="4">No matching completed quests.</td></tr>';
    previous.disabled=page===0;next.disabled=page+1>=result.pages;
  };
  input.oninput=mode.onchange=()=>{page=0;render();};previous.onclick=()=>{page--;render();};next.onclick=()=>{page++;render();};render();
}

export function observationDetails(snapshot) {
  const raw=snapshot.rawAddon, character=raw?.character || {}, metadata=character.metadata || {};
  const facts=[['Stable game GUID',snapshot.gameIdentity?.guid],['First name',snapshot.mainName],['Last name',snapshot.secondaryName],
    ['Addon version',raw?.addonVersion ?? metadata.addonVersion],['Schema version',raw?.schemaVersion ?? metadata.schemaVersion ?? raw?.version],
    ['Capture reason',metadata.exportReason],['Game sex code',character.sex],['Bind location',character.bindLocation]];
  const rows=facts.filter(([,value])=>scalar(value)!=='').map(([label,value])=>`<dt>${label}</dt><dd>${esc(scalar(value))}</dd>`).join('');
  return `<section class="panel"><h2>Imported observation</h2><p>Private to this Armory. Imported facts are separate from website-managed RP stories, guild membership and privacy settings.</p><dl class="observation-facts">${rows}<dt>Current snapshot</dt><dd>${esc(timestamp(snapshot.observedAt))} · ${esc(snapshot.source)}</dd>${raw?`<dt>Addon captured</dt><dd>${esc(timestamp(character.observedAt || metadata.exportedAt))}</dd>`:''}<dt>Imported</dt><dd>${esc(timestamp(snapshot.importedAt))}</dd></dl><p><small>Missing fields mean unavailable, not zero. A manual or partial update can retain older addon observations; their capture time above remains separate.</small></p></section>${reputationDetails(snapshot)}`;
}
export function reputationDetails(snapshot) {
  if(snapshot.reputations===undefined)return '<section class="panel"><h2>Reputation</h2><p>Reputation has not been captured in this character’s imports.</p></section>';
  const rows=snapshot.reputations.filter(r=>r && typeof r==='object' && scalar(r.name));
  return `<details class="panel"><summary>Imported reputation (${rows.length})</summary><p>Raw faction standing codes and values reported by the addon; no unverified Forever standing names are assigned. These may be retained from an earlier import.</p>${rows.length?`<div class="table-wrap"><table><thead><tr><th>Faction</th><th>Standing code</th><th>Value</th><th>Reported range</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(scalar(r.name))}</td><td>${esc(scalar(r.standing))||'—'}</td><td>${esc(scalar(r.value))||'—'}</td><td>${esc(scalar(r.min))||'—'} / ${esc(scalar(r.max))||'—'}</td></tr>`).join('')}</tbody></table></div>`:'<p>No reputation entries reported.</p>'}</details>`;
}
