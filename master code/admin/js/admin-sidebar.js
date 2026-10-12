WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    await loadAdminSidebar();
  });
  const loadAdminSidebar = async () => {
    const sidebarContainer = document.getElementById('adminSidebarContainer');
    if (!sidebarContainer) {
      return;
    }
    try {
      const response = await fetch('../components/admin-sidebar.html');
      if (!response.ok) {
        throw new Error('Admin sidebar could not be loaded.');
      }
      const sidebarHtml = await response.text();
      sidebarContainer.outerHTML = sidebarHtml;
      setActiveAdminLink();
      setupAdminLogout();
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      console.error('Admin sidebar loading error:', error);
    }
  };
  const setActiveAdminLink = () => {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.admin-sidebar .nav-link').forEach((link) => {
      const linkPage = link.getAttribute('href').split('/').pop().split('?')[0];
      const isActive = linkPage === currentPage && (!link.dataset.recruitmentView || link.dataset.recruitmentView === (new URLSearchParams(location.search).get('view')||'overview'));
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };
  const setupAdminLogout = () => {
    const button = document.getElementById('adminLogoutButton');
    WusoolUI.listen(button, 'click', async () => {
      await WusoolServices.logout();

      window.location.href = './admin-login.html';
    });
  };
});
