"use strict";

/* ========================================
   Wusool Home Page JavaScript
======================================== */
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const citySelect = document.getElementById("citySelect");
  const accessibilityNeed = document.getElementById("accessibilityNeed");

  /* ========================================
     Home Status Message
  ======================================== */

  const showHomeMessage = (message, type = "success") => {
    const oldMessage = document.getElementById("homeMessage");
    if (oldMessage) {
      oldMessage.remove();
    }
    const messageElement = document.createElement("div");
    messageElement.id = "homeMessage";
    messageElement.className = `alert alert-${type} ` + "position-fixed bottom-0 start-50 " + "translate-middle-x mb-4 shadow-lg";
    messageElement.style.zIndex = "9999";
    messageElement.style.minWidth = "300px";
    messageElement.style.textAlign = "center";
    messageElement.setAttribute("role", "status");
    messageElement.setAttribute("aria-live", "polite");
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => {
      messageElement.remove();
    }, 3500);
  };

  /* ========================================
     Search Form
  ======================================== */

  WusoolUI.listen(searchForm, "submit", async event => {
    event.preventDefault();
    const searchValue = searchInput.value.trim();
    const selectedCity = citySelect.value;
    const selectedNeed = accessibilityNeed.value;
    if (searchValue === "") {
      showHomeMessage("Please enter a place or service.", "warning");
      searchInput.focus();
      return;
    }
    const searchData = {
      query: searchValue,
      city: selectedCity,
      accessibilityNeed: selectedNeed
    };
    await WusoolServices.rawWrite("wusool-search", JSON.stringify(searchData));
    showHomeMessage(`Searching for ${searchValue}` + `${selectedCity ? ` in ${selectedCity}` : ""}.`);
    window.location.href = `./accessibility-map.html?search=${encodeURIComponent(searchValue)}`;
  });

  /* ========================================
     Smooth Scrolling
  ======================================== */

  const pageLinks = document.querySelectorAll('a[href^="#"]');
  pageLinks.forEach(link => {
    WusoolUI.listen(link, "click", event => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }
      const targetSection = document.querySelector(targetId);
      if (!targetSection) {
        return;
      }
      event.preventDefault();
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  /* ========================================
     Close Mobile Navbar
  ======================================== */

  const navbarLinks = document.querySelectorAll("#mainNavbar .nav-link");
  const navbarCollapse = document.getElementById("mainNavbar");
  navbarLinks.forEach(link => {
    WusoolUI.listen(link, "click", () => {
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        const bootstrapCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
        bootstrapCollapse.hide();
      }
    });
  });

  /* ========================================
     Active Navbar Link
  ======================================== */

  const sections = document.querySelectorAll("main section[id]");
  const navigationLinks = document.querySelectorAll(".main-navbar .nav-link");
  const updateActiveNavigation = () => {
    let currentSection = "";
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - 180;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute("id");
      }
    });
    navigationLinks.forEach(link => {
      link.classList.remove("active");
      const linkTarget = link.getAttribute("href");
      if (currentSection && linkTarget === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
    if (window.scrollY < 300) {
      navigationLinks.forEach(link => {
        link.classList.remove("active");
      });
      const homeLink = document.querySelector('.main-navbar a[href="home.html"]');
      homeLink?.classList.add("active");
    }
  };
  WusoolUI.listen(window, "scroll", updateActiveNavigation);

  /* ========================================
     Card Animation
  ======================================== */

  /* ========================================
     Store Last Visit
  ======================================== */


});

WusoolUI.ready(async()=>{
 const grid=document.querySelector('#featuredPlaces .row');if(!grid)return;
 const places=(await WusoolServices.places()).items;
 const rated=await WusoolServices.highestRatedPlaces(3);
 const featured=rated.length?rated:places.slice().sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id)).slice(0,3);
 WusoolUI.html(grid,featured.map(p=>`<div class="col-md-6 col-xl-4"><article class="place-card wusool-card position-relative h-100"><div class="place-image place-image-one"><span class="place-score">${p.score}%</span><span class="verified-place">${WusoolUI.escape(p.scoreDescription)}</span></div><div class="p-4"><h3><a class="stretched-link place-title-link" href="./place-details.html?id=${encodeURIComponent(p.id)}">${WusoolUI.escape(p.name)}</a></h3><p class="text-secondary">${WusoolUI.escape(p.category)} · ${WusoolUI.escape(p.city)}</p><p>${p.reviewCount?p.rating.toFixed(1)+' / 5 · '+p.reviewCount+' moderated reviews':'No moderated reviews yet'}</p></div></article></div>`).join('')||'<p>No published branches yet.</p>');
});
