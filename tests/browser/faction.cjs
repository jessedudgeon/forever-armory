const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
(async()=>{
 const server=spawn(process.execPath,['dev-server.mjs','--port','4178']);
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/firebase-config.js',r=>r.fulfill({contentType:'text/javascript',body:'export const firebaseConfig={};'}));
  await page.goto('http://localhost:4178/');await page.locator('#header-character').waitFor();
  assert.equal(await page.locator('body').getAttribute('data-faction'),'forever');
  await page.evaluate(async()=>{const {demoState}=await import('/model.js');const state=demoState();state.characters[1].snapshots.at(-1).faction='Alliance';state.characters[1].snapshots.at(-1).race='Dwarf';localStorage.setItem('forever-armory-v1',JSON.stringify(state));});
  await page.reload();await page.locator('#header-character option').nth(1).waitFor({state:'attached'});
  const chars=await page.evaluate(async()=>{return JSON.parse(localStorage.getItem('forever-armory-v1')).characters.map(c=>({id:c.id,...c.snapshots.at(-1)}));});
  for(const faction of ['Horde','Alliance']){
   const c=chars.find(c=>c.faction===faction);assert.ok(c);
   await page.locator('#header-character').selectOption(c.id);
   await page.waitForFunction(f=>document.body.dataset.faction===f,faction.toLowerCase());
   assert.equal(await page.locator('#faction-banner strong').textContent(),c.name);
   await page.goto('http://localhost:4178/#game-guide');
   assert.equal(await page.locator('#header-character').inputValue(),c.id);
   await page.screenshot({path:'/tmp/forever-'+faction.toLowerCase()+'.png',fullPage:true});
  }
  await page.locator('#header-character').selectOption('');await page.waitForFunction(()=>document.body.dataset.faction==='forever');
  for(const width of [320,390,768,1100,1280,1440]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);
   assert.equal(await page.locator('#header-character').isVisible(),true);
  }
  await page.screenshot({path:'/tmp/forever-mobile.png',fullPage:true});
  await page.setViewportSize({width:390,height:900});await page.locator('#open-navigation').click();
  await page.locator('#mobile-account summary').click();await page.locator('#drawer-character').selectOption(chars[0].id);
  await page.waitForFunction(()=>!document.querySelector('#navigation-drawer').open);
  assert.equal(await page.locator('#header-character').inputValue(),chars[0].id);
  assert.deepEqual(errors,[]);console.log('Faction switching, clear, persistence across routes, mobile selector and six viewport widths passed');
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exit(1);});
