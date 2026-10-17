'use strict';
// Organization branch evidence: keep media blobs local and metadata in the existing branch service.
WusoolUI.enqueue(async () => {
  if (!await WusoolUI.guard()) return;
  const t = (ar, en) => window.WusoolMediaI18n.text(ar, en);
  const esc = WusoolUI.escape;
  const id = new URLSearchParams(location.search).get('id') ||
    JSON.parse(await WusoolServices.rawRead('wusoolCurrentBranchDraft') || 'null')?.id;
  if (!id) { WusoolUI.message(t('اختر فرعًا أولًا.', 'Choose a branch first.')); return; }
  const branch = await WusoolServices.getBranchById(id);
  if (!branch || branch.isDeleted) { WusoolUI.message(t('الفرع غير موجود.', 'Branch not found.')); return; }

  const svc = WusoolServices.branchMedia;
  let data = await svc.read(id);
  let items = [...data.photos.map(m => ({ ...m, kind: 'photo' })), ...data.videos.map(m => ({ ...m, kind: 'video' }))];
  const urls = new Map();
  const form = document.getElementById('branchPhotosForm');
  const container = document.getElementById('photoCategories');
  const alertBox = document.getElementById('photoValidationAlert');
  const alertMessage = document.getElementById('photoValidationMessage');
  const limits = { photoBytes: 5 * 1048576, videoBytes: 100 * 1048576, count: 60,
    ...(window.WusoolApiConfig?.branchMediaLimits || {}) };
  const firstFloor = t('الطابق الأول', 'First floor');
  let currentFloor = firstFloor;
  let saving = false, uploading = false, dirty = false, disposed = false, editor = null, camera = null;
  const pendingJobs = new Set();
  const categories = ['main-entrance','entrance-route','accessible-parking','internal-pathway',
    'reception-counter','elevator','accessible-restroom','destination-area'];

  document.getElementById('backButton').href = './branch-accessibility.html?id=' + encodeURIComponent(id);
  document.getElementById('currentBranchName').textContent = branch.name;
  document.getElementById('currentBranchLocation').textContent = branch.address || '';
  document.getElementById('branchNameBadge').textContent = branch.name;

  const tools = document.createElement('section');
  tools.className = 'branch-media-tools';
  tools.innerHTML = `<div class="branch-evidence-heading"><div><span class="branch-evidence-eyebrow">${t('أدلة التنقل', 'NAVIGATION EVIDENCE')}</span><h2>${t('صور وفيديو لكل طابق', 'Photos & walkthrough video by floor')}</h2><p>${t('ارفع صورة واضحة وفيديو جولة واحدًا على الأقل لكل طابق مُضاف. ستظهر الملفات هنا مباشرة.', 'Upload at least one photo and one walkthrough video for each added floor. Media appears here immediately.')}</p></div><button type="button" class="btn btn-outline-wusool" data-add-floor>${t('إضافة طابق', 'Add floor')}</button></div><div role="status" aria-live="polite" data-upload-status class="branch-upload-status"></div><small>${t('الحدود', 'Limits')}: ${Math.round(limits.photoBytes / 1048576)} MB ${t('للصورة', 'per photo')} · ${Math.round(limits.videoBytes / 1048576)} MB ${t('للفيديو', 'per video')} · ${limits.count} ${t('ملفًا', 'files')}</small>`;
  container.before(tools);
  const message = (value, isError = false) => {
    tools.querySelector('[data-upload-status]').textContent = value;
    tools.querySelector('[data-upload-status]').classList.toggle('is-error', isError);
    if (alertBox) alertBox.classList.toggle('d-none', !isError);
    if (isError && alertMessage) alertMessage.textContent = value;
  };
  const nameOfFloor = m => {
    const value = String(m.floor || firstFloor).trim() || firstFloor;
    return value === 'First floor' || value === 'الطابق الأول' ? firstFloor : value;
  };
  const floors = () => [...new Set([firstFloor, currentFloor, ...items.map(nameOfFloor)])];
  const matching = (floor, kind) => items.filter(m => nameOfFloor(m) === floor && m.kind === kind);
  const existingBlob = item => WusoolMediaBlobs.get(id, item.blobId || item.id);
  const assetURL = async item => {
    if (urls.has(item.id)) return urls.get(item.id);
    if (item.url || item.imageData) return item.url || item.imageData;
    const blob = await existingBlob(item);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urls.set(item.id, url);
    return url;
  };
  const changeSaveState = disabled => {
    form.querySelectorAll('[type="submit"],#saveDraftButton').forEach(button => { button.disabled = disabled; });
  };
  // Save only metadata through the existing entitlement/ownership-enforcing service.
  const save = async (skipEvidenceCheck = false) => {
    if (saving || uploading) throw new Error(t('انتظر اكتمال حفظ الملفات أولًا.', 'Wait for media preparation and saving to finish.'));
    if (!skipEvidenceCheck) {
      for (const floor of floors()) {
        if (!matching(floor, 'photo').length || !matching(floor, 'video').length) {
          throw new Error(t(`أضف صورة واحدة وفيديو جولة واحدًا على الأقل للطابق: ${floor}`, `Add at least one photo and one walkthrough video for floor: ${floor}`));
        }
      }
    }
    saving = true; changeSaveState(true);
    try {
      data = await svc.saveMedia(id, items);
      dirty = false;
      message(WusoolServices.mode === 'local' ?
        t('تم الحفظ في هذا المتصفح: بيانات الفرع وملفاته المحلية. لا يوجد رفع لخادم أو تحليل AI فعلي.', 'Saved in this browser: branch metadata and local files. No server upload or real AI analysis.') :
        t('تم حفظ بيانات الملفات التي أكد الخادم استقبالها.', 'Metadata saved for server-confirmed uploads.'));
      return data;
    } finally { saving = false; changeSaveState(false); }
  };

  const floorControls = floor => `<div class="branch-floor-actions"><button type="button" class="btn btn-wusool" data-choose-photos>${t('إضافة صور', 'Add photos')}</button><input class="branch-hidden-file" data-photos type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="${t('اختيار صور الطابق', 'Choose floor photos')}"><button type="button" class="btn btn-outline-wusool" data-open-camera>${t('فتح الكاميرا', 'Open camera')}</button><button type="button" class="btn btn-outline-wusool" data-choose-video>${t('إضافة فيديو جولة', 'Add walkthrough video')}</button><input class="branch-hidden-file" data-video type="file" accept="video/mp4,video/webm" aria-label="${t('اختيار فيديو الطابق', 'Choose floor video')}"></div>`;

  const render = async () => {
    container.replaceChildren();
    const snapshot = floors();
    for (const floor of snapshot) {
      const section = document.createElement('section');
      section.className = 'branch-floor-section col-12';
      section.innerHTML = `<header class="branch-floor-header"><div><span>${t('طابق', 'Floor')}</span><h3>${esc(floor)}</h3><div class="branch-floor-count">${matching(floor, 'photo').length} ${t('صور', 'photos')} · ${matching(floor, 'video').length} ${t('فيديو', 'videos')}</div></div>${floorControls(floor)}</header><div class="row g-3" data-floor-items></div>`;
      container.append(section);
      const controls = section.querySelector('.branch-floor-actions');
      controls.querySelector('[data-choose-photos]').onclick = () => controls.querySelector('[data-photos]').click();
      controls.querySelector('[data-choose-video]').onclick = () => controls.querySelector('[data-video]').click();
      controls.querySelector('[data-open-camera]').onclick = () => openCamera(floor);
      for (const input of controls.querySelectorAll('input[type=file]')) {
        input.onchange = async () => {
          const files = [...(input.files || [])];
          input.value = '';
          if (files.length) await addFiles(files, floor);
        };
      }
      const list = section.querySelector('[data-floor-items]');
      const floorItems = items.filter(item => nameOfFloor(item) === floor);
      if (!floorItems.length) {
        list.innerHTML = `<div class="col-12"><div class="branch-floor-empty">${t('لا توجد صور أو فيديوهات لهذا الطابق. استخدم الأزرار بالأعلى لإضافتها.', 'No photos or videos on this floor yet. Use the buttons above to add them.')}</div></div>`;
      }
      for (const item of floorItems) {
        const card = document.createElement('article');
        card.className = 'branch-media-card col-12 col-lg-6';
        card.dataset.mediaId = item.id;
        const url = await assetURL(item).catch(() => null);
        if (disposed) return;
        const photosForVideo = item.kind === 'video' ? matching(floor, 'photo') : [];
        const relatedVideo = item.kind === 'photo' ? items.find(m => m.id === item.linkedVideoId && m.kind === 'video') : null;
        const thumbs = item.kind === 'video' ? (item.directionSnapshots || []).slice(0, 8) : [];
        const type = item.kind === 'video' ? t('فيديو جولة', 'Walkthrough video') : t('صورة مرجعية', 'Reference photo');
        card.innerHTML = `<div class="media-preview">${url ? (item.kind === 'video' ? `<video controls playsinline preload="metadata" src="${esc(url)}"></video>` : `<img loading="lazy" src="${esc(url)}" alt="${esc(item.title || item.name || type)}">`) : `<div class="branch-missing-preview">${t('تعذر تحميل المعاينة من التخزين المحلي.', 'Preview unavailable in local storage.')}</div>`}</div><div class="branch-media-details"><span class="branch-media-type">${type}</span><h3>${esc(item.title || item.name || type)}</h3><p>${Math.round((item.size || 0)/1024)} KB · ${esc(floor)}</p><p class="branch-reference-note">${item.kind === 'video' ? `${t('صور مرتبطة بهذا الطابق', 'Floor reference photos')}: ${photosForVideo.length}` : relatedVideo ? `${t('مرتبطة بفيديو', 'Linked to video')}: ${esc(relatedVideo.title || relatedVideo.name || '')}` : t('اربط الصورة بفيديو الطابق من بيانات الملف.', 'Link this photo to a floor video in Metadata.')}</p>${thumbs.length ? `<div class="branch-frame-strip" data-frames></div>` : ''}<div class="branch-media-actions"><button type="button" class="btn btn-outline-wusool" data-edit>${t('البيانات والربط', 'Metadata & links')}</button>${item.kind === 'video' ? `<button type="button" class="btn btn-outline-wusool" data-extract>${t('إنشاء لقطات مرجعية', 'Extract reference frames')}</button>` : ''}<button type="button" class="btn btn-outline-danger" data-remove>${t('حذف', 'Remove')}</button></div></div>`;
        list.append(card);
        card.querySelector('img,video')?.addEventListener('error', () => {
          const el = card.querySelector('.media-preview');
          if (el) el.textContent = t('تعذر تشغيل الملف. أعد إرفاقه بترميز مدعوم.', 'Cannot display this file. Reattach in a supported format.');
        });
        if (thumbs.length) {
          const strip = card.querySelector('[data-frames]');
          for (const frame of thumbs) {
            const pic = document.createElement('figure');
            const image = document.createElement('img');
            image.alt = `${t('لقطة من الفيديو عند', 'Video frame at')} ${frame.timeSeconds}s`;
            let frameUrl = frame.imageData || null;
            if (!frameUrl && frame.blobId) {
              const blob = await WusoolMediaBlobs.get(id, frame.blobId).catch(() => null);
              if (blob) { frameUrl = urls.get('frame:' + frame.id) || URL.createObjectURL(blob); urls.set('frame:' + frame.id, frameUrl); }
            }
            if (frameUrl) image.src = frameUrl;
            const cap = document.createElement('figcaption');
            cap.textContent = `${Number(frame.timeSeconds || 0).toFixed(1)}s`;
            pic.append(image, cap); strip.append(pic);
          }
        }
        card.querySelector('[data-edit]').onclick = () => editMetadata(item);
        card.querySelector('[data-remove]').onclick = () => removeItem(item);
        card.querySelector('[data-extract]')?.addEventListener('click', () => prepareFrames(item));
      }
    }
    document.getElementById('uploadedPhotoCount').textContent = String(items.filter(m => m.kind === 'photo').length);
    document.getElementById('requiredPhotoCount').textContent = `${items.filter(m => m.kind === 'video').length} ${t('فيديو', 'videos')}`;
    const ready = snapshot.filter(f => matching(f, 'photo').length && matching(f, 'video').length).length;
    document.getElementById('photoProgressBar').style.width = Math.round(100 * ready / snapshot.length) + '%';
  };

  const openFloor = () => {
    editor?.dispose();
    const dialog = document.createElement('dialog');
    dialog.className = 'media-editor-dialog wusool-initial-dialog';
    dialog.innerHTML = `<form><h2>${t('إضافة طابق', 'Add floor')}</h2><label>${t('اسم الطابق', 'Floor name')}<input class="form-control" name="floor" required maxlength="75" value="${esc(t('الطابق الثاني', 'Second floor'))}"></label><div class="branch-dialog-actions"><button type="submit" class="btn btn-wusool">${t('إضافة', 'Add')}</button><button type="button" class="btn btn-light" data-close>${t('إلغاء', 'Cancel')}</button></div></form>`;
    document.body.append(dialog);
    const close = () => { dialog.close(); dialog.remove(); editor = null; };
    editor = { dispose: close };
    dialog.querySelector('[data-close]').onclick = close;
    dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dialog.querySelector('form').onsubmit = e => {
      e.preventDefault();
      currentFloor = String(new FormData(e.currentTarget).get('floor') || '').trim() || firstFloor;
      close(); void render();
    };
    dialog.showModal();
  };

  const imageForStorage = async file => {
    // Keep uploaded pixels and metadata intact; don't base64-encode photos into localStorage.
    // Canvas downsizing only occurs when the original exceeds the configured 5 MB limit.
    if (file.size <= limits.photoBytes) return file;
    const bmp = await createImageBitmap(file);
    try {
      const ratio = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bmp.width * ratio));
      canvas.height = Math.max(1, Math.round(bmp.height * ratio));
      canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .85));
      if (!blob || blob.size > limits.photoBytes) throw new Error(t('الصورة أكبر من الحد المسموح بعد الضغط.', 'Photo exceeds the limit after compression.'));
      return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    } finally { bmp.close?.(); }
  };

  const addFiles = async (files, floor) => {
    if (uploading || saving) { message(t('انتظر حفظ الملف السابق.', 'Wait for the previous media save.'), true); return; }
    currentFloor = floor;
    uploading = true; changeSaveState(true);
    try {
      for (const original of files) {
        let newItem = null;
        let persisted = false;
        try {
          if (items.length >= limits.count) throw new Error(t('وصلت إلى العدد الأقصى للملفات.', 'Maximum number of media files reached.'));
          const video = ['video/mp4','video/webm'].includes(original.type);
          const image = ['image/jpeg','image/png','image/webp'].includes(original.type);
          if (!video && !image) throw new Error(t('نوع الملف غير مدعوم. اختر JPG/PNG/WebP أو MP4/WebM.', 'Unsupported file type. Choose JPG/PNG/WebP or MP4/WebM.'));
          if (video && original.size > limits.videoBytes) throw new Error(t('الفيديو أكبر من الحد المسموح.', 'Video exceeds the size limit.'));
          if (!original.size) throw new Error(t('الملف فارغ.', 'The file is empty.'));
          const file = video ? original : await imageForStorage(original);
          const uid = crypto.randomUUID();
          newItem = { id: uid, blobId: uid, kind: video ? 'video' : 'photo', floor, name: file.name,
            type: file.type, size: file.size, status: 'local-draft', processingState: 'completed',
            directionSnapshots: video ? [] : undefined, uploaded: false };
          if (!video) {
            const linked = matching(floor,'video')[0];
            if (linked) newItem.linkedVideoId = linked.id;
          }
          if (WusoolServices.mode === 'api') {
            const uploaded = await svc.upload(id, file);
            if (!uploaded.uploaded) throw new Error(uploaded.message || t('الخادم لم يؤكد رفع الملف.', 'Server did not confirm the upload.'));
            newItem = { ...newItem, ...uploaded, uploaded: true, blobId: null };
            urls.set(newItem.id, URL.createObjectURL(file));
          } else {
            await WusoolMediaBlobs.put(id, uid, file);
            urls.set(uid, URL.createObjectURL(file));
          }
          // Establish video/photo links in one metadata write.
          const previousLinks = new Map();
          if (video) for (const photo of matching(floor, 'photo')) {
            previousLinks.set(photo.id, photo.linkedVideoId);
            if (!photo.linkedVideoId) photo.linkedVideoId = newItem.id;
          }
          items.push(svc.metadata(newItem));
          try {
            // Immediately commit metadata; otherwise refresh loses files already held in IndexedDB.
            await svc.saveMedia(id, items);
          } catch (error) {
            for (const photo of items) if (previousLinks.has(photo.id)) {
              const previous = previousLinks.get(photo.id);
              if (previous === undefined) delete photo.linkedVideoId; else photo.linkedVideoId = previous;
            }
            throw error;
          }
          dirty = false;
          persisted = true;
          message(t('تم حفظ الملف، وستظهر معاينته بالأسفل.', 'Media saved. Preview appears below.'));
          await render();
        } catch (error) {
          if (newItem && !persisted) {
            items = items.filter(m => m.id !== newItem.id);
            if (newItem.blobId) await WusoolMediaBlobs.remove(id, newItem.blobId).catch(() => {});
            const url = urls.get(newItem.id);
            if (url) URL.revokeObjectURL(url);
            urls.delete(newItem.id);
          }
          message(`${original.name}: ${error.message}`, true);
          await render().catch(() => {});
        }
      }
    } finally { uploading = false; changeSaveState(false); }
  };

  // Small, optional local visual reference extraction; NOT coordinates or AI geolocation.
  const captureFrames = file => new Promise(resolve => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    const captures = [], ratios = [.15,.5,.85];
    let index = 0, finished = false;
    const timer = setTimeout(finish, 18000);
    function finish() {
      if (finished) return;
      finished = true; clearTimeout(timer);
      video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url);
      resolve(captures);
    }
    video.muted = true; video.playsInline = true; video.preload = 'auto';
    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return finish();
      video.currentTime = Math.min(Math.max(.05, video.duration * ratios[index]), Math.max(.05, video.duration - .05));
    };
    video.onseeked = () => {
      try {
        const width = Math.min(640, video.videoWidth);
        if (width && video.videoHeight) {
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          captures.push({ timeSeconds: Number(video.currentTime.toFixed(2)), canvas });
        }
      } catch { /* Some codecs cannot be decoded for canvas extraction. */ }
      index++;
      if (index >= ratios.length) return finish();
      video.currentTime = Math.min(Math.max(.05, video.duration * ratios[index]), Math.max(.05, video.duration - .05));
    };
    video.onerror = finish;
    video.src = url;
  });

  const prepareFrames = async item => {
    if (saving || uploading || pendingJobs.has(item.id)) return;
    pendingJobs.add(item.id);
    try {
      if (WusoolServices.mode === 'api') {
        const job = item.processingJobId ? await svc.job(id, item.processingJobId) : await svc.processing(id, item.id);
        item.processingJobId = job.id || item.processingJobId || null;
        item.processingState = job.state;
        await svc.saveMedia(id, items);
        message(job.state === 'unavailable' ? t('معالجة الخادم غير متاحة؛ الفيديو محفوظ.', 'Server frame extraction unavailable; video is saved.') : t('تم إرسال طلب المعالجة. تحقق من الحالة لاحقًا.', 'Server processing requested. Check status later.'));
        return;
      }
      const file = await existingBlob(item);
      if (!file) throw new Error(t('ملف الفيديو غير متوفر محليًا.', 'Video file is missing from local storage.'));
      message(t('جارٍ استخراج لقطات مرجعية من الفيديو…', 'Extracting visual reference frames…'));
      const frames = await captureFrames(file);
      if (!frames.length) throw new Error(t('لم يستطع المتصفح استخراج اللقطات من ترميز الفيديو. الملف محفوظ ويمكن تشغيله.', 'Browser could not extract frames from this video codec. The original video remains saved.'));
      const staged = [];
      try {
        for (const frame of frames) {
          const blob = await new Promise(resolve => frame.canvas.toBlob(resolve, 'image/jpeg', .76));
          if (!blob) continue;
          const blobId = crypto.randomUUID();
          await WusoolMediaBlobs.put(id, blobId, blob);
          staged.push({ id: crypto.randomUUID(), blobId, timeSeconds: frame.timeSeconds });
        }
        if (!staged.length) throw new Error(t('تعذر حفظ اللقطات المرجعية.', 'Could not store reference frames.'));
        if (!items.find(m => m.id === item.id)) return;
        const before = item.directionSnapshots || [];
        item.directionSnapshots = staged;
        item.processingState = 'frames-ready';
        try { await svc.saveMedia(id, items); } catch (error) { item.directionSnapshots = before; throw error; }
        for (const old of before) if (old.blobId) await WusoolMediaBlobs.remove(id, old.blobId).catch(() => {});
        message(t('تم استخراج اللقطات المرجعية وحفظ أوقاتها. هذا ليس تحديدًا آليًا للموقع.', 'Timestamped reference frames saved. This does not determine geographic position.'));
        await render();
      } catch (error) {
        for (const f of staged) await WusoolMediaBlobs.remove(id, f.blobId).catch(() => {});
        throw error;
      }
    } catch (error) { message(error.message, true); }
    finally { pendingJobs.delete(item.id); }
  };

  const removeItem = async item => {
    if (saving || uploading) return;
    if (!window.confirm(t('هل تريد حذف هذا الملف من الفرع؟', 'Remove this media file from the branch?'))) return;
    const before = items.map(m => ({ ...m }));
    items = items.filter(m => m.id !== item.id);
    for (const photo of items) if (photo.linkedVideoId === item.id) delete photo.linkedVideoId;
    try {
      await svc.saveMedia(id, items);
      if (item.blobId) await WusoolMediaBlobs.remove(id, item.blobId).catch(() => {});
      for (const frame of item.directionSnapshots || []) if (frame.blobId) await WusoolMediaBlobs.remove(id, frame.blobId).catch(() => {});
      const url = urls.get(item.id);
      if (url) URL.revokeObjectURL(url);
      urls.delete(item.id);
      message(t('تم حذف الملف.', 'Media removed.'));
      await render();
    } catch (error) { items = before; message(error.message, true); }
  };

  const editMetadata = item => {
    editor?.dispose();
    const dialog = document.createElement('dialog');
    dialog.className = 'wusool-initial-dialog media-editor-dialog';
    const floorVideos = items.filter(m => m.kind === 'video' && nameOfFloor(m) === nameOfFloor(item) && m.id !== item.id);
    dialog.innerHTML = `<form><h2>${t('بيانات الملف والمرجع', 'Media metadata & reference')}</h2><p>${t('للمواقع الداخلية استخدم اسم الطابق ونقطة التنقل وفيديو الطابق. الإحداثيات الجغرافية اختيارية ويجب تأكيدها؛ لا تُستنتج تلقائيًا من الصور.', 'For indoor locations, use the floor, landmark and video reference. GPS coordinates are optional and must be verified, not inferred from images.')}</p><label>${t('عنوان الملف', 'Title')}<input class="form-control" name="title" value="${esc(item.title || item.name || '')}"></label><label>${t('الطابق', 'Floor')}<input required class="form-control" name="floor" value="${esc(nameOfFloor(item))}"></label><label>${t('نقطة التنقل (اختياري)', 'Navigation point ID (optional)')}<input class="form-control" name="pointId" value="${esc(item.pointId || '')}"></label><label>${t('الوجهة (اختياري)', 'Destination ID (optional)')}<input class="form-control" name="destinationId" value="${esc(item.destinationId || '')}"></label>${item.kind === 'photo' ? `<label>${t('فيديو مرجعي من نفس الطابق', 'Reference video on this floor')}<select class="form-select" name="linkedVideoId"><option value="">${t('بدون ربط', 'No linked video')}</option>${floorVideos.map(m => `<option value="${esc(m.id)}" ${item.linkedVideoId === m.id ? 'selected' : ''}>${esc(m.title || m.name || 'Video')}</option>`).join('')}</select></label><label>${t('وقت اللقطة بالفيديو بالثواني (اختياري)', 'Reference video timestamp in seconds (optional)')}<input class="form-control" type="number" name="videoTimeSeconds" min="0" step="0.1" value="${esc(item.videoTimeSeconds ?? '')}"></label>` : ''}<label>${t('نوع الموقع', 'Category')}<select class="form-select" name="categoryKey"><option value="">${t('غير محدد', 'Not specified')}</option>${categories.map(c => `<option value="${c}" ${item.categoryKey === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label>${t('ملاحظات', 'Notes')}<textarea class="form-control" name="notes" rows="2">${esc(item.notes || '')}</textarea></label><div data-location></div><p class="branch-dialog-error" role="alert"></p><div class="branch-dialog-actions"><button type="submit" class="btn btn-wusool">${t('حفظ', 'Save')}</button><button type="button" class="btn btn-light" data-close>${t('إلغاء', 'Cancel')}</button></div></form>`;
    document.body.append(dialog);
    let locValue = { latitude:item.latitude ?? null, longitude:item.longitude ?? null,
      accuracy:item.accuracy ?? null, locationSource:item.locationSource ?? null,
      locationTimestamp:item.locationTimestamp ?? null, heading:item.heading ?? null };
    const loc = WusoolMediaLocation.mount(dialog.querySelector('[data-location]'), { value:item, onConfirm: value => { locValue = value; } });
    const close = () => { loc.dispose(); dialog.close(); dialog.remove(); editor = null; };
    editor = { dispose: close };
    dialog.querySelector('[data-close]').onclick = close;
    dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dialog.querySelector('form').onsubmit = async event => {
      event.preventDefault();
      const fields = Object.fromEntries(new FormData(event.currentTarget));
      const current = { ...item };
      try {
        if (fields.linkedVideoId && !floorVideos.some(m => m.id === fields.linkedVideoId)) {
          throw new Error(t('الفيديو المرجعي لازم يكون من نفس الطابق.', 'Reference video must be on the same floor.'));
        }
        if (fields.videoTimeSeconds !== '' && (!Number.isFinite(Number(fields.videoTimeSeconds)) || Number(fields.videoTimeSeconds) < 0)) {
          throw new Error(t('وقت الفيديو غير صحيح.', 'Invalid video timestamp.'));
        }
        const update = svc.metadata({ ...item, ...fields, ...locValue,
          videoTimeSeconds: fields.videoTimeSeconds === '' ? null : Number(fields.videoTimeSeconds) });
        Object.assign(item, update);
        await svc.saveMedia(id, items);
        close(); message(t('تم حفظ بيانات الملف.', 'Media metadata saved.')); await render();
      } catch (error) { Object.assign(item, current); dialog.querySelector('.branch-dialog-error').textContent = error.message; }
    };
    dialog.showModal();
  };

  const openCamera = async floor => {
    editor?.dispose();
    const dialog = document.createElement('dialog');
    dialog.className = 'media-camera-dialog wusool-initial-dialog';
    dialog.innerHTML = `<div><h2>${t('كاميرا صور الفرع', 'Branch photo camera')}</h2><p>${t('اسمح للمتصفح باستخدام الكاميرا ثم التقط صورة.', 'Allow camera access and capture a photo.')}</p><video autoplay muted playsinline></video><p role="status" data-camera-message></p><div class="branch-dialog-actions"><button type="button" class="btn btn-wusool" data-capture disabled>${t('التقاط صورة', 'Capture photo')}</button><button type="button" class="btn btn-outline-wusool" data-fallback>${t('اختيار ملف', 'Choose file')}</button><input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden><button type="button" class="btn btn-light" data-close>${t('إغلاق', 'Close')}</button></div></div>`;
    document.body.append(dialog);
    const video = dialog.querySelector('video');
    const capture = dialog.querySelector('[data-capture]');
    const errorHost = dialog.querySelector('[data-camera-message]');
    let stream = null;
    const close = () => { stream?.getTracks().forEach(track => track.stop()); video.srcObject = null; dialog.close(); dialog.remove(); editor = null; camera = null; };
    editor = { dispose: close };
    camera = { close };
    dialog.querySelector('[data-close]').onclick = close;
    dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
    const fallback = dialog.querySelector('input[type=file]');
    dialog.querySelector('[data-fallback]').onclick = () => fallback.click();
    fallback.onchange = () => { const files = [...(fallback.files || [])]; close(); if (files.length) void addFiles(files, floor); };
    capture.onclick = async () => {
      if (!video.videoWidth) return;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .9));
      if (!blob) { errorHost.textContent = t('فشل التقاط الصورة.', 'Capture failed.'); return; }
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      close(); void addFiles([file], floor);
    };
    dialog.showModal();
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error(t('الكاميرا غير مدعومة. استخدم اختيار ملف.', 'Camera unavailable. Use Choose file.'));
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (!dialog.isConnected) { stream.getTracks().forEach(track => track.stop()); return; }
      video.srcObject = stream; await video.play(); capture.disabled = false;
    } catch (error) { errorHost.textContent = error.message || t('تعذّر فتح الكاميرا.', 'Could not open camera.'); }
  };

  tools.querySelector('[data-add-floor]').onclick = openFloor;
  document.getElementById('saveDraftButton').onclick = async () => { try { await save(true); } catch (error) { message(error.message, true); } };
  form.onsubmit = async event => {
    event.preventDefault();
    try { await save(false); location.href = './branch-submit-review.html?id=' + encodeURIComponent(id); }
    catch (error) { message(error.message, true); }
  };
  const stopWatch = window.WusoolLive?.watch('branch-media', async () => {
    if (disposed || saving || uploading || dirty || editor) return;
    try {
      const next = await svc.read(id);
      if (JSON.stringify([next.photos,next.videos]) !== JSON.stringify([data.photos,data.videos])) {
        data = next;
        items = [...next.photos.map(m => ({...m, kind:'photo'})), ...next.videos.map(m => ({...m, kind:'video'}))];
        await render();
      }
    } catch (error) { message(error.message, true); }
  });
  const cleanup = () => {
    disposed = true; stopWatch?.(); editor?.dispose(); camera?.close();
    for (const url of urls.values()) if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    urls.clear();
  };
  window.addEventListener('pagehide', cleanup, { once:true });
  await render();
});
