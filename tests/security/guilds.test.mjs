import {readFile} from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeTestEnvironment, assertFails} from '@firebase/rules-unit-testing';
import * as F from 'firebase/firestore';
import {communityService} from '../../site/community-service.js';
import {demoState} from '../../site/model.js';

test('shared guild lifecycle, private access, independent alts, role enforcement and transactional capacity', async () => {
 const env = await initializeTestEnvironment({projectId:'demo-forever-guilds',firestore:{rules:await readFile('firestore.rules','utf8')}});
 try {
  const context = uid => env.authenticatedContext(uid,{firebase:{sign_in_provider:'google.com'}}).firestore();
  const a=context('alice'), b=context('bob'), c=context('carol'), guest=env.unauthenticatedContext().firestore();
  const service=(db,uid)=>communityService(F,db,{currentUser:uid?{uid}:null});
  const alice=service(a,'alice'), bob=service(b,'bob'), carol=service(c,'carol'), reader=service(guest);
  await env.withSecurityRulesDisabled(ctx=>F.setDoc(F.doc(ctx.firestore(),'communityConfig/status'),{enabled:true}));
  const character=demoState().characters[0];
  for(const [s,id] of [[alice,'a'],[bob,'b'],[bob,'alt'],[carol,'c']]) await s.publish(id,character,{fields:{}});
  const input={name:'Casual Aggression',faction:'Horde',visibility:'public',recruiting:true};
  await alice.guilds.create('a',input,'guild');
  assert.equal((await reader.guilds.directory()).rows.length,1);
  assert.equal((await reader.guilds.roster('guild')).rows[0].role,'master');
  await assert.rejects(()=>bob.guilds.edit('guild',input));
  await assert.rejects(()=>alice.guilds.leave('a'));
  await assertFails(F.setDoc(F.doc(b,'communityMemberships/b'),{guildId:'guild',role:'member',joinedAt:F.serverTimestamp()}));
  await alice.guilds.invite('guild','a','b');
  assert.equal((await bob.guilds.invitations('b')).rows.length,1);
  await assert.rejects(()=>carol.guilds.invitations('b'));
  await bob.guilds.respond('guild','b',false);
  assert.equal((await bob.guilds.invitations('b')).rows.length,0);
  await alice.guilds.invite('guild','a','b');await bob.guilds.respond('guild','b',true);
  assert.equal((await bob.guilds.membership('b')).role,'member');
  await assert.rejects(()=>bob.guilds.rank('b','officer'));
  await assert.rejects(()=>bob.guilds.invite('guild','b','c'));
  // Ordinary members must stay within Firestore's per-write rule-read budget,
  // including when the officer/master authorization branch would deny them.
  await alice.guilds.event('guild','a',{name:'Member RSVP',type:'social',startsAt:'2099-10-10T18:00:00Z',capacity:1},'member-event');
  await bob.guilds.rsvp('guild','member-event','b','going');
  await bob.guilds.rsvp('guild','member-event','b','declined');
  await alice.guilds.rank('b','officer');await bob.guilds.invite('guild','b','alt');await bob.guilds.respond('guild','alt',true);
  assert.equal((await reader.guilds.roster('guild')).rows.length,3);
  await bob.guilds.open('guild','b');
  await bob.guilds.post('guild','b','announcement','Raid this weekend','announcement');
  await bob.guilds.pin('guild','announcement',true);
  await assert.rejects(()=>carol.guilds.post('guild','c','ic','Forged'));
  await bob.guilds.event('guild','b',{name:'Dungeon night',type:'dungeon',startsAt:'2026-10-10T18:00:00Z',capacity:1},'event');
  const race=await Promise.allSettled([alice.guilds.rsvp('guild','event','a','going'),bob.guilds.rsvp('guild','event','b','going')]);
  assert.equal(race.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await reader.guilds.events('guild')).rows[0].going,1);
  const winner=(await reader.guilds.responses('guild','event')).rows.find(r=>r.status==='going').id;
  const winnerService=winner==='a'?alice:bob;
  await winnerService.guilds.rsvp('guild','event',winner,'going');
  assert.equal((await reader.guilds.events('guild')).rows[0].going,1);
  await winnerService.guilds.rsvp('guild','event',winner,'maybe');
  assert.equal((await reader.guilds.events('guild')).rows[0].going,0);
  await assertFails(F.updateDoc(F.doc(b,'communityGuilds/guild/events/event'),{going:100,updatedAt:F.serverTimestamp()}));
  await assertFails(F.setDoc(F.doc(b,'communityGuilds/guild/events/event/rsvps/alt'),{status:'going',updatedAt:F.serverTimestamp()}));
  await bob.guilds.cancel('guild','event',true);
  await assert.rejects(()=>alice.guilds.rsvp('guild','event','a','going'));
  await bob.guilds.cancel('guild','event',false);
  await alice.guilds.edit('guild',{...input,visibility:'private'});
  assert.equal((await reader.guilds.directory()).rows.length,0);
  await assert.rejects(()=>reader.guilds.profile('guild'));
  await assert.rejects(()=>reader.guilds.roster('guild'));
  await assert.rejects(()=>carol.guilds.profile('guild'));
  await bob.guilds.open('guild','b'); assert.equal((await bob.guilds.profile('guild')).name,input.name);
  await bob.guilds.invite('guild','b','c');
  await carol.guilds.open('guild','c');assert.equal((await carol.guilds.profile('guild')).name,input.name);
  await carol.guilds.respond('guild','c',false); await assert.rejects(()=>carol.guilds.profile('guild'));
  await assert.rejects(()=>bob.guilds.transfer('guild','b'));
  await assertFails(F.updateDoc(F.doc(a,'communityGuilds/guild'),{masterId:'b',updatedAt:F.serverTimestamp()}));
  await alice.guilds.transfer('guild','b');
  assert.equal((await bob.guilds.membership('b')).role,'master');
  assert.equal((await alice.guilds.membership('a')).role,'officer');
  await bob.guilds.transfer('guild','a');
  await alice.unpublish('a');
  assert.equal((await alice.guilds.profile('guild')).name,input.name);
  await alice.publish('a',character,{fields:{}});
  await bob.guilds.leave('alt');assert.equal((await bob.guilds.membership('b')).role,'officer');
  await bob.guilds.leave('b');await assert.rejects(()=>bob.guilds.profile('guild'));
  await assertFails(F.getDocs(F.collection(a,'communityGuilds/guild/access')));
  await env.withSecurityRulesDisabled(ctx=>F.setDoc(F.doc(ctx.firestore(),'communityConfig/status'),{enabled:false}));
  await assert.rejects(()=>alice.guilds.edit('guild',input));
 } finally {await env.cleanup();}
});

