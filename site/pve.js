import {evidenceLabel} from "./content-evidence.js";
import {breadcrumbs, sectionNavigation, bindSectionNavigation} from './navigation.js';
import {
  instances,
  findInstance,
  findEncounter,
  searchInstances,
  lootFor,
  instanceLoot,
  journalProgress,
  journalQuestStatus,
} from "./pve-data.js";
import { lootPanel, bindLoot } from "./pve-loot.js";
import { itemButton } from "./items.js";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let query = "",
  filter = "all",
  selectedCharacter = "";
const warning =
  '<div class="note">Announcements and Forever guide reports are labeled separately. Guide reports are not independently verified in-game. Missing details remain unknown.</div>';
const heading = (title, sub) =>
  `<div class="page-heading"><div><span class="eyebrow">PVE JOURNAL</span><h1>${esc(title)}</h1><p>${esc(sub)}</p></div></div>`;
function cards(state = {}) {
  const matches = searchInstances(query, filter);
  return `<p class="muted">${matches.length} of ${instances.length} instances</p><div class="dungeon-grid">${matches.map((d) => `<a class="dungeon-card" href="#pve/${d.id}"><small>${d.kind.toUpperCase()} · ${esc(evidenceLabel(d))}</small><strong>${esc(d.name)}</strong><span>${esc(d.zone || "Location not yet verified")}${d.level ? " · Level "+esc(d.level) : ""}</span><em>${d.encounters.length} listed encounters · ${instanceLoot(d.id).length} listed rewards</em>${selectedCharacter ? `<span>${progressCaption(d, state)}</span>` : ""}</a>`).join("") || "<p>No instances match this search.</p>"}</div>`;
}
function currentSnapshot(state) {
  return state.characters?.find(c => c.id === selectedCharacter)?.snapshots.at(-1);
}
function progressCaption(d, state) {
  const p = journalProgress(currentSnapshot(state), d);
  return `${p.completed ? "Completion recorded" : p.record ? "Not marked complete" : "Completion not recorded"} · ${p.completedBosses}/${d.encounters.length} listed bosses marked`;
}
function characterSelect(state) {
  const chars = state.characters || [];
  if (!chars.some(c => c.id === selectedCharacter)) selectedCharacter = chars[0]?.id || "";
  return chars.length ? `<label>Character<select id="pve-character">${chars.map(c => `<option value="${esc(c.id)}" ${c.id === selectedCharacter ? "selected" : ""}>${esc(c.snapshots.at(-1).name)} · ${esc(state.gameAccounts?.find(a => a.id === c.snapshots.at(-1).accountId)?.name || "Default account")}</option>`).join("")}</select></label>` : "";
}
function notes(title, values) {
  return values?.length
    ? `<h3>${esc(title)}</h3><ul>${values.map((v) => `<li>${esc(typeof v === "string" ? v : v.name || v.description)}</li>`).join("")}</ul>`
    : "";
}
function questsHTML(d, ids, snapshot) {
  const quests = ids ? d.quests.filter(q => ids.includes(q.id)) : d.quests;
  if (!quests.length) return "";
  return `<section class="panel"><h2>Related quests & prerequisite chains</h2>${quests.map(q => typeof q === "string" ? `<p>${esc(q)}</p>` : `<article class="pve-quest"><h3>${esc(q.name)}</h3>${q.description ? `<p>${esc(q.description)}</p>` : ""}${q.requirements || q.faction ? `<p>${esc(q.requirements || "")}${q.faction ? ` · ${esc(q.faction)}` : ""}</p>` : ""}${snapshot ? `<p><strong>${esc(journalQuestStatus(snapshot, d.id, q))}</strong>${q.gameQuestId == null ? " · Automatic quest matching is not available yet." : ""}</p>` : ""}${q.prerequisites?.length ? `<h4>Before you pick it up</h4><ol>${q.prerequisites.map(step => `<li>${esc(step.name)}${step.prerequisiteIds?.length ? `<small> After: ${step.prerequisiteIds.map(id => esc(q.prerequisites.find(p => p.id === id)?.name || id)).join("; ")}</small>` : ""}</li>`).join("")}</ol>` : ""}${q.rewardItemIds?.map(id => itemButton(instanceLoot(d.id).find(i=>i.id===id) || {id})).join(" ") || ""}${q.source ? `<p><a href="${esc(q.source)}" target="_blank" rel="noopener">Quest reference ↗</a></p>` : ""}</article>`).join("")}</section>`;
}
function artworkHTML(art) {
  return art && typeof art.src === "string" && /^\.\/assets\//.test(art.src)
    ? `<figure><img class="pve-art" src="${esc(art.src)}" alt="${esc(art.alt || "")}" loading="lazy">${art.credit ? `<figcaption>${esc(art.credit)}</figcaption>` : ""}</figure>`
    : "";
}
function instanceDetails(d) {
  const content = `${artworkHTML(d.map)}${d.minimumLevel != null ? `<p>Minimum level: ${esc(d.minimumLevel)}</p>` : ""}${d.playerSize ? `<p>Group size: ${esc(d.playerSize)}</p>` : ""}${d.lockout ? `<p>Lockout / reset: ${esc(d.lockout)}</p>` : ""}${notes("Keys & access", d.accessRequirements)}${notes("Attunement", d.attunement)}${notes("Preparation", d.preparation)}${notes("Instance mechanics", d.mechanics)}${notes("Wings / sections", d.wings)}`;
  return content ? `<section class="panel" id="pve-access" data-section-anchor><h2>Access & preparation</h2>${content}</section>` : "";
}
function encounterCard(d, e, detail = false) {
  return `<section class="panel dungeon-boss"><div class="section-row"><h2>${detail ? esc(e.name) : `<a href="#pve/${d.id}/${e.id}">${e.order != null ? e.order+". " : ""}${esc(e.name)}</a>`}</h2><span class="muted">${e.encounterType === 'rare' ? 'Rare encounter · ' : e.encounterType === 'group' ? 'Enemy group · ' : ''}${e.loot.length} listed drops</span></div><p class="muted">${esc(evidenceLabel(e))}${e.area ? ` · ${esc(e.area)}` : ""}</p>${artworkHTML(e.artwork)}${e.description ? `<p>${esc(e.description)}</p>` : ""}${detail ? `${e.strategy ? `<h3>Strategy</h3><p>${esc(e.strategy)}</p>` : ""}${notes("Abilities", e.abilities)}${notes("Mechanics",e.mechanics)}${notes("Tank notes", e.tankNotes)}${notes("Healer notes", e.healerNotes)}${notes("DPS notes", e.dpsNotes)}${notes("Prerequisites", e.prerequisites)}${notes("Encounter notes",e.notes)}` : ""}${e.loot.length ? `${detail ? '<h3>Loot</h3>' : ''}<ul class="dungeon-loot">${lootFor(e).map(i=>`<li><span aria-hidden="true">◆</span>${itemButton(i)}</li>`).join('')}</ul>` : '<p class="muted">Drops have not yet been documented here.</p>'}${detail && e.source ? `<p><a href="${esc(e.source)}" target="_blank" rel="noopener">Encounter report ↗</a> · Checked ${esc(e.evidence.verifiedAt)}</p>` : ""}</section>`;
}
function tracker(d, state) {
  if (!state.characters?.length) return '<section class="panel" id="pve-tracker"><h2>Your instance progress</h2><p>Add a character to keep private dungeon and raid records.</p><a href="#roster">Open characters →</a></section>';
  return `<section class="panel" id="pve-tracker"><h2>Your instance progress</h2>${characterSelect(state)}<p class="muted">Private observations and manual tracking. Boss checks do not imply a complete clear or create kill events.</p><div id="pve-progress"></div><p id="pve-error" role="alert" class="error"></p></section>`;
}
export function pveView(id, encounterId, state) {
  if (!id) filter = "all";
  const overview = ["raids", "dungeons", "new", "classic"].includes(id);
  if (overview) filter = id;
  const d = overview ? null : findInstance(id);
  if (id && !d && !overview)
    return (
      heading(
        "Instance not found",
        "Browse the shared dungeon and raid journal.",
      ) + '<a href="#pve">All instances</a>'
    );
  if (!d)
    return (
      breadcrumbs([["Game Guide","#game-guide"],["Dungeons & Raids","#pve"],...(filter === "all" ? [] : [[{raids:"Raids",dungeons:"Dungeons",new:"Forever listings",classic:"Returning dungeons"}[filter]]])]) +
      heading(filter === "raids" ? "Raid Journal" : filter === "dungeons" ? "Dungeon Journal" : "Dungeon & Raid Journal", "Explore instances, encounters, quests and your character’s progress") +
      warning +
      `<nav class="encounter-nav" aria-label="Journal categories"><a href="#pve">All instances</a><a href="#pve/dungeons">Dungeon overview</a><a href="#pve/raids">Raid overview</a></nav>${characterSelect(state)}<section class="panel"><div class="dungeon-controls"><label>Search instances, encounters, quests or loot<input id="dungeon-search" type="search" value="${esc(query)}" placeholder="Try Witherfang or Meteor Shard"></label><label>Show<select id="dungeon-filter">${[
        ["all", "All instances"],
        ["dungeons", "Dungeons"],
        ["raids", "Raids"],
        ["new", "Forever listings"],
        ["classic", "Returning dungeons"],
      ]
        .map(
          ([v, n]) =>
            `<option value="${v}" ${filter === v ? "selected" : ""}>${n}</option>`,
        )
        .join(
          "",
        )}</select></label></div><div id="dungeon-results">${cards(state)}</div></section>`
    );
  const e = encounterId && findEncounter(id, encounterId);
  if (encounterId && !e)
    return (
      heading("Encounter not found", d.name) +
      `<a href="#pve/${d.id}">Back to instance</a>`
    );
  if (!state.characters?.some(c => c.id === selectedCharacter)) selectedCharacter = state.characters?.[0]?.id || "";
  const kind=d.kind==='raid'?'Raids':'Dungeons';
  const quests=questsHTML(d,e?.questIds,currentSnapshot(state));
  const access=!e ? instanceDetails(d) : '';
  const hasLoot=!e && instanceLoot(d.id).length>0;
  const sections=[['Overview','pve-overview'],...(d.encounters.length?[['Bosses','pve-bosses']]:[]),...(hasLoot?[['Loot','pve-loot-section']]:[]),...(quests?[['Quests','pve-quests']]:[]),...(access?[['Requirements','pve-access']]:[]),['Progress','pve-tracker']];
  const gaps=[!d.encounters.length?'bosses':null,!instanceLoot(d.id).length?'loot':null,!d.quests.length?'quests':null,!d.entrance?'entrance details':null].filter(Boolean);
  return `${breadcrumbs([['Game Guide','#game-guide'],['Dungeons & Raids','#pve'],[kind,'#pve/'+kind.toLowerCase()],[d.name,'#pve/'+d.id],...(e?[[e.name]]:[])])}${sectionNavigation('PvE sections',sections)}<div id="pve-overview" data-section-anchor></div><a href="#pve">← All instances</a>${heading(e?.name || d.name, `${d.kind === "raid" ? "Raid" : "Dungeon"}${d.zone ? " · "+d.zone : ""}${d.level ? " · Recommended level "+d.level : ""}`)}${e ? `<p><a href="#pve/${d.id}">${esc(d.name)} · All encounters</a></p>` : ""}<p><strong>${esc(evidenceLabel(d))}</strong> · Checked ${esc(d.evidence.verifiedAt)}</p>${d.description ? `<p>${esc(d.description)}</p>` : ""}${!e && d.entrance ? `<p><strong>Entrance:</strong> ${esc(d.entrance)}</p>` : ""}<p class="muted">${d.evidence.sourceType === 'official-announcement' ? 'The announcement does not establish current access.' : 'Guide reports have not been independently verified in the Forever client.'}${!e && gaps.length ? ' Still researching: '+esc(gaps.join(', '))+'.' : ''}</p>${d.encounters.length ? `<div id="pve-bosses" data-section-anchor><h2>Bosses & encounters</h2><p class="muted">Shown in guide order; optional encounters and alternate routes may vary.</p><nav class="encounter-nav" aria-label="Encounters">${d.encounters.map(b=>`<a href="#pve/${d.id}/${b.id}" ${b.id===encounterId?'aria-current="page"':''}>${b.order != null ? b.order+'. ' : ''}${esc(b.name)}</a>`).join('')}</nav><div class="dungeon-bosses">${(e?[e]:d.encounters).map(b=>encounterCard(d,b,!!e)).join('')}</div></div>` : '<p id="pve-bosses" class="muted">Boss names and loot have not been verified for this instance. We do not substitute Classic encounters or drops.</p>'}${hasLoot ? `<div id="pve-loot-section" data-section-anchor>${lootPanel()}</div>` : ''}${quests ? `<div id="pve-quests" data-section-anchor ${e?`data-boss="${esc(e.id)}"`:''}>${quests}</div>` : ''}${access}${tracker(d,state)}${d.source ? `<p>Source: <a href="${esc(d.source)}" target="_blank" rel="noopener">Forever source ↗</a></p>` : ''}`;

}
export function bindPve(root, id, getState, onProgress) {
  bindSectionNavigation(root);
  void bindLoot(root, id, getState());
  root.querySelector("#dungeon-search")?.addEventListener("input", (e) => {
    query = e.target.value;
    root.querySelector("#dungeon-results").innerHTML = cards(getState());
  });
  root.querySelector("#dungeon-filter")?.addEventListener("change", (e) => {
    filter = e.target.value;
    location.hash = filter === "all" ? "pve" : "pve/" + filter;
  });
  const d = findInstance(id),
    select = root.querySelector("#pve-character");
  if (!select) return;
  if (!d) {
    select.onchange = () => {selectedCharacter = select.value; root.querySelector("#dungeon-results").innerHTML = cards(getState());};
    return;
  }
  const progressRoot = root.querySelector("#pve-progress");
  const errorRoot = root.querySelector("#pve-error");
  function draw() {
    const c = getState().characters.find((c) => c.id === selectedCharacter);
    const snapshot = c?.snapshots.at(-1);
    const p = journalProgress(snapshot, d);
    progressRoot.innerHTML = `<p>${progressCaption(d, getState())}</p><label class="encounter-check pve-completion"><input type="checkbox" data-instance-complete ${p.completed ? "checked" : ""}>Mark whole ${esc(d.kind)} complete</label>` + p.bosses.map(e => `<label class="encounter-check"><input type="checkbox" data-encounter="${e.id}" ${e.record?.completed ? "checked" : ""}>${esc(e.name)}${e.record?.kills != null ? ` · ${e.record.kills} reported kills` : ""}${e.record?.lastKilledAt ? ` · Last: ${esc(new Date(e.record.lastKilledAt).toLocaleString())}` : ""}</label>`).join("") +
      (p.history.length ? `<h3>Imported instance history</h3><p>Latest ${Math.min(20, p.history.length)} of ${p.history.length} retained observations; independent of manual checks.</p><ul>${p.history.slice(-20).reverse().map(e => `<li>${esc(new Date(e.occurredAt).toLocaleString())} · ${esc(e.type)}${e.encounterId ? ` · ${esc(findEncounter(d.id, e.encounterId)?.name || e.encounterId)}` : ""}${e.itemId ? ` · ${itemButton({id:e.itemId})} × ${e.quantity}` : ""}</li>`).join("")}</ul>` : '<p class="muted">No imported kill, clear or loot events recorded.</p>');
    const quests = root.querySelector("#pve-quests");
    if (quests) quests.innerHTML = questsHTML(d, quests.dataset.boss ? findEncounter(d.id, quests.dataset.boss).questIds : null, snapshot);

  }
  select.onchange = () => {
    selectedCharacter = select.value;
    draw();
  };
  progressRoot.onchange = async (event) => {
    const box = event.target;
    if (!box.matches("[data-encounter], [data-instance-complete]")) return;
    errorRoot.textContent = "";
    select.disabled = true;
    root
      .querySelectorAll("[data-encounter], [data-instance-complete]")
      .forEach((b) => (b.disabled = true));
    try {
      await onProgress(
        selectedCharacter,
        d.id,
        box.dataset.encounter || null,
        box.checked,
      );
      if(progressRoot.isConnected) draw();
    } catch (error) {
      errorRoot.textContent = error.message;
      draw();
    } finally {
      select.disabled = false;
      root
        .querySelectorAll("[data-encounter], [data-instance-complete]")
        .forEach((b) => (b.disabled = false));
    }
  };
  draw();
}
