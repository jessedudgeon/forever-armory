import {
  instances,
  findInstance,
  findEncounter,
  searchInstances,
  lootFor,
} from "./pve-data.js";
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
function encounterCard(d, e, detail = false) {
  return `<section class="panel dungeon-boss"><div class="section-row"><h2>${detail ? esc(e.name) : `<a href="#pve/${d.id}/${e.id}">${esc(e.name)}</a>`}</h2><span class="muted">${e.loot.length} reference items</span></div>${e.description ? `<p>${esc(e.description)}</p>` : ""}${detail ? `<h3>Mechanics</h3>${e.mechanics.length ? `<ul>${e.mechanics.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : '<p class="muted">Verified Forever mechanics have not been documented yet.</p>'}<h3>Loot</h3>` : ""}${
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
    return '<section class="panel"><h2>Your encounter progress</h2><p>Add a character to keep a private record of completed encounters.</p><a href="#roster">Open characters →</a></section>';
  if (!chars.some((c) => c.id === selectedCharacter))
    selectedCharacter = chars[0].id;
  return `<section class="panel"><h2>Your encounter progress</h2><label>Character<select id="pve-character">${chars.map((c) => `<option value="${esc(c.id)}" ${c.id === selectedCharacter ? "selected" : ""}>${esc(c.snapshots.at(-1).name)} · ${esc(state.gameAccounts?.find((a) => a.id === c.snapshots.at(-1).accountId)?.name || "Default account")}</option>`).join("")}</select></label><p class="muted">Manual, private tracking. This checklist does not automatically mark the whole ${d.kind} complete.</p><div id="pve-progress"></div><p id="pve-error" role="alert" class="error"></p></section>`;
}
export function pveView(id, encounterId, state) {
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
      heading("PvE Journal", "Dungeon / Raid → Encounter → Loot") +
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
  return `<a href="#pve">← All instances</a>${heading(e?.name || d.name, `${d.kind === "raid" ? "Raid" : "Dungeon"} · ${d.zone} · Level ${d.level}`)}${e ? `<p><a href="#pve/${d.id}">${esc(d.name)} · All encounters</a></p>` : ""}${warning}${d.description ? `<p>${esc(d.description)}</p>` : ""}${!e ? `<section class="panel"><h2>Visit & prepare</h2><p><strong>Location:</strong> ${esc(d.zone)}</p><p><strong>Entrance:</strong> ${esc(d.entrance) || "Exact entrance not documented."}</p><p><strong>Quests:</strong> ${d.quests.length ? d.quests.map(esc).join(", ") : "Quest coverage pending."}</p><p>${d.encounters.length} encounters listed · Coverage: ${esc(d.coverage)}</p></section>` : ""}${d.encounters.length ? `<nav class="encounter-nav" aria-label="Encounters">${d.encounters.map((b) => `<a href="#pve/${d.id}/${b.id}" ${b.id === encounterId ? 'aria-current="page"' : ""}>${esc(b.name)}</a>`).join("")}</nav><div class="dungeon-bosses">${(e ? [e] : d.encounters).map((b) => encounterCard(d, b, !!e)).join("")}</div>${tracker(d, state)}` : '<section class="panel"><p>Encounters and loot await verified reports.</p></section>'}${d.source ? `<p>Reference: <a href="${esc(d.source)}" target="_blank" rel="noopener">${d.new ? "Listing" : "Classic guide"} ↗</a></p>` : ""}`;
}
export function bindPve(root, id, getState, onProgress) {
  root.querySelector("#dungeon-search")?.addEventListener("input", (e) => {
    query = e.target.value;
    root.querySelector("#dungeon-results").innerHTML = cards();
  });
  root.querySelector("#dungeon-filter")?.addEventListener("change", (e) => {
    filter = e.target.value;
    root.querySelector("#dungeon-results").innerHTML = cards();
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
