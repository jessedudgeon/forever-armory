import test from 'node:test';
import assert from 'node:assert/strict';
import {sectionFor,breadcrumbs,navigation,hubView} from '../site/navigation.js';
import {groupResults,publicSearchRows} from '../site/search-model.js';
import {dashboardView} from '../site/dashboard.js';
import {pveView} from '../site/pve.js';
import {demoState,emptyState} from '../site/model.js';

test('existing routes retain a navigation home, including private planners and PvE alias',()=>{
 for(const route of ['home','roster','storage','legacy','talents','pve','dungeons','items','professions','community','community/guild-example','guilds','events','activity','journal','guide','account','search','character/id'])assert.ok(sectionFor('#'+route),route);
 assert.equal(sectionFor('#dungeons/hall-of-thanes'),'game-guide');
 assert.equal(sectionFor('#character/name/quests'),'characters');
 assert.equal(sectionFor('#community/guild-test'),'community');
 assert.equal(navigation.some(g=>g.links.some(([name])=>name==='NPCs')),false,'no empty database destinations');
});
test('search matches first and last name in either order and groups typed results',()=>{
 const rows=[{type:'Public character',name:'Guinú Shadowgrave',meta:'Horde',href:'#community/one'},{type:'Item',name:'Shadowfang',meta:'123',href:'#items/123'}];
 assert.equal(groupResults(rows,'shadowgrave guinu').groups[0][1][0].name,'Guinú Shadowgrave');
 assert.equal(groupResults(rows,'shadow').groups.length,2);
 assert.equal(groupResults([...rows,...rows],'shadow').total,2,'pagination deduplicates');
 assert.equal(groupResults(rows,'x').total,0);
 assert.equal(groupResults(rows,'shadow',1).shown,1);
 assert.equal(groupResults(rows,'shadow',1).total,2);
});
test('public search provider exposes only public display fields',()=>{
 const rows=publicSearchRows([{id:'a/b',name:'Test',level:10,race:'Orc',class:'WARRIOR',faction:'Horde',email:'private@test',inventory:'secret'}],[{id:'guild',name:'Company',faction:'Both',recruiting:true}]);
 assert.equal(rows[0].href,'#community/a%2Fb');
 assert.equal(JSON.stringify(rows).includes('private@test'),false);
 assert.equal(JSON.stringify(rows).includes('secret'),false);
 assert.equal(rows[1].href,'#community/guild-guild');
});
test('dashboard distinguishes public, personal, empty and loading state',()=>{
 const state=demoState();
 assert.match(dashboardView(state),/Find your next adventure/);
 assert.ok(!dashboardView(state).includes(state.characters[0].snapshots.at(-1).name),'public home excludes private collection');
 assert.match(dashboardView(state,{personal:true}),/Character invitations/);
 assert.match(dashboardView(emptyState(),{personal:true}),/No imported snapshots recorded/);
 assert.match(dashboardView(state,{personal:true,loading:true}),/Loading your private character collection/);
});
test('breadcrumbs escape labels and PvE filtered routes preserve encounter navigation',()=>{
 assert.match(breadcrumbs([['<script>']]),/&lt;script&gt;/);
 assert.match(pveView('raids',undefined,emptyState()),/<h1>Raid Journal<\/h1>/);
 assert.match(pveView('dungeons',undefined,emptyState()),/<h1>Dungeon Journal<\/h1>/);
 assert.match(pveView('hall-of-thanes',undefined,emptyState()),/aria-label="Breadcrumb"/);
 assert.match(pveView('hall-of-thanes','faldrim-anvilmar',emptyState()),/Faldrim Anvilmar/);
 assert.match(pveView('missing',undefined,emptyState()),/Instance not found/);
});

test('primary hierarchy exposes only implemented hubs and destinations',()=>{
 assert.deepEqual(navigation.map(g=>g.name),['Game Guide','Characters','Community','Tools']);
 for(const section of ['game-guide','tools','community-home'])assert.match(hubView(section),/<h1>/);
 assert.equal(sectionFor('#items/123'),'game-guide');
 assert.equal(sectionFor('#talents/paladin'),'tools');
});

test('all Journal overview filters remain valid deep links',()=>{
 for(const filter of ['new','classic','dungeons','raids'])assert.ok(!pveView(filter,undefined,emptyState()).includes('Instance not found'));
});
