const {test}=require('node:test');const assert=require('node:assert/strict');const {env}=require('./test-helpers.cjs');const {mount}=require('./controller-helpers.cjs');
for(const prefix of ['organization','user'])test(`${prefix} creation refreshes admin table before invitation closes and reports failed save in form`,async()=>{
 const e=env(),s=e.api;await s.seedAdmin();await s.login('admin@wusool.com','WusoolAdmin2026@','Admin');let errorText='',invitationShown=false,release;
 const invitation=new Promise(r=>release=r);e.ctx.WusoolAdmin={validateAccountForm:async()=>true,confirm:async()=>true,statusReason:async()=>'',toast(){},formError(_f,text){errorText=text},showInvitation:async()=>{invitationShown=true;await invitation;}};
 const page=await mount(e,'admin/js/admin-'+(prefix==='user'?'users':'organizations')+'.js');
 const fields={Id:'',Name:'Fresh Account',Email:'fresh@test.com',Phone:'0791234567',City:'Amman',Status:'active',Type:'Bank',Address:'Amman office',Website:'https://example.com',Notes:'',Role:'User',Preferences:''};
 for(const [key,val]of Object.entries(fields))if(page.nodes.has(prefix+key))page.nodes.get(prefix+key).value=val;
 page.nodes.get(prefix==='user'?'userSearch':'organizationSearch').value='hidden';page.nodes.get(prefix+'StatusFilter').value='suspended';
 const submit=page.nodes.get(prefix+'Form').fire('submit');
 for(let i=0;i<150&&!invitationShown;i++)await new Promise(r=>setTimeout(r,5));
 assert.equal(invitationShown,true);assert.match(page.nodes.get(prefix==='user'?'usersTableBody':'organizationsTableBody').innerHTML,/Fresh Account/);assert.equal(page.nodes.get(prefix+'StatusFilter').value,'');release();await submit;
 await page.nodes.get(prefix+'Form').fire('submit');assert.match(errorText,/already exists/);assert.equal((await s[prefix==='user'?'getUsers':'getOrganizations']()).filter(x=>x.email==='fresh@test.com').length,1);
});
test('managed account validation rejects empty name, invalid phone, website and missing address before creating anything',async()=>{
 const {api:s}=env();await s.seedAdmin();await s.login('admin@wusool.com','WusoolAdmin2026@','Admin');
 const errors=s.validateAccountInput('organizations',{name:' ',email:'bad',phone:'123',city:'A',address:'',website:'javascript:alert(1)',type:''});for(const k of ['name','email','phone','city','address','website','type'])assert.ok(errors[k]);
 await assert.rejects(s.createManagedAccount('organizations',{name:'Bad',email:'bad@test.com'}),{code:'VALIDATION_ERROR'});assert.equal((await s.getOrganizations()).length,0);
 assert.deepEqual(Object.keys(s.validateAccountInput('organizations',{name:'مؤسسة وصول',email:'good@test.com',phone:'+962791234567',city:'عمان',address:'شارع مكة',website:'https://example.com',type:'Bank'})),[]);
});
