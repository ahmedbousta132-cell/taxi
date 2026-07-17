/* ---------- 3D animated hero background (Three.js) ---------- */
(function () {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('hero3d');
  if (!container) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  /* Scene / camera / renderer */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0906, 0.055);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 2.2, 9);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  /* ---- Golden particle wave field ---- */
  const COLS = 90, ROWS = 40, SPACING = 0.42;
  const count = COLS * ROWS;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const gold = new THREE.Color(0xe3ba55);
  const deep = new THREE.Color(0xa9791d);
  const white = new THREE.Color(0xfff3d6);

  let i = 0;
  for (let x = 0; x < COLS; x++) {
    for (let z = 0; z < ROWS; z++) {
      positions[i * 3] = (x - COLS / 2) * SPACING;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (z - ROWS / 2) * SPACING - 4;
      const c = Math.random() < 0.08 ? white : gold.clone().lerp(deep, Math.random());
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      i++;
    }
  }

  const waveGeo = new THREE.BufferGeometry();
  waveGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  waveGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const waveMat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const wave = new THREE.Points(waveGeo, waveMat);
  wave.position.y = -1.6;
  scene.add(wave);

  /* ---- Floating wireframe torus knot ---- */
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.5, 0.42, 140, 20),
    new THREE.MeshBasicMaterial({
      color: 0xc9972c,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    })
  );
  knot.position.set(4.6, 1.6, -2);
  scene.add(knot);

  /* ---- Drifting glow orbs ---- */
  const ORBS = 40;
  const orbPos = new Float32Array(ORBS * 3);
  for (let o = 0; o < ORBS; o++) {
    orbPos[o * 3] = (Math.random() - 0.5) * 22;
    orbPos[o * 3 + 1] = Math.random() * 7 - 1;
    orbPos[o * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
  }
  const orbGeo = new THREE.BufferGeometry();
  orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPos, 3));
  const orbs = new THREE.Points(orbGeo, new THREE.PointsMaterial({
    color: 0xe3ba55,
    size: 0.14,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  scene.add(orbs);

  /* ---- Sizing ---- */
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- Mouse parallax ---- */
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  window.addEventListener('pointermove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ---- Animate ---- */
  const pos = waveGeo.attributes.position;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    let j = 0;
    for (let x = 0; x < COLS; x++) {
      for (let z = 0; z < ROWS; z++) {
        const px = pos.array[j * 3];
        const pz = pos.array[j * 3 + 2];
        pos.array[j * 3 + 1] =
          Math.sin(px * 0.55 + t * 1.1) * 0.45 +
          Math.cos(pz * 0.7 + t * 0.8) * 0.35;
        j++;
      }
    }
    pos.needsUpdate = true;

    knot.rotation.x = t * 0.18;
    knot.rotation.y = t * 0.24;
    knot.position.y = 1.6 + Math.sin(t * 0.6) * 0.3;

    orbs.rotation.y = t * 0.03;

    curX += (targetX - curX) * 0.04;
    curY += (targetY - curY) * 0.04;
    camera.position.x = curX * 1.2;
    camera.position.y = 2.2 - curY * 0.7;
    camera.lookAt(0, 0.6, -2);

    renderer.render(scene, camera);
  }

  /* Pause rendering when hero is off-screen */
  let running = false;
  const visObs = new IntersectionObserver((entries) => {
    const visible = entries[0].isIntersecting;
    if (visible && !running) { running = true; animate(); }
  }, { threshold: 0 });
  // requestAnimationFrame loop is cheap to leave running; start once when visible
  visObs.observe(container);
})();
