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
    showConfirmPopup('Demande envoyée !', 'Votre demande de réservation a été transmise avec succès. Le formulaire a été réinitialisé.');
    e.target.reset();
  });
}

/* ---------- Animated background: VIP transfer route map ---------- */
/* Glowing pickup/drop-off pins joined by routes, each travelled by a taxi
   marker — a nod to the airport-transfer / chauffeur booking theme. */
(function initRouteMap() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  // Each route is a cubic bezier in fractional viewport coords (0..1),
  // representing a chauffeur trip from pickup (p0) to drop-off (p3).
  const routes = [
    {
      p: [{ x: -0.06, y: 0.78 }, { x: 0.28, y: 0.48 }, { x: 0.6, y: 0.94 }, { x: 1.06, y: 0.4 }],
      color: '242,183,5', speed: 0.045, phase: 0.05, trail: 0.17, vip: true
    },
    {
      p: [{ x: -0.06, y: 0.2 }, { x: 0.32, y: 0.06 }, { x: 0.62, y: 0.4 }, { x: 1.06, y: 0.66 }],
      color: '41,226,232', speed: 0.033, phase: 0.42, trail: 0.15, vip: false
    },
    {
      p: [{ x: 1.06, y: 0.86 }, { x: 0.68, y: 0.56 }, { x: 0.36, y: 0.8 }, { x: -0.06, y: 0.3 }],
      color: '255,138,61', speed: 0.038, phase: 0.75, trail: 0.16, vip: false
    },
  ];

  function bezierPoint(pts, t) {
    const mt = 1 - t;
    const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
    return {
      x: (a * pts[0].x + b * pts[1].x + c * pts[2].x + d * pts[3].x) * w,
      y: (a * pts[0].y + b * pts[1].y + c * pts[2].y + d * pts[3].y) * h,
    };
  }

  function drawRouteGuide(route) {
    const [p0, p1, p2, p3] = route.p.map((p) => ({ x: p.x * w, y: p.y * h }));
    ctx.beginPath();
    ctx.setLineDash([6 * dpr, 10 * dpr]);
    ctx.lineWidth = 1.2 * dpr;
    ctx.strokeStyle = 'rgba(154,165,184,0.16)';
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.stroke();
    ctx.setLineDash([]);
    return { p0, p3 };
  }

  function drawPin(pos, color, pulse, isDestination) {
    const r = (isDestination ? 5 : 3.5) * dpr;
    const ringR = r + pulse * (isDestination ? 15 : 10) * dpr;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color},${0.35 * (1 - pulse)})`;
    ctx.lineWidth = 1.4 * dpr;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color},0.9)`;
    ctx.shadowColor = `rgba(${color},0.85)`;
    ctx.shadowBlur = 10 * dpr;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  let t = 0;

  function frame() {
    requestAnimationFrame(frame);
    t += reduceMotion ? 0.002 : 0.006;
    ctx.clearRect(0, 0, w, h);

    routes.forEach((route) => {
      const { p0, p3 } = drawRouteGuide(route);
      const progress = (t * route.speed + route.phase) % 1;
      const pulse = (Math.sin(t * 1.6 + route.phase * 6) + 1) / 2;

      drawPin(p0, route.color, pulse * 0.6, false);
      drawPin(p3, route.color, pulse, route.vip);

      if (route.vip) {
        ctx.font = `${14 * dpr}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.85;
        ctx.fillText('★', p3.x, p3.y - 16 * dpr);
        ctx.globalAlpha = 1;
      }

      // Comet trail behind the moving taxi marker
      const steps = 24;
      for (let i = steps; i >= 0; i--) {
        const s = progress - (i / steps) * route.trail;
        if (s < 0) continue;
        const pt = bezierPoint(route.p, s);
        const alpha = (1 - i / steps) * 0.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (1.6 - i / steps) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${route.color},${alpha})`;
        ctx.fill();
      }

      // Moving taxi marker
      const head = bezierPoint(route.p, progress);
      ctx.beginPath();
      ctx.arc(head.x, head.y, 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${route.color},1)`;
      ctx.shadowColor = `rgba(${route.color},0.9)`;
      ctx.shadowBlur = 14 * dpr;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = `${13 * dpr}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚕', head.x, head.y - 1 * dpr);
    });
  }
  frame();
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
