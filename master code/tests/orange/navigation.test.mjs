import assert from 'node:assert/strict';
import {OrangeNavigation,rooms,paths,sample,corridorPose} from '../../visitor/js/orange-navigation.mjs';
let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++;};
const n=new OrangeNavigation();check(n.state==='exterior','initial exterior');check(!n.choose('right',0),'cannot route outside reception');
for(let i=0;i<30;i++)n.move(.055,1000+i*20);check(n.state==='reception'&&n.progress===1,'approach clamped at reception');
for(const route of ['right','left']){
 n.state='reception';n.progress=1;n.lockUntil=0;check(n.choose(route,2000),'choose route');check(!n.choose(route,2001),'duplicate route click blocked');check(!n.move(.05,2100),'transition blocks momentum');n.finish(3000);check(n.state==='corridor'&&n.progress===0,'corridor ready');
 for(const[id,room]of Object.entries(rooms).filter(([,r])=>r.route===route)){
  n.progress=room.at;n.lockUntil=0;const parent=n.pose();check(n.explore(id,4000),'independent room entry '+id);check(!n.explore(id,4001),'duplicate Explore blocked');n.finish(5000);check(n.state==='room'&&n.room===id,'active room '+id);n.move(100,5400);check(n.progress===.055,'momentum capped');for(let i=0;i<25;i++)n.move(.055,5500+i*10);check(n.progress===1,'room forward clamped');for(let i=0;i<25;i++)n.move(-.055,6000+i*10);check(n.state==='room'&&n.progress===0,'reverses room without accidental exit');check(!n.move(-.05,7000,false),'continuing momentum cannot exit');check(n.move(-.05,7000,true),'fresh backward gesture exits');check(!n.exit(7001),'duplicate exits blocked');n.finish(8500);check(n.state==='corridor','restored corridor');assert.deepEqual(n.pose(),parent);checks++;check(n.progress===room.at,'same parent progress');
 }
 n.progress=0;n.lockUntil=0;n.boundaryAt=9000;check(!n.move(-.05,9100,true),'boundary guard');check(n.move(-.05,9500,true)&&n.state==='reception','return reception');
}
n.lockUntil=0;n.move(-.055,10000);check(n.state==='entrance','return to entrance');for(let i=0;i<25;i++)n.move(-.055,11000+i*20);check(n.state==='exterior'&&n.progress===0,'return exterior clamp');
for(const path of Object.values(paths))for(let i=0;i<=100;i++){const p=sample(path,i/100);check([...p.position,...p.look].every(Number.isFinite),'finite camera sample');}
check(rooms.classroom.at<rooms.coaches.at&&rooms.coaches.at<rooms.manager.at,'right room ordering');check(paths.classroom.every(p=>p.position[2]<0),'classroom left of +X corridor');check(paths.kitchen.every(p=>p.position[2]<0),'kitchen right of -X corridor');check(paths.accessible.every(p=>p.position[2]>0)&&paths.standard.every(p=>p.position[2]>0),'restrooms left of -X corridor');
console.log(`${checks} assertions passed`);
