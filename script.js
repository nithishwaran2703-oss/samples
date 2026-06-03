document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis for Premium Smooth Scrolling
    window.lenis = new Lenis({
        duration: 2.0, // Increased for a more buttery, luxurious flow
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing for smoother stop
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8, // Softer wheel reaction
        smoothTouch: true,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.08 // Softer lerp for a more fluid feel
    });

    function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate with existing scroll events
    lenis.on('scroll', (e) => {
        // Trigger manual scroll events for compatibility with existing code
        window.dispatchEvent(new Event('scroll'));
    });

    // Handle anchor links with Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -100, // Adjust for navbar height
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // 1. Top Level Intro Sequence
    const hideLoader = () => {
        const loader = document.querySelector('.loader');
        const curtain = document.querySelector('.hero-curtain');
        const heroBg = document.querySelector('.hero-bg-wrapper');

        if (loader) {
            loader.classList.add('hidden');

            // Start cinematic sequence after loader begins to hide
            setTimeout(() => {
                if (curtain) {
                    curtain.style.transform = 'translateY(0)';
                    curtain.style.transition = 'transform 0.5s cubic-bezier(0.77, 0, 0.175, 1)';

                    setTimeout(() => {
                        curtain.style.transform = 'translateY(100%)';
                        triggerHeroAnimations();

                        // Restart the CSS hero reveal animation if needed
                        if (heroBg) {
                            heroBg.style.animation = 'none';
                            heroBg.offsetHeight; // trigger reflow
                            heroBg.style.animation = 'heroReveal 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards';
                        }
                    }, 400);
                } else {
                    triggerHeroAnimations();
                }
            }, 300);

            setTimeout(() => { if (loader.parentNode) loader.remove(); }, 1000);
        }
    };

    // Force loader removal after 3 seconds as absolute fallback
    const loaderFallback = setTimeout(hideLoader, 1500);

    // Standard loader removal
    window.addEventListener('load', () => {
        clearTimeout(loaderFallback);
        hideLoader();
    });

    // Fallback if load takes too long
    setTimeout(hideLoader, 500);

    // 2. Advanced Custom Cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let speed = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    document.addEventListener('mousedown', () => {
        if (cursorFollower) cursorFollower.style.transform = 'translate(-50%, -50%) scale(0.9)';
        createRipple(mouseX, mouseY);
        // Smaller burst
        for (let i = 0; i < 4; i++) createSparkle(mouseX, mouseY, true);
    });

    document.addEventListener('mouseup', () => {
        if (cursorFollower) cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    function createSparkle(x, y, isBurst) {
        const dot = document.createElement('div');
        dot.className = 'cursor-sparkle';

        const size = isBurst ? (Math.random() * 4 + 2) : (Math.random() * 3 + 1);
        const color = 'var(--accent-gold)';
        const duration = isBurst ? (Math.random() * 600 + 300) : (Math.random() * 500 + 300);

        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dot.style.background = color;
        dot.style.color = color;
        dot.style.opacity = '0.8';
        dot.style.animation = `sparkleFade ${duration}ms ease-out forwards`;

        // Random velocity
        const vx = (Math.random() - 0.5) * (isBurst ? 100 : 15);
        const vy = (Math.random() - 0.5) * (isBurst ? 100 : 15);

        document.body.appendChild(dot);

        // Animate movement via JS for smoother physics
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const p = progress / duration;

            const curX = x + vx * p;
            const curY = y + vy * p + (isBurst ? p * p * 30 : 0);

            dot.style.transform = `translate(${vx * p}px, ${vy * p + (isBurst ? p * p * 30 : 0)}px)`;

            if (progress < duration) {
                requestAnimationFrame(step);
            } else {
                dot.remove();
            }
        }
        requestAnimationFrame(step);
    }

    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Physics-based cursor lerp loop
    const renderCursor = (time) => {
        // Calculate speed for velocity-based effects
        const deltaX = mouseX - lastMouseX;
        const deltaY = mouseY - lastMouseY;
        
        // Use a small alpha for speed smoothing to avoid jitter
        const targetSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        speed += (targetSpeed - speed) * 0.15;
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        if (cursor) {
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        }

        if (cursorFollower) {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            // Dynamic scaling based on speed (stretching effect)
            const scaleX = 1 + speed * 0.005;
            const scaleY = 1 - speed * 0.002;
            const angle = Math.atan2(mouseY - followerY, mouseX - followerX) * (180 / Math.PI);

            cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
        }

        const previewImg = document.getElementById('hoverPreviewImg');
        if (previewImg && previewImg.classList.contains('active')) {
            previewImg.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
        }

        requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Hover states for cursor
    const interactiveSelectors = 'a, button, .accordion-header, .filter-btn, .close-modal, .floating-wa, .floating-call, .product-card, .video-card';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            cursorFollower.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            cursorFollower.classList.remove('hovered');
        });
    });

    // Advanced Hover Image Reveal for Services
    const hoverPreviewImg = document.getElementById('hoverPreviewImg');
    document.querySelectorAll('.scc-sub').forEach(item => {
        const imgSource = item.querySelector('img').src;
        item.addEventListener('mouseenter', () => {
            if (hoverPreviewImg) {
                hoverPreviewImg.src = imgSource;
                hoverPreviewImg.classList.add('active');
            }
        });
        item.addEventListener('mouseleave', () => {
            if (hoverPreviewImg) {
                hoverPreviewImg.classList.remove('active');
            }
        });
    });

    /* Magnetic Elements Removed */    window.initMagnetics = () => {};
    // window.initMagnetics(); // Logic removed to prevent shaking

    // 4. Hero Animations (Triggered after loader)
    function triggerHeroAnimations() {
        const lineContents = document.querySelectorAll('.line-content');
        lineContents.forEach((el, index) => {
            // High-end skew reveal
            el.style.transform = 'translateY(110%) skewY(7deg)';
            el.style.opacity = '0';
            el.style.transition = `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1 + 0.1}s, opacity 0.8s ease ${index * 0.1 + 0.1}s`;

            setTimeout(() => {
                el.style.transform = 'translateY(0) skewY(0deg)';
                el.style.opacity = '1';
                el.classList.add('visible');
            }, 50);
        });

        const fadeUps = document.querySelectorAll('.hero-content .reveal-text');
        fadeUps.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1 + 0.3}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1 + 0.3}s`;

            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 50);
        });
    }

    // 5. Scroll Animations & Counters
    const observerOptions = { 
        threshold: 0.1, 
        rootMargin: "0px 0px -100px 0px" // Softer entry
    };

    const animateCounter = (el) => {
        const target = +el.getAttribute('data-target');
        const duration = 2500;
        const startTime = performance.now();

        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const current = Math.ceil(easedProgress * target);

            el.innerText = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        requestAnimationFrame(updateCounter);
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Advanced Stagger Logic for children
                if (entry.target.classList.contains('stagger-reveal')) {
                    const children = entry.target.querySelectorAll('.reveal-on-scroll');
                    children.forEach((child, i) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, i * 150);
                    });
                }

                // Trigger counters
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    if (!counter.classList.contains('counted')) {
                        animateCounter(counter);
                        counter.classList.add('counted');
                    }
                });

                // Trigger stat underlines
                const statItems = entry.target.querySelectorAll('.stat-item');
                statItems.forEach((item, i) => {
                    setTimeout(() => item.classList.add('visible'), i * 200);
                });

                // observer.unobserve(entry.target); // Keep observing if we want re-reveal, or keep unobserve for performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll, .stagger-reveal').forEach(el => scrollObserver.observe(el));

    // Interactive Card Glow Tracking (mouse-following highlight)
    document.querySelectorAll('.service-category-card, .journal-card, .pricing-card').forEach(card => {
        let cardThrottle = false;
        let rect;
        card.addEventListener('mouseenter', () => rect = card.getBoundingClientRect());
        card.addEventListener('mouseleave', () => rect = null);
        card.addEventListener('mousemove', (e) => {
            if (cardThrottle) return;
            cardThrottle = true;
            requestAnimationFrame(() => { cardThrottle = false; });

            if (!rect) rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });


    // 6. 3D Tilt Effect on Gallery Cards with Glare
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        const inner = card.querySelector('.card-inner');

        // Add glare element if not exists
        let glare = inner.querySelector('.glare');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'glare';
            inner.appendChild(glare);
        }

        let tiltThrottle = false;
        let rect;
        card.addEventListener('mouseenter', () => rect = card.getBoundingClientRect());
        card.addEventListener('mousemove', (e) => {
            if (tiltThrottle) return;
            tiltThrottle = true;
            requestAnimationFrame(() => { tiltThrottle = false; });

            if (!rect) rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg
            const rotateY = ((x - centerX) / centerX) * 15;

            inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // Glare effect
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) - 90;
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const opacity = Math.min(distance / (rect.width / 2), 0.5);
            glare.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`;
            glare.style.opacity = opacity;
        });

        card.addEventListener('mouseleave', () => {
            rect = null;
            inner.style.transform = `rotateX(0deg) rotateY(0deg)`;
            glare.style.opacity = '0';
        });
    });

    // 7. Scroll Events (Progress, Navbar, Back to Top)
    // 7. Advanced Scroll Effects (Perspective Tilt, Progress, Navbar)
    const galleryGrid = document.querySelector('.gallery-grid');
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    // Cache DOM elements for scroll performance
    const cursorCircle = document.querySelector('.cursor-progress circle');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const heroBg = document.querySelector('.hero-bg-wrapper');
    const heroContent = document.querySelector('.hero-content');
    const navbar = document.querySelector('.navbar');
    const floatingOrnaments = document.querySelectorAll('.floating-ornament');

    let scrollThrottle = false;
    window.addEventListener('scroll', () => {
        if (scrollThrottle) return;
        scrollThrottle = true;

        requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrolled / totalHeight) * 100;

            // Update progress bar
            if (scrollProgress) scrollProgress.style.width = progress + '%';

            // Update cursor progress circle
            if (cursorCircle) {
                const circumference = 2 * Math.PI * 45; // r=45
                const offset = circumference - (progress / 100) * circumference;
                cursorCircle.style.strokeDashoffset = offset;
            }

            // Dynamic Hero Scroll Indicator Fade
            if (scrollIndicator) {
                const fadeProgress = Math.max(0, 1 - (scrolled / 300));
                scrollIndicator.style.opacity = fadeProgress;
                scrollIndicator.style.transform = `translateY(${scrolled * 0.2}px)`;
            }

            // Hero Window Parallax Effect
            if (heroBg && heroContent && scrolled < window.innerHeight) {
                const scrollRatio = scrolled / window.innerHeight;
                heroBg.style.transform = `scale(${1 - (scrollRatio * 0.1)}) translateY(${scrolled * 0.4}px)`;
                heroContent.style.transform = `translateY(${scrolled * 0.6}px)`;
                heroContent.style.opacity = 1 - (scrollRatio * 1.5);
            }

            // Show/Hide back to top
            if (backToTop) {
                if (scrolled > 500) backToTop.classList.add('visible');
                else backToTop.classList.remove('visible');
            }

            // Navbar
            if (navbar) {
                if (scrolled > 50) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
            }

            // Floating Ornament Parallax Depth
            floatingOrnaments.forEach((orn, i) => {
                const speed = (i + 1) * 0.05;
                orn.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.02}deg)`;
            });

            scrollThrottle = false;
        });
    }, { passive: true });

    // 7b. Creative Text Scramble for Hero Title
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="dud">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // Initialize scramble on main title parts
    const titleLines = document.querySelectorAll('.hero-title .line-content');
    setTimeout(() => {
        titleLines.forEach(line => {
            const fx = new TextScramble(line);
            fx.setText(line.innerText);
        });
    }, 1500);

    // No replacement, deleting block.

    // Back to top click
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            lenis.scrollTo(0);
        });
    }

    // Hero Parallax on mouse move removed to prevent shaking
    // 8. Gallery Filtering - Unified Logic (Moved to bottom to handle dynamic cards)
    // Old filtering logic removed to prevent conflicts with Supabase integration.
;

    // 9. Accordion Services
    const accordions = document.querySelectorAll('.accordion-item');
    accordions.forEach(acc => {
        const header = acc.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            const isActive = acc.classList.contains('active');
            accordions.forEach(other => other.classList.remove('active'));
            if (!isActive) acc.classList.add('active');
        });
    });

    // 9b. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(other => other.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // 9c. Mobile Menu
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileClose = document.getElementById('mobileClose');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (hamburgerBtn && mobileMenu) {
        const toggleMobileMenu = (active) => {
            if (active) mobileMenu.classList.add('active');
            else mobileMenu.classList.remove('active');
        };

        hamburgerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMobileMenu(true);
        });
        hamburgerBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            toggleMobileMenu(true);
        }, { passive: false });

        if (mobileClose) {
            mobileClose.addEventListener('click', () => toggleMobileMenu(false));
            mobileClose.addEventListener('touchstart', (e) => {
                e.preventDefault();
                toggleMobileMenu(false);
            }, { passive: false });
        }

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => toggleMobileMenu(false));
            link.addEventListener('touchstart', () => toggleMobileMenu(false));
        });

        // Close on overlay click
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) toggleMobileMenu(false);
        });
    }

    // 9d. Lightbox for Gallery
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    if (lightbox) {
        document.addEventListener('click', (e) => {
            const imgContainer = e.target.closest('.product-img');
            if (imgContainer && imgContainer.closest('.product-card')) {
                const card = imgContainer.closest('.product-card');
                const imgSrc = card.querySelector('img').src;
                const title = card.querySelector('h3').innerText;
                if (lightboxImg) lightboxImg.src = imgSrc;
                if (lightboxCaption) lightboxCaption.innerText = title;
                lightbox.classList.add('active');
            }
        });

        if (lightboxClose) lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }

    // 10. Modal Stylist
    const modal = document.getElementById('stylistModal');
    const openBtn = document.getElementById('openStylist');
    const closeBtn = document.querySelector('.close-modal');
    const genBtn = document.getElementById('generateBtn');
    const modalBody = document.getElementById('modalBody');

    if (openBtn) {
        openBtn.addEventListener('click', () => modal.classList.add('active'));
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    if (genBtn) {
        genBtn.addEventListener('click', () => {
            const eventType = document.getElementById('aiEvent').value || "special celebration";
            const palette = document.getElementById('aiPalette').value || "royal hues";

            genBtn.innerText = "Designing Magic...";
            genBtn.disabled = true;

            setTimeout(() => {
                modalBody.innerHTML = `
                    <div class="ai-result-card" style="background: rgba(212,175,55,0.05); padding: 30px; border-radius: 25px; border: 1px solid var(--accent-gold); box-shadow: 0 20px 50px rgba(128,0,0,0.1);">
                        <h4 class="gradient-text font-serif" style="margin-bottom: 15px; font-size: 1.5rem;">Bespoke Product Collection</h4>
                        <p id="typewriterText" style="line-height: 1.8; font-size: 1.1rem; color: var(--text-dark); min-height: 100px;"></p>
                        <div class="header-line" style="margin: 20px 0;"></div>
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <span class="badge" style="background: rgba(128,0,0,0.1); color: var(--primary-maroon); border: none;">Luxury Styling</span>
                            <span class="badge" style="background: rgba(212,175,55,0.1); color: var(--accent-gold); border: none;">Hand-Crafted</span>
                        </div>
                    </div>
                    <button class="btn-primary glow-effect" style="width: 100%; margin-top: 25px; padding: 1.2rem;" onclick="window.open('https://wa.me/919788742627', '_blank')">Order this Collection on WhatsApp</button>
                `;

                const text = `For your ${eventType}, we recommend a curated collection using ${palette}. We will bundle handcrafted traditional elements with premium modern accents to create a stunning atmosphere that celebrates luxury in every detail.`;
                let i = 0;
                const typewriter = () => {
                    const textEl = document.getElementById('typewriterText');
                    if (textEl && i < text.length) {
                        textEl.innerHTML += text.charAt(i);
                        i++;
                        setTimeout(typewriter, 30);
                    } else {
                        genBtn.innerText = "Concept Ready";
                        genBtn.disabled = false;
                    }
                };
                typewriter();

                // Add keyframes for popIn dynamically
                if (!document.getElementById('popInStyles')) {
                    const style = document.createElement('style');
                    style.id = 'popInStyles';
                    style.innerHTML = `@keyframes popIn { to { transform: scale(1); opacity: 1; } }`;
                    document.head.appendChild(style);
                }

                // Magnetic binding removed for stability
            }, 1500);
        });
    }

    const contactForm = document.querySelector('.contact-form-premium');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            
            btn.innerText = 'Sending... / அனுப்பப்படுகிறது...';
            btn.disabled = true;

            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => data[key] = value);

            // SYNC TO SUPABASE (Admin Dashboard)
            const SUPA_URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
            const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';
            
            fetch(`${SUPA_URL}/rest/v1/enquiries`, {
                method: 'POST',
                headers: {
                    'apikey': SUPA_KEY,
                    'Authorization': `Bearer ${SUPA_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: data.name || 'Anonymous',
                    email: data.email || '',
                    phone: data.phone || '',
                    subject: data.subject || 'Website Inquiry',
                    message: data.message || ''
                })
            }).catch(err => console.error('Supabase Sync Error:', err));

            // Standard FormSubmit Email
            fetch(contactForm.action, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    contactForm.innerHTML = `
                        <div class="success-message reveal-text" style="text-align: center; padding: 2rem;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🙏</div>
                            <h3 class="font-serif text-maroon" style="font-size: 1.8rem; margin-bottom: 1rem;">நன்றி! / Thank You!</h3>
                            <p style="color: var(--text-light);">உங்கள் செய்தி எங்களுக்கு கிடைத்துவிட்டது. விரைவில் உங்களைத் தொடர்பு கொள்வோம் • We have received your message and will get back to you shortly.</p>
                        </div>
                    `;
                } else {
                    btn.innerText = 'Error! Try again.';
                    btn.disabled = false;
                }
            }).catch(error => {
                btn.innerText = 'Error! Try again.';
                btn.disabled = false;
            });
        });
    }

    // 11. Canvas Particle System
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let w, h;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor(type = 'star') {
                this.type = type;
                this.init();
            }
            init() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                
                // Enhanced variety for stars
                if (this.type === 'star') {
                    const r = Math.random();
                    if (r > 0.9) {
                        this.size = Math.random() * 2.5 + 1.2; 
                        this.speedY = Math.random() * 1.0 + 0.4;
                    } else if (r > 0.5) {
                        this.size = Math.random() * 1.2 + 0.5;
                        this.speedY = Math.random() * 0.7 + 0.2;
                    } else {
                        this.size = Math.random() * 0.6 + 0.2;
                        this.speedY = Math.random() * 0.4 + 0.1;
                    }
                } else {
                    this.size = Math.random() * 180 + 70; // Larger glows
                    this.speedY = Math.random() * 0.15 + 0.05;
                }

                this.speedX = (Math.random() - 0.5) * (this.type === 'star' ? 0.4 : 0.15);
                
                // Color variety: More Saffron Gold and Soft Cream for a premium look
                const colorPick = Math.random();
                if (colorPick > 0.4) {
                    this.baseColor = '212, 175, 55'; // Gold (60% weight)
                } else if (colorPick > 0.1) {
                    this.baseColor = '255, 245, 225'; // Cream/White (30% weight)
                } else {
                    this.baseColor = '139, 0, 0';   // Maroon (10% weight)
                }

                this.sparkle = Math.random() * 0.03 + 0.01;
                this.alpha = Math.random();
                this.parallaxFactor = this.size * 0.05; // Deeper particles move less
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                
                // Add more organic "drifting" swing
                this.x += Math.sin(this.y * 0.005) * (this.type === 'star' ? 0.8 : 0.4);

                this.alpha += this.sparkle;
                // Faster twinkle for stars
                if (this.alpha > 0.9 && this.sparkle > 0) this.sparkle *= -1;
                if (this.alpha < 0.1 && this.sparkle < 0) this.sparkle *= -1;

                if (this.y > h + 100) {
                    this.y = -100;
                    this.x = Math.random() * w;
                    this.alpha = 0; // Fade in from top
                }
                if (this.y < -100) this.y = h + 100;
                if (this.x > w + 100) this.x = -100;
                if (this.x < -100) this.x = w + 100;
            }
            draw() {
                // Apply subtle parallax offset only during draw to keep base coordinates stable
                const px = this.x + (mouseX - w / 2) * this.parallaxFactor * 0.02;
                const py = this.y + (mouseY - h / 2) * this.parallaxFactor * 0.02;

                ctx.beginPath();
                if (this.type === 'star') {
                    ctx.fillStyle = `rgba(${this.baseColor}, ${this.alpha})`;
                    ctx.arc(px, py, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Only draw glow for the absolute largest stars to save performance
                    if (this.size > 2.2) {
                        ctx.beginPath();
                        ctx.fillStyle = `rgba(${this.baseColor}, ${this.alpha * 0.12})`;
                        ctx.arc(px, py, this.size * 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    const gradient = ctx.createRadialGradient(px, py, 0, px, py, this.size);
                    gradient.addColorStop(0, `rgba(${this.baseColor}, ${this.alpha * 0.18})`);
                    gradient.addColorStop(0.5, `rgba(${this.baseColor}, ${this.alpha * 0.08})`);
                    gradient.addColorStop(1, `rgba(${this.baseColor}, 0)`);
                    ctx.fillStyle = gradient;
                    ctx.arc(px, py, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        const initParticles = () => {
            particles = [];
            // Adjusted density: 300 on desktop, 150 on mobile as requested
            const starCount = window.innerWidth < 768 ? 150 : 300; 

            for (let i = 0; i < starCount; i++) {
                const p = new Particle('star');
                p.alpha = Math.random(); // Random starting visibility
                particles.push(p);
            }
        };
        initParticles();

        let isVisible = true;
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        observer.observe(canvas);

        const animateParticles = () => {
            if (!isVisible) {
                requestAnimationFrame(animateParticles);
                return;
            }
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }

    const updateFilterListeners = () => {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const allCards = document.querySelectorAll('.product-card');

        filterBtns.forEach(btn => {
            btn.onclick = () => { // Use onclick to overwrite previous listener if any, or just add new
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                allCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px) scale(0.95)';
                        setTimeout(() => card.style.display = 'none', 400);
                    }
                });
                
                setTimeout(() => {
                    window.dispatchEvent(new Event('scroll'));
                }, 100);
            };
        });
    };

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        e.preventDefault();
        const filter = btn.getAttribute('data-filter').toLowerCase();

        // 1. Force only ONE button to be active
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 2. Filter all product cards (Static + Dynamic)
        applyCombinedFilters();

        // 3. Sync scroll and Lenis
        setTimeout(() => {
            if (window.lenis) window.lenis.resize();
            window.dispatchEvent(new Event('scroll'));
        }, 450);
    });

    // 11. Search Functionality
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', () => {
            applyCombinedFilters();
        });
    }

    function applyCombinedFilters() {
        const searchQuery = productSearch ? productSearch.value.toLowerCase().trim() : '';
        const activeBtn = document.querySelector('.filter-btn.active');
        const filter = activeBtn ? activeBtn.getAttribute('data-filter').toLowerCase() : 'all';
        const cards = document.querySelectorAll('.product-card');

        cards.forEach(card => {
            const category = (card.getAttribute('data-category') || '').toLowerCase();
            const title = card.querySelector('h3')?.innerText.toLowerCase() || '';
            const desc = card.querySelector('p')?.innerText.toLowerCase() || '';
            
            const matchesFilter = filter === 'all' || category === filter;
            const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
                // Trigger reflow for animation
                card.offsetHeight;
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translate3d(0, 0, 0) scale(1)';
                    card.style.pointerEvents = 'all';
                });
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translate3d(0, 20px, 0) scale(0.92)';
                card.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 400);
            }
        });

        // Resize Lenis after filters applied
        setTimeout(() => {
            if (window.lenis) window.lenis.resize();
        }, 500);
    }

    // 11b. Initial URL Filter Handler
    const handleUrlFilter = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlFilter = urlParams.get('filter');
        if (urlFilter) {
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${urlFilter.toLowerCase()}"]`);
            if (filterBtn) {
                // Wait a bit for other scripts (like Supabase loader) to be ready
                setTimeout(() => filterBtn.click(), 100);
            }
        }
    };
    handleUrlFilter();


    // 12. Cart Management System
    window.CartManager = {
        items: [],
        
        init() {
            this.load();
            this.setupListeners();
            this.render();
        },

        load() {
            const savedCart = localStorage.getItem('vv_cart');
            if (savedCart) {
                try {
                    this.items = JSON.parse(savedCart);
                } catch(e) {
                    this.items = [];
                }
            }
        },

        save() {
            localStorage.setItem('vv_cart', JSON.stringify(this.items));
            this.render();
        },

        addItem(name, image) {
            if (!name) return;
            const existing = this.items.find(item => item.name === name && item.image === image);
            if (existing) {
                existing.quantity += 1;
            } else {
                this.items.push({ name, image: image || '', quantity: 1 });
            }
            this.save();
        },

        updateQuantity(index, delta) {
            if (this.items[index]) {
                this.items[index].quantity += delta;
                if (this.items[index].quantity <= 0) {
                    this.items.splice(index, 1);
                }
                this.save();
            }
        },

        clearAll() {
            if (this.items.length > 0 && confirm('Are you sure you want to clear your cart?')) {
                this.items = [];
                this.save();
            }
        },

        removeItem(index) {
            if (this.items[index]) {
                this.items.splice(index, 1);
                this.save();
            }
        },

        getTotalCount() {
            return this.items.reduce((sum, item) => sum + item.quantity, 0);
        },

        setupListeners() {
            // Toggle Cart
            document.getElementById('cartToggle')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
            document.getElementById('closeCart')?.addEventListener('click', () => this.close());
            document.getElementById('cartOverlay')?.addEventListener('click', () => this.close());
            document.getElementById('clearAllBtn')?.addEventListener('click', () => this.clearAll());
            document.getElementById('cartContactBtn')?.addEventListener('click', () => this.sendToWhatsApp());

            // Add to Cart Buttons (Global Delegation)
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.add-to-cart');
                if (btn) {
                    e.preventDefault();
                    
                    // Visual feedback
                    const originalText = btn.innerText;
                    if (!btn.classList.contains('adding')) {
                        btn.innerText = 'Added ✓';
                        btn.classList.add('adding');
                        btn.style.pointerEvents = 'none';
                        
                        // Haptic-like visual pop
                        const card = btn.closest('.product-card');
                        if (card) {
                            card.style.transform = 'scale(0.98) translateY(2px)';
                            setTimeout(() => {
                                card.style.transform = 'scale(1) translateY(0)';
                            }, 150);
                        }
                        
                        setTimeout(() => {
                            btn.innerText = originalText;
                            btn.classList.remove('adding');
                            btn.style.pointerEvents = 'all';
                        }, 2000);
                    }

                    const card = btn.closest('.product-card') || btn.closest('.curated-item');
                    if (card) {
                        const h3 = card.querySelector('h3');
                        const img = card.querySelector('img');
                        const name = h3 ? h3.innerText : 'Exclusive Product';
                        const image = img ? img.src : '';
                        this.addItem(name, image);
                    }
                }
            });
        },

        render() {
            const list = document.getElementById('cartItemsList');
            const countBadge = document.getElementById('cartCount');
            const totalCountText = document.getElementById('cartTotalCount');
            const finalCountText = document.getElementById('finalItemsCount');

            const total = this.getTotalCount();
            
            if (countBadge) {
                countBadge.innerText = total;
                countBadge.classList.toggle('visible', total > 0);
            }
            if (totalCountText) totalCountText.innerText = `(${total})`;
            if (finalCountText) finalCountText.innerText = total;

            if (!list) return;

            if (this.items.length === 0) {
                list.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>';
                if (document.querySelector('.cart-footer')) document.querySelector('.cart-footer').style.display = 'none';
            } else {
                if (document.querySelector('.cart-footer')) document.querySelector('.cart-footer').style.display = 'block';
                list.innerHTML = this.items.map((item, index) => `
                    <div class="cart-item">
                        <img src="${item.image}" class="cart-item-img" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="cart-item-controls">
                                <div class="quantity-selector">
                                    <button class="qty-btn" onclick="CartManager.updateQuantity(${index}, -1)">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="qty-btn" onclick="CartManager.updateQuantity(${index}, 1)">+</button>
                                </div>
                                <button class="item-remove" onclick="CartManager.removeItem(${index})">Remove</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        },

        open() {
            document.getElementById('cartDrawer')?.classList.add('active');
            document.getElementById('cartOverlay')?.classList.add('active');
            if (window.lenis) window.lenis.stop();
        },

        close() {
            document.getElementById('cartDrawer')?.classList.remove('active');
            document.getElementById('cartOverlay')?.classList.remove('active');
            if (window.lenis) window.lenis.start();
        },

        sendToWhatsApp() {
            if (this.items.length === 0) return;

            let message = "Hello, I would like to purchase:\n\n";
            this.items.forEach(item => {
                message += `• ${item.name} ×${item.quantity}\n`;
            });

            const encodedMsg = encodeURIComponent(message);
            window.open(`https://wa.me/919788742627?text=${encodedMsg}`, '_blank');
        }
    };


    // 13. Visibility Logic for Cart Toggle (Always show)
    const cartToggle = document.getElementById('cartToggle');

    if (cartToggle) {
        cartToggle.style.opacity = '1';
        cartToggle.style.pointerEvents = 'all';
        cartToggle.style.transform = 'scale(1)';
    }

    window.CartManager.init();
});

/* ATTRACTIVE FLOATING PARTICLES (Replacing Petals) */
function createBackgroundParticle() {
    const p = document.createElement('div');
    // Using a mix of dots and small stars for "Particle" feel
    const isStar = Math.random() > 0.5;
    p.innerHTML = isStar ? '✨' : '•';
    p.style.position = 'fixed';
    p.style.top = '-50px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.fontSize = isStar ? (Math.random() * 10 + 5) + 'px' : (Math.random() * 15 + 5) + 'px';
    p.style.color = 'var(--accent-gold)';
    p.style.opacity = Math.random() * 0.4 + 0.1;
    p.style.zIndex = '9999';
    p.style.pointerEvents = 'none';
    p.style.transition = 'transform 12s linear, opacity 12s linear';
    document.body.appendChild(p);

    requestAnimationFrame(() => {
        const tx = (Math.random() - 0.5) * 300;
        const ty = window.innerHeight + 150;
        const rot = Math.random() * 720;
        p.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
        p.style.opacity = '0';
    });

    setTimeout(() => p.remove(), 12000);
}

// Increased frequency for a more active background
setInterval(createBackgroundParticle, 800);

