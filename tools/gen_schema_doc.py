#!/usr/bin/env python3
"""Regenerate docs/SCHEMA.md from the live Supabase catalogue.

Keeps the schema doc honest: it is generated from the database, never hand-typed.
Run: python3 tools/gen_schema_doc.py
"""
import json, subprocess, collections, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_PATH = os.path.expanduser('~/uploads/heathguard_Supabase Token.txt')
API = "https://api.supabase.com/v1/projects/uopivvbgkfxlptgzfdrk/database/query"


def q(sql):
    r = subprocess.run(['curl', '-s', '-X', 'POST', API,
                        '-H', f'Authorization: Bearer {open(TOKEN_PATH).read().strip()}',
                        '-H', 'Content-Type: application/json',
                        '-d', json.dumps({'query': sql})], capture_output=True, text=True)
    try:
        return json.loads(r.stdout.strip())
    except Exception:
        return []


def main():
    cols = q("select table_name, column_name, data_type, is_nullable, column_default "
             "from information_schema.columns where table_schema='public' "
             "order by table_name, ordinal_position")
    cons = q("select conrelid::regclass::text as tbl, conname, pg_get_constraintdef(oid) as def "
             "from pg_constraint where connamespace='public'::regnamespace order by 1,2")
    idx = q("select tablename, indexname, indexdef from pg_indexes "
            "where schemaname='public' order by tablename, indexname")
    pols = q("select tablename, policyname, cmd, qual, with_check from pg_policies "
             "where schemaname='public' order by tablename, cmd")
    fns = q("select proname, pg_get_function_identity_arguments(oid) as args, "
            "pg_get_function_result(oid) as ret, prosecdef as secdef from pg_proc "
            "where pronamespace='public'::regnamespace order by 1")
    counts = {r['relname']: r['n_live_tup'] for r in q("select relname, n_live_tup from pg_stat_user_tables")}

    t = collections.defaultdict(list)
    for c in cols:
        t[c['table_name']].append(c)
    out = ['# HealthGuard — database schema & RLS reference', '',
           'Generated from the live Supabase catalogue by `tools/gen_schema_doc.py`.', '',
           '| table | rows |', '|---|---|']
    for k in sorted(t):
        out.append(f'| `{k}` | {counts.get(k, 0)} |')
    for k in sorted(t):
        out += ['', f'## `{k}`', '', '| column | type | null | default |', '|---|---|---|---|']
        for c in t[k]:
            out.append(f"| `{c['column_name']}` | {c['data_type']} | {c['is_nullable']} | {str(c['column_default'] or '')[:48]} |")
        ks = [x for x in cons if x['tbl'] == k]
        if ks:
            out += ['', 'Constraints:'] + [f"- `{x['conname']}` — `{x['def']}`" for x in ks]
    out += ['', '## Indexes', '', '| table | index | definition |', '|---|---|---|']
    for i in idx:
        d = i['indexdef']
        out.append(f"| `{i['tablename']}` | `{i['indexname']}` | `{d[d.index('USING'):][:96]}` |")
    out += ['', '## Row-level security', '',
            '| table | policy | command | visible / writable rows |', '|---|---|---|---|']
    for p in pols:
        expr = ' '.join((p['qual'] or p['with_check'] or 'true').split())
        out.append(f"| `{p['tablename']}` | `{p['policyname']}` | {p['cmd']} | `{expr[:120]}` |")
    out += ['', '## Functions', '', '| function | returns | SECURITY DEFINER |', '|---|---|---|']
    for f in fns:
        out.append(f"| `{f['proname']}({f['args']})` | {f['ret'][:40]} | {'yes' if f['secdef'] else 'no'} |")
    open(os.path.join(ROOT, 'docs/SCHEMA.md'), 'w').write('\n'.join(out) + '\n')
    print('docs/SCHEMA.md regenerated')


if __name__ == '__main__':
    main()
