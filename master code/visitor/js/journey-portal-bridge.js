'use strict';
// DOM-only organization integration. No geometry, road, camera or scroll pacing changes.
(()=>{
 const root=document.querySelector('.wusool-journey');if(!root)return;
 const normalize=x=>String(x||'').normalize('NFKC').toLowerCase().replace(/[\sـأإآ]/g,c=>/[أإآ]/.test(c)?'ا':'');
 const aliases={bank:['Bank al Etihad','بنك الاتحاد'],hospital:['Irbid Specialty Hospital','مستشفى إربد التخصصي','مستشفى اربد التخصصي'],ministry:['Ministry of Digital Economy and Entrepreneurship','وزارة الاقتصاد الرقمي والريادة'],optimiza:['Civil Status and Passports Department','دائرة الأحوال المدنية والجوازات']};
 const key='wusool.journey.return.v1';
 function remember(){try{sessionStorage.setItem(key,JSON.stringify({y:scrollY,at:Date.now()}));}catch{}}
 document.addEventListener('click',e=>{const link=e.target.closest('a');if(link&&(root.contains(link)||link.closest('#journeyOrganizationInfo'))&&/\/user\/html\//.test(link.href))remember();});
 async function bind(){try{const c=await WusoolServices.portal.catalog();for(const link of root.querySelectorAll('a[href*="organization-services.html"]')){
   const u=new URL(link.href),showcase=u.searchParams.get('showcase');if(!showcase)continue;
   const configured=window.WusoolApiConfig.showcaseOrganizationIds?.[showcase];
   const candidates=configured?c.organizations.filter(o=>o.id===configured):c.organizations.filter(o=>(aliases[showcase]||[]).some(n=>normalize(n)===normalize(o.name)));
   if(candidates.length!==1){link.href='../../user/html/service-directory.html?showcase='+encodeURIComponent(showcase);link.dataset.wusoolEn='Browse published organizations';link.dataset.wusoolAr='استعرض المؤسسات المنشورة';continue;}
   const o=candidates[0];link.href='../../user/html/organization-services.html?organizationId='+encodeURIComponent(o.id);link.setAttribute('aria-label',(document.documentElement.lang==='ar'?'استعرض خدمات ':'Explore services: ')+o.name);
   const panel=link.closest('.showcase-panel');if(panel&&!panel.querySelector('[data-live-services]')){const p=document.createElement('p');p.dataset.liveServices='';p.className='showcase-record-status';p.textContent=o.serviceKeys.length?(document.documentElement.lang==='ar'?'خدمات منشورة: ':'Published services: ')+c.services.filter(s=>s.organizationId===o.id).slice(0,3).map(s=>s.name).join(' · '):(document.documentElement.lang==='ar'?'لا توجد خدمات متاحة للحجز بعد.':'No bookable services yet.');panel.append(p);}
 }window.WusoolPreferences?.refresh();}catch{ /* Existing information dialogs and map links remain usable. */ }}
 WusoolUI.enqueue(bind);
 if(new URLSearchParams(location.search).get('returnJourney')==='1'){try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved&&Number.isFinite(saved.y)&&Date.now()-saved.at<86400000){window.addEventListener('load',()=>requestAnimationFrame(()=>{scrollTo({top:saved.y,behavior:'instant'});window.dispatchEvent(new Event('scroll'));}),{once:true});}}catch{}}
})();
