/**
 * Main Application Entry Point
 * Initializes Lenis smooth scroll, TigerExperience, carousel, reveal animations, and navbar
 */
document.addEventListener('DOMContentLoaded', () => {

    // ──────────────────────────────────────────────
    // 1. Lenis Smooth Scroll
    // ──────────────────────────────────────────────
    const lenis = new Lenis({
        duration: 1.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 1.5,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ──────────────────────────────────────────────
    // 2. Tiger Scrollytelling
    // ──────────────────────────────────────────────
    const tiger = new TigerExperience();

    // ──────────────────────────────────────────────
    // 3. Carousel Controls
    // ──────────────────────────────────────────────
    const track = document.getElementById('product-carousel');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (track && prevBtn && nextBtn) {
        const getScrollAmount = () => {
            const card = track.querySelector('.product-card');
            return card ? card.offsetWidth + 14 : 300;
        };

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });
    }

    // ──────────────────────────────────────────────
    // 4. Scroll Reveal Animations
    // ──────────────────────────────────────────────
    const revealElements = document.querySelectorAll('.reveal-up');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Stagger delay based on sibling index
                    const siblings = entry.target.parentElement.querySelectorAll('.reveal-up');
                    const idx = Array.from(siblings).indexOf(entry.target);
                    entry.target.style.transitionDelay = `${idx * 0.12}s`;
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ──────────────────────────────────────────────
    // 5. Navbar Scroll State
    // ──────────────────────────────────────────────
    const navbar = document.getElementById('navbar');

    if (navbar) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }, {
            threshold: 0,
            rootMargin: '-64px 0px 0px 0px'
        });

        // Use hero as sentinel
        const hero = document.getElementById('hero');
        if (hero) navObserver.observe(hero);
    }

    // ──────────────────────────────────────────────
    // 6. Navbar color transition (dark -> white bg)
    // ──────────────────────────────────────────────
    const mainContent = document.getElementById('main-content');
    if (navbar && mainContent) {
        ScrollTrigger.create({
            trigger: mainContent,
            start: 'top 64px',
            onEnter: () => {
                navbar.style.transition = 'background-color 0.8s cubic-bezier(0.19,1,0.22,1), color 0.8s cubic-bezier(0.19,1,0.22,1)';
                navbar.style.backgroundColor = 'rgba(255,255,255,0.95)';
                navbar.style.color = 'var(--color-black)';
                navbar.querySelectorAll('.nav-links a, .nav-icon-btn, .nav-logo').forEach(el => {
                    el.style.transition = 'color 0.8s cubic-bezier(0.19,1,0.22,1)';
                    el.style.color = 'var(--color-black)';
                });
            },
            onLeaveBack: () => {
                navbar.style.backgroundColor = '';
                navbar.style.color = '';
                navbar.querySelectorAll('.nav-links a, .nav-icon-btn, .nav-logo').forEach(el => {
                    el.style.color = '';
                });
            }
        });
    }
});
