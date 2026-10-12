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
    dialog.querySelector('form > h2').textContent=t('رحلة حجزك','Your booking journey');
    dialog.querySelector('form > h2').classList.add('bt-main-title');
    WusoolUI.html(host, `<div class="bt-heading"><div><span class="bt-eyebrow">${t('رحلتك · تفاصيل حقيقية','Your visit · real details')}</span><h3 data-place></h3><p data-address></p><p data-service></p></div><span class="bt-state" data-state></span></div><div class="bt-map" role="region" aria-label="${t('خريطة موقع الفرع','Branch location map')}"><div data-map></div><p class="bt-map-message" data-map-message role="status">${t('جارٍ تحميل الخريطة…','Loading map…')}</p></div><div class="bt-map-tools"><button type="button" class="btn btn-outline-primary" data-locate>${t('موقعي ومسار الوصول','My location & route')}</button><a data-directions class="btn btn-outline-secondary" target="_blank" rel="noopener noreferrer">${t('الحصول على الاتجاهات','Get directions')}</a><small>${t('الموقع يطلب بإذنك، ولا يُشارك مع الحسابات الأخرى.','Location is requested with your permission and is not shared with other accounts.')}</small></div><div class="bt-stage-heading"><h3>${t('مسار الزيارة','Visit progress')}</h3><p>${t('اسحب بين المحطات أو اخترها لعرض التفاصيل. السحب لا يغيّر حالة الحجز.','Drag between stops or select one to explore details. Dragging does not change booking status.')}</p></div><div class="bt-stages" role="group" aria-label="${t('محطات الزيارة','Visit stages')}">${stages.map((s,i)=>`<button type="button" draggable="true" data-stage="${i}" class="bt-stop"><span>${i+1}</span><strong>${t(s[1],s[2])}</strong><time data-stage-time></time></button>`).join('')}</div><div class="bt-detail" aria-live="polite"><span data-step dir="ltr"></span><h4 data-title></h4><p data-detail></p></div><div class="bt-navigation"><button type="button" class="btn btn-outline-secondary" data-prev>${t('السابق','Previous')}</button><button type="button" class="btn btn-outline-primary" data-current>${t('المرحلة الحالية','Current stage')}</button><button type="button" class="btn btn-outline-secondary" data-next>${t('التالي','Next')}</button></div><div class="bt-authorized"><h4>${t('الإجراءات المتاحة لحسابك','Actions available to your account')}</h4><div data-actions></div></div><details class="bt-history"><summary>${t('سجل التحديثات · توقيت الأردن','Update history · Jordan time')}</summary><ol data-history></ol></details>`);
    let watchId=null, userMarker, fence, stableSince=null, lastFix=null, pendingArrival=false, busy=false;
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
      if(booking && !['pending','confirmed'].includes(booking.status))stopGPS();
      if (!booking) {host.querySelector('[data-state]').textContent=t('الحجز غير متاح','Booking unavailable');host.querySelector('[data-actions]').replaceChildren();return;}
      const signature=JSON.stringify([booking, rowActions()?.innerHTML,document.documentElement.lang]);if(signature===fingerprint)return;fingerprint=signature;
      dialog.querySelector('.bt-main-title').textContent=t('رحلة حجزك','Your booking journey');
      dialog.querySelector('[data-close]').textContent='×';dialog.querySelector('[data-close]').setAttribute('aria-label',t('إغلاق','Close'));
      const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const pair=translations.get(node.textContent);if(pair)node.textContent=pair[document.documentElement.lang==='ar'?0:1];else{for(const [source,value] of translations){if(node.textContent.startsWith(source+' · ')||node.textContent.startsWith(source+' (')){node.textContent=value[document.documentElement.lang==='ar'?0:1]+node.textContent.slice(source.length);break;}}}}
      host.querySelectorAll('[aria-label]').forEach(n=>{const pair=translations.get(n.getAttribute('aria-label'));if(pair)n.setAttribute('aria-label',pair[document.documentElement.lang==='ar'?0:1]);});
      host.querySelector('[data-place]').textContent=branch?.name||branch?.branchName||booking.branchName||booking.locationSnapshot?.branchName||t('موقع الزيارة','Visit destination');
      host.querySelector('[data-service]').textContent=t('الخدمة: ','Service: ')+(booking.serviceName||booking.serviceSnapshot?.name||booking.destination||t('غير محددة في هذا الحجز','Not selected for this booking'));
      host.querySelector('[data-address]').textContent=[branch?.address||booking.locationSnapshot?.address,branch?.city||booking.locationSnapshot?.city].filter(Boolean).join(' · ');
      const stateLabels={pending:t('بانتظار الموافقة','Pending approval'),confirmed:t('مؤكد','Confirmed'),'in-progress':t('قيد التنفيذ','In progress'),completed:t('مكتمل','Completed'),cancelled:t('ملغي','Cancelled'),waitlisted:t('قائمة الانتظار','Waitlisted'),'no-show':t('لم يحضر','No-show')};
      host.querySelector('[data-provider]').textContent=host.querySelector('[data-place]').textContent;
      host.querySelector('[data-state]').textContent=stateLabels[booking.status]||booking.status;
      host.querySelector('.bt-stages').style.setProperty('--bt-progress',String(currentIndex(booking)/5));
      host.querySelectorAll('[data-stage]').forEach((n,i)=>{const at=(booking.journeyHistory||[]).filter(h=>h.to===stages[i][0]).at(-1)?.at || (i===0?booking.createdAt:i===1?booking.confirmedAt:null);n.querySelector('[data-stage-time]').textContent=at?new Intl.DateTimeFormat(document.documentElement.lang==='ar'?'ar-JO':'en-GB',{timeZone:'Asia/Amman',hour:'2-digit',minute:'2-digit'}).format(new Date(at)):'—';n.querySelector('span').textContent=i<currentIndex(booking)?'✓':String(i+1);n.classList.toggle('is-current',i===currentIndex(booking));n.classList.toggle('is-reached',i<=currentIndex(booking));});
      select(currentIndex(booking));
      if(map && markerClass){const point=coordinate(branch)||coordinate(booking.locationSnapshot),key=JSON.stringify(point);if(key!==mappedPoint){if(marker)marker.setMap(null);if(point){marker=new markerClass({map,position:point,title:host.querySelector('[data-place]').textContent,icon:{path:'M0,-30 C-11,-30 -18,-23 -18,-13 C-18,0 0,17 0,17 C0,17 18,0 18,-13 C18,-23 11,-30 0,-30 Z',fillColor:'#d72f35',fillOpacity:1,strokeColor:'#fff',strokeWeight:2,scale:.8}});map.panTo(point);}mappedPoint=key;}}
      const actions=host.querySelector('[data-actions]');actions.replaceChildren();
      for(const source of rowActions()?.querySelectorAll('button,a,.booking-action-note')||[]) {
        if(source.dataset.journey==='history'||source.tagName==='A'&&source.target==='_blank')continue;
        const copy=source.cloneNode(true);for(const attr of [...copy.attributes])if(attr.name.startsWith('data-'))copy.removeAttribute(attr.name);
        if(copy.tagName==='BUTTON') {copy.type='button';copy.onclick=async()=>{if(busy||disposed)return;const actionKey=['journey','visitAction','edit','cancel','delete','progress','approve'].find(k=>source.dataset[k]!==undefined);const fresh=[...rowActions()?.querySelectorAll('button')||[]].find(n=>actionKey?n.dataset[actionKey]===source.dataset[actionKey]:n.textContent===source.textContent);if(!fresh||fresh.disabled)return;if(source.dataset.journey==='depart'){busy=true;copy.disabled=true;try{await context.depart();fingerprint='';update();startGPS();}catch(error){message(error.message);}finally{busy=false;if(copy.isConnected)copy.disabled=false;}}else{context.close();fresh.click();}};}
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
    // Same live map instance; reorganize cards to match the approved composition.
    const heading=host.querySelector('.bt-heading');
    const provider=document.createElement('div');provider.className='bt-provider';provider.innerHTML=`<i class="bi bi-building" aria-hidden="true"></i><div><strong data-provider></strong><p>${t('فرع مقدم الخدمة','Service provider branch')}</p><small>${t('تتبّع مقدم الخدمة غير متاح','Provider tracking unavailable')}</small></div>`;
    const eta=document.createElement('div');eta.className='bt-eta';eta.innerHTML=`<i class="bi bi-clock" aria-hidden="true"></i><div><span>${t('الوصول المتوقع','Estimated arrival')}</span><strong data-eta>${t('يلزم موقعك ومسار متاح','Location and routing required')}</strong><small data-distance></small></div>`;
    const info=heading.querySelector('div');const title=dialog.querySelector('.bt-main-title'),reference=dialog.querySelector('form > p');info.querySelector('.bt-eyebrow').after(title);title.after(reference);info.append(heading.querySelector('[data-state]')); heading.append(provider,eta);
    requestAnimationFrame(()=>{if(!disposed){dialog.scrollTop=0;dialog.querySelector('[data-close]').focus({preventScroll:true});}});
    const banner=document.createElement('div');banner.className='bt-geofence';banner.innerHTML=`<i class="bi bi-geo-alt" aria-hidden="true"></i><div><strong>${t('كشف الوصول التلقائي','Auto arrival detection')} (Geofencing)</strong><p data-gps>${t('نطاق 50 مترًا. اضغط موقعي لتفعيل GPS. الوصول المكتشف ينتظر تأكيد الخادم.','50 m radius. Select My location to enable GPS. Detected arrival awaits server confirmation.')}</p></div><b>50 m</b>`;
    const mapNode=host.querySelector('.bt-map');
    mapNode.before(host.querySelector('.bt-stages'),banner);
    const tools=host.querySelector('.bt-map-tools');tools.querySelector('small').remove();
    const authorized=host.querySelector('[data-actions]');authorized.before(tools);host.querySelector('.bt-authorized h4').remove();
    const stageHeading=host.querySelector('.bt-stage-heading');stageHeading.remove();
    const routeTools=host.querySelector('.bt-navigation');routeTools.remove();
    // Stage buttons retain direct accessible navigation without extra visual chrome.
    const detail=host.querySelector('.bt-detail');detail.hidden=true;
    const controlStub=document.createElement('div');controlStub.hidden=true;controlStub.append(routeTools);host.append(controlStub);
    const gpsText=text=>host.querySelector('[data-gps]').textContent=text;
    const stopGPS=()=>{if(watchId!==null){navigator.geolocation?.clearWatch(watchId);watchId=null;}stableSince=null;lastFix=null;};
    const startGPS=()=>{
      if(disposed||watchId!==null||document.hidden)return;
      const destination=coordinate(branch)||coordinate(booking?.locationSnapshot);
      if(!destination){gpsText(t('إحداثيات الفرع غير متاحة.','Branch coordinates unavailable.'));return;}
      if(!navigator.geolocation){gpsText(t('GPS غير مدعوم.','GPS unavailable.'));return;}
      gpsText(t('جارٍ تحديد موقعك…','Locating you…'));
      watchId=navigator.geolocation.watchPosition(pos=>{
        if(disposed||document.hidden)return;
        const fix={lat:pos.coords.latitude,lng:pos.coords.longitude};const accuracy=pos.coords.accuracy;
        if(!coordinate(fix)||!Number.isFinite(accuracy)||accuracy<0||Date.now()-pos.timestamp>15000){stableSince=null;return;}
        const distance=distanceMeters(fix,destination);
        host.querySelector('[data-distance]').textContent=`${Math.round(distance)} m · ±${Math.round(accuracy)} m`;
        if(map&&markerClass){if(!userMarker)userMarker=new markerClass({map,position:fix,title:t('موقعك','Your location'),icon:{path:google.maps.SymbolPath.CIRCLE,scale:9,fillColor:'#00e4db',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});else userMarker.setPosition(fix);}
        const reliable=accuracy<=25 && distance+accuracy<=50 && (!lastFix||distanceMeters(lastFix,fix)<=25);
        lastFix=fix;if(!reliable){stableSince=null;if(!pendingArrival)gpsText(t('جارٍ مراقبة الموقع؛ نحتاج قراءة دقيقة وثابتة داخل النطاق.','Monitoring GPS; accurate, stable readings inside the radius are required.'));return;}
        if(stableSince===null)stableSince=pos.timestamp;
        if(pos.timestamp-stableSince>=5000&&!pendingArrival&&booking?.status==='confirmed'&&booking?.journeyState==='on-the-way'){
          pendingArrival=true;banner.classList.add('is-arrival');gpsText(t('تم كشف وصولك — بانتظار تأكيد الخادم. حالة الحجز لم تتغير.','Arrival detected — pending server confirmation. Official booking status unchanged.'));
          // No authorized arrival endpoint exists in this baseline. Never call the local
          // manual-arrival mutation for a GPS event or fabricate server confirmation.
        }
      },error=>{stableSince=null;gpsText(error.code===1?t('تم رفض إذن الموقع. فعّله من إعدادات المتصفح ثم حاول مجددًا.','Location permission denied. Enable it in browser settings and retry.'):t('تعذر تحديد موقع دقيق. حاول مجددًا.','Accurate GPS unavailable. Please retry.'));stopGPS();},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
    };
    let resumeGPS=false;const visibility=()=>{if(document.hidden){resumeGPS=watchId!==null;stopGPS();}else if(resumeGPS)startGPS();};document.addEventListener('visibilitychange',visibility);
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
        const point=coordinate(branch)||coordinate(booking.locationSnapshot);map=new maps.Map(host.querySelector('[data-map]'),{center:point||{lat:31.95,lng:35.91},zoom:point?18:7,mapTypeId:'roadmap',clickableIcons:false,renderingType:'RASTER',styles:[{featureType:'poi',elementType:'labels',stylers:[{visibility:'off'}]}],gestureHandling:'cooperative',streetViewControl:false,mapTypeControl:true,fullscreenControl:true});
        applyMapTheme();markerClass=markers.Marker;mappedPoint=JSON.stringify(point);
        if(point)marker=new markers.Marker({map,position:point,title:host.querySelector('[data-place]').textContent,icon:{path:'M0,-30 C-11,-30 -18,-23 -18,-13 C-18,0 0,17 0,17 C0,17 18,0 18,-13 C18,-23 11,-30 0,-30 Z',fillColor:'#d72f35',fillOpacity:1,strokeColor:'#fff',strokeWeight:2,scale:.8}});
        if(point)fence=new maps.Circle({map,center:point,radius:50,strokeColor:'#00e1b0',strokeOpacity:.9,strokeWeight:2,fillColor:'#00dfb2',fillOpacity:.12});
        if(booking?.journeyState==='on-the-way')startGPS();
        message(point?'':t('موقع الفرع غير مؤكد بالإحداثيات. الخريطة تعرض الأردن، والاتجاهات تبحث بالعنوان.','Branch coordinates are not confirmed. The map shows Jordan; directions use the address.'));
      }catch{if(!disposed)message(t('الخريطة غير متاحة الآن. يمكنك فتح الاتجاهات.','Map unavailable right now. You can open directions.'));}
    };initialize();
    host.querySelector('[data-locate]').onclick=()=>{
      startGPS();
      const destination=coordinate(branch)||coordinate(booking.locationSnapshot);
      if(!map||!destination){message(t('يلزم تحميل الخريطة وموقع فرع مؤكد لرسم المسار.','A loaded map and confirmed branch coordinates are required for a route.'));return;}
      if(!navigator.geolocation){message(t('تحديد الموقع غير مدعوم.','Geolocation is unavailable.'));return;}
      const token=++requestId;message(t('جارٍ تحديد موقعك بإذنك…','Locating you with your permission…'));
      navigator.geolocation.getCurrentPosition(async pos=>{
        try {const routes=await WusoolMapsLoader.library('routes');if(disposed||token!==requestId)return;
          const origin={lat:pos.coords.latitude,lng:pos.coords.longitude};let distance, duration;
          if(routes.Route?.computeRoutes) {
            const result=await routes.Route.computeRoutes({origin,destination,travelMode:'DRIVING',routingPreference:'TRAFFIC_AWARE',fields:['path','distanceMeters','durationMillis']});
            if(disposed||token!==requestId)return;const route=result.routes?.[0];if(!route)throw new Error('NO_ROUTE');
            polylines.forEach(p=>p.setMap(null));renderer?.setMap(null);polylines=route.createPolylines({polylineOptions:{strokeColor:'#008780',strokeWeight:6}});polylines.forEach(p=>p.setMap(map));
            const bounds=new google.maps.LatLngBounds();route.path.forEach(p=>bounds.extend(p));map.fitBounds(bounds,48);
            distance=Number.isFinite(route.distanceMeters)?`${(route.distanceMeters/1000).toFixed(1)} km`:'';duration=Number.isFinite(route.durationMillis)?`${Math.ceil(route.durationMillis/60000)} min`:'';
          } else {
            const result=await new routes.DirectionsService().route({origin,destination,travelMode:'DRIVING',drivingOptions:{departureTime:new Date(),trafficModel:'bestguess'}});if(disposed||token!==requestId)return;
            renderer?.setMap(null);polylines.forEach(p=>p.setMap(null));renderer=new routes.DirectionsRenderer({map});renderer.setDirections(result);
            const leg=result.routes[0]?.legs[0];distance=leg?.distance?.text;duration=leg?.duration_in_traffic?.text||leg?.duration?.text;
          }
          host.querySelector('[data-eta]').textContent=duration||t('غير متاح','Unavailable');
          message([t('مسار قيادة مقترح من موقع جهازك، وليس تتبعًا مباشرًا.','Suggested driving route from your device, not live tracking.'),distance,duration].filter(Boolean).join(' · '));
        }catch{if(!disposed)message(t('تعذر حساب المسار. استخدم فتح الاتجاهات.','Could not calculate route. Use Open directions.'));}
      },()=>{if(!disposed)message(t('تعذر الوصول للموقع. يمكنك استخدام الاتجاهات بدون مشاركته.','Location unavailable. Use directions without sharing it.'));},{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
    };
    const googleSafeCleanup=()=>{if(map&&window.google?.maps?.event)google.maps.event.clearInstanceListeners(map);};
    return ()=>{disposed=true;themeObserver.disconnect();indoorCleanup?.();stopGPS();document.removeEventListener('visibilitychange',visibility);userMarker?.setMap(null);fence?.setMap(null);googleSafeCleanup();requestId++;clearInterval(timer);document.removeEventListener('wxi:language',update);observer.disconnect();failure?.();renderer?.setMap(null);polylines.forEach(p=>p.setMap(null));if(marker)marker.setMap(null);};
  }
  function distanceMeters(a,b){const rad=x=>x*Math.PI/180;const dlat=rad(b.lat-a.lat),dlng=rad(b.lng-a.lng);const h=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
  return {mount,distanceMeters,coordinate};
})();
