
document.addEventListener("DOMContentLoaded",()=>{
 const box=document.createElement("div");
 box.className="language-switcher-floating";
 box.innerHTML=`
 <select id="languageSelect" aria-label="Language">
 <option value="en">English</option>
 <option value="ar">العربية</option>
 </select>`;
 document.body.appendChild(box);
 const select=document.getElementById("languageSelect");
 select.value=localStorage.getItem("language")||"en";
 select.onchange=()=> {
   if(window.WusoolLanguage){
     if(select.value==="ar") WusoolLanguage.load("ar");
     else {localStorage.setItem("language","en"); location.reload();}
   }
 };
});
