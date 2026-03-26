// ABERIA v4 — Main JavaScript
// FadeIn, Reveal, Scroll-Reveal, Whisper animations, ProductMock auto-cycling, Nav scroll, Mobile nav, Language switch

(function () {
  'use strict';

  // ─── FadeIn: IntersectionObserver ───
  // Elements with [data-fadein] get .is-visible when scrolled into view
  var fadeEls = document.querySelectorAll('[data-fadein]');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Apply delay if specified
          var delay = entry.target.getAttribute('data-fadein-delay');
          var y = entry.target.getAttribute('data-fadein-y');
          if (delay) {
            entry.target.style.transitionDelay = delay + 's';
          }
          if (y) {
            entry.target.style.setProperty('--fadein-y', y + 'px');
          }
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    fadeEls.forEach(function (el) {
      // Set custom translateY if specified
      var y = el.getAttribute('data-fadein-y');
      if (y) {
        el.style.transform = 'translateY(' + y + 'px)';
      }
      fadeObserver.observe(el);
    });
  } else {
    // Fallback: just show everything
    fadeEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ─── Reveal: IntersectionObserver (product/about pages) ───
  // Elements with .reveal get .visible when scrolled into view
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: just show everything
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ─── Scroll-Reveal: IntersectionObserver (v4 system) ───
  // Elements with .scroll-reveal or .whisper-text get .visible when scrolled into view
  var scrollRevealEls = document.querySelectorAll('.scroll-reveal, .whisper-text');
  if (scrollRevealEls.length > 0 && 'IntersectionObserver' in window) {
    var scrollRevealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    scrollRevealEls.forEach(function (el) {
      scrollRevealObserver.observe(el);
    });
  } else {
    // Fallback: just show everything
    scrollRevealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ─── Product Mock Auto-cycling ───
  var mockEl = document.getElementById('product-mock');
  if (mockEl) {
    var steps = mockEl.querySelectorAll('[data-mock-step]');
    var cursor = document.getElementById('mock-cursor');
    var currentStep = -1;
    var totalSteps = 4;

    function advanceMock() {
      currentStep = (currentStep + 1) % totalSteps;
      steps.forEach(function (step) {
        var idx = parseInt(step.getAttribute('data-mock-step'), 10);
        if (idx <= currentStep) {
          step.classList.remove('product-mock__step--hidden');
          step.classList.add('product-mock__step--visible');
        } else {
          step.classList.remove('product-mock__step--visible');
          step.classList.add('product-mock__step--hidden');
        }
      });
      // Show cursor only when all steps visible
      if (cursor) {
        cursor.style.opacity = currentStep === 3 ? '1' : '0';
      }
    }

    // Start cycling
    advanceMock(); // show first step immediately
    setInterval(advanceMock, 2800);
  }

  // ─── Nav Scroll Effect ───
  var siteNav = document.getElementById('site-nav');
  if (siteNav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        siteNav.classList.add('is-scrolled');
      } else {
        siteNav.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  // ─── Mobile Nav ───
  var hamburger = document.querySelector('.nav__hamburger');
  var mobileNav = document.getElementById('mobile-nav');
  var closeBtn = mobileNav ? mobileNav.querySelector('.mobile-nav-overlay__close') : null;

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMobileNav);
  if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('is-open')) {
      closeMobileNav();
    }
  });

  // ─── Language Switch ───
  // Detect base path (e.g. '/aberia-website/' on GitHub Pages, '/' on server)
  var scriptEl = document.querySelector('script[src*="main.js"]');
  var basePath = '/';
  if (scriptEl) {
    var src = scriptEl.getAttribute('src');
    var idx = src.indexOf('js/main.js');
    if (idx > 0) basePath = src.substring(0, idx);
  }

  var langMap = {
    '': 'fr/',
    'product': 'fr/produit',
    'pricing': 'fr/tarifs',
    'the-current': 'fr/le-courant',
    'about': 'fr/a-propos',
  };

  var reverseLangMap = {};
  for (var en in langMap) {
    if (langMap.hasOwnProperty(en)) {
      reverseLangMap[langMap[en]] = en;
    }
  }

  // Strip base path and trailing slash to get the route segment
  function getRoute(pathname) {
    var route = pathname;
    if (basePath !== '/' && route.startsWith(basePath)) {
      route = route.substring(basePath.length);
    } else if (route.startsWith('/')) {
      route = route.substring(1);
    }
    return route.replace(/\/$/, '');
  }

  document.querySelectorAll('[data-lang-switch]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var targetLang = this.getAttribute('data-lang-switch');
      var route = getRoute(window.location.pathname);

      localStorage.setItem('aberia-lang', targetLang);

      var targetRoute;
      if (targetLang === 'fr') {
        targetRoute = langMap[route] || 'fr/';
      } else {
        targetRoute = reverseLangMap[route] || '';
      }

      window.location.href = basePath + targetRoute;
    });
  });

  // ─── Language redirect on return visit ───
  var storedLang = localStorage.getItem('aberia-lang');
  var currentRoute = getRoute(window.location.pathname);
  var isFrench = currentRoute.startsWith('fr');

  if (storedLang === 'fr' && !isFrench) {
    var frRoute = langMap[currentRoute];
    if (frRoute !== undefined) {
      window.location.replace(basePath + frRoute);
    }
  } else if (storedLang === 'en' && isFrench) {
    var enRoute = reverseLangMap[currentRoute];
    if (enRoute !== undefined) {
      window.location.replace(basePath + enRoute);
    }
  }
})();
