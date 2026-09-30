import { storageView, bindStorage } from "./storage.js";
import { progressChanges } from "./import-schema.js";
import { sessionExportText } from "./session-import.js";
import { communityView, bindCommunity } from "./community.js";
import { eventsView, bindEvents, eventSection } from "./events.js";
import { removeCharacterEvents } from "./event-model.js";
import { socialProfile, socialFeed, bindSocial, activityCards } from "./social.js";
import { removeSocialCharacter } from "./social-model.js";
import {
  configureItems,
  clearItemSession,
  initializeItemUI,
  renderItemsPage,
} from "./items.js";
import {
  homeView,
  inventoryView,
  bindInventory,
  professionSection,
  professionsView,
  progressSection,
  armorySummary,
  savedBuilds,
  guildsView,
  searchView,
  bindSearch,
} from "./features.js";
import { normalizeGuild } from "./character-data.js";
import { adSlot } from "./ads.js";
import { mountTalents } from "./talents.js";
import {
  instances,
  findInstance,
  encounterProgress,
} from "./pve-data.js";
import { pveView, bindPve } from "./pve.js";
import {
  CHALLENGES,
  PERKS,
  LEGACY_SOURCE,
  earnedChallenges,
  legacyPoints,
  perkTotal,
  setPerkRank,
} from "./legacy.js";
import { cloudConfigured, connectCloud, friendlyError } from "./cloud.js";
import {
  newId,
  CLASSES,
  SLOTS,
  PLAY_STYLES,
  playStyleOf,
  playStyleLabel,
  saveManualCharacter,
  keyOf,
  parseImport,
  importMatch,
  normalize,
  emptyState,
  addSnapshot,
  validateBackup,
  mergeBackup,
  demoState,
} from "./model.js";
const $ = (s) => document.querySelector(s),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const KEY = "forever-armory-v1";
let state = emptyState(),
  demo = false,
  storageBlocked = false,
  tab = "profile",
  query = "",
  accountFilter = "all",
  legacyCharacter = "",
  toastTimer;
try {
  const raw = localStorage.getItem(KEY);
  if (raw)
    state = validateBackup({
      format: "forever-armory-backup",
      ...JSON.parse(raw),
    });
} catch (e) {
  storageBlocked = true;
}
const latest = (c) => c.snapshots.at(-1),
  date = (s) =>
    new Date(s).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  money = (n) =>
    n == null
      ? "Not captured"
      : `${Math.floor(n / 10000).toLocaleString()}g ${Math.floor((n % 10000) / 100)}s ${Math.floor(n % 100)}c`;
let account = null,
  cloudState = emptyState(),
  cloudStatus = cloudConfigured ? "connecting" : "disabled",
  cloudError = "",
  cloudClient = null,
  localMode = !cloudConfigured;
