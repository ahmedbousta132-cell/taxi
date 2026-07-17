/* ---------- Full-page 3D animated background: infinite gold highway ---------- */
(function () {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('site3d');
  if (!container) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { container.style.display = 'none'; return; }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05050a, 0.028);

  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 200);
  camera.position.set(0, 2.4, 10);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  /* ---- Infinite perspective grid "road" ---- */
  const GRID_SIZE = 120;
  const GRID_DIV = 60;
  const grid1 = new THREE.GridHelper(GRID_SIZE, GRID_DIV, 0xe3ba55, 0x6b5424);
  grid1.material.transparent = true;
  grid1.material.opacity = 0.55;
  grid1.position.y = -1.4;
  const grid2 = grid1.clone();
  grid2.position.z = -GRID_SIZE;
  scene.add(grid1, grid2);
  const grids = [grid1, grid2];

  /* ---- Light-trail streaks (like headlights/taillights on a highway) ---- */
  const STREAK_COUNT = 160;
  const streakGeo = new THREE.BufferGeometry();
  const streakPos = new Float32Array(STREAK_COUNT * 3);
  const streakColor = new Float32Array(STREAK_COUNT * 3);
  const streakSpeed = new Float32Array(STREAK_COUNT);
  const streakLane = new Float32Array(STREAK_COUNT);

  const goldC = new THREE.Color(0xe3ba55);
  const whiteC = new THREE.Color(0xfff6e0);
  const emberC = new THREE.Color(0xff8a3d);

  for (let i = 0; i < STREAK_COUNT; i++) {
    const lane = (Math.random() - 0.5) * 14;
    const z = -Math.random() * 140;
    streakPos[i * 3] = lane;
    streakPos[i * 3 + 1] = -1.6 + Math.random() * 0.3;
    streakPos[i * 3 + 2] = z;
    streakLane[i] = lane;
    streakSpeed[i] = 0.4 + Math.random() * 1.1;
    const c = Math.random() < 0.65 ? goldC : (Math.random() < 0.5 ? whiteC : emberC);
    streakColor[i * 3] = c.r; streakColor[i * 3 + 1] = c.g; streakColor[i * 3 + 2] = c.b;
  }
  streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
  streakGeo.setAttribute('color', new THREE.BufferAttribute(streakColor, 3));

  const streakMat = new THREE.PointsMaterial({
    size: 0.34,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const streaks = new THREE.Points(streakGeo, streakMat);
  scene.add(streaks);

  /* ---- Ambient floating particle dust (gold) ---- */
  const DUST = 500;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 40;
    dustPos[i * 3 + 1] = Math.random() * 16 - 2;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xe3ba55,
    size: 0.09,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  scene.add(dust);

  /* ---- Distant floating wireframe rings (skyline accent) ---- */
  const rings = [];
  for (let i = 0; i < 6; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2 + i * 0.6, 0.015, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xe3ba55, transparent: true, opacity: 0.12 - i * 0.012 })
    );
    ring.position.set((i % 2 === 0 ? -1 : 1) * (9 + i * 1.5), 3 + i * 1.1, -30 - i * 14);
    ring.rotation.x = Math.PI / 2.3;
    scene.add(ring);
    rings.push(ring);
  }

  /* ---- Sizing ---- */
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- Mouse parallax + scroll dolly ---- */
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  window.addEventListener('pointermove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollT = 0;
  window.addEventListener('scroll', () => {
    scrollT = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
  }, { passive: true });

  /* ---- Animate ---- */
  const clock = new THREE.Clock();
  const pos = streakGeo.attributes.position;

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    /* Move streaks toward camera, loop back when they pass */
    for (let i = 0; i < STREAK_COUNT; i++) {
      pos.array[i * 3 + 2] += streakSpeed[i] * (1 + scrollT * 2) * dt * 26;
      if (pos.array[i * 3 + 2] > 10) {
        pos.array[i * 3 + 2] = -140;
        pos.array[i * 3] = streakLane[i] = (Math.random() - 0.5) * 14;
      }
    }
    pos.needsUpdate = true;

    /* Infinite grid loop */
    grids.forEach((g) => {
      g.position.z += dt * 6;
      if (g.position.z > GRID_SIZE) g.position.z -= GRID_SIZE * 2;
    });

    dust.rotation.y = t * 0.015;
    rings.forEach((r, i) => { r.rotation.z = t * 0.05 * (i % 2 === 0 ? 1 : -1); });

    curX += (targetX - curX) * 0.03;
    curY += (targetY - curY) * 0.03;
    camera.position.x = curX * 1.6;
    camera.position.y = 3.4 - curY * 0.8 - scrollT * 1.2;
    camera.lookAt(0, 0.4, -20);

    renderer.render(scene, camera);
  }
  animate();
})();
