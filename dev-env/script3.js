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

/* ---------- Booking bar -> WhatsApp ---------- */
const bookingBarForm = document.getElementById('booking-bar-form');
if (bookingBarForm) {
  bookingBarForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fFrom = document.getElementById('b-from');
    const fTo = document.getElementById('b-to');
    const fWhen = document.getElementById('b-when');
    const fClass = document.getElementById('b-class');

    let isOk = true;
    if (fFrom && !window.validateField(fFrom, 'min2', 'Lieu de départ requis.')) isOk = false;
    if (fTo && !window.validateField(fTo, 'min2', 'Destination requise.')) isOk = false;
    if (!isOk) return;

    const from = fFrom ? fFrom.value : '';
    const to = fTo ? fTo.value : '';
    const when = fWhen ? fWhen.value : '';
    const vclass = fClass ? fClass.value : '';

    const text = [
      `Bonjour Local Taxi, je souhaite réserver une course :`,
      `Départ : ${from}`,
      `Destination : ${to}`,
      when ? `Date & heure : ${when.replace('T', ' à ')}` : null,
      `Véhicule : ${vclass}`,
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/41787194444?text=${encodeURIComponent(text)}`, '_blank');
    showConfirmPopup('Demande envoyée !', 'Votre demande de réservation a été transmise avec succès. Le formulaire a été réinitialisé.');
    e.target.reset();
  });
}

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
const revealTargets = document.querySelectorAll('.cat-card, .fleet3-card, .testi3-card, .pill3, .cta3-card, .privilege-card');
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
