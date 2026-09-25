// HealthGuard — UI section builders ("Motion Primitives" markup factory).
// WHY: page content stays declarative data; every card/table/flow renders with the
// same accessible, auto-fit-safe markup (minmax grids, responsive tables).

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* HERO — split-text headline + 3D art stage with floating glass chips */
export function hero({ eyebrow, title, lead, art, chips = [], actions = [] }) {
  return `<section class="hero" data-spotlight>
    <div class="hero-spot" aria-hidden="true"></div>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        ${eyebrow ? `<p class="eyebrow" data-reveal>${eyebrow}</p>` : ''}
        <h1 class="h-display" data-split>${esc(title)}</h1>
        ${lead ? `<p class="lead" data-reveal data-reveal-delay="1">${esc(lead)}</p>` : ''}
        ${chips.length ? `<div class="chip-row" data-reveal data-reveal-delay="2">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>` : ''}
        ${actions.length ? `<div class="btn-row" data-reveal data-reveal-delay="3">${actions.map((a, i) => `<a class="btn ${i === 0 ? 'btn-primary' : 'btn-ghost'}" href="${a.href}">${esc(a.label)}</a>`).join('')}</div>` : ''}
      </div>
      ${art ? `<figure class="hero-art" data-reveal data-reveal-delay="1">
        <div class="hero-art-frame"><img src="images/${art}" alt="" loading="eager" decoding="async"></div>
        <div class="float-chip fc-1"><span class="fc-dot"></span>AI extraction ✓</div>
        <div class="float-chip fc-2"><svg class="mini-ecg" viewBox="0 0 36 16" aria-hidden="true"><path d="M0 8 H6 L8 4 L10 13 L12 8 H18 L20 3 L22 13 L24 8 H36"/></svg>72 bpm</div>
        <div class="float-chip fc-3"><span class="fc-dot"></span>94% confidence</div>
        <figcaption class="hero-art-cap">${esc(eyebrow || PRODUCT_CAP)}</figcaption>
      </figure>` : ''}
    </div>
  </section>`;
}
const PRODUCT_CAP = 'HealthGuard';

/* SECTION shell */
export function section({ id, kicker, title, lead, inner, wide = false }) {
  return `<section class="section" ${id ? `id="${id}"` : ''}>
    <div class="wrap ${wide ? 'wrap-wide' : ''}">
      ${kicker ? `<p class="eyebrow" data-reveal>${esc(kicker)}</p>` : ''}
      ${title ? `<h2 class="h-sec" data-reveal>${esc(title)}</h2>` : ''}
      ${lead ? `<p class="sec-lead" data-reveal>${esc(lead)}</p>` : ''}
      ${inner}
    </div>
  </section>`;
}

/* CARD GRID (stagger reveal + optional tilt) */
export function cards(items, { cols = 3, tilt = true } = {}) {
  return `<div class="grid-cards cols-${cols}" data-stagger>
    ${items.map((it) => `<article class="card" ${tilt ? 'data-tilt' : ''} data-reveal>
      ${it.icon ? `<div class="card-icon" aria-hidden="true">${it.icon}</div>` : ''}
      ${it.t ? `<h3 class="card-t">${esc(it.t)}</h3>` : ''}
      <p class="card-d">${esc(it.d)}</p>
      ${it.href ? `<a class="card-link" href="${it.href}">${esc(it.linkLabel || 'Explore')} <span aria-hidden="true">→</span></a>` : ''}
    </article>`).join('\n')}
  </div>`;
}

/* BENTO feature map — asymmetric highlight grid */
export function bento(items) {
  return `<div class="bento" data-stagger>
    ${items.map((it) => `<a class="bento-cell ${it.big ? 'bento-big' : ''}" href="${it.href}" data-reveal data-tilt>
      <h3 class="bento-t">${esc(it.t)}</h3>
      <p class="bento-d">${esc(it.d)}</p>
      <span class="bento-go" aria-hidden="true">→</span>
    </a>`).join('\n')}
  </div>`;
}

/* JOURNEY / FLOW — horizontal steps with arrows (wraps on small screens) */
export function flow(steps, { accent = false } = {}) {
  return `<ol class="flow ${accent ? 'flow-accent' : ''}" data-stagger>
    ${steps.map((s, i) => `<li class="flow-step" data-reveal>
      <span class="flow-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="flow-label">${esc(s)}</span>
    </li>`).join('\n')}
  </ol>`;
}

/* KEY-VALUE spec table (collapses to cards < 720px) */
export function table(head, rows) {
  return `<div class="table-wrap" data-reveal>
    <table class="spec-table">
      <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td data-label="${esc(head[i])}">${esc(c)}</td>`).join('')}</tr>`).join('\n')}</tbody>
    </table>
  </div>`;
}

/* CODE / specimen block */
export function code(title, body) {
  return `<figure class="code-block" data-reveal>
    ${title ? `<figcaption class="code-cap">${esc(title)}</figcaption>` : ''}
    <pre><code>${esc(body)}</code></pre>
  </figure>`;
}

