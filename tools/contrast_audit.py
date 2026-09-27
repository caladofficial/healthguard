#!/usr/bin/env python3
"""contrast_audit v2 — static WCAG auditor (Part N).
Fixes over v1: cross-file var pool, alpha-composite backgrounds over the
parent surface, theme-scoped selector handling, silent-skip elimination
(unresolved vars are reported). Output: reports/contrast_audit.md."""
import re, os

CSS = ['/home/user/healthguard/public/css/main.css', '/home/user/healthguard/public/css/app.css']
OUT = '/home/user/healthguard-ml/reports/contrast_audit.md'


def parse(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    root, dark, light, rules, scopes = {}, {}, {}, [], {}
    for m in re.finditer(r'([^{}@]+)\{([^{}]*)\}', css):
        sel = ' '.join(m.group(1).split()).strip()
        body = m.group(2)
        if not sel:
            continue
        props = {pm.group(1): pm.group(2).strip()
                 for pm in re.finditer(r'([-\w]+)\s*:\s*([^;]+);', body)}
        assigns = {k: v for k, v in props.items() if k.startswith('--')}
        if assigns:
            if sel == ':root':
                root.update(assigns)
            elif 'data-theme="dark"' in sel:
                dark.update(assigns)
            elif 'data-theme="light"' in sel:
                light.update(assigns)
            else:
                scopes.setdefault(sel, {}).update(assigns)
        rules.append((sel, props))
    return root, dark, light, scopes, rules


def resolve(val, env):
    for _ in range(14):
        if 'var(' not in val:
            break
        new = re.sub(r'var\(\s*(--[\w-]+)\s*(?:,\s*[^)]*)?\)',
                     lambda m: env.get(m.group(1), m.group(0)), val)
        if new == val:
            break
        val = new
    return val.strip()


def parse_color(s):
    m = re.match(r'rgba?\(\s*([\d.]+)[,\s/]+([\d.]+)[,\s/]+([\d.]+)\s*(?:[,/]\s*([\d.]+))?', s, re.I)
    if m:
        a = float(m.group(4)) if m.group(4) else 1.0
        return (float(m.group(1)), float(m.group(2)), float(m.group(3))), a
    m = re.match(r'#([0-9a-fA-F]{3,8})$', s)
    if m:
        h = m.group(1)
        if len(h) == 3:
            h = ''.join(c * 2 for c in h)
        if len(h) >= 6:
            return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)), 1.0
    return None, None


def over(fg, a, bgc):
    return tuple(a * f + (1 - a) * b for f, b in zip(fg, bgc))


def lum(rgb):
    def ch(c):
        c /= 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def stops(bgval):
    out = []
    val = bgval
    # expand color-mix(in srgb, C p%, transparent|COLOR) first
    def mix_sub(m):
        left, pct, right = m.group(1).strip(), float(m.group(2)), m.group(3).strip()
        ca, aa = parse_color(left)
        cb, ab = parse_color(right)
        if ca is None:
            return ' '
        if right.startswith('transparent') or cb is None:
            out.append((ca, pct / 100.0 * (aa or 1.0)))
        else:
            p = pct / 100.0
            out.append((tuple(p * x + (1 - p) * y for x, y in zip(ca, cb)), 1.0))
        return ' '
    val = re.sub(r'color-mix\(in srgb,\s*([^,]+?)\s+([\d.]+)%\s*,\s*([^)]+)\)', mix_sub, val)
    for tok in re.findall(r'#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)', val):
        c, a = parse_color(tok)
        if c:
            out.append((c, a))
    return out


def is_dark(rgb):
    return lum(rgb) < 0.22


