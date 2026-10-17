'use strict';

WusoolUI.enqueue(async () => {
  (() => {
    const KEY = 'wusoolRuntimeErrors';
    const read = async () => await WusoolServices.getRuntimeErrors();
    const push = async (entry) => await WusoolServices.reportRuntimeError(entry);
    WusoolUI.listen(window, 'error', async (event) => {
      await push({
        type: 'JavaScript',
        message: event.message || 'Unknown error',
        source: event.filename || window.location.pathname,
        line: event.lineno || 0,
      });
    });
    WusoolUI.listen(window, 'unhandledrejection', async (event) => {
      await push({
        type: 'Promise',
        message: String(event.reason || 'Unhandled promise rejection'),
        source: window.location.pathname,
        line: 0,
      });
    });
    window.WusoolErrorRuntime = {
      KEY,
      read,
      push,
    };
  })();
});
