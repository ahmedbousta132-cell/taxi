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
    `Hello Richline, I'd like to reserve a ride:`,
    `Pickup: ${from}`,
    `Drop-off: ${to}`,
    when ? `Date & time: ${when.replace('T', ' at ')}` : null,
    `Vehicle: ${vclass}`,
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/16196348514?text=${encodeURIComponent(text)}`, '_blank');
});

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq5-item').forEach((item) => {
  item.querySelector('.faq5-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq5-item.open').forEach((el) => el !== item && el.classList.remove('open'));
    item.classList.toggle('open', !isOpen);
  });
});

/* ---------- Reveal on scroll ---------- */
const revealTargets = document.querySelectorAll('.cat-card5, .fleet5-card, .faq5-item, .pill5, .cta5-card, .trust5-inner');
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

/* Safety net: force-reveal anything the observer missed */
window.addEventListener('load', () => {
  setTimeout(() => {
    revealTargets.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 2500);
});