const current = () => (demo ? sample : account ? cloudState : state);
let sample = demoState();
function toast(s) {
  $("#toast").textContent = s;
  $("#toast").style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("#toast").style.display = "none"), 5000);
}
async function commit(next) {
  next = validateBackup({ format: "forever-armory-backup", ...next });
  if (demo) {
    sample = next;
    return;
  }
  if (account) {
    if (cloudStatus !== "ready" && cloudStatus !== "save-error")
      throw new Error(
        "Wait for your account to finish loading, or refresh it before editing.",
      );
    await cloudClient.save(next);
    return;
  }
  if (cloudConfigured && !localMode)
    throw new Error("Sign in to save your armory.");
  if (storageBlocked)
    throw new Error(
      "Browser storage could not be read. Download the recovery file before resetting storage on the Import & backups page.",
    );
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    state = next;
  } catch {
    throw new Error(
      "Could not save. Browser storage may be full or disabled. Download a backup before continuing.",
    );
  }
}
function download(name, data, type = "application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function backup() {
  download(
    `forever-armory${demo ? "-demo" : ""}-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify({ format: "forever-armory-backup", ...current() }, null, 2),
  );
  toast("Backup downloaded. Keep it somewhere safe.");
}
function modal(title, body, setup) {
  $("#modal-content").innerHTML =
    `<div class="modal-head"><h2 id="modal-title">${esc(title)}</h2><button data-close aria-label="Close dialog">×</button></div>${body}`;
  $("#modal-content [data-close]").onclick = () => $("#modal").close();
  if (!$("#modal").open) $("#modal").showModal();
  setup?.();
}
function fail(e) {
  const target = $("#form-error");
  if (target) target.textContent = e.message;
  else toast(e.message);
}
const action = (id, label, primary = false) =>
  `<button type="button" id="${id}" class="${primary ? "primary" : ""}">${label}</button>`;
const empty = (title, text, buttons = "") =>
  `<div class="empty"><div class="empty-mark">◈</div><h2>${title}</h2><p>${text}</p><div class="actions">${buttons}</div></div>`;
function heading(eyebrow, title, description, buttons = "") {
  return `<div class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div><div class="actions">${buttons}</div></div>`;
}
function route() {
  return (location.hash.slice(1) || "home").split("/");
}
function render() {
  const [rawRoute, id, encounterId] = route(),
    r = rawRoute === "pve" ? "dungeons" : rawRoute,
    views = [
      "storage",
      "community",
      "events",
      "activity",
      "home",
      "roster",
      "character",
      "journal",
      "dungeons",
      "guide",
      "account",
      "talents",
      "legacy",
      "items",
      "professions",
      "guilds",
      "search",
    ],
    view = views.includes(r) ? r : "not-found";
  const publicView = [
    "community",
    "home",
    "items",
    "dungeons",
    "talents",
    "search",
    "professions",
    "guide",
    "account",
    "not-found",
  ].includes(view);
  const visible = account || localMode || demo ? current() : emptyState();
  configureItems(() =>
    account || localMode || demo ? current() : emptyState(),
  );
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const active = a.dataset.nav === (view === "character" ? "roster" : view === "community" && (id === "guilds" || id?.startsWith("guild-")) ? "shared-guilds" : view);
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#section-label").textContent =
    {
      storage: "Find my items",
      community: "Character community",
      events: "Events & gatherings",
      activity: "Character activity",
      home: "Home",
      roster: "Characters",
      character: "Character Armory",
      journal: "Adventure journal",
      dungeons: "PvE Journal",
      guide: "Import & backups",
      account: "Your account",
      talents: "Talent calculator",
      legacy: "Legacy system",
      items: "Item database",
      professions: "Professions",
      guilds: "Guilds",
      search: "Search",
    }[view] || "Page not found";
  document.title = $("#section-label").textContent + " · Forever";
  updateAccountHeader();
  let banner = demo
    ? '<div class="demo-banner"><span>EXAMPLE ROSTER · Your saved data is untouched.</span><button id="leave-demo" class="text-button">Exit demo</button></div>'
    : "";
  if (storageBlocked && !account)
    banner +=
      '<div class="note">Your saved data could not be opened. Visit Import & backups to recover it. Changes are paused.</div>';
  if (account && ["error", "save-error"].includes(cloudStatus))
    banner += `<div class="note" role="alert">${esc(cloudError)} <button id="retry-cloud" class="text-button">Refresh account</button></div>`;
  let content;
  if (!publicView && cloudConfigured && !account && !localMode && !demo)
    content = signInView();
  else if (!publicView && account && cloudStatus === "loading" && !demo)
    content = empty(
      "Loading your armory",
      "Fetching your private character collection…",
    );
  else
    content = {
      storage: () => storageView(current()),
      community: communityView,
      events: () => eventsView(current(), id),
      activity: () => socialFeed(current()),
      home: () => homeView(visible),
      account: accountView,
      dungeons: () => pveView(id, encounterId, visible),
      talents: () => '<div id="talent-root"></div>',
      items: () => '<div id="items-root"></div>',
      legacy: legacyView,
      character: () => characterView(id),
      journal: journalView,
      guide: guideView,
      roster: rosterView,
      professions: () => professionsView(visible),
      guilds: () => guildsView(current(), id),
      search: searchView,
      "not-found": () =>
        empty(
          "Page not found",
          "Choose a section from the navigation.",
          '<a href="#home">Return home</a>',
        ),
    }[view]();
  $("#main").innerHTML = banner + adSlot("header") + content + adSlot("footer");
  $("#leave-demo")?.addEventListener("click", () => {
    demo = false;
    location.hash = "roster";
    render();
  });
  bindCommon();
  if(view === "storage") bindStorage($("#main"),current());
  if (view === "community") void bindCommunity($("#community-root"), cloudClient?.community, visible, demo ? null : account, id, commit, render, toast);
  if (view === "events") bindEvents($("#main"), current(), id, commit, render);
  if (view === "activity") bindSocial($("#main"), current(), "", commit, render);
  if (view === "roster") bindRoster();
  if (view === "legacy") bindLegacy();
  if (view === "character") bindCharacter(id);
  if (view === "journal") bindJournal();
  if (view === "dungeons")
    bindPve(
      $("#main"),
      id,
      () => visible,
      async (characterId, instanceId, encounterId, done) => {
        const c = current().characters.find((c) => c.id === characterId);
        if (!c) throw Error("Character is no longer available.");
        const prior = latest(c);
        await commit(
          addSnapshot(
            current(),
            normalize({
              ...prior,
              progress: encounterProgress(
                prior.progress,
                instanceId,
                encounterId,
                done,
              ),
              gearObservedAt: prior.gearObservedAt || prior.observedAt,
              observedAt: new Date().toISOString(),
              source: "Manual encounter progress",
            }),
          ).state,
        );
        render();
      },
    );
  if (view === "guide") bindGuide();
  if (view === "guilds") bindGuilds(id);
  if (view === "search" && $("#global-query"))
    void bindSearch($("#main"), visible);
  bindAccount();
  if (view === "items" && $("#items-root")) renderItemsPage();
  if (view === "talents" && $("#talent-root"))
    mountTalents($("#talent-root"), {
      characters: visible.characters.map((c) => ({ id: c.id, ...latest(c) })),
      save: async (characterId, title, link) => {
        const n = structuredClone(current()),
          c = n.characters.find((c) => c.id === characterId);
        if (!c) throw Error("This character is no longer available.");
        const prior = latest(c),
          build = {
            name: title,
            code: link.split("#talents/")[1],
            updatedAt: new Date().toISOString(),
          },
          builds = [
            ...(prior.builds || []).filter((b) => b.name !== title),
            build,
          ];
        await commit(
          addSnapshot(
            n,
            normalize({
              ...prior,
              builds,
              gearObservedAt: prior.gearObservedAt || prior.observedAt,
              observedAt: build.updatedAt,
              source: "Manual plan",
            }),
          ).state,
        );
      },
    });
}
function rosterView() {
  const cs = current().characters;
  const snaps = cs.reduce((n, c) => n + c.snapshots.length, 0);
  return (
    heading(
      "THE ROSTER",
      "Your characters",
      "One place for every chapter of your adventure.",
      action("add-manual", "+ Add character") +
        action("import", "⇧ Import character", true),
    ) +
    `<section class="stats" aria-label="Roster totals"><div class="stat"><span class="stat-label">Characters</span><span class="stat-value">${cs.length.toString().padStart(2, "0")}</span></div><div class="stat"><span class="stat-label">Highest level</span><span class="stat-value">${cs.length ? Math.max(...cs.map((c) => latest(c).level)) : "—"}</span></div><div class="stat"><span class="stat-label">Saved snapshots</span><span class="stat-value">${snaps.toString().padStart(2, "0")}</span></div></section><div class="section-row"><h2>Character collection</h2>${cs.length ? `<input class="search" id="search" aria-label="Search characters" placeholder="Find a character…" value="${esc(query)}">` : '<span class="muted">Your story starts here</span>'}</div><section class="panel account-switcher"><div class="section-row"><h2>WoW game accounts</h2>${action("new-game-account", "+ Add game account")}</div><p>Organize characters by WoW license. Legacy Points are shared across these game accounts when they belong to the same Battle.net account.</p><div class="account-tabs"><button data-account-filter="all" class="${accountFilter === "all" ? "selected" : ""}">All accounts</button>${current()
      .gameAccounts.map(
        (a) =>
          `<button data-account-filter="${esc(a.id)}" class="${accountFilter === a.id ? "selected" : ""}">${esc(a.name)} · ${current().characters.filter((c) => (latest(c).accountId || "default") === a.id).length}</button>`,
      )
      .join(
        "",
      )}</div>${accountFilter !== "all" ? action("edit-game-account", "Manage account") : ""}</section><div id="roster-results">${cardsHTML()}</div><div class="note">${account ? "Imports are snapshots, not a live connection. Your characters and plans sync privately to your account." : "Imports are snapshots, not a live connection. This roster stays in this browser. Sign in to keep a separate cloud armory, or download a backup."}</div>`
  );
}
function cardsHTML() {
  const cs = current().characters.filter(
    (c) =>
      accountFilter === "all" ||
      (latest(c).accountId || "default") === accountFilter,
  );
  if (!current().characters.length)
    return empty(
      "A new chapter awaits",
      "Import your first character from the game, or add one manually to start planning your next session.",
      action("empty-import", "Import your first character", true) +
        action("demo", "Explore example roster"),
    );
  const matches = cs.filter((c) =>
    `${latest(c).name} ${latest(c).class} ${playStyleLabel(latest(c))}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  if (!matches.length)
    return '<p class="muted">No characters match your search.</p>';
  return `<div class="cards">${matches
    .map((c) => {
      const s = latest(c),
        [cn, color] = CLASSES[s.class],
        xp =
          s.xpMax > 0 && s.xp != null
            ? Math.min(100, (s.xp / s.xpMax) * 100)
            : null;
      return `<article class="character" data-faction="${esc(s.faction)}" style="--class-color:${color}"><div class="card-head"><span class="sigil" aria-hidden="true">${cn[0]}</span><span class="level-label">LEVEL<strong>${s.level}</strong></span></div><h3>${esc(s.name)}</h3><div class="class-line">${esc(s.race)} ${cn}</div><div class="realm muted">${esc(current().gameAccounts.find((a) => a.id === (s.accountId || "default"))?.name || "WoW 1")} · ${esc(playStyleLabel(s))}${s.zone ? " · " + esc(s.zone) : ""}</div><div class="xp-caption"><span>${xp === null ? "XP not captured" : "Level progress"}</span><span>${xp === null ? "—" : Math.round(xp) + "%"}</span></div><div class="xp-track"><span style="width:${xp ?? 0}%"></span></div><div class="card-prof">${s.professions.length ? s.professions.map((p) => esc(p.name)).join(" · ") : "Professions not captured"}</div><div class="card-bottom"><small>${date(s.observedAt)}</small><a class="button" href="#character/${encodeURIComponent(c.id)}" aria-label="View ${esc(s.name)}">View character ↗</a></div></article>`;
    })
    .join("")}</div>`;
}
function bindRoster() {
  document.querySelectorAll("[data-account-filter]").forEach(
    (el) =>
      (el.onclick = () => {
        accountFilter = el.dataset.accountFilter;
        render();
      }),
  );
  $("#new-game-account")?.addEventListener("click", () => gameAccountDialog());
  $("#edit-game-account")?.addEventListener("click", () =>
    gameAccountDialog(
      current().gameAccounts.find((a) => a.id === accountFilter),
    ),
  );
  $("#search")?.addEventListener("input", (e) => {
    query = e.target.value;
    $("#roster-results").innerHTML = cardsHTML();
  });
  $("#empty-import")?.addEventListener("click", importDialog);
  $("#demo")?.addEventListener("click", () => {
    demo = true;
    query = "";
    render();
  });
}
function findChar(id) {
  try {
    return current().characters.find((c) => c.id === decodeURIComponent(id));
  } catch {
    return null;
  }
}
function characterView(id) {
  const c = findChar(id);
  if (!c)
    return empty(
      "Character not found",
      "Return to your roster and select a character.",
      '<a class="button" href="#roster">Back to characters</a>',
    );
  const s = latest(c),
    [cn, color] = CLASSES[s.class];
  return `<a href="#roster" class="text-button">← All characters</a><div style="margin-top:22px">${heading("CHARACTER RECORD", esc(s.name), `${esc(s.race)} ${cn} · ${esc(playStyleLabel(s))}`, action("update-manual", "Update manually") + action("import", "Import update", true))}</div><div class="detail-meta"><span class="chip" style="color:${color}">Level ${s.level} ${cn}</span><span class="chip">${esc(s.faction) || "Faction not captured"}</span><span class="chip">${esc(s.zone) || "Zone not captured"}</span><span class="chip">${c.snapshots.length} snapshots</span><span class="chip">${esc(current().gameAccounts.find((a) => a.id === (s.accountId || "default"))?.name || "WoW account")}</span></div><div class="subnav" aria-label="Character sections">${["profile", "social", "equipment", "inventory", "professions", "encounters", "progress", "plans", "legacy"].map((t) => `<button data-tab="${t}" class="${tab === t ? "selected" : ""}" aria-pressed="${tab === t}">${{ profile: "Profile", social: "RP & story", equipment: "Equipment & talents", inventory: "Inventory", professions: "Professions", encounters: "Dungeons & raids", progress: "Progress history", plans: "Adventure plans", legacy: "Legacy perks" }[t]}</button>`).join("")}</div>${tab === "social" ? socialProfile(c, current()) : tab === "profile" ? profile(c) + armorySummary(c, current()) : tab === "inventory" ? inventoryView(c) : tab === "professions" ? professionSection(s) : tab === "encounters" ? progressSection(s, true) : tab === "equipment" ? equipment(c) + savedBuilds(s) : tab === "progress" ? history(c) + '<h2>Character stories</h2>' + activityCards(current(), c.id) + eventSection(current(), {characterId:c.id,completedOnly:true}) : tab === "legacy" ? legacyPerks(c) : plans(c)}<p><small>Latest observation: ${esc(new Date(s.observedAt).toLocaleString())}${s.importedAt ? ` · Imported: ${esc(new Date(s.importedAt).toLocaleString())}` : ""} · ${esc(s.source)}</small></p><button id="delete-character" class="text-button danger">Remove character</button>`;
}
function equipment(c) {
  const s = latest(c);
  return `<div class="two-col"><section class="panel"><div class="section-row"><h2>Equipment</h2><span class="muted">${s.gear.length} slots captured</span></div>${
    s.gear.length
      ? s.gear
          .slice()
          .sort((a, b) => a.slot - b.slot)
          .map(
            (g) =>
              `<div class="gear-row"><span>${SLOTS[g.slot]}</span><strong class="quality-${g.quality}">${esc(g.name)}<br><small>Item ${g.id}${g.link ? " · Item details saved" : ""}</small></strong></div>`,
          )
          .join("")
      : "<p>No equipment captured yet. Use the included Forever Armory addon to export your equipped items.</p>"
  }</section><div><section class="panel"><h2>Talents</h2><p><a class="button" href="#talents/${s.class.toLowerCase()}/${Math.min(60, s.level)}">Plan a talent build ↗</a></p>${s.talents.length ? s.talents.map((t) => `<div class="gear-row"><span>${esc(t)}</span></div>`).join("") : "<p>No talent data in this snapshot.</p>"}</section><section class="panel"><h2>Professions & purse</h2>${s.professions.map((p) => `<div class="gear-row"><span>${esc(p.name)}</span><strong>${p.rank == null ? "Rank not captured" : p.rank + (p.max ? "/" + p.max : "")}</strong></div>`).join("") || "<p>Professions not captured.</p>"}<div class="gear-row"><span>Gold</span><strong>${money(s.money)}</strong></div></section></div></div>${s.warnings.length ? `<div class="note">${s.warnings.map(esc).join("<br>")}</div>` : ""}`;
}
function questJournal(s) {
  if(!s.questHistory && !s.completedQuestIDs)return '';
  const events=(s.questHistory||[]).slice(-50).reverse();
  return `<section class="panel"><h2>Completed quest journal</h2><p>${s.completedQuestIDs?.length||0} known completed quest IDs · ${s.questHistory?.length||0} recorded turn-ins. Backfilled IDs have no invented completion time.</p>${events.length?`<p><small>Latest ${events.length} turn-ins. The full imported journal is included in your backup.</small></p><div class="table-wrap"><table><thead><tr><th>Turned in</th><th>Quest</th><th>Level</th><th>Zone</th></tr></thead><tbody>${events.map(e=>`<tr><td>${date(e.completedAt)}</td><td>${esc(e.name)||'Quest '+e.questId}</td><td>${e.level??'—'}</td><td>${esc(e.zone)||'—'}</td></tr>`).join('')}</tbody></table></div>`:'<p>No timed turn-ins imported yet. Install addon 0.3.0, complete a quest, then import the saved session.</p>'}</section>`;
}
function history(c) {
  const ss = c.snapshots,
    max = Math.max(...ss.map((s) => s.level)),
    min = Math.min(...ss.map((s) => s.level)),
    points = ss
      .map(
        (s, i) =>
          `${45 + (i / (ss.length - 1 || 1)) * 510},${115 - ((s.level - min) / (max - min || 1)) * 85}`,
      )
      .join(" ");
  return `<section class="panel"><div class="section-row"><h2>The journey so far</h2><span class="muted">${ss.length} snapshots</span></div>${ss.length > 1 ? `<svg class="history-chart" viewBox="0 0 610 155" role="img" aria-label="Level increased from ${ss[0].level} to ${ss.at(-1).level} across ${ss.length} snapshots"><path d="M45 20V120H565" stroke="#4a5c4b" fill="none"/><text x="8" y="35">${max}</text><text x="8" y="120">${min}</text><polyline points="${points}" fill="none" stroke="#d9b777" stroke-width="2.5"/><text x="45" y="147">First snapshot</text><text x="495" y="147">Latest</text></svg>` : "<p>Import after your next session to start seeing changes.</p>"}<div class="table-wrap"><table><thead><tr><th>Recorded</th><th>Level</th><th>Zone</th><th>Gold</th><th>Changes from prior snapshot</th></tr></thead><tbody>${ss
    .map((s, i) => {
      const p = ss[i - 1];
      const changes = progressChanges(p,s);
      return `<tr><td>${date(s.observedAt)}</td><td>${s.level}</td><td>${esc(s.zone) || "—"}</td><td>${money(s.money)}</td><td>${i ? changes.map(esc).join(" · ") || "Snapshot saved" : "First snapshot"}</td></tr>`;
    })
    .reverse()
    .join(
      "",
    )}</tbody></table></div><p style="margin-top:16px"><small>History begins with your first import. Each row reflects only the fields that export captured.</small></p></section>${questJournal(ss.at(-1))}`;
}
function taskHTML(t) {
  const c = current().characters.find((c) => c.id === t.characterId);
  return `<div class="task ${t.done ? "done" : ""}"><input type="checkbox" data-task="${esc(t.id)}" ${t.done ? "checked" : ""} aria-label="Complete ${esc(t.title)}"><div class="task-body"><span class="task-title">${esc(t.title)}</span><small>${esc(t.category)} · ${esc(c ? latest(c).name : "Unknown character")}</small>${t.notes ? `<p>${/^https?:\/\/[^\s]+#talents\/[a-z]+\/[0-9]+\/[0-9]+$/.test(t.notes) ? `<a href="#talents/${esc(t.notes.split("#talents/")[1])}">Open saved talent build ↗</a>` : esc(t.notes)}</p>` : ""}</div><button class="text-button" data-edit-task="${esc(t.id)}" aria-label="Edit ${esc(t.title)}">Edit</button></div>`;
}
function plans(c) {
  const tasks = current().tasks.filter((t) => t.characterId === c.id);
  return `<section class="panel"><div class="section-row"><h2>Next time you log in</h2>${action("new-task", "+ Add goal", true)}</div>${tasks.length ? tasks.map(taskHTML).join("") : "<p>Set a zone, dungeon, gear, or profession goal for this character.</p>"}</section>`;
}
function journalView() {
  const tasks = current().tasks;
  return (
    heading(
      "ADVENTURE JOURNAL",
      "Make the next session count.",
      "Zones to explore. Dungeons to clear. Something to work toward.",
      current().characters.length ? action("new-task", "+ Add goal", true) : "",
    ) +
    (current().characters.length
      ? `<section class="panel"><div class="section-row"><h2>Your checklist</h2><span class="muted">${tasks.filter((t) => t.done).length} / ${tasks.length} complete</span></div>${tasks.length ? tasks.map(taskHTML).join("") : "<p>No goals yet. Add one to plan your next adventure.</p>"}</section>`
      : empty(
          "Choose your adventurer first",
          "Add a character to start a personal quest list.",
          '<a class="button primary" href="#roster">Go to characters</a>',
        ))
  );
}
function guideView() {
  return (
    heading(
      "KEEP YOUR STORY",
      "Import & backups",
      "Bring your character home after every session.",
    ) +
    `<div class="two-col"><section class="panel"><h2>From Azeroth to your armory</h2><ol class="steps"><li><strong>Install the companion addon.</strong><br>Extract the download into your Forever client’s <code>Interface/AddOns</code> folder. The folder should be named <code>ForeverArmory</code>.</li><li><strong>Capture your character.</strong><br>Log in and type <code>/farmory</code>. Copy the selected export text.</li><li><strong>Save a snapshot.</strong><br>Choose Import character, paste the text, and review before saving.</li></ol><div class="actions"><a class="button" href="./downloads/ForeverArmory.zip?v=0.3.0" download>↓ Download addon</a>${action("import", "Import character", true)}</div><div class="note">Addon 0.3.0 saves a session export automatically on normal logout, exit or /reload. Upload your character SavedVariables/ForeverArmory.lua here after logout, or use /farmory last next login. Quest turn-ins persist between sessions. Open your bank and each profession to populate caches. /farmory help explains the commands. The new collectors still need in-game verification; unavailable APIs produce warnings.</div><h3>Already using WoW Forever Builds?</h3><p>Paste its <code>/wfb</code> export to import basic character details, professions, and talent-tree totals. Gear and gold are not included in that format.</p><p><small>MythicSim exports are not supported in this version.</small></p></section><div><section class="panel"><h2>A backup for every adventure</h2><p>${account ? "Your data is saved privately in your account and syncs across signed-in devices. Backups give you an extra copy." : "This local roster is stored only in this browser. Clearing browser data removes it. Sign in to start a synced account armory."}</p><p>Download a backup after playing. Restore it to merge characters, snapshots, and goals into your ${account ? "signed-in account" : "local roster"}.</p><div class="actions">${action("backup", "↓ Download backup")}${action("restore", "Restore backup")}</div><p style="margin-top:18px"><small>Your roster is private. Other users cannot read or edit your characters.</small></p></section><section class="panel"><h2>Start without an addon</h2><p>Add a character manually, then import game data later using the same full name and play style.</p>${action("add-manual", "+ Add character")}<p style="margin-top:18px"><button class="text-button" id="demo">Explore example roster</button></p></section>${storageBlocked ? `<section class="panel"><h2>Recover browser data</h2><p>Save the original data before resetting this browser’s armory.</p>${action("recover", "Download recovery file")}${action("reset", "Reset unreadable storage")}</section>` : ""}</div></div>`
  );
}
function bindCommon() {
  $("#import")?.addEventListener("click", importDialog);
  $("#add-manual")?.addEventListener("click", () => manualDialog());
}
function bindCharacter(id) {
  const c = findChar(id);
  if (!c) return;
  bindSocial($("#main"), current(), c.id, commit, render);
  if ($("#inventory-search")) bindInventory($("#main"), c);
  $("#edit-notes")?.addEventListener("click", () => notesDialog(c));
  $("#edit-progress")?.addEventListener("click", () => progressDialog(c));
  document.querySelectorAll("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.tab;
        render();
      }),
  );
  $("#update-manual")?.addEventListener("click", () => manualDialog(latest(c)));
  $("#delete-character")?.addEventListener("click", () =>
    modal(
      "Remove this character?",
      `<p>This removes ${esc(latest(c).name)}, their snapshots, goals, RP profile, journal entries, RSVPs, and events they host ${account ? "from your account on all devices" : "from this browser"}. Download a backup first if you may want them later.</p><div class="modal-actions">${action("save-first", "Download backup")}${action("confirm-delete", "Remove character")}</div><p id="form-error" class="error" role="alert"></p>`,
      () => {
        $("#save-first").onclick = backup;
        $("#confirm-delete").onclick = async () => {
          try {
            const publicId=current().social?.profiles.find(p=>p.characterId===c.id)?.publicId;
            if(publicId && (!cloudClient?.community || await cloudClient.community.profile(publicId)))
              throw Error("Unpublish this character in Community before removing its private record.");
            const n = structuredClone(current());
            removeSocialCharacter(n, c.id);
            removeCharacterEvents(n, c.id);
            n.characters = n.characters.filter((x) => x.id !== c.id);
            n.tasks = n.tasks.filter((x) => x.characterId !== c.id);
            delete n.legacy.perks[c.id];
            await commit(n);
            $("#modal").close();
            location.hash = "roster";
            toast("Character removed.");
          } catch (e) {
            fail(e);
          }
        };
      },
    ),
  );
  $("#new-task")?.addEventListener("click", () => taskDialog(c.id));
  bindTasks();
}
function bindJournal() {
  $("#new-task")?.addEventListener("click", () => taskDialog());
  bindTasks();
}
function bindTasks() {
  document.querySelectorAll("[data-task]").forEach(
    (el) =>
      (el.onchange = async () => {
        try {
          const n = structuredClone(current());
          n.tasks.find((t) => t.id === el.dataset.task).done = el.checked;
          await commit(n);
          render();
        } catch (e) {
          el.checked = !el.checked;
          fail(e);
        }
      }),
  );
  document.querySelectorAll("[data-edit-task]").forEach(
    (el) =>
      (el.onclick = () =>
        taskDialog(
          null,
          current().tasks.find((t) => t.id === el.dataset.editTask),
        )),
  );
}
function bindGuide() {
  $("#backup")?.addEventListener("click", backup);
  $("#restore")?.addEventListener("click", restoreDialog);
  if ($("#demo"))
    $("#demo").onclick = () => {
      demo = true;
      query = "";
      location.hash = "roster";
      render();
    };
  $("#recover")?.addEventListener("click", async () => {
    try {
      download(
        "forever-armory-recovery.txt",
        localStorage.getItem(KEY) || "No saved data found.",
        "text/plain",
      );
    } catch (e) {
      toast("Browser storage is inaccessible. Try allowing site storage.");
    }
  });
  $("#reset")?.addEventListener("click", () =>
    modal(
      "Reset unreadable storage?",
      `<p>Download the recovery file first. This clears the saved armory on this browser only.</p><div class="modal-actions">${action("confirm-reset", "Reset storage")}</div><p id="form-error" class="error" role="alert"></p>`,
      () => {
        $("#confirm-reset").onclick = async () => {
          try {
            localStorage.removeItem(KEY);
            state = emptyState();
            storageBlocked = false;
            $("#modal").close();
            render();
            toast("Storage reset. You can restore a backup now.");
          } catch (e) {
            fail(e);
          }
        };
      },
    ),
  );
}
function importDialog() {
  modal(
    "Import a character",
    `<p>Paste a <code>/farmory</code> or <code>/wfb</code> export, or choose your character’s <code>SavedVariables/ForeverArmory.lua</code> after logging out. Addon 0.3.0 saves a session export automatically. You’ll review it before saving.</p><form id="import-form"><label>Character export<textarea id="import-text" class="import-text" required spellcheck="false" placeholder="Paste your character export here…"></textarea></label><label>Or choose a character JSON or saved session file<input type="file" id="import-file" accept=".json,.txt,.lua" class="file-input"></label><p id="form-error" class="error" role="alert"></p><div class="modal-actions"><button class="primary" type="submit">Review import</button></div></form>`,
    () => {
      $("#import-file").onchange = async (e) => {
        const f = e.target.files[0];
        if (f) {
          try {
            const savedFile=/\.lua$/i.test(f.name);
            if(f.size>(savedFile?20e6:1e6))throw Error(savedFile?'Choose a SavedVariables file smaller than 20 MB.':'Choose a file smaller than 1 MB.');
            const text=await f.text();
            $("#import-text").value=savedFile?sessionExportText(text):text;
            $("#form-error").textContent='';
          } catch(err) { $("#import-text").value='';fail(err); }
        }
      };
      $("#import-form").onsubmit = async (e) => {
        e.preventDefault();
        try {
          previewImport(parseImport($("#import-text").value));
        } catch (err) {
          fail(err);
        }
      };
    },
  );
}
function previewImport(s) {
  const guidMatches=s.gameIdentity?.guid ? current().characters.filter(c=>c.snapshots.some(x=>x.gameIdentity?.guid===s.gameIdentity.guid&&x.gameIdentity?.realm===s.gameIdentity.realm)) : [];
  const selected=guidMatches.length===1 ? (guidMatches[0].snapshots.at(-1).accountId||'default') : accountFilter!=='all' ? accountFilter : current().gameAccounts.length===1 ? current().gameAccounts[0].id : '';
  modal(
    "Review character snapshot",
    `<p><span id="import-match">Choose the WoW account to check character matching.</span></p><label>WoW game account<select id="import-account"><option value="">Choose account…</option>${accountOptions(selected)}</select></label><label>Match an existing character (optional)<select id="import-target"><option value="">Automatic matching / new character</option></select></label><p><small>Use an explicit match for an older manual character whose full name differs. Check the name and account carefully; history and the profile link will be retained.</small></p><div class="preview-grid"><div><small>Character</small>${esc(s.name)}</div><div><small>Play style</small>${esc(playStyleLabel(s))}</div><div><small>Class & level</small>${CLASSES[s.class][0]} · ${s.level}</div><div><small>Equipment</small>${s.gear.length} slots captured</div></div><p style="margin-top:16px"><small>${s.gameIdentity?.guid ? "Stable game GUID captured. Renames will update the existing character." : "No game GUID captured. Matching uses the full name and server/play style within your selected account; a rename requires a GUID to link automatically."} Captured ${date(s.observedAt)}. ${s.inventory?.length || 0} storage stacks · ${s.quests?.length || 0} quests · ${s.talentDetails?.length || 0} talent ranks. Raw export fields are preserved privately.</small></p>${s.warnings.length ? `<div class="note">${s.warnings.map(esc).join("<br>")}</div>` : ""}<p id="form-error" class="error" role="alert"></p><div class="modal-actions">${action("back-import", "Back")}${action("save-import", "Save snapshot", true)}</div>`,
    () => {
      const matchPreview=()=>{const accountId=$("#import-account").value;$("#save-import").disabled=!accountId;if(!accountId)return;try{const found=importMatch(current(),{...s,accountId});$("#import-match").textContent=found?`Update ${found.snapshots.at(-1).name}; keep its history and RP profile.`:'Create a new character in this account.';$("#form-error").textContent='';}catch(e){$("#save-import").disabled=true;fail(e);}};
      $("#import-account").value=selected;
      const targets=()=>{const a=$("#import-account").value;$("#import-target").innerHTML='<option value="">Automatic matching / new character</option>'+current().characters.filter(c=>{const x=c.snapshots.at(-1);return (x.accountId||'default')===a&&x.class===s.class;}).map(c=>`<option value="${esc(c.id)}">${esc(c.snapshots.at(-1).name)}</option>`).join('');matchPreview();};
      $("#import-account").onchange=targets;targets();
      $("#back-import").onclick = importDialog;
      $("#save-import").onclick = async () => {
        try {
          const accountId = $("#import-account").value;
          const snapshot = normalize({ ...s, accountId });
          if (!current().gameAccounts.some((a) => a.id === accountId))
            throw Error("Choose a game account.");
          const result = addSnapshot(current(), snapshot, {targetId:$("#import-target").value || undefined});
          await commit(result.state);
          $("#modal").close();
          tab = "profile";
          query = "";
          location.hash = "character/" + encodeURIComponent(result.id);
          render();
          toast(
            result.duplicate
              ? "This snapshot is already saved."
              : "Character snapshot saved.",
          );
        } catch (e) {
          fail(e);
        }
      };
    },
  );
}
function manualDialog(s) {
  const existingId = s ? keyOf(s) : null,
    parts = (s?.name || "").split(/\s+/),
    main = s?.mainName || parts[0] || "",
    secondary = s?.secondaryName || parts.slice(1).join(" ") || "";
  modal(
    s ? "Update character" : "Add a character",
    `<form id="manual-form"><p>Forever uses two character names and a play style. Enter the names exactly as they appear in game.</p><div class="form-grid"><label>WoW game account<select name="accountId">${accountOptions(s?.accountId || accountFilter)}</select></label><label>First name<input name="mainName" required maxlength="48" autocomplete="off" value="${esc(main)}" placeholder="e.g. Asha"></label><label>Last name (surname)<input name="secondaryName" required maxlength="48" autocomplete="off" value="${esc(secondary)}" placeholder="e.g. Brightvale"></label><label>Play style<select name="playStyle" required><option value="">Choose a play style…</option>${PLAY_STYLES.map((v) => `<option value="${v}" ${playStyleOf(s || {}) === v ? "selected" : ""}>${v === "Normal" ? "Normal (PvE)" : v === "Roleplaying" ? "Roleplaying (RP)" : v === "Hardcore" ? "Hardcore (future planning)" : v}</option>`).join("")}</select></label><label>Class<select name="class">${Object.entries(
      CLASSES,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${s?.class === k ? "selected" : ""}>${v[0]}</option>`,
      )
      .join(
        "",
      )}</select></label><label>Level<input name="level" type="number" min="1" max="60" step="1" required value="${s?.level ?? 1}"></label><label>Race<input name="race" maxlength="40" value="${esc(s?.race)}" placeholder="e.g. Forsaken"></label><label>Faction<select name="faction" required><option value="">Choose a faction…</option>${["Horde", "Alliance"].map((f) => `<option ${s?.faction === f ? "selected" : ""}>${f}</option>`).join("")}</select></label><label>Guild<select name="guildId"><option value="">No guild</option>${current()
      .guilds.map(
        (g) =>
          `<option value="${esc(g.id)}" ${s?.guildId === g.id ? "selected" : ""}>${esc(g.name)}</option>`,
      )
      .join(
        "",
      )}</select></label><label>Guild rank<input name="guildRank" maxlength="80" value="${esc(s?.guildRank || "")}" placeholder="Member"></label><label class="full">Current zone<input name="zone" maxlength="100" value="${esc(s?.zone)}" placeholder="e.g. Tirisfal Glades"></label><label class="full">Professions, separated by commas<input name="professions" maxlength="300" value="${esc(s?.professions.map((p) => p.name).join(", "))}" placeholder="Mining, Blacksmithing"></label></div><p><small>Hardcore is listed for planning; Blizzard has announced it for after launch. Editing a play style here only corrects your armory record, not your character in game.${s ? " Name and play style corrections keep your snapshots and plans together." : ""}</small></p><p id="form-error" class="error" role="alert"></p><div class="modal-actions"><button type="submit" class="primary">Save character</button></div></form>`,
    () => {
      $("#manual-form").onsubmit = async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('[type="submit"]');
        button.disabled = true;
        try {
          const o = Object.fromEntries(new FormData(e.target));
          o.professions = o.professions
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) => s?.professions.find((x) => x.name === p) || p);
          const guild = current().guilds.find((g) => g.id === o.guildId);
          if (guild && guild.faction !== "Both" && guild.faction !== o.faction)
            throw Error("Choose a guild matching the character faction.");
          const result = saveManualCharacter(current(), o, existingId);
          await commit(result.state);
          $("#modal").close();
          query = "";
          location.hash = "character/" + encodeURIComponent(result.id);
          render();
          toast("Character saved.");
        } catch (err) {
          fail(err);
        } finally {
          button.disabled = false;
        }
      };
    },
  );
}

function taskDialog(id, task) {
  modal(
    task ? "Edit adventure goal" : "Plan your next adventure",
    `<form id="task-form"><label>Character<select name="characterId">${current()
      .characters.map(
        (c) =>
          `<option value="${esc(c.id)}" ${c.id === (task?.characterId || id) ? "selected" : ""}>${esc(latest(c).name)} · ${esc(current().gameAccounts.find((a) => a.id === (latest(c).accountId || "default"))?.name || "WoW 1")}</option>`,
      )
      .join(
        "",
      )}</select></label><label>Goal<input name="title" required maxlength="200" value="${esc(task?.title)}" placeholder="What do you want to do next?"></label><label>Category<select name="category">${["Zone", "Dungeon", "Raid", "Gear", "Profession", "Other"].map((c) => `<option ${task?.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></label><label>Notes<textarea name="notes" maxlength="2000" placeholder="Quest pickups, preparation, or where to go…">${esc(task?.notes)}</textarea></label><p id="form-error" class="error" role="alert"></p><div class="modal-actions">${task ? action("remove-goal", "Remove goal") : ""}<button class="primary" type="submit">Save goal</button></div></form>`,
    () => {
      $("#task-form").onsubmit = async (e) => {
        e.preventDefault();
        try {
          const n = structuredClone(current()),
            o = Object.fromEntries(new FormData(e.target));
          if (!o.title.trim()) throw new Error("Enter a goal title.");
          const t = {
            ...o,
            title: o.title.trim(),
            done: task?.done ?? false,
            id: task?.id ?? newId(),
          };
          if (task) n.tasks[n.tasks.findIndex((x) => x.id === task.id)] = t;
          else n.tasks.push(t);
          await commit(n);
          $("#modal").close();
          render();
          toast("Goal saved.");
        } catch (err) {
          fail(err);
        }
      };
      $("#remove-goal")?.addEventListener("click", async () => {
        try {
          const n = structuredClone(current());
          n.tasks = n.tasks.filter((t) => t.id !== task.id);
          await commit(n);
          $("#modal").close();
          render();
          toast("Goal removed.");
        } catch (e) {
          fail(e);
        }
      });
    },
  );
}
function restoreDialog() {
  modal(
    "Restore a backup",
    `<p>Choose a Forever Armory backup. Characters and history will merge into your ${account ? "signed-in account" : "local roster"}. Conflicting goals are kept as separate entries.</p><label>Backup file<input id="backup-file" type="file" accept=".json" class="file-input"></label><div id="restore-summary"></div><p id="form-error" class="error" role="alert"></p><div class="modal-actions"><button id="merge-backup" class="primary" disabled>Merge backup</button></div>`,
    () => {
      let incoming;
      $("#backup-file").onchange = async (e) => {
        incoming = null;
        $("#merge-backup").disabled = true;
        $("#form-error").textContent = "";
        $("#restore-summary").textContent = "";
        try {
          const f = e.target.files[0];
          if (!f) return;
          if (f.size > 20e6)
            throw new Error("Choose a backup smaller than 20 MB.");
          incoming = validateBackup(JSON.parse(await f.text()));
          $("#restore-summary").textContent =
            `${incoming.characters.length} characters and ${incoming.tasks.length} goals ready to merge.`;
          $("#merge-backup").disabled = false;
        } catch (err) {
          fail(err);
        }
      };
      $("#merge-backup").onclick = async () => {
        try {
          if (!incoming) return;
          await commit(mergeBackup(current(), incoming));
          $("#modal").close();
          render();
          toast("Backup merged.");
        } catch (e) {
          fail(e);
        }
      };
    },
  );
}

