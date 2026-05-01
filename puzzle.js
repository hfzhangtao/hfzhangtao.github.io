// ============================================================
// 4D PRINTING SHAPE MEMORY PUZZLE
// ============================================================

(function () {
  var bed = document.getElementById('puzzleBed');
  if (!bed) return;

  // Shape element references
  var star = document.getElementById('shapeStar');
  var coil = document.getElementById('shapeCoil');
  var bloom = document.getElementById('shapeBloom');
  var hinge = document.getElementById('shapeHinge');
  var lattice = document.getElementById('shapeLattice');

  var stimulus = 0;
  var targetStimulus = 0;
  var autoMode = false;
  var autoDir = 1;
  var autoTimer = null;

  function heatRgb(t) {
    return 'rgb(' + Math.round(59+t*185) + ',' + Math.round(130+t*50) + ',' + Math.round(246-t*210) + ')';
  }

  function applyStimulus(t) {
    var color = heatRgb(t);

    // Star: scale up + glow
    if (star) {
      var s = 1 + t * 1.5;
      var glow1 = Math.round(t * 8) + 'px';
      var glow2 = Math.round(t * 18) + 'px';
      star.style.transform = 'scale(' + s + ')';
      star.style.boxShadow = '0 0 0 ' + glow1 + ' ' + heatRgb(t * 0.4) + ', 0 0 0 ' + glow2 + ' ' + heatRgb(t * 0.15);
      star.style.background = color;
    }

    // Coil: rotate + curl
    if (coil) {
      coil.style.transform = 'rotate(' + (t * 720) + 'deg) scaleX(' + (1 - t * 0.5) + ')';
      coil.style.borderRadius = (3 + t * 20) + 'px';
      coil.style.background = color;
    }

    // Bloom: expand + 4 petals
    if (bloom) {
      var bs = 1 + t * 2.5;
      bloom.style.transform = 'scale(' + bs + ')';
      var px = Math.round(t * 12) + 'px';
      var py = Math.round(t * 8) + 'px';
      var ps = Math.round(t * 3) + 'px';
      var pc = Math.round(t * 14) + 'px';
      bloom.style.boxShadow =
        (-t*12) + 'px ' + (-t*8) + 'px 0 ' + (t*3) + 'px ' + heatRgb(t*0.7) + ', ' +
        (t*12) + 'px ' + (-t*8) + 'px 0 ' + (t*3) + 'px ' + heatRgb(t*0.7) + ', ' +
        (-t*14) + 'px ' + (t*8) + 'px 0 ' + (t*3) + 'px ' + heatRgb(t*0.7) + ', ' +
        (t*14) + 'px ' + (t*8) + 'px 0 ' + (t*3) + 'px ' + heatRgb(t*0.7);
      bloom.style.background = color;
    }

    // Hinge: fold
    if (hinge) {
      hinge.style.transform = 'rotate(' + (-t * 75) + 'deg)';
      hinge.style.background = color;
    }

    // Lattice: expand gaps
    if (lattice) {
      var gap = (4 + t * 14) + 'px';
      lattice.style.gap = gap;
      var rows = lattice.children;
      for (var i = 0; i < rows.length; i++) {
        rows[i].style.gap = gap;
      }
    }

    // UV overlay
    if (typeof stimulusType !== 'undefined' && stimulusType === 'uv') {
      bed.style.boxShadow = '0 0 0 999px rgba(147,51,234,' + (t * 0.15) + ') inset';
    } else {
      bed.style.boxShadow = '';
    }
  }

  function animate() {
    var speed = 0.06;
    stimulus += (targetStimulus - stimulus) * speed;
    if (Math.abs(targetStimulus - stimulus) < 0.002) stimulus = targetStimulus;
    applyStimulus(stimulus);
    if (stimulus !== targetStimulus || autoMode) {
      requestAnimationFrame(animate);
    }
  }

  function setStimulus(v) {
    targetStimulus = Math.max(0, Math.min(1, v));
    var slider = document.getElementById('tempSlider');
    if (slider) slider.value = Math.round(targetStimulus * 100);
    updateLabel();
    if (Math.abs(targetStimulus - stimulus) > 0.002) {
      requestAnimationFrame(animate);
    }
  }

  function updateLabel() {
    var label = document.getElementById('tempLabel');
    if (label) {
      var temp = Math.round(25 + targetStimulus * 95);
      label.textContent = temp + '°C';
      label.style.color = heatRgb(targetStimulus);
    }
  }

  function toggleAuto() {
    autoMode = !autoMode;
    var btn = document.getElementById('autoBtn');
    if (autoMode) {
      btn.innerHTML = '<i class="fa-solid fa-pause" style="margin-right:6px;"></i>Pause';
      btn.style.borderColor = '#2563eb';
      btn.style.color = '#2563eb';
      autoStep();
    } else {
      btn.innerHTML = '<i class="fa-solid fa-play" style="margin-right:6px;"></i>Auto Cycle';
      btn.style.borderColor = '#d1d5db';
      btn.style.color = '#374151';
      clearTimeout(autoTimer);
    }
  }

  function autoStep() {
    if (!autoMode) return;
    targetStimulus += autoDir * 0.02;
    if (targetStimulus >= 1) { targetStimulus = 1; autoDir = -1; }
    if (targetStimulus <= 0) { targetStimulus = 0; autoDir = 1; }
    var slider = document.getElementById('tempSlider');
    if (slider) slider.value = Math.round(targetStimulus * 100);
    updateLabel();
    requestAnimationFrame(animate);
    autoTimer = setTimeout(autoStep, 50);
  }

  // --- Stimulus type ---
  var stimulusType = 'heat';

  function setStimulusType(type) {
    stimulusType = type;
    var heatBtn = document.getElementById('btnHeat');
    var uvBtn = document.getElementById('btnUV');
    var waterBtn = document.getElementById('btnWater');
    var buttons = [
      { el: heatBtn, type: 'heat' },
      { el: uvBtn, type: 'uv' },
      { el: waterBtn, type: 'water' }
    ];
    buttons.forEach(function (b) {
      if (!b.el) return;
      if (b.type === type) {
        b.el.style.background = '#2563eb';
        b.el.style.color = '#fff';
        b.el.style.borderColor = '#2563eb';
      } else {
        b.el.style.background = '#fff';
        b.el.style.color = '#374151';
        b.el.style.borderColor = '#d1d5db';
      }
    });
    applyStimulus(stimulus);
  }

  var btnHeat = document.getElementById('btnHeat');
  var btnUV = document.getElementById('btnUV');
  var btnWater = document.getElementById('btnWater');
  if (btnHeat) btnHeat.addEventListener('click', function () { setStimulusType('heat'); });
  if (btnUV) btnUV.addEventListener('click', function () { setStimulusType('uv'); });
  if (btnWater) btnWater.addEventListener('click', function () { setStimulusType('water'); });

  // --- Slider ---
  var sliderEl = document.getElementById('tempSlider');
  if (sliderEl) {
    sliderEl.addEventListener('input', function () {
      setStimulus(parseInt(this.value) / 100);
    });
  }

  // --- Auto / Reset ---
  var autoBtn = document.getElementById('autoBtn');
  if (autoBtn) autoBtn.addEventListener('click', toggleAuto);

  var resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (autoMode) toggleAuto();
      setStimulus(0);
      if (sliderEl) sliderEl.value = 0;
    });
  }

  // Init
  applyStimulus(0);
  updateLabel();
})();
