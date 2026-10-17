'use strict';
window.WusoolLocation = (() => {
  const bounds = Object.freeze({ north: 33.38, south: 29.18, west: 34.95, east: 39.31 });
  const number = (v) => (v == null || String(v).trim() === '' ? null : Number(v));
  const pair = (latitude, longitude) => {
    const lat = number(latitude),
      lng = number(longitude);
    if (lat === null && lng === null) return null;
    if (
      lat === null ||
      lng === null ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    )
      throw Object.assign(new Error('Enter a valid latitude and longitude pair.'), {
        code: 'INVALID_LOCATION',
      });
    return { latitude: lat, longitude: lng };
  };
  const supported = (p) =>
    p &&
    p.latitude >= bounds.south &&
    p.latitude <= bounds.north &&
    p.longitude >= bounds.west &&
    p.longitude <= bounds.east;
  const validate = (lat, lng) => {
    const p = pair(lat, lng);
    if (p && !supported(p))
      throw Object.assign(
        new Error('Location is outside the supported approximate Jordan bounds.'),
        { code: 'LOCATION_OUTSIDE_BOUNDS' },
      );
    return p;
  };
  const valid = (p) => {
    try {
      return !!pair(p?.latitude, p?.longitude);
    } catch {
      return false;
    }
  };
  const fields = (p) => {
    const point = validate(p?.latitude, p?.longitude);
    return {
      latitude: point?.latitude ?? null,
      longitude: point?.longitude ?? null,
      countryCode: point ? 'JO' : p?.countryCode || null,
      ...('googlePlaceId' in (p || {})
        ? { googlePlaceId: p.googlePlaceId ? String(p.googlePlaceId).slice(0, 300) : null }
        : {}),
      ...(p?.governorate ? { governorate: p.governorate } : {}),
    };
  };
  const urls = (p) => {
    let point = null;
    try {
      point = pair(p?.latitude, p?.longitude);
    } catch {}
    const query = point
      ? `${point.latitude},${point.longitude}`
      : [p?.address, p?.city, p?.governorate, 'Jordan'].filter(Boolean).join(', ');
    return {
      query,
      exact: !!point,
      open: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query),
      directions: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(query),
    };
  };
  const regions = [
    ['Amman', 'عمّان', 31.9539, 35.9106],
    ['Irbid', 'إربد', 32.5556, 35.85],
    ['Zarqa', 'الزرقاء', 32.0728, 36.088],
    ['Balqa', 'البلقاء', 32.0392, 35.7272],
    ['Mafraq', 'المفرق', 32.3429, 36.208],
    ['Jerash', 'جرش', 32.2747, 35.8961],
    ['Ajloun', 'عجلون', 32.3326, 35.7517],
    ['Madaba', 'مادبا', 31.7167, 35.8],
    ['Karak', 'الكرك', 31.1853, 35.7048],
    ['Tafilah', 'الطفيلة', 30.8375, 35.6044],
    ['Maan', 'معان', 30.192, 35.736],
    ['Aqaba', 'العقبة', 29.532, 35.006],
  ];
  const parseLink = (value) => {
    const raw = String(value || '').trim();
    let pairText = raw;
    if (/^https?:/i.test(raw)) {
      const url = new URL(raw);
      if (!/(^|\.)google\.(com|[a-z.]+)$/.test(url.hostname))
        throw Object.assign(new Error('Use Google Maps coordinates.'), {
          code: 'INVALID_LOCATION',
        });
      pairText =
        url.pathname
          .match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
          ?.slice(1)
          .join(',') ||
        url.pathname.match(/@(-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?)/)?.[1] ||
        url.searchParams.get('query') ||
        url.searchParams.get('q') ||
        url.searchParams.get('ll') ||
        '';
    }
    const match = pairText.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (!match)
      throw Object.assign(
        new Error('Paste a coordinate pair or Google Maps URL containing coordinates.'),
        { code: 'INVALID_LOCATION' },
      );
    return validate(match[1], match[2]);
  };
  return { parseLink, regions, bounds, number, pair, validate, supported, valid, fields, urls };
})();
