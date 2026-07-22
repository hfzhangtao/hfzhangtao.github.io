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
    var strokeColor = dark ? 'rgba(148,163,184,0.10)' : 'rgba(37,99,235,0.07)';

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
  var MOL_COUNT = 22;
  // UV beam state
  var uvBeams = [];
  var UV_BEAM_COUNT = 2;
  // UV photon particles flowing along beams
  var uvPhotons = [];

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

  function initUvPhotons() {
    uvPhotons = [];
    for (var i = 0; i < 12; i++) {
      uvPhotons.push({
        beamIndex: i % UV_BEAM_COUNT,
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        offset: (Math.random() - 0.5) * 0.6,
        size: 0.5 + Math.random() * 1.0,
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
      size: Math.random() * 15 + 9,
      opacity: Math.random() * 0.1 + 0.05
    };

    // Liquid color palette for glassware
    var liqColors = [
      { r: 139, g: 92, b: 246 },   // purple (UV resin)
      { r: 96, g: 165, b: 250 },    // blue (catalyst)
      { r: 74, g: 222, b: 128 },    // green (bio-ink)
      { r: 250, g: 204, b: 21 },    // yellow (photoinitiator)
      { r: 244, g: 114, b: 182 }    // pink (fluorescent dye)
    ];

    if (type < 0.25) {
      // Benzene ring
      mol.type = 'benzene';
    } else if (type < 0.50) {
      // Polymer chain — realistic carbon backbone with side groups
      mol.type = 'polymer';
      mol.units = 4 + Math.floor(Math.random() * 6);
    } else if (type < 0.65) {
      // Photocrosslinking monomer pair — two nodes that react under UV
      mol.type = 'photocrosslink';
      mol.active = Math.random() > 0.5;
      mol.glowPhase = Math.random() * Math.PI * 2;
    } else if (type < 0.85) {
      // Beaker (烧杯) — lab glassware
      mol.type = 'beaker';
      mol.size = Math.random() * 12 + 14;  // larger for recognizability
      mol.liquidLevel = Math.random() * 0.4 + 0.25;
      var lc = liqColors[Math.floor(Math.random() * liqColors.length)];
      mol.liquidR = lc.r;
      mol.liquidG = lc.g;
      mol.liquidB = lc.b;
    } else {
      // Erlenmeyer flask (锥形瓶) — conical flask
      mol.type = 'erlenmeyer';
      mol.size = Math.random() * 12 + 14;
      mol.liquidLevel = Math.random() * 0.4 + 0.25;
      var lc2 = liqColors[Math.floor(Math.random() * liqColors.length)];
      mol.liquidR = lc2.r;
      mol.liquidG = lc2.g;
      mol.liquidB = lc2.b;
    }
    return mol;
  }

  function initMolecules() {
    molecules = [];
    for (var i = 0; i < MOL_COUNT; i++) {
      molecules.push(createMolecule());
    }
    initUvBeams();
    initUvPhotons();
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

  // Clean polymer chain — simple zigzag backbone
  function drawPolymer(ctx, mol) {
    ctx.save();
    ctx.translate(mol.x, mol.y);
    ctx.rotate(mol.rot);
    var dark = isDark();

    var baseR, baseG, baseB;
    if (dark) { baseR = 148; baseG = 163; baseB = 184; }
    else      { baseR = 37;  baseG = 99;  baseB = 235; }

    var segLen = mol.size * 0.9;
    var n = mol.units;
    var zigAmp = segLen * 0.4;
    var alpha = mol.opacity;

    // Backbone zigzag
    ctx.beginPath();
    var startX = -(n * segLen) / 2;
    ctx.moveTo(startX, 0);
    for (var i = 1; i <= n; i++) {
      var px = startX + i * segLen;
      var py = (i % 2 === 0 ? -1 : 1) * zigAmp;
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(' + baseR + ',' + baseG + ',' + baseB + ',' + (alpha * 1.2).toFixed(3) + ')';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Small nodes at vertices
    var nx = startX;
    for (var i = 0; i <= n; i++) {
      var ny = i > 0 ? ((i % 2 === 0 ? -1 : 1) * zigAmp) : 0;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + baseR + ',' + baseG + ',' + baseB + ',' + (alpha * 1.3).toFixed(3) + ')';
      ctx.fill();
      nx += segLen;
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

  // --- Draw beaker (烧杯) ---
  function drawBeaker(ctx, mol) {
    ctx.save();
    ctx.translate(mol.x, mol.y);
    ctx.rotate(mol.rot);

    var dark = isDark();
    var baseR, baseG, baseB;
    if (dark) { baseR = 148; baseG = 163; baseB = 184; }
    else      { baseR = 37;  baseG = 99;  baseB = 235; }
    var alpha = mol.opacity;

    var w = mol.size * 1.4;         // beaker width
    var h = mol.size * 2.2;         // beaker height
    var wallThick = 1.0;
    var lipSize = mol.size * 0.25;  // spout protrusion

    // --- Beaker body outline ---
    ctx.beginPath();
    // Top-left, open top (no rim on left side)
    ctx.moveTo(-w / 2, -h / 2);
    // Left wall (slight outward taper)
    ctx.lineTo(-w / 2 * 0.95, h / 2);
    // Bottom edge
    ctx.lineTo(w / 2 * 0.95, h / 2);
    // Right wall
    ctx.lineTo(w / 2, -h / 2);
    // Spout lip: small outward curve at top-right
    ctx.quadraticCurveTo(w / 2 + lipSize, -h / 2 - lipSize * 0.5, w / 2 + lipSize * 0.6, -h / 2 + lipSize * 0.3);

    ctx.strokeStyle = 'rgba(' + baseR + ',' + baseG + ',' + baseB + ',' + (alpha * 1.2).toFixed(3) + ')';
    ctx.lineWidth = wallThick;
    ctx.stroke();

    // --- Top rim mark (left side only, right has the spout) ---
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 3, -h / 2);
    ctx.lineTo(-w / 2 + 3, -h / 2);
    ctx.strokeStyle = 'rgba(' + baseR + ',' + baseG + ',' + baseB + ',' + (alpha * 0.8).toFixed(3) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // --- Liquid fill ---
    if (mol.liquidLevel > 0) {
      var liquidY = -h / 2 + (1 - mol.liquidLevel) * h;
      var liquidR = mol.liquidR, liquidG = mol.liquidG, liquidB = mol.liquidB;
      var inset = wallThick + 1;

      // Fill path (inside beaker walls + meniscus)
      ctx.beginPath();
      ctx.moveTo(-w / 2 * 0.95 + inset, h / 2);
      ctx.lineTo(-w / 2 * 0.95 + inset, liquidY);
      // Meniscus: concave upward
      ctx.quadraticCurveTo(0, liquidY - 2.5, w / 2 * 0.95 - inset, liquidY);
      ctx.lineTo(w / 2 * 0.95 - inset, h / 2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(' + liquidR + ',' + liquidG + ',' + liquidB + ',' + (alpha * 0.45).toFixed(3) + ')';
      ctx.fill();

      // Meniscus surface line
      ctx.beginPath();
      ctx.moveTo(-w / 2 * 0.95 + inset, liquidY);
      ctx.quadraticCurveTo(0, liquidY - 2.5, w / 2 * 0.95 - inset, liquidY);
      ctx.strokeStyle = 'rgba(' + liquidR + ',' + liquidG + ',' + liquidB + ',' + (alpha * 0.8).toFixed(3) + ')';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // --- Measurement lines (right side) ---
    var measureCount = 3;
    for (var i = 0; i < measureCount; i++) {
      var mlY = -h / 2 * 0.6 + (i + 1) * (h * 0.7) / (measureCount + 1);
      var mlLen = (i % 2 === 0) ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(w / 2 * 0.95 - wallThick - mlLen, mlY);
      ctx.lineTo(w / 2 * 0.95 - wallThick, mlY);
      ctx.strokeStyle = 'rgba(' + baseR + ',' + baseG + ',' + baseB + ',' + (alpha * 0.8).toFixed(3) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- Draw Erlenmeyer flask (锥形瓶) ---
  function drawErlenmeyer(ctx, mol) {
    ctx.save();
    ctx.translate(mol.x, mol.y);
    ctx.rotate(mol.rot);

    var dark = isDark();
    var baseR, baseG, baseB;
    if (dark) { baseR = 148; baseG = 163; baseB = 184; }
    else      { baseR = 37;  baseG = 99;  baseB = 235; }
    var alpha = mol.opacity;

    var totalH = mol.size * 2.4;
    var bodyW = mol.size * 1.1;       // width at bottom
    var neckW = mol.size * 0.4;       // width at neck
    var neckH = totalH * 0.25;        // neck height
    var bodyH = totalH - neckH;       // body (tapered) height

    // --- Flask body outline ---
    ctx.beginPath();
    // Top-left of neck
    ctx.moveTo(-neckW / 2, -totalH / 2);
    // Left side of neck going down
    ctx.lineTo(-neckW / 2, -totalH / 2 + neckH);
    // Tapered left side to bottom
    ctx.lineTo(-bodyW / 2, -totalH / 2 + totalH);
    // Bottom edge
    ctx.lineTo(bodyW / 2, -totalH / 2 + totalH);
    // Tapered right side up to neck
    ctx.lineTo(neckW / 2, -totalH / 2 + neckH);
    // Right side of neck going up
    ctx.lineTo(neckW / 2, -totalH / 2);

    ctx.strokeStyle = 'rgba(' + baseR + ',' + baseG + ',' + baseB + ',' + (alpha * 1.2).toFixed(3) + ')';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // --- Neck rim (two small horizontal marks) ---
    ctx.beginPath();
    ctx.moveTo(-neckW / 2 - 3, -totalH / 2);
    ctx.lineTo(-neckW / 2 + 2, -totalH / 2);
    ctx.moveTo(neckW / 2 - 2, -totalH / 2);
    ctx.lineTo(neckW / 2 + 3, -totalH / 2);
    ctx.strokeStyle = 'rgba(' + baseR + ',' + baseG + ',' + baseB + ',' + (alpha * 0.8).toFixed(3) + ')';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // --- Liquid fill (in the body only, below neck) ---
    if (mol.liquidLevel > 0) {
      var liquidBodyRatio = mol.liquidLevel;
      var neckBaseY = -totalH / 2 + neckH;
      var liquidY = neckBaseY + (1 - liquidBodyRatio) * bodyH;
      var liquidR = mol.liquidR, liquidG = mol.liquidG, liquidB = mol.liquidB;

      // Width at liquid Y (linear taper interpolation)
      var bodyProgress = (liquidY - neckBaseY) / bodyH;
      var liquidHW = neckW / 2 + (bodyW / 2 - neckW / 2) * bodyProgress;

      // Liquid fill
      ctx.beginPath();
      ctx.moveTo(-liquidHW + 0.5, liquidY);
      ctx.quadraticCurveTo(0, liquidY - 2.5, liquidHW - 0.5, liquidY);
      ctx.lineTo(bodyW / 2 - 0.5, -totalH / 2 + totalH);
      ctx.lineTo(-bodyW / 2 + 0.5, -totalH / 2 + totalH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(' + liquidR + ',' + liquidG + ',' + liquidB + ',' + (alpha * 0.45).toFixed(3) + ')';
      ctx.fill();

      // Meniscus line
      ctx.beginPath();
      ctx.moveTo(-liquidHW + 0.5, liquidY);
      ctx.quadraticCurveTo(0, liquidY - 2.5, liquidHW - 0.5, liquidY);
      ctx.strokeStyle = 'rgba(' + liquidR + ',' + liquidG + ',' + liquidB + ',' + (alpha * 0.8).toFixed(3) + ')';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // --- Measurement lines on the tapered body ---
    var measureCount = 4;
    for (var i = 0; i < measureCount; i++) {
      var mlY = (-totalH / 2 + neckH + 2) + (i + 1) * (bodyH - 4) / (measureCount + 1);
      var mlProgress = (mlY - (-totalH / 2 + neckH)) / bodyH;
      var mlHW = neckW / 2 + (bodyW / 2 - neckW / 2) * mlProgress;
      ctx.beginPath();
      ctx.moveTo(mlHW - 1, mlY);
      ctx.lineTo(mlHW - 6, mlY);
      ctx.strokeStyle = 'rgba(' + baseR + ',' + baseG + ',' + baseB + ',' + (alpha * 0.6).toFixed(3) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- Draw UV light beams ---
  // --- Draw small UV source lamp icon ---
  function drawUvSource(ctx, x, y, angle, op) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    var dark = isDark();
    var uvC = dark ? '180,130,255' : '139,92,246';
    // Lamp housing
    ctx.strokeStyle = 'rgba(' + uvC + ',' + (op * 0.45).toFixed(3) + ')';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-4, -3, 8, 6);
    // Filament cross
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(2, 0);
    ctx.moveTo(0, -2);
    ctx.lineTo(0, 2);
    ctx.strokeStyle = 'rgba(' + uvC + ',' + (op * 0.7).toFixed(3) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Glow dot at center
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + uvC + ',' + (op * 0.5).toFixed(3) + ')';
    ctx.fill();
    ctx.restore();
  }

  function drawUvBeams(ctx) {
    var dark = isDark();
    var uvColor = dark ? '180,130,255' : '139,92,246';

    // Animate beam opacity — slow subtle pulse
    var globalPulse = 0.4 + Math.sin(time * 0.8) * 0.2;

    for (var i = 0; i < uvBeams.length; i++) {
      var b = uvBeams[i];
      // Pulse each beam at a different phase
      var pulse = globalPulse * (0.6 + 0.4 * Math.sin(time * 0.5 + b.phase));
      b.opacity += (pulse - b.opacity) * 0.02;

      var endX = b.sx + Math.cos(b.angle) * b.length;
      var endY = b.sy + Math.sin(b.angle) * b.length;

      // --- Curing zone glow at beam impact point ---
      var cureGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, 38);
      cureGrad.addColorStop(0, 'rgba(' + uvColor + ',' + (b.opacity * 0.035).toFixed(3) + ')');
      cureGrad.addColorStop(0.55, 'rgba(' + uvColor + ',' + (b.opacity * 0.018).toFixed(3) + ')');
      cureGrad.addColorStop(1, 'rgba(' + uvColor + ',0)');
      ctx.fillStyle = cureGrad;
      ctx.beginPath();
      ctx.arc(endX, endY, 38, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow along beam
      ctx.save();
      var grad = ctx.createLinearGradient(b.sx, b.sy, endX, endY);
      grad.addColorStop(0, 'rgba(' + uvColor + ',0)');
      grad.addColorStop(0.35, 'rgba(' + uvColor + ',' + (b.opacity * 0.04).toFixed(3) + ')');
      grad.addColorStop(0.65, 'rgba(' + uvColor + ',' + (b.opacity * 0.03).toFixed(3) + ')');
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
      ctx.strokeStyle = 'rgba(' + uvColor + ',' + (b.opacity * 0.05).toFixed(3) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // --- UV source lamp at beam origin ---
      drawUvSource(ctx, b.sx, b.sy, b.angle, b.opacity);
    }
  }

  // --- Draw UV photon particles flowing along beams ---
  function drawUvPhotons(ctx) {
    var dark = isDark();
    var uvColor = dark ? '180,130,255' : '139,92,246';

    for (var i = 0; i < uvPhotons.length; i++) {
      var p = uvPhotons[i];
      var b = uvBeams[p.beamIndex];
      if (!b) continue;

      p.t += p.speed;
      if (p.t > 1) {
        p.t = 0;
        p.beamIndex = Math.floor(Math.random() * uvBeams.length);
      }

      // Position along beam
      var bx = b.sx + Math.cos(b.angle) * b.length * p.t;
      var by = b.sy + Math.sin(b.angle) * b.length * p.t;

      // Lateral jitter
      var perpX = Math.cos(b.angle + Math.PI / 2) * b.width * p.offset;
      var perpY = Math.sin(b.angle + Math.PI / 2) * b.width * p.offset;
      var px = bx + perpX;
      var py = by + perpY;

      var twinkle = 0.4 + Math.sin(time * 5 + p.phase) * 0.6;

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + uvColor + ',' + (b.opacity * twinkle * 0.18).toFixed(3) + ')';
      ctx.fill();
    }
  }

  // --- Enhanced 3D printing: build platform + object + layer lines ---
  function draw3dPrinting(ctx) {
    var dark = isDark();
    var baseR, baseG, baseB;
    if (dark) { baseR = 148; baseG = 163; baseB = 184; }
    else      { baseR = 37;  baseG = 99;  baseB = 235; }

    // --- Build platform ---
    var platformY = canvas.height * 0.92;
    var platformLeft = canvas.width * 0.30;
    var platformRight = canvas.width * 0.70;
    var platformThick = 3;

    ctx.fillStyle = dark ? 'rgba(148,163,184,0.04)' : 'rgba(37,99,235,0.03)';
    ctx.fillRect(platformLeft, platformY - platformThick,
                 platformRight - platformLeft, platformThick);
    ctx.strokeStyle = dark ? 'rgba(148,163,184,0.08)' : 'rgba(37,99,235,0.06)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(platformLeft, platformY - platformThick,
                   platformRight - platformLeft, platformThick);

    // --- Object being printed (height oscillates) ---
    var maxBuildH = canvas.height * 0.42;
    // Eased oscillation: smooth build-up and pause at max
    var rawOsc = Math.sin(time * 0.35) * 0.5 + 0.5; // 0..1
    rawOsc = Math.pow(rawOsc, 0.7); // ease-in-out feel
    var buildH = rawOsc * maxBuildH;

    var objCenterX = canvas.width * 0.5;
    var objTopY = platformY - platformThick - buildH;
    var objBottomW = 32 + Math.sin(time * 0.15) * 8;
    var objTopW = objBottomW * 0.68;

    if (buildH > 2) {
      // --- Layer lines within the printed object ---
      var layerH = 5;
      var layerCount = Math.floor(buildH / layerH);

      for (var i = 0; i < layerCount; i++) {
        var ly = platformY - platformThick - i * layerH;
        var progress = i / Math.max(layerCount - 1, 1);
        var lw = objBottomW / 2 + (objTopW / 2 - objBottomW / 2) * progress;

        var lyAlpha = 0.02 + 0.035 * (1 - Math.abs(progress - 0.5) * 1.3);
        var isTopLayer = (i === layerCount - 1);

        ctx.beginPath();
        if (isTopLayer) {
          ctx.setLineDash([]);
        } else {
          ctx.setLineDash([3 + Math.sin(i * 1.3) * 1, 3 + Math.cos(i * 2.1) * 1.5]);
        }
        ctx.moveTo(objCenterX - lw, ly);
        ctx.lineTo(objCenterX + lw, ly);
        ctx.strokeStyle = isTopLayer
          ? (dark ? 'rgba(180,130,255,' + (0.09).toFixed(3) + ')'
                  : 'rgba(139,92,246,' + (0.07).toFixed(3) + ')')
          : (dark ? 'rgba(148,163,184,' + lyAlpha.toFixed(3) + ')'
                  : 'rgba(37,99,235,' + lyAlpha.toFixed(3) + ')');
        ctx.lineWidth = isTopLayer ? 1.0 : 0.5;
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // --- Object outline (faint) ---
      ctx.beginPath();
      ctx.moveTo(objCenterX - objBottomW / 2, platformY - platformThick);
      ctx.lineTo(objCenterX - objTopW / 2, objTopY);
      ctx.lineTo(objCenterX + objTopW / 2, objTopY);
      ctx.lineTo(objCenterX + objBottomW / 2, platformY - platformThick);
      ctx.closePath();
      ctx.strokeStyle = dark ? 'rgba(148,163,184,0.025)' : 'rgba(37,99,235,0.02)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // --- Fresh layer UV glow at the top ---
      if (buildH > 8) {
        var glowGrad = ctx.createRadialGradient(objCenterX, objTopY, 0, objCenterX, objTopY, objTopW);
        glowGrad.addColorStop(0, dark ? 'rgba(180,130,255,0.03)' : 'rgba(139,92,246,0.025)');
        glowGrad.addColorStop(1, 'rgba(180,130,255,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(objCenterX, objTopY, objTopW, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --- Main draw loop ---
  function draw(timestamp) {
    if (!running) return;
    time = timestamp * 0.001;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw static hex grid
    buildHexGrid();
    ctx.drawImage(gridCanvas, 0, 0);

    // 2. Draw enhanced 3D printing (build platform + object + layer lines)
    draw3dPrinting(ctx);

    // 3. Draw UV light beams (with curing zones + source lamps)
    drawUvBeams(ctx);

    // 4. Draw UV photon particles
    drawUvPhotons(ctx);

    // 5. Update & draw floating molecules (including glassware)
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
      else if (mol.type === 'polymer') drawPolymer(ctx, mol);
      else if (mol.type === 'photocrosslink') drawPhotoCrosslink(ctx, mol);
      else if (mol.type === 'beaker') drawBeaker(ctx, mol);
      else if (mol.type === 'erlenmeyer') drawErlenmeyer(ctx, mol);
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

  // Theme change listener — redraw hex grid when switching dark/light
  var themeObserver = new MutationObserver(function () {
    gridDirty = true;
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
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
