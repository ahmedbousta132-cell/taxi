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

/* ---------- Global Field Validation Helper ---------- */
window.validateField = function (el, rule, msg) {
  if (!el) return true;
  var val = el.value.trim();
  var parent = el.closest('.fld, .grp, .dform > div, .form-group, div') || el.parentElement;

  el.style.borderColor = '';
  el.style.boxShadow = '';
  if (parent) {
    var oldErr = parent.querySelector('.field-err-msg');
    if (oldErr) oldErr.remove();
  }

  var isOk = true;
  if (rule === 'required') {
    isOk = val.length >= 1;
  } else if (rule === 'min2') {
    isOk = val.length >= 2;
  } else if (rule === 'phone') {
    isOk = val.replace(/[^0-9]/g, '').length >= 7;
  } else if (rule === 'email') {
    isOk = val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  } else if (rule === 'email-required') {
    isOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  }

  if (!isOk) {
    el.style.borderColor = '#e74c3c';
    el.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.25)';
    if (parent) {
      var err = document.createElement('span');
      err.className = 'field-err-msg';
      err.style.cssText = 'color: #e74c3c; font-size: 11px; display: block; margin-top: 4px; font-weight: 600; text-align: left;';
      err.textContent = msg;
      parent.appendChild(err);
    }
    var clear = function () {
      el.style.borderColor = '';
      el.style.boxShadow = '';
      if (parent) {
        var e = parent.querySelector('.field-err-msg');
        if (e) e.remove();
      }
      el.removeEventListener('input', clear);
      el.removeEventListener('change', clear);
    };
    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
    return false;
  }
  return true;
};

/* ---------- Global Confirm Popup Helper ---------- */
function showConfirmPopup(title, message) {
  let overlay = document.getElementById('confirm-popup-overlay');
  if (!overlay) {
    const style = document.createElement('style');
    style.textContent = `
      .confirm-popup-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(15, 20, 28, 0.75); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        padding: 20px;
      }
      .confirm-popup-overlay.show { opacity: 1; pointer-events: auto; }
      .confirm-popup-card {
        background: #ffffff; border-radius: 24px; padding: 36px 32px;
        max-width: 440px; width: 100%; text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        border: 1px solid rgba(235, 164, 60, 0.3);
      }
      .confirm-popup-overlay.show .confirm-popup-card { transform: scale(1) translateY(0); }
      .confirm-popup-icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: linear-gradient(135deg, #25d366, #128c7e);
        color: #fff; font-size: 32px; font-weight: bold;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 20px; box-shadow: 0 10px 20px -5px rgba(37, 211, 102, 0.4);
      }
      .confirm-popup-title { font-size: 22px; font-weight: 700; color: #191b21; margin-bottom: 12px; }
      .confirm-popup-msg { font-size: 15px; color: #5c6470; line-height: 1.5; margin-bottom: 24px; }
      .confirm-popup-btn {
        background: linear-gradient(135deg, #ffcf8a, #eba43c 55%, #d98a24);
        color: #1a1205; border: none; font-size: 15px; font-weight: 600;
        padding: 12px 36px; border-radius: 999px; cursor: pointer;
        box-shadow: 0 6px 18px -4px rgba(235, 164, 60, 0.5);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .confirm-popup-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -4px rgba(235, 164, 60, 0.7); }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = 'confirm-popup-overlay';
    overlay.className = 'confirm-popup-overlay';
    overlay.innerHTML = `
      <div class="confirm-popup-card">
        <div class="confirm-popup-icon">✓</div>
        <h3 class="confirm-popup-title"></h3>
        <p class="confirm-popup-msg"></p>
        <button type="button" class="confirm-popup-btn">Fermer</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.confirm-popup-btn').addEventListener('click', () => overlay.classList.remove('show'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
  }
  overlay.querySelector('.confirm-popup-title').textContent = title || 'Demande envoyée !';
  overlay.querySelector('.confirm-popup-msg').textContent = message || 'Votre demande a bien été envoyée. Nous vous recontactons sous peu.';
  overlay.classList.add('show');
}

/* ---------- Booking form -> WhatsApp ---------- */
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fName = document.getElementById('f-name');
    const fPhone = document.getElementById('f-phone');
    const fFrom = document.getElementById('f-from');
    const fTo = document.getElementById('f-to');
    const fDate = document.getElementById('f-date');
    const fTime = document.getElementById('f-time');
    const fClass = document.getElementById('f-class');
    const fMsg = document.getElementById('f-msg');

    let isOk = true;
    if (fName && !window.validateField(fName, 'min2', 'Nom et prénom requis.')) isOk = false;
    if (fPhone && !window.validateField(fPhone, 'phone', 'Numéro de téléphone invalide.')) isOk = false;
    if (fFrom && !window.validateField(fFrom, 'min2', 'Adresse de départ requise.')) isOk = false;
    if (fTo && !window.validateField(fTo, 'min2', 'Adresse de destination requise.')) isOk = false;
    if (!isOk) return;

    const name = fName ? fName.value : '';
    const phone = fPhone ? fPhone.value : '';
    const from = fFrom ? fFrom.value : '';
    const to = fTo ? fTo.value : '';
    const date = fDate ? fDate.value : '';
    const time = fTime ? fTime.value : '';
    const vclass = fClass ? fClass.value : '';
    const msg = fMsg ? fMsg.value : '';

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
    showConfirmPopup('Demande envoyée !', 'Votre demande de réservation a été transmise. Le formulaire a été réinitialisé.');
    e.target.reset();
  });
}

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
