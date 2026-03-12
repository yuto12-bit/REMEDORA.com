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
     2. Scroll Reveal (フェードインアニメーション)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  // 発火タイミングの微調整（画面下部から30px入った時点でアニメーション開始）
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 【修正】CSSの定義に合わせてクラス名を 'is-visible' に変更
        entry.target.classList.add('is-visible');
        // 一度発火したら監視を解除してパフォーマンスを確保
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    observer.observe(el);
  });

});

/* ==========================================================================
     3. Contact Form Submission (GAS Integration)
     ========================================================================== */
  const leadForm = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // スパム対策（ハニーポット）チェック
      const honeypot = leadForm.elements['honeypot'].value;
      if (honeypot) {
        // ボットの場合は送信したフリをして終了
        return; 
      }

      // 送信中のUI変更
      submitBtn.disabled = true;
      submitBtn.innerHTML = '送信中...';
      formMessage.textContent = '';
      formMessage.className = 'form-msg';

      const formData = new FormData(leadForm);
      
      // ★ ここにご自身のGASの「ウェブアプリのURL」を貼り付けてください ★
      const gasUrl = 'https://script.google.com/macros/s/AKfycbxJKSC4MENQQbWtCjc7o1dCsQW3S2lFl1Oi-VMxMJaWfKuPOqygkrHe_POBCZf2af-6/exec';

      fetch(gasUrl, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        // ※GASの設定（CORS等）によっては opaque response になる場合がありますが
        // エラーで弾かれなければ成功とみなします。
        formMessage.textContent = '送信が完了しました。担当者よりご連絡いたします。';
        formMessage.classList.add('msg-success');
        leadForm.reset(); // フォームをクリア
      })
      .catch(error => {
        console.error('Error!', error.message);
        formMessage.textContent = '通信エラーが発生しました。時間を置いて再度お試しください。';
        formMessage.classList.add('msg-error');
      })
      .finally(() => {
        // ボタンの状態を元に戻す
        submitBtn.disabled = false;
        submitBtn.innerHTML = '無料診断を申し込む <span class="btn-arrow">→</span>';
      });
    });
  }

  /* ==========================================================================
     4. Glass Panel Accordion Logic
     ========================================================================== */
  const glassHeaders = document.querySelectorAll('.glass-panel-header');

  glassHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isActive = header.classList.contains('is-active');

      // クリックされたものが閉じていた場合のみ開く（複数同時展開も可能にする仕様）
      if (!isActive) {
        header.classList.add('is-active');
        header.setAttribute('aria-expanded', 'true');
        content.classList.add('is-open');
      } else {
        header.classList.remove('is-active');
        header.setAttribute('aria-expanded', 'false');
        content.classList.remove('is-open');
      }
    });
  });