'use strict';
window.WusoolGoogleMap = (() => {
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('map-place-cards.css',document.currentScript.src).href;document.head.append(sheet);
  const text = (a, e) => (document.documentElement.lang === 'ar' ? a : e);
  const coordinates = (p) =>
    p &&
    p.latitude != null &&
    p.longitude != null &&
    String(p.latitude).trim() !== '' &&
    String(p.longitude).trim() !== '' &&
    Number.isFinite(Number(p.latitude)) &&
    Number.isFinite(Number(p.longitude)) &&
    Math.abs(Number(p.latitude)) <= 90 &&
    Math.abs(Number(p.longitude)) <= 180;
  const query = (p) =>
    coordinates(p)
      ? `${Number(p.latitude)},${Number(p.longitude)}`
      : p
        ? [p.address, p.city, 'Jordan'].filter(Boolean).join(', ')
        : 'Jordan';
  const regions = [
    ['Jordan', 'الأردن كاملًا', 'Jordan overview', 31.24, 36.51, 8],
    ['Amman', 'عمّان', 'Amman', 31.9539, 35.9106, 12],
    ['Irbid', 'إربد', 'Irbid', 32.5556, 35.85, 12],
    ['Zarqa', 'الزرقاء', 'Zarqa', 32.0728, 36.088, 12],
    ['Balqa', 'البلقاء — السلط', 'Balqa — Salt', 32.0392, 35.7272, 12],
    ['Ajloun', 'عجلون', 'Ajloun', 32.3326, 35.7517, 12],
    ['Jerash', 'جرش', 'Jerash', 32.2747, 35.8961, 12],
    ['Mafraq', 'المفرق', 'Mafraq', 32.3429, 36.208, 12],
    ['Madaba', 'مادبا', 'Madaba', 31.7167, 35.8, 12],
    ['Karak', 'الكرك', 'Karak', 31.1853, 35.7048, 12],
    ['Tafilah', 'الطفيلة', 'Tafilah', 30.8375, 35.6044, 12],
    ['Maan', 'معان', 'Maan', 30.192, 35.736, 12],
    ['Aqaba', 'العقبة', 'Aqaba', 29.532, 35.006, 12],
  ];
  let region = regions[0],
    satellite = false;
  const urls = (p) => {
    const q = p ? query(p) : region[0] === 'Jordan' ? 'Jordan' : region[2] + ', Jordan',
      key = window.WusoolApiConfig.googleMapsEmbedKey,
      center = region[3] + ',' + region[4];
    const embed = key
      ? p
        ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&language=${document.documentElement.lang === 'ar' ? 'ar' : 'en'}&maptype=${satellite ? 'satellite' : 'roadmap'}`
        : `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(key)}&center=${center}&zoom=${region[5]}&maptype=${satellite ? 'satellite' : 'roadmap'}&language=${document.documentElement.lang === 'ar' ? 'ar' : 'en'}`
      : `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=${document.documentElement.lang === 'ar' ? 'ar' : 'en'}&z=${p ? 16 : region[5]}${p ? '' : '&ll=' + center}&t=${satellite ? 'k' : 'm'}`;
    return {
      embed,
      open: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
      directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`,
    };
  };
  let places = [],
    selectedId = '',
    map = null,
    markers = [],
    userMarker = null,
    info = null,
    selectionVersion = 0;
  const mapError = (message) => {
    const node = document.getElementById('googleMapError');
    if (node) {
      node.hidden = false;
      node.textContent = message;
    }
  };
  const clearMapError = () => {
    const node = document.getElementById('googleMapError');
    if (node) node.hidden = true;
  };
  const rebuildMarkers = () => {
    if (!map) return;
    markers.forEach((m) => m.setMap(null));
    markers = [];
    info?.close();
    for (const p of places.filter(coordinates)) {
      const m = new window.google.maps.Marker({
        map,
        position: { lat: Number(p.latitude), lng: Number(p.longitude) },
        title: p.name,
        icon: {path: 'M0,-30 C-11,-30 -18,-23 -18,-13 C-18,0 0,17 0,17 C0,17 18,0 18,-13 C18,-23 11,-30 0,-30 Z', fillColor: '#d72f35', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2, scale: .8},
      });
      m.addListener('click', () => {
        document.getElementById('googleMapPlace').value = p.id;
        show(p.id);
        const card = document.createElement('article');card.className='wusool-map-card';
        // All record text uses textContent; images allow only supported URL schemes.
        const safeImage = value => {if(typeof value!=='string')return null;try{const url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)||/^data:image\/(png|jpeg|webp);base64,/i.test(value)?url.href:null;}catch{return null;}};
        const image=safeImage(p.photos?.[0]?.url||p.photos?.[0]?.imageData||(p.photos?.[0]&&typeof p.photos[0]==='string'?p.photos[0]:null));
        if(image){const img=document.createElement('img');img.src=image;img.alt=text('صورة الفرع','Branch photo');img.loading='lazy';card.append(img);}
        const category=document.createElement('small');category.textContent=p.category||p.type||'';
        const title=document.createElement('h3');title.textContent=p.name;
        const address=document.createElement('p');address.textContent=[p.address,p.city].filter(Boolean).join(' · ');
        const rating=document.createElement('p');rating.className='wusool-map-rating';
        const hasReviews=Number.isInteger(Number(p.reviewCount))&&Number(p.reviewCount)>0&&Number.isFinite(Number(p.rating))&&Number(p.rating)>=1&&Number(p.rating)<=5;
        rating.textContent=hasReviews?`★ ${Number(p.rating).toFixed(1)} / 5 · ${Number(p.reviewCount)} `+text('تقييم منشور','published reviews'):text('لا توجد تقييمات بعد','No reviews yet');
        const actions=document.createElement('div');actions.className='wusool-map-actions';
        const details=document.createElement('a');details.className='btn btn-outline-primary';details.textContent=text('تفاصيل المكان','Place details');details.href=(location.pathname.includes('/user/')?'./user-place-details.html':'./place-details.html')+'?id='+encodeURIComponent(p.id);
        const book=document.createElement('a');book.className='btn btn-wusool';book.textContent=text('خطط لزيارة','Plan a visit');book.href='../../user/html/plan-visit.html?placeId='+encodeURIComponent(p.id);
        actions.append(details,book);card.append(category,title,address,rating,actions);
        info.setContent(card);
        info.open({ map, anchor: m });
      });
      markers.push(m);
    }
  };

  const show = (id) => {
    selectedId = id;
    const p = places.find((x) => x.id === id),
      links = urls(p),
      frame = document.getElementById('googleMapFrame');
    if (!frame) return;
    const version = ++selectionVersion;
    if (map) {
      map.setMapTypeId(satellite ? 'satellite' : 'roadmap');
      if (!p) {
        map.setCenter({ lat: region[3], lng: region[4] });
        map.setZoom(region[5]);
      } else if (coordinates(p)) {
        map.panTo({ lat: Number(p.latitude), lng: Number(p.longitude) });
        map.setZoom(16);
      } else {
        if (window.WusoolApiConfig.googleMapsGeocodingEnabled) {
          WusoolMapsLoader.library('geocoding')
            .then(({ Geocoder }) =>
              new Geocoder().geocode({
                address: query(p),
                componentRestrictions: { country: 'JO' },
              }),
            )
            .then(({ results }) => {
              if (version !== selectionVersion || !map || !results[0]) return;
              map.panTo(results[0].geometry.location);
              map.setZoom(16);
            })
            .catch(() => mapError(WusoolLocationUI.message()));
        } else
          mapError(
            text(
              'لا توجد إحداثيات محفوظة لهذا الفرع. يمكن البحث بعنوانه عبر Google Maps.',
              'This branch has no saved coordinates. Search its address using Google Maps.',
            ),
          );
      }
    }
    if (!map && frame.getAttribute('src') !== links.embed) frame.src = links.embed;
    document.getElementById('googleMapOpen').href = links.open;
    const directions = document.getElementById('googleMapDirections');
    directions.href = links.directions;
    directions.hidden = !p;
    document.getElementById('googleMapNote').textContent = p
      ? coordinates(p)
        ? text('موقع الفرع حسب الإحداثيات المسجّلة.', 'Branch location from its saved coordinates.')
        : text(
            'بحث بالعنوان المسجّل؛ تأكد من الموقع قبل الانطلاق.',
            'Searching the saved address; verify the location before travelling.',
          )
      : text(
          'خريطة Google تفاعلية: اسحب للتنقل واستخدم + و − للتكبير. اختر محافظة أو فرعًا لعرض موقعه.',
          'Interactive Google Map: drag to explore and use + and − to zoom. Select a governorate or branch to view its location.',
        );
  };
  const setPlaces = (items) => {
    places = [...new Map(items.filter(p=>p?.id).map(p=>[String(p.id),p])).values()];
    items = places;
    const select = document.getElementById('googleMapPlace');
    if (!select) return;
    select.replaceChildren();
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = text('خريطة الأردن', 'Jordan overview');
    select.append(blank);
    for (const p of items) {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      select.append(option);
    }
    if (!items.some((p) => p.id === selectedId)) selectedId = '';
    select.value = selectedId;
    rebuildMarkers();
    show(selectedId);
  };
  let ready = Promise.resolve();
  const initialize = () => {
    const canvas = document.getElementById('googleInteractiveMap'),
      frame = document.getElementById('googleMapFrame');
    if (!canvas || !frame) return;
    if ((window.WusoolApiConfig.googleMapsDiscoveryProvider || window.WusoolApiConfig.googleMapsProvider) === 'free-embed') {
      canvas.hidden = true;
      frame.hidden = false;
      mapError(text('عرض iframe لا يدعم دبابيس النظام أو إخفاء نقاط Google؛ يلزم تكامل JavaScript مفعّل.','Iframe view cannot show system pins or hide Google POIs; an enabled JavaScript integration is required.'));
      show(selectedId);
      return;
    }
    WusoolMapsLoader.onFailure(() => {
      map = null;
      canvas.hidden = true;
      frame.hidden = false;
      mapError(WusoolLocationUI.message({ code: 'MAP_AUTH_FAILED' }));
    });
    ready = (async () => {
      try {
        const [{ Map, InfoWindow }] = await Promise.all([
          WusoolMapsLoader.library('maps'),
          WusoolMapsLoader.library('marker'),
        ]);
        canvas.hidden = false;
        map = new Map(canvas, {
          center: { lat: 31.24, lng: 36.51 },
          zoom: 8,
          clickableIcons: false,
          renderingType: 'RASTER',
          styles: [{featureType:'poi',elementType:'labels',stylers:[{visibility:'off'}]},{featureType:'transit',elementType:'labels.icon',stylers:[{visibility:'off'}]}],
          restriction: { latLngBounds: WusoolLocation.bounds, strictBounds: false },
          mapTypeId: satellite ? 'satellite' : 'roadmap',
          fullscreenControl: true,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          gestureHandling: 'cooperative',
        });
        info = new InfoWindow();
        frame.hidden = true;
        clearMapError();
        rebuildMarkers();
        show(selectedId);
      } catch (error) {
        canvas.hidden = true;
        frame.hidden = false;
        mapError(WusoolLocationUI.message(error));
      }
    })();
  };
  WusoolUI.enqueue(async () => {
    const select = document.getElementById('googleMapPlace');
    if (!select) return;
    select.addEventListener('change', () => show(select.value));
    const regionSelect = document.getElementById('googleMapRegion');
    for (const r of regions) {
      const option = document.createElement('option');
      option.value = r[0];
      option.textContent = document.documentElement.lang === 'ar' ? r[1] : r[2];
      regionSelect.append(option);
    }
    regionSelect.addEventListener('change', () => {
      region = regions.find((r) => r[0] === regionSelect.value) || regions[0];
      select.value = '';
      show('');
    });
    document.getElementById('googleMapType').addEventListener('change', (e) => {
      satellite = e.target.value === 'satellite';
      show(selectedId);
    });
    document.getElementById('placesGrid')?.addEventListener('click', (e) => {
      const button = e.target.closest('[data-google-map-place]');
      if (!button) return;
      const id = button.dataset.googleMapPlace;
      if (!places.some((p) => p.id === id)) return;
      select.value = id;
      show(id);
      document.getElementById('mapCanvas').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.getElementById('googleMapLocate').addEventListener('click', () => {
      if (!map) {
        mapError(text('انتظر تحميل الخريطة أولًا.', 'Wait for the map to load first.'));
        return;
      }
      if (!navigator.geolocation) {
        mapError(text('متصفحك لا يدعم تحديد الموقع.', 'Your browser does not support location.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = { lat: position.coords.latitude, lng: position.coords.longitude };
          if (!WusoolLocation.supported({ latitude: point.lat, longitude: point.lng })) {
            mapError(
              text(
                'موقعك خارج النطاق التقريبي المدعوم للأردن.',
                'Your location is outside the supported approximate Jordan bounds.',
              ),
            );
            return;
          }
          clearMapError();
          map.panTo(point);
          map.setZoom(15);
          if (userMarker) userMarker.setMap(null);
          userMarker = new window.google.maps.Marker({map,position:point,title:text('موقعك الحالي','Your location'),icon:{path:window.google.maps.SymbolPath.CIRCLE,scale:8,fillColor:'#1a73e8',fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});
        },
        () =>
          mapError(
            text(
              'تعذر تحديد موقعك. اسمح للمتصفح بالوصول للموقع.',
              'Unable to determine your location. Allow browser location access.',
            ),
          ),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    });
    document.addEventListener('wxi:language',()=>{
      [...regionSelect.options].forEach((option,i)=>{if(regions[i])option.textContent=text(regions[i][1],regions[i][2]);});
      setPlaces(places);
    });
    show('');
    initialize();
  });
  return {
    setPlaces,
    focusPlace: show,
    urls,
    query,
    get ready() {
      return ready;
    },
  };
})();
