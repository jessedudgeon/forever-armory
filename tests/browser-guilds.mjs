// The browser renders real production modules; a local RPC bridge calls the real
// Firestore service against isolated emulator users. No production writes/OAuth.
import {chromium} from 'playwright';
import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import * as F from 'firebase/firestore';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {communityService} from '../site/community-service.js';
import {demoState} from '../site/model.js';

const server=spawn(process.execPath,['dev-server.mjs','--port','4174'],{stdio:'inherit'});
const base='http://127.0.0.1:4174';
let browser,env;
try {
 for(let i=0;i<50;i++){try{await fetch(base);break;}catch{await new Promise(r=>setTimeout(r,100));}}
 env=await initializeTestEnvironment({projectId:'demo-forever-browser',firestore:{rules:await readFile('firestore.rules','utf8')}});
 await env.withSecurityRulesDisabled(c=>F.setDoc(F.doc(c.firestore(),'communityConfig/status'),{enabled:true}));
 const state=demoState(), character=state.characters[0];
 const services={};for(const uid of ['alice','bob'])services[uid]=communityService(F,env.authenticatedContext(uid,{firebase:{sign_in_provider:'google.com'}}).firestore(),{currentUser:{uid}});
 await services.alice.publish('alice-character',character,{fields:{atAGlance:'Browser test character'}});
 await services.bob.publish('bob-character',character,{fields:{atAGlance:'Second player'}});
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const errors=[];
 async function newPage(uid,width=1440){
  const page=await browser.newPage({viewport:{width,height:1000}});
  page.on('pageerror',e=>{errors.push(e.message);console.error('Browser error:',e.message);});page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const feeds=new Map();let serial=0;
  await page.exposeFunction('serviceCall',async(method,args)=>{
   if(method==='feed.create'){const key=String(++serial);feeds.set(key,services[uid].feed(...args));return key;}
   if(method==='feed.next')return feeds.get(args[0]).next();
   const [group,key]=method.split('.');const result=key?await services[uid][group][key](...args):await services[uid][group](...args);
   // Firestore cursors stay server-side. The test only needs the first small page.
   if(result?.cursor)result.cursor=null;
   return JSON.parse(JSON.stringify(result??null,(_k,v)=>v?.seconds!==undefined&&v?.nanoseconds!==undefined?{__time:v.seconds*1000+v.nanoseconds/1e6}:v));
  });
  await page.route(base+'/__guild-test',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/expansion.css"></head><body><main style="max-width:1100px;margin:auto" id="root"></main><script type="module">
   import {bindCommunity} from '/community.js';import {demoState} from '/model.js';
   const revive=v=>{if(v&&typeof v==='object'){if('__time' in v)return {toDate:()=>new Date(v.__time),toMillis:()=>v.__time};for(const k of Object.keys(v))v[k]=revive(v[k]);}return v;};
   const call=async(m,a)=>revive(await window.serviceCall(m,a));
   const service=new Proxy({guilds:new Proxy({}, {get:(_,m)=>(...a)=>call('guilds.'+m,a)}),feed:(...args)=>{let key;return {next:async()=>{key ||= await call('feed.create',args);return call('feed.next',[key]);}};}},{get:(t,m)=>m in t?t[m]:(...a)=>call(m,a)});
   const root=document.querySelector('#root');let state=demoState();
   async function render(){root.innerHTML='<div id="community-root"></div>';await bindCommunity(root.firstChild,service,state,{uid:'${uid}'},location.hash.slice(1).replace('community/','')||'guilds',async next=>state=next,render,console.error);document.body.dataset.ready=location.hash.slice(1).replace('community/','')||'guilds';}
   window.addEventListener('hashchange',()=>{document.body.dataset.ready='';render();});render();
   </script></body></html>`}));
  await page.goto(base+'/__guild-test');await page.waitForFunction(()=>document.body.dataset.ready==='guilds');await page.waitForSelector('#shared-guild-create',{state:'attached'});return page;
 }
 const idle=page=>page.locator('#community-content[aria-busy="false"]').waitFor();
 const alice=await newPage('alice');
 await alice.locator('summary').filter({hasText:'Create a guild'}).click();
 await alice.locator('#shared-guild-create [name=name]').fill('Casual Aggression');
 await alice.locator('#shared-guild-create [name=description]').fill('Chill adventures, scheduled raids.');
 await alice.locator('#shared-guild-create button[type=submit]').click();
 // Production links use #community/<route>; the harness maps that prefix away.
 await alice.waitForURL(/#community\/guild-/);
 const gid=alice.url().split('guild-')[1];
 await alice.waitForSelector('#guild-invite');await idle(alice);
 await alice.locator('#guild-invite input').fill('bob-character');await alice.locator('#guild-invite button').click();
 await alice.getByText('Invitation sent.',{exact:true}).waitFor();
 const bob=await newPage('bob',390);
 await bob.locator('[data-accept]').click();await bob.waitForURL(/#community\/guild-/);
 await bob.waitForSelector('#guild-leave');await bob.waitForFunction(()=>document.querySelectorAll('.roster-member').length===2);
 assert.equal(await bob.locator('#guild-settings').count(),0);
 assert.equal(await bob.locator('.roster-member').count(),2);await idle(bob);
 assert.equal(await bob.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile guild overflow');
 await bob.screenshot({path:'/tmp/forever-guild-roster-mobile.png',fullPage:true});
 await alice.reload();await idle(alice);await alice.waitForFunction(()=>document.querySelectorAll('.roster-member').length===2);await alice.waitForSelector('#shared-event-create',{state:'attached'});
 await alice.locator('summary').filter({hasText:'Schedule an event'}).click();
 await alice.locator('#shared-event-create [name=name]').fill('Saturday dungeon');
 await alice.locator('#shared-event-create [name=startsAt]').fill('2026-10-10T19:00');
 await alice.locator('#shared-event-create [name=capacity]').fill('1');
 await alice.locator('#shared-event-create button[type=submit]').click();
 await alice.getByText('Saturday dungeon',{exact:true}).waitFor();
 await bob.reload();await idle(bob);await bob.locator('[data-rsvp=going]').click();await bob.getByText('1 going / 1 places',{exact:true}).waitFor();
 await alice.reload();await idle(alice);await alice.locator('[data-rsvp=going]').click();await alice.locator('#community-error').filter({hasText:'This event is full.'}).waitFor();
 await alice.locator('#guild-post [name=type]').selectOption('announcement');await alice.locator('#guild-post [name=body]').fill('Welcome to Casual Aggression.');await alice.locator('#guild-post button').click();
 await idle(alice);await alice.locator('[data-pin]').click();await alice.getByText('Pinned · announcement',{exact:true}).waitFor();
 await idle(alice);await alice.locator('#roster-min').fill('60');assert.equal(await alice.locator('.roster-member').count(),0);await alice.locator('#roster-min').fill('');
 await alice.evaluate(()=>location.hash='alice-character');await alice.waitForSelector('[data-story]',{state:'attached'});await idle(alice);
 await alice.getByText('Edit publicly shared story',{exact:true}).click();await alice.locator('[name=history]').fill('A history deliberately shared.');await alice.locator('[data-story] button').click();await alice.getByText('A history deliberately shared.',{exact:true}).first().waitFor();
 await idle(alice);await alice.getByText('Add or update a public relationship',{exact:true}).click();await alice.locator('[data-relationship] [name=target]').fill('bob-character');await alice.locator('[data-relationship] [name=note]').fill('Fellow traveler');await alice.locator('[data-relationship] button').click();await alice.getByText('Fellow traveler',{exact:true}).waitFor();
 await bob.evaluate(()=>location.hash='alice-character');await bob.waitForSelector('#community-follow');await idle(bob);await bob.locator('#community-follow').click();await idle(bob);await bob.reload();await bob.getByText('1 followers',{exact:true}).waitFor();
 await bob.evaluate(()=>location.hash='following');await bob.waitForSelector('[data-following-list] article');await idle(bob);await bob.locator('[data-following-list] button').click();
 for(const page of [alice,bob]){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow');assert.equal(await page.locator('#community-error').textContent(),'');}
 await bob.screenshot({path:'/tmp/forever-guild-mobile.png',fullPage:true});
 // Smoke existing production routes in local example mode; no real account login.
 const app=await browser.newPage({viewport:{width:1440,height:1000}});app.on('pageerror',e=>errors.push(e.message));
 await app.goto(base+'/#roster');await app.locator('#account-demo').click();
 for(const route of ['roster','talents','storage','pve','items','professions','guilds','events','activity']){
  await app.evaluate(r=>location.hash=r,route);await app.waitForTimeout(100);
  assert.equal(await app.locator('main').innerText().then(t=>t.includes('Page not found')),false,route);
 }
 await app.evaluate(()=>location.hash='roster');await app.locator('#add-manual').click();
 await app.locator('#manual-form [name=mainName]').fill('Browser');await app.locator('#manual-form [name=secondaryName]').fill('Fixture');
 await app.locator('#manual-form [name=playStyle]').selectOption('Normal');await app.locator('#manual-form [name=faction]').selectOption('Horde');
 await app.locator('#manual-form [name=race]').selectOption('Undead');await app.locator('#manual-form [name=class]').selectOption('PALADIN');
 await app.locator('#manual-form button[type=submit]').click();await app.locator('#modal').waitFor({state:'hidden'});
 const characterRoute=app.url().split('#')[1];
 const payload={format:'forever-armory',version:1,addonVersion:'0.3.0',character:{mainName:'Browser',secondaryName:'Fixture',playStyle:'Normal',class:'PALADIN',race:'Undead',faction:'Horde',level:15,gameIdentity:{guid:'Player-BROWSER-TEST',realm:'QA'},observedAt:new Date(Date.now()+1000).toISOString(),bags:[{bag:0,slot:1,id:2840,count:33,link:'[Copper Bar]'}]}};
 for(let i=0;i<2;i++){
  await app.evaluate(()=>location.hash='roster');await app.locator('#import').first().click();await app.locator('#import-text').fill(JSON.stringify(payload));
  await app.locator('#import-form button[type=submit]').click();await app.locator('#import-account').selectOption('default');
  if(i===0)await app.locator('#import-target').selectOption(decodeURIComponent(characterRoute.split('/')[1]));
  await app.locator('#save-import').click();await app.locator('#modal').waitFor({state:'hidden'});
  assert.equal(app.url().split('#')[1],characterRoute,'import keeps manual profile route');
 }
 await app.evaluate(()=>location.hash='storage');await app.getByText('Copper Bar',{exact:false}).first().waitFor();
 await app.evaluate(()=>location.hash='talents');await app.waitForSelector('.talent-tree');
 const xs=await app.locator('.talent-tree').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));assert.equal(new Set(xs).size,1,'three trees align on desktop');
 await app.setViewportSize({width:390,height:844});await app.evaluate(()=>location.hash='roster');await app.waitForTimeout(100);assert.equal(await app.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 console.log('PASS: real emulator-backed guild creation, invites, member UI, roster, capacity, announcement pin, public profile, relationship, follow/unfollow, desktop/mobile layout, and existing routes.');
} catch(error) {if(browser)for(const [i,context] of browser.contexts().entries())for(const page of context.pages()){console.error('PAGE',i,page.url(),await page.locator('body').innerText().catch(()=>''));await page.screenshot({path:'/tmp/forever-failure-'+i+'.png',fullPage:true}).catch(()=>{});}throw error;} finally {await browser?.close();await env?.cleanup();server.kill();}
