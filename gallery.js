// ============================================================
// GALLERY DATA — Add your photos and videos here
// Each entry: { type: "image"|"video", src: "path", thumb: "path", title: "...", desc: "..." }
// - For YouTube/Vimeo videos, use the full embed URL as src
// - Place media files in the "gallery/" folder
// ============================================================

const galleryData = [
  // === ADD YOUR PHOTOS/VIDEOS BELOW ===
  // {
  //   type: "image",
  //   src: "gallery/example.jpg",
  //   thumb: "gallery/example.jpg",
  //   title: "Example Photo",
  //   desc: "Description of the photo"
  // },
  // {
  //   type: "video",
  //   src: "https://www.youtube.com/embed/VIDEO_ID",
  //   thumb: "gallery/video-thumb.jpg",
  //   title: "Example Video",
  //   desc: "Description of the video"
  // },
];

// ============================================================
// RENDERING — Do not modify below this line
// ============================================================

const galleryGrid = document.getElementById('galleryGrid');

function renderGallery() {
  if (!galleryGrid) return;

  if (galleryData.length === 0) {
    galleryGrid.innerHTML = `
      <div class="col-span-full text-center py-16 text-gray-400 dark:text-gray-500">
        <i class="fa-solid fa-images text-5xl mb-4 block"></i>
        <p class="text-lg">No media yet.</p>
        <p class="text-sm mt-1">Add photos and videos by editing <code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">galleryData</code> in <code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">gallery.js</code>.</p>
      </div>`;
    return;
  }

  galleryGrid.innerHTML = galleryData
    .map(
      (item, index) => `
    <div class="gallery-item group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 aspect-square" data-index="${index}">
      ${item.type === 'video'
        ? `<img src="${item.thumb || ''}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center\\'><i class=\\'fa-solid fa-video text-4xl text-gray-400\\'></i></div>'">
           <div class="absolute inset-0 flex items-center justify-center">
             <span class="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center text-white text-xl"><i class="fa-solid fa-play"></i></span>
           </div>`
        : `<img src="${item.src}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">`
      }
      <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p class="text-white text-sm font-medium truncate">${item.title}</p>
      </div>
    </div>`
    )
    .join('');

  // Click handlers
  galleryGrid.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
  });
}

// ============================================================
// LIGHTBOX
// ============================================================

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const item = galleryData[index];

  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.className =
    'fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fadeIn';
  overlay.innerHTML = `
    <button id="lbClose" class="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <button id="lbPrev" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors ${galleryData.length <= 1 ? 'hidden' : ''}">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <button id="lbNext" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors ${galleryData.length <= 1 ? 'hidden' : ''}">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
    <div class="max-w-5xl max-h-[85vh] w-full flex flex-col items-center">
      ${item.type === 'video'
        ? `<div class="relative w-full aspect-video max-h-[80vh]">
             <iframe src="${item.src}" class="w-full h-full rounded-lg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
           </div>`
        : `<img src="${item.src}" alt="${item.title}" class="max-w-full max-h-[80vh] object-contain rounded-lg">`
      }
      <div class="mt-4 text-center text-white max-w-lg">
        <h3 class="text-lg font-bold">${item.title}</h3>
        ${item.desc ? `<p class="text-sm text-gray-300 mt-1">${item.desc}</p>` : ''}
        <p class="text-xs text-gray-500 mt-2">${currentIndex + 1} / ${galleryData.length}</p>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Event listeners
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  document.getElementById('lbPrev')?.addEventListener('click', () => navigate(-1));
  document.getElementById('lbNext')?.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', handleKeydown);
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox');
  if (overlay) overlay.remove();
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

renderGallery();
