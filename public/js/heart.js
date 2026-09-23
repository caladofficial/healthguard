/* ============================================================================
   HealthGuard — 3D PARTICLE HEART (v3)
   EVOLVEX IT SOLUTIONS PVT. LTD.

   A 3D-projected particle heart (~440 points) that:
     · slowly rotates in true perspective (rotY/rotX, f/(f+z) projection)
     · FOLLOWS THE CURSOR (lerped drift toward the pointer; ambient drift on touch)
     · beats with the same 1.25s lub-dub envelope as the WebGL screensaver
     · emits a mini shockwave ring at each beat peak
   Rendered on its own fullscreen canvas ABOVE the WebGL field and BELOW content
   (z-index 0), additive-blended particles, DPR capped at 1.5, paused when the
   tab is hidden, one static frame under prefers-reduced-motion.
   ============================================================================ */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var cv = document.createElement('canvas');
  cv.className = 'heart-canvas';
  cv.setAttribute('aria-hidden', 'true');
  (document.body || document.documentElement).appendChild(cv);
  var c = cv.getContext('2d');
  if (!c) return;

  var W = 0, H = 0, DPR = 1, raf = 0, running = false;
  var pts = [], rings = [], shocks = [];
  var hx = 0, hy = 0, tx = 0, ty = 0;          // heart position + target
  var rotY = 0, rotX = 0;

  /* ---- 3D heart point cloud: 2D heart curve extruded + shell scatter ---- */
  function heartXY(t) { // classic cardioid
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [x / 17, -y / 17]; // normalize + flip y (canvas y-down)
  }
  function seed() {
    pts = [];
    var N = 360, K = 8; // shell rings across z-slices + interior scatter
    for (var i = 0; i < N; i++) {
      var t = Math.random() * Math.PI * 2;
      var xy = heartXY(t);
      var z = (Math.random() * 2 - 1);
      var shrink = Math.sqrt(Math.max(0, 1 - z * z * 0.82));
      var u = Math.pow(Math.random(), 0.22); // biased to shell
      var x = xy[0] * shrink * u * (1 + (Math.random() - 0.5) * 0.08);
      var y = xy[1] * shrink * u * (1 + (Math.random() - 0.5) * 0.08) - 0.02;
      var zz = z * 0.62 * u;
      pts.push({ x: x, y: y, z: zz, s: 0.6 + Math.random() * 1.5, ph: Math.random() * 6.28,
        tone: Math.random() }); // 0 rose → 0.5 fuchsia → 1 cyan
    }
    // two orbit rings around the heart (depth cue)
    rings = [];
    for (var r = 0; r < 2; r++) {
      var ring = [];
      for (var a = 0; a < 46; a++) {
        var ang = (a / 46) * Math.PI * 2;
        ring.push({ ang: ang, tilt: r === 0 ? 0.45 : -0.25, rad: r === 0 ? 1.25 : 1.45, off: r * 1.3 });
      }
      rings.push(ring);
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cv.clientWidth = innerWidth; H = cv.clientHeight = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* same lub-dub envelope as canvas.js screensaver */
  function g(x, cc, w) { var d = x - cc; return Math.exp(-(d * d) / (2 * w * w)); }
  function beatEnv(now) {
    var period = 1250, ph = (now % period) / period;
    return g(ph, 0.04, 0.028) + 0.55 * g(ph, 0.16, 0.030);
  }
  var lastBeat = 0;

  function project(x, y, z, S, cx, cy) {
    var cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    var X = x * cosY - z * sinY, Z = x * sinY + z * cosY;
    var cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    var Y = y * cosX - Z * sinX; Z = y * sinX + Z * cosX;
    var f = 3.2, k = f / (f + Z);
    return { sx: cx + X * k * S, sy: cy + Y * k * S, k: k, z: Z };
  }

  function tone(a, light) {
    // rose #fb7185 → fuchsia #e879f9 → cyan #22d3ee
    if (a < 0.5) {
      var u = a * 2;
      return 'rgba(' + Math.round(251 + (232 - 251) * u) + ',' + Math.round(113 + (121 - 113) * u) + ',' + Math.round(133 + (249 - 133) * u) + ',' + (light ? 0.75 : 0.85) + ')';
    }
    var v = (a - 0.5) * 2;
    return 'rgba(' + Math.round(232 + (34 - 232) * v) + ',' + Math.round(121 + (211 - 121) * v) + ',' + Math.round(249 + (238 - 249) * v) + ',' + (light ? 0.75 : 0.85) + ')';
  }

  function frame(now) {
    if (!running) return;
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    var hb = beatEnv(now);
    var t = now * 0.001;

    /* FOLLOW THE CURSOR (ambient drift on touch) */
    if (coarse) { tx = W * (0.5 + Math.sin(t * 0.16) * 0.18); ty = H * (0.42 + Math.cos(t * 0.11) * 0.1); }
    hx += (tx - hx) * 0.045; hy += (ty - hy) * 0.045;
    rotY = t * 0.32 + ((tx / W) - 0.5) * 0.9;
    rotX = 0.18 * Math.sin(t * 0.2) + ((ty / H) - 0.5) * -0.45;

    /* beat peak → mini shockwave */
    if (hb > 0.92 && now - lastBeat > 400) {
      lastBeat = now;
      shocks.push({ x: hx, y: hy, r: 8, a: 0.85 });
    }

    c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = light ? 'multiply' : 'lighter';

    var S = Math.min(W, H) * 0.34 * (1 + hb * 0.075); // heartbeat scale thump
    var cx = hx, cy = hy;

    /* orbit rings */
    for (var ri = 0; ri < rings.length; ri++) {
      var ring = rings[ri];
      c.beginPath();
      for (var a = 0; a <= ring.length; a++) {
        var p3 = ring[a % ring.length];
        var x = Math.cos(p3.ang + t * 0.4 + p3.off) * p3.rad;
        var z = Math.sin(p3.ang + t * 0.4 + p3.off) * p3.rad * 0.5;
        var y = Math.sin(p3.ang + t * 0.4 + p3.off) * p3.tilt;
        var pr = project(x, y, z, S, cx, cy);
        if (a === 0) c.moveTo(pr.sx, pr.sy); else c.lineTo(pr.sx, pr.sy);
      }
      c.closePath();
      c.strokeStyle = light ? 'rgba(14,116,144,0.22)' : 'rgba(34,211,238,0.16)';
      c.lineWidth = 1;
      c.stroke();
    }

    /* particles */
    for (var i = 0; i < pts.length; i++) {
      var pt = pts[i];
      var wob = Math.sin(t * 0.8 + pt.ph) * 0.012;
      var pr2 = project(pt.x + wob, pt.y, pt.z, S, cx, cy);
      var size = pt.s * pr2.k * (0.85 + hb * 0.3);
      c.beginPath();
      c.arc(pr2.sx, pr2.sy, Math.max(0.4, size), 0, Math.PI * 2);
      c.fillStyle = tone(pt.tone, light);
      c.fill();
    }

    /* beat shockwave rings */
    for (var s = shocks.length - 1; s >= 0; s--) {
      var sh = shocks[s];
      sh.r += 4.2; sh.a *= 0.945;
      if (sh.a < 0.03) { shocks.splice(s, 1); continue; }
      c.beginPath(); c.arc(sh.x, sh.y, sh.r, 0, Math.PI * 2);
      c.strokeStyle = 'rgba(232,121,249,' + sh.a.toFixed(3) + ')';
      c.lineWidth = 1.6;
      c.stroke();
      c.beginPath(); c.arc(sh.x, sh.y, sh.r * 0.7, 0, Math.PI * 2);
      c.strokeStyle = 'rgba(34,211,238,' + (sh.a * 0.7).toFixed(3) + ')';
      c.lineWidth = 1.2;
      c.stroke();
    }

    c.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  function pointer(e) {
    if (coarse) return;
    tx = e.clientX; ty = e.clientY;
  }
  document.addEventListener('pointermove', pointer, { passive: true });

  function resizeAll() { resize(); }
  window.addEventListener('resize', resizeAll, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else if (!reduced) { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  });

  seed(); resize();
  tx = W * 0.5; ty = H * 0.42; hx = tx; hy = ty;
  if (reduced) { running = true; frame(0); running = false; }
  else { running = true; raf = requestAnimationFrame(frame); }
})();
