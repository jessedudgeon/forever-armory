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
  assert.equal(await page.locator('.dungeon-card').count(),7);
  assert.match(await page.locator('h1').innerText(),/Raid Journal/);
  await page.locator('#dungeon-search').fill('Blackhand');
  assert.equal(await page.locator('.dungeon-card').count(),1);
  await page.locator('.dungeon-card').click();
  await page.locator('.pve-quest ol').waitFor();
  assert.equal(await page.locator('.pve-quest li').count(),3);
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
  await page.goto('http://127.0.0.1:4175/#pve/naxxramas');
  await page.locator('[data-encounter=kelthuzad]').check();
  await page.waitForFunction(()=>document.querySelector('#pve-progress')?.textContent.includes('1/15'));
  assert.equal(await page.locator('[data-instance-complete]').isChecked(),false);
  await page.locator('[data-instance-complete]').check();
  await page.waitForFunction(()=>document.querySelector('#pve-progress')?.textContent.includes('Completion recorded'));
  await page.reload();
  await page.locator('[data-instance-complete]').waitFor();
  assert.equal(await page.locator('[data-instance-complete]').isChecked(),true);
  assert.equal(await page.locator('[data-encounter=kelthuzad]').isChecked(),true);
  await page.goto('http://127.0.0.1:4175/#pve/raids');
  await page.locator('#dungeon-search').fill('');
  assert.match(await page.locator('[href="#pve/naxxramas"]').innerText(),/Completion recorded/);
  await page.goto('http://127.0.0.1:4175/#dungeons/shadowfang-keep/archmage-arugal');
  await page.locator('[data-encounter=archmage-arugal]').check();
  await page.waitForFunction(()=>document.querySelector('#pve-progress')?.textContent.includes('1/10'));
  // Character isolation and failed-write recovery through the real journal binder.
  await page.evaluate(async()=>{
   const {pveView,bindPve}=await import('/pve.js');
   const host=document.createElement('div');host.id='journal-test';document.body.append(host);
   const state={characters:[{id:'a',snapshots:[{name:'One',progress:[{id:'onyxias-lair',bosses:[{id:'onyxia',completed:true}]}]}]},{id:'b',snapshots:[{name:'Two'}]}]};
   host.innerHTML=pveView('onyxias-lair','onyxia',state);
   bindPve(host,'onyxias-lair',()=>state,async()=>{throw Error('Test save failed');});
  });
  const harness=page.locator('#journal-test');
  assert.equal(await harness.locator('[data-encounter=onyxia]').isChecked(),true);
  await harness.locator('#pve-character').selectOption('b');
  assert.equal(await harness.locator('[data-encounter=onyxia]').isChecked(),false);
  await harness.locator('[data-encounter=onyxia]').click();
  await harness.locator('#pve-error').filter({hasText:'Test save failed'}).waitFor();
  assert.equal(await harness.locator('[data-encounter=onyxia]').isChecked(),false);
  assert.equal(await harness.locator('#pve-character').isEnabled(),true);
  await page.evaluate(()=>document.querySelector('#journal-test').remove());
  for(const width of [320,390,768,1440]) {
   await page.setViewportSize({width,height:1000});
   for(const route of ['pve/raids','pve/naxxramas','pve/blackwing-lair','pve/naxxramas/kelthuzad']) {
    await page.goto('http://127.0.0.1:4175/#'+route);
    await page.locator('h1').waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width}: ${route} overflow`);
   }
  }
  await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
  await page.screenshot({path:'/tmp/forever-journal-desktop.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: raid/dungeon routes, quest search and prerequisites, independent boss/clear persistence, overview progress, mobile/tablet/desktop, no page errors.');
 } finally {await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
