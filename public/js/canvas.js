/* ============================================================================
   HealthGuard — LIVING HEALTH CANVAS v2.1 "VITALITY ENGINE" (theme-aware)
   EVOLVEX IT SOLUTIONS PVT. LTD.

   WebGL1 fullscreen shader: aurora bands + lub-dub ECG + shockwave rings +
   heart core + motes + vignette thump. v2.1 adds a u_theme uniform so the same
   field powers BOTH the deep-aurora dark theme and the luminous light theme
   (listen: 'hg:theme' event / data-theme attribute). Canvas2D fallback mirrors
   the palettes. prefers-reduced-motion → one static frame. Pauses when hidden.
   ============================================================================ */
(function () {
  'use strict';
  var cv = document.getElementById('livingCanvas');
  if (!cv || !cv.getContext) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    'uniform float u_theme;', // 0 dark, 1 light
    'float g(float x, float c, float w){ float d = x - c; return exp(-(d*d)/(2.0*w*w)); }',
    'float beat(float ph){ return g(ph, 0.04, 0.028) + 0.55*g(ph, 0.16, 0.030); }',
    'float ecg(float x){',
    '  float y = 0.0;',
    '  y += 0.10*g(x, 0.22, 0.022);',
    '  y += -0.10*g(x, 0.34, 0.008);',
    '  y += 0.95*g(x, 0.37, 0.007);',
    '  y += -0.22*g(x, 0.40, 0.010);',
    '  y += 0.20*g(x, 0.55, 0.028);',
    '  return y;',
    '}',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / u_res;',
    '  vec2 asp = vec2(u_res.x / u_res.y, 1.0);',
    '  float t = u_time * 0.001;',
    '  float period = 1.25;',
    '  float ph = fract(t / period);',
    '  float hb = beat(ph);',
    // base: warm charcoal (dark) → soft cream (light) — classy palettes
    '  vec3 baseD = mix(vec3(0.055, 0.052, 0.048), vec3(0.095, 0.088, 0.08), uv.y);',
    '  vec3 baseL = mix(vec3(0.955, 0.94, 0.90), vec3(0.915, 0.895, 0.85), uv.y);',
    '  vec3 col = mix(baseD, baseL, u_theme);',
    // slow satin bands: champagne + dusty sage
    '  float a1 = sin(uv.x * 3.0 + t * 0.11 + sin(uv.y * 2.0 + t * 0.07));',
    '  float a2 = sin(uv.x * 5.0 - t * 0.08 + cos(uv.y * 3.0 - t * 0.05));',
    '  float band1 = smoothstep(0.55, 0.0, abs(uv.y - 0.42 - a1 * 0.05));',
    '  float band2 = smoothstep(0.6, 0.0, abs(uv.y - 0.6 - a2 * 0.045));',
    '  float ai = mix(1.0, 0.5, u_theme);',
    '  col += vec3(0.72, 0.58, 0.30) * band1 * 0.035 * (0.85 + 0.3 * hb) * ai;',
    '  col += vec3(0.45, 0.50, 0.42) * band2 * 0.04 * (0.85 + 0.3 * hb) * ai;',
    // ECG — warm gold thread
    '  float ephase = fract(uv.x * 1.6 - t * 0.12);',
    '  float ey = ecg(ephase);',
    '  float dy = abs(uv.y - 0.32 - ey * 0.055);',
    '  float line = 0.0032 / (dy + 0.0016);',
    '  vec3 lineC = mix(vec3(0.78, 0.63, 0.33), vec3(0.55, 0.44, 0.18), u_theme);',
    '  col += lineC * line * (0.05 + 0.045 * hb) * ai;',
    // shockwave rings — champagne / ivory / dusty rose
    '  vec2 hp = vec2(0.5, 0.45);',
    '  float d = distance(uv * asp, hp * asp);',
    '  for (int i = 0; i < 3; i++) {',
    '    float fi = float(i);',
    '    float rp = fract(t / period * 0.8 + fi * 0.3333);',
    '    float r = rp * 0.75;',
    '    float ring = 0.0042 / (abs(d - r) + 0.004);',
    '    float fade = (1.0 - rp) * (1.0 - rp);',
    '    vec3 rc = (i == 0) ? vec3(0.82, 0.66, 0.35) : ((i == 1) ? vec3(0.82, 0.76, 0.62) : vec3(0.65, 0.4, 0.35));',
    '    rc = mix(rc, rc * 0.55, u_theme);',
    '    col += rc * ring * fade * 0.028 * ai;',
    '  }',
    // heart core — dusty garnet
    '  float core = 0.012 / (d + 0.02);',
    '  col += mix(vec3(0.6, 0.28, 0.26), vec3(0.5, 0.12, 0.12), u_theme) * core * (0.02 + 0.03 * hb) * ai;',
    // motes — warm ivory dust
    '  for (int i = 0; i < 8; i++) {',
    '    float fi = float(i);',
    '    vec2 mp = vec2(fract(fi * 0.173 + t * 0.004 * (0.4 + fi * 0.05)), fract(fi * 0.291 + t * 0.006));',
    '    float md = distance(uv * asp, mp * asp);',
    '    col += mix(vec3(0.75, 0.68, 0.52), vec3(0.45, 0.4, 0.3), u_theme) * 0.0012 / (md + 0.01) * ai;',
    '  }',
    '  float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5)));',
    '  col *= mix(0.75 + 0.25 * vig, 1.03 - 0.05 * (1.0 - vig), u_theme);',
    '  col *= 0.96 + 0.04 * hb;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var gl = null, prog = null, uniT = null, uniTheme = null, running = false, raf = 0;
  var theme = (document.documentElement.getAttribute('data-theme') === 'light') ? 1 : 0;

  function pushTheme() {
    theme = (document.documentElement.getAttribute('data-theme') === 'light') ? 1 : 0;
    if (gl && uniTheme) gl.uniform1f(uniTheme, theme);
  }
  window.addEventListener('hg:theme', pushTheme);

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
    uniT = gl.getUniformLocation(prog, 'u_time');
    uniTheme = gl.getUniformLocation(prog, 'u_theme');
    gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), cv.width, cv.height);
    gl.uniform1f(uniTheme, theme);
    return true;
  }

  function resizeGL() {
    if (!gl) return;
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), cv.width, cv.height);
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
  function g2(x, c, w) { var d = x - c; return Math.exp(-(d * d) / (2 * w * w)); }
  function beatEnv(t) {
    var period = 1.25, ph = (t / 1000 % period) / period;
    return g2(ph, 0.04, 0.028) + 0.55 * g2(ph, 0.16, 0.030);
  }
  function ecgShape(x) {
    return 0.10 * g2(x, 0.22, 0.022) - 0.10 * g2(x, 0.34, 0.008) + 0.95 * g2(x, 0.37, 0.007) - 0.22 * g2(x, 0.40, 0.010) + 0.20 * g2(x, 0.55, 0.028);
  }
  function frame2D(now) {
    if (!running) return;
    theme = (document.documentElement.getAttribute('data-theme') === 'light') ? 1 : 0;
    var t = now * 0.001, hb = beatEnv(now);
    var c = ctx2;
    c.clearRect(0, 0, W, H);
    var grd = c.createLinearGradient(0, 0, W, H);
    if (theme) { grd.addColorStop(0, 'rgba(123,97,255,0.05)'); grd.addColorStop(0.5, 'rgba(34,211,238,0.05)'); grd.addColorStop(1, 'rgba(52,211,153,0.05)'); }
    else { grd.addColorStop(0, 'rgba(88,28,135,0.10)'); grd.addColorStop(0.5, 'rgba(8,145,178,0.08)'); grd.addColorStop(1, 'rgba(6,95,70,0.08)'); }
    c.fillStyle = grd; c.fillRect(0, 0, W, H);
    c.beginPath();
    for (var x = -10; x <= W + 10; x += 3) {
      var ph = ((x / W) * 1.6 - t * 0.12) % 1; if (ph < 0) ph += 1;
      var y = H * 0.68 - ecgShape(ph) * H * 0.08;
      if (x === -10) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.strokeStyle = theme ? 'rgba(4,120,87,' + (0.12 + 0.08 * hb) + ')' : 'rgba(52,211,153,' + (0.14 + 0.10 * hb) + ')';
    c.lineWidth = 1.6;
    c.shadowColor = theme ? 'rgba(4,120,87,0.5)' : 'rgba(52,211,153,0.8)'; c.shadowBlur = 8;
    c.stroke(); c.shadowBlur = 0;
    for (var i = 0; i < 3; i++) {
      var rp = ((t / 1.25) * 0.8 + i / 3) % 1;
      var r = rp * Math.max(W, H) * 0.55;
      c.beginPath(); c.arc(W * 0.5, H * 0.45, r, 0, Math.PI * 2);
      var al = (1 - rp) * (1 - rp) * (theme ? 0.10 : 0.16);
      c.strokeStyle = i === 0 ? 'rgba(34,211,238,' + al + ')' : (i === 1 ? 'rgba(139,92,246,' + al + ')' : 'rgba(52,211,153,' + al + ')');
      c.lineWidth = 1.6; c.stroke();
    }
    var core = c.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, 90);
    core.addColorStop(0, 'rgba(251,113,133,' + (theme ? 0.03 : 0.05) * (1 + hb) + ')');
    core.addColorStop(1, 'rgba(251,113,133,0)');
    c.fillStyle = core; c.fillRect(0, 0, W, H);
    for (var m = 0; m < motes.length; m++) {
      var mo = motes[m];
      mo.y -= mo.v * 16; if (mo.y < -0.02) { mo.y = 1.02; mo.x = Math.random(); }
      var mx = (mo.x + Math.sin(t * 0.3 + mo.ph) * 0.01) * W;
      c.beginPath(); c.arc(mx, mo.y * H, mo.r, 0, Math.PI * 2);
      c.fillStyle = 'rgba(' + mo.tone + ',' + (theme ? 0.07 : 0.12) + ')'; c.fill();
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
    if (gl) { gl.uniform1f(uniT, 0); gl.drawArrays(gl.TRIANGLES, 0, 3); }
    else if (ctx2) { running = true; frame2D(0); running = false; }
  } else start();

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (!reduced) start(); });
  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); init2D(); resize(); if (!reduced) start(); });
})();
