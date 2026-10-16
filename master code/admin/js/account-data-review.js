
'use strict';
document.addEventListener('DOMContentLoaded',async()=>{
 const api=window.WusoolServices,root=document.getElementById('accountReview');
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const field=(form,name,label,value='',type='text')=>{const l=el('label',label),n=el(type==='textarea'?'textarea':'input');n.name=name;if(type!=='textarea')n.type=type;n.value=value;l.append(n);form.append(l);return n;};
 const action=(parent,label,run)=>{const b=el('button',label);b.type='button';b.onclick=async()=>{b.disabled=true;try{await run();}catch(e){status.textContent=e.message;}finally{b.disabled=false;}};parent.append(b);return b;};
 const status=el('p');status.setAttribute('role','status');root.append(status);
 try{
  if((await api.getCurrentAccount())?.role!=='Admin'){
   const login=el('a','Sign in as Admin');
   const returnTo=location.pathname+location.search;
   login.href='admin-login.html?returnTo='+encodeURIComponent(returnTo);
   root.append(login);
   throw Error('Sign in as Admin in this browser.');
  }
  const [organizations,branches,users]=await Promise.all([api.getOrganizations(),api.getBranches(),api.getUsers()]);
  action(root,'Configure missing branch-local assistants',async()=>{
   let changed=0;const failures=[];
   for(const branch of branches.filter(b=>!b.isDeleted&&b.assistanceCapacity==null)){
    try{
     await api.saveBranch({id:branch.id,assistanceCapacity:1,reason:'User authorized one independent assistant per branch; existing valid capacity preserved.'});
     changed++;
    }catch(error){failures.push(`${branch.name||branch.id}: ${error.message}`);}
    status.textContent=`Branch assistants configured: ${changed}.\n${failures.join('\n')}`;
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   status.textContent=`Missing assistant setup completed. Branches updated: ${changed}.\n${failures.join('\n')}`;
  });
  action(root,'Complete missing booking settings',async()=>{
   let changed=0,servicesChanged=0;const failures=[];
   const valid=(value,min,max)=>typeof value==='number'&&Number.isInteger(value)&&value>=min&&value<=max;
   for(const branch of branches.filter(b=>!b.isDeleted)){
    try{
     const rows=(await api.getTicketServices(branch.id,{manage:true})).items||[];
     let count=0;
     const items=rows.map(row=>{
      const next={...row};
      for(const [key,fallback,min,max] of [['durationMinutes',30,15,120],['capacity',1,1,100],['bufferMinutes',0,0,120]]){
       if(!valid(next[key],min,max)){next[key]=fallback;count++;}
      }
      if(!next.branchId||!next.organizationId||next.configured===false)count++;
      return next;
     });
     if(count&&items.length){await api.saveTicketServices(branch.id,items);changed++;servicesChanged+=items.length;}
     status.textContent=`Reviewed branch: ${branch.name||branch.id}. Branches updated: ${changed}`;
     await new Promise(resolve=>setTimeout(resolve,0));
    }catch(error){failures.push(`${branch.name||branch.id}: ${error.message}`);}
   }
   status.textContent=`Booking settings review complete. Branches updated: ${changed}. Services saved: ${servicesChanged}. Existing valid numeric settings and publication or availability states were preserved.\n${failures.join('\n')}`;
   status.scrollIntoView?.({block:'center'});
  });
  action(root,'Apply approved project hours',async()=>{
   const failures=[];let saved=0;
   for(const branch of branches.filter(b=>!b.isDeleted)){
    try{
     const org=organizations.find(o=>o.id===branch.organizationId&&!o.isDeleted);
     if(!org)throw Error('The associated organization was not found; its relationship must be corrected.');
     const closeTime=org.id==='directory-org-orange'?'17:30':'15:00';
     const workingHours=Object.fromEntries(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map((day,i)=>[day,{isOpen:i<5,openTime:i<5?'08:30':'',closeTime:i<5?closeTime:''}]));
     await api.saveHours('branches',branch.id,{workingHours,specialHours:branch.specialHours||[],closedDates:branch.closedDates||[]},{expectedHoursRevision:Number(branch.hoursRevision)||0,reason:'User-authorized Wusool project schedule: Sunday–Thursday 08:30; Orange shops until 17:30, other institutions until 15:00. Not an official institutional policy.'});
     saved++;
    }catch(error){failures.push(`${branch.name||branch.id}: ${error.message}`);}
    status.textContent=`Branches with reviewed working hours: ${saved}. ${failures.join('\n')}`;
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   status.textContent=`Working hours update completed. Branches: ${saved}. Exceptions and holidays were preserved.\n${failures.join('\n')}`;
  });
  if(!organizations.length)status.textContent='No organizations were found in this browser. Open this page in the Chrome profile that contains your accounts. No data was created or imported.';
  for(const org of organizations.filter(o=>!o.isDeleted)){
   const section=el('section');section.dataset.organizationId=org.id;section.append(el('h2',org.name),el('p',`${org.id} — ${org.status} / ${org.approvalStatus}`));root.append(section);
   action(section,'Approve organization',async()=>{await api.setOrganizationStatus(org.id,'active','Explicit Admin approval from account configuration');status.textContent=org.name+': Organization approved; branch statuses remain unchanged.';});
   const rep=el('form');rep.dataset.representative='';section.append(el('h3','Representative assignment'),rep);
   const select=el('select');select.name='accountId';select.append(new Option('Select an existing project user',''));
   for(const u of users.filter(u=>u.role!=='Admin'&&!u.isDeleted))select.append(new Option(u.name+' — '+u.email,u.id));rep.append(select);
   const branchField=field(rep,'branchIds','Allowed branch IDs (comma-separated; leave empty for all branches)');
   const repReason=field(rep,'reason','Assignment reason');
   const primary=field(rep,'primary','Primary account for password reset','','checkbox');
   primary.checked=true;
   rep.addEventListener('submit',event=>event.preventDefault());
   const permissions={};for(const key of ['serviceManagement','bookingManagement','queueManagement','accessibilityEvidence','reporting','auditHistory'])permissions[key]=field(rep,key,key,'','checkbox');
   action(rep,'Assign existing account',async()=>{const flags=Object.fromEntries(Object.entries(permissions).map(([k,n])=>[k,n.checked]));await api.assignOrganizationRepresentative({organizationId:org.id,accountId:select.value,branchIds:branchField.value.trim()?branchField.value.split(',').map(s=>s.trim()):null,permissions:flags,reason:repReason.value,primary:primary.checked});status.textContent=org.name+': Representative assignment saved. No messages were sent and no accounts were created.';});
   const email=field(rep,'representativeEmail','Authorized project representative email for the existing organization account (not a general contact email)','','email');
   rep.append(el('p','No public sign-up required. This action authorizes the existing organization account or assigns an existing representative and issues temporary credentials. Enter the authorized representative email and the authorization reason.'));
   action(rep,'Authorize organization login',async()=>{const result=await api.adoptOrganization({id:org.id,email:email.value,reason:repReason.value});status.textContent=`${org.name}: ${result.account.email}\nTemporary password (no email sent): ${result.temporaryAccessCode||result.delivery?.message||'Review delivery settings'}`;status.scrollIntoView({block:'center'});});
   action(section,'Reset representative password',async()=>{const result=await api.resetAccountAccess('organizations',org.id);status.textContent=`Login account: ${result.account.email}\nTemporary password: ${result.temporaryAccessCode||result.delivery?.message||'Server delivery'}\nIt must be changed at the first login.`;});
   const grant=el('form');grant.dataset.enterprise='';section.append(el('h3','Enterprise admin grant (no payment)'),grant);
   const reason=field(grant,'reason','Grant reason');
   const start=field(grant,'startDate','Start date',new Date().toISOString().slice(0,10),'date');
   const end=field(grant,'endDate','End date','','date');
   const forever=field(grant,'nonExpiring','Explicit non-expiring grant','','checkbox');
   const limits={};for(const key of ['branches','organizationUsers','aiAnalysesPerMonth']){limits[key]=field(grant,key,key,'','number');limits[key].min=key==='aiAnalysesPerMonth'?'0':'1';limits[key].step='1';}
   const flags={};for(const key of ['serviceManagement','bookingManagement','queueManagement','accessibilityEvidence','reporting','auditHistory'])flags[key]=field(grant,key,key,'','checkbox');
   action(grant,'Save Enterprise grant',async()=>{const entitlements={...Object.fromEntries(Object.entries(limits).map(([k,n])=>[k,n.value===''?null:Number(n.value)])),...Object.fromEntries(Object.entries(flags).map(([k,n])=>[k,n.checked]))};const saved=await api.grantEnterprise({organizationId:org.id,reason:reason.value,entitlements,startDate:start.value,endDate:end.value,nonExpiring:forever.checked});status.textContent=`${org.name}: ${saved.id} — admin-grant — ${saved.nonExpiring?'Non-expiring':saved.endDate}. No payment or purchase.`;});
   const subscriptions=(await api.getSubscriptions({organizationId:org.id})).filter(s=>s.organizationId===org.id);
   for(const s of subscriptions)section.append(el('p',`${s.plan}: ${api.subscriptionState(s)} — ${s.origin||'legacy'} — ${JSON.stringify(s.entitlements||{branches:s.branchLimit})}`));
   const owned=branches.filter(b=>b.organizationId===org.id&&!b.isDeleted);section.append(el('h3',`${owned.length} Saved branches`));
   const active=owned.filter(b=>!['inactive','archived','suspended','rejected'].includes(b.status));
   if(active.length>12)section.append(el('p',`Consolidation review required: ${active.length} active branches exceed the new limit of 12. No branch was deleted or disabled. Review bookings, employees, and services before choosing branches to archive.`));
   for(const branch of owned){
    const details=el('details');details.append(el('summary',`${branch.id} — ${branch.name||branch.branchName} — ${branch.status}`));section.append(details);
    let loaded=false;
    details.addEventListener('toggle',async()=>{
     if(!details.open||loaded)return;loaded=true;
     try{const services=(await api.getTicketServices(branch.id,{manage:true})).items||[];details.append(el('p',`${services.length} registered services`),el('p',services.map(s=>s.name).join(', ')||'Service coverage has not been recorded; no services will be created automatically.'));}
     catch(error){loaded=false;status.textContent=error.message;}
    });
    if(branch.status==='pending')action(section,'Approve selected branch: '+branch.name,async()=>{const saved=await api.setBranchStatus(branch.id,'approved','Explicit individual branch review');status.textContent=saved.name+': Approved and published.';});
   }
  }
 }catch(e){status.textContent=e.message;}
},{once:true});
