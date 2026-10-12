import * as THREE from '../../assets/vendor/three.module.js';
import {createOrangeBuilding} from './orange-building.js';
import {mountOrange} from './orange-exploration.js';
import {pbr,architecturalTexture,reflectionEnvironment} from './journey-materials.js';

import {architecturalBox,createTree,foliageMaterial,contactShadow} from './architectural-geometry.js';
import {buildOrganization} from './organization-architecture.js';
import {createLivingCity} from './city-world.js';
import {makeHuman} from './city-models.js';
import {batchCityStatic} from './city-environment.js';
import {pacedStep} from './camera-pacing.mjs';

/* Reference-inspired building dimensions are illustrative, not a survey. */
export function startWorld(root) {
 const canvas=root.querySelector('#journeyCanvas');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<750?1:1.25));
 renderer.shadowMap.enabled=innerWidth>=750;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b9d6e5');scene.fog=new THREE.Fog('#cfdbd6',65,210);
 const camera=new THREE.PerspectiveCamera(58,1,.1,400);
 const ambient=new THREE.HemisphereLight('#e1efff','#b4a17b',2.5);scene.add(ambient);
 const environments={light:reflectionEnvironment(renderer,false),dark:reflectionEnvironment(renderer,true)};
 const glContext=renderer.getContext(),debugRenderer=glContext.getExtension('WEBGL_debug_renderer_info'),software=debugRenderer&&/swiftshader|llvmpipe|software/i.test(glContext.getParameter(debugRenderer.UNMASKED_RENDERER_WEBGL));
 let resolutionScale=software?.7:1,slowFrames=0,fastFrames=0,reflectionKey='',reflectionStatus='sky',performanceSamples=[];

 const nightLights=[],nightMaterials=[];let night=false;
 const sun=new THREE.DirectionalLight('#ffdeb2',3.1);sun.position.set(-40,65,30);sun.castShadow=true;
 sun.shadow.mapSize.set(innerWidth<750?1024:2048,innerWidth<750?1024:2048);sun.shadow.camera.left=-50;sun.shadow.camera.right=50;sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;sun.shadow.camera.far=160;sun.shadow.bias=-.001;scene.add(sun);scene.add(sun.target);
 const mat=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...opts});
 const stone=pbr('stone'),concrete=pbr('paving'),steel=new THREE.MeshStandardMaterial({color:'#465052',metalness:.85,roughness:.32}),glass=new THREE.MeshPhysicalMaterial({color:'#839fa3',roughness:.16,metalness:0,clearcoat:1,envMapIntensity:1.2}),orange=mat('#d66b20');
 const box=(w,h,d,x,y,z,m,parent=scene)=>{const o=new THREE.Mesh(architecturalBox(w,h,d,Math.min(.025,d*.12)),m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;parent.add(o);return o;};
 function noiseTexture(base,repeat=1){const c=document.createElement('canvas');c.width=c.height=128;const cx=c.getContext('2d');const data=cx.createImageData(128,128);let seed=19;
 for(let i=0;i<data.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const n=(seed/4294967296-.5)*24;data.data[i]=base[0]+n;data.data[i+1]=base[1]+n;data.data[i+2]=base[2]+n;data.data[i+3]=255;}cx.putImageData(data,0,0);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);return t;}
 const grass=pbr('grass'),asphalt=pbr('asphalt');grass.map=architecturalTexture('grass',160,200);for(const key of['normalMap','roughnessMap','aoMap'])grass[key].repeat.set(160,200);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(334,650),grass);ground.rotation.x=-Math.PI/2;ground.position.set(-83,0,-160);ground.receiveShadow=true;scene.add(ground);
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
 const trunk=pbr('bark'),leaf=mat('#58644b'),leafLight=mat('#76836b'),foliage=foliageMaterial();
 const vegetation=[];function tree(x,z,size=1){const t=createTree(x,z,size,trunk,foliage);scene.add(t);vegetation.push(t);contactShadow(scene,x,.043,z,5*size,5*size,.22);}
 for(let d=70;d<350;d+=12){for(const side of [-1,1]){tree(xAt(d)+side*(8+(d%4)),-d,.9+(d%3)*.15);}}
 for(let d=12;d<343;d+=26){for(const side of [-1,1]){const x=xAt(d)+side*5.6;box(.12,5,.12,x,2.5,-d,steel);box(.8,.12,.28,x-side*.25,5,-d,steel);const lamp=new THREE.Mesh(new THREE.BoxGeometry(.4,.05,.2),mat('#ffe9b8',{emissive:'#ffcc77',emissiveIntensity:0}));lamp.position.set(x-side*.25,4.9,-d);scene.add(lamp);lamp.material.userData.nightPower=1.8;nightMaterials.push(lamp.material);const glow=new THREE.PointLight('#ffd7a0',32,18,2);glow.position.set(x-side*.25,4.65,-d);glow.visible=false;scene.add(glow);nightLights.push(glow);}}
 // Continuous curb, tactile frontage and street furniture; road coordinates stay unchanged.
 const benchWood=pbr('walnut'),curb=mat('#d8d6cb'),bollard=mat('#354546',{metalness:.55,roughness:.38});
 for(let d=0;d<343;d+=2){const x=xAt(d);for(const side of[-1,1])box(.18,.17,1.95,x+side*3.6,.12,-d,curb);}
 for(let d=78;d<333;d+=22){for(const side of[-1,1]){const x=xAt(d)+side*4.8;box(.12,.9,.12,x,.45,-d,bollard);box(.14,.06,.14,x,.75,-d,edge);}}
 for(let d=95;d<330;d+=48){const x=xAt(d)-6.7;for(let k=0;k<5;k++)box(2,.06,.105,x,.55,-d-.26+k*.12,benchWood);for(let k=0;k<4;k++)box(2,.11,.065,x,.69+k*.15,-d-.30,benchWood);for(const offset of[-.8,.8])box(.1,.5,.5,x+offset,.25,-d,steel);}
 const orangeModel=createOrangeBuilding(scene);
 const building=orangeModel.group;
 // Four real mesh buildings. AI images are supporting exhibit boards, not flat replacements.
 const showcase=[],architectureStats=[];const limestone=pbr('stone'),bronze=mat('#76644e',{metalness:.8,roughness:.34});
 const loader=new THREE.TextureLoader();
 function cylinder(radius,height,x,y,z,m,parent){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,20),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function signTexture(stop){const c=document.createElement('canvas');c.width=1024;c.height=128;const cx=c.getContext('2d');cx.fillStyle='#123e38';cx.fillRect(0,0,1024,128);cx.fillStyle='#eef9e2';const lang=(document.documentElement.lang==='ar'||document.documentElement.dir==='rtl')?'ar':'en';const name=stop.name[lang];cx.direction=lang==='ar'?'rtl':'ltr';cx.textAlign='center';cx.textBaseline='middle';cx.font=`600 ${name.length>38?30:42}px Arial`;cx.fillText(name,512,65,970);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
 for(const [index,stop] of (window.WusoolShowcaseStops||[]).entries()) {
   const g=new THREE.Group();g.name=stop.key;g.position.set(xAt(stop.distance)+stop.side*20,0,-stop.distance);g.rotation.y=-stop.side*Math.PI/2;scene.add(g);
   const height=[18,15,14,17][index];
   // Low terraces and continuous step-free forecourt.
   box(27,.12,22,0,.06,1,concrete,g);box(5,.07,4,0,.055,14,concrete,g);
   architectureStats.push(buildOrganization(g,index,height,box,nightMaterials));
   const entranceLight=new THREE.PointLight('#ffd8a3',40,17,2);entranceLight.position.set(0,2.9,8);entranceLight.visible=false;g.add(entranceLight);nightLights.push(entranceLight);

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
 const underLOD=mesh=>{for(let p=mesh;p;p=p.parent)if(p.isLOD)return true;return false;};
 const underAcademy=mesh=>{for(let parent=mesh;parent;parent=parent.parent)if(parent===building)return true;return false;};
 const mergeCandidates=[];scene.traverse(mesh=>{if(mesh.isMesh&&!exclusions.has(mesh)&&!underAcademy(mesh)&&!underLOD(mesh)&&!mesh.isInstancedMesh&&!mesh.material.isMeshBasicMaterial)mergeCandidates.push(mesh);});
 for(const mesh of mergeCandidates){const center=mesh.getWorldPosition(new THREE.Vector3()),batchKey=mesh.material.uuid+':'+Math.floor(center.x/40)+':'+Math.floor(center.z/40);let entry=batches.get(batchKey);if(!entry){entry={material:mesh.material,position:[],normal:[],uv:[],meshes:[]};batches.set(batchKey,entry);}const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geometry.applyMatrix4(mesh.matrixWorld);for(const key of ['position','normal','uv']){const attribute=geometry.getAttribute(key);if(attribute)for(const value of attribute.array)entry[key].push(value);}entry.meshes.push(mesh);geometry.dispose();}
 for(const [key,entry] of batches){const material=entry.material;if(entry.meshes.length<2)continue;const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(entry.position,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(entry.normal,3));if(entry.uv.length===entry.position.length/3*2)geometry.setAttribute('uv',new THREE.Float32BufferAttribute(entry.uv,2));geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);for(const old of entry.meshes){old.removeFromParent();old.geometry.dispose();}}

 // Eight roadside communities, each placed at its own Home section's arrival.
 const peopleGroups=[];
 const skinTones=['#bf8765','#e0b491','#965f46'];
 const clothes=['#267e7d','#d2ae79','#3b5268','#8e796c'];
 function person(parent,x,z,index){const person=makeHuman(index);person.group.position.set(x,0,z);parent.add(person.group);}
 for(let i=0;i<8;i++){
   const group=new THREE.Group();scene.add(group);
   for(let j=0;j<3+(i%2);j++)person(group,(j-1)*.65,(j%2)*.5,i+j);
   const marker=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,.025,32),mat('#dce9d6'));marker.position.y=.04;marker.receiveShadow=true;group.add(marker);
   batchCityStatic(group);group.visible=false;peopleGroups.push(group);
 }
 new MutationObserver(()=>{for(const item of showcase){item.signage.material.map.dispose();item.signage.material.map=signTexture(item.stop);}requestDraw();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
 const city=createLivingCity({scene,camera,root,xAt,nightMaterials,requestDraw,software});nightLights.push(...city.lights);city.environment.adoptVegetation(vegetation,foliage);
 let experience=null;
 let streetState=null;
 let p=0,bridgeEnd=.2,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,animation=0,visible=true;
 const orangeLook=new THREE.Vector3();
 const current=new THREE.Vector3(),desired=new THREE.Vector3(),look=new THREE.Vector3(),streetLook=new THREE.Vector3();
 const walkDistance=value=>value<bridgeEnd?value/bridgeEnd*80:value<.93?80+(value-bridgeEnd)/(.93-bridgeEnd)*179:259+(value-.93)/.07*9;
 function position(){const s=streetState;if(s?.distance!=null){const d=s.distance,focus=s.focus||0,arrival=s.key==='orange';desired.set(arrival?0:xAt(d)-(s.side||0)*focus*15,arrival?2.1:2.1+focus*5,-d+(arrival?0:focus*10));look.set(xAt(d+16),2.4,-d-18);if(s.stopIndex>=0){const item=showcase[s.stopIndex];look.lerp(new THREE.Vector3(item.group.position.x-item.stop.side*6,item.height*.5,-item.stop.distance),focus*.85);}if(arrival)look.set(0,5.3,-349);return;}
 const d=walkDistance(p),arrival=clamp((p-.76)/.17);desired.set(xAt(d)+arrival*5.5,1.75,-d);look.set(xAt(d+12),1.6,-d-12);}
 let previousFrame=performance.now(),lastQuality=city.state.quality;
 function draw(now){const elapsed=Math.max(.001,(now-previousFrame)/1000),dt=Math.min(.12,elapsed);previousFrame=now;const damping=1-Math.exp(-11*dt);animation=0;if(document.hidden||(!visible&&!experience?.active))return;position();
 const interiorPose=experience?.tick(now);
 if(interiorPose){current.lerp(new THREE.Vector3(...interiorPose.position),experience.reduced?1:damping);orangeLook.lerp(new THREE.Vector3(...interiorPose.look),experience.reduced?1:damping);camera.position.copy(current);camera.lookAt(orangeLook);orangeModel.update(now/1000,experience.snapshot(),experience.reduced,interiorPose.position,night);}else{if(!reduced&&(streetState?.distance??0)>=262){current.fromArray(pacedStep(current.toArray(),desired.toArray(),Math.min(.1,elapsed)));}else current.lerp(desired,reduced?1:damping);if(!reduced&&(streetState?.distance??0)>=262)streetLook.lerp(look,1-Math.exp(-5*dt));else streetLook.copy(look);camera.position.copy(current);const direction=streetLook.clone().sub(current),length=direction.length(),yaw=Math.atan2(direction.x,-direction.z)+streetYaw,pitch=Math.atan2(direction.y,Math.hypot(direction.x,direction.z))+streetPitch;camera.lookAt(current.clone().add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*length,Math.sin(pitch)*length,-Math.cos(yaw)*Math.cos(pitch)*length)));}
 const inside=experience?.active&&experience.nav.progress>.62&&['exterior','entrance'].includes(experience.nav.state)||experience?.active&&['reception','room','corridor'].includes(experience.nav.state);
 if(lastQuality!==city.state.quality){lastQuality=city.state.quality;resize();}
 city.update(Math.min(.5,elapsed),{night,inside:!!inside,reduced:reduced||!!experience?.reduced,visible:visible||!!experience?.active,exploring:!!experience?.active,frameMs:elapsed*1000});
 renderer.shadowMap.enabled=innerWidth>=750&&city.state.quality!=='mobile'&&(!software||city.state.quality==='high');
 ambient.intensity=night?(inside?.32:.21):(inside?.95:.85);ambient.groundColor.set(night?'#1b2431':inside?'#b7c1c5':'#b4a17b');
 sun.intensity=(night?(inside?.03:.15):(inside?1.3:3.4))*city.lightingFactor;sun.color.lerp(new THREE.Color(night?'#aac1e1':city.state.season==='winter'?'#dae6f3':city.state.season==='autumn'?'#ffe8ca':'#fff2de'),1-Math.exp(-dt*2));renderer.toneMappingExposure=night?1.15:inside?1.06:1.0;
 const closest=night&&!inside?[...nightLights].sort((a,b)=>a.getWorldPosition(new THREE.Vector3()).distanceToSquared(current)-b.getWorldPosition(new THREE.Vector3()).distanceToSquared(current)).slice(0,innerWidth<750?3:5):[];
 for(const lamp of nightLights)lamp.visible=closest.includes(lamp);
 orangeModel.setTheme(night);orangeModel.cullActors(current.toArray(),!!experience?.active);orangeModel.manageLights(current.toArray(),!!experience?.active,night);
 grass.color.lerp(new THREE.Color({spring:'#f3ffd9',summer:'#ffffff',autumn:'#ded2b0',winter:'#b9c3c5'}[city.state.season]),1-Math.exp(-dt*1.5));asphalt.roughness=city.state.weather==='rain'?.65:.93;
 scene.fog.color.set(city.fogColor);scene.fog.near=interiorPose?90:night?45:65-city.cloud*24; scene.fog.far=interiorPose?240:night?180:210;
 const sx=Math.round(current.x/4)*4,sz=Math.round(current.z/4)*4;sun.position.set(sx-35,55,sz+25);sun.target.position.set(sx,0,sz-25);
 const key=(inside?experience?.nav.room||experience?.nav.route||'reception':streetState?.key||'approach')+':'+night;
 // Filtered sky reflections stay cached; no six-scene probe stall during scrolling.
 reflectionStatus='cached-environment';
 const started=performance.now();renderer.render(scene,camera);const cost=performance.now()-started;performanceSamples.push(Math.min(elapsed*1000,5000));if(performanceSamples.length>60)performanceSamples.shift();if(cost>28||elapsed>.055){slowFrames++;fastFrames=0;}else if(cost<18&&elapsed<.024){fastFrames++;slowFrames=0;}if(slowFrames>8&&resolutionScale>.5){resolutionScale=Math.max(.5,resolutionScale-.1);slowFrames=0;resize();}else if(fastFrames>240&&resolutionScale<1){resolutionScale=Math.min(1,resolutionScale+.05);fastFrames=0;resize();}
 if(city.moving||(experience?.active&&experience.hasWebGL&&!experience.reduced)||experience?.nav.transition||current.distanceToSquared(desired)>.00005&&!experience?.active)requestDraw();}
 function requestDraw(){if(!animation&&!document.hidden&&(visible||experience?.active))animation=requestAnimationFrame(draw);}
 function applySceneTheme(){
   night=document.documentElement.dataset.wusoolColorMode==='dark';
   scene.background=environments[night?'dark':'light'].sky;reflectionKey='';scene.fog.color.set(night?'#152137':'#cfdbd6');
   scene.environment=environments[night?'dark':'light'].texture;scene.environmentIntensity=night?.35:.8;
   for(const m of nightMaterials)m.emissiveIntensity=night?(m.userData.nightPower??.18):0;
   orangeModel.setTheme(night);const immediate=night?[...nightLights].sort((a,b)=>a.getWorldPosition(new THREE.Vector3()).distanceToSquared(current)-b.getWorldPosition(new THREE.Vector3()).distanceToSquared(current)).slice(0,innerWidth<750?3:5):[];for(const lamp of nightLights)lamp.visible=immediate.includes(lamp);orangeModel.manageLights(current.toArray(),!!experience?.active,night);requestDraw();
 }
 const themeObserver=new MutationObserver(applySceneTheme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-wusool-color-mode']});applySceneTheme();
 function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio,city.state.quality==='mobile'?1:city.state.quality==='balanced'?1.25:1.5)*resolutionScale);const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();requestDraw();}
 root.addEventListener('journey-progress',event=>{streetState=event.detail;for(const item of showcase)if(!item.loaded&&Math.abs((streetState.distance||0)-item.stop.distance)<80){item.loaded=true;loader.load(`../../assets/images/journey/${item.stop.key}.webp`,texture=>{texture.colorSpace=THREE.SRGBColorSpace;item.board.material.dispose();item.board.material=new THREE.MeshBasicMaterial({map:texture});requestDraw();},undefined,()=>{item.board.visible=false;});}p=event.detail.p;reduced=event.detail.reduced;bridgeEnd=Math.max(.01,event.detail.stations?.[0]?.progress||.2);
   for(const station of event.detail.stations||[]){
     const group=peopleGroups[station.index];const d=Math.min(273,walkDistance(station.progress)+32);
     group.position.set(xAt(d)+station.side*5.6,.04,-d);group.rotation.y=station.side<0?-.55:.55;group.visible=!reduced;
   }
   requestDraw();});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>.05;city.controls.hidden=!visible&&!experience?.active;if(visible){previousFrame=performance.now();requestDraw();}else if(!experience?.active)city.pause();},{threshold:.05});observer.observe(root.querySelector('.journey-stage')||root);
 const raycaster=new THREE.Raycaster();let start=null,streetDrag=null,streetYaw=0,streetPitch=0;root.streetView={look:(yaw,pitch=0)=>{streetYaw=Math.atan2(Math.sin(yaw),Math.cos(yaw));streetPitch=Math.max(-.5,Math.min(.5,pitch));requestDraw();},face:(yaw)=>{const d=look.clone().sub(current);streetYaw=Math.atan2(Math.sin(yaw-Math.atan2(d.x,-d.z)),Math.cos(yaw-Math.atan2(d.x,-d.z)));requestDraw();},capture:()=>{renderer.render(scene,camera);return canvas.toDataURL('image/png');},captureView:(position,target)=>{const savedPosition=camera.position.clone(),savedQuaternion=camera.quaternion.clone();camera.position.set(...position);camera.lookAt(new THREE.Vector3(...target));renderer.render(scene,camera);const image=canvas.toDataURL('image/png');camera.position.copy(savedPosition);camera.quaternion.copy(savedQuaternion);requestDraw();return image;}};canvas.tabIndex=0;canvas.setAttribute('aria-label','City view: drag to look, A/D/W/S to look, Home resets view');canvas.addEventListener('keydown',e=>{if(experience?.active)return;if(['a','d','w','s','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')streetYaw=streetPitch=0;else if(e.key==='a'||e.key==='d')streetYaw+=(e.key==='a'?.12:-.12);else streetPitch=Math.max(-.5,Math.min(.5,streetPitch+(e.key==='w'?.08:-.08)));requestDraw();}});
 canvas.addEventListener('pointerdown',e=>{start=[e.clientX,e.clientY];if(!experience?.active&&e.pointerType!=='touch'){streetDrag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);}});
 canvas.addEventListener('pointerup',e=>{streetDrag=null;if(experience?.active)return;if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>10||p<.82)return;start=null;const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const dialog=document.getElementById('academyDetails');if(raycaster.intersectObject(building,true).length&&!dialog.open)dialog.showModal();});
 canvas.addEventListener('pointermove',e=>{if(streetDrag&&!experience?.active){streetYaw=Math.atan2(Math.sin(streetYaw-(e.clientX-streetDrag[0])*.004),Math.cos(streetYaw-(e.clientX-streetDrag[0])*.004));streetPitch=Math.max(-.5,Math.min(.5,streetPitch-(e.clientY-streetDrag[1])*.003));streetDrag=[e.clientX,e.clientY];requestDraw();return;}canvas.style.cursor=p>=.82?'pointer':'default';},{passive:true});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;if(animation){cancelAnimationFrame(animation);animation=0;}city.pause();root.classList.add('journey-fallback');experience?.attach(null);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){previousFrame=performance.now();requestDraw();}else if(animation){cancelAnimationFrame(animation);animation=0;}});
 addEventListener('resize',resize);addEventListener('pageshow',requestDraw);
 addEventListener('pagehide',()=>{if(animation)cancelAnimationFrame(animation);},{once:true});
 position();current.copy(desired);streetLook.copy(look);
 experience=mountOrange(root,{getPose:()=>{const actual=camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(8).add(current);orangeLook.copy(actual);return {position:current.toArray(),look:actual.toArray()};},requestDraw,project:point=>{const v=new THREE.Vector3(...point).project(camera);return {x:(v.x*.5+.5)*innerWidth,y:(-v.y*.5+.5)*innerHeight,visible:v.z<1&&v.z>0&&Math.abs(v.x)<.95&&Math.abs(v.y)<.9};},diagnostics:()=>({city:city.diagnostics(),solid:orangeModel.solid,render:{...renderer.info.render},camera:camera.position.toArray(),look:orangeLook.toArray(),stats:{...orangeModel.stats,architecture:architectureStats,treeLODs:vegetation.length,pbr:true,reflections:software?'analytic-sky-software':reflectionStatus,software:!!software,pixelRatio:renderer.getPixelRatio(),frameIntervalMs:performanceSamples.length?performanceSamples.reduce((a,b)=>a+b,0)/performanceSamples.length:0},theme:night?'dark':'light',streetDistance:streetState?.distance??walkDistance(p),streetTarget:desired.toArray(),lighting:{street:nightLights.filter(l=>l.visible).length,interior:orangeModel.lighting()},organizations:showcase.map(i=>({key:i.stop.key,position:i.group.position.toArray()}))})});
 root.livingCity=city;resize();root.classList.add('journey-world-ready');
}



