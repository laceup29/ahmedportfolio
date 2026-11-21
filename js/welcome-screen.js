/* ============================================
   WELCOME SCREEN - PREMIUM DESIGN
   ============================================ */

(function () {
    'use strict';

    const CONFIG = {
        SHOW_DELAY: 300,
        LINE1_DELAY: 500,
        LINE2_DELAY: 900,
        DIVIDER_DELAY: 1300,
        LOADING_DELAY: 1700,
        PROGRESS_DURATION: 3000,
        AUTO_EXIT_DELAY: 5500,
        PARTICLE_COUNT: 25,
    };

    let isExiting = false;

    document.addEventListener('DOMContentLoaded', () => {
        const screen = document.getElementById('welcome-screen');
        if (!screen) return;

        document.body.style.overflow = 'hidden';

        // Elements
        const badge = document.getElementById('welcomeBadge');
        const line1 = document.getElementById('welcomeLine1');
        const line2 = document.getElementById('welcomeLine2');
        const divider = document.getElementById('welcomeDivider');
        const loading = document.getElementById('welcomeLoading');
        const progressBar = document.getElementById('welcomeProgressBar');
        const skipBtn = document.getElementById('welcomeSkip');
        const corners = document.querySelectorAll('.welcome-corner');
        const particlesContainer = document.getElementById('welcomeParticles');

        // Create particles
        createParticles(particlesContainer, CONFIG.PARTICLE_COUNT);

        // Animate in sequence
        setTimeout(() => badge?.classList.add('visible'), CONFIG.SHOW_DELAY);
        setTimeout(() => line1?.classList.add('visible'), CONFIG.LINE1_DELAY);
        setTimeout(() => line2?.classList.add('visible'), CONFIG.LINE2_DELAY);
        setTimeout(() => divider?.classList.add('visible'), CONFIG.DIVIDER_DELAY);
        setTimeout(() => {
            loading?.classList.add('visible');
            corners.forEach(c => c.classList.add('visible'));
            skipBtn?.classList.add('visible');
            animateProgress(progressBar, CONFIG.PROGRESS_DURATION);
        }, CONFIG.LOADING_DELAY);

        // Auto exit
        setTimeout(() => {
            if (!isExiting) exitScreen(screen);
        }, CONFIG.AUTO_EXIT_DELAY);

        // Skip button
        skipBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isExiting) exitScreen(screen);
        });

        // Click to skip
        screen.addEventListener('click', () => {
            if (!isExiting) exitScreen(screen);
        });
    });

    /* ---- Exit Screen ---- */
    function exitScreen(screen) {
        if (isExiting) return;
        isExiting = true;

        screen.classList.add('hidden');
        document.body.style.overflow = '';

        setTimeout(() => {
            screen.remove();
        }, 1000);
    }

    /* ---- Animate Progress Bar ---- */
    function animateProgress(bar, duration) {
        if (!bar) return;
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percent = Math.min((progress / duration) * 100, 100);
            bar.style.width = percent + '%';

            if (progress < duration) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    /* ---- Create Particles ---- */
    function createParticles(container, count) {
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'welcome-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (5 + Math.random() * 5) + 's';
            container.appendChild(particle);
        }
    }

})();
