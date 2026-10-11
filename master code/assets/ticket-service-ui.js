'use strict';
window.WusoolTicketServicesUI = (() => {
  const t = (a,e) => document.documentElement.lang==='ar'?a:e;
  const esc = value => WusoolUI.escape(String(value ?? ''));
  function editor(dialog, booking) {
    const form=dialog.querySelector('form');dialog.classList.add('w-ticket-editor');
    const localized=[];const labelText=(node,a,e)=>{localized.push([node,a,e]);node.textContent=t(a,e);};
    const title=form.querySelector('h2'), footer=form.querySelector('.initial-actions'), error=form.querySelector('[data-error]');
    const layout=document.createElement('div');layout.className='wte-layout';
    const fields=document.createElement('section');fields.className='wte-fields';
    const information=document.createElement('aside');information.className='wte-information';
    const heading=document.createElement('h3');labelText(heading,'المكان والتسهيلات','Place & facilities');information.append(heading,form.querySelector('[data-place-details]'));
    const group=document.createElement('h3');group.className='wte-section-title';labelText(group,'الفرع والموعد','Branch & appointment');fields.append(group);
    let assistanceHeading=false;
    [...form.children].filter(n=>n.tagName==='LABEL').forEach(n=>{
      let label;
      if(n.querySelector('[name=date]'))label=['تفاصيل الموعد','Appointment details'];
      if(!assistanceHeading && n.querySelector('[name=requiresAssistant],[name=durationMinutes]')){label=['المساعدة والمدة','Assistance & duration'];assistanceHeading=true;}
      if(label){const h=document.createElement('h3');h.className='wte-section-title';labelText(h,...label);fields.append(h);}fields.append(n);
    });layout.append(fields,information);title.after(layout);
    const section=document.createElement('fieldset');section.className='wte-services';section.setAttribute('translate','no');footer.before(section,error);
    let version=0, disposed=false, status='idle', selected=booking?.serviceId || '', initialBranch=booking?.branchId;
    const branchId=()=>form.elements.branchId?.value || booking?.branchId || '';
    const value=()=>section.querySelector('input[name="serviceId"]:checked')?.value || '';
    const load=async()=>{
      const id=branchId(), token=++version;status='loading';selected=id===initialBranch?selected:'';initialBranch=id;
      WusoolUI.html(section,`<legend>${t('اختر الخدمة','Choose a service')}</legend><p role="status">${id?t('جارٍ تحميل خدمات الفرع…','Loading branch services…'):t('اختر الفرع أولًا لعرض خدماته.','Select a branch first to see its services.')}</p>`);
      if(!id){status='idle';return;}
      try {
        const response=await WusoolServices.getTicketServices(id);if(disposed||token!==version)return;
        if(!Array.isArray(response?.items) || response.items.some(s=>!s || typeof s.id!=='string' || !s.id || typeof s.name!=='string' || !s.name.trim()) || new Set(response.items.map(s=>s.id)).size!==response.items.length)throw Error(t('استجابة الخدمات غير صالحة.','Invalid service response.'));
        const branch=(await WusoolServices.getBranches()).find(b=>b.id===id);
        if(disposed||token!==version)return;
        if(!branch || response.items.some(s=>s.branchId!==id || s.organizationId!==branch.organizationId))throw Error(t('تعذر التحقق من ملكية خدمات الفرع.','Could not verify branch service ownership.'));
        const services=response.items.filter(s=>s.active!==false && s.available!==false && !s.isDeleted);
        const historical=booking?.serviceId && booking.branchId===id && !services.some(s=>s.id===booking.serviceId);
        if(!services.some(s=>s.id===selected) && !(historical&&selected===booking.serviceId))selected='';
        const choices=[...services,...(historical?[{id:booking.serviceId,name:booking.serviceName||booking.serviceSnapshot?.name||t('الخدمة المحفوظة','Saved service'),description:t('اختيار سابق؛ غير متاح للحجوزات الجديدة.','Historical selection; unavailable for new bookings.'),historical:true}]:[])];
        WusoolUI.html(section,`<legend>${t('اختر الخدمة','Choose a service')}</legend><p class="wte-help">${t('الخدمات التي سجّلتها المؤسسة لهذا الفرع.','Services configured by the organization for this branch.')}</p>${choices.length?`<div class="wte-service-grid">${choices.map(s=>`<label class="wte-service"><input type="radio" name="serviceId" value="${esc(s.id)}" ${selected===s.id?'checked':''} ${!booking||booking.serviceId?'required':''}><span class="wte-service-icon" aria-hidden="true">◇</span><span><strong>${esc(s.name)}</strong>${s.description?`<small>${esc(s.description)}</small>`:''}</span><span class="wte-selected" aria-hidden="true">✓</span></label>`).join('')}</div>`:`<p class="wte-empty" role="status">${t('لم تسجل المؤسسة خدمات لهذا الفرع بعد. يمكنك حفظ التيكت بدون خدمة محددة.','No services configured for this branch yet. You may save a ticket without a selected service.')}</p>`}`);
        section.querySelectorAll('input').forEach(n=>n.addEventListener('change',()=>{selected=n.value;}));status='ready';
      }catch(error){if(disposed||token!==version)return;status='error';WusoolUI.html(section,`<legend>${t('اختر الخدمة','Choose a service')}</legend><p role="alert">${esc(error.message)}</p><button type="button" class="btn btn-outline-secondary" data-retry>${t('إعادة المحاولة','Retry')}</button>`);section.querySelector('[data-retry]').onclick=load;}
    };
    form.elements.branchId?.addEventListener('change',load);const language=()=>{localized.forEach(([node,a,e])=>node.textContent=t(a,e));selected=value()||selected;load();};document.addEventListener('wxi:language',language);load();
    return {validate(){if(status==='loading'||status==='error'){error.textContent=t('انتظر تحميل الخدمات أو أعد المحاولة.','Wait for service loading or retry.');return false;}return true;},selection(){return value() || (booking?.serviceId&&branchId()===booking.branchId?selected:'');},destroy(){disposed=true;version++;form.elements.branchId?.removeEventListener('change',load);document.removeEventListener('wxi:language',language);}};
  }
  async function manage(button) {
    button.disabled=true;
    let dialog;
    try {
      const account=await WusoolServices.getCurrentAccount(), branches=await WusoolServices.getBranches();
      const owned=branches.filter(b=>!b.isDeleted&&(account.role==='Admin'||b.organizationId===account.id));
      dialog=document.createElement('dialog');dialog.className='wusool-initial-dialog w-service-manager';
      WusoolUI.html(dialog,`<form><h2>${t('إدارة خدمات الفروع','Manage branch services')}</h2><p>${t('أضف خدمات فعلية فقط. لا يتغير الدوام أو المدة أو سعة الحجز.','Configure actual services only. Hours, duration and booking capacity remain unchanged.')}</p><label>${t('الفرع','Branch')}<select name="branchId" class="form-select" required><option value="">${t('اختر الفرع','Select branch')}</option>${owned.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('')}</select></label><div data-services></div><button type="button" class="btn btn-outline-primary" data-add disabled>${t('إضافة خدمة','Add service')}</button><p data-error role="alert"></p><div class="initial-actions"><button type="button" class="btn btn-outline-secondary" data-close>${t('إغلاق','Close')}</button><button type="submit" class="btn btn-wusool" disabled>${t('حفظ الخدمات','Save services')}</button></div></form>`);
      const form=dialog.querySelector('form'),list=dialog.querySelector('[data-services]');let records=[],version=0,busy=false;
      const rows=()=>WusoolUI.html(list,records.map((x,i)=>`<article class="wsm-row" data-index="${i}"><label>${t('اسم الخدمة','Service name')}<input name="serviceName${i}" value="${esc(x.name)}" class="form-control" required minlength="2" maxlength="120"></label><label>${t('الوصف','Description')}<textarea name="serviceDescription${i}" class="form-control" maxlength="500">${esc(x.description||'')}</textarea></label><label><input type="checkbox" name="serviceActive${i}" ${x.active!==false?'checked':''}> ${t('فعالة','Active')}</label><label><input type="checkbox" name="serviceAvailable${i}" ${x.available!==false?'checked':''}> ${t('متاحة للحجز','Available for booking')}</label></article>`).join('')||`<p>${t('لا توجد خدمات؛ أضف خدمة فعلية.','No services; add a real service.')}</p>`);
      const collect=()=>records.map((x,i)=>({...x,name:form.elements['serviceName'+i].value.trim(),description:form.elements['serviceDescription'+i].value.trim(),active:form.elements['serviceActive'+i].checked,available:form.elements['serviceAvailable'+i].checked}));
      form.elements.branchId.onchange=async()=>{const token=++version;dialog.querySelector('[data-add]').disabled=true;form.querySelector('[type=submit]').disabled=true;list.textContent=t('جارٍ التحميل…','Loading…');try{if(!form.elements.branchId.value){list.textContent='';return;}const data=await WusoolServices.getTicketServices(form.elements.branchId.value,{manage:true});if(token!==version||!dialog.isConnected)return;records=data.items;rows();dialog.querySelector('[data-add]').disabled=false;form.querySelector('[type=submit]').disabled=false;dialog.querySelector('[data-error]').textContent='';}catch(e){dialog.querySelector('[data-error]').textContent=e.message;list.textContent='';}};
      dialog.querySelector('[data-add]').onclick=()=>{records=collect();if(records.length>=50)return;records.push({name:'',description:'',active:true,available:true});rows();form.elements['serviceName'+(records.length-1)].focus();};
      const close=()=>{if(busy)return;version++;dialog.close();dialog.remove();button.focus();};dialog.querySelector('[data-close]').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
      form.onsubmit=async e=>{e.preventDefault();if(busy||!form.reportValidity())return;busy=true;form.elements.branchId.disabled=true;dialog.querySelector('[data-add]').disabled=true;form.querySelector('[type=submit]').disabled=true;try{const data=await WusoolServices.saveTicketServices(form.elements.branchId.value,collect());records=data.items;rows();dialog.querySelector('[data-error]').textContent=t('تم حفظ الخدمات.','Services saved.');}catch(e){dialog.querySelector('[data-error]').textContent=e.message;}finally{busy=false;form.elements.branchId.disabled=false;dialog.querySelector('[data-add]').disabled=false;form.querySelector('[type=submit]').disabled=false;}};
      document.body.append(dialog);dialog.showModal();
    }catch(e){WusoolUI.toast?WusoolUI.toast(e.message):console.warn(e.message);}finally{button.disabled=false;}
  }
  return {editor,manage};
})();
