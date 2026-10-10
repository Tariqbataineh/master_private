const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const files=["service-registry.js","storage-adapter.js","http-client.js","services/core.js","services/local.js","services/entities.js","services/auth.js","services/bookings.js","services/integrations.js","services/facade.js","services/state.js","services/journey.js","services/visits.js","services/hours.js"];
function loadServices(ctx){for(const file of files)vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets',file),'utf8'),ctx,{filename:file});vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/app-services.js'),'utf8'),ctx,{filename:'app-services.js'});}
module.exports={files,loadServices};
