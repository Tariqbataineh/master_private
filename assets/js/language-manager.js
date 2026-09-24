
window.WusoolLanguage={
 current:localStorage.getItem("language")||"en",
 data:{},
 async init(){
   this.createSwitcher();
   if(this.current==="ar") await this.load("ar");
   else this.direction("en");
 },
 async load(lang){
   const r=await fetch("/assets/translations/ar.json");
   this.data=await r.json();
   localStorage.setItem("language",lang);
   this.current=lang;
   this.translate();
   this.direction(lang);
 },
 translate(){
   document.querySelectorAll("[data-i18n]").forEach(e=>{
     if(this.data[e.dataset.i18n]) e.textContent=this.data[e.dataset.i18n];
   });
   const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
   let n=[]; while(w.nextNode()) n.push(w.currentNode);
   n.forEach(x=>{
     let v=x.nodeValue.trim();
     if(this.data[v]) x.nodeValue=x.nodeValue.replace(v,this.data[v]);
   });
 },
 direction(lang){document.documentElement.dir=lang==="ar"?"rtl":"ltr";},
 createSwitcher(){
   const d=document.createElement("div");
   d.className="language-switcher-floating";
   d.innerHTML='<select id="wusool-language"><option value="en">English</option><option value="ar">العربية</option></select>';
   document.body.appendChild(d);
   d.querySelector("select").value=this.current;
   d.querySelector("select").onchange=e=>{
     if(e.target.value==="ar") this.load("ar"); else {localStorage.setItem("language","en");location.reload();}
   };
 }
};
document.addEventListener("DOMContentLoaded",()=>WusoolLanguage.init());
