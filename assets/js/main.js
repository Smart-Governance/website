/* ============================================
   MAIN JAVASCRIPT
   ============================================
   All JavaScript functionality
   ============================================ */

(function() {
  'use strict';

  let inertialEnabled = false;
  let inertialSetTarget = null;
  // expose for other scripts that may need to trigger inertial scrolling
  window.inertialEnabled = inertialEnabled;
  window.inertialSetTarget = inertialSetTarget;

  // ========== Move header CTA into mobile nav on small screens ==========
  function initMobileCtaRelocate() {
    const cta = document.getElementById('sg-appointment-cta');
    const mobileNav = document.querySelector('.sg-mobile-nav');
    const headerSlot = document.querySelector('.sg-header-cta-slot');
    const mobileSlot = document.querySelector('.sg-mobile-cta-slot');
    if (!cta || !mobileNav || !headerSlot || !mobileSlot) return;

    const mq = window.matchMedia('(max-width: 768px)');

    const relocate = () => {
      if (mq.matches) {
        if (cta.parentElement !== mobileSlot) {
          mobileSlot.prepend(cta);
        }
      } else if (cta.parentElement !== headerSlot) {
        headerSlot.appendChild(cta);
      }
    };

    mq.addEventListener('change', relocate);
    relocate();
  }

  // ========== Smooth Scroll for Navigation Links ==========
  function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href*="#"]');
    const normalizePath = (path) => {
      const cleaned = path.replace(/\/index\.html$/i, '/').replace(/\/+$/, '');
      return cleaned === '' ? '/' : cleaned;
    };

    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        if (!href || href === '#') return;

        let url;
        try {
          url = new URL(href, window.location.href);
        } catch (_) {
          return;
        }

        const hash = url.hash;
        if (!hash || hash === '#') return;

        const currentPath = normalizePath(window.location.pathname);
        const targetPath = normalizePath(url.pathname);
        if (url.origin !== window.location.origin || currentPath !== targetPath) {
          return;
        }

        let targetId;
        try {
          targetId = decodeURIComponent(hash.substring(1));
        } catch (_) {
          return;
        }

        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        e.preventDefault();
        if (inertialEnabled && typeof inertialSetTarget === 'function') {
          const header = document.querySelector('.sg-header');
          const offset = header ? header.offsetHeight + 12 : 72;
          const targetY = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
          inertialSetTarget(targetY);
        } else {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ========== Mobile Menu Toggle ==========
  function initMobileMenu() {
    const hamburger = document.querySelector('.sg-hamburger');
    const mobileNav = document.querySelector('.sg-mobile-nav');
    const body = document.body;

    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      this.setAttribute('aria-expanded', !isExpanded);
      this.classList.toggle('sg-hamburger--active');
      mobileNav.classList.toggle('sg-mobile-nav--active');
      body.classList.toggle('sg-menu-open');
    });

    // Close menu when clicking on a link
    const mobileNavLinks = mobileNav.querySelectorAll('.sg-mobile-nav__link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('sg-hamburger--active');
        mobileNav.classList.remove('sg-mobile-nav--active');
        body.classList.remove('sg-menu-open');
      });
    });

    // Close menu when clicking on overlay
    const overlay = document.querySelector('.sg-mobile-nav-overlay');
    if (overlay) {
      overlay.addEventListener('click', function() {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('sg-hamburger--active');
        mobileNav.classList.remove('sg-mobile-nav--active');
        body.classList.remove('sg-menu-open');
      });
    }
  }

  // ========== Explore Services Tabs ==========
  function initExploreServices() {
    const root = document.querySelector('.sg-explore-services');
    if (!root) return;

    const tabs = root.querySelectorAll('.sg-explore-services__tab');
    const panels = root.querySelectorAll('.sg-explore-services__panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');

        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        panels.forEach((panel) => {
          panel.classList.toggle(
            'active',
            panel.getAttribute('data-tab') === target
          );
        });
      });
    });
  }

  // ========== Mosaic Impact Section ==========
  function initMosaicSection() {
    const mosaic = document.querySelector('.sg-mosaic');
    if (!mosaic) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observeTargets = mosaic.querySelectorAll('[data-mosaic-observe]');
    const chartCard = mosaic.querySelector('[data-mosaic-chart]');
    let chartAnimated = false;

    function animateChart(forceImmediate) {
      if (chartAnimated || !chartCard) return;
      chartAnimated = true;

      const columns = mosaic.querySelectorAll('.sg-mosaic__chart-column');
      const duration = forceImmediate ? 0 : 1800;
      const startTime = performance.now();

      columns.forEach((col) => {
        const bar = col.querySelector('.sg-mosaic__chart-bar');
        const percentEl = col.querySelector('.sg-mosaic__chart-percent');
        const target = parseInt(percentEl?.getAttribute('data-target') || '0', 10);

        if (!bar || !percentEl) return;

        const update = (now) => {
          const progress = duration === 0 ? 1 : Math.min((now - startTime) / duration, 1);
          const currentValue = Math.floor(progress * target);
          const barHeight = progress * target;

          percentEl.textContent = `${currentValue}%`;
          bar.style.height = `${barHeight}%`;
          percentEl.style.bottom = `calc(${barHeight}% + 10px)`;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            percentEl.textContent = `${target}%`;
            bar.style.height = `${target}%`;
            percentEl.style.bottom = `calc(${target}% + 10px)`;
          }
        };

        requestAnimationFrame(update);
      });
    }

    if (prefersReducedMotion) {
      observeTargets.forEach((el) => el.classList.add('is-in-view'));
      animateChart(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in-view');

            if (entry.target === chartCard) {
              animateChart();
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    observeTargets.forEach((el) => observer.observe(el));
  }

  // ========== Testimonials Slider ==========
  function initTestimonials() {
    const section = document.querySelector('.sg-testimonial');
    if (!section) return;

    const slides = Array.from(section.querySelectorAll('.sg-testimonial__slide'));
    if (!slides.length) return;

    let current = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
      });
    }

    function go(dir) {
      current = (current + dir + slides.length) % slides.length;
      showSlide(current);
    }

    const prevBtn = section.querySelector('.sg-testimonial__prev');
    const nextBtn = section.querySelector('.sg-testimonial__next');

    prevBtn?.addEventListener('click', () => go(-1));
    nextBtn?.addEventListener('click', () => go(1));
  }

  // ========== Clients Metrics (scrolly cards) ==========
  function initClientsMetrics() {
    const section = document.querySelector('.sg-clients');
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.sg-clients__card'));
    const summaryLayer = section.querySelector('.sg-clients__summary-layer');
    if (!cards.length || !summaryLayer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function disableAnimation() {
      cards.forEach((card) => {
        card.style.transform = 'none';
      });
      summaryLayer.classList.add('is-visible');
    }

    if (prefersReducedMotion || window.innerWidth <= 900) {
      disableAnimation();
      return;
    }

    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    function recalc() {
      const rect = section.getBoundingClientRect();
      viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      sectionTop = window.scrollY + rect.top;
      sectionHeight = rect.height;
    }

    recalc();
    window.addEventListener('resize', recalc);

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    function update() {
      const scrollY = window.scrollY || window.pageYOffset;

      const start = sectionTop;
      const end = sectionTop + sectionHeight - viewportHeight;
      let progress = 0;

      if (end > start) {
        progress = (scrollY - start) / (end - start);
      }
      progress = Math.max(0, Math.min(1, progress));

      const totalCards = cards.length;
      const animatedCards = totalCards - 1;
      const segmentSize = 1 / (animatedCards + 1);
      const translateFrom = viewportHeight * 1.2;

      cards.forEach((card, index) => {
        if (index === 0) {
          card.style.transform = 'translateY(0px)';
          return;
        }

        const idx = index - 1;
        const segStart = segmentSize * idx;
        const segEnd = segStart + segmentSize * 0.9;

        let t = (progress - segStart) / (segEnd - segStart);
        t = Math.max(0, Math.min(1, t));

        const offset = (1 - t) * translateFrom;
        card.style.transform = `translateY(${offset}px)`;
      });

      const animatedCardsCount = totalCards - 1;
      const summaryStart = segmentSize * animatedCardsCount;
      let s = (progress - summaryStart) / (1 - summaryStart);
      s = Math.max(0, Math.min(1, s));

      if (s > 0.1) {
        summaryLayer.classList.add('is-visible');
      } else {
        summaryLayer.classList.remove('is-visible');
      }

      ticking = false;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  // ========== About Strategy Accordion ==========
  function initAboutAccordion() {
    const accordion = document.querySelector('.sg-about-strategy__accordion');
    if (!accordion) return;

    const items = accordion.querySelectorAll('.sg-about-strategy__item');

    items.forEach((item) => {
      const header = item.querySelector('.sg-about-strategy__header');
      header?.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        items.forEach((i) => {
          i.classList.remove('is-open');
          const icon = i.querySelector('.sg-about-strategy__header .icon');
          if (icon) icon.textContent = '+';
        });

        if (!isOpen) {
          item.classList.add('is-open');
          const icon = item.querySelector('.sg-about-strategy__header .icon');
          if (icon) icon.textContent = '–';
        }
      });
    });
  }

  function initLanguageSwitcher() {
  }

  // ========== About Section Animation ==========
  function initAboutAnimation() {
    const section = document.querySelector('.sg-about-strategy');
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      section.classList.add('is-in-view');
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('is-in-view');
            obs.unobserve(section);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
  }

  // ========== Solution Section Animation ==========
  function initSolutionAnimation() {
    const section = document.querySelector('.sg-solution');
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      section.classList.add('is-in-view');
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('is-in-view');
            obs.unobserve(section);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
  }

  // ========== Testimonials Animation ==========
  function initTestimonialsAnimation() {
    const section = document.querySelector('.sg-testimonial');
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      section.classList.add('is-in-view');
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('is-in-view');
            obs.unobserve(section);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
  }

  // ========== Trusted Section Animation ==========
  function initTrustedAnimation() {
    const trusted = document.querySelector('.sg-trusted');
    if (!trusted) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      trusted.classList.add('is-in-view');
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trusted.classList.add('is-in-view');
            obs.unobserve(trusted);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(trusted);
  }

  // ========== Explore Services Animation ==========
  function initExploreAnimation() {
    const section = document.querySelector('.sg-explore-services');
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      section.classList.add('is-in-view');
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('is-in-view');
            obs.unobserve(section);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
  }

  // ========== Services Section Animation ==========
  function initServicesAnimation() {
    const services = document.querySelector('.sg-services');
    if (!services) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      services.classList.add('is-in-view');
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            services.classList.add('is-in-view');
            obs.unobserve(services);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(services);
  }

  // ========== Inertial Scroll (desktop) ==========
  function initInertialScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (prefersReducedMotion || isTouch) return;

    const smoothTime = 0.25;   // seconds
    const friction = 7.0;      // 1/second
    const maxVelocity = 6500;  // px/second cap
    const wheelMultiplier = 1.10;

    let current = window.pageYOffset;
    let target = current;
    let velocity = 0;
    let rafId = null;
    let lastTime = performance.now();

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    function syncToScroll() {
      // Keep internal state aligned with actual scroll when inertia isn't running
      if (!rafId) {
        current = window.pageYOffset;
        target = current;
      }
    }

    function step(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.033); // seconds, capped
      lastTime = now;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      target = clamp(target, 0, maxScroll);

      const alpha = 1 - Math.exp(-dt / smoothTime);
      const prev = current;
      current += (target - current) * alpha;

      velocity = (current - prev) / dt;
      const decay = Math.exp(-friction * dt);
      velocity = clamp(velocity * decay, -maxVelocity, maxVelocity);

      window.scrollTo(0, current);

      if (Math.abs(target - current) > 0.5 || Math.abs(velocity) > 1) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = null;
      }
    }

    function kick() {
      if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(step);
      }
    }

    function onWheel(e) {
      if (e.ctrlKey) return; // allow zoom
      const delta = (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * wheelMultiplier;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      target = clamp(target + delta, 0, maxScroll);
      e.preventDefault();
      kick();
    }

    function setTarget(y) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      target = clamp(y, 0, maxScroll);
      kick();
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', syncToScroll, { passive: true });
    inertialEnabled = true;
    inertialSetTarget = setTarget;
    window.inertialEnabled = true;
    window.inertialSetTarget = setTarget;
  }

  // ========== Time Hero Animation ==========
  function initTimeHeroAnimation() {
    const timeHero = document.querySelector('.sg-time-hero');
    if (!timeHero) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      timeHero.classList.add('is-in-view');
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeHero.classList.add('is-in-view');
            obs.unobserve(timeHero);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(timeHero);
  }

  // ========== Initialize on DOM Ready ==========
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    initSmoothScroll();
    initMobileMenu();
    initExploreServices();
    initMosaicSection();
    initClientsMetrics();
    initTestimonials();
    initTestimonialsAnimation();
    initAboutAccordion();
    initAboutAnimation();
    initSolutionAnimation();
    initTrustedAnimation();
    initServicesAnimation();
    initTimeHeroAnimation();
    initExploreAnimation();
    initInertialScroll();
    initMobileCtaRelocate();
    initLanguageSwitcher();
  }

  // Start initialization
  init();
})();

