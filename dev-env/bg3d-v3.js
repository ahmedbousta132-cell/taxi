/* ---------- Full-page 3D background: silver light-ray drift (premium black-car theme) ---------- */
(function () {
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('site3d');
  if (!container) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { container.style.display = 'none'; return; }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.032);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
  camera.position.set(0, 1.6, 11);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  /* ---- Silver / chrome particle field drifting like light catching motion ---- */
  const COUNT = 900;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const speed = new Float32Array(COUNT);

  const silver = new THREE.Color(0xc9ccd2);
  const white = new THREE.Color(0xffffff);
  const steel = new THREE.Color(0x5b6270);

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 34;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 8;
    speed[i] = 0.3 + Math.random() * 0.9;
    const c = Math.random() < 0.15 ? white : (Math.random() < 0.5 ? silver : steel);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.075,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* ---- Long diagonal light streaks (headlight trails) ---- */
  const STREAKS = 26;
  const streakGroup = new THREE.Group();
  const streakData = [];
  for (let i = 0; i < STREAKS; i++) {
    const len = 3 + Math.random() * 5;
    const geoLine = new THREE.PlaneGeometry(len, 0.012);
    const matLine = new THREE.MeshBasicMaterial({
      color: Math.random() < 0.5 ? 0xffffff : 0xc9ccd2,
      transparent: true,
      opacity: 0.35 + Math.random() * 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geoLine, matLine);
    const startX = (Math.random() - 0.5) * 30;
    const startY = (Math.random() - 0.5) * 14;
    const startZ = -Math.random() * 55 - 5;
    mesh.position.set(startX, startY, startZ);
    mesh.rotation.z = (Math.random() - 0.5) * 0.4;
    streakGroup.add(mesh);
    streakData.push({ mesh, speed: 8 + Math.random() * 14, baseX: startX });
  }
  scene.add(streakGroup);

  /* ---- Sizing ---- */
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- Mouse parallax + scroll ---- */
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
  const posAttr = geo.attributes.position;

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    for (let i = 0; i < COUNT; i++) {
      posAttr.array[i * 3 + 2] += speed[i] * (1 + scrollT * 1.5) * dt * 4;
      if (posAttr.array[i * 3 + 2] > 14) posAttr.array[i * 3 + 2] = -46;
    }
    posAttr.needsUpdate = true;

    streakData.forEach((s) => {
      s.mesh.position.z += s.speed * dt;
      if (s.mesh.position.z > 14) s.mesh.position.z = -55;
    });

    curX += (targetX - curX) * 0.035;
    curY += (targetY - curY) * 0.035;
    camera.position.x = curX * 1.4;
    camera.position.y = 1.6 - curY * 0.6 - scrollT * 1.4;
    camera.lookAt(0, 0.2, -20);

    renderer.render(scene, camera);
  }
  animate();
})();
