/* Portfolio site behavior: loader, navigation, reveal animations, form handling, cursor trail, and progress bars */
(function () {
    const PAGE_MAP = {
        home: 'home-page',
        about: 'about-page',
        tech: 'tech-page',
        projects: 'projects-page',
        exercises: 'exercises-page',
        gallery: 'gallery-page',
        contact: 'contact-page',
    };

    const ROLE_TEXTS = [
        'beautiful interfaces',
        'performant web apps',
        'clean, readable code',
        'user-friendly designs',
    ];

    const LOADER_INTERVAL_MS = 45;
    const LOADER_HIDE_DELAY_MS = 300;
    const TYPE_START_DELAY_MS = 1200;
    const SUCCESS_HIDE_DELAY_MS = 5000;
    const CURSOR_TRAIL_MAX = 32;
    const CURSOR_DECAY = 0.05;

    function initLoader() {
        const loader = document.getElementById('loader');
        const bar = document.getElementById('loaderBar');
        const pctText = document.getElementById('loaderPct');

        if (!loader || !bar || !pctText) {
            return;
        }

        let pct = 0;
        const tick = setInterval(() => {
            pct += 1;
            bar.style.width = `${pct}%`;
            pctText.textContent = `${pct}%`;

            if (pct >= 100) {
                clearInterval(tick);
                setTimeout(() => loader.classList.add('fade-out'), LOADER_HIDE_DELAY_MS);
            }
        }, LOADER_INTERVAL_MS);
    }

    function initNavigation() {
        const allPages = document.querySelectorAll('.page-section');
        const allNavItems = document.querySelectorAll('[data-page]');
        const header = document.getElementById('site-header');
        const hamburger = document.getElementById('hamburger');
        const mobileNav = document.getElementById('mobileNav');

        function showPage(pageKey) {
            // Switch visible page sections in the single-page portfolio UI
            const targetId = PAGE_MAP[pageKey];
            if (!targetId) return;

            allPages.forEach((page) => page.classList.remove('is-active', 'page-enter'));

            const target = document.getElementById(targetId);
            if (target) {
                target.classList.add('is-active', 'page-enter');
                window.setTimeout(() => target.classList.remove('page-enter'), 500);
            }

            allNavItems.forEach((link) => {
                link.classList.toggle('is-active', link.dataset.page === pageKey);
            });

            if (mobileNav && hamburger) {
                mobileNav.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
                mobileNav.setAttribute('aria-hidden', 'true');
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.requestAnimationFrame(() => initRevealObserver(true));
        }

        allNavItems.forEach((item) => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const pageKey = item.dataset.page;
                if (pageKey) {
                    showPage(pageKey);
                }
            });
        });

        if (header) {
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 10);
            }, { passive: true });
        }

        if (hamburger && mobileNav) {
            hamburger.addEventListener('click', () => {
                const isOpen = hamburger.classList.toggle('is-open');
                mobileNav.classList.toggle('is-open', isOpen);
                hamburger.setAttribute('aria-expanded', `${isOpen}`);
                mobileNav.setAttribute('aria-hidden', `${!isOpen}`);
            });
        }
    }

    function initTypewriter() {
        const roleText = document.getElementById('roleText');
        if (!roleText || ROLE_TEXTS.length === 0) return;

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeLoop() {
            const currentText = ROLE_TEXTS[roleIndex];
            if (isDeleting) {
                charIndex = Math.max(charIndex - 1, 0);
                roleText.textContent = currentText.substring(0, charIndex);
            } else {
                charIndex = Math.min(charIndex + 1, currentText.length);
                roleText.textContent = currentText.substring(0, charIndex);
            }

            let delay = isDeleting ? 60 : 90;
            if (!isDeleting && charIndex === currentText.length) {
                delay = 1800;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % ROLE_TEXTS.length;
                delay = 400;
            }

            window.setTimeout(typeLoop, delay);
        }

        window.setTimeout(typeLoop, TYPE_START_DELAY_MS);
    }

    function initRevealObserver(reuseObserver = false) {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        if (revealElements.length === 0) return;

        if (reuseObserver && initRevealObserver.observer) {
            revealElements.forEach((element) => initRevealObserver.observer.observe(element));
            return;
        }

        initRevealObserver.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    initRevealObserver.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealElements.forEach((element) => initRevealObserver.observer.observe(element));
    }

    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        const successMessage = document.getElementById('formSuccess');

        if (!contactForm || !successMessage) return;

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            successMessage.style.display = 'block';
            contactForm.reset();
            window.setTimeout(() => {
                successMessage.style.display = 'none';
            }, SUCCESS_HIDE_DELAY_MS);
        });
    }

    function initCursorTrail() {
        if (window.matchMedia('(hover: none)').matches) return;

        const canvas = document.getElementById('cursorCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const trail = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas, { passive: true });

        window.addEventListener('mousemove', (event) => {
            trail.push({ x: event.clientX, y: event.clientY, life: 1 });
            if (trail.length > CURSOR_TRAIL_MAX) {
                trail.shift();
            }
        }, { passive: true });

        function drawTrail() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            trail.forEach((point) => {
                if (point.life <= 0) return;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2.5 * point.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(126, 4, 227, ${point.life * 0.45})`;
                ctx.fill();
                point.life -= CURSOR_DECAY;
            });
            window.requestAnimationFrame(drawTrail);
        }

        drawTrail();
    }

    function initTechBarAnimation() {
        const techPage = document.getElementById('tech-page');
        if (!techPage) return;

        const techObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const bars = entry.target.querySelectorAll('.tech-bar');
                bars.forEach((bar) => {
                    const targetWidth = bar.style.width || '';
                    bar.style.width = '0%';
                    window.requestAnimationFrame(() => {
                        bar.style.width = targetWidth;
                    });
                });
                techObserver.unobserve(entry.target);
            });
        }, { threshold: 0.2 });

        techObserver.observe(techPage);
    }

    function initApp() {
        initLoader();
        initNavigation();
        initTypewriter();
        initRevealObserver();
        initContactForm();
        initCursorTrail();
        initTechBarAnimation();
    }

    document.addEventListener('DOMContentLoaded', initApp);
})();
// update 3
