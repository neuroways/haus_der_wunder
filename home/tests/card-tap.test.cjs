const test=require('node:test'),assert=require('node:assert/strict'),Tap=require('../card-tap.js');
function setup(){let single=0,double=0,scheduled=null;const t=new Tap(()=>single++,()=>double++,320,fn=>{scheduled=fn;return 1;},()=>scheduled=null);return {t,flush(){scheduled?.();scheduled=null;},count(){return [single,double]}};}
test('Single tap flips only after double-tap window',()=>{const x=setup();x.t.tap();assert.deepEqual(x.count(),[0,0]);x.flush();assert.deepEqual(x.count(),[1,0]);});
test('Double tap zooms without an extra flip',()=>{const x=setup();x.t.tap();x.t.tap();x.flush();assert.deepEqual(x.count(),[0,1]);});
test('Swipe or route cancellation prevents delayed flip',()=>{const x=setup();x.t.tap();x.t.cancel();x.flush();assert.deepEqual(x.count(),[0,0]);});
test('Keyboard activation flips immediately and cancels pending tap',()=>{const x=setup();x.t.tap();x.t.tap(true);x.flush();assert.deepEqual(x.count(),[1,0]);});
