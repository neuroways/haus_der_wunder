const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const home=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(home,'app.js'),'utf8');
const cards=JSON.parse(fs.readFileSync(path.join(home,'data.js'),'utf8').replace(/^window\.CARDS=/,'').replace(/;\s*$/,''));
test('client router defines render before its initial invocation',()=>{
  const definition=app.indexOf('function render(){');
  const call=app.indexOf("window.addEventListener('hashchange',render);render();");
  assert.ok(definition>=0,'render() must be defined');
  assert.ok(call>definition,'hashchange binding and initial render must follow the definition');
});
test('runtime paints the landing page and O16 detail instead of leaving main blank',()=>{
  const main={innerHTML:'',focus(){},querySelector(sel){return ['#draw-card','#open-player-from-page'].includes(sel)?{onclick:null}:null;},querySelectorAll(){return [];}};
  const settings={textContent:''};
  const dialog={addEventListener(){},setAttribute(){},showModal(){},close(){},focus(){},querySelector(){return null;},className:'',innerHTML:'',open:false};
  const classes={toggle(){},add(){},remove(){},contains(){return false;}};
  const body={classList:classes,appendChild(node){return node;}};
  const controls={onclick:null};
  const document={
    body,head:{append(){}},title:'',
    querySelector(sel){return sel==='main'?main:sel==='#motion-settings'?settings:sel==='.skip'||sel==='#quiet'?controls:null;},querySelectorAll(){return [];},
    createElement(){return Object.assign({},dialog);},
    addEventListener(){},
  };
  const window={matchMedia(){return {matches:false,addEventListener(){}};},addEventListener(){},scrollTo(){}};
  for(const hash of ['', '#karte/O16']){
    main.innerHTML='';
    const context={document,window,location:{hash},CARDS:cards,console,ResizeObserver:undefined};
    vm.runInNewContext(app,context,{filename:'app.js'});
    if(hash==='') assert.match(main.innerHTML,/Ein kleiner Moment/);
    else {
      assert.match(main.innerHTML,/Der Faden/);
      assert.match(main.innerHTML,/data-reading=\"impulse\"/);
      assert.doesNotMatch(main.innerHTML,/Begleittexte noch nicht verfügbar/);
    }
  }
});
test('new house routes render the Flur, room directory, room detail, and independent music page',()=>{
  const cases=[['#flur','Im Flur'],['#raeume','Alle Räume'],['#ort/P03','Wintergarten'],['#musik','Musik']];
  for(const [hash,expected] of cases){
    const main={innerHTML:'',focus(){},querySelector(sel){return sel==='#open-player-from-page'?{onclick:null}:null;},querySelectorAll(){return [];}};
    const settings={textContent:''},control={onclick:null},dialog={addEventListener(){},setAttribute(){},showModal(){},close(){},focus(){},querySelector(){return null;},className:'',innerHTML:'',open:false};
    const document={body:{classList:{toggle(){},add(){},remove(){},contains(){return false;}},appendChild(node){return node;}},head:{append(){}},title:'',querySelector(sel){return sel==='main'?main:sel==='#motion-settings'?settings:sel==='.skip'||sel==='#quiet'?control:null;},querySelectorAll(){return [];},createElement(){return Object.assign({},dialog);},addEventListener(){}};
    const window={matchMedia(){return {matches:false,addEventListener(){}};},addEventListener(){},scrollTo(){}};
    vm.runInNewContext(app,{document,window,location:{hash},CARDS:cards,console,ResizeObserver:undefined},{filename:'app.js'});
    assert.match(main.innerHTML,new RegExp(expected));
  }
});
