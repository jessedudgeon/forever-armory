import test from 'node:test';
import assert from 'node:assert/strict';
import {guildFields,guildEventFields,filterRoster,httpsUrl} from '../site/guild-model.js';
import {publicStory,relationshipFields} from '../site/profile-model.js';
test('guild projection is bounded and excludes account identities',()=>{
 const g=guildFields({name:'Casual Aggression',faction:'Horde',visibility:'private',uid:'secret',accounts:['secret']});
 assert.equal(g.visibility,'private');assert.ok(!JSON.stringify(g).includes('secret'));
 for(const v of ['javascript:alert(1)','http://example.com','https://user:pass@example.com'])assert.throws(()=>httpsUrl(v));
 assert.equal(httpsUrl('https://example.com'),'https://example.com/');
 assert.throws(()=>guildFields({...g,name:'a'.repeat(101)}));
});
test('events require valid time, integer capacity and known type',()=>{
 const input={name:'Raid night',type:'raid',startsAt:'2026-10-04T19:00:00-04:00',capacity:20};
 assert.equal(guildEventFields(input).startsAt.toISOString(),'2026-10-04T23:00:00.000Z');
 for(const patch of [{startsAt:'bad'},{capacity:-1},{capacity:1.5},{type:'unknown'}])assert.throws(()=>guildEventFields({...input,...patch}));
});
test('roster filters compose without exposing hidden main/alt relationships',()=>{
 const rows=[{class:'PALADIN',role:'officer',level:25,professions:['Blacksmithing']},{class:'PRIEST',role:'member',level:15,professions:['Alchemy']}];
 assert.equal(filterRoster(rows,{class:'PALADIN',profession:'smith',rank:'officer',minLevel:20,maxLevel:30}).length,1);
 assert.equal(filterRoster(rows,{maxLevel:10}).length,0);
});
test('public story uses explicit opt-in fields and relationships remain directional',()=>{
 const story=publicStory({history:'Chosen public history',secrets:'PRIVATE',uid:'PRIVATE',inventory:['PRIVATE'],mainCharacterId:'PRIVATE'});
 assert.ok(!JSON.stringify(story).includes('PRIVATE'));
 assert.deepEqual(relationshipFields('custom','Rival scholar'),{type:'custom',note:'Rival scholar'});
 assert.throws(()=>relationshipFields('invalid',''));
 assert.throws(()=>publicStory({history:'a'.repeat(6001)}));
});
