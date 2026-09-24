/* HealthGuard — Auth (Supabase REST, zero dependencies).
   EVOLVEX IT SOLUTIONS PVT. LTD.
   Publishable key only; service keys never ship to the client (spec §13). */
(function () {
  'use strict';
  var SB_URL = 'https://uopivvbgkfxlptgzfdrk.supabase.co';
  var SB_KEY = 'sb_publishable_BnnM3gFD-fI5k-tO4zmSIw_9yShmVRQ';
  var LS = 'hg:session';

  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      'apikey': SB_KEY,
      'Content-Type': 'application/json'
    }, opts.headers || {});
    return fetch(SB_URL + path, opts).then(function (r) {
      return r.text().then(function (t) {
        var j = {};
        if (t) { try { j = JSON.parse(t); } catch (e) { j = {}; } }
        if (!r.ok) throw new Error((j && (j.msg || j.error_description || j.message)) || ('HTTP ' + r.status));
        return j;
      });
    });
  }

  function save(s) { try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {} }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(LS) || 'null');
      if (s && s.access_token && s.expires_at && s.expires_at * 1000 < Date.now()) { clear(); return null; }
      return s;
    } catch (e) { return null; }
  }
  function clear() { try { localStorage.removeItem(LS); } catch (e) {} }

  function signUp(email, password) {
    return api('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email: email, password: password }) })
      .then(function (j) {
        if (j.access_token) { save(j); return j; }
        // created but needs email confirm (if autoconfirm off) — sign in anyway
        return signIn(email, password);
      });
  }
  function signIn(email, password) {
    return api('/auth/v1/token?grant_type=password', {
      method: 'POST', body: JSON.stringify({ email: email, password: password })
    }).then(function (j) { save(j); return j; });
  }
  function signOut() {
    var s = load();
    clear();
    if (!s) return Promise.resolve();
    return api('/auth/v1/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + s.access_token } }).catch(function () {});
  }
  function session() { return load(); }
  function user() { var s = load(); return s && s.user ? s.user : (s ? { email: s.email } : null); }

  function insertTriage(payload) {
    var s = load();
    if (!s) return Promise.reject(new Error('Sign in to save results'));
    return api('/rest/v1/triage_events', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + s.access_token, 'Prefer': 'return=minimal' },
      body: JSON.stringify([{ user_id: s.user && s.user.id, payload: payload }])
    });
  }
  function listTriage() {
    var s = load();
    if (!s) return Promise.reject(new Error('Sign in to view your record'));
    return api('/rest/v1/triage_events?select=created_at,payload&order=created_at.desc&limit=50', {
      headers: { 'Authorization': 'Bearer ' + s.access_token }
    });
  }

  /* header chip + drawer sync */
  function paint() {
    var s = load();
    var email = s && s.user ? s.user.email : (s ? s.email : '');
    document.querySelectorAll('[data-auth-chip]').forEach(function (el) {
      if (s) {
        el.textContent = email.length > 22 ? email.slice(0, 20) + '…' : email;
        el.setAttribute('href', 'my-health.html');
        el.setAttribute('title', 'My Health — ' + email);
        el.classList.add('is-authed');
      } else {
        el.textContent = 'Sign in';
        el.setAttribute('href', 'login.html');
        el.removeAttribute('title');
        el.classList.remove('is-authed');
      }
    });
    document.querySelectorAll('[data-auth-gate]').forEach(function (el) {
      el.hidden = !s;
    });
    document.querySelectorAll('[data-auth-gateout]').forEach(function (el) {
      el.hidden = !!s;
    });
  }

  window.HGAuth = {
    signUp: signUp, signIn: signIn, signOut: signOut,
    session: session, user: user,
    insertTriage: insertTriage, listTriage: listTriage,
    paint: paint
  };
  document.addEventListener('DOMContentLoaded', paint);
})();
