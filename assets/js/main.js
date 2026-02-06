/* File: assets/js/main.js */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     0. Loading Screen & Page Transition
     ========================================================================== */
  const loadingScreen = document.getElementById('loading-screen');
  
  // ページリソース（画像等）を含めて完全に読み込まれたら発火
  window.addEventListener('load', () => {
    // 少しだけ待機して余韻を持たせる（0.6秒）
    setTimeout(() => {
      if(loadingScreen) {
        loadingScreen.classList.add('is-hidden');
      }
    }, 600);
  });

  // 万が一 load イベントが発火しない場合（キャッシュ等）の保険（3秒後に強制解除）
  setTimeout(() => {
    if(loadingScreen && !loadingScreen.classList.contains('is-hidden')) {
      loadingScreen.classList.add('is-hidden');
    }
  }, 3000);

  /* ==========================================================================
     1. Mobile Menu Logic
     ========================================================================== */
  const menuToggle = document.querySelector('.menu-toggle');
  const navOverlay = document.querySelector('.nav-overlay');
  const body = document.body;

  if (menuToggle && navOverlay) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navOverlay.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active'); // animate X
      
      menuToggle.setAttribute('aria-expanded', isOpen);
      
      if (isOpen) {
        body.classList.add('scroll-lock');
      } else {
        body.classList.remove('scroll-lock');
      }
    });

    // Close on link click
    const navLinks = navOverlay.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        navOverlay.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        body.classList.remove('scroll-lock');

        // ローディングアニメーションを再利用してページ遷移（内部リンクのみ）
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http')) {
          e.preventDefault();
          loadingScreen.classList.remove('is-hidden'); // フェードアウト開始
          setTimeout(() => {
            window.location.href = href;
          }, 400);
        }
      });
    });
  }

  /* ==========================================================================
     2. Scroll Reveal
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));

  /* ==========================================================================
     3. Smooth Scroll
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 70 - 40;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
});