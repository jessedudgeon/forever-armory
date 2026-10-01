import {groupResults, publicSearchRows} from './search-model.js';
import {observationDetails} from './armory-observations.js';
import { eventSection } from "./events.js";
import { inventoryFor, searchInventory, LOCATIONS } from "./character-data.js";
import { itemButton, discoveredItems } from "./items.js";
import { instances, findInstance } from "./pve-data.js";
import { classes, loadTalents, nodes } from "./talents.js";
export const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const latest = (c) => c.snapshots.at(-1);
const quality = [
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
const label = (s) => s[0].toUpperCase() + s.slice(1);
const date = (s) => (s ? new Date(s).toLocaleString() : "Not captured");
export const title = (tag, name, description) =>
  `<div class="page-heading"><div><span class="eyebrow">${esc(tag)}</span><h1>${esc(name)}</h1><p>${esc(description)}</p></div></div>`;
export function homeView(state) {
  return (
    title(
      "THE FOREVER COMPANION",
      "Know your next adventure.",
      "Explore the reference. Build your character. Remember every chapter.",
    ) +
    `<section class="home-grid">${[
      [
        "roster",
        "Your Armory",
        `${state.characters.length} characters in your active collection`,
        "◈",
      ],
      [
        "talents",
        "Plan your talents",
        "Three trees. One build. Every point matters.",
        "✦",
      ],
      ["pve", "PvE Journal", "Browse encounters and reference loot.", "⚔"],
      [
        "items",
        "Find an item",
        "One item view across your entire Armory.",
        "◆",
      ],
      [
        "professions",
        "Craft something",
        "Know what your characters can make.",
        "⚒",
      ],
      [
        "guilds",
        "Your guilds",
        "Organize your roster and recruitment notes.",
        "⚑",
      ],
    ]
      .map(
        ([href, name, desc, icon]) =>
          `<a class="panel home-card" href="#${href}"><span aria-hidden="true">${icon}</span><h2>${name}</h2><p>${esc(desc)}</p><small>Explore →</small></a>`,
      )
      .join(
        "",
      )}</section><div class="note">Sourced Forever content and imported observations are labeled separately. Unrecorded details remain unknown.</div>`
  );
}
export function inventoryView(c) {
  const s = latest(c),
    items = inventoryFor(s);
  return `<section class="panel"><div class="section-row"><h2>Every item, every location</h2><span class="chip">${items.reduce((n, i) => n + i.quantity, 0)} items · ${items.length} stacks / slots</span></div><div class="filters"><label>Search all storage<input id="inventory-search" type="search" placeholder="Item name or ID…"></label><label>Location<select id="inventory-location"><option value="all">All locations</option>${LOCATIONS.map((x) => `<option>${x}</option>`).join("")}</select></label><label>Quality<select id="inventory-quality"><option value="all">All qualities</option>${quality.map((q, i) => `<option value="${i}">${q}</option>`).join("")}</select></label><label class="check-label"><input type="checkbox" id="inventory-duplicates">Duplicate stacks / slots</label></div><div id="inventory-results"></div><div class="storage-coverage">${[
    "backpack",
    "bags",
    "bank",
    "keyring",
    "other",
    "account",
  ]
    .map((k) => {
      const v = s.storageStatus?.[k];
      return `<span><strong>${label(k)}</strong><small>${v?.captured ? `Captured ${date(v.observedAt)}` : "Coverage not recorded"}</small></span>`;
    })
    .join(
      "",
    )}</div><p><small>Uncaptured storage is unknown, not empty. Account storage is reserved for client-supported imports; its existence in Forever is not assumed. Older bag exports have aggregated counts without slot details.</small></p></section>`;
}
export function bindInventory(root, c) {
  const run = () => {
    const items = searchInventory(latest(c), {
      query: root.querySelector("#inventory-search").value,
      location: root.querySelector("#inventory-location").value,
      quality: root.querySelector("#inventory-quality").value,
      duplicates: root.querySelector("#inventory-duplicates").checked,
    });
    root.querySelector("#inventory-results").innerHTML = items.length
      ? `<p role="status">${items.length} matching stacks / slots · ${items.reduce((n, i) => n + i.quantity, 0)} items</p><div class="table-wrap"><table><thead><tr><th>Item</th><th>Quantity</th><th>Location</th><th>Details</th><th>Captured</th></tr></thead><tbody>${items.map((i) => `<tr><td>${itemButton(i)}<small class="block">Item ${i.id}</small></td><td>${i.quantity}</td><td>${esc(i.storageLabel || label(i.location))}${i.container ? ` · ${esc(i.container)}` : ""}${i.slot != null ? ` · Slot ${i.slot}` : ""}</td><td>${esc([i.binding, ...(i.enchantments || []), i.gems?.length ? `Gems: ${i.gems.join(", ")}` : "", i.durability ? `Durability ${i.durability.current}/${i.durability.max}` : ""].filter(Boolean).join(" · ")) || "—"}</td><td>${date(i.observedAt)}</td></tr>`).join("")}</tbody></table></div>`
      : '<p class="muted" role="status">No captured items match. Import storage data to populate this view.</p>';
  };
  for (const input of root.querySelectorAll(".filters input,.filters select"))
    input.addEventListener("input", run);
  run();
}
export function professionSection(s) {
  return `<section class="panel"><h2>Professions & craftbook</h2>${s.professions.map((p) => `<div class="gear-row"><strong>${esc(p.name)}</strong><span>${p.rank ?? "Unknown"}${p.max ? ` / ${p.max}` : ""}</span></div>`).join("") || "<p>No profession skills captured.</p>"}${recipeCards(s.recipes || [])}<p><small>Unknown recipes appear only when your import supplies them. Missing recipes do not imply that the character cannot craft an item.</small></p></section>`;
}
function recipeCards(recipes) {
  return recipes.length
    ? `<div class="recipe-list">${recipes.map((r) => `<article class="recipe-card"><div class="section-row"><h3>${esc(r.name || r.id)}</h3><span class="chip">${r.known ? "Known" : "Not learned"}</span></div><small>${esc(r.profession)}${r.skill != null ? ` · Skill ${r.skill}` : ""}</small>${r.craftedItem ? `<p>Creates ${r.quantity == null ? "" : r.quantity + " × "}${itemButton({ id: r.craftedItem })}</p>` : ""}${r.reagents.length ? `<p>Reagents: ${r.reagents.map((i) => `${i.quantity} × ${itemButton(i)}`).join(" · ")}</p>` : ""}${r.source ? `<p>${esc(r.source)}</p>` : ""}</article>`).join("")}</div>`
    : "<p>No recipes captured yet. A profession skill alone does not identify known crafts.</p>";
}
export function professionsView(state) {
  return (
    title(
      "SKILLS & RECIPES",
      "Professions",
      "Your characters’ skills and imported craftbooks, together.",
    ) +
    (state.characters.length
      ? state.characters
          .map(
            (c) =>
              `<a class="craft-character" href="#character/${encodeURIComponent(c.id)}">${esc(latest(c).name)} ↗</a>${professionSection(latest(c))}`,
          )
          .join("")
      : '<section class="panel"><p>Add or import a character to track professions and known recipes.</p><a class="button" href="#roster">Open your roster</a></section>')
  );
}
export function progressSection(s, editable = false) {
  return `<section class="panel"><div class="section-row"><h2>Dungeons, raids & milestones</h2>${editable ? '<button id="edit-progress">Record progress</button>' : ""}</div>${(s.progress || []).length ? s.progress.map((p) => `<article class="progress-entry"><strong>${findInstance(p.id) ? `<a href="#pve/${encodeURIComponent(p.id)}">${esc(p.name || p.id)}</a>` : esc(p.name || p.id)}</strong><span class="chip">${esc(p.type)} · ${p.completed ? "Complete" : esc(p.status) || "In progress"}</span>${p.bosses.map((b) => `<small class="block">${b.completed ? "✓" : "○"} ${esc(b.name)}${b.kills !== undefined ? ` · ${b.kills} kills` : ""}${b.lastKilledAt ? ` · Last kill ${esc(b.lastKilledAt.slice(0, 10))}` : ""}</small>`).join("")}${(p.quests || []).map((q) => `<small class="block">${q.completed ? "✓" : "○"} Quest: ${esc(q.name || q.id)}</small>`).join("")}${(p.attunements || []).map((a) => `<small class="block">${a.completed ? "✓" : "○"} Attunement: ${esc(a.name || a.id)} · ${esc(a.status)}</small>`).join("")}${p.notes ? `<p>${esc(p.notes)}</p>` : ""}</article>`).join("") : "<p>No encounter progress captured yet. Use the journal to record a dungeon or raid objective.</p>"}</section>`;
}
export function armorySummary(c, state) {
  const s = latest(c),
    items = inventoryFor(s),
    guild = state.guilds.find((g) => g.id === s.guildId);
  return `<section class="panel"><div class="section-row"><h2>Armory overview</h2><button id="edit-notes">Edit notes</button></div><div class="summary-grid"><div><strong>${items.length}</strong><small>Captured item stacks / slots</small></div><div><strong>${(s.recipes || []).filter((r) => r.known).length}</strong><small>Known recipes captured</small></div><div><strong>${(s.progress || []).filter((p) => p.completed).length}</strong><small>Completed milestones</small></div></div>${guild ? `<p>Guild: <a href="#guilds/${encodeURIComponent(guild.id)}">${esc(guild.name)}</a> · ${esc(s.guildRank || "Member")}</p>` : ""}${s.notes ? `<p class="preserve-lines">${esc(s.notes)}</p>` : '<p class="muted">Keep your character’s story or next objective here.</p>'}${
    Object.keys(s.statistics || {}).length
      ? `<dl class="stat-list">${Object.entries(s.statistics)
          .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
          .join("")}</dl>`
      : ""
  }</section>${importedDetails(s)}${savedBuilds(s)}`;
}
export function savedBuilds(s) {
  return `<section class="panel"><h2>Saved talent builds</h2>${s.builds?.length ? s.builds.map((b) => `<p><a href="#talents/${b.code}">${esc(b.name)} ↗</a><small class="block">${date(b.updatedAt)}</small></p>`).join("") : "<p>No saved builds. Choose a character when saving in the talent calculator.</p>"}</section>`;
}
export function guildsView(state, id) {
  const guild = id ? state.guilds.find((g) => g.id === id) : null;
  if (id && !guild)
    return (
      title(
        "GUILDS",
        "Guild not found",
        "Choose a guild from your collection.",
      ) + '<a href="#guilds">All guilds</a>'
    );
  if (!guild)
    return (
      title(
        "YOUR COMMUNITY",
        "Guilds",
        "Private guild planning for your active account.",
      ) +
      `<p><button id="new-guild" class="primary">+ Add guild</button></p><div class="home-grid">${state.guilds.map((g) => `<a class="panel home-card" href="#guilds/${encodeURIComponent(g.id)}"><span class="eyebrow">${esc(g.faction)}</span><h2>${esc(g.name)}</h2><p>${esc(g.description)}</p><small>${state.characters.filter((c) => latest(c).guildId === g.id).length} linked characters →</small></a>`).join("") || '<section class="panel"><h2>Bring your roster together</h2><p>Create a guild, then assign characters through their edit form. Track ranks, recruitment, and your guild description.</p></section>'}</div><div class="note">Guild records are private planning records. Public guild membership, invitations, and officer permissions require a separate shared publishing layer.</div>`
    );
  const members = state.characters.filter(
    (c) => latest(c).guildId === guild.id,
  );
  return `<a href="#guilds">← All guilds</a>${title(guild.faction, guild.name, guild.description)}<p><button id="edit-guild">Edit guild</button></p><div class="two-col"><section class="panel"><h2>Roster</h2>${members.length ? members.map((c) => `<div class="gear-row"><a href="#character/${encodeURIComponent(c.id)}">${esc(latest(c).name)}</a><span>${esc(latest(c).guildRank || "Member")} · Level ${latest(c).level}</span></div>`).join("") : "<p>Assign characters from their edit form to populate this roster.</p>"}<p><small>Officers: ${guild.officers.map(esc).join(", ") || "Not recorded"}<br>Ranks: ${guild.ranks.map(esc).join(", ") || "Not recorded"}</small></p></section><section class="panel"><h2>Recruitment</h2><p class="preserve-lines">${esc(guild.recruitment) || "No recruitment information yet."}</p><h3>Imported activity notes</h3>${guild.events.map((e) => `<p><strong>${esc(e.title)}</strong> · ${esc(e.date)}<br>${esc(e.notes)}</p>`).join("") || "<p>No events recorded.</p>"}</section></div>${eventSection(state,{guildId:guild.id})}${progressSection({ progress: guild.progress })}`;
}
export function searchView() {
  return (
    title(
      "THE REFERENCE DESK",
      "Search everything",
      "Items, your characters, encounters, recipes, guilds, and talents.",
    ) +
    '<section class="panel"><label>Search<input id="global-query" type="search" placeholder="Try Arugal, Paladin, or an item ID…" autofocus></label><div id="global-results" aria-live="polite"><p>Type at least two characters to search the available data.</p></div></section>'
  );
}
export async function bindSearch(root, state, service, initialQuery = "") {
  const input = root.querySelector("#global-query"),
    results = root.querySelector("#global-results");
  let talentRows = [], publicRows = [], timer, publicRequested = false;
  input.value = initialQuery;
  const entries = [
    ...state.characters.map((c) => ({
      type: "My character",
      name: latest(c).name,
      meta: latest(c).class,
      href: "#character/" + encodeURIComponent(c.id),
    })),
    ...state.guilds.map((g) => ({
      type: "Private guild plan",
      name: g.name,
      meta: g.faction,
      href: "#guilds/" + encodeURIComponent(g.id),
    })),
    ...instances.flatMap((d) => [
      {
        type: d.kind === "raid" ? "Raid" : "Dungeon",
        name: d.name,
        meta: d.zone,
        href: "#pve/" + d.id,
      },
      {type:'Zone reference',name:d.zone,meta:d.name,href:'#pve/'+d.id},
      ...d.quests.map((q) => ({
        type: "Quest",
        name: typeof q === "string" ? q : q.name,
        meta: d.name,
        href: "#pve/" + d.id,
      })),
      ...d.encounters.map(({ id, name }) => ({
        type: "Boss",
        name,
        meta: d.name,
        href: "#pve/" + d.id + "/" + id,
      })),
    ]),
    ...discoveredItems().map((i) => ({
      type: "Item",
      name: i.name,
      meta: String(i.id),
      href: "#items/" + i.id,
    })),
    ...state.characters.flatMap((c) => [
      ...(latest(c).quests || []).map(q=>({type:'My active quest',name:q.title || 'Quest '+q.id,meta:latest(c).name+' · '+q.id,href:'#character/'+encodeURIComponent(c.id)})),
      ...(latest(c).questHistory || []).map(q=>({type:'My completed quest',name:q.name || 'Quest '+q.questId,meta:latest(c).name+' · '+q.questId,href:'#character/'+encodeURIComponent(c.id)+'/quests'})),
      ...latest(c).professions.map((p) => ({
        type: "Profession",
        name: p.name,
        meta: latest(c).name,
        href: "#professions",
      })),
      ...(latest(c).recipes || []).map((r) => ({
        type: "Recipe",
        name: r.name,
        meta: r.profession,
        href: "#professions",
      })),
    ]),
  ];
  function run() {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      results.innerHTML = "<p>Type at least two characters.</p>";
      return;
    }
    const found = groupResults([...entries, ...talentRows, ...publicRows], q);
    results.innerHTML = `<p role="status">${found.shown} results${found.total > found.shown ? ` of ${found.total} matches (first 100)` : ''} in loaded data</p>${found.groups.map(([type,rows])=>`<section class="search-group"><h2>${esc(type)}</h2>${rows.map(e=>`<a class="search-result" href="${esc(e.href)}"><span class="chip">${esc(e.type)}</span><strong>${esc(e.name)}</strong><small>${esc(e.meta)}</small></a>`).join('')}</section>`).join('') || '<p>No matches in the loaded data. Load more public records below or <a href="#items">search the full item catalog</a>.</p>'}`;
  }
  run();
  input.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if(!input.isConnected)return; run(); history.replaceState(null, "", "#search/" + encodeURIComponent(input.value.trim())); if(input.value.trim().length>=2&&!publicRequested){publicRequested=true;button.click();} }, 150);
  };
  const coverage=document.createElement('div'); coverage.className='search-coverage';
  coverage.innerHTML='<p>Reference results include listed instances, encounters, discovered items and talents. Your private records are searched only in this session. Public characters and guilds load in pages.</p><p data-coverage role="status">Public directories have not been loaded.</p><button data-load-public>Search public characters & guilds</button><p data-talent-status role="status">Loading talent references…</p>';
  results.after(coverage);
  let characterCursor,guildCursor,characterDone=false,guildDone=false;
  const publicCharacters=[],publicGuilds=[],button=coverage.querySelector('button'),status=coverage.querySelector('[data-coverage]');
  button.onclick=async()=>{
    button.disabled=true;status.textContent='Loading public directories…';
    try {
      if(!service)throw Error('Community is still connecting. Try again shortly.');
      if(!await service.available())throw Error('Shared community is currently unavailable.');
      const pages=await Promise.allSettled([characterDone?null:service.directory(characterCursor),guildDone?null:service.guilds.directory(guildCursor)]);
      if(!input.isConnected)return;
      if(pages[0].status==='fulfilled'&&pages[0].value){const p=pages[0].value;publicCharacters.push(...p.rows);characterCursor=p.cursor;characterDone=p.done;}
      if(pages[1].status==='fulfilled'&&pages[1].value){const p=pages[1].value;publicGuilds.push(...p.rows);guildCursor=p.cursor;guildDone=p.done;}
      publicRows=publicSearchRows(publicCharacters,publicGuilds);run();
      status.textContent=`Searching ${publicCharacters.length} public characters and ${publicGuilds.length} public guilds. ${characterDone&&guildDone?'All available public records loaded.':'More records may contain matches.'}${pages.some(p=>p.status==='rejected')?' A directory could not load. Retry to continue.':''}`;
      button.hidden=characterDone&&guildDone;button.textContent='Search more public records';
    }catch(e){if(input.isConnected)status.textContent=e.message;}
    finally{button.disabled=false;}
  };
  if(input.value.trim().length>=2){publicRequested=true;button.click();}
  const data = await Promise.allSettled(classes.map(loadTalents));
  if (!input.isConnected) return;
  talentRows = data.flatMap((r) =>
    r.status === "fulfilled"
      ? nodes(r.value).map((t) => ({
          type: "Talent",
          name: t.name,
          meta: r.value.className + " · " + t.tree.name,
          href: "#talents/" + r.value.class,
        }))
      : [],
  );
  coverage.querySelector("[data-talent-status]").textContent = data.some(r=>r.status==="rejected") ? "Some talent references could not load. Reload to retry." : "Talent references loaded.";
  if (input.value) run();
}