test('faction guild invitations authorize the selected master/officer within the rule read budget', async () => {
 const env = await initializeTestEnvironment({projectId:'demo-forever-guild-invites',firestore:{rules:await readFile('firestore.rules','utf8')}});
 try {
  await env.withSecurityRulesDisabled(ctx=>F.setDoc(F.doc(ctx.firestore(),'communityConfig/status'),{enabled:true}));
  const context = uid => env.authenticatedContext(uid,{firebase:{sign_in_provider:'google.com'}}).firestore();
  const a=context('leader'), b=context('officer'), c=context('recipient');
  const service=(db,uid)=>communityService(F,db,{currentUser:{uid}});
  const leader=service(a,'leader'), officer=service(b,'officer'), recipient=service(c,'recipient');
  for (const faction of ['Horde','Alliance','Both']) {
   const character=structuredClone(demoState().characters[0]);
   character.snapshots.at(-1).faction=faction==='Both'?'Horde':faction;
   const master=`master-${faction}`, alt=`alt-${faction}`, deputy=`officer-${faction}`, target=`target-${faction}`, gid=`guild-${faction}`;
   for(const [s,id] of [[leader,master],[leader,alt],[officer,deputy],[recipient,target]]) await s.publish(id,character,{fields:{}});
   await leader.guilds.create(master,{name:gid,faction,visibility:'private'},gid);
   await leader.guilds.invite(gid,master,deputy);
   await officer.guilds.respond(gid,deputy,true);
   await leader.guilds.rank(deputy,'officer');
   await officer.guilds.invite(gid,deputy,target);
   await leader.guilds.invite(gid,master,target); // Existing invitations can be resent.
   assert.equal((await recipient.guilds.invitations(target)).rows[0].id,gid);
   await assertFails(F.setDoc(F.doc(c,`communityInvites/${target}/guilds/${gid}`),{inviterId:master,guildName:gid,createdAt:F.serverTimestamp()}));
   await leader.guilds.invite(gid,master,alt);await leader.guilds.respond(gid,alt,true);
   // Owning a master does not let the same account invite as an ordinary member.
   await assert.rejects(()=>leader.guilds.invite(gid,alt,target));
   await assert.rejects(()=>leader.guilds.invite(gid,master,`unpublished-${faction}`));
   if(faction!=='Both') {
    character.snapshots.at(-1).faction=faction==='Horde'?'Alliance':'Horde';
    const opposite=`opposite-${faction}`;await recipient.publish(opposite,character,{fields:{}});
    await assert.rejects(()=>leader.guilds.invite(gid,master,opposite));
   }
  }
 } finally {await env.cleanup();}
});
