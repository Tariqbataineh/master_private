const {verifyReception}=require('./test-helpers.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {env,scenario}=require('./test-helpers.cjs');
const {mount,Element}=require('./controller-helpers.cjs');
test('visitor owns departure and arrival; organization observes canonical state, notifications and reception',async()=>{
 const {e,s,user,org,branch}=await scenario();await s.login(user.email,'Password123@');
 const b=await s.createBooking({branchId:branch.id,date:'2099-01-01',time:'12:00'},'visitor-owned');
 await s.login(org.email,'Password123@','Organization');await s.bookingStatus(b.id,'confirmed');
 const organization=env(e.local);await organization.api.login(org.email,'Password123@','Organization');
 const slot=s.journey.appointment(b);
 assert.throws(()=>organization.api.journey.change(b.id,'depart',{},slot-1000),{code:'FORBIDDEN'});
 assert.throws(()=>organization.api.journey.change(b.id,'arrive',{},slot),{code:'FORBIDDEN'});
 await s.login(user.email,'Password123@');s.journey.change(b.id,'depart',{},slot-1000);
 assert.equal((await organization.api.getBookings())[0].journeyState,'on-the-way');
 s.journey.change(b.id,'arrive',{},slot);
 const visible=(await organization.api.getBookings())[0];assert.equal(visible.journeyState,'arrived');assert.equal(visible.status,'confirmed');assert.equal(visible.journeyHistory.at(-1).actorRole,'User');
 const notifications=(await organization.api.list('notifications')).items;assert.ok(notifications.some(n=>n.bookingId===b.id&&n.journeyState==='arrived'));
 verifyReception(organization,b.id);await organization.api.bookingStatus(b.id,'in-progress');assert.equal((await s.getBookings())[0].journeyState,'serving');
});
for(const role of ['User','Organization'])test(role+' ticket UI shows the right journey actions without hiding user departure eligibility',async()=>{
 const {e,s,user,org,branch}=await scenario();await s.login(user.email,'Password123@');const b=await s.createBooking({branchId:branch.id,date:'2099-01-01',time:'12:00'},'journey-ui-'+role);await s.login(org.email,'Password123@','Organization');await s.bookingStatus(b.id,'confirmed');if(role==='User')await s.login(user.email,'Password123@');
 e.ctx.setInterval=()=>1;e.ctx.clearInterval=()=>{};const selectors=new Map();
 await mount(e,'assets/booking-tickets.js','',{html:role==='User'?'user/html/my-tickets.html':'org/html/visitor-tickets.html',configureDocument(d){d.createElement=()=>{const panel=new Element();panel.querySelector=key=>{if(!selectors.has(key))selectors.set(key,new Element());return selectors.get(key);};return panel;};}});
 const rows=selectors.get('[data-rows]').innerHTML;
 if(role==='User'){assert.match(rows,/data-journey="depart"[^>]*disabled/);assert.match(rows,/within two hours/);}else{assert.doesNotMatch(rows,/data-journey="depart"|data-journey="arrive"/);}
});
