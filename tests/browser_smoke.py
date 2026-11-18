# Browser-Rauchtest (Playwright + Chrome). Erwartet einen lokalen Testserver auf :8766 mit /wunderhaus/media, PWA- und 3D-Attrappe (siehe docs/06_Tests.md).
import asyncio, json, os, shutil
from playwright.async_api import async_playwright
B='http://127.0.0.1:8766'
# Chrome-Pfad: EMFD_CHROME, sonst google-chrome, sonst vorinstalliertes Chromium
CHROME=os.environ.get('EMFD_CHROME') or shutil.which('google-chrome') or '/opt/pw-browsers/chromium'
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        ctx = await br.new_context(viewport={'width':390,'height':844}, device_scale_factor=2)
        page = await ctx.new_page()
        logs=[]; page.on('console', lambda m: logs.append(m.type+': '+m.text)); page.on('pageerror', lambda e: logs.append('PAGEERROR '+str(e)))
        # PWA: 1. Start (kein Cache) -> Hintergrund-Update
        await page.goto(B+'/wunderhaus/home/index.html'); await page.wait_for_function('window.__events.length>0', timeout=10000)
        r1 = await page.evaluate('({before: window.__before.slice(0,2), after: CARDS.slice(0,2).map(c=>c.image), o19: CARDS[18].image, ev: window.__events, cov: EMFDImages.cover("O24"), thumb: EMFDImages.card("O01","playlist-thumbnail"), view: EMFDImages.card("O02")})')
        print('PWA Start 1:', json.dumps(r1, indent=1))
        # 2. Start: synchron aus Cache
        await page.reload(); await page.wait_for_timeout(300)
        r2 = await page.evaluate('({before: window.__before.slice(0,1)})')
        print('PWA Start 2 (synchron vor app.js):', r2)
        # Notbremse
        await page.goto(B+'/wunderhaus/home/index.html?emfd-media-bridge=off'); await page.wait_for_timeout(300)
        print('Notbremse:', await page.evaluate('CARDS[0].image'))
        # 3D aus zwei Verzeichnissen
        for path in ['/wunderhaus/home/3d/claude/v2/index.html','/wunderhaus/home/3d/codex/v1/']:
            await page.goto(B+path); await page.wait_for_function('window.__result', timeout=15000)
            print('3D', path, json.dumps(await page.evaluate('window.__result')))
        # Katalog
        await page.goto(B+'/wunderhaus/media/katalog/'); await page.wait_for_selector('#cards .card'); await page.wait_for_timeout(1500)
        print('Katalog stats:', await page.inner_text('#stats'))
        await page.click('#probe'); await page.wait_for_function("document.querySelector('#probe').textContent.includes('prüfen')", timeout=60000)
        print('Probe erste Zeilen:', [t for t in (await page.inner_text('#playlist tbody')).split('\n') if t.strip()][:12])
        await page.screenshot(path='/tmp/emfd-katalog-mobil.png', full_page=False)
        await page.evaluate("window.scrollTo(0, 420)"); await page.wait_for_timeout(500)
        await page.screenshot(path='/tmp/emfd-katalog-karten.png')
        dctx = await br.new_context(viewport={'width':1280,'height':900})
        d = await dctx.new_page(); await d.goto(B+'/wunderhaus/media/katalog/'); await d.wait_for_selector('#cards .card'); await d.wait_for_timeout(2000)
        await d.screenshot(path='/tmp/emfd-katalog-desktop.png', full_page=False)
        print('LOGS', [l for l in logs if 'error' in l.lower() or 'PAGEERROR' in l][:10])
        await br.close()
asyncio.run(main())
