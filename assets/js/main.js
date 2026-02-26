/* File: assets/js/main.js */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     0. Loading Screen & bfcache対策
     ========================================================================== */
  const loadingScreen = document.getElementById('loading-screen');
  
  const hideLoadingScreen = () => {
    if (loadingScreen && !loadingScreen.classList.contains('is-hidden')) {
      loadingScreen.classList.add('is-hidden');
      loadingScreen.setAttribute('aria-hidden', 'true');
    }
  };

  // すでに読み込み完了している場合（キャッシュ等）の対応
  if (document.readyState === 'complete') {
    setTimeout(hideLoadingScreen, 200);
  } else {
    window.addEventListener('load', () => {
      setTimeout(hideLoadingScreen, 600);
    });
  }

  // 保険（3秒後に強制解除）
  setTimeout(hideLoadingScreen, 3000);

  // bfcache（ブラウザバック）時のローディング画面残り対策
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      hideLoadingScreen();
    }
  });

  /* ==========================================================================
     1. Mobile Menu Logic
     ========================================================================== */
  const menuToggle = document.querySelector('.menu-toggle');
  // 前回のHTML改修で付与したIDを優先取得、無ければクラスで取得
  const navOverlay = document.getElementById('mobile-menu') || document.querySelector('.nav-overlay');
  const body = document.body;

  if (menuToggle && navOverlay) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navOverlay.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active'); // Xアイコンへのアニメーション
      
      // アクセシビリティ：状態の更新
      menuToggle.setAttribute('aria-expanded', isOpen);
      navOverlay.setAttribute('aria-hidden', !isOpen);
      
      if (isOpen) {
        body.classList.add('scroll-lock');
      } else {
        body.classList.remove('scroll-lock');
      }
    });

    // リンククリック時にメニューを閉じる（ページ遷移はブラウザ標準に任せる）
    const navLinks = navOverlay.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navOverlay.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        body.classList.remove('scroll-lock');

        // 状態のリセット
        menuToggle.setAttribute('aria-expanded', 'false');
        navOverlay.setAttribute('aria-hidden', 'true');
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
        // 一度発火したら監視を解除してパフォーマンスを確保
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));

  /* ==========================================================================
     3. Smooth Scroll
     ※ 厳格監査官の判断：
     CSS側の `scroll-behavior: smooth` および `scroll-margin-top` の設定と
     JSのオフセット計算処理が競合し、二重スクロールのバグを引き起こすため削除しました。
     モダンブラウザではCSSのみで完結させるのがベストプラクティスです。
     ========================================================================== */
});