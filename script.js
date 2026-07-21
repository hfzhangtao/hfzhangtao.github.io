// Language toggle
window.__currentLang = localStorage.getItem('lang') || 'en';

window.__getTranslation = function (key, lang) {
  var dict = window.TRANS || {};
  var d = dict[lang || window.__currentLang];
  if (!d) return undefined;
  // Keys are flat strings like 'nav.about', not nested objects
  return d[key];
};

window.applyLanguage = function (lang) {
  lang = lang || window.__currentLang;
  // Update all [data-i18n] elements
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var key = el.getAttribute('data-i18n');
    var val = window.__getTranslation(key, lang);
    if (val !== undefined) el.textContent = val;
  }
  // Update toggle button text
  var toggles = document.querySelectorAll('#langToggle, #mobileLangToggle');
  for (var j = 0; j < toggles.length; j++) {
    toggles[j].textContent = lang === 'en' ? 'CN' : 'EN';
  }
  // Update HTML lang attribute
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  // Update page title
  var t = window.__getTranslation('pageTitle', lang);
  if (t) document.title = t;
  // Update publication toggle button
  var pubToggle = document.getElementById('pubToggle');
  if (pubToggle) {
    var morePubs = document.getElementById('morePubs');
    var isExpanded = morePubs && !morePubs.classList.contains('hidden');
    var showMore = window.__getTranslation('publications.showMore', lang) || 'Show All';
    var showLess = window.__getTranslation('publications.showLess', lang) || 'Show Less';
    pubToggle.innerHTML = isExpanded
      ? '<i class="fa-solid fa-chevron-up mr-2"></i>' + showLess
      : '<i class="fa-solid fa-chevron-down mr-2"></i>' + showMore;
  }
  localStorage.setItem('lang', lang);
  window.__currentLang = lang;
};

window.toggleLanguage = function () {
  window.applyLanguage(window.__currentLang === 'en' ? 'zh' : 'en');
};

// Apply saved language on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    window.applyLanguage(window.__currentLang);
  });
} else {
  window.applyLanguage(window.__currentLang);
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const themeIcon = document.getElementById('themeIcon');
const mobileThemeIcon = document.getElementById('mobileThemeIcon');

function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    themeIcon?.classList.replace('fa-moon', 'fa-sun');
    mobileThemeIcon?.classList.replace('fa-moon', 'fa-sun');
  } else {
    document.documentElement.classList.remove('dark');
    themeIcon?.classList.replace('fa-sun', 'fa-moon');
    mobileThemeIcon?.classList.replace('fa-sun', 'fa-moon');
  }
  localStorage.setItem('theme', theme);
}

setTheme(getTheme());

function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

themeToggle?.addEventListener('click', toggleTheme);
mobileThemeToggle?.addEventListener('click', toggleTheme);

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn?.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

document.querySelectorAll('.mobile-nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
  });
});

// Scroll-triggered fade-in animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

// Active nav link highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  let current = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink);

// Navbar shadow on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('shadow-md');
  } else {
    navbar.classList.remove('shadow-md');
  }
});

// Publications toggle
const pubToggle = document.getElementById('pubToggle');
const morePubs = document.getElementById('morePubs');

pubToggle?.addEventListener('click', () => {
  morePubs.classList.toggle('hidden');
  const isExpanded = !morePubs.classList.contains('hidden');
  var showMore = window.__getTranslation('publications.showMore') || 'Show All 13 Publications';
  var showLess = window.__getTranslation('publications.showLess') || 'Show Less';
  pubToggle.innerHTML = isExpanded
    ? '<i class="fa-solid fa-chevron-up mr-2"></i>' + showLess
    : '<i class="fa-solid fa-chevron-down mr-2"></i>' + showMore;
});

