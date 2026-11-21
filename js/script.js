/* ============================================
   MUHAMMAD AHMED - PORTFOLIO JavaScript
   Interactivity, Filters, Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // THEME TOGGLE (Dark / Light)
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        htmlEl.classList.add('light-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            htmlEl.classList.toggle('light-theme');
            const isLight = htmlEl.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // ============================================
    // MOBILE NAVIGATION TOGGLE
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when a link is clicked
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ============================================
    // ACTIVE NAVIGATION LINK ON SCROLL
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // ============================================
    // PORTFOLIO FILTER
    // ============================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            applyFilter(filter);
        });
    });

    function applyFilter(filter) {
        portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                item.classList.remove('hidden');
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    item.classList.add('hidden');
                }, 300);
            }
        });
    }

    // Apply default filter on load (ALL)
    applyFilter('all');

    // ============================================
    // SKILL CHARTS ANIMATION (Circular Donut)
    // ============================================
    const skillRings = document.querySelectorAll('.skill-ring-fill');
    let skillsAnimated = false;

    function animateSkills() {
        if (skillsAnimated) return;

        const skillsSection = document.getElementById('skills');
        if (!skillsSection) return;

        const rect = skillsSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;

        if (isVisible) {
            skillsAnimated = true;
            const circumference = 2 * Math.PI * 50; // r=50

            skillRings.forEach((ring, index) => {
                const percent = parseInt(ring.getAttribute('data-percent'));
                const offset = circumference - (circumference * percent / 100);

                setTimeout(() => {
                    ring.style.strokeDashoffset = offset;
                }, 150 + (index * 100));
            });
        }
    }

    window.addEventListener('scroll', animateSkills);
    animateSkills(); // Check on load

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    function addFadeInClasses() {
        const elements = document.querySelectorAll(
            '.resume-card, .blog-card, .portfolio-item, .contact-item, .about-content, .testimonial-card, .certificate-card, .tech-skill-card'
        );

        elements.forEach(el => {
            el.classList.add('fade-in');
        });
    }

    function revealElements() {
        const elements = document.querySelectorAll('.fade-in');
        const serviceRows = document.querySelectorAll('.service-row');

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 80;

            if (isVisible) {
                el.classList.add('visible');
            }
        });

        serviceRows.forEach(row => {
            const rect = row.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 60;

            if (isVisible) {
                row.classList.add('visible');
            }
        });
    }

    addFadeInClasses();
    window.addEventListener('scroll', revealElements);
    revealElements(); // Check on load

    // ============================================
    // CONTACT FORM HANDLING
    // ============================================
    const contactForm = document.getElementById('contactForm');
    const CONTACT_API = (typeof CONFIG !== 'undefined' ? CONFIG.BACKEND_URL : '') + '/api/contact';

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // Simple validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // Submit form
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'SENDING...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(CONTACT_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        subject: subject,
                        message: message
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Server error');
                }

                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                contactForm.reset();
                showNotification(data.message || 'Message sent successfully! Thank you for reaching out.', 'success');
            } catch (error) {
                console.error('Form submission error:', error);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                showNotification(error.message || 'Something went wrong. Please try again later.', 'error');
            }
        });
    }

    // ============================================
    // NOTIFICATION SYSTEM
    // ============================================
    function showNotification(message, type) {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '90px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: '10000',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            animation: 'slideIn 0.3s ease',
            maxWidth: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            background: type === 'success' ? '#1a3a1a' : '#3a1a1a',
            border: `1px solid ${type === 'success' ? '#4caf50' : '#f44336'}`,
            color: type === 'success' ? '#4caf50' : '#f44336'
        });

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = 70;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // PARALLAX EFFECT ON HERO
    // ============================================
    const heroImage = document.querySelector('.hero-image-wrapper');

    if (heroImage) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroImage.style.transform = `translateY(${scrolled * 0.15}px)`;
            }
        });
    }

    // ============================================
    // TYPING EFFECT (Optional Enhancement)
    // ============================================
    const heroSubtitle = document.querySelector('.hero-subtitle');

    if (heroSubtitle) {
        const texts = [
            'AI Automation Expert | Full Stack JS Developer | POS Systems Specialist',
            'n8n Workflow Specialist | MERN Stack Developer | Flutter Expert',
            'Business Automation Leader | Creative Problem Solver | Tech Innovator'
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isPaused = false;

        function typeText() {
            const currentText = texts[textIndex];

            if (isPaused) {
                setTimeout(typeText, 2000);
                isPaused = false;
                isDeleting = true;
                return;
            }

            if (isDeleting) {
                heroSubtitle.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;

                if (charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                    setTimeout(typeText, 500);
                    return;
                }
            } else {
                heroSubtitle.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;

                if (charIndex === currentText.length) {
                    isPaused = true;
                }
            }

            setTimeout(typeText, isDeleting ? 30 : 60);
        }

        // Start typing after a delay
        setTimeout(typeText, 3000);
    }

    // ============================================
    // PORTFOLIO HOVER EFFECTS
    // ============================================
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });

        item.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });

    // Live button click - prevent parent event
    document.querySelectorAll('.portfolio-card-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // 3D Tilt Effect on Portfolio Cards
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ============================================
    // SERVICE CARD TILT EFFECT
    // ============================================
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ============================================
    // COUNTER ANIMATION FOR SKILL PERCENTS
    // ============================================
    const skillPercents = document.querySelectorAll('.skill-percent');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;

        const skillsSection = document.getElementById('skills');
        if (!skillsSection) return;

        const rect = skillsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            countersAnimated = true;

            skillPercents.forEach(percentEl => {
                const target = parseInt(percentEl.textContent);
                let current = 0;
                const increment = target / 40;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    percentEl.textContent = Math.floor(current) + '%';
                }, 30);
            });
        }
    }

    window.addEventListener('scroll', animateCounters);

    // ============================================
    // HERO SHOWCASE - Auto Animation on Scroll
    // ============================================
    const heroShowcase = document.querySelector('.hero-showcase');
    if (heroShowcase) {
        let hasAnimated = false;

        const showcaseObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    heroShowcase.classList.add('animate');
                }
            });
        }, { threshold: 0.3 });

        showcaseObserver.observe(heroShowcase);
    }

    // ============================================
    // FOOTER REVEAL ANIMATION
    // ============================================
    const footerCols = document.querySelectorAll('.footer-col');
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    footerCols.forEach(col => {
        col.style.opacity = '0';
        col.style.transform = 'translateY(30px)';
        col.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        footerObserver.observe(col);
    });

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // PRELOADER (Optional)
    // ============================================
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });

    console.log('Muhammad Ahmed Portfolio loaded successfully!');
});
