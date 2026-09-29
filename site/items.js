import { referenceItems } from "./pve-data.js";
import { inventoryFor } from "./character-data.js";
import {
  normalizeIcon,
  iconUrl,
  parseItemGoalNotes,
  encodeItemGoalNotes,
  progressPercent,
  compactItem,
} from "./item-core.js";

const CATALOG_URL =
  "https://unpkg.com/wow-classic-items@2.0.1/data/json/data.json";
const CACHE_NAME = "forever-item-catalog-v1";
const PENDING_KEY = "forever-pending-item-goal-v1";
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const qualityNames = [
  "Poor",
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Artifact",
  "Heirloom",
  "Token",
];
const qualityClass = (q) =>
  `item-quality-${String(
    typeof q === "number" ? qualityNames[q] || "common" : q || "common",
  )
    .toLowerCase()
    .replace(/[^a-z]/g, "")}`;
let catalogPromise = null,
  catalog = null,
  lastQuery = "",
  renderNonce = 0;

let getState = () => ({ characters: [] });
export function configureItems(provider) {
  getState = provider;
}
function customItems() {
  const items = {};
  for (const item of referenceItems()) items[item.id] = item;
  for (const c of getState().characters)
    for (const i of inventoryFor(c.snapshots.at(-1)))
      items[i.id] = { ...items[i.id], ...i };
  return items;
}
function importedInventories() {
  return Object.fromEntries(
    getState().characters.map((c) => [
      c.id,
      {
        name: c.snapshots.at(-1).name,
        observedAt: c.snapshots.at(-1).observedAt,
        items: inventoryFor(c.snapshots.at(-1)),
      },
    ]),
  );
}
function normalizeLocalItem(raw) {
  const item = compactItem(raw);
  if (!item) return null;
  item.count = Math.max(0, Number(raw.quantity ?? raw.count) || 0);
  return item;
}
export function itemButton(item) {
  return `<button type="button" class="item-inline ${qualityClass(item.quality)}" data-item-detail="${Number(item.id)}" data-item-name="${esc(item.name || "")}">${esc(item.name || `Item ${item.id}`)}</button>`;
}
export function discoveredItems() {
  return Object.values(customItems());
}

