// Original Wusool traffic simulator. Metres/seconds; deterministic and renderer independent.
export const signalPhase=t=>{const k=((t%32)+32)%32;return k<13?'green':k<16?'amber':k<18?'all-red':k<29?'cross-green':k<31?'cross-amber':'all-red';};
export function makeRoute(points){const segments=[],lengths=[];let length=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],n=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,start:length,length:n});lengths.push(n);length+=n;}return {points,segments,length};}
export function routePose(route,distance){let d=((distance%route.length)+route.length)%route.length;const seg=route.segments.find(s=>d<s.start+s.length)||route.segments.at(-1),t=(d-seg.start)/seg.length;return {x:seg.a[0]+(seg.b[0]-seg.a[0])*t,z:seg.a[1]+(seg.b[1]-seg.a[1])*t,yaw:Math.atan2(seg.b[0]-seg.a[0],seg.b[1]-seg.a[1])};}
export function distanceAlong(route,x,z){let best=Infinity,out=0;for(const s of route.segments){const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],t=Math.max(0,Math.min(1,((x-s.a[0])*dx+(z-s.a[1])*dz)/(s.length*s.length))),dist=Math.hypot(x-s.a[0]-dx*t,z-s.a[1]-dz*t);if(dist<best){best=dist;out=s.start+s.length*t;}}return out;}
export class TrafficSimulation{
 constructor(route,{count=12,signals=[],yieldAt=[]}={}){this.route=route;this.signals=signals;this.yieldAt=yieldAt;this.time=0;this.cars=Array.from({length:count},(_,i)=>({id:i,d:i*route.length/count,v:0,travel:0,braking:false,lap:0,max:5.8+(i%4)*.45}));this.minimumGap=Infinity;this.redViolations=0;}
 step(dt,obstacles=[]){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.12);this.time+=dt;const phase=signalPhase(this.time);const sorted=[...this.cars].sort((a,b)=>a.d-b.d),updates=[];
 for(let i=0;i<sorted.length;i++){const car=sorted[i],front=sorted[(i+1)%sorted.length],gap=(front.d-car.d+this.route.length)%this.route.length;this.minimumGap=Math.min(this.minimumGap,gap);let limit=gap-7.5,target=car.max;for(const point of obstacles){const distance=distanceAlong(this.route,point.x,point.z),pose=routePose(this.route,distance);if(Math.hypot(pose.x-point.x,pose.z-point.z)<1.2){const ahead=(distance-car.d+this.route.length)%this.route.length;if(ahead>0&&ahead<30)limit=Math.min(limit,ahead-7.5);}}
 for(const s of this.signals){const dist=(s.d-car.d+this.route.length)%this.route.length,green=s.cross?phase==='cross-green':phase==='green';if(!green&&dist<65)limit=Math.min(limit,dist-.8);}
 // Yield at roundabout entry: low approach speed plus a deterministic safe gap window.
 for(const y of this.yieldAt){const dist=(y-car.d+this.route.length)%this.route.length;if(dist<15)target=Math.min(target,2.5);if(dist<10&&((this.time+y)%11)<2.4)limit=Math.min(limit,dist-.8);}
 target=Math.min(target,Math.sqrt(Math.max(0,2*2.8*limit)));const nextV=Math.max(0,car.v+Math.max(-3.8*dt,Math.min(1.7*dt,target-car.v))),travel=Math.min(nextV*dt,Math.max(0,limit));updates.push({car,travel,nextV:travel<nextV*dt?0:nextV,braking:target<car.v-.12});
 }
 for(const u of updates){const old=u.car.d;for(const signal of this.signals){const dist=(signal.d-old+this.route.length)%this.route.length,green=signal.cross?phase==='cross-green':phase==='green';if(dist>0&&dist<=u.travel&&!green)this.redViolations++;}u.car.d=(old+u.travel)%this.route.length;u.car.lap+=u.car.d<old?1:0;u.car.travel+=u.travel;u.car.v=u.nextV;u.car.braking=u.braking;}
 }
 diagnostics(){return {phase:signalPhase(this.time),time:this.time,minGap:this.minimumGap,cars:this.cars.map(c=>({...c,pose:routePose(this.route,c.d)})),redViolations:this.redViolations};}
}

export function mainLaneRoute(xAt){const mainPoints=[];for(let d=72;d<=333;d+=2)mainPoints.push([xAt(d)-1.65,-d]);for(let j=1;j<=16;j++){const a=Math.PI+j*Math.PI/16;mainPoints.push([xAt(333)+Math.cos(a)*1.65,-333+Math.sin(a)*1.65]);}for(let d=333;d>=72;d-=2)mainPoints.push([xAt(d)+1.65,-d]);for(let j=1;j<=16;j++){const a=j*Math.PI/16;mainPoints.push([xAt(72)+Math.cos(a)*1.65,-72+Math.sin(a)*1.65]);}return makeRoute(mainPoints);}
