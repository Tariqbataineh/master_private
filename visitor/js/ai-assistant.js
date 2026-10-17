WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    await WusoolUI.prepareExternalScreen('ai/assistant');
  });
});
