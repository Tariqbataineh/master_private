const {test}=require('node:test'),assert=require('node:assert/strict');const {env,scenario}=require('./test-helpers.cjs');
test('finish local setup publishes completed demo branch and keeps evidence unverified',async()=>{
 const {e,s,org,user,branch}=await scenario(env(undefined,{mode:'local',demoSubscription:true,demoBranchAnalysis:true,demoBranchPublication:true}));
 await s.login(org.email,'Password123@','Organization');await s.analyzeBranch(branch.id);
 const published=await s.finalizeBranchSetup(branch.id);assert.equal(published.status,'approved');assert.equal(published.demoPublication,true);assert.equal(published.evidenceStatus,'unverified');assert.equal(published.scoreSource,'demo');
 const list=JSON.parse(await s.rawRead('wusoolOrganizationBranches'));assert.equal(list.find(b=>b.id===branch.id).status,'approved');
 await s.login(user.email,'Password123@','User');assert.equal((await s.places()).items.some(b=>b.id===branch.id),true);await assert.rejects(s.finalizeBranchSetup(branch.id),{code:'FORBIDDEN'});
});
test('admin approval is immediately read by organization and public catalog without stale draft',async()=>{
 const {e,s,org,branch}=await scenario();await s.setBranchStatus(branch.id,'draft');
 const orgEnv=env(e.local);await orgEnv.api.login(org.email,'Password123@','Organization');
 assert.equal(JSON.parse(await orgEnv.api.rawRead('wusoolOrganizationBranches'))[0].status,'draft');
 await s.setBranchStatus(branch.id,'approved');
 assert.equal(JSON.parse(await orgEnv.api.rawRead('wusoolOrganizationBranches'))[0].status,'approved');assert.equal((await orgEnv.api.places()).items.some(b=>b.id===branch.id),true);
});
test('incomplete branch cannot be published through finish button service',async()=>{
 const {e,s,org,branch}=await scenario(env(undefined,{mode:'local',demoSubscription:true,demoBranchAnalysis:true,demoBranchPublication:true}));await s.login(org.email,'Password123@','Organization');await s.analyzeBranch(branch.id);
 const data=JSON.parse(e.local.getItem('wusool.database.v2'));data.branches[0].photos=[];e.local.setItem('wusool.database.v2',JSON.stringify(data));
 await assert.rejects(s.finalizeBranchSetup(branch.id),{code:'BRANCH_INCOMPLETE'});
});
