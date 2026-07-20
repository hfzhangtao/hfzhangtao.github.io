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
    document.querySelectorAll('.pub-filter-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    var filter = btn.getAttribute('data-filter');
    var pubItems = document.querySelectorAll('.pub-item');

    pubItems.forEach(function(item) {
      if (filter === 'all' || item.getAttribute('data-year') === filter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    if (filter !== 'all') {
      // Show all matching items (including hidden ones), hide the toggle button
      if (morePubs) morePubs.style.display = '';
      if (pubToggle) pubToggle.style.display = 'none';
    } else {
      // "All" selected: restore normal toggle behavior
      if (morePubs) morePubs.style.display = '';
      if (pubToggle) pubToggle.style.display = '';
      var isExpanded = !morePubs.classList.contains('hidden');
      if (isExpanded) {
        morePubs.classList.add('hidden');
        var showMore = window.__getTranslation('publications.showMore') || 'Show All 13 Publications';
        if (pubToggle) pubToggle.innerHTML = '<i class="fa-solid fa-chevron-down mr-2"></i>' + showMore;
      }
    }
  });
});
