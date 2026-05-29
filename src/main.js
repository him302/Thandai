import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';

// ==========================================
// 1. STATE & DOM ELEMENTS
// ==========================================
const iframes = {
  cola: document.getElementById('iframe-cola'),
  sprite: document.getElementById('iframe-sprite'),
  pepsi: document.getElementById('iframe-pepsi'),
  fanta: document.getElementById('iframe-fanta')
};

const navBtns = document.querySelectorAll('.nav-btn');
let currentBrand = 'cola';
let isTransitioning = false;

// Theme Colors for Transitions
const brandColors = {
  cola: new THREE.Color(0xe50024),   // Red
  sprite: new THREE.Color(0x00cc33), // Lime Green
  pepsi: new THREE.Color(0x005ce6),  // Electric Blue
  fanta: new THREE.Color(0xff8800)   // Tropical Orange
};

// Initialize Active Button
document.querySelector('.nav-btn.cola').classList.add('active');

// ==========================================
// 1.5. CINEMATIC LOADING SCREEN
// ==========================================
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
const loadingStatus = document.getElementById('loading-status');
const statusMessages = ['Establishing Neural Link...', 'Injecting Carbonation...', 'Syncing Multiverse...', 'Ready.'];
let loadProgress = 0;

function simulateLoading() {
  const interval = setInterval(() => {
    loadProgress += Math.random() * 15;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(interval);
      loadingStatus.innerText = statusMessages[3];
      
      // Dramatic exit
      setTimeout(() => {
        gsap.to(loadingScreen, {
          opacity: 0,
          duration: 1.5,
          ease: "power2.inOut",
          onComplete: () => {
            loadingScreen.style.visibility = 'hidden';
            // Trigger initial cinematic entrance for the active iframe
            const activeIframe = iframes[currentBrand];
            if (activeIframe) {
              gsap.from(activeIframe, { scale: 1.2, filter: 'blur(30px)', duration: 2.5, ease: "power3.out" });
            }
          }
        });
      }, 500);
    }
    
    progressBar.style.width = `${loadProgress}%`;
    
    if (loadProgress < 30) loadingStatus.innerText = statusMessages[0];
    else if (loadProgress < 60) loadingStatus.innerText = statusMessages[1];
    else if (loadProgress < 99) loadingStatus.innerText = statusMessages[2];

  }, 300);
}

// Start loader
window.addEventListener('load', simulateLoading);

// ==========================================
// 2. THREE.JS TRANSITION ENGINE (Bubble Swarm)
// ==========================================
const canvas = document.getElementById('transition-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// Create Bubble Texture dynamically
const bubbleCanvas = document.createElement('canvas');
bubbleCanvas.width = 128;
bubbleCanvas.height = 128;
const bCtx = bubbleCanvas.getContext('2d');
// Radial gradient for 3D bubble effect
const gradient = bCtx.createRadialGradient(64, 64, 20, 64, 64, 60);
gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.8)');
gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
bCtx.fillStyle = gradient;
bCtx.beginPath();
bCtx.arc(64, 64, 64, 0, Math.PI * 2);
bCtx.fill();
const bubbleTexture = new THREE.CanvasTexture(bubbleCanvas);

// Bubble Swarm System
const particleCount = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = [];
const phases = []; // For natural wobbling

function resetBubble(idx) {
  positions[idx] = (Math.random() - 0.5) * 15;
  positions[idx + 1] = -8 - Math.random() * 5;
  positions[idx + 2] = (Math.random() - 0.5) * 10 - 2;
}

for (let i = 0; i < particleCount; i++) {
  // Volume distribution
  positions[i * 3] = (Math.random() - 0.5) * 15;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

  velocities.push({
    y: Math.random() * 0.04 + 0.02, // Upward speed
    wobbleSpeed: Math.random() * 0.05 + 0.01,
    wobbleAmount: Math.random() * 0.03 + 0.01
  });
  phases.push(Math.random() * Math.PI * 2);
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  size: 0.5, // Larger for bubbles
  map: bubbleTexture,
  color: brandColors.cola,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});

const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

// Handle Resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Render Loop
function animate() {
  requestAnimationFrame(animate);

  const positions = particleSystem.geometry.attributes.position.array;
  
  if (isTransitioning) {
    // Dynamic surging bubble movement during transition
    particleSystem.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1; // Gentle sway
    
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      phases[i] += velocities[i].wobbleSpeed; 
      
      positions[idx] += Math.sin(phases[i]) * velocities[i].wobbleAmount; // X wobble
      positions[idx + 1] += velocities[i].y * 4; // Surge upwards quickly
      positions[idx + 2] += Math.cos(phases[i]) * velocities[i].wobbleAmount; // Z wobble

      // If they go too high, reset to the bottom for an endless rush
      if (positions[idx + 1] > 8) {
         resetBubble(idx);
      }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}
animate();

// ==========================================
// 3. TRANSITION LOGIC (GSAP + Three.js)
// ==========================================
function switchUniverse(targetBrand) {
  if (isTransitioning || targetBrand === currentBrand) return;
  isTransitioning = true;

  // 1. Update UI
  navBtns.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.nav-btn.${targetBrand}`).classList.add('active');

  // 2. Prepare Three.js Overlay
  const targetColor = brandColors[targetBrand];
  
  // Create GSAP Timeline for the cinematic effect
  const tl = gsap.timeline({
    onComplete: () => {
      isTransitioning = false;
      // Reset bubbles position for next transition
      const pos = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 15;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Phase 1: Particle Explosion / Screen Cover
  tl.to(material, {
    opacity: 1,
    duration: 1,
    ease: "power2.inOut"
  })
  .to(material.color, {
    r: targetColor.r,
    g: targetColor.g,
    b: targetColor.b,
    duration: 1.5,
    ease: "power2.inOut"
  }, "-=0.5")
  .to(camera.position, {
    z: 2, // Zoom in
    duration: 1.5,
    ease: "power3.inOut"
  }, "-=1.5");

  // Phase 2: Swap the active iframe behind the explosion
  tl.add(() => {
    // Hide current
    iframes[currentBrand].classList.remove('active');
    
    // Animate the iframe elements directly instead of their inner bodies
    const currentIframe = iframes[currentBrand];
    const targetIframe = iframes[targetBrand];
    
    // Reset target scale/blur before showing
    gsap.set(targetIframe, { scale: 1.05, filter: 'blur(20px)' });
    
    // Animate them (avoid scaling currentIframe below 1.0 to prevent black borders)
    gsap.to(currentIframe, { filter: 'blur(20px)', duration: 1 });
    gsap.to(targetIframe, { scale: 1, filter: 'blur(0px)', duration: 2, ease: "power3.out" });

    // Show target
    targetIframe.classList.add('active');
    currentBrand = targetBrand;
  });

  // Phase 3: Dissolve Particles
  tl.to(material, {
    opacity: 0,
    duration: 1.5,
    ease: "power2.inOut"
  }, "+=0.2")
  .to(camera.position, {
    z: 5, // Reset camera zoom
    duration: 1.5,
    ease: "power3.inOut"
  }, "-=1.5");
}

// Bind Navigation
navBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.target.getAttribute('data-target');
    switchUniverse(target);
  });
});
