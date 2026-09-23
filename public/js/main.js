/* ============================================================================
   HealthGuard — MOTION PRIMITIVES (12-component animation system)
   EVOLVEX IT SOLUTIONS PVT. LTD.

   Dependency-free re-implementations of the best React-Bits / Aceternity ideas,
   tuned to the matte clinical language (research log D.2/D.3). Every primitive
   respects prefers-reduced-motion and degrades to a static state.
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

  /* 3 — Desktop nav dropdown families (click on touch, hover-intent on fine) */
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

  /* 4 — SplitText reveal (React-Bits style word lift) */
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

  /* 5 — Stagger reveal on scroll (IntersectionObserver) */
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
      }
      io.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('[data-reveal], [data-stagger]').forEach(function (el) { io.observe(el); });

  /* 6 — Confidence bars fill when seen */
  document.querySelectorAll('[data-bar]').forEach(function (bar) { io.observe(bar); });

  /* 7 — CountUp stats (ease-out) */
  var ioCount = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reduced) { el.textContent = String(target); ioCount.unobserve(el); return; }
      var t0 = performance.now(), dur = 1400;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      ioCount.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(function (el) { ioCount.observe(el); });

  /* 8 — TiltCard (Aceternity 3D card, damped to 3°) */
  if (!reduced && !coarse) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
      function animate() {
        rx += (tx - rx) * 0.12; ry += (ty - ry) * 0.12;
        card.style.transform = 'perspective(700px) rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
        if (Math.abs(tx - rx) > 0.01 || Math.abs(ty - ry) > 0.01) raf = requestAnimationFrame(animate);
        else raf = 0;
      }
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        ty = px * 6; tx = -py * 6;      // max ±3°
        if (!raf) raf = requestAnimationFrame(animate);
      });
      card.addEventListener('pointerleave', function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(animate);
      });
    });
  }

  /* 9 — Spotlight breath (Aceternity spotlight, matte) */
  document.querySelectorAll('[data-spotlight]').forEach(function (hero) {
    if (reduced) return;
    var last = 0;
    hero.addEventListener('pointermove', function (e) {
      var now = performance.now();
      if (now - last < 33) return; last = now;   // ~30fps cap: battery/GPU friendly
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--spot-x', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      hero.style.setProperty('--spot-y', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    });
  });

  /* 10 — Pipeline path draw */
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
      } catch (e) { /* non-rendered path */ }
      ioDraw.unobserve(p);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-draw]').forEach(function (p) { ioDraw.observe(p); });

  /* 11 — Queue ticker rotation (token-queue live demo) */
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

  /* 12 — Footer year + subtle header shadow state */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
