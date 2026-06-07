import './style.css';
import { initAnimations } from './animations.js';

// Initialize all GSAP animations
initAnimations();

const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d', { alpha: true });
const textOverlay = document.getElementById('hero-text');

const frameCount = 240;
const currentFrame = index => (
  `/sprite/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
let loadedImages = 0;

// Set initial canvas dimensions
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render();
}
window.addEventListener('resize', resizeCanvas);

// Preload all images
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  img.onload = () => {
    loadedImages++;
    if (i === 0) {
      // Initialize first frame right away
      resizeCanvas();
    }
  };
  images.push(img);
}

let scrollProgress = 0;

function render() {
  if (images[0] && images[0].complete) {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw current frame based on scroll progress
    const frameIndex = Math.min(
      Math.floor(scrollProgress * frameCount),
      frameCount - 1
    );
    const img = images[frameIndex];
    
    if (img && img.complete) {
      // Calculate scale to "cover" the canvas
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  }
}

function handleScroll() {
  const html = document.documentElement;
  const heroSection = document.querySelector('.hero-section');
  
  if (!heroSection) return;
  
  // Calculate scroll progress within the hero section
  const scrollTop = html.scrollTop;
  // Calculate max scroll (we subtract window.innerHeight because when we reach the bottom of the section, we want progress=1)
  const maxScroll = heroSection.scrollHeight - window.innerHeight;
  
  // Clamp progress between 0 and 1
  scrollProgress = Math.max(0, Math.min(scrollTop / maxScroll, 1));
  
  // Render canvas
  requestAnimationFrame(render);
  
  // Text fade out (fade out slowly as user scrolls the first 20% of the section)
  let opacity = 1 - (scrollProgress / 0.2);
  opacity = Math.max(0, Math.min(opacity, 1));
  
  // Apply a subtle scale up/down effect as it fades out
  const scale = 1 + (scrollProgress * 0.5);
  
  if (textOverlay) {
    textOverlay.style.opacity = opacity.toFixed(3);
    textOverlay.style.transform = `translate(-50%, -50%) scale(${scale})`;
    textOverlay.style.display = scrollProgress >= 0.2 ? 'none' : 'block';
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });
