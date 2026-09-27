// ── Shared page header ───────────────────────────────────────────────────
// Renders the standard header at the current <script> position:
//   line 1: heading (optionally linking to the LeetCode problem)
//   line 2: example / method switcher buttons (only when opts.examples given)
//   line 3: step controls — Step x / y, Prev, Next, Auto, Reset
//   line 4: legend explaining the colors (only when opts.legend given)
//
// renderHeader({
//   title:    '76. Minimum Window Substring',
//   link:     'https://leetcode.com/problems/minimum-window-substring/',  // optional
//   examples: [{ id: 'aab', label: 'aab / ab' }],                          // optional; button id is ex-<id>,
//                                                                          // click calls loadExample(id)
//   examplesLabel: 'Example:',                                             // optional, e.g. 'Method:'
//   legend:   [{ color: 'rgba(249,203,66,0.5)', label: 's[j] enters' }],   // optional
//   controls: false,                                                       // optional — omit step controls (stub pages)
// })
function renderHeader(opts) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const titleHtml = opts.link
    ? `<a class="title-link" href="${esc(opts.link)}" target="_blank" rel="noopener noreferrer">${esc(opts.title)}</a>`
    : esc(opts.title);

  let html = `<div class="header"><h1>${titleHtml}</h1></div>`;

  if (opts.examples && opts.examples.length) {
    html += `<div class="header-row header-examples">` +
      `<span class="examples-label">${esc(opts.examplesLabel || 'Example:')}</span>` +
      opts.examples.map(ex =>
        `<button class="btn ex-btn" id="ex-${esc(ex.id)}" onclick="loadExample('${esc(ex.id)}')">${esc(ex.label)}</button>`
      ).join('') +
      `</div>`;
  }

  if (opts.controls !== false) {
    html += `<div class="header-row ctrl">` +
      `<span class="progress" id="prog">Step 0 / 0</span>` +
      `<button class="btn" id="btnPrev" onclick="go(-1)">← Prev</button>` +
      `<button class="btn" id="btnNext" onclick="go(1)">Next →</button>` +
      `<button class="btn" id="btnAuto" onclick="toggleAuto()">▶ Auto</button>` +
      `<button class="btn" onclick="doReset()">Reset</button>` +
      `</div>`;
  }

  if (opts.legend && opts.legend.length) {
    html += `<div class="header-row"><div class="legend">` +
      opts.legend.map(item =>
        `<span class="leg-item"><span class="leg-box" style="background:${esc(item.color)};${item.extra ? esc(item.extra) : ''}"></span>${esc(item.label)}</span>`
      ).join('') +
      `</div></div>`;
  }

  const wrap = document.createElement('div');
  wrap.className = 'page-header';
  wrap.innerHTML = html;
  const s = document.currentScript;
  s.parentNode.insertBefore(wrap, s);
}

// ── Shared code box ──────────────────────────────────────────────────────
// Renders the standard left-hand code panel at the current <script> position:
//   .code-half > .code-stack > (.step-info#info + .code-panel > .code-block)
// Code is passed as plain Python source and syntax-highlighted automatically —
// never hand-write token spans.
//
// renderCodeBox({
//   code: `class Solution: ...`,     // main source (backtick template literal)
//   prereq: `# class ListNode: ...`, // optional commented prelude block shown
//                                    // above the code; numbered first
//   append: { 11: '<html>' },        // optional per-line HTML appended after
//                                    // the highlighted line (e.g. code-notes)
//   raw: { 12: '<html>' },           // optional per-line raw-HTML override for
//                                    // lines needing custom markup (code-tokens)
//   blocks: [                        // advanced multi-block layout; replaces
//     { html: '<div ...></div>' },   // code/prereq. Either raw chrome…
//     { code: `...` },               // …or a highlighted block. Line numbers
//   ],                               // continue across blocks.
// })
const PY_KEYWORDS = new Set(['def','class','return','if','elif','else','for','while','in','not','and','or','is','None','True','False','import','from','break','continue','pass','lambda','with','as','try','except','finally','yield','global','nonlocal','del','raise','assert']);
const PY_TYPES = new Set(['str','int','float','bool','list','dict','set','tuple','object','List','Dict','Set','Tuple','Optional','Union','deque','Counter','defaultdict','OrderedDict']);

