(function () {

    var pages = {
        home: 'home-page',
        about: 'about-page',
        tech: 'tech-page',
        projects: 'projects-page',
        exercises: 'exercises-page',
        gallery: 'gallery-page',
        contact: 'contact-page'
    };

    var roleTexts = [
        'beautiful interfaces',
        'performant web apps',
        'clean, readable code',
        'user-friendly designs'
    ];

    var LOADER_SPEED = 45;
    var TYPE_DELAY = 1200;
    var SUCCESS_TIMEOUT = 5000;
    var MAX_TRAIL = 32;
    var TRAIL_DECAY = 0.05;


    function initLoader() {
        var loader = document.getElementById('loader');
        var bar = document.getElementById('loaderBar');
        var pct = document.getElementById('loaderPct');

        if (!loader || !bar || !pct) return;

        var progress = 0;
        var interval = setInterval(function() {
            progress++;
            bar.style.width = progress + '%';
            pct.textContent = progress + '%';

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(function() {
                    loader.classList.add('fade-out');
                }, 300);
            }
        }, LOADER_SPEED);
    }


    function initNav() {
        var allSections = document.querySelectorAll('.page-section');
        var navLinks = document.querySelectorAll('[data-page]');
        var header = document.getElementById('site-header');
        var hamburger = document.getElementById('hamburger');
        var drawer = document.getElementById('mobileNav');

        function goToPage(key) {
            if (!pages[key]) return;

            allSections.forEach(function(s) {
                s.classList.remove('is-active', 'page-enter');
            });

            var target = document.getElementById(pages[key]);
            if (target) {
                target.classList.add('is-active', 'page-enter');
                setTimeout(function() {
                    target.classList.remove('page-enter');
                }, 500);
            }

            navLinks.forEach(function(link) {
                link.classList.toggle('is-active', link.dataset.page === key);
            });

            if (drawer && hamburger) {
                drawer.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
                drawer.setAttribute('aria-hidden', 'true');
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            requestAnimationFrame(function() {
                initReveal(true);
            });
        }

        navLinks.forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                var key = item.dataset.page;
                if (key) goToPage(key);
            });
        });

        if (header) {
            window.addEventListener('scroll', function() {
                header.classList.toggle('scrolled', window.scrollY > 10);
            }, { passive: true });
        }

        if (hamburger && drawer) {
            hamburger.addEventListener('click', function() {
                var open = hamburger.classList.toggle('is-open');
                drawer.classList.toggle('is-open', open);
                hamburger.setAttribute('aria-expanded', String(open));
                drawer.setAttribute('aria-hidden', String(!open));
            });
        }
    }


    function initTypewriter() {
        var el = document.getElementById('roleText');
        if (!el || !roleTexts.length) return;

        var idx = 0;
        var pos = 0;
        var deleting = false;

        function tick() {
            var str = roleTexts[idx];

            if (deleting) {
                pos = Math.max(pos - 1, 0);
            } else {
                pos = Math.min(pos + 1, str.length);
            }

            el.textContent = str.substring(0, pos);

            var wait = deleting ? 60 : 90;

            if (!deleting && pos === str.length) {
                wait = 1800;
                deleting = true;
            } else if (deleting && pos === 0) {
                deleting = false;
                idx = (idx + 1) % roleTexts.length;
                wait = 400;
            }

            setTimeout(tick, wait);
        }

        setTimeout(tick, TYPE_DELAY);
    }


    function initReveal(reuse) {
        var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        if (!els.length) return;

        if (reuse && initReveal._obs) {
            els.forEach(function(el) { initReveal._obs.observe(el); });
            return;
        }

        initReveal._obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    initReveal._obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        els.forEach(function(el) { initReveal._obs.observe(el); });
    }


    function initContactForm() {
        var form = document.getElementById('contactForm');
        var msg = document.getElementById('formSuccess');

        if (!form || !msg) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            msg.style.display = 'block';
            form.reset();
            setTimeout(function() {
                msg.style.display = 'none';
            }, SUCCESS_TIMEOUT);
        });
    }


    function initCursorTrail() {
        if (window.matchMedia('(hover: none)').matches) return;

        var canvas = document.getElementById('cursorCanvas');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var trail = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener('resize', resize, { passive: true });

        window.addEventListener('mousemove', function(e) {
            trail.push({ x: e.clientX, y: e.clientY, life: 1 });
            if (trail.length > MAX_TRAIL) trail.shift();
        }, { passive: true });

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            trail.forEach(function(p) {
                if (p.life <= 0) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(126, 4, 227, ' + (p.life * 0.45) + ')';
                ctx.fill();
                p.life -= TRAIL_DECAY;
            });
            requestAnimationFrame(draw);
        }

        draw();
    }


    function initTechBars() {
        var techPage = document.getElementById('tech-page');
        if (!techPage) return;

        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) return;
                var bars = entry.target.querySelectorAll('.tech-bar');
                bars.forEach(function(bar) {
                    var target = bar.style.width;
                    bar.style.width = '0%';
                    requestAnimationFrame(function() {
                        bar.style.width = target;
                    });
                });
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.2 });

        obs.observe(techPage);
    }


    function boot() {
        initLoader();
        initNav();
        initTypewriter();
        initReveal();
        initContactForm();
        initCursorTrail();
        initTechBars();
    }

    document.addEventListener('DOMContentLoaded', boot);

})();
