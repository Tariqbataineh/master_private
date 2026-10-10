const {test}=require('node:test'),assert=require('node:assert/strict');
const {env,scenario}=require('./test-helpers.cjs');
test('demo review persists provenance, completes submission and invalidates after evidence edits',async()=>{
 const {e,s,org,branch}=await scenario(env(undefined,{mode:'local',demoSubscription:true,demoBranchAnalysis:true}));
 await s.login(org.email,'Password123@','Organization');
 const data=JSON.parse(e.local.getItem('wusool.database.v2')),b=data.branches.find(x=>x.id===branch.id);
 b.status='draft';b.aiReview=null;b.completedSteps.aiReview=false;e.local.setItem('wusool.database.v2',JSON.stringify(data));
 const result=await s.analyzeBranch(b.id);assert.equal(result.source,'demo');assert.equal(result.isDemo,true);assert.equal(result.score,67);
 let saved=await s.getBranchById(b.id);assert.equal(saved.completedSteps.aiReview,true);assert.equal(saved.scoreSource,'demo');
 saved=await s.saveBranch({...saved,description:'Updated description'});assert.equal(saved.accessibilityScore,67);assert.equal(saved.scoreSource,'demo');
 saved=await s.setBranchStatus(b.id,'pending');assert.equal(saved.status,'pending');
 saved=await s.saveBranch({...saved,status:'draft',photos:[]});assert.equal(saved.aiReview,null);assert.equal(saved.accessibilityScore,null);
 await assert.rejects(s.analyzeBranch(b.id),{code:'BRANCH_INCOMPLETE'});
});
test('demo review is opt-in and ordinary users cannot run it',async()=>{
 const {s,user,branch}=await scenario();await assert.rejects(s.analyzeBranch(branch.id),{code:'INTEGRATION_UNAVAILABLE'});
 await s.login(user.email,'Password123@','User');await assert.rejects(s.analyzeBranch(branch.id),{code:'FORBIDDEN'});
});
test('API mode sends only branchId and never falls back to demo',async()=>{
 const e=env(undefined,{mode:'api',baseUrl:'/api',demoBranchAnalysis:true});let call;
 e.ctx.fetch=async(url,options)=>{call={url,options};return {ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>({status:'completed',score:82,source:'ai'})};};
 const result=await e.api.analyzeBranch('branch-123');assert.equal(result.score,82);assert.match(call.url,/ai\/branch-analysis$/);assert.deepEqual(JSON.parse(call.options.body),{branchId:'branch-123'});
});
