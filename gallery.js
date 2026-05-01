// ============================================================
// GALLERY DATA
// ============================================================

const galleryData = [
  {
    type: "image",
    src: "gallery/Fig1.jpg",
    thumb: "gallery/Fig1.jpg",
    title: "Figure 1",
    desc: ""
  },
  {
    type: "image",
    src: "gallery/Fig2.jpg",
    thumb: "gallery/Fig2.jpg",
    title: "Figure 2",
    desc: ""
  },
  {
    type: "video",
    src: "gallery/Film1.mp4",
    thumb: "gallery/Film1-thumb.jpg",
    title: "Film 1",
    desc: ""
  },
  {
    type: "image",
    src: "gallery/Fig3.jpg",
    thumb: "gallery/Fig3.jpg",
    title: "Figure 3",
    desc: ""
  },
  {
    type: "image",
    src: "gallery/Fig4.jpg",
    thumb: "gallery/Fig4.jpg",
    title: "Figure 4",
    desc: ""
  },
];

// ============================================================
// RENDERING
// ============================================================

var galleryWrapper = document.getElementById('galleryWrapper');
var galleryTrack = document.getElementById('galleryTrack');

function isExternalVideo(src) {
  return /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(src);
}

function buildItem(item, index) {
  if (item.type === 'video') {
    return '\
    <div class="gallery-item group relative shrink-0 w-80 md:w-96 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300" style="aspect-ratio:16/9" data-index="' + index + '">\
      <div class="absolute inset-0"' + (item.thumb ? ' style="background-image:url(' + item.thumb + ');background-size:cover;background-position:center"' : '') + '></div>\
      <div class="absolute inset-0 flex items-center justify-center">\
        <span class="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center text-white text-2xl group-hover:bg-primary group-hover:scale-110 transition-all duration-300"><i class="fa-solid fa-play ml-0.5"></i></span>\
      </div>\
      <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">\
        <p class="text-white text-sm font-medium truncate">' + item.title + '</p>\
      </div>\
    </div>';
  } else {
    return '\
    <div class="gallery-item group relative shrink-0 w-80 md:w-96 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300" style="aspect-ratio:16/9" data-index="' + index + '">\
      <img src="' + item.src + '" alt="' + item.title + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">\
      <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">\
        <p class="text-white text-sm font-medium truncate">' + item.title + '</p>\
      </div>\
    </div>';
  }
}

function renderGallery() {
  if (!galleryTrack) return;

  if (galleryData.length === 0) {
    galleryTrack.innerHTML = '\
      <div class="w-full text-center py-16 text-gray-400 dark:text-gray-500">\
        <i class="fa-solid fa-images text-5xl mb-4 block"></i>\
        <p class="text-lg">No media yet.</p>\
      </div>';
    return;
  }

  var itemsHTML = galleryData.map(function (item, i) {
    return buildItem(item, i);
  }).join('');

  // Duplicate x2 for seamless loop
  galleryTrack.innerHTML = itemsHTML + itemsHTML;

  // Click → lightbox
  galleryTrack.querySelectorAll('.gallery-item').forEach(function (el) {
    el.addEventListener('click', function () {
      openLightbox(parseInt(el.dataset.index));
    });
  });

  // Bind hover/touch pause
  bindPause();
  // Start auto-scroll
  startAutoScroll();
}

// ============================================================
// AUTO-SCROLL — scrollLeft based, works with native touch scroll
// ============================================================

var scrollRaf = null;
var autoScrollPaused = false;
var halfWidth = 0;

function scrollLoop() {
  if (!autoScrollPaused && galleryTrack) {
    galleryTrack.parentElement.scrollLeft += 0.6;
    // Seamless loop: when past half, jump back
    var el = galleryTrack.parentElement;
    halfWidth = galleryTrack.scrollWidth / 2;
    if (el.scrollLeft >= halfWidth) {
      el.scrollLeft -= halfWidth;
    }
  }
  scrollRaf = requestAnimationFrame(scrollLoop);
}

