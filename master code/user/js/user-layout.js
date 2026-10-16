'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const getAuthenticatedUser = async () => {
      try {
        return JSON.parse(await WusoolServices.rawRead('wusoolDemoUser'));
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        await WusoolServices.rawRemove('wusoolDemoUser');
        return null;
      }
    };
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser) {
      window.location.replace('../../visitor/html/login.html');
      return;
    }
    const currentPage = window.location.pathname.split('/').pop() || 'user-dashboard.html';
    const userName =
      authenticatedUser.name ||
      authenticatedUser.fullName ||
      (await WusoolServices.rawRead('wusool-user-name')) ||
      'User';
    const activePageMap = {
      'user-place-details.html': 'explore-places.html',
      'community-reviews.html': 'explore-places.html',
      'ai-accessibility-report.html': 'explore-places.html',
      'my-visits.html': 'my-tickets.html',
      'plan-visit.html': 'my-tickets.html',
      'visit-summary.html': 'my-tickets.html',
      'visit-details.html': 'my-tickets.html',
      'analyze-surroundings.html': 'my-tickets.html',
      'navigation-guidance.html': 'my-tickets.html',
      'navigation-complete.html': 'my-tickets.html',
      'write-review.html': 'my-reviews.html',
      'report-accessibility-issue.html': 'my-reports.html',
    };
    const activePage = currentPage === 'recruitment.html' ? ((new URLSearchParams(location.search).get('view')||'vacancies')==='vacancies' ? 'recruitment.html' : 'recruitment-'+new URLSearchParams(location.search).get('view')) : activePageMap[currentPage] || currentPage;
    const navigationGroups = [
      {label: document.documentElement.lang === 'ar' ? 'التوظيف' : 'RECRUITMENT',links: [
        {href:'./recruitment.html',page:'recruitment.html',icon:'bi-briefcase',en:'Recruitment',ar:'التوظيف',text:document.documentElement.lang==='ar'?'التوظيف':'Recruitment'}]},
      {
        label: 'MAIN',
        links: [
          {
            href: './user-dashboard.html',
            page: 'user-dashboard.html',
            icon: 'bi-grid',
            text: 'Dashboard',
          },
          {
            href: './explore-places.html',
            page: 'explore-places.html',
            icon: 'bi-map',
            text: 'Explore Places',
          },
          {
            href: './my-tickets.html',
            page: 'my-tickets.html',
            text: document.documentElement.lang === 'ar' ? 'تذاكري' : 'My Tickets',
            icon: 'bi-ticket-perforated',
          },
          {
            href: './saved-places.html',
            page: 'saved-places.html',
            icon: 'bi-bookmark-heart',
            text: 'Saved Places',
          },
        ],
      },
      {
        label: 'DISCOVER',
        links: [
          {
            href: './compare-places.html',
            page: 'compare-places.html',
            icon: 'bi-columns-gap',
            text: 'Compare Places',
          },
          {
            href: './smart-recommendations.html',
            page: 'smart-recommendations.html',
            icon: 'bi-stars',
            text: 'Recommendations',
          },
          {
            href: './add-place.html',
            page: 'add-place.html',
            icon: 'bi-geo-alt',
            text: 'Suggest a Place',
          },
        ],
      },
      {
        label: 'ACTIVITY',
        links: [
          {
            href: './my-reviews.html',
            page: 'my-reviews.html',
            icon: 'bi-star',
            text: 'My Reviews',
          },
          {
            href: './my-reports.html',
            page: 'my-reports.html',
            icon: 'bi-flag',
            text: 'My Reports',
          },
          {
            href: './notifications.html',
            page: 'notifications.html',
            icon: 'bi-bell',
            text: 'Notifications',
          },
        ],
      },
      {
        label: 'ACCOUNT',
        links: [
          {
            href: './user-profile.html',
            page: 'user-profile.html',
            icon: 'bi-person',
            text: 'Profile & CV',
          },
          {
            href: './accessibility-preferences.html',
            page: 'accessibility-preferences.html',
            icon: 'bi-universal-access',
            text: 'Accessibility',
          },
          {
            href: './account-settings.html',
            page: 'account-settings.html',
            icon: 'bi-gear',
            text: 'Settings',
          },
          {
            href: './help-support.html',
            page: 'help-support.html',
            icon: 'bi-question-circle',
            text: 'Help & Support',
          },
        ],
      },
    ];
    const createNavigation = () => {
      return navigationGroups
        .map((group) => {
          const links = group.links
            .map((link) => {
              const isActive = link.page === activePage;
              return `
              <a
                class="user-sidebar-link${isActive ? ' active' : ''}"
                href="${link.href}"
                ${isActive ? 'aria-current="page"' : ''}
              >
                <i class="bi ${link.icon}" aria-hidden="true"></i>
                <span ${link.en?`data-wusool-en="${link.en}" data-wusool-ar="${link.ar}"`:""}>${link.text}</span>
              </a>
            `;
            })
            .join('');
          return `
          <section class="user-sidebar-group" aria-label="${group.label}">
            <p class="user-sidebar-label">${group.label}</p>
            <nav class="user-sidebar-nav">${links}</nav>
          </section>
        `;
        })
        .join('');
    };
    // Unified customer portal navigation, shared by all authenticated User pages.
    const nav = document.createElement('header');
    nav.className = 'wsp-global-nav';
    const arabic = (document.documentElement.lang || 'en').toLowerCase().startsWith('ar');
    const labels = arabic ? ['الرئيسية','المؤسسات والخدمات','الخريطة','حجوزاتي','المفضلة','المزيد','الدعم','حسابي','تسجيل الخروج','فتح قائمة التنقل'] : ['Home','Institutions & Services','Map','My Bookings','Favorites','More','Support','Account','Log out','Open navigation'];
    const entries = [
      ['user-dashboard.html',labels[0]],['service-directory.html',labels[1]],['explore-places.html',labels[2]],['my-tickets.html',labels[3]],['saved-places.html',labels[4]]
    ];
    const moreEntries = [
      ['my-visits.html',arabic?'زياراتي':'My visits'],
      ['my-reviews.html',arabic?'تقييماتي':'My reviews'],
      ['my-reports.html',arabic?'تقاريري':'My reports'],
      ['notifications.html',arabic?'الإشعارات':'Notifications'],
      ['compare-places.html',arabic?'مقارنة المؤسسات':'Compare places'],
      ['smart-recommendations.html',arabic?'الاقتراحات':'Recommendations'],
      ['recruitment.html',arabic?'التوظيف':'Recruitment'],
      ['accessibility-preferences.html',arabic?'إمكانية الوصول':'Accessibility'],
      ['account-settings.html',arabic?'الإعدادات':'Settings']
    ];
    const linkMarkup = (items) => items.map(([page, title]) => `<a href="./${page}" data-page="${page}">${title}</a>`).join('');
    nav.innerHTML = `<a class="wsp-global-brand" href="./user-dashboard.html"><i class="bi bi-universal-access" aria-hidden="true"></i><span>${arabic?'وصول':'Wusool'} <small>WUSOOL</small></span></a>
      <button class="wsp-global-toggle" type="button" aria-label="${labels[9]}" aria-expanded="false" aria-controls="wspGlobalLinks"><i class="bi bi-list" aria-hidden="true"></i></button>
      <nav class="wsp-global-links" id="wspGlobalLinks" aria-label="${arabic?'تنقل المستخدم':'User navigation'}">
      ${linkMarkup(entries)}
      <details class="wsp-global-more"><summary>${labels[5]}</summary><div class="wsp-global-more-items">${linkMarkup(moreEntries)}</div></details>
      <a href="./help-support.html" data-page="help-support.html">${labels[6]}</a>
      <a href="./user-profile.html" data-page="user-profile.html"><i class="bi bi-person-circle" aria-hidden="true"></i> ${labels[7]}</a>
      <button type="button" class="wsp-global-logout" id="logoutUserButton">${labels[8]}</button>
      </nav>`;
    document.body.classList.add('wsp-unified-layout');
    document.body.classList.remove('user-sidebar-layout');
    const oldNav = document.querySelector('.main-navbar');
    if (oldNav) { const header = oldNav.closest('header'); if (header) header.remove(); else oldNav.remove(); }
    document.body.insertBefore(nav, document.body.firstChild);
    const menuButton = nav.querySelector('.wsp-global-toggle');
    const menu = nav.querySelector('.wsp-global-links');
    const closeMenu = () => { menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); nav.querySelectorAll('details').forEach(item=>item.open=false); };
    WusoolUI.listen(menuButton,'click',()=>{const open=menu.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));});
    WusoolUI.listen(document,'keydown',e=>{if(e.key==='Escape')closeMenu();});
    menu.querySelectorAll('a').forEach(link=>{if(link.dataset.page===activePage || (link.dataset.page==='service-directory.html' && currentPage==='organization-services.html'))link.setAttribute('aria-current','page'); WusoolUI.listen(link,'click',closeMenu);});
    const logoutButton = nav.querySelector('#logoutUserButton');
    WusoolUI.listen(logoutButton, 'click', async () => {
      await WusoolServices.logout();
      window.location.href = '../../visitor/html/home.html';
    });
  });
});
