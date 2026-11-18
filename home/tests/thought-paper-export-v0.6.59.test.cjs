const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'..','thought-paper.js'),'utf8');

function harness(){
 const draw=[];
 const makeCanvas=()=>{
  const canvas={width:794,height:1123};
  const ctx={
   font:'21px Georgia',fillStyle:'',strokeStyle:'',lineWidth:1,
   measureText(text){const size=Number(this.font.match(/(\d+)px/)?.[1]||21);return {width:[...String(text)].length*size*.54};},
   fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},
   fillText(text,x,y){draw.push({text:String(text),x,y,font:this.font,canvas});}
  };
  canvas.getContext=()=>ctx;
  return canvas;
 };
 const scope={
  document:{createElement(type){assert.equal(type,'canvas');return makeCanvas();}},
  CARDS:[{id:'O11',name:'Der Werkzeugkasten',group:'Kraft',question:'Welche Möglichkeiten sind für dich zugänglich?'}],
  EMFDQRCode:class {
   addData(){}make(){}getModuleCount(){return 21;}isDark(){return false;}
  },
  EMFDQRErrorCorrectLevel:{M:0},globalThis:null
 };
 scope.globalThis=scope;
 const extended=script.replace('root.EMFDThoughtPaper=Object.freeze({open,context,dateDisplay});',
  'root.__exportQA={setState(s){state=s;},documentPages};root.EMFDThoughtPaper=Object.freeze({open,context,dateDisplay});');
 assert.notEqual(extended,script,'QA hook must attach to the real paginator');
 vm.runInNewContext(extended,scope);
 const page=(state)=>{
  draw.length=0;
  scope.__exportQA.setState(state);
  return {pages:scope.__exportQA.documentPages('https://example.org/home/#teezimmer'),draw:[...draw]};
 };
 return {page,scope};
}
const normalize=text=>String(text).replace(/\s+/g,'');
const repeated=(n)=>Array.from({length:n},(_,i)=>i%7===0
 ? 'Ein sehrlangeszusammenhängendesWortMitUmlautenÄÖÜ und eine neue Zeile.\n'
 : 'Ein Gedanke mit zwei verschiedenen, gut lesbaren Abschnitten. ').join('');

for(const desired of [1,2,5,10]){
 test(`EMFD-NOTE-03: ${desired}-page note stays above QR and keeps every character`,()=>{
  const {page,scope}=harness();
  let result,body='';
  // Determine input length for this deterministic canvas font approximation.
  for(let n=1;n<600;n++){
   body=repeated(n);
   result=page({...scope.EMFDThoughtPaper.context({mode:'free'}),text:body});
   if(result.pages.length>=desired)break;
  }
  assert.equal(result.pages.length,desired,'fixture must exercise the intended number of pages');
  assert.equal(result.draw.filter(x=>/^\d+ \/ \d+$/.test(x.text)).length,desired);
  const content=result.draw.filter(x=>x.x===78&&/^(21px|bold 23px|italic 17px) Georgia/.test(x.font));
  assert.ok(content.length>0);
  for(const line of content){
   assert.ok(line.y<=1123-275-45,`Content ${line.text} at y=${line.y} overlaps QR area`);
  }
  const bodyDraws=result.draw.filter(x=>x.x===78&&x.font==='21px Georgia'&&x.text);
  assert.equal(normalize(bodyDraws.map(x=>x.text).join('')),normalize(body));
 });
}

test('EMFD-NOTE-03: very long free title, question and long words all paginate safely',()=>{
 const {page,scope}=harness();
 const state={...scope.EMFDThoughtPaper.context({mode:'free'}),title:'Ein sehr ausführlicher Titel zu diesem Gedanken '.repeat(200),text:repeated(8)};
 const result=page(state);
 assert.ok(result.pages.length>2,'very long title must continue over more than two pages');
 const headings=result.draw.filter(x=>x.font==='bold 23px Georgia');
 assert.equal(normalize(headings.map(x=>x.text).join('')),normalize(state.title));
 for(const line of headings)assert.ok(line.y<=1123-275-45,`Title outside content: ${line.y}`);
 const bodyDraws=result.draw.filter(x=>x.x===78&&x.font==='21px Georgia'&&x.text);
 assert.equal(normalize(bodyDraws.map(x=>x.text).join('')),normalize(state.text));
 const card={...scope.EMFDThoughtPaper.context({mode:'card',cardId:'O11'}),text:repeated(65),question:'Eine ausführlichere Frage über Möglichkeiten, die sich nicht auf eine Zeile beschränkt. '.repeat(60)};
 const cardResult=page(card);
 assert.ok(cardResult.pages.length>2);
 const questions=cardResult.draw.filter(x=>x.font==='italic 17px Georgia');
 assert.equal(normalize(questions.map(x=>x.text).join('')),normalize(card.question));
 for(const line of questions)assert.ok(line.y<=1123-275-45,`Question outside content: ${line.y}`);
});
