WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  window.WusoolAdmin = {
    toast(message, type = 'success') {
      document.getElementById('wusoolToast')?.remove();
      const toast = document.createElement('div');
      toast.id = 'wusoolToast';
      toast.className = `alert alert-${type} position-fixed shadow`;
      toast.style.right = '20px';
      toast.style.bottom = '20px';
      toast.style.zIndex = '2000';
      toast.style.maxWidth = '380px';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2600);
    },
    async statusReason(status) {
      if (!['blocked', 'suspended', 'disabled', 'rejected'].includes(status)) return '';
      return WusoolAdmin.dialog(
        'Confirm account status change',
        'Please provide a reason for this status change.',
        true,
      );
    },
    formError(form, message) {
      let alert = form.querySelector('[data-account-error]');
      if (!alert) {
        alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.dataset.accountError = 'true';
        alert.setAttribute('role', 'alert');
        form.querySelector('.modal-body').prepend(alert);
      }
      alert.textContent = message;
      alert.hidden = !message;
      if (message) alert.scrollIntoView({ block: 'nearest' });
    },
    async validateAccountForm(prefix) {
      const form = document.getElementById(prefix + 'Form');
      WusoolAdmin.formError(form, '');
      const keys = [
        'name',
        'email',
        'phone',
        'city',
        ...(prefix === 'organization' ? ['address', 'type', 'website'] : []),
        'notes',
      ];
      const input = {};
      for (const key of keys) {
        const field = document.getElementById(prefix + key[0].toUpperCase() + key.slice(1));
        if (field) {
          field.setCustomValidity('');
          field.value = field.value.trim();
          input[key] = field.value;
        }
      }
      const errors = WusoolServices.validateAccountInput(
        prefix === 'organization' ? 'organizations' : 'users',
        input,
      );
      if (!errors.email) {
        const [users, orgs] = await Promise.all([
          WusoolServices.getUsers(),
          WusoolServices.getOrganizations(),
        ]);
        const id = document.getElementById(prefix + 'Id').value;
        if (
          [...users, ...orgs].some(
            (x) =>
              !x.isDeleted && x.id !== id && x.email?.toLowerCase() === input.email.toLowerCase(),
          )
        )
          errors.email = 'This email is already used by another account. Enter a different email.';
      }
      for (const [key, message] of Object.entries(errors))
        document
          .getElementById(prefix + key[0].toUpperCase() + key.slice(1))
          ?.setCustomValidity(message);
      if (Object.keys(errors).length) {
        WusoolAdmin.formError(form, Object.values(errors)[0]);
        form.reportValidity();
        return false;
      }
      return form.reportValidity();
    },
    async showInvitation(result) {
      if (result.deliveryStatus === 'not-sent-local') {
        await WusoolAdmin.dialog(
          'Account created — local preview',
          `Email was NOT sent. Temporary password for ${result.account.email}: ${result.temporaryAccessCode}. Copy it now and share it privately. The user must choose a new password at first login.`,
        );
      } else if (['sent', 'queued'].includes(result.deliveryStatus)) {
        WusoolAdmin.toast(
          result.deliveryStatus === 'sent' ? 'Invitation email sent.' : 'Invitation email queued.',
          'info',
        );
      } else {
        WusoolAdmin.toast('Account created. Email delivery has not been confirmed.', 'warning');
      }
    },
    confirm(message) {
      return WusoolAdmin.dialog('Confirm action', message);
    },
    dialog(title, message, needsReason = false) {
      if (document.getElementById('wusoolConfirmDialog'))
        return Promise.resolve(needsReason ? null : false);
      return new Promise((resolve) => {
        const previousFocus = document.activeElement;
        const dialog = document.createElement('dialog');
        dialog.id = 'wusoolConfirmDialog';
        dialog.className = 'wusool-confirm-dialog';
        dialog.setAttribute('aria-labelledby', 'wusoolConfirmTitle');
        dialog.setAttribute('aria-describedby', 'wusoolConfirmMessage');
        dialog.innerHTML = `<form method="dialog"><div class="wusool-confirm-icon" aria-hidden="true">?</div><h2 id="wusoolConfirmTitle"></h2><p id="wusoolConfirmMessage"></p>${needsReason ? '<label for="wusoolConfirmReason">Reason</label><textarea id="wusoolConfirmReason" required rows="3" class="form-control"></textarea>' : ''}<div class="wusool-confirm-actions"><button type="button" class="btn btn-outline-secondary" data-cancel>Cancel</button><button type="submit" class="btn btn-wusool">Confirm</button></div></form>`;
        dialog.querySelector('h2').textContent = title;
        dialog.querySelector('p').textContent = message;
        document.body.appendChild(dialog);
        let finished = false;
        const finish = (value) => {
          if (finished) return;
          finished = true;
          dialog.close();
          dialog.remove();
          previousFocus?.focus();
          resolve(value);
        };
        dialog
          .querySelector('[data-cancel]')
          .addEventListener('click', () => finish(needsReason ? null : false));
        dialog.addEventListener('cancel', (event) => {
          event.preventDefault();
          finish(needsReason ? null : false);
        });
        dialog.querySelector('form').addEventListener('submit', (event) => {
          event.preventDefault();
          const input = dialog.querySelector('textarea');
          if (needsReason && !input.value.trim()) {
            input.setCustomValidity('Please enter a reason.');
            input.reportValidity();
            return;
          }
          finish(needsReason ? input.value.trim() : true);
        });
        dialog
          .querySelector('textarea')
          ?.addEventListener('input', (event) => event.target.setCustomValidity(''));
        dialog.addEventListener('focusin', (event) => event.stopPropagation());
        dialog.showModal();
        dialog.querySelector(needsReason ? 'textarea' : '[data-cancel]').focus();
      });
    },
    getQuery(name) {
      return new URLSearchParams(window.location.search).get(name);
    },
    downloadText(filename, text, type = 'text/plain') {
      const blob = new Blob([text], {
        type,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    bindCommandPalette() {
      const palette = document.getElementById('commandPalette');
      const input = document.getElementById('commandPaletteInput');
      if (!palette || !input) {
        return;
      }
      WusoolUI.listen(document, 'keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          palette.classList.toggle('d-none');
          if (!palette.classList.contains('d-none')) {
            input.focus();
          }
        }
        if (event.key === 'Escape') {
          palette.classList.add('d-none');
        }
      });
    },
  };
  WusoolUI.ready(() => {
    WusoolAdmin.bindCommandPalette();
  });
});

WusoolUI.ready(() =>
  WusoolUI.listen(document, 'click', async (event) => {
    const button = event.target.closest?.('[data-reset-access]');
    if (!button) return;
    if (
      !(await WusoolAdmin.confirm(
        'Issue a new temporary password? Current sessions will expire and the account must change its password at first login.',
      ))
    )
      return;
    button.disabled = true;
    try {
      const result = await WusoolServices.resetAccountAccess(
        button.dataset.accountKind,
        button.dataset.resetAccess,
      );
      await WusoolAdmin.dialog(
        'Login access reset',
        result.temporaryAccessCode
          ? `Email was NOT sent. Temporary password for ${result.account.email}: ${result.temporaryAccessCode}. Copy it now. First-login password change is required.`
          : result.delivery?.message || 'The backend accepted the access reset.',
      );
    } finally {
      button.disabled = false;
    }
  }),
);
