// ============================================================
// POLYMER BREAKOUT GAME
// Break reaction barriers with your monomer ball
// ============================================================

(function () {
  var canvas = document.getElementById('puzzleCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var W, H;

  // Game state
  var STATE = { IDLE: 0, PLAYING: 1, PAUSED: 2, OVER: 3, WIN: 4 };
  var state = STATE.IDLE;
  var score = 0;
  var lives = 3;
  var level = 1;
  var combo = 0;
  var maxCombo = 0;

  // Paddle
  var paddle = { w: 100, h: 12, x: 0, y: 0, speed: 8, targetX: 0 };

  // Ball
  var balls = [];
  var ballR = 7;
  var baseSpeed = 5;

  // Bricks
  var bricks = [];
  var brickRowCount = 6;
  var brickColCount = 8;
  var brickW = 0;
  var brickH = 20;
  var brickPad = 4;
  var brickTop = 60;

  // Power-ups
  var powerups = [];
  var activePower = null;
  var powerTimer = null;

  // Particles (visual effects)
  var particles = [];

  // Input
  var mouseX = 0;
  var mouseOnCanvas = false;

  // Level definitions
  var levels = [
    {
      name: 'Polyethylene (PE)',
      rows: 4,
      cols: 8,
      colors: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
      points: [10, 20, 30, 50],
      hp: [1, 1, 1, 1],
      speed: 5
    },
    {
      name: 'Polyurethane (PU)',
      rows: 5,
      cols: 9,
      colors: ['#34d399', '#10b981', '#059669', '#047857', '#065f46'],
      points: [15, 25, 40, 60, 80],
      hp: [1, 1, 1, 2, 2],
      speed: 5.5
    },
    {
      name: 'Epoxy Resin',
      rows: 6,
      cols: 10,
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
      points: [20, 35, 50, 70, 90, 120],
      hp: [1, 1, 2, 2, 2, 3],
      speed: 6
    },
    {
      name: 'Flame Retardant Composite',
      rows: 6,
      cols: 10,
      colors: ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
      points: [30, 50, 70, 100, 150, 200],
      hp: [1, 2, 2, 3, 3, 4],
      speed: 6.5
    }
  ];

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
    paddle.y = H - 40;
    paddle.x = W / 2 - paddle.w / 2;
    paddle.targetX = paddle.x;
    if (state === STATE.IDLE) {
      resetBall();
    }
  }

  // --- Bricks ---
  function buildBricks() {
    bricks = [];
    var lvl = levels[Math.min(level - 1, levels.length - 1)];
    brickRowCount = lvl.rows;
    brickColCount = lvl.cols;
    brickW = (W - brickPad * (brickColCount + 1)) / brickColCount;
    brickTop = 60 + (level - 1) * 4;

    for (var r = 0; r < brickRowCount; r++) {
      for (var c = 0; c < brickColCount; c++) {
        bricks.push({
          x: brickPad + c * (brickW + brickPad),
          y: brickTop + r * (brickH + brickPad),
          w: brickW,
          h: brickH,
          color: lvl.colors[r],
          points: lvl.points[r],
          hp: lvl.hp[r],
          maxHp: lvl.hp[r],
          alive: true
        });
      }
    }
  }

  // --- Ball ---
  function resetBall() {
    balls = [{
      x: paddle.x + paddle.w / 2,
      y: paddle.y - ballR - 1,
      dx: 0,
      dy: 0,
      r: ballR,
      attached: true
    }];
  }

  function launchBall() {
    if (state !== STATE.IDLE) return;
    state = STATE.PLAYING;
    hideOverlay();
    var lvl = levels[Math.min(level - 1, levels.length - 1)];
    var speed = lvl.speed;
    var angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    balls[0].dx = Math.cos(angle) * speed;
    balls[0].dy = Math.sin(angle) * speed;
    balls[0].attached = false;
  }

  // --- Particles ---
  function spawnParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1 + Math.random() * 4;
      particles.push({
        x: x, y: y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02 + Math.random() * 0.04,
        color: color,
        size: 2 + Math.random() * 3
      });
    }
  }

  // --- Power-ups ---
  function spawnPowerup(x, y) {
    if (Math.random() > 0.15) return; // 15% chance
    var types = ['widen', 'slow', 'multiball', 'pierce'];
    var type = types[Math.floor(Math.random() * types.length)];
    var colors = { widen: '#34d399', slow: '#a78bfa', multiball: '#fbbf24', pierce: '#f472b6' };
    var icons = { widen: '↔', slow: '❄', multiball: '✦', pierce: '➤' };
    powerups.push({
      x: x, y: y,
      type: type,
      color: colors[type],
      icon: icons[type],
      dy: 1.5,
      w: 22, h: 22
    });
  }

  function activatePower(type) {
    clearTimeout(powerTimer);
    activePower = type;

    if (type === 'widen') {
      paddle.w = 160;
    } else if (type === 'multiball') {
      var newBalls = [];
      balls.forEach(function (b) {
        if (b.attached) return;
        var speed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
        for (var i = 0; i < 3; i++) {
          var angle = Math.random() * Math.PI * 2;
          newBalls.push({
            x: b.x, y: b.y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            r: ballR,
            attached: false,
            pierce: b.pierce
          });
        }
      });
      balls = newBalls;
      if (balls.length === 0) resetBall();
      activePower = null;
      return;
    }

    powerTimer = setTimeout(function () {
      if (activePower === 'widen') paddle.w = 100;
      if (activePower === 'pierce') {
        balls.forEach(function (b) { b.pierce = false; });
      }
      activePower = null;
    }, 8000);
  }

  function applyPierce() {
    balls.forEach(function (b) { b.pierce = true; });
  }

  // --- Overlay ---
  function t(key) {
    var val = window.__getTranslation ? window.__getTranslation(key) : undefined;
    return val || key;
  }

  function showOverlay(title, sub, btnText, btnAction) {
    var overlay = document.getElementById('gameOverlay');
    var ot = document.getElementById('overlayTitle');
    var os = document.getElementById('overlaySub');
    var ob = document.getElementById('overlayBtn');
    if (overlay) overlay.style.display = 'flex';
    if (ot) ot.textContent = title;
    if (os) os.textContent = sub;
    if (ob) {
      ob.textContent = btnText;
      ob.onclick = btnAction;
    }
  }

  function hideOverlay() {
    var overlay = document.getElementById('gameOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  // --- Game logic ---
  function loseLife() {
    lives--;
    combo = 0;
    updateHUD();
    activePower = null;
    clearTimeout(powerTimer);
    paddle.w = 100;
    balls.forEach(function (b) { b.pierce = false; });

    if (lives <= 0) {
      state = STATE.OVER;
      showOverlay(t('game.gameOver'), t('game.finalScore') + ': ' + score + ' · ' + t('game.level') + ' ' + level + ' · ' + t('game.maxCombo') + ' x' + maxCombo, t('game.tryAgain'), resetGame);
    } else {
      state = STATE.IDLE;
      paddle.x = W / 2 - paddle.w / 2;
      paddle.targetX = paddle.x;
      resetBall();
      draw();
    }
  }

  function checkWin() {
    var anyAlive = bricks.some(function (b) { return b.alive; });
    if (!anyAlive) {
      state = STATE.WIN;
      if (level >= levels.length) {
        showOverlay(t('game.youWin'), t('game.allSynth') + ' ' + t('game.finalScore') + ': ' + score, t('game.playAgain'), resetGame);
      } else {
        showOverlay(levels[level - 1].name + ' ' + t('game.complete'), t('game.score') + ': ' + score + ' · ' + t('game.next') + ': ' + levels[Math.min(level, levels.length - 1)].name, t('game.nextLevel'), nextLevel);
      }
    }
  }

  function nextLevel() {
    level++;
    lives = Math.min(lives + 1, 5);
    combo = 0;
    activePower = null;
    clearTimeout(powerTimer);
    paddle.w = 100;
    balls.forEach(function (b) { b.pierce = false; });
    buildBricks();
    state = STATE.IDLE;
    paddle.x = W / 2 - paddle.w / 2;
    paddle.targetX = paddle.x;
    resetBall();
    hideOverlay();
    updateHUD();
    draw();
  }

  function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    combo = 0;
    maxCombo = 0;
    activePower = null;
    clearTimeout(powerTimer);
    paddle.w = 100;
    balls.forEach(function (b) { b.pierce = false; });
    buildBricks();
    state = STATE.IDLE;
    paddle.x = W / 2 - paddle.w / 2;
    paddle.targetX = paddle.x;
    resetBall();
    hideOverlay();
    updateHUD();
    draw();
  }

  function updateHUD() {
    var scoreEl = document.getElementById('gameScore');
    var comboEl = document.getElementById('gameCombo');
    var levelEl = document.getElementById('gameLevel');
    var livesEl = document.getElementById('gameLives');
    if (scoreEl) scoreEl.textContent = score;
    if (comboEl) { comboEl.textContent = 'x' + Math.max(1, combo); comboEl.style.color = combo > 5 ? '#f59e0b' : ''; }
    if (levelEl) levelEl.textContent = level;
    if (livesEl) {
      var hearts = '';
      for (var i = 0; i < lives; i++) hearts += '❤️';
      for (var i = lives; i < 3; i++) hearts += '🖤';
      livesEl.textContent = hearts;
    }
  }

  // --- Update ---
  function update() {
    if (state !== STATE.PLAYING) return;

    var lvl = levels[Math.min(level - 1, levels.length - 1)];

    // Move paddle toward target
    var dx = paddle.targetX - paddle.x;
    paddle.x += dx * 0.3;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

    // Update balls
    var newBalls = [];
    balls.forEach(function (ball) {
      if (ball.attached) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ballR - 1;
        newBalls.push(ball);
        return;
      }

      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall bounce
      if (ball.x - ball.r <= 0) { ball.x = ball.r; ball.dx = -ball.dx; }
      if (ball.x + ball.r >= W) { ball.x = W - ball.r; ball.dx = -ball.dx; }
      if (ball.y - ball.r <= 0) { ball.y = ball.r; ball.dy = -ball.dy; }

      // Paddle bounce
      if (ball.dy > 0 &&
          ball.y + ball.r >= paddle.y &&
          ball.y + ball.r <= paddle.y + paddle.h + 8 &&
          ball.x > paddle.x - ball.r &&
          ball.x < paddle.x + paddle.w + ball.r) {
        var hitPos = (ball.x - paddle.x) / paddle.w; // 0..1
        var angle = (hitPos - 0.5) * Math.PI * 0.7; // spread
        var speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = Math.sin(angle) * speed;
        ball.dy = -Math.cos(angle) * speed;
        ball.y = paddle.y - ball.r;
        combo = 0;
      }

      // Fall off bottom
      if (ball.y - ball.r > H + 20) {
        return; // don't keep this ball
      }

      // Brick collision
      var hitBrick = false;
      for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        if (!b.alive) continue;

        var closestX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
        var closestY = Math.max(b.y, Math.min(ball.y, b.y + b.h));
        var distX = ball.x - closestX;
        var distY = ball.y - closestY;

        if (distX * distX + distY * distY < ball.r * ball.r) {
          b.hp--;
          hitBrick = true;
          combo++;

          if (b.hp <= 0) {
            b.alive = false;
            score += b.points * (1 + Math.floor(combo / 5));
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.color, 8);
            spawnPowerup(b.x + b.w / 2, b.y + b.h / 2);
          } else {
            spawnParticles(ball.x, ball.y, '#fff', 3);
          }

          // Bounce
          if (!ball.pierce) {
            if (Math.abs(distX) > Math.abs(distY)) {
              ball.dx = -ball.dx;
            } else {
              ball.dy = -ball.dy;
            }
          }

          if (combo > maxCombo) maxCombo = combo;
          updateHUD();
          break;
        }
      }

      if (!hitBrick) {
        // Gradual combo decay handled by paddle miss, not wall bounces
      }

      newBalls.push(ball);
    });

    balls = newBalls;
    if (balls.length === 0) {
      loseLife();
      return;
    }

    // Handle combo reset on paddle miss already done above
    // Update power-ups
    for (var i = powerups.length - 1; i >= 0; i--) {
      var pu = powerups[i];
      pu.y += pu.dy;

      // Collision with paddle
      if (pu.y + pu.h / 2 >= paddle.y &&
          pu.y - pu.h / 2 <= paddle.y + paddle.h &&
          pu.x + pu.w / 2 > paddle.x &&
          pu.x - pu.w / 2 < paddle.x + paddle.w) {
        if (pu.type === 'pierce') applyPierce();
        activatePower(pu.type);
        spawnParticles(pu.x, pu.y, pu.color, 12);
        powerups.splice(i, 1);
        continue;
      }

      // Off screen
      if (pu.y > H + 30) {
        powerups.splice(i, 1);
      }
    }

    // Update particles
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }

    checkWin();
  }

  // --- Draw ---
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background
    var bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (var gx = 30; gx < W; gx += 30) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (var gy = 30; gy < H; gy += 30) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    // Bricks
    bricks.forEach(function (b) {
      if (!b.alive) return;
      var alpha = b.hp / b.maxHp;
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.4 + alpha * 0.6;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Highlight top edge
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(b.x, b.y, b.w, 2);

      // HP indicator for multi-hit bricks
      if (b.maxHp > 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(b.hp, b.x + b.w / 2, b.y + b.h / 2 + 3);
      }

      ctx.globalAlpha = 1;
    });

    // Power-ups
    powerups.forEach(function (pu) {
      ctx.fillStyle = pu.color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(pu.x - pu.w / 2, pu.y - pu.h / 2, pu.w, pu.h);
      ctx.fillStyle = '#fff';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(pu.icon, pu.x, pu.y + 5);
      ctx.globalAlpha = 1;
    });

    // Particles
    particles.forEach(function (p) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Paddle
    var pGrad = ctx.createLinearGradient(0, paddle.y, 0, paddle.y + paddle.h);
    pGrad.addColorStop(0, '#60a5fa');
    pGrad.addColorStop(1, '#2563eb');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    var pr = paddle.h / 2;
    ctx.moveTo(paddle.x + pr, paddle.y);
    ctx.lineTo(paddle.x + paddle.w - pr, paddle.y);
    ctx.arcTo(paddle.x + paddle.w, paddle.y, paddle.x + paddle.w, paddle.y + pr, pr);
    ctx.arcTo(paddle.x + paddle.w, paddle.y + paddle.h, paddle.x + paddle.w - pr, paddle.y + paddle.h, pr);
    ctx.lineTo(paddle.x + pr, paddle.y + paddle.h);
    ctx.arcTo(paddle.x, paddle.y + paddle.h, paddle.x, paddle.y + pr, pr);
    ctx.arcTo(paddle.x, paddle.y, paddle.x + pr, paddle.y, pr);
    ctx.closePath();
    ctx.fill();

    // Active power indicator on paddle
    if (activePower === 'widen' || activePower === 'pierce') {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(activePower === 'widen' ? 'crosslinked' : 'piercing', paddle.x + paddle.w / 2, paddle.y - 4);
    }

    // Ball(s)
    balls.forEach(function (ball) {
      // Glow
      var glow = ctx.createRadialGradient(ball.x, ball.y, ball.r * 0.5, ball.x, ball.y, ball.r * 3);
      glow.addColorStop(0, 'rgba(251,191,36,0.6)');
      glow.addColorStop(0.5, 'rgba(251,191,36,0.2)');
      glow.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r * 3, 0, Math.PI * 2);
      ctx.fill();

      // Ball body
      var ballGrad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ball.r);
      ballGrad.addColorStop(0, '#fef3c7');
      ballGrad.addColorStop(0.4, '#fbbf24');
      ballGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();

      if (ball.pierce) {
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Level/status text at top
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    var lvlName = levels[Math.min(level - 1, levels.length - 1)].name;
    ctx.fillText(lvlName + ' · ' + t('game.score') + ': ' + score, W / 2, 22);

    // Idle hint
    if (state === STATE.IDLE) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px system-ui';
      ctx.fillText(t('game.launchHint'), W / 2, H / 2 + 30);
    }

    // Active power indicator
    if (activePower && activePower !== 'multiball') {
      var names = { widen: 'Crosslinked Paddle', slow: 'UV Cured (Slow)', pierce: 'Chain Extender' };
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(names[activePower] || activePower, W - 12, H - 10);
    }

    // Slow indicator
    if (activePower === 'slow') {
      var lvl2 = levels[Math.min(level - 1, levels.length - 1)];
      balls.forEach(function (b) {
        var speed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
        if (speed > lvl2.speed * 0.6 && !b.attached) {
          var factor = 0.98;
          b.dx *= factor;
          b.dy *= factor;
        }
      });
    }
  }

  // --- Game loop ---
  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // --- Input ---
  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (W / rect.width);
    paddle.targetX = mouseX - paddle.w / 2;
    mouseOnCanvas = true;
  });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) * (W / rect.width);
    paddle.targetX = mouseX - paddle.w / 2;
  }, { passive: false });

  canvas.addEventListener('click', function () {
    if (state === STATE.IDLE) launchBall();
  });

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
      e.preventDefault();
      if (state === STATE.IDLE) launchBall();
    }
    if (e.code === 'KeyR' && state === STATE.OVER) resetGame();
  });

  // --- Init ---
  function init() {
    resize();
    buildBricks();
    resetBall();
    updateHUD();
    hideOverlay();

    var lvlName = levels[0].name;
    showOverlay(t('game.idleOverlayTitle'), lvlName + ' ' + t('game.idleOverlaySub'), t('game.startGame'), function () {
      launchBall();
    });

    draw();
    gameLoop();
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
