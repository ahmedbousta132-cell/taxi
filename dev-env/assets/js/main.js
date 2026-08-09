(() => {
  'use strict';

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    backToTop.classList.toggle('show', window.scrollY > 500);
  };

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* ---------- Scrollspy ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const spyLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        spyLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spyObserver.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = el.dataset.count.includes('.') ? 1 : 0;
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('fr-CH');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString('fr-CH');
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Back to top ---------- */
  const backToTop = document.querySelector('.fab-top');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });

  /* ---------- Testimonial carousel ---------- */
  const track = document.querySelector('.testi-slides');
  if (track) {
    const slides = track.children.length;
    const dotsWrap = document.querySelector('.testi-controls');
    let index = 0;
    for (let i = 0; i < slides; i++) {
      const dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Avis ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    const dots = dotsWrap.querySelectorAll('.testi-dot');
    function goTo(i) {
      index = (i + slides) % slides;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    }
    let auto = setInterval(() => goTo(index + 1), 5500);
    const wrap = document.querySelector('.testi-wrap');
    wrap.addEventListener('mouseenter', () => clearInterval(auto));
    wrap.addEventListener('mouseleave', () => { auto = setInterval(() => goTo(index + 1), 5500); });
  }

  /* ---------- Price estimator ---------- */
  const zoneSelect = document.getElementById('est-zone');
  const vehicleSelect = document.getElementById('est-vehicle');
  const resultPrice = document.getElementById('est-result');
  if (zoneSelect && vehicleSelect && resultPrice) {
    const calc = () => {
      const [min, max] = zoneSelect.value.split('-').map(Number);
      const mult = parseFloat(vehicleSelect.value);
      const lo = Math.round(min * mult);
      const hi = Math.round(max * mult);
      resultPrice.style.opacity = 0;
      setTimeout(() => {
        resultPrice.textContent = `${lo} – ${hi} CHF`;
        resultPrice.style.opacity = 1;
      }, 120);
    };
    zoneSelect.addEventListener('change', calc);
    vehicleSelect.addEventListener('change', calc);
    calc();
  }

  /* ---------- Reservation form ---------- */
  const form = document.getElementById('reservation-form');
  if (form) {
    const feedback = document.getElementById('form-feedback');
    const submitBtn = form.querySelector('button[type="submit"]');

    const showConfirmPopup = (title, message) => {
      let overlay = document.getElementById('confirm-popup-overlay');
      if (!overlay) {
        const style = document.createElement('style');
        style.textContent = `
          .confirm-popup-overlay {
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(15, 20, 28, 0.7); backdrop-filter: blur(8px);
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
      overlay.querySelector('.confirm-popup-title').textContent = title;
      overlay.querySelector('.confirm-popup-msg').textContent = message;
      overlay.classList.add('show');
    };

    const showFeedback = (type, message) => {
      feedback.className = `form-feedback show ${type}`;
      feedback.innerHTML = (type === 'success'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>') + `<span>${message}</span>`;
      if (type === 'success') {
        showConfirmPopup('Demande envoyée !', message);
      }
    };

    const validators = {
      name: v => v.trim().length >= 2 || 'Merci d\'indiquer votre nom complet.',
      phone: v => /^[0-9+\s().-]{8,}$/.test(v.trim()) || 'Numéro de téléphone invalide.',
      email: v => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Adresse e-mail invalide.',
      pickup: v => v.trim().length >= 2 || 'Merci d\'indiquer une adresse de départ.',
      dropoff: v => v.trim().length >= 2 || 'Merci d\'indiquer une adresse d\'arrivée.',
      date: v => v !== '' || 'Merci de choisir une date.',
      time: v => v !== '' || 'Merci de choisir une heure.',
    };

    const validateField = (field) => {
      const rule = validators[field.name];
      const group = field.closest('.form-group');
      const errorEl = group.querySelector('.form-error');
      if (!rule) return true;
      const result = rule(field.value);
      if (result === true) {
        group.classList.remove('has-error');
        errorEl.textContent = '';
        return true;
      }
      group.classList.add('has-error');
      errorEl.textContent = result;
      return false;
    };

    form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => { if (field.closest('.form-group').classList.contains('has-error')) validateField(field); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('.form-control[name]').forEach(field => {
        if (!validateField(field)) valid = false;
      });
      if (!valid) {
        showFeedback('error', 'Merci de corriger les champs indiqués avant d\'envoyer.');
        return;
      }

      const endpoint = form.getAttribute('action');
      const isPlaceholder = !endpoint || endpoint.includes('YOUR_FORM_ID');
      submitBtn.disabled = true;
      submitBtn.dataset.label = submitBtn.textContent;
      submitBtn.textContent = 'Envoi en cours...';

      if (isPlaceholder) {
        await new Promise(r => setTimeout(r, 900));
        showFeedback('success', 'Demande enregistrée avec succès. Nous vous contacterons très rapidement pour confirmer votre réservation.');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.label;
        return;
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          showFeedback('success', 'Votre demande a bien été envoyée ! Nous vous contactons rapidement pour confirmer.');
          form.reset();
        } else {
          showFeedback('error', 'Une erreur est survenue. Merci de nous appeler directement au +41 78 719 44 44.');
        }
      } catch (err) {
        showFeedback('error', 'Connexion impossible. Merci de nous appeler directement au +41 78 719 44 44.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.label;
      }
    });

    const dateField = form.querySelector('input[name="date"]');
    if (dateField) dateField.min = new Date().toISOString().split('T')[0];
  }

  /* ---------- 3D tilt on cards ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    const tiltEls = document.querySelectorAll('.service-card, .fleet-card, .hero-card');
    const maxTilt = 7;
    tiltEls.forEach(card => {
      let rect = null;
      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        card.style.transition = 'transform .1s ease-out';
      });
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * maxTilt;
        const ry = (px - 0.5) * maxTilt;
        card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px) translateZ(0)`;
        card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
        card.style.transform = '';
        rect = null;
      });
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
