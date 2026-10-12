import * as THREE from '../../assets/vendor/three.module.js';
// Original deterministic PBR assets, authored for Wusool. No remote texture dependency.
const surfaces=new Map();
export function surfaceMaps(kind='stone'){
 if(surfaces.has(kind))return surfaces.get(kind);
 const n=512,base={stone:[207,200,184],plaster:[239,238,234],grass:[107,116,85],concrete:[183,185,182],paving:[183,181,169],asphalt:[65,69,70],wood:[156,154,145],walnut:[95,77,60],fabric:[37,42,43],bark:[98,88,71],soil:[71,68,54]}[kind]||[207,200,184];
 const h=new Float32Array(n*n),rgb=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4),normal=new Uint8Array(n*n*4),ao=new Uint8Array(n*n*4);
 const wave=(x,y)=>Math.sin(x*.073+Math.sin(y*.037)*2)*.35+Math.cos(y*.093+x*.024)*.25+Math.sin(x*.31-y*.23)*.1;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=y*n+x,k=i*4,hash=((x*73856093)^(y*19349663))>>>0,grain=(hash%997)/997-.5;
  let v=wave(x,y),height=v*.07,seam=0;
  if(kind==='stone'||kind==='paving'){const row=Math.floor(y/128),xx=(x+(row%2)*128)%256,yy=y%128;seam=Math.min(xx,256-xx,yy,128-yy)<1.5?1:0;v+=Math.sin(row*43+Math.floor((x+(row%2)*128)/256)*51)*.6;height-=seam*.45;}
  if(kind==='wood'||kind==='walnut'){v=Math.sin(x*.17+Math.sin(y*.014)*2)+Math.sin(x*.7+y*.007)*.15;seam=x%128<1?1:0;height=v*.012-seam*.15;}
  if(kind==='fabric'){v=(Math.sin(x*Math.PI/2)+Math.sin(y*Math.PI/2))*.2;height=v*.025;}
  if(kind==='bark'){v=Math.sin(x*.22+Math.sin(y*.025))*1.8;height=v*.08;}
  if(kind==='plaster'){v*=.06;height*=.025;}if(kind==='wood'||kind==='walnut')v*=.45;
  const detail=kind==='asphalt'?grain*13:grain*3;
  for(let c=0;c<3;c++)rgb[k+c]=base[c]+v*4+detail-seam*22;rgb[k+3]=255;h[i]=height;
  const r=kind==='asphalt'?239:kind==='fabric'?235:kind==='wood'?166:203;
  rough.fill(Math.max(0,Math.min(255,r+v*8+grain*5)),k,k+3);rough[k+3]=255;ao.fill(255-seam*28,k,k+3);ao[k+3]=255;
 }
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=(y*n+x)*4,dx=h[y*n+(x+1)%n]-h[y*n+(x+n-1)%n],dy=h[((y+1)%n)*n+x]-h[((y+n-1)%n)*n+x];const len=Math.hypot(dx,dy,1);normal[k]=128-dx/len*127;normal[k+1]=128+dy/len*127;normal[k+2]=128+127/len;normal[k+3]=255;}
 const tex=(data,color=false)=>{const t=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;if(color)t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;};
 const result={map:tex(rgb,true),roughnessMap:tex(rough),normalMap:tex(normal),aoMap:tex(ao),normalScale:new THREE.Vector2(.35,.35),aoMapIntensity:.35};surfaces.set(kind,result);return result;
}
export function pbr(kind,color='#ffffff',extra={}){return new THREE.MeshStandardMaterial({color,roughness:1,...surfaceMaps(kind),...extra});}
export function architecturalTexture(kind,repeatX=1,repeatY=repeatX){const t=surfaceMaps(kind).map.clone();t.repeat.set(repeatX,repeatY);t.needsUpdate=true;return t;}
export function reflectionEnvironment(renderer,night){
 const w=256,h=128,a=new Float32Array(w*h*4);const sun=new THREE.Vector3(-35,55,50).normalize();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const theta=(1-y/h)*Math.PI,phi=x/w*Math.PI*2,dir=new THREE.Vector3(-Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi));const t=Math.max(0,dir.y),below=dir.y<0;const horizon=night?[.042,.061,.10]:[.74,.82,.88],zenith=night?[.008,.016,.039]:[.22,.44,.68];const glow=!night?Math.pow(Math.max(0,dir.dot(sun)),700)*9:0;const k=(y*w+x)*4;for(let c=0;c<3;c++)a[k+c]=below?(night?[.008,.009,.012]:[.16,.17,.14])[c]:horizon[c]*(1-t)+zenith[c]*t+glow*[1,.89,.73][c];a[k+3]=1;}
 const t=new THREE.DataTexture(a,w,h,THREE.RGBAFormat,THREE.FloatType);t.mapping=THREE.EquirectangularReflectionMapping;t.needsUpdate=true;const g=new THREE.PMREMGenerator(renderer),out=g.fromEquirectangular(t);g.dispose();out.sky=t;return out;
}