async function fetchCatalogResponse() {
  if ("caches" in window) {
    const cacheStore = await caches.open(CACHE_NAME),
      cached = await cacheStore.match(CATALOG_URL);
    if (cached) return cached;
    const response = await fetch(CATALOG_URL, {
      mode: "cors",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Error("The Classic item reference could not load.");
    try {
      await cacheStore.put(CATALOG_URL, response.clone());
    } catch {}
    return response;
  }
  const response = await fetch(CATALOG_URL, {
    mode: "cors",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error("The Classic item reference could not load.");
  return response;
}

async function loadCatalog() {
  if (catalog) return catalog;
  if (!catalogPromise)
    catalogPromise = (async () => {
      const response = await fetchCatalogResponse(),
        data = await response.json();
      if (!Array.isArray(data))
        throw new Error("The item reference returned an unexpected format.");
      catalog = data;
      return catalog;
    })().catch((err) => {
      catalogPromise = null;
      throw err;
    });
  return catalogPromise;
}

function localMatches(query) {
  const q = query.trim().toLowerCase(),
    items = Object.values(customItems())
      .map(normalizeLocalItem)
      .filter(Boolean);
  if (!q) return items.slice(0, 24);
  return items
    .filter((i) => String(i.id) === q || i.name.toLowerCase().includes(q))
    .slice(0, 50);
}
function catalogMatches(data, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const exactId = /^\d+$/.test(q) ? Number(q) : null,
    starts = [],
    contains = [];
  for (const raw of data) {
    const id = Number(raw.itemId),
      name = String(raw.name || "");
    if (exactId && id === exactId) {
      starts.unshift(raw);
      continue;
    }
    const lower = name.toLowerCase();
    if (lower.startsWith(q)) starts.push(raw);
    else if (lower.includes(q)) contains.push(raw);
    if (starts.length >= 35 && contains.length >= 35) break;
  }
  return [...starts, ...contains].slice(0, 60).map(compactItem).filter(Boolean);
}
function mergeResults(a, b) {
  const seen = new Set(),
    out = [];
  for (const item of [...a, ...b]) {
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function itemIconHTML(item, size = "large") {
  const src = iconUrl(item?.icon, size);
  return src
    ? `<img class="item-art" src="${src}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'item-art-fallback',textContent:'◆' }))">`
    : '<span class="item-art-fallback">◆</span>';
}
function wowheadLink(item, text = item?.name || `Item ${item?.id}`) {
  return `<a class="wowhead-item-link ${qualityClass(item?.quality)}" href="https://www.wowhead.com/classic/item=${Number(item?.id)}" data-wowhead="item=${Number(item?.id)}&domain=classic" target="_blank" rel="noopener">${esc(text)}</a>`;
}
function refreshWowhead() {
  try {
    window.WH?.Tooltips?.refreshLinks?.();
  } catch {}
}

function sourceText(item) {
  const source = item?.source;
  if (!source) return "";
  if (typeof source === "string") return source;
  const parts = [source.category, source.name].filter(Boolean);
  if (Array.isArray(source.quests) && source.quests.length)
    parts.push(
      source.quests
        .map((q) => q.name)
        .filter(Boolean)
        .join(", "),
    );
  return parts.join(" · ");
}
function tooltipHTML(item) {
  if (!Array.isArray(item?.tooltip) || !item.tooltip.length)
    return '<div class="item-tooltip-lines"><p>Detailed stats are not available for this item yet.</p></div>';
  return `<div class="item-tooltip-lines">${item.tooltip
    .slice(0, 30)
    .map(
      (line) =>
        `<div class="tooltip-line ${qualityClass(line.format)}">${esc(line.label || "")}</div>`,
    )
    .join("")}</div>`;
}
function ensureItemDialog() {
  let dialog = document.querySelector("#item-detail-modal");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.id = "item-detail-modal";
  dialog.className = "item-detail-modal";
  dialog.setAttribute("aria-label", "Item information");
  dialog.addEventListener("close", () => {
    openSerial++;
  });
  dialog.innerHTML = '<div id="item-detail-content"></div>';
  document.body.append(dialog);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  return dialog;
}
let openSerial = 0;
export async function openItem(item) {
  const serial = ++openSerial;
  item = normalizeLocalItem(item) || compactItem(item);
  if (!item) return;
  const dialog = ensureItemDialog();
  // Imported gear often has only an ID. Enrich it with the Classic reference before showing details.
  if (!item.tooltip?.length || !item.icon) {
    dialog.querySelector("#item-detail-content").innerHTML =
      '<button class="item-modal-close" aria-label="Close">×</button><p role="status">Loading item details…</p>';
    dialog.querySelector(".item-modal-close").onclick = () => dialog.close();
    if (!dialog.open) dialog.showModal();
    try {
      const data = await loadCatalog(),
        record = data.find((raw) => Number(raw.itemId) === item.id);
      if (record) {
        const reference = compactItem(record);
        item = {
          ...reference,
          ...item,
          icon: item.icon || reference.icon,
          tooltip: item.tooltip?.length ? item.tooltip : reference.tooltip,
          source: item.source || reference.source,
          class: item.class || reference.class,
          subclass: item.subclass || reference.subclass,
          slot: item.slot || reference.slot,
          itemLevel: item.itemLevel ?? reference.itemLevel,
          requiredLevel: item.requiredLevel ?? reference.requiredLevel,
        };
      }
    } catch {}
  }
  if (serial !== openSerial) return;
  const source = sourceText(item),
    details = [item.class, item.subclass, item.slot]
      .filter(Boolean)
      .join(" · "),
    level = [
      item.itemLevel != null ? `Item level ${item.itemLevel}` : "",
      item.requiredLevel ? `Requires level ${item.requiredLevel}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  dialog.querySelector("#item-detail-content").innerHTML =
    `<div class="item-modal-head"><div class="item-modal-art">${itemIconHTML(item)}</div><div><span class="eyebrow">ITEM ${item.id}</span><h2 class="${qualityClass(item.quality)}">${esc(item.name)}</h2>${details ? `<p>${esc(details)}</p>` : ""}${level ? `<small>${esc(level)}</small>` : ""}</div><button class="item-modal-close" aria-label="Close">×</button></div><p class="reference-label">Classic reference stats; Forever values may differ. Imported item names are preserved.</p>${tooltipHTML(item)}${source ? `<div class="item-source"><small>Source</small><strong>${esc(source)}</strong></div>` : ""}<div class="item-modal-actions"><a href="#items/${item.id}" data-item-permalink>Item permalink</a>${wowheadLink(item, "Classic reference ↗")}<button class="primary" type="button" data-item-goal>Add as goal</button></div>`;
  dialog.querySelector("[data-item-permalink]").onclick = () => dialog.close();
  dialog.querySelector(".item-modal-close").onclick = () => dialog.close();
  dialog.querySelector("[data-item-goal]").onclick = () => {
    dialog.close();
    queueItemGoal(item);
  };
  if (!dialog.open) dialog.showModal();
  refreshWowhead();
}

function queueItemGoal(item) {
  const compact = normalizeLocalItem(item) || compactItem(item);
  if (!compact) return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(compact));
  location.hash = "journal";
  setTimeout(openPendingGoal, 20);
}
function openPendingGoal() {
  if (
    !sessionStorage.getItem(PENDING_KEY) ||
    !location.hash.startsWith("#journal")
  )
    return;
  const button = document.querySelector("#new-task");
  if (button && !document.querySelector("#task-form")) button.click();
}

function itemResultCard(item) {
  const source = sourceText(item),
    meta = [item.class, item.subclass, item.slot].filter(Boolean).join(" · ");
  return `<article class="item-result" data-item-id="${item.id}"><button class="item-result-main" type="button" data-open-item="${item.id}">${itemIconHTML(item, "large")}<span><strong class="${qualityClass(item.quality)}">${esc(item.name)}</strong><small>Item ${item.id}${meta ? " · " + esc(meta) : ""}</small>${source ? `<span class="item-result-source">${esc(source)}</span>` : ""}</span></button><button class="item-goal-shortcut" type="button" data-goal-item="${item.id}">+ Goal</button></article>`;
}
function bindItemResults(root, items) {
  const map = new Map(items.map((i) => [Number(i.id), i]));
  root
    .querySelectorAll("[data-open-item]")
    .forEach(
      (el) =>
        (el.onclick = () => openItem(map.get(Number(el.dataset.openItem)))),
    );
  root
    .querySelectorAll("[data-goal-item]")
    .forEach(
      (el) =>
        (el.onclick = () =>
          queueItemGoal(map.get(Number(el.dataset.goalItem)))),
    );
  refreshWowhead();
}

function inventoryHTML() {
  const inventories = importedInventories(),
    entries = Object.entries(inventories);
  if (!entries.length)
    return '<p class="muted">Import a character with the updated companion addon to capture bag contents here.</p>';
  return entries
    .map(
      ([character, data]) =>
        `<div class="inventory-block"><div class="section-row"><h3>${esc(data.name)}</h3><small>${data.observedAt ? new Date(data.observedAt).toLocaleString() : ""}</small></div><div class="inventory-grid">${(
          data.items || []
        )
          .slice()
          .sort(
            (a, b) =>
              (b.quantity ?? b.count ?? 1) - (a.quantity ?? a.count ?? 1),
          )
          .map(
            (item) =>
              `<button type="button" class="inventory-item" data-inventory-item="${item.id}" title="${esc(item.name)} × ${item.count}">${itemIconHTML(item, "medium")}<span>${esc(item.name)}</span><b>${item.quantity ?? item.count ?? 1}</b></button>`,
          )
          .join("")}</div></div>`,
    )
    .join("");
}
function inventoryItems() {
  return Object.values(importedInventories())
    .flatMap((x) => x.items || [])
    .map(normalizeLocalItem)
    .filter(Boolean);
}

export function renderItemsPage() {
  if (location.hash.split("/")[0] !== "#items") return false;
  const main = document.querySelector("#main");
  if (!main) return false;
  const nonce = ++renderNonce;
  document.querySelector("#section-label").textContent = "Item database";
  document
    .querySelectorAll("[data-nav]")
    .forEach((a) => a.classList.toggle("active", a.dataset.nav === "items"));
  main.innerHTML = `<div class="page-heading"><div><span class="eyebrow">AZEROTH CATALOG</span><h1>Item database</h1><p>Search the Classic reference, inspect item artwork and tooltips, and turn anything into a character goal.</p></div></div><section class="panel item-search-panel"><label>Find an item<input id="item-search" autocomplete="off" placeholder="Peacebloom, Eye of Shadow, or item ID…" value="${esc(lastQuery)}"></label><p id="item-search-status"><small>Type at least two letters to search the full Classic catalog. The first search downloads the reference once and caches it in this browser.</small></p><div id="item-search-results"></div></section><section class="panel"><div class="section-row"><div><span class="eyebrow">YOUR LAST IMPORT</span><h2>Your captured inventory</h2></div><span class="muted">Captured by /farmory</span></div><div id="imported-inventory">${inventoryHTML()}</div></section>`;
  const input = main.querySelector("#item-search"),
    results = main.querySelector("#item-search-results"),
    status = main.querySelector("#item-search-status");
  const deepId = Number(location.hash.split("/")[1]);
  if (Number.isInteger(deepId) && deepId > 0)
    void openItem(customItems()[deepId] || { id: deepId });
  main.querySelectorAll("[data-inventory-item]").forEach(
    (el) =>
      (el.onclick = () => {
        const item = inventoryItems().find(
          (x) => x.id === Number(el.dataset.inventoryItem),
        );
        if (item) openItem(item);
      }),
  );
  let timer,
    request = 0;
  const run = () => {
    const serial = ++request;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const q = input.value.trim();
      lastQuery = q;
      if (nonce !== renderNonce || serial !== request || !input.isConnected)
        return;
      if (q.length < 2 && !/^\d+$/.test(q)) {
        const local = localMatches(q);
        results.innerHTML = local.length
          ? `<div class="item-results">${local.map(itemResultCard).join("")}</div>`
          : "";
        bindItemResults(results, local);
        status.innerHTML =
          "<small>Type at least two letters to search the full Classic catalog.</small>";
        return;
      }
      status.innerHTML =
        '<span class="catalog-loading"></span> Loading the Classic item catalog…';
      const local = localMatches(q);
      try {
        const data = await loadCatalog();
        if (nonce !== renderNonce || serial !== request || !input.isConnected)
          return;
        const matches = mergeResults(local, catalogMatches(data, q));
        results.innerHTML = matches.length
          ? `<div class="item-results">${matches.map(itemResultCard).join("")}</div>`
          : '<p class="muted">No matching reference item found. Forever custom items appear after you import them with the addon.</p>';
        status.innerHTML = `<small>${matches.length} result${matches.length === 1 ? "" : "s"} shown · Classic reference + Forever items discovered from your imports.</small>`;
        bindItemResults(results, matches);
      } catch (err) {
        if (nonce !== renderNonce || serial !== request || !input.isConnected)
          return;
        results.innerHTML = local.length
          ? `<div class="item-results">${local.map(itemResultCard).join("")}</div>`
          : '<p class="muted">No locally discovered matches.</p>';
        status.innerHTML = `<small>${esc(err.message)} Local Forever items are still searchable.</small>`;
        bindItemResults(results, local);
      }
    }, 220);
  };
  input.addEventListener("input", run);
  if (lastQuery) run();
  input.focus();
  return true;
}

function enhanceGear() {
  document.querySelectorAll(".gear-row").forEach((row) => {
    if (row.dataset.itemEnhanced) return;
    const small = row.querySelector("strong small"),
      match = small?.textContent.match(/Item\s+(\d+)/);
    if (!match) return;
    row.dataset.itemEnhanced = "true";
    const id = Number(match[1]),
      strong = row.querySelector("strong"),
      name =
        (strong?.childNodes?.[0]?.textContent || "").trim() || `Item ${id}`,
      local = normalizeLocalItem(customItems()[id] || { id, name }),
      item = { ...local, id, name: name || local?.name };
    const slot = row.querySelector("span")?.textContent || "";
    const wrap = document.createElement("button");
    wrap.type = "button";
    wrap.className = "gear-item-button";
    wrap.innerHTML = `${itemIconHTML(item, "medium")}<span><strong class="${strong?.className || qualityClass(item.quality)}">${esc(name)}</strong><small>Item ${id}${slot ? " · " + esc(slot) : ""}</small></span>`;
    wrap.onclick = () => openItem(item);
    strong.replaceWith(wrap);
  });
}

function enhanceLevelProgress() {
  document.querySelectorAll(".stat").forEach((stat) => {
    if (stat.dataset.barEnhanced) return;
    const label = stat.querySelector(".stat-label"),
      value = stat.querySelector(".stat-value");
    if (label?.textContent.trim() !== "Level progress" || !value) return;
    const match = value.textContent.match(/(\d+)%/);
    if (!match) return;
    stat.dataset.barEnhanced = "true";
    const pct = Math.max(0, Math.min(100, Number(match[1])));
    value.innerHTML = `<div class="large-progress"><div class="large-progress-fill" style="width:${pct}%"></div><span>${pct}%</span></div>`;
  });
}

function renderSelectedItem(container, item) {
  if (!item) {
    container.innerHTML = '<span class="muted">No item selected.</span>';
    return;
  }
  container.innerHTML = `<button type="button" class="selected-goal-item" data-selected-open>${itemIconHTML(item, "medium")}<span><strong class="${qualityClass(item.quality)}">${esc(item.name)}</strong><small>Item ${item.id}</small></span></button>`;
  container.querySelector("[data-selected-open]").onclick = () =>
    openItem(item);
}

function searchPicker(input, results, select) {
  let timer,
    request = 0;
  input.addEventListener("input", () => {
    const serial = ++request;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const q = input.value.trim();
      if (q.length < 2 && !/^\d+$/.test(q)) {
        results.innerHTML = "";
        return;
      }
      const local = localMatches(q);
      let matches = local;
      results.innerHTML = "<small>Searching…</small>";
      try {
        matches = mergeResults(
          local,
          catalogMatches(await loadCatalog(), q),
        ).slice(0, 12);
      } catch {}
      if (serial !== request || !input.isConnected) return;
      results.innerHTML =
        matches
          .map(
            (i) =>
              `<button type="button" class="picker-result" data-picker-id="${i.id}">${itemIconHTML(i, "medium")}<span><strong class="${qualityClass(i.quality)}">${esc(i.name)}</strong><small>Item ${i.id}</small></span></button>`,
          )
          .join("") || "<small>No matches found.</small>";
      results.querySelectorAll("[data-picker-id]").forEach(
        (el) =>
          (el.onclick = () => {
            const item = matches.find(
              (i) => i.id === Number(el.dataset.pickerId),
            );
            if (item) select(item);
            results.innerHTML = "";
            input.value = "";
          }),
      );
    }, 180);
  });
}

function enhanceTaskForm() {
  const form = document.querySelector("#task-form");
  if (!form || form.dataset.itemGoalsEnhanced) return;
  form.dataset.itemGoalsEnhanced = "true";
  const notes = form.querySelector('textarea[name="notes"]');
  if (!notes) return;
  const parsed = parseItemGoalNotes(notes.value);
  notes.value = parsed.notes;
  let selected = parsed.item ? normalizeLocalItem(parsed.item) : null;
  try {
    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
    if (pending && !selected) {
      selected = normalizeLocalItem(pending);
      sessionStorage.removeItem(PENDING_KEY);
    }
  } catch {}
  const target = selected?.target || 1,
    current = selected?.current || 0,
    section = document.createElement("fieldset");
  section.className = "item-goal-editor";
  section.innerHTML = `<legend>Item goal <small>optional</small></legend><label>Find item<input type="search" class="item-goal-search" placeholder="Search item name or ID…" autocomplete="off"></label><div class="item-picker-results"></div><div class="selected-item-preview"></div><div class="goal-quantity-grid"><label>Have<input type="number" class="item-current" min="0" step="1" value="${current}"></label><label>Goal<input type="number" class="item-target" min="1" step="1" value="${target}"></label><button type="button" class="text-button clear-item-goal">Clear item</button></div>`;
  notes.closest("label").before(section);
  const preview = section.querySelector(".selected-item-preview"),
    search = section.querySelector(".item-goal-search"),
    picker = section.querySelector(".item-picker-results");
  const select = (item) => {
    selected = normalizeLocalItem(item);
    renderSelectedItem(preview, selected);
    section.querySelector(".item-target").value = selected?.target || 1;
  };
  renderSelectedItem(preview, selected);
  searchPicker(search, picker, select);
  section.querySelector(".clear-item-goal").onclick = () => {
    selected = null;
    renderSelectedItem(preview, null);
  };
  form.addEventListener(
    "submit",
    () => {
      if (!selected) return;
      selected = {
        ...selected,
        current: Math.max(
          0,
          Math.floor(Number(section.querySelector(".item-current").value) || 0),
        ),
        target: Math.max(
          1,
          Math.floor(Number(section.querySelector(".item-target").value) || 1),
        ),
      };
      notes.value = encodeItemGoalNotes(selected, notes.value);
    },
    true,
  );
}

function enhanceTasks() {
  document.querySelectorAll(".task").forEach((task) => {
    if (task.dataset.itemGoalEnhanced) return;
    const p = task.querySelector(".task-body p");
    if (!p) return;
    const parsed = parseItemGoalNotes(p.textContent);
    if (!parsed.item) return;
    task.dataset.itemGoalEnhanced = "true";
    p.textContent = parsed.notes;
    p.hidden = !parsed.notes.trim();
    const item = normalizeLocalItem(parsed.item),
      pct = progressPercent(item.current, item.target),
      card = document.createElement("div");
    card.className = "item-goal-card";
    card.innerHTML = `<button type="button" class="item-goal-art" aria-label="Open ${esc(item.name)}">${itemIconHTML(item, "medium")}</button><div class="item-goal-body"><div class="item-goal-line"><strong class="${qualityClass(item.quality)}">${esc(item.name)}</strong><span>${item.current} / ${item.target}</span></div><div class="goal-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${item.target}" aria-valuenow="${Math.min(item.current, item.target)}"><span style="width:${pct}%"></span></div><small>${pct}% complete</small></div>`;
    card.querySelector(".item-goal-art").onclick = () => openItem(item);
    task.querySelector(".task-body").insertBefore(card, p);
  });
}

function enhanceDynamic() {
  enhanceGear();
  enhanceLevelProgress();
  enhanceTaskForm();
  enhanceTasks();
  openPendingGoal();
}
export function initializeItemUI() {
  document.addEventListener("click", (e) => {
    const button = e.target.closest("[data-item-detail]");
    if (button)
      void openItem(
        customItems()[Number(button.dataset.itemDetail)] || {
          id: Number(button.dataset.itemDetail),
          name: button.dataset.itemName,
        },
      );
  });
  new MutationObserver(enhanceDynamic).observe(
    document.querySelector("#main"),
    { childList: true, subtree: true },
  );
  new MutationObserver(enhanceDynamic).observe(
    document.querySelector("#modal-content"),
    { childList: true, subtree: true },
  );
}

export function clearItemSession() {
  openSerial++;
  document.querySelector("#item-detail-modal")?.close();
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {}
}
