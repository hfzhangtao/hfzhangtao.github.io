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
// CHEMISTRY / MATERIALS THEMED BACKGROUND
// — hexagonal graphene grid + floating molecular structures
// — polymer chain paths + benzene rings
// — UV photopolymerization: light beams, crosslinking, layer lines
// ============================================================
(function () {
  var canvas = document.getElementById('particleBg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var animId = null;
  var running = true;
  var mouseX = -1000;
  var mouseY = -1000;
  var time = 0;

  // Offscreen canvas for static hex grid (cached)
  var gridCanvas = null;
  var gridDirty = true;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gridDirty = true;
  }

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  // --- Hex grid helpers ---
  var HEX_R = 55; // hexagon circumradius
  var HEX_H = HEX_R * Math.sqrt(3); // vertical spacing
  var HEX_W = HEX_R * 1.5; // horizontal spacing

  function hexCenter(col, row) {
    var x = col * HEX_W * 2 + (row % 2) * HEX_W;
    var y = row * HEX_H;
    // Offset so grid starts at top-left with some margin
    return { x: x - HEX_R, y: y - HEX_R };
  }

  function drawHexagon(ctx, cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = Math.PI / 3 * i - Math.PI / 6;
      var hx = cx + r * Math.cos(angle);
      var hy = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
  }

  // Build static hexagonal grid
  function buildHexGrid() {
    if (!gridDirty && gridCanvas) return;
    gridCanvas = document.createElement('canvas');
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;
    var gctx = gridCanvas.getContext('2d');
    var dark = isDark();
    var strokeColor = dark ? 'rgba(148,163,184,0.12)' : 'rgba(37,99,235,0.08)';

    var cols = Math.ceil(canvas.width / (HEX_W * 2)) + 2;
    var rows = Math.ceil(canvas.height / HEX_H) + 2;

    for (var row = -1; row < rows; row++) {
      for (var col = -1; col < cols; col++) {
        var c = hexCenter(col, row);
        drawHexagon(gctx, c.x, c.y, HEX_R);
        gctx.strokeStyle = strokeColor;
        gctx.lineWidth = 0.8;
        gctx.stroke();
      }
    }
    gridDirty = false;
  }

  // --- Floating molecular structures ---
  var molecules = [];
  var MOL_COUNT = 26;
  // UV beam state
  var uvBeams = [];
  var UV_BEAM_COUNT = 3;

  function initUvBeams() {
    uvBeams = [];
    for (var i = 0; i < UV_BEAM_COUNT; i++) {
      uvBeams.push({
        // Start from top edge, spread across width
        sx: canvas.width * (0.15 + i * 0.3),
        sy: -20,
        // Angle: roughly 60-80 degrees from horizontal (steep diagonal)
        angle: Math.PI / 2 + (Math.random() - 0.5) * 0.35,
        length: canvas.height * (0.5 + Math.random() * 0.4),
        width: 30 + Math.random() * 40,
        opacity: 0,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function createMolecule() {
    var type = Math.random();
    var mol = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.003,
      size: Math.random() * 16 + 10,
      opacity: Math.random() * 0.18 + 0.08
    };

    if (type < 0.3) {
      // Benzene ring
      mol.type = 'benzene';
    } else if (type < 0.55) {
      // Small molecule — 2-3 atoms
      mol.type = 'small';
      mol.atoms = 2 + Math.floor(Math.random() * 2);
    } else if (type < 0.75) {
      // Polymer chain segment
      mol.type = 'polymer';
      mol.segments = 3 + Math.floor(Math.random() * 4);
    } else {
      // Photocrosslinking monomer pair — two nodes that react under UV
      mol.type = 'photocrosslink';
      mol.active = Math.random() > 0.5;
      mol.glowPhase = Math.random() * Math.PI * 2;
    }
    return mol;
  }

  function initMolecules() {
    molecules = [];
    for (var i = 0; i < MOL_COUNT; i++) {
      molecules.push(createMolecule());
    }
    initUvBeams();
  }

  function drawBenzene(ctx, mol) {
    ctx.save();
    ctx.translate(mol.x, mol.y);
    ctx.rotate(mol.rot);
    var r = mol.size;
    var dark = isDark();
    var strokeC = dark ? 'rgba(148,163,184,' + mol.opacity + ')' : 'rgba(37,99,235,' + mol.opacity + ')';
    var fillC = dark ? 'rgba(148,163,184,' + (mol.opacity * 0.4) + ')' : 'rgba(37,99,235,' + (mol.opacity * 0.3) + ')';
    var atomC = dark ? 'rgba(203,213,225,' + (mol.opacity * 1.6) + ')' : 'rgba(59,130,246,' + (mol.opacity * 1.4) + ')';

    // Outer hexagon
    drawHexagon(ctx, 0, 0, r);
    ctx.strokeStyle = strokeC;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Inner circle (aromatic ring)
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    ctx.strokeStyle = strokeC;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Atoms at vertices
    for (var i = 0; i < 6; i++) {
      var angle = Math.PI / 3 * i - Math.PI / 6;
      var ax = r * Math.cos(angle);
      var ay = r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(ax, ay, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = atomC;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSmallMol(ctx, mol) {
    ctx.save();
    ctx.translate(mol.x, mol.y);
    ctx.rotate(mol.rot);
    var dark = isDark();
    var strokeC = dark ? 'rgba(148,163,184,' + mol.opacity + ')' : 'rgba(37,99,235,' + mol.opacity + ')';
    var atomC = dark ? 'rgba(203,213,225,' + (mol.opacity * 1.8) + ')' : 'rgba(59,130,246,' + (mol.opacity * 1.6) + ')';

    var r = mol.size * 0.7;
    var n = mol.atoms;
    for (var i = 0; i < n; i++) {
      // Position atoms
      var ax, ay;
      if (n === 2) {
        ax = (i - 0.5) * r * 1.2;
        ay = 0;
      } else {
        var angle = (Math.PI * 2 / n) * i - Math.PI / 2;
        ax = r * 0.7 * Math.cos(angle);
        ay = r * 0.7 * Math.sin(angle);
      }
      // Draw bond between atoms
      if (i < n - 1) {
        var bx, by;
        if (n === 2) {
          bx = (i + 0.5) * r * 1.2;
          by = 0;
        } else {
          var a2 = (Math.PI * 2 / n) * (i + 1) - Math.PI / 2;
          bx = r * 0.7 * Math.cos(a2);
          by = r * 0.7 * Math.sin(a2);
        }
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = strokeC;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      // If only 2 atoms, also draw bond directly
      if (n === 2 && i === 0) {
        // bond already drawn in loop above
      }
      // Draw atom
      ctx.beginPath();
      ctx.arc(ax, ay, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = atomC;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPolymer(ctx, mol) {
    ctx.save();
    ctx.translate(mol.x, mol.y);
    ctx.rotate(mol.rot);
    var dark = isDark();
    var strokeC = dark ? 'rgba(148,163,184,' + mol.opacity + ')' : 'rgba(37,99,235,' + mol.opacity + ')';
    var atomC = dark ? 'rgba(203,213,225,' + (mol.opacity * 1.6) + ')' : 'rgba(59,130,246,' + (mol.opacity * 1.3) + ')';

    var segLen = mol.size * 0.8;
    var n = mol.segments;
    ctx.beginPath();
    var px = -segLen * (n - 1) / 2;
    ctx.moveTo(px, 0);
    for (var i = 1; i < n; i++) {
      px += segLen;
      var py = (i % 2 === 0 ? -1 : 1) * segLen * 0.4;
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = strokeC;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Nodes along chain
    px = -segLen * (n - 1) / 2;
    for (var i = 0; i < n; i++) {
      var py2 = i > 0 ? ((i % 2 === 0 ? -1 : 1) * segLen * 0.4) : 0;
      ctx.beginPath();
      ctx.arc(px, py2, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = atomC;
      ctx.fill();
      px += segLen;
    }
    ctx.restore();
  }

  function drawPhotoCrosslink(ctx, mol) {
    ctx.save();
    ctx.translate(mol.x, mol.y);
    ctx.rotate(mol.rot);
    var dark = isDark();

    // UV purple tone
    var uvColor = dark ? '180,130,255' : '139,92,246';
    var bondColor = dark ? 'rgba(180,130,255,' + (mol.opacity * 1.1) + ')' : 'rgba(139,92,246,' + (mol.opacity * 1.1) + ')';
    var nodeColor = dark ? 'rgba(216,180,255,' + (mol.opacity * 2) + ')' : 'rgba(167,139,250,' + (mol.opacity * 1.8) + ')';
    var glowAlpha = mol.active ? 0.25 + Math.sin(time * 2 + mol.glowPhase) * 0.12 : mol.opacity * 0.3;

    var sep = mol.size * 0.9;
    // Two monomer nodes
    var leftX = -sep / 2;
    var rightX = sep / 2;

    // Glow between nodes (UV curing effect)
    if (mol.active) {
      var grad = ctx.createLinearGradient(leftX, 0, rightX, 0);
      grad.addColorStop(0, 'rgba(' + uvColor + ',0)');
      grad.addColorStop(0.5, 'rgba(' + uvColor + ',' + glowAlpha.toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(' + uvColor + ',0)');
      ctx.fillStyle = grad;
      ctx.fillRect(leftX, -sep * 0.3, sep, sep * 0.6);

      // Small sparkle dots in the middle
      for (var s = 0; s < 3; s++) {
        var sx = leftX + sep * (0.2 + s * 0.3);
        var sy = (Math.sin(time * 3 + s + mol.glowPhase) * 0.3) * sep;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + uvColor + ',' + (0.6 + Math.sin(time * 4 + s) * 0.3).toFixed(2) + ')';
        ctx.fill();
      }
    }

    // Bond line with dash (forming crosslink)
    ctx.beginPath();
    ctx.moveTo(leftX, 0);
    ctx.lineTo(rightX, 0);
    ctx.strokeStyle = bondColor;
    ctx.lineWidth = 1.0;
    if (mol.active) {
      ctx.setLineDash([4, 2]);
    } else {
      ctx.setLineDash([1, 3]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Two monomer nodes
    for (var i = 0; i < 2; i++) {
      var nx = i === 0 ? leftX : rightX;
      // Small node circle + outer ring (like a reactive group)
      ctx.beginPath();
      ctx.arc(nx, 0, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      // Outer ring
      ctx.beginPath();
      ctx.arc(nx, 0, 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = bondColor;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- Draw UV light beams ---
  function drawUvBeams(ctx) {
    var dark = isDark();
    var uvColor = dark ? '180,130,255' : '139,92,246';

    // Animate beam opacity — slow pulse
    var globalPulse = 0.5 + Math.sin(time * 0.8) * 0.3;

    for (var i = 0; i < uvBeams.length; i++) {
      var b = uvBeams[i];
      // Pulse each beam at a different phase
      var pulse = globalPulse * (0.6 + 0.4 * Math.sin(time * 0.5 + b.phase));
      b.opacity += (pulse - b.opacity) * 0.02;

      var endX = b.sx + Math.cos(b.angle) * b.length;
      var endY = b.sy + Math.sin(b.angle) * b.length;

      // Soft glow along beam
      ctx.save();
      var grad = ctx.createLinearGradient(b.sx, b.sy, endX, endY);
      grad.addColorStop(0, 'rgba(' + uvColor + ',0)');
      grad.addColorStop(0.35, 'rgba(' + uvColor + ',' + (b.opacity * 0.06).toFixed(3) + ')');
      grad.addColorStop(0.65, 'rgba(' + uvColor + ',' + (b.opacity * 0.04).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(' + uvColor + ',0)');

      ctx.beginPath();
      var perpX = Math.cos(b.angle + Math.PI / 2) * b.width;
      var perpY = Math.sin(b.angle + Math.PI / 2) * b.width;
      ctx.moveTo(b.sx + perpX, b.sy + perpY);
      ctx.lineTo(b.sx - perpX, b.sy - perpY);
      ctx.lineTo(endX - perpX, endY - perpY);
      ctx.lineTo(endX + perpX, endY + perpY);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Thin bright core line
      ctx.beginPath();
      ctx.moveTo(b.sx, b.sy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'rgba(' + uvColor + ',' + (b.opacity * 0.07).toFixed(3) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- Draw 3D printing layer lines ---
  function drawLayerLines(ctx) {
    var dark = isDark();
    var lineColor = dark ? 'rgba(148,163,184,0.05)' : 'rgba(37,99,235,0.04)';
    var layerH = 32;
    var layers = Math.floor(canvas.height / layerH);

    for (var i = 0; i < layers; i++) {
      var y = i * layerH + (time * 8) % layerH; // slowly drift upward
      // Vary the dash to suggest partially cured layers
      var dashLen = 4 + Math.sin(i * 1.7) * 2;
      var gapLen = 6 + Math.cos(i * 2.3) * 3;

      ctx.beginPath();
      ctx.setLineDash([dashLen, gapLen]);
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // --- Main draw loop ---
  function draw(timestamp) {
    if (!running) return;
    time = timestamp * 0.001;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw static hex grid
    buildHexGrid();
    ctx.drawImage(gridCanvas, 0, 0);

    // 2. Draw 3D printing layer lines
    drawLayerLines(ctx);

    // 3. Draw UV light beams
    drawUvBeams(ctx);

    // 4. Update & draw floating molecules
    var dark = isDark();
    for (var i = 0; i < molecules.length; i++) {
      var mol = molecules[i];
      mol.x += mol.vx;
      mol.y += mol.vy;
      mol.rot += mol.rotSpeed;

      // Photocrosslink: pulse active state
      if (mol.type === 'photocrosslink') {
        mol.glowPhase += 0.01;
      }

      // Wrap around
      var pad = 60;
      if (mol.x < -pad) mol.x = canvas.width + pad;
      if (mol.x > canvas.width + pad) mol.x = -pad;
      if (mol.y < -pad) mol.y = canvas.height + pad;
      if (mol.y > canvas.height + pad) mol.y = -pad;

      // Mouse interaction — gentle repel
      var dx = mol.x - mouseX;
      var dy = mol.y - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0.01) {
        mol.vx += (dx / dist) * 0.03;
        mol.vy += (dy / dist) * 0.03;
      }
      mol.vx *= 0.998;
      mol.vy *= 0.998;

      // Clamp speed
      var speed = Math.sqrt(mol.vx * mol.vx + mol.vy * mol.vy);
      if (speed > 0.4) {
        mol.vx *= 0.4 / speed;
        mol.vy *= 0.4 / speed;
      }

      // Draw based on type
      if (mol.type === 'benzene') drawBenzene(ctx, mol);
      else if (mol.type === 'small') drawSmallMol(ctx, mol);
      else if (mol.type === 'polymer') drawPolymer(ctx, mol);
      else if (mol.type === 'photocrosslink') drawPhotoCrosslink(ctx, mol);
    }

    animId = requestAnimationFrame(draw);
  }

  // Track mouse
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  document.addEventListener('mouseleave', function () {
    mouseX = -1000;
    mouseY = -1000;
  });

  // Visibility change
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running && !animId) {
      animId = requestAnimationFrame(draw);
    }
  });

  // Resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      initMolecules();
    }, 200);
  });

  resize();
  initMolecules();
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
