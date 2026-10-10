const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');const {JSDOM}=require('jsdom');
function setup(url='http://localhost/admin/html/admin-branches.html'){
 const dom=new JSDOM('<input id="branchSearch" type="search"><input id="branchName"><div id="result"></div>',{url,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 let timeouts=new Map(),serial=0,polls=[];w.setTimeout=fn=>{timeouts.set(++serial,fn);return serial;};w.clearTimeout=id=>timeouts.delete(id);w.setInterval=fn=>{polls.push(fn);return polls.length;};w.clearInterval=()=>{};w.scrollTo=()=>{};w.WusoolServices={localRevision:()=>{try{const data=JSON.parse(w.localStorage.getItem('wusool.database.v2')||'{}');return JSON.stringify(Object.fromEntries(Object.entries(data).filter(([key])=>!['drafts','settings','credentials'].includes(key))));}catch{return null;}},mode:'local'};w.WusoolUI={ready:fn=>fn(),error:e=>{throw e;}};
 w.localStorage.setItem('wusool.database.v2',JSON.stringify({branches:[],drafts:{}}));w.eval(fs.readFileSync(__dirname+'/../assets/live-sync.js','utf8'));
 return {w,dom,flush:async()=>{const q=[...timeouts.values()];timeouts.clear();q.forEach(fn=>fn());await new Promise(resolve=>setImmediate(resolve));},poll:async()=>{for(const fn of polls)await fn();},write:data=>w.localStorage.setItem('wusool.database.v2',JSON.stringify(data))};
}
test('local and remote changes refresh registered tables and counters; search value stays intact',async()=>{
 const e=setup();let count=0;e.w.WusoolLive.watch('branches',()=>{count++;e.w.document.getElementById('result').textContent=JSON.parse(e.w.localStorage.getItem('wusool.database.v2')).branches.length;});
 e.w.document.getElementById('branchSearch').value='Irbid';e.write({branches:[{id:'new',status:'draft'}],drafts:{}});e.w.dispatchEvent(new e.w.Event('wusool:data-changed'));await e.flush();assert.equal(count,1);assert.equal(e.w.document.getElementById('result').textContent,'1');
 e.write({branches:[{id:'new',status:'approved'}],drafts:{}});e.w.dispatchEvent(new e.w.StorageEvent('storage',{key:'wusool.database.v2'}));await e.flush();assert.equal(count,2);assert.equal(e.w.document.getElementById('branchSearch').value,'Irbid');e.dom.window.close();
});
test('draft preference writes do not cause refresh loops; polling detects missed database events',async()=>{
 const e=setup();let count=0;e.w.WusoolLive.watch('dashboard',()=>count++);e.write({branches:[],drafts:{x:'typing'},settings:{theme:'dark'}});e.w.dispatchEvent(new e.w.Event('wusool:data-changed'));await e.flush();assert.equal(count,0);
 e.write({branches:[{id:'new'}],drafts:{}});await e.poll();await e.flush();assert.equal(count,1);e.dom.window.close();
});
test('overlapping refreshes are serialized and run again after the latest change',async()=>{
 const e=setup();let count=0,release;e.w.WusoolLive.watch('table',async()=>{count++;if(count===1)await new Promise(resolve=>release=resolve);});
 e.w.WusoolLive.refresh();await e.flush();e.w.WusoolLive.refresh();await e.flush();assert.equal(count,1);release();await new Promise(resolve=>setImmediate(resolve));assert.equal(count,2);e.dom.window.close();
});
test('unregistered edit screens preserve unsaved input and never auto reload on focus alone',async()=>{
 const e=setup();e.w.dispatchEvent(new e.w.Event('focus'));await e.flush();assert.equal(e.w.sessionStorage.length,0);
 const input=e.w.document.getElementById('branchName');input.value='Unsaved';input.dispatchEvent(new e.w.Event('input',{bubbles:true}));e.write({branches:[{id:'remote'}]});e.w.dispatchEvent(new e.w.StorageEvent('storage',{key:'wusool.database.v2'}));await e.flush();assert.equal(input.value,'Unsaved');assert.equal(e.w.sessionStorage.length,0);e.dom.window.close();
});

test('authentication screens never reload or poll while registering or signing in',async()=>{
 for(const page of ['visitor/html/login.html','visitor/html/register.html','org/html/organization-login.html','org/html/organization-register.html','admin/html/admin-login.html']){
  const e=setup('http://localhost/'+page);let calls=0;e.w.WusoolLive.watch('auth',()=>calls++);e.write({users:[{id:'new'}]});e.w.dispatchEvent(new e.w.Event('wusool:data-changed'));e.w.dispatchEvent(new e.w.Event('focus'));await e.poll();await e.flush();assert.equal(calls,0);assert.equal(e.w.sessionStorage.length,0);e.dom.window.close();
 }
});
