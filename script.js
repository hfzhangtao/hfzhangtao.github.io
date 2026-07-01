// Language toggle
let currentLang = localStorage.getItem('lang') || 'en';

function resolveTranslation(key, lang) {
  var dict = (typeof translations !== 'undefined') ? translations[lang] : null;
  if (!dict) return undefined;
  return key.split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, dict);
}

function applyLanguage(lang) {
  try {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = resolveTranslation(el.getAttribute('data-i18n'), lang);
      if (val !== undefined) el.textContent = val;
    });
    // Update toggle button text
    document.querySelectorAll('#langToggle, #mobileLangToggle').forEach(function (el) {
      el.textContent = lang === 'en' ? 'CN' : 'EN';
    });
    // Update HTML lang attribute
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    // Update page title
    if (typeof translations !== 'undefined' && translations[lang]) {
      document.title = translations[lang].pageTitle;
    }
    // Update the publication toggle button (dynamically generated text)
    var pubToggle = document.getElementById('pubToggle');
    if (pubToggle && typeof translations !== 'undefined' && translations[lang]) {
      var morePubs = document.getElementById('morePubs');
      var isExpanded = morePubs && !morePubs.classList.contains('hidden');
      if (isExpanded) {
        pubToggle.innerHTML = '<i class="fa-solid fa-chevron-up mr-2"></i>' + translations[lang]['publications.showLess'];
      } else {
        pubToggle.innerHTML = '<i class="fa-solid fa-chevron-down mr-2"></i>' + translations[lang]['publications.showMore'];
      }
    }
  } catch (e) {
    console.error('applyLanguage error:', e);
  }
  localStorage.setItem('lang', lang);
  currentLang = lang;
}

function toggleLanguage() {
  applyLanguage(currentLang === 'en' ? 'zh' : 'en');
}

document.getElementById('langToggle')?.addEventListener('click', toggleLanguage);
document.getElementById('mobileLangToggle')?.addEventListener('click', toggleLanguage);

// Apply saved language on page load (defer until translations are definitely ready)
if (typeof translations !== 'undefined') {
  applyLanguage(currentLang);
} else {
  window.addEventListener('DOMContentLoaded', function () {
    applyLanguage(currentLang);
  });
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
  var lang = localStorage.getItem('lang') || 'en';
  pubToggle.innerHTML = isExpanded
    ? '<i class="fa-solid fa-chevron-up mr-2"></i>' + translations[lang]['publications.showLess']
    : '<i class="fa-solid fa-chevron-down mr-2"></i>' + translations[lang]['publications.showMore'];
});
