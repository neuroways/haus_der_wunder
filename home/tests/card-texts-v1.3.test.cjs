const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function load(path){const c={window:{}};vm.runInNewContext(fs.readFileSync(path,'utf8'),c);return c.window.CARDS;}
const current=load(path.join(__dirname,'../data.js')),prior=JSON.parse(fs.readFileSync(path.join(__dirname,'../qa/identity-baseline-v0.6.9.json'),'utf8'));

const required=['impulse','interpretation','depth','houseStory','question','anchor'];
test('Every stable card ID carries all six nonempty optional text fields',()=>{
 assert.equal(current.length,24);assert.equal(new Set(current.map(c=>c.id)).size,24);
 for(const c of current)for(const field of required)assert.equal(typeof c[field],'string',`${c.id} ${field}`),assert.ok(c[field].trim(),`${c.id} empty ${field}`);
});
test('Four established groups remain six cards each',()=>{
 const counts=current.reduce((a,c)=>(a[c.group]=(a[c.group]||0)+1,a),{});
 assert.deepEqual(counts,{Ruhe:6,Kraft:6,Halt:6,Freude:6});
});
test('Text import leaves identity and alternative text unchanged; documented image swaps are corrected',()=>{
 for(const c of current){const old=prior.find(x=>x.id===c.id);assert.ok(old,c.id);for(const key of ['name','group','alt','imageVersion','imageWidth','imageHeight'])assert.equal(c[key],old[key],`${c.id} ${key}`);assert.equal(c.imageSourceId,c.id,`${c.id} imageSourceId`);}
});
test('O24 draft depth is available and image-review warnings remain attached to the correct IDs',()=>{
 assert.match(current.find(c=>c.id==='O24').depth,/goldfarbene Sprenkel/);
 assert.equal(current.find(c=>c.id==='O06').imageReviewStatus,'ÜBERARBEITEN');
 assert.equal(current.find(c=>c.id==='O23').imageReviewStatus,'ÜBERARBEITEN');
});
