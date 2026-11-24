// Enhanced interactions and animations
// Dynamically load a script and return a Promise
function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${url}`));
        document.head.appendChild(s);
    });
}

    // Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Room card carousels
    document.querySelectorAll('[data-room-carousel]').forEach(shell => {
        const carousel = shell.querySelector('.room-carousel');
        const previous = shell.querySelector('[data-room-prev]');
        const next = shell.querySelector('[data-room-next]');
        const status = shell.querySelector('.room-carousel-status');
        if (!carousel || !previous || !next || !status) return;

        const cards = [...carousel.querySelectorAll('.modern-card')];
        const updateControls = () => {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            previous.disabled = carousel.scrollLeft <= 1;
            next.disabled = carousel.scrollLeft >= maxScroll - 1;
            const container = carousel.getBoundingClientRect();
            const visible = cards.filter(card => {
                const bounds = card.getBoundingClientRect();
                return bounds.right > container.left + 1 && bounds.left < container.right - 1;
            });
            if (visible.length) {
                const first = cards.indexOf(visible[0]) + 1;
                const last = cards.indexOf(visible[visible.length - 1]) + 1;
                status.textContent = first === last
                    ? `Room ${first} of ${cards.length}`
                    : `Rooms ${first}\u2013${last} of ${cards.length}`;
            }
        };

        const scrollCards = direction => {
            const card = cards[0];
            if (!card) return;
            const gap = parseFloat(getComputedStyle(carousel).columnGap);
            const distance = card.getBoundingClientRect().width + gap;
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            carousel.scrollBy({ left: distance * direction, behavior: reducedMotion ? 'instant' : 'smooth' });
        };

        previous.hidden = false;
        next.hidden = false;
        previous.addEventListener('click', () => scrollCards(-1));
        next.addEventListener('click', () => scrollCards(1));
        carousel.addEventListener('scroll', updateControls, { passive: true });
        window.addEventListener('resize', updateControls);
        updateControls();
    });

    // Handle FAQ toggles with smooth animations
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;
            const icon = toggle.querySelector('.faq-icon');
            const isOpen = !content.classList.contains('hidden');

            // Close all other FAQs
            document.querySelectorAll('.faq-content').forEach(c => {
                if (c !== content) {
                    c.classList.add('hidden');
                    c.style.maxHeight = null;
                }
            });
            document.querySelectorAll('.faq-icon').forEach(i => {
                if (i !== icon) {
                    i.style.transform = 'rotate(0deg)';
                }
            });

            // Toggle current FAQ
            if (!isOpen) {
                content.classList.remove('hidden');
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
                
                if (typeof anime !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    anime({
                        targets: content,
                        opacity: [0, 1],
                        translateY: [10, 0],
                        duration: 400,
                        easing: 'easeOutCubic'
                    });
                }
            } else {
                if (typeof anime !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    anime({
                        targets: content,
                        opacity: 0,
                        translateY: 10,
                        duration: 300,
                        easing: 'easeInCubic',
                        complete: () => {
                            content.classList.add('hidden');
                            content.style.maxHeight = null;
                        }
                    });
                } else {
                    content.classList.add('hidden');
                    content.style.maxHeight = null;
                }
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });

    // Enhanced card hover effects
    const cards = document.querySelectorAll('.modern-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (typeof anime !== 'undefined' && window.matchMedia('(hover: hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                anime({
                    targets: card,
                    translateY: -8,
                    boxShadow: ['0 4px 6px rgba(0, 0, 0, 0.1)', '0 20px 30px rgba(0, 0, 0, 0.15)'],
                    duration: 400,
                    easing: 'easeOutCubic'
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (typeof anime !== 'undefined' && window.matchMedia('(hover: hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                anime({
                    targets: card,
                    translateY: 0,
                    boxShadow: ['0 20px 30px rgba(0, 0, 0, 0.15)', '0 4px 6px rgba(0, 0, 0, 0.1)'],
                    duration: 400,
                    easing: 'easeOutCubic'
                });
            }
        });
    });

    // --- Mobile menu ---
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');
        mobileMenu.setAttribute('id', 'mobile-menu');

        const setMenuOpen = open => {
            mobileMenu.classList.toggle('hidden', !open);
            mobileMenu.classList.toggle('show', open);
            mobileMenuButton.setAttribute('aria-expanded', String(open));
            mobileMenu.setAttribute('aria-hidden', String(!open));
        };
        setMenuOpen(false);

        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenuOpen(!mobileMenu.classList.contains('show'));
        });

        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('show') && !mobileMenu.contains(e.target)) {
                setMenuOpen(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('show')) {
                setMenuOpen(false);
                mobileMenuButton.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.matchMedia('(min-width: 768px)').matches) setMenuOpen(false);
        });
    }

    // Load AOS and anime.js if they're not present
    try {
        if (typeof AOS === 'undefined') {
            await loadScript('https://unpkg.com/aos@2.3.1/dist/aos.js');
        }
    } catch (e) {
        console.warn('AOS failed to load:', e);
    }

    try {
        if (typeof anime === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js');
        }
    } catch (e) {
        console.warn('anime.js failed to load:', e);
    }

    // Init AOS safely
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true,
            disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches });
    }

    // Smooth scroll for internal anchors (only if target exists)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return; // allow normal behavior if no target
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Intersection Observer for fade-in (fallback if AOS isn't used)
    if (typeof AOS === 'undefined') {
        const fadeElements = document.querySelectorAll('.fade-in');
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('aos-animate');
                }
            });
        }, { threshold: 0.12 });

        fadeElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            fadeObserver.observe(element);
        });
    }

    // --- WhatsApp floating pulse ---
    const waFloat = document.querySelector('.whatsapp-float');
    if (waFloat && typeof anime !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Add a subtle pulse to the button using anime
        const pulse = anime({
            targets: waFloat,
            scale: [1, 1.06, 1],
            duration: 2200,
            easing: 'easeInOutSine',
            loop: true,
            autoplay: true
        });
        // stop pulse on hover for better UX
        waFloat.addEventListener('mouseenter', () => pulse.pause());
        waFloat.addEventListener('mouseleave', () => pulse.play());
    }

    // --- Gallery filtering & lightbox ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.querySelector('.lightbox');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterButtons.forEach(b => {
                const active = b === btn;
                b.classList.toggle('active', active);
                b.setAttribute('aria-pressed', String(active));
            });

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                item.style.display = filter === 'all' || filter === category ? '' : 'none';
            });
        });
    });

    if (lightbox) {
        const lightImg = lightbox.querySelector('img');
        const closeButton = lightbox.querySelector('.lightbox-close');
        let lastItem;

        const openLightbox = item => {
            const image = item.querySelector('img');
            if (!image || !lightImg || !closeButton) {
                console.error('Cannot open photo preview: gallery markup is incomplete.');
                return;
            }
            lastItem = item;
            lightImg.src = image.src;
            lightImg.alt = image.alt;
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            closeButton.focus();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            if (lastItem) lastItem.focus();
        };

        galleryItems.forEach(item => {
            item.addEventListener('click', () => openLightbox(item));
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(item);
                }
            });
        });

        lightbox.addEventListener('click', e => {
            if (e.target === lightbox || (closeButton && closeButton.contains(e.target))) closeLightbox();
        });
        lightbox.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'Tab') {
                e.preventDefault();
                if (closeButton) closeButton.focus();
            }
        });
    }

    // --- Button ripple effect for .btn-primary ---
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.style.position = 'relative';
        btn.addEventListener('click', function (e) {
            const circle = document.createElement('span');
            circle.className = 'ripple';
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            circle.style.width = circle.style.height = size + 'px';
            circle.style.left = (e.clientX - rect.left - size/2) + 'px';
            circle.style.top = (e.clientY - rect.top - size/2) + 'px';
            circle.style.position = 'absolute';
            circle.style.borderRadius = '50%';
            circle.style.background = 'rgba(255,255,255,0.2)';
            circle.style.transform = 'scale(0)';
            circle.style.pointerEvents = 'none';
            circle.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
            btn.appendChild(circle);
            requestAnimationFrame(() => circle.style.transform = 'scale(1)');
            setTimeout(() => { circle.style.opacity = '0'; setTimeout(() => circle.remove(), 600); }, 500);
        });
    });

    // --- Micro interactions: hero button hover bounce ---
    const heroBtn = document.querySelector('.hero-button');
    if (heroBtn && typeof anime !== 'undefined') {
        heroBtn.addEventListener('mouseenter', () => anime({ targets: heroBtn, translateY: [-2,0], duration: 350, easing: 'easeOutElastic(1, .6)' }));
    }

    // --- Animate number counters when visible ---
    const counters = document.querySelectorAll('.animate-number');
    if (counters.length > 0 && typeof anime !== 'undefined') {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const final = +el.getAttribute('data-final') || 0;
                    anime({ targets: el, innerHTML: [0, final], round: 1, duration: 1600, easing: 'easeOutExpo' });
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.3 });
        counters.forEach(c => counterObserver.observe(c));
    }
});