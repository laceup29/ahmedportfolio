/* ============================================================
   PORTFOLIO BOOK - Closed → Open → Flip Engine
   ============================================================ */
(function () {
    'use strict';

    var S = {
        opened: false,
        page: 0,
        total: 0,
        anim: false,
        dur: 800,
        touchX: 0
    };

    var D = {};

    function init() {
        D.scene    = document.getElementById('pbScene');
        D.book     = document.getElementById('pbBook3D');
        D.cover    = document.getElementById('pbFrontCover');
        D.controls = document.getElementById('pbControls');
        D.prev     = document.getElementById('pbPrev');
        D.next     = document.getElementById('pbNext');
        D.dots     = document.getElementById('pbDots');
        D.closeBtn = document.getElementById('pbCloseBtn');

        if (!D.book) return;

        D.spreads = D.book.querySelectorAll('.pb-spread');
        S.total = D.spreads.length;

        bindEvents();
    }

    function bindEvents() {
        // Click cover to open
        D.cover.addEventListener('click', openBook);

        // Close button
        if (D.closeBtn) {
            D.closeBtn.addEventListener('click', closeBook);
        }

        // Nav buttons
        D.prev.addEventListener('click', goPrev);
        D.next.addEventListener('click', goNext);

        // Dots
        if (D.dots) {
            D.dots.querySelectorAll('.pb-dot').forEach(function (d) {
                d.addEventListener('click', function () {
                    var idx = parseInt(this.getAttribute('data-p'));
                    if (idx !== S.page) goTo(idx);
                });
            });
        }

        // Keyboard
        document.addEventListener('keydown', function (e) {
            if (!S.opened) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBook(); }
                return;
            }
            if (e.key === 'Escape') { e.preventDefault(); closeBook(); return; }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
        });

        // Touch
        D.book.addEventListener('touchstart', function (e) {
            S.touchX = e.changedTouches[0].screenX;
        }, { passive: true });
        D.book.addEventListener('touchend', function (e) {
            if (!S.opened) return;
            var diff = S.touchX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
        }, { passive: true });

        // Click left/right halves (only when opened)
        D.book.addEventListener('click', function (e) {
            if (!S.opened) return;
            if (e.target.closest('.pb-front-cover')) return;
            var rect = D.book.getBoundingClientRect();
            var x = e.clientX - rect.left;
            x < rect.width / 2 ? goPrev() : goNext();
        });
    }

    /* ════════════════════════════════════════
       OPEN BOOK
       ════════════════════════════════════════ */
    function openBook() {
        if (S.opened) return;
        S.opened = true;

        // Animate cover open
        D.book.classList.add('opening');
        D.book.classList.remove('closing');

        // After cover opens, show first spread
        setTimeout(function () {
            D.spreads[0].classList.add('visible', 'active');
            D.controls.classList.add('show');
            if (D.closeBtn) D.closeBtn.classList.add('show');
            animateBars(D.spreads[0]);
        }, 500);

        // Tilt book flat after open - keep centered
        setTimeout(function () {
            D.book.style.transform = 'rotateX(3deg) rotateY(0deg)';
            D.book.style.transformOrigin = '50% 50%';
            D.book.style.cursor = 'default';
        }, 900);
    }

    /* ════════════════════════════════════════
       CLOSE BOOK
       ════════════════════════════════════════ */
    function closeBook() {
        if (!S.opened || S.anim) return;
        S.anim = true;

        // Hide close button and controls
        if (D.closeBtn) D.closeBtn.classList.remove('show');
        D.controls.classList.remove('show');

        // Hide all spreads
        D.spreads.forEach(function (s) {
            s.classList.remove('active', 'visible');
            s.style.zIndex = '';
            var r = s.querySelector('.pb-right');
            if (r) {
                r.classList.remove('flipping', 'flipping-back');
                r.style.transform = '';
                r.style.transition = '';
                r.style.backfaceVisibility = '';
                r.style.webkitBackfaceVisibility = '';
                r.style.zIndex = '';
            }
        });

        // Add closing class to animate cover back
        D.book.classList.add('closing');
        D.book.classList.remove('opening');

        // After cover closes
        setTimeout(function () {
            D.book.classList.remove('closing');
            D.book.style.transform = 'rotateX(8deg) rotateY(-6deg)';
            D.book.style.transformOrigin = '50% 50%';
            D.book.style.cursor = 'pointer';
            S.opened = false;
            S.page = 0;
            updateUI();
            S.anim = false;
        }, 900);
    }

    /* ════════════════════════════════════════
       FORWARD FLIP
       ════════════════════════════════════════ */
    function goNext() {
        if (S.anim || S.page >= S.total - 1) return;
        S.anim = true;

        var cur = D.spreads[S.page];
        var nxt = D.spreads[S.page + 1];
        var curRight = cur.querySelector('.pb-right');

        // Show next behind current
        nxt.classList.add('visible');
        nxt.style.zIndex = '1';
        cur.style.zIndex = '5';

        // Reset next right
        var nxtR = nxt.querySelector('.pb-right');
        nxtR.style.transition = 'none';
        nxtR.style.transform = 'rotateY(0deg)';
        nxtR.style.backfaceVisibility = 'hidden';
        nxtR.style.webkitBackfaceVisibility = 'hidden';
        void nxtR.offsetWidth;

        // Flip current right away
        curRight.classList.add('flipping');

        setTimeout(function () {
            cur.classList.remove('active');
            cur.style.zIndex = '';
            curRight.classList.remove('flipping');
            curRight.style.transform = '';
            curRight.style.backfaceVisibility = '';
            curRight.style.webkitBackfaceVisibility = '';

            nxt.classList.add('active');
            nxt.style.zIndex = '';

            S.page++;
            updateUI();
            animateBars(nxt);

            setTimeout(function () { S.anim = false; }, 60);
        }, S.dur);
    }

    /* ════════════════════════════════════════
       BACKWARD FLIP
       ════════════════════════════════════════ */
    function goPrev() {
        if (S.anim || S.page <= 0) return;
        S.anim = true;

        var cur = D.spreads[S.page];
        var prv = D.spreads[S.page - 1];
        var curRight = cur.querySelector('.pb-right');
        var prvRight = prv.querySelector('.pb-right');

        // Show previous
        prv.classList.add('visible');
        prv.classList.add('active');

        // Set previous right to flipped position
        prvRight.style.transition = 'none';
        prvRight.style.transform = 'rotateY(-180deg)';
        prvRight.style.backfaceVisibility = 'hidden';
        prvRight.style.webkitBackfaceVisibility = 'hidden';
        prvRight.style.zIndex = '15';
        void prvRight.offsetWidth;

        cur.style.zIndex = '5';

        // Animate previous right back
        prvRight.classList.add('flipping-back');

        setTimeout(function () {
            cur.classList.remove('active');
            cur.style.zIndex = '';
            curRight.style.transform = '';
            curRight.style.backfaceVisibility = '';
            curRight.style.webkitBackfaceVisibility = '';

            prvRight.classList.remove('flipping-back');
            prvRight.style.transform = '';
            prvRight.style.backfaceVisibility = '';
            prvRight.style.webkitBackfaceVisibility = '';
            prvRight.style.zIndex = '';
            prv.style.zIndex = '';

            S.page--;
            updateUI();
            animateBars(prv);

            setTimeout(function () { S.anim = false; }, 60);
        }, S.dur);
    }

    /* ════════════════════════════════════════
       GO TO PAGE
       ════════════════════════════════════════ */
    function goTo(idx) {
        if (idx < 0 || idx >= S.total || idx === S.page) return;

        D.spreads.forEach(function (s, i) {
            s.classList.toggle('visible', i <= idx);
            s.classList.toggle('active', i === idx);
            s.style.zIndex = '';
            var r = s.querySelector('.pb-right');
            if (r) {
                r.classList.remove('flipping', 'flipping-back');
                r.style.transform = '';
                r.style.transition = '';
                r.style.backfaceVisibility = '';
                r.style.webkitBackfaceVisibility = '';
                r.style.zIndex = '';
            }
        });

        S.page = idx;
        updateUI();
        animateBars(D.spreads[idx]);
    }

    /* ════════════════════════════════════════
       UI
       ════════════════════════════════════════ */
    function updateUI() {
        D.prev.disabled = S.page === 0;
        D.next.disabled = S.page === S.total - 1;
        if (D.dots) {
            D.dots.querySelectorAll('.pb-dot').forEach(function (d, i) {
                d.classList.toggle('active', i === S.page);
            });
        }
    }

    /* ════════════════════════════════════════
       SKILL BARS
       ════════════════════════════════════════ */
    function animateBars(spread) {
        if (!spread) return;
        spread.querySelectorAll('.pb-bar-fill').forEach(function (bar) {
            var w = bar.getAttribute('data-w');
            bar.style.setProperty('--tw', w + '%');
            bar.classList.remove('go');
            void bar.offsetWidth;
            bar.classList.add('go');
        });
    }

    /* ── Boot ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PortfolioBook = { open: openBook, close: closeBook, next: goNext, prev: goPrev, goTo: goTo };

})();
