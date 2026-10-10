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
 journey.classList.toggle('at-academy',atAcademy);journey.dispatchEvent(new CustomEvent('journey-progress',{detail:{p,atAcademy,stations,reduced:reduced.matches}}));};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);new ResizeObserver(schedule).observe(content);
 import('./journey-world.js').then(m=>{m.startWorld(journey);schedule();}).catch(error=>{journey.classList.add('journey-fallback');console.warn('Wusool 3D unavailable; Home content remains usable.',error);});schedule();
})();

