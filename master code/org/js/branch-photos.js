'use strict';
WusoolUI.enqueue(async()=>{
 if(!await WusoolUI.guard())return;
 const t=(a,e)=>window.WusoolMediaI18n.text(a,e),esc=WusoolUI.escape;
 const id=new URLSearchParams(location.search).get('id')||JSON.parse(await WusoolServices.rawRead('wusoolCurrentBranchDraft')||'null')?.id;
 if(!id){WusoolUI.message(t('اختر فرعًا أولًا.','Choose a branch first.'));return;}
 const branch=await WusoolServices.getBranchById(id);if(!branch||branch.isDeleted){WusoolUI.message(t('الفرع غير موجود.','Branch not found.'));return;}
 const svc=WusoolServices.branchMedia;let data=await svc.read(id),items=[...data.photos.map(x=>({...x,kind:'photo'})),...data.videos.map(x=>({...x,kind:'video'}))],urls=new Map(),editor=null,disposed=false,busy=false,dirty=false,uploading=false;
 const limits={photoBytes:5*1024*1024,videoBytes:100*1024*1024,count:60,...window.WusoolApiConfig.branchMediaLimits};
 const categories=['main-entrance','entrance-route','accessible-parking','internal-pathway','reception-counter','elevator','accessible-restroom','destination-area'];
 const form=document.getElementById('branchPhotosForm'),container=document.getElementById('photoCategories');
 document.getElementById('currentBranchName').textContent=branch.name;document.getElementById('currentBranchLocation').textContent=branch.address||'';document.getElementById('branchNameBadge').textContent=branch.name;
 // Reuse the existing form, draft/continue controls and category identifiers.
 const tools=document.createElement('section');tools.className='branch-media-tools';tools.innerHTML=`<h2>${t('صور وفيديو الجولة — اختياري','Photos & walkthrough video — optional')}</h2><p>${t('لا يشترط رفع صور أو تحليل AI لحفظ المسودة. غياب الأدلة ليس اكتمالًا ولا اعتمادًا.','Drafts do not require photos or AI analysis. Missing evidence is neither completion nor approval.')}</p><label class="btn btn-wusool">${t('إضافة صور','Add photos')}<input data-photos type="file" accept="image/jpeg,image/png,image/webp" multiple hidden></label><label class="btn btn-outline-wusool">${t('التقاط صورة','Capture photo')}<input data-camera type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden></label><label class="btn btn-outline-wusool">${t('إضافة فيديو جولة','Add walkthrough video')}<input data-video type="file" accept="video/mp4,video/webm" hidden></label><a class="btn btn-outline-wusool" href="./branch-photos.html?id=${encodeURIComponent(id)}&editor=route#branchNavigationEditor">${t('محرر المسار','Route editor')}</a><p role="status" data-upload-status></p><small>${t('الحدود','Limits')}: ${limits.photoBytes/1048576} MB / ${limits.videoBytes/1048576} MB · ${limits.count} ${t('ملفًا. يجب أن يطبق الخادم نفس التحقق.','files. Server validation is also required.')}</small>`;container.before(tools);
 const status=text=>tools.querySelector('[data-upload-status]').textContent=text;
 const preview=async item=>{if(urls.has(item.id))return urls.get(item.id);if(item.url||item.imageData)return item.url||item.imageData;const blob=await WusoolMediaBlobs.get(id,item.blobId||item.id);if(blob){const url=URL.createObjectURL(blob);urls.set(item.id,url);return url;}return null;};
 const save=async()=>{if(busy||uploading)throw new Error(t('انتظر اكتمال الحفظ أو إضافة الملف.','Wait for the current save or file preparation.'));busy=true;try{data=await svc.saveMedia(id,items);dirty=false;status(WusoolServices.mode==='local'?t('تم حفظ البيانات. الملفات المحلية في IndexedDB وليست رفعًا للخادم.','Metadata saved. Local blobs are in IndexedDB, not server uploads.'):t('تم حفظ بيانات الملفات التي أكد الخادم رفعها.','Confirmed server-upload metadata saved.'));}finally{busy=false;}};
 const render=async()=>{container.replaceChildren();for(const item of items){const card=document.createElement('article');card.className='branch-media-card col-12 col-md-6';const url=await preview(item);if(disposed)return;card.innerHTML=`<div class="media-preview">${url?(item.kind==='video'?`<video controls preload="metadata" src="${esc(url)}"></video>`:`<img src="${esc(url)}" alt="${esc(item.title||item.name||'Branch media')}">`):`<p>${t('ملف المعاينة غير متاح؛ أعد إرفاقه.','Preview unavailable; reattach the file.')}</p>`}</div><h3>${esc(item.title||item.name||t('بدون اسم','Untitled'))}</h3><p>${esc(item.type||'')} · ${Math.round((item.size||0)/1024)} KB</p><p data-item-state>${esc(item.processingState||item.status||'completed')} · ${esc(item.locationSource||t('لا يوجد موقع','No location'))}</p><div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-outline-wusool" data-edit>${t('بيانات وموقع','Metadata & location')}</button><button type="button" class="btn btn-outline-danger" data-remove>${t('حذف صريح','Explicitly remove')}</button>${item.kind==='video'?`<button type="button" class="btn btn-outline-wusool" data-process>${t('استخراج صور بالخادم','Extract server frames')}</button>`:''}</div>`;container.append(card);card.querySelector('img,video')?.addEventListener('error',()=>{item.processingState='failed';item.status='failed';card.querySelector('[data-item-state]').textContent=t('تعذر فك الملف أو تحميله؛ احذفه وأعد المحاولة.','Media decode/load failed; remove and retry.');});
 card.querySelector('[data-edit]').onclick=()=>edit(item);card.querySelector('[data-remove]').onclick=async()=>{try{editor?.dispose();editor=null;const next=items.filter(x=>x.id!==item.id);await svc.saveMedia(id,next);items=next;if(urls.has(item.id)){URL.revokeObjectURL(urls.get(item.id));urls.delete(item.id);}if(item.blobId)await WusoolMediaBlobs.remove(id,item.blobId);await render();}catch(e){status(e.message);}};
 if(item.kind==='video')card.querySelector('[data-process]').onclick=async()=>{const button=card.querySelector('[data-process]');if(button.disabled)return;button.disabled=true;try{const job=item.processingJobId?await svc.job(id,item.processingJobId):await svc.processing(id,item.id);item.processingState=job.state;item.processingJobId=job.id||null;card.querySelector('[data-item-state]').textContent=job.state==='unavailable'?t('معالجة الخادم غير متاحة؛ الفيديو الأصلي محفوظ.','Server processing unavailable; original video retained.'):job.message||job.state;if(job.state!=='unavailable')await pollJob(item,card);}catch(e){item.processingState='failed';card.querySelector('[data-item-state]').textContent=e.message;}finally{if(button.isConnected)button.disabled=false;}};
 }
 document.getElementById('uploadedPhotoCount').textContent=items.filter(x=>x.kind!=='video').length;document.getElementById('requiredPhotoCount').textContent=t('اختياري','Optional');document.getElementById('photoProgressBar').style.width='0%';};
 const jobControllers=new Set();const pollJob=async(item,card)=>{const controller=new AbortController();jobControllers.add(controller);const cancel=document.createElement('button');cancel.type='button';cancel.className='btn btn-outline-danger';cancel.textContent=t('إلغاء متابعة المعالجة','Cancel processing watch');card.append(cancel);cancel.onclick=async()=>{controller.abort();try{const result=await svc.cancelJob(id,item.processingJobId);item.processingState=result.state;card.querySelector('[data-item-state]').textContent=result.state;}catch(e){status(e.message);}cancel.remove();};try{for(let n=0;n<30&&!disposed&&!controller.signal.aborted;n++){if(document.hidden)return;const job=await svc.job(id,item.processingJobId);if(disposed||controller.signal.aborted)return;item.processingState=job.state;card.querySelector('[data-item-state]').textContent=job.state;if(job.state==='needs-review'){const review=document.createElement('fieldset');review.innerHTML=`<legend>${t('راجع الصور المستخرجة قبل قبولها','Review extracted frames before accepting')}</legend>`;for(const frame of job.frames||[]){const label=document.createElement('label');label.innerHTML=`<input type="checkbox" value="${esc(frame.id)}"><img src="${esc(frame.url)}" alt="${esc(frame.name||'Extracted frame')}" width="120">`;review.append(label);}const accept=document.createElement('button');accept.type='button';accept.className='btn btn-wusool';accept.textContent=t('قبول الصور المختارة','Accept selected frames');review.append(accept);card.append(review);accept.onclick=async()=>{try{await svc.reviewFrames(id,job.id,[...review.querySelectorAll('input:checked')].map(x=>x.value));data=await svc.read(id);items=[...data.photos.map(x=>({...x,kind:'photo'})),...data.videos.map(x=>({...x,kind:'video'}))];await render();}catch(e){status(e.message);}};return;}if(['completed','failed','cancelled','unavailable'].includes(job.state))return;await new Promise(resolve=>{const timer=setTimeout(resolve,2000);controller.signal.addEventListener('abort',()=>{clearTimeout(timer);resolve();},{once:true});});}if(!controller.signal.aborted)card.querySelector('[data-item-state]').textContent=t('توقفت المتابعة. أعد المحاولة للتحقق؛ الفيديو الأصلي محفوظ.','Polling stopped. Retry to check; original video retained.');}finally{jobControllers.delete(controller);cancel.remove();}};
 const edit=item=>{editor?.dispose();const d=document.createElement('dialog');d.className='wusool-initial-dialog media-editor-dialog';d.innerHTML=`<form><h2>${t('بيانات الملف — اختيارية','Optional media metadata')}</h2>${[['title','الاسم','Title'],['floor','الطابق','Floor'],['pointId','نقطة التنقل','Navigation point ID'],['destinationId','الوجهة','Destination ID'],['heading','اتجاه التصوير (إن عُرف)','Capture heading (if known)'],['notes','ملاحظات','Notes']].map(([k,a,e])=>`<label>${t(a,e)}<input name="${k}" value="${esc(item[k]??'')}" ${k==='heading'?'type="number" min="0" max="359.999" step="any"':''} class="form-control"></label>`).join('')}<label>${t('الفئة','Category')}<select name="categoryKey" class="form-select"><option value="">${t('غير محددة','Not provided')}</option>${categories.map(c=>`<option ${item.categoryKey===c?'selected':''} value="${c}">${c}</option>`).join('')}</select></label><div data-location></div><p role="alert" data-error></p><button type="submit" class="btn btn-wusool">${t('حفظ','Save')}</button><button type="button" data-close class="btn btn-light">${t('إلغاء','Cancel')}</button></form>`;document.body.append(d);let locationSnapshot={latitude:item.latitude??null,longitude:item.longitude??null,accuracy:item.accuracy??null,heading:item.heading??null,locationSource:item.locationSource??null,locationTimestamp:item.locationTimestamp??null};const loc=WusoolMediaLocation.mount(d.querySelector('[data-location]'),{value:item,onConfirm:v=>{locationSnapshot=v;}});const close=()=>{loc.dispose();d.close();d.remove();editor=null;};editor={dispose:close};d.querySelector('[data-close]').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close();});d.querySelector('form').onsubmit=async e=>{e.preventDefault();try{const fields=Object.fromEntries(new FormData(e.currentTarget));const normalized=svc.metadata({...item,...fields,...locationSnapshot,heading:fields.heading===''?locationSnapshot.heading:fields.heading});Object.assign(item,normalized);dirty=true;await save();close();await render();}catch(error){d.querySelector('[data-error]').textContent=error.message;}};d.showModal();};
  const compressPhoto = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const maximumDimension = 1600;
          const scale = Math.min(
            1,
            maximumDimension / Math.max(image.naturalWidth, image.naturalHeight),
          );
          const width = Math.max(1, Math.round(image.naturalWidth * scale));
          const height = Math.max(1, Math.round(image.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;
          context.fillStyle = '#fff';
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Image compression failed.'));
              const compressedFile =
                blob.size < file.size
                  ? new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
                      type: 'image/jpeg',
                      lastModified: file.lastModified,
                    })
                  : file;
              const output = new FileReader();
              output.onload = () => resolve({ file: compressedFile, imageData: output.result });
              output.onerror = reject;
              output.readAsDataURL(compressedFile);
            },
            'image/jpeg',
            0.88,
          );
        };
        image.onerror = reject;
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const validatePhoto = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return `${file.name} is not a supported image format.`;
    }
    if (file.size > maximumPhotoSize) {
      return `${file.name} is larger than 5 MB.`;
    }
    return '';
  };

 const add=async files=>{if(uploading||busy){status(t('انتظر إضافة الملف الحالي، ثم أعد اختيار الملف.','Wait for current file preparation, then choose the file again.'));return;}uploading=true;try{for(const selected of files){let file=selected;try{if(items.length>=limits.count)throw new Error(t('وصلت إلى حد الملفات.','Media count limit reached.'));const video=file.type.startsWith('video/');const valid=video?{'video/mp4':/\.mp4$/i,'video/webm':/\.webm$/i}:{'image/jpeg':/\.jpe?g$/i,'image/png':/\.png$/i,'image/webp':/\.webp$/i};if(!valid[file.type]?.test(file.name)||file.size>(video?limits.videoBytes:limits.photoBytes))throw new Error(t('نوع أو حجم الملف غير مقبول.','Unsupported type/extension or file too large.'));const compressed=video?{file}:await compressPhoto(file);file=compressed.file;if(disposed)return;status(t('جارٍ حفظ الملف…','Saving file…'));const mediaId=crypto.randomUUID();let item={id:mediaId,kind:video?'video':'photo',name:file.name,type:file.type,size:file.size,categoryKey:null,processingState:video?'not-provided':'completed',uploaded:false,status:'local-draft',blobId:mediaId};if(WusoolServices.mode==='api'){const upload=await svc.upload(id,compressed.file);if(!upload.uploaded)throw new Error(upload.message||'Server upload not confirmed.');item={...item,...upload,blobId:null,uploaded:true};}else await WusoolMediaBlobs.put(id,mediaId,file);items.push(svc.metadata(item));dirty=true;}catch(e){status(e.message);}}await render();}finally{uploading=false;}};
 for(const input of tools.querySelectorAll('input[type=file]'))input.onchange=async()=>{await add([...input.files]);input.value='';};
 form.onsubmit=async e=>{e.preventDefault();try{await save();location.href='./branch-submit-review.html?id='+encodeURIComponent(id);}catch(error){status(error.message);}};document.getElementById('saveDraftButton').onclick=()=>save().catch(e=>status(e.message));
 const unwatch=window.WusoolLive?.watch('branch-media',async()=>{if(disposed||busy||dirty||editor)return;const next=await svc.read(id);if(JSON.stringify([data.photos,data.videos])!==JSON.stringify([next.photos,next.videos])){data=next;items=[...next.photos.map(x=>({...x,kind:'photo'})),...next.videos.map(x=>({...x,kind:'video'}))];await render();}});
 const teardown=()=>{disposed=true;unwatch?.();editor?.dispose();jobControllers.forEach(c=>c.abort());urls.forEach(url=>URL.revokeObjectURL(url));urls.clear();};window.addEventListener('pagehide',teardown,{once:true});await render();await window.WusoolBranchNavigationEditor?.mount(form,id,{reloadMedia:()=>svc.read(id)});
});
