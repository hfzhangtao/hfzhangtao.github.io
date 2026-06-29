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
  {
    type: "image",
    src: "gallery/Fig5.png",
    thumb: "gallery/Fig5.png",
    title: "Figure 5",
    desc: ""
  },
  {
    type: "image",
    src: "gallery/Fig6.png",
    thumb: "gallery/Fig6.png",
    title: "Figure 6",
    desc: ""
  },
  {
    type: "video",
    src: "gallery/ACEL.mp4",
    thumb: "gallery/ACEL-thumb.jpg",
    title: "ACEL Device",
    desc: ""
  },
  {
    type: "image",
    src: "gallery/Fig7.png",
    thumb: "gallery/Fig7.png",
    title: "Figure 7",
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
  var media;
  if (item.type === 'video') {
    media = '\
    <div class="gallery-item group relative shrink-0 w-80 md:w-96 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/40 transition-all duration-300" style="aspect-ratio:16/9" data-index="' + index + '">\
      <div class="absolute inset-0 bg-gray-300 dark:bg-gray-700"' + (item.thumb ? ' style="background-image:url(' + item.thumb + ');background-size:cover;background-position:center"' : '') + '></div>\
      <div class="absolute inset-0 flex items-center justify-center">\
        <span class="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center text-white text-2xl group-hover:bg-primary group-hover:scale-110 transition-all duration-300"><i class="fa-solid fa-play ml-0.5"></i></span>\
      </div>\
      <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">\
        <p class="text-white text-sm font-medium truncate">' + item.title + '</p>\
      </div>\
    </div>';
  } else {
    media = '\
    <div class="gallery-item group relative shrink-0 w-80 md:w-96 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/40 transition-all duration-300" style="aspect-ratio:16/9" data-index="' + index + '">\
      <img src="' + item.src + '" alt="' + item.title + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">\
      <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">\
        <p class="text-white text-sm font-medium truncate">' + item.title + '</p>\
      </div>\
    </div>';
  }
  return media;
}

function renderGallery() {
  if (!galleryTrack || !galleryWrapper) return;

  if (galleryData.length === 0) {
    galleryTrack.innerHTML = '\
      <div class="w-full text-center py-16 text-gray-400 dark:text-gray-500">\
        <i class="fa-solid fa-images text-5xl mb-4 block"></i>\
        <p class="text-lg">No media yet.</p>\
      </div>';
    galleryWrapper.className = 'rounded-xl';
    return;
  }

  // Render many copies: user can scroll freely in either direction without hitting an edge
  var oneSet = galleryData.map(function (item, i) { return buildItem(item, i); }).join('');
  galleryTrack.innerHTML = oneSet.repeat(6); // 30 items, plenty for infinite scroll

  var oneSetWidth = 0;
  var speed = 0.8; // px per frame
  var paused = false;
  var lastTime = 0;
  var animId = null;
  var jumping = false; // guard to prevent recursive scroll events during jump

  function measure() {
    var items = galleryTrack.querySelectorAll('.gallery-item');
    if (items.length === 0) return;
    var n = galleryData.length;
    var startX = items[0].getBoundingClientRect().left;
    var endX = items[n].getBoundingClientRect().left;
    oneSetWidth = endX - startX;
  }

  // --- Infinite scroll: jump when approaching edges ---
  function handleScroll() {
    if (jumping || oneSetWidth <= 0) return;
    var sl = galleryWrapper.scrollLeft;
    var maxSl = galleryTrack.scrollWidth - galleryWrapper.clientWidth;
    var buffer = oneSetWidth * 0.4;

    if (sl <= buffer) {
      jumping = true;
      galleryWrapper.scrollLeft = sl + oneSetWidth * 2;
      jumping = false;
    } else if (maxSl > 0 && sl >= maxSl - buffer) {
      jumping = true;
      galleryWrapper.scrollLeft = sl - oneSetWidth * 2;
      jumping = false;
    }
  }

  var scrollFrameId = null;
  function scheduleHandleScroll() {
    if (scrollFrameId) return;
    scrollFrameId = requestAnimationFrame(function () {
      scrollFrameId = null;
      handleScroll();
    });
  }

  // --- Auto-scroll loop ---
  function autoScroll(timestamp) {
    if (!lastTime) lastTime = timestamp;
    var delta = Math.min(timestamp - lastTime, 50); // cap delta to avoid huge jumps
    lastTime = timestamp;

    if (!paused) {
      galleryWrapper.scrollLeft += speed * (delta / 16.67);
      handleScroll();
    }

    animId = requestAnimationFrame(autoScroll);
  }

  // Click events
  galleryTrack.querySelectorAll('.gallery-item').forEach(function (el) {
    el.addEventListener('click', function () {
      openLightbox(parseInt(el.dataset.index));
    });
  });

  // Pause on hover
  galleryWrapper.addEventListener('mouseenter', function () { paused = true; });
  galleryWrapper.addEventListener('mouseleave', function () { paused = false; lastTime = 0; });

  // Pause on touch
  galleryWrapper.addEventListener('touchstart', function () { paused = true; }, { passive: true });
  galleryWrapper.addEventListener('touchend', function () {
    clearTimeout(galleryTrack._resumeTimer);
    galleryTrack._resumeTimer = setTimeout(function () { paused = false; lastTime = 0; }, 1500);
  });

  // Scroll listener debounced via rAF to avoid fighting with autoScroll
  galleryWrapper.addEventListener('scroll', scheduleHandleScroll, { passive: true });

  // Pause when tab not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      paused = true;
    } else {
      paused = false;
      lastTime = 0;
    }
  });

  // --- Kick off: defer until layout is stable ---
  function startGallery() {
    measure();
    if (oneSetWidth <= 0) {
      // Layout not ready yet, retry
      requestAnimationFrame(startGallery);
      return;
    }
    galleryWrapper.scrollLeft = oneSetWidth * 2;
    animId = requestAnimationFrame(autoScroll);
  }

  // Wait 2 frames for images + layout to settle, then start
  requestAnimationFrame(function () {
    requestAnimationFrame(startGallery);
  });

  // Re-measure on resize (debounced)
  window.addEventListener('resize', function () {
    clearTimeout(galleryWrapper._resizeTimer);
    galleryWrapper._resizeTimer = setTimeout(function () {
      measure();
      handleScroll();
    }, 200);
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
