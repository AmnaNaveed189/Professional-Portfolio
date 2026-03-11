/**
 * three-scene.js
 * Three.js 3D animated backgrounds:
 *   - Hero section: interactive particle network with connecting lines
 *   - Contact section: floating geometric torus knots
 *
 * Uses Three.js r128 via CDN (loaded in index.html).
 */

(function () {
  'use strict';

  /* ── Utility: wait for DOM ──────────────────────────────────────── */
  function onReady(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  /* ── Reduced-motion check ───────────────────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════════════════════════════
     HERO SCENE — particle network
  ══════════════════════════════════════════════════════════════════ */
  function initHeroScene() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 80;

    /* ── Particle positions ─────────────────────────────────────── */
    const PARTICLE_COUNT = window.innerWidth < 600 ? 60 : 120;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 140,
        z: (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        vz: (Math.random() - 0.5) * 0.02,
      });
    }

    /* Points geometry */
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointMat = new THREE.PointsMaterial({
      size: 1.4,
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pointGeo, pointMat);
    scene.add(points);

    /* Lines geometry (connecting close particles) */
    const lineGeo = new THREE.BufferGeometry();
    const maxLines = PARTICLE_COUNT * PARTICLE_COUNT;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors    = new Float32Array(maxLines * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineColors,    3).setUsage(THREE.DynamicDrawUsage));

    const lineMat = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
    }));
    scene.add(lineMat);

    /* ── Mouse parallax ─────────────────────────────────────────── */
    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    /* ── Resize ─────────────────────────────────────────────────── */
    function onResize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    /* ── Animate ────────────────────────────────────────────────── */
    const CONNECTION_DIST = 35;
    const colorA = new THREE.Color(0x7c3aed); // purple
    const colorB = new THREE.Color(0x06b6d4); // cyan

    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);

      if (prefersReducedMotion) { renderer.render(scene, camera); return; }

      /* Update particle positions */
      const pos = pointGeo.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        /* Wrap around edges */
        if (p.x >  100) p.x = -100;
        if (p.x < -100) p.x =  100;
        if (p.y >   70) p.y =  -70;
        if (p.y <  -70) p.y =   70;
        pos[i * 3]     = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
      }
      pointGeo.attributes.position.needsUpdate = true;

      /* Build connection lines */
      let lineIdx = 0;
      const lpos = lineGeo.attributes.position.array;
      const lcol = lineGeo.attributes.color.array;

      for (let a = 0; a < PARTICLE_COUNT; a++) {
        for (let b = a + 1; b < PARTICLE_COUNT; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const t = 1 - dist / CONNECTION_DIST;
            const c = colorA.clone().lerp(colorB, t);
            lpos[lineIdx * 6]     = particles[a].x;
            lpos[lineIdx * 6 + 1] = particles[a].y;
            lpos[lineIdx * 6 + 2] = particles[a].z;
            lpos[lineIdx * 6 + 3] = particles[b].x;
            lpos[lineIdx * 6 + 4] = particles[b].y;
            lpos[lineIdx * 6 + 5] = particles[b].z;
            lcol[lineIdx * 6]     = c.r; lcol[lineIdx * 6 + 1] = c.g; lcol[lineIdx * 6 + 2] = c.b;
            lcol[lineIdx * 6 + 3] = c.r; lcol[lineIdx * 6 + 4] = c.g; lcol[lineIdx * 6 + 5] = c.b;
            lineIdx++;
          }
        }
      }

      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate    = true;
      lineGeo.setDrawRange(0, lineIdx * 2);

      /* Camera parallax */
      camera.position.x += (mouse.x * 8 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * 5 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    /* Stop animation when hero is not visible */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { if (!frameId) animate(); }
        else { cancelAnimationFrame(frameId); frameId = null; }
      });
    }, { threshold: 0.01 });
    observer.observe(canvas.closest('section') || canvas);
  }

  /* ══════════════════════════════════════════════════════════════════
     CONTACT SCENE — floating torus knots
  ══════════════════════════════════════════════════════════════════ */
  function initContactScene() {
    const canvas = document.getElementById('contactCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 500);
    camera.position.z = 30;

    /* Floating shapes */
    const shapes = [];
    const geometries = [
      new THREE.TorusKnotGeometry(2, 0.5, 80, 16),
      new THREE.OctahedronGeometry(2.5),
      new THREE.IcosahedronGeometry(2),
      new THREE.TorusGeometry(2, 0.6, 16, 40),
    ];
    const colors = [0x7c3aed, 0x06b6d4, 0xa855f7, 0x0ea5e9];

    for (let i = 0; i < 8; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 10
      );
      const s = 0.4 + Math.random() * 0.6;
      mesh.scale.setScalar(s);
      shapes.push({
        mesh,
        rotX: (Math.random() - 0.5) * 0.006,
        rotY: (Math.random() - 0.5) * 0.006,
        floatY: Math.random() * Math.PI * 2,
        floatSpeed: 0.003 + Math.random() * 0.005,
        baseY: mesh.position.y,
      });
      scene.add(mesh);
    }

    function onResize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      if (prefersReducedMotion) { renderer.render(scene, camera); return; }
      shapes.forEach((s) => {
        s.mesh.rotation.x += s.rotX;
        s.mesh.rotation.y += s.rotY;
        s.floatY += s.floatSpeed;
        s.mesh.position.y = s.baseY + Math.sin(s.floatY) * 1.5;
      });
      renderer.render(scene, camera);
    }

    animate();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { if (!frameId) animate(); }
        else { cancelAnimationFrame(frameId); frameId = null; }
      });
    }, { threshold: 0.01 });
    observer.observe(canvas.closest('section') || canvas);
  }

  /* ── Init both scenes after DOM is ready ────────────────────────── */
  onReady(function () {
    initHeroScene();
    initContactScene();
  });

})();
