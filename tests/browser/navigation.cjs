const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
(async()=>{
 const server=spawn(process.execPath,['dev-server.mjs','--port','4175']);
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/firebase-config.js',r=>r.fulfill({contentType:'text/javascript',body:'export const firebaseConfig={};'}));
  await page.goto('http://localhost:4175/');await page.locator('h1').waitFor();
  await page.locator('#desktop-navigation summary').filter({hasText:'Game Guide'}).click();
  await page.getByRole('link',{name:'Game Guide overview',exact:true}).click();await page.getByRole('heading',{name:'Game Guide',exact:true}).waitFor();
  assert.equal(await page.locator('#desktop-navigation [data-section=game-guide]').getAttribute('class'),'active-section');
  await page.locator('#desktop-navigation summary').filter({hasText:'Tools'}).click();
  await page.locator('#desktop-navigation summary').filter({hasText:'Tools'}).press('Escape');
  assert.equal(await page.locator('#desktop-navigation details[open]').count(),0);
  for(const hash of ['tools','community-home','pve/raids','pve/dungeons','pve/hall-of-thanes/faldrim-anvilmar','roster/history','guide','account']){
   await page.goto('http://localhost:4175/#'+hash);await page.locator('h1').waitFor();assert.ok(!(await page.locator('main').innerText()).includes('Page not found'),hash);
  }
  await page.goto('http://localhost:4175/#home');await page.locator('#home-search input').fill('Faldrim Anvilmar');await page.locator('#home-search button').click();
  await page.locator('#global-results a').filter({hasText:'Faldrim Anvilmar'}).waitFor();
  await page.reload();await page.locator('#global-results a').filter({hasText:'Faldrim Anvilmar'}).waitFor();
  assert.equal(await page.locator('#global-query').inputValue(),'Faldrim Anvilmar');
  await page.locator('#global-results a').filter({hasText:'Faldrim Anvilmar'}).click();await page.getByRole('heading',{name:'Faldrim Anvilmar',exact:true,level:1}).waitFor();
  await page.goBack();await page.locator('#global-query').waitFor();assert.equal(await page.locator('#global-query').inputValue(),'Faldrim Anvilmar');
  // Pending search input must not hijack navigation after leaving search.
  await page.locator('#global-query').fill('Orgrimmar');await page.locator('.brand').click();await page.locator('#home-search').waitFor();
  await page.waitForTimeout(250);assert.match(page.url(),/#home$/);
  console.log('Search history passed');
  for(const width of [320,390,768,1100,1280,1440]){
   console.log('Viewport',width);await page.setViewportSize({width,height:900});await page.goto('http://localhost:4175/#home');await page.locator('#home-search').waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'home overflow '+width);
   if(width<1100){
    await page.locator('#open-navigation').click();await page.locator('#navigation-drawer[open]').waitFor();
    if(!await page.locator('#mobile-navigation a[href="#pve/raids"]').isVisible())await page.locator('#mobile-navigation summary').filter({hasText:'Game Guide'}).click();
    await page.locator('#mobile-navigation a[href="#pve/raids"]').click();await page.getByRole('heading',{name:'Raid Journal',exact:true}).waitFor();
    assert.equal(await page.locator('#navigation-drawer').isVisible(),false);
    await page.locator('#open-navigation').click();await page.locator('#close-navigation').press('Escape');await page.locator('#navigation-drawer').waitFor({state:'hidden'});
    assert.equal(await page.locator('#open-navigation').evaluate(el=>el===document.activeElement),true);
   }
  }
  // Exercise paginated public search with deterministic service fixtures, including partial failure.
  await page.goto('http://localhost:4175/#tools');
  await page.evaluate(async()=>{
   const {searchView,bindSearch}=await import('/features.js');const {emptyState}=await import('/model.js');
   const root=document.createElement('section');root.id='search-fixture';document.querySelector('main').replaceChildren(root);root.innerHTML=searchView();
   let guildCalls=0;
   const service={available:async()=>true,directory:async cursor=>({rows:[{id:cursor?'second':'first',name:cursor?'Needle Second':'Needle First',level:12,race:'Orc',class:'WARRIOR',faction:'Horde'}],cursor:'next',done:!!cursor}),guilds:{directory:async()=>{if(++guildCalls===1)throw Error('Test directory outage');return {rows:[{id:'fixture',name:'Needle Guild',faction:'Horde'}],done:true};}}};
   await bindSearch(root,emptyState(),service,'Needle');
  });
  await page.locator('[data-coverage]').filter({hasText:'A directory could not load'}).waitFor();
  assert.equal(await page.locator('#global-results a').count(),1);
  await page.locator('[data-load-public]').click();await page.locator('[data-coverage]').filter({hasText:'All available public records loaded'}).waitFor();
  assert.equal(await page.locator('#global-results a').count(),3);
  assert.equal(await page.locator('[data-load-public]').isVisible(),false);
  console.log('Public search pagination, partial error recovery and completion passed');
  await page.setViewportSize({width:1280,height:900});await page.goto('http://localhost:4175/#home');await page.locator('#home-search').waitFor();await page.screenshot({path:'/tmp/forever-navigation-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.locator('#open-navigation').click();await page.locator('#mobile-navigation summary').filter({hasText:'Community'}).click();await page.screenshot({path:'/tmp/forever-navigation-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log('Navigation browser acceptance passed: hubs, menus, Escape/focus, route reload/back, search, 320–1440px layouts.');
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exit(1)});
