#!/usr/bin/env node
/* EMFD-CACHE-01 · Erzeugt home/offline-precache.js aus dem tatsächlichen Code.
 *
 * Quellen (nichts wird geraten):
 *  - index.html: alle lokalen <script src>, <link href> inkl. ?v=-Stempel
 *  - ES-Module: statische import-Pfade (rekursiv)
 *  - JS: literale fetch-/JSON-Pfade ('x.json', 'x.json?v=…')
 *  - CSS: url(...) innerhalb von home/
 *  - assets/icons, assets/music-icons, assets/gift, assets/tutorial, assets/rooms (App-eigene Grafik)
 * assets/recovery/ (30 Alt-Karten, nur Rückfall) wird bewusst NICHT vorab geladen.
 *
 * Aufruf:  node scripts/build-offline-precache.mjs          (schreibt die Datei)
 *          node scripts/build-offline-precache.mjs --check  (Exit 1, wenn veraltet)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const home = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(home, 'offline-precache.js');
const exists = rel => fs.existsSync(path.join(home, rel.split('?')[0]));
const read = rel => fs.readFileSync(path.join(home, rel.split('?')[0]), 'utf8');
const local = ref => ref && !/^(?:[a-z]+:|\/\/|#|\.\.\/|\/)/i.test(ref);

const shell = new Set(['./', 'index.html']);
const missing = [];
function add(ref) {
  if (!local(ref)) return false;
  const clean = ref.replace(/^\.\//, '');
  if (!exists(clean)) { missing.push(clean); return false; }
  if (shell.has(clean)) return false;
  shell.add(clean);
  return true;
}

const html = read('index.html');
for (const m of html.matchAll(/<(?:script|link)\b[^>]*?\s(?:src|href)="([^"]+)"/g)) add(m[1]);
// Zentraler Media-Loader liegt außerhalb von home/ (../media/), wird aber für den Offline-Start gebraucht.
const external = [...html.matchAll(/<script\b[^>]*?\ssrc="(\.\.\/media\/media-loader\.js[^"]*)"/g)].map(m => m[1]);

// ES-Module rekursiv
const modules = [...shell].filter(f => /\.m?js(\?|$)/.test(f));
const seen = new Set();
function scanModule(rel) {
  const file = rel.split('?')[0];
  if (seen.has(file)) return; seen.add(file);
  const src = read(file);
  for (const m of src.matchAll(/(?:import\s[^;]*?from\s*|import\s*\(\s*)['"]([^'"]+)['"]/g)) {
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), m[1]));
    if (target.startsWith('..')) continue;
    if (add(target)) scanModule(target);
  }
}
for (const f of modules) scanModule(f);

// JSON-Daten, die per fetch geladen werden
for (const f of [...shell].filter(f => /\.m?js(\?|$)/.test(f))) {
  const src = read(f);
  for (const m of src.matchAll(/['"`]([A-Za-z0-9_./-]+\.json(?:\?[^'"`\s]*)?)['"`]/g)) {
    // fetch() löst relativ zur Seite (home/) auf, nicht zur Skriptdatei.
    const target = path.posix.normalize(m[1]);
    if (!target.startsWith('..')) add(target);
  }
}

// CSS url(...)
for (const f of [...shell].filter(f => /\.css(\?|$)/.test(f))) {
  const src = read(f);
  for (const m of src.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (/^data:/.test(m[1])) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(f.split('?')[0]), m[1]));
    if (!target.startsWith('..')) add(target);
  }
}

// App-eigene Grafik
for (const dir of ['assets/icons', 'assets/music-icons', 'assets/gift', 'assets/tutorial', 'assets/rooms']) {
  if (!fs.existsSync(path.join(home, dir))) continue;
  for (const name of fs.readdirSync(path.join(home, dir)).sort()) {
    if (/\.(?:png|webp|jpe?g|svg)$/i.test(name)) add(`${dir}/${name}`);
  }
}
add('manifest.webmanifest');

const list = [...shell, ...external].sort((a, b) => (a === './' ? -1 : b === './' ? 1 : a.localeCompare(b)));
const body = `/* EMFD-CACHE-01 · GENERIERT von scripts/build-offline-precache.mjs – nicht von Hand ändern. */
(function (root) {
  'use strict';
  root.EMFDPrecache = Object.freeze({
    // App-Dateien: werden bei der Installation geladen und sind danach offline verfügbar.
    shell: Object.freeze(${JSON.stringify(list, null, 2).replace(/\n/g, '\n    ')})
  });
})(typeof self !== 'undefined' ? self : globalThis);
`;

if (process.argv.includes('--check')) {
  const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (current !== body) { console.error('offline-precache.js ist veraltet: node scripts/build-offline-precache.mjs ausführen.'); process.exit(1); }
  console.log(`offline-precache.js aktuell (${list.length} Dateien).`);
} else {
  fs.writeFileSync(out, body);
  console.log(`offline-precache.js geschrieben: ${list.length} Dateien.`);
}
if (missing.length) console.warn('Nicht gefunden (ausgelassen):', [...new Set(missing)].join(', '));
