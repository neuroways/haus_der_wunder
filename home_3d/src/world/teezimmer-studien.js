// EMFD · Teezimmer-Formstudien · aus 3D-04d-P2 v0.4.3 unverändert übernommen (Zeilen 83–250).
// REIN DARSTELLUNG: keine Kollision (übernimmt navigation-eg.json), keine Klickfläche (übernimmt interaction.js).
// Erkennungsmodelle, keine freigegebenen Objektmaster. Ersatz durch GLB-Assets ab v0.6.
export function buildTeezimmerStudies(THREE, renderer){
const exhibit=new THREE.Group();exhibit.name='EMFD_Teezimmer_Studien_v0.4.3';const exhibitMeshes=[];
const mWood=new THREE.MeshStandardMaterial({color:'#79523d',roughness:.82});
const mDark=new THREE.MeshStandardMaterial({color:'#3c2928',roughness:.79});
const mTeal=new THREE.MeshStandardMaterial({color:'#28636b',roughness:.72});
const mBlue=new THREE.MeshStandardMaterial({color:'#315c7c',roughness:.94});
const mCream=new THREE.MeshStandardMaterial({color:'#e1d1b8',roughness:.9});
const mCushion=new THREE.MeshStandardMaterial({color:'#c4a4a1',roughness:.96});
const mBrass=new THREE.MeshStandardMaterial({color:'#c0a06b',metalness:.43,roughness:.44});
const mCeramic=new THREE.MeshStandardMaterial({color:'#307f89',roughness:.26,metalness:.07,side:THREE.DoubleSide});
const mPaper=new THREE.MeshStandardMaterial({color:'#e9ddc4',roughness:.96});
const tmgr=new THREE.TextureLoader();
function loadTile(file,mat,rx,ry){tmgr.load('./assets/materials/'+file,tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(rx,ry);tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());tex.minFilter=THREE.LinearMipmapLinearFilter;tex.magFilter=THREE.LinearFilter;tex.needsUpdate=true;mat.map=tex;mat.needsUpdate=true},undefined,()=>{});}

