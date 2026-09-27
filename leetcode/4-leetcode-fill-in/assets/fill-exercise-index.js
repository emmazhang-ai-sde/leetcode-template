/**
 * index 填空主栏：CH01 题单、代码表渲染、按钮、侧栏分类与 tab 状态（不含课件 iframe 切换）
 */
const FB = window.FillBlanks;
if (!FB) {
  throw new Error('Missing assets/fill-blanks.js');
}

const PROBLEM_ORDER_TEMPLATE = ['704', '702', '74', '240'];
const PROBLEM_ORDER_OOXX = ['34', '35', '162', '278', '153', '33'];
const PROBLEM_ORDER = [...PROBLEM_ORDER_TEMPLATE, ...PROBLEM_ORDER_OOXX];

const PROBLEMS = window.CH01_PROBLEMS;
if (!Array.isArray(PROBLEMS) || PROBLEMS.length === 0) {
  console.error('Run npm run build:ch01 to generate assets/ch01-problems-bundle.js');
}
(function validateCh01Order() {
  if (!PROBLEMS || PROBLEMS.length !== PROBLEM_ORDER.length) return;
  for (let i = 0; i < PROBLEM_ORDER.length; i++) {
    if (PROBLEMS[i].num !== PROBLEM_ORDER[i]) {
      console.warn(`CH01_PROBLEMS[${i}].num is ${PROBLEMS[i].num}, expected ${PROBLEM_ORDER[i]} — run npm run build:ch01`);
    }
  }
})();

const CH2_TR = window.CH02_FILL_TRAVERSAL;
const CH2_DF = window.CH02_FILL_DFS;
const CH3_BT = window.CH03_FILL_BFS_TREE || [];
const CH3_TOPO = window.CH03_FILL_TOPO || [];
const CH3_DIJKSTRA = window.CH03_FILL_DIJKSTRA || [];

const CH5_BFS = window.CH05_FILL_BFS || [];
const CH5_DFS = window.CH05_FILL_DFS_BACKTRACK || [];
const CH5_GT = window.CH05_FILL_GRAPH_THEORY || [];
const CH5_TOPO = window.CH05_FILL_TOPO || [];
const CH5_UF = window.CH05_FILL_UNION_FIND || [];

const CH6_TP1 = window.CH06_FILL_TP1 || [];
const CH6_TP2 = window.CH06_FILL_TP2 || [];
const CH6_TP3 = window.CH06_FILL_TP3 || [];
const CH6_TP4 = window.CH06_FILL_TP4 || [];
const CH6_TP5 = window.CH06_FILL_TP5 || [];
const CH6_LL1 = window.CH06_FILL_LL1 || [];
const CH6_LL2 = window.CH06_FILL_LL2 || [];
const CH6_EXTRA = window.CH06_FILL_EXTRA || [];

const CH7_HEAP = window.CH07_FILL_HEAP || [];
const CH7_TOPK = window.CH07_FILL_TOPK || [];
const CH7_MONO = window.CH07_FILL_MONO || [];

const CH8_SW    = window.CH08_FILL_SW    || [];
const CH8_SWEEP = window.CH08_FILL_SWEEP || [];

const CH9_PS    = window.CH09_FILL_PS    || [];
const CH9_STACK = window.CH09_FILL_STACK || [];
const CH9_DP    = window.CH09_FILL_DP    || [];

// 题面数据（按题号索引）；目前只有 Chapter 9，其他章节补齐后在这里 Object.assign 进来
const PROBLEM_DESC = Object.assign({}, window.CH09_PROBLEM_DESC || {});

const inputs = [];
let currentIdx = 0;

function indexFromNum(numStr) {
  if (!PROBLEMS || !PROBLEMS.length) return 0;
  const i = PROBLEMS.findIndex((p) => p.num === String(numStr));
  return i >= 0 ? i : 0;
}

function findCh3Problem(num, group) {
  const arr = group === 'bfsTree' ? CH3_BT : group === 'topo' ? CH3_TOPO : CH3_DIJKSTRA;
  return arr.find(function(p) { return p.num === String(num); }) || null;
}

function findCh5Problem(num, group) {
  const arr = group === 'bfs' ? CH5_BFS : group === 'dfs' ? CH5_DFS : group === 'graphTheory' ? CH5_GT : group === 'topo' ? CH5_TOPO : CH5_UF;
  return arr.find(function(p) { return p.num === String(num); }) || null;
}

function findCh9Problem(num, group) {
  const map = { ps: CH9_PS, stack: CH9_STACK, dp: CH9_DP };
  return (map[group] || []).find(function(p) { return p.num === String(num); }) || null;
}

function findCh8Problem(num, group) {
  const map = { sw: CH8_SW, sweep: CH8_SWEEP };
  return (map[group] || []).find(function(p) { return p.num === String(num); }) || null;
}

function findCh7Problem(num, group) {
  const map = { heap: CH7_HEAP, topk: CH7_TOPK, mono: CH7_MONO };
  return (map[group] || []).find(function(p) { return p.num === String(num); }) || null;
}

function findCh6Problem(num, group) {
  const map = { tp1: CH6_TP1, tp2: CH6_TP2, tp3: CH6_TP3, tp4: CH6_TP4, tp5: CH6_TP5, ll1: CH6_LL1, ll2: CH6_LL2, extra: CH6_EXTRA };
  return (map[group] || []).find(function(p) { return p.num === String(num); }) || null;
}

function setHashSilently(fragment) {
  const target = fragment.startsWith('#') ? fragment : '#' + fragment;
  if (location.hash === target) return;
  history.replaceState(null, '', location.pathname + location.search + target);
}

