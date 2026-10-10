const {test}=require('node:test');const assert=require('node:assert/strict');const {env}=require('./test-helpers.cjs');
for(const role of ['User','Organization'])test(`${role}: deleted email is reusable, login uses new record and recovery cannot duplicate email`,async()=>{
 const {api:s}=env();await s.seedAdmin();const old=await s.register({email:'reuse@test.com',password:'Oldpass1@'},role);
 await s.login('admin@wusool.com','WusoolAdmin2026@','Admin');const kind=role==='User'?'User':'Organization';await s['delete'+kind](old.id,'Removed');
 const fresh=await s.register({email:'reuse@test.com',password:'Newpass2@'},role);assert.notEqual(fresh.id,old.id);
 await assert.rejects(s.login(fresh.email,'Oldpass1@',role),{code:'INVALID_CREDENTIALS'});assert.equal((await s.login(fresh.email,'Newpass2@',role)).id,fresh.id);
 await s.login('admin@wusool.com','WusoolAdmin2026@','Admin');await assert.rejects(s['restore'+kind](old.id),{code:'EMAIL_EXISTS'});
 assert.equal((await s['get'+(kind==='User'?'Users':'Organizations')]()).some(x=>x.id===old.id),false);
});
for(const kind of ['users','organizations'])test(`${kind}: managed account has temporary credentials and cannot continue before first-login change`,async()=>{
 const e=env(),s=e.api;await s.seedAdmin();await s.login('admin@wusool.com','WusoolAdmin2026@','Admin');const created=await s.createManagedAccount(kind,{name:'Created',email:'managed@test.com',status:'active',phone:'0791234567',city:'Amman',address:'Amman office',type:'Bank'});
 assert.equal(created.deliveryStatus,'not-sent-local');assert.ok(created.temporaryAccessCode);assert.equal(e.local.getItem('wusool.database.v2').includes(created.temporaryAccessCode),false);
 const role=kind==='users'?'User':'Organization';const a=await s.login(created.account.email,created.temporaryAccessCode,role);assert.equal(a.requiresInitialSetup,true);
 await assert.rejects(s.list('notifications'),{code:'CREDENTIAL_CHANGE_REQUIRED'});
 await assert.rejects(s.changeInitialPassword(created.temporaryAccessCode,created.temporaryAccessCode),{code:'VALIDATION_ERROR'});
 await assert.rejects(s.changeInitialPassword('Wrong1@','Newpass2@'),{code:'INVALID_CREDENTIALS'});
 const done=await s.changeInitialPassword(created.temporaryAccessCode,'Newpass2@');assert.equal(done.requiresInitialSetup,false);await s.list('notifications');await s.logout();
 await assert.rejects(s.login(created.account.email,created.temporaryAccessCode,role),{code:'INVALID_CREDENTIALS'});assert.equal((await s.login(created.account.email,'Newpass2@',role)).requiresInitialSetup,false);
 if(kind==='organizations')assert.ok(await s.saveOrganization({id:done.id,name:'Edited'}));
});
test('API invitation and first login use server contracts without creating local credentials',async()=>{
 const e=env(undefined,{mode:'api',baseUrl:'/api'}),calls=[];e.ctx.fetch=async(url,init)=>{calls.push({url,body:JSON.parse(init.body)});return {ok:true,status:200,json:async()=>url.endsWith('/admin/accounts')?{account:{id:'u1',email:'new@test.com',requiresInitialSetup:true},deliveryStatus:'queued'}:{id:'u1',requiresInitialSetup:false}};};
 await e.api.createManagedAccount('users',{name:'New user',email:'new@test.com',phone:'0791234567',city:'Amman'});await e.api.changeInitialPassword('Temp1@','Newpass2@');assert.equal(calls[0].url,'/api/admin/accounts');assert.equal(calls[0].body.sendInvitation,true);assert.equal(calls[1].url,'/api/auth/initial-password');assert.equal(e.local.getItem('wusool.database.v2'),null);
});
test('first-login popup keeps mismatched values open, changes credentials before continuing, and cancels sign-in',async()=>{
 const fs=require('node:fs'),vm=require('node:vm');let root,changed=0,loggedOut=0;
 const node=()=>({listeners:{},value:'',addEventListener(k,f){this.listeners[k]=f},focus(){},reportValidity(){return true}});
 const document={documentElement:{lang:'en'},activeElement:{focus(){}},body:{appendChild(d){root=d}},createElement(){const nodes={form:node(),'#initialNewPassword':node(),'#initialConfirmPassword':node(),'[data-error]':node(),'[type="submit"]':node(),'[data-cancel]':node()};return {nodes,listeners:{},setAttribute(){},querySelector(k){return nodes[k]},addEventListener(k,f){this.listeners[k]=f},showModal(){},close(){},remove(){root=null}}}};
 const source=fs.readFileSync('assets/page-runtime.js','utf8');const context={document,WusoolServices:{logout:async()=>loggedOut++,changeInitialPassword:async(old,value)=>{assert.equal(old,'Temp1@');assert.equal(value,'Newpass2@');changed++;}}};vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' async function completeFirstLogin'),source.indexOf(' function enqueue')),context);
 const pending=context.completeFirstLogin({requiresInitialSetup:true},'Temp1@');root.nodes['#initialNewPassword'].value='Newpass2@';root.nodes['#initialConfirmPassword'].value='Mismatch1@';await root.nodes.form.listeners.submit({preventDefault(){}});assert.equal(changed,0);assert.ok(root.nodes['[data-error]'].textContent);
 root.nodes['#initialConfirmPassword'].value='Newpass2@';await root.nodes.form.listeners.submit({preventDefault(){}});assert.equal(await pending,true);assert.equal(changed,1);
 const cancelled=context.completeFirstLogin({requiresInitialSetup:true},'Temp1@');await root.listeners.cancel({preventDefault(){}});assert.equal(await cancelled,false);assert.equal(loggedOut,1);
});
test('canonical admin migration recovers blocked/deleted admin and protects account from administrative blocking or deletion',async()=>{
 const e=env(),s=e.api;await s.seedAdmin();await s.login('admin@wusool.com','WusoolAdmin2026@','Admin');const a=await s.getCurrentAccount();
 for(const status of ['blocked','suspended','disabled'])await assert.rejects(s.setUserStatus(a.id,status,'Reason'),{code:'ADMIN_PROTECTED'});
 await assert.rejects(s.deleteUser(a.id),{code:'ADMIN_PROTECTED'});await assert.rejects(s.saveUser({...a,email:'other@test.com'}),{code:'ADMIN_PROTECTED'});
 const data=JSON.parse(e.local.getItem('wusool.database.v2'));const old=data.users.find(x=>x.id===a.id);old.email='old@test.com';old.status='blocked';old.isDeleted=true;data.settings.canonicalAdminProvisioned=false;e.local.setItem('wusool.database.v2',JSON.stringify(data));await s.logout();await s.seedAdmin();
 const recovered=await s.login('admin@wusool.com','WusoolAdmin2026@','Admin');assert.equal(recovered.status,'active');assert.equal(recovered.isDeleted,false);
});
