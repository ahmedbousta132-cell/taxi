/* ---------- Nav scroll + mobile toggle ---------- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
});

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Booking bar -> WhatsApp ---------- */
document.getElementById('booking-bar-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const from = document.getElementById('b-from').value;
  const to = document.getElementById('b-to').value;
  const when = document.getElementById('b-when').value;
  const vclass = document.getElementById('b-class').value;

  const text = [
    `Bonjour City Taxis, je souhaite réserver une course :`,
    `Départ : ${from}`,
    `Destination : ${to}`,
    when ? `Date & heure : ${when.replace('T', ' à ')}` : null,
    `Véhicule : ${vclass}`,
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/41787194444?text=${encodeURIComponent(text)}`, '_blank');
});

/* ---------- Testimonials arrow scroll ---------- */
const testiTrack = document.getElementById('testi-track');
if (testiTrack) {
  document.getElementById('testi-prev').addEventListener('click', () => {
    testiTrack.scrollBy({ left: -testiTrack.clientWidth * 0.9, behavior: 'smooth' });
  });
  document.getElementById('testi-next').addEventListener('click', () => {
    testiTrack.scrollBy({ left: testiTrack.clientWidth * 0.9, behavior: 'smooth' });
  });
}

/* ---------- Reveal on scroll ---------- */
const revealTargets = document.querySelectorAll('.cat-card4, .fleet4-card, .testi4-card, .pill4, .cta4-card, .trust4-inner');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

revealTargets.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  io.observe(el);
});

/* Safety net: force-reveal anything the observer missed (e.g. layout not yet settled) */
window.addEventListener('load', () => {
  setTimeout(() => {
    revealTargets.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 2500);
});
