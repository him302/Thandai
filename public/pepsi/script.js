document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('hero-canvas');
    const context = canvas.getContext('2d');
    
    // Total number of frames in the pepsi folder
    const frameCount = 240;
    const images = [];
    let imagesLoaded = 0;
    
    // Helper to pad numbers with leading zeros (e.g., 001, 002)
    const currentFrame = index => (
        `pepsi/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
    );

    // Preload all frames for smooth animation
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
            imagesLoaded++;
            // Render the first frame as soon as it loads to prevent empty canvas
            if (imagesLoaded === 1) {
                resizeCanvas();
            }
        };
        images.push(img);
    }

    // Renders a specific frame to the canvas, covering the entire area
    function render(index) {
        if (!images[index] || !images[index].complete) return;
        
        const img = images[index];
        
        // Clear previous frame
        // Reset scale before clearing to ensure whole canvas is cleared
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // High DPI displays support
        const dpr = window.devicePixelRatio || 1;
        context.scale(dpr, dpr);
        
        // Logical width/height for drawing
        const logicalWidth = canvas.width / dpr;
        const logicalHeight = canvas.height / dpr;

        // Maintain aspect ratio while covering the canvas
        const canvasRatio = logicalWidth / logicalHeight;
        const imgRatio = img.width / img.height;
        
        let drawWidth = logicalWidth;
        let drawHeight = logicalHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
            drawWidth = logicalHeight * imgRatio;
            offsetX = (logicalWidth - drawWidth) / 2;
        } else {
            drawHeight = logicalWidth / imgRatio;
            offsetY = (logicalHeight - drawHeight) / 2;
        }

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    // Resize canvas and re-render current frame
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        
        // Set visually displayed size
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        
        updateScroll(); 
    }

    const textElement = document.querySelector('.overlay-text');
    const heroSection = document.querySelector('.hero-section');

    function updateScroll() {
        const scrollTop = document.documentElement.scrollTop;
        const maxScrollTop = heroSection.scrollHeight - window.innerHeight;
        
        // Ensure scroll fraction is strictly between 0 and 1
        const scrollFraction = Math.max(0, Math.min(1, maxScrollTop > 0 ? scrollTop / maxScrollTop : 0));
        
        // Calculate the corresponding frame
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );
        
        requestAnimationFrame(() => render(frameIndex));
        
        // --- Text Animation Logic ---
        // Requirement: Fade out slowly as user scrolls 30% of the section.
        // scrollFraction 0.0 -> opacity 1.0
        // scrollFraction 0.3 -> opacity 0.0
        let opacity = 1 - (scrollFraction / 0.3);
        
        // Clamp opacity
        opacity = Math.max(0, Math.min(1, opacity));
        textElement.style.opacity = opacity;
        
        // Add a premium subtle upward motion as it fades
        const translateY = -(1 - opacity) * 40; 
        const scale = 1 + (1 - opacity) * 0.05;
        textElement.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`;
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', updateScroll);
    
    // Initial call
    resizeCanvas();

    // --- GSAP ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    // 1. Horizontal Scroll for Product Showcase
    const productTrack = document.querySelector('.product-track');
    if (productTrack) {
        gsap.to(productTrack, {
            x: () => -(productTrack.scrollWidth - window.innerWidth + 100) + "px",
            ease: "none",
            scrollTrigger: {
                trigger: ".product-showcase",
                pin: true,
                scrub: 1,
                end: () => "+=" + productTrack.scrollWidth
            }
        });
    }

    // 2. Global Impact Counters
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        ScrollTrigger.create({
            trigger: counter,
            start: "top 80%",
            onEnter: () => {
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    snap: { innerHTML: 1 },
                    ease: "power2.out"
                });
            },
            once: true
        });
    });

    // 3. Flavor Universe Pinning & Transitions
    const fCards = document.querySelectorAll('.f-card');
    const fIndicators = document.querySelectorAll('.indicator');
    const flavorSection = document.getElementById('flavor-universe');
    
    if (flavorSection) {
        ScrollTrigger.create({
            trigger: flavorSection,
            start: "top top",
            end: "+=2000",
            pin: true,
            scrub: true,
            onUpdate: (self) => {
                const progress = self.progress;
                let activeIndex = 0;
                
                if (progress < 0.33) {
                    activeIndex = 0;
                    flavorSection.style.backgroundColor = 'var(--pepsi-black)';
                } else if (progress < 0.66) {
                    activeIndex = 1;
                    flavorSection.style.backgroundColor = '#000';
                } else {
                    activeIndex = 2;
                    flavorSection.style.backgroundColor = '#1a0000'; // dark cherry
                }

                fCards.forEach((card, index) => {
                    if (index === activeIndex) {
                        card.classList.add('active');
                        fIndicators[index].classList.add('active');
                    } else {
                        card.classList.remove('active');
                        fIndicators[index].classList.remove('active');
                    }
                });
            }
        });
        
        // init first card
        if (fCards.length > 0) fCards[0].classList.add('active');
    }

    // 4. Entertainment Parallax
    gsap.utils.toArray('.split-card').forEach((card, i) => {
        gsap.from(card, {
            y: 100,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
            }
        });
    });

    // 7. Legacy Timeline Animation
    gsap.utils.toArray('.time-item').forEach(item => {
        gsap.from(item, {
            x: item.offsetLeft > window.innerWidth / 2 ? 100 : -100,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: item,
                start: "top 80%"
            }
        });
    });

    // 8. Interactive Experience Lab (Mouse move)
    const labSection = document.getElementById('experience-lab');
    const labCursor = document.querySelector('.lab-cursor-light');
    const interactiveCan = document.getElementById('interactive-can');

    if (labSection) {
        labSection.addEventListener('mousemove', (e) => {
            // Update light cursor position
            gsap.to(labCursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1
            });

            // Rotate can based on mouse position relative to center of screen
            const xAxis = (window.innerWidth / 2 - e.clientX) / 25;
            const yAxis = (window.innerHeight / 2 - e.clientY) / 25;

            interactiveCan.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        labSection.addEventListener('mouseenter', () => {
            interactiveCan.style.transition = 'none';
        });

        labSection.addEventListener('mouseleave', () => {
            interactiveCan.style.transition = 'transform 0.5s ease';
            interactiveCan.style.transform = 'rotateY(0deg) rotateX(0deg)';
        });
    }

});


/* --- GLOBAL LOADER --- */
const removeLoader = () => {
    const loader = document.getElementById('global-loader');
    const progressBar = document.getElementById('loader-progress');
    if (progressBar && loader && !loader.classList.contains('hidden')) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                progressBar.style.width = '100%';
                setTimeout(() => { loader.classList.add('hidden'); document.body.style.overflow = ''; }, 500);
            } else {
                progressBar.style.width = progress + '%';
            }
        }, 100);
    }
};
window.addEventListener('load', removeLoader);
setTimeout(removeLoader, 3000);

/* --- GSAP ANIMATIONS & LENIS --- */
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        if (typeof Lenis !== 'undefined') {
            window.lenis = new Lenis({
                duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical', smooth: true
            });
            window.lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { window.lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        }
        
        const fadeElements = document.querySelectorAll('.fade-up');
        fadeElements.forEach((el) => {
            ScrollTrigger.create({ trigger: el, start: "top 85%", onEnter: () => el.classList.add('visible'), once: true });
        });
    }
});
