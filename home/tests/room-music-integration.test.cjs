const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const home=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(home,file),'utf8');
const mapping=JSON.parse(read('room-music-map.json'));
const playlist=JSON.parse(read('playlist-catalog.json'));
const ids=new Set(playlist.items.filter(item=>item.cardId).map(item=>item.cardId));
test('HOUSE-MUSIC-01 approved allocations cover all 24 real compositions, with valid room IDs',()=>{
 assert.equal(mapping.assignmentStatus,'user-approved-2026-11-04');
 assert.deepEqual(Object.keys(mapping.rooms),Array.from({length:8},(_,i)=>`P0${i+1}`));
 assert.equal(mapping.flur.themeAssetId,'T03');
 assert.equal(mapping.musikzimmer.expectedItems,25);
 const assigned=Object.values(mapping.rooms).flatMap(room=>room.cardIds);
 assert.equal(assigned.length,26);
 assert.deepEqual(new Set(assigned),ids);
 assert.ok(assigned.every(id=>ids.has(id)));
 assert.deepEqual(mapping.rooms.P03.cardIds.slice(0,2),['O21','O13']);
 assert.deepEqual(mapping.rooms.P06.cardIds,['O08','O15','O16','O19']);
 assert.equal(mapping.audioPolicy.autoPlay,false);
});
test('HOUSE-MUSIC-01 new room panels and advanced room accessors are wired to the current routes',()=>{
 const app=read('app.js'),music=read('room-music.js'),index=read('index.html');
 assert.match(app,/EMFDRoomMusic\?\.mount\(main,musicRoomId/);
 assert.match(music,/\.house-skeleton/);
 assert.match(music,/\.atelier-topbar-controls/);
 assert.match(music,/\.teezimmer-topbar/);
 // EMFD-PLAYER-01: allocations come from the device register (shared/devices.js), checked against the approved map above.
 assert.match(music,/root\.EMFDDevices\?\.forRoom\(roomId\)/);
 assert.match(index,/room-music\.js\?v=[\w.-]+"/);
 assert.match(index,/room-music\.css\?v=0\.6\.53/);
 assert.match(music,/data-room-song-select/);
 assert.match(music,/data-room-device-link/);
});
test('Each room offers reading and explicit playback on the shared device',()=>{
 const ui=read('room-music.js');
 // Explicit playback goes through the shared device station; stories open as a book dialog (PLA-D04).
 assert.match(ui,/root\.EMFDDeviceStation\?\.start\(device\.id,\{startId:play\.dataset\.roomSongSelect\}\)/);
 assert.match(ui,/root\.EMFDReaders\?\.openComposition\?\.\(story\.dataset\.roomSongStory,story\)/);
 assert.doesNotMatch(ui,/selectCardTrack|startRoomPlaylist|location\.hash/);
 for(const room of Object.values(mapping.rooms)) assert.ok(room.deviceName&&room.deviceImage);
});
