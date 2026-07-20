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

function isExternalVideo(src) {
  return /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(src);
}

function renderGallery() {
  var grid = document.getElementById('galleryGrid');
  if (!grid) return;

  if (galleryData.length === 0) {
    grid.innerHTML = '\
      <div class="col-span-full text-center py-16 text-gray-400 dark:text-gray-500">\
        <i class="fa-solid fa-images text-5xl mb-4 block"></i>\
        <p class="text-lg">No media yet.</p>\
      </div>';
    return;
  }

  grid.innerHTML = galleryData.map(function(item, i) {
    var playIcon = '';
    var mediaContent = '';
    if (item.type === 'video') {
      playIcon = '<div class="play-icon"><span><i class="fa-solid fa-play ml-0.5"></i></span></div>';
      mediaContent = item.thumb
        ? '<img src="' + item.thumb + '" alt="' + item.title + '" loading="lazy">'
        : '<div class="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500"><i class="fa-solid fa-video text-3xl"></i></div>';
    } else {
      mediaContent = '<img src="' + item.src + '" alt="' + item.title + '" loading="lazy">';
    }

    return '\
      <div class="gallery-grid-item fade-in" data-index="' + i + '">\
        ' + mediaContent + '\
        ' + playIcon + '\
        <div class="gallery-overlay">\
          <p class="text-white text-sm font-medium truncate">' + item.title + '</p>\
        </div>\
      </div>';
  }).join('');

  // Click events
  grid.querySelectorAll('.gallery-grid-item').forEach(function(el) {
    el.addEventListener('click', function() {
      openLightbox(parseInt(el.dataset.index));
    });
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
