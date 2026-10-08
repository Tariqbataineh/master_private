WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  window.WusoolAdmin = {
    toast(message, type = "success") {
      document.getElementById("wusoolToast")?.remove();
      const toast = document.createElement("div");
      toast.id = "wusoolToast";
      toast.className = `alert alert-${type} position-fixed shadow`;
      toast.style.right = "20px";
      toast.style.bottom = "20px";
      toast.style.zIndex = "2000";
      toast.style.maxWidth = "380px";
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2600);
    },
    statusReason(status) {
      if(!['blocked','suspended','disabled','rejected'].includes(status))return '';
      const reason=window.prompt('Reason for this account status change:');
      if(!reason?.trim()){WusoolAdmin.toast('Status change cancelled: a reason is required.', 'info');return null;}
      return reason.trim();
    },
    confirm(message) {
      return window.confirm(message);
    },
    getQuery(name) {
      return new URLSearchParams(window.location.search).get(name);
    },
    downloadText(filename, text, type = "text/plain") {
      const blob = new Blob([text], {
        type
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    bindCommandPalette() {
      const palette = document.getElementById("commandPalette");
      const input = document.getElementById("commandPaletteInput");
      if (!palette || !input) {
        return;
      }
      WusoolUI.listen(document, "keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          palette.classList.toggle("d-none");
          if (!palette.classList.contains("d-none")) {
            input.focus();
          }
        }
        if (event.key === "Escape") {
          palette.classList.add("d-none");
        }
      });
    }
  };
  WusoolUI.ready(() => {
    WusoolAdmin.bindCommandPalette();
  });
});
