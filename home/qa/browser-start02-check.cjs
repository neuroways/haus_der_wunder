const {chromium}=require('/Users/svenja/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.goto('http://127.0.0.1:4173/home/#ankommen');
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await page.locator('[data-start02-enter]').waitFor({state:'visible'});
  await page.locator('[data-start02-enter]').waitFor({state:'attached'});
  await page.waitForFunction(()=>!document.querySelector('[data-start02-enter]')?.disabled);
  assert.match(await page.locator('[data-start02-status]').textContent(),/Briefillustrationen fehlen|ankommen/);
  await page.screenshot({path:'qa/start02-door-mobile-v0.6.61.png',fullPage:false});

  await page.locator('[data-start02-enter]').click();
  assert.equal(await page.locator('[data-start02-scene]').getAttribute('data-state'),'closed');
  await page.locator('[data-start02-open-envelope]').click();
  assert.equal(await page.locator('[data-start02-scene]').getAttribute('data-state'),'opening');
  await page.locator('[data-start02-skip-animation]').click();
  assert.equal(await page.locator('[data-start02-scene]').getAttribute('data-state'),'letter-visible');
  assert.match(await page.locator('.start02-letter-copy').textContent(),/Eine Tür für dich/);
  await page.screenshot({path:'qa/start02-letter-mobile-v0.6.61.png',fullPage:false});

  await page.locator('[data-start02-show-card]').click();
  assert.equal(await page.locator('[data-start02-scene]').getAttribute('data-state'),'gift-card-visible');
  await page.screenshot({path:'qa/start02-card-mobile-v0.6.61.png',fullPage:false});
  await page.locator('[data-start02-complete]').click();
  await page.waitForURL(/#flur$/);
  await page.locator('#start02-tutorial-dialog[open]').waitFor();
  assert.match(await page.locator('#start02-tutorial-dialog').textContent(),/Laterne/);
  assert.equal(await page.locator('audio').count(),0);
  await page.screenshot({path:'qa/start02-tutorial-mobile-v0.6.61.png',fullPage:false});
  await page.locator('[data-start02-tutorial-skip]').click();
  await page.locator('#start02-install-dialog[open]').waitFor();
  await page.locator('[data-start02-install-later]').click();

  const stored=await page.evaluate(()=>({
    gift:localStorage.getItem('emfd.start02.gift-completed.v1'),
    tutorial:localStorage.getItem('emfd.start02.tutorial-completed.v1'),
    install:localStorage.getItem('emfd.start02.install-dismissed.v1')
  }));
  assert.deepEqual(stored,{gift:'1',tutorial:'1',install:'1'});

  await page.goto('http://127.0.0.1:4173/home/#ankommen');
  await page.locator('[data-start02-enter]').click();
  await page.waitForURL(/#flur$/);
  assert.equal(await page.locator('#start02-tutorial-dialog[open]').count(),0);
  await page.locator('[data-start-gift-open]').click();
  await page.waitForURL(/#ankommen$/);
  assert.equal(await page.locator('[data-start02-scene]').getAttribute('data-state'),'letter-visible');

  await page.goto('http://127.0.0.1:4173/home/#flur');
  await page.waitForTimeout(250);
  const light=page.locator('.hall-light-toggle');
  if(await light.getAttribute('aria-pressed')==='true'){
    await light.click();
    await page.waitForFunction(()=>document.querySelector('.hall-light-toggle')?.getAttribute('aria-pressed')==='false',null,{timeout:5000});
  }
  assert.equal(await light.getAttribute('aria-pressed'),'false');
  await page.reload();
  assert.equal(await page.locator('.hall-light-toggle').getAttribute('aria-pressed'),'false');
  if(await page.locator('.hall-art').count())assert.match(await page.locator('.hall-art').getAttribute('src'),/flur-v2-dim/);
  else assert.equal(await page.locator('.room-photo-fallback').count(),1);

  await page.locator('[data-hall-help]').click();
  await page.locator('[data-start02-tutorial-replay]').click();
  await page.locator('#start02-tutorial-dialog[open]').waitFor();
  await page.locator('.start02-dialog-close').first().click();

  const landscapeContext=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'});
  const landscape=await landscapeContext.newPage();
  await landscape.goto('http://127.0.0.1:4173/home/#ankommen');
  await landscape.screenshot({path:'qa/start02-door-landscape-v0.6.61.png',fullPage:false});
  assert.equal(await landscape.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
  await landscapeContext.close();

  assert.deepEqual(errors,[]);
  await browser.close();
  console.log(JSON.stringify({firstVisit:'PASS',returningVisit:'PASS',replay:'PASS',tutorial:'PASS',installHelp:'PASS',light:'PASS',errors}));
  process.exit(0);
})().catch(error=>{console.error(error);process.exit(1);});
