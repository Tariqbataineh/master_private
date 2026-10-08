'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    document.getElementById('analysisLoading')?.classList.add('d-none');
    const results = document.getElementById('analysisResults');
    if (results) {
      results.classList.remove('d-none');
      WusoolUI.html(results, '<div class="alert alert-info" role="status">AI analysis is unavailable until the backend is configured. Continue to the manual branch submission; no AI score or verification has been generated.</div>');
    }
    const branchId = new URLSearchParams(location.search).get('id');
    const branch = branchId ? await WusoolServices.getBranchById(branchId) : JSON.parse((await WusoolServices.rawRead('wusoolCurrentBranchDraft')) || 'null');
    const button = document.getElementById('continueButton');
    if (button) {
      button.disabled = !branch;
      WusoolUI.listen(button, 'click', () => { location.href = './branch-submit-review.html?id=' + encodeURIComponent(branch.id); });
    }
    const analyze = document.getElementById('runAnalysisButton');
    if (analyze) analyze.disabled = !branch;
    WusoolUI.listen(analyze, 'click', async () => {
      if (!branch) throw new Error('Select an owned branch first.');
      const result = await WusoolServices.external('ai/branch-analysis', {branchId:branch.id});
      if (!result || !['completed','uncertain','failed','unavailable'].includes(result.status) || result.score != null && (!Number.isFinite(result.score) || result.score < 0 || result.score > 100)) throw Object.assign(new Error('Invalid AI analysis response.'),{code:'INVALID_RESPONSE'});
      if (results) results.textContent = result.message || result.text || `${result.status}${result.score == null ? '' : ': '+result.score+' / 100'} — AI suggestion; not verified evidence.`;
      WusoolUI.message(result.message || result.status, result.status === 'completed' ? 'info' : 'warning');
    });
    WusoolUI.listen(document.getElementById('backButton'), 'click', () => {location.href='./branch-photos.html?id='+encodeURIComponent(branch?.id||'');});
  });
});
