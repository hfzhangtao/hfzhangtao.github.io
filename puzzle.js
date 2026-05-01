// ============================================================
// 4D PRINTING SHAPE MEMORY SIMULATOR
// Realistic heated bed + Tg-triggered shape memory effects
// ============================================================

(function () {
  var canvas = document.getElementById('puzzleCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var W, H;

  var temp = 25;
  var targetTemp = 25;
  var autoMode = false;
  var autoDir = 1;
  var autoTimer = null;

  // Tg (glass transition temperature) = 65°C
  var Tg = 65;

  function activation(t) {
    var zone = 8;
    if (t < Tg - zone) return 0;
    if (t > Tg + zone) return 1;
    return (t - (Tg - zone)) / (zone * 2);
  }

  // --- Resize ---
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var w = rect.width || 700;
    if (w < 20) w = 700;
    var h = w * 0.75;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w;
    H = h;
  }

  // --- Color helpers ---
  function bedColor(t) {
    var a = activation(t);
    var r = Math.round(40 + a * 60);
    var g = Math.round(40 - a * 8);
    var b = Math.round(42 - a * 15);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function shapeColor(baseHue, t) {
    var a = activation(t);
    var sat = 50 + a * 40;
    var lit = 50 + a * 12;
    return 'hsl(' + (baseHue + a * 8) + ',' + sat + '%,' + lit + '%)';
  }

  // --- Shape 1: Gripper (blue, 210 hue) ---
  function drawGripper(cx, cy, t) {
    var a = activation(t);
    var len = 80;
    var sw = 12;
    ctx.save();
    ctx.translate(cx, cy);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    if (a < 0.08) {
      ctx.fillRect(-len / 2 + 2, -sw / 2 + 2, len, sw);
    } else {
      var sr = 22 + (1 - a) * 38;
      ctx.beginPath();
      ctx.arc(0, 2, sr + sw / 2, -Math.PI * a * 0.7, Math.PI * a * 0.7);
      ctx.lineWidth = sw + 2;
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.stroke();
    }

    // Body
    if (a < 0.05) {
      ctx.fillStyle = shapeColor(210, t);
      ctx.fillRect(-len / 2, -sw / 2, len, sw);
    } else {
      var radius = 22 + (1 - a) * 38;
      var angle = Math.PI * a * 0.7;
      ctx.beginPath();
      ctx.arc(0, 0, radius, -angle, angle);
      ctx.lineWidth = sw;
      ctx.strokeStyle = shapeColor(210, t);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    // Claw tips
    if (a > 0.3) {
      var tipA = Math.PI * a * 0.7;
      var tipR = 22 + (1 - a) * 38;
      [-1, 1].forEach(function (side) {
        var tx = Math.cos(tipA * side) * tipR;
        var ty = Math.sin(tipA * side) * tipR;
        ctx.beginPath();
        ctx.arc(tx, ty, a * 6, 0, Math.PI * 2);
        ctx.fillStyle = shapeColor(210, t);
        ctx.fill();
      });
    }

    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Gripper', cx, cy + 42);
  }

  // --- Shape 2: Spring (green, 160 hue) ---
  function drawSpring(cx, cy, t) {
    var a = activation(t);
    ctx.save();
    ctx.translate(cx, cy);

    // Shadow grows with activation
    ctx.beginPath();
    ctx.arc(0, a * 6, 20 + a * 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.08 + a * 0.2) + ')';
    ctx.fill();

    var turns = 3 + a * 5;
    var outerR = 16 + a * 8;
    var innerR = 6 + a * 4;
    ctx.beginPath();
    var totalAngle = turns * Math.PI * 2;
    var steps = 120;
    for (var i = 0; i <= steps; i++) {
      var frac = i / steps;
      var angle = frac * totalAngle;
      var r = innerR + (outerR - innerR) * frac;
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r - a * 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = shapeColor(160, t);
    ctx.lineWidth = 2.5 + a * 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';

    // Height lines
    if (a > 0.3) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      for (var j = 0; j < 3; j++) {
        var ax = Math.cos(j * Math.PI * 2 / 3) * outerR;
        var ay = Math.sin(j * Math.PI * 2 / 3) * outerR;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax, ay - a * 18);
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Spring', cx, cy + 36);
  }

  // --- Shape 3: Origami Box (pink, 330 hue) ---
  function drawBox(cx, cy, t) {
    var a = activation(t);
    var size = 22;
    ctx.save();
    ctx.translate(cx, cy);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,' + (0.08 + a * 0.15) + ')';
    ctx.fillRect(-size + 3, -size + 3, size * 2, size * 2);

    if (a < 0.3) {
      // Flat cross
      var aw = size * 0.55;
      var ah = size * 1.2;
      ctx.fillStyle = shapeColor(330, t);
      ctx.fillRect(-aw / 2, -aw / 2, aw, aw);
      ctx.fillRect(-aw / 2, -ah, aw, ah - aw / 2);
      ctx.fillRect(-aw / 2, aw / 2, aw, ah - aw / 2);
      ctx.fillRect(-ah, -aw / 2, ah - aw / 2, aw);
      ctx.fillRect(aw / 2, -aw / 2, ah - aw / 2, aw);

      // Fold lines
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.strokeRect(-aw / 2, -aw / 2, aw, aw);
      ctx.setLineDash([]);
    } else {
      // Folded cube
      var s = size * 0.85;
      ctx.fillStyle = shapeColor(330, t);
      ctx.fillRect(-s, -s, s * 2, s * 2);
      // Top face highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(-s, -s, s * 2, s * 0.6);
      // Outline
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      // Crease
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
      ctx.moveTo(0, -s); ctx.lineTo(0, s);
      ctx.stroke();
    }

    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(a > 0.5 ? 'Box (folded)' : 'Box (flat)', cx, cy + 40);
  }

  // --- Shape 4: Expanding Mesh (yellow, 45 hue) ---
  function drawMesh(cx, cy, t) {
    var a = activation(t);
    var spacing = 7 + a * 16;
    var rows = 3;
    var cols = 4;
    var nodeR = 2.5 + a * 1.5;
    ctx.save();
    ctx.translate(cx, cy);

    var tw = (cols - 1) * spacing;
    var th = (rows - 1) * spacing;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,' + (0.06 + a * 0.12) + ')';
    ctx.fillRect(-tw / 2 + 2, -th / 2 + 2, tw, th);

    // Lines
    ctx.strokeStyle = shapeColor(45, t);
    ctx.lineWidth = 1 + a * 0.8;
    ctx.globalAlpha = 0.35 + a * 0.45;
    ctx.beginPath();
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var nx = -tw / 2 + c * spacing;
        var ny = -th / 2 + r * spacing;
        if (c < cols - 1) { ctx.moveTo(nx, ny); ctx.lineTo(nx + spacing, ny); }
        if (r < rows - 1) { ctx.moveTo(nx, ny); ctx.lineTo(nx, ny + spacing); }
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Nodes
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var nx = -tw / 2 + c * spacing;
        var ny = -th / 2 + r * spacing;
        ctx.beginPath();
        ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = shapeColor(45, t);
        ctx.fill();
      }
    }

    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Mesh', cx, cy + 36);
  }

  // --- Shape 5: Bloom (purple, 280 hue) ---
  function drawBloom(cx, cy, t) {
    var a = activation(t);
    var petals = 5;
    ctx.save();
    ctx.translate(cx, cy);

    // Shadow
    ctx.beginPath();
    ctx.arc(0, 2, a * 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.04 + a * 0.14) + ')';
    ctx.fill();

    for (var i = 0; i < petals; i++) {
      var baseAngle = (Math.PI * 2 * i) / petals - Math.PI / 2;
      var petalLen = 6 + a * 22;
      var petalW = 2.5 + a * 7;
      ctx.save();
      ctx.rotate(baseAngle);
      ctx.beginPath();
      ctx.ellipse(petalLen * 0.5, 0, petalLen * 0.5, petalW, 0, 0, Math.PI * 2);
      ctx.fillStyle = shapeColor(280, t);
      ctx.fill();
      ctx.restore();
    }

    // Center
    ctx.beginPath();
    ctx.arc(0, 0, 3.5 + a * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = a > 0.5 ? '#fbbf24' : '#60a5fa';
    ctx.fill();

    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Bloom', cx, cy + 36);
  }

  // --- Main draw ---
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Bed background gradient
    var bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, bedColor(temp));
    bgGrad.addColorStop(1, '#1c1c1c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (var x = 20; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = 20; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Heated glow from edges
    var aTemp = activation(temp);
    if (aTemp > 0.1) {
      var glow = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.7);
      glow.addColorStop(0, 'transparent');
      glow.addColorStop(1, 'rgba(255,80,20,' + (aTemp * 0.22) + ')');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
    }

    // Printer nozzle
    ctx.fillStyle = '#222';
    ctx.fillRect(W / 2 - 10, -4, 20, 12);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(W / 2 - 6, 8, 12, 5);
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 3, 13); ctx.lineTo(W / 2 + 3, 13);
    ctx.lineTo(W / 2 + 1, 19); ctx.lineTo(W / 2 - 1, 19);
    ctx.closePath();
    ctx.fill();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('HEATED BED', 12, 20);
    ctx.fillText('NOZZLE', W / 2 - 20, 6);

    // Tg line
    if (temp > Tg - 8 && temp < Tg + 8) {
      ctx.strokeStyle = 'rgba(251,191,36,0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(0, H / 3);
      ctx.lineTo(W, H / 3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(251,191,36,0.4)';
      ctx.fillText('Tg', 16, H / 3 - 4);
    }

    // Position shapes
    var x1 = W * 0.20, x2 = W * 0.52, x3 = W * 0.78;
    var y1 = H * 0.35, y2 = H * 0.70;

    drawGripper(x1, y1, temp);
    drawSpring(x2, y1, temp);
    drawBox(x3, y1, temp);
    drawMesh(x1, y2, temp);
    drawBloom(W * 0.58, H * 0.72, temp);

    // Temperature readout
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(temp) + '°C', W - 16, 20);

    ctx.font = '9px system-ui';
    if (temp < Tg - 8) {
      ctx.fillStyle = 'rgba(100,180,255,0.55)';
      ctx.fillText('Below Tg', W - 16, 34);
    } else if (temp > Tg + 8) {
      ctx.fillStyle = 'rgba(255,150,80,0.55)';
      ctx.fillText('Above Tg', W - 16, 34);
    } else {
      ctx.fillStyle = 'rgba(251,191,36,0.55)';
      ctx.fillText('Tg · Recovering', W - 16, 34);
    }
  }

  // --- Animation ---
  function animate() {
    var speed = 0.08;
    temp += (targetTemp - temp) * speed;
    if (Math.abs(targetTemp - temp) < 0.05) temp = targetTemp;
    draw();
    if (Math.abs(targetTemp - temp) > 0.01 || autoMode) {
      requestAnimationFrame(animate);
    }
  }

  function setTemp(v) {
    targetTemp = Math.max(25, Math.min(120, v));
    var slider = document.getElementById('tempSlider');
    if (slider) slider.value = Math.round((targetTemp - 25) / 95 * 100);
    updateUI();
    if (Math.abs(targetTemp - temp) > 0.05) requestAnimationFrame(animate);
  }

  function updateUI() {
    var label = document.getElementById('tempLabel');
    var status = document.getElementById('tempStatus');
    var t = Math.round(targetTemp);
    if (label) {
      if (t < Tg - 8) {
        label.innerHTML = t + '°C <span style="font-size:12px;font-weight:400;">— As-Printed</span>';
        label.style.color = '#3b82f6';
      } else if (t > Tg + 8) {
        label.innerHTML = t + '°C <span style="font-size:12px;font-weight:400;">— Recovered</span>';
        label.style.color = '#ef4444';
      } else {
        label.innerHTML = t + '°C <span style="font-size:12px;font-weight:400;">— Recovering...</span>';
        label.style.color = '#f59e0b';
      }
    }
    if (status) {
      if (t < Tg - 8) status.innerHTML = 'Below T<sub>g</sub> · shapes remain in temporary (as-printed) form';
      else if (t > Tg + 8) status.innerHTML = 'Above T<sub>g</sub> · shapes fully recovered to programmed permanent form';
      else status.innerHTML = 'T<sub>g</sub> range · shape memory effect activating — polymer chains regain mobility';
    }
  }

  // --- Auto cycle ---
  function toggleAuto() {
    autoMode = !autoMode;
    var btn = document.getElementById('autoBtn');
    if (autoMode) {
      btn.innerHTML = '<i class="fa-solid fa-pause mr-1.5"></i>Pause';
      btn.classList.add('border-primary', 'text-primary');
      autoStep();
    } else {
      btn.innerHTML = '<i class="fa-solid fa-play mr-1.5"></i>Auto Cycle';
      btn.classList.remove('border-primary', 'text-primary');
      clearTimeout(autoTimer);
    }
  }

  function autoStep() {
    if (!autoMode) return;
    targetTemp += autoDir * 0.5;
    if (targetTemp >= 120) { targetTemp = 120; autoDir = -1; }
    if (targetTemp <= 25) { targetTemp = 25; autoDir = 1; }
    var s = document.getElementById('tempSlider');
    if (s) s.value = Math.round((targetTemp - 25) / 95 * 100);
    updateUI();
    requestAnimationFrame(animate);
    autoTimer = setTimeout(autoStep, 40);
  }

  // --- Events ---
  var sliderEl = document.getElementById('tempSlider');
  if (sliderEl) {
    sliderEl.addEventListener('input', function () {
      setTemp(25 + parseInt(this.value) / 100 * 95);
    });
  }

  var autoBtn = document.getElementById('autoBtn');
  if (autoBtn) autoBtn.addEventListener('click', toggleAuto);

  var resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (autoMode) toggleAuto();
      targetTemp = 25; temp = 25;
      if (sliderEl) sliderEl.value = 0;
      updateUI();
      draw();
    });
  }

  // --- Init ---
  function init() {
    resize();
    draw();
    updateUI();
  }

  window.addEventListener('resize', function () {
    clearTimeout(canvas._rsTimer);
    canvas._rsTimer = setTimeout(function () { resize(); draw(); }, 150);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