function accountOptions(selected = "default") {
  const chosen = selected === "all" ? "default" : selected;
  return current()
    .gameAccounts.map(
      (a) =>
        `<option value="${esc(a.id)}" ${a.id === chosen ? "selected" : ""}>${esc(a.name)}</option>`,
    )
    .join("");
}
function gameAccountDialog(existing) {
  modal(
    existing ? "Manage WoW game account" : "Add WoW game account",
    `<form id="game-account-form"><p>Use the names shown in your Battle.net game account list, such as WoW 1 or WoW 2. These entries organize this armory; they do not connect to Blizzard.</p><label>Game account name<input name="name" maxlength="80" required value="${esc(existing?.name || "")}" placeholder="WoW 2"></label><label>Legacy status / notes<input name="legacyStatus" maxlength="200" value="${esc(existing?.legacyStatus || "")}" placeholder="Optional status; no automatic entitlement verification"></label><p id="form-error" class="error" role="alert"></p><div class="modal-actions"><button class="primary" type="submit">${existing ? "Save name" : "Add account"}</button></div></form>`,
    () => {
      $("#game-account-form").onsubmit = async (e) => {
        e.preventDefault();
        try {
          const name = e.target.elements.name.value.trim(),
            legacyStatus = e.target.elements.legacyStatus.value.trim(),
            n = structuredClone(current());
          if (!name) throw Error("Enter an account name.");
          if (
            n.gameAccounts.some(
              (a) =>
                a.name.toLowerCase() === name.toLowerCase() &&
                a.id !== existing?.id,
            )
          )
            throw Error("That game account name is already in use.");
          if (existing)
            Object.assign(
              n.gameAccounts.find((a) => a.id === existing.id),
              { name, legacyStatus },
            );
          else {
            if (n.gameAccounts.length >= 30)
              throw Error("You can track up to 30 game accounts.");
            const id = newId();
            n.gameAccounts.push({ id, name, legacyStatus });
            accountFilter = id;
          }
          await commit(n);
          $("#modal").close();
          render();
          toast(existing ? "Game account renamed." : "Game account added.");
        } catch (err) {
          fail(err);
        }
      };
    },
  );
}
function legacyView() {
  const n = current(),
    earned = earnedChallenges(n),
    points = legacyPoints(n),
    eligible = n.characters.filter(
      (c) => playStyleOf(latest(c)) !== "Hardcore",
    );
  return (
    heading(
      "BATTLE.NET PROGRESSION",
      "Legacy system",
      "Track shared challenges and plan each character’s perks.",
    ) +
    `<section class="panel legacy-summary"><div><strong>${points} / 65</strong><span>Legacy Challenges completed</span></div><div><strong>${Math.min(16, points)}</strong><span>Points spendable per character at launch</span></div><p>One completed challenge earns one point across the WoW game accounts in this Battle.net group. Every non-Hardcore character can spend the full earned pool independently. This tracker does not read your Blizzard account. <a href="${LEGACY_SOURCE}" target="_blank" rel="noopener">Blizzard’s Legacy guide ↗</a></p></section><div class="legacy-layout"><section class="panel"><h2>Legacy Challenges</h2><p>Class levels and known profession ranks fill in from imported snapshots. Check other completed challenges yourself.</p>${[
      ...new Set(CHALLENGES.map((c) => c.group)),
    ]
      .map((group) => {
        const list = CHALLENGES.filter((c) => c.group === group);
        return `<details class="legacy-group" ${group === "Classes" ? "open" : ""}><summary>${group} <span>${list.filter((c) => earned.has(c.id)).length} / ${list.length}</span></summary><div class="legacy-checks">${list.map((c) => `<label><input type="checkbox" data-challenge="${c.id}" ${earned.has(c.id) ? "checked" : ""} ${earned.has(c.id) && !n.legacy.challenges.includes(c.id) ? "disabled" : ""}><span>${esc(c.label)}</span></label>`).join("")}</div></details>`;
      })
      .join(
        "",
      )}</section><section class="panel"><h2>Character perks</h2>${eligible.length ? `<label>Character<select id="legacy-character">${eligible.map((c) => `<option value="${esc(c.id)}" ${c.id === (legacyCharacter || eligible[0].id) ? "selected" : ""}>${esc(latest(c).name)} · ${esc(n.gameAccounts.find((a) => a.id === (latest(c).accountId || "default"))?.name || "WoW 1")}</option>`).join("")}</select></label><div id="legacy-perk-view">${legacyPerks(eligible.find((c) => c.id === legacyCharacter) || eligible[0])}</div>` : "<p>Add a non-Hardcore character to plan Legacy perks.</p>"}<p><small>Blizzard has not published every rank cap or prerequisite in text. Rank plans here track points and the 16-point launch spending limit; compare choices against the in-game tree before spending.</small></p></section></div><section class="panel legacy-rewards"><h2>Legacy Rewards</h2><p>Cosmetic rewards accumulate with Battle.net Legacy progress. These rewards unlock as your Battle.net Legacy total grows.</p><div class="reward-list"><span>15 points · Replica Ironforge Air Rifle ${points >= 15 ? "✓" : ""}</span><span>25 points · Spectral Bear Cub ${points >= 25 ? "✓" : ""}</span><span>40 points · Spectral Bear Tabard ${points >= 40 ? "✓" : ""}</span><span>55 points · Reins of the Spectral Bear ${points >= 55 ? "✓" : ""}</span></div></section>`
  );
}
function legacyPerks(c) {
  if (!c) return "<p>Choose a character.</p>";
  if (playStyleOf(latest(c)) === "Hardcore")
    return '<div class="note">Hardcore Legacy Challenges are separate and will arrive after launch.</div>';
  const points = legacyPoints(current()),
    allocation = current().legacy.perks[c.id] || {},
    spent = perkTotal(allocation),
    remaining = Math.min(16, points) - spent;
  return `<div class="legacy-remaining"><strong>${spent} / ${Math.min(16, points)}</strong><span>${remaining} available for this character</span></div>${Object.entries(
    PERKS,
  )
    .map(
      ([tree, perks]) =>
        `<section class="legacy-perk-tree"><h3>${tree}</h3>${perks
          .map(([key, name, description]) => {
            const rank = allocation[key] || 0;
            return `<div class="legacy-perk"><div><strong>${esc(name)}</strong><small>${esc(description)}</small></div><div class="legacy-rank"><button type="button" data-perk="${key}" data-delta="-1" aria-label="Remove a point from ${esc(name)}" ${rank ? "" : "disabled"}>−</button><span>${rank}</span><button type="button" data-perk="${key}" data-delta="1" aria-label="Add a point to ${esc(name)}" ${remaining ? "" : "disabled"}>+</button></div></div>`;
          })
          .join("")}</section>`,
    )
    .join("")}`;
}
function bindLegacy() {
  document.querySelectorAll("[data-challenge]").forEach(
    (el) =>
      (el.onchange = async () => {
        try {
          const n = structuredClone(current()),
            id = el.dataset.challenge;
          if (el.checked) n.legacy.challenges.push(id);
          else {
            n.legacy.challenges = n.legacy.challenges.filter((x) => x !== id);
            const earned = legacyPoints(n);
            if (
              Object.values(n.legacy.perks).some(
                (x) => perkTotal(x) > Math.min(16, earned),
              )
            )
              throw Error(
                "Refund assigned character perks before removing this challenge.",
              );
          }
          await commit(n);
          render();
        } catch (e) {
          el.checked = !el.checked;
          fail(e);
        }
      }),
  );
  $("#legacy-character")?.addEventListener("change", (e) => {
    legacyCharacter = e.target.value;
    render();
  });
  document.querySelectorAll("[data-perk]").forEach(
    (el) =>
      (el.onclick = async () => {
        try {
          const id = $("#legacy-character")?.value || legacyCharacter;
          await commit(
            setPerkRank(
              current(),
              id,
              el.dataset.perk,
              Number(el.dataset.delta),
            ),
          );
          legacyCharacter = id;
          render();
        } catch (e) {
          fail(e);
        }
      }),
  );
}

