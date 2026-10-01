const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = value => String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().trim();

export function inviteMatches(rows, query, actor, faction) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return rows.filter(row => row.id !== actor && (faction === 'Both' || row.faction === faction)
    && terms.every(term => normalize(row.name).includes(term)));
}

export const inviteForm = () => `<form id="guild-invite"><label>Search character by first or last name<input name="search" type="search" autocomplete="off" maxlength="150" placeholder="Start typing a character name" aria-describedby="invite-help"></label><p id="invite-help">Search published characters by either name or their full name. Select a result before sending.</p><p data-search-status role="status"></p><div data-invite-results></div><button type="button" data-search-more hidden>Search more characters</button><p data-invite-selected role="status"></p><button type="submit" disabled>Send guild invitation</button><p data-invite-status role="status"></p></form>`;

export function bindInviteSearch(form, {service, gid, actor, faction, act}) {
  const input = form.elements.search, results = form.querySelector('[data-invite-results]');
  const more = form.querySelector('[data-search-more]'), send = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-search-status]'), selected = form.querySelector('[data-invite-selected]');
  const message = form.querySelector('[data-invite-status]');
  let rows = [], cursor, done = false, loading = false, target = null, timer;
  function render() {
    const matches = inviteMatches(rows, input.value, actor, faction);
    results.innerHTML = matches.map(c => `<p><button type="button" data-character="${esc(c.id)}" aria-pressed="${target?.id === c.id}">${esc(c.name)} — Level ${esc(c.level)} ${esc(c.race)} ${esc(c.class)} · ${esc(c.faction)}${c.playStyle ? ' · '+esc(c.playStyle) : ''}</button> <a href="#community/${esc(c.id)}" target="_blank" rel="noopener">View profile</a></p>`).join('');
    status.textContent = !input.value.trim() ? '' : `${matches.length} matches among ${rows.length} loaded public characters.${done ? (matches.length ? '' : ' No matching published character found.') : ' Search more to check the rest of the directory.'}`;
    more.hidden = done || !input.value.trim();
    results.querySelectorAll('[data-character]').forEach(button => button.onclick = () => {
      target = rows.find(c => c.id === button.dataset.character);
      selected.textContent = `Invite ${target.name}?`;
      send.disabled = false;
      message.textContent = '';
      render();
    });
  }
  async function load() {
    if (loading || done || !form.isConnected || !input.value.trim()) return;
    loading = true;
    try {
      // Bounded reads; later pages are explicitly requested and cached while typing.
      for (let i = 0; i < 5 && !done; i++) {
        const page = await service.directory(cursor);
        const known = new Set(rows.map(c => c.id));
        rows.push(...page.rows.filter(c => !known.has(c.id)));
        cursor = page.cursor; done = page.done;
      }
    } finally { loading = false; if (form.isConnected) render(); }
  }
  input.oninput = () => {
    clearTimeout(timer); target = null; send.disabled = true; selected.textContent = ''; message.textContent = ''; render();
    if (!rows.length && !done && input.value.trim()) timer = setTimeout(() => {
      if (form.isConnected) void act(more, load);
    }, 250);
  };
  more.onclick = () => act(more, load);
  form.onsubmit = event => {
    event.preventDefault();
    if (!target) return;
    const chosen = target;
    void act(send, async () => {
      await service.guilds.invite(gid, actor, chosen.id);
      message.textContent = `Invitation sent to ${chosen.name}.`;
    });
  };
}
