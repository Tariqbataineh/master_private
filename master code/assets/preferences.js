'use strict';
/* One shared, in-place language/theme control. No document reload or DOM clone. */
(() => {
  if (window.WusoolPreferences) return;
  const root = document.documentElement, originals = new WeakMap();
  const script = document.currentScript;
  let language = root.lang === 'ar' ? 'ar' : 'en', dictionary = {}, translating = false;
  const common = {Home:'الرئيسية', 'Accessibility Map':'خريطة إمكانية الوصول', 'How It Works':'كيف يعمل وصول', Organizations:'المؤسسات', 'About Us':'من نحن', 'Log In':'تسجيل الدخول', 'Get Started':'ابدأ الآن', Dashboard:'لوحة التحكم', 'Explore Places':'استكشف الأماكن', 'My Tickets':'تذاكري', 'Saved Places':'الأماكن المحفوظة', 'My Reviews':'تقييماتي', 'Visit Reviews':'تقييمات الزيارات', 'User Tickets':'تذاكر الزوار', Branches:'الفروع', 'Branch Photos':'صور الفروع', 'AI Reports':'تقارير الذكاء الاصطناعي', Notifications:'الإشعارات', 'Review History':'سجل المراجعة', 'Audit Log':'سجل النشاط', Subscription:'الاشتراك', Settings:'الإعدادات', 'Help & Support':'المساعدة والدعم', 'Log Out':'تسجيل الخروج', Logout:'تسجيل الخروج', Users:'المستخدمون', Tickets:'التذاكر', Reviews:'التقييمات', Subscriptions:'الاشتراكات', 'Accessibility Tools':'أدوات إمكانية الوصول', 'High Contrast':'تباين عالٍ', 'Read Page':'قراءة الصفحة', 'Voice Search':'البحث الصوتي', 'Change language':'تغيير اللغة', 'Open navigation menu':'فتح قائمة التنقل', 'Close navigation menu':'إغلاق قائمة التنقل'};
  // Local UI catalogue only: no remote provider, no DOM cloning or form values.
  const attributes = ['placeholder', 'title', 'aria-label', 'alt'];
  const attributeOriginals = new WeakMap();
  let normalized = new Map(), reverse = new Map();
  const normalize = value => String(value).replace(/\s+/g, ' ').trim().toLocaleLowerCase('en');
  function unifyPortalHeading() {
    if(!/\/(user|org|admin)\/html\//.test(location.pathname))return;
    const main=document.querySelector('main');if(!main)return;
    const selector='.wu-primary-heading,.page-heading,.page-header,.page-hero,.dashboard-header,.content-header,.map-page-header,.recruit-v2-hero,.dashboard-hero,.welcome-section';
    let heading=[...main.querySelectorAll(selector)].find(el=>!el.closest('.modal,dialog')&&el.querySelector('h1,h2,.page-title,.dashboard-title'));
    if(!heading){
      const title=[...main.querySelectorAll('h1,.page-title,.dashboard-title,#bookingTicketsPanel > h2')].find(el=>!el.closest('.modal,dialog,.organization-header,.organization-topbar,.user-topbar'));
      if(title){
        const section=title.closest('section,header');
        if(section&&!section.querySelector('form,table,[data-booking-host],.content-card,.booking-table-card'))heading=section;
        else{
          heading=document.createElement('section');heading.className='wu-primary-heading';
          title.before(heading);
          const label=heading.previousElementSibling;if(label?.matches('p,.section-label,.page-label'))heading.append(label);
          const description=title.nextElementSibling;heading.append(title);if(description?.matches('p'))heading.append(description);
        }
      }
    }
    if(!heading)return;
    heading.classList.add('wu-primary-heading');
    const title=heading.querySelector('h1,h2,.page-title,.dashboard-title');
    /* وصف صفحة التذاكر حسب البوابة */
if (/\/(?:my-tickets|my-visits|visitor-tickets|admin-tickets)\.html$/.test(location.pathname)) {
  const isOrganization = location.pathname.includes('/org/');
  const isAdmin = location.pathname.includes('/admin/');

  const descriptionAr = isOrganization
    ? 'راجع حجوزات الزوار ومواعيدهم، وتابع حالات الزيارات من مكان واحد.'
    : isAdmin
      ? 'راجع الحجوزات والمواعيد وحالات الزيارات عبر مؤسسات النظام.'
      : 'تابع تذاكرك ومواعيد زياراتك، واعرض تفاصيل الحجز وخيارات التتبع المتاحة.';

  const descriptionEn = isOrganization
    ? 'Review visitor bookings and appointments, and follow visit statuses in one place.'
    : isAdmin
      ? 'Review bookings, appointments, and visit statuses across system organizations.'
      : 'Follow your tickets and appointments, and view booking details and available tracking options.';

  let description = title.nextElementSibling;

  if (!description?.matches('p')) {
    description = document.createElement('p');
    title.after(description);
  }

  description.classList.add('wu-ticket-description');
  description.dataset.wusoolAr = descriptionAr;
  description.dataset.wusoolEn = descriptionEn;

  const descriptionText = document.documentElement.lang === 'ar' ? descriptionAr : descriptionEn;
  if (description.textContent !== descriptionText) description.textContent = descriptionText;
}
    if(title.tagName!=='H1'){
      if(title.getAttribute('role')!=='heading')title.setAttribute('role','heading');
      if(title.getAttribute('aria-level')!=='1')title.setAttribute('aria-level','1');
    }
    heading.classList.add('wu-title-only');
    for(const text of heading.querySelectorAll('p,nav,.section-label,.page-label,.header-label,.header-eyebrow,.eyebrow,.recommendations-label,.recruit-v2-hero-kicker,.recruitment-kicker,.dashboard-date')){
      if(!text.contains(title)&&!text.querySelector('button,input,select,a.btn')&&!text.closest('.wu-heading-actions'))text.classList.add('wu-heading-secondary');
    }
    const breadcrumb=heading.previousElementSibling;if(breadcrumb?.matches('nav[aria-label],.breadcrumb'))breadcrumb.classList.add('wu-heading-secondary');
    const bars=[...document.querySelectorAll('.organization-header,.organization-topbar,.user-topbar,.content-header,.page-header')].filter(el=>el!==heading&&!el.contains(heading)&&!heading.contains(el)&&!el.closest('.modal,dialog,aside')&&(el.compareDocumentPosition(heading)&Node.DOCUMENT_POSITION_FOLLOWING));
    for(const bar of bars){
      if(bar.dataset.wuHeadingMerged)continue;
      if(!bar.querySelector('h1,h2,.page-title,.dashboard-title'))continue;
      let actions=heading.querySelector(':scope > .wu-heading-actions');
      if(!actions){actions=document.createElement('div');actions.className='wu-heading-actions';heading.append(actions);}
      // Move live controls, retaining listeners, IDs, current state and permissions.
      const controls=[...bar.querySelectorAll('button,a.btn,input,select,.wu-layout-panel,.organization-account')].filter(el=>!el.closest('.wusool-preferences')&&!el.parentElement.closest('button,a.btn,.wu-layout-panel,.organization-account'));
      for(const control of controls){
        const container=control.closest('.input-group,.search-box');
        actions.append(container&&bar.contains(container)?container:control);
      }
      bar.dataset.wuHeadingMerged='true';bar.hidden=true;
      if(bar.parentElement===main&&heading.parentElement!==main){
        const host=heading.parentElement;
        if(host.classList.contains('container-fluid')){main.insertBefore(heading,bar);heading.classList.add('wu-heading-promoted');}
      }
    }
  }
  const excluded = 'script,style,textarea,code,pre,[translate="no"],[data-no-translate],[data-user-content],[contenteditable]:not([contenteditable="false"]),.wusool-preferences';
  const excludedAttributes = excluded.replace('textarea,', '');
  function catalogue() {
    normalized = new Map(); reverse = new Map();
    for (const [en, ar] of Object.entries(dictionary)) {
      if (en === ar) continue;
      normalized.set(normalize(en), {en, ar});
      if (!reverse.has(normalize(ar))) reverse.set(normalize(ar), {en, ar});
    }
  }
  function localCopy(source) {
    const key = normalize(source), pair = normalized.get(key) || reverse.get(key);
    if (pair) return source.replace(source.trim(), language === 'ar' ? pair.ar : normalized.has(key) ? source.trim() : pair.en);
    // Messages first rendered by an Arabic page also switch back in place.
    if (language === 'en') {
      const clock = source.trim().match(/^توقيت الأردن الآن:\s*(.+)$/);
      if (clock) return 'Jordan time now: ' + clock[1];
      const bookings = source.trim().match(/^الحجوزات المعروضة:\s*([\d\s/]+)$/);
      if (bookings) return 'Showing bookings: ' + bookings[1];
    }
    // Known interface counters retain their current numbers and live clock.
    const patterns = [
      [/^(Showing bookings:\s*)([\d\s/]+)$/i, 'الحجوزات المعروضة: '],
      [/^(Jordan time now:\s*)(.+)$/i, 'توقيت الأردن الآن: '],
      [/^(Showing\s+)(\d+)\s+(branches|notifications|reports|reviews|tickets|visits)$/i, null],
    ];
    if (language === 'ar') {
      for (const [pattern, label] of patterns) {
        const m = source.trim().match(pattern);
        if (!m) continue;
        if (label) return label + localCopy(m[2]);
        const nouns = {branches:'فروع',notifications:'إشعارات',reports:'بلاغات',reviews:'تقييمات',tickets:'تذاكر',visits:'زيارات'};
        return 'عرض ' + m[2] + ' ' + nouns[m[3].toLowerCase()];
      }
    }
    if (language === 'ar') {
      const branchMeta=source.trim().match(/^Branch · (\d{4}-\d{2}-\d{2} \d{2}:\d{2})$/);
      if(branchMeta)return 'الفرع · '+branchMeta[1];
      const visitMeta=source.trim().match(/^(\d{4}-\d{2}-\d{2} · \d{2}:\d{2} · )(pending|confirmed|completed|cancelled)$/i);
      if(visitMeta)return visitMeta[1]+{pending:'معلق',confirmed:'مؤكد',completed:'مكتمل',cancelled:'ملغى'}[visitMeta[2].toLowerCase()];
      const count=source.trim().match(/^(\d+)\s+(places?|results?|photos?|branches?|reviews?|organizations?|pending)$/i);
      if(count){const words={place:'مكان',places:'أماكن',result:'نتيجة',results:'نتائج',photo:'صورة',photos:'صور',branch:'فرع',branches:'فروع',review:'تقييم',reviews:'تقييمات',organization:'مؤسسة',organizations:'مؤسسات',pending:'معلق'};return count[1]+' '+words[count[2].toLowerCase()];}
      const shown=source.trim().match(/^Showing (\d+) (branch|review|ticket|visit|notification|report)s?$/i);
      if(shown){const words={branch:'فروع',review:'تقييمات',ticket:'تذاكر',visit:'زيارات',notification:'إشعارات',report:'بلاغات'};return 'عرض '+shown[1]+' '+words[shown[2].toLowerCase()];}
      const ago=source.trim().match(/^(\d+) (minute|hour|day)s? ago$/i);
      if(ago)return 'قبل '+ago[1]+' '+{minute:'دقائق',hour:'ساعات',day:'أيام'}[ago[2].toLowerCase()];
      const usage=source.trim().match(/^(?:Branch usage: )?(\d+) of (\d+) branches?$/i);
      if(usage)return usage[1]+' من '+usage[2]+' فروع';
      const reviewCount=source.trim().match(/^(\d+) of (\d+) reviews · Automatic updates$/i);
      if(reviewCount)return reviewCount[1]+' من '+reviewCount[2]+' تقييمات · تحديث تلقائي';
      const percentage=source.trim().match(/^(\d+(?:\.\d+)?)% (Match|accessibility score|· unverified)$/i);
      if(percentage)return {match:'توافق', 'accessibility score':'درجة إمكانية الوصول', '· unverified':'غير موثّق'}[percentage[2].toLowerCase()]+' '+percentage[1]+'%';
      const prefix=source.trim().match(/^(Local administrator: |Accessibility review result: |Request audited access: |Remove |Save |Plan a visit to )(.*)$/);
      if(prefix)return {'Local administrator: ':'حساب الإدارة المحلي: ','Accessibility review result: ':'نتيجة مراجعة إمكانية الوصول: ','Request audited access: ':'طلب وصول موثّق: ','Remove ':'إزالة ','Save ':'حفظ ','Plan a visit to ':'خطط لزيارة '}[prefix[1]]+prefix[2];
      const suffix=source.trim().match(/^(.*)( Working Hours| Accessibility| — Branch| — Organization · default hours)$/);
      if(suffix)return suffix[1]+{' Working Hours':' — ساعات العمل',' Accessibility':' — إمكانية الوصول',' — Branch':' — الفرع',' — Organization · default hours':' — المؤسسة · الساعات الافتراضية'}[suffix[2]];
      const preview=source.trim().match(/^(\d+) photo preview\(s\) selected$/);
      if(preview)return 'تم اختيار '+preview[1]+' معاينات صور';
      // Calendar/clock display text only; date/time input values are never touched.
      if (/\d{4}/.test(source) && /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(source)) {
        const months={January:'يناير',February:'فبراير',March:'مارس',April:'أبريل',May:'مايو',June:'يونيو',July:'يوليو',August:'أغسطس',September:'سبتمبر',October:'أكتوبر',November:'نوفمبر',December:'ديسمبر',Jan:'يناير',Feb:'فبراير',Mar:'مارس',Apr:'أبريل',Jun:'يونيو',Jul:'يوليو',Aug:'أغسطس',Sep:'سبتمبر',Sept:'سبتمبر',Oct:'أكتوبر',Nov:'نوفمبر',Dec:'ديسمبر',Sunday:'الأحد',Monday:'الاثنين',Tuesday:'الثلاثاء',Wednesday:'الأربعاء',Thursday:'الخميس',Friday:'الجمعة',Saturday:'السبت',AM:'ص',PM:'م',at:'الساعة'};
        return source.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|AM|PM|at)\b/g,m=>months[m]);
      }
    }
    return source;
  }
  function textNode(node) {
    if (!node.parentElement || node.parentElement.closest(excluded + ',[data-wusool-en]')) return;
    const current = node.nodeValue;
    const old = originals.get(node);
    // A service may update a retained text node (clock, count, status, error).
    const source = old && current === old.rendered ? old.source : current;
    const rendered = localCopy(source);
    originals.set(node, {source, rendered});
    if (current !== rendered) node.nodeValue = rendered;
  }
  function translate(scope = document.body) {
    if (!scope || translating) return;
    translating = true;
    try {
      if (scope.nodeType === Node.TEXT_NODE) {textNode(scope); return;}
      if (!scope.querySelectorAll) return;
      const elements = [scope, ...scope.querySelectorAll('*')];
      for (const element of elements) {
        if (!(element instanceof Element)) continue;
        if (element.matches('option:not([value])')) element.setAttribute('value', element.value);
        if (element.matches('[data-wusool-en][data-wusool-ar]')) {
          const value = element.dataset[language === 'ar' ? 'wusoolAr' : 'wusoolEn'];
          if (element.textContent !== value) element.textContent = value;
        }
        if (element.closest(excludedAttributes)) continue;
        let saved = attributeOriginals.get(element);
        if (!saved) {saved = new Map(); attributeOriginals.set(element, saved);}
        for (const name of attributes) {
          if (!element.hasAttribute(name)) {saved.delete(name); continue;}
          const current = element.getAttribute(name), old = saved.get(name);
          const source = old && current === old.rendered ? old.source : current;
          const rendered = localCopy(source);
          saved.set(name, {source, rendered});
          if (current !== rendered) element.setAttribute(name, rendered);
        }
      }
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNode(walker.currentNode);
      for (const element of elements) if (element.matches?.('[data-wusool-label-en]')) {
        const value=language==='ar'?element.dataset.wusoolLabelAr:element.dataset.wusoolLabelEn;
        if (value && element.getAttribute('aria-label') !== value) element.setAttribute('aria-label',value);
        if (value && element.tagName==='IMG' && element.getAttribute('alt') !== value) element.setAttribute('alt',value);
      }
    } finally {translating = false;}
  }
  const panel=document.createElement('div'); panel.className='wusool-preferences'; panel.setAttribute('translate','no');
  const languageButton=document.createElement('button');languageButton.id='wusoolLanguageButton';languageButton.type='button';
  const themeLabel=document.createElement('label'), theme=document.createElement('select'); theme.id='wusoolThemePreference'; themeLabel.htmlFor=theme.id;
  for(const value of ['light','dark','system']) {const option=document.createElement('option');option.value=value;theme.append(option);}
  panel.append(languageButton,themeLabel,theme);
  const copy = (el, value) => { if(el.textContent!==value) el.textContent=value; };
  function sync() {
    copy(languageButton,language==='ar'?'English':'العربية');
    languageButton.setAttribute('aria-label',language==='ar'?'Switch language to English':'تغيير اللغة إلى العربية');languageButton.setAttribute('aria-pressed',String(language==='ar'));
    copy(themeLabel,language==='ar'?'المظهر':'Theme');
    theme.setAttribute('aria-label',language==='ar'?'اختيار المظهر':'Choose color theme');
    copy(theme.options[0],language==='ar'?'فاتح':'Light');copy(theme.options[1],language==='ar'?'داكن':'Dark');copy(theme.options[2],language==='ar'?'النظام':'System');theme.value=window.WusoolTheme?.preference||'system';
  }
  function mount() {
    const sidebar=document.querySelector('#userSidebar,#organizationSidebar,#adminSidebar');
    let host=sidebar?.querySelector('.user-sidebar-footer,.sidebar-footer,.sidebar-account')||sidebar||document.querySelector('.app-shell .header-tools,.wsp-global-links');
    if(!host) {
      const privatePage=/\/user\/html\//.test(location.pathname)||(/\/(org|admin)\/html\//.test(location.pathname)&&document.querySelector('#organizationSidebarContainer,#adminSidebarContainer'));
      if(privatePage)return;
      host=document.querySelector('.main-navbar .container,.navbar .container,.navbar');
      if(!host) {let nav=document.getElementById('wusoolPublicPreferencesBar');if(!nav){nav=document.createElement('nav');nav.id='wusoolPublicPreferencesBar';nav.className='wusool-public-preferences-bar';nav.setAttribute('aria-label','Wusool');const brand=document.createElement('a');brand.textContent='Wusool';brand.href=new URL('../visitor/html/home.html',script.src).href;nav.append(brand);document.body.prepend(nav);}host=nav;}
    }
    if(panel.parentElement!==host) host.prepend(panel);
    if(sidebar) document.getElementById('wusoolPublicPreferencesBar')?.remove();
    panel.dataset.location=sidebar?'sidebar':'navbar';
    document.querySelectorAll('#wusoolLanguageButton').forEach(e=>{if(e!==languageButton)e.remove();});
    document.querySelectorAll('.wxi-theme-controls,.language-switcher-floating').forEach(e=>e.remove());
    sync();
  }
  async function setLanguage(value, persist=true) {
    if(!['en','ar'].includes(value)) return;
    const focused=document.activeElement, x=scrollX, y=scrollY, j=document.querySelector('.wusool-journey');
    const progress=j?Math.max(0,Math.min(1,(y-j.offsetTop)/Math.max(1,j.offsetHeight-innerHeight))):null;
    const anchor=j?[...j.querySelectorAll('.journey-intro,.organization-stop,.journey-road-chapter,.academy-stop')].find(el=>{const top=el.getBoundingClientRect().top+y;return y>=top&&y<top+el.offsetHeight;}):null;
    const anchorProgress=anchor?(-anchor.getBoundingClientRect().top)/Math.max(1,anchor.offsetHeight):null;
    language=value; root.lang=value;root.dir=value==='ar'?'rtl':'ltr';translate(document.documentElement);sync();
    if(persist) {if(window.WusoolServices) await WusoolServices.rawWrite('wusool-language',value); else {try{localStorage.setItem('wusool-language',value);}catch{}}}
    document.dispatchEvent(new Event('wxi:language'));document.dispatchEvent(new CustomEvent('wusool:preferences',{detail:{language:value}}));
    if(persist) requestAnimationFrame(()=>{focused?.isConnected&&focused.focus?.({preventScroll:true});const target=anchor?.isConnected?anchor.getBoundingClientRect().top+scrollY+anchorProgress*anchor.offsetHeight:progress!==null&&y>=j.offsetTop&&y<=j.offsetTop+j.offsetHeight ? j.offsetTop+progress*(j.offsetHeight-innerHeight):y; window.scrollTo({left:x,top:target,behavior:'instant'});});
  }
  languageButton.addEventListener('click',()=>setLanguage(language==='ar'?'en':'ar').catch(()=>{}));
  theme.addEventListener('change',()=>window.WusoolTheme?.set(theme.value,theme).then(sync));
  window.addEventListener('storage',e=>{if(e.key==='wusool-language')setLanguage(e.newValue,false);});
  const pending = new Set(); let frame = 0;
  const observer=new MutationObserver(records=>{
    for(const r of records) {
      if(r.type==='childList') for(const node of r.addedNodes) {if(!panel.contains(node))pending.add(node);}
      else if(!panel.contains(r.target)) pending.add(r.target);
    }
    if(pending.size && !frame) frame=requestAnimationFrame(()=>{
      frame=0; unifyPortalHeading(); mount(); const work=[...pending];pending.clear();
      for(const node of work) if(node.isConnected && !panel.contains(node)) translate(node);
    });
  });
  window.WusoolPreferences={get language(){return language;},setLanguage,refresh:()=>{mount();translate();},translate};
  async function init() {
    unifyPortalHeading();
    dictionary={...common};
    try{const response=await fetch(new URL('./translations/ar.json',script.src));const data=await response.json();dictionary={...Object.fromEntries(Object.entries(data).filter(([k,v])=>k!==v)),...common};}catch{}
    catalogue();
    const saved=window.WusoolServices?await WusoolServices.rawRead('wusool-language'):language;
    mount();await setLanguage(saved==='ar'?'ar':'en',false);
    observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:attributes});
    window.WusoolPreferences.ready=true;
    new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-wusool-color-mode']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init().catch(()=>{}),{once:true});else init().catch(()=>{});
})();
