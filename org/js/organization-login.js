WusoolUI.enqueue(async () => {
  WusoolUI.ready(async () => {
    const form = document.getElementById('organizationLoginForm') || document.querySelector('form');
    if (WusoolServices.mode === 'local' && 'Organization' === 'Admin') {
      await WusoolServices.seedAdmin();
      WusoolUI.message('Local demo admin: admin@wusool.local / WusoolDemo2026!', 'info');
    }
    document.querySelectorAll('[id*=togglePassword],[id*=TogglePassword]').forEach(b => WusoolUI.listen(b, 'click', () => {
      const p = form.querySelector('input[type=password],input[data-password]');
      if (p) {
        p.dataset.password = 'true';
        p.type = p.type === 'password' ? 'text' : 'password';
      }
    }));
    WusoolUI.listen(form, 'submit', async e => {
      e.preventDefault();
      const email = (document.getElementById('email') || form.querySelector('input[type=email]')).value;
      const password = (document.getElementById('password') || form.querySelector('input[type=password],input[data-password]')).value;
      try {
        const a = await WusoolServices.login(email, password, 'Organization');
        location.href = WusoolUI.destination(new URLSearchParams(location.search).get('returnTo'), a.role);
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        const alert = document.getElementById('loginAlert');
        if (alert) {
          alert.textContent = error.message;
          alert.classList.remove('d-none');
        } else WusoolUI.message(error.message);
      }
    });
    const forgot = document.getElementById('forgotPassword');
    if (forgot) WusoolUI.listen(forgot, 'click', async e => {
      e.preventDefault();
      try {
        await WusoolServices.external('auth/recovery', {
          email: form.querySelector('input[type=email]').value
        });
        WusoolUI.message('Recovery request accepted by server.', 'info');
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        WusoolUI.message(error.message);
      }
    });
  });
});
