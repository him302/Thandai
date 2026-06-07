document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('sustainability-canvas-container');
    if (!container) return;

    // --- Performance Optimization: Intersection Observer ---
    let isVisible = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    }, { threshold: 0 });
    observer.observe(document.getElementById('sustainability'));

    // --- 1. Three.js Setup ---
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- 2. Earth Layers Setup ---
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const radius = 140;
    const geoHigh = new THREE.IcosahedronGeometry(radius, 15);

    // Dark Inner Sphere
    const darkSphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius - 1, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x020a02 })
    );
    earthGroup.add(darkSphere);

    // Layer 1: Polluted Earth (Brown/Dark)
    const pollutedMat = new THREE.PointsMaterial({
        color: 0x4a3b2c,
        size: 1.5,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const pollutedGlobe = new THREE.Points(geoHigh, pollutedMat);
    earthGroup.add(pollutedGlobe);

    // Layer 2: Clean Water (Blue)
    const waterMat = new THREE.PointsMaterial({
        color: 0x0077be,
        size: 1.8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const waterGlobe = new THREE.Points(geoHigh, waterMat);
    waterGlobe.scale.setScalar(1.01);
    earthGroup.add(waterGlobe);

    // Layer 3: Forests (Green)
    const forestMat = new THREE.PointsMaterial({
        color: 0x2ecc71,
        size: 2.0,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    // Create a slightly modified geometry for forests so points don't perfectly overlap
    const forestGeo = new THREE.IcosahedronGeometry(radius, 12);
    forestGeo.rotateX(Math.PI / 4);
    const forestGlobe = new THREE.Points(forestGeo, forestMat);
    forestGlobe.scale.setScalar(0.95); // Will scale up as it "grows"
    earthGroup.add(forestGlobe);

    // Layer 4: Smog Cloud
    const smogGroup = new THREE.Group();
    scene.add(smogGroup);
    const smogCount = 1500;
    const smogGeo = new THREE.BufferGeometry();
    const smogPos = new Float32Array(smogCount * 3);
    for(let i=0; i<smogCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = radius * (1.1 + Math.random() * 0.5);
        smogPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        smogPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        smogPos[i*3+2] = r * Math.cos(phi);
    }
    smogGeo.setAttribute('position', new THREE.BufferAttribute(smogPos, 3));
    const smogMat = new THREE.PointsMaterial({
        color: 0x111111,
        size: 6,
        transparent: true,
        opacity: 0.8,
        blending: THREE.NormalBlending
    });
    const smogPoints = new THREE.Points(smogGeo, smogMat);
    smogGroup.add(smogPoints);

    // Layer 5: Clean Energy Rings
    const ringsGroup = new THREE.Group();
    earthGroup.add(ringsGroup);
    
    const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 1.5, 0.5, 16, 100),
        new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    ring1.rotation.x = Math.PI / 2.2;
    ringsGroup.add(ring1);

    const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 1.8, 1, 16, 100),
        new THREE.MeshBasicMaterial({ color: 0x2ecc71, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.x = Math.PI / 6;
    ringsGroup.add(ring2);

    // --- 3. Animation State & GSAP ---
    const state = {
        waterOpacity: 0,
        forestOpacity: 0,
        forestScale: 0.95,
        pollutedOpacity: 0.8,
        smogOpacity: 0.8,
        ringsOpacity: 0,
        cameraZ: 400
    };

    const title = document.getElementById('sustain-title');
    const waterText = document.getElementById('sustain-water');
    const forestText = document.getElementById('sustain-forests');
    const futureText = document.getElementById('sustain-future');

    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".sustainability-earth-section",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    // Scene 1: Title & Smog
    tl.to(title, { opacity: 1, duration: 1 })
      .to(title, { opacity: 0, duration: 1, delay: 0.5 })

    // Scene 2: Ocean Cleanup
    tl.to(state, { waterOpacity: 0.9, duration: 2 })
      .to(waterText, { opacity: 1, duration: 1 }, "<")
      .to(waterText, { opacity: 0, duration: 1 }, ">")

    // Scene 3: Forest Growth
    tl.to(state, { forestOpacity: 1, forestScale: 1.02, duration: 2 })
      .to(state, { pollutedOpacity: 0.2, duration: 2 }, "<") // Polluted layer fades
      .to(forestText, { opacity: 1, duration: 1 }, "<")
      .to(forestText, { opacity: 0, duration: 1 }, ">")

    // Scene 4: Smog Clearing
    tl.to(state, { smogOpacity: 0, duration: 2 })

    // Scene 5: Energy Rings Emerging
    tl.to(state, { ringsOpacity: 0.8, duration: 2 })
      .to(futureText, { opacity: 1, duration: 1 }, "<")
      .to(futureText, { opacity: 0, duration: 1 }, ">")

    // Scene 6: Zoom out to show completely healed ecosystem
    tl.to(state, { cameraZ: 500, duration: 2 })

    // --- 4. Render Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        // Skip rendering if not in viewport
        if (!isVisible) return;

        const delta = clock.getDelta();

        // Apply GSAP state
        waterMat.opacity = state.waterOpacity;
        forestMat.opacity = state.forestOpacity;
        forestGlobe.scale.setScalar(state.forestScale);
        pollutedMat.opacity = state.pollutedOpacity;
        smogMat.opacity = state.smogOpacity;
        
        ring1.material.opacity = state.ringsOpacity;
        ring2.material.opacity = state.ringsOpacity;
        
        // Rotations
        earthGroup.rotation.y += 0.05 * delta;
        smogGroup.rotation.y += 0.02 * delta;
        smogGroup.rotation.z += 0.01 * delta;
        
        ring1.rotation.z -= 0.2 * delta;
        ring2.rotation.z += 0.15 * delta;

        // Camera interpolation
        camera.position.z = gsap.utils.interpolate(camera.position.z, state.cameraZ, 0.1);
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
