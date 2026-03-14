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

  /* ==========================================================================
     5. Interactive Audit UI (インデックス切り替え)
     ========================================================================== */
  const auditNavBtns = document.querySelectorAll('.audit-nav-btn');
  const auditPanels = document.querySelectorAll('.audit-panel');

  if (auditNavBtns.length > 0) {
    auditNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // 全てのボタンとパネルから is-active を外す
        auditNavBtns.forEach(b => b.classList.remove('is-active'));
        auditPanels.forEach(p => p.classList.remove('is-active'));

        // クリックされたボタンをアクティブにする
        btn.classList.add('is-active');

        // 対応するパネルを表示する
        const targetId = btn.getAttribute('data-target');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('is-active');
        }
      });
    });
  }

  /* ==========================================================================
     6. Comic Strip Observer (横スクロール漫画のコマ監視)
     ========================================================================== */
  const comicPanels = document.querySelectorAll('.comic-panel');
  
  if (comicPanels.length > 0) {
    // セリフのアニメーション用に、テキストをspanで囲む処理を自動実行
    comicPanels.forEach(panel => {
      const dialogue = panel.querySelector('.comic-dialogue');
      if (dialogue) {
        // 元のHTMLを壊さずにアニメーション用のラッパーを挿入
        const text = dialogue.innerHTML;
        dialogue.innerHTML = `<span>${text}</span>`;
      }
    });

    // 画面の「中央」にコマが来たら発火させる設定
    const comicObserverOptions = {
      root: document.getElementById('comicTrack'), // スクロール領域をトラックに限定
      rootMargin: '0px -20% 0px -20%', // 左右から20%内側に入った時を「中央」とみなす
      threshold: 0.5 // コマの半分が見えたら発火
    };

    const comicObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-reading');
          
          // ★追加：現在のページ番号を更新
          const index = Array.from(comicPanels).indexOf(entry.target);
          document.getElementById('comicCurrent').textContent = index + 1;
          document.getElementById('comicTotal').textContent = comicPanels.length;
        } else {
          entry.target.classList.remove('is-reading');
        }
      });
    }, comicObserverOptions);

    // PC表示等のために、bodyのスクロールに対しても保険で監視しておく
    const fallbackObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-reading');
        }
      });
    }, { threshold: 0.5 });

    comicPanels.forEach(panel => {
      comicObserver.observe(panel);
      fallbackObserver.observe(panel);
    });
  }






  /* ==========================================================================
     7. Spec Dashboard UI (仕様書のプラン切り替え) 修正する
     ========================================================================== */
  const specNavBtns = document.querySelectorAll('.spec-nav-btn');
  
  if (specNavBtns.length > 0) {
    specNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // 親の dashboard コンテナを取得（02と03が独立して動くようにするため）
        const dashboard = btn.closest('.spec-dashboard');
        
        // 同じダッシュボード内のボタンとパネルをリセット
        const btns = dashboard.querySelectorAll('.spec-nav-btn');
        const panels = dashboard.querySelectorAll('.spec-panel');
        
        btns.forEach(b => b.classList.remove('is-active'));
        panels.forEach(p => p.classList.remove('is-active'));

        // クリックしたものをアクティブに
        btn.classList.add('is-active');
        const targetId = btn.getAttribute('data-spec');
        const targetPanel = dashboard.querySelector(`#${targetId}`);
        if (targetPanel) {
          targetPanel.classList.add('is-active');
        }
      });
    });
  }

  /* ==============================================
   About Page: Dynamic UX Behaviors (最終版)
============================================== */
document.addEventListener("DOMContentLoaded", () => {
  
  // 1. ステートメント：スクロール進捗によるクロスフェード
  const scrollArea = document.getElementById('statement-scroll-area');
  const stItems = document.querySelectorAll('.js-st-item');
  
  if (scrollArea && stItems.length > 0) {
    window.addEventListener('scroll', () => {
      const rect = scrollArea.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // 親枠のスクロール進捗率を計算（固定前はマイナスの数値になる）
      let progress = -rect.top / (rect.height - windowHeight);
      
      if (progress < 0) {
        // ★固定される前（Heroエリアをスクロール中）はすべて透明にしておく
        stItems.forEach(item => item.classList.remove('is-active'));
      } else {
        // ★ピタッと固定された瞬間（progress >= 0）に表示アニメーションを発火
        progress = Math.min(1, progress);
        const totalItems = stItems.length;
        const activeIndex = Math.min(Math.floor(progress * totalItems), totalItems - 1);
        
        stItems.forEach((item, index) => {
          if (index === activeIndex) {
            item.classList.add('is-active'); 
          } else {
            item.classList.remove('is-active'); 
          }
        });
      }
    });
  }

  // 2. 代表メッセージ：LINE風チャットの時間差ポップイン
  let chatDelayQueue = 0; 
  const chatObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 時間差で発火させる
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, chatDelayQueue);
        
        chatDelayQueue += 600; // 0.6秒（600ms）間隔でゆっくり表示
        chatObserver.unobserve(entry.target);
        
        // スクロールが一通り終わったらキューをリセット
        setTimeout(() => { chatDelayQueue = 0; }, 800); 
      }
    });
  }, {
    rootMargin: "0px 0px -10% 0px", 
    threshold: 0
  });

  document.querySelectorAll('.js-chat-bubble').forEach(bubble => {
    chatObserver.observe(bubble);
  });

});