/* SPLIT — side-by-side text + figure (stacks on small) */
export function split({ title, paragraphs = [], figure = '', flip = false, list = [] }) {
  return `<div class="split ${flip ? 'split-flip' : ''}">
    <div class="split-copy">
      ${title ? `<h3 class="h-sub" data-reveal>${esc(title)}</h3>` : ''}
      ${paragraphs.map((p) => `<p data-reveal>${esc(p)}</p>`).join('\n')}
      ${list.length ? `<ul class="ticks" data-reveal>${list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
    </div>
    ${figure ? `<div class="split-fig" data-reveal>${figure}</div>` : ''}
  </div>`;
}

/* ACCORDION */
export function accordion(items) {
  return `<div class="acc" data-stagger>
    ${items.map((it, i) => `<details class="acc-item" ${i === 0 ? 'open' : ''} data-reveal>
      <summary>${esc(it.t)}<span class="acc-caret" aria-hidden="true"></span></summary>
      <div class="acc-body"><p>${esc(it.d)}</p></div>
    </details>`).join('\n')}
  </div>`;
}

/* STATS counters */
export function stats(items) {
  return `<div class="stats" data-stagger>
    ${items.map((s) => `<div class="stat" data-reveal>
      <p class="stat-n"><span data-count="${s.n}">0</span><span class="stat-suffix">${esc(s.suffix || '')}</span></p>
      <p class="stat-l">${esc(s.l)}</p>
    </div>`).join('\n')}
  </div>`;
}

/* PIPELINE diagram (animated SVG path draw) */
export function pipeline(nodes) {
  const W = 100, gap = 100 / (nodes.length + 1);
  const pts = nodes.map((_, i) => gap * (i + 1));
  const path = pts.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} 34`).join(' ');
  return `<figure class="pipe" data-reveal>
    <svg viewBox="0 0 100 ${nodes.length > 6 ? 68 : 34}" preserveAspectRatio="none" class="pipe-svg" aria-hidden="true">
      <path d="${path}" class="pipe-line" data-draw fill="none" stroke="currentColor" stroke-width=".5" stroke-dasharray="100 100" vector-effect="non-scaling-stroke"/>
    </svg>
    <ol class="pipe-nodes" style="--n:${nodes.length}">
      ${nodes.map((n, i) => `<li style="--i:${i}" data-reveal><span class="pipe-dot"></span>${esc(n)}</li>`).join('')}
    </ol>
  </figure>`;
}

/* CONFIDENCE bars */
export function confidence(rows) {
  return `<div class="conf" data-stagger>
    ${rows.map((r) => `<div class="conf-row" data-reveal>
      <div class="conf-head"><span>${esc(r.l)}</span><span class="conf-v">${r.v}%</span></div>
      <div class="conf-track"><div class="conf-fill" data-bar="${r.v}" style="--target:${r.v}%"></div></div>
    </div>`).join('\n')}
  </div>`;
}

/* TOKEN QUEUE ticker (animated demo of §4 doctor dashboard) */
export function queueTicker() {
  return `<figure class="queue" data-reveal data-queue>
    <figcaption class="queue-cap">CURRENT QUEUE — live view</figcaption>
    <ul class="queue-list">
      <li><b>#A104</b><span class="pill pill-t2">Priority</span><span>02 min</span></li>
      <li><b>#A105</b><span class="pill pill-t3">Routine</span><span>04 min</span></li>
      <li><b>#A106</b><span class="pill pill-t2">Priority</span><span>06 min</span></li>
      <li><b>#A107</b><span class="pill pill-t4">Follow-up</span><span>08 min</span></li>
    </ul>
    <p class="queue-note">Patient view: <b>Token A104</b> · You're #3 in queue · Estimated wait: 12–18 min. Another patient's identity is never exposed.</p>
  </figure>`;
}

/* MARQUEE of standards */
export function marquee(items) {
  const run = items.map((i) => `<span class="mq-item">${esc(i)}</span>`).join('');
  return `<div class="marquee" aria-hidden="true"><div class="mq-track">${run}${run}</div></div>`;
}

/* NOTE / disclaimer strip */
export function note(text, kind = 'info') {
  return `<p class="note note-${kind}" data-reveal>${esc(text)}</p>`;
}

/* QUOTE / principle */
export function principle(text) {
  return `<blockquote class="principle" data-reveal><p>${esc(text)}</p></blockquote>`;
}

/* RELATED rail */
export function related(slugs, titles) {
  return `<section class="section section-rail">
    <div class="wrap">
      <p class="eyebrow" data-reveal>Related components</p>
      <div class="rail" data-stagger>
        ${slugs.map((s, i) => `<a class="rail-card" href="${s}.html" data-reveal>
          <span class="rail-t">${esc(titles[i])}</span><span class="rail-go" aria-hidden="true">→</span>
        </a>`).join('\n')}
      </div>
    </div>
  </section>`;
}

/* PILL row (states, tags) */
export function pills(items, map = {}) {
  return `<div class="pill-row" data-reveal>${items.map((i) => `<span class="pill ${map[i] || ''}">${esc(i)}</span>`).join('')}</div>`;
}

/* CHECK grid — capability lists */
export function checks(items, { cols = 2 } = {}) {
  return `<ul class="checks cols-${cols}" data-stagger>
    ${items.map((i) => `<li data-reveal>${esc(i)}</li>`).join('\n')}
  </ul>`;
}
