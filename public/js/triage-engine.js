/* HealthGuard — Triage Engine (browser) — distilled GBDT + deterministic rules.
   EVOLVEX IT SOLUTIONS PVT. LTD.
   Safety layer is a 1:1 port of healthguard-ml/src/train_triage.py (same
   thresholds). AI assistive only — triage = workflow urgency, not diagnosis. */
(function () {
  'use strict';
  var M = window.HG_TRIAGE_MODEL;
  if (!M) return;

  var CRITICAL = ['SHOCK_HYPOTENSION', 'SEVERE_BRADYCARDIA', 'SEVERE_TACHYCARDIA', 'HYPOXEMIA',
    'GCS_CRITICAL', 'ACTIVE_SEIZURE', 'ACS_RED_FLAG', 'HEMORRHAGE_OBSTETRIC',
    'SEPSIS_QSOFA', 'STROKE_FAST', 'HYPERTENSIVE_CRISIS'];
  var MEANING = ['Emergency escalation', 'Very urgent', 'Priority consultation', 'Routine consultation', 'Follow-up'];

  /* ---------------- feature assembly (mirrors triage_synth.py) ------------- */
  function clip(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function buildRow(v) {
    var f = {};
    f.age = +v.age; f.sex = +v.sex; f.pregnancy = +v.pregnancy | 0;
    f.hr = +v.hr; f.sbp = +v.sbp; f.dbp = +v.dbp; f.rr = +v.rr;
    f.temp_c = +v.temp_c; f.spo2 = +v.spo2; f.gcs = +v.gcs; f.pain = +v.pain;
    f.onset_hours = +v.onset_hours; f.followup_flag = +v.followup_flag | 0;
    f.shock_index = f.hr / f.sbp;
    f.pulse_pressure = f.sbp - f.dbp;
    f.temp_deviation = Math.abs(f.temp_c - 36.8);
    f.spo2_gap = Math.max(0, 100 - f.spo2);
    f.qsofa_feat = (f.sbp <= 100 ? 1 : 0) + (f.rr >= 22 ? 1 : 0) + (v.altered_mental ? 1 : 0);
    f.sirs_feat = (f.hr > 90 ? 1 : 0) + (f.rr > 20 ? 1 : 0) + ((f.temp_c > 38 || f.temp_c < 36) ? 1 : 0);
    f.news_like = -Math.round(clip((f.sbp - 110) / 20, -2, 2)) + Math.round(clip((f.hr - 85) / 25, -2, 2)) +
      Math.round(clip((f.rr - 17) / 5, -2, 2)) - Math.round(clip((f.spo2 - 96) / 3, -2, 2)) +
      Math.round(clip((f.temp_c - 37) / 1.2, -2, 2));
    f.age_risk = (f.age > 65 ? 1 : 0) + (f.age > 80 ? 1 : 0);
    ['chest_pain', 'dyspnea', 'abd_pain', 'fever', 'cough', 'headache', 'weakness', 'bleeding',
      'vomiting', 'dizziness', 'syncope', 'seizure', 'altered_mental', 'palpitations', 'jaundice', 'rash',
      'htn', 'dm', 'cad_hf', 'copd', 'ckd', 'cancer', 'stroke_hx', 'immuno'].forEach(function (k) {
        f[k] = v[k] ? 1 : 0;
      });
    return f;
  }

  /* ---------------- GBDT scorer (mirrors export_web.walk_tree) ------------- */
  function treeOut(acc, x) {
    var i = 0;
    // internal node ⇔ split[i] >= 0 (leaf values may be negative).
    // acc.c === 1 → LightGBM/sklearn 'value <= thresh' goes left (float64);
    // else XGBoost 'f32(value) < f32(thresh)' goes left (acc.ff === 1).
    var cmpLE = acc.c === 1;
    var f32 = acc.ff === 1;
    while (acc.split[i] >= 0) {
      var val = x[acc.split[i]];
      if (val !== val) i = acc.miss[i];
      else {
        var vf = f32 ? Math.fround(val) : val;
        var tf = f32 ? Math.fround(acc.thresh[i]) : acc.thresh[i];
        i = (cmpLE ? vf <= tf : vf < tf) ? acc.left[i] : acc.right[i];
      }
    }
    return acc.leaf[i];
  }

  function margins(rowVec) {
    var m = new Array(M.n_class).fill(0), n = M.trees.length;
    for (var t = 0; t < n; t++) {
      var acc = M.trees[t];
      m[t % M.n_class] += (acc.w || 1) * treeOut(acc, rowVec);
    }
    for (var c = 0; c < M.n_class; c++) m[c] += (M.base ? M.base[c] : 0);
    return m;
  }

  function softmax(m) {
    var mx = Math.max.apply(null, m), e = m.map(function (v) { return Math.exp(v - mx); });
    var s = e.reduce(function (a, b) { return a + b; }, 0);
    return e.map(function (v) { return v / s; });
  }

  /* ---------------- deterministic red-flag rules (1:1 port) ---------------- */
  function ruleScan(v) {
    var r = [];
    if (+v.sbp < 90) r.push('SHOCK_HYPOTENSION');
    if (+v.sbp > 220) r.push('HYPERTENSIVE_CRISIS');
    if (+v.hr < 40) r.push('SEVERE_BRADYCARDIA');
    if (+v.hr > 150) r.push('SEVERE_TACHYCARDIA');
    if (+v.spo2 < 88) r.push('HYPOXEMIA');
    if (+v.gcs <= 8) r.push('GCS_CRITICAL');
    if (v.seizure && +v.pain >= 6) r.push('ACTIVE_SEIZURE');
    if (v.chest_pain && +v.age > 45 && (v.dm || v.cad_hf) && +v.pain >= 6 && +v.onset_hours < 24) r.push('ACS_RED_FLAG');
    if (v.pregnancy && v.bleeding && +v.sbp < 100) r.push('HEMORRHAGE_OBSTETRIC');
    if (+v.sbp > 180 && v.htn && v.headache) r.push('HYPERTENSIVE_CRISIS');
    var qsofa = (+v.sbp <= 100 ? 1 : 0) + (+v.rr >= 22 ? 1 : 0) + (v.altered_mental ? 1 : 0);
    if (qsofa >= 2 && v.fever) r.push('SEPSIS_QSOFA');
    if (+v.onset_hours < 3 && v.altered_mental && (v.weakness || v.dizziness) && +v.age > 50) r.push('STROKE_FAST');
    return r;
  }

  function isCritical(code) { return CRITICAL.indexOf(code) >= 0; }

  /* ---------------- safe decision (1:1 port of safe_predict) --------------- */
  function decide(probs, raw) {
    var pmap = {};
    M.classes.forEach(function (c, i) { pmap[c] = probs[i]; });
    var s01 = (pmap[0] || 0) + (pmap[1] || 0);
    var s012 = s01 + (pmap[2] || 0);
    var pred = M.classes[0];
    M.classes.forEach(function (c) { if (pmap[c] > pmap[pred]) pred = c; });
    pred = +pred;
    if (s01 >= 0.30) pred = Math.min(pred, 1);
    else if (s01 >= 0.14) pred = Math.min(pred, 2);
    if (s012 >= 0.55) pred = Math.min(pred, 2);
    var reasons = ruleScan(raw);
    if (reasons.length) pred = reasons.some(isCritical) ? 0 : Math.min(pred, 1);
    var urgent = s01 > 0.25;
    var review = (reasons.length > 0 && !urgent) || (urgent && reasons.length === 0 && pred >= 3);
    return { pred: pred, reasons: reasons, review: review, pmap: pmap, s01: s01 };
  }

  /* ---------------- public API -------------------------------------------- */
  window.HGTriage = {
    MEANING: MEANING,
    run: function (raw) {
      var f = buildRow(raw);
      var rowVec = M.features.map(function (n) { return f[n] !== undefined ? f[n] : 0; });
      var probs = softmax(margins(rowVec));
      var d = decide(probs, raw);
      var baseU = M.baseline_urgent_prevalence || 0.5;
      var rr = d.s01 / baseU;
      var tier = rr < 1.2 ? 'low' : rr < 2 ? 'moderate' : rr < 3.5 ? 'high' : 'very_high';
      return {
        triageClass: d.pred,
        label: 'T' + d.pred,
        meaning: MEANING[d.pred],
        probs: d.pmap,
        probList: probs,
        reasonCodes: d.reasons.length ? d.reasons : ['ROUTINE_STABLE'],
        requiresHumanReview: d.review,
        confidence: +(Math.max.apply(null, probs) * (d.review ? 0.5 : 1)).toFixed(3),
        riskRatio: +rr.toFixed(2),
        riskTier: tier,
        modelVersion: M.version,
        ruleVersion: M.rule_version,
        disclaimer: 'AI assistive triage — workflow urgency only, not diagnosis. Clinical decisions remain with qualified clinicians.'
      };
    }
  };
})();
