const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
function environment(){
 let doc;
 class Node {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.parentElement=null;this.dataset={};this.attributes={};this.events={};this.value='';this.min='';this.max='';this.disabled=false;this.readOnly=false;this.hidden=false;this.style={values:{},setProperty:(k,v)=>this.style.values[k]=v};this.className='';this.classList={contains:k=>this.className.split(' ').includes(k),add:(...ks)=>this.className=[...new Set([...this.className.split(' ').filter(Boolean),...ks])].join(' '),remove:(...ks)=>this.className=this.className.split(' ').filter(k=>!ks.includes(k)).join(' '),toggle:(k,b)=>{b=b??!this.classList.contains(k);b?this.classList.add(k):this.classList.remove(k);return b;}};}
  append(...nodes){for(const n of nodes){n.remove();n.parentElement=this;this.children.push(n);}}
  after(...nodes){if(!this.parentElement)return;let i=this.parentElement.children.indexOf(this)+1;for(const n of nodes){n.remove();n.parentElement=this.parentElement;this.parentElement.children.splice(i++,0,n);}}
  replaceChildren(...nodes){for(const n of this.children)n.parentElement=null;this.children=[];this.append(...nodes);}
  remove(){if(this.parentElement){this.parentElement.children=this.parentElement.children.filter(n=>n!==this);this.parentElement=null;}}
  contains(n){return n===this||this.children.some(c=>c.contains(n));}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='id')this.id=v;}
  getAttribute(k){return this.attributes[k]??null;}
  removeAttribute(k){delete this.attributes[k];}
  setCustomValidity(value){this.validationMessage=value;}
  focus(){doc.activeElement=this;this.fire('focus');}
  getBoundingClientRect(){return {left:20,top:20,width:100,height:40,bottom:60};}
  getClientRects(){return [this.getBoundingClientRect()];}
  addEventListener(k,fn,options={}){(this.events[k]??=[]).push(fn);options.signal?.addEventListener('abort',()=>this.events[k]=this.events[k].filter(f=>f!==fn));}
  removeEventListener(k,fn){this.events[k]=(this.events[k]||[]).filter(f=>f!==fn);}
  dispatchEvent(e){e.target??=this;for(const fn of this.events[e.type]||[])fn(e);return true;}
  fire(type,props={}){this.dispatchEvent({type,target:this,preventDefault(){this.prevented=true;},...props});}
  matches(s){if(s.includes('.')&&!s.startsWith('.')){const [tag,cls]=s.split('.');return this.tagName.toLowerCase()===tag&&this.classList.contains(cls);}if(s==='[tabindex="0"]')return this.tabIndex===0;if(s.startsWith('.'))return this.classList.contains(s.slice(1));if(s.startsWith('#'))return this.id===s.slice(1);return this.tagName.toLowerCase()===s;}
  querySelectorAll(selector){return this.children.flatMap(n=>[n,...n.descendants()]).filter(n=>selector.split(',').some(s=>n.matches(s.trim())));}
  descendants(){return this.children.flatMap(n=>[n,...n.descendants()]);}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  closest(selector){return this.matches(selector)?this:this.parentElement?.closest(selector)||null;}
  get options(){return this.children;}
 }
 doc=new Node('document');doc.readyState='loading';doc.documentElement=new Node('html');doc.documentElement.lang='en';doc.documentElement.dir='ltr';doc.body=new Node('body');doc.append(doc.documentElement);doc.documentElement.append(doc.body);doc.createElement=tag=>new Node(tag);doc.getElementById=id=>doc.querySelector('#'+id);
 const window=new Node('window');const localStorage={data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)}};
 const ctx=vm.createContext({window,document:doc,localStorage,location:{pathname:'/visitor/html/register.html',href:'http://localhost/visitor/html/register.html',hash:''},URL,Date,console,AbortController,Event:class{constructor(type,opts={}){this.type=type;Object.assign(this,opts)}},CustomEvent:class{constructor(type,opts={}){this.type=type;Object.assign(this,opts)}},setTimeout,queueMicrotask,requestAnimationFrame:fn=>fn(),MutationObserver:class{observe(){}},ResizeObserver:class{observe(){}},matchMedia:()=>({matches:false,addEventListener(){}}),innerWidth:1000,innerHeight:800});
 for(const file of ['interaction-policy.js','interaction-i18n.js','interaction-theme.js','interactions.js']){vm.runInContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),ctx);for(const [k,v]of Object.entries(window))if(k.startsWith('Wusool'))ctx[k]=v;}
 return {window,document:doc,ctx,Node,api:window.WusoolInteractions,localStorage};
}
module.exports={environment,root};
