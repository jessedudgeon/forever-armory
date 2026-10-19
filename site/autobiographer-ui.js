import {characterBiography} from './autobiographer.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slots=['','Head','Neck','Shoulders','Shirt','Chest','Waist','Legs','Feet','Wrists','Hands','Ring 1','Ring 2','Trinket 1','Trinket 2','Back','Main hand','Off hand','Ranged','Tabard'];
function snapshotDetails(e,catalogs){if(e.category!=='Snapshot')return '';const s=e.raw;
  const table=(title,values,render)=>values?`<h3>${title}</h3><div class="table-wrap"><table><tbody>${Object.entries(values).map(render).join('')}</tbody></table></div>`:'';
  const name=(catalog,id,fallback)=>esc(catalogs?.[catalog]?.[id]?.Name||`${fallback} ${id}`);
  return `<p>Level ${esc(s.Level)}${s.Money!=null?' · '+esc((s.Money/10000).toFixed(2))+' gold':''}${s.TotalTimePlayed!=null?' · '+esc((s.TotalTimePlayed/3600).toFixed(1))+' hours played':''}</p>`+
    table('Equipment',s.Equipment,([slot,id])=>`<tr><td>${esc(slots[slot]||'Slot '+slot)}</td><td>${id===0?'Empty':name('ItemCatalog',id,'Item')}${s.Enchants?.[slot]?' · Enchant '+esc(s.Enchants[slot]):''}</td></tr>`)+
    table('Talents',s.Talents,([id,rank])=>`<tr><td>${name('TalentCatalog',id,'Talent')}</td><td>Rank ${esc(rank)}</td></tr>`)+
    table('Skills',s.Skills,([id,skill])=>`<tr><td>${name('SkillCatalog',id,'Skill')}</td><td>${esc(skill.Rank)} / ${esc(skill.MaxRank)}</td></tr>`)+
    `<p><small>Sections may have separate collection times; expand the original record below for precise timestamps and incomplete flags.</small></p>`;
}
export function biographyView(character){const h=characterBiography(character);
  if(!h)return `<section class="panel"><h2>Your AutoBiographer journey</h2><p>Bring your recorded adventures into Forever: levels, quest turn-ins, discoveries, deaths, equipment changes and milestone snapshots.</p><button id="import-biography" class="primary">Import AutoBiographer history</button><p><small>History starts when the addon began recording. Import your character’s saved file after logout.</small></p></section>`;
  const categories=[...new Set(h.events.map(e=>e.category))].sort();
  return `<section class="panel"><div class="section-row"><div><span class="eyebrow">AUTOBIOGRAPHER</span><h2>Your character’s journey</h2></div><button id="import-biography">Import latest history</button></div><p>${h.events.length.toLocaleString()} recorded events · ${h.events.filter(e=>e.category==='Equipment').length} equipment changes · ${h.events.filter(e=>e.category==='Snapshot').length} milestone snapshots</p><p><small>Recorded in game; imports merge without repeating events. Missing events cannot be reconstructed. Your current Armory fields retain their original observation date.</small></p><div class="observation-filters"><label>Search history<input id="biography-search" type="search" placeholder="Quest, item, zone or milestone"></label><label>Event type<select id="biography-type"><option value="">All events</option>${categories.map(c=>`<option>${esc(c)}</option>`).join('')}</select></label></div><p id="biography-count" role="status"></p><div id="biography-rows"></div><div class="actions"><button id="biography-prev">Previous</button><button id="biography-next">Next</button></div><details><summary>Recorded statistics and reference catalogs</summary><p>Original addon data, including per-level statistics. Names and IDs are retained as recorded.</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:24rem;overflow:auto">${esc(JSON.stringify({levels:h.levels,catalogs:h.catalogs},null,2))}</pre></details></section>`;
}
export function bindBiography(root,character,onImport){root.querySelector('#import-biography')?.addEventListener('click',onImport);const container=root.querySelector('#biography-rows');if(!container)return;
  const history=characterBiography(character),all=history.events.slice().reverse();let page=0;
  const draw=()=>{const search=root.querySelector('#biography-search').value.toLowerCase(),type=root.querySelector('#biography-type').value;
    const rows=all.filter(e=>(!type||e.category===type)&&(!search||`${e.title} ${JSON.stringify(e.raw)}`.toLowerCase().includes(search)));page=Math.min(page,Math.max(0,Math.ceil(rows.length/40)-1));
    root.querySelector('#biography-count').textContent=`${rows.length} matching events · Page ${page+1} of ${Math.max(1,Math.ceil(rows.length/40))}`;
    container.innerHTML=rows.slice(page*40,page*40+40).map(e=>`<details style="padding:12px 0;border-bottom:1px solid var(--border,#4a5c4b)"><summary><span class="chip">${esc(e.category)}</span> ${esc(e.title)}<br><small>${esc(new Date(e.at).toLocaleString())}</small></summary>${snapshotDetails(e,history.catalogs)}<pre style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:24rem;overflow:auto">${esc(JSON.stringify(e.raw,null,2))}</pre></details>`).join('')||'<p>No events match these filters.</p>';
    root.querySelector('#biography-prev').disabled=page===0;root.querySelector('#biography-next').disabled=(page+1)*40>=rows.length;
  };
  for(const id of ['biography-search','biography-type'])root.querySelector('#'+id).addEventListener('input',()=>{page=0;draw();});
  root.querySelector('#biography-prev').onclick=()=>{page--;draw();};root.querySelector('#biography-next').onclick=()=>{page++;draw();};draw();
}
