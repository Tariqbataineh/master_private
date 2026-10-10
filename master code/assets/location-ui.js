'use strict';
window.WusoolLocationUI = (() => {
  const states = new WeakMap();
  let sequence = 0;
  const ar = () => document.documentElement.lang === 'ar',
    t = (a, e) => (ar() ? a : e);
  const message = (error) =>
    ({
      INVALID_LOCATION: t(
        'أدخل خط عرض وخط طول صالحين معًا.',
        'Enter both valid latitude and longitude values.',
      ),
      MAP_KEY_MISSING: t(
        'مفتاح الخرائط غير مضبوط؛ إدخال الإحداثيات يبقى متاحًا.',
        'Maps key is missing; manual coordinates remain available.',
      ),
      MAP_AUTH_FAILED: t(
        'رفض Google الخريطة. تحقق من API والفوترة وقيود الموقع.',
        'Google denied map access. Check API, billing and website restrictions.',
      ),
      LOCATION_OUTSIDE_BOUNDS: t(
        'الموقع خارج النطاق التقريبي المدعوم للأردن.',
        'Location is outside the supported approximate Jordan bounds.',
      ),
    })[error?.code] ||
    t(
      'الخريطة أو خدمة البحث غير متاحة. استخدم الإحداثيات أو العنوان.',
      'Map or search is unavailable. Use coordinates or an address.',
    );
  function mount(
    host,
    {
      latitude,
      longitude,
      address,
      city,
      value = {},
      editable = false,
      required = false,
      simple = editable && window.WusoolApiConfig.googleMapsProvider === 'free-embed',
      onConfirm = () => {},
      title,
    } = {},
  ) {
    if (!host) return null;
    if (states.has(host)) return states.get(host);
    required = required || simple;
    const id = 'location-' + ++sequence,
      card = document.createElement('section');
    card.className = 'wusool-location';
    host.append(card);
    const h = document.createElement('h3');
    h.className = 'h5';
    h.textContent = title || t('الموقع', 'Location');
    card.append(h);
    const controls = document.createElement('div');
    controls.className = 'location-controls';
    card.append(controls);
    const button = (a, e, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-outline-wusool';
      b.textContent = t(a, e);
      b.addEventListener('click', fn);
      controls.append(b);
      return b;
    };
    const status = document.createElement('p');
    status.className = 'small text-secondary';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const canvas = document.createElement('div');
    canvas.className = 'location-map';
    canvas.setAttribute('role', 'region');
    canvas.setAttribute('aria-label', t('خريطة الموقع', 'Location map'));
    card.append(canvas, status);
    const links = document.createElement('div');
    links.className = 'location-controls';
    card.append(links);
    const open = document.createElement('a'),
      directions = document.createElement('a');
    for (const a of [open, directions]) {
      a.className = 'btn btn-outline-wusool';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      links.append(a);
    }
    open.textContent = t('عرض على Google Maps', 'View on Google Maps');
    directions.textContent = t('الاتجاهات', 'Directions');
    let freeFrameRefresh = null;
    let lat = latitude,
      lng = longitude,
      map = null,
      marker = null,
      pending = null,
      confirmed = null,
      version = 0,
      searchWidget = null,
      listeners = [],
      collectionMarkers = [],
      collection = [],
      destroyed = false,
      placeId = value.googlePlaceId || null,
      currentRecord = value;
    if (editable) {
      for (const [field, label, key] of [
        [lat, t('خط العرض', 'Latitude'), 'lat'],
        [lng, t('خط الطول', 'Longitude'), 'lng'],
      ]) {
        let input = field;
        if (!input) {
          const wrap = document.createElement('label');
          wrap.textContent = label;
          input = document.createElement('input');
          input.type = 'number';
          input.step = 'any';
          input.className = 'form-control';
          input.id = id + '-' + key;
          wrap.htmlFor = input.id;
          wrap.append(input);
          controls.append(wrap);
          if (key === 'lat') lat = input;
          else lng = input;
        }
        input.removeAttribute('readonly');
        input.type = 'number';
        input.step = 'any';
        input.inputMode = 'decimal';
        input.setAttribute('aria-label', label);
        input.placeholder = key === 'lat' ? '32.555600' : '35.850000';
        input.min = key === 'lat' ? '29.18' : '34.95';
        input.max = key === 'lat' ? '33.38' : '39.31';
        if (required) input.required = true;
      }
    }
    const describe = () => {
      const point = confirmed;
      const urls = WusoolLocation.urls({
        ...currentRecord,
        address: address?.value || currentRecord.address,
        city: city?.value || currentRecord.city,
        ...point,
      });
      open.href = urls.open;
      directions.href = urls.directions;
      links.hidden = !point && !address?.value && !currentRecord.address;
      status.textContent = point
        ? `${editable ? t('تم تأكيد الموقع', 'Location confirmed') + ' · ' : ''}${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`
        : t(
            'لم يتم تحديد موقع دقيق. العنوان لا يعتبر موقعًا موثّقًا.',
            'No exact location selected. Address search is not a verified position.',
          );
    };
    const draw = (point) => {
      if (!map) return;
      if (marker) marker.map = null;
      if (!point) {
        map.setCenter({ lat: 31.24, lng: 36.51 });
        map.setZoom(8);
        return;
      }
      marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: point.latitude, lng: point.longitude },
        gmpDraggable: editable,
        title: h.textContent,
      });
      if (editable)
        listeners.push(
          marker.addListener('dragend', () =>
            select({ latitude: marker.position.lat, longitude: marker.position.lng }),
          ),
        );
      map.panTo({ lat: point.latitude, lng: point.longitude });
      map.setZoom(16);
    };
    const select = (point) => {
      try {
        pending = WusoolLocation.validate(point.latitude, point.longitude);
        if (!pending) return;
        if (simple) {
          confirmed = null;
          lat.value = pending.latitude;
          lng.value = pending.longitude;
          lat.setCustomValidity('');
          lng.setCustomValidity('');
          links.hidden = true;
        }
        draw(pending);
        status.textContent = t(
          'اضغط تأكيد الموقع لاعتماد الاختيار.',
          'Confirm location to use this selection.',
        );
      } catch (e) {
        pending = null;
        status.textContent = message(e);
        draw(confirmed);
      }
    };
    const read = () =>
      WusoolLocation.validate(
        lat?.value ?? currentRecord.latitude,
        lng?.value ?? currentRecord.longitude,
      );
    const confirm = () => {
      try {
        const point = simple ? read() : pending || read();
        if (!point) {
          if (required) {
            lat?.setCustomValidity(t('خط العرض مطلوب.', 'Latitude is required.'));
            lng?.setCustomValidity(t('خط الطول مطلوب.', 'Longitude is required.'));
          }
          status.textContent = t('حدد الموقع أولًا.', 'Select a location first.');
          return false;
        }
        confirmed = point;
        pending = null;
        if (lat) lat.value = point.latitude;
        if (lng) lng.value = point.longitude;
        lat?.setCustomValidity('');
        lng?.setCustomValidity('');
        placeField.value = placeId || '';
        describe();
        draw(point);
        freeFrameRefresh?.();
        onConfirm({
          ...point,
          countryCode: 'JO',
          googlePlaceId: placeId,
          governorate: regionSelect.value || currentRecord.governorate || null,
        });
        return true;
      } catch (e) {
        status.textContent = message(e);
        lat?.setCustomValidity(message(e));
        lng?.setCustomValidity(message(e));
        return false;
      }
    };
    const restore = (point) => {
      version++;
      pending = null;
      lat?.setCustomValidity('');
      lng?.setCustomValidity('');
      currentRecord = point;
      placeId = point.googlePlaceId || null;
      placeField.value = placeId || '';
      regionSelect.value = point.governorate || '';
      try {
        confirmed = WusoolLocation.pair(point.latitude, point.longitude);
      } catch {
        confirmed = null;
      }
      if (lat) lat.value = confirmed?.latitude ?? '';
      if (lng) lng.value = confirmed?.longitude ?? '';
      draw(confirmed);
      describe();
      freeFrameRefresh?.();
    };
    if (editable && !simple && window.WusoolApiConfig.googleMapsProvider === 'free-embed') {
      const label = document.createElement('label');
      label.textContent = t(
        'رابط Google Maps يحتوي إحداثيات أو خط العرض وخط الطول',
        'Google Maps coordinate link or latitude, longitude',
      );
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control';
      label.append(input);
      controls.append(label);
      button('استخدام إحداثيات الرابط', 'Use link coordinates', () => {
        try {
          const point = WusoolLocation.parseLink(input.value);
          select(point);
          lat.value = point.latitude;
          lng.value = point.longitude;
        } catch (e) {
          status.textContent = message(e);
        }
      });
      const note = document.createElement('p');
      note.textContent = t(
        'افتح Google Maps وحدد موقع الفرع ثم انسخ إحداثياته هنا وأكدها. الخريطة المضمّنة لا ترجع نقطة الضغط للتطبيق.',
        'Open Google Maps, choose the branch location, paste its coordinates here and confirm. The embedded map cannot return a clicked point to this application.',
      );
      card.append(note);
    }
    let confirmButton = null;
    if (editable) {
      confirmButton = button('تأكيد الموقع', 'Location confirmed', confirm);
      confirmButton.className = 'btn btn-wusool';
      for (const field of [lat, lng])
        field.addEventListener('input', () => {
          version++;
          pending = null;
          confirmed = null;
          placeId = null;
          placeField.value = '';
          lat.setCustomValidity('');
          lng.setCustomValidity('');
          links.hidden = true;
          try {
            const point = read();
            draw(point);
            status.textContent = t(
              'أكد الإحداثيات الجديدة قبل الحفظ.',
              'Confirm new coordinates before saving.',
            );
            field.setCustomValidity('');
          } catch (e) {
            field.setCustomValidity(message(e));
            status.textContent = message(e);
          }
        });
      const form = lat.closest('form');
      form?.addEventListener(
        'submit',
        (e) => {
          try {
            const point = read();
            if (
              pending ||
              (point &&
                (!confirmed ||
                  point.latitude !== confirmed.latitude ||
                  point.longitude !== confirmed.longitude))
            ) {
              e.preventDefault();
              e.stopImmediatePropagation();
              status.textContent = t(
                'اضغط تأكيد الموقع قبل حفظ النموذج.',
                'Confirm location before saving the form.',
              );
              confirmButton?.focus();
            } else if (required && !point) {
              e.preventDefault();
              e.stopImmediatePropagation();
              status.textContent = t('الموقع مطلوب.', 'Location is required.');
            }
          } catch (error) {
            e.preventDefault();
            e.stopImmediatePropagation();
            status.textContent = message(error);
          }
        },
        { capture: true },
      );
    }
    const placeField = document.createElement('input');
    placeField.type = 'hidden';
    if (editable) {
      placeField.dataset.locationPlaceId = 'true';
      controls.append(placeField);
    }
    const regionLabel = document.createElement('label');
    regionLabel.textContent = t('التنقل حسب المحافظة', 'Navigate by governorate');
    const regionSelect = document.createElement('select');
    if (editable) regionSelect.dataset.locationGovernorate = 'true';
    regionSelect.className = 'form-select';
    regionSelect.setAttribute('aria-label', regionLabel.textContent);
    const overview = document.createElement('option');
    overview.value = '';
    overview.textContent = t('الأردن كاملًا', 'All Jordan');
    regionSelect.append(overview);
    for (const r of WusoolLocation.regions) {
      const option = document.createElement('option');
      option.value = r[0];
      option.textContent = ar() ? r[1] : r[0];
      regionSelect.append(option);
    }
    regionLabel.append(regionSelect);
    if (!simple) controls.append(regionLabel);
    regionSelect.addEventListener('change', () => {
      const r = WusoolLocation.regions.find((r) => r[0] === regionSelect.value);
      if (map) {
        map.panTo(r ? { lat: r[2], lng: r[3] } : { lat: 31.24, lng: 36.51 });
        map.setZoom(r ? 12 : 8);
      } else if (freeFrameRefresh) {
        const frame = canvas.querySelector('iframe');
        frame.src =
          'https://www.google.com/maps?' +
          new URLSearchParams({
            q: r ? r[0] + ', Jordan' : 'Jordan',
            ll: r ? r[2] + ',' + r[3] : '31.24,36.51',
            output: 'embed',
            hl: ar() ? 'ar' : 'en',
            z: r ? '12' : '7',
          });
      }
    });
    const boundaryNote = document.createElement('p');
    boundaryNote.className = 'small text-secondary';
    boundaryNote.textContent = t(
      'التحقق يستخدم نطاقًا مستطيلًا تقريبيًا للأردن، وليس حدود الدولة الدقيقة.',
      'Validation uses approximate rectangular Jordan bounds, not the precise national border.',
    );
    if (!simple) card.append(boundaryNote);
    const currentLocationButton = button('استخدم موقعي الحالي', 'Use my current location', () => {
      if (!navigator.geolocation) {
        status.textContent = t('تحديد الموقع غير مدعوم.', 'Geolocation is unavailable.');
        return;
      }
      const token = ++version;
      status.textContent = t('جارٍ تحديد موقعك…', 'Locating…');
      navigator.geolocation.getCurrentPosition(
        (p) => {
          if (destroyed || token !== version) return;
          const point = { latitude: p.coords.latitude, longitude: p.coords.longitude };
          if (!WusoolLocation.supported(point)) {
            status.textContent = message({ code: 'LOCATION_OUTSIDE_BOUNDS' });
            return;
          }
          if (editable) {
            select(point);
            if (Number.isFinite(p.coords.accuracy))
              status.textContent +=
                ' ' +
                t('الدقة التقريبية: ', 'Approximate accuracy: ') +
                Math.round(p.coords.accuracy) +
                ' m';
          } else if (map) {
            map.panTo({ lat: point.latitude, lng: point.longitude });
            map.setZoom(15);
            status.textContent = t(
              'موقعك الحالي؛ لم يتم حفظه.',
              'Your current location; it has not been saved.',
            );
          }
        },
        () => {
          if (destroyed || token !== version) return;
          status.textContent = t(
            'تعذر تحديد الموقع. تحقق من إذن المتصفح والاتصال الآمن.',
            'Unable to locate you. Check browser permission and HTTPS.',
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    });
    if (editable && !simple && window.WusoolApiConfig.googleMapsGeocodingEnabled)
      button('البحث بالعنوان', 'Search address', async () => {
        const token = ++version;
        try {
          if (!address?.value.trim()) return;
          const { Geocoder } = await WusoolMapsLoader.library('geocoding');
          const { results } = await new Geocoder().geocode({
            address: [address.value, city?.value, 'Jordan'].filter(Boolean).join(', '),
            componentRestrictions: { country: 'JO' },
          });
          if (destroyed || token !== version || !results[0]) return;
          select({
            latitude: results[0].geometry.location.lat(),
            longitude: results[0].geometry.location.lng(),
          });
        } catch (e) {
          status.textContent = message(e);
        }
      });
    if (editable && !simple && window.WusoolApiConfig.googleMapsGeocodingEnabled)
      button('اقتراح عنوان للنقطة', 'Suggest address for point', async () => {
        const token = ++version;
        try {
          const point = pending || read();
          if (!point) return;
          const { Geocoder } = await WusoolMapsLoader.library('geocoding');
          const { results } = await new Geocoder().geocode({
            location: { lat: point.latitude, lng: point.longitude },
          });
          if (destroyed || token !== version || !results[0]) return;
          const suggested = results[0];
          const accept = button('اعتماد العنوان المقترح', 'Use suggested address', () => {
            if (token !== version) {
              accept.remove();
              return;
            }
            if (address) address.value = suggested.formatted_address || address.value;
            const component = suggested.address_components?.find((c) =>
              c.types.includes('locality'),
            );
            if (city && component && !city.tagName?.includes('SELECT'))
              city.value = component.long_name;
            address?.dispatchEvent(new Event('change', { bubbles: true }));
            accept.remove();
          });
          status.textContent = suggested.formatted_address;
        } catch (e) {
          status.textContent = message(e);
        }
      });
    if (editable && !simple && window.WusoolApiConfig.googleMapsPlacesEnabled)
      button('البحث عن مكان', 'Search place', async () => {
        try {
          if (searchWidget) return;
          const { PlaceAutocompleteElement } = await WusoolMapsLoader.library('places');
          if (searchWidget) return;
          const search = (searchWidget = new PlaceAutocompleteElement({
            includedRegionCodes: ['jo'],
            requestedLanguage: ar() ? 'ar' : 'en',
            requestedRegion: 'JO',
          }));
          controls.append(search);
          search.addEventListener('gmp-error', () => (status.textContent = message()));
          search.addEventListener('gmp-select', async (event) => {
            const token = ++version;
            try {
              const place = event.placePrediction.toPlace();
              await place.fetchFields({ fields: ['location', 'formattedAddress', 'id'] });
              if (destroyed || token !== version || !place.location) return;
              select({ latitude: place.location.lat(), longitude: place.location.lng() });
              placeId = place.id;
              const accept = button('اعتماد العنوان المقترح', 'Use suggested address', () => {
                if (address) address.value = place.formattedAddress || address.value;
                accept.remove();
              });
            } catch (e) {
              status.textContent = message(e);
            }
          });
        } catch (e) {
          status.textContent = message(e);
        }
      });
    if (simple) {
      controls.insertBefore(currentLocationButton, confirmButton);
    }
    const load = async () => {
      if (window.WusoolApiConfig.googleMapsProvider === 'free-embed') {
        const frame = document.createElement('iframe');
        frame.title = t('خريطة Google Maps', 'Google Maps');
        frame.loading = 'lazy';
        frame.referrerPolicy = 'no-referrer-when-downgrade';
        frame.style.cssText = 'border:0;width:100%;height:100%';
        canvas.append(frame);
        const sync = () => {
          frame.src =
            'https://www.google.com/maps?' +
            new URLSearchParams({
              q: WusoolLocation.urls({ ...currentRecord, ...confirmed }).query,
              output: 'embed',
              hl: ar() ? 'ar' : 'en',
              z: confirmed ? '16' : '7',
            });
        };
        freeFrameRefresh = sync;
        sync();
        return;
      }
      try {
        const [{ Map }] = await Promise.all([
          WusoolMapsLoader.library('maps'),
          WusoolMapsLoader.library('marker'),
        ]);
        if (destroyed) return;
        map = new Map(canvas, {
          center: { lat: 31.24, lng: 36.51 },
          zoom: 8,
          mapId: window.WusoolApiConfig.googleMapsMapId || 'DEMO_MAP_ID',
          restriction: { latLngBounds: WusoolLocation.bounds, strictBounds: false },
          gestureHandling: 'cooperative',
          fullscreenControl: true,
          streetViewControl: true,
        });
        if (editable)
          listeners.push(
            map.addListener('click', (e) =>
              select({ latitude: e.latLng.lat(), longitude: e.latLng.lng() }),
            ),
          );
        draw(confirmed);
        state.setMarkers(collection);
        if (!confirmed) describe();
      } catch (e) {
        status.textContent = message(e);
        canvas.textContent = t(
          'الخريطة غير متاحة. الإحداثيات والعنوان محفوظان.',
          'Map unavailable. Coordinates and address are retained.',
        );
      }
    };
    const observer =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
            if (map) {
              window.google.maps.event?.trigger(map, 'resize');
            }
          })
        : null;
    observer?.observe(canvas);
    const stop = WusoolMapsLoader.onFailure((e) => {
      status.textContent = message(e);
      canvas.hidden = true;
    });
    const state = {
      canSave() {
        try {
          const point = read();
          const ok =
            !pending &&
            (!point
              ? !required
              : confirmed &&
                point.latitude === confirmed.latitude &&
                point.longitude === confirmed.longitude);
          if (!ok)
            status.textContent = t('أكد الموقع قبل الحفظ.', 'Confirm location before saving.');
          return !!ok;
        } catch (e) {
          status.textContent = message(e);
          return false;
        }
      },
      setMarkers(items) {
        collection = items;
        if (!map) return;
        collectionMarkers.forEach((m) => (m.map = null));
        collectionMarkers = [];
        for (const p of items.filter(WusoolLocation.valid)) {
          const m = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: Number(p.latitude), lng: Number(p.longitude) },
            title: p.name,
          });
          collectionMarkers.push(m);
          listeners.push(m.addListener('click', () => restore(p)));
          listeners.push({ remove: () => (m.map = null) });
        }
      },
      restore,
      confirm,
      getValue: () => ({ ...confirmed, googlePlaceId: placeId }),
      destroy() {
        observer?.disconnect();
        destroyed = true;
        version++;
        listeners.forEach((l) => l?.remove?.());
        if (marker) marker.map = null;
        stop();
        card.remove();
        states.delete(host);
      },
    };
    states.set(host, state);
    restore(value);
    regionSelect.value = value.governorate || '';
    load();
    return state;
  }
  const branches = async (host, items, title) => {
    const select = document.createElement('select');
    select.className = 'form-select';
    select.setAttribute('aria-label', t('اختر فرعًا', 'Select branch'));
    host.append(select);
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = t('كل الفروع', 'All branches');
    select.append(blank);
    for (const p of items) {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      select.append(option);
    }
    const preview = document.createElement('div');
    host.append(preview);
    const state = mount(preview, { value: {}, title });
    state.setMarkers(items);
    select.addEventListener('change', () =>
      state.restore(items.find((p) => p.id === select.value) || {}),
    );
    return state;
  };
  return { mount, message, branches };
})();
