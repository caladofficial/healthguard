/* HealthGuard — auth + data layer (Supabase REST). EVOLVEX IT SOLUTIONS PVT. LTD.
   Roles: patient | doctor | admin. Every deck/feature page talks to PostgREST
   with the user's JWT; RLS on the server enforces visibility. */
(function () {
  'use strict';
  var SB = 'https://uopivvbgkfxlptgzfdrk.supabase.co';
  var KEY = 'sb_publishable_BnnM3gFD-fI5k-tO4zmSIw_9yShmVRQ';
  var LS = 'hg:session';
  var PROFILE_KEY = 'hg:profile';

  function session() {
    try {
      var s = JSON.parse(localStorage.getItem(LS) || 'null');
      if (s && s.access_token && s.expires_at && s.expires_at * 1000 < Date.now()) { clear(); return null; }
      return s;
    } catch (e) { return null; }
  }
  function save(s) { try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {} }
  function clear() { try { localStorage.removeItem(LS); localStorage.removeItem(PROFILE_KEY); } catch (e) {} }
  function cachedProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) { return null; }
  }
  function cacheProfile(p) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) {} }

  function api(path, opts) {
    opts = opts || {};
    var s = session();
    var headers = { 'apikey': KEY, 'Content-Type': 'application/json' };
    if (opts.auth !== false && s && s.access_token) headers['Authorization'] = 'Bearer ' + s.access_token;
    if (opts.prefer) headers['Prefer'] = opts.prefer;
    var init = { method: opts.method || (opts.body ? 'POST' : 'GET'), headers: headers };
    if (opts.body) init.body = JSON.stringify(opts.body);
    return fetch(SB + path, init).then(function (r) {
      return r.text().then(function (t) {
        var j = null;
        if (t) { try { j = JSON.parse(t); } catch (e) { j = null; } }
        if (!r.ok) throw new Error((j && (j.msg || j.error_description || j.message || j.hint)) || ('HTTP ' + r.status));
        return { body: j, status: r.status, range: r.headers.get('content-range') };
      });
    });
  }

  function qs(params) {
    var out = [];
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null) return;
      out.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    });
    return out.length ? '?' + out.join('&') : '';
  }

  /* ------------------------- auth --------------------------------------- */
  function signIn(email, password) {
    return api('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: { email: email, password: password } })
      .then(function (r) {
        var j = r.body;
        save({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at, user: j.user, email: email });
        return j;
      });
  }

  function signUp(email, password, profile) {
    profile = profile || {};
    return api('/auth/v1/signup', {
      method: 'POST', auth: false,
      body: { email: email, password: password, data: { full_name: profile.name || '' } }
    }).then(function () {
      // auto-confirm trigger makes this grantable immediately
      return signIn(email, password);
    }).then(function () {
      return api('/rest/v1/profiles' + qs({ on_conflict: 'user_id' }), {
        method: 'POST', prefer: 'resolution=merge-duplicates,return=representation',
        body: {
          user_id: session().user.id,
          role: 'patient',
          full_name: profile.name || '',
          age: profile.age || null,
          sex: profile.sex || '',
          last_seen_at: new Date().toISOString()
        }
      });
    }).then(function (r) {
      var row = (r.body && r.body[0]) || null;
      if (row) cacheProfile(row);
      return row;
    });
  }

  function completeProfile(patch) {
    var s = session();
    if (!s) return Promise.reject(new Error('Not signed in.'));
    return api('/rest/v1/profiles' + qs({ user_id: 'eq.' + s.user.id }), {
      method: 'PATCH', prefer: 'return=representation', body: patch
    }).then(function (r) {
      var row = (r.body && r.body[0]) || null;
      if (row) cacheProfile(row);
      return row;
    });
  }

  function rpc(name, params) {
    return api('/rest/v1/rpc/' + name, { method: 'POST', body: params || {} }).then(function (r) { return r.body; });
  }

  function signOut() {
    var s = session();
    if (s) api('/auth/v1/logout', { method: 'POST' }).catch(function () {});
    clear();
  }

  function roleHome(role) {
    return role === 'doctor' ? 'doctor-deck.html' : role === 'admin' ? 'admin-deck.html' : 'patient-deck.html';
  }

  /* profile + presence */
  function me() {
    var s = session();
    if (!s) return Promise.resolve(null);
    var cached = cachedProfile();
    return api('/rest/v1/profiles' + qs({ user_id: 'eq.' + s.user.id, select: '*' })).then(function (r) {
      var row = (r.body && r.body[0]) || null;
      if (row) cacheProfile(row);
      return row || cached;
    }).catch(function () { return cached; });
  }

  var lastBeat = 0;
  function heartbeat() {
    var s = session();
    if (!s) return;
    var now = Date.now();
    if (now - lastBeat < 50000) return;
    lastBeat = now;
    api('/rest/v1/profiles' + qs({ user_id: 'eq.' + s.user.id }), {
      method: 'PATCH', prefer: 'return=minimal',
      body: { last_seen_at: new Date().toISOString() }
    }).catch(function () {});
  }

  /* generic table ops (RLS decides the rest) */
  function select(table, params) {
    return api('/rest/v1/' + table + qs(params)).then(function (r) { return r.body || []; });
  }
  function insert(table, row) {
    return api('/rest/v1/' + table, { method: 'POST', prefer: 'return=representation', body: row })
      .then(function (r) { return (r.body && r.body[0]) || row; });
  }
  function update(table, params, patch) {
    return api('/rest/v1/' + table + qs(params), { method: 'PATCH', prefer: 'return=representation', body: patch })
      .then(function (r) { return r.body || []; });
  }
  function count(table, params) {
    var p = Object.assign({}, params || {}, { select: '*' });
    p.limit = 0;
    return api('/rest/v1/' + table + qs(p), { prefer: 'count=exact' }).then(function (r) {
      var m = (r.range || '').split('/');
      return parseInt(m[1] || '0', 10) || 0;
    });
  }

  function insertTriage(payload) {
    var s = session();
    return api('/rest/v1/triage_events', {
      method: 'POST', prefer: 'return=minimal',
      body: { user_id: s.user.id, payload: payload }
    });
  }
  function listTriage() {
    return select('triage_events', { select: 'payload,created_at', order: 'created_at.desc', limit: 50 });
  }

  /* ------------------------- UI painting -------------------------------- */
  function paint() {
    var s = session();
    var p = cachedProfile();
    var name = (p && p.full_name) || (s && s.user && s.user.email) || '';
    var role = (p && p.role) || 'patient';
    document.querySelectorAll('[data-auth-chip]').forEach(function (el) {
      if (s) {
        el.hidden = false;
        el.setAttribute('href', roleHome(role));
        el.innerHTML = '<span class="chip-role">' + role + '</span><span class="chip-name">' +
          String(name).split('@')[0].replace(/[<>&]/g, '') + '</span>';
        el.classList.add('is-in');
      } else {
        el.hidden = false;
        el.setAttribute('href', 'login.html');
        el.textContent = 'Sign in';
        el.classList.remove('is-in');
      }
    });
    document.querySelectorAll('[data-auth-gate]').forEach(function (el) {
      el.hidden = !s;
    });
    document.querySelectorAll('[data-auth-gateout]').forEach(function (el) {
      el.hidden = !!s;
    });
    document.querySelectorAll('[data-triage-cta]').forEach(function (el) {
      el.hidden = !!(s && role !== 'patient');
    });
    document.querySelectorAll('[data-signout]').forEach(function (el) {
      el.hidden = !s;
      el.onclick = function (e) { e.preventDefault(); signOut(); location.href = 'index.html'; };
    });
    if (s) heartbeat();
  }

  window.HGAuth = {
    session: session, signIn: signIn, signUp: signUp, signOut: signOut, completeProfile: completeProfile, rpc: rpc,
    me: me, heartbeat: heartbeat, roleHome: roleHome,
    select: select, insert: insert, update: update, count: count,
    insertTriage: insertTriage, listTriage: listTriage, paint: paint,
    api: api
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
})();
