'use strict';
WusoolUI.enqueue(async () => {
  WusoolUI.ready(async () => {
    const path = location.pathname,
      file = path.split('/').pop(),
      s = WusoolServices,
      by = (id) => document.getElementById(id),
      ar = document.documentElement.lang === 'ar',
      t = (a, e) => (ar ? a : e);
    const hostFor = (field) => {
      const host = document.createElement('div');
      host.className = 'col-12 my-3';
      field.parentElement.insertAdjacentElement('afterend', host);
      return host;
    };
    const picker = (addressId, latitudeId, longitudeId, cityId, record = {}) => {
      const address = by(addressId);
      if (!address) return;
      let lat = by(latitudeId),
        lng = by(longitudeId);
      if (!lat || !lng) {
        const form = address.closest('form');
        for (const [id, axis] of [
          [latitudeId, 'latitude'],
          [longitudeId, 'longitude'],
        ]) {
          const input = document.createElement('input');
          input.id = id;
          input.type = 'hidden';
          input.value = record[axis] ?? '';
          form.append(input);
        }
        lat = by(latitudeId);
        lng = by(longitudeId);
      }
      const synthetic = lat.type === 'hidden';
      const host = hostFor(address);
      const state = WusoolLocationUI.mount(host, {
        address,
        city: by(cityId),
        latitude: synthetic ? null : lat,
        longitude: synthetic ? null : lng,
        value: record,
        editable: true,
        required: true,
        simple: true,
        onConfirm: (point) => {
          lat.value = point.latitude;
          lng.value = point.longitude;
          lat.dispatchEvent(new Event('change', { bubbles: true }));
        },
      });
      return { state, host, lat, lng };
    };
    const viewer = (record, parent = document.querySelector('main'), title) => {
      if (!record || !parent) return;
      const host = document.createElement('div');
      host.className = 'container-fluid px-3 px-md-4 py-3';
      parent.append(host);
      return WusoolLocationUI.mount(host, { value: record, title });
    };
    const params = new URLSearchParams(location.search),
      id = params.get('id');
    if (file === 'organization-register.html') {
      const draft = await s.getLocationDraft();
      const record = draft || {};
      if (record.address && !by('address').value) by('address').value = record.address;
      const p = picker('address', 'organizationLatitude', 'organizationLongitude', null, record);
      if (p) {
        p.state.restore(record);
        const form = by('organizationRegisterForm');
        form.addEventListener('change', () => {
          const point = {
            latitude: p.lat.value,
            longitude: p.lng.value,
            address: by('address').value,
            governorate: p.host.querySelector('[data-location-governorate]')?.value,
            googlePlaceId: p.host.querySelector('[data-location-place-id]')?.value,
          };
          s.saveLocationDraft(point).catch(WusoolUI.error);
        });
      }
    }
    if (file === 'organization-settings.html') {
      const a = await s.getCurrentAccount();
      picker('organizationAddress', 'organizationLatitude', 'organizationLongitude', null, a);
    }
    if (file === 'add-branch.html') {
      let record = {};
      try {
        record = JSON.parse((await s.rawRead('wusoolCurrentBranchDraft')) || 'null') || {};
      } catch {}
      const p = picker('branchAddress', 'latitude', 'longitude', 'branchCity', record);
      if (p) {
        by('saveDraftButton')?.addEventListener(
          'click',
          (event) => {
            if (!p.state.canSave()) {
              event.preventDefault();
              event.stopImmediatePropagation();
            }
          },
          { capture: true },
        );
        by('useLocationButton')?.setAttribute('hidden', '');
      }
    }
    if (file === 'edit-branch.html') {
      const branch = id ? await s.getBranchById(id) : null;
      if (branch)
        picker('branchAddress', 'branchLatitude', 'branchLongitude', 'branchCity', branch);
    }
    if (file === 'admin-branches.html') {
      const p = picker('branchAddress', 'branchLatitude', 'branchLongitude', 'branchCity');
      if (p)
        by('branchModal')?.addEventListener('shown.bs.modal', async () => {
          const record = by('branchId').value ? await s.getBranchById(by('branchId').value) : {};
          p.lat.value = record?.latitude ?? '';
          p.lng.value = record?.longitude ?? '';
          p.state.restore(record || {});
        });
    }
    if (file === 'admin-organizations.html') {
      const p = picker(
        'organizationAddress',
        'organizationLatitude',
        'organizationLongitude',
        'organizationCity',
      );
      if (p)
        by('organizationModal')?.addEventListener('shown.bs.modal', async () => {
          const record = by('organizationId').value
            ? await s.getOrganizationById(by('organizationId').value)
            : {};
          p.lat.value = record?.latitude ?? '';
          p.lng.value = record?.longitude ?? '';
          p.state.restore(record || {});
        });
    }
    if (['place-details.html', 'user-place-details.html'].includes(file)) {
      const places = (await s.places()).items,
        p = places.find((x) => x.id === id);
      if (p) viewer(p, document.querySelector('main'), t('موقع الفرع', 'Branch location'));
    }
    if (file === 'organization-branch-details.html') {
      const p = id ? await s.getBranchById(id) : null;
      if (p) viewer(p, document.querySelector('main'), t('موقع الفرع', 'Branch location'));
    }
    if (file === 'organization-dashboard.html') {
      const a = await s.getCurrentAccount();
      viewer(a, document.querySelector('main'), t('المقر الرئيسي', 'Head office location'));
      const branches = await s.getBranches();
      const host = document.createElement('section');
      host.className = 'container-fluid px-4 py-3';
      document.querySelector('main').append(host);
      await WusoolLocationUI.branches(
        host,
        branches,
        t('مواقع فروع المؤسسة', 'Organization branch locations'),
      );
    }
    if (['registration-pending.html', 'organization-approved.html'].includes(file)) {
      viewer(
        await s.getCurrentAccount(),
        document.querySelector('main'),
        t('موقع المؤسسة المسجّل', 'Registered organization location'),
      );
    }
    if (['branch-submit-review.html', 'branch-review-status.html'].includes(file)) {
      let p = id ? await s.getBranchById(id) : null;
      if (!p && file === 'branch-submit-review.html') {
        try {
          p = JSON.parse((await s.rawRead('wusoolCurrentBranchDraft')) || 'null');
        } catch {}
      }
      if (p) viewer(p);
    }
    if (file === 'plan-visit.html') {
      const select = by('placeSelect'),
        items = (await s.places()).items;
      if (select && items.length) {
        const state = WusoolLocationUI.mount(hostFor(select), {
          value: items.find((x) => x.id === select.value) || {},
        });
        select.addEventListener('change', () =>
          state.restore(items.find((x) => x.id === select.value) || {}),
        );
      }
    }
    if (file === 'visit-summary.html') {
      try {
        const draft = JSON.parse((await s.rawRead('wusool-pending-visit')) || 'null');
        const item = (await s.places()).items.find((x) => x.id === draft?.placeId);
        if (item) viewer(item);
      } catch (error) {
        WusoolUI.error(error);
      }
    }
    if (file === 'visit-details.html') {
      const b = (await s.getBookings()).find((x) => x.id === id),
        p = b ? await s.getBranchById(b.branchId) : null;
      if (p) viewer(p);
    }
    if (file === 'admin-accessibility-heatmap.html') {
      const host = document.createElement('section');
      host.className = 'container-fluid px-4 py-3';
      document.querySelector('main').append(host);
      await WusoolLocationUI.branches(
        host,
        await s.getBranches(),
        t('مواقع الفروع للمراجعة', 'Branch locations for review'),
      );
    }
    if (file === 'saved-places.html') {
      const saved = (await s.getCurrentAccount())?.savedPlaces || [];
      const ids = saved.map((x) => (typeof x === 'string' ? x : x.placeId || x.branchId || x.id));
      const items = (await s.places()).items.filter((p) => ids.includes(p.id));
      const host = document.createElement('section');
      host.className = 'container-fluid px-4 py-3';
      document.querySelector('main').append(host);
      await WusoolLocationUI.branches(
        host,
        items,
        t('مواقع الأماكن المحفوظة', 'Saved place locations'),
      );
    }
    if (file === 'branches.html' && path.includes('/org/')) {
      const host = document.createElement('section');
      host.className = 'container-fluid px-4 py-3';
      document.querySelector('main').append(host);
      await WusoolLocationUI.branches(
        host,
        await s.getBranches(),
        t('مواقع الفروع', 'Branch locations'),
      );
    }
  });
});
