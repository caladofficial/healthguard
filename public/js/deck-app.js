/* HealthGuard — deck & workspace app (Part J). EVOLVEX IT SOLUTIONS PVT. LTD.
   Per-slug controllers: role decks, token making, booking, prescription
   analysis, reports/opinions, chat, video rooms, admin ops. Assistive only. */
(function () {
  'use strict';
  var A = window.HGAuth;
  if (!A) return;

  var slug = document.body.getAttribute('data-slug') || '';
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function when(ts) { try { return new Date(ts).toLocaleString(); } catch (e) { return String(ts || ''); } }
  function sPill(status) { return '<span class="s-pill s-' + esc(status) + '">' + esc(String(status).replace('_', ' ')) + '</span>'; }
  function tPill(u) {
    var names = ['T0 emergency', 'T1 very urgent', 'T2 priority', 'T3 routine', 'T4 follow-up'];
    return '<span class="s-pill s-' + (u <= 1 ? 'declined' : u === 2 ? 'pending' : 'completed') + '">' + esc(names[u] || ('T' + u)) + '</span>';
  }
  function msg(node, text, ok) { if (node) { node.textContent = text; node.className = 'auth-msg ' + (ok ? 'is-ok' : 'is-err'); } }
  function setHTML(node, html) { if (node && node.innerHTML !== html) node.innerHTML = html; }

  /* gate: signed out → prompt; wrong role → notice */
  function gate(needRole) {
    var s = A.session();
    var g = el('gate');
    var app = el('app');
    if (!s) {
      if (g) g.hidden = false;
      if (app) app.hidden = true;
      return false;
    }
    A.me().then(function (p) {
      if (needRole && p && p.role !== needRole && !(needRole === 'doctor' && p.role === 'admin')) {
        var warn = el('roleWarn');
        if (warn) { warn.hidden = false; warn.textContent = 'This workspace is for ' + needRole + 's. You are signed in as ' + p.role + '. Your own deck: ' + A.roleHome(p.role) + '.'; }
      }
    });
    if (g) g.hidden = true;
    if (app) app.hidden = false;
    return true;
  }

  /* ------------------------------- LOGIN -------------------------------- */
  function initLogin() {
    var form = el('lgForm');
    if (!form) return;
    var mode = 'in', role = 'patient';
    var msgEl = el('lgMsg');
    var roleRow = el('lgRoleRow');
    var nameRow = el('lgNameRow');
    var specRow = el('lgSpecRow');
    function setMode(m) {
      mode = m;
      qa('[data-lg-mode]').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-lg-mode') === m);
        b.setAttribute('aria-selected', b.getAttribute('data-lg-mode') === m);
      });
      el('lgSubmit').textContent = m === 'in' ? 'Sign in' : 'Create account';
      if (roleRow) roleRow.hidden = m !== 'up';
      if (nameRow) nameRow.hidden = m !== 'up';
      if (specRow) specRow.hidden = !(m === 'up' && role === 'doctor');
    }
    qa('[data-lg-mode]').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-lg-mode')); msgEl.textContent = ''; });
    });
    qa('[data-lg-role]').forEach(function (b) {
      b.addEventListener('click', function () {
        role = b.getAttribute('data-lg-role');
        qa('[data-lg-role]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
        if (specRow) specRow.hidden = !(mode === 'up' && role === 'doctor');
      });
    });
    var wantRole = new URLSearchParams(location.search).get('role');
    if (wantRole) {
      var btn = q('[data-lg-role="' + wantRole + '"]');
      if (btn) btn.click();
      setMode('up');
    } else setMode('in');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = el('lgEmail').value.trim(), pass = el('lgPass').value;
      if (!email || pass.length < 8) { msg(msgEl, 'Enter a valid email and a password of at least 8 characters.'); return; }
      var btn = el('lgSubmit');
      btn.disabled = true;
      var p = mode === 'in'
        ? A.signIn(email, pass)
        : A.signUp(email, pass, { role: role, name: el('lgName').value.trim(), specialty: el('lgSpecialty').value.trim() });
      p.then(function (prof) {
        A.paint();
        var r = (prof && prof.role) || role;
        msg(msgEl, 'Welcome. Opening your deck…', true);
        location.href = A.roleHome(r);
      }).catch(function (err) {
        msg(msgEl, String(err.message || err));
        btn.disabled = false;
      });
    });
  }

  /* ------------------------------ HOME BAND ------------------------------ */
  function initHome() {
    var main = el('main') || document.body;
    var sec = document.createElement('section');
    sec.className = 'section';
    sec.innerHTML = '<div class="wrap"><p class="eyebrow">Choose your door</p>' +
      '<h2 class="h-sec">Sign in — patients, doctors, admins</h2>' +
      '<p class="sec-lead">One login, three working decks: care at home, the clinic desk, and live operations.</p>' +
      '<div class="role-band" id="roleBand"></div></div>';
    var hero = main.querySelector('.hero');
    if (hero && hero.parentNode) hero.parentNode.insertBefore(sec, hero.nextSibling);
    else main.appendChild(sec);
    var mount = el('roleBand');
    var s = A.session();
    A.me().then(function (p) {
      var cards = [
        { role: 'patient', ico: '🩺', t: 'Patient', d: 'Triage check, queue token, appointment booking, prescription analysis, ask a doctor.', href: 'login.html?role=patient' },
        { role: 'doctor', ico: '👨‍⚕️', t: 'Doctor', d: 'Accept bookings, day token board, chat with patients, review reports, video consults.', href: 'login.html?role=doctor' },
        { role: 'admin', ico: '📊', t: 'Admin', d: 'Live operations: who is active, bookings lifecycle, queue load, open opinions.', href: 'login.html?role=admin' }
      ];
      if (s && p) cards = cards.map(function (c) { if (c.role === p.role) c.href = A.roleHome(p.role); return c; });
      mount.innerHTML = cards.map(function (c) {
        return '<a class="role-card" href="' + c.href + '"><span class="role-ico">' + c.ico + '</span><h3>' + c.t + '</h3><p>' + c.d + '</p>' +
          '<span class="card-link">' + (s && p && c.role === p.role ? 'Open my deck →' : 'Sign in as ' + c.t + ' →') + '</span></a>';
      }).join('');
    });
  }

  /* ----------------------------- PATIENT DECK ---------------------------- */
  function initPatientDeck() {
    if (!gate('patient')) return;
    var s = A.session();
    A.heartbeat();
    Promise.all([
      A.select('tokens', { user_id: 'eq.' + s.user.id, day: 'eq.' + today(), order: 'created_at.desc' }),
      A.select('bookings', { patient_id: 'eq.' + s.user.id, order: 'slot_date.desc,slot_time.desc', limit: 5 }),
      A.select('opinion_requests', { patient_id: 'eq.' + s.user.id, order: 'created_at.desc', limit: 5 }),
      A.select('triage_events', { select: 'payload,created_at', order: 'created_at.desc', limit: 1 })
    ]).then(function (r) {
      var tokens = r[0], bookings = r[1], opins = r[2], tri = r[3];
      var next = bookings.filter(function (b) { return b.status === 'accepted' || b.status === 'pending'; })[0];
      el('pdStats').innerHTML =
        kv(todayTokens(tokens), 'Token today', tokens.length ? ('latest T' + tokens[0].token_no + ' · ' + tokens[0].status) : 'none yet') +
        kv(bookings.filter(function (b) { return b.status === 'pending' || b.status === 'accepted'; }).length, 'Active bookings', next ? (next.slot_date + ' ' + next.slot_time + ' · ' + next.status) : 'none') +
        kv(opins.filter(function (o) { return o.status === 'open'; }).length, 'Awaiting opinion', opins.length ? opins[0].kind + ' · ' + opins[0].status : 'none') +
        kv(tri.length ? ('T' + tri[0].payload.triageClass) : '—', 'Last triage', tri.length ? when(tri[0].created_at) : 'run your first check');
      el('pdNext').innerHTML = next
        ? boardRow({ t: esc(next.doctor_name) + ' · ' + esc(next.slot_date) + ' at ' + esc(next.slot_time), s: esc(next.reason || '') + ' · ' + esc(next.mode), acts: (next.status === 'accepted' ? '<a class="btn btn-primary btn-sm" href="video.html">Join video</a>' : '') + '<a class="btn btn-ghost btn-sm" href="book.html">My bookings</a>' + sPill(next.status) })
        : '<p class="auth-msg">No upcoming booking — <a href="book.html">book an appointment</a>.</p>';
      el('pdRecent').innerHTML = (bookings.length || opins.length)
        ? bookings.slice(0, 3).map(function (b) {
            return boardRow({ t: 'Booking · ' + esc(b.doctor_name), s: esc(b.slot_date) + ' ' + esc(b.slot_time) + ' · ' + esc(b.reason || ''), acts: sPill(b.status) });
          }).join('') + opins.slice(0, 2).map(function (o) {
            return boardRow({ t: esc(o.kind) + ' · ' + esc(o.title || ''), s: 'to ' + esc(o.doctor_name) + ' · ' + when(o.created_at), acts: sPill(o.status) });
          }).join('')
        : '<p class="auth-msg">Nothing yet — your activity will appear here.</p>';
    }).catch(function (e) { el('pdStats').innerHTML = '<p class="auth-msg is-err">' + esc(e.message || e) + '</p>'; });
  }
  function todayTokens(list) { return list.filter(function (t) { return t.status !== 'cancelled'; }).length; }
  function kv(n, l, sub) { return '<div class="kv"><span class="kv-n">' + esc(String(n)) + '</span><span class="kv-l">' + esc(l) + '</span>' + (sub ? '<span class="kv-sub">' + esc(sub) + '</span>' : '') + '</div>'; }
  function boardRow(o) {
    return '<div class="board-row' + (o.urgent ? ' is-urgent' : '') + '"><div class="br-main"><span class="br-t">' + (o.no ? '<span class="tok-no">' + esc(o.no) + '</span> ' : '') + (o.t || '') + '</span>' +
      (o.s ? '<span class="br-s">' + o.s + '</span>' : '') + '</div><div class="br-acts">' + (o.acts || '') + '</div></div>';
  }

  /* ------------------------------- TOKENS -------------------------------- */
  function initToken() {
    if (!gate('patient')) return;
    var s = A.session();
    var form = el('tokForm');
    A.me().then(function (p) { if (p && el('tokName') && !el('tokName').value) el('tokName').value = p.full_name || ''; });
    // default urgency from last triage
    try {
      var lg = JSON.parse(localStorage.getItem('hg:triage-log') || '[]');
      if (lg.length && el('tokUrgency')) el('tokUrgency').value = String(lg[0].triageClass);
    } catch (e) {}
    function refresh() {
      A.select('tokens', { user_id: 'eq.' + s.user.id, order: 'created_at.desc', limit: 10 }).then(function (rows) {
        el('tokMine').innerHTML = rows.length ? rows.map(function (t) {
          return boardRow({ no: '#' + t.token_no, t: esc(t.patient_name) + ' · day ' + esc(t.day), s: esc(t.note || '') + ' · ' + when(t.created_at), acts: tPill(t.urgency) + sPill(t.status) });
        }).join('') : '<p class="auth-msg">No tokens yet.</p>';
      });
      A.select('tokens', { day: 'eq.' + today(), status: 'neq.cancelled', order: 'urgency.asc,token_no.asc', limit: 8 }).then(function (rows) {
        el('tokBoard').innerHTML = rows.length ? rows.map(function (t) {
          return boardRow({ no: '#' + t.token_no, t: esc(t.patient_name), s: 'urgency T' + t.urgency + ' · ' + esc(t.status), urgent: t.urgency <= 1, acts: sPill(t.status) });
        }).join('') : '<p class="auth-msg">Queue is empty right now.</p>';
      });
    }
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = el('tokMsg');
      A.select('tokens', { day: 'eq.' + today(), select: 'token_no', order: 'token_no.desc', limit: 1 }).then(function (rows) {
        var next = (rows[0] && rows[0].token_no ? rows[0].token_no : 0) + 1;
        return A.insert('tokens', {
          user_id: s.user.id,
          patient_name: el('tokName').value.trim() || 'Patient',
          day: today(),
          token_no: next,
          urgency: parseInt(el('tokUrgency').value, 10) || 3,
          note: el('tokNote').value.trim()
        });
      }).then(function (row) {
        msg(m, 'Token issued — please be near the clinic at your turn.', true);
        el('tokTicket').hidden = false;
        el('tokTicket').innerHTML = '<div class="ticket"><span class="tok-no">#' + row.token_no + '</span><div class="ticket-meta"><b>' + esc(row.patient_name) + '</b>' +
          '<span>' + esc(row.day) + ' · urgency T' + row.urgency + '</span><span>' + sPill(row.status) + '</span></div></div>';
        refresh();
      }).catch(function (err) { msg(m, String(err.message || err)); });
    });
    refresh();
  }

  /* ------------------------------- BOOKING ------------------------------- */
  var SLOTS = (function () { var out = []; for (var h = 9; h < 17; h++) { out.push(String(h).padStart(2, '0') + ':00'); out.push(String(h).padStart(2, '0') + ':30'); } return out; })();
  function initBook() {
    if (!gate('patient')) return;
    var s = A.session();
    var chosen = '';
    var form = el('bkForm');
    A.me().then(function (p) { if (p && el('bkName')) el('bkName').value = p.full_name || ''; });
    A.select('profiles', { role: 'eq.doctor', order: 'full_name.asc' }).then(function (docs) {
      el('bkDoctor').innerHTML = docs.map(function (d) {
        return '<option value="' + esc(d.user_id) + '">' + esc(d.full_name || 'Doctor') + (d.specialty ? ' — ' + esc(d.specialty) : '') + '</option>';
      }).join('') || '<option value="">No doctors registered yet</option>';
    });
    var dateIn = el('bkDate');
    dateIn.value = today();
    dateIn.min = today();
    function paintSlots() {
      var docId = el('bkDoctor').value, date = dateIn.value;
      if (!docId || !date) return;
      A.select('bookings', { doctor_id: 'eq.' + docId, slot_date: 'eq.' + date, status: 'in.(pending,accepted)', select: 'slot_time' }).then(function (rows) {
        var taken = {};
        rows.forEach(function (r) { taken[r.slot_time] = true; });
        el('bkSlots').innerHTML = SLOTS.map(function (t) {
          return '<button type="button" class="slot' + (chosen === t ? ' is-on' : '') + '" data-slot="' + t + '"' + (taken[t] ? ' disabled title="taken"' : '') + '>' + t + '</button>';
        }).join('');
        qa('[data-slot]', el('bkSlots')).forEach(function (b) {
          b.addEventListener('click', function () {
            chosen = b.getAttribute('data-slot');
            qa('[data-slot]', el('bkSlots')).forEach(function (x) { x.classList.toggle('is-on', x === b); });
          });
        });
      });
    }
    el('bkDoctor').addEventListener('change', paintSlots);
    dateIn.addEventListener('change', paintSlots);
    paintSlots();
    function refreshMine() {
      A.select('bookings', { patient_id: 'eq.' + s.user.id, order: 'created_at.desc', limit: 12 }).then(function (rows) {
        el('bkMine').innerHTML = rows.length ? rows.map(function (b) {
          var acts = sPill(b.status);
          if (b.status === 'accepted' && b.mode === 'video') acts += ' <a class="btn btn-primary btn-sm" href="video.html">Join video</a>';
          if (b.status === 'accepted' || b.status === 'pending') acts += ' <button class="btn btn-ghost btn-sm" data-cancel="' + b.id + '">Cancel</button>';
          return boardRow({ t: esc(b.doctor_name) + ' · ' + esc(b.slot_date) + ' ' + esc(b.slot_time), s: esc(b.reason || '') + ' · ' + esc(b.mode) + ' · requested ' + when(b.created_at), acts: acts });
        }).join('') : '<p class="auth-msg">No bookings yet.</p>';
        qa('[data-cancel]', el('bkMine')).forEach(function (b) {
          b.addEventListener('click', function () {
            A.update('bookings', { id: 'eq.' + b.getAttribute('data-cancel') }, { status: 'cancelled', updated_at: new Date().toISOString() }).then(refreshMine);
          });
        });
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = el('bkMsg');
      if (!chosen) { msg(m, 'Pick a time slot first.'); return; }
      var docSel = el('bkDoctor');
      A.insert('bookings', {
        patient_id: s.user.id,
        doctor_id: docSel.value,
        patient_name: el('bkName').value.trim() || 'Patient',
        doctor_name: (docSel.selectedOptions[0] || {}).textContent || 'Doctor',
        slot_date: dateIn.value,
        slot_time: chosen,
        reason: el('bkReason').value.trim(),
        mode: el('bkMode').value
      }).then(function () {
        msg(m, 'Request sent — the doctor will confirm. Watch My Bookings.', true);
        chosen = '';
        paintSlots();
        refreshMine();
      }).catch(function (err) {
        msg(m, String(err.message || err).indexOf('duplicate') >= 0 ? 'That slot was just taken — pick another.' : String(err.message || err));
      });
    });
    refreshMine();
  }

  /* --------------------------- PRESCRIPTION ------------------------------ */
  var INTERACTIONS = [
    { pair: ['warfarin', 'aspirin'], w: 'bleeding risk — confirm with your doctor before taking both' },
    { pair: ['warfarin', 'ibuprofen'], w: 'bleeding risk — NSAIDs raise it further' },
    { pair: ['aspirin', 'ibuprofen'], w: 'ibuprofen can blunt aspirin heart protection + upset stomach' },
    { pair: ['metformin', 'contrast'], w: 'if a contrast CT scan is planned, tell the imaging team' },
    { pair: ['sildenafil', 'nitroglycerin'], w: 'NEVER combine — dangerous blood-pressure drop. Emergency advice.' },
    { pair: ['lisinopril', 'potassium'], w: 'potassium can climb too high — monitoring needed' },
    { pair: ['atorvastatin', 'clarithromycin'], w: 'interaction raising statin levels — ask your doctor' },
    { pair: ['omeprazole', 'clopidogrel'], w: 'omeprazole can weaken clopidogrel effect' },
    { pair: ['sertraline', 'tramadol'], w: 'serotonin-syndrome risk — report agitation/sweating/confusion' }
  ];
  function analyzeRx(text) {
    var lines = text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var meds = [], flags = [], qs = [];
    lines.forEach(function (line) {
      var parts = line.split(/[\s,;·]+/).filter(Boolean);
      var name = (parts[0] || '').toLowerCase().replace(/[^a-z-]/g, '');
      var dose = line.match(/\d+\s?(mg|mcg|ml|g|iu|units?)/i);
      var freq = line.match(/\b(once|twice|thrice|three times|two times|daily|bd|tds|od|hs|sos|prn|every \d+ ?h)\b/i);
      meds.push({ name: name, dose: dose ? dose[0] : '', freq: freq ? freq[0] : '', line: line });
      if (!dose) flags.push({ t: 'Missing dose in: “' + line + '”', lvl: 'flag' });
      if (!freq) flags.push({ t: 'Missing how-often in: “' + line + '”', lvl: 'flag' });
    });
    var names = meds.map(function (m) { return m.name; });
    for (var i = 0; i < names.length; i++) {
      for (var j = i + 1; j < names.length; j++) {
        if (names[i] && names[i] === names[j]) flags.push({ t: 'Duplicate medicine listed twice: ' + names[i], lvl: 'flag' });
      }
    }
    INTERACTIONS.forEach(function (it) {
      var has = function (x) { return names.some(function (n) { return n.indexOf(x) >= 0; }); };
      if (has(it.pair[0]) && has(it.pair[1])) flags.push({ t: it.pair[0] + ' + ' + it.pair[1] + ': ' + it.w, lvl: 'flag' });
    });
    qs.push('What is each medicine for, and for how long should I take it?');
    qs.push('Should I take them with food or at a particular time of day?');
    if (!flags.length) qs.push('Are there foods, alcohol or over-the-counter painkillers I should avoid with these?');
    if (meds.length > 3) qs.push('Can any of these be stopped, combined, or reduced?');
    return { meds: meds, flags: flags, questions: qs };
  }
  function initRx() {
    if (!gate('patient')) return;
    var s = A.session();
    var res = null;
    el('rxRun').addEventListener('click', function () {
      var text = el('rxText').value.trim();
      var out = el('rxOut');
      if (!text) { msg(el('rxMsg'), 'Paste or type your prescription first.'); return; }
      res = analyzeRx(text);
      out.hidden = false;
      out.innerHTML =
        '<div class="an-block"><h4>Structure check — ' + res.meds.length + ' medicine(s)</h4><ul>' +
        res.meds.map(function (m) { return '<li>' + esc(m.line) + ' → ' + (m.dose ? esc(m.dose) : 'dose?') + ' · ' + (m.freq ? esc(m.freq) : 'frequency?') + '</li>'; }).join('') + '</ul></div>' +
        '<div class="an-block sect-gap"><h4>Flags to discuss with your doctor</h4><ul>' +
        (res.flags.length ? res.flags.map(function (f) { return '<li class="flag">' + esc(f.t) + '</li>'; }).join('') : '<li>No structural gaps or known pair-flags found. This is not a safety guarantee.</li>') + '</ul></div>' +
        '<div class="an-block sect-gap"><h4>Questions you can ask</h4><ul>' +
        res.questions.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<p class="auth-note">Assistive reading aid only — it does not check your dose against your body, and it is not a pharmacist. Never change doses based on this screen.</p>' +
        '<div class="triage-actions sect-gap"><button class="btn btn-primary" id="rxSend" type="button">Send to a doctor for opinion</button></div>';
      el('rxSend').addEventListener('click', function () { el('rxSendBox').hidden = false; el('rxSendBox').scrollIntoView({ behavior: 'smooth' }); });
      el('rxSendBox').hidden = true;
    });
    A.select('profiles', { role: 'eq.doctor', order: 'full_name.asc' }).then(function (docs) {
      var sel = el('rxDoctor');
      if (sel) sel.innerHTML = docs.map(function (d) {
        return '<option value="' + esc(d.user_id) + '">' + esc(d.full_name || 'Doctor') + (d.specialty ? ' — ' + esc(d.specialty) : '') + '</option>';
      }).join('') || '<option value="">No doctors registered yet</option>';
    });
    el('rxSendForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var m = el('rxSendMsg');
      var docSel = el('rxDoctor');
      A.me().then(function (p) {
        return A.insert('opinion_requests', {
          patient_id: s.user.id,
          patient_name: (p && p.full_name) || 'Patient',
          doctor_id: docSel.value,
          doctor_name: (docSel.selectedOptions[0] || {}).textContent || 'Doctor',
          kind: 'prescription',
          title: el('rxTitle').value.trim() || 'Prescription review',
          content: { text: el('rxText').value.trim(), analysis: res, triage: lastTriage() }
        });
      }).then(function () {
        msg(m, 'Sent to the doctor — you will see the opinion in My Health and Ask a Doctor.', true);
      }).catch(function (err) { msg(m, String(err.message || err)); });
    });
  }
  function lastTriage() {
    try {
      var lg = JSON.parse(localStorage.getItem('hg:triage-log') || '[]');
      return lg.length ? { label: lg[0].label, meaning: lg[0].meaning, riskRatio: lg[0].riskRatio, at: lg[0].at } : null;
    } catch (e) { return null; }
  }

  /* --------------------------- ASK A DOCTOR ------------------------------ */
  function compressPhoto(file, cb) {
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var max = 800, s = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement('canvas');
      c.width = Math.max(1, img.width * s | 0); c.height = Math.max(1, img.height * s | 0);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      cb(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = function () { cb(''); };
    img.src = url;
  }
  function initAsk() {
    if (!gate('patient')) return;
    var s = A.session();
    var photoData = '';
    var fileIn = el('adPhoto');
    if (fileIn) fileIn.addEventListener('change', function () {
      if (fileIn.files && fileIn.files[0]) compressPhoto(fileIn.files[0], function (d) {
        photoData = d;
        var pv = el('adPhotoPrev');
        if (pv) { pv.src = d; pv.hidden = !d; }
      });
    });
    A.select('profiles', { role: 'eq.doctor', order: 'full_name.asc' }).then(function (docs) {
      el('adDoctor').innerHTML = docs.map(function (d) {
        return '<option value="' + esc(d.user_id) + '">' + esc(d.full_name || 'Doctor') + (d.specialty ? ' — ' + esc(d.specialty) : '') + '</option>';
      }).join('') || '<option value="">No doctors registered yet</option>';
    });
    function refreshReqs() {
      A.select('opinion_requests', { patient_id: 'eq.' + s.user.id, order: 'created_at.desc', limit: 20 }).then(function (rows) {
        el('adList').innerHTML = rows.length ? rows.map(function (o) {
          var c = o.content || {};
          return boardRow({
            t: esc(o.kind) + ' · ' + esc(o.title || 'untitled'),
            s: 'to ' + esc(o.doctor_name) + ' · ' + when(o.created_at) +
              (c.photo_dataurl ? ' · 📷' : '') +
              (o.doctor_note ? '<br><b>Opinion:</b> ' + esc(o.doctor_note) : ''),
            acts: sPill(o.status)
          });
        }).join('') : '<p class="auth-msg">No requests yet — send a report or prescription above.</p>';
      });
    }
    el('adForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var m = el('adMsg');
      var docSel = el('adDoctor');
      A.me().then(function (p) {
        return A.insert('opinion_requests', {
          patient_id: s.user.id,
          patient_name: (p && p.full_name) || 'Patient',
          doctor_id: docSel.value,
          doctor_name: (docSel.selectedOptions[0] || {}).textContent || 'Doctor',
          kind: el('adKind').value,
          title: el('adTitle').value.trim() || 'Report for opinion',
          content: { text: el('adText').value.trim(), photo_dataurl: photoData, triage: lastTriage() }
        });
      }).then(function () {
        msg(m, 'Sent — the doctor will review and reply.', true);
        el('adForm').reset();
        photoData = ''; el('adPhotoPrev').hidden = true;
        refreshReqs();
      }).catch(function (err) { msg(m, String(err.message || err)); });
    });
    refreshReqs();
    initChat('adChat', 'adChatPick');
  }

  /* chat (shared patient/doctor) */
  function initChat(logId, pickId) {
    var log = el(logId), pick = el(pickId);
    if (!log || !pick) return;
    var s = A.session();
    var prof = null;
    var cur = null, timer = null;
    A.me().then(function (p) {
      prof = p;
      var isDoc = p && p.role === 'doctor';
      return A.select('bookings', isDoc
        ? { doctor_id: 'eq.' + s.user.id, status: 'in.(accepted,completed)', order: 'slot_date.desc,slot_time.desc' }
        : { patient_id: 'eq.' + s.user.id, status: 'in.(accepted,completed)', order: 'slot_date.desc,slot_time.desc' });
    }).then(function (rows) {
      pick.innerHTML = rows.map(function (b) {
        var other = (prof && prof.role === 'doctor') ? b.patient_name : b.doctor_name;
        return '<option value="' + esc(b.id) + '">' + esc(other) + ' · ' + esc(b.slot_date) + ' ' + esc(b.slot_time) + '</option>';
      }).join('') || '<option value="">No accepted bookings yet</option>';
      if (rows.length) { pick.value = rows[0].id; load(); }
      else log.innerHTML = '<p class="auth-msg">Chat unlocks when a booking is accepted.</p>';
      pick.addEventListener('change', load);
    });
    function load() {
      cur = pick.value;
      if (!cur) return;
      if (timer) clearInterval(timer);
      pull();
      timer = setInterval(pull, 4000);
    }
    function pull() {
      if (!cur) return;
      A.select('chat_messages', { booking_id: 'eq.' + cur, order: 'created_at.asc', limit: 200 }).then(function (rows) {
        var atBottom = log.scrollTop + log.clientHeight > log.scrollHeight - 40;
        var html = rows.map(function (r) {
          var mine = r.sender_id === s.user.id;
          return '<div class="bub ' + (mine ? 'me' : 'them') + '">' + esc(r.body) + '<span class="b-when">' + esc((r.sender_name || '') + ' · ' + when(r.created_at)) + '</span></div>';
        }).join('') || '<p class="auth-msg">Say hello.</p>';
        if (log.innerHTML !== html) log.innerHTML = html;
        if (atBottom) log.scrollTop = log.scrollHeight;
      });
    }
    var form = el(logId + 'Form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = el(logId + 'Input');
      var body = input.value.trim();
      if (!body || !cur) return;
      A.insert('chat_messages', {
        booking_id: cur, sender_id: s.user.id,
        sender_name: (prof && prof.full_name) || 'User', body: body
      }).then(function () { input.value = ''; pull(); });
    });
    window.addEventListener('beforeunload', function () { if (timer) clearInterval(timer); });
  }

  /* ------------------------------- VIDEO --------------------------------- */
  function initVideo() {
    if (!gate(null)) return;
    var s = A.session();
    var pick = el('vdPick');
    A.me().then(function (p) {
      var isDoc = p && (p.role === 'doctor' || p.role === 'admin');
      return A.select('bookings', isDoc && p.role === 'doctor'
        ? { doctor_id: 'eq.' + s.user.id, status: 'in.(accepted,completed)' }
        : { patient_id: 'eq.' + s.user.id, status: 'in.(accepted,completed)' });
    }).then(function (rows) {
      var vids = rows.filter(function (b) { return b.mode === 'video'; });
      pick.innerHTML = vids.map(function (b) {
        return '<option value="' + esc(b.id) + '">' + esc(b.slot_date) + ' ' + esc(b.slot_time) + ' · ' + esc(b.patient_id === s.user.id ? b.doctor_name : b.patient_name) + '</option>';
      }).join('') || '<option value="">No accepted video bookings yet</option>';
      if (vids.length) { pick.value = vids[0].id; join(); }
      else el('vdHint').textContent = 'Book a video appointment and wait for the doctor to accept — the room opens here.';
      pick.addEventListener('change', join);
    });
    function join() {
      var id = pick.value;
      if (!id) return;
      var room = 'healthguard-' + id.replace(/-/g, '');
      el('vdFrame').src = 'https://meet.jit.si/' + room + '#config.prejoinPageEnabled=false&config.requireDisplayName=true';
      el('vdStage').hidden = false;
      el('vdLink').textContent = location.origin + '/video.html';
    }
    el('vdCopy') && el('vdCopy').addEventListener('click', function () {
      var room = 'healthguard-' + (pick.value || '').replace(/-/g, '');
      var link = 'https://meet.jit.si/' + room;
      (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () {
        el('vdHint').textContent = 'Room link copied — share it with the other side if needed.';
      }).catch(function () { el('vdHint').textContent = link; });
    });
  }

  /* ---------------------------- MY HEALTH extras -------------------------- */
  function initMyHealth() {
    if (!A.session()) return;
    var s = A.session();
    A.heartbeat();
    A.select('tokens', { user_id: 'eq.' + s.user.id, order: 'created_at.desc', limit: 10 }).then(function (rows) {
      var n = el('mhTokens'); if (!n) return;
      n.innerHTML = rows.length ? rows.map(function (t) {
        return boardRow({ no: '#' + t.token_no, t: esc(t.day), s: esc(t.note || ''), acts: tPill(t.urgency) + sPill(t.status) });
      }).join('') : '<p class="auth-msg">No tokens yet — <a href="token.html">get today\'s token</a>.</p>';
    });
    A.select('bookings', { patient_id: 'eq.' + s.user.id, order: 'created_at.desc', limit: 10 }).then(function (rows) {
      var n = el('mhBookings'); if (!n) return;
      n.innerHTML = rows.length ? rows.map(function (b) {
        return boardRow({ t: esc(b.doctor_name), s: esc(b.slot_date) + ' ' + esc(b.slot_time) + ' · ' + esc(b.reason || ''), acts: sPill(b.status) });
      }).join('') : '<p class="auth-msg">No bookings — <a href="book.html">book an appointment</a>.</p>';
    });
    A.select('opinion_requests', { patient_id: 'eq.' + s.user.id, order: 'created_at.desc', limit: 10 }).then(function (rows) {
      var n = el('mhOpinions'); if (!n) return;
      n.innerHTML = rows.length ? rows.map(function (o) {
        return boardRow({ t: esc(o.kind) + ' · ' + esc(o.title || ''), s: (o.doctor_note ? '<b>Opinion:</b> ' + esc(o.doctor_note) : 'awaiting reply') , acts: sPill(o.status) });
      }).join('') : '<p class="auth-msg">Nothing sent for an opinion yet — <a href="ask-doctor.html">ask a doctor</a>.</p>';
    });
  }

  /* ----------------------------- DOCTOR DECK ------------------------------ */
  function initDoctorDeck() {
    if (!gate('doctor')) return;
    var s = A.session();
    A.heartbeat();
    Promise.all([
      A.select('bookings', { doctor_id: 'eq.' + s.user.id, status: 'eq.pending', order: 'created_at.asc' }),
      A.select('tokens', { day: 'eq.' + today(), status: 'in.(waiting,in_consult)', order: 'urgency.asc,token_no.asc' }),
      A.select('opinion_requests', { doctor_id: 'eq.' + s.user.id, status: 'eq.open', order: 'created_at.asc' }),
      A.select('bookings', { doctor_id: 'eq.' + s.user.id, status: 'in.(accepted,completed)', order: 'slot_date.desc' })
    ]).then(function (r) {
      el('ddStats').innerHTML =
        kv(r[0].length, 'Bookings to accept', r[0].length ? r[0][0].patient_name + ' · ' + r[0][0].slot_date : 'inbox zero') +
        kv(r[1].length, 'Queue today', r[1].length ? 'next #' + r[1][0].token_no : 'queue empty') +
        kv(r[2].length, 'Opinions to write', r[2].length ? r[2][0].kind + ' · ' + r[2][0].patient_name : 'none waiting') +
        kv(r[3].length, 'My consultations', 'accepted + completed');
      el('ddPending').innerHTML = r[0].slice(0, 5).map(function (b) {
        return boardRow({ t: esc(b.patient_name) + ' · ' + esc(b.slot_date) + ' ' + esc(b.slot_time), s: esc(b.reason || ''), urgent: false, acts: sPill(b.status) + ' <a class="btn btn-primary btn-sm" href="doctor-bookings.html">Open</a>' });
      }).join('') || '<p class="auth-msg">No pending requests. 🎉</p>';
      el('ddQueue').innerHTML = r[1].slice(0, 6).map(function (t) {
        return boardRow({ no: '#' + t.token_no, t: esc(t.patient_name), s: 'T' + t.urgency + ' · ' + esc(t.note || ''), urgent: t.urgency <= 1, acts: sPill(t.status) });
      }).join('') || '<p class="auth-msg">Queue is empty.</p>';
      el('ddOpins').innerHTML = r[2].slice(0, 5).map(function (o) {
        return boardRow({ t: esc(o.kind) + ' · ' + esc(o.patient_name), s: esc(o.title || ''), acts: sPill(o.status) + ' <a class="btn btn-primary btn-sm" href="doctor-reports.html">Review</a>' });
      }).join('') || '<p class="auth-msg">No open opinions.</p>';
    }).catch(function (e) { el('ddStats').innerHTML = '<p class="auth-msg is-err">' + esc(e.message || e) + '</p>'; });
  }

  function initDoctorBookings() {
    if (!gate('doctor')) return;
    var s = A.session();
    function refresh() {
      A.select('bookings', { doctor_id: 'eq.' + s.user.id, order: 'slot_date.desc,slot_time.desc', limit: 30 }).then(function (rows) {
        el('dbList').innerHTML = rows.length ? rows.map(function (b) {
          var acts = sPill(b.status);
          if (b.status === 'pending') acts += ' <button class="btn btn-primary btn-sm" data-acc="' + b.id + '">Accept</button>' +
            ' <button class="btn btn-ghost btn-sm" data-dec="' + b.id + '">Decline</button>';
          if (b.status === 'accepted') acts += ' <button class="btn btn-primary btn-sm" data-done="' + b.id + '">Complete</button>' +
            (b.mode === 'video' ? ' <a class="btn btn-ghost btn-sm" href="video.html">Video</a>' : '');
          return boardRow({ t: esc(b.patient_name) + ' · ' + esc(b.slot_date) + ' ' + esc(b.slot_time), s: esc(b.reason || '') + ' · ' + esc(b.mode), acts: acts });
        }).join('') : '<p class="auth-msg">No booking requests yet.</p>';
        qa('[data-acc]', el('dbList')).forEach(function (btn) { btn.addEventListener('click', function () { A.update('bookings', { id: 'eq.' + btn.getAttribute('data-acc') }, { status: 'accepted', updated_at: new Date().toISOString() }).then(refresh); }); });
        qa('[data-dec]', el('dbList')).forEach(function (btn) { btn.addEventListener('click', function () { A.update('bookings', { id: 'eq.' + btn.getAttribute('data-dec') }, { status: 'declined', updated_at: new Date().toISOString() }).then(refresh); }); });
        qa('[data-done]', el('dbList')).forEach(function (btn) { btn.addEventListener('click', function () { A.update('bookings', { id: 'eq.' + btn.getAttribute('data-done') }, { status: 'completed', updated_at: new Date().toISOString() }).then(refresh); }); });
      });
    }
    refresh();
  }

  function initDoctorTokens() {
    if (!gate('doctor')) return;
    function refresh() {
      A.select('tokens', { day: 'eq.' + today(), order: 'urgency.asc,token_no.asc' }).then(function (rows) {
        el('dtBoard').innerHTML = rows.length ? rows.map(function (t) {
          var acts = sPill(t.status);
          if (t.status === 'waiting') acts += ' <button class="btn btn-primary btn-sm" data-tok="' + t.id + '" data-to="in_consult">Call in</button>';
          if (t.status === 'in_consult') acts += ' <button class="btn btn-primary btn-sm" data-tok="' + t.id + '" data-to="done">Done</button>';
          acts += ' <button class="btn btn-ghost btn-sm" data-tok="' + t.id + '" data-to="cancelled">Remove</button>';
          return boardRow({ no: '#' + t.token_no, t: esc(t.patient_name), s: 'T' + t.urgency + ' · ' + esc(t.note || '') + ' · ' + when(t.created_at), urgent: t.urgency <= 1, acts: acts });
        }).join('') : '<p class="auth-msg">No tokens issued today.</p>';
        qa('[data-tok]', el('dtBoard')).forEach(function (b) {
          b.addEventListener('click', function () {
            A.update('tokens', { id: 'eq.' + b.getAttribute('data-tok') }, { status: b.getAttribute('data-to') }).then(refresh);
          });
        });
      });
    }
    refresh();
  }

  function initDoctorChat() { if (gate('doctor')) initChat('dcChat', 'dcChatPick'); }

  function initDoctorReports() {
    if (!gate('doctor')) return;
    var s = A.session();
    var open = null;
    function refresh() {
      A.select('opinion_requests', { doctor_id: 'eq.' + s.user.id, order: 'created_at.desc', limit: 30 }).then(function (rows) {
        el('drList').innerHTML = rows.length ? rows.map(function (o) {
          return boardRow({
            t: esc(o.kind) + ' · ' + esc(o.patient_name) + ' · ' + esc(o.title || ''),
            s: when(o.created_at),
            acts: sPill(o.status) + (o.status === 'open' ? ' <button class="btn btn-primary btn-sm" data-open="' + o.id + '">Open & answer</button>' : '')
          });
        }).join('') : '<p class="auth-msg">No opinion requests.</p>';
        qa('[data-open]', el('drList')).forEach(function (b) {
          b.addEventListener('click', function () {
            open = rows.filter(function (x) { return x.id === b.getAttribute('data-open'); })[0];
            var c = open.content || {};
            el('drDetail').hidden = false;
            el('drDetailBody').innerHTML =
              '<p class="auth-msg"><b>' + esc(open.patient_name) + '</b> · ' + esc(open.kind) + ' · ' + when(open.created_at) + '</p>' +
              '<div class="an-block sect-gap"><h4>' + esc(open.title || '') + '</h4><p>' + esc(c.text || '') + '</p>' +
              (c.triage ? '<p class="auth-note">Attached triage: ' + esc(c.triage.label + ' — ' + (c.triage.meaning || '')) + ' · risk ratio ' + esc(String(c.triage.riskRatio || '')) + '×</p>' : '') +
              (c.analysis ? '<h4 class="sect-gap">Patient\'s self-check</h4><ul>' + (c.analysis.flags || []).map(function (f) { return '<li class="flag">' + esc(f.t) + '</li>'; }).join('') + '</ul>' : '') +
              (c.photo_dataurl ? '<img class="photo-prev" src="' + c.photo_dataurl + '" alt="patient photo">' : '') + '</div>';
            el('drDetail').scrollIntoView({ behavior: 'smooth' });
          });
        });
      });
    }
    el('drAnswerForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var m = el('drAnswerMsg');
      if (!open) { msg(m, 'Open a request first.'); return; }
      A.update('opinion_requests', { id: 'eq.' + open.id }, {
        doctor_note: el('drNote').value.trim(),
        status: 'answered',
        answered_at: new Date().toISOString()
      }).then(function () {
        msg(m, 'Opinion sent to the patient.', true);
        el('drNote').value = '';
        el('drDetail').hidden = true;
        open = null;
        refresh();
      }).catch(function (err) { msg(m, String(err.message || err)); });
    });
    refresh();
  }

  /* ------------------------------ ADMIN DECK ------------------------------ */
  function initAdminDeck() {
    if (!gate('admin')) return;
    A.heartbeat();
    var since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    function stats() {
      Promise.all([
        A.count('profiles', { role: 'eq.patient' }),
        A.count('profiles', { role: 'eq.doctor' }),
        A.count('profiles', { role: 'eq.patient', last_seen_at: 'gte.' + since }),
        A.count('profiles', { role: 'eq.doctor', last_seen_at: 'gte.' + since }),
        A.count('bookings', { status: 'eq.pending' }),
        A.count('bookings', { status: 'eq.accepted' }),
        A.count('bookings', { status: 'eq.completed' }),
        A.count('bookings', { status: 'in.(declined,cancelled)' }),
        A.count('tokens', { day: 'eq.' + today(), status: 'neq.cancelled' }),
        A.count('tokens', { day: 'eq.' + today(), status: 'eq.in_consult' }),
        A.count('tokens', { day: 'eq.' + today(), urgency: 'lte.1', status: 'neq.cancelled' }),
        A.count('opinion_requests', { status: 'eq.open' })
      ]).then(function (c) {
        var statsHtml =
          kv(c[0], 'Patients registered', c[2] + ' active now (15 min)') +
          kv(c[1], 'Doctors registered', c[3] + ' active now (15 min)') +
          kv(c[4], 'Bookings pending', 'waiting for doctor') +
          kv(c[5], 'Bookings ongoing', 'accepted (in progress)') +
          kv(c[6], 'Bookings completed', 'all time') +
          kv(c[7], 'Declined / cancelled', 'all time') +
          kv(c[8], 'Tokens today', c[10] + ' high-urgency · ' + c[9] + ' in consult') +
          kv(c[11], 'Open opinions', 'awaiting doctor reply');
        setHTML(el('adStats'), statsHtml);
      }).catch(function (e) { el('adStats').innerHTML = '<p class="auth-msg is-err">' + esc(e.message || e) + '</p>'; });
    }
    function boards() {
      A.select('bookings', { order: 'created_at.desc', limit: 12 }).then(function (rows) {
        setHTML(el('adBookings'), rows.map(function (b) {
          return boardRow({ t: esc(b.patient_name) + ' → ' + esc(b.doctor_name), s: esc(b.slot_date) + ' ' + esc(b.slot_time) + ' · ' + esc(b.mode), acts: sPill(b.status) });
        }).join('') || '<p class="auth-msg">No bookings.</p>');
      });
      A.select('tokens', { day: 'eq.' + today(), order: 'urgency.asc,token_no.asc', limit: 12 }).then(function (rows) {
        setHTML(el('adTokens'), rows.map(function (t) {
          return boardRow({ no: '#' + t.token_no, t: esc(t.patient_name), s: 'T' + t.urgency + ' · ' + esc(t.status), urgent: t.urgency <= 1, acts: sPill(t.status) });
        }).join('') || '<p class="auth-msg">No tokens today.</p>');
      });
      A.select('profiles', { order: 'last_seen_at.desc', limit: 12 }).then(function (rows) {
        setHTML(el('adUsers'), rows.map(function (p) {
          return boardRow({ t: esc(p.full_name || p.user_id) + ' · ' + esc(p.role), s: esc(p.specialty || '') + ' · seen ' + when(p.last_seen_at), acts: sPill(p.last_seen_at > since ? 'accepted' : 'completed').replace('accepted', 'active').replace('completed', 'idle') });
        }).join('') || '<p class="auth-msg">No users.</p>');
      });
    }
    stats(); boards();
    setInterval(function () { stats(); boards(); }, 5000);
  }

  /* ------------------------------- router -------------------------------- */
  var routes = {
    'index': initHome,
    'login': initLogin,
    'patient-deck': initPatientDeck,
    'token': initToken,
    'book': initBook,
    'prescription': initRx,
    'ask-doctor': initAsk,
    'video': initVideo,
    'my-health': initMyHealth,
    'doctor-deck': initDoctorDeck,
    'doctor-bookings': initDoctorBookings,
    'doctor-tokens': initDoctorTokens,
    'doctor-chat': initDoctorChat,
    'doctor-reports': initDoctorReports,
    'admin-deck': initAdminDeck
  };
  if (routes[slug]) routes[slug]();
})();
