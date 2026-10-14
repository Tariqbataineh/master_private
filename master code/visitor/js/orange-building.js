import * as THREE from '../../assets/vendor/three.module.js';
import {pbr,architecturalTexture} from './journey-materials.js';
import {architecturalBox,branch,contactShadow} from './architectural-geometry.js';
import {makeHuman} from './city-models.js';
// Reference-inspired architecture, estimated proportions. No identifying footage textures.
export function createOrangeBuilding(scene){
 const group=new THREE.Group();group.position.z=-356;group.name='Orange Digital Village Irbid';scene.add(group);
 const solid=[],animated=[],doors={},fills=[];
 const materialCache=new Map();
 const material=(color,extra={})=>{if(Object.keys(extra).length)return new THREE.MeshStandardMaterial({color,roughness:.78,...extra});if(!materialCache.has(color))materialCache.set(color,new THREE.MeshStandardMaterial({color,roughness:.78}));return materialCache.get(color);};
 const stone=pbr('stone'),white=pbr('plaster','#ffffff',{roughness:1}),gray=material('#9ea6a8',{roughness:.48}),charcoal=material('#343b3f'),floorWood=pbr('wood','#e0e0de'),tile=pbr('paving','#edeeeb'),black=pbr('fabric','#a3a6a4'),metal=material('#9ea5a6',{metalness:.9,roughness:.22}),orange=material('#ed751e'),glass=new THREE.MeshPhysicalMaterial({color:'#d5e2e0',transparent:true,opacity:.16,roughness:.13,clearcoat:.8,metalness:0,depthWrite:false,side:THREE.DoubleSide}),frosted=new THREE.MeshPhysicalMaterial({color:'#c8d1cf',transparent:true,opacity:.54,roughness:.65,depthWrite:false,side:THREE.DoubleSide}),light=material('#f8f6ef',{emissive:'#fff4dc',emissiveIntensity:0}),darkWood=pbr('walnut'),rubber=material('#292e30');
 const b=(w,h,d,x,y,z,m=white,parent=group,collision=false)=>{const o=new THREE.Mesh(architecturalBox(w,h,d,Math.min(.035,w*.07,h*.1,d*.12)),m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;parent.add(o);if(collision)solid.push({min:[x-w/2,y-h/2,z-d/2],max:[x+w/2,y+h/2,z+d/2]});return o;};
 const cyl=(r,h,x,y,z,m=metal,parent=group)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m);o.position.set(x,y,z);parent.add(o);o.castShadow=true;return o;};
 function panel(text,w,h,x,y,z,color='#222',background='#f3f2eb',rotation=0){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const g=c.getContext('2d');if(background!=='transparent'){g.fillStyle=background;g.fillRect(0,0,c.width,c.height);}g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';const lines=text.split('\n');g.font=`600 ${Math.min(75,c.height/(lines.length+1))}px Arial`;lines.forEach((s,i)=>g.fillText(s,c.width/2,c.height*(i+1)/(lines.length+1),c.width*.94));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide,transparent:background==='transparent',alphaTest:.02}));o.position.set(x,y,z);o.rotation.y=rotation;group.add(o);return o;}
 function wall(w,d,x,z,m=white){return b(w,3.2,d,x,2.2,z,m,group,true);}
 function baseboard(w,d,x,z){b(w,.12,d,x,.68,z,charcoal);}
 function ceiling(x,z,w,d){b(w,.12,d,x,3.82,z,white);for(let a=x-w/2;a<=x+w/2;a+=1.2)b(.015,.015,d,a,3.75,z,gray);for(let a=z-d/2;a<=z+d/2;a+=1.2)b(w,.015,.015,x,3.75,a,gray);
 for(let a=x-w/2+1.3;a<x+w/2;a+=3.6)for(let q=z-d/2+1.5;q<z+d/2;q+=3.6)b(.62,.035,.62,a,3.73,q,light);
 b(.8,.04,.8,x,3.71,z,charcoal);for(let i=0;i<6;i++)b(.68,.035,.035,x,3.68,z-.28+i*.11,gray);}
 function roomFloor(x,z,w,d,wood=false){b(w,.12,d,x,.54,z,wood?floorWood:tile);ceiling(x,z,w,d);}
 function glassWall(x1,x2,z,doorX,id){const width=x2-x1;const segments=[[x1,doorX-.7],[doorX+.7,x2]];for(const[a,e]of segments){if(e<=a)continue;b(e-a,2.9,.055,(a+e)/2,2.08,z,frosted);b(e-a,.06,.08,(a+e)/2,3.55,z,metal);b(e-a,.07,.08,(a+e)/2,.64,z,metal);}for(const x of[x1,doorX-.7,doorX+.7,x2])b(.045,3,.07,x,2.1,z,metal);b(1.4,.28,.09,doorX,3.48,z,white);const hinge=new THREE.Group();hinge.position.set(doorX-.68,.6,z);group.add(hinge);b(1.35,2.8,.045,.675,1.4,0,glass,hinge);b(.035,2.8,.065,1.33,1.4,0,metal,hinge);b(.035,.7,.08,1.18,1.35,.06,metal,hinge);b(.05,.1,.2,1.18,1.05,.02,metal,hinge);doors[id]=hinge;
 panel(id==='entrance'?'ENTRANCE · المدخل':id==='classroom'?'CLASSROOM · قاعة التدريب':id==='coaches'?'COACHES · المدربون':id==='kitchen'?'KITCHEN · المطبخ':id==='accessible'?'ACCESSIBLE WC · مهيأة':'WC · دورة مياه',Math.min(2.8,width),.28,doorX,3.48,z+.06);}
 function seat(x,z,rotation=0,office=true){solid.push({min:[x-.36,.6,z-.36],max:[x+.36,1.9,z+.36]});const s=new THREE.Group();s.position.set(x,.6,z);s.rotation.y=rotation;group.add(s);b(.54,.085,.49,0,.48,0,black,s);const back=new THREE.Mesh(new THREE.PlaneGeometry(.47,.45,10,8),black),pos=back.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,.035*Math.cos(pos.getX(i)*6));back.position.set(0,.79,-.24);back.material.side=THREE.DoubleSide;s.add(back);for(const a of[-1,1]){b(.03,.52,.055,a*.25,.79,-.255,charcoal,s);b(.055,.26,.045,a*.30,.57,0,metal,s);b(.075,.035,.28,a*.30,.71,0,black,s);}b(.52,.033,.05,0,1.04,-.25,charcoal,s);b(.52,.045,.05,0,.56,-.24,charcoal,s);cyl(.027,.37,0,.27,0,metal,s);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;branch([0,.13,0],[Math.sin(a)*.3,.08,-Math.cos(a)*.3],.018,metal,s);const wheel=cyl(.047,.045,Math.sin(a)*.3,.065,-Math.cos(a)*.3,rubber,s);wheel.rotation.z=Math.PI/2;}contactShadow(group,x,.615,z,1.1,1,.23);return s;}
 function sofa(x,z,rotation=0){solid.push({min:[x-(Math.abs(Math.sin(rotation))>.5?.45:.525),.6,z-(Math.abs(Math.sin(rotation))>.5?.525:.45)],max:[x+(Math.abs(Math.sin(rotation))>.5?.45:.525),1.6,z+(Math.abs(Math.sin(rotation))>.5?.525:.45)]});const s=new THREE.Group();s.position.set(x,.6,z);s.rotation.y=rotation;group.add(s);b(1.02,.27,.84,0,.24,0,black,s);b(.76,.12,.64,0,.43,.02,black,s);b(.78,.45,.14,0,.69,-.34,black,s);b(.025,.012,.64,0,.497,.02,charcoal,s);b(.18,.5,.9,-.48,.56,0,black,s);b(.18,.5,.9,.48,.56,0,black,s);for(const a of[-.4,.4])for(const q of[-.3,.3])cyl(.03,.13,a,.07,q,metal,s);return s;}
 function desk(x,z,w=2,d=.8){b(w,.09,d,x,1.38,z,white,group,true);for(const a of[-1,1]){b(.08,.72,.1,x+a*(w/2-.18),.98,z,charcoal);b(.08,.06,d*.85,x+a*(w/2-.18),.64,z,charcoal);}b(Math.min(.62,w*.25),.012,.065,x,1.434,z-.16,charcoal);b(Math.min(.58,w*.24),.013,.04,x,1.441,z-.16,gray);}
 function monitor(x,z){b(.68,.43,.055,x,1.75,z,black);panel('WUSOOL\nconst access = true;',.61,.34,x,1.76,z+.034,'#b7e1ba','#122e37');cyl(.025,.2,x,1.49,z);b(.32,.025,.22,x,1.4,z);b(.45,.025,.16,x,1.43,z+.27,gray);}
 function drawer(x,z){b(.46,.63,.66,x,.94,z,white);for(let y=.8;y<1.2;y+=.15){b(.44,.009,.01,x,y,z+.336,gray);b(.13,.02,.025,x,y+.04,z+.35,metal);}}
 function character(x,z,index=0,standing=false,rot=0){solid.push({min:[x-.32,.6,z-.32],max:[x+.32,2.4,z+.32]});const person=makeHuman(Math.abs(index)),figure=person.group;figure.position.set(x,standing?.6:.18,z);figure.rotation.y=rot;group.add(figure);if(!standing){for(const leg of person.legs){leg.hip.rotation.x=-Math.PI/2;leg.knee.rotation.x=Math.PI/2;}for(const arm of person.arms){arm.shoulder.rotation.x=-.7;arm.elbow.rotation.x=-.8;}}animated.push({mesh:figure,person,standing,phase:index*1.71,type:'human'});}
 function referencedCharacter(x,z,role,standing=false,rot=0){
  solid.push({min:[x-.32,.6,z-.32],max:[x+.32,2.4,z+.32]});
  const female=role==='coach1'||role==='coach2',person=makeHuman(role==='manager'?14:role==='instructor'?15:role==='coach2'?16:17),figure=person.group;
  figure.name=female?'Generic adult female coach':role==='manager'?'Generic manager in suit':'Generic instructor';
  figure.position.set(x,standing?.6:.18,z);figure.rotation.y=rot;group.add(figure);
  if(!standing){for(const leg of person.legs){leg.hip.rotation.x=-Math.PI/2;leg.knee.rotation.x=Math.PI/2;}for(const arm of person.arms){arm.shoulder.rotation.x=-.7;arm.elbow.rotation.x=-.8;}}
  if(role==='instructor'){person.arms[0].shoulder.rotation.z=.35;person.arms[0].shoulder.rotation.x=-.35;person.arms[1].shoulder.rotation.z=-.55;person.arms[1].shoulder.rotation.x=-.05;}
  // Authored generic geometry only; no reference photographs or facial textures.
  const jacket=material(role==='coach1'?'#45665e':role==='coach2'?'#876e80':'#263345'),shirt=material('#f1eee6');
  const body=figure.children.find(o=>o.isMesh&&o.geometry.type==='LatheGeometry');
  if(body){body.material=jacket;if(female)body.scale.x=.88;}
  for(const arm of person.arms)for(const part of arm.shoulder.children)if(part.isMesh)part.material=jacket;
  b(.12,.30,.025,0,1.20,.135,shirt,figure);
  for(const side of[-1,1]){const lapel=b(.065,.25,.025,side*.085,1.20,.145,jacket,figure);lapel.rotation.z=side*.23;}
  if(role==='manager'){
   const tie=new THREE.Mesh(new THREE.ConeGeometry(.035,.27,4),material('#486d66'));tie.position.set(0,1.16,.16);tie.rotation.z=Math.PI;figure.add(tie);
   for(const y of[1.04,1.12]){const button=new THREE.Mesh(new THREE.SphereGeometry(.008,8,6),charcoal);button.position.set(.045,y,.145);figure.add(button);}
  }
  if(female){
   const hair=material(role==='coach1'?'#38291f':'#5a3927');
   const backHair=new THREE.Mesh(new THREE.SphereGeometry(.125,24,20),hair);backHair.scale.set(1,1.6,.65);backHair.position.set(0,-.035,-.055);person.head.add(backHair);backHair.castShadow=true;
   for(const side of[-1,1]){const lock=new THREE.Mesh(new THREE.CapsuleGeometry(.032,.19,6,12),hair);lock.position.set(side*.102,-.095,-.018);person.head.add(lock);lock.castShadow=true;}
   person.head.scale.x=.93;
  }
  animated.push({mesh:figure,person,standing,phase:(role.length+x+z)*1.13,type:'human'});
 }

 function basin(x,y,z){const pts=[[0,-.14],[.07,-.14],[.15,-.1],[.22,0],[.245,.025],[.255,0],[.235,-.04],[.2,-.15],[.12,-.2],[0,-.2]].map(v=>new THREE.Vector2(...v));const basin=new THREE.Mesh(new THREE.LatheGeometry(pts,32),white);basin.scale.set(1.55,1,1);basin.position.set(x,y,z);basin.castShadow=true;group.add(basin);cyl(.022,.22,x,y+.1,z-.2);branch([x,y+.21,z-.2],[x,y+.21,z-.06],.022,metal,group);b(.74,.045,.5,x,y-.035,z,gray);}
 function windowWall(w,x,z){const half=1.2;wall(w/2-half,.18,x-(w/4+half/2),z);wall(w/2-half,.18,x+(w/4+half/2),z);b(2.4,.98,.18,x,1.08,z,white,group,true);b(2.4,.66,.18,x,3.49,z,white,group,true);b(2.28,1.55,.03,x,2.34,z,glass);for(const a of[-1,1]){b(.045,1.65,.24,x+a*1.16,2.34,z,metal);b(2.4,.05,.24,x,2.34+a*.8,z,white);}b(.045,1.55,.14,x,2.34,z,metal);b(2.34,.035,.25,x,3.2,z,gray);b(2.25,.47,.03,x,2.98,z+.07,white);}
 // Full masonry facade courses, deep window jambs, divided panes and coping.
 const facadeGlass=new THREE.MeshPhysicalMaterial({color:'#899d9f',roughness:.15,clearcoat:.7,metalness:0,transparent:true,opacity:.7,depthWrite:false,emissive:'#efcda0',emissiveIntensity:0}),facadeRecess=material('#424a4d');
 for(const side of[-1,1]){const cx=side*11.5;b(16,10,.3,cx,8.8,-2.7,stone);b(.35,10,9,side*19.4,8.8,1.8,stone);for(let row=0;row<16;row++){const y=4.12+row*.6;for(let col=0;col<13;col++){const x=cx-7.7+col*1.34+(row%2)*.25;let pieces=[[Math.max(cx-8,x-.655),Math.min(cx+8,x+.655),y-.2925,y+.2925]];for(let k=0;k<4;k++){const wx=side*(6.5+k*3.4);for(let wy=5.3;wy<13;wy+=3){const hole=[wx-.81,wx+.81,wy-.84,wy+.84],next=[];for(const q of pieces){const ax=Math.max(q[0],hole[0]),bx=Math.min(q[1],hole[1]),ay=Math.max(q[2],hole[2]),by=Math.min(q[3],hole[3]);if(ax>=bx||ay>=by){next.push(q);continue;}if(q[0]<ax)next.push([q[0],ax,q[2],q[3]]);if(bx<q[1])next.push([bx,q[1],q[2],q[3]]);if(q[2]<ay)next.push([ax,bx,q[2],ay]);if(by<q[3])next.push([ax,bx,by,q[3]]);}pieces=next;}}for(const q of pieces)if(q[1]-q[0]>.02&&q[3]-q[2]>.02)b(q[1]-q[0],q[3]-q[2],.24,(q[0]+q[1])/2,(q[2]+q[3])/2,6.31,stone);}}
 for(let row=0;row<5;row++)for(let col=0;col<13;col++){const x=cx-7.4+col*1.2;if(Math.abs(x)>3.7&&Math.abs(x)<19.4)b(1.18,.57,.18,x,.92+row*.6,side<0?7.02:6.33,stone);}

 for(let i=0;i<4;i++){const x=side*(6.5+i*3.4);b(.33,10,.62,x-side*1.1,8.8,6.49,charcoal);for(let y=5.3;y<13;y+=3){b(1.7,1.93,.13,x,y,5.28,facadeRecess);for(const a of[-1,1]){b(.11,1.97,1.0,x+a*.85,y,5.83,stone);b(.055,1.7,.15,x+a*.77,y,6.11,metal);}b(1.85,.14,.85,x,y-.89,6.04,gray);b(1.53,1.62,.03,x,y,6.06,facadeGlass);b(.05,1.68,.12,x,y,6.15,metal);b(1.55,.04,.14,x,y+.1,6.15,metal);}}
 b(16.5,.24,9.6,cx,13.93,1.8,gray);b(16.1,.36,.22,cx,14.12,6.48,stone);b(.12,10,.12,side*19.15,8.8,6.55,metal);b(2.5,.75,2,cx,14.25,.5,gray);}
 b(7,10,.4,0,8.8,7.8,gray);for(let y=4;y<13.8;y+=1.4)b(7,.018,.035,0,y,8.025,charcoal);for(const x of[-2.2,2.2])b(.014,10,.03,x,8.8,8.025,charcoal);
 panel('Orange Digital Village\nIrbid',6.7,1.9,0,6.45,8.04,'#e56427','transparent');panel('orange',1.1,1.1,0,12.7,8.04,'white','#f27620');b(2,2,.14,0,10.35,8.05,orange);b(1.8,1.8,.16,0,10.35,8.13,charcoal);for(let i=0;i<8;i++)b(.03,1.7,.03,-.8+i*.23,10.35,8.24,metal);
 b(7,.3,1.2,0,3.73,8.25,gray);for(const x of[-2.55,2.55])wall(1.25,.35,x,8,gray);glassWall(-1.9,1.9,8,0,'entrance');
 // Courtyard, steps and restrained estimated ramp.
 b(46,.12,24,0,-.04,20,tile);for(let i=0;i<3;i++)b(5,.18,1.2,0,.09+i*.18,10.4-i*.6,stone);const ramp=b(1.6,.1,5,3.4,.28,11,tile);ramp.rotation.x=-.105;
 for(const side of[-1,1]){b(5,.36,2,side*10,.18,11,stone);b(4.6,.07,1.6,side*10,.4,11,darkWood);}
 // Orange picnic shelter and small guard booth visible in 0609.
 for(const x of[-16,-9])for(const z of[17,23])b(.12,3,.12,x,1.5,z,orange);b(7.8,.15,7.2,-12.5,3.02,20,charcoal);b(7.8,.15,.18,-12.5,3.07,23.6,orange);
 for(const z of[18.5,21.5]){b(4,.08,.85,-12.5,1.02,z,darkWood);for(const q of[-.9,.9])b(4,.08,.35,-12.5,.5,z+q,darkWood);for(const x of[-14,-11])b(.07,1,.07,x,.5,z,orange);}
 b(2.5,2.6,2.5,-20,1.3,18,white);b(2.8,.2,2.8,-20,2.7,18,charcoal);b(1.8,.9,.04,-20,1.95,19.28,glass);b(.12,1,.04,-20,1.9,19.32,gray);
 // Reception junction; right = +X, left = -X. Open continuous corridor.
 roomFloor(0,3,6.8,10,true);roomFloor(11,0,16,3.2,true);roomFloor(-10,0,17,3.2,true);
 wall(6.8,.18,0,-2);wall(.18,6,-3.5,5);wall(.18,6,3.5,5);
 desk(-2.2,3.2,2.1,.9);b(2.1,1,.15,-2.2,1.1,3.7,white);b(1.4,.6,.12,-2.2,1.7,3.79,charcoal);monitor(-2.3,3.1);seat(-2.2,2.2);panel('Coding Academy\nFAB LAB · Orange',2.5,1,-2,2.8,1.86,'#e66a20');
 sofa(2.6,2.5,-Math.PI/2);sofa(2.6,4,-Math.PI/2);sofa(-2.6,6,Math.PI/2);
 panel('Classroom & Offices →\n← Kitchen & Restrooms',3.5,.5,0,3.15,-1.88,'#393d3a');
 // Right corridor and classroom. Independent frontage doors.
 wall(16,.18,11,1.7);baseboard(16,.1,11,1.58);
 roomFloor(7,-8,8,12);wall(.18,12,3,-8);wall(.18,12,11,-8);windowWall(8,7,-14);glassWall(3,11,-1.7,4,'classroom');
 for(const z of[-5,-8,-11]){desk(7.3,z,4.8,1.15);for(const x of[5.5,7.3,9.1]){seat(x,z+1,Math.PI);character(x,z+1,Math.round(x+z*3),false,Math.PI);}}
 b(3.2,1.7,.1,8,2.3,-13.83,black);panel('WUSOOL / ACCESSIBLE BY DESIGN\nfunction welcome(visitor) {\n  return places.filter(place => place.accessible);\n}\nLearn · Build · Include',3,1.5,8,2.3,-13.76,'#d2edd9','#102b35');referencedCharacter(10,-12.7,'instructor',true,.6);
 panel('HTML · CSS · JavaScript\nLearn together',1.8,1.2,3.13,2.5,-8,'#e87327','#f4f2ec',Math.PI/2);b(1.8,.8,.08,7,3.2,-13.82,white);
 // Coaches office: visible office furnishings, two anonymous coaches.
 roomFloor(15,-5,6,7);wall(.18,7,12,-5);wall(.18,7,18,-5);windowWall(6,15,-8.5);glassWall(12,18,-1.7,13,'coaches');
 for(const z of[-3.5,-5.6]){desk(16,z,2.4,.8);drawer(16.9,z);monitor(16,z);seat(16,z+.85,Math.PI);referencedCharacter(16,z+.85,z===-3.5?'coach1':'coach2',false,Math.PI);}
 sofa(17.1,-7.4);b(2,.8,.05,15,2.5,-8.37,darkWood);panel('Build. Learn. Include.',1.8,.7,15,2.5,-8.33,'#fff','#88745a');
 // Manager at terminal corridor, separate side-wall doorway.
 roomFloor(23.5,0,7,8);windowWall(7,23.5,-4);wall(7,.18,23.5,4);wall(.18,8,27,0);wall(.18,2.9,20,-2.55);wall(.18,2.9,20,2.55);b(.18,.3,1.1,20,3.55,0,white);
 const managerDoor=new THREE.Group();managerDoor.position.set(20,.6,-.68);managerDoor.rotation.y=-Math.PI/2;group.add(managerDoor);b(1.35,2.8,.04,.675,1.4,0,glass,managerDoor);b(.04,.6,.1,1.18,1.4,.06,metal,managerDoor);doors.manager=managerDoor;panel('MANAGER\nمكتب المدير',1.5,.5,19.88,3,0,'#222','#f4f2ec',-Math.PI/2);
 desk(25,-2,2.7,1);monitor(25,-2);drawer(26,-2);seat(25,-3);referencedCharacter(25,-3,'manager',false,0);sofa(21.5,2.8);sofa(23,2.8);b(2.8,1.8,.06,23.6,2.25,-3.87,white);panel('orange',.75,.75,23.6,2.3,-3.83,'white','#f27620');b(1.6,.32,.23,24,3.25,-3.8,white);b(1.4,.04,.25,24,3.12,-3.67,charcoal);b(1.4,.8,.05,26,2.3,-3.86,darkWood);
 // Services corridor: kitchen on traveller's right (-Z), toilets left (+Z).
 wall(16,.18,-11,-1.7); // Replace kitchen portion with glass and its independent door.
 // Remove the above long wall from actual geometry/collision list, preserving only non-kitchen portions.
 const removed=group.children.pop();removed.geometry.dispose();solid.pop();wall(3,.18,-3.5,-1.7);wall(2,.18,-17,-1.7);wall(.18,3.4,-18.5,0);b(.06,2.6,.95,-18.36,1.9,0,darkWood);b(.07,.12,.06,-18.31,1.8,.32,metal);
 roomFloor(-10.5,-5,11,6.6);wall(.18,6.6,-5,-5);wall(.18,6.6,-16,-5);wall(11,.18,-10.5,-8.3);glassWall(-16,-5,-1.7,-8,'kitchen');
 for(let x=-14.8;x<-6;x+=1.2){b(1.15,.85,.65,x,1.03,-7.75,white);b(1.2,.06,.75,x,1.48,-7.7,gray);b(.36,.025,.05,x,1.3,-7.38,metal);b(1.1,.7,.3,x,2.45,-8.06,white);}b(.8,.025,.45,-13.6,1.52,-7.7,metal);cyl(.025,.35,-13.6,1.7,-7.98);b(.2,.04,.04,-13.5,1.86,-7.98,metal);b(1,1.8,.8,-6,1.5,-6.7,white);b(.82,.025,.04,-6,1.72,-6.28,metal);cyl(.13,.25,-10,1.65,-7.6,charcoal);b(1.5,.8,.7,-11,1,-3.1,white);
 // Restroom doors face the -X-travelling corridor, rooms positive Z.
 wall(2,.18,-2,1.7);wall(2,.18,-9,1.7);wall(3,.18,-16,1.7);
 function restroom(id,x,w){roomFloor(x,4.3,w,5.2);wall(.18,5.2,x-w/2,4.3);wall(.18,5.2,x+w/2,4.3);wall(w,.18,x,6.9);glassWall(x-w/2,x+w/2,1.7,x,id);const toiletX=x-.9;b(.45,.55,.18,toiletX,.99,6.5,white);const bowl=new THREE.Mesh(new THREE.SphereGeometry(.28,18,12),white);bowl.scale.set(1,.55,1.4);bowl.position.set(toiletX,.92,6.05);group.add(bowl);cyl(.15,.28,toiletX,.73,6.2,white);const ring=new THREE.Mesh(new THREE.TorusGeometry(.23,.035,8,24),white);ring.rotation.x=Math.PI/2;ring.scale.y=1.4;ring.position.set(toiletX,1.08,6.04);group.add(ring);basin(x+w/2-.5,1.35,5.8);b(.9,.85,.03,x+w/2-.15,2.25,5.8,metal).rotation.y=Math.PI/2;cyl(.02,.19,x+w/2-.5,1.49,5.75);b(.4,.35,.2,x+w/2-.35,1.15,6.6,charcoal);
 if(id==='accessible'){for(const a of[-.45,.45]){b(.035,.035,.8,toiletX+a,1.45,6.08,metal);b(.035,.3,.035,toiletX+a,1.3,6.45,metal);}b(.035,.04,1.2,x-w/2+.15,1.5,5.6,metal);cyl(.025,.65,x-w/2+.16,1.8,6,metal);panel('Accessible facilities\nDimensions unverified',1.8,.45,x,2.8,6.77,'#444','#f4f2ec',Math.PI);}else{b(.06,1.5,1.4,x+.15,1.35,6,gray);}}
 restroom('accessible',-5,6);restroom('standard',-12,5);
 // Laptop lids and table equipment stay on existing tabletops, away from clear aisles.
 for(const z of[-5,-8,-11])for(const x of[5.5,7.3,9.1]){b(.42,.018,.30,x,1.445,z,metal);const lid=b(.42,.27,.018,x,1.59,z-.14,charcoal);lid.rotation.x=-.14;panel('Wusool / Learn',.37,.20,x,1.595,z-.12,'#b9d8cb','#203239');b(.27,.003,.085,x,1.456,z+.025,charcoal);}
 for(const [x,z]of[[-2.2,3.2],[25,-2],[16,-3.5],[16,-5.6]]){b(.15,.04,.19,x+.5,1.46,z+.18,charcoal);cyl(.045,.12,x-.6,1.48,z+.16,white);}
 for(const x of[-14.8,-13.6,-12.4,-11.2,-10,-8.8,-7.6]){b(1.04,.03,.065,x,.64,-7.41,charcoal);b(.018,.7,.04,x+.54,1.1,-7.4,gray);}
 // Interior lighting uses economical, shadow-free soft fill; daylight remains coherent.
 for(const [x,z]of[[0,3],[7,-7],[15,-5],[23,0],[-10,-5],[-5,4],[-12,4]]){const l=new THREE.PointLight('#fff0d5',45,15,2);l.position.set(x,3.2,z);l.visible=false;fills.push(l);group.add(l);}
 const exteriorLights=[];for(const x of[-3,3,-12]){const l=new THREE.PointLight('#ffd8aa',42,20,2);l.position.set(x,3.5,10);l.visible=false;group.add(l);exteriorLights.push(l);}
 function setTheme(night){if(!night)for(const l of fills)l.visible=false;light.emissiveIntensity=night?1.4:0;facadeGlass.emissiveIntensity=night?.18:0;for(const l of exteriorLights)l.visible=false;}
 for(const [x,z,r]of[[7.3,-5,2],[7.3,-8,2],[7.3,-11,2],[16,-3.5,1.1],[16,-5.6,1.1],[25,-2,1.2],[-2.2,3.2,.9]])contactShadow(group,x,.612,z,r*2,r,.24);
 // Batch opaque static geometry per material to keep mobile draw calls modest.
 group.updateMatrixWorld(true);const inverse=new THREE.Matrix4().copy(group.matrixWorld).invert(),batches=new Map();const dynamic=new Set();for(const d of Object.values(doors))d.traverse(o=>dynamic.add(o));for(const a of animated)a.mesh.traverse(o=>dynamic.add(o));
 group.traverse(o=>{if(o.isMesh&&!dynamic.has(o)&&!o.material.transparent&&!o.material.isMeshBasicMaterial){const list=batches.get(o.material)||[];list.push(o);batches.set(o.material,list);}});
 for(const [m,list]of batches){if(list.length<2)continue;const ps=[],ns=[],uv=[];for(const o of list){let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));ps.push(...g.attributes.position.array);ns.push(...g.attributes.normal.array);if(g.attributes.uv)uv.push(...g.attributes.uv.array);o.parent.remove(o);g.dispose();o.geometry.dispose();}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(ns,3));if(uv.length===ps.length/3*2)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeBoundingSphere();const mesh=new THREE.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
  function manageLights(position,active,night){const local=new THREE.Vector3(position[0],position[1],position[2]+356),nearest=fills.slice().sort((a,b)=>a.position.distanceToSquared(local)-b.position.distanceToSquared(local)).slice(0,innerWidth<750?1:2);for(const l of fills)l.visible=night&&active&&nearest.includes(l);const outside=exteriorLights.slice().sort((a,b)=>a.position.distanceToSquared(local)-b.position.distanceToSquared(local)).slice(0,innerWidth<750?1:2);for(const l of exteriorLights)l.visible=night&&outside.includes(l)&&l.position.distanceTo(local)<27;}
 let previousUpdate=0;function update(time,state,reduced,position,night=false){const dt=Math.min(.15,Math.max(0,time-previousUpdate));previousUpdate=time;const hingeDamping=reduced?1:1-Math.exp(-6*dt);setTheme(night);const activeLights=[...fills].sort((a,b)=>Math.hypot(a.position.x-position[0],a.position.z-(position[2]+356))-Math.hypot(b.position.x-position[0],b.position.z-(position[2]+356))).slice(0,2);for(const l of fills)l.visible=night&&activeLights.includes(l);const open=state.progress>.45||state.state==='corridor'||state.state==='room'||state.state==='reception'||state.state==='transition';doors.entrance.rotation.y+=( (open?-Math.PI*.52:0)-doors.entrance.rotation.y)*hingeDamping;for(const[id,door]of Object.entries(doors)){if(id==='entrance')continue;const active=state.room===id;const base=id==='manager'?-Math.PI/2:0;door.rotation.y+=(base+(active?-Math.PI*.48:0)-door.rotation.y)*hingeDamping;}
 if(!reduced)for(const a of animated){if(a.type==='human'){a.person.head.rotation.y=Math.sin(time*.43+a.phase)*.07;for(const [i,arm]of a.person.arms.entries()){arm.shoulder.rotation.x=(a.standing?-.15:-.7)+Math.sin(time*(a.standing?.65:2.1)+a.phase+i)*(a.standing?.12:.015);arm.elbow.rotation.x=(a.standing?-.4:-.8)+Math.sin(time*.7+a.phase)*.04;}}else if(a.type==='head'){a.mesh.rotation.y=Math.sin(time*.43+a.phase)*.065;a.mesh.rotation.z=Math.sin(time*.31+a.phase)*.018;}else a.mesh.rotation.x=a.base+Math.sin(time*(a.type==='typing'?2.2:.65)+a.phase)*(a.type==='typing'?.018:.07);}}
 function cullActors(worldPosition,active){const local=new THREE.Vector3(worldPosition[0],worldPosition[1],worldPosition[2]+356);for(const a of animated)if(a.type==='human')a.mesh.visible=active&&a.mesh.position.distanceTo(local)<19;}
 return {group,doors,solid,update,cullActors,setTheme,manageLights,lighting:()=>fills.filter(l=>l.visible).length,stats:{characters:13,rooms:6,referencedPeople:4},dispose(){group.traverse(o=>{if(o.geometry)o.geometry.dispose();});}};
}
