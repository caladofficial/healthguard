/* ============================================================================
   HealthGuard — LIVING HEALTH CANVAS v2 "VITALITY ENGINE"
   EVOLVEX IT SOLUTIONS PVT. LTD.

   v2 brief: heartbeat screensaver + shockwave animation + 3D aurora, combined
   into one deep-aurora WebGL field behind every page:

     Layer A (CSS)  paper/energy grain + 3 floating glass orbs
     Layer B (GLSL) volumetric aurora bands (cyan/violet/emerald/rose)
     Layer C (GLSL) ECG trace with real lub-dub envelope, scrolling
     Layer D (GLSL) shockwave rings emitted on every heartbeat
     Layer E (GLSL) soft drifting motes + vignette pulse synced to the beat

   WebGL1 fullscreen shader; automatic Canvas2D fallback (ECG + rings + motes)
   if WebGL is unavailable or the shader fails. prefers-reduced-motion → one
   static frame. Pauses when the tab is hidden. DPR capped at 2 (GPU budget).
   ============================================================================ */
(function () {
  'use strict';
  var cv = document.getElementById('livingCanvas');
  if (!cv || !cv.getContext) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------ WebGL layer ----------------------------- */
  var VERT = [
    'attribute vec2 p;',
    'void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    /* gaussian pulse */
    'float g(float x, float c, float w){ float d = x - c; return exp(-(d*d)/(2.0*w*w)); }',
    /* lub-dub heartbeat envelope over one period */
    'float beat(float ph){ return g(ph, 0.04, 0.028) + 0.55*g(ph, 0.16, 0.030); }',
    /* ECG shape over one beat phase */
    'float ecg(float x){',
    '  float y = 0.0;',
    '  y += 0.10*g(x, 0.22, 0.022);',      // P
    '  y += -0.10*g(x, 0.34, 0.008);',     // Q
    '  y += 0.95*g(x, 0.37, 0.007);',      // R
    '  y += -0.22*g(x, 0.40, 0.010);',     // S
    '  y += 0.20*g(x, 0.55, 0.028);',      // T
    '  return y;',
    '}',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / u_res;',
    '  vec2 asp = vec2(u_res.x / u_res.y, 1.0);',
    '  float t = u_time * 0.001;',
    '  float period = 1.25;',
    '  float ph = fract(t / period);',
    '  float hb = beat(ph);',
    '  vec3 col = mix(vec3(0.024, 0.035, 0.09), vec3(0.05, 0.06, 0.16), uv.y);',

    /* B — aurora bands (slow, low-contrast) */
    '  float a1 = sin(uv.x * 3.0 + t * 0.11 + sin(uv.y * 2.0 + t * 0.07));',
    '  float a2 = sin(uv.x * 5.0 - t * 0.08 + cos(uv.y * 3.0 - t * 0.05));',
    '  float band1 = smoothstep(0.55, 0.0, abs(uv.y - 0.42 - a1 * 0.05));',
    '  float band2 = smoothstep(0.6, 0.0, abs(uv.y - 0.6 - a2 * 0.045));',
    '  col += vec3(0.10, 0.55, 0.75) * band1 * 0.045 * (0.85 + 0.3 * hb);',
    '  col += vec3(0.45, 0.22, 0.85) * band2 * 0.05 * (0.85 + 0.3 * hb);',

    /* C — ECG trace band, glowing, lub-dub scroll */
    '  float ephase = fract(uv.x * 1.6 - t * 0.12);',
    '  float ey = ecg(ephase);',
    '  float dy = abs(uv.y - 0.32 - ey * 0.055);',
    '  float line = 0.0032 / (dy + 0.0016);',
    '  col += vec3(0.13, 0.85, 0.65) * line * (0.05 + 0.045 * hb);',

    /* D — shockwave rings from the heart point, emitted per beat */
    '  vec2 hp = vec2(0.5, 0.45);',
    '  float d = distance(uv * asp, hp * asp);',
    '  for (int i = 0; i < 3; i++) {',
    '    float fi = float(i);',
    '    float rp = fract(t / period * 0.8 + fi * 0.3333);', // ring progress
    '    float r = rp * 0.75;',
    '    float ring = 0.0042 / (abs(d - r) + 0.004);',
    '    float fade = (1.0 - rp) * (1.0 - rp);',
    '    vec3 rc = (i == 0) ? vec3(0.13, 0.83, 0.93) : ((i == 1) ? vec3(0.55, 0.36, 0.96) : vec3(0.2, 0.82, 0.6));',
    '    col += rc * ring * fade * 0.03;',
    '  }',

    /* heart glow itself, throbbing */
    '  float core = 0.012 / (d + 0.02);',
    '  col += vec3(0.9, 0.35, 0.55) * core * (0.02 + 0.03 * hb);',

    /* E — motes */
    '  for (int i = 0; i < 8; i++) {',
    '    float fi = float(i);',
    '    vec2 mp = vec2(fract(fi * 0.173 + t * 0.004 * (0.4 + fi * 0.05)), fract(fi * 0.291 + t * 0.006));',
    '    float md = distance(uv * asp, mp * asp);',
    '    col += vec3(0.4, 0.6, 0.9) * 0.0012 / (md + 0.01);',
    '  }',

    /* vignette pulse with the heartbeat */
    '  float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5)));',
    '  col *= 0.75 + 0.25 * vig;',
    '  col *= 0.96 + 0.04 * hb;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var gl = null, prog = null, uniT = null, running = false, raf = 0, t0 = 0;

  function initGL() {
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false }) || cv.getContext('experimental-webgl'); } catch (e) { }
    if (!gl) return false;
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { gl = null; return false; }
    prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return false; }
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    uniT = gl.getUniformLocation(prog, 'time'); // u_time
    gl.uniform2f(gl.getUniformLocation(prog, 'res'), cv.width, cv.height);
    return true;
  }

  function resizeGL() {
    if (!gl) return;
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(gl.getUniformLocation(prog, 'res'), cv.width, cv.height);
  }

  function frameGL(now) {
    if (!running) return;
    gl.uniform1f(uniT, now);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frameGL);
  }

  /* --------------------------- Canvas2D fallback -------------------------- */
  var ctx2 = null, W = 0, H = 0, motes = [];
  function init2D() {
    ctx2 = cv.getContext('2d');
    if (!ctx2) return;
    for (var i = 0; i < 18; i++) {
      motes.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, v: 0.00004 + Math.random() * 0.00008, ph: Math.random() * 6.28,
        tone: i % 2 ? '34,211,238' : '139,92,246' });
    }
  }
  function beatEnv(t) {
    var period = 1.25, ph = (t / 1000 % period) / period;
    function g(x, c, w) { var d = x - c; return Math.exp(-(d * d) / (2 * w * w)); }
    return g(ph, 0.04, 0.028) + 0.55 * g(ph, 0.16, 0.030);
  }
  function ecgShape(x) {
    function g(x, c, w) { var d = x - c; return Math.exp(-(d * d) / (2 * w * w)); }
    return 0.10 * g(x, 0.22, 0.022) - 0.10 * g(x, 0.34, 0.008) + 0.95 * g(x, 0.37, 0.007) - 0.22 * g(x, 0.40, 0.010) + 0.20 * g(x, 0.55, 0.028);
  }
  function frame2D(now) {
    if (!running) return;
    var t = now * 0.001, hb = beatEnv(now);
    var c = ctx2;
    c.clearRect(0, 0, W, H);
    /* aurora bands */
    var grd = c.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, 'rgba(88,28,135,0.10)');
    grd.addColorStop(0.5, 'rgba(8,145,178,0.08)');
    grd.addColorStop(1, 'rgba(6,95,70,0.08)');
    c.fillStyle = grd; c.fillRect(0, 0, W, H);
    /* ECG */
    c.beginPath();
    for (var x = -10; x <= W + 10; x += 3) {
      var ph = ((x / W) * 1.6 - t * 0.12) % 1; if (ph < 0) ph += 1;
      var y = H * 0.68 - ecgShape(ph) * H * 0.08;
      if (x === -10) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.strokeStyle = 'rgba(52,211,153,' + (0.14 + 0.10 * hb) + ')';
    c.lineWidth = 1.6;
    c.shadowColor = 'rgba(52,211,153,0.8)'; c.shadowBlur = 8;
    c.stroke(); c.shadowBlur = 0;
    /* shockwave rings */
    for (var i = 0; i < 3; i++) {
      var rp = ((t / 1.25) * 0.8 + i / 3) % 1;
      var r = rp * Math.max(W, H) * 0.55;
      c.beginPath(); c.arc(W * 0.5, H * 0.45, r, 0, Math.PI * 2);
      var al = (1 - rp) * (1 - rp) * 0.16;
      c.strokeStyle = i === 0 ? 'rgba(34,211,238,' + al + ')' : (i === 1 ? 'rgba(139,92,246,' + al + ')' : 'rgba(52,211,153,' + al + ')');
      c.lineWidth = 1.6; c.stroke();
    }
    /* heart core */
    var core = c.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, 90);
    core.addColorStop(0, 'rgba(251,113,133,' + (0.05 + 0.05 * hb) + ')');
    core.addColorStop(1, 'rgba(251,113,133,0)');
    c.fillStyle = core; c.fillRect(0, 0, W, H);
    /* motes */
    for (var m = 0; m < motes.length; m++) {
      var mo = motes[m];
      mo.y -= mo.v * 16; if (mo.y < -0.02) { mo.y = 1.02; mo.x = Math.random(); }
      var mx = (mo.x + Math.sin(t * 0.3 + mo.ph) * 0.01) * W;
      c.beginPath(); c.arc(mx, mo.y * H, mo.r, 0, Math.PI * 2);
      c.fillStyle = 'rgba(' + mo.tone + ',0.12)'; c.fill();
    }
    raf = requestAnimationFrame(frame2D);
  }

  /* ------------------------------ lifecycle ------------------------------- */
  function resize() {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.max(1, Math.round(W * DPR));
    cv.height = Math.max(1, Math.round(H * DPR));
    if (gl) { resizeGL(); } else if (ctx2) { ctx2.setTransform(DPR, 0, 0, DPR, 0, 0); }
  }
  function start() { if (running) return; running = true; raf = requestAnimationFrame(gl ? frameGL : frame2D); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  var isGL = initGL();
  if (!isGL) init2D();
  resize();
  if (reduced) {
    // one static frame only
    if (gl) { gl.uniform1f(uniT, 0); gl.drawArrays(gl.TRIANGLES, 0, 3); }
    else if (ctx2) { running = true; frame2D(0); running = false; }
  } else start();

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (!reduced) start(); });
  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); init2D(); resize(); if (!reduced) start(); });
})();
