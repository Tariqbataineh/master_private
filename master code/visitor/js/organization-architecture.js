import * as THREE from '../../assets/vendor/three.module.js';
import {pbr} from './journey-materials.js';
import {branch,contactShadow,foliageMaterial} from './architectural-geometry.js';
// Reference-inspired architectural families; original stop origins and extents are retained.
export function buildOrganization(g,index,height,box,nightMaterials){
 const stone=pbr('stone',index===0?'#e9d7b6':index===2?'#ece5d3':'#f0f0ec'),trim=pbr('concrete',index===0?'#e2d0b2':'#e4e4df'),slate=pbr('stone','#727b7e'),metal=new THREE.MeshStandardMaterial({color:'#554f44',metalness:.78,roughness:.34}),recess=new THREE.MeshStandardMaterial({color:'#363b3b',roughness:.9}),soil=pbr('soil'),wood=pbr('walnut'),leaf=new THREE.MeshStandardMaterial({color:'#526444',roughness:.94});
 const glasses=Array.from({length:5},(_,i)=>{const m=new THREE.MeshPhysicalMaterial({color:i===0?'#899ca0':'#8ca4a6',roughness:.13+ i*.01,metalness:0,clearcoat:.75,clearcoatRoughness:.12,transparent:true,opacity:.72,depthWrite:false,envMapIntensity:1.35,emissive:i<3?'#ffd39a':'#14202c'});m.userData.nightPower=i===0?.45:i===1?.24:i===2?.1:0;nightMaterials.push(m);return m;});
 const b=(w,h,d,x,y,z,m=stone)=>box(w,h,d,x,y,z,m,g);
 const wings=index===3?[{x:-7,w:8,h:height},{x:7,w:8,h:height+3}]:[{x:-7.45,w:8.1,h:height},{x:7.45,w:8.1,h:height}];
 for(const wing of wings){const floors=Math.ceil(wing.h/3);b(wing.w,wing.h,.3,wing.x,wing.h/2,-7.5);for(const x of[wing.x-wing.w/2,wing.x+wing.w/2])b(.32,wing.h,13,x,wing.h/2,-1);for(let level=0;level<=floors;level++){const y=Math.min(wing.h,level*3);b(wing.w+.16,.18,13.3,wing.x,y+.09,-1,trim);b(wing.w,.09,.15,wing.x,y+.12,5.78,metal);}
 for(let floor=0;floor<floors;floor++){const y=1.7+floor*3;if(y+1>wing.h)continue;for(let col=0;col<3;col++){const x=wing.x+(col-1)*2.55;
 // True deep reveal: backwall, jambs, stone sill, frame, glass and divided panes.
 b(2.5,2.55,.1,x,y,3.95,recess);b(.24,2.65,1.55,x-1.05,y,4.8);b(.24,2.65,1.55,x+1.05,y,4.8);
 b(2.55,.96,.38,x,floor*3+.56,5.49);b(2.55,.45,.38,x,floor*3+2.78,5.49);
 b(2.17,.1,.75,x,y-1.04,5.38,trim);b(2.07,.08,.24,x,y+1.04,5.3,metal);
 for(const side of[-1,1])b(.055,2.04,.14,x+side*1.0,y,5.25,metal);b(.045,2.04,.16,x,y,5.26,metal);b(2,.035,.13,x,y+.2,5.26,metal);
 b(1.98,2,.025,x,y,5.19,glasses[(col+floor*3+index*2)%5]);
 // Internal roller blind and shallow side-return provide credible depth behind glass.
 b(1.96,.035,.32,x,y+.94,4.91,trim);if((floor+col)%3===0)b(1.92,.62,.015,x,y+.6,4.78,trim);
 } }
 // Stone courses and discreet corner quoin relief, not a mapped outline on a box.
 for(let y=.4;y<wing.h;y+=.62){b(wing.w,.012,.02,wing.x,y,5.7,slate);for(const x of[wing.x-wing.w/2,wing.x+wing.w/2])b(.39,.59,.045,x,y+.3,5.73);}
 b(wing.w+.45,.28,13.7,wing.x,wing.h+.1,-1,trim);b(wing.w+.1,.5,.22,wing.x,wing.h+.38,5.6);b(wing.w+.1,.5,.22,wing.x,wing.h+.38,-7.65);
 b(2.2,.75,2.1,wing.x,wing.h+.6,-3.7,metal);for(let k=0;k<8;k++)b(2.1,.025,.035,wing.x,wing.h+.33+k*.08,-2.62,trim);
 b(.09,wing.h,.09,wing.x+wing.w/2-.18,wing.h/2,-7.7,metal);
 // Side windows inset into masonry wings, with four physical edge frames.
 for(const side of[-1,1]){const x=wing.x+side*(wing.w/2+.015);for(let z=-5;z<=2;z+=3.2)for(let y=2;y<wing.h-1;y+=3){b(.03,1.5,1.65,x,y,z,glasses[(Math.round(y)+index)%5]);for(const a of[-1,1]){b(.09,1.65,.05,x+side*.035,y,z+a*.85,metal);b(.12,.06,1.78,x+side*.05,y+a*.78,z,trim);}}}
 }
 // Glazed central entrance: transoms, recessed doors, canopy beams and fixings.
 if(index!==3){for(let y=.3;y<height;y+=3){b(6.1,2.7,.025,0,y+1.35,5.28,glasses[Math.floor(y)%5]);for(const x of[-3.1,-1.55,0,1.55,3.1])b(.07,2.9,.22,x,y+1.4,5.38,metal);b(6.3,.12,.26,0,y,5.44,metal);}b(6.2,height, .18,0,height/2,3.85,recess);}
 else {b(6.4,.22,7,0,8.5,-1,trim);b(6.4,.22,7,0,11.5,-1,trim);b(6.4,2.6,.03,0,10,2.53,glasses[1]);for(const x of[-3.15,0,3.15])b(.07,2.8,.15,x,10,2.63,metal);}
 b(6.2,.13,4.8,0,3.5,7.4,metal);b(6,.055,4.6,0,3.62,7.4,glasses[3]);for(const x of[-2.9,2.9]){b(.11,3.4,.11,x,1.7,8.9,metal);branch([x,3.6,9.2],[x,5.5,5.8],.025,metal,g);}for(let x=-2.4;x<=2.4;x+=1.2)b(.06,.2,4.65,x,3.44,7.4,metal);
 for(const x of[-.82,.82]){b(1.58,2.7,.04,x,1.55,5.7,glasses[3]);for(const a of[-1,1])b(.045,2.7,.12,x+a*.78,1.55,5.77,metal);b(.035,.72,.05,x+(x<0?.55:-.55),1.65,5.88,metal);}b(3.4,.12,.8,0,.15,5.95,trim);
 if(index===0)for(let x=-11.3;x<=11.3;x+=2.55)b(.24,height+.15,1.2,x,height/2,5.84,trim);
 if(index===1){for(let k=0;k<18;k++){const a=-Math.PI*.86+k*Math.PI*1.72/17,x=Math.sin(a)*3.17,z=5.2+Math.cos(a)*3.17;const panel=b(.92,height-1,.03,x,(height-1)/2+.3,z,glasses[k%5]);panel.rotation.y=a;branch([x,.3,z],[x,height-.5,z],.035,metal,g);}for(let y=3.3;y<height;y+=3){const ring=new THREE.Mesh(new THREE.TorusGeometry(3.22,.065,8,64,Math.PI*1.72),metal);ring.rotation.set(Math.PI/2,0,Math.PI*.14);ring.position.set(0,y,5.2);g.add(ring);}}
 if(index===2){for(let x=-9;x<=9;x+=3){b(.65,11.7,1.1,x,6.1,6.5,trim);b(.91,.3,1.32,x,.4,6.5,trim);b(1.15,.3,1.45,x,12.08,6.5,trim);}b(22,.38,1.8,0,12.45,6.5,trim);}
 // Forecourt remains outside all street/camera clearances.
 for(const x of[-9,9]){b(3,.58,2.2,x,.29,10);b(2.65,.04,1.85,x,.6,10,soil);const leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(.045,.14),foliageMaterial(),200),dummy=new THREE.Object3D();for(let k=0;k<200;k++){const v=Math.sin(k*77.41+index)*.5+.5,q=Math.sin(k*31.17)*.5+.5;dummy.position.set(x+(v-.5)*2.4,.68+q*.6,10+(Math.sin(k*29.1)*.5)*1.5);dummy.rotation.set(Math.sin(k)*.8,k*2.39,k*.3);dummy.updateMatrix();leaves.setMatrixAt(k,dummy.matrix);}leaves.castShadow=true;leaves.receiveShadow=true;leaves.userData.noBatch=true;g.add(leaves);contactShadow(g,x,.14,10,4,3,.18);}
 for(const x of[-6,6]){for(let k=0;k<6;k++)b(2,.065,.075,x,.66,11.7+k*.095,wood);for(const a of[-.8,.8])b(.055,.6,.55,x+a,.3,12,metal);}
 contactShadow(g,0,.13,1,26,23,.23);
 return {facadeBays:wings.length*3*Math.floor(height/3),glassVariants:glasses.length};
}
