#!/usr/bin/env python3
"""Fetch problem statements for whole chapters -> problems/<num>.html fragments.

Usage:
  python3 scripts/fetch-problems.py chapter-1 chapter-2 chapter-3   # by catalog id
  python3 scripts/fetch-problems.py --slug two-sum --slug 3sum       # ad hoc slugs
  add --force to overwrite fragments that already exist

Reads the slugs straight out of catalog.js (via node, so the catalog stays the
single source of truth), pulls the statement from LeetCode's GraphQL endpoint,
and converts it to the Problem-card fragment format notes.js reads
(plain <p> body + <h3>Example N</h3> / <h3>Constraints</h3>). Premium problems
return no content anonymously; those fall back to the doocs/leetcode GitHub
mirror. Existing fragments are skipped unless --force (hand-written ones like
problems/252.html stay untouched).

Conversion logic is the same as 4-leetcode-fill-in/scripts/fetch-ch09-problems.py
(copied, not imported — the two directories don't reference each other).
"""
import json
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE = HERE.parent
CATALOG = SITE / 'catalog.js'
FRAG_DIR = SITE / 'problems'

QUERY = '''query q($s:String!){question(titleSlug:$s){
  questionFrontendId title titleSlug isPaidOnly content}}'''


def catalog_problems(chapter_ids):
    js = (
        "global.window={};require(process.argv[1]);"
        "const ids=new Set(process.argv.slice(2));const out=[];"
        "window.LC_CATALOG.chapters.filter(c=>ids.has(c.id)).forEach(c=>"
        "c.sections.forEach(s=>s.problems.forEach(p=>{if(p.num&&p.slug)out.push({num:p.num,slug:p.slug,name:p.name})})));"
        "console.log(JSON.stringify(out));"
    )
    res = subprocess.run(['node', '-e', js, str(CATALOG), *chapter_ids],
                         capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def _pre_to_p(pre_html):
    lines = []
    for raw in pre_html.strip('\n').split('\n'):
        line = raw.strip()
        if not line:
            continue
        m = re.match(r'<strong>(\w[\w -]*?):?</strong>\s*(.*)', line)
        if m:
            label, rest = m.group(1), m.group(2)
            if label.lower() == 'explanation':
                lines.append(f'<strong>{label}:</strong> {rest}'.rstrip())
            else:
                lines.append(f'<strong>{label}:</strong>' + (f' <code>{rest}</code>' if rest else ''))
        else:
            lines.append(f'<code>{line}</code>')
    return '<p>' + '<br>'.join(lines) + '</p>'


def _example_block_to_p(div_html):
    parts = []
    for label, io, plain in re.findall(
            r'<p><strong>(\w+):</strong>\s*(?:<span class="example-io">(.*?)</span>|(.*?))</p>', div_html, re.S):
        val = (io or plain).strip()
        if label.lower() == 'explanation':
            parts.append(f'<strong>{label}:</strong> {val}')
        else:
            parts.append(f'<strong>{label}:</strong> <code>{val}</code>')
    return '<p>' + '<br>'.join(parts) + '</p>'


def html_to_fragment(html):
    s = html
    s = re.sub(r'<span data-keyword="[^"]*">(.*?)</span>', r'\1', s, flags=re.S)
    s = re.sub(r'<p>(?:&nbsp;|\s)*</p>', '', s)
    s = re.sub(r'<p><strong(?: class="example")?>([^<:]+?):?</strong></p>', r'<h3>\1</h3>', s)
    s = re.sub(r'<pre>(.*?)</pre>', lambda m: _pre_to_p(m.group(1)), s, flags=re.S)
    s = re.sub(r'<div class="example-block">(.*?)</div>',
               lambda m: _example_block_to_p(m.group(1)), s, flags=re.S)
    s = re.sub(r'<p>\s*(<img[^>]*>)\s*</p>', r'\1', s)
    s = re.sub(r'<img[^>]*?src="([^"]+)"[^>]*>', r'<p><img src="\1" alt=""></p>', s)
    s = re.sub(r'<br\s*/>', '<br>', s)
    s = re.sub(r'\n[ \t]+', '\n', s)
    s = re.sub(r'\n{2,}', '\n', s)
    return s.strip() + '\n'


def fetch(slug):
    body = json.dumps({'query': QUERY, 'variables': {'s': slug}}).encode()
    req = urllib.request.Request(
        'https://leetcode.com/graphql', data=body,
        headers={'Content-Type': 'application/json',
                 'Referer': f'https://leetcode.com/problems/{slug}/',
                 'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)['data']['question']


def fetch_doocs(num, title):
    n = int(num)
    lo = n // 100 * 100
    path = f'solution/{lo:04d}-{lo + 99:04d}/{n:04d}.{title}/README_EN.md'
    url = 'https://raw.githubusercontent.com/doocs/leetcode/main/' + urllib.parse.quote(path)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        md = r.read().decode()
    m = re.search(r'<!-- description:start -->(.*?)<!-- description:end -->', md, re.S)
    return m.group(1).strip() if m else ''


def main(argv):
    force = '--force' in argv
    argv = [a for a in argv if a != '--force']
    slugs, chapters = [], []
    it = iter(argv)
    for a in it:
        if a == '--slug':
            slugs.append({'num': None, 'slug': next(it), 'name': ''})
        else:
            chapters.append(a)
    todo = (catalog_problems(chapters) if chapters else []) + slugs
    if not todo:
        print(__doc__)
        return 2
    FRAG_DIR.mkdir(exist_ok=True)
    seen, missing, written, skipped = set(), [], 0, 0
    for p in todo:
        if p['slug'] in seen:
            continue
        seen.add(p['slug'])
        if p['num'] and (FRAG_DIR / f"{p['num']}.html").exists() and not force:
            skipped += 1
            continue
        try:
            q = fetch(p['slug'])
        except Exception as e:  # noqa: BLE001
            print(f"  !! {p['slug']}: graphql failed: {e}")
            missing.append(p)
            continue
        if not q:
            print(f"  !! {p['slug']}: not found on leetcode")
            missing.append(p)
            continue
        num, title, content = q['questionFrontendId'], q['title'], q['content']
        note = ''
        if not content:
            try:
                content = fetch_doocs(num, title)
                note = ' (premium → doocs mirror)'
            except Exception as e:  # noqa: BLE001
                print(f'  !! {num}. {title}: doocs fallback failed: {e}')
        if not content:
            print(f"  !! {num}. {title}: no content (isPaidOnly={q['isPaidOnly']})")
            missing.append(p)
            continue
        (FRAG_DIR / f'{num}.html').write_text(html_to_fragment(content))
        written += 1
        print(f'  ok {num}. {title}{note}')
    print(f'\nwritten {written}, skipped (already there) {skipped}, missing {len(missing)}')
    if missing:
        print('Missing:')
        for m in missing:
            print(f"  {m['num']}. {m['name']}  https://leetcode.com/problems/{m['slug']}/")
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
