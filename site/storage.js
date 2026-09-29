import {inventoryFor} from './character-data.js';
import {itemButton} from './items.js';
import {esc} from './features.js';
export function accountInventory(state,{query='',accountId='all'}={}) {
  const items=new Map(),q=query.trim().toLowerCase();
  for(const c of state.characters) {
    const s=c.snapshots.at(-1),account=s.accountId||'default';
    if(accountId!=='all'&&account!==accountId)continue;
    for(const item of inventoryFor(s)) {
      if(q&&!`${item.id} ${item.name}`.toLowerCase().includes(q))continue;
      const row=items.get(item.id)||{...item,total:0,stacks:[]};
      row.total+=item.quantity;
      row.stacks.push({...item,characterId:c.id,characterName:s.name,accountId:account});items.set(item.id,row);
    }
  }
  return [...items.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function storageView(state) {
  return `<h1>Where do I have this item?</h1><p>Search the latest captured equipment and storage across your characters. Unscanned banks and bags remain unknown.</p><section class="panel"><div class="filters"><label>Item name or ID<input id="storage-query" type="search" placeholder="Copper Bar…"></label><label>WoW account<select id="storage-account"><option value="all">All accounts</option>${state.gameAccounts.map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('')}</select></label></div><div id="storage-results" aria-live="polite"></div></section>`;
}
export function bindStorage(root,state) {
  const run=()=>{const rows=accountInventory(state,{query:root.querySelector('#storage-query').value,accountId:root.querySelector('#storage-account').value});
    root.querySelector('#storage-results').innerHTML=`<p>${rows.length} distinct captured items</p>`+rows.map(r=>`<details class="panel"><summary>${esc(r.name)} — ${r.total} total</summary><p>${itemButton(r)} · Item ${r.id}</p><div class="table-wrap"><table><thead><tr><th>Character</th><th>Account</th><th>Quantity</th><th>Location</th><th>Observed</th></tr></thead><tbody>${r.stacks.map(i=>`<tr><td><a href="#character/${encodeURIComponent(i.characterId)}">${esc(i.characterName)}</a></td><td>${esc(state.gameAccounts.find(a=>a.id===i.accountId)?.name)}</td><td>${i.quantity}</td><td>${esc(i.location)} ${esc(i.container)}${i.slot!=null?' · Slot '+i.slot:''}</td><td>${esc(i.observedAt ? new Date(i.observedAt).toLocaleString() : 'Unknown')}</td></tr>`).join('')}</tbody></table></div></details>`).join('');};
  root.querySelector('#storage-query').oninput=run;root.querySelector('#storage-account').onchange=run;run();
}