initializeItemUI();
$("#backup-footer").onclick = backup;
window.addEventListener("hashchange", () => {
  $("#item-detail-modal")?.close();
  render();
});
window.addEventListener("storage", (e) => {
  if (e.key === KEY && !demo) {
    try {
      state = e.newValue
        ? validateBackup({
            format: "forever-armory-backup",
            ...JSON.parse(e.newValue),
          })
        : emptyState();
      render();
    } catch {
      storageBlocked = true;
      toast(
        "Another tab changed the saved local data. Reload before editing locally.",
      );
    }
  }
});
render();
// Optional page-scoped tools; no network or account access.
if (document.modelContext?.registerTool) {
  for (const tool of [
    {
      name: "list_armory_characters",
      description: "Read the current local roster and snapshot counts.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: () => ({
        characters: current().characters.map((c) => ({
          name: latest(c).name,
          playStyle: playStyleOf(latest(c)),
          level: latest(c).level,
          snapshots: c.snapshots.length,
        })),
      }),
    },
    {
      name: "stage_character_import",
      description:
        "Validate an export and open its review dialog. Does not save; the user confirms in the dialog.",
      inputSchema: {
        type: "object",
        properties: { exportText: { type: "string", maxLength: 1000000 } },
        required: ["exportText"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: (input) => {
        const s = parseImport(input?.exportText);
        previewImport(s);
        return {
          status: "awaiting_confirmation",
          name: s.name,
          playStyle: playStyleOf(s),
        };
      },
    },
  ])
    try {
      Promise.resolve(document.modelContext.registerTool(tool)).catch(() => {});
    } catch {}
}