function parseHash() {
  let raw = (location.hash || '').replace(/^#/, '').trim();
  try {
    raw = decodeURIComponent(raw);
  } catch (_) {}
  if (!raw) return { kind: 'problem', num: PROBLEM_ORDER[0] };
  const pm = /^p-(\d+)$/.exec(raw);
  if (pm) return { kind: 'problem', num: pm[1] };
  if (raw === 'notes-ch1') return { kind: 'notes', chapter: 1 };
  if (raw === 'notes-ch2') return { kind: 'notes', chapter: 2 };
  if (raw === 'notes-ch3') return { kind: 'notes', chapter: 3 };
  if (raw === 'notes-ch4') return { kind: 'notes', chapter: 4 };
  if (raw === 'notes-ch5') return { kind: 'notes', chapter: 5 };
  if (raw === 'notes-ch6') return { kind: 'notes', chapter: 6 };
  const ch6m = /^ch6-(tp1|tp2|tp3|tp4|tp5|ll1|ll2|extra)-(.+)$/.exec(raw);
  if (ch6m) return { kind: 'ch6Problem', group: ch6m[1], num: ch6m[2] };
  const ch7m = /^ch7-(heap|topk|mono)-(.+)$/.exec(raw);
  if (ch7m) return { kind: 'ch7Problem', group: ch7m[1], num: ch7m[2] };
  const ch8m = /^ch8-(sw|sweep)-(.+)$/.exec(raw);
  if (ch8m) return { kind: 'ch8Problem', group: ch8m[1], num: ch8m[2] };
  const ch9m = /^ch9-(ps|stack|dp)-(.+)$/.exec(raw);
  if (ch9m) return { kind: 'ch9Problem', group: ch9m[1], num: ch9m[2] };
  if (raw === 'notes-ch8') return { kind: 'notes', chapter: 8 };
  if (raw === 'notes-ch7') return { kind: 'notes', chapter: 7 };
  if (raw === 'notes-ch8') return { kind: 'notes', chapter: 8 }
  if (raw === 'ch2-tree-py') return { kind: 'ch2TreePy' };
  const ch2m = /^ch2-p-(\d+)$/.exec(raw);
  if (ch2m) return { kind: 'ch2Problem', num: ch2m[1] };
  // Ch3 problems
  const ch3m = /^ch3-(bfsTree|topo|dijkstra)-(\d+)$/.exec(raw);
  if (ch3m) return { kind: 'ch3Problem', group: ch3m[1], num: ch3m[2] };
  // Ch5 problems
  const ch5m = /^ch5-(bfs|dfs|graphTheory|topo|uf)-(\d+)$/.exec(raw);
  if (ch5m) return { kind: 'ch5Problem', group: ch5m[1], num: ch5m[2] };
  return { kind: 'problem', num: PROBLEM_ORDER[0] };
}

function checkAll() {
  FB.checkAll(inputs);
}

function resetAll() {
  FB.resetAll(inputs);
}

function copyMergedCode() {
  const panel = document.getElementById('probPanel');
  const root = panel && panel.querySelector('.code-with-actions') ? panel.querySelector('.code-with-actions') : document.body;
  FB.copyMergedCode(root);
}

function updateChrome(p) {
  document.getElementById('probNum').textContent = p.num + '.';
  document.getElementById('probName').textContent = p.name;
  const probLink = document.getElementById('probLink');
  probLink.href = p.url;
  probLink.setAttribute('target', '_blank');
  probLink.setAttribute('rel', 'noopener noreferrer');
  document.title = 'Chapter 1: Binary Search（二分法）· ' + p.num + '. ' + p.name;
  if (typeof window.setRepoCornerBlob === 'function') {
    window.setRepoCornerBlob(p.num, p.name);
  }
  if (typeof window.setRepoCornerBlobVisible === 'function') {
    window.setRepoCornerBlobVisible(true);
  }
}

function updateChromeCh2(p) {
  document.getElementById('probNum').textContent = p.num + '.';
  document.getElementById('probName').textContent = p.name;
  const probLink = document.getElementById('probLink');
  probLink.href = p.url;
  probLink.setAttribute('target', '_blank');
  probLink.setAttribute('rel', 'noopener noreferrer');
  document.title = 'Chapter 2: Binary Trees + Divide and Conquer · ' + p.num + '. ' + p.name;
  if (typeof window.setRepoCornerBlob === 'function') {
    window.setRepoCornerBlob(p.num, p.name);
  }
  if (typeof window.setRepoCornerBlobVisible === 'function') {
    window.setRepoCornerBlobVisible(true);
  }
}

function setCh2CategoryHeads(group) {
  const t = document.getElementById('navCategoryCh2Template');
  const tr = document.getElementById('navCategoryCh2Traversal');
  const d = document.getElementById('navCategoryCh2Dfs');
  if (!t || !tr || !d) return;
  t.classList.toggle('is-active', group === 'template');
  tr.classList.toggle('is-active', group === 'traversal');
  d.classList.toggle('is-active', group === 'dfs');
}

function setCh3CategoryHeads(group) {
  const bt = document.getElementById('navCategoryCh3BfsTree');
  const topo = document.getElementById('navCategoryCh3Topo');
  const d = document.getElementById('navCategoryCh3Dijkstra');
  if (!bt || !topo || !d) return;
  bt.classList.toggle('is-active', group === 'bfsTree');
  topo.classList.toggle('is-active', group === 'topo');
  d.classList.toggle('is-active', group === 'dijkstra');
}

function setCh5CategoryHeads(group) {
  const bfs = document.getElementById('navCategoryCh5Bfs');
  const dfs = document.getElementById('navCategoryCh5Dfs');
  const gt = document.getElementById('navCategoryCh5GraphTheory');
  const topo = document.getElementById('navCategoryCh5Topo');
  const uf = document.getElementById('navCategoryCh5Uf');
  if (!bfs || !dfs || !gt || !topo || !uf) return;
  bfs.classList.toggle('is-active', group === 'bfs');
  dfs.classList.toggle('is-active', group === 'dfs');
  gt.classList.toggle('is-active', group === 'graphTheory');
  topo.classList.toggle('is-active', group === 'topo');
  uf.classList.toggle('is-active', group === 'uf');
}

function clearCh2TabSelection() {
  document.querySelectorAll('#ch2Tabs .prob-tab, #ch2TraversalTabs .prob-tab, #ch2DfsTabs .prob-tab').forEach((btn) => {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
}

function clearCh3TabSelection() {
  document.querySelectorAll('#ch3BfsTreeTabs .prob-tab, #ch3TopoTabs .prob-tab, #ch3DijkstraTabs .prob-tab').forEach((btn) => {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
}

function clearCh5TabSelection() {
  document.querySelectorAll(
    '#ch5BfsTabs .prob-tab, #ch5DfsTabs .prob-tab, #ch5GraphTheoryTabs .prob-tab, #ch5TopoTabs .prob-tab, #ch5UfTabs .prob-tab'
  ).forEach((btn) => {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
}

function clearCh9TabSelection() {
  document.querySelectorAll(
    '#ch9PsTabs .prob-tab, #ch9StackTabs .prob-tab, #ch9DpTabs .prob-tab'
  ).forEach(function(btn) {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
}

function setCh9CategoryHeads(group) {
  var defs = [
    ['navCategoryCh9Ps',    'ps'],
    ['navCategoryCh9Stack', 'stack'],
    ['navCategoryCh9Dp',    'dp'],
  ];
  defs.forEach(function(pair) {
    var el = document.getElementById(pair[0]);
    if (el) el.classList.toggle('is-active', pair[1] === group);
  });
}

function clearCh8TabSelection() {
  document.querySelectorAll(
    '#ch8SwTabs .prob-tab, #ch8SweepTabs .prob-tab'
  ).forEach(function(btn) {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
}

function setCh8CategoryHeads(group) {
  var defs = [
    ['navCategoryCh8Sw',    'sw'],
    ['navCategoryCh8Sweep', 'sweep'],
  ];
  defs.forEach(function(pair) {
    var el = document.getElementById(pair[0]);
    if (el) el.classList.toggle('is-active', pair[1] === group);
  });
}

function clearCh7TabSelection() {
  document.querySelectorAll(
    '#ch7HeapTabs .prob-tab, #ch7TopKTabs .prob-tab, #ch7MonoTabs .prob-tab'
  ).forEach(function(btn) {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
}

function setCh7CategoryHeads(group) {
  var defs = [
    ['navCategoryCh7Heap', 'heap'],
    ['navCategoryCh7TopK', 'topk'],
    ['navCategoryCh7Mono', 'mono'],
  ];
  defs.forEach(function(pair) {
    var el = document.getElementById(pair[0]);
    if (el) el.classList.toggle('is-active', pair[1] === group);
  });
}

function clearCh6TabSelection() {
  document.querySelectorAll(
    '#ch6Tp1Tabs .prob-tab, #ch6Tp2Tabs .prob-tab, #ch6Tp3Tabs .prob-tab, #ch6Tp4Tabs .prob-tab, #ch6Tp5Tabs .prob-tab, #ch6Ll1Tabs .prob-tab, #ch6Ll2Tabs .prob-tab, #ch6ExtraTabs .prob-tab'
  ).forEach(function(btn) {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
}

function setCh6CategoryHeads(group) {
  var defs = [
    ['navCategoryCh6Tp1', 'tp1'],
    ['navCategoryCh6Tp2', 'tp2'],
    ['navCategoryCh6Tp3', 'tp3'],
    ['navCategoryCh6Tp4', 'tp4'],
    ['navCategoryCh6Tp5', 'tp5'],
    ['navCategoryCh6Ll1', 'll1'],
    ['navCategoryCh6Ll2', 'll2'],
    ['navCategoryCh6Extra', 'extra'],
  ];
  defs.forEach(function(pair) {
    var el = document.getElementById(pair[0]);
    if (el) el.classList.toggle('is-active', pair[1] === group);
  });
}

function hideChapterNotesPanels456() {
  const notesPanelCh4 = document.getElementById('chapter4NotesPanel');
  const notesPanelCh5 = document.getElementById('chapter5NotesPanel');
  const notesPanelCh6 = document.getElementById('chapter6NotesPanel');
  if (notesPanelCh4) notesPanelCh4.hidden = true;
  if (notesPanelCh5) notesPanelCh5.hidden = true;
  if (notesPanelCh6) notesPanelCh6.hidden = true;
}

function setCh2TemplateTabSelected(selected) {
  const btn = document.getElementById('ch2TabTreePython');
  if (!btn) return;
  btn.classList.toggle('is-selected', selected);
  btn.setAttribute('aria-selected', selected ? 'true' : 'false');
}

function updateNavCategoryHeads(idx, opts) {
  opts = opts || {};
  const notesMode = opts.notesMode === true;
  const notesCh7Mode = opts.notesCh7Mode === true;
  const notesCh2Mode = opts.notesCh2Mode === true;
  const notesCh3Mode = opts.notesCh3Mode === true;
  const notesCh4Mode = opts.notesCh4Mode === true;
  const notesCh5Mode = opts.notesCh5Mode === true;
  const notesCh6Mode = opts.notesCh6Mode === true;
  const ch2TreePyMode = opts.ch2TreePyMode === true;
  const ch2FillGroup = opts.ch2FillGroup;
  const ch3FillGroup = opts.ch3FillGroup;
  const ch5FillGroup = opts.ch5FillGroup;
  const ch6FillGroup = opts.ch6FillGroup;
  const ch7FillGroup = opts.ch7FillGroup;
  const ch8FillGroup = opts.ch8FillGroup;
  const ch9FillGroup = opts.ch9FillGroup;
  const notesCh8Mode = opts.notesCh8Mode === true;
  const notesCh9Mode = opts.notesCh9Mode === true;
  const ch2ProblemFill = ch2FillGroup === 'traversal' || ch2FillGroup === 'dfs';
  const ch3ProblemFill = ch3FillGroup === 'bfsTree' || ch3FillGroup === 'topo' || ch3FillGroup === 'dijkstra';
  const ch5ProblemFill =
    ch5FillGroup === 'bfs' ||
    ch5FillGroup === 'dfs' ||
    ch5FillGroup === 'graphTheory' ||
    ch5FillGroup === 'topo' ||
    ch5FillGroup === 'uf';
  const ch6ProblemFill =
    ch6FillGroup === 'tp1' || ch6FillGroup === 'tp2' || ch6FillGroup === 'tp3' ||
    ch6FillGroup === 'tp4' || ch6FillGroup === 'tp5' || ch6FillGroup === 'll1' ||
    ch6FillGroup === 'll2' || ch6FillGroup === 'extra';
  const ch7ProblemFill = ch7FillGroup === 'heap' || ch7FillGroup === 'topk' || ch7FillGroup === 'mono';
  const ch8ProblemFill = ch8FillGroup === 'sw' || ch8FillGroup === 'sweep';
  const ch9ProblemFill = ch9FillGroup === 'ps' || ch9FillGroup === 'stack' || ch9FillGroup === 'dp';
  const anyChNoteMode = notesCh9Mode || notesCh8Mode || notesCh7Mode || notesCh2Mode || notesCh3Mode || notesCh4Mode || notesCh5Mode || notesCh6Mode;
  const nTpl = PROBLEM_ORDER_TEMPLATE.length;
  const notesEl = document.getElementById('navCategoryNotes');
  const notesCh2El = document.getElementById('navCategoryNotesCh2');
  const notesCh3El = document.getElementById('navCategoryNotesCh3');
  const notesCh4El = document.getElementById('navCategoryNotesCh4');
  const notesCh5El = document.getElementById('navCategoryNotesCh5');
  const notesCh6El = document.getElementById('navCategoryNotesCh6');
  const notesCh7El = document.getElementById('navCategoryNotesCh7');
  const tpl = document.getElementById('navCategoryTemplate');
  const ooxx = document.getElementById('navCategoryOoxx');
  if (notesEl) {
    notesEl.classList.toggle('is-active', notesMode && !anyChNoteMode && !ch2TreePyMode);
    notesEl.setAttribute('aria-expanded', notesMode && !anyChNoteMode && !ch2TreePyMode ? 'true' : 'false');
  }
  if (notesCh2El) {
    notesCh2El.classList.toggle('is-active', notesCh2Mode && !ch2TreePyMode);
    notesCh2El.setAttribute('aria-expanded', notesCh2Mode && !ch2TreePyMode ? 'true' : 'false');
  }
  if (notesCh3El) {
    notesCh3El.classList.toggle('is-active', notesCh3Mode);
    notesCh3El.setAttribute('aria-expanded', notesCh3Mode ? 'true' : 'false');
  }
  if (notesCh4El) {
    notesCh4El.classList.toggle('is-active', notesCh4Mode);
    notesCh4El.setAttribute('aria-expanded', notesCh4Mode ? 'true' : 'false');
  }
  if (notesCh5El) {
    notesCh5El.classList.toggle('is-active', notesCh5Mode);
    notesCh5El.setAttribute('aria-expanded', notesCh5Mode ? 'true' : 'false');
  }
  if (notesCh6El) {
    notesCh6El.classList.toggle('is-active', notesCh6Mode);
    notesCh6El.setAttribute('aria-expanded', notesCh6Mode ? 'true' : 'false');
  }
  if (notesCh7El) {
    notesCh7El.classList.toggle('is-active', notesCh7Mode);
    notesCh7El.setAttribute('aria-expanded', notesCh7Mode ? 'true' : 'false');
  }
  if (tpl && ooxx) {
    if (notesMode || anyChNoteMode || ch2TreePyMode || ch2ProblemFill || ch3ProblemFill || ch5ProblemFill || ch6ProblemFill || ch7ProblemFill || ch8ProblemFill || ch9ProblemFill) {
      tpl.classList.remove('is-active');
      ooxx.classList.remove('is-active');
    } else {
      const templateActive = idx < nTpl;
      tpl.classList.toggle('is-active', templateActive);
      ooxx.classList.toggle('is-active', !templateActive);
    }
  }
  if ('ch2FillGroup' in opts) {
    setCh2CategoryHeads(opts.ch2FillGroup);
  } else {
    setCh2CategoryHeads(null);
  }
  if ('ch3FillGroup' in opts) {
    setCh3CategoryHeads(opts.ch3FillGroup);
  } else {
    setCh3CategoryHeads(null);
  }
  if ('ch5FillGroup' in opts) {
    setCh5CategoryHeads(opts.ch5FillGroup);
  } else {
    setCh5CategoryHeads(null);
  }
  if ('ch6FillGroup' in opts) {
    setCh6CategoryHeads(opts.ch6FillGroup);
  } else {
    setCh6CategoryHeads(null);
  }
  if ('ch7FillGroup' in opts) {
    setCh7CategoryHeads(opts.ch7FillGroup);
  } else {
    setCh7CategoryHeads(null);
  }
  if ('ch8FillGroup' in opts) {
    setCh8CategoryHeads(opts.ch8FillGroup);
  } else {
    setCh8CategoryHeads(null);
  }
  if ('ch9FillGroup' in opts) {
    setCh9CategoryHeads(opts.ch9FillGroup);
  } else {
    setCh9CategoryHeads(null);
  }
}

function setTabSelected(idx) {
  const nTpl = PROBLEM_ORDER_TEMPLATE.length;
  document.querySelectorAll('#probTabs .prob-tab').forEach((btn, i) => {
    btn.classList.toggle('is-selected', i === idx);
    btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
  });
  document.querySelectorAll('#ooxxTabs .prob-tab').forEach((btn, i) => {
    const globalIdx = nTpl + i;
    btn.classList.toggle('is-selected', globalIdx === idx);
    btn.setAttribute('aria-selected', globalIdx === idx ? 'true' : 'false');
  });
  clearCh5TabSelection();
  updateNavCategoryHeads(idx, {
    notesMode: false,
    notesCh7Mode: false,
    notesCh2Mode: false,
    notesCh3Mode: false,
    ch2TreePyMode: false,
    ch2FillGroup: null,
    ch3FillGroup: null,
  });
}

function normalizeSolutions(p) {
  if (Array.isArray(p.solutions) && p.solutions.length > 0) {
    return { layout: p.layout || 'stack', solutions: p.solutions };
  }
  return { layout: 'stack', solutions: [{ title: null, codeTableHtml: p.codeTableHtml }] };
}

function renderProblemDesc(p) {
  const box = document.getElementById('probDesc');
  if (!box) return;
  const d = p && p.num ? PROBLEM_DESC[String(p.num)] : null;
  if (!d) { box.hidden = true; return; }
  const meta = [d.difficulty, d.tags].filter(Boolean).join(' · ') +
    (d.source ? '  (' + d.source + ')' : '');
  document.getElementById('probDescMeta').textContent = meta;
  document.getElementById('probDescBody').innerHTML = d.html;
  box.hidden = false;
}

function renderSolutions(p, container) {
  renderProblemDesc(p);
  const norm = normalizeSolutions(p);
  inputs.length = 0;
  container.className = 'prob-solutions prob-solutions--' + norm.layout;
  container.innerHTML = '';
  norm.solutions.forEach(function (sol) {
    const col = document.createElement('div');
    col.className = 'fill-sol';
    if (sol.title) {
      const h = document.createElement('h2');
      h.className = 'fill-sol-title';
      h.textContent = sol.title;
      col.appendChild(h);
    }
    const area = document.createElement('div');
    area.className = 'code-area';
    const table = document.createElement('table');
    table.className = 'code-table';
    table.innerHTML = sol.codeTableHtml;
    area.appendChild(table);
    col.appendChild(area);
    container.appendChild(col);
    FB.initBlanks(table).forEach(function (inp) { inputs.push(inp); });
  });
}

function showCh2TreePythonTemplate() {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(2);
  const T = window.CH02_TREE_PYTHON_TEMPLATE;
  if (!T || !T.codeTableHtml) {
    console.error('Missing assets/ch02-tree-python-template.js');
    return;
  }
  const notesPanel = document.getElementById('chapterNotesPanel');
  const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
  const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
  const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
  const probPanel = document.getElementById('probPanel');
  if (notesPanel) notesPanel.hidden = true;
  if (notesPanelCh2) notesPanelCh2.hidden = true;
  if (notesPanelCh3) notesPanelCh3.hidden = true;
  if (notesPanelCh7) notesPanelCh7.hidden = true;
  hideChapterNotesPanels456();
  if (probPanel) probPanel.hidden = false;

  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach((btn) => {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection();
  clearCh3TabSelection();
  clearCh5TabSelection();
  setCh2TemplateTabSelected(true);

  renderSolutions(T, document.getElementById('prob-solutions'));

  document.getElementById('probNum').textContent = 'Ch2 · ';
  document.getElementById('probName').textContent = T.title;
  const probLink = document.getElementById('probLink');
  probLink.href = '#';
  probLink.removeAttribute('target');

  document.title = 'Chapter 2: Binary Trees + Divide and Conquer · Tree Python 模板';
  if (typeof window.setRepoCornerBlobVisible === 'function') {
    window.setRepoCornerBlobVisible(false);
  }
  updateNavCategoryHeads(0, {
    notesMode: false,
    notesCh7Mode: false,
    notesCh2Mode: false,
    notesCh3Mode: false,
    ch2TreePyMode: true,
    ch2FillGroup: 'template',
    ch3FillGroup: null,
  });
  document.getElementById('score').textContent = '';
  setHashSilently('#ch2-tree-py');
}

function renderCh2Problem(numStr) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(2);
  const tr = Array.isArray(CH2_TR) ? CH2_TR : [];
  const df = Array.isArray(CH2_DF) ? CH2_DF : [];
  let p = tr.find((x) => x.num === String(numStr));
  let group = 'traversal';
  if (!p) {
    p = df.find((x) => x.num === String(numStr));
    group = 'dfs';
  }
  if (!p) {
    console.warn('Unknown CH2 fill problem:', numStr);
    showCh2TreePythonTemplate();
    return;
  }

  const notesPanel = document.getElementById('chapterNotesPanel');
  const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
  const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
  const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
  const probPanel = document.getElementById('probPanel');
  if (notesPanel) notesPanel.hidden = true;
  if (notesPanelCh2) notesPanelCh2.hidden = true;
  if (notesPanelCh3) notesPanelCh3.hidden = true;
  if (notesPanelCh7) notesPanelCh7.hidden = true;
  hideChapterNotesPanels456();
  if (probPanel) probPanel.hidden = false;

  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach((btn) => {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection();
  clearCh3TabSelection();
  clearCh5TabSelection();
  const tabBtn = document.getElementById(group === 'traversal' ? 'ch2-tab-tr-' + p.num : 'ch2-tab-dfs-' + p.num);
  if (tabBtn) {
    tabBtn.classList.add('is-selected');
    tabBtn.setAttribute('aria-selected', 'true');
  }

  renderSolutions(p, document.getElementById('prob-solutions'));
  updateChromeCh2(p);
  updateNavCategoryHeads(0, {
    notesMode: false,
    notesCh7Mode: false,
    notesCh2Mode: false,
    notesCh3Mode: false,
    ch2TreePyMode: false,
    ch2FillGroup: group === 'traversal' ? 'traversal' : 'dfs',
    ch3FillGroup: null,
  });

  document.getElementById('score').textContent = '';
  setHashSilently('#ch2-p-' + p.num);
}

function openCh3Problem(p, group) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(3);
  const notesPanel = document.getElementById('chapterNotesPanel');
  const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
  const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
  const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
  const probPanel = document.getElementById('probPanel');
  if (notesPanel) notesPanel.hidden = true;
  if (notesPanelCh2) notesPanelCh2.hidden = true;
  if (notesPanelCh3) notesPanelCh3.hidden = true;
  if (notesPanelCh7) notesPanelCh7.hidden = true;
  hideChapterNotesPanels456();
  if (probPanel) probPanel.hidden = false;

  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach((btn) => {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection();
  clearCh3TabSelection();
  clearCh5TabSelection();
  const groupPrefix = group === 'bfsTree' ? 'ch3-tab-bt-' : group === 'topo' ? 'ch3-tab-topo-' : 'ch3-tab-dj-';
  const tabBtn = document.getElementById(groupPrefix + p.num);
  if (tabBtn) {
    tabBtn.classList.add('is-selected');
    tabBtn.setAttribute('aria-selected', 'true');
  }

  renderSolutions(p, document.getElementById('prob-solutions'));

  document.getElementById('probNum').textContent = p.num + '.';
  document.getElementById('probName').textContent = p.name;
  const probLink = document.getElementById('probLink');
  probLink.href = p.url;
  probLink.setAttribute('target', '_blank');
  probLink.setAttribute('rel', 'noopener noreferrer');
  document.title = 'Chapter 3: BFS + Topological Sorting · ' + p.num + '. ' + p.name;

  updateNavCategoryHeads(0, {
    notesMode: false,
    notesCh7Mode: false,
    notesCh2Mode: false,
    notesCh3Mode: false,
    ch2TreePyMode: false,
    ch2FillGroup: null,
    ch3FillGroup: group,
  });
  document.getElementById('score').textContent = '';
  setHashSilently('#ch3-' + group + '-' + p.num);
}

function openCh5Problem(p, group) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(5);
  const notesPanel = document.getElementById('chapterNotesPanel');
  const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
  const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
  const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
  const probPanel = document.getElementById('probPanel');
  if (notesPanel) notesPanel.hidden = true;
  if (notesPanelCh2) notesPanelCh2.hidden = true;
  if (notesPanelCh3) notesPanelCh3.hidden = true;
  if (notesPanelCh7) notesPanelCh7.hidden = true;
  hideChapterNotesPanels456();
  if (probPanel) probPanel.hidden = false;

  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach((btn) => {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection();
  clearCh3TabSelection();
  clearCh5TabSelection();
  setCh2TemplateTabSelected(false);

  const prefix =
    group === 'bfs'
      ? 'ch5-tab-bfs-'
      : group === 'dfs'
        ? 'ch5-tab-dfs-'
        : group === 'graphTheory'
          ? 'ch5-tab-gt-'
          : group === 'topo'
            ? 'ch5-tab-topo-'
            : 'ch5-tab-uf-';
  const tabBtn = document.getElementById(prefix + p.num);
  if (tabBtn) {
    tabBtn.classList.add('is-selected');
    tabBtn.setAttribute('aria-selected', 'true');
  }

  renderSolutions(p, document.getElementById('prob-solutions'));

  document.getElementById('probNum').textContent = p.num + '.';
  document.getElementById('probName').textContent = p.name;
  const probLink = document.getElementById('probLink');
  probLink.href = p.url;
  probLink.setAttribute('target', '_blank');
  probLink.setAttribute('rel', 'noopener noreferrer');
  document.title = 'Chapter 5: Graph · ' + p.num + '. ' + p.name;

  updateNavCategoryHeads(0, {
    notesMode: false,
    notesCh7Mode: false,
    notesCh2Mode: false,
    notesCh3Mode: false,
    notesCh5Mode: false,
    ch2TreePyMode: false,
    ch2FillGroup: null,
    ch3FillGroup: null,
    ch5FillGroup: group,
  });
  document.getElementById('score').textContent = '';
  setHashSilently('#ch5-' + group + '-' + p.num);
}

function openCh9Problem(p, group) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(9);
  ['chapterNotesPanel','chapter2NotesPanel','chapter3NotesPanel',
   'chapter7NotesPanel','chapter8NotesPanel','chapter9NotesPanel'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.hidden = true;
  });
  hideChapterNotesPanels456();
  document.getElementById('probPanel').hidden = false;

  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach(function(btn) {
    btn.classList.remove('is-selected'); btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection(); clearCh3TabSelection();
  clearCh5TabSelection(); clearCh6TabSelection();
  clearCh7TabSelection(); clearCh8TabSelection(); clearCh9TabSelection();
  setCh2TemplateTabSelected(false);

  const tabBtn = document.getElementById('ch9-tab-' + group + '-' + p.num);
  if (tabBtn) { tabBtn.classList.add('is-selected'); tabBtn.setAttribute('aria-selected', 'true'); }

  renderSolutions(p, document.getElementById('prob-solutions'));
  document.getElementById('probNum').textContent = p.num + '.';
  document.getElementById('probName').textContent = p.name;
  const probLink = document.getElementById('probLink');
  probLink.href = p.url;
  probLink.setAttribute('target', '_blank');
  probLink.setAttribute('rel', 'noopener noreferrer');
  document.title = 'Chapter 9: Prefix Sum + Stack + DP · ' + p.num + '. ' + p.name;

  updateNavCategoryHeads(0, {
    notesMode: false, notesCh7Mode: false, notesCh8Mode: false, notesCh9Mode: false,
    notesCh2Mode: false, notesCh3Mode: false, notesCh5Mode: false, notesCh6Mode: false,
    ch2TreePyMode: false,
    ch2FillGroup: null, ch3FillGroup: null, ch5FillGroup: null,
    ch6FillGroup: null, ch7FillGroup: null, ch8FillGroup: null, ch9FillGroup: group,
  });
  document.getElementById('score').textContent = '';
  setHashSilently('#ch9-' + group + '-' + p.num);
}

function openCh8Problem(p, group) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(8);
  ['chapterNotesPanel','chapter2NotesPanel','chapter3NotesPanel','chapter7NotesPanel','chapter8NotesPanel'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.hidden = true;
  });
  hideChapterNotesPanels456();
  document.getElementById('probPanel').hidden = false;

  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach(function(btn) {
    btn.classList.remove('is-selected'); btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection(); clearCh3TabSelection();
  clearCh5TabSelection(); clearCh6TabSelection();
  clearCh7TabSelection(); clearCh8TabSelection();
  setCh2TemplateTabSelected(false);

  const tabBtn = document.getElementById('ch8-tab-' + group + '-' + p.num);
  if (tabBtn) { tabBtn.classList.add('is-selected'); tabBtn.setAttribute('aria-selected', 'true'); }

  renderSolutions(p, document.getElementById('prob-solutions'));
  document.getElementById('probNum').textContent = p.num + '.';
  document.getElementById('probName').textContent = p.name;
  const probLink = document.getElementById('probLink');
  probLink.href = p.url;
  probLink.setAttribute('target', '_blank');
  probLink.setAttribute('rel', 'noopener noreferrer');
  document.title = 'Chapter 8: Sliding Window + Sweep Line · ' + p.num + '. ' + p.name;

  updateNavCategoryHeads(0, {
    notesMode: false, notesCh7Mode: false, notesCh8Mode: false,
    notesCh2Mode: false, notesCh3Mode: false, notesCh5Mode: false, notesCh6Mode: false,
    ch2TreePyMode: false,
    ch2FillGroup: null, ch3FillGroup: null, ch5FillGroup: null,
    ch6FillGroup: null, ch7FillGroup: null, ch8FillGroup: group,
  });
  document.getElementById('score').textContent = '';
  setHashSilently('#ch8-' + group + '-' + p.num);
}

function openCh7Problem(p, group) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(7);
  const notesPanel = document.getElementById('chapterNotesPanel');
  const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
  const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
  const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
  const probPanel = document.getElementById('probPanel');
  if (notesPanel) notesPanel.hidden = true;
  if (notesPanelCh2) notesPanelCh2.hidden = true;
  if (notesPanelCh3) notesPanelCh3.hidden = true;
  if (notesPanelCh7) notesPanelCh7.hidden = true;
  hideChapterNotesPanels456();
  if (probPanel) probPanel.hidden = false;

  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach(function(btn) {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection(); clearCh3TabSelection();
  clearCh5TabSelection(); clearCh6TabSelection(); clearCh7TabSelection();
  setCh2TemplateTabSelected(false);

  const tabBtn = document.getElementById('ch7-tab-' + group + '-' + p.num);
  if (tabBtn) { tabBtn.classList.add('is-selected'); tabBtn.setAttribute('aria-selected', 'true'); }

  renderSolutions(p, document.getElementById('prob-solutions'));
  document.getElementById('probNum').textContent = p.num + '.';
  document.getElementById('probName').textContent = p.name;
  const probLink = document.getElementById('probLink');
  probLink.href = p.url;
  probLink.setAttribute('target', '_blank');
  probLink.setAttribute('rel', 'noopener noreferrer');
  document.title = 'Chapter 7: Heap + TOP K + Monotonic Stack · ' + p.num + '. ' + p.name;

  updateNavCategoryHeads(0, {
    notesMode: false, notesCh7Mode: false, notesCh2Mode: false,
    notesCh3Mode: false, notesCh5Mode: false, notesCh6Mode: false,
    ch2TreePyMode: false,
    ch2FillGroup: null, ch3FillGroup: null, ch5FillGroup: null,
    ch6FillGroup: null, ch7FillGroup: group,
  });
  document.getElementById('score').textContent = '';
  setHashSilently('#ch7-' + group + '-' + p.num);
}

function openCh6Problem(p, group) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(6);
  const notesPanel = document.getElementById('chapterNotesPanel');
  const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
  const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
  const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
  const probPanel = document.getElementById('probPanel');
  if (notesPanel) notesPanel.hidden = true;
  if (notesPanelCh2) notesPanelCh2.hidden = true;
  if (notesPanelCh3) notesPanelCh3.hidden = true;
  if (notesPanelCh7) notesPanelCh7.hidden = true;
  hideChapterNotesPanels456();
  if (probPanel) probPanel.hidden = false;

  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach((btn) => {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection();
  clearCh3TabSelection();
  clearCh5TabSelection();
  clearCh6TabSelection();
  setCh2TemplateTabSelected(false);

  const tabBtn = document.getElementById('ch6-tab-' + group + '-' + p.num);
  if (tabBtn) {
    tabBtn.classList.add('is-selected');
    tabBtn.setAttribute('aria-selected', 'true');
  }

  renderSolutions(p, document.getElementById('prob-solutions'));

  document.getElementById('probNum').textContent = p.num + '.';
  document.getElementById('probName').textContent = p.name;
  const probLink = document.getElementById('probLink');
  probLink.href = p.url;
  probLink.setAttribute('target', '_blank');
  probLink.setAttribute('rel', 'noopener noreferrer');
  document.title = 'Chapter 6: Two Pointer & Linked List · ' + p.num + '. ' + p.name;

  updateNavCategoryHeads(0, {
    notesMode: false,
    notesCh7Mode: false,
    notesCh2Mode: false,
    notesCh3Mode: false,
    notesCh6Mode: false,
    ch2TreePyMode: false,
    ch2FillGroup: null,
    ch3FillGroup: null,
    ch5FillGroup: null,
    ch6FillGroup: group,
  });
  document.getElementById('score').textContent = '';
  setHashSilently('#ch6-' + group + '-' + p.num);
}

function renderProblem(idx) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(1);
  const notesPanel = document.getElementById('chapterNotesPanel');
  const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
  const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
  const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
  const probPanel = document.getElementById('probPanel');
  if (notesPanel) notesPanel.hidden = true;
  if (notesPanelCh2) notesPanelCh2.hidden = true;
  if (notesPanelCh3) notesPanelCh3.hidden = true;
  if (notesPanelCh7) notesPanelCh7.hidden = true;
  hideChapterNotesPanels456();
  if (probPanel) probPanel.hidden = false;

  clearCh2TabSelection();
  clearCh3TabSelection();
  clearCh5TabSelection();
  setCh2TemplateTabSelected(false);
  currentIdx = idx;
  const p = PROBLEMS[idx];
  renderSolutions(p, document.getElementById('prob-solutions'));
  updateChrome(p);
  setTabSelected(idx);

  document.getElementById('score').textContent = '';
  setHashSilently('#p-' + p.num);
}

function buildCh3Tabs() {
  const hostBt = document.getElementById('ch3BfsTreeTabs');
  const hostTopo = document.getElementById('ch3TopoTabs');
  const hostDijkstra = document.getElementById('ch3DijkstraTabs');
  if (!hostBt || !hostTopo || !hostDijkstra) return;
  hostBt.innerHTML = '';
  CH3_BT.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch3-tab-bt-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => openCh3Problem(p, 'bfsTree'));
    hostBt.appendChild(btn);
  });
  hostTopo.innerHTML = '';
  CH3_TOPO.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch3-tab-topo-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => openCh3Problem(p, 'topo'));
    hostTopo.appendChild(btn);
  });
  hostDijkstra.innerHTML = '';
  CH3_DIJKSTRA.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch3-tab-dj-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => openCh3Problem(p, 'dijkstra'));
    hostDijkstra.appendChild(btn);
  });
}

function buildCh5Tabs() {
  const hostBfs = document.getElementById('ch5BfsTabs');
  const hostDfs = document.getElementById('ch5DfsTabs');
  const hostGt = document.getElementById('ch5GraphTheoryTabs');
  const hostTopo = document.getElementById('ch5TopoTabs');
  const hostUf = document.getElementById('ch5UfTabs');
  if (!hostBfs || !hostDfs || !hostGt || !hostTopo || !hostUf) return;

  hostBfs.innerHTML = '';
  CH5_BFS.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch5-tab-bfs-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => openCh5Problem(p, 'bfs'));
    hostBfs.appendChild(btn);
  });

  hostDfs.innerHTML = '';
  CH5_DFS.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch5-tab-dfs-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => openCh5Problem(p, 'dfs'));
    hostDfs.appendChild(btn);
  });

  hostGt.innerHTML = '';
  CH5_GT.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch5-tab-gt-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => openCh5Problem(p, 'graphTheory'));
    hostGt.appendChild(btn);
  });

  hostTopo.innerHTML = '';
  CH5_TOPO.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch5-tab-topo-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => openCh5Problem(p, 'topo'));
    hostTopo.appendChild(btn);
  });

  hostUf.innerHTML = '';
  CH5_UF.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch5-tab-uf-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => openCh5Problem(p, 'uf'));
    hostUf.appendChild(btn);
  });
}

function buildCh9Tabs() {
  const groups = [
    { id: 'ch9PsTabs',    key: 'ps',    arr: CH9_PS },
    { id: 'ch9StackTabs', key: 'stack', arr: CH9_STACK },
    { id: 'ch9DpTabs',    key: 'dp',    arr: CH9_DP },
  ];
  groups.forEach(function(g) {
    const host = document.getElementById(g.id);
    if (!host) return;
    host.innerHTML = '';
    g.arr.forEach(function(p) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prob-tab';
      btn.id = 'ch9-tab-' + g.key + '-' + p.num;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', 'probPanel');
      btn.textContent = p.num + '. ' + p.name;
      btn.addEventListener('click', function() { openCh9Problem(p, g.key); });
      host.appendChild(btn);
    });
  });
}

function buildCh8Tabs() {
  const groups = [
    { id: 'ch8SwTabs',    key: 'sw',    arr: CH8_SW },
    { id: 'ch8SweepTabs', key: 'sweep', arr: CH8_SWEEP },
  ];
  groups.forEach(function(g) {
    const host = document.getElementById(g.id);
    if (!host) return;
    host.innerHTML = '';
    g.arr.forEach(function(p) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prob-tab';
      btn.id = 'ch8-tab-' + g.key + '-' + p.num;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', 'probPanel');
      btn.textContent = p.num + '. ' + p.name;
      btn.addEventListener('click', function() { openCh8Problem(p, g.key); });
      host.appendChild(btn);
    });
  });
}

