WusoolUI.enqueue(async () => {
  WusoolUI.ready(async () => {
    const form = document.querySelector('form');
    if (WusoolServices.mode === 'local') {
      WusoolUI.message('Local administrator: admin@wusool.com / WusoolAdmin2026@', 'info');
    }
    document.querySelectorAll('[id*=togglePassword],[id*=TogglePassword]').forEach((b) =>
      WusoolUI.listen(b, 'click', () => {
        const p = form.querySelector('input[type=password],input[data-password]');
        if (p) {
          p.dataset.password = 'true';
          p.type = p.type === 'password' ? 'text' : 'password';
        }
      }),
    );
    WusoolUI.listen(form, 'submit', async (e) => {
      e.preventDefault();
      const email = (
        document.getElementById('adminEmail') || form.querySelector('input[type=email]')
      ).value;
      const password = (
        document.getElementById('adminPassword') ||
        form.querySelector('input[type=password],input[data-password]')
      ).value;
      try {
        if (WusoolServices.mode === 'local') await WusoolServices.seedAdmin();
        const a = await WusoolServices.login(email, password, 'Admin');
        if (!(await WusoolUI.completeFirstLogin(a, password))) return;
        location.href = WusoolUI.destination(
          new URLSearchParams(location.search).get('returnTo'),
          a.role,
        );
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        const alert = document.getElementById('loginError');
        if (alert) {
          alert.textContent = error.message;
          alert.classList.remove('d-none');
        } else WusoolUI.message(error.message);
      }
    });
    const forgot = document.getElementById('forgotPassword');
    if (forgot)
      WusoolUI.listen(forgot, 'click', async (e) => {
        e.preventDefault();
        try {
          await WusoolServices.external('auth/recovery', {
            email: form.querySelector('input[type=email]').value,
          });
          WusoolUI.message('Recovery request accepted by server.', 'info');
        } catch (error) {
          if (WusoolServices.mode === 'api') throw error;
          WusoolUI.message(error.message);
        }
      });
  });
});
