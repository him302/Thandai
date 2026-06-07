
        gsap.registerPlugin(ScrollTrigger);

        const canvas = document.getElementById("fanta-canvas");
        const context = canvas.getContext("2d");

        // Set high resolution for premium feel
        canvas.width = 1920;
        canvas.height = 1080;

        const frameCount = 240;
        const currentFrame = index => (
            `ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`
        );

        const images = [];
        const fantaObj = {
            frame: 0
        };

        // Loading states
        let loadedImages = 0;

        // Preload images
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loadedImages++;
                if(loadedImages === 1) {
                    render(); // Render first frame ASAP
                }
            };
            images.push(img);
        }

        function render() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            const img = images[fantaObj.frame];
            if(img && img.complete) {
                // Calculate cover math
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio = Math.max(hRatio, vRatio);
                const centerShift_x = (canvas.width - img.width * ratio) / 2;
                const centerShift_y = (canvas.height - img.height * ratio) / 2;
                
                context.drawImage(img, 0,0, img.width, img.height,
                                  centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
            }
        }

        // --- Animations ---

        // 1. Image Sequence Scrubber
        gsap.to(fantaObj, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: "#hero-section",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5 // smooth scrubbing
            },
            onUpdate: render
        });

        // 2. Text Fade Out (First 30% of scroll)
        gsap.to("#overlay-text", {
            opacity: 0,
            y: -100,
            scale: 0.9,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: "#hero-section",
                start: "top top",
                end: "30% top",
                scrub: true
            }
        });

        // Hide scroll indicator on scroll
        gsap.to("#scroll-indicator", {
            opacity: 0,
            ease: "power1.out",
            scrollTrigger: {
                trigger: "#hero-section",
                start: "1% top",
                end: "10% top",
                scrub: true
            }
        });

        // 3. Initial Load Animations
        gsap.from("#overlay-text h1", {
            opacity: 0,
            y: 50,
            duration: 1.5,
            delay: 0.2,
            ease: "power3.out"
        });

        gsap.from("#overlay-text p", {
            opacity: 0,
            y: 30,
            duration: 1.5,
            delay: 0.5,
            ease: "power3.out"
        });

        // --- Particles System ---
        const particleContainer = document.getElementById('particles');
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }

        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 1;
            const left = Math.random() * 100;
            const duration = Math.random() * 10 + 5;
            const delay = Math.random() * 10;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `-${delay}s`; // start at random points
            
            // Randomly tint some particles orange
            if (Math.random() > 0.5) {
                particle.style.background = 'rgba(255, 130, 0, 0.6)';
            }
            
            particleContainer.appendChild(particle);
        }
        
        // Ensure rendering happens even if scrolling doesn't trigger immediately
        window.addEventListener('resize', render);
    
        // --- NEW SECTIONS ANIMATIONS ---
        
        // 1. Horizontal Scroll Showcase
        const horizontalWrapper = document.getElementById("horizontal-wrapper");
        const panels = gsap.utils.toArray(".product-panel");
        
        gsap.to(panels, {
            xPercent: -100 * (panels.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: ".sticky-product-container",
                pin: true,
                scrub: 1,
                end: () => "+=" + horizontalWrapper.offsetWidth
            }
        });

        // 3D Card Hover Effect for horizontal sections
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPct = x / rect.width - 0.5;
                const yPct = y / rect.height - 0.5;
                
                gsap.to(card, {
                    rotationY: xPct * 20,
                    rotationX: -yPct * 20,
                    transformPerspective: 1000,
                    ease: "power1.out",
                    duration: 0.5
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    ease: "power2.out",
                    duration: 0.5
                });
            });
        });

        // 2. Statistics Counters
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            ScrollTrigger.create({
                trigger: "#statistics-section",
                start: "top 60%",
                onEnter: () => {
                    gsap.to(stat, {
                        innerHTML: target,
                        duration: 2,
                        ease: "power2.out",
                        snap: { innerHTML: 1 },
                        onUpdate: function() {
                            stat.innerHTML = Math.round(this.targets()[0].innerHTML);
                        }
                    });
                },
                once: true
            });
        });

        // 3. Flavor Universe Transitions
        const universeData = [
            { bg: "#ff6a00", title: "Vibrant Orange", desc: "The original burst of citrus joy." },
            { bg: "#9D4EDD", title: "Bold Grape", desc: "Deep berry flavor explosion." },
            { bg: "#FFC300", title: "Zesty Lemon", desc: "Sharp, sweet refreshment." }
        ];
        
        const universeBg = document.getElementById("universe-bg");
        const universeTitle = document.getElementById("universe-title");
        const universeDesc = document.getElementById("universe-desc");
        
        // Pin universe section
        ScrollTrigger.create({
            trigger: "#flavor-universe",
            start: "top top",
            end: "bottom bottom",
            pin: ".flavor-bg",
        });

        universeData.forEach((data, i) => {
            ScrollTrigger.create({
                trigger: "#flavor-universe",
                start: `${(i / universeData.length) * 100}% top`,
                end: `${((i + 1) / universeData.length) * 100}% top`,
                onEnter: () => updateUniverse(data),
                onEnterBack: () => updateUniverse(data),
            });
        });

        function updateUniverse(data) {
            gsap.to(universeBg, { backgroundColor: data.bg, duration: 1 });
            
            // Text transition
            gsap.timeline()
                .to([universeTitle, universeDesc], { y: -20, opacity: 0, duration: 0.3 })
                .call(() => {
                    universeTitle.textContent = data.title;
                    universeDesc.textContent = data.desc;
                })
                .to([universeTitle, universeDesc], { y: 0, opacity: 1, duration: 0.5 });
        }

        // Particle explosion effect in universe
        function createSplashParticle() {
            const container = document.getElementById('splash-particles');
            if(!container) return;
            const p = document.createElement('div');
            p.className = 'flavor-particle bg-white opacity-40';
            const size = Math.random() * 20 + 5;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = '50%';
            p.style.top = '50%';
            container.appendChild(p);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 200 + 50;
            
            gsap.to(p, {
                x: Math.cos(angle) * velocity,
                y: Math.sin(angle) * velocity + 100, // gravity
                opacity: 0,
                duration: Math.random() * 1 + 1,
                ease: "power1.out",
                onComplete: () => p.remove()
            });
        }
        setInterval(() => {
            if(document.querySelector('.flavor-bg').classList.contains('pin-spacer')) {
                // Only create if we are in view, simplification
                if(Math.random() > 0.5) createSplashParticle();
            }
        }, 100);

        // 4. Tropical Parallax
        gsap.to("#refreshment-img", {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: "#refreshment-experience",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
        
        gsap.to("#refreshment-text", {
            scale: 1.1,
            opacity: 0.5,
            scrollTrigger: {
                trigger: "#refreshment-experience",
                start: "top center",
                end: "bottom top",
                scrub: true
            }
        });

        // 5. Youth Culture Stagger
        gsap.from("#culture-text, #culture-grid > div", {
            y: 100,
            opacity: 0,
            stagger: 0.2,
            duration: 1,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: "#youth-culture",
                start: "top 60%"
            }
        });
        
        // 6. Eco Cards
        gsap.from(".eco-card", {
            y: 50,
            opacity: 0,
            stagger: 0.2,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: "#sustainability",
                start: "top 60%"
            }
        });

        // 7. Legacy Timeline
        const tlLine = document.getElementById("timeline-line");
        const tlItems = document.querySelectorAll(".timeline-item");
        
        gsap.from(tlLine, {
            scaleY: 0,
            ease: "none",
            scrollTrigger: {
                trigger: "#timeline-container",
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });

        tlItems.forEach(item => {
            gsap.to(item, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%"
                }
            });
        });

        // 8. Flavor Lab Interactive
        const labIngredients = document.querySelectorAll('.lab-ingredient');
        const labBg = document.getElementById('lab-bg');
        const labGlow = document.getElementById('lab-glow').firstElementChild;

        labIngredients.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const color = item.getAttribute('data-color');
                labBg.style.backgroundColor = color;
                labBg.style.opacity = "0.2";
                
                labGlow.style.backgroundColor = color;
                labGlow.style.opacity = "0.6";
            });
            item.addEventListener('mouseleave', () => {
                labBg.style.backgroundColor = "#0D0D0D";
                labBg.style.opacity = "1";
                labGlow.style.opacity = "0";
            });
        });
