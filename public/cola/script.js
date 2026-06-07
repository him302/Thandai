const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');
const textOverlay = document.getElementById('text-overlay');
const animationContainer = document.querySelector('.animation-container');

const frameCount = 240;
// Note: using relative path to the coca cola directory
const currentFrame = index => (
  `coca cola/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];

const preloadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.onload = () => {
        // Draw first frame immediately when it loads
        if (i === 0) {
            drawImageOnCanvas(img);
            textOverlay.style.opacity = 1;
        }
    };
    img.src = currentFrame(i);
    images[i] = img;
  }
};

const drawImageOnCanvas = (img) => {
    // Set canvas internal dimensions to window size to ensure high quality
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Scale image to cover the canvas completely (no empty space)
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const width = img.width * scale;
    const height = img.height * scale;
    
    // Center horizontally
    const x = (canvas.width - width) / 2;
    
    // Align to top so the top of the image doesn't get cut off when it overflows
    const y = 0;
    
    // Use a composite operation that blends well if the image has a black background
    // (uncomment if the jpgs have a black background and you want the CSS gradient to show through)
    // context.globalCompositeOperation = 'screen'; 
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, x, y, width, height);
};

// Start preloading
preloadImages();

const handleScroll = () => {
    const scrollTop = window.scrollY;
    // Determine max scroll length based on container height minus viewport height
    const maxScroll = animationContainer.scrollHeight - window.innerHeight;
    
    // Ensure we don't divide by zero
    if (maxScroll <= 0) return;
    
    let scrollFraction = scrollTop / maxScroll;
    
    // Clamp between 0 and 1
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));
    
    // Determine the frame index
    const frameIndex = Math.floor(scrollFraction * (frameCount - 1));
    
    requestAnimationFrame(() => {
        // Draw the frame if it's loaded
        if (images[frameIndex] && images[frameIndex].complete) {
            drawImageOnCanvas(images[frameIndex]);
        }
        
        // Text animation: Fade in at start, fade out slowly as user scrolls 30%
        // We'll let it be fully visible at 0%, and reach 0% opacity at 30% scroll
        let opacity = 1;
        const fadeEndFraction = 0.3; // 30% of the section
        
        if (scrollFraction > 0) {
           opacity = 1 - (scrollFraction / fadeEndFraction);
        }
        // Clamp opacity
        opacity = Math.max(0, Math.min(1, opacity));
        
        textOverlay.style.opacity = opacity.toFixed(3);
        
        // Add a slight parallax/translation effect to the text as it fades out
        const yOffset = scrollFraction * 150; 
        textOverlay.style.transform = `translate(-50%, calc(-50% - ${yOffset}px))`;
    });
};

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll);

/* --- GSAP ANIMATIONS --- */
// Make sure GSAP is loaded before executing
document.addEventListener("DOMContentLoaded", (event) => {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // 1. Horizontal Scroll for Products
    const track = document.querySelector('.horizontal-track');
    const container = document.querySelector('.product-showcase');
    
    if (track && container) {
        gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.2) + "px",
            ease: "none",
            scrollTrigger: {
                trigger: container,
                pin: true,
                scrub: 1,
                end: () => "+=" + track.scrollWidth
            }
        });
    }

    // 2. Statistics Counters
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        gsap.to(stat, {
            innerHTML: target,
            duration: 2.5,
            snap: { innerHTML: 1 },
            scrollTrigger: {
                trigger: stat,
                start: "top 80%",
            },
            onUpdate: function() {
                // Add commas for large numbers
                stat.innerHTML = Math.round(stat.innerHTML).toLocaleString();
            }
        });
    });

    // 3. Flavours Background Morph & Reveals
    const flavoursSection = document.querySelector('.flavours-experience');
    const themes = document.querySelectorAll('.flavor-theme');
    
    if (flavoursSection && themes.length > 0) {
        ScrollTrigger.create({
            trigger: flavoursSection,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: () => gsap.to(flavoursSection, {backgroundColor: '#2a0202', duration: 1}),
            onLeaveBack: () => gsap.to(flavoursSection, {backgroundColor: 'transparent', duration: 1})
        });

        themes.forEach((theme, i) => {
            gsap.fromTo(theme, 
                { opacity: 0, scale: 0.8 },
                { 
                    opacity: 1, 
                    scale: 1,
                    scrollTrigger: {
                        trigger: flavoursSection,
                        start: "top " + (80 - (i * 20)) + "%",
                        end: "bottom " + (60 - (i * 20)) + "%",
                        scrub: true
                    }
                }
            );
        });
    }

    // 4. Cinematic Typography Reveal (Business Section)
    const cinematicText = document.querySelector('.cinematic-text');
    if (cinematicText) {
        gsap.fromTo(cinematicText,
            { opacity: 0, y: 100, scale: 0.9 },
            { 
                opacity: 0.9, 
                y: 0, 
                scale: 1,
                scrollTrigger: {
                    trigger: '.business-impact',
                    start: "top 60%",
                    end: "top 20%",
                    scrub: 1
                }
            }
        );
    }

    // 5. Timeline Eras Fade In
    const eras = document.querySelectorAll('.timeline-era');
    eras.forEach(era => {
        ScrollTrigger.create({
            trigger: era,
            start: "top center",
            onEnter: () => era.classList.add('active'),
            onLeaveBack: () => era.classList.remove('active')
        });
    });
});
