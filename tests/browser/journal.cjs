// Isolated local journal regression; never signs in or writes production data.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
(async()=>{
 const server=spawn(process.execPath,['dev-server.mjs','--port','4175']);
 let browser;
 try {
  for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:4175');break;}catch{await new Promise(r=>setTimeout(r,100));}}
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/firebase-config.js',r=>r.fulfill({contentType:'text/javascript',body:'export const firebaseConfig={};'}));
  await page.route('https://unpkg.com/**',r=>r.fulfill({contentType:'application/json',body:'[]'}));
  await page.goto('http://127.0.0.1:4175/#pve/raids');
  await page.locator('.dungeon-card').first().waitFor();
  for(const filter of ['new','classic','all','raids']) {
   await page.locator('#dungeon-filter').selectOption(filter);
   await page.waitForFunction(value=>document.querySelector('#dungeon-filter')?.value===value && (location.hash===(value==='all'?'#pve':'#pve/'+value)),filter);
   assert.equal((await page.locator('h1').innerText()).includes('not found'),false);
  }
  assert.equal(await page.locator('.dungeon-card').count(),2);
  assert.match(await page.locator('h1').innerText(),/Raid Journal/);
  await page.goto('http://127.0.0.1:4175/#pve');
  await page.locator('#dungeon-search').fill('Old Ironforge Incursion');
  assert.equal(await page.locator('.dungeon-card').count(),1);
  await page.locator('.dungeon-card').click();
  await page.locator('#loot-rows [data-item-detail="271097"]').waitFor();
  assert.equal(await page.locator('#loot-rows [data-item-detail]').count(),17);
  // Non-boss rewards use the same tooltip and return to the real instance route.
  await page.locator('[data-loot-filter="sourceType"]').selectOption('quest-reward');
  assert.equal(await page.locator('#loot-rows tr').count(),5);
  await page.locator('#loot-rows [data-item-detail="279895"]').click();
  await page.locator('#item-detail-content h2').waitFor();
  assert.match(await page.locator('#item-detail-content').innerText(),/Ironforge Greathammer/);
  assert.equal(await page.locator('[data-journal-source]').first().getAttribute('href'),'#pve/hall-of-thanes');
  await page.locator('.item-modal-close').click();
  await page.locator('[data-loot-filter="query"]').fill('no-such-loot');
  await page.getByText('No listed loot matches these filters.',{exact:true}).waitFor();
  await page.goto('http://127.0.0.1:4175/#pve/wailing-caverns');
  assert.match(await page.locator('#pve-quests').innerText(),/Raptor Horns/);
  await page.goto('http://127.0.0.1:4175/#pve/shadowfang-keep');
  await page.locator('[data-loot-filter="sourceType"]').selectOption('trash');
  assert.equal(await page.locator('#loot-rows tr').count(),2);
  assert.equal(await page.locator('#loot-rows a[href*="/null"]').count(),0);
  await page.goto('http://127.0.0.1:4175/#pve/city-of-dalaran');
  assert.equal(await page.locator('#pve-quests, #pve-loot-section').count(),0);
  assert.doesNotMatch(await page.locator('main').innerText(),/28–33|Loading item/);
  await page.goto('http://127.0.0.1:4175/#pve/deadmines');
  assert.match(await page.locator('h1').innerText(),/Instance not found/);
  await page.goto('http://127.0.0.1:4175/#roster');
  await page.locator('#add-manual').click();
  await page.locator('[name=mainName]').fill('Journal');
  await page.locator('[name=secondaryName]').fill('Tester');
  await page.locator('[name=playStyle]').selectOption('Normal');
  await page.locator('[name=faction]').selectOption('Horde');
  await page.locator('[name=race]').selectOption('Undead');
  await page.locator('[name=class]').selectOption('MAGE');
  await page.locator('[name=level]').fill('60');
  await page.getByRole('button',{name:'Save character',exact:true}).click();
  await page.locator('.profile-hero').waitFor();
  await page.goto('http://127.0.0.1:4175/#pve/ruins-of-lordaeron');
  await page.locator('[data-encounter=witherfang]').check();
  await page.waitForFunction(()=>document.querySelector('#pve-progress')?.textContent.includes('1/6'));
  assert.equal(await page.locator('[data-instance-complete]').isChecked(),false);
  await page.locator('[data-instance-complete]').check();
  await page.waitForFunction(()=>document.querySelector('#pve-progress')?.textContent.includes('Completion recorded'));
  await page.reload();
  await page.locator('[data-instance-complete]').waitFor();
  assert.equal(await page.locator('[data-instance-complete]').isChecked(),true);
  assert.equal(await page.locator('[data-encounter=witherfang]').isChecked(),true);
  await page.goto('http://127.0.0.1:4175/#pve/dungeons');
  await page.locator('#dungeon-search').fill('');
  assert.match(await page.locator('[href="#pve/ruins-of-lordaeron"]').innerText(),/Completion recorded/);
  await page.goto('http://127.0.0.1:4175/#dungeons/shadowfang-keep/archmage-arugal');
  await page.locator('[data-encounter=archmage-arugal]').check();
  await page.waitForFunction(()=>document.querySelector('#pve-progress')?.textContent.includes('1/10'));
  // Character isolation and failed-write recovery through the real journal binder.
  await page.evaluate(async()=>{
   const {pveView,bindPve}=await import('/pve.js');
   const host=document.createElement('div');host.id='journal-test';document.body.append(host);
   const state={characters:[{id:'a',snapshots:[{name:'One',progress:[{id:'hall-of-thanes',bosses:[{id:'faldrim-anvilmar',completed:true}]}]}]},{id:'b',snapshots:[{name:'Two'}]}]};
   host.innerHTML=pveView('hall-of-thanes','faldrim-anvilmar',state);
   bindPve(host,'hall-of-thanes',()=>state,async()=>{throw Error('Test save failed');});
  });
  const harness=page.locator('#journal-test');
  assert.equal(await harness.locator('[data-encounter=faldrim-anvilmar]').isChecked(),true);
  await harness.locator('#pve-character').selectOption('b');
  assert.equal(await harness.locator('[data-encounter=faldrim-anvilmar]').isChecked(),false);
  await harness.locator('[data-encounter=faldrim-anvilmar]').click();
  await harness.locator('#pve-error').filter({hasText:'Test save failed'}).waitFor();
  assert.equal(await harness.locator('[data-encounter=faldrim-anvilmar]').isChecked(),false);
  assert.equal(await harness.locator('#pve-character').isEnabled(),true);
  await page.evaluate(()=>document.querySelector('#journal-test').remove());
  for(const width of [320,390,768,1440]) {
   await page.setViewportSize({width,height:1000});
   for(const route of ['pve/raids','pve/ruins-of-lordaeron','pve/ruins-of-lordaeron','pve/ruins-of-lordaeron/witherfang']) {
    await page.goto('http://127.0.0.1:4175/#'+route);
    await page.locator('h1').waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width}: ${route} overflow`);
   }
  }
  await page.goto('http://127.0.0.1:4175/#items');
  await page.locator('#item-search').fill('Spiritwraith');
  await page.locator('#item-search-results [data-open-item="271097"]').waitFor();
  await page.locator('#item-search-results [data-open-item="271097"]').click();
  assert.match(await page.locator('.wowhead-item-link').getAttribute('href'), /wowhead\.com\/forever\/item=271097/);
  assert.match(await page.locator('#item-detail-content').innerText(), /Spiritwraith Drape/);
  await page.locator('.item-modal-close').click();
  await page.locator('#item-search').fill('Deathbringer');
  await page.getByText('No matching reported or captured item.',{exact:false}).waitFor();
  await page.goto('http://127.0.0.1:4175/#pve/hyjal-summit');
  await page.locator('#pve-bosses').waitFor();
  assert.match(await page.locator('#pve-bosses').innerText(),/not been verified/);
  assert.equal(await page.locator('.dungeon-boss').count(),0);
  await page.goto('http://127.0.0.1:4175/#pve/hall-of-thanes');
  await page.locator('#loot-rows [data-item-detail="271097"]').waitFor();
  await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
  await page.screenshot({path:'/tmp/forever-journal-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:900});
  await page.locator('[data-loot-filter="sourceType"]').selectOption('quest-reward');
  await page.locator('#pve-loot-section').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:'/tmp/forever-journal-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: raid/dungeon routes, quest search and prerequisites, independent boss/clear persistence, overview progress, mobile/tablet/desktop, no page errors.');
 } finally {await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