// Publication year filter
document.querySelectorAll('.pub-filter-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    // Update active button
    document.querySelectorAll('.pub-filter-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    var filter = btn.getAttribute('data-filter');
    var morePubsDiv = document.getElementById('morePubs');
    var pubToggleBtn = document.getElementById('pubToggle');

    // Show/hide individual pub items
    document.querySelectorAll('.pub-item').forEach(function(item) {
      if (filter === 'all' || item.getAttribute('data-year') === filter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    // Handle the "morePubs" container and toggle button
    if (filter !== 'all') {
      // Force-expand hidden section using inline style (bypasses Tailwind hidden class)
      if (morePubsDiv) {
        morePubsDiv.classList.remove('hidden');
        morePubsDiv.style.display = 'block';
      }
      if (pubToggleBtn) pubToggleBtn.style.display = 'none';
    } else {
      // Collapse back to default state
      if (morePubsDiv) {
        morePubsDiv.classList.add('hidden');
        morePubsDiv.style.display = '';
      }
      if (pubToggleBtn) {
        pubToggleBtn.style.display = '';
        pubToggleBtn.innerHTML = '<i class="fa-solid fa-chevron-down mr-2"></i>' +
          (window.__getTranslation('publications.showMore') || 'Show All 13 Publications');
      }
    }
  });
});

// ============================================================
// PARTICLE NETWORK BACKGROUND
// ============================================================
(function () {
  var canvas = document.getElementById('particleBg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var particles = [];
  var PARTICLE_COUNT = 70;
  var CONNECT_DIST = 140;
  var PARTICLE_SPEED = 0.25;
  var mouseX = -1000;
  var mouseY = -1000;
  var animId = null;
  var running = true;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function createParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED,
        r: Math.random() * 1.8 + 0.8
      });
    }
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var dark = isDark();
    var color = dark ? '160,180,220' : '37,99,235';
    var lineAlpha = dark ? 0.13 : 0.1;
    var dotAlpha = dark ? 0.28 : 0.2;

    // Update & draw
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ',' + dotAlpha + ')';
      ctx.fill();
    }

    // Draw connections
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          var alpha = (1 - dist / CONNECT_DIST) * lineAlpha;
          ctx.strokeStyle = 'rgba(' + color + ',' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Mouse interaction — attract nearby particles
    if (mouseX > 0 && mouseY > 0) {
      for (var i = 0; i < particles.length; i++) {
        var dx2 = mouseX - particles[i].x;
        var dy2 = mouseY - particles[i].y;
        var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (dist2 < 200 && dist2 > 0.01) {
          particles[i].vx += (dx2 / dist2) * 0.015;
          particles[i].vy += (dy2 / dist2) * 0.015;
        }
        // Friction
        particles[i].vx *= 0.998;
        particles[i].vy *= 0.998;
      }
    }

    animId = requestAnimationFrame(draw);
  }

  // Track mouse for interaction
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  document.addEventListener('mouseleave', function () {
    mouseX = -1000;
    mouseY = -1000;
  });

  // Visibility change: pause/resume
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running && !animId) {
      animId = requestAnimationFrame(draw);
    }
  });

  // Resize
  window.addEventListener('resize', function () {
    clearTimeout(canvas._resizeTimer);
    canvas._resizeTimer = setTimeout(function () {
      resize();
      // Re-clamp particles
      for (var i = 0; i < particles.length; i++) {
        particles[i].x = Math.min(particles[i].x, canvas.width);
        particles[i].y = Math.min(particles[i].y, canvas.height);
      }
    }, 150);
  });

  resize();
  createParticles();
  animId = requestAnimationFrame(draw);
})();

// ============================================================
// COUNT-UP ANIMATION
// ============================================================
(function () {
  var countUpEls = document.querySelectorAll('.count-up');
  if (!countUpEls.length) return;

  var counted = new WeakSet();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCount(el) {
    if (counted.has(el)) return;
    counted.add(el);

    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800; // ms
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOut(progress);
      var current = Math.round(easedProgress * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  var countUpObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.5 });

  countUpEls.forEach(function (el) {
    countUpObserver.observe(el);
  });
})();

// ============================================================
// MOUSE GLOW (HERO ONLY)
// ============================================================
(function () {
  var glow = document.getElementById('mouseGlow');
  var hero = document.getElementById('hero');
  if (!glow || !hero) return;

  var ticking = false;

  hero.addEventListener('mousemove', function (e) {
    if (!ticking) {
      requestAnimationFrame(function () {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
        ticking = false;
      });
      ticking = true;
    }
  });

  hero.addEventListener('mouseleave', function () {
    glow.style.opacity = '0';
  });

  hero.addEventListener('mouseenter', function () {
    glow.style.opacity = '1';
  });
})();

// ============================================================
// EXTEND SCROLL REVEAL — observe new reveal classes
// ============================================================
(function () {
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  var reveals = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scale');
  for (var i = 0; i < reveals.length; i++) {
    revealObserver.observe(reveals[i]);
  }
})();
