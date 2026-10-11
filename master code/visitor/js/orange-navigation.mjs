// Fixed local world axes: entry faces -Z; right corridor +X; services -X.
export const clamp = n => Math.max(0, Math.min(1,n));
const P=(x,z,lx=x,lz=z-3,y=2.05)=>({position:[x,y,z],look:[lx,y-.12,lz]});
export const paths={
 approach:[P(5.5,28,0,8,1.75),P(2,22,0,8,1.8),P(0,14,0,5,1.9),P(0,9,0,3,2.05),P(0,5.4,-2.4,2.8),P(0,6,0,2.4)],
 right:[P(0,0,4,0),P(4,0,8,0),P(13,0,17,0),P(19,0,23,0)],
 left:[P(0,0,-4,0),P(-5,0,-9,0),P(-12,0,-16,0),P(-17,0,-21,0)],
 classroom:[P(4,-2.8,7,-7),P(4,-3.2,7,-7),P(3.8,-8,8,-11),P(3.8,-13,8,-13.6),P(6.8,-13.3,8,-8)],
 coaches:[P(13,-2.8,16,-4),P(13,-3,16,-4),P(13,-7,16,-4),P(16,-7.3,15.5,-3.8)],
 manager:[P(20.8,0,25,-2),P(21.5,0,25,-2),P(24,0,25,-2),P(24,2.4,25,-2)],
 kitchen:[P(-8,-2.8,-12,-6),P(-8,-3.2,-12,-6),P(-11,-4.2,-14,-6),P(-14,-4.2,-14,-6.5)],
 accessible:[P(-5,2.8,-6,5),P(-5,3,-6,5),P(-6,3.5,-6.5,5.5),P(-6.2,3.5,-2.5,5.8)],
 standard:[P(-12,2.8,-13,5),P(-12,3,-13,5),P(-13,3,-13.5,5.5),P(-13.2,3.2,-9.65,5.8)]
};
export const rooms={
 classroom:{route:'right',at:4/19,label:['Classroom','قاعة التدريب']},
 coaches:{route:'right',at:13/19,label:["Coaches’ office",'مكتب المدربين']},
 manager:{route:'right',at:1,label:["Manager’s office",'مكتب المدير']},
 kitchen:{route:'left',at:8/17,label:['Kitchen','المطبخ']},
 accessible:{route:'left',at:5/17,label:['Accessible restroom','دورة مياه مهيأة']},
 standard:{route:'left',at:12/17,label:['Standard restroom','دورة مياه عادية']}
};
export function sample(path,p){
 // Arc length parameterization; all camera segments remain inside clear aisles.
 const lengths=path.slice(1).map((v,i)=>Math.hypot(...v.position.map((a,j)=>a-path[i].position[j]))),total=lengths.reduce((a,b)=>a+b,0);
 let distance=clamp(p)*total,index=0;
 while(index<lengths.length-1&&distance>lengths[index])distance-=lengths[index++];
 const t=lengths[index]?clamp(distance/lengths[index]):0,a=path[index],b=path[index+1];
 return {position:a.position.map((v,j)=>v+(b.position[j]-v)*t),look:a.look.map((v,j)=>v+(b.look[j]-v)*t)};
}
// Corridor poses use linear progress so doorway checkpoints stay exact.
export function corridorPose(route,p){const x=(route==='right'?19:-17)*clamp(p);return P(x,0,x+(route==='right'?4:-4),0);}
export class OrangeNavigation {
 constructor(){this.state='exterior';this.progress=0;this.route=null;this.room=null;this.parent=null;this.transition=null;this.lockUntil=0;this.boundaryAt=0;this.revision=0;}
 pose(){if(this.state==='room')return sample(paths[this.room],this.progress);if(this.state==='corridor')return corridorPose(this.route,this.progress);return sample(paths.approach,this.progress);}
 begin(kind,target,now){if(this.transition||now<this.lockUntil)return false;this.transition={kind,from:this.pose(),target,start:now,duration:kind==='exit'?1400:900};this.revision++;return true;}
 choose(route,now=performance.now()){if(this.state!=='reception'||!['right','left'].includes(route))return false;return this.begin('route',{route,pose:corridorPose(route,0)},now);}
 explore(id,now=performance.now()){const room=rooms[id];if(!room||this.state!=='corridor'||room.route!==this.route||Math.abs(this.progress-room.at)>.13)return false;
 this.parent={route:this.route,progress:this.progress,pose:this.pose()};return this.begin('entry',{room:id,pose:paths[id][0]},now);}
 exit(now=performance.now()){if(this.state!=='room'||!this.parent)return false;
 // Exit first reverses the room tour, then uses the original doorway and parent pose.
 return this.begin('exit',{pose:this.parent.pose},now);}
 finish(now){if(!this.transition)return;const {kind,target}=this.transition;this.transition=null;
 if(kind==='route'){this.route=target.route;this.state='corridor';this.progress=0;}
 if(kind==='entry'){this.room=target.room;this.state='room';this.progress=0;}
 if(kind==='exit'){this.route=this.parent.route;this.progress=this.parent.progress;this.state='corridor';this.room=null;this.parent=null;}
 this.lockUntil=now+280;this.boundaryAt=now;this.revision++;}
 move(delta,now=performance.now(),fresh=true){if(this.transition||now<this.lockUntil||!Number.isFinite(delta))return false;delta=Math.max(-.055,Math.min(.055,delta));
 if(this.state==='reception'){if(delta<0){this.state='entrance';this.progress=.995;}else return false;}
 if(this.state==='room'&&this.progress===0&&delta<0){if(fresh&&now-this.boundaryAt>350)return this.exit(now);return false;}
 if(this.state==='corridor'&&this.progress===0&&delta<0){if(fresh&&now-this.boundaryAt>350){this.state='reception';this.route=null;this.progress=1;this.lockUntil=now+280;this.revision++;return true;}return false;}
 const old=this.progress;this.progress=clamp(this.progress+delta);
 if(old>0&&this.progress===0)this.boundaryAt=now;
 if(['exterior','entrance'].includes(this.state))this.state=this.progress===1?'reception':this.progress>.58?'entrance':'exterior';
 this.revision++;return true;}
 snapshot(){return {state:this.transition?'transition':this.state,phase:this.transition?.kind,progress:this.progress,route:this.route,room:this.room||this.transition?.target.room,parent:this.parent&&{route:this.parent.route,progress:this.parent.progress},revision:this.revision};}
}
