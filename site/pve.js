import {breadcrumbs, sectionNavigation, bindSectionNavigation} from './navigation.js';
import {
  instances,
  findInstance,
  findEncounter,
  searchInstances,
  lootFor,
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
  '<div class="note">Classic reference only. Forever availability, mechanics and loot may differ. Tables are incomplete; no drop rates or complete clears are implied.</div>';
const heading = (title, sub) =>
  `<div class="page-heading"><div><span class="eyebrow">PVE JOURNAL</span><h1>${esc(title)}</h1><p>${esc(sub)}</p></div></div>`;
function cards() {
  const matches = searchInstances(query, filter);
  return `<p class="muted">${matches.length} of ${instances.length} instances</p><div class="dungeon-grid">${matches.map((d) => `<a class="dungeon-card" href="#pve/${d.id}"><small>${d.kind.toUpperCase()} · ${d.new ? "FOREVER LISTING" : "CLASSIC REFERENCE"}</small><strong>${esc(d.name)}</strong><span>${esc(d.zone)} · Level ${esc(d.level)}</span><em>${d.encounters.length} listed encounters · Partial coverage</em></a>`).join("") || "<p>No instances match this search.</p>"}</div>`;
}
function notes(title, values) {
  return values?.length
    ? `<h3>${esc(title)}</h3><ul>${values.map((v) => `<li>${esc(typeof v === "string" ? v : v.name || v.description)}</li>`).join("")}</ul>`
    : "";
}
function questsHTML(d, ids) {
  const quests = ids ? d.quests.filter((q) => ids.includes(q.id)) : d.quests;
  return quests.length
    ? `<section class="panel" id="pve-quests"><h2>Related quests</h2>${quests.map((q) => (typeof q === "string" ? `<p>${esc(q)}</p>` : `<article><h3>${esc(q.name)}</h3><p>${esc(q.description || "")}</p><p>${esc(q.requirements || "")}</p>${q.rewardItemIds?.map((id) => itemButton({ id })).join(" ") || ""}</article>`)).join("")}</section>`
    : "";
}
function artworkHTML(art) {
  return art && typeof art.src === "string" && /^\.\/assets\//.test(art.src)
    ? `<figure><img class="pve-art" src="${esc(art.src)}" alt="${esc(art.alt || "")}" loading="lazy">${art.credit ? `<figcaption>${esc(art.credit)}</figcaption>` : ""}</figure>`
    : "";
}
function instanceDetails(d) {
  return `<section class="panel"><h2>Access & preparation</h2>${artworkHTML(d.map)}<p>Minimum level: ${esc(d.minimumLevel ?? "Not documented")} · Group size: ${esc(d.playerSize ?? "Not documented")}</p><p>Lockout / reset: ${esc(d.lockout || "Not documented")}</p>${notes("Keys & access", d.accessRequirements)}${notes("Attunement", d.attunement)}${notes("Preparation", d.preparation)}${notes("Instance mechanics", d.mechanics)}${notes("Wings / sections", d.wings)}</section>`;
}
function encounterCard(d, e, detail = false) {
  return `<section class="panel dungeon-boss"><div class="section-row"><h2>${detail ? esc(e.name) : `<a href="#pve/${d.id}/${e.id}">${esc(e.name)}</a>`}</h2><span class="muted">${e.loot.length} reference items</span></div>${artworkHTML(e.artwork)}${e.description ? `<p>${esc(e.description)}</p>` : ""}${detail ? `${e.strategy ? `<h3>Strategy</h3><p>${esc(e.strategy)}</p>` : ""}${notes("Abilities", e.abilities)}${notes("Tank notes", e.tankNotes)}${notes("Healer notes", e.healerNotes)}${notes("DPS notes", e.dpsNotes)}${notes("Prerequisites", e.prerequisites)}` : ""}${detail ? `<h3>Mechanics</h3>${e.mechanics.length ? `<ul>${e.mechanics.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : '<p class="muted">Verified Forever mechanics have not been documented yet.</p>'}<h3>Loot</h3>` : ""}${
    e.loot.length
      ? `<ul class="dungeon-loot">${lootFor(e)
          .map(
            (i) =>
              `<li><span aria-hidden="true">◆</span>${itemButton(i)}${detail && i.sourceUrl ? ` <a href="${esc(i.sourceUrl)}" target="_blank" rel="noopener">Source ↗</a>` : ""}</li>`,
          )
          .join("")}</ul>`
      : '<p class="muted">Loot data is pending. An empty table does not mean this encounter drops nothing.</p>'
  }</section>`;
}
function tracker(d, state) {
  const chars = state.characters || [];
  if (!chars.length)
    return '<section class="panel" id="pve-tracker"><h2>Your encounter progress</h2><p>Add a character to keep a private record of completed encounters.</p><a href="#roster">Open characters →</a></section>';
  if (!chars.some((c) => c.id === selectedCharacter))
    selectedCharacter = chars[0].id;
  return `<section class="panel" id="pve-tracker"><h2>Your encounter progress</h2><label>Character<select id="pve-character">${chars.map((c) => `<option value="${esc(c.id)}" ${c.id === selectedCharacter ? "selected" : ""}>${esc(c.snapshots.at(-1).name)} · ${esc(state.gameAccounts?.find((a) => a.id === c.snapshots.at(-1).accountId)?.name || "Default account")}</option>`).join("")}</select></label><p class="muted">Manual, private tracking. This checklist does not automatically mark the whole ${d.kind} complete.</p><div id="pve-progress"></div><p id="pve-error" role="alert" class="error"></p></section>`;
}
export function pveView(id, encounterId, state) {
  if(['dungeons','raids'].includes(id)){filter=id;id=undefined;}else if(!id){filter='all';}
  const d = findInstance(id);
  if (id && !d)
    return (
      heading(
        "Instance not found",
        "Browse the shared dungeon and raid journal.",
      ) + '<a href="#pve">All instances</a>'
    );
  if (!d)
    return (
      breadcrumbs([["Game Guide","#game-guide"],["Dungeons & Raids","#pve"],...(filter === "all" ? [] : [[filter === "raids" ? "Raids" : "Dungeons"]])]) +
      heading(filter === "raids" ? "Raid Journal" : filter === "dungeons" ? "Dungeon Journal" : "PvE Journal", "Explore instances, encounters, loot and your character’s progress.") +
      warning +
      `<section class="panel"><div class="dungeon-controls"><label>Search instances, encounters or loot<input id="dungeon-search" type="search" value="${esc(query)}" placeholder="Try Onyxia or Meteor Shard"></label><label>Show<select id="dungeon-filter">${[
        ["all", "All instances"],
        ["dungeons", "Dungeons"],
        ["raids", "Raids"],
        ["new", "New in Forever"],
        ["classic", "Classic returning"],
      ]
        .map(
          ([v, n]) =>
            `<option value="${v}" ${filter === v ? "selected" : ""}>${n}</option>`,
        )
        .join(
          "",
        )}</select></label></div><div id="dungeon-results">${cards()}</div></section>`
    );
  const e = encounterId && findEncounter(id, encounterId);
  if (encounterId && !e)
    return (
      heading("Encounter not found", d.name) +
      `<a href="#pve/${d.id}">Back to instance</a>`
    );
  const kind=d.kind==='raid'?'Raids':'Dungeons';
  const sections=[['Overview','pve-overview'],...(d.encounters.length?[['Bosses','pve-bosses']]:[]),...(!e?[['Loot','pve-loot-section']]:[]),...(d.quests.length&&(!e||d.quests.some(q=>e.questIds?.includes(q.id)))?[['Quests','pve-quests']]:[]),...(d.encounters.length?[['Progress','pve-tracker']]:[])];
  return `${breadcrumbs([['Game Guide','#game-guide'],['PvE','#pve'],[kind,'#pve/'+kind.toLowerCase()],[d.name,'#pve/'+d.id],...(e?[[e.name]]:[])])}${sectionNavigation('PvE sections',sections)}<div id="pve-overview" data-section-anchor></div><a href="#pve">← All instances</a>${heading(e?.name || d.name, `${d.kind === "raid" ? "Raid" : "Dungeon"} · ${d.zone} · Level ${d.level}`)}${e ? `<p><a href="#pve/${d.id}">${esc(d.name)} · All encounters</a></p>` : ""}${warning}${d.description ? `<p>${esc(d.description)}</p>` : ""}${!e ? `<section class="panel"><h2>Visit & prepare</h2><p><strong>Location:</strong> ${esc(d.zone)}</p><p><strong>Entrance:</strong> ${esc(d.entrance) || "Exact entrance not documented."}</p><p><strong>Quests:</strong> ${d.quests.length ? d.quests.map((q) => esc(typeof q === "string" ? q : q.name)).join(", ") : "Quest coverage pending."}</p><p>${d.encounters.length} encounters listed · Coverage: ${esc(d.coverage)}</p></section>` : ""}${!e ? instanceDetails(d) + questsHTML(d) + `<div id="pve-loot-section" data-section-anchor>${lootPanel()}</div>` : questsHTML(d, e.questIds)}${d.encounters.length ? `<nav class="encounter-nav" aria-label="Encounters">${d.encounters.map((b) => `<a href="#pve/${d.id}/${b.id}" ${b.id === encounterId ? 'aria-current="page"' : ""}>${b.order}. ${esc(b.name)}</a>`).join("")}</nav><div class="dungeon-bosses" id="pve-bosses">${(e ? [e] : d.encounters).map((b) => encounterCard(d, b, !!e)).join("")}</div>${tracker(d, state)}` : '<section class="panel"><p>Encounters and loot await verified reports.</p></section>'}${d.source ? `<p>Reference: <a href="${esc(d.source)}" target="_blank" rel="noopener">${d.new ? "Listing" : "Classic guide"} ↗</a></p>` : ""}`;
}
export function bindPve(root, id, getState, onProgress) {
  bindSectionNavigation(root);
  void bindLoot(root, id, getState());
  root.querySelector("#dungeon-search")?.addEventListener("input", (e) => {
    query = e.target.value;
    root.querySelector("#dungeon-results").innerHTML = cards();
  });
  root.querySelector("#dungeon-filter")?.addEventListener("change", (e) => {
    filter = e.target.value;
    location.hash = filter === "all" ? "pve" : "pve/" + filter;
  });
  const d = findInstance(id),
    select = root.querySelector("#pve-character");
  if (!d || !select) return;
  const progressRoot = root.querySelector("#pve-progress");
  const errorRoot = root.querySelector("#pve-error");
  function draw() {
    const c = getState().characters.find((c) => c.id === selectedCharacter);
    const prior = c?.snapshots.at(-1).progress?.find((p) => p.id === d.id);
    progressRoot.innerHTML = d.encounters
      .map(
        (e) =>
          `<label class="encounter-check"><input type="checkbox" data-encounter="${e.id}" ${prior?.bosses.some((b) => (b.id === e.id || (!b.id && b.name === e.name)) && b.completed) ? "checked" : ""}>${esc(e.name)}</label>`,
      )
      .join("");
  }
  select.onchange = () => {
    selectedCharacter = select.value;
    draw();
  };
  progressRoot.onchange = async (event) => {
    const box = event.target;
    if (!box.dataset.encounter) return;
    select.disabled = true;
    root
      .querySelectorAll("[data-encounter]")
      .forEach((b) => (b.disabled = true));
    try {
      await onProgress(
        selectedCharacter,
        d.id,
        box.dataset.encounter,
        box.checked,
      );
    } catch (error) {
      errorRoot.textContent = error.message;
      draw();
    } finally {
      select.disabled = false;
      root
        .querySelectorAll("[data-encounter]")
        .forEach((b) => (b.disabled = false));
    }
  };
  draw();
}
