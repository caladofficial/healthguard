/* ============================================================================
   HealthGuard — MOTION PRIMITIVES v2 "VITALITY ENGINE"
   EVOLVEX IT SOLUTIONS PVT. LTD.

   v2 additions on top of the 12 v1 primitives:
     · Shockwave FX — every tap/click emits double energy rings (and CTAs pulse)
     · 3D hero stage — pointer-parallax on the art frame + floating glass chips
     · Glare tracking on cards (radial highlight follows the pointer)
     · Stronger damped 3D tilt (±7°) with translateZ depth on card icons
     · Cursor energy glow (fine pointers only)
   Everything respects prefers-reduced-motion and degrades to static states.
   ============================================================================ */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  /* 1 — Header condense on scroll */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* 2 — Mobile drawer */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var drawerClose = document.getElementById('drawerClose');
  var scrim = document.getElementById('drawerScrim');
  function setDrawer(open) {
    if (!drawer || !burger) return;
    drawer.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open && drawerClose) drawerClose.focus();
  }
  if (burger) burger.addEventListener('click', function () { setDrawer(drawer.hidden); });
  if (drawerClose) drawerClose.addEventListener('click', function () { setDrawer(false); if (burger) burger.focus(); });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && !drawer.hidden) setDrawer(false);
  });
  if (drawer) drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });

  /* 3 — Desktop nav dropdown families */
  document.querySelectorAll('[data-nav-family]').forEach(function (fam) {
    var trig = fam.querySelector('.nav-trigger');
    if (!trig) return;
    trig.addEventListener('click', function (e) {
      e.preventDefault();
      var open = fam.classList.contains('open');
      document.querySelectorAll('[data-nav-family].open').forEach(function (f) {
        f.classList.remove('open');
        var t = f.querySelector('.nav-trigger'); if (t) t.setAttribute('aria-expanded', 'false');
      });
      fam.classList.toggle('open', !open);
      trig.setAttribute('aria-expanded', String(!open));
    });
    if (!coarse) {
      var tmr;
      fam.addEventListener('mouseenter', function () {
        clearTimeout(tmr);
        document.querySelectorAll('[data-nav-family].open').forEach(function (f) {
          if (f !== fam) { f.classList.remove('open'); var t = f.querySelector('.nav-trigger'); if (t) t.setAttribute('aria-expanded', 'false'); }
        });
        fam.classList.add('open'); trig.setAttribute('aria-expanded', 'true');
      });
      fam.addEventListener('mouseleave', function () {
        tmr = setTimeout(function () {
          fam.classList.remove('open'); trig.setAttribute('aria-expanded', 'false');
        }, 160);
      });
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('[data-nav-family]')) {
      document.querySelectorAll('[data-nav-family].open').forEach(function (f) {
        f.classList.remove('open');
        var t = f.querySelector('.nav-trigger'); if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* 4 — SplitText reveal */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var words = String(el.textContent).trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var wrap = document.createElement('span'); wrap.className = 'sp-w';
      var sp = document.createElement('span'); sp.className = 'sp';
      sp.textContent = w;
      sp.style.transitionDelay = (i * 0.045) + 's';
      wrap.appendChild(sp);
      el.appendChild(wrap);
      el.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('split-in'); });
    });
  });

  /* 5 — Stagger reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      if (el.hasAttribute('data-stagger')) {
        Array.prototype.forEach.call(el.querySelectorAll('[data-reveal]'), function (kid, i) {
          kid.style.transitionDelay = Math.min(i * 0.07, 0.5) + 's';
          kid.classList.add('in');
        });
      } else {
        el.classList.add('in');
        el.querySelectorAll && el.querySelectorAll('[data-bar]').forEach(function (bar) { bar.classList.add('on'); });
        if (el.hasAttribute('data-bar')) el.classList.add('on');
        if (el.hasAttribute('data-shock-auto') && !reduced) shockAt(el.getBoundingClientRect().left + el.offsetWidth / 2, el.getBoundingClientRect().top + el.offsetHeight / 2);
      }
      io.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('[data-reveal], [data-stagger]').forEach(function (el) { io.observe(el); });
  document.querySelectorAll('[data-bar]').forEach(function (bar) { io.observe(bar); });

  /* 6 — CountUp stats */
  var ioCount = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reduced) { el.textContent = String(target); ioCount.unobserve(el); return; }
      var t0 = performance.now(), dur = 1400;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      ioCount.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(function (el) { ioCount.observe(el); });

  /* 7 — SHOCKWAVE FX: double energy rings at the pointer */
  function shockAt(x, y) {
    if (reduced) return;
    for (var i = 0; i < 2; i++) {
      var ring = document.createElement('span');
      ring.className = 'shock-ring' + (i ? ' s2' : '');
      ring.style.left = x + 'px';
      ring.style.top = y + 'px';
      document.body.appendChild(ring);
      (function (r) { setTimeout(function () { r.remove(); }, 1000); })(ring);
    }
  }
  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    var hit = t.closest && t.closest('.btn, .card, .bento-cell, .rail-card, .chip, .pill, .nav-card, .acc-item summary');
    if (hit || (t === document.body)) shockAt(e.clientX, e.clientY);
  }, { passive: true });

  /* Auto shockwave heartbeat on hero CTAs (screen "heartbeat") */
  if (!reduced) {
    var beaters = document.querySelectorAll('.btn-primary');
    var bi = 0;
    setInterval(function () {
      if (document.hidden || !beaters.length) return;
      var el = beaters[bi % beaters.length]; bi++;
      var r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) shockAt(r.left + r.width / 2, r.top + r.height / 2);
    }, 2500); // matches the canvas heartbeat cadence family
  }

  /* 8 — TiltCard + glare (±7° damped) */
  if (!reduced) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
      function animate() {
        rx += (tx - rx) * 0.12; ry += (ty - ry) * 0.12;
        card.style.transform = 'perspective(750px) rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg) translateZ(0)';
        if (Math.abs(tx - rx) > 0.01 || Math.abs(ty - ry) > 0.01) raf = requestAnimationFrame(animate);
        else raf = 0;
      }
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        if (coarse) return;
        ty = px * 14; tx = -py * 14;
        if (!raf) raf = requestAnimationFrame(animate);
      });
      card.addEventListener('pointerleave', function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(animate);
      });
    });
  }

  /* 9 — 3D hero stage parallax (art frame + floating chips) */
  var heroArt = document.querySelector('.hero-art');
  if (heroArt && !reduced && !coarse) {
    var frame = heroArt.querySelector('.hero-art-frame');
    var chips = heroArt.querySelectorAll('.float-chip');
    heroArt.closest('.hero').addEventListener('pointermove', function (e) {
      var r = heroArt.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      if (frame) {
        frame.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
        frame.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
      }
      chips.forEach(function (chip, i) {
        var depth = (i + 1) * 7;
        chip.style.marginLeft = (px * depth).toFixed(1) + 'px';
        chip.style.marginTop = (py * depth).toFixed(1) + 'px';
      });
    });
  }

  /* 10 — Spotlight breath */
  document.querySelectorAll('[data-spotlight]').forEach(function (heroSpot) {
    if (reduced) return;
    var last = 0;
    heroSpot.addEventListener('pointermove', function (e) {
      var now = performance.now();
      if (now - last < 33) return; last = now;
      var r = heroSpot.getBoundingClientRect();
      heroSpot.style.setProperty('--spot-x', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      heroSpot.style.setProperty('--spot-y', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    });
  });

  /* 11 — Cursor energy glow (fine pointers) */
  var glow = document.querySelector('.cursor-glow');
  if (glow && !coarse && !reduced) {
    document.body.classList.add('has-cursor');
    var gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy, gr = 0;
    document.addEventListener('pointermove', function (e) { gx = e.clientX; gy = e.clientY; }, { passive: true });
    (function lerp() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      gr = requestAnimationFrame(lerp);
    })();
  }

  /* 12 — Pipeline path draw */
  var ioDraw = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var p = en.target;
      try {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len + ' ' + len;
        p.style.strokeDashoffset = reduced ? 0 : len;
        requestAnimationFrame(function () {
          p.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)';
          p.style.strokeDashoffset = 0;
        });
      } catch (err) { }
      ioDraw.unobserve(p);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-draw]').forEach(function (p) { ioDraw.observe(p); });

  /* 13 — Queue ticker rotation */
  document.querySelectorAll('[data-queue]').forEach(function (q) {
    if (reduced) return;
    var list = q.querySelector('.queue-list');
    if (!list) return;
    setInterval(function () {
      if (document.hidden) return;
      var first = list.firstElementChild;
      if (!first) return;
      first.style.transition = 'opacity .5s, transform .5s';
      first.style.opacity = '0'; first.style.transform = 'translateY(-6px)';
      setTimeout(function () {
        list.appendChild(first);
        first.style.opacity = ''; first.style.transform = '';
        var b = first.querySelector('b');
        if (b) {
          var n = parseInt(b.textContent.replace(/\D/g, ''), 10) || 100;
          b.textContent = '#A' + (n >= 107 ? 104 : n + 1);
        }
      }, 520);
    }, 3200);
  });

  /* 14 — Footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
