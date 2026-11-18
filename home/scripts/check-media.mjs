/* Run from home/: node scripts/check-media.mjs https://example.test/wunderhaus/home/ */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),core=require('../media-core.js');
const base=new URL(process.argv[2]||'https://flowisaurus.de/wunderhaus/home/');
const home=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const snapshot=JSON.parse(await fs.readFile(path.join(home,'media-catalog.json'),'utf8'));
let groups=snapshot.groups;try{const r=await fetch(new URL('../media/manifest.json',base));if(r.ok){const fresh=core.groups(await r.json());const merged=new Map(groups.map(g=>[g.id,g]));for(const g of fresh)merged.set(g.id,{...g,paths:[...new Set([...(merged.get(g.id)?.paths||[]),...g.paths])]});groups=[...merged.values()];}}catch{}
const used=new Set();for(const entry of await fs.readdir(home,{withFileTypes:true})){if(!entry.isFile()||! /\.(js|json|css|html)$/.test(entry.name)||entry.name==='media-catalog.json')continue;const text=await fs.readFile(path.join(home,entry.name),'utf8');for(const m of text.matchAll(/\.\.\/media\/[A-Za-z0-9_./%-]+\.(?:webp|png|jpeg|jpg)/g))used.add(m[0]);}
const paths=[...new Set([...used,...groups.flatMap(g=>g.paths)])],rows=[];let next=0;
await Promise.all(Array.from({length:4},async()=>{while(next<paths.length){const media=paths[next++];try{const r=await fetch(new URL(media,base),{method:'HEAD',cache:'no-store',signal:AbortSignal.timeout(12000)});rows.push({path:media,status:r.status,type:r.headers.get('content-type'),used:used.has(media)});}catch(e){rows.push({path:media,status:0,error:e.name,used:used.has(media)});}}}));
const checked=Object.fromEntries(rows.map(r=>[r.path,r.status])),lookup=core.index(groups);
for(const row of rows)row.alternatives=core.candidates(row.path,lookup).filter(p=>p!==row.path&&checked[p]===200);
await fs.writeFile(path.join(home,'media-catalog.json'),JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),source:'../media/manifest.json',groups,checked},null,2)+'\n');
await fs.writeFile(path.join(home,'media-catalog.js'),'globalThis.EMFDMediaCatalog='+await fs.readFile(path.join(home,'media-catalog.json'),'utf8')+';\n');
await fs.writeFile(path.join(home,'qa/media-current-check.json'),JSON.stringify({base:base.href,generatedAt:new Date().toISOString(),rows},null,2)+'\n');
console.log(JSON.stringify({checked:rows.length,missingUsed:rows.filter(r=>r.used&&r.status!==200).map(r=>({path:r.path,status:r.status,alternatives:r.alternatives}))},null,2));
