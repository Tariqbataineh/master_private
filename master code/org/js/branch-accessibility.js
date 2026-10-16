
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const defaultAccessibilityFeatures = [
    {
      key: 'accessibleEntrance',
      title: 'Accessible Entrance',
      description: 'Step-free main entrance for visitors.',
      icon: 'bi-door-open',
    },
    {
      key: 'entranceRamp',
      title: 'Entrance Ramp',
      description: 'Ramp with safe slope and handrails.',
      icon: 'bi-signpost-split',
    },
    {
      key: 'accessibleParking',
      title: 'Accessible Parking',
      description: 'Reserved parking near the entrance.',
      icon: 'bi-p-square',
    },
    {
      key: 'stairs',
      title: 'Stairs',
      description: 'Stairs available on this floor.',
      icon: 'bi-ladder',
    },
    {
      key: 'elevator',
      title: 'Elevator',
      description: 'Accessible elevator for upper floors.',
      icon: 'bi-arrow-down-up',
    },
    {
      key: 'accessibleRestroom',
      title: 'Accessible Restroom',
      description: 'Restroom designed for wheelchair users.',
      icon: 'bi-person-wheelchair',
    },
    {
      key: 'widePathways',
      title: 'Wide Pathways',
      description: 'Clear internal paths with enough width.',
      icon: 'bi-arrows-expand',
    },
    {
      key: 'automaticDoors',
      title: 'Automatic Doors',
      description: 'Automatic or easy-to-open doors.',
      icon: 'bi-door-closed',
    },
    {
      key: 'tactilePaving',
      title: 'Tactile Paving',
      description: 'Tactile guidance for visually impaired visitors.',
      icon: 'bi-grid-3x3-gap',
    },
    {
      key: 'brailleSigns',
      title: 'Braille Signs',
      description: 'Important signs include Braille information.',
      icon: 'bi-badge-3d',
    },
    {
      key: 'hearingSupport',
      title: 'Hearing Support',
      description: 'Visual alerts or hearing assistance available.',
      icon: 'bi-ear',
    },
    {
      key: 'wheelchairAvailable',
      title: 'Wheelchair Available',
      description: 'A wheelchair can be requested at the branch.',
      icon: 'bi-person-wheelchair',
    },
    {
      key: 'staffAssistance',
      title: 'Staff Assistance',
      description: 'Staff members can provide accessibility support.',
      icon: 'bi-people',
    },
  ];
  const accessibilityFeatures =
    (await window.WusoolAccessibilityConfig?.getRequirements?.())?.map((item) => ({
      key: item.key || item.id,
      title: item.title,
      description: item.description,
      icon: item.icon || 'bi-universal-access',
      weight: Number(item.weight || 1),
      required: Boolean(item.required),
      category: item.category || 'General',
    })) || defaultAccessibilityFeatures;
  if (!accessibilityFeatures.some(feature => feature.key === 'stairs')) {
    accessibilityFeatures.splice(Math.max(0, accessibilityFeatures.findIndex(feature => feature.key === 'elevator')), 0, {key:'stairs',title:'Stairs',description:'Stairs available on this floor.',icon:'bi-ladder',weight:3,required:false,category:'Interior'});
  }
  let currentBranch = null;
  WusoolUI.ready(async () => {
    if (!(await protectPage())) {
      return;
    }
    currentBranch = await getCurrentBranch();
    if (!currentBranch) {
      window.location.replace('./branches.html');
      return;
    }
    restoreAccessibilityData();
    initializeForm();
    initializeNotesCounter();
    initializeSidebar();
    initializeLogout();
    await loadPageInformation();
  });
  const readStoredObject = async (key) => {
    try {
      const value = await WusoolServices.rawRead(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      console.error(error);
      return null;
    }
  };
  const protectPage = async () => {
    const organization = await readStoredObject('wusoolOrganization');
    const loggedIn = (await WusoolServices.rawRead('wusoolOrganizationLoggedIn')) === 'true';
    if (!organization || !loggedIn) {
      window.location.replace('./organization-login.html');
      return false;
    }
    const subscriptionStatus = (
      organization.subscriptionStatus ||
      (await WusoolServices.rawRead('wusoolSubscriptionStatus')) ||
      'inactive'
    ).toLowerCase();
    if (subscriptionStatus !== 'active') {
      window.location.replace('./subscription-plans.html');
      return false;
    }
    return true;
  };
  const getBranchId = () => {
    const parameters = new URLSearchParams(window.location.search);
    return parameters.get('id');
  };
  const getCurrentBranch = async () => {
    const branchId = getBranchId();
    const branches = (await readStoredObject('wusoolOrganizationBranches')) || [];
    return (
      branches.find((branch) => {
        return String(branch.id) === branchId;
      }) || (await readStoredObject('wusoolCurrentBranchDraft'))
    );
  };
  // Each floor owns its own statuses and media references; legacy flat accessibility is
  // retained as a derived, backwards-compatible branch summary.
  let floors = [];
  let selectedFloorId = null;
  const uid = () => (window.crypto?.randomUUID?.() || `floor-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const esc = value => WusoolUI.escape(String(value ?? ''));
  const getFloor = () => floors.find(f => f.id === selectedFloorId);
  const defaultFloor = () => ({id:uid(), name:'Ground Floor', level:0, accessibility:{}, media:{stairs:[],elevator:[],ramp:[]}});
  const mediaDb = () => new Promise((resolve,reject) => {
    if (!window.indexedDB) return reject(new Error('This browser does not support offline photo storage.'));
    const request = indexedDB.open('wusool-accessibility-media',1);
    request.onupgradeneeded = () => request.result.createObjectStore('photos');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const photoOperation = async (mode,id,blob) => {
    const db=await mediaDb();
    try {return await new Promise((resolve,reject)=>{
      const tx=db.transaction('photos',mode==='get'?'readonly':'readwrite');
      const r=tx.objectStore('photos')[mode](...(mode==='put'?[blob,id]:[id]));
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
    });} finally {db.close();}
  };
  const mediaUrl = new Map();
  const showPhoto = async (img,id) => {
    try {const blob=await photoOperation('get',id);if(!blob)return;
      const url=URL.createObjectURL(blob);mediaUrl.set(id,url);img.src=url;
    } catch { img.alt='Photo unavailable on this device'; }
  };
  const renderAccessibilityFeatures = () => {
    const container = document.getElementById('accessibilityFeatures');
    const floor = getFloor();
    const selector = document.getElementById('accessibilityFloorSelector');
    selector.replaceChildren(...floors.map(f=>{
      const option=document.createElement('option');option.value=f.id;
      option.textContent=`${f.name} (${f.level})`;return option;
    }));
    selector.value=selectedFloorId;
    container.replaceChildren();
    if (!floor) { updateCompletionProgress();return; }
    accessibilityFeatures.forEach(feature=>{
      const column=document.createElement('div');column.className='col-12 col-md-6';
      column.innerHTML=`<article class="accessibility-feature" data-feature="${esc(feature.key)}"><div class="feature-heading"><span class="feature-icon"><i class="bi ${esc(feature.icon)}"></i></span><div><h3>${esc(feature.title)}</h3><p>${esc(feature.description)}</p></div></div><div class="feature-options">${['available','not-available','not-sure'].map((v,i)=>`<div class="feature-option"><input type="radio" id="${esc(floor.id)}-${esc(feature.key)}-${v}" name="floor-${esc(floor.id)}-${esc(feature.key)}" value="${v}" ${floor.accessibility[feature.key]===v?'checked':''}><label for="${esc(floor.id)}-${esc(feature.key)}-${v}">${['Available','Not Available','Not Sure'][i]}</label></div>`).join('')}</div></article>`;
      column.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{
        floor.accessibility[feature.key]=input.value;
        renderMedia();updateCompletionProgress();
      }));container.append(column);
    });
    renderMedia();updateCompletionProgress();
  };
  const renderMedia = () => {
    const floor=getFloor(),host=document.getElementById('accessibilityFloorMedia');host.replaceChildren();
    if(!floor)return;
    const isArabic = document.documentElement.lang === 'ar';
    for(const [key,label] of [['stairs',isArabic?'الدرج':'Stairs'],['elevator',isArabic?'المصعد':'Elevator'],['ramp',isArabic?'المنحدر':'Ramp']]){
      const applicable= key==='stairs' ? floor.accessibility.stairs==='available' : floor.accessibility[key==='ramp'?'entranceRamp':'elevator']==='available';
      if(!applicable)continue;
      const wrap=document.createElement('section');wrap.className='border rounded-3 p-3 mb-3';
      wrap.innerHTML=`<h3 class="h6">${label} — ${esc(floor.name)}</h3><p class="small text-muted">Attach at least one photo for this floor only. Camera or gallery supported.</p><input type="file" accept="image/*" multiple aria-label="${label} photos" class="form-control mb-2"><button type="button" class="btn btn-outline-wusool btn-sm mb-2" data-camera>${isArabic ? 'فتح الكاميرا' : 'Open Camera'}</button><div class="d-flex flex-wrap gap-2" data-thumbs></div>`;
      const gallery=wrap.querySelector('input');
      const camera=document.createElement('input');camera.type='file';camera.accept='image/*';camera.setAttribute('capture','environment');camera.hidden=true;wrap.append(camera);
      wrap.querySelector('[data-camera]').onclick=()=>camera.click();
      const handle=async e=>{
        const files=Array.from(e.target.files||[]);if(!files.length)return;
        for(const file of files){
          if(!file.type.startsWith('image/')){showValidation('Only image files are allowed.');continue;}
          if(file.size>8*1024*1024){showValidation('Each photo must be 8 MB or smaller.');continue;}
          const id=uid();
          try{await photoOperation('put',id,file);floor.media[key].push({id,name:file.name||`${key}.jpg`});}
          catch(err){showValidation('Photo storage failed: '+err.message);}
        }
        e.target.value='';renderMedia();
      };gallery.addEventListener('change',handle);camera.addEventListener('change',handle);
      (floor.media[key]||[]).forEach(entry=>{
        const tile=document.createElement('div');tile.className='border rounded p-2';tile.style.width='130px';
        const img=document.createElement('img');img.alt=entry.name;img.style.cssText='width:100%;height:85px;object-fit:cover';
        showPhoto(img,entry.id);tile.append(img);
        const btn=document.createElement('button');btn.type='button';btn.className='btn btn-sm btn-outline-danger mt-1';btn.textContent='Remove';
        btn.onclick=async()=>{floor.media[key]=floor.media[key].filter(x=>x.id!==entry.id);await photoOperation('delete',entry.id).catch(()=>{});if(mediaUrl.has(entry.id)){URL.revokeObjectURL(mediaUrl.get(entry.id));mediaUrl.delete(entry.id);}renderMedia();};
        tile.append(btn);wrap.querySelector('[data-thumbs]').append(tile);
      });host.append(wrap);
    }
  };
  const showValidation = message => {const alert=document.getElementById('accessibilityValidation');alert.textContent=message;alert.classList.remove('d-none');alert.scrollIntoView({behavior:'smooth',block:'center'});};
  const restoreAccessibilityData = () => {
    const saved=currentBranch.accessibilityFloors;
    floors=Array.isArray(saved)&&saved.length?saved.map(f=>({...f,accessibility:{...f.accessibility},media:{stairs:[],elevator:[],ramp:[],...f.media}})):[defaultFloor()];
    if(!saved?.length && currentBranch.accessibility)floors[0].accessibility={...currentBranch.accessibility};
    selectedFloorId=floors[0].id;
    document.getElementById('accessibilityNotes').value=currentBranch.accessibilityNotes||'';
    renderAccessibilityFeatures();updateNotesCounter();
  };
  const updateCompletionProgress = () => {
    const floor=getFloor();const completed=accessibilityFeatures.filter(f=>floor?.accessibility?.[f.key]).length;
    document.getElementById('completedFeatures').textContent=completed;
    document.getElementById('totalFeatures').textContent=accessibilityFeatures.length;
    const percent=accessibilityFeatures.length?Math.round(100*completed/accessibilityFeatures.length):100;
    const bar=document.getElementById('accessibilityProgress');bar.style.width=`${percent}%`;bar.setAttribute('aria-valuenow',String(percent));
    document.querySelectorAll('[data-feature]').forEach(card=>card.classList.toggle('completed',Boolean(floor?.accessibility?.[card.dataset.feature])));
  };
  const validateAccessibility = () => {
    if(!floors.length){showValidation('Add at least one floor.');return false;}
    for(const floor of floors){
      if(!floor.name.trim() || !Number.isInteger(Number(floor.level))){selectedFloorId=floor.id;renderAccessibilityFeatures();showValidation('Every floor needs a name and valid integer level.');return false;}
      const missing=accessibilityFeatures.find(f=>!floor.accessibility[f.key]);
      if(missing){selectedFloorId=floor.id;renderAccessibilityFeatures();showValidation(`Complete ${missing.title} on ${floor.name}.`);return false;}
      for(const [key,feature] of [['elevator','elevator'],['ramp','entranceRamp']]){
        if(floor.accessibility[feature]==='available' && !floor.media[key]?.length){selectedFloorId=floor.id;renderAccessibilityFeatures();showValidation(`Upload a ${key} photo for ${floor.name}.`);return false;}
      }
      if(floor.accessibility.stairs==='available' && !floor.media.stairs?.length){selectedFloorId=floor.id;renderAccessibilityFeatures();showValidation(`Upload stairs photo for ${floor.name}.`);return false;}
    }
    document.getElementById('accessibilityValidation').classList.add('d-none');return true;
  };
  const initializeForm = () => {
    const select=document.getElementById('accessibilityFloorSelector');
    select.onchange=()=>{selectedFloorId=select.value;renderAccessibilityFeatures();};
    const name=document.getElementById('accessibilityFloorName'),level=document.getElementById('accessibilityFloorLevel');
    document.getElementById('addAccessibilityFloor').onclick=()=>{
      const n=name.value.trim(),l=Number(level.value);
      if(!n||level.value.trim()===''||!Number.isInteger(l)||l < -20||l > 250){showValidation('Enter a floor name and integer level (-20 to 250).');return;}
      if(floors.some(f=>f.level===l)){showValidation('A floor with this level already exists.');return;}
      const f={...defaultFloor(),name:n,level:l};floors.push(f);selectedFloorId=f.id;name.value='';level.value='';renderAccessibilityFeatures();
      document.getElementById('accessibilityValidation').classList.add('d-none');
    };
    document.getElementById('editAccessibilityFloor').onclick=()=>{
      const floor=getFloor();if(!floor)return;
      const n=prompt('Floor name',floor.name);if(n===null)return;
      const raw=prompt('Floor number (0 = ground, -1 = basement)',String(floor.level));if(raw===null)return;
      const l=Number(raw);
      if(!n.trim()||raw.trim()===''||!Number.isInteger(l)||l < -20||l > 250||floors.some(f=>f!==floor&&f.level===l)){showValidation('Invalid or duplicate floor.');return;}
      floor.name=n.trim();floor.level=l;renderAccessibilityFeatures();
    };
    document.getElementById('removeAccessibilityFloor').onclick=async()=>{
      const floor=getFloor();if(!floor||!confirm(`Delete ${floor.name} and all its accessibility photos?`))return;
      for(const group of Object.values(floor.media))for(const entry of group)await photoOperation('delete',entry.id).catch(()=>{});
      floors=floors.filter(f=>f!==floor);selectedFloorId=floors[0]?.id||null;renderAccessibilityFeatures();
    };
    WusoolUI.listen(document.getElementById('accessibilityForm'),'submit',async event=>{
      event.preventDefault();if(!validateAccessibility())return;
      try{await saveAccessibilityData(true);window.location.href=`./branch-photos.html?id=${encodeURIComponent(currentBranch.id)}`;}
      catch(error){showValidation(error.message||'Unable to save accessibility data.');}
    });
    WusoolUI.listen(document.getElementById('saveAccessibilityDraftButton'),'click',async()=>{
      try{await saveAccessibilityData(false);showToast('Accessibility information saved as a draft.');}
      catch(error){showValidation(error.message||'Unable to save draft.');}
    });
    document.getElementById('backButton').href=`./branch-working-hours.html?id=${encodeURIComponent(currentBranch.id)}`;
  };
  const saveAccessibilityData = async completed => {
    const branches=(await readStoredObject('wusoolOrganizationBranches'))||[];
    const summary={};
    for(const feature of accessibilityFeatures){
      const statuses=floors.map(f=>f.accessibility[feature.key]);
      summary[feature.key]=statuses.includes('available')?'available':statuses.includes('not-sure')?'not-sure':statuses.every(v=>v==='not-available')?'not-available':null;
    }
    const updatedBranch={...currentBranch,accessibility:summary,accessibilityFloors:structuredClone(floors),accessibilityNotes:document.getElementById('accessibilityNotes').value.trim(),completedSteps:{...currentBranch.completedSteps,details:true,workingHours:true,accessibility:completed},updatedAt:new Date().toISOString()};
    const index=branches.findIndex(b=>String(b.id)===String(currentBranch.id));
    if(index>=0)branches[index]=updatedBranch;else branches.push(updatedBranch);
    await WusoolServices.rawWrite('wusoolOrganizationBranches',JSON.stringify(branches));
    await WusoolServices.rawWrite('wusoolCurrentBranchDraft',JSON.stringify(updatedBranch));currentBranch=updatedBranch;
  };
  const initializeNotesCounter = () => {
    WusoolUI.listen(document.getElementById('accessibilityNotes'), 'input', updateNotesCounter);
  };
  const updateNotesCounter = () => {
    const notes = document.getElementById('accessibilityNotes').value;
    document.getElementById('notesCounter').textContent = `${notes.length} / 700`;
  };
  const loadPageInformation = async () => {
    const organization = await readStoredObject('wusoolOrganization');
    document.getElementById('sidebarOrganizationName').textContent =
      organization?.organizationName ||
      organization?.companyName ||
      organization?.name ||
      'Organization';
    document.getElementById('pageTitle').textContent =
      `${WusoolUI.escape(currentBranch.name)} Accessibility`;
    document.getElementById('summaryBranchName').textContent = currentBranch.name;
    document.getElementById('summaryBranchLocation').textContent =
      `${WusoolUI.escape(currentBranch.city || '')}${currentBranch.district ? `, ${WusoolUI.escape(currentBranch.district)}` : ''}`;
  };
  const initializeSidebar = () => {
    const sidebar = document.getElementById('organizationSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeSidebar = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      document.body.classList.remove('overflow-hidden');
    };
    WusoolUI.listen(document.getElementById('openSidebarButton'), 'click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('show');
      document.body.classList.add('overflow-hidden');
    });
    WusoolUI.listen(document.getElementById('closeSidebarButton'), 'click', closeSidebar);
    WusoolUI.listen(overlay, 'click', closeSidebar);
  };
  const initializeLogout = () => {
    WusoolUI.listen(document.getElementById('logoutButton'), 'click', async () => {
      await WusoolServices.rawRemove('wusoolOrganization');
      await WusoolServices.rawRemove('wusoolOrganizationLoggedIn');
      window.location.replace('./organization-login.html');
    });
  };
  const showToast = (message) => {
    document.getElementById('toastMessage').textContent = message;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('accessibilityToast')).show();
  };
});
