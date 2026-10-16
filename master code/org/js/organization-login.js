WusoolUI.enqueue(async () => {
  WusoolUI.ready(async () => {
    const form = document.getElementById('organizationLoginForm') || document.querySelector('form');
    if (WusoolServices.mode === 'local' && 'Organization' === 'Admin') {
      await WusoolServices.seedAdmin();
      WusoolUI.message('Local demo admin: admin@wusool.com / WusoolAdmin2026@', 'info');
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
      const email = (document.getElementById('email') || form.querySelector('input[type=email]'))
        .value;
      const password = (
        document.getElementById('password') ||
        form.querySelector('input[type=password],input[data-password]')
      ).value;
      try {
        const a = await WusoolServices.login(email, password, 'Organization');
        if (!(await WusoolUI.completeFirstLogin(a, password))) return;
        location.href = WusoolUI.destination(
          new URLSearchParams(location.search).get('returnTo'),
          a.role,
        );
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        const alert = document.getElementById('loginAlert');
        if (alert) {
          alert.textContent = error.message;
          if (error.code === 'REPRESENTATIVE_REQUIRED') {
            const arabic = document.documentElement.lang === 'ar';
            alert.textContent = arabic
              ? 'هذا البريد غير مرتبط بممثل مخوّل. افتح إعداد الحساب من الأدمن، عيّن حساب المستخدم ممثلًا أساسيًا، ثم أعد تعيين كلمة مرور الممثل وسجّل الدخول ببريده.'
              : 'This email has no authorized representative assignment. In Admin account setup, assign a project user as the primary representative, reset that representative’s password, then sign in with their email.';
            const link = document.createElement('a');
            link.href = '../../admin/html/account-data-review.html?email=' + encodeURIComponent(email.trim());
            link.className = 'btn btn-outline-wusool mt-3';
            link.textContent = arabic ? 'إعداد الحساب — يتطلب دخول الأدمن' : 'Set up account — Admin sign-in required';
            alert.append(document.createElement('br'), link);
          }
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
