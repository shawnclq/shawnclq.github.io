(function () {
  'use strict';

  const header = document.getElementById('site-header');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const sections = document.querySelectorAll('main section[id]');

  // ------------------------------------------------------------------
  // 1. Frosted glass header
  //    Adds/removes .scrolled on #site-header based on scroll position.
  // ------------------------------------------------------------------
  function updateHeader() {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // ------------------------------------------------------------------
  // 2. Active nav link highlighting via IntersectionObserver
  //    Marks a .nav-link as .active when its target section enters the
  //    viewport. The rootMargin top offset (-80px) accounts for the
  //    fixed header; the bottom offset keeps "active" stable while
  //    reading a section.
  // ------------------------------------------------------------------
  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -50% 0px',
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          const isActive = link.getAttribute('href') === '#' + id;
          link.classList.toggle('active', isActive);
        });
      }
    });
  }, observerOptions);

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // ------------------------------------------------------------------
  // 3. Mobile menu toggle
  // ------------------------------------------------------------------
  function openMenu() {
    mobileMenu.classList.remove('hidden');
    iconOpen.classList.add('hidden');
    iconClose.classList.remove('hidden');
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileMenu.classList.add('hidden');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }

  mobileMenuToggle.addEventListener('click', function () {
    if (mobileMenu.classList.contains('hidden')) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  // Close mobile menu when a link is tapped
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close mobile menu on resize to md+ (768px)
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  });

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // Run once on load (handles deep-link page loads)

})();
