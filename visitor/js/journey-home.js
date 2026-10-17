/* Move real Home sections, preserving their IDs, links and data bindings. */
(() => {
 'use strict';
 const main=document.getElementById('mainContent'),journey=document.querySelector('.wusool-journey');
 if(!journey||!main)return;
 journey.removeAttribute('translate');
 journey.setAttribute('lang','en');journey.setAttribute('translate','yes');
 const content=journey.querySelector('.journey-content'),arrival=journey.querySelector('.academy-stop');
 const hudTop=journey.querySelector('.journey-top'),hudBottom=journey.querySelector('.journey-bottom');journey.append(hudTop,hudBottom);
 const sections=[...main.children].filter(el=>el.tagName==='SECTION'&&el!==journey&&!el.classList.contains('premium-hero'));
 const names=['Places worth exploring','How Wusool works','Understand before you visit','A clearer journey, step by step','Your tools in one place','Wusool for organizations','Designed for everyone','Your next step'];
 sections.forEach((section,index)=>{section.classList.add('journey-stop');section.setAttribute('lang','en');section.setAttribute('translate','yes');section.dataset.station=String(index+1).padStart(2,'0');section.querySelector(':scope > .container')?.setAttribute('data-station',section.dataset.station);section.dataset.journeyName=names[index]||'Explore Wusool';content.insertBefore(section,arrival);});
 const dock=document.getElementById('searchForm');if(dock)journey.querySelector('.journey-intro').appendChild(dock);
 const dialog=document.getElementById('academyDetails');
 const open=()=>{if(!dialog.open)dialog.showModal();};
 journey.querySelector('.academy-hotspot').addEventListener('click',open);
 journey.querySelector('.academy-preview').addEventListener('click',open);
 dialog.querySelector('.academy-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 let frame=0,lastJourneyState=null;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Reveal the whole section only when its leading edge reaches the arrival
 // line (55% of viewport height), rather than when it first enters the screen.
 const panels=sections.map(section=>section.querySelector(':scope > .container')).filter(Boolean);
 panels.push(arrival.querySelector('.academy-arrival-copy'));
 panels.push(...arrival.querySelectorAll('.destination-join'));
 journey.classList.add('journey-popups-enabled');
 panels.forEach(panel=>panel.classList.add('journey-pop-panel'));
 const update=()=>{frame=0;const bounds=journey.getBoundingClientRect();const p=Math.max(0,Math.min(1,-bounds.top/Math.max(1,journey.offsetHeight-innerHeight)));
 panels.forEach(panel=>{
   const section=panel.closest('.journey-stop');
   const rect=section?{top:section.getBoundingClientRect().top+panel.offsetTop,bottom:section.getBoundingClientRect().top+panel.offsetTop+panel.offsetHeight}:panel.getBoundingClientRect();
   if(reduced.matches)panel.classList.add('journey-pop-visible');
   else if(rect.top>=innerHeight||rect.bottom<=0)panel.classList.remove('journey-pop-visible');
   else if(rect.top<=innerHeight*.55)panel.classList.add('journey-pop-visible');
 });
 hudTop.style.top=`${Math.max(0,bounds.top)+24}px`;const visible=bounds.top<innerHeight*.8&&bounds.bottom>=innerHeight;hudTop.style.visibility=visible?'visible':'hidden';hudBottom.style.visibility=visible?'visible':'hidden';
 const joins=arrival.querySelector('.destination-grid')?.getBoundingClientRect();
 if(joins&&joins.top<innerHeight&&joins.bottom>0)hudBottom.style.visibility='hidden';
 const atAcademy=arrival.getBoundingClientRect().top<innerHeight*.65;
 const active=sections.find(s=>{const r=s.getBoundingClientRect();return r.top<innerHeight*.65&&r.bottom>innerHeight*.35;});
 const state=atAcademy?'academy':active?.dataset.station||'intro';if(state!==lastJourneyState){lastJourneyState=state;document.getElementById('journeyDirection').textContent=atAcademy?'You have arrived at Orange Academy':active?.dataset.journeyName||'Your journey starts here';
 document.getElementById('journeyDetail').textContent=atAcademy?'Select the building for details · Continue to the footer':active?`Station ${active.dataset.station} · Keep exploring`:'Through the bridge, toward new opportunities';}
 journey.querySelector('.journey-track-bar span').style.width=`${p*100}%`;document.getElementById('journeyPercent').textContent=`${Math.round(p*100)}%`;
 const stations=sections.map((section,index)=>{
   const panel=section.querySelector(':scope > .container');
   const trigger=(section.getBoundingClientRect().top+panel.offsetTop-bounds.top-innerHeight*.55)/Math.max(1,journey.offsetHeight-innerHeight);
   return {index,progress:Math.max(0,Math.min(.9,trigger)),side:index%2?-1:1,active:panel.classList.contains('journey-pop-visible')};
 });
 const orgs=[...journey.querySelectorAll('.organization-stop')],orgIndex=orgs.findIndex(el=>{const r=el.getBoundingClientRect();return r.top<=0&&r.bottom>0;});let distance=0,focus=0,side=0,key='approach';const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
 if(orgIndex>=0){const el=orgs[orgIndex],t=Math.max(0,Math.min(1,-el.getBoundingClientRect().top/el.offsetHeight)),starts=[80,127,175,220],holds=[92,142,190,235],ends=[127,175,220,262];distance=t<.24?starts[orgIndex]+(holds[orgIndex]-starts[orgIndex])*smooth(t/.24):t<.72?holds[orgIndex]:holds[orgIndex]+(ends[orgIndex]-holds[orgIndex])*smooth((t-.72)/.28);focus=smooth(t/.2)*(1-smooth((t-.74)/.26));side=Number(el.dataset.side);key=el.dataset.stop;}
 else if(arrival.getBoundingClientRect().top<=0){distance=328;key='orange';}
 else if(orgs.at(-1)?.getBoundingClientRect().bottom<=0){const first=sections[0],start=first.getBoundingClientRect().top+scrollY,end=arrival.getBoundingClientRect().top+scrollY;distance=262+66*Math.max(0,Math.min(1,(scrollY-start)/Math.max(1,end-start)));}
 else{const intro=journey.querySelector('.journey-intro');distance=80*Math.max(0,Math.min(1,-intro.getBoundingClientRect().top/intro.offsetHeight));}
 if(orgIndex>=0){const stop=window.WusoolShowcaseStops?.[orgIndex],ar=document.documentElement.dir==='rtl';document.getElementById('journeyDirection').textContent=stop?.name[ar?'ar':'en']||key;document.getElementById('journeyDetail').textContent=ar?'تابع الطريق نحو أورانج':'Continue along the street toward Orange';lastJourneyState=null;}
 orgs.forEach((el,i)=>el.querySelector('.showcase-panel').classList.toggle('is-current',i===orgIndex));
 journey.classList.toggle('at-academy',atAcademy);journey.dispatchEvent(new CustomEvent('journey-progress',{detail:{p,atAcademy,stations,distance,focus,side,key,stopIndex:orgIndex,reduced:reduced.matches}}));};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);new ResizeObserver(schedule).observe(content);
 import('./journey-world.js').then(m=>{m.startWorld(journey);schedule();}).catch(error=>{journey.classList.add('journey-fallback');import('./orange-exploration.js').then(m=>m.mountOrange(journey));console.warn('Wusool 3D unavailable; Home content remains usable.',error);});schedule();
})();

