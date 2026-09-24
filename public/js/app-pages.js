/* HealthGuard — DOM glue for the product pages (login, triage, my-health).
   EVOLVEX IT SOLUTIONS PVT. LTD. */
(function () {
  'use strict';

  function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }
  function ck(id) { var el = document.getElementById(id); return el ? el.checked : false; }
  function cks(name) {
    var out = {};
    document.querySelectorAll('input[name="' + name + '"]').forEach(function (i) { out[i.value] = i.checked; });
    return out;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ----------------------------- LOGIN PAGE ------------------------------- */
  var authForm = document.getElementById('authForm');
  if (authForm) {
    var mode = 'in';
    var tabIn = document.getElementById('tabIn'), tabUp = document.getElementById('tabUp');
    var submit = document.getElementById('authSubmit'), msg = document.getElementById('authMsg');
    function setMode(m) {
      mode = m;
      tabIn.classList.toggle('is-on', m === 'in'); tabIn.setAttribute('aria-selected', m === 'in');
      tabUp.classList.toggle('is-on', m === 'up'); tabUp.setAttribute('aria-selected', m === 'up');
      submit.textContent = m === 'in' ? 'Sign in' : 'Create account';
    }
    tabIn.addEventListener('click', function () { setMode('in'); });
    tabUp.addEventListener('click', function () { setMode('up'); });
    authForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = val('authEmail').trim(), pass = val('authPass');
      msg.textContent = ''; msg.className = 'auth-msg';
      if (!email || pass.length < 8) { msg.textContent = 'Enter a valid email and a password of at least 8 characters.'; msg.classList.add('is-err'); return; }
      submit.disabled = true; submit.textContent = mode === 'in' ? 'Signing in…' : 'Creating account…';
      var p = mode === 'in' ? window.HGAuth.signIn(email, pass) : window.HGAuth.signUp(email, pass);
      p.then(function () {
        window.HGAuth.paint();
        msg.textContent = 'Welcome. Opening your record…'; msg.classList.add('is-ok');
        location.href = 'my-health.html';
      }).catch(function (err) {
        msg.textContent = String(err.message || err); msg.classList.add('is-err');
        submit.disabled = false; setMode(mode);
      });
    });
  }

  /* ----------------------------- TRIAGE PAGE ------------------------------ */
  var tForm = document.getElementById('triageForm');
  if (tForm && window.HGTriage) {
    tForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var sym = cks('sym'), com = cks('com');
      var raw = {
        age: val('f-age'), sex: val('f-sex'), pregnancy: ck('f-pregnancy') ? 1 : 0,
        hr: val('f-hr'), sbp: val('f-sbp'), dbp: val('f-dbp'), rr: val('f-rr'),
        temp_c: val('f-temp'), spo2: val('f-spo2'), gcs: val('f-gcs'), pain: val('f-pain'),
        onset_hours: val('f-onset'), followup_flag: ck('f-followup') ? 1 : 0
      };
      Object.keys(sym).forEach(function (k) { raw[k] = sym[k]; });
      Object.keys(com).forEach(function (k) { raw[k] = com[k]; });
      var res = window.HGTriage.run(raw);
      render(res, raw);
    });
  }

  function render(res, raw) {
    var wrap = document.getElementById('triageResult');
    var card = document.getElementById('resultCard');
    var bars = res.probList.map(function (p, i) {
      return '<div class="conf-row"><div class="conf-head"><span>T' + i + ' — ' + window.HGTriage.MEANING[i] + '</span><span class="conf-v">' + (p * 100).toFixed(1) + '%</span></div>' +
        '<div class="conf-track"><div class="conf-fill" style="width:' + (p * 100).toFixed(1) + '%"></div></div></div>';
    }).join('');
    var codes = res.reasonCodes.map(function (c) {
      return '<span class="pill pill-code">' + esc(c.replace(/_/g, ' ').toLowerCase()) + '</span>';
    }).join('');
    card.innerHTML =
      '<div class="res-top">' +
      '<div class="res-badge pill-t' + res.triageClass + '">' + esc(res.label) + '</div>' +
      '<div><h3 class="res-class">' + esc(res.meaning) + '</h3>' +
      '<p class="res-sub">Urgency class · confidence ' + (res.confidence * 100).toFixed(1) + '%</p></div></div>' +
      (res.triageClass === 0 ? '<p class="note note-warn">Call your local emergency number NOW. This is an emergency-level picture — go to the nearest emergency department immediately.</p>' : '') +
      (res.requiresHumanReview ? '<p class="note note-warn">requires_human_review — the model and the rules disagree or the picture is unclear. A clinician should look at this before any queue decision.</p>' : '') +
      '<div class="conf">' + bars + '</div>' +
      '<div class="res-grid">' +
      '<div><p class="res-k">Reason codes</p><div class="pill-row">' + codes + '</div></div>' +
      '<div><p class="res-k">Risk ratio (urgent vs baseline)</p><p class="res-v">' + res.riskRatio + '× <span class="pill">' + esc(res.riskTier.replace('_', ' ')) + '</span></p></div>' +
      '</div>' +
      '<p class="res-meta">model ' + esc(res.modelVersion) + ' · rules ' + esc(res.ruleVersion) + '</p>' +
      '<p class="auth-note">' + esc(res.disclaimer) + '</p>' +
      '<div class="triage-actions"><button class="btn btn-primary" id="saveBtn" type="button">Save to my record</button>' +
      '<a class="btn btn-ghost" href="triage.html">New check</a><span class="auth-msg" id="saveMsg" role="status"></span></div>';
    wrap.hidden = false;
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('saveBtn').addEventListener('click', function () {
      var payload = Object.assign({}, res, { input: raw, at: new Date().toISOString() });
      try {
        var log = JSON.parse(localStorage.getItem('hg:triage-log') || '[]');
        log.unshift(payload); localStorage.setItem('hg:triage-log', JSON.stringify(log.slice(0, 50)));
      } catch (e) {}
      var m = document.getElementById('saveMsg');
      if (window.HGAuth.session()) {
        window.HGAuth.insertTriage(payload).then(function () {
          m.textContent = 'Saved to your private record.'; m.className = 'auth-msg is-ok';
        }).catch(function (err) {
          m.textContent = 'Kept on this device (cloud save failed: ' + esc(err.message || err) + ')'; m.className = 'auth-msg is-err';
        });
      } else {
        m.innerHTML = 'Kept on this device. <a href="login.html">Sign in</a> to keep it in your private record.';
      }
    });
  }

  /* --------------------------- MY HEALTH PAGE ----------------------------- */
  var mhList = document.getElementById('mhList');
  if (mhList) {
    function rowHTML(ev) {
      var p = ev.payload || ev;
      var when = ev.created_at || p.at || '';
      try { when = new Date(when).toLocaleString(); } catch (e) {}
      var codes = (p.reasonCodes || []).map(function (c) { return '<span class="pill pill-code">' + esc(String(c).replace(/_/g, ' ').toLowerCase()) + '</span>'; }).join('');
      return '<article class="mh-row"><div class="mh-row-top"><span class="res-badge pill-t' + p.triageClass + '">' + esc(p.label || ('T' + p.triageClass)) + '</span>' +
        '<span class="mh-when">' + esc(when) + '</span></div>' +
        '<p class="mh-mean">' + esc(p.meaning || '') + ' · risk ratio ' + esc(String(p.riskRatio)) + '×</p>' +
        '<div class="pill-row">' + codes + '</div></article>';
    }
    function paintList(rows, sourceNote) {
      if (!rows.length) { mhList.innerHTML = '<p class="auth-msg">No saved checks yet — <a href="triage.html">run your first triage check</a>.</p>'; return; }
      mhList.innerHTML = rows.map(rowHTML).join('') + (sourceNote ? '<p class="auth-note">' + esc(sourceNote) + '</p>' : '');
    }
    function loadRecord() {
      var s = window.HGAuth.session();
      var em = document.getElementById('mhEmail');
      if (s && em) em.textContent = (s.user && s.user.email) || s.email || '';
      if (s) {
        window.HGAuth.listTriage().then(function (rows) {
          paintList(rows, 'Stored row-level private in Supabase — only your account can read it.');
        }).catch(function () {
          var log = JSON.parse(localStorage.getItem('hg:triage-log') || '[]');
          paintList(log, 'Cloud read failed — showing this device\'s copy.');
        });
      } else {
        var log = JSON.parse(localStorage.getItem('hg:triage-log') || '[]');
        paintList(log, log.length ? 'Stored on this device only — sign in to keep them in your private record.' : '');
      }
    }
    var so = document.getElementById('mhSignout');
    if (so) so.addEventListener('click', function () {
      window.HGAuth.signOut().then(function () { location.reload(); });
    });
    if (window.HGAuth.session()) loadRecord();
    else document.addEventListener('DOMContentLoaded', loadRecord);
  }
})();
