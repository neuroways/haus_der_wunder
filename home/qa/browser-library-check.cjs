const {chromium}=require('/Users/svenja/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const results=[];
 for(const view of [{name:'mobile',width:390,height:844},{name:'landscape',width:844,height:390},{name:'tablet',width:768,height:1024},{name:'desktop',width:1440,height:900}]){
  const page=await browser.newPage({viewport:{width:view.width,height:view.height}}),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.goto('http://127.0.0.1:4173/home/#ort/P02');await page.waitForTimeout(250);
  assert.equal(await page.locator('#emfd-library-root .emfd-lib-item').count(),5);
  assert.equal(await page.locator('[data-library-jump]').count(),1);
  await page.locator('[data-book="weltenweberin"][data-action="select"]').click();
  await page.locator('[data-book="weltenweberin"][data-action="open"]').click();
  assert.equal(await page.locator('#origin-dialog[open] .origin-toc-items button').count(),6);
  await page.locator('#origin-dialog .origin-close').click();
  await page.locator('[data-book="klangwelten"][data-action="select"]').click();
  await page.locator('[data-book="klangwelten"][data-action="open"]').click();
  assert.equal(await page.locator('#origin-dialog[open] .origin-toc-items button').count(),13);
  await page.locator('#origin-dialog .origin-close').click();
  await page.evaluate(()=>{location.hash='#flur'});await page.waitForTimeout(100);await page.evaluate(()=>{location.hash='#ort/P02'});await page.waitForTimeout(200);
  assert.equal(await page.locator('#emfd-library-root .emfd-lib-item').count(),5);
  await page.screenshot({path:`qa/library-${view.name}-v0.6.60.png`,fullPage:false});
  results.push({view:view.name,books:5,weaver:6,music:13,errors});await page.close();
 }
 const page=await browser.newPage({viewport:{width:1024,height:768}});await page.goto('http://127.0.0.1:4173/home/#flur');await page.locator('[data-origin-open]').first().evaluate(button=>button.click());assert.equal(await page.locator('#origin-dialog[open] .origin-toc-items button').count(),19);await page.close();
 await browser.close();console.log(JSON.stringify(results));process.exit(0);
})().catch(error=>{console.error(error);process.exitCode=1});
