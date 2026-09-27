#!/usr/bin/env python3
"""Fetch Chapter 9 problem statements from LeetCode GraphQL and save as Markdown.

Usage: python3 scripts/fetch-ch09-problems.py
Output: chapters/ch09/ch09-problems-md/<num>. <title>.md   (one Markdown file per problem)
        assets/ch09-problems-desc.js                        (window.CH09_PROBLEM_DESC for index.html)
        ../leetcode-all-in-one/problems/<num>.html          (Problem card fragment for the animation site)
Premium problems (isPaidOnly) return no content anonymously; the statement is
then taken from the doocs/leetcode GitHub mirror.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'chapters' / 'ch09' / 'ch09-problems-md'
DESC_JS = ROOT / 'assets' / 'ch09-problems-desc.js'
# 动画站 Problem 卡读的题面片段（notes.js fetch problems/<题号>.html）
FRAG_DIR = ROOT.parent / 'leetcode-all-in-one' / 'problems'

SECTIONS = {
    'Prefix Sum': ['range-sum-query-immutable', 'maximum-size-subarray-sum-equals-k',
                   'continuous-subarray-sum', 'contiguous-array'],
    'Stack': ['valid-parentheses', 'longest-valid-parentheses', 'trapping-rain-water'],
    'DP': ['coin-change', 'minimum-path-sum', 'decode-ways'],
}

QUERY = '''query q($s:String!){question(titleSlug:$s){
  questionFrontendId title titleSlug difficulty isPaidOnly content
  topicTags{name} similarQuestions codeSnippets{lang code}}}'''


class MD(HTMLParser):
    """Minimal HTML -> Markdown for LeetCode problem content."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.stack = []
        self.in_pre = False
        self.list_depth = 0

    def handle_starttag(self, tag, attrs):
        self.stack.append(tag)
        if tag == 'pre':
            self.in_pre = True
            self.out.append('\n```\n')
        elif tag == 'p':
            self.out.append('\n')
        elif tag in ('strong', 'b'):
            self.out.append('' if self.in_pre else '**')
        elif tag in ('em', 'i'):
            self.out.append('' if self.in_pre else '*')
        elif tag == 'code':
            self.out.append('' if self.in_pre else '`')
        elif tag in ('ul', 'ol'):
            self.list_depth += 1
            self.out.append('\n')
        elif tag == 'li':
            self.out.append('  ' * (self.list_depth - 1) + '- ')
        elif tag == 'sup':
            self.out.append('^')
        elif tag == 'br':
            self.out.append('\n')
        elif tag == 'img':
            src = dict(attrs).get('src', '')
            self.out.append(f'![]({src})')

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        if tag == 'pre':
            self.in_pre = False
            self.out.append('\n```\n')
        elif tag == 'p':
            self.out.append('\n')
        elif tag in ('strong', 'b'):
            self.out.append('' if self.in_pre else '**')
        elif tag in ('em', 'i'):
            self.out.append('' if self.in_pre else '*')
        elif tag == 'code':
            self.out.append('' if self.in_pre else '`')
        elif tag in ('ul', 'ol'):
            self.list_depth -= 1
            self.out.append('\n')
        elif tag == 'li':
            self.out.append('\n')

    def handle_data(self, data):
        if self.in_pre:
            self.out.append(data)
        else:
            data = re.sub(r'\s+', ' ', data)
            if data == ' ' and (not self.out or self.out[-1].endswith('\n')):
                return
            self.out.append(data)

    def text(self):
        s = ''.join(self.out)
        s = s.replace('\xa0', '')
        s = re.sub(r'[ \t]+\n', '\n', s)
        s = re.sub(r'```\n+', '```\n', s)
        s = re.sub(r'\n+```', '\n```', s)
        s = re.sub(r'\n{3,}', '\n\n', s)
        return s.strip() + '\n'


def html_to_md(html):
    p = MD()
    p.feed(html)
    return p.text()


def _pre_to_p(pre_html):
    """LeetCode <pre> example block -> one <p> in the notes fragment format:
    <strong>Input:</strong> <code>..</code><br><strong>Output:</strong> <code>..</code><br>..."""
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
    """LeetCode statement HTML -> leetcode-all-in-one/problems/<num>.html fragment
    (plain <p> body + <h3>Example N</h3> / <h3>Constraints</h3> sections)."""
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
    """Premium fallback: doocs/leetcode mirrors the original statement HTML."""
    n = int(num)
    lo = n // 100 * 100
    path = f'solution/{lo:04d}-{lo + 99:04d}/{n:04d}.{title}/README_EN.md'
    url = 'https://raw.githubusercontent.com/doocs/leetcode/main/' + \
        urllib.parse.quote(path)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        md = r.read().decode()
    m = re.search(r'<!-- description:start -->(.*?)<!-- description:end -->', md, re.S)
    content = m.group(1).strip() if m else ''
    sig = re.search(r'```python\nclass Solution:\n(    def \w+\(self[^\n]*)', md)
    starter = f'class Solution:\n{sig.group(1)}' if sig else ''
    return content, starter


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    missing = []
    desc = {}
    for section, slugs in SECTIONS.items():
        for slug in slugs:
            q = fetch(slug)
            num, title = q['questionFrontendId'], q['title']
            fname = OUT / f'{num}. {title}.md'
            content = q['content']
            py = next((c['code'] for c in q['codeSnippets'] or [] if c['lang'] == 'Python3'), '')
            source = ''
            if not content:
                try:
                    content, py = fetch_doocs(num, title)
                    source = ' (statement mirrored from doocs/leetcode; premium on leetcode.com)'
                except Exception as e:  # noqa: BLE001
                    print(f'  !! doocs fallback failed for {num}: {e}')
            if not content:
                missing.append((num, title, slug))
                print(f'  !! {num}. {title}: no content (isPaidOnly={q["isPaidOnly"]})')
                continue
            tags = ', '.join(t['name'] for t in q['topicTags'])
            md = [f'# {num}. {title}', '',
                  f'- Section: {section}',
                  f'- Difficulty: {q["difficulty"]}',
                  f'- Tags: {tags}',
                  f'- Link: https://leetcode.com/problems/{slug}/{source}', '',
                  '## Description', '',
                  html_to_md(content)]
            if py:
                md += ['## Starter Code', '', '```python', py.rstrip(), '```', '']
            fname.write_text('\n'.join(md))
            print(f'  ok {fname.name}')
            desc[num] = {'difficulty': q['difficulty'], 'tags': tags,
                         'html': content, 'source': source.strip(' ()')}
            (FRAG_DIR / f'{num}.html').write_text(html_to_fragment(content))
    print(f'  ok {FRAG_DIR.relative_to(ROOT.parent)}/<num>.html')
    DESC_JS.write_text(
        '/* Chapter 9 problem statements — generated by scripts/fetch-ch09-problems.py, do not edit */\n'
        'window.CH09_PROBLEM_DESC = '
        + json.dumps(desc, ensure_ascii=False, indent=2) + ';\n')
    print(f'  ok {DESC_JS.relative_to(ROOT)}')
    if missing:
        print('\nMissing (premium, fetch via a logged-in browser):')
        for m in missing:
            print(f'  {m[0]}. {m[1]}  https://leetcode.com/problems/{m[2]}/')
        sys.exit(1)


if __name__ == '__main__':
    main()
