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
                
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: content,
                        opacity: [0, 1],
                        translateY: [10, 0],
                        duration: 400,
                        easing: 'easeOutCubic'
                    });
                }
            } else {
                if (typeof anime !== 'undefined') {
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
            if (typeof anime !== 'undefined') {
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
            if (typeof anime !== 'undefined') {
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
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    }

    // --- Mobile menu ---
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        // initialize ARIA
        mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');
        mobileMenu.setAttribute('id', 'mobile-menu');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');

        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.contains('show');
            if (isOpen) {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('show');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
            } else {
                mobileMenu.classList.remove('hidden');
                // slight delay to allow CSS transition
                requestAnimationFrame(() => mobileMenu.classList.add('show'));
                mobileMenuButton.setAttribute('aria-expanded', 'true');
                mobileMenu.setAttribute('aria-hidden', 'false');
            }
        });

        // Close when clicking outside (with safety checks)
        document.addEventListener('click', (e) => {
            const isOpen = mobileMenu.classList.contains('show');
            if (!isOpen) return;
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('show');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                if (mobileMenu.classList.contains('show')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('show');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                    mobileMenu.setAttribute('aria-hidden', 'true');
                }
            }
        });

        // Prevent clicks inside the menu from bubbling to document
        mobileMenu.addEventListener('click', (e) => e.stopPropagation());
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
    const waFloat = document.querySelector('.fab.fa-whatsapp') ? document.querySelector('.fab.fa-whatsapp').closest('a') : document.querySelector('.whatsapp-float');
    if (waFloat && typeof anime !== 'undefined') {
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
    const lightbox = document.querySelector('.lightbox') || (() => {
        const lb = document.createElement('div');
        lb.className = 'lightbox';
        document.body.appendChild(lb);
        return lb;
    })();

    // Helper to show/hide items with animation
    function showItem(item) {
        item.style.display = '';
        if (typeof anime !== 'undefined') {
            anime({ targets: item, opacity: [0,1], scale: [0.96,1], duration: 350, easing: 'easeOutCubic' });
        } else {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        }
    }
    function hideItem(item) {
        if (typeof anime !== 'undefined') {
            anime({ targets: item, opacity: [1,0], scale: [1,0.96], duration: 250, easing: 'easeOutCubic', complete: () => item.style.display = 'none' });
        } else {
            item.style.opacity = '0';
            item.style.display = 'none';
        }
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterButtons.forEach(b => b.classList.remove('bg-primary','text-white'));
            btn.classList.add('bg-primary','text-white');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || filter === category) showItem(item);
                else hideItem(item);
            });
        });
    });

    // Lightbox click handling (works if img inside or data-src on item)
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const src = (img && img.src) || item.getAttribute('data-src') || '';
            if (!src) return; // nothing to show
            lightbox.innerHTML = '';
            const lightImg = document.createElement('img');
            lightImg.src = src;
            lightbox.appendChild(lightImg);
            lightbox.classList.add('active');
            if (typeof anime !== 'undefined') anime({ targets: lightImg, opacity: [0,1], scale: [0.96,1], duration: 300, easing: 'easeOutCubic' });
        });
    });

    lightbox.addEventListener('click', (e) => {
        const img = lightbox.querySelector('img');
        if (!img) { lightbox.classList.remove('active'); return; }
        if (typeof anime !== 'undefined') {
            anime({ targets: img, opacity: [1,0], scale: [1,0.96], duration: 220, easing: 'easeOutCubic', complete: () => lightbox.classList.remove('active') });
        } else {
            lightbox.classList.remove('active');
        }
    });

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