function buildCh7Tabs() {
  const groups = [
    { id: 'ch7HeapTabs', key: 'heap', arr: CH7_HEAP },
    { id: 'ch7TopKTabs', key: 'topk', arr: CH7_TOPK },
    { id: 'ch7MonoTabs', key: 'mono', arr: CH7_MONO },
  ];
  groups.forEach(function(g) {
    const host = document.getElementById(g.id);
    if (!host) return;
    host.innerHTML = '';
    g.arr.forEach(function(p) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prob-tab';
      btn.id = 'ch7-tab-' + g.key + '-' + p.num;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', 'probPanel');
      btn.textContent = p.num + '. ' + p.name;
      btn.addEventListener('click', function() { openCh7Problem(p, g.key); });
      host.appendChild(btn);
    });
  });
}

function buildCh6Tabs() {
  const groups = [
    { id: 'ch6Tp1Tabs', key: 'tp1', arr: CH6_TP1 },
    { id: 'ch6Tp2Tabs', key: 'tp2', arr: CH6_TP2 },
    { id: 'ch6Tp3Tabs', key: 'tp3', arr: CH6_TP3 },
    { id: 'ch6Tp4Tabs', key: 'tp4', arr: CH6_TP4 },
    { id: 'ch6Tp5Tabs', key: 'tp5', arr: CH6_TP5 },
    { id: 'ch6Ll1Tabs', key: 'll1', arr: CH6_LL1 },
    { id: 'ch6Ll2Tabs',   key: 'll2',   arr: CH6_LL2 },
    { id: 'ch6ExtraTabs', key: 'extra', arr: CH6_EXTRA },
  ];
  groups.forEach(function(g) {
    const host = document.getElementById(g.id);
    if (!host) return;
    host.innerHTML = '';
    g.arr.forEach(function(p) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prob-tab';
      btn.id = 'ch6-tab-' + g.key + '-' + p.num;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', 'probPanel');
      btn.textContent = p.num + '. ' + p.name;
      btn.addEventListener('click', function() { openCh6Problem(p, g.key); });
      host.appendChild(btn);
    });
  });
}

