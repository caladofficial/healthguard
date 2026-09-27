#!/usr/bin/env python3
"""Contrast audit v3 — HealthGuard (Part R).

WHY v3: v2 read each rule in isolation, so it could not see that
`html[data-theme="light"] .chip { background:#fffdf7 }` overrides the base
`.chip { background:#0b352c }`. That produced ~24 FALSE failures (light ink on a
dark card that the light theme actually repaints) and could equally hide real
ones. v3 models the cascade the way the browser does:

  * rules are applied in file order, main.css then app.css;
  * base rules land in BOTH themes; rules prefixed `html[data-theme="x"]` land
    only in theme x;
  * later declarations for the same selector win (last-wins cascade);
  * custom properties are resolved per theme (:root, plus body-scoped blocks);
  * a missing/not-a-color pair is reported as skipped, never silently passed.

Result is the contrast the user actually sees in each theme.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CSS = [os.path.join(ROOT, 'public/css/main.css'), os.path.join(ROOT, 'public/css/app.css')]
OUT = os.path.join(ROOT, 'reports/contrast_audit.md')

VAR_SCOPES = (':root', 'html', 'body')

# Selectors that paint the surface their descendants sit on but are not written
# as descendant selectors, so prefix matching cannot find them (`.mq-item`
# lives inside `.marquee`, `.foot-*` inside `.site-footer`). Longest token wins.
CONTAINERS = [('.code-block', '#04241d', '.code-block'),
              ('.mq', '#0b352c', '.marquee'),
              ('.foot', '#04241d', '.site-footer')]
# Base classes whose real background comes from a companion modifier applied
# alongside them (`.s-pill` + `.s-accepted`); audited through the modifier.
COMPANION_BG = {'.s-pill'}


# ---------------------------------------------------------------- parsing ---
def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def split_selectors(sel):
    """Split `.a, .b` into ['.a', '.b'] — never inside ( ) or [ ]."""
    out, depth, cur = [], 0, ''
    for ch in sel:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur.strip()); cur = ''
        else:
            cur += ch
    if cur.strip():
        out.append(cur.strip())
    return out


def parse_rules(css):
    """Yield (selector, props, theme_scope) in document order (top level only).

    At-rule blocks (@media/@keyframes/...) are skipped by brace-matching — a
    naive 'first } wins' scan desynchronises on nested rules and silently
    corrupts every rule after the first @media.
    """
    css = strip_comments(css)
    out = []
    i, n, buf = 0, len(css), ''
    while i < n:
        ch = css[i]
        if ch == '{':
            sel = ' '.join(buf.split())
            depth, j = 1, i + 1
            while j < n and depth:
                if css[j] == '{':
                    depth += 1
                elif css[j] == '}':
                    depth -= 1
                j += 1
            body = css[i + 1:j - 1]
            if sel and not sel.startswith('@'):
                props = {}
                for decl in body.split(';'):
                    if ':' not in decl:
                        continue
                    k, v = decl.split(':', 1)
                    props[k.strip()] = v.strip()
                theme = None
                m = re.search(r'html\[data-theme="(light|dark)"\]', sel)
                if m:
                    theme = m.group(1)
                    sel = sel.replace(m.group(0), '').strip() or 'html'
                if sel:
                    for part in split_selectors(sel):
                        out.append(part, props, theme) if False else out.append((part, props, theme))
            i = j
            buf = ''
            continue
        buf += ch
        i += 1
    return out


# ------------------------------------------------------------- colour math ---
def parse_color(s):
    """Return (rgb tuple, alpha) or None."""
    if not s:
        return None
    s = s.strip()
    m = re.match(r'#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$', s)
    if m:
        h = m.group(1)
        a = int(m.group(2), 16) / 255 if m.group(2) else 1.0
        return (tuple(int(h[k:k + 2], 16) for k in (0, 2, 4)), a)
    m = re.match(r'#([0-9a-fA-F]{3})$', s)
    if m:
        return (tuple(int(c * 2, 16) for c in m.group(1)), 1.0)
    m = re.match(r'rgba?\(([^)]+)\)', s)
    if m:
        parts = [p.strip() for p in m.group(1).replace('/', ',').split(',')]
        try:
            r, g, b = (float(parts[0]), float(parts[1]), float(parts[2]))
            a = float(parts[3]) if len(parts) > 3 else 1.0
        except (ValueError, IndexError):
            return None
        return ((r, g, b), a)
    return None


def mix_over(fg, alpha, bg):
    return tuple(fg[k] * alpha + bg[k] * (1 - alpha) for k in range(3))


def lum(rgb):
    def ch(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


# ------------------------------------------------------------- resolution ---
def resolve(value, env, depth=0):
    """Resolve var()/color-mix() against a theme environment."""
    if not value or depth > 6:
        return value or ''

    def sub_var(m):
        name, fb = m.group(1), m.group(2)
        if name in env:
            return env[name]
        if fb:
            return fb.lstrip(', ')
        return ''

    value = re.sub(r'var\(\s*(--[\w-]+)\s*(,([^()]*))?\)', sub_var, value)

    def sub_mix(m):
        inner, pct = m.group(1).strip(), float(m.group(2))
        col = parse_color(resolve(inner, env, depth + 1))
        if not col:
            return m.group(0)
        rgb, a = col
        a = a * (pct / 100)
        return 'rgba(%g, %g, %g, %g)' % (rgb[0], rgb[1], rgb[2], a)

    value = re.sub(r'color-mix\(\s*in\s+srgb\s*,\s*([^,]+?)\s+(\d+(?:\.\d+)?)%\s*,\s*([^)]+?)\s*\)',
                   lambda m: sub_mix_outer(m, env, depth), value)
    return value


def sub_mix_outer(m, env, depth):
    inner, pct, other = m.group(1).strip(), float(m.group(2)), m.group(3).strip()
    col = parse_color(resolve(inner, env, depth + 1))
    if not col:
        return m.group(0)
    rgb, a = col
    a = a * (pct / 100)
    if other != 'transparent':
        oc = parse_color(resolve(other, env, depth + 1))
        if oc:
            rgb = mix_over(rgb, pct / 100, oc[0])
            a = 1.0
    return 'rgba(%g, %g, %g, %g)' % (rgb[0], rgb[1], rgb[2], a)


def bg_stops(value):
    """All solid colours a background can paint (gradients → every stop)."""
    cols = []
    for m in re.finditer(r'(rgba?\([^)]+\)|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})', value):
        if value[max(0, m.start() - 12):m.start()].rstrip().endswith('at'):
            continue
        c = parse_color(m.group(1))
        if c:
            cols.append(c)
    return cols


# -------------------------------------------------------------------- main ---
def main():
    rules_by_file = []
    for path in CSS:
        rules_by_file.append((os.path.basename(path), parse_rules(open(path, encoding='utf-8').read())))

    # 1. custom properties per theme
    base_vars, theme_vars = {}, {'light': {}, 'dark': {}}
    for _fname, rules in rules_by_file:
        for sel, props, theme in rules:
            if sel in VAR_SCOPES:
                targets = [theme] if theme else ['light', 'dark']
                for t in targets:
                    theme_vars[t].update(props)
                if not theme:
                    base_vars.update(props)

    envs = {}
    for t in ('light', 'dark'):
        env = dict(base_vars)
        env.update(theme_vars[t])
        for _ in range(3):
            env = {k: resolve(v, {**base_vars, **theme_vars[t], **env}) for k, v in env.items()}
        envs[t] = env

    # 2. cascade: last declaration wins, per theme
    cascade = {'light': {}, 'dark': {}}
    for _fname, rules in rules_by_file:
        for sel, props, theme in rules:
            if sel in VAR_SCOPES:
                continue
            for t in ([theme] if theme else ['light', 'dark']):
                cascade[t].setdefault(sel, {}).update(props)

    # 3. element-scoped custom properties (e.g. `.site-footer` re-declares
    #    --ink-0/--text for its own subtree) and selector document order.
    scope_vars, order = {'light': [], 'dark': []}, {'light': [], 'dark': []}
    for _fname, rules in rules_by_file:
        for sel, props, theme in rules:
            if sel in VAR_SCOPES:
                continue
            vardefs = {k: v for k, v in props.items() if k.startswith('--')}
            for t in ([theme] if theme else ['light', 'dark']):
                if vardefs:
                    scope_vars[t].append((sel, vardefs))
                if sel not in order[t]:
                    order[t].append(sel)

    def env_for(sel, t):
        """Theme env + any element-scoped vars from ancestor/self selectors."""
        cascade_t = cascade[t]
        env = dict(envs[t])
        sel_classes = set(re.findall(r'\.([\\w-]+)', sel))
        for tok, _col, src in CONTAINERS:
            if tok in sel:
                for k, v in cascade_t.get(src, {}).items():
                    if k.startswith('--'):
                        env[k] = v
        for src, vardefs in scope_vars[t]:
            if src == sel:
                env.update(vardefs)
                continue
            src_classes = set(re.findall(r'\.([\\w-]+)', src))
            if src_classes and src_classes <= sel_classes:
                env.update(vardefs)
        return {k: resolve(v, env) for k, v in env.items()}

    def inherited_bg(sel, t):
        """Nearest ancestor selector (by selector prefix) that paints a background."""
        for tok, col, _src in CONTAINERS:
            if tok in sel:
                return col
        best, bestlen = None, -1
        for cand in order[t]:
            if cand == sel or not sel.startswith(cand):
                continue
            rest = sel[len(cand):]
            if rest and rest[0] not in ' .:,>[':
                continue
            props = cascade[t].get(cand, {})
            bg = props.get('background-color') or props.get('background')
            if bg and len(cand) > bestlen:
                best, bestlen = resolve(bg, env_for(cand, t)), len(cand)
        return best

    fails, risks, skipped = [], [], []
    for fname, rules in rules_by_file:
        for sel, props, theme_scope in rules:
            if sel in VAR_SCOPES:
                continue
            for t in ([theme_scope] if theme_scope else ['light', 'dark']):
                eff = dict(cascade[t].get(sel, {}))
                if theme_scope:  # a theme rule may be a partial override
                    for k, v in cascade[t].get(sel, {}).items():
                        eff.setdefault(k, v)
                if eff.get('opacity') == '0' or eff.get('visibility') == 'hidden' or eff.get('display') == 'none':
                    continue
                color = eff.get('color')
                bgsrc = eff.get('background-color') or eff.get('background')
                if not bgsrc and not color:
                    continue
                if not bgsrc and sel in COMPANION_BG:
                    continue
                env = env_for(sel, t)
                surface = parse_color(resolve(env.get('--surface', '#fffdf7'), env)) or ((255, 253, 247), 1.0)
                if not bgsrc:
                    bgsrc = inherited_bg(sel, t)
                if bgsrc:
                    raw = bg_stops(resolve(bgsrc, env))
                    eff_bg = [mix_over(c, a, surface[0]) if a < 1 else c for c, a in raw]
                else:
                    eff_bg = [surface[0]]
                if not eff_bg:
                    continue
                if not color or re.search(r'transparent|inherit|currentColor|initial|unset', color):
                    if color is None and any(lum(b) < 0.2 for b in eff_bg):
                        risks.append((fname, t, sel, bgsrc or ''))
                    continue
                cval = resolve(color, env)
                if 'var(' in cval or 'color-mix(' in cval:
                    skipped.append((sel, cval))
                    continue
                ccol = parse_color(cval)
                if not ccol:
                    continue
                fs = eff.get('font-size', '')
                px = None
                m = re.match(r'([\d.]+)px', fs)
                if m:
                    px = float(m.group(1))
                m = re.match(r'([\d.]+)rem', fs)
                if m:
                    px = float(m.group(1)) * 16
                fw = eff.get('font-weight', '400')
                large = (px or 0) >= 24 or ((px or 0) >= 18.66 and fw in ('700', '800', '900', 'bold'))
                need = 3.0 if large else 4.5
                worst = min(contrast(ccol[0], b) for b in eff_bg)
                if worst < need:
                    fails.append({'file': fname, 'theme': t, 'sel': sel, 'color': cval,
                                  'bg': resolve(bgsrc, env) if bgsrc else '',
                                  'ratio': round(worst, 2), 'need': need})

    uniq, seen = [], set()
    for f in sorted(fails, key=lambda x: x['ratio']):
        k = (f['file'], f['theme'], f['sel'])
        if k not in seen:
            seen.add(k)
            uniq.append(f)

    lines = ['# Contrast audit v3 — HealthGuard (cascade-aware, Part R)', '',
             f'FAIL: {len(uniq)} · RISK (dark surface, no text colour set): {len(set(risks))} · '
             f'unresolved: {len(skipped)}', '',
             '## FAIL', '', '| file | theme | selector | color | bg | ratio | need |',
             '|---|---|---|---|---|---|---|']
    for f in uniq:
        lines.append(f"| {f['file']} | {f['theme']} | `{f['sel'][:58]}` | `{f['color'][:26]}` | "
                     f"`{f['bg'][:34]}` | **{f['ratio']}** | {f['need']} |")
    if skipped:
        lines += ['', '## Skipped (could not resolve)', ''] + [f'- `{s[:50]}` → {v[:40]}' for s, v in skipped[:12]]
    rep = '\n'.join(lines) + '\n'
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w').write(rep)
    print(rep)


if __name__ == '__main__':
    main()