export function importedDetails(s) {
  return `${observationDetails(s)}${s.location?.subZone?`<p>Subzone: ${esc(s.location.subZone)}</p>`:''}${s.talentDetails?.length?`<section class="panel"><h2>Current imported talents</h2><p>Observed ranks from the addon. Calculator mapping is unavailable until these game IDs are verified.</p>${s.talentDetails.map(t=>`<p><strong>${esc(t.name)}</strong> · Rank ${t.rank}<small class="block">${['treeID','nodeID','entryID','spellID'].filter(k=>t[k]!=null).map(k=>`${k}: ${t[k]}`).join(' · ')}</small></p>`).join('')}</section>`:''}${s.quests?.length?`<section class="panel"><h2>Quest log</h2>${s.quests.map(q=>`<p><strong>${esc(q.title)}</strong> · ${q.completed?'Ready to turn in':'Active'}<small class="block">Quest ${q.id}${q.level!=null?' · Level '+q.level:''}</small></p>`).join('')}<p><small>A ready quest is not proof of a completed turn-in. Dungeon mappings appear only when verified.</small></p></section>`:''}${s.warnings?.length?`<details class="panel"><summary>Addon capture warnings (${s.warnings.length})</summary>${s.warnings.map(w=>`<p>${esc(w)}</p>`).join('')}</details>`:''}`;
}