function updateAccountHeader() {
  const status = demo
    ? "Example roster"
    : account
      ? cloudStatus === "saving"
        ? "Saving…"
        : cloudStatus === "loading"
          ? "Loading…"
          : ["error", "save-error"].includes(cloudStatus)
            ? "Sync needs attention"
            : "Saved to your account"
      : "Local to this device";
  $("#account-header").innerHTML =
    `<span class="local-badge">${status}</span><a href="#account" class="account-link">${account ? esc(account.name) : "Sign in"}</a>`;
}
function googleButton(id = "google-signin") {
  return `<button type="button" id="${id}" class="google-button" ${!cloudClient ? "disabled" : ""}><span aria-hidden="true" class="google-g">G</span>Continue with Google</button>`;
}
function signInView() {
  return `<section class="signin-panel"><span class="eyebrow">YOUR PERSONAL ARMORY</span><h1>One account.<br>Every adventure.</h1><p>Keep your characters, progress, and plans together. Pick up where you left off on any device.</p><div class="signin-benefits"><span>◈ A private character collection</span><span>↗ Progress that follows you</span><span>☷ A plan for your next session</span></div>${googleButton()}<p class="signin-small">New here? Your first Google sign-in creates your account automatically. We never receive your Google password.</p>${cloudError ? `<p class="error" role="alert">${esc(cloudError)}</p>` : ""}<div class="actions"><button id="use-local" class="text-button">Continue on this device only</button><button id="account-demo" class="text-button">Explore an example</button></div><a href="#account" class="privacy-link">How your data is stored</a></section>`;
}
function accountView() {
  let content;
  if (account) {
    content = `<div class="two-col"><section class="panel"><span class="eyebrow">SIGNED IN WITH GOOGLE</span><h2>${esc(account.name)}</h2><p>${esc(account.email)}</p><p>Your armory is private to this Google account. Sign in with the same account on another device to continue.</p><div class="actions">${action("refresh-cloud", "Refresh account")}${action("account-backup", "Download backup")}${action("signout", "Sign out")}</div><p style="margin-top:16px"><small>For shared computers, sign out when you finish. Your Google session for this site lasts for this browser session.</small></p></section><section class="panel"><h2>Your local roster</h2><p>${state.characters.length} characters and ${state.tasks.length} goals are saved on this browser, separately from your account.</p>${state.characters.length ? `<p>Upload them into <strong>${esc(account.email || account.name)}</strong>. Existing characters and history will merge; the local copy stays unchanged.</p>${action("migrate-local", "Review local roster upload", true)}` : "<p>Already have a backup? Restore it on the Import & backups page while signed in.</p>"}</section></div>`;
  } else
    content = `<section class="panel"><h2>Sign in or create an account</h2><p>Use Google to keep your character collection synced across your devices. A first sign-in creates your armory automatically.</p>${cloudConfigured ? googleButton() : '<div class="note">Account sign-in is being set up. Your local roster remains available.</div>'}${cloudStatus === "connecting" ? "<p>Connecting to sign-in…</p>" : ""}${cloudError ? `<p class="error" role="alert">${esc(cloudError)}</p>` : ""}<div class="actions" style="margin-top:20px"><button id="use-local" class="text-button">Open this device’s local roster</button></div></section>`;
  return (
    heading(
      "YOUR ACCOUNT",
      "Your adventure, wherever you play.",
      "A separate, private armory for every player.",
    ) +
    content +
    `<section class="panel"><h2>Your data, explained</h2><p>Google and Firebase handle sign-in. We use your Google name and email to show which account you are using. No access to Gmail, Drive, contacts, or other Google content is requested.</p><p>Character exports and adventure goals you choose to save while signed in are stored in Firebase under your account ID. Other users cannot read them. The site owner, as database administrator, can access stored records to operate the service.</p><p>Cloud character data is kept in memory on this browser and cleared from the page on sign-out. The optional local roster is stored separately on this device until you clear it. Download a backup anytime; remove a character to delete its snapshots and goals from the selected account or local roster.</p><p>Google/Firebase process authentication and service data under their own policies. No advertising or analytics SDK is enabled by this site.</p></section>`
  );
}
function bindAccount() {
  $("#google-signin")?.addEventListener("click", async () => {
    const b = $("#google-signin");
    b.disabled = true;
    try {
      await cloudClient.signIn();
    } catch (e) {
      cloudError = friendlyError(e);
      toast(cloudError);
      render();
    } finally {
      if (b.isConnected) b.disabled = false;
    }
  });
  $("#use-local")?.addEventListener("click", () => {
    localMode = true;
    demo = false;
    location.hash = "roster";
    render();
  });
  $("#account-demo")?.addEventListener("click", () => {
    demo = true;
    location.hash = "roster";
    render();
  });
  $("#account-backup")?.addEventListener("click", backup);
  $("#signout")?.addEventListener("click", async () => {
    try {
      await cloudClient.signOut();
      localMode = false;
      demo = false;
      location.hash = "account";
      render();
      toast("Signed out. Your cloud armory is no longer on this page.");
    } catch (e) {
      toast(friendlyError(e));
    }
  });
  for (const id of ["refresh-cloud", "retry-cloud"])
    $("#" + id)?.addEventListener("click", () => cloudClient?.refresh());
  $("#migrate-local")?.addEventListener("click", () => {
    const target = account?.uid;
    modal(
      "Upload this device’s roster?",
      `<p>Merge <strong>${state.characters.length} characters</strong> and <strong>${state.tasks.length} goals</strong> into <strong>${esc(account?.email || account?.name)}</strong>.</p><p>This sends these character records and notes to your Firebase-backed account. Your local copy stays on this device.</p><p id="form-error" class="error" role="alert"></p><div class="modal-actions">${action("confirm-migrate", "Upload and merge", true)}</div>`,
      () => {
        $("#confirm-migrate").onclick = async () => {
          const b = $("#confirm-migrate");
          b.disabled = true;
          try {
            if (!account || account.uid !== target)
              throw new Error("Your account changed. Open this dialog again.");
            await commit(mergeBackup(cloudState, state));
            $("#modal").close();
            render();
            toast("Local roster uploaded to your account.");
          } catch (e) {
            fail(e);
            b.disabled = false;
          }
        };
      },
    );
  });
}
async function startAccounts() {
  if (!cloudConfigured) return;
  try {
    cloudClient = await connectCloud((event) => {
      const changed = account?.uid !== event.user?.uid;
      if (changed) {
        clearItemSession();
        $("#modal").close();
        $("#item-detail-modal")?.close();
        cloudState = emptyState();
        query = "";
        accountFilter = "all";
        legacyCharacter = "";
        if (event.user) {
          demo = false;
          localMode = false;
        }
      }
      account = event.user;
      cloudStatus = event.status;
      cloudError = event.error || "";
      if (event.state) cloudState = event.state;
      if (event.status === "signed-out") {
        cloudState = emptyState();
        localMode = false;
      }
      // A server-confirmed refresh invalidates open edits, preventing a stale form from reverting another device.
      if (event.status === "loading" && $("#modal").open) $("#modal").close();
      render();
    });
    render();
  } catch (e) {
    cloudStatus = "error";
    cloudError = friendlyError(e);
    render();
  }
}
void startAccounts();

