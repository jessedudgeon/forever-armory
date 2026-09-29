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
  `<section class="panel"><h2>Find loot</h2><p class="muted">Classic reference metadata. Class filters use explicit restrictions only; unknown restrictions remain visible. Weapon training and Forever-specific eligibility are not inferred.</p><div id="pve-loot"><p role="status">Loading item metadata…</p></div></section>`;
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
      .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
      .join("");
  host.innerHTML = `<div class="loot-filters"><label>Search loot<input type="search" data-loot-filter="query"></label><label>Encounter<select data-loot-filter="boss"><option value="">All encounters</option>${findInstance(
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
      `${visible.length} of ${rows.length} listed drops. Missing metadata is shown as unknown.`;
    host.querySelector("#loot-rows").innerHTML =
      visible
        .map(
          (i) =>
            `<tr><td>${itemButton(i)}<br><a href="#items/${i.id}">Item ${i.id} →</a></td><td><a href="#pve/${id}/${i.encounterId}">${esc(i.encounter)}</a>${i.variation ? `<small>${esc(i.variation)}</small>` : ""}${Number.isFinite(i.dropRate) && i.sourceUrl ? `<small>${i.dropRate}% · <a href="${esc(i.sourceUrl)}" rel="noopener" target="_blank">Source</a></small>` : ""}</td><td>${esc(i.slot) || "Unknown"}<br>${esc(i.subclass) || "Unknown"}</td><td>Item: ${esc(i.itemLevel ?? "Unknown")}<br>Required: ${esc(i.requiredLevel ?? "Unknown")}</td><td>${i.allowedClasses?.length ? i.allowedClasses.map(esc).join(", ") : "Unknown / not recorded"}</td></tr>`,
        )
        .join("") ||
      '<tr><td colspan="5">No listed loot matches these filters.</td></tr>';
  }
  host.addEventListener("input", draw);
  host.querySelector("#loot-character")?.addEventListener("change", (e) => {
    host.querySelector('[data-loot-filter="class"]').value = e.target.value;
    draw();
  });
  draw();
}
