/* ---------- Nav scroll + mobile toggle ---------- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Booking form -> WhatsApp ---------- */
document.getElementById('booking-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('f-name').value;
  const phone = document.getElementById('f-phone').value;
  const from = document.getElementById('f-from').value;
  const to = document.getElementById('f-to').value;
  const date = document.getElementById('f-date').value;
  const time = document.getElementById('f-time').value;
  const vclass = document.getElementById('f-class').value;
  const msg = document.getElementById('f-msg').value;

  const text = [
    `Bonjour Local Taxi, je souhaite réserver une course :`,
    `Nom : ${name}`,
    `Téléphone : ${phone}`,
    `Départ : ${from}`,
    `Destination : ${to}`,
    date ? `Date : ${date}` : null,
    time ? `Heure : ${time}` : null,
    `Véhicule : ${vclass}`,
    msg ? `Message : ${msg}` : null,
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/41787194444?text=${encodeURIComponent(text)}`, '_blank');
});

/* ---------- 3D animated background (Three.js) ---------- */
(function initScene() {
  const canvas = document.getElementById('bg-canvas');
  if (typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 3.4, 9);
  camera.lookAt(0, 0.5, -20);

  const goldColor = new THREE.Color(0xf2b705);
  const cyanColor = new THREE.Color(0x29e2e8);
  const emberColor = new THREE.Color(0xff8a3d);

  /* --- Perspective road grid receding into the distance --- */
  const gridGroup = new THREE.Group();
  const GRID_DEPTH = 160;
  const LANE_COUNT = 14;
  const gridMat = new THREE.LineBasicMaterial({ color: 0x2a3350, transparent: true, opacity: 0.35 });

  // Longitudinal lines
  for (let i = -LANE_COUNT / 2; i <= LANE_COUNT / 2; i++) {
    const points = [
      new THREE.Vector3(i * 1.4, 0, 6),
      new THREE.Vector3(i * 1.4, 0, -GRID_DEPTH),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    gridGroup.add(new THREE.Line(geo, gridMat));
  }
  // Cross lines (fewer, fading with distance handled visually by fog)
  for (let z = 6; z > -GRID_DEPTH; z -= 4) {
    const points = [
      new THREE.Vector3((-LANE_COUNT / 2) * 1.4, 0, z),
      new THREE.Vector3((LANE_COUNT / 2) * 1.4, 0, z),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    gridGroup.add(new THREE.Line(geo, gridMat));
  }
  scene.add(gridGroup);

  scene.fog = new THREE.Fog(0x070a14, 8, 90);

  /* --- Light trail streaks (simulating headlights / taillights on a highway) --- */
  const STREAK_COUNT = 60;
  const streakGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 6, 1, true);
  const streaks = [];
  const streakColors = [goldColor, cyanColor, emberColor];

  for (let i = 0; i < STREAK_COUNT; i++) {
    const color = streakColors[i % streakColors.length];
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(streakGeo, mat);
    mesh.rotation.x = Math.PI / 2;
    const lane = (Math.random() - 0.5) * LANE_COUNT * 1.3;
    const z = -Math.random() * GRID_DEPTH;
    const len = 1.2 + Math.random() * 2.6;
    mesh.scale.set(1, len, 1);
    mesh.position.set(lane, 0.15 + Math.random() * 2.2, z);
    mesh.userData = { speed: 0.25 + Math.random() * 0.55, len };
    streaks.push(mesh);
    scene.add(mesh);
  }

  /* --- Floating ambient particles (dust / light bokeh) --- */
  const PARTICLE_COUNT = 220;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 10;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffe9b3,
    size: 0.06,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* --- Mouse parallax --- */
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    // Streaks move toward camera then reset far away
    streaks.forEach((s) => {
      s.position.z += s.userData.speed * dt * 20;
      if (s.position.z > 6) {
        s.position.z = -GRID_DEPTH;
        s.position.x = (Math.random() - 0.5) * LANE_COUNT * 1.3;
        s.position.y = 0.15 + Math.random() * 2.2;
      }
    });

    // Slow ambient particle drift
    particles.rotation.y = t * 0.01;

    // Subtle grid pulse
    gridGroup.position.z = (t * 1.2) % 4;

    // Camera parallax + gentle bob
    camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.03;
    camera.position.y += (3.4 - mouseY * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, 0.6, -20);

    renderer.render(scene, camera);
  }
  animate();
})();

/* ---------- Reveal on scroll ---------- */
const revealTargets = document.querySelectorAll('.card, .pill, .section-head');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  io.observe(el);
});
