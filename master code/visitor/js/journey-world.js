import * as THREE from '../../assets/vendor/three.module.js';
import {createOrangeBuilding} from './orange-building.js';
import {mountOrange} from './orange-exploration.js';

/* Reference-inspired building dimensions are illustrative, not a survey. */
export function startWorld(root) {
 const canvas=root.querySelector('#journeyCanvas');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<750?1:1.25));
 renderer.shadowMap.enabled=innerWidth>=750;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b9d6e5');scene.fog=new THREE.Fog('#cfdbd6',65,210);
 const camera=new THREE.PerspectiveCamera(58,1,.1,400);
 scene.add(new THREE.HemisphereLight('#e1efff','#b4a17b',2.5));
 const sun=new THREE.DirectionalLight('#ffdeb2',3.1);sun.position.set(-40,65,30);sun.castShadow=true;
 sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-50;sun.shadow.camera.right=50;sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;sun.shadow.camera.far=160;sun.shadow.bias=-.001;scene.add(sun);scene.add(sun.target);
 const mat=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...opts});
 const stone=mat('#bdb6a2'),concrete=mat('#d4d1c2'),steel=mat('#3c5556',{metalness:.55,roughness:.4}),glass=mat('#426577',{metalness:.55,roughness:.16}),orange=mat('#ff7800');
 const box=(w,h,d,x,y,z,m,parent=scene)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 function noiseTexture(base,repeat=1){const c=document.createElement('canvas');c.width=c.height=128;const cx=c.getContext('2d');const data=cx.createImageData(128,128);let seed=19;
 for(let i=0;i<data.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const n=(seed/4294967296-.5)*24;data.data[i]=base[0]+n;data.data[i+1]=base[1]+n;data.data[i+2]=base[2]+n;data.data[i+3]=255;}cx.putImageData(data,0,0);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);return t;}
 const grass=mat('#a9b18a',{map:noiseTexture([137,149,106],70)}),asphalt=mat('#98938a',{map:noiseTexture([100,101,98],1)});
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,650),grass);ground.rotation.x=-Math.PI/2;ground.position.z=-160;ground.receiveShadow=true;scene.add(ground);
 const clamp=n=>Math.max(0,Math.min(1,n));
 const xAt=d=>12*Math.sin(d*.022)*Math.sin(Math.PI*clamp(d/275));
 function strip(left,right,y,m,start=0,end=343){const vertices=[],uv=[];
 for(let d=start;d<end;d+=1){const next=Math.min(d+1,end),x=xAt(d),nx=xAt(next);vertices.push(x+left,y,-d,x+right,y,-d,nx+left,y,-next,x+right,y,-d,nx+right,y,-next,nx+left,y,-next);uv.push(0,d/6,1,d/6,0,next/6,1,d/6,1,next/6,0,next/6);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();const o=new THREE.Mesh(g,m);o.receiveShadow=true;scene.add(o);return o;}
 asphalt.side=THREE.DoubleSide;strip(-3.5,3.5,.025,asphalt);strip(-5.2,-3.5,.035,concrete);strip(3.5,5.2,.035,concrete);
 const edge=mat('#f3ead4');edge.side=THREE.DoubleSide;strip(-3.25,-3.17,.045,edge);strip(3.17,3.25,.045,edge);
 for(let d=0;d<336;d+=7)strip(-.055,.055,.05,edge,d,d+2.8);
 for(let d=-8;d<64;d+=7){const x=xAt(Math.max(0,d));
 for(const side of [-1,1]){box(.32,7,.45,x+side*5,3.5,-d,steel);box(.2,.25,7,x+side*4.8,1.05,-d-3.5,steel);box(.2,.25,7,x+side*4.8,1.8,-d-3.5,steel);box(.6,.2,7,x+side*5,.18,-d-3.5,concrete);const diagonal=box(.18,7.7,.18,x+side*5,3.5,-d-3.5,steel);diagonal.rotation.x=.75;}
 box(10.5,.3,.45,x,7,-d,steel);box(10.5,.12,1,x,6.8,-d,steel);
 }
 const trunk=mat('#76624a'),leaf=mat('#657b46'),leafLight=mat('#8c9955');
 const sphere=new THREE.SphereGeometry(1,10,7);
 function tree(x,z,size=1){const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);box(.25,3,.25,0,1.5,0,trunk,group);
 for(let i=0;i<5;i++){const crown=new THREE.Mesh(sphere,i%3?leaf:leafLight);const angle=i*2.4,r=i%3*.5;crown.position.set(Math.sin(angle)*r,3.2+(i%4)*.43,Math.cos(angle)*r);crown.scale.set(.72*size,(.75+i%2*.2)*size,.7*size);crown.castShadow=i===0;group.add(crown);}}
 for(let d=70;d<350;d+=12){for(const side of [-1,1]){tree(xAt(d)+side*(8+(d%4)),-d,.9+(d%3)*.15);}}
 for(let d=90;d<315;d+=26){for(const side of [-1,1]){const x=xAt(d)+side*5.6;box(.12,5,.12,x,2.5,-d,steel);box(.8,.12,.28,x-side*.25,5,-d,steel);const lamp=new THREE.Mesh(new THREE.BoxGeometry(.4,.05,.2),mat('#ffe9b8',{emissive:'#ffcc77',emissiveIntensity:.8}));lamp.position.set(x-side*.25,4.9,-d);scene.add(lamp);}}
 // Neighborhood massing helps the route feel embedded in an actual place.
 for(let i=0;i<6;i++){const d=95+i*32;for(const side of [-1,1]){const x=xAt(d)+side*(52+i%3*7),h=5+i%4*2;box(9,h,9,x,h/2,-d,stone);for(let row=0;row<Math.floor(h/3);row++)for(let col=0;col<3;col++)box(1.1,1.4,.08,x-3+col*3,1.8+row*2.7,-d+4.55,glass);}}
 const orangeModel=createOrangeBuilding(scene);
 const building=orangeModel.group;
 // Four real mesh buildings. AI images are supporting exhibit boards, not flat replacements.
 const showcase=[];const limestone=mat('#d7c9ad'),bronze=mat('#9a8664',{metalness:.4,roughness:.45});
 const glazingCanvas=document.createElement('canvas');glazingCanvas.width=128;glazingCanvas.height=256;const gl=glazingCanvas.getContext('2d'),gradient=gl.createLinearGradient(0,0,128,256);gradient.addColorStop(0,'#8eb6c1');gradient.addColorStop(.36,'#426f82');gradient.addColorStop(.48,'#b0c4c8');gradient.addColorStop(.5,'#537e83');gradient.addColorStop(1,'#173e4c');gl.fillStyle=gradient;gl.fillRect(0,0,128,256);gl.fillStyle='#eff9ff30';gl.fillRect(8,0,12,256);gl.fillRect(98,0,4,256);const glazingTexture=new THREE.CanvasTexture(glazingCanvas);glazingTexture.colorSpace=THREE.SRGBColorSpace;
 const tint=mat('#d9e4e3',{map:glazingTexture,metalness:.18,roughness:.35});
 const loader=new THREE.TextureLoader();
 function cylinder(radius,height,x,y,z,m,parent){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,20),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function signTexture(stop){const c=document.createElement('canvas');c.width=1024;c.height=128;const cx=c.getContext('2d');cx.fillStyle='#123e38';cx.fillRect(0,0,1024,128);cx.fillStyle='#eef9e2';const lang=(document.documentElement.lang==='ar'||document.documentElement.dir==='rtl')?'ar':'en';const name=stop.name[lang];cx.direction=lang==='ar'?'rtl':'ltr';cx.textAlign='center';cx.textBaseline='middle';cx.font=`600 ${name.length>38?30:42}px Arial`;cx.fillText(name,512,65,970);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
 for(const [index,stop] of (window.WusoolShowcaseStops||[]).entries()) {
   const g=new THREE.Group();g.name=stop.key;g.position.set(xAt(stop.distance)+stop.side*20,0,-stop.distance);g.rotation.y=-stop.side*Math.PI/2;scene.add(g);
   const height=[18,15,14,17][index];
   // Low terraces and continuous step-free forecourt.
   box(27,.12,22,0,.06,1,concrete,g);box(5,.07,4,0,.055,14,concrete,g);
   if(index===3){
     box(8,height,12,-7,height/2,-1,limestone,g);box(8,height+3,12,7,(height+3)/2,-1,limestone,g);
     box(7,3,7,0,10,-1,tint,g);box(24,.3,4,0,3.4,7,bronze,g);
   } else {
     box(23,height,13,0,height/2,-1,limestone,g);
     box(index===1?7:5,height-.8,13.16,0,(height-.8)/2+.2,-.95,tint,g);
     box(10,.25,4,0,3.7,7,bronze,g);
   }
   for(const wing of [-1,1])for(let floor=0;floor<Math.floor(height/3);floor++)for(let col=0;col<3;col++) {
     const x=wing*7-2.6+col*2.6,y=2+floor*3;
     box(1.65,2,.09,x,y,5.6,tint,g);
     box(.16,2.2,.12,x-.95,y,5.73,bronze,g);
   }
   if(index===0)for(let x=-11;x<=11;x+=2.75)box(.34,height+.3,.8,x,height/2,5.75,limestone,g);
   if(index===1){
     cylinder(3.2,14,0,7,5,tint,g);
     for(let y=3;y<15;y+=3){const ring=new THREE.Mesh(new THREE.TorusGeometry(3.22,.07,6,28),bronze);ring.rotation.x=Math.PI/2;ring.position.set(0,y,5);g.add(ring);}
     box(11,.3,5,0,3.4,8,limestone,g);
   }
   if(index===2)for(let x=-9;x<=9;x+=3){box(.7,12,1.2,x,6,6.3,limestone,g);box(3.1,.65,1.4,x,12.3,6.3,limestone,g);}
   box(4,2.9,.14,0,1.6,5.65,glass,g);box(.1,2.9,.2,0,1.6,5.8,bronze,g);
   for(const x of [-9,9]){box(3,.65,2.5,x,.325,10,limestone,g);cylinder(.85,.7,x,.9,10,leaf,g);}
   const signage=new THREE.Mesh(new THREE.PlaneGeometry(14,1.75),new THREE.MeshBasicMaterial({map:signTexture(stop)}));signage.position.set(0,height+1.5,5.6);g.add(signage);
   for(const side of [-1,1]){box(.08,1.5,7,side*3,.75,11,steel,g);box(.08,.08,7,side*3,1.5,11,steel,g);}
   // A framed roadside architectural visual, loaded on approach.
   const board=new THREE.Mesh(new THREE.PlaneGeometry(4.8,3.2),mat('#c5dacf'));board.position.set(-stop.side*8,2.3,10.6);g.add(board);
   box(5,.12,.2,-stop.side*8,.65,10.5,bronze,g);box(.12,2,.12,-stop.side*8,1,10.5,bronze,g);
   tree(g.position.x+stop.side*15,-stop.distance+10,1.6);
   tree(g.position.x-stop.side*12,-stop.distance-5,1.3);
   showcase.push({stop,group:g,signage,board,loaded:false,height});
 }

 // Batch immutable environment geometry by shared material. Animated camera only.
 // This keeps mobile draw calls bounded without flattening the 3D scene.
 scene.updateMatrixWorld(true);
 const exclusions=new Set(showcase.flatMap(item=>[item.signage,item.board]));const batches=new Map();
 const underAcademy=mesh=>{for(let parent=mesh;parent;parent=parent.parent)if(parent===building)return true;return false;};
 const mergeCandidates=[];scene.traverse(mesh=>{if(mesh.isMesh&&!exclusions.has(mesh)&&!underAcademy(mesh)&&!mesh.material.isMeshBasicMaterial)mergeCandidates.push(mesh);});
 for(const mesh of mergeCandidates){let entry=batches.get(mesh.material);if(!entry){entry={position:[],normal:[],uv:[],meshes:[]};batches.set(mesh.material,entry);}const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geometry.applyMatrix4(mesh.matrixWorld);for(const key of ['position','normal','uv']){const attribute=geometry.getAttribute(key);if(attribute)for(const value of attribute.array)entry[key].push(value);}entry.meshes.push(mesh);geometry.dispose();}
 for(const [material,entry] of batches){if(entry.meshes.length<2)continue;const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(entry.position,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(entry.normal,3));if(entry.uv.length===entry.position.length/3*2)geometry.setAttribute('uv',new THREE.Float32BufferAttribute(entry.uv,2));geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);for(const old of entry.meshes){old.removeFromParent();old.geometry.dispose();}}

 // Eight roadside communities, each placed at its own Home section's arrival.
 const peopleGroups=[];
 const skinTones=['#bf8765','#e0b491','#965f46'];
 const clothes=['#267e7d','#d2ae79','#3b5268','#8e796c'];
 function person(parent,x,z,index){
   const figure=new THREE.Group();figure.position.set(x,0,z);figure.rotation.y=(index%2?-.3:.25);parent.add(figure);
   const skin=mat(skinTones[index%3]),shirt=mat(clothes[index%4]),pants=mat('#344854'),hair=mat(index%2?'#392c25':'#232b2d');
   const limb=(radius,length,px,py,pz,m,angle=0)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*.88,length,10),m);mesh.position.set(px,py,pz);mesh.rotation.z=angle;mesh.castShadow=true;figure.add(mesh);return mesh;};
   const h=1+(index%3)*.035;figure.scale.setScalar(h);
   limb(.085,.72,-.12,.43,0,pants,.035);limb(.085,.72,.12,.43,0,pants,-.035);
   box(.17,.09,.29,-.12,.065,.055,hair,figure);box(.17,.09,.29,.12,.065,.055,hair,figure);
   const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.21,.35,5,12),shirt);torso.position.y=1.04;torso.scale.z=.65;torso.castShadow=true;figure.add(torso);
   limb(.072,.36,-.28,1.04,0,shirt,-.15);limb(.062,.28,-.31,.75,.02,skin,-.06);
   limb(.072,.33,.27,1.07,0,shirt,.25);limb(.06,.28,.29,.85,.075,skin,-.6);
   limb(.065,.14,0,1.36,0,skin);
   const head=new THREE.Mesh(new THREE.SphereGeometry(.135,14,10),skin);head.position.set(0,1.54,0);head.scale.set(1,1.25,.92);head.castShadow=true;figure.add(head);
   const cap=new THREE.Mesh(new THREE.SphereGeometry(.139,14,10,0,Math.PI*2,0,Math.PI*.55),hair);cap.position.set(0,1.59,-.008);figure.add(cap);
 }
 for(let i=0;i<8;i++){
   const group=new THREE.Group();scene.add(group);
   for(let j=0;j<3+(i%2);j++)person(group,(j-1)*.65,(j%2)*.5,i+j);
   const marker=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,.025,32),mat('#dce9d6'));marker.position.y=.04;marker.receiveShadow=true;group.add(marker);
   group.visible=false;peopleGroups.push(group);
 }
 const communityTexture=new THREE.TextureLoader().load('../../assets/images/road-community.png',texture=>{
   texture.colorSpace=THREE.SRGBColorSpace;
   for(const group of peopleGroups){
     group.children.filter(child=>child.isGroup).forEach(figure=>figure.visible=false);
     const people=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.08,depthWrite:false}));
     people.center.set(.5,0);people.position.y=.06;people.scale.set(2.1*texture.image.width/texture.image.height,2.1,1);group.add(people);
   }
   requestDraw();
 });
 new MutationObserver(()=>{for(const item of showcase){item.signage.material.map.dispose();item.signage.material.map=signTexture(item.stop);}requestDraw();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
 let experience=null;
 let streetState=null;
 let p=0,bridgeEnd=.2,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,animation=0,visible=true;
 const orangeLook=new THREE.Vector3();
 const current=new THREE.Vector3(),desired=new THREE.Vector3(),look=new THREE.Vector3();
 const walkDistance=value=>value<bridgeEnd?value/bridgeEnd*80:value<.93?80+(value-bridgeEnd)/(.93-bridgeEnd)*179:259+(value-.93)/.07*9;
 function position(){const s=streetState;if(s?.distance!=null){const d=s.distance,focus=s.focus||0,arrival=s.key==='orange';desired.set(arrival?0:xAt(d)-(s.side||0)*focus*15,arrival?2.1:2.1+focus*5,-d+(arrival?0:focus*10));look.set(xAt(d+16),2.4,-d-18);if(s.stopIndex>=0){const item=showcase[s.stopIndex];look.lerp(new THREE.Vector3(item.group.position.x-item.stop.side*6,item.height*.5,-item.stop.distance),focus*.85);}if(arrival)look.set(0,5.3,-349);return;}
 const d=walkDistance(p),arrival=clamp((p-.76)/.17);desired.set(xAt(d)+arrival*5.5,1.75,-d);look.set(xAt(d+12),1.6,-d-12);}
 let previousFrame=0;
 function draw(now){const dt=Math.min(.06,Math.max(.001,(now-previousFrame)/1000));previousFrame=now;const damping=1-Math.exp(-11*dt);animation=0;if(document.hidden||(!visible&&!experience?.active))return;position();
 const interiorPose=experience?.tick(now);
 if(interiorPose){current.lerp(new THREE.Vector3(...interiorPose.position),experience.reduced?1:damping);orangeLook.lerp(new THREE.Vector3(...interiorPose.look),experience.reduced?1:damping);camera.position.copy(current);camera.lookAt(orangeLook);orangeModel.update(now/1000,experience.snapshot(),experience.reduced,interiorPose.position);}else{current.lerp(desired,reduced?1:damping);camera.position.copy(current);camera.lookAt(look);}
 const inside=experience?.active&&experience.nav.progress>.62&&['exterior','entrance'].includes(experience.nav.state)||experience?.active&&['reception','room','corridor'].includes(experience.nav.state);
 renderer.shadowMap.enabled=!inside&&innerWidth>=750;scene.children[0].intensity=inside?1.65:2.5;scene.children[0].groundColor.set(inside?'#b7c1c5':'#b4a17b'); sun.intensity=inside?1.1:3.1;renderer.toneMappingExposure=inside?1:1.15;
 scene.fog.near=interiorPose?90:65; scene.fog.far=interiorPose?240:210;
 sun.position.set(current.x-35,55,current.z+25);sun.target.position.set(current.x,0,current.z-25);renderer.render(scene,camera);
 if((experience?.active&&experience.hasWebGL&&!experience.reduced)||experience?.nav.transition||current.distanceToSquared(desired)>.00005&&!experience?.active)requestDraw();}
 function requestDraw(){if(!animation&&!document.hidden&&(visible||experience?.active))animation=requestAnimationFrame(draw);}
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();requestDraw();}
 root.addEventListener('journey-progress',event=>{streetState=event.detail;for(const item of showcase)if(!item.loaded&&Math.abs((streetState.distance||0)-item.stop.distance)<80){item.loaded=true;loader.load(`../../assets/images/journey/${item.stop.key}.webp`,texture=>{texture.colorSpace=THREE.SRGBColorSpace;item.board.material.dispose();item.board.material=new THREE.MeshBasicMaterial({map:texture});requestDraw();},undefined,()=>{item.board.visible=false;});}p=event.detail.p;reduced=event.detail.reduced;bridgeEnd=Math.max(.01,event.detail.stations?.[0]?.progress||.2);
   for(const station of event.detail.stations||[]){
     const group=peopleGroups[station.index];const d=Math.min(273,walkDistance(station.progress)+32);
     group.position.set(xAt(d)+station.side*5.6,.04,-d);group.rotation.y=station.side<0?-.55:.55;group.visible=!reduced;
   }
   requestDraw();});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();},{threshold:0});observer.observe(root);
 const raycaster=new THREE.Raycaster();let start=null;
 canvas.addEventListener('pointerdown',e=>{start=[e.clientX,e.clientY];});
 canvas.addEventListener('pointerup',e=>{if(experience?.active)return;if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>10||p<.82)return;start=null;const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const dialog=document.getElementById('academyDetails');if(raycaster.intersectObject(building,true).length&&!dialog.open)dialog.showModal();});
 canvas.addEventListener('pointermove',e=>{if(p<.82){canvas.style.cursor='default';return;}const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);canvas.style.cursor=raycaster.intersectObject(building,true).length?'pointer':'default';},{passive:true});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();root.classList.add('journey-fallback');experience?.attach(null);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestDraw();else if(animation){cancelAnimationFrame(animation);animation=0;}});
 addEventListener('resize',resize);addEventListener('pageshow',requestDraw);
 addEventListener('pagehide',()=>{if(animation)cancelAnimationFrame(animation);},{once:true});
 position();current.copy(desired);
 experience=mountOrange(root,{getPose:()=>{orangeLook.copy(look);return {position:current.toArray(),look:look.toArray()};},requestDraw,diagnostics:()=>({solid:orangeModel.solid,render:{...renderer.info.render},camera:camera.position.toArray(),look:orangeLook.toArray(),stats:orangeModel.stats,organizations:showcase.map(i=>({key:i.stop.key,position:i.group.position.toArray()}))})});
 resize();root.classList.add('journey-world-ready');
}



