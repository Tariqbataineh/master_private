const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
function setup(){
 const dom=new JSDOM('<html lang="en"><body><form><input id="lat"><input id="lng"><section id="host"></section></form></body></html>',{runScripts:'outside-only',url:'http://localhost'}),w=dom.window;
 for(const name of ['api-config.js','location-service.js'])w.eval(fs.readFileSync(__dirname+'/../assets/'+name,'utf8'));
 let success,error;Object.defineProperty(w.navigator,'geolocation',{value:{getCurrentPosition:(ok,fail)=>{success=ok;error=fail;}}});
 w.WusoolMapsLoader={onFailure:()=>()=>{},library:()=>{throw Error('No paid SDK in simple mode');}};
 w.eval(fs.readFileSync(__dirname+'/../assets/location-ui.js','utf8'));
 const lat=w.document.getElementById('lat'),lng=w.document.getElementById('lng');let confirmed;
 const state=w.WusoolLocationUI.mount(w.document.getElementById('host'),{latitude:lat,longitude:lng,editable:true,onConfirm:p=>confirmed=p});
 return {dom,w,lat,lng,state,confirmation:()=>confirmed,gps:p=>success({coords:p}),denied:()=>error({code:1})};
}
test('simple picker contains only current-location and confirmation actions; both coordinates are mandatory',()=>{
 const e=setup();try{
  assert.deepEqual([...e.w.document.querySelectorAll('button')].map(b=>b.textContent),['Use my current location','Location confirmed']);
  assert.equal(e.w.document.querySelector('select'),null);assert.equal(e.w.document.querySelector('input[type=text]'),null);
  assert.equal(e.lat.required,true);assert.equal(e.lng.required,true);assert.equal(e.state.canSave(),false);assert.equal(e.state.confirm(),false);
  e.lat.value='32.55';e.lat.dispatchEvent(new e.w.Event('input'));e.lng.value='35.85';e.lng.dispatchEvent(new e.w.Event('input'));
  assert.equal(e.state.canSave(),false);assert.equal(e.state.confirm(),true);assert.equal(e.state.canSave(),true);assert.match(e.w.document.querySelector('[role=status]').textContent,/Location confirmed/);
  e.lng.value='35.86';e.lng.dispatchEvent(new e.w.Event('input'));assert.equal(e.state.canSave(),false);assert.equal(e.state.confirm(),true);
 }finally{e.dom.window.close();}
});
test('current location fills visible fields immediately, then explicit confirmation saves the exact point',()=>{
 const e=setup();try{
  e.w.document.querySelector('button').click();e.gps({latitude:31.9539,longitude:35.9106,accuracy:12});
  assert.equal(e.lat.value,'31.9539');assert.equal(e.lng.value,'35.9106');assert.equal(e.confirmation(),undefined);assert.equal(e.state.canSave(),false);
  assert.equal(e.state.confirm(),true);assert.equal(e.confirmation().latitude,31.9539);assert.equal(e.confirmation().longitude,35.9106);
  assert.equal(new URL(e.w.document.querySelector('iframe').src).searchParams.get('q'),'31.9539,35.9106');
 }finally{e.dom.window.close();}
});
test('missing, invalid or out-of-range coordinates block form submission and cannot be confirmed',()=>{
 const e=setup();try{
  const form=e.w.document.querySelector('form');for(const [lat,lng]of [['',''],['32.55',''],['90','35.85']]){
   e.lat.value=lat;e.lng.value=lng;e.lat.dispatchEvent(new e.w.Event('input'));const event=new e.w.Event('submit',{cancelable:true});form.dispatchEvent(event);
   assert.equal(event.defaultPrevented,true);assert.equal(e.state.confirm(),false);assert.equal(e.state.canSave(),false);
  }
 }finally{e.dom.window.close();}
});
