'use strict';
window.WusoolGoogleMap = (() => {
  const ar = document.documentElement.lang === 'ar',
    text = (a, e) => (ar ? a : e);
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
        ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&language=${ar ? 'ar' : 'en'}&maptype=${satellite ? 'satellite' : 'roadmap'}`
        : `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(key)}&center=${center}&zoom=${region[5]}&maptype=${satellite ? 'satellite' : 'roadmap'}&language=${ar ? 'ar' : 'en'}`
      : `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=${ar ? 'ar' : 'en'}&z=${p ? 16 : region[5]}${p ? '' : '&ll=' + center}&t=${satellite ? 'k' : 'm'}`;
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
    markers.forEach((m) => (m.map = null));
    markers = [];
    info?.close();
    for (const p of places.filter(coordinates)) {
      const m = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: Number(p.latitude), lng: Number(p.longitude) },
        title: p.name,
        gmpClickable: true,
      });
      m.addListener('click', () => {
        document.getElementById('googleMapPlace').value = p.id;
        show(p.id);
        const card = document.createElement('div'),
          title = document.createElement('strong'),
          address = document.createElement('p'),
          link = document.createElement('a');
        title.textContent = p.name;
        address.textContent = [p.address, p.city].filter(Boolean).join(' · ');
        link.textContent = text('الاتجاهات', 'Directions');
        link.href = urls(p).directions;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        card.append(title, address, link);
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
    if (frame.getAttribute('src') !== links.embed) frame.src = links.embed;
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
    places = items;
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
    if (window.WusoolApiConfig.googleMapsProvider === 'free-embed') {
      canvas.hidden = true;
      frame.hidden = false;
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
          mapId: window.WusoolApiConfig.googleMapsMapId || 'DEMO_MAP_ID',
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
      option.textContent = ar ? r[1] : r[2];
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
          if (userMarker) userMarker.map = null;
          const dot = document.createElement('span');
          dot.textContent = '●';
          dot.style.cssText = 'color:#1a73e8;font-size:32px;text-shadow:0 0 3px white';
          userMarker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: point,
            title: text('موقعك الحالي', 'Your location'),
            content: dot,
          });
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
