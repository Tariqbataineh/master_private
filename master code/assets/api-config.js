'use strict';
// The single switch: 'local' demonstrations or 'api' backend-only data.
// Edit this file before serving the app; no provider secrets belong here.
window.WusoolApiConfig = Object.freeze({
  mode: 'local',
  baseUrl: '/api',
  credentials: 'include',
  timeoutMs: 15000,
  antiforgery: Object.freeze({
    enabled: true,
    path: '/auth/antiforgery',
    headerName: 'X-CSRF-TOKEN',
  }),
  demoSubscription: true,
  demoBranchAnalysis: true,
  demoBranchPublication: true,
  googleMapsProvider: 'free-embed',
  googleMapsEmbedKey: '',
  googleMapsJavaScriptKey: '',
  googleMapsMapId: 'DEMO_MAP_ID',
  googleMapsGeocodingEnabled: false,
  googleMapsPlacesEnabled: false,
});
