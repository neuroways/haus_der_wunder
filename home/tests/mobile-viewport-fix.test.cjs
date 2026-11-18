const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('MOB-01: start image is shipped inside the application package',()=>{
  assert.match(read('start-gate.js'),/assets\/rooms\/startseite-haustuer-v1\.webp/);
  assert.ok(fs.existsSync(path.join(root,'assets/rooms/startseite-haustuer-v1.webp')));
});

test('MOB-02/03: start and hall use the dynamic viewport without inner frames',()=>{
  const css=read('emfd-shell.css');
  assert.match(css,/body\.emfd-shell\.start-gate-mode[\s\S]*height:100dvh/);
  assert.match(css,/body\.emfd-shell\.hall-view[\s\S]*height:100dvh/);
  assert.match(css,/\.hall-stage\{border:0;border-radius:0;box-shadow:none\}/);
  assert.match(css,/\.start-scene,[\s\S]*\.hall-stage\{border:0;border-radius:0;box-shadow:none\}/);
});

test('MOB-04: hall route owns an explicit stable body state',()=>{
  assert.match(read('app.js'),/classList\.toggle\('hall-view',route==='flur'\|\|route==='haus'\)/);
});

test('MOB-05: enhanced start buttons retain bounded mobile geometry',()=>{
  const css=read('emfd-shell.css');
  assert.match(css,/start-door-action\{left:12%;right:12%;top:68%;bottom:auto;width:auto!important/);
  assert.match(css,/origin-start-link\{left:25%;right:25%;top:80%;bottom:auto;width:auto!important/);
  assert.match(css,/transform:none!important/);
});