function startAutoScroll() {
  if (scrollRaf) return;
  // Start in the middle so user can scroll both directions
  var el = galleryTrack.parentElement;
  halfWidth = galleryTrack.scrollWidth / 2;
  if (el.scrollLeft < 1) {
    el.scrollLeft = halfWidth * 0.5;
  }
  scrollRaf = requestAnimationFrame(scrollLoop);
}

// ============================================================
// PAUSE — mouse hover / touch
// ============================================================

function bindPause() {
  var el = galleryWrapper || galleryTrack.parentElement;

  el.addEventListener('mouseenter', function () {
    autoScrollPaused = true;
  });
  el.addEventListener('mouseleave', function () {
    autoScrollPaused = false;
  });

  el.addEventListener('touchstart', function () {
    autoScrollPaused = true;
  }, { passive: true });

  el.addEventListener('touchend', function () {
    setTimeout(function () {
      autoScrollPaused = false;
      // Fix scroll position: if user scrolled past half, wrap
      var e = galleryTrack.parentElement;
      halfWidth = galleryTrack.scrollWidth / 2;
      if (e.scrollLeft >= halfWidth) {
        e.scrollLeft -= halfWidth;
      } else if (e.scrollLeft < 0) {
        e.scrollLeft += halfWidth;
      }
    }, 1500);
  });
}

// ============================================================
// LIGHTBOX
// ============================================================

var currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  var item = galleryData[index];

  var mediaHTML;
  if (item.type === 'video') {
    if (isExternalVideo(item.src)) {
      mediaHTML = '<div class="relative w-full" style="aspect-ratio:16/9;max-height:80vh"><iframe src="' + item.src + '" class="w-full h-full rounded-lg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
    } else {
      mediaHTML = '<video src="' + item.src + '" controls class="max-w-full rounded-lg" style="max-height:80vh" autoplay></video>';
    }
  } else {
    mediaHTML = '<img src="' + item.src + '" alt="' + item.title + '" class="max-w-full object-contain rounded-lg" style="max-height:80vh">';
  }

  var hasMultiple = galleryData.length > 1 ? '' : 'hidden';

  var overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.className = 'fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fadeIn';
  overlay.innerHTML = '\
    <button id="lbClose" class="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors">\
      <i class="fa-solid fa-xmark"></i>\
    </button>\
    <button id="lbPrev" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors ' + hasMultiple + '">\
      <i class="fa-solid fa-chevron-left"></i>\
    </button>\
    <button id="lbNext" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors ' + hasMultiple + '">\
      <i class="fa-solid fa-chevron-right"></i>\
    </button>\
    <div class="max-w-5xl w-full flex flex-col items-center" style="max-height:85vh">\
      ' + mediaHTML + '\
      <div class="mt-4 text-center text-white max-w-lg">\
        <h3 class="text-lg font-bold">' + item.title + '</h3>\
        ' + (item.desc ? '<p class="text-sm text-gray-300 mt-1">' + item.desc + '</p>' : '') + '\
        <p class="text-xs text-gray-500 mt-2">' + (currentIndex + 1) + ' / ' + galleryData.length + '</p>\
      </div>\
    </div>';

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  if (lbPrev) lbPrev.addEventListener('click', function () { navigate(-1); });
  if (lbNext) lbNext.addEventListener('click', function () { navigate(1); });

  document.addEventListener('keydown', handleKeydown);
}

function closeLightbox() {
  var overlay = document.getElementById('lightbox');
  if (overlay) {
    var v = overlay.querySelector('video');
    if (v) v.pause();
    overlay.remove();
  }
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeydown);
}

function navigate(dir) {
  currentIndex = (currentIndex + dir + galleryData.length) % galleryData.length;
  closeLightbox();
  openLightbox(currentIndex);
}

function handleKeydown(e) {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
}

// ============================================================
// INIT
// ============================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderGallery);
} else {
  renderGallery();
}
