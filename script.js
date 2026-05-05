document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis for Premium Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.5, // Slightly longer for "buttery" feel
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.1, // Improved response
        smoothTouch: true, // Enable smooth touch for mobile
        touchMultiplier: 1.5,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
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
    const renderCursor = () => {
        // Calculate speed for velocity-based effects
        const deltaX = mouseX - lastMouseX;
        const deltaY = mouseY - lastMouseY;
        speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        if (cursor) {
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        }

        followerX += (mouseX - followerX) * 0.2; // Snappier lerp (0.2 instead of 0.15)
        followerY += (mouseY - followerY) * 0.2;

        if (cursorFollower) {
            cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
            
            // For rotation and scaling, we use a separate wrapper if possible, 
            // but since we can't change HTML structure easily, we'll combine them 
            // but use translate3d for GPU acceleration.

            // Dynamic scaling based on speed (stretching effect)
            const scaleX = 1 + speed * 0.008;
            const scaleY = 1 - speed * 0.004;
            const angle = Math.atan2(mouseY - followerY, mouseX - followerX) * (180 / Math.PI);

            cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
        }

        const previewImg = document.getElementById('hoverPreviewImg');
        if (previewImg && previewImg.classList.contains('active')) {
            previewImg.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
        }

        // Decelerate speed for smooth stopping
        speed *= 0.85;

        requestAnimationFrame(renderCursor);
    };
    renderCursor();

    // Hover states for cursor
    const interactiveSelectors = 'a, button, .accordion-header, .filter-btn, .close-modal, .floating-wa, .product-card, .video-card';
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

    // 3. Magnetic Buttons
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const magnetics = document.querySelectorAll('.magnetic');

    if (!isTouchDevice) {
        magnetics.forEach(btn => {
            let rect;
            btn.addEventListener('mouseenter', function() {
                rect = this.getBoundingClientRect();
            });
            btn.addEventListener('mousemove', function (e) {
                if (!rect) rect = this.getBoundingClientRect();
                const strength = this.getAttribute('data-strength') || 20;
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                this.style.transform = `translate(${x / rect.width * strength}px, ${y / rect.height * strength}px)`;
            });

            btn.addEventListener('mouseleave', function () {
                rect = null;
                this.style.transform = `translate(0px, 0px)`;
            });
        });
    }

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
    const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

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

            el.innerText = current + (target === 100 ? '' : '+');

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

    // Hero Parallax on mouse move
    const hero = document.querySelector('.hero');
    const heroBgImg = document.querySelector('.hero .bg-img');
    if (hero && heroBgImg) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;
            requestAnimationFrame(() => {
                heroBgImg.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
            });
        });
        hero.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => heroBgImg.style.transform = `scale(1.1) translate(0px, 0px)`);
        });
    }    // 8. Gallery Filtering - Unified Logic (Moved to bottom to handle dynamic cards)
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

        hamburgerBtn.addEventListener('click', () => toggleMobileMenu(true));
        if (mobileClose) mobileClose.addEventListener('click', () => toggleMobileMenu(false));
        mobileLinks.forEach(link => link.addEventListener('click', () => toggleMobileMenu(false)));
    }

    // 9d. Lightbox for Gallery
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    if (lightbox) {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const imgSrc = card.querySelector('img').src;
                const title = card.querySelector('h3').innerText;
                if (lightboxImg) lightboxImg.src = imgSrc;
                if (lightboxCaption) lightboxCaption.innerText = title;
                lightbox.classList.add('active');
            });
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

    openBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

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
                <button class="btn-primary magnetic glow-effect" data-strength="20" style="width: 100%; margin-top: 25px; padding: 1.2rem;" onclick="window.open('https://wa.me/919788742627', '_blank')">Order this Collection on WhatsApp</button>
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

            // Re-bind magnetics for new button
            const newMag = modalBody.querySelector('.magnetic');
            if (newMag) {
                newMag.addEventListener('mousemove', function (e) {
                    const rect = this.getBoundingClientRect();
                    const strength = this.getAttribute('data-strength') || 20;
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    this.style.transform = `translate(${x / rect.width * strength}px, ${y / rect.height * strength}px)`;
                });
                newMag.addEventListener('mouseleave', function () {
                    this.style.transform = `translate(0px, 0px)`;
                });
            }
        }, 1500);
    });

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
                        this.size = Math.random() * 3 + 1.5; // Larger stars
                        this.speedY = Math.random() * 0.6 + 0.2;
                    } else if (r > 0.5) {
                        this.size = Math.random() * 1.5 + 0.5; // Medium stars
                        this.speedY = Math.random() * 0.4 + 0.1;
                    } else {
                        this.size = Math.random() * 0.8 + 0.2; // Tiny dust-like dots
                        this.speedY = Math.random() * 0.2 + 0.05;
                    }
                } else {
                    this.size = Math.random() * 180 + 70; // Larger glows
                    this.speedY = Math.random() * 0.15 + 0.05;
                }

                this.speedX = (Math.random() - 0.5) * (this.type === 'star' ? 0.4 : 0.15);
                
                // Color variety: Saffron Gold, Kumkum Maroon, and Soft Cream
                const colorPick = Math.random();
                if (colorPick > 0.6) {
                    this.baseColor = '212, 175, 55'; // Gold
                } else if (colorPick > 0.3) {
                    this.baseColor = '139, 0, 0';   // Maroon
                } else {
                    this.baseColor = '255, 245, 225'; // Cream/White
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
                    ctx.arc(px, py, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${this.baseColor}, ${this.alpha})`;
                    ctx.fill();
                    
                    // Optimization: Removed expensive shadowBlur. 
                    // Larger stars get a secondary outer fill for a soft glow look
                    if (this.size > 2) {
                        ctx.beginPath();
                        ctx.arc(px, py, this.size * 2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${this.baseColor}, ${this.alpha * 0.2})`;
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
            // Optimized density for smoothness: medium count for a balanced aesthetic
            const starCount = window.innerWidth < 768 ? 50 : 120; // Reduced count for performance

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

    // 12. Dynamic Product Fetching from Supabase
    const fetchDynamicProducts = async () => {
        const grid = document.getElementById('dynamic-product-grid');
        if (!grid) return;

        const SUPABASE_URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

        // Add a premium loading state
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'dynamic-loading';
        loadingMsg.className = 'text-center py-10 w-full';
        loadingMsg.innerHTML = '<p style="color: var(--primary-maroon); font-size: 1.2rem; font-weight: 500;">✨ Loading our exclusive collection...</p>';
        grid.appendChild(loadingMsg);

        try {
            console.log('🔗 Connecting to Supabase...');
            const cacheBuster = Date.now();
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc&t=${cacheBuster}`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const products = await response.json();
            
            if (document.getElementById('dynamic-loading')) {
                document.getElementById('dynamic-loading').remove();
            }

            if (products && products.length > 0) {
                // Get the currently active filter
                const activeBtn = document.querySelector('.filter-btn.active');
                const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

                products.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'product-card dynamic-card reveal-on-scroll visible';
                    card.setAttribute('data-category', product.category);
                    
                    // Check if this card matches the active filter
                    if (activeFilter !== 'all' && product.category !== activeFilter) {
                        card.style.display = 'none';
                        card.style.opacity = '0';
                    } else {
                        card.style.display = 'block';
                        card.style.opacity = '1';
                    }
                    
                    card.innerHTML = `
                        <div class="product-img">
                            <div class="new-badge" style="position: absolute; top: 15px; left: 15px; background: var(--accent-gold); color: var(--white); padding: 5px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; z-index: 10; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">NEW ARRIVAL</div>
                            <img loading="lazy" decoding="async" src="${product.image_url}" alt="${product.name}" width="400" height="400" style="object-fit: cover; opacity: 1;">
                        </div>
                        <div class="product-info">
                            <div class="product-rating">⭐ 5.0</div>
                            <h3 class="font-serif">${product.name}</h3>
                            <p>${product.description}</p>
                            <button class="btn-primary w-full magnetic" data-strength="20">Contact for Purchase</button>
                        </div>
                    `;
                    grid.prepend(card);
                });

                // Update filter buttons to recognize new cards
                updateFilterListeners();
                
                // Refresh layout
                window.dispatchEvent(new Event('scroll'));
            } else {
                const noProductsMsg = document.createElement('div');
                noProductsMsg.className = 'text-center py-10 w-full';
                noProductsMsg.innerHTML = '<p style="color: var(--text-light);">No dynamic products found. Add some in the Admin Panel!</p>';
                grid.appendChild(noProductsMsg);
            }
        } catch (error) {
            console.error('Error fetching dynamic products:', error);
            if (document.getElementById('dynamic-loading')) {
                document.getElementById('dynamic-loading').innerHTML = '<p style="color: #ff4d4d;">Failed to connect to the collection. Please refresh the page.</p>';
            }
        }
    };

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

    // === MASTER CATEGORY FILTER FIX (Magnetic-Aware) ===
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        e.preventDefault();
        const filter = btn.getAttribute('data-filter').toLowerCase();

        // 1. Force only ONE button to be active
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 2. Filter all product cards (Static + Dynamic)
        document.querySelectorAll('.product-card').forEach(card => {
            const category = (card.getAttribute('data-category') || '').toLowerCase();
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => card.style.display = 'none', 300);
            }
        });

        // 3. Sync scroll
        setTimeout(() => window.dispatchEvent(new Event('scroll')), 100);
    });

    fetchDynamicProducts();
});

