'use strict';
WusoolUI.enqueue(async()=>{
 if(!await WusoolUI.guard())return;
 const local=WusoolServices.mode==='local';
 WusoolUI.message(local?'Local browser metadata only. This list cannot revoke server or cross-device sessions.':'Session data and revocation are supplied by the backend.','info');
 let sessions=[];const list=document.getElementById('sessionsList');
 const render=()=>WusoolUI.html(list,sessions.map(item=>`<div class="admin-feature-row"><span class="item-icon"><i class="bi bi-laptop"></i></span><div class="flex-grow-1"><strong class="d-block">${WusoolUI.escape(local?'Current browser metadata':item.device||'Server session')}</strong><small class="text-secondary">${WusoolUI.escape(item.lastActive||'')}</small></div><span class="badge ${item.active?'badge-soft-success':'badge-soft-danger'}">${item.active?'Active':'Ended'}</span></div>`).join('')||'<p>No sessions returned.</p>');
 const refresh=async()=>{if(local)sessions=[{id:'current-browser',device:navigator.userAgent,lastActive:new Date().toISOString(),current:true,active:true}];else{const result=await WusoolServices.request('/admin/sessions');if(!Array.isArray(result?.items))throw new Error('Invalid session list response.');sessions=result.items;}render();};
 WusoolUI.listen(document.getElementById('terminateDemoSessions'),'click',async()=>{if(local){WusoolUI.message('Server session revocation is unavailable in local development. No server session was ended.','info');return;}const ids=sessions.filter(s=>!s.current&&s.active).map(s=>s.id);if(!ids.length){WusoolUI.message('No other active sessions to revoke.','info');return;}const result=await WusoolServices.external('admin/sessions/revoke',{ids});if(result?.revokedCount==null)throw new Error('Session revocation was not confirmed.');await refresh();WusoolAdmin.toast(`${result.revokedCount} server sessions revoked.`);});
 await refresh();
});
