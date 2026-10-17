WusoolUI.enqueue(async () => {
  WusoolUI.ready(async () => {
    const form = document.getElementById('loginForm') || document.querySelector('form');
    if (WusoolServices.mode === 'local' && 'User' === 'Admin') {
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
        const a = await WusoolServices.login(email, password, 'User');
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
          alert.classList.remove('d-none');
        } else WusoolUI.message(error.message);
      }
    });
    const forgot=document.getElementById('forgotPasswordButton')||document.getElementById('forgotPassword');
    const modal=document.getElementById('forgotPasswordModal'),emailField=document.getElementById('resetEmail'),send=document.getElementById('sendResetButton'),result=document.getElementById('resetMessage');
    if(forgot&&modal&&emailField&&send&&result){
      emailField.required=true;result.setAttribute('role','status');
      WusoolUI.listen(forgot,'click',()=>{emailField.value=form.querySelector('input[type=email]')?.value||'';result.classList.add('d-none');bootstrap.Modal.getOrCreateInstance(modal).show();});
      WusoolUI.listen(send,'click',async()=>{if(!emailField.reportValidity())return;send.disabled=true;try{await WusoolServices.external('auth/recovery',{email:emailField.value.trim()});result.className='alert alert-info mt-3';result.textContent=document.documentElement.lang==='ar'?'استلم الخادم طلب الاستعادة؛ إرسال البريد غير مؤكد بعد.':'Recovery request accepted; email delivery is not yet confirmed.';}catch(error){result.className='alert alert-warning mt-3';result.textContent=error.message;}finally{send.disabled=false;}});
    }

  });
});