def main():
    all_root, all_dark, all_light = {}, {}, {}
    parsed = []
    for path in CSS:
        root, dark, light, scopes, rules = parse(open(path).read())
        all_root.update(root)
        all_dark.update(dark)
        all_light.update(light)
        parsed.append((os.path.basename(path), rules, scopes))
    pool = {**all_root, **all_dark, **all_light}          # fallback for cross-file vars
    def bake(vd):
        out = dict(vd)
        for _ in range(3):
            out = {k: resolve(v, {**pool, **out}) for k, v in out.items()}
        return out
    light_vars = {**all_root, **all_light}
    dark_vars = {**all_root, **all_dark}
    envs = {'light': bake(light_vars), 'dark': bake(dark_vars)}
    for e in envs.values():
        for k, v in pool.items():
            e.setdefault(k, resolve(v, pool))

    fails, risks, skipped = [], [], []
    for fname, rules, scopes in parsed:
        for sel, props in rules:
            theme_filter = None
            if 'data-theme="light"' in sel:
                theme_filter = 'light'
            elif 'data-theme="dark"' in sel:
                theme_filter = 'dark'
            color, bg = props.get('color'), (props.get('background-color') or props.get('background'))
            if not bg:
                continue
            for theme in (['light', 'dark'] if theme_filter is None else [theme_filter]):
                env = dict(envs[theme])
                for ssel, svars in scopes.items():
                    classes = re.findall(r'\.([\w-]+)', ssel)
                    if classes and re.search(r'\.' + re.escape(classes[0]) + r'(?![\w-])', sel):
                        for k, v in svars.items():
                            env[k] = resolve(v, env)
                bval = resolve(bg, env)
                surface_c, _ = parse_color(resolve(env.get('--surface', '#fffdf7'), env))
                raw = stops(bval)
                if not raw:
                    continue
                eff = [(over(c, a, surface_c) if a < 1 else c) for c, a in raw]
                if not color or re.search(r'transparent|inherit|currentColor|initial|unset', color):
                    if color is None and any(is_dark(s) for s in eff):
                        risks.append((fname, theme, sel[:70], bval[:60]))
                    continue
                cval = resolve(color, env)
                if 'var(' in cval:
                    skipped.append((sel[:60], cval[:40]))
                    continue
                ccol, ca = parse_color(cval)
                if not ccol:
                    continue
                fs = props.get('font-size', '')
                fspx = None
                m = re.match(r'([\d.]+)px', fs)
                if m:
                    fspx = float(m.group(1))
                m = re.match(r'([\d.]+)rem', fs)
                if m:
                    fspx = float(m.group(1)) * 16
                large = (fspx or 0) >= 24
                need = 3.0 if large else 4.5
                worst = min(contrast(ccol, s) for s in eff)
                if worst < need:
                    fails.append({'file': fname, 'theme': theme, 'sel': sel[:70],
                                  'color': cval[:36], 'bg': bval[:50],
                                  'ratio': round(worst, 2), 'need': need})
    seen, uniq = set(), []
    for f in sorted(fails, key=lambda x: x['ratio']):
        key = (f['file'], f['theme'], f['sel'])
        if key not in seen:
            seen.add(key)
            uniq.append(f)
    lines = ['# Contrast audit v2 — HealthGuard (Part N)', '',
             f'FAIL: {len(uniq)} · RISK (dark bg, no text set): {len(set(risks))} · unresolved-var skips: {len(skipped)}', '',
             '## FAIL', '', '| file | theme | selector | color | ratio | need |', '|---|---|---|---|---|---|']
    for f in uniq:
        lines.append(f"| {f['file']} | {f['theme']} | `{f['sel']}` | {f['color']} | **{f['ratio']}** | {f['need']} |")
    lines += ['', '## RISK', '', '| file | theme | selector | bg |', '|---|---|---|---|']
    for f in sorted(set(risks)):
        lines.append(f'| {f[0]} | {f[1]} | `{f[2]}` | {f[3]} |')
    if skipped:
        lines += ['', '## Skipped (unresolved var)', ''] + [f'- `{s}` → {v}' for s, v in skipped[:10]]
    rep = '\n'.join(lines) + '\n'
    open(OUT, 'w').write(rep)
    print(rep)


if __name__ == '__main__':
    main()
