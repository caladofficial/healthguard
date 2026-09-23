/* ============================================================================
   HealthGuard — LIVING HEALTH CANVAS (spec §23 "Running background screensaver")

   Five layers, exactly as specified:
     1. paper/noise texture ....... procedural (fixed SVG grain overlay in CSS)
     2. slow moving contour lines   (this file)
     3. extremely faint waveform    (this file)
     4. soft floating particles     (this file)
     5. slow geometric transform    (this file)

   Rules enforced: very low opacity, slow, low contrast, GPU-friendly (single
   canvas, transform/alpha only), prefers-reduced-motion draws one static frame,
   pauses when the tab is hidden, degrades particle count on low-end devices.
   ============================================================================ */
(function () {
  'use strict';
  var cv = document.getElementById('livingCanvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, DPR = 1, t = 0, raf = 0, running = false;
  var motes = [], CONTOURS = 5;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2); // cap DPR: GPU-friendly
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.max(1, Math.round(W * DPR));
    cv.height = Math.max(1, Math.round(H * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedMotes();
  }

  function seedMotes() {
    // Layer 4: soft floating particles — sparse and quiet, "not a random
    // particle background" means restrained count + slow drift.
    var n = Math.max(14, Math.min(30, Math.round(W / 70)));
    motes = [];
    for (var i = 0; i < n; i++) {
      motes.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.6 + Math.random() * 1.7,
        vy: 0.05 + Math.random() * 0.10,          // px/frame, very slow
        ph: Math.random() * Math.PI * 2,
        tone: Math.random() < 0.5 ? '95,122,99' : '85,103,111'  // sage | bluegray
      });
    }
  }

  /* Layer 2 — slow contour lines (topographic breathing) */
  function drawContours() {
    ctx.lineWidth = 1;
    for (var i = 0; i < CONTOURS; i++) {
      var baseY = (H / (CONTOURS + 1)) * (i + 1);
      var phase = t * 0.00012 + i * 1.7;
      var amp = 14 + i * 6;
      ctx.beginPath();
      for (var x = -20; x <= W + 20; x += 14) {
        var y = baseY
          + Math.sin(x * 0.0032 + phase) * amp
          + Math.sin(x * 0.0011 - phase * 0.7) * amp * 0.55;
        if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = i % 2
        ? 'rgba(138,155,168,0.055)'   // desaturated blue-gray
        : 'rgba(143,165,146,0.055)';  // muted sage
      ctx.stroke();
    }
  }

  /* Layer 3 — extremely faint medical waveform (slow drifting PQRST-ish) */
  function drawWave() {
    var midY = H * 0.68, sp = t * 0.02;
    ctx.beginPath();
    for (var x = -20; x <= W + 20; x += 4) {
      var u = (x + sp) * 0.012;
      var beat = Math.exp(-Math.pow(((u % 26) - 13) / 2.4, 2)); // pulse envelope
      var y = midY
        + Math.sin(u * 1.9) * 5
        + beat * (Math.sin(u * 10) * 16 + Math.sin(u * 23) * 6);
      if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(95,122,99,0.05)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  /* Layer 4 — soft floating particles */
  function drawMotes(dt) {
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      m.y -= m.vy * dt;                              // slow heartbeat-like rise
      m.ph += 0.0009 * dt;
      var x = m.x + Math.sin(m.ph) * 10;
      if (m.y < -8) { m.y = H + 8; m.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + m.tone + ',0.075)';
      ctx.fill();
    }
  }

  /* Layer 5 — occasional slow geometric transformation */
  function drawGeometry() {
    var cx = W * 0.82, cy = H * 0.24;
    var rot = t * 0.000035;
    var scl = 1 + Math.sin(t * 0.00008) * 0.08;
    var R = Math.min(W, H) * 0.16 * scl;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = 'rgba(46,50,56,0.035)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i;
      var x = Math.cos(a) * R, y = Math.sin(a) * R;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(143,165,146,0.035)';
    ctx.stroke();
    ctx.restore();
  }

  var last = 0;
  function frame(now) {
    if (!running) return;
    var dt = Math.min(50, now - (last || now)); last = now;
    t += dt;
    ctx.clearRect(0, 0, W, H);
    drawContours();
    drawWave();
    drawMotes(reduced ? 0 : dt);
    drawGeometry();
    if (!reduced) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return; running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  window.addEventListener('resize', function () {
    resize();
    if (reduced) { ctx.clearRect(0, 0, W, H); drawContours(); drawWave(); drawMotes(0); drawGeometry(); }
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  resize();
  if (reduced) { drawContours(); drawWave(); drawMotes(0); drawGeometry(); }  // one static frame
  else start();
})();
