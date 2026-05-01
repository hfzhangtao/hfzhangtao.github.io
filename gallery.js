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

var galleryTrack = document.getElementById('galleryTrack');
var galleryWrapper = document.getElementById('galleryWrapper');

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
    galleryTrack.classList.remove('gallery-marquee');
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

  // Hover pause
  if (galleryWrapper) {
    galleryWrapper.addEventListener('mouseenter', function () {
      galleryTrack.classList.add('paused');
    });
    galleryWrapper.addEventListener('mouseleave', function () {
      galleryTrack.classList.remove('paused');
    });
  }

  // Start JS-based animation
  startMarquee();
  // Touch swipe
  bindTouch();
}

// ============================================================
// JS MARQUEE — smooth infinite left-scroll, no CSS anim
// ============================================================

var offset = 0;
var marqueeRaf = null;
var speed = 0.8; // px per frame

function marqueeLoop() {
  if (!galleryTrack.classList.contains('paused')) {
    offset -= speed;
    // Seamless wrap
    var halfW = galleryTrack.scrollWidth / 2;
    if (offset <= -halfW) {
      offset += halfW;
    }
    if (offset > 0) {
      offset -= halfW;
    }
    galleryTrack.style.transform = 'translateX(' + offset + 'px)';
  }
  marqueeRaf = requestAnimationFrame(marqueeLoop);
}

function startMarquee() {
  if (marqueeRaf) return;
  // Sync offset from current CSS transform
  var style = window.getComputedStyle(galleryTrack);
  var m = style.transform;
  if (m && m !== 'none') {
    // Parse matrix
    var nums = m.match(/matrix.*\((.+)\)/);
    if (nums) {
      var parts = nums[1].split(',');
      offset = parseFloat(parts[4]) || 0;
    }
  }
  marqueeRaf = requestAnimationFrame(marqueeLoop);
}

// ============================================================
// TOUCH SWIPE — mobile finger-drag support
// ============================================================

var dragging = false;
var startX = 0;
var startOffset = 0;
var lastX = 0;
var lastTime = 0;
var velocity = 0;

function bindTouch() {
  var el = galleryWrapper || galleryTrack;

  el.addEventListener('touchstart', function (e) {
    dragging = true;
    startX = e.touches[0].clientX;
    startOffset = offset;
    lastX = startX;
    lastTime = Date.now();
    velocity = 0;
    galleryTrack.classList.add('paused');
  }, { passive: false });

  el.addEventListener('touchmove', function (e) {
    if (!dragging) return;
    e.preventDefault(); // block page scroll
    var dx = e.touches[0].clientX - startX;
    offset = startOffset + dx;

    // Clamp loop
    var halfW = galleryTrack.scrollWidth / 2;
    while (offset < -halfW) offset += halfW;
    while (offset > 0) offset -= halfW;

    galleryTrack.style.transform = 'translateX(' + offset + 'px');

    var now = Date.now();
    var dt = now - lastTime;
    if (dt > 0) {
      velocity = (e.touches[0].clientX - lastX) / dt;
    }
    lastX = e.touches[0].clientX;
    lastTime = now;
  }, { passive: false });

  el.addEventListener('touchend', function () {
    dragging = false;
    // Inertia
    if (Math.abs(velocity) > 0.3) {
      var decel = 0.95;
      function inertia() {
        if (dragging) return;
        velocity *= decel;
        if (Math.abs(velocity) < 0.05) {
          autoResume();
          return;
        }
        offset += velocity * 16;
        var halfW = galleryTrack.scrollWidth / 2;
        if (offset <= -halfW) offset += halfW;
        if (offset > 0) offset -= halfW;
        galleryTrack.style.transform = 'translateX(' + offset + 'px)';
        requestAnimationFrame(inertia);
      }
      requestAnimationFrame(inertia);
    } else {
      autoResume();
    }
  });
}

function autoResume() {
  setTimeout(function () {
    if (!dragging) {
      galleryTrack.classList.remove('paused');
    }
  }, 1500);
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
