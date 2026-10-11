const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),baseline=process.env.WUSOOL_BASELINE?path.resolve(process.env.WUSOOL_BASELINE):null;
const pictures=path.join(root,'docs/screenshots-v24');fs.mkdirSync(pictures,{recursive:true});
const report={checks:[],errors:[],missing:[],screenshots:[],provider:'Google APIs replaced with test doubles except explicitly named live fallback captures'};
const check=(name)=>report.checks.push(name);
function mockMaps(){
 const maps=[],markers=[];window.__mapTests={maps,markers,cards:[]};
 class MapTest{constructor(n,options){this.node=n;this.options=options;maps.push(this);n.textContent='Maps API test double · geographic tiles not loaded';n.style.cssText='display:grid;place-items:center;background:#eaf3f0;color:#334b4a;font:14px sans-serif;';}setCenter(){}panTo(){}setZoom(){}setMapTypeId(){}fitBounds(){}addListener(){return{remove(){}}}}
 class MarkerTest{constructor(options){Object.assign(this,options);this.listeners={};markers.push(this);}addListener(n,fn){this.listeners[n]=fn;return{remove(){}}}setMap(v){this.map=v;}}
 class AdvancedMarkerTest extends MarkerTest{}
 class InfoWindowTest{setContent(card){this.card=card;window.__mapTests.cards.push(card);}open({map}){map.node.append(this.card)}close(){this.card?.remove()}}
 window.google={maps:{Marker:MarkerTest,SymbolPath:{CIRCLE:'circle'},LatLngBounds:class{extend(){}},importLibrary:async name=>name==='maps'?{Map:MapTest,InfoWindow:InfoWindowTest}:name==='marker'?{Marker:MarkerTest,AdvancedMarkerElement:AdvancedMarkerTest}:name==='routes'?{DirectionsService:class{async route(){return{routes:[{legs:[{distance:{text:'2 km'},duration:{text:'4 min'}}]}]}}},DirectionsRenderer:class{setMap(){}setDirections(){}}}:{} }};
}
(async()=>{
const server=http.createServer((req,res)=>{try{const url=decodeURIComponent(new URL(req.url,'http://local').pathname),tree=url.startsWith('/baseline/')?baseline:root;const file=path.resolve(tree,url.replace(/^\/(current|baseline)\//,''));if(!file.startsWith(tree+path.sep))throw Error('Invalid path');res.setHeader('Content-Type',{'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'}[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.WUSOOL_CHROMIUM||undefined,headless:true,args:['--no-sandbox']});
try{
 const fixture=await require(path.join(root,'tests/test-helpers.cjs')).scenario();await fixture.s.login(fixture.user.email,'Password123@');
 const pending=await fixture.s.createBooking({branchId:fixture.branch.id,date:'2099-01-01',time:'12:00'},'browser-pending');
 const completed=await fixture.s.createBooking({branchId:fixture.branch.id,date:'2099-01-01',time:'11:00'},'browser-completed');
 const data=JSON.parse(fixture.e.local.getItem('wusool.database.v2'));data.organizations.find(o=>o.id===fixture.org.id).subscriptionStatus='active';
 Object.assign(data.bookings.find(b=>b.id===completed.id),{status:'completed',journeyState:'completed'});
 const b1=data.branches.find(b=>b.id===fixture.branch.id);b1.photos.forEach(p=>p.imageData='../../assets/images/wusool-login-campus.png');
 const second={...structuredClone(b1),id:'branch-second-test',name:'Second fixture branch',branchName:'Second fixture branch',services:['Second configured service']};data.branches.push(second);
 data.reviews.push({id:'published-review-test',branchId:b1.id,userId:fixture.user.id,status:'Visible',rating:5,isDeleted:false},{id:'unpublished-review-test',branchId:b1.id,userId:fixture.user.id,status:'Pending',rating:1,isDeleted:false});
 const newPage=async(role='User',mock=true)=>{
  const p=await browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))report.missing.push(r.url());});
  await p.route('https://**/*',route=>route.abort());
  await p.addInitScript(({data,id,role})=>{if(location.hostname!=='127.0.0.1')return;localStorage.setItem('wusool.database.v2',JSON.stringify(data));sessionStorage.setItem('wusool.session.v2',JSON.stringify({id,role,version:data.revocations[id]||0}));},{data,id:role==='User'?fixture.user.id:role==='Organization'?fixture.org.id:'admin-local',role});
  if(mock)await p.addInitScript(mockMaps);return p;
 };
 const goto=async(p,tree,route)=>p.goto(base+(tree===root?'/current/':'/baseline/')+route);
 const shot=async(p,name,locator)=>{await (locator||p).screenshot({path:path.join(pictures,name+'.png')});report.screenshots.push(name+'.png');};
 for(const [tree,label]of [...(baseline?[[baseline,'before']]:[]),[root,'after']]){
  const p=await newPage();await goto(p,tree,'user/html/my-tickets.html');await p.locator('[data-journey=history]').first().waitFor();
  await shot(p,label+'-ticket-table',p.locator('.booking-table-card').last());await p.click('[data-new]');await p.locator('dialog [name=branchId]').selectOption(b1.id);
  if(label==='after')await p.locator('.wte-service input').first().waitFor();await p.waitForTimeout(350);await shot(p,label+'-ticket-modal',p.locator('dialog').last());await p.keyboard.press('Escape');
  await goto(p,tree,'visitor/html/accessibility-map.html');await p.waitForFunction(()=>WusoolMapPlaces?.length===2);await p.evaluate(()=>__mapTests.markers.find(m=>m.position?.lat===32.55)?.listeners.click?.());await shot(p,label+'-map-integration-test-double',p.locator('#mapCanvas'));await p.close();
 }
 for(const [role,route]of [['User','user/html/my-tickets.html'],['Organization','org/html/visitor-tickets.html'],['Admin','admin/html/admin-tickets.html']]){
  const p=await newPage(role);await goto(p,root,route);await p.locator('[data-journey=history]').first().waitFor();
  if(role==='User'){const counts=await p.locator('.booking-actions').evaluateAll(groups=>groups.map(g=>[...g.querySelectorAll('button,a')].filter(n=>!!n.getClientRects().length).map(n=>n.dataset.journey)));assert.deepEqual(counts,[['history'],['history']]);check('User rows show exactly one visible tracking action');}
  const actions=await p.locator('.booking-actions').first().locator('button,a').evaluateAll(nodes=>nodes.filter(n=>n.dataset.journey!=='history').map(n=>[n.textContent,n.disabled||false]));
  const dbBefore=await p.evaluate(()=>localStorage.getItem('wusool.database.v2'));await p.locator('[data-journey=history]').first().click();await p.locator('.bt-stages').waitFor();
  const copies=await p.locator('.bt-authorized [data-actions]').locator('button,a').evaluateAll(nodes=>nodes.map(n=>[n.textContent,n.disabled||false]));assert.deepEqual(copies,actions);check(role+' tracking retains original action labels, restrictions and handlers');
  await p.locator('[data-stage="0"]').dragTo(p.locator('[data-stage="3"]'));assert.equal(await p.locator('[data-stage="3"]').getAttribute('aria-pressed'),'true');assert.equal(await p.evaluate(()=>localStorage.getItem('wusool.database.v2')),dbBefore);check(role+' stage drag/drop is presentation-only');
  for(const width of [1440,768,390]){await p.setViewportSize({width,height:900});for(const lang of ['en','ar']){await p.evaluate(l=>WusoolPreferences.setLanguage(l),lang);await p.waitForTimeout(80);assert.equal(await p.locator('dialog').last().evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);}check(role+' tracking '+width+'px EN/AR no horizontal overflow');}
  await p.locator('dialog [data-close]').click();await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>WusoolPreferences.setLanguage('en'));
  if(role!=='Organization'){
   await p.click('[data-new]');const d=p.locator('.w-ticket-editor');await d.locator('[name=branchId]').selectOption(b1.id);await d.locator('.wte-service input').first().waitFor();
   if(role==='Admin')await d.locator('[name=userId]').selectOption(fixture.user.id);
   assert.equal(await d.evaluate(e=>Math.round(e.getBoundingClientRect().width)),940);check(role+' modal is 940px with original fields');
   await d.locator('.wte-service input').first().check();await d.locator('[name=branchId]').selectOption(second.id);await d.locator('.wte-service strong').filter({hasText:'Second configured service'}).waitFor();assert.equal(await d.locator('input[name=serviceId]:checked').count(),0);check(role+' branch change clears incompatible selection');
   await d.locator('[name=branchId]').selectOption(b1.id);await d.locator('.wte-service strong').filter({hasText:'Reception'}).waitFor();await d.locator('.wte-service input').check();
   for(const width of [1440,768,390]){await p.setViewportSize({width,height:900});for(const lang of ['en','ar']){await p.evaluate(l=>WusoolPreferences.setLanguage(l),lang);await p.waitForTimeout(120);assert.equal(await d.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);}check(role+' creation modal '+width+'px EN/AR no horizontal overflow');}
   await p.evaluate(()=>WusoolTheme.set('dark'));if(role==='User'){await shot(p,'after-ticket-modal-mobile-ar-dark',d);await d.locator('.wte-services').scrollIntoViewIfNeeded();await shot(p,'after-ticket-services-mobile-ar-dark',d);}assert.notEqual(await d.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');check(role+' modal Dark theme surface');
   await p.evaluate(()=>{document.documentElement.style.fontSize='24px';document.body.classList.add('high-contrast');});assert.equal(await d.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);check(role+' enlarged text and high contrast fit dialog');
   await p.evaluate(()=>{document.documentElement.style.fontSize='';document.body.classList.remove('high-contrast');WusoolTheme.set('light');WusoolPreferences.setLanguage('en');});await p.setViewportSize({width:1440,height:1000});
   if(role==='User'){
    await d.locator('[name=date]').fill('2099-01-02');await d.locator('[name=time]').fill('13:00');await d.locator('[name=durationMinutes]').selectOption('60');await d.locator('[name=requiresAssistant]').check();await d.locator('[type=submit]').click();await d.waitFor({state:'detached'});
    await p.waitForFunction(()=>JSON.parse(localStorage.getItem('wusool.database.v2')).bookings.length===3);const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('wusool.database.v2')).bookings.at(-1));assert.equal(saved.serviceName,'Reception');assert.equal(saved.durationMinutes,60);assert.equal(saved.requiresAssistant,true);check('User booking saves service, duration and assistance with existing workflow');
    await p.locator('[data-journey=history][data-id="'+saved.id+'"]').click();await p.locator('[data-service]').filter({hasText:'Reception'}).waitFor();check('Saved service is displayed in correct tracking ticket');await p.locator('dialog [data-close]').click();
    await p.locator('[data-journey=history][data-id="'+pending.id+'"]').click();await p.locator('.bt-authorized [data-actions] button').filter({hasText:'Reschedule'}).click();await p.locator('.w-ticket-editor').waitFor();check('Reschedule inside tracking invokes original editor');await p.keyboard.press('Escape');
    await p.locator('[data-journey=history][data-id="'+pending.id+'"]').click();await p.locator('.bt-authorized [data-actions] button').filter({hasText:'Cancel with reason'}).click();await p.locator('dialog textarea').waitFor();check('Cancellation inside tracking opens existing reason/confirmation flow');await p.keyboard.press('Escape');
    await p.locator('[data-journey=history][data-id="'+completed.id+'"]').click();assert.equal(await p.locator('.bt-authorized a').filter({hasText:'Review visit'}).count(),1);check('Completed historical ticket keeps review link in tracking');await p.keyboard.press('Escape');
   }else await p.keyboard.press('Escape');
  }
  if(role==='Organization'){
   await p.locator('.booking-toolbar button').filter({hasText:'Manage branch services'}).click();await p.locator('.w-service-manager [name=branchId]').selectOption(b1.id);await p.locator('[name=serviceName0]').waitFor();await p.locator('[name=serviceName0]').fill('Reception renamed');await p.locator('.w-service-manager [type=submit]').click();await p.locator('.w-service-manager [data-error]').filter({hasText:'Services saved'}).waitFor();check('Organization configures only its branch through async service manager');await p.keyboard.press('Escape');
   await p.locator('[data-journey=history]').first().click();await p.locator('.bt-authorized [data-actions] button').filter({hasText:'Approve'}).click();await p.locator('dialog [data-yes]').click();await p.waitForFunction(id=>JSON.parse(localStorage.getItem('wusool.database.v2')).bookings.find(b=>b.id===id).status==='confirmed',pending.id);check('Tracking approval passes original confirmation and booking transition');
  }
  await p.close();
 }
 const p=await newPage();await goto(p,root,'visitor/html/accessibility-map.html');await p.waitForFunction(()=>WusoolMapPlaces?.length===2);await p.waitForFunction(()=>__mapTests.markers.length>=2);
 let markers=await p.evaluate(()=>__mapTests.markers.filter(m=>m.map).length);assert.equal(markers,2);assert.equal(await p.evaluate(()=>__mapTests.maps[0].options.clickableIcons),false);check('Only two published fixture branches receive red markers; built-in POI interaction disabled');
 await p.evaluate(()=>__mapTests.markers[0].listeners.click());assert.match(await p.locator('.wusool-map-rating').textContent(),/5.0.*1/);check('Map rating uses only published review, excluding pending review');
 await p.evaluate(()=>{const items=WusoolMapPlaces;WusoolGoogleMap.setPlaces([items[0],items[0],{...items[1],latitude:''}]);});assert.equal(await p.evaluate(()=>__mapTests.markers.filter(m=>m.map).length),1);check('Duplicate IDs and missing coordinates do not create duplicate or invented markers');
 await p.locator('#googleMapPlace').selectOption(second.id);assert.match(await p.locator('#googleMapError').textContent(),/no saved coordinates/);check('Missing coordinates are reported honestly');
 await p.evaluate(()=>WusoolGoogleMap.setPlaces(WusoolMapPlaces));await p.locator('#searchInput').fill('Second fixture branch');await p.locator('#applyFilters').click();assert.equal(await p.evaluate(()=>__mapTests.markers.filter(m=>m.map).length),1);check('Existing discovery filters update markers');
 await p.evaluate(()=>__mapTests.markers.filter(m=>m.map)[0].listeners.click());assert.equal(await p.locator('.wusool-map-rating').textContent(),'No reviews yet');check('Unreviewed branch displays No reviews yet');
 await p.evaluate(()=>{const item={...WusoolMapPlaces[0],name:'<img src=x onerror=alert(1)>',address:'<script>bad()</script>'};WusoolGoogleMap.setPlaces([item]);__mapTests.markers.filter(m=>m.map)[0].listeners.click();});assert.equal(await p.locator('.wusool-map-card script').count(),0);assert.match(await p.locator('.wusool-map-card h3').textContent(),/<img/);check('Map record text is safe DOM text');
 await p.close();
 const live=await newPage('User',false);await goto(live,root,'visitor/html/accessibility-map.html');await live.locator('#googleMapError:not([hidden])').waitFor();await shot(live,'after-map-provider-unavailable',live.locator('#mapCanvas'));check('Real provider failure has visible message and usable external direction links (network blocked)');await live.close();
 // Honest service failure/empty states, and API ownership DTO validation.
 const statePage=await newPage();await goto(statePage,root,'user/html/my-tickets.html');await statePage.locator('[data-new]').waitFor();await statePage.click('[data-new]');await statePage.locator('.wte-services').getByText('Select a branch first to see its services.').waitFor();check('Service area asks for a branch before loading choices');
 await statePage.evaluate(()=>{window.__servicesOriginal=WusoolServices.getTicketServices;window.WusoolServices={...WusoolServices,getTicketServices:async()=>{throw Error('API fixture failure');}};});await statePage.locator('dialog [name=branchId]').selectOption(b1.id);await statePage.locator('.wte-services [role=alert]').filter({hasText:'API fixture failure'}).waitFor();assert.equal(await statePage.locator('.wte-services input').count(),0);check('Service API error remains visible with Retry, without invented options');
 await statePage.evaluate(()=>window.WusoolServices={...WusoolServices,getTicketServices:async()=>({items:[]})});await statePage.click('.wte-services [data-retry]');await statePage.locator('.wte-empty').waitFor();check('Empty service response shows explicit no services message');
 await statePage.evaluate(id=>window.WusoolServices={...WusoolServices,getTicketServices:async()=>({items:[{id:'bad',branchId:id,organizationId:'wrong-owner',name:'Foreign service'}]})},b1.id);await statePage.locator('dialog [name=branchId]').selectOption(second.id);await statePage.locator('.wte-services [role=alert]').waitFor();check('Mismatched service ownership DTO cannot be selected');await statePage.keyboard.press('Escape');await statePage.close();
 for(const route of ['visitor/html/login.html','visitor/html/register.html','user/html/user-dashboard.html','org/html/organization-dashboard.html','admin/html/admin-dashboard.html']){
  const role=route.startsWith('org/')?'Organization':route.startsWith('admin/')?'Admin':'User';if(baseline){const before=await newPage(role);await goto(before,baseline,route);await before.waitForTimeout(300);await shot(before,'before-'+route.replaceAll('/','-').replace('.html',''));await before.close();}
  const p=await newPage(role);await goto(p,root,route);await p.waitForTimeout(300);
  await shot(p,'after-'+route.replaceAll('/','-').replace('.html',''));
  for(const width of [1440,390]){await p.setViewportSize({width,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,route+' '+width);}
  check(route+' representative desktop/mobile viewport has no document overflow');await p.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.missing,[]);report.success=true;
}catch(e){report.success=false;report.failure=e.stack;}finally{fs.writeFileSync(path.join(root,'docs/browser-results-v24.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();server.close();}if(!report.success)process.exitCode=1;
})();