function pyHighlight(line) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let html = '';
  let prevWord = null;
  const re = /(#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_#'"]+)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m[1] != null)      { html += `<span class="cm">${esc(m[1])}</span>`; }
    else if (m[2] != null) { html += `<span class="st">${esc(m[2])}</span>`; prevWord = null; }
    else if (m[3] != null) { html += `<span class="nu">${esc(m[3])}</span>`; prevWord = null; }
    else if (m[4] != null) {
      const w = m[4];
      const after = line.slice(re.lastIndex).match(/^\s*(.)/);
      const nextCh = after ? after[1] : '';
      let cls;
      if (PY_KEYWORDS.has(w)) cls = 'kw';
      else if (prevWord === 'def' || prevWord === 'class' || nextCh === '(' || PY_TYPES.has(w)) cls = 'fn';
      else cls = 'va';
      html += `<span class="${cls}">${esc(w)}</span>`;
      prevWord = w;
    }
    else if (m[5] != null) { html += m[5]; }
    else                   { html += `<span class="op">${esc(m[6])}</span>`; prevWord = null; }
  }
  return html;
}

function renderCodeBox(opts) {
  let n = (opts.firstLine || 1) - 1;
  const lineHtml = (text) => {
    n += 1;
    const raw = opts.raw && opts.raw[n];
    const app = (opts.append && opts.append[n]) || '';
    return `<span class="code-line" data-l="${n}"><span class="ln">${n}</span>${raw != null ? raw : pyHighlight(text)}${app}</span>`;
  };
  const codeBlock = (src, cls) => {
    const lines = String(src).replace(/^\n/, '').replace(/\s+$/, '').split('\n');
    return `<pre class="code-block${cls ? ' ' + cls : ''}">` + lines.map(lineHtml).join('\n') + `</pre>`;
  };
  let inner = '';
  if (opts.prereq) inner += codeBlock(opts.prereq, 'prereq-block');
  if (opts.code) inner += codeBlock(opts.code);
  if (opts.blocks) for (const b of opts.blocks) inner += b.html != null ? b.html : codeBlock(b.code, b.className);
  const wrap = document.createElement('div');
  wrap.className = 'code-half';
  wrap.innerHTML =
    `<div class="code-stack">` +
      `<div class="step-info" id="info"></div>` +
      `<aside class="code-panel">${inner}</aside>` +
    `</div>`;
  const s = document.currentScript;
  s.parentNode.insertBefore(wrap, s);
}

// ── Copy button on every code panel ──────────────────────────────────────
// On DOMContentLoaded, each .code-panel is wrapped in a positioning box and
// gets a top-right Copy button. The copied text is read from the rendered
// .code-line spans at click time — so it works for renderCodeBox() pages and
// hand-built panels alike, and stays correct after example/method switches.
// Line numbers (.ln) and annotation pills (.code-note) are excluded;
// .code-token wrappers keep their text (they wrap real code).
function extractCodeText(panel) {
  const parts = [];
  panel.querySelectorAll('.code-block').forEach(block => {
    const lines = [];
    block.querySelectorAll('.code-line').forEach(lineEl => {
      const clone = lineEl.cloneNode(true);
      clone.querySelectorAll('.ln, .code-note').forEach(el => el.remove());
      lines.push(clone.textContent.replace(/\s+$/, ''));
    });
    parts.push(lines.join('\n'));
  });
  return parts.join('\n\n');
}

function attachCopyButtons() {
  document.querySelectorAll('.code-panel').forEach(panel => {
    if (panel.closest('.code-panel-box')) return;
    const box = document.createElement('div');
    box.className = 'code-panel-box';
    panel.parentNode.insertBefore(box, panel);
    box.appendChild(panel);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
      const text = extractCodeText(panel);
      const done = ok => {
        btn.textContent = ok ? '✓ Copied' : 'Failed';
        btn.classList.toggle('copied', ok);
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        ta.remove();
        done(ok);
      }
    });
    box.appendChild(btn);
  });
}
document.addEventListener('DOMContentLoaded', attachCopyButtons);