function profile(c) {
  const s = latest(c),
    first = c.snapshots[0],
    xp =
      s.xpMax > 0 && s.xp != null
        ? Math.min(100, Math.round((s.xp / s.xpMax) * 100))
        : null;
  return `<section class="profile-hero panel" style="--class-color:${CLASSES[s.class][1]}"><div class="profile-emblem" aria-hidden="true">${CLASSES[s.class][0][0]}</div><div><span class="eyebrow">${esc(s.faction) || "ADVENTURER"} · ${esc(playStyleLabel(s))}</span><h2>${esc(s.name)}</h2><p>Level ${s.level} · ${esc(s.race)} ${CLASSES[s.class][0]}</p><p>${esc(s.zone) || "Location not captured"}</p><a class="button primary" href="#talents/${s.class.toLowerCase()}/${Math.min(60, s.level)}">Plan talents ↗</a></div></section><section class="stats"><div class="stat"><span class="stat-label">Levels since first snapshot</span><span class="stat-value">${s.level - first.level}</span></div><div class="stat"><span class="stat-label">Level progress</span><span class="stat-value">${xp === null ? "—" : xp + "%"}</span></div><div class="stat"><span class="stat-label">Equipment captured</span><span class="stat-value">${s.gear.length}</span></div></section><div class="two-col"><section class="panel"><h2>Character details</h2><div class="gear-row"><span>Gold</span><strong>${money(s.money)}</strong></div><div class="gear-row"><span>First recorded</span><strong>${date(first.observedAt)}</strong></div><div class="gear-row"><span>Last recorded</span><strong>${date(s.observedAt)}</strong></div><p>Snapshot data, updated when you import. Missing statistics are not estimated.</p></section><section class="panel"><h2>Professions</h2>${s.professions.map((p) => `<div class="gear-row"><strong>${esc(p.name)}</strong><span>${p.rank == null ? "Rank not captured" : p.rank + (p.max ? "/" + p.max : "")}</span></div>`).join("") || "<p>No professions captured yet.</p>"}</section></div>${plans(c)}`;
}

