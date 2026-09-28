export const classes = [
  "druid",
  "hunter",
  "mage",
  "paladin",
  "priest",
  "rogue",
  "shaman",
  "warlock",
  "warrior",
];
export const nodes = (d) =>
  d.trees.flatMap((t) =>
    t.talents.map((n) => ({ ...n, key: t.id + ":" + n.id, tree: t })),
  );
export const total = (b) => Object.values(b).reduce((a, v) => a + v, 0);
export const budget = (d, level) =>
  Math.min(d.rules.maxPoints, Math.max(0, level - d.rules.firstPointLevel + 1));
export function validate(d, b, level) {
  const ns = nodes(d),
    known = new Set(ns.map((n) => n.key));
  if (!Number.isInteger(level) || level < 1 || level > 60)
    throw Error("Choose a level from 1 to 60.");
  for (const [k, v] of Object.entries(b))
    if (!known.has(k) || !Number.isInteger(v) || v < 0)
      throw Error("Invalid talent allocation.");
  if (total(b) > budget(d, level))
    throw Error("No talent points remaining at this level.");
  for (const n of ns) {
    const rank = b[n.key] || 0;
    if (rank > n.maxRank) throw Error("Maximum rank reached.");
    if (!rank) continue;
    const above = n.tree.talents
      .filter((t) => t.row < n.row)
      .reduce((s, t) => s + (b[n.tree.id + ":" + t.id] || 0), 0);
    if (above < n.row * d.rules.pointsPerRow)
      throw Error(
        `${n.name} needs ${n.row * d.rules.pointsPerRow} points in earlier rows of ${n.tree.name}.`,
      );
    for (const r of n.requires || [])
      if ((b[n.tree.id + ":" + r.talent] || 0) < r.rank)
        throw Error(
          `${n.name} requires ${r.rank} ranks in ${n.tree.talents.find((t) => t.id === r.talent)?.name || r.talent}.`,
        );
  }
  return b;
}
export function change(d, b, level, key, delta) {
  const next = { ...b, [key]: (b[key] || 0) + delta };
  validate(d, next, level);
  return next;
}
export function encode(d, b, level) {
  validate(d, b, level);
  return `${d.class}/${level}/${nodes(d)
    .map((n) => b[n.key] || 0)
    .join("")}`;
}
export function decode(d, level, code) {
  const ns = nodes(d);
  if (!/^\d+$/.test(code) || code.length !== ns.length)
    throw Error(
      "This build link is invalid or belongs to a different database version.",
    );
  const b = Object.fromEntries(ns.map((n, i) => [n.key, Number(code[i])]));
  return validate(d, b, level);
}
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const cache = new Map();
export async function loadTalents(c) {
  if (!classes.includes(c)) throw Error("Unknown class.");
  if (!cache.has(c)) {
    const r = await fetch(`./data/talents/${c}.json`);
    if (!r.ok) throw Error("Talent database could not load. Try again.");
    cache.set(c, await r.json());
  }
  return cache.get(c);
}
export async function mountTalents(root, { save, characters }) {
  const parts = location.hash.split("/"),
    c = classes.includes(parts[1]) ? parts[1] : "paladin";
  root.innerHTML = "<p>Loading talent database…</p>";
  try {
    const d = await loadTalents(c);
    if (!root.isConnected) return;
    let level = parts[2] ? Number(parts[2]) : 60,
      b = parts[3] ? decode(d, level, parts[3]) : {};
    validate(d, b, level);
    function draw(message = "") {
      document.querySelector("#talent-tooltip")?.remove();
      history.replaceState(null, "", "#talents/" + encode(d, b, level));
      const focused = document.activeElement?.dataset,
        focusKey = focused?.key,
        focusDelta = focused?.delta;
      const ns = nodes(d),
        sum = total(b);
      root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">BUILD YOUR ADVENTURER</span><h1>Talent calculator</h1><p>Explore a build. Plan your next point.</p></div></div><div class="note">Community beta reference · Video-derived data; some rank values and rules are inferred. Verify against your game client. Standard level 10–60 points. The Legacy Talented perk can grant points earlier; this calculator keeps the standard schedule until its rank rules are confirmed. <a href="#legacy">Plan Legacy perks</a>. <a href="./data/talents/SOURCE.md">Data source</a></div><div class="talent-toolbar panel"><label>Class<select id="talent-class">${classes.map((x) => `<option ${x === c ? "selected" : ""}>${x}</option>`).join("")}</select></label><label>Planning level<input id="talent-level" type="number" min="1" max="60" value="${level}"></label><strong>${sum} / ${budget(d, level)} points · ${budget(d, level) - sum} remaining</strong><div class="talent-point-track" role="progressbar" aria-label="Talent points assigned" aria-valuemin="0" aria-valuemax="${budget(d, level)}" aria-valuenow="${sum}"><span style="width:${budget(d, level) ? (sum / budget(d, level)) * 100 : 0}%"></span></div><button id="talent-reset">Reset build</button><button id="talent-share">Copy build link</button></div><p role="status" id="talent-status">${esc(message)}</p><div class="talent-trees">${d.trees
        .map(
          (tree) =>
            `<section class="panel talent-tree"><h2>${esc(tree.name)} <small>${tree.talents.reduce((s, n) => s + (b[tree.id + ":" + n.id] || 0), 0)}</small></h2>${Array.from(
              { length: tree.rows },
              (_, row) =>
                `<div class="talent-row"><small class="tier-label">${row * d.rules.pointsPerRow} points required in earlier rows</small><div class="talent-grid">${tree.talents
                  .filter((n) => n.row === row)
                  .map((n) => {
                    const key = tree.id + ":" + n.id,
                      rank = b[key] || 0,
                      desc = (
                        n.description || "Description not recorded."
                      ).replace(
                        /\{(\d+)\}/g,
                        (_, i) => n.ranks?.[Math.max(0, rank - 1)]?.[i] ?? "?",
                      );
                    let add = true,
                      remove = true;
                    try {
                      change(d, b, level, key, 1);
                    } catch {
                      add = false;
                    }
                    try {
                      change(d, b, level, key, -1);
                    } catch {
                      remove = false;
                    }
                    return `<article class="talent-node ${rank ? "invested" : ""} ${add ? "available" : "locked"}" style="grid-column:${n.col + 1}" data-talent="${esc(key)}"><strong>${esc(n.name)}</strong><div class="rank-controls"><button data-key="${esc(key)}" data-delta="-1" aria-label="Remove rank from ${esc(n.name)}" ${remove ? "" : "disabled"}>−</button><span>${rank}/${n.maxRank}</span><button data-key="${esc(key)}" data-delta="1" aria-label="Add rank to ${esc(n.name)}" ${add ? "" : "disabled"}>+</button></div><button type="button" class="talent-info" data-info="${esc(key)}" aria-label="Details for ${esc(n.name)}">Details</button></article>`;
                  })
                  .join("")}</div></div>`,
            ).join("")}</section>`,
        )
        .join(
          "",
        )}</div><section class="panel"><h2>Keep this build</h2><p>Save a planned build directly to a character’s Armory. Imported talents remain your record of what you actually played.</p><label>Build name<input id="build-name" maxlength="100" value="${esc(d.className)} build"></label><label>Character<select id="build-character"><option value="">Choose a ${esc(d.className)}…</option>${characters
        .filter((x) => x.class.toLowerCase() === c)
        .map((x) => `<option value="${esc(x.id)}">${esc(x.name)}</option>`)
        .join(
          "",
        )}</select></label><button id="talent-save" class="primary">Save to character</button><p>No character yet? <a href="#roster">Add one to your roster</a>, or copy this build link.</p><label>Build link<input id="build-link" readonly value="${esc(location.origin + location.pathname + "#talents/" + encode(d, b, level))}"></label></section>`;
      root.querySelector("#talent-class").onchange = (e) => {
        location.hash = "talents/" + e.target.value;
      };
      root.querySelector("#talent-level").onchange = (e) => {
        try {
          const l = Number(e.target.value);
          validate(d, b, l);
          level = l;
          draw();
        } catch (err) {
          draw(err.message);
        }
      };
      root.querySelectorAll("[data-talent]").forEach(
        (el) =>
          (el.onclick = (e) => {
            if (e.target.closest("button")) return;
            const add = el.querySelector('[data-delta="1"]');
            if (add && !add.disabled) add.click();
            else
              showTooltip(
                el,
                ns.find((n) => n.key === el.dataset.talent),
              );
          }),
      );
      root.querySelectorAll("[data-delta]").forEach(
        (el) =>
          (el.onclick = () => {
            try {
              b = change(d, b, level, el.dataset.key, Number(el.dataset.delta));
              draw();
            } catch (err) {
              draw(err.message);
            }
          }),
      );
      let pinned = false;
      function showTooltip(el, n) {
        if (!n) return;
        let tip = document.querySelector("#talent-tooltip");
        if (!tip) {
          tip = document.createElement("div");
          tip.id = "talent-tooltip";
          tip.className = "talent-tooltip";
          tip.setAttribute("role", "tooltip");
          document.body.append(tip);
        }
        const rank = b[n.key] || 0;
        tip.innerHTML = talentTooltip(n, rank, d);
        const rect = el.getBoundingClientRect();
        tip.style.left =
          Math.max(12, Math.min(innerWidth - tip.offsetWidth - 12, rect.left)) +
          "px";
        tip.style.top =
          Math.max(
            12,
            Math.min(innerHeight - tip.offsetHeight - 12, rect.bottom + 8),
          ) + "px";
        el.setAttribute("aria-describedby", "talent-tooltip");
      }
      function hideTooltip() {
        if (!pinned) document.querySelector("#talent-tooltip")?.remove();
      }
      root.querySelectorAll("[data-talent]").forEach((el) => {
        const n = ns.find((n) => n.key === el.dataset.talent);
        el.addEventListener("pointerenter", () => {
          if (!pinned) showTooltip(el, n);
        });
        el.addEventListener("pointerleave", hideTooltip);
        el.addEventListener("focusin", () => showTooltip(el, n));
        el.addEventListener("focusout", hideTooltip);
        el.querySelector("[data-info]").onclick = () => {
          pinned = !pinned;
          if (pinned) showTooltip(el, n);
          else hideTooltip();
        };
      });
      root.onkeydown = (e) => {
        if (e.key === "Escape") {
          pinned = false;
          hideTooltip();
        }
      };
      if (focusKey) {
        const control = [...root.querySelectorAll("[data-key]")].find(
          (e) =>
            e.dataset.key === focusKey &&
            e.dataset.delta === focusDelta &&
            !e.disabled,
        );
        control?.focus({ preventScroll: true });
      }
      root.querySelector("#talent-reset").onclick = () => {
        b = {};
        draw("Build reset.");
      };
      root.querySelector("#talent-share").onclick = async () => {
        try {
          await navigator.clipboard.writeText(
            root.querySelector("#build-link").value,
          );
          root.querySelector("#talent-status").textContent =
            "Build link copied.";
        } catch {
          root.querySelector("#build-link").select();
          root.querySelector("#talent-status").textContent =
            "Copy the selected build link below.";
        }
      };
      root.querySelector("#talent-save").onclick = async (e) => {
        const target = root.querySelector("#build-character").value,
          name = root.querySelector("#build-name").value.trim();
        if (!target || !name) {
          root.querySelector("#talent-status").textContent =
            "Choose a character and enter a build name.";
          return;
        }
        e.target.disabled = true;
        try {
          await save(target, name, root.querySelector("#build-link").value);
          if (root.isConnected)
            root.querySelector("#talent-status").textContent =
              "Build saved to the character’s Armory.";
        } catch (err) {
          if (root.isConnected)
            root.querySelector("#talent-status").textContent = err.message;
        } finally {
          if (root.isConnected) e.target.disabled = false;
        }
      };
    }
    draw();
  } catch (err) {
    if (root.isConnected)
      root.innerHTML = `<div class="note" role="alert">${esc(err.message)} <a href="#talents">Start a fresh build</a></div>`;
  }
}

