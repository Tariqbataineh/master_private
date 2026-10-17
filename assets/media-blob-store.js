'use strict';
// Extend the existing language-change event without rebuilding editors or resetting progress.
window.WusoolMediaI18n=(()=>{
 const pairs=new Map();const text=(a,e)=>{pairs.set(a,[a,e]);pairs.set(e,[a,e]);return document.documentElement.lang==='ar'?a:e;};
 const translate=()=>{const index=document.documentElement.lang==='ar'?0:1;const roots=document.querySelectorAll('.branch-media-tools,.branch-media-card,.media-editor-dialog,.branch-navigation-editor,.indoor-guidance-panel');for(const root of roots){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){const exact=pairs.get(n.textContent.trim());if(exact){n.textContent=n.textContent.replace(n.textContent.trim(),exact[index]);continue;}for(const [source,pair] of pairs){if(n.textContent.startsWith(source+' · ')||n.textContent.startsWith(source+': ')){n.textContent=pair[index]+n.textContent.slice(source.length);break;}}}for(const n of root.querySelectorAll('[aria-label],[alt]'))for(const attr of ['aria-label','alt']){const pair=pairs.get(n.getAttribute(attr));if(pair)n.setAttribute(attr,pair[index]);}}};
 document.addEventListener('wxi:language',translate);window.addEventListener('pagehide',()=>document.removeEventListener('wxi:language',translate),{once:true});return {text};
})();
window.WusoolMediaBlobs=(()=>{
 let pending;const open=()=>pending||=(new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(new Error('Local blob storage unavailable.'));const r=indexedDB.open('wusool.branch-media.blobs',1);r.onupgradeneeded=()=>r.result.createObjectStore('blobs');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Close other Wusool tabs and retry blob storage.'));}));
 const run=async(mode,key,value)=>{const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('blobs',mode),store=tx.objectStore('blobs'),r=mode==='readonly'?store.get(key):value===undefined?store.delete(key):store.put(value,key);let result;r.onsuccess=()=>result=r.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Blob transaction aborted.'));});};
 const key=(branchId,id)=>String(branchId)+':'+String(id);
 // Authorization stays at the service boundary; blobs are a local-development cache.
 return {put:(branchId,id,blob)=>run('readwrite',key(branchId,id),blob),get:(branchId,id)=>run('readonly',key(branchId,id)),remove:(branchId,id)=>run('readwrite',key(branchId,id))};
})();