function notesDialog(c) {
  modal(
    "Character notes",
    `<form id="notes-form"><label>Notes<textarea name="notes" maxlength="4000">${esc(latest(c).notes || "")}</textarea></label><p id="form-error" role="alert" class="error"></p><button class="primary">Save notes</button></form>`,
    () => {
      $("#notes-form").onsubmit = async (e) => {
        e.preventDefault();
        try {
          const prior = latest(c);
          await commit(
            addSnapshot(
              current(),
              normalize({
                ...prior,
                notes: e.target.elements.notes.value,
                gearObservedAt: prior.gearObservedAt || prior.observedAt,
                source: "Manual notes",
                observedAt: new Date().toISOString(),
              }),
            ).state,
          );
          $("#modal").close();
          render();
        } catch (err) {
          fail(err);
        }
      };
    },
  );
}
function bindGuilds(id) {
  $("#new-guild")?.addEventListener("click", () => guildDialog());
  $("#edit-guild")?.addEventListener("click", () =>
    guildDialog(current().guilds.find((g) => g.id === id)),
  );
}
function guildDialog(g) {
  modal(
    g ? "Edit guild" : "Add guild",
    `<form id="guild-form"><label>Guild name<input name="name" required maxlength="100" value="${esc(g?.name || "")}"></label><label>Faction<select name="faction">${["Horde", "Alliance", "Both"].map((f) => `<option ${g?.faction === f ? "selected" : ""}>${f}</option>`).join("")}</select></label><label>Description<textarea name="description" maxlength="3000">${esc(g?.description || "")}</textarea></label><label>Recruitment<textarea name="recruitment" maxlength="2000">${esc(g?.recruitment || "")}</textarea></label><label>Ranks, separated by commas<input name="ranks" maxlength="1000" value="${esc(g?.ranks.join(", ") || "Guild Master, Officer, Member")}"></label><label>Officer names, separated by commas<input name="officers" maxlength="2000" value="${esc(g?.officers.join(", ") || "")}"></label><p id="form-error" role="alert" class="error"></p><button class="primary">Save guild</button></form>`,
    () => {
      $("#guild-form").onsubmit = async (e) => {
        e.preventDefault();
        try {
          const data = Object.fromEntries(new FormData(e.target)),
            guild = normalizeGuild({
              ...g,
              ...data,
              id: g?.id || newId(),
              ranks: data.ranks.split(",").filter((x) => x.trim()),
              officers: data.officers.split(",").filter((x) => x.trim()),
              updatedAt: new Date().toISOString(),
            }),
            n = structuredClone(current());
          if (
            n.characters.some(
              (c) =>
                latest(c).guildId === guild.id &&
                guild.faction !== "Both" &&
                latest(c).faction !== guild.faction,
            )
          )
            throw Error("This faction conflicts with linked characters.");
          n.guilds = n.guilds.filter((x) => x.id !== guild.id);
          n.guilds.push(guild);
          await commit(n);
          $("#modal").close();
          location.hash = "guilds/" + guild.id;
          render();
        } catch (err) {
          fail(err);
        }
      };
    },
  );
}

