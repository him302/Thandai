document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('earth-canvas-container');
    if (!container) return;

    // 1. Three.js Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0000, 0.0015);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Earth Setup
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Initial Red Particle
    const singleParticleGeometry = new THREE.BufferGeometry();
    singleParticleGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const singleParticleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 5,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    const singleParticle = new THREE.Points(singleParticleGeometry, singleParticleMaterial);
    scene.add(singleParticle);

    // The Particle Globe
    const radius = 150;
    const globeGeometry = new THREE.IcosahedronGeometry(radius, 12);
    const globeMaterial = new THREE.PointsMaterial({
        color: 0xE50914,
        size: 1.5,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const globe = new THREE.Points(globeGeometry, globeMaterial);
    earthGroup.add(globe);

    // Inner dark sphere to block back particles
    const darkSphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius - 1, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    darkSphere.material.transparent = true;
    darkSphere.material.opacity = 0;
    earthGroup.add(darkSphere);

    // (Connection Lines removed as per request)

    // Orbiting Particles (Billions served)
    const orbitGroup = new THREE.Group();
    earthGroup.add(orbitGroup);
    const orbitCount = 2000;
    const orbitGeo = new THREE.BufferGeometry();
    const orbitPos = new Float32Array(orbitCount * 3);
    for(let i=0; i<orbitCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = radius * (1.1 + Math.random() * 0.4);
        orbitPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        orbitPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        orbitPos[i*3+2] = r * Math.cos(phi);
    }
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
    const orbitMat = new THREE.PointsMaterial({
        color: 0xffaa00,
        size: 1,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const orbitPoints = new THREE.Points(orbitGeo, orbitMat);
    orbitGroup.add(orbitPoints);

    // Timeline Ring
    const ringGeo = new THREE.RingGeometry(radius * 1.6, radius * 1.62, 64);
    const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0, 
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    earthGroup.add(ring);

    // GSAP Animation State
    const state = {
        singleOpacity: 1,
        singleScale: 1,
        globeOpacity: 0,
        globeScale: 0.1,
        darkSphereOpacity: 0,
        countriesGlow: 0,
        orbitOpacity: 0,
        ringOpacity: 0,
        cameraZ: 400
    };

    // UI Elements
    const title = document.getElementById('scene-title');
    const servings = document.getElementById('stat-servings');
    const countries = document.getElementById('stat-countries');
    const year = document.getElementById('stat-year');

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
            document.body.style.overflow = '';
            if (window.lenis) window.lenis.start();
            const nextSection = document.getElementById('flavours');
            if (nextSection) {
                if (window.lenis) {
                    window.lenis.scrollTo(nextSection, { duration: 1.5 });
                } else {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });

    ScrollTrigger.create({
        trigger: ".living-earth-section",
        start: "top top",
        onEnter: () => {
            if (window.lenis) window.lenis.stop();
            document.body.style.overflow = 'hidden';
            tl.play();
        },
        once: true
    });

    // Scene 1: Darkness -> single particle
    tl.to(state, { singleScale: 20, duration: 0.5 })
      .to(singleParticleMaterial.color, { r: 0.9, g: 0, b: 0, duration: 0.5 }, "<")
    
    // Scene 2: Globe materializes
    tl.to(state, { 
        globeOpacity: 0.8, 
        globeScale: 1, 
        singleOpacity: 0, 
        darkSphereOpacity: 0.8,
        duration: 1 
    })
    .to(title, { opacity: 1, duration: 0.5 }, "<")
    .to(title, { opacity: 0, duration: 0.5 }, ">")

    // Scene 3: Countries illuminate
    tl.to(state, { countriesGlow: 1, duration: 1 })
      .to(countries, { opacity: 1, duration: 0.5 }, "<")
      .to(countries, { opacity: 0, duration: 0.5 }, ">")

    // Scene 4: Orbiting particles
    tl.to(state, { orbitOpacity: 0.8, duration: 1 })
      .to(servings, { opacity: 1, duration: 0.5 }, "<")
      .to(servings, { opacity: 0, duration: 0.5 }, ">")

    // Scene 5: Timeline ring
    tl.to(state, { ringOpacity: 0.5, duration: 1 })
      .to(year, { opacity: 1, duration: 0.5 }, "<")
      .to(year, { opacity: 0, duration: 0.5 }, ">")

    // Scene 6: Entire network glow
    tl.to(state, { 
        globeOpacity: 1,
        orbitOpacity: 1,
        cameraZ: 300, 
        duration: 1 
    });

    // Scene 7 & 8: Blast effect and shift to next page
    tl.to(state, { 
        globeScale: 15,
        globeOpacity: 0,
        orbitOpacity: 0,
        ringOpacity: 0,
        darkSphereOpacity: 0,
        duration: 1.5,
        ease: "power2.in"
    });

    // Render loop
    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Apply state
        singleParticleMaterial.opacity = state.singleOpacity;
        singleParticle.scale.setScalar(state.singleScale);

        globeMaterial.opacity = state.globeOpacity;
        earthGroup.scale.setScalar(state.globeScale);
        darkSphere.material.opacity = state.darkSphereOpacity;

        // Animate globe rotation
        earthGroup.rotation.y += 0.05 * delta;

        // Orbit points rotation
        orbitGroup.rotation.y += 0.2 * delta;
        orbitGroup.rotation.z = Math.sin(time * 0.5) * 0.1;
        orbitMat.opacity = state.orbitOpacity;

        // Ring
        ringMat.opacity = state.ringOpacity;

        // Camera
        camera.position.z = gsap.utils.interpolate(camera.position.z, state.cameraZ, 0.1);
        camera.position.x += (mouseX * 50 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 50 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
