const {chromium}=require('/Users/svenja/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const errors=[];
  for(const viewport of [{name:'mobile',width:390,height:844},{name:'landscape',width:844,height:390},{name:'desktop',width:1440,height:900}]){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},serviceWorkers:'block'});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(`${viewport.name}: ${error}`));
    await page.goto('http://127.0.0.1:4173/home/#ankommen');
    await page.locator('[data-start02-enter]').waitFor({state:'visible'});
    assert.equal(await page.locator('.start02-door-actions [data-start-gift-open]').count(),0,`${viewport.name}: Geschenkbutton`);
    assert.equal(await page.locator('.global-nav').evaluate(element=>getComputedStyle(element).display),'none',`${viewport.name}: unteres Menü`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true,`${viewport.name}: horizontale Überbreite`);
    await page.screenshot({path:`qa/arrival-${viewport.name}-v0.6.65.png`,fullPage:false});

    await page.goto('http://127.0.0.1:4173/home/#flur');
    await page.locator('.hall-stage').waitFor({state:'visible'});
    assert.notEqual(await page.locator('.global-nav').evaluate(element=>getComputedStyle(element).display),'none',`${viewport.name}: Hausnavigation im Flur`);
    assert.equal(await page.locator('[data-start-gift-open]').count(),1,`${viewport.name}: Geschenkzugang im Flur`);
    await context.close();
  }
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log(JSON.stringify({arrivalButton:'REMOVED',arrivalNavigation:'HIDDEN',hallNavigation:'PRESERVED',viewports:3,errors}));
})().catch(error=>{console.error(error);process.exit(1)});
