// Copy settings into assets/api-config.js only after your endpoints are implemented.
window.WusoolApiConfig = Object.freeze({
  mode: 'api',
  baseUrl: '/api', // For PathBase /wusool use /wusool/api.
  credentials: 'include',
  timeoutMs: 15000,
  antiforgery: Object.freeze({
    enabled: true,
    path: '/auth/antiforgery',
    headerName: 'X-CSRF-TOKEN',
  }),
  demoSubscription: false,
  demoBranchAnalysis: false,
  demoBranchPublication: false,
  googleMapsProvider: 'free-embed',
  googleMapsEmbedKey: '',
  googleMapsJavaScriptKey: '',
  googleMapsMapId: 'DEMO_MAP_ID',
  googleMapsGeocodingEnabled: false,
  googleMapsPlacesEnabled: false,
});
