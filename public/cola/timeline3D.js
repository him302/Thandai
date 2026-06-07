document.addEventListener("DOMContentLoaded", () => {
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') return;

    const container = document.getElementById('webgl-timeline-container');
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02); // Atmospheric dark fog

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize performance
    container.appendChild(renderer.domElement);

    // --- PROCEDURAL WINDING ROAD ---
    // Create a winding path using points
    const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(10, 5, -20),
        new THREE.Vector3(-15, 10, -40),
        new THREE.Vector3(20, 0, -70),
        new THREE.Vector3(0, -10, -100),
        new THREE.Vector3(-30, 15, -130),
        new THREE.Vector3(10, 5, -160),
        new THREE.Vector3(0, 0, -200)
    ];
    
    const curve = new THREE.CatmullRomCurve3(points);
    curve.tension = 0.5;

    const tubeGeom = new THREE.TubeGeometry(curve, 100, 2, 8, false);
    // Wireframe glowing road
    const tubeMat = new THREE.MeshBasicMaterial({ 
        color: 0xE50914, // Coke Red
        wireframe: true, 
        transparent: true,
        opacity: 0.3
    });
    const tube = new THREE.Mesh(tubeGeom, tubeMat);
    scene.add(tube);

    // Add a solid core to the road
    const coreGeom = new THREE.TubeGeometry(curve, 100, 1.8, 8, false);
    const coreMat = new THREE.MeshLambertMaterial({ 
        color: 0x0a0a0a,
        emissive: 0x110000
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    scene.add(core);

    // --- PARTICLES / ATMOSPHERE ---
    const particleCount = 2000;
    const particlesGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for(let i = 0; i < particleCount * 3; i++) {
        particlePositions[i] = (Math.random() - 0.5) * 100; // Spread widely
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeom, particleMat);
    scene.add(particles);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xE50914, 2, 50);
    scene.add(pointLight);

    // --- MILESTONES (3D Coordinates mapping to HTML Cards) ---
    // t values between 0 and 1 along the curve
    const milestones = [
        { id: 'marker-0', t: 0.05 },
        { id: 'marker-1', t: 0.3 },
        { id: 'marker-2', t: 0.65 },
        { id: 'marker-3', t: 0.95 }
    ];

    // --- CAMERA FLIGHT & GSAP SCROLL ---
    let scrollProgress = 0;
    const progressObj = { t: 0 };

    // Initial camera position
    camera.position.copy(curve.getPointAt(0));
    camera.lookAt(curve.getPointAt(0.01));

    gsap.to(progressObj, {
        t: 1,
        ease: "none",
        scrollTrigger: {
            trigger: ".legacy-timeline-3d",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                scrollProgress = self.progress;
            }
        }
    });

    // --- RENDER LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // 1. Move Camera along Curve smoothly
        // Add a slight offset so we don't hit t=1 exact
        const safeT = Math.min(Math.max(progressObj.t, 0.001), 0.999);
        const camPos = curve.getPointAt(safeT);
        
        // Add slight floating effect to camera based on time
        camPos.y += Math.sin(time * 2) * 0.5;
        
        camera.position.copy(camPos);

        // Look ahead
        const lookAtT = Math.min(safeT + 0.05, 1.0);
        const lookPos = curve.getPointAt(lookAtT);
        camera.lookAt(lookPos);

        // Move light with camera to illuminate the path ahead
        pointLight.position.copy(camPos);

        // 2. Animate Particles (floating up)
        const positions = particles.geometry.attributes.position.array;
        for(let i = 1; i < particleCount * 3; i+=3) {
            positions[i] += 0.05;
            if(positions[i] > 50) {
                positions[i] = -50;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        // Slowly rotate particle system
        particles.rotation.y = time * 0.05;

        // 3. Update HTML Markers (Project 3D to 2D)
        milestones.forEach(m => {
            const el = document.getElementById(m.id);
            if (!el) return;

            // Get 3D point of milestone
            const mPos3D = curve.getPointAt(m.t);
            // Project to 2D screen space
            mPos3D.project(camera);

            // Check if behind camera
            if (mPos3D.z > 1) {
                el.style.opacity = 0;
                el.style.pointerEvents = 'none';
                return;
            }

            // Map to CSS coordinates
            const x = (mPos3D.x *  .5 + .5) * window.innerWidth;
            const y = (mPos3D.y * -.5 + .5) * window.innerHeight;

            // Calculate distance to fade in/out based on scroll proximity
            const dist = Math.abs(progressObj.t - m.t);
            let opacity = 0;
            let scale = 0.5;

            if (dist < 0.15) { // Visible range
                opacity = 1 - (dist / 0.15);
                scale = 1 + (0.2 * (1 - dist/0.15));
            }

            // Smoothly apply transforms
            el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
            el.style.opacity = opacity.toFixed(3);
            el.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