// ── Layout stability: max-height lock ────────────────────────────────────
// The step explanation, variable bar, and cards hold step-dependent content,
// so their natural height would change from step to step — a distracting
// vertical jiggle. Per the UI requirements, each white block's HEIGHT is
// pinned to the maximum it will ever need: before first paint we dry-run
// every step once, measure each block, and pin its min-height to the largest
// height observed. Width is intentionally left alone — a block should not be
// pre-stretched to whatever the single longest line across all steps needs;
// each block sizes to its own current content and may vary in width from
// step to step. Runs automatically on DOMContentLoaded; pages that rebuild
// STEPS (example switchers) should call lockStableSizes() again after
// rebuilding — the pinned heights only ever grow, so re-running is safe.
function lockStableSizes() {
  if (typeof STEPS === 'undefined' || !Array.isArray(STEPS) || STEPS.length === 0) return;
  if (typeof render !== 'function' || typeof cur === 'undefined') return;
  const els = Array.from(document.querySelectorAll('.step-info, .var-bar, .card'));
  if (!els.length) return;
  const saved = cur;
  const max = new Map(els.map(el => [el, 0]));
  for (let i = -1; i < STEPS.length; i++) {
    cur = i;
    render();
    for (const el of els) {
      const h = max.get(el);
      if (el.offsetHeight > h) max.set(el, el.offsetHeight);
    }
  }
  for (const [el, h] of max) {
    if (h) el.style.minHeight = h + 'px';
  }
  cur = saved;
  render();
}
document.addEventListener('DOMContentLoaded', () => {
  try { lockStableSizes(); } catch (e) { /* page without the standard STEPS/cur/render globals */ }
});
// Font loading can reflow text after DOMContentLoaded, invalidating the first
// measurement — re-lock once fonts settle (pins only ever grow, so this is safe).
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    try { lockStableSizes(); } catch (e) { /* ignore */ }
  });
}

function highlightLine(line) {
  document.querySelectorAll('.code-line').forEach(el => el.classList.remove('hl'));
  if (line == null) return;
  document.querySelectorAll(`.code-line[data-l="${line}"]`).forEach(el => el.classList.add('hl'));
}

function go(dir) {
  stopAuto();
  const next = cur + dir;
  if (next < 0 || next >= STEPS.length) return;
  cur = next;
  render();
}

function doReset() {
  stopAuto();
  cur = -1;
  render();
}

// ── Autoplay ─────────────────────────────────────────────────────────────
// Click cycles: stopped -> 1x -> 2x -> 3x -> stopped. Base interval is for 1x;
// higher speeds divide it down. Manually navigating (go/doReset) stops autoplay.
const AUTO_BASE_MS = 700;
let autoTimer = null;
let autoSpeed = 0;

function updateAutoBtn() {
  const btn = document.getElementById('btnAuto');
  if (!btn) return;
  btn.textContent = autoSpeed === 0 ? '▶ Auto' : `⏸ ${autoSpeed}x`;
  btn.classList.toggle('auto-active', autoSpeed !== 0);
}

function autoTick() {
  if (cur >= STEPS.length - 1) {
    stopAuto();
    return;
  }
  cur += 1;
  render();
}

function stopAuto() {
  if (autoTimer !== null) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  autoSpeed = 0;
  updateAutoBtn();
}

function startAuto(speed) {
  if (autoTimer !== null) clearInterval(autoTimer);
  autoSpeed = speed;
  autoTimer = setInterval(autoTick, AUTO_BASE_MS / speed);
  updateAutoBtn();
}

function toggleAuto() {
  if (autoSpeed === 0) {
    if (cur >= STEPS.length - 1) {
      cur = -1;
      render();
    }
    startAuto(1);
  } else if (autoSpeed < 3) {
    startAuto(autoSpeed + 1);
  } else {
    stopAuto();
  }
}

// Updates step counter, info text, and nav buttons in one call.
// Pass curStep=-1 for the initial/reset state.
function renderCtrl(curStep, total, info) {
  document.getElementById('prog').textContent = curStep < 0 ? `Step 0 / ${total}` : `Step ${curStep + 1} / ${total}`;
  document.getElementById('info').textContent = info;
  document.getElementById('btnPrev').disabled = curStep <= 0;
  document.getElementById('btnNext').disabled = curStep >= 0 && curStep >= total - 1;
}
