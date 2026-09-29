const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const server=require('node:child_process').spawn(process.execPath,['dev-server.mjs','--port','4175']);
 let browser;
 try{browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||chromium.executablePath(),args:['--no-sandbox']});}catch(e){server.kill();throw e;}
 const page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try {
  await page.route('**/firebase-config.js',r=>r.fulfill({contentType:'text/javascript',body:'export const firebaseConfig={};'}));
  await page.goto('http://localhost:4175/#import');
  await page.locator('#import').first().click();
  await page.locator('#import-file').setInputFiles({name:'ForeverArmory.lua',mimeType:'text/plain',buffer:fs.readFileSync('/tmp/forever-addon-session.json.lua')});
  assert.match(await page.locator('#import-text').inputValue(),/^\{"addonVersion":"0.3.0"/);
  await page.locator('#import-form button[type=submit]').click();
  await page.locator('#import-account').selectOption('default');
  await page.locator('#save-import').click();
  await page.locator('#modal').waitFor({state:'hidden'});
  await page.locator('[data-tab=progress]').click();
  await page.getByRole('heading',{name:'Completed quest journal'}).waitFor();
  assert.match(await page.locator('main').innerText(),/Test quest/);
  // Newer partial session merges journal; markup in quest names is displayed as text.
  const p=JSON.parse(fs.readFileSync('/tmp/forever-addon-session.json','utf8'));
  p.character.observedAt='2026-09-30T00:00:00Z';
  const event={...p.character.questHistory[0],eventId:'new-event',questId:789,name:'<img src=x onerror="window.questInjected=1">',completedAt:p.character.observedAt};
  p.character.questHistory=[event];p.character.completedQuestIDs=[789];
  await page.locator('#import').click();
  await page.locator('#import-text').fill(JSON.stringify(p));
  await page.locator('#import-form button[type=submit]').click();
  await page.locator('#import-account').selectOption('default');
  await page.locator('#save-import').click();await page.locator('#modal').waitFor({state:'hidden'});
  await page.locator('[data-tab=progress]').click();
  assert.match(await page.locator('main').innerText(),/2 recorded turn-ins/);
  assert.match(await page.locator('main').innerText(),/<img src=x/);
  assert.equal(await page.evaluate(()=>window.questInjected),undefined);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  assert.deepEqual(errors,[]);
  console.log('Browser checks passed: saved-file review/import, cumulative quest journal, escaped names, mobile layout.');
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
