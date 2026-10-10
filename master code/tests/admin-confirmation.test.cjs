const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('admin confirmation resolves only after confirm, cancels on Escape and retains required reason',async()=>{
 let root,focused=0;
 function node(){return {listeners:{},addEventListener(k,f){this.listeners[k]=f},focus(){},setCustomValidity(x){this.validity=x},reportValidity(){},value:''}}
 const document={activeElement:{focus(){focused++}},getElementById(){return root},body:{appendChild(x){root=x}},createElement(){const nodes={h2:node(),p:node(),form:node(),'[data-cancel]':node(),textarea:node()};return {...node(),nodes,setAttribute(){},querySelector(x){return nodes[x]},showModal(){this.open=true},close(){this.open=false},remove(){root=null}}}};
 let startup;const window={};
 const context={window,document,WusoolUI:{enqueue(fn){startup=fn},guard:async()=>true,ready(){}},Promise,URLSearchParams};
 vm.runInNewContext(fs.readFileSync('admin/js/admin-core.js','utf8'),context);await startup();context.WusoolAdmin=window.WusoolAdmin;
 let done=false;const first=window.WusoolAdmin.confirm('Create organization?').then(x=>{done=true;return x});await Promise.resolve();assert.equal(done,false);assert.equal(root.nodes.p.textContent,'Create organization?');root.nodes.form.listeners.submit({preventDefault(){}});assert.equal(await first,true);
 const cancel=window.WusoolAdmin.confirm('Delete?');root.listeners.cancel({preventDefault(){}});assert.equal(await cancel,false);
 const reason=window.WusoolAdmin.statusReason('suspended');root.nodes.textarea.value='  ';root.nodes.form.listeners.submit({preventDefault(){}});assert.ok(root);root.nodes.textarea.value='Policy violation';root.nodes.form.listeners.submit({preventDefault(){}});assert.equal(await reason,'Policy violation');assert.equal(focused,3);
});
