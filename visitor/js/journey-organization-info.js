'use strict';
/* Editorial labels identify a stop; only the published service catalog supplies its data. */
(() => {
  const root=document.querySelector('.wusool-journey');if(!root)return;
  const dialog=document.createElement('dialog');dialog.id='journeyOrganizationInfo';dialog.className='journey-organization-dialog';dialog.setAttribute('aria-labelledby','journeyOrganizationInfoTitle');
  const heading=document.createElement('h2');heading.id='journeyOrganizationInfoTitle';
  const close=document.createElement('button');close.type='button';close.className='journey-info-close';close.textContent='×';close.setAttribute('aria-label','Close organization information');
  const header=document.createElement('header');header.append(heading,close);
  const content=document.createElement('div');content.className='journey-info-content';dialog.append(header,content);document.body.append(dialog);
  let current=null,request=0,lastPayload='';
  const el=(tag,cls,en,ar)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(en!==undefined){n.dataset.wusoolEn=en;n.dataset.wusoolAr=ar||en;n.textContent=document.documentElement.lang==='ar'?n.dataset.wusoolAr:en;}return n;};
  const text=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=String(value||'');return n;};
  const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\sـأإآ]/g,c=>/[أإآ]/.test(c)?'ا':'');
  const featureLabels={'ramp':['Step-free ramp','منحدر وصول'],'wide-path':['Wide pathways','ممرات واسعة'],elevator:['Elevator','مصعد'],parking:['Accessible parking','مواقف مهيأة'],restroom:['Accessible restroom','دورة مياه مهيأة'],assistance:['Staff assistance','مساعدة الموظفين'],hearing:['Hearing support','دعم السمع'],'automatic-door':['Automatic doors','أبواب آلية'],braille:['Braille signage','لوحات برايل'],wheelchair:['Wheelchair available','كرسي متحرك متاح']};
  const labels=()=>{close.setAttribute('aria-label',document.documentElement.lang==='ar'?'إغلاق معلومات المؤسسة':'Close organization information');if(current)heading.textContent=current.name[document.documentElement.lang==='ar'?'ar':'en'];};
  function render(items) {
    content.replaceChildren();
    if(!items.length){content.append(el('p','journey-info-empty','No published information for this organization yet. Its details will appear here when they are published on Wusool.','لا توجد معلومات منشورة لهذه المؤسسة حاليًا. ستظهر تفاصيلها هنا عند نشرها على وصول.'));return;}
    const profile=items[0].organizationProfile||{},summary=el('section','journey-info-summary');
    if(profile.name)summary.append(text('h3','',profile.name));
    if(profile.description)summary.append(text('p','',profile.description));
    if(profile.address||profile.city)summary.append(text('p','journey-info-location',[profile.address,profile.city].filter(Boolean).join(' · ')));
    if(profile.phone){const phone=text('a','journey-info-phone',profile.phone),safe=String(profile.phone).replace(/[^+\d]/g,'');if(safe)phone.href='tel:'+safe;summary.append(phone);}
    content.append(summary,el('h3','journey-info-section-title','Published branches','الفروع المنشورة'));
    const grid=el('div','journey-info-branches');
    for(const p of items){
      const card=el('article','journey-info-branch');card.append(text('h4','',p.branchName||p.name));
      if(p.description)card.append(text('p','',p.description));
      if(p.address||p.city)card.append(text('p','journey-info-location',[p.address,p.city].filter(Boolean).join(' · ')));
      if(p.phone)card.append(text('p','',p.phone));
      const features=p.accessibilityFeatures||p.features||[];
      if(features.length){card.append(el('h5','','Accessibility features','تجهيزات إمكانية الوصول'));const list=el('ul','journey-info-features');for(const feature of features){const value=typeof feature==='string'?feature:feature.name||feature.label,pair=featureLabels[value];list.append(pair?el('li','',pair[0],pair[1]):text('li','',value));}card.append(list);}
      if(p.score!=null&&Number.isFinite(Number(p.score))){const metric=el('p','journey-info-score','Accessibility score: '+Number(p.score)+'%','درجة إمكانية الوصول: '+Number(p.score)+'%');card.append(metric);if(p.scoreDescription)card.append(text('small','',p.scoreDescription));}
      if(Number(p.reviewCount)>0&&Number.isFinite(Number(p.rating)))card.append(el('p','','Visitor rating: '+Number(p.rating).toFixed(1)+' / 5 ('+p.reviewCount+')','تقييم الزوار: '+Number(p.rating).toFixed(1)+' / 5 ('+p.reviewCount+')'));
      const hours=p.workingHours;if(hours&&typeof hours==='object'){const schedule=el('details','journey-info-hours');schedule.append(el('summary','','Working hours','أوقات الدوام'));for(const [day,value] of Object.entries(hours)){if(value&&typeof value==='object')schedule.append(text('p','',day+' · '+(value.isOpen?(value.openTime||'')+' — '+(value.closeTime||''):(document.documentElement.lang==='ar'?'مغلق':'Closed'))));}card.append(schedule);}
      const actions=el('div','journey-info-actions'),details=el('a','','View branch details','عرض تفاصيل الفرع'),book=el('a','','Plan a visit','خطط لزيارة');details.href='./place-details.html?id='+encodeURIComponent(p.id||p.placeId);book.href='../../user/html/plan-visit.html?placeId='+encodeURIComponent(p.id||p.placeId);actions.append(details,book);card.append(actions);grid.append(card);
    }
    content.append(grid);window.WusoolPreferences?.refresh();
  }
  async function load(force=false){
    if(!current||!dialog.open)return;const token=++request,stop=current;
    try{const result=await WusoolServices.places(),aliases=stop.aliases.map(normalize),items=result.items.filter(p=>aliases.includes(normalize(p.organizationName))&&(stop.key!=='hospital'||/irbid|إربد|اربد/i.test(p.city)));if(token!==request||!dialog.open||stop!==current)return;const payload=JSON.stringify(items);if(force||payload!==lastPayload){lastPayload=payload;render(items);}}
    catch{if(token===request&&dialog.open){content.replaceChildren(el('p','journey-info-empty','Organization information could not be loaded. Please try again shortly.','تعذّر تحميل معلومات المؤسسة. حاول مرة أخرى بعد قليل.'));}}
  }
  root.querySelectorAll('[data-organization-info]').forEach(button=>{button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',dialog.id);button.addEventListener('click',()=>{current=window.WusoolShowcaseStops.find(s=>s.key===button.dataset.organizationInfo);if(!current)return;labels();content.replaceChildren(el('p','journey-info-empty','Loading organization information…','جاري تحميل معلومات المؤسسة…'));dialog.showModal();close.focus();load(true);});});
  close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{request++;current=null;});document.addEventListener('wxi:language',labels);
  window.WusoolLive?.watch('showcase-organization-information',()=>load());
})();
