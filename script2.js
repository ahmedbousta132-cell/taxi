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
    { p: [{ x: -0.06, y: 0.78 }, { x: 0.28, y: 0.48 }, { x: 0.6, y: 0.94 }, { x: 1.06, y: 0.4 }],
      color: '242,183,5', speed: 0.045, phase: 0.05, trail: 0.17, vip: true },
    { p: [{ x: -0.06, y: 0.2 }, { x: 0.32, y: 0.06 }, { x: 0.62, y: 0.4 }, { x: 1.06, y: 0.66 }],
      color: '41,226,232', speed: 0.033, phase: 0.42, trail: 0.15, vip: false },
    { p: [{ x: 1.06, y: 0.86 }, { x: 0.68, y: 0.56 }, { x: 0.36, y: 0.8 }, { x: -0.06, y: 0.3 }],
      color: '255,138,61', speed: 0.038, phase: 0.75, trail: 0.16, vip: false },
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
