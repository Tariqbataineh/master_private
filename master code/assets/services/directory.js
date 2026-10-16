"use strict";
window.WusoolServiceModules.push(function registerDirectory(ctx) {
  // Catalogs are authored exclusively through administrator/organization services.
  // Existing browser records are retained; no import or automatic data generation.
  ctx.directoryBranch = () => undefined;
});
