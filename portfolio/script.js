/* ============================================
   ALEX RIVERA — PORTFOLIO JAVASCRIPT
   Vanilla JS | No external libraries (Bootstrap excepted)
   ============================================ */

'use strict';

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Query a single DOM element.
 * @param {string} sel - CSS selector
 * @param {Element} [ctx=document] - optional context
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Query all matching DOM elements as an Array.
 */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Run a callback once the DOM is fully parsed.
 */
const onReady = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
};

// ============================================
// 1. NAVBAR — scroll behaviour & active links
// ============================================

function initNavbar() {
  const navbar   = $('#navbar');
  const navLinks = $$('.nav-link-custom');
  const sections = $$('section[id]');

  let lastScrollY   = window.scrollY;
  let ticking       = false;

  function updateNavbar() {
    const currentY = window.scrollY;

    // Add "scrolled" class after 20 px
    navbar.classList.toggle('scrolled', currentY > 20);

    // Hide navbar when scrolling down fast (> 80 px scrolled); show on up
    if (currentY > lastScrollY && currentY > 80) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
    lastScrollY = currentY;

    // Active section highlighting
    let currentSection = '';
    sections.forEach((sec) => {
      const offset = sec.offsetTop - 100;
      if (currentY >= offset) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentSection);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Smooth scroll on nav clicks
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target   = $(targetId);
      if (target) {
        const offset = target.offsetTop - 70;
        window.scrollTo({ top: offset, behavior: 'smooth' });

        // Close Bootstrap mobile menu if open
        const bsCollapse = document.getElementById('navbarNav');
        if (bsCollapse && bsCollapse.classList.contains('show')) {
          const toggler = $('#navbarToggler');
          if (toggler) toggler.click();
        }
      }
    });
  });
}

// ============================================
// 2. TYPING ANIMATION (Hero section)
// ============================================

function initTypingAnimation() {
  const typingEl = $('.typing-text');
  if (!typingEl) return;

  const phrases = [
    'Front-End Developer',
    'Técnico de Informática',
    'Futuro Full Stack Developer',
    'Entusiasta de JavaScript & React',
    'Apaixonado por Tecnologia',
  ];

  let phraseIndex   = 0;
  let charIndex     = 0;
  let isDeleting    = false;
  let pauseCounter  = 0;

  const PAUSE_AFTER_WORD  = 60;  // frames to hold at full word
  const PAUSE_BEFORE_TYPE = 15;  // frames to hold at empty string

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!isDeleting && charIndex <= phrase.length) {
      typingEl.textContent = phrase.slice(0, charIndex);
      charIndex++;

      if (charIndex > phrase.length) {
        // Word is complete — pause before deleting
        if (++pauseCounter < PAUSE_AFTER_WORD) {
          setTimeout(tick, 50);
          return;
        }
        pauseCounter = 0;
        isDeleting   = true;
      }
    } else if (isDeleting && charIndex >= 0) {
      typingEl.textContent = phrase.slice(0, charIndex);
      charIndex--;

      if (charIndex < 0) {
        // Finished deleting — pause before next word
        if (++pauseCounter < PAUSE_BEFORE_TYPE) {
          setTimeout(tick, 50);
          return;
        }
        pauseCounter = 0;
        isDeleting   = false;
        phraseIndex  = (phraseIndex + 1) % phrases.length;
        charIndex    = 0;
      }
    }

    const speed = isDeleting ? 40 : 80;
    setTimeout(tick, speed);
  }

  tick();
}

// ============================================
// 3. PARTICLES CANVAS (Hero background)
// ============================================

function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const COUNT     = 55;
  const MOUSE     = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Track mouse for subtle interaction
  canvas.closest('section').addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    MOUSE.x = e.clientX - rect.left;
    MOUSE.y = e.clientY - rect.top;
  }, { passive: true });

  // Particle factory
  function createParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.5 + 0.5,
      vx:   (Math.random() - 0.5) * 0.3,
      vy:   (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    };
  }

  for (let i = 0; i < COUNT; i++) particles.push(createParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connection lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(6,214,160,${0.06 * (1 - dist / 110)})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }

    // Draw & update particles
    particles.forEach((p) => {
      // Subtle mouse repulsion
      const mdx  = p.x - MOUSE.x;
      const mdy  = p.y - MOUSE.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 100) {
        p.vx += (mdx / mdist) * 0.04;
        p.vy += (mdy / mdist) * 0.04;
      }

      // Dampen velocity
      p.vx *= 0.99;
      p.vy *= 0.99;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6,214,160,${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

// ============================================
// 4. SCROLL REVEAL (Intersection Observer)
// ============================================

function initScrollReveal() {
  const revealEls = $$('.reveal, .reveal-left, .reveal-right');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, stop observing
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold:  0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  revealEls.forEach((el) => observer.observe(el));
}

// ============================================
// 5. SKILL BARS (animated on scroll into view)
// ============================================

function initSkillBars() {
  const bars = $$('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar  = entry.target;
        const pct  = bar.dataset.width || '0';
        // Small delay so the section reveal animation finishes first
        setTimeout(() => {
          bar.style.width = pct + '%';
        }, 300);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach((bar) => observer.observe(bar));
}

// ============================================
// 6. CONTACT FORM (simulation)
// ============================================

function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn      = form.querySelector('.btn-send');
    const origHTML = btn.innerHTML;

    // Simulate sending
    btn.innerHTML  = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    btn.disabled   = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
      showToast('✅ Message sent successfully! I\'ll get back to you soon.');
      form.reset();

      setTimeout(() => {
        btn.innerHTML = origHTML;
        btn.disabled  = false;
      }, 3000);
    }, 1800);
  });
}

// ============================================
// 7. TOAST NOTIFICATION
// ============================================

function showToast(message) {
  // Remove existing toast
  const existing = $('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className  = 'toast-notification';
  toast.innerHTML  = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  document.body.appendChild(toast);

  // Trigger show
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ============================================
// 8. COUNTER ANIMATION (About stats)
// ============================================

function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let current  = 0;
      const step   = Math.ceil(target / 50);
      const id     = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(id);
        }
        el.textContent = current + suffix;
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
}

// ============================================
// 9. ACTIVE NAV ON HASH LOAD
// ============================================

function initHashNav() {
  const hash = window.location.hash;
  if (hash) {
    const target = $(hash);
    if (target) {
      setTimeout(() => {
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
      }, 100);
    }
  }
}

// ============================================
// 10. PROJECT CARD TILT (subtle 3-D on hover)
// ============================================

function initCardTilt() {
  $$('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-6px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
      setTimeout(() => { card.style.transition = ''; }, 400);
    });
  });
}

// ============================================
// BOOT — initialise everything
// ============================================

onReady(() => {
  initNavbar();
  initTypingAnimation();
  initParticles();
  initScrollReveal();
  initSkillBars();
  initContactForm();
  initCounters();
  initHashNav();
  initCardTilt();

  // Trigger initial reveal check (elements already in viewport on load)
  window.dispatchEvent(new Event('scroll'));
});
