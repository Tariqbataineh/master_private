const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');const root=path.join(__dirname,'..');
async function screen(html,js,stored,extra={}){
 const d=new JSDOM(fs.readFileSync(path.join(root,html),'utf8'),{url:'http://localhost/'+html+'?id=b',runScripts:'outside-only'}),w=d.window;const callbacks=[];let modalShown=false;
 w.bootstrap={Modal:{getOrCreateInstance:()=>({show(){modalShown=true}})},Toast:{getOrCreateInstance:()=>({show(){}})}};
 w.WusoolUI={enqueue:async f=>{await f()},guard:async()=>true,ready:f=>callbacks.push(f),html:(n,s)=>{if(n)n.innerHTML=s},escape:s=>String(s??''),insertHTML:(n,pos,s)=>n.insertAdjacentHTML(pos,s),listen:(n,e,f)=>n?.addEventListener(e,f),message(){}};
 w.WusoolServices={mode:'local',rawRead:async k=>stored[k]??null,rawWrite:async(k,v)=>{stored[k]=v},...extra};
 w.eval(fs.readFileSync(path.join(root,js),'utf8'));await new Promise(r=>setTimeout(r,0));for(const f of callbacks)await f();return {w,d,shown:()=>modalShown};
}
test('legacy review with absent feedback and numeric ID opens details without crashing',async()=>{
 const {w,shown}=await screen('org/html/review-history.html','org/js/review-history.js',{wusoolBranchReviewHistory:JSON.stringify([{id:7,reference:'REV-7',branchId:'b',branchName:'Test',city:'Amman',status:'approved',score:0}])});
 w.document.querySelector('[data-review-id]').click();await new Promise(r=>setTimeout(r,0));assert.equal(shown(),true);assert.match(w.document.getElementById('modalFeedbackList').textContent,/No additional/);assert.equal(w.document.getElementById('modalScore').textContent,'0%');w.close();
});
test('pending schedule keeps Continue enabled and retains approved schedule for following setup steps',async()=>{
 const stored={wusoolOrganization:JSON.stringify({id:'o',subscriptionStatus:'active'}),wusoolOrganizationLoggedIn:'true',wusoolOrganizationBranches:JSON.stringify([{id:'b',name:'Branch'}])};
 const schedule={workingHours:{sunday:{isOpen:true,openTime:'09:00',closeTime:'16:00'}},specialHours:[]};
 const {w}=await screen('org/html/branch-working-hours.html','org/js/branch-working-hours.js',stored,{getSchedule:async()=>({pending:{id:'req',revision:1,proposed:schedule},schedule,hasSchedule:true,hoursRevision:1}),saveHours:async(_kind,_id,proposed,options)=>{assert.equal(options.amendPending,true);assert.equal(options.expectedRequestRevision,1);return {status:'pending',resource:{id:'b',workingHours:schedule.workingHours},request:{id:'req',revision:2}}}});
 assert.equal(w.document.querySelector('button[type="submit"]').disabled,false);assert.equal(w.document.getElementById('saveHoursDraftButton').disabled,false);
 w.document.getElementById('workingHoursForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,15));assert.equal(JSON.parse(stored.wusoolCurrentBranchDraft).workingHours.sunday.closeTime,'16:00');w.close();
});