function itemMesh(g,mat,x,y,z,tag){let mesh=new THREE.Mesh(g,mat);mesh.position.set(x,y,z);mesh.userData.objectId=tag||'';exhibit.add(mesh);exhibitMeshes.push(mesh);return mesh;}
// Position from register is lower SW corner. Browser uses world x, height z, world z=-plan y.
function part(id,x,y,z,w,d,h,mat){return itemMesh(new THREE.BoxGeometry(w,h,d),mat,x+w/2,z+h/2,-y-d/2,id)}
function cyl(id,x,y,z,rTop,rBottom,h,mat,seg=20){return itemMesh(new THREE.CylinderGeometry(rTop,rBottom,h,seg),mat,x,z+h/2,-y,id)}
function sphere(id,x,y,z,rx,ry,rz,mat){let p=itemMesh(new THREE.SphereGeometry(1,18,12),mat,x,z,-y,id);p.scale.set(rx,ry,rz);return p}
function board(id,x,y,z,w,d,t,mat){return part(id,x,y,z,w,d,t,mat)}
// Decorative floor is raised 1cm and kept within actual room bounds; doesn't affect collisions.
// v0.5.0: Boden-Overlay entfernt (doppelte Fläche/Z-Fighting). Walnuss liegt jetzt per UV auf dem GLB-Boden 'Teezimmer EG'.
// Accent is intentionally a sample PANEL, not a claimed geometrically finalized wall mapping.
// v0.5.0: ungenutzte Putzinstanz entfernt; Putz liegt per UV auf allen GLB-Wänden.
const accentMat=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.96,metalness:0,side:THREE.DoubleSide});loadTile('TW-04.png',accentMat,1,1);
// East wall: face towards room (-X), above cabinetry, with visible walnut frame.
const panel=new THREE.Mesh(new THREE.PlaneGeometry(2.05,1.45),accentMat);panel.rotation.y=-Math.PI/2;panel.position.set(15.49,1.63,-2.65);panel.name='P08_TW04_Probenfeld';exhibit.add(panel);
const surround=[[-1.035,0,0.045,1.50],[1.035,0,0.045,1.50],[0,.74,2.12,.045],[0,-.74,2.12,.045]];
// Frame pieces as wall-local geometry aligned to panel's own coordinate frame.
for(const [a,b,w,h] of surround){let strip=new THREE.Mesh(new THREE.BoxGeometry(w,h,.032),mWood);strip.position.set(a,b,.012);panel.add(strip)}
// architectural enamel trim sample, unobtrusive, on east wall.
const skirting=part('MAT-SOCKEL',15.46,1.02,0,.07,2.68,.12,mTeal);
// T01 · Stil- und Formstudie auf autorisierter Stellfläche 1,40 × 1,00 m, Höhe 0,76 m.
// Bildvorlage P08-rundtisch/mond zeigt RUNDEN Tisch; Originalregister weist 1,40×1,00 m aus.
// Für den Test: weiche ovale Tischplatte innerhalb bestehender Footprint; keine Positionsänderung.
const tableCenter={x:12.20,z:-2.50};
const carvedWood=new THREE.MeshStandardMaterial({color:'#75401f',roughness:.76,metalness:.02});
const tableEdge=new THREE.MeshStandardMaterial({color:'#4d2819',roughness:.72,metalness:.02});
const warmWood=new THREE.MeshStandardMaterial({color:'#a36537',roughness:.77});
const runnerBlue=new THREE.MeshStandardMaterial({color:'#173b55',roughness:.95,side:THREE.DoubleSide});
const darkInk=new THREE.MeshStandardMaterial({color:'#102f45',roughness:.86});
function tableMesh(geometry,material,x,y,z,tag='T01'){
 const mesh=itemMesh(geometry,material,x,y,z,tag);mesh.castShadow=false;mesh.receiveShadow=true;return mesh;
}
// Rounded, elliptical top, edge moulding and apron; the meshes are genuine 3D volumes.
const top=tableMesh(new THREE.CylinderGeometry(.49,.49,.056,56),carvedWood,tableCenter.x,.73,tableCenter.z);
top.scale.x=1.39;
const edge=tableMesh(new THREE.TorusGeometry(.49,.024,8,64),tableEdge,tableCenter.x,.749,tableCenter.z);
edge.rotation.x=Math.PI/2;edge.scale.x=1.39;
const apron=tableMesh(new THREE.CylinderGeometry(.42,.44,.12,48),tableEdge,tableCenter.x,.645,tableCenter.z);
apron.scale.x=1.38;
// 4 lathed, carved table legs: slender compared with earlier block supports.
const legProfile=[[.0,.068],[.07,.07],[.12,.045],[.23,.054],[.30,.044],[.42,.062],[.53,.07],[.62,.057]];
const legPts=legProfile.map(([height,r])=>new THREE.Vector2(r,height));
for(const xx of [-.46,.46])for(const zz of [-.31,.31]){
 const leg=tableMesh(new THREE.LatheGeometry(legPts,14),carvedWood,tableCenter.x+xx,0,tableCenter.z+zz);
 const shoe=tableMesh(new THREE.SphereGeometry(.077,12,8),tableEdge,tableCenter.x+xx,.057,tableCenter.z+zz);
 shoe.scale.set(1.15,.58,1.15);
}
// Narrow midnight-blue embroidered table runner aligned with the room's depth.
const runner=tableMesh(new THREE.BoxGeometry(.275,.008,.94),runnerBlue,tableCenter.x,.766,tableCenter.z);
const lineMat=new THREE.MeshStandardMaterial({color:'#c3a36a',metalness:.14,roughness:.7});
for(const xx of [-.108,.108]){
 const line=tableMesh(new THREE.BoxGeometry(.004,.002,.92),lineMat,tableCenter.x+xx,.772,tableCenter.z);
}
// Separate wooden dish-like tray under future teapot, preserving space for cards.
const dish=tableMesh(new THREE.CylinderGeometry(.107,.101,.018,26),warmWood,12.46,.778,-2.68,'T01');
const dishLip=tableMesh(new THREE.TorusGeometry(.099,.009,8,28),mBrass,12.46,.789,-2.68,'T01');dishLip.rotation.x=Math.PI/2;
// P1 v0.4.2 · All furniture retains registered footprint and position.
// These are recognizable modeling studies, NOT approved master reconstructions.
const mWalnut=new THREE.MeshStandardMaterial({color:'#744b32',roughness:.66});
const mWalnutTrim=new THREE.MeshStandardMaterial({color:'#533323',roughness:.62});
const mCord=new THREE.MeshStandardMaterial({color:'#326475',roughness:.93});
const mCordLight=new THREE.MeshStandardMaterial({color:'#467988',roughness:.94});
const mLinen=new THREE.MeshStandardMaterial({color:'#c9a99c',roughness:.97});
const mGlass=new THREE.MeshPhysicalMaterial({color:'#8cc5c2',transparent:true,opacity:.27,roughness:.24,metalness:0,depthWrite:false,side:THREE.DoubleSide});
const mDarkInterior=new THREE.MeshStandardMaterial({color:'#3b3028',roughness:.88});
const mPottery=new THREE.MeshStandardMaterial({color:'#c9ad86',roughness:.59});
function ellip(id,cx,cy,cz,rx,ry,rz,mat,rot=0){const m=itemMesh(new THREE.SphereGeometry(1,20,12),mat,cx,cy,cz,id);m.scale.set(rx,ry,rz);m.rotation.y=rot;return m}
function spindle(id,x,y,z,r0,r1,h,mat){return itemMesh(new THREE.CylinderGeometry(r0,r1,h,12),mat,x,z+h/2,-y,id)}
function post(id,cx,cy,cz,w,h,d,mat){return itemMesh(new THREE.BoxGeometry(w,h,d),mat,cx,cy,cz,id)}
function rail(id,from,to,r,mat){const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to);const v=b.clone().sub(a);const mesh=itemMesh(new THREE.CylinderGeometry(r,r,v.length(),10),mat,...a.clone().add(b).multiplyScalar(.5).toArray(),id);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return mesh}
// T02, 2.10 × .65 m: open wooden bench frame, tapered feet, upholstered seat and softly curved back.
for(const px of [11.73,13.55])for(const py of [.60,1.03])spindle('T02',px,py,.0,.045,.063,.43,mWalnut);
part('T02',11.71,.57,.38,1.85,.49,.075,mWalnut);
// v0.5.0: P1/P2 übergaben Höhe und Plan-y vertauscht (Kissen schwebten 0,47 m vor der Südwand)
for(let j=0;j<3;j++)ellip('T02',12.04+j*.58,.475,-.81,.293,.085,.265,mCordLight);
for(let j=0;j<3;j++){const pad=ellip('T02',12.04+j*.58,.727,-.73,.295,.225,.087,mCord);pad.rotation.x=-.20;}
post('T02',12.64,.84,-.82,1.82,.05,.065,mWalnutTrim);
for(const px of [11.73,13.55])rail('T02',[px,.42,-.99],[px,.88,-1.08],.027,mWalnut);
// O04 independent small cushion, reference study only.
const cushion=ellip('O04',12.24,.66,-.82,.235,.205,.085,mLinen,.12);cushion.rotation.z=.12;
// T06 independent open-legged musicbox stand (registered at 14.50, 3.00).
part('T06',14.50,3.00,.67,.80,.70,.055,mWalnut);
part('T06',14.55,3.05,.56,.70,.60,.105,mWalnutTrim);
for(const xx of [14.58,15.22])for(const yy of [3.09,3.61])spindle('T06',xx,yy,0,.027,.045,.68,mWalnut);
for(const yy of [3.12,3.61])rail('T06',[14.59,.24,-yy],[15.21,.24,-yy],.016,mWalnutTrim);
// P08 musicbox 0.38x0.38x0.32, referential readable design (non-master)
part('P08',14.68,3.15,.76,.38,.38,.22,mDark);
part('P08',14.70,3.17,.98,.34,.34,.06,mWood);
cyl('P08',14.87,3.34,1.04,.078,.09,.065,mBrass,12);
const dome=sphere('P08',14.87,3.34,1.14,.10,.085,.10,mCeramic);
// O24 · Blue tilted-cup proxy, genuinely three-dimensional (not final object master).
const cup=cyl('O24',12.4515,2.4415,.78,.042,.031,.093,mCeramic,32);cup.rotation.z=.11;
const rim=itemMesh(new THREE.TorusGeometry(.041,.006,8,28),mBrass,12.4515,.879,-2.4415,'O24');rim.rotation.x=Math.PI/2;rim.rotation.y=.10;
const handle=itemMesh(new THREE.TorusGeometry(.024,.006,8,20,Math.PI*1.7),mCeramic,12.503,.824,-2.442,'O24');handle.rotation.y=Math.PI/2;
// Individual 3D cards with rounded corners, white edges and an original neutral star pattern.
// No historic oracle illustrations are represented as final card artwork.
function cardTexture(face){
 const c=document.createElement('canvas');c.width=256;c.height=384;const ctx=c.getContext('2d');
 ctx.fillStyle=face?'#efe1c6':'#123d54';ctx.fillRect(0,0,256,384);
 ctx.strokeStyle='#c7a771';ctx.lineWidth=8;ctx.strokeRect(15,15,226,354);
 ctx.strokeStyle=face?'#41717b':'#a78c57';ctx.lineWidth=3;ctx.strokeRect(28,28,200,328);
 ctx.translate(128,190);const rays=face?10:12;
 for(let i=0;i<rays;i++){ctx.save();ctx.rotate((i/rays)*Math.PI*2);ctx.beginPath();ctx.moveTo(0,-72);ctx.lineTo(8,-14);ctx.lineTo(0,-28);ctx.lineTo(-8,-14);ctx.closePath();ctx.fillStyle=face?'#2d7485':'#d2ad6b';ctx.fill();ctx.restore();}
 ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fillStyle=face?'#d4b174':'#e5c989';ctx.fill();
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}
const cardBack=new THREE.MeshStandardMaterial({map:cardTexture(false),roughness:.86});
const cardFront=new THREE.MeshStandardMaterial({map:cardTexture(true),roughness:.87});
const edgePaper=new THREE.MeshStandardMaterial({color:'#e8d9bb',roughness:.91});
function card3D(x,z,y,angle,face=false){
 const mesh=tableMesh(new THREE.BoxGeometry(.19,.006,.284),[
 edgePaper,edgePaper,face?cardFront:cardBack,edgePaper,edgePaper,edgePaper
 ],x,y,z,'CARDS');mesh.rotation.y=angle;
 return mesh;
}
// Deck on the tabletop (4 thin paper solids); two face-up cards to compare legibility.
for(let i=0;i<5;i++)card3D(11.95,-2.67,.775+i*.005,-.08,false);
card3D(12.20,-2.31,.778,.12,true);
card3D(12.40,-2.31,.781,-.16,true);
// T03 · Chair 0.60 × 0.55 × 0.90m: four legs, upholstered seating, open slatted back.
for(const px of [11.89,12.29])for(const py of [3.22,3.62])spindle('T03',px,py,0,.028,.042,.46,mWalnut);
part('T03',11.86,3.21,.43,.48,.47,.065,mWalnut);
ellip('T03',12.10,.495,-3.455,.236,.065,.221,mCordLight);
for(const px of [11.87,12.33])rail('T03',[px,.43,-3.62],[px,.91,-3.67],.029,mWalnut);
for(let i=0;i<3;i++)rail('T03',[11.95+i*.14,.54,-3.675],[11.95+i*.14,.85,-3.675],.011,mWalnutTrim);
post('T03',12.10,.91,-3.67,.49,.055,.062,mWalnut);
// T04 · 0.45 × 1.00 × 1.80m crockery cabinet. Open legged silhouette, visible shelves/glass doors.
for(const py of [.60,1.37])for(const px of [9.81,10.13])spindle('T04',px,py,0,.033,.046,.17,mWalnut);
part('T04',9.78,.55,.18,.40,.91,.065,mWalnutTrim);
part('T04',9.78,.55,1.73,.40,.91,.07,mWalnut);
part('T04',9.78,.55,.22,.055,.91,1.48,mWalnut);
part('T04',10.13,.55,.22,.055,.91,1.48,mWalnut);
part('T04',9.83,.55,.22,.30,.055,1.48,mWalnutTrim);
part('T04',9.83,1.405,.22,.30,.055,1.48,mWalnutTrim);
for(const level of [.63,1.07,1.46])part('T04',9.84,.61,level,.29,.80,.028,mWalnut);
// Display porcelain on inner shelves, behind the translucent doors.
for(const sy of [.78,1.17])for(const level of [.67,1.10]){
 const bowl=cyl('T04',9.99,sy,level,.063,.045,.058,mPottery,24);
 const lip=itemMesh(new THREE.TorusGeometry(.062,.007,8,24),mBrass,9.99,level+.058,-sy,'T04');lip.rotation.x=Math.PI/2;
}
for(const dy of [.56,1.01]){
 part('T04',10.19,dy,.77,.025,.43,.91,mGlass);
 for(const sy of [dy+.015,dy+.398])part('T04',10.205,sy,.78,.018,.017,.90,mWalnutTrim);
 part('T04',10.205,dy,.80,.018,.43,.028,mWalnutTrim);
 part('T04',10.205,dy,1.63,.018,.43,.028,mWalnutTrim);
 const knob=sphere('T04',10.235,dy+.39,1.21,.013,.015,.015,mBrass);
}
// T05 reserved stove is intentionally NOT displayed pending a specific spatial approval.
// T07 · 0.80 × 0.80 × 1.00m reading chair, legs, rolled arms, generous cushioned back.
for(const px of [14.61,15.20])for(const py of [2.01,2.57])spindle('T07',px,py,0,.035,.047,.23,mWalnut);
part('T07',14.58,1.98,.22,.64,.64,.12,mWalnut);
ellip('T07',14.90,.37,-2.30,.315,.125,.30,mCordLight);
const back=ellip('T07',14.90,.67,-2.59,.35,.32,.12,mCord);back.rotation.x=.16;
for(const px of [14.57,15.23]){const arm=ellip('T07',px,.51,-2.30,.085,.15,.28,mCord);arm.rotation.z=.03;}
const piping=new THREE.MeshStandardMaterial({color:'#a9b2aa',roughness:.95});
for(const px of [14.57,15.23])post('T07',px,.38,-2.31,.032,.11,.41,mWalnutTrim);
// Comfort test lighting: stable, local, no autoplay/animation.
// v0.5.0: P2-Testlicht hing 0,40 m unter der Decke (überstrahlter Fleck). Jetzt Pendelhöhe 2,05 m über Tischmitte, weicher.
const warm=new THREE.PointLight(0xffd5a6,5,6.5,2);warm.position.set(12.2,2.05,-2.5);exhibit.add(warm);
exhibit.traverse(o=>{if(o.isMesh)o.raycast=()=>{};});
function removeTagged(ids){let n=0;for(const m of [...exhibitMeshes]){if(ids.includes(m.userData.objectId)){m.parent&&m.parent.remove(m);m.geometry.dispose();exhibitMeshes.splice(exhibitMeshes.indexOf(m),1);n++;}}return n;}
return {group:exhibit,meshes:exhibitMeshes,materialTests:[panel,skirting],removeTagged};
}
