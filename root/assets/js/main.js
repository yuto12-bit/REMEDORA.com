document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --- 1. Navigation Active State --- */
  const setActiveLink = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };
  setActiveLink();

  /* --- 2. Sticky Header --- */
  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* --- 3. Scroll Reveal --- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  /* --- 4. Mobile Menu Fix (Class Toggle Strategy) --- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navOverlay = document.querySelector('.nav-overlay');
  const body = document.body;

  if (menuToggle && navOverlay) {
    menuToggle.addEventListener('click', () => {
      // Toggle Menu
      navOverlay.classList.toggle('is-open');
      const isOpen = navOverlay.classList.contains('is-open');

      // Icon Switch
      menuToggle.textContent = isOpen ? '✕' : '☰';
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');

      // Scroll Lock (CSS class toggle)
      if (isOpen) {
        body.classList.add('scroll-lock');
      } else {
        body.classList.remove('scroll-lock');
      }
    });

    // Close on Link Click
    navOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navOverlay.classList.remove('is-open');
        menuToggle.textContent = '☰';
        body.classList.remove('scroll-lock');
      });
    });
  }
});