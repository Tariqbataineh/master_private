'use strict';
window.WusoolBookingTracking = (() => {
  const escape = (value) => WusoolUI.escape(String(value ?? ''));
  const coordinate = (p) => {
    const lat = p?.latitude ?? p?.lat, lng = p?.longitude ?? p?.lng;
    if (lat === '' || lng === '' || lat == null || lng == null) return null;
    const point = {lat: Number(lat), lng: Number(lng)};
    return Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180 ? point : null;
  };
  function mount(dialog, context) {
    const translations = new Map();
    const t = (a, e) => {translations.set(a, [a,e]);translations.set(e,[a,e]);return document.documentElement.lang === 'ar' ? a : e;};
    const stages = [
      ['pending', 'طلب الحجز', 'Booking request'], ['confirmed', 'تأكيد الموعد', 'Confirmed appointment'],
      ['on-the-way', 'بالطريق', 'On the way'], ['arrived', 'وصلت', 'Arrived'],
      ['serving', 'تم الاستقبال', 'Being served'], ['completed', 'اكتملت الزيارة', 'Visit completed'],
    ];
    const original = dialog.querySelector('form > ol');
    if (!original) return () => {};
    dialog.classList.add('booking-tracking-dialog');
    const host = document.createElement('section'); host.className = 'bt-track'; host.setAttribute('translate','no');
    original.before(host); original.remove();
    WusoolUI.html(host, `<div class="bt-heading"><div><span class="bt-eyebrow">${t('رحلتك · تفاصيل حقيقية','Your visit · real details')}</span><h3 data-place></h3><p data-address></p><p data-service></p></div><span class="bt-state" data-state></span></div><div class="bt-map" role="region" aria-label="${t('خريطة موقع الفرع','Branch location map')}"><div data-map></div><p class="bt-map-message" data-map-message role="status">${t('جارٍ تحميل الخريطة…','Loading map…')}</p></div><div class="bt-map-tools"><button type="button" class="btn btn-outline-primary" data-locate>${t('موقعي ومسار الوصول','My location & route')}</button><a data-directions class="btn btn-outline-secondary" target="_blank" rel="noopener noreferrer">${t('فتح الاتجاهات','Open directions')}</a><small>${t('الموقع يطلب بإذنك، ولا يُشارك مع الحسابات الأخرى.','Location is requested with your permission and is not shared with other accounts.')}</small></div><div class="bt-stage-heading"><h3>${t('مسار الزيارة','Visit progress')}</h3><p>${t('اسحب بين المحطات أو اخترها لعرض التفاصيل. السحب لا يغيّر حالة الحجز.','Drag between stops or select one to explore details. Dragging does not change booking status.')}</p></div><div class="bt-stages" role="group" aria-label="${t('محطات الزيارة','Visit stages')}">${stages.map((s,i)=>`<button type="button" draggable="true" data-stage="${i}" class="bt-stop"><span>${i+1}</span><strong>${t(s[1],s[2])}</strong></button>`).join('')}</div><div class="bt-detail" aria-live="polite"><span data-step dir="ltr"></span><h4 data-title></h4><p data-detail></p></div><div class="bt-navigation"><button type="button" class="btn btn-outline-secondary" data-prev>${t('السابق','Previous')}</button><button type="button" class="btn btn-outline-primary" data-current>${t('المرحلة الحالية','Current stage')}</button><button type="button" class="btn btn-outline-secondary" data-next>${t('التالي','Next')}</button></div><div class="bt-authorized"><h4>${t('الإجراءات المتاحة لحسابك','Actions available to your account')}</h4><div data-actions></div></div><details class="bt-history"><summary>${t('سجل التحديثات · توقيت الأردن','Update history · Jordan time')}</summary><ol data-history></ol></details>`);
    let disposed = false, selected = null, booking, branch, fingerprint = '', map, marker, markerClass, mappedPoint, renderer, polylines = [], requestId = 0;
    const message = (text) => { const n=host.querySelector('[data-map-message]'); n.textContent=text; n.hidden=!text; };
    const currentIndex = (b) => {const key = b.journeyState; if (['on-the-way','arrived','serving','completed'].includes(key)) return stages.findIndex(s=>s[0]===key); return b.status === 'completed' ? 5 : ['confirmed','in-progress'].includes(b.status) ? 1 : 0;};
    const time = (at) => {const date = new Date(at);return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(document.documentElement.lang==='ar'?'ar-JO':'en-GB',{timeZone:'Asia/Amman',dateStyle:'medium',timeStyle:'short'}).format(date) : '';};
    const select = (i) => {
      selected = Math.max(0, Math.min(5,i));
      host.querySelectorAll('[data-stage]').forEach((n,j)=>{n.classList.toggle('is-selected',j===selected);n.setAttribute('aria-pressed',String(j===selected));});
      host.querySelector('[data-step]').textContent=`${selected+1} / 6`;
      host.querySelector('[data-title]').textContent=t(stages[selected][1],stages[selected][2]);
      const event=(booking.journeyHistory||[]).filter(h=>h.to===stages[selected][0]).at(-1);
      host.querySelector('[data-detail]').textContent=event ? [time(event.at), event.actorName||event.actorRole, event.reason].filter(Boolean).join(' · ') : selected===0 ? `${booking.date||''} · ${booking.time||''} · ${t('توقيت الأردن','Jordan time')}` : t('لا يوجد تحديث مسجل لهذه المرحلة بعد.','No recorded update for this stage yet.');
      host.querySelector('[data-prev]').disabled=selected===0;host.querySelector('[data-next]').disabled=selected===5;
    };
    const rowActions = () => [...context.panel.querySelectorAll('.booking-actions')].find(group => [...group.querySelectorAll('[data-id]')].some(n=>String(n.dataset.id)===String(context.booking.id)));
    const update = () => {
      const data=context.read(); booking=data.booking;branch=data.branch;
      if (!booking) {host.querySelector('[data-state]').textContent=t('الحجز غير متاح','Booking unavailable');host.querySelector('[data-actions]').replaceChildren();return;}
      const signature=JSON.stringify([booking, rowActions()?.innerHTML,document.documentElement.lang]);if(signature===fingerprint)return;fingerprint=signature;
      const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const pair=translations.get(node.textContent);if(pair)node.textContent=pair[document.documentElement.lang==='ar'?0:1];else{for(const [source,value] of translations){if(node.textContent.startsWith(source+' · ')){node.textContent=value[document.documentElement.lang==='ar'?0:1]+node.textContent.slice(source.length);break;}}}}
      host.querySelectorAll('[aria-label]').forEach(n=>{const pair=translations.get(n.getAttribute('aria-label'));if(pair)n.setAttribute('aria-label',pair[document.documentElement.lang==='ar'?0:1]);});
      host.querySelector('[data-place]').textContent=branch?.name||branch?.branchName||booking.branchName||booking.locationSnapshot?.branchName||t('موقع الزيارة','Visit destination');
      host.querySelector('[data-service]').textContent=t('الخدمة: ','Service: ')+(booking.serviceName||booking.serviceSnapshot?.name||booking.destination||t('غير محددة في هذا الحجز','Not selected for this booking'));
      host.querySelector('[data-address]').textContent=[branch?.address||booking.locationSnapshot?.address,branch?.city||booking.locationSnapshot?.city].filter(Boolean).join(' · ');
      const stateLabels={pending:t('بانتظار الموافقة','Pending approval'),confirmed:t('مؤكد','Confirmed'),'in-progress':t('قيد التنفيذ','In progress'),completed:t('مكتمل','Completed'),cancelled:t('ملغي','Cancelled'),waitlisted:t('قائمة الانتظار','Waitlisted'),'no-show':t('لم يحضر','No-show')};
      host.querySelector('[data-state]').textContent=stateLabels[booking.status]||booking.status;
      host.querySelectorAll('[data-stage]').forEach((n,i)=>{n.classList.toggle('is-current',i===currentIndex(booking));n.classList.toggle('is-reached',i<=currentIndex(booking));});
      select(selected ?? currentIndex(booking));
      if(map && markerClass){const point=coordinate(branch)||coordinate(booking.locationSnapshot),key=JSON.stringify(point);if(key!==mappedPoint){if(marker)marker.setMap(null);if(point){marker=new markerClass({map,position:point,title:host.querySelector('[data-place]').textContent,icon:{path:'M0,-30 C-11,-30 -18,-23 -18,-13 C-18,0 0,17 0,17 C0,17 18,0 18,-13 C18,-23 11,-30 0,-30 Z',fillColor:'#d72f35',fillOpacity:1,strokeColor:'#fff',strokeWeight:2,scale:.8}});map.panTo(point);}mappedPoint=key;}}
      const actions=host.querySelector('[data-actions]');actions.replaceChildren();
      for(const source of rowActions()?.querySelectorAll('button,a,.booking-action-note')||[]) {
        if(source.dataset.journey==='history')continue;
        const copy=source.cloneNode(true);for(const attr of [...copy.attributes])if(attr.name.startsWith('data-'))copy.removeAttribute(attr.name);
        if(copy.tagName==='BUTTON') {copy.type='button';copy.onclick=()=>{const key=['journey','visitAction','edit','cancel','delete','progress','approve'].find(k=>source.dataset[k]!==undefined);const fresh=[...rowActions()?.querySelectorAll('button')||[]].find(n=>key?n.dataset[key]===source.dataset[key]:n.textContent===source.textContent);if(!fresh||fresh.disabled)return;context.close();fresh.click();};}
        actions.append(copy);
      }
      if(!actions.children.length)actions.textContent=t('لا توجد إجراءات متاحة حاليًا.','No actions are available right now.');
      WusoolUI.html(host.querySelector('[data-history]'),(booking.journeyHistory||[]).map(h=>`<li><strong>${escape(stages.find(s=>s[0]===h.to)?.[document.documentElement.lang==='ar'?1:2]||stateLabels[h.to]||h.to)}</strong><time>${escape(time(h.at))}</time><p>${escape(h.actorName||h.actorRole)} ${escape(h.reason)}</p></li>`).join('')||`<li>${t('لا يوجد سجل بعد.','No updates recorded yet.')}</li>`);
      const directions=WusoolServices.journey.directions(booking),link=host.querySelector('[data-directions]');link.hidden=!directions.available;if(directions.available)link.href=directions.url;
    };
    host.querySelectorAll('[data-stage]').forEach((n,i)=>{
      n.onclick=()=>select(i);n.ondragstart=e=>{e.dataTransfer.setData('text/wusool-stage',String(i));e.dataTransfer.effectAllowed='move';};
      n.ondragover=e=>{e.preventDefault();n.classList.add('is-drop');};n.ondragleave=()=>n.classList.remove('is-drop');
      n.ondrop=e=>{e.preventDefault();n.classList.remove('is-drop');if(e.dataTransfer.getData('text/wusool-stage')!=='')select(i);};
    });
    // Horizontal touch/pointer swipe selects adjacent stops without mutating a booking.
    const rail=host.querySelector('.bt-stages');let startX;
    rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')startX=e.clientX;});
    rail.addEventListener('pointerup',e=>{if(startX!=null && Math.abs(e.clientX-startX)>45)select(selected+(e.clientX>startX?-1:1));startX=null;});
    host.querySelector('[data-prev]').onclick=()=>select(selected-1);host.querySelector('[data-next]').onclick=()=>select(selected+1);host.querySelector('[data-current]').onclick=()=>select(currentIndex(booking));
    let indoorCleanup=null;
    if(window.WusoolIndoorGuidance){const button=document.createElement('button');button.type='button';button.className='btn btn-outline-primary';button.textContent=t('التوجيه داخل الفرع','Indoor branch guidance');host.querySelector('.bt-authorized').append(button);button.onclick=async()=>{if(indoorCleanup&&host.querySelector('.indoor-guidance-panel')){indoorCleanup();indoorCleanup=null;return;}indoorCleanup=null;if(button.disabled)return;button.disabled=true;const indoor=document.createElement('section');host.append(indoor);try{indoorCleanup=await WusoolIndoorGuidance.mount(indoor,context.booking.id);}catch(error){indoor.textContent=error.message;}finally{button.disabled=false;}};}
    update();
    const observer=new MutationObserver(update);observer.observe(context.panel,{childList:true,subtree:true});const timer=setInterval(update,1000);document.addEventListener('wxi:language',update);
    const failure=window.WusoolMapsLoader?.onFailure(()=>message(t('تعذر تحميل Google Maps. استخدم فتح الاتجاهات.','Google Maps could not load. Use Open directions.')));
    let appliedTheme=null;
    const applyMapTheme=()=>{
      if(!map)return;
      const dark=document.documentElement.getAttribute('data-wusool-color-mode')==='dark';
      if(appliedTheme===dark)return;appliedTheme=dark;
      // Existing RASTER map has no mapId: supported styles can be changed in place.
      // Satellite imagery itself cannot be recolored by Maps styling.
      map.setOptions({styles:dark?[{elementType:'geometry',stylers:[{color:'#102536'}]},{elementType:'labels.text.fill',stylers:[{color:'#b6cede'}]},{elementType:'labels.text.stroke',stylers:[{color:'#102536'}]},{featureType:'road',elementType:'geometry',stylers:[{color:'#274052'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#071c2e'}]},{featureType:'poi',elementType:'labels',stylers:[{visibility:'off'}]}]:[{featureType:'poi',elementType:'labels',stylers:[{visibility:'off'}]}]});
    };
    const themeObserver=new MutationObserver(applyMapTheme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-wusool-color-mode']});
    const initialize=async()=>{
      try {
        const [maps,markers]=await Promise.all([WusoolMapsLoader.library('maps'),WusoolMapsLoader.library('marker')]);if(disposed)return;
        const point=coordinate(branch)||coordinate(booking.locationSnapshot);map=new maps.Map(host.querySelector('[data-map]'),{center:point||{lat:31.95,lng:35.91},zoom:point?16:7,clickableIcons:false,renderingType:'RASTER',styles:[{featureType:'poi',elementType:'labels',stylers:[{visibility:'off'}]}],gestureHandling:'cooperative',streetViewControl:false,mapTypeControl:true,fullscreenControl:true});
        applyMapTheme();markerClass=markers.Marker;mappedPoint=JSON.stringify(point);
        if(point)marker=new markers.Marker({map,position:point,title:host.querySelector('[data-place]').textContent,icon:{path:'M0,-30 C-11,-30 -18,-23 -18,-13 C-18,0 0,17 0,17 C0,17 18,0 18,-13 C18,-23 11,-30 0,-30 Z',fillColor:'#d72f35',fillOpacity:1,strokeColor:'#fff',strokeWeight:2,scale:.8}});
        message(point?'':t('موقع الفرع غير مؤكد بالإحداثيات. الخريطة تعرض الأردن، والاتجاهات تبحث بالعنوان.','Branch coordinates are not confirmed. The map shows Jordan; directions use the address.'));
      }catch{if(!disposed)message(t('الخريطة غير متاحة الآن. يمكنك فتح الاتجاهات.','Map unavailable right now. You can open directions.'));}
    };initialize();
    host.querySelector('[data-locate]').onclick=()=>{
      const destination=coordinate(branch)||coordinate(booking.locationSnapshot);
      if(!map||!destination){message(t('يلزم تحميل الخريطة وموقع فرع مؤكد لرسم المسار.','A loaded map and confirmed branch coordinates are required for a route.'));return;}
      if(!navigator.geolocation){message(t('تحديد الموقع غير مدعوم.','Geolocation is unavailable.'));return;}
      const token=++requestId;message(t('جارٍ تحديد موقعك بإذنك…','Locating you with your permission…'));
      navigator.geolocation.getCurrentPosition(async pos=>{
        try {const routes=await WusoolMapsLoader.library('routes');if(disposed||token!==requestId)return;
          const origin={lat:pos.coords.latitude,lng:pos.coords.longitude};let distance, duration;
          if(routes.Route?.computeRoutes) {
            const result=await routes.Route.computeRoutes({origin,destination,travelMode:'DRIVING',fields:['path','distanceMeters','durationMillis']});
            if(disposed||token!==requestId)return;const route=result.routes?.[0];if(!route)throw new Error('NO_ROUTE');
            polylines.forEach(p=>p.setMap(null));renderer?.setMap(null);polylines=route.createPolylines({polylineOptions:{strokeColor:'#008780',strokeWeight:6}});polylines.forEach(p=>p.setMap(map));
            const bounds=new google.maps.LatLngBounds();route.path.forEach(p=>bounds.extend(p));map.fitBounds(bounds,48);
            distance=Number.isFinite(route.distanceMeters)?`${(route.distanceMeters/1000).toFixed(1)} km`:'';duration=Number.isFinite(route.durationMillis)?`${Math.ceil(route.durationMillis/60000)} min`:'';
          } else {
            const result=await new routes.DirectionsService().route({origin,destination,travelMode:'DRIVING'});if(disposed||token!==requestId)return;
            renderer?.setMap(null);polylines.forEach(p=>p.setMap(null));renderer=new routes.DirectionsRenderer({map});renderer.setDirections(result);
            const leg=result.routes[0]?.legs[0];distance=leg?.distance?.text;duration=leg?.duration?.text;
          }
          message([t('مسار قيادة مقترح من موقع جهازك، وليس تتبعًا مباشرًا.','Suggested driving route from your device, not live tracking.'),distance,duration].filter(Boolean).join(' · '));
        }catch{if(!disposed)message(t('تعذر حساب المسار. استخدم فتح الاتجاهات.','Could not calculate route. Use Open directions.'));}
      },()=>{if(!disposed)message(t('تعذر الوصول للموقع. يمكنك استخدام الاتجاهات بدون مشاركته.','Location unavailable. Use directions without sharing it.'));},{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
    };
    return ()=>{disposed=true;themeObserver.disconnect();indoorCleanup?.();requestId++;clearInterval(timer);document.removeEventListener('wxi:language',update);observer.disconnect();failure?.();renderer?.setMap(null);polylines.forEach(p=>p.setMap(null));if(marker)marker.setMap(null);};
  }
  return {mount};
})();