function buildTabs() {
  const hostTpl = document.getElementById('probTabs');
  const hostOoxx = document.getElementById('ooxxTabs');
  hostTpl.innerHTML = '';
  hostOoxx.innerHTML = '';
  const nTpl = PROBLEM_ORDER_TEMPLATE.length;
  PROBLEMS.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.setAttribute('role', 'tab');
    btn.id = 'tab-' + i;
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => renderProblem(i));
    (i < nTpl ? hostTpl : hostOoxx).appendChild(btn);
  });
}

function buildCh2Tabs() {
  const host = document.getElementById('ch2Tabs');
  const hostTr = document.getElementById('ch2TraversalTabs');
  const hostDfs = document.getElementById('ch2DfsTabs');
  if (!host || !hostTr || !hostDfs) return;
  host.innerHTML = '';
  const btnPy = document.createElement('button');
  btnPy.type = 'button';
  btnPy.className = 'prob-tab';
  btnPy.id = 'ch2TabTreePython';
  btnPy.setAttribute('role', 'tab');
  btnPy.setAttribute('aria-controls', 'probPanel');
  btnPy.textContent = 'Tree Python 模板';
  btnPy.addEventListener('click', showCh2TreePythonTemplate);
  host.appendChild(btnPy);

  hostTr.innerHTML = '';
  (Array.isArray(CH2_TR) ? CH2_TR : []).forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch2-tab-tr-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => renderCh2Problem(p.num));
    hostTr.appendChild(btn);
  });

  hostDfs.innerHTML = '';
  (Array.isArray(CH2_DF) ? CH2_DF : []).forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prob-tab';
    btn.id = 'ch2-tab-dfs-' + p.num;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'probPanel');
    btn.textContent = p.num + '. ' + p.name;
    btn.addEventListener('click', () => renderCh2Problem(p.num));
    hostDfs.appendChild(btn);
  });
}