function progressDialog(c) {
  modal(
    "Record encounter progress",
    `<form id="progress-form"><label>Dungeon or raid<select name="instance">${instances.map((d) => `<option value="${d.id}">${esc(d.name)}${d.kind === "raid" ? " · Raid" : ""}</option>`).join("")}</select></label><label>Status<select name="status"><option>Planned</option><option>In progress</option><option>Complete</option></select></label><label>Notes<textarea name="notes" maxlength="1000"></textarea></label><p><small>This records your own progress, not a verified game completion. Saving replaces your prior record for this instance.</small></p><p id="form-error" class="error" role="alert"></p><button class="primary">Save progress</button></form>`,
    () => {
      const form = $("#progress-form");
      form.elements.instance.onchange = () => {
        const entry = (latest(c).progress || []).find(
          (p) => p.id === form.elements.instance.value,
        );
        form.elements.status.value = entry?.completed
          ? "Complete"
          : entry?.status === "In progress"
            ? "In progress"
            : "Planned";
        form.elements.notes.value = entry?.notes || "";
      };
      form.elements.instance.onchange();
      form.onsubmit = async (e) => {
        e.preventDefault();
        try {
          const prior = latest(c),
            d = findInstance(form.elements.instance.value),
            existing = (prior.progress || []).find((p) => p.id === d.id),
            progress = [
              ...(prior.progress || []).filter((p) => p.id !== d.id),
              {
                ...existing,
                id: d.id,
                name: d.name,
                type: d.kind,
                status: form.elements.status.value,
                completed: form.elements.status.value === "Complete",
                notes: form.elements.notes.value,
              },
            ];
          await commit(
            addSnapshot(
              current(),
              normalize({
                ...prior,
                progress,
                gearObservedAt: prior.gearObservedAt || prior.observedAt,
                observedAt: new Date().toISOString(),
                source: "Manual progress",
              }),
            ).state,
          );
          $("#modal").close();
          render();
        } catch (err) {
          fail(err);
        }
      };
    },
  );
}
