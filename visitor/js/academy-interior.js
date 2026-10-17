import * as THREE from '../../assets/vendor/three.module.js';

/* Conceptual Academy: native-scroll choreography only, no business records. */
export function createAcademyInterior(building) {
 const group=new THREE.Group();group.name='academy-interior';building.add(group);
 const materials={};
 const mat=(name,color,options={})=>materials[name]||(materials[name]=new THREE.MeshStandardMaterial({color,roughness:.72,...options}));
 const ivory=mat('ivory','#f0e8d9'),wood=mat('wood','#bb8959'),navy=mat('navy','#183b46'),teal=mat('teal','#1a796e'),metal=mat('metal','#a0afb1',{metalness:.65,roughness:.3}),orange=mat('orange','#ef7c24'),floor=mat('floor','#c9c6bb'),dark=mat('dark','#24343d'),light=mat('light','#fff1d8',{emissive:'#fff1d8',emissiveIntensity:.8});
 const dynamic=new Set();
 function box(w,h,d,x,y,z,m,parent=group){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function cylinder(r,h,x,y,z,m,parent=group){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function label(en,ar,w,h,x,y,z,background='#153f44',parent=group){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(x,y,z);parent.add(mesh);
  const refresh=()=>{const rtl=document.documentElement.lang==='ar';ctx.fillStyle=background;ctx.fillRect(0,0,768,256);ctx.direction=rtl?'rtl':'ltr';ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 48px Arial';ctx.fillText(rtl?ar:en,384,128,730);texture.needsUpdate=true;};refresh();labels.push(refresh);return mesh;
 }
 const labels=[];
 // Actual mesh ramp, not decorative painted steps. Raised landing + adjacent stairs.
 const ramp=new THREE.BufferGeometry();ramp.setAttribute('position',new THREE.Float32BufferAttribute([-1.8,.035,17,1.8,.035,17,-1.8,.55,8,1.8,.035,17,1.8,.55,8,-1.8,.55,8],3));ramp.computeVertexNormals();
 const rampMat=floor.clone();rampMat.side=THREE.DoubleSide;const rampMesh=new THREE.Mesh(ramp,rampMat);rampMesh.receiveShadow=true;group.add(rampMesh);
 box(4,.55,2.2,0,.275,7.2,floor);
 for(let i=0;i<4;i++)box(2.2,(i+1)*.1375,.55,3.05,(i+1)*.06875,9.7-i*.55,floor);
 for(const side of [-1,1]){
  for(let z=8;z<=17;z+=3)cylinder(.04,1.05,side*1.88,1.05/2+.55*(17-z)/9,z,metal);
  const rail=box(.065,.065,9.05,side*1.88,1.33,12.5,metal);rail.rotation.x=Math.atan(.515/9);
 }
 label('STEP-FREE ENTRY','مدخل بدون درجات',2.2,.62,-2.8,1.45,13,'#1a796e');
 // Ground-floor shell stays hollow; a continuous accessible floor leads to class.
 box(7.8,.18,34,0,.46,-10,floor);box(.18,3.8,34,-3.95,2.45,-10,ivory);box(.18,3.8,34,3.95,2.45,-10,ivory);
 box(8,.16,34,0,4.4,-10,ivory);box(8,3.9,.18,0,2.5,-27,ivory);
 for(let z=4;z>=-26;z-=2.4){box(7.7,.007,.025,0,.558,z,metal);box(.045,.012,1.1,-.5,.564,z,orange);}
 for(let z=2;z>=-25;z-=4)box(5,.045,.12,0,4.28,z,light);
 for(const x of [-2.8,2.8])for(let z=4;z>=-24;z-=4)box(.025,.012,3.6,x,.564,z,metal);
 // Sliding glass doors retain a clear central path.
 const glazing=mat('glazing','#aed7df',{transparent:true,opacity:.22,metalness:.1,roughness:.2,depthWrite:false});
 const doors=[];
 for(const side of [-1,1]){const door=new THREE.Group();door.position.set(side*.95,0,6.64);group.add(door);dynamic.add(door);doors.push({door,side});box(1.9,3.15,.08,0,2.13,0,glazing,door);box(.06,3.2,.1,side*.92,2.13,0,metal,door);box(.04,.65,.1,-side*.6,1.8,.08,orange,door);}
 label('ORANGE CODING ACADEMY','أكاديمية أورانج للبرمجة',3.8,.68,0,3.82,6.75,'#cf6419');
 // Reception: warm oak, clear route, and a visible wide elevator to the left.
 box(2,.8,1.1,2.72,.95,1.1,wood);box(2.15,.12,1.24,2.72,1.4,1.1,ivory);box(.7,.42,.08,2.8,1.65,.65,dark);
 label('WELCOME / RECEPTION','أهلًا بك / الاستقبال',2.2,.65,2.55,2.85,-.1);
 box(2.4,3.15,.3,-2.65,2.1,-2.8,metal);box(2.1,2.85,.32,-2.65,1.98,-2.59,navy);
 box(.98,2.7,.08,-3.16,1.97,-2.4,metal);box(.98,2.7,.08,-2.14,1.97,-2.4,metal);box(.045,2.7,.1,-2.65,1.97,-2.33,dark);
 label('↕  LIFT  /  0','↕  مصعد  /  ٠',2.4,.5,-2.65,3.63,-2.35);
 box(.28,.5,.1,-1.19,1.6,-2.32,navy);cylinder(.07,.08,-1.19,1.64,-2.23,light).rotation.x=Math.PI/2;
 label('CLASSROOM →','قاعة التدريب ←',2.6,.5,.5,3.2,-6);
 for(const x of [-3.3,3.3]){cylinder(.32,.5,x,.8,3.7,wood);for(let i=0;i<6;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.3,7,5),teal);leaf.position.set(x+Math.sin(i*2)*.2,1.2+i*.12,3.7+Math.cos(i*2)*.15);leaf.scale.y=1.7;group.add(leaf);}}
 // Open training studio: desks, laptops, books, acoustic wall and whiteboard.
 for(let z=-12;z>=-23;z-=3.6){box(.08,2.2,2.4,-3.82,2.4,z,wood);box(.08,2.2,2.4,3.82,2.4,z,teal);}
 box(5.8,1.9,.12,0,2.5,-26.75,navy);
 label('BUILD. LEARN. TOGETHER.','نتعلم ونبني معًا.',5.45,1.7,0,2.5,-26.65);
 label('ORANGE • LEARNING STUDIO','أورانج • مساحة التعلم',4.8,.55,0,3.9,-26.65,'#cf6419');
 for(let i=0;i<9;i++)box(.035,.035,.02,-2.15+(i%5)*.65,2.05+Math.floor(i/5)*.3,-26.53,light);
 const people=[];
 function person(x,z,index,seated=false,trainer=false){
  const person=new THREE.Group();person.position.set(x,.55,z);group.add(person);
  const skin=mat('skin'+index%4,['#b67f59','#dfb28c','#936348','#c89a79'][index%4]);
  const shirt=trainer?orange:mat('shirt'+index%4,['#28786e','#40566f','#c4a272','#745f74'][index%4]);
  const torso=box(.44,seated?.5:.62,.25,0,seated?.74:1.14,0,shirt,person);
  const head=new THREE.Group();head.position.y=seated?1.17:1.63;person.add(head);dynamic.add(head);
  const face=new THREE.Mesh(new THREE.SphereGeometry(.17,12,9),skin);face.scale.y=1.15;head.add(face);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.175,10,7,0,Math.PI*2,0,Math.PI*.55),dark);hair.position.y=.06;head.add(hair);
  for(const side of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.018,5,4),dark);eye.position.set(side*.065,.03,trainer?.157:-.157);head.add(eye);}
  for(const side of [-1,1]){
   const leg=cylinder(.075,seated?.45:.76,side*.12,seated?.26:.4,seated?-.2:0,dark,person);
   box(.16,.08,.28,side*.12,.05,-.075,dark,person);
   const arm=new THREE.Group();arm.position.set(side*.26,seated?.85:1.3,0);person.add(arm);
   cylinder(.06,.4,0,-.15,0,shirt,arm);const hand=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),skin);hand.position.set(0,-.38,0);arm.add(hand);
   if(trainer&&side===1){dynamic.add(arm);people.push({head,arm,index,trainer});}else arm.rotation.x=seated?-.85:-.15;
  }
  if(!trainer)people.push({head,index,trainer:false});
  if(seated){box(.5,.075,.5,0,.48,.05,navy,person);box(.5,.48,.06,0,.77,.3,teal,person);for(const s of [-1,1])cylinder(.025,.43,s*.18,.22,.12,metal,person);}
 }
 let index=0;
 for(const z of [-13,-17,-21])for(const x of [-2.05,2.05]){
  box(2.1,.09,1,x,1.29,z-1.15,wood);for(const side of [-1,1])box(.065,.74,.7,x+side*.9,.91,z-1.15,metal);
  box(.63,.025,.42,x,1.35,z-1.1,dark);const laptop=box(.63,.38,.03,x,1.55,z-1.28,navy);laptop.rotation.x=-.2;
  box(.5,.27,.012,x,1.56,z-1.252,teal);box(.32,.025,.4,x+.64,1.36,z-1.08,ivory);person(x,z,index++,true);
 }
 person(2.1,-25,7,false,true);
 // Batch static furniture/body geometry, retain only door/heads/teaching arm transforms.
 group.updateMatrixWorld(true);const batches=new Map();const eligible=[];
 group.traverse(mesh=>{if(!mesh.isMesh||mesh.material.isMeshBasicMaterial||mesh.material.transparent)return;for(let p=mesh;p&&p!==group;p=p.parent)if(dynamic.has(p))return;eligible.push(mesh);});
 const inverse=new THREE.Matrix4().copy(group.matrixWorld).invert();
 for(const mesh of eligible){const key=mesh.material;let b=batches.get(key);if(!b){b={position:[],normal:[],uv:[],old:[]};batches.set(key,b);}const geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));for(const name of ['position','normal','uv'])for(const value of geo.getAttribute(name)?.array||[])b[name].push(value);b.old.push(mesh);geo.dispose();}
 for(const [m,b] of batches){if(b.old.length<2)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.position,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.normal,3));if(b.uv.length===b.position.length/3*2)geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));geo.computeBoundingSphere();const mesh=new THREE.Mesh(geo,m);mesh.receiveShadow=true;group.add(mesh);for(const old of b.old){old.removeFromParent();old.geometry.dispose();}}
 const ambient=new THREE.PointLight('#ffe9cf',18,32,1.6);ambient.position.set(0,3.4,-6);group.add(ambient);
 const classLight=new THREE.PointLight('#def4f3',22,30,1.6);classLight.position.set(0,3.5,-20);group.add(classLight);
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const keys=[
  [0,[0,2.8,-328],[0,2.8,-349]],
  [.35,[0,2.05,-339],[0,2.35,-349]],
  [1,[0,2.3,-350],[0,2.3,-356]],
  [1.5,[.4,2.3,-352.8],[-2.3,2.25,-358.3]],
  [2,[0,2.3,-364],[0,2.3,-380]],
  [2.65,[0,2.5,-367],[.7,2.2,-381]],
  [3,[.65,2.5,-368],[1.25,2.3,-381]],
  [3.4,[0,2.3,-362],[0,2.5,-380]],
  [3.7,[0,2.3,-349],[0,2.8,-355]],
  [4,[0,2.8,-328],[0,5.3,-349]]
 ];
 function pose(progress){progress=Math.max(0,Math.min(4,progress));let i=keys.findIndex((k,j)=>j<keys.length-1&&progress>=k[0]&&progress<=keys[j+1][0]);if(i<0)i=keys.length-2;const a=keys[i],b=keys[i+1],t=ease((progress-a[0])/(b[0]-a[0]));return {position:a[1].map((v,j)=>v+(b[1][j]-v)*t),look:a[2].map((v,j)=>v+(b[2][j]-v)*t)};}
 function update(progress){const opening=ease((progress-.3)/.28)*(1-ease((progress-3.8)/.2));for(const {door,side} of doors)door.position.x=side*(.95+opening*1.85);for(const p of people){p.head.rotation.y=Math.sin(progress*8+p.index)*.09;if(p.arm){p.arm.rotation.z=-.7-Math.sin(progress*9)*.35;p.arm.rotation.x=-.4;}}return pose(progress);}
 return {update,refreshLanguage:()=>labels.forEach(fn=>fn()),get people(){return people.length;},get doorOpening(){return doors[1].door.position.x-.95;}};
}