document.getElementById('btnCheck').addEventListener('click', checkAll);
document.getElementById('btnReset').addEventListener('click', resetAll);

document.getElementById('btnToggleAnswers').addEventListener('click', function () {
  const showing = document.body.classList.contains('answers-revealed');
  if (showing) {
    document.body.classList.remove('answers-revealed');
    this.setAttribute('aria-pressed', 'false');
    this.textContent = '显示参考答案';
  } else {
    document.body.classList.add('answers-revealed');
    this.setAttribute('aria-pressed', 'true');
    this.textContent = '隐藏参考答案';
  }
});

document.getElementById('btnCopy').addEventListener('click', copyMergedCode);

window.FillExerciseIndex = {
  PROBLEM_ORDER,
  PROBLEM_ORDER_TEMPLATE,
  PROBLEMS,
  inputs,
  indexFromNum,
  parseHash,
  setHashSilently,
  checkAll,
  resetAll,
  copyMergedCode,
  updateNavCategoryHeads,
  setCh2TemplateTabSelected,
  setTabSelected,
  showCh2TreePythonTemplate,
  renderCh2Problem,
  renderProblem,
  buildTabs,
  buildCh2Tabs,
  buildCh3Tabs,
  buildCh5Tabs,
  buildCh6Tabs,
  buildCh7Tabs,
  buildCh8Tabs,
  buildCh9Tabs,
  openCh3Problem,
  openCh5Problem,
  openCh6Problem,
  openCh7Problem,
  openCh8Problem,
  openCh9Problem,
  clearCh2TabSelection,
  clearCh3TabSelection,
  clearCh5TabSelection,
  clearCh6TabSelection,
  clearCh7TabSelection,
  clearCh8TabSelection,
  clearCh9TabSelection,
  setCh2CategoryHeads,
  setCh3CategoryHeads,
  setCh5CategoryHeads,
  setCh6CategoryHeads,
  setCh7CategoryHeads,
  setCh8CategoryHeads,
  setCh9CategoryHeads,
  findCh3Problem,
  findCh5Problem,
  findCh6Problem,
  findCh7Problem,
  findCh8Problem,
  findCh9Problem,
};