export function talentTooltip(n, rank, d) {
  const description = (r) =>
    (n.description || "Description not recorded.").replace(
      /\{(\d+)\}/g,
      (_, i) => n.ranks?.[r - 1]?.[i] ?? "?",
    );
  return `<strong>${esc(n.name)}</strong><small>Rank ${rank} / ${n.maxRank} · ${esc(n.tree.name)}</small>${rank ? `<p><b>Current rank</b><br>${esc(description(rank))}</p>` : "<p>Not learned</p>"}${rank < n.maxRank ? `<p class="next-rank"><b>Next rank (${rank + 1})</b><br>${esc(description(rank + 1))}</p>` : ""}<p class="talent-requirements">Requires ${n.row * d.rules.pointsPerRow} points in earlier rows${n.requires?.length ? "<br>" + n.requires.map((r) => `${r.rank} ranks in ${esc(n.tree.talents.find((t) => t.id === r.talent)?.name || r.talent)}`).join("<br>") : ""}</p><small>Rank data: ${esc(n.ranksSource || "Unverified")}${n.ranksNote ? "<br>" + esc(n.ranksNote) : ""}</small>`;
}
if (typeof window !== "undefined")
  window.addEventListener("hashchange", () =>
    document.querySelector("#talent-tooltip")?.remove(),
  );
