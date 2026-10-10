'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.message(
    'Local mode uses a deterministic data-query demonstration, not AI analysis. API mode requires the AI backend.',
    'info',
  );
  const conversation = document.getElementById('copilotConversation');
  const input = document.getElementById('copilotInput');
  const addMessage = (who, html) => {
    WusoolUI.insertHTML(
      conversation,
      'beforeend',
      `
            <div class="mb-3">
                <strong class="d-block mb-1">${who}</strong>
                <div>${html}</div>
            </div>
        `,
    );
    conversation.scrollTop = conversation.scrollHeight;
  };
  const answer = async (question) => {
    if (WusoolServices.mode === 'api') {
      const result = await WusoolServices.external('ai/copilot', { question });
      if (typeof result?.text !== 'string' || !result.text.trim())
        throw new Error('Invalid AI response.');
      return WusoolUI.escape(result.text);
    }
    const q = question.toLowerCase();
    if (q.includes('branches') && (q.includes('60') || q.includes('low'))) {
      const items = (await WusoolDataService.getBranches()).filter(
        (x) => x.accessibilityScore < 60,
      );
      return items.length
        ? items.map((x) => `${x.name} (${x.accessibilityScore}%)`).join('<br>')
        : 'No branches are currently below 60%.';
    }
    if (q.includes('open') && q.includes('ticket')) {
      const items = (await WusoolDataService.getTickets()).filter(
        (x) => !['resolved', 'closed'].includes(x.status.toLowerCase()),
      );
      return items.length
        ? items.map((x) => `${x.subject} — ${x.priority}`).join('<br>')
        : 'No open tickets.';
    }
    if (q.includes('pending') && q.includes('organization')) {
      const items = await WusoolDataService.getOrganizations({
        status: 'pending',
      });
      return items.length ? items.map((x) => x.name).join('<br>') : 'No pending organizations.';
    }
    if (q.includes('flagged') && q.includes('review')) {
      const items = await WusoolDataService.getReviews({
        flagged: true,
      });
      return items.length
        ? items.map((x) => `${x.title || 'Review'} (${x.rating}/5)`).join('<br>')
        : 'No flagged reviews.';
    }
    if (q.includes('summary') || q.includes('overview')) {
      const s = await WusoolDataService.getDashboardSnapshot();
      return `
            Users: ${s.users}<br>
            Organizations: ${s.organizations}<br>
            Branches: ${s.branches}<br>
            Pending branches: ${s.pendingBranches}<br>
            Open tickets: ${s.openTickets}<br>
            Active subscriptions: ${s.activeSubscriptions}
        `;
    }
    return 'This frontend Copilot currently answers platform-data questions. When the backend/AI provider is connected, the same UI can support free-form AI.';
  };
  const submit = async () => {
    const value = input.value.trim();
    if (!value) {
      return;
    }
    addMessage('You', WusoolUI.escape(value));
    addMessage(
      WusoolServices.mode === 'local' ? 'Local data query demo' : 'Wusool Copilot',
      await answer(value),
    );
    input.value = '';
  };
  WusoolUI.listen(document.getElementById('copilotSend'), 'click', submit);
  WusoolUI.listen(input, 'keydown', async (event) => {
    if (event.key === 'Enter') {
      await submit();
    }
  });
  WusoolUI.listen(document, 'click', async (event) => {
    const button = event.target.closest('[data-question]');
    if (button) {
      input.value = button.dataset.question;
      await submit();
    }
  });
  addMessage('Wusool Copilot', 'Ask me about current Wusool platform data.');
});
