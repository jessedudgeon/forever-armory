import {evidenceLabel} from "./content-evidence.js";
import { instanceLoot, filterLoot, findInstance } from "./pve-data.js";
import { referenceItemsById, itemButton } from "./items.js";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const lootPanel = () =>
  `<section class="panel"><h2>Find loot</h2><p class="muted">Reported Forever boss drops and instance rewards. Class filters use explicit restrictions only; unknown restrictions remain visible. Missing stats and drop rates are not inferred.</p><div id="pve-loot"><p role="status">Loading item metadata…</p></div></section>`;
export async function bindLoot(root, id, state) {
  const host = root.querySelector("#pve-loot");
  if (!host) return;
  const base = instanceLoot(id),
    catalog = base.length
      ? await referenceItemsById(base.map((i) => i.id))
      : new Map();
  if (!host.isConnected) return;
  const rows = base.map((i) => ({ ...catalog.get(i.id), ...i }));
  const options = (key) =>
    [
      ...new Set(
        rows
          .map((i) => i[key])
          .filter((v) => v !== undefined && v !== null && v !== ""),
      ),
    ]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((v) => `<option value="${esc(v)}">${key === "quality" && Number.isInteger(v) ? esc(["Poor","Common","Uncommon","Rare","Epic","Legendary"][v] || v) : esc(v)}</option>`)
      .join("");
  host.innerHTML = `<div class="loot-filters"><label>Search loot<input type="search" data-loot-filter="query"></label><label>Reward source<select data-loot-filter="sourceType"><option value="">All sources</option><option value="boss">Boss / encounter</option><option value="quest-reward">Quest reward</option><option value="trash">Instance enemies</option><option value="chest">Chest</option><option value="reputation">Reputation</option><option value="instance-reward">Instance reward</option></select></label><label>Encounter<select data-loot-filter="boss"><option value="">All encounters</option>${findInstance(
    id,
  )
    .encounters.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`)
    .join(
      "",
    )}</select></label><label>Slot<select data-loot-filter="slot"><option value="">All slots</option>${options("slot")}</select></label><label>Armor / weapon type<select data-loot-filter="type"><option value="">All types</option>${options("subclass")}</select></label><label>Quality<select data-loot-filter="quality"><option value="">All qualities</option>${options("quality")}</select></label><label>Class restriction<select data-loot-filter="class"><option value="">All classes</option>${["Warrior", "Paladin", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid"].map((c) => `<option value="${c.toUpperCase()}">${c}</option>`).join("")}</select></label>${state.characters.length ? `<label>Use character class<select id="loot-character"><option value="">Choose character</option>${state.characters.map((c) => `<option value="${esc(c.snapshots.at(-1).class)}">${esc(c.snapshots.at(-1).name)}</option>`).join("")}</select></label>` : ""}</div><p id="loot-count" role="status"></p><div class="loot-table-wrap"><table><thead><tr><th>Item</th><th>Source</th><th>Slot / type</th><th>Levels</th><th>Class restriction</th></tr></thead><tbody id="loot-rows"></tbody></table></div>`;
  function draw() {
    const filters = Object.fromEntries(
      [...host.querySelectorAll("[data-loot-filter]")].map((el) => [
        el.dataset.lootFilter,
        el.value,
      ]),
    );
    const visible = filterLoot(rows, filters);
    host.querySelector("#loot-count").textContent =
      `${visible.length} of ${rows.length} listed rewards. Missing metadata is shown as unknown.`;
    host.querySelector("#loot-rows").innerHTML =
      visible
        .map(
          (i) =>
            `<tr><td data-label="Item">${itemButton(i)}<br><a href="#items/${i.id}">Item ${i.id} →</a></td><td data-label="Source"><a href="#pve/${id}${i.encounterId ? "/"+i.encounterId : ""}">${esc(i.encounter || i.sourceName || "Instance reward")}</a><small>${esc({boss:"Encounter drop","quest-reward":"Quest reward",trash:"Instance enemies",chest:"Chest",reputation:"Reputation reward","instance-reward":"Instance reward"}[i.sourceType] || "Instance reward")} · ${esc(evidenceLabel(i))}</small>${i.sourceUrl ? `<small><a href="${esc(i.sourceUrl)}" target="_blank" rel="noopener">Source ↗</a></small>` : ""}${i.requirements ? `<small>${esc(i.requirements)}</small>` : ""}${i.variation ? `<small>${esc(i.variation)}</small>` : ""}${Number.isFinite(i.dropRate) && i.sourceUrl ? `<small>${i.dropRate}% · <a href="${esc(i.sourceUrl)}" rel="noopener" target="_blank">Source</a></small>` : ""}</td><td data-label="Slot / type">${esc(i.slot) || "Unknown"}<br>${esc(i.subclass) || "Unknown"}</td><td data-label="Levels">Item: ${esc(i.itemLevel ?? "Unknown")}<br>Required: ${esc(i.requiredLevel ?? "Unknown")}</td><td data-label="Class restriction">${i.allowedClasses?.length ? i.allowedClasses.map(esc).join(", ") : "Unknown / not recorded"}</td></tr>`,
        )
        .join("") ||
      `<tr><td colspan="5">${rows.length ? "No listed loot matches these filters." : "Forever loot has not been verified for this instance yet."}</td></tr>`;
  }
  host.addEventListener("input", draw);
  host.querySelector("#loot-character")?.addEventListener("change", (e) => {
    host.querySelector('[data-loot-filter="class"]').value = e.target.value;
    draw();
  });
  draw();
}
