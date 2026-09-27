(function () {
  const SIDEBAR_GROUP_KEY = 'lc-anim-sidebar-group';

  // ── CSS ───────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* 2026-08-05 改版：Ink & Border · Option B「Card Groups」
       （选型页 mockups/lc-notes/sidebar-ink-mockup.html）——每个章节组一张
       黑框硬阴影小卡浮在页面灰上；展开的卡阴影加深、标题行下压一条黑线；
       active 题黄色荧光（var(--ink-hl)）；紫色全部退场。
       题目不再按"有无动画"灰掉——全部黑色（pending 只留在数据里）。 */
    html { scrollbar-gutter: stable; }
    /* sidebar 自己的滚动条太粗太抢眼：换成 5px 细条、透明轨道、圆头，
       平时浅灰、悬停加深（Firefox 走 scrollbar-width/color 这对标准属性） */
    .sidebar { scrollbar-width: thin; scrollbar-color: rgba(17,17,17,0.22) transparent; }
    .sidebar::-webkit-scrollbar { width: 5px; }
    .sidebar::-webkit-scrollbar-track { background: transparent; }
    .sidebar::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.18); border-radius: 999px; }
    .sidebar::-webkit-scrollbar-thumb:hover { background: rgba(17,17,17,0.4); }
    .sidebar {
      position: fixed; left: 0; top: 0;
      height: 100vh;
      background: #f9f9f9;
      /* 顶部 24px 内边距挪进 .sidebar-head（sticky 元素贴不到 padding 区） */
      padding: 0 18px 24px 14px;
      overflow-y: auto;
      z-index: 100;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    /* 顶上三行入口的 sticky 壳：.sidebar 的 24px 顶部内边距搬到这里
       （sticky 元素钉不进容器的 padding 区，留在外面会露一条缝）；
       横向负 margin 撑满整条侧栏，底边一条淡线区分。 */
    .sidebar-head {
      position: sticky; top: 0; z-index: 5;
      background: #f9f9f9;
      margin: 0 -18px 12px -14px;
      padding: 24px 18px 0 14px;
      border-bottom: 1px solid rgba(17,17,17,0.08);
    }
    /* Check-in 挪进标题行（标题右边），收起按钮用 margin-left:auto 顶到最右 */
    .sidebar-top-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      margin-bottom: 14px;
      padding: 0 6px;
      flex-wrap: wrap;
    }
    .sb-collapse-btn {
      border: none; background: transparent; color: #aaa; cursor: pointer;
      font-size: 20px; line-height: 1; padding: 6px 11px; border-radius: 8px; flex: none;
      margin-left: auto;
    }
    .sb-collapse-btn:hover { background: #f0f0f0; color: var(--ink-soft); }
    /* Monitor / Laptop 全局布局开关（2026-09-04）：顶行 Check-in 左边。
       Monitor = 笔记区两列（现状），Laptop = 单列纵排（外接屏不在时两列把
       文字挤得太窄）。样式照 notes.css 的 .lcn-switch 缩小一号。 */
    .sb-view-switch {
      display: inline-flex; gap: 3px; flex: none;
      background: #fff; border: var(--ink-border); border-radius: 8px; padding: 2px;
      box-shadow: var(--ink-shadow-sm);
    }
    .sb-view-switch button {
      border: none; background: #fff; color: var(--ink);
      font: 700 11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 4px 9px; border-radius: 5px; cursor: pointer; white-space: nowrap;
    }
    .sb-view-switch button.on { background: var(--ink); color: var(--ink-hl); }
    /* Check-in 汇总页（Life OS 集成）：顶部纯文字入口——不带卡片框，
       hover/active 只有黄色荧光标记。
       （原来的 "LeetCode Animation" 标题链接 2026-08-14 随 index.html 一起删了） */
    .sidebar-checkin, .sidebar-class, .sidebar-algo {
      display: inline-block;
      margin: 0; padding: 8px 12px;
      font-size: 14px; font-weight: 800; color: var(--ink);
      text-decoration: none; white-space: nowrap;
      border-radius: 6px;
    }
    .sidebar-checkin:hover, .sidebar-checkin.active,
    .sidebar-class:hover, .sidebar-class.active,
    .sidebar-algo:hover, .sidebar-algo.active { background: var(--ink-hl); }
    /* 算法汇总页入口（BFS / DFS All-in-One）：标题行正下方第二行纯文字链接，
       样式跟 Check-in / Class 一致 */
    .sidebar-algo-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: -4px 0 12px;
      padding: 0 6px;
      flex-wrap: wrap;
    }
    .sidebar-group {
      background: #fff; border: var(--ink-border); border-radius: 10px;
      box-shadow: var(--ink-shadow-sm);
      margin-bottom: 12px; overflow: hidden;
    }
    .sidebar-group.open { box-shadow: var(--ink-shadow); }
    .sidebar-tab {
      width: 100%;
      border: none;
      background: transparent;
      color: var(--ink);
      cursor: pointer;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
      font-size: 13.5px;
      font-weight: 800;
      margin: 0;
      padding: 9px 12px;
      text-align: left;
      white-space: nowrap;
    }
    .sidebar-tab-label {
      min-width: 0;
      overflow: visible;
    }
    .sidebar-tab-count {
      font-family: var(--ink-mono);
      font-size: 11px; font-weight: 700; color: var(--ink);
      flex: none;
    }
    .sidebar-tab:hover { background: var(--ink-panel); }
    /* 章节标题 bar 按算法染色（同对照页 code box 的淡蓝/淡紫一个色值）：
       Chapter 3 = BFS 淡蓝、Chapter 4 = DFS 淡紫，其它章保持白色；
       有色 bar 的 hover 加深一档保住反馈 */
    .sidebar-group[data-sidebar-group="chapter-3"] > .sidebar-tab { background: rgba(120,160,225,0.13); }
    .sidebar-group[data-sidebar-group="chapter-3"] > .sidebar-tab:hover { background: rgba(120,160,225,0.24); }
    .sidebar-group[data-sidebar-group="chapter-4"] > .sidebar-tab { background: rgba(199,146,234,0.12); }
    .sidebar-group[data-sidebar-group="chapter-4"] > .sidebar-tab:hover { background: rgba(199,146,234,0.22); }
    /* all 模式里 TikTok 那份章节卡 id 带 tt- 前缀（同页不能跟 Lyon 的章节卡撞 id），
       染色规则跟上 */
    .sidebar-group[data-sidebar-group="tt-chapter-3"] > .sidebar-tab { background: rgba(120,160,225,0.13); }
    .sidebar-group[data-sidebar-group="tt-chapter-3"] > .sidebar-tab:hover { background: rgba(120,160,225,0.24); }
    .sidebar-group[data-sidebar-group="tt-chapter-4"] > .sidebar-tab { background: rgba(199,146,234,0.12); }
    .sidebar-group[data-sidebar-group="tt-chapter-4"] > .sidebar-tab:hover { background: rgba(199,146,234,0.22); }
    .sidebar-tab.active,
    .sidebar-group[data-sidebar-group] > .sidebar-tab.active,
    .sidebar-group[data-sidebar-group] > .sidebar-tab.active:hover {
      background: var(--ink-hl);
    }
    /* all 模式（2026-09-02）：三个视角的卡摞在一起，每块前面一行小标签分隔
       （Lyon's Chapters / OA / TikTok 高频） */
    .sidebar-block-label {
      font-family: var(--ink-mono); font-size: 10.5px; font-weight: 800;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted);
      margin: 18px 0 8px; padding: 0 6px;
    }
    .sidebar-block-label:first-of-type { margin-top: 4px; }
    .sidebar-group.open .sidebar-tab { border-bottom: var(--ink-border); }
    .sidebar-panel {
      display: none;
      padding: 6px 8px 10px;
    }
    .sidebar-panel.open { display: block; }
    .sidebar-chapter-title {
      display: none;
    }
    .sidebar-section-title {
      font-family: var(--ink-mono);
      font-size: 12px; font-weight: 800; color: var(--ink);
      margin: 10px 0 4px; padding: 0 4px;
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .sidebar-section-note {
      margin: -1px 0 5px;
      padding: 0 4px;
      color: #8f8f8f;
      font-size: 11px;
      line-height: 1.4;
      /* 一行到底不折行（2026-08-29 用户要求）；宽度由 updateSidebarWidth 一起量进去 */
      white-space: nowrap;
    }
    .sidebar-item {
      display: flex; align-items: baseline; gap: 7px;
      padding: 4px 6px 4px 0; border-radius: 6px;
      text-decoration: none; color: var(--ink);
      font-size: 14px; line-height: 1.4;
      white-space: nowrap;
      width: max-content;
      min-width: 100%;
      transition: background 0.15s, color 0.15s;
    }
    .sidebar-name {
      min-width: 0;
      white-space: nowrap;
    }
    .sidebar-main {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      min-width: 0;
      flex: none;
    }
    html.lcn-laptop .sidebar-name {
      flex: 0 1 var(--sidebar-name-max, 28ch);
      max-width: var(--sidebar-name-max, 28ch);
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .sidebar-measure {
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      height: 0;
      overflow: hidden;
      left: 0;
      top: 0;
      white-space: nowrap;
    }
    .sidebar-measure .sidebar-group,
    .sidebar-measure .sidebar-panel,
    .sidebar-measure .sidebar-tab,
    .sidebar-measure .sidebar-item,
    .sidebar-measure .sidebar-section-note { width: max-content; }
    .sidebar-measure .sidebar-item { font-weight: 700; }
    .sidebar-item:hover { background: var(--ink-panel); color: var(--ink); }
    .sidebar-item.active { background: var(--ink-hl); color: var(--ink); }
    .sidebar-notes-link { font-weight: 700; padding-left: 4px; }
    .sidebar-sec-link {
      display: block; text-decoration: none; border-radius: 6px;
      padding: 7px 4px; margin-left: -4px;
      line-height: 1.35;
      transition: background 0.15s;
    }
    .sidebar-sec-link:hover { background: var(--ink-panel); }
    .sidebar-sec-link.active { background: var(--ink-hl); }
    .sidebar-num {
      font-family: var(--ink-mono);
      font-size: 13px;
      color: var(--ink-faint);
      flex: 0 0 40px;
      text-align: right;
    }
    .sidebar-item.active .sidebar-num { color: var(--ink); }
    /* 行首固定宽的一格：有动画放 🎬，没有就空着占位，后面的题号列才能对齐 */
    .sidebar-anim-badge { flex: 0 0 14px; font-size: 12px; line-height: 1; opacity: 0.85; text-align: center; }
    /* 题名后的小勾（chapters 模式）：这题已收进 BFS / DFS All-in-One。 */
    .sidebar-check {
      font-size: 12px; font-weight: 800; line-height: 1;
      color: #2f9e63;
      flex: none;
      white-space: nowrap;
    }
    /* OA 模式：行末居右标"这题归档在 chapter 几"（只标完美对应的 1–9 章，
       chapter-10 兜底章不标）。margin-left:auto 顶到行最右，跟 ✓ 一个做法；
       padding-left 保底间距——最宽那行的标注不至于贴着题名 */
    .sidebar-chap {
      margin-left: auto;
      padding-left: 16px;
      font-family: var(--ink-mono);
      font-size: 11px; font-weight: 700;
      color: var(--ink-muted);
      flex: none;
      white-space: nowrap;
    }
    /* 行末打卡徽章（2026-08-21）：这题最近一次打卡的「月/日 · 分数」，
       mono 淡灰小字，没打过卡的题什么都不显示。margin-left:auto 顶到行
       最右；前面已有 ✓ / Ch n（它们自己带 auto）时退回普通间距——两个
       auto 会把空隙对半分，行末就散了 */
    .sidebar-done {
      margin-left: auto;
      padding-left: 12px;
      font-family: var(--ink-mono);
      font-size: 11.5px;
      color: var(--ink-muted);
      font-variant-numeric: tabular-nums;
      flex: none;
      white-space: nowrap;
    }
    /* 分数固定 3 字符宽（"3.5" 最长），整个徽章右对齐时「·」才能上下对齐 */
    .sidebar-done-score { display: inline-block; width: 3ch; text-align: left; }
    .sidebar-chap + .sidebar-done { margin-left: 0; }
    .sidebar-item.active .sidebar-done { color: rgba(17,17,17,0.65); }
    .algo-tag {
      font-family: var(--ink-mono);
      font-size: 10px; font-weight: 800;
      padding: 1px 5px; border-radius: 4px;
      letter-spacing: 0.02em;
      flex: none;
      white-space: nowrap;
    }
    .algo-tag.bfs { background: rgba(120,160,225,0.25); color: #3A6FD4; }
    .algo-tag.dfs { background: rgba(199,146,234,0.25); color: #6b3fa0; }
    .algo-tag.uf  { background: rgba(160,160,160,0.25); color: #666; }
    .algo-tag.other { background: var(--ink-panel); color: var(--ink-muted); }
    /* Monotonic Deque（239）：淡黄底黑字、不加粗（2026-08-25 用户要求） */
    .algo-tag.deque { background: rgba(255,216,77,0.32); color: var(--ink); font-weight: 400; }
    .sidebar-item.active .algo-tag { filter: brightness(0.9); }
  `;
  document.head.appendChild(style);

  function placeholderFile(num, name, slug) {
    // slug 缺失（比如没有真实 LC 题号的 OA 原题）时退回题库首页，不拼出
    // .../problems/undefined/ 这种死链；num 缺失时也不传，交给 placeholder.html
    // 自己的默认值处理，避免 querystring 里出现字面量 "null"。
    const link = slug ? `https://leetcode.com/problems/${slug}/` : 'https://leetcode.com/problemset/';
    const params = new URLSearchParams({ name, link });
    if (num) params.set('num', num);
    return `placeholder.html?${params.toString()}`;
  }

  // ── 数据：全部来自 catalog.js（每页在本脚本之前加载）────────────────────
  // catalog 只存事实（num/name/slug/anim/page），这里派生渲染字段：有 anim
  // 用动画页（带 🎬），有 page 用图文页（不带 🎬），都没有指到 placeholder
  // （pending 标记也由此而来，不再手写）。
  // 兜底空目录：万一某页漏挂 catalog.js，侧栏空着但页面不炸。
  const CATALOG = window.LC_CATALOG ||
    { others: { id: 'others', title: 'Others', sections: [] }, chapters: [] };

  function toProblem(p) {
    const entry = {
      num: p.num,
      // placeholder 页标题 = 打卡/笔记的 key，用干净题名（pageName 优先）
      file: p.anim || p.page || placeholderFile(p.num, p.pageName || p.name, p.slug),
      name: p.name,
    };
    if (p.anim) entry.hasAnim = true;
    if (!p.anim && !p.page) entry.pending = true;
    // algo：题目实际用的算法（BFS / DFS / BFS+DFS / Union-Find…），照 Lyon
    // 答案标注，纯展示用，不参与任何逻辑；没标的题不显示这个 tag
    if (p.algo) entry.algo = p.algo;
    // solAuthor：Solution 卡第一个 tab 的作者名（notes.js 用），默认 Lyon
    if (p.solAuthor) entry.solAuthor = p.solAuthor;
    // tiktok：TikTok 高频题标记（catalog 原样带过来），侧栏 'tiktok' 模式按它过滤
    if (p.tiktok) entry.tiktok = true;
    return entry;
  }
  function toGroup(g) {
    return {
      id: g.id,
      title: g.title,
      sections: (g.sections || []).map(sec => ({
        title: sec.title,
        ...(sec.note ? { note: sec.note } : {}),
        problems: (sec.problems || []).map(toProblem),
      })),
    };
  }

  // 每章每个分类里的题按题号从小到大排（2026-08-21 用户要求）。catalog 里
  // 保持 Lyon 的讲课顺序不动，只在这里的派生视图排序；没有题号的条目
  // （OA 原题等）排到分类末尾，彼此维持原有相对顺序（sort 是稳定的）。
  function sortByNum(problems) {
    return [...problems].sort((a, b) =>
      (a.num == null) - (b.num == null) || (a.num || 0) - (b.num || 0));
  }

  const OTHERS = toGroup(CATALOG.others);
  const CHAPTERS = (CATALOG.chapters || []).map(toGroup).map(ch => ({
    ...ch,
    sections: ch.sections.map(sec => ({ ...sec, problems: sortByNum(sec.problems) })),
  }));
  const PROBLEMS = OTHERS.sections.flatMap(sec => sec.problems);

  // 首页卡片 / notes.js 共用的数据视图——跟 sidebar 永远一致（同一份派生）
  window.LC_ANIM_DATA = { others: OTHERS, chapters: CHAPTERS };

  // algo 短标签的配色：跟站内 phase-badge / fn-tag 的语义色沿用（BFS 蓝、
  // DFS 紫），未知算法给个中性灰兜底，不用改这里也不会出错
  // 收进 BFS / DFS 算法目录（LC_ALGO_CATALOG，= 三个 all-in-one 页面）的
  // 全部题号——chapters 模式的题目行末尾按它打 ✓，catalog 变了自动跟上
  const ALGO_NUMS = new Set();
  {
    const src = window.LC_ALGO_CATALOG || {};
    ['bfs', 'dfs'].forEach(k =>
      ((src[k] && src[k].blocks) || []).forEach(b =>
        b.sections.forEach(sec => sec.items.forEach(it => {
          const num = typeof it === 'number' ? it : it.num;
          if (num != null) ALGO_NUMS.add(num);
        }))));
  }

  // 每道题最近一次打卡（2026-08-21）：行末淡灰小字「月/日 · 分数」，一眼分出
  // 刷过/没刷过。数据来自后端 /api/leetcode/checkins，异步取——初始渲染先不带
  // 徽章，取到后补进已渲染的行里；file:// 或后端没起时 fetch 失败，整个功能
  // 静默消失。key：有题号用题号对（打卡记录的 name 是"378. …"格式），没题号
  // 的（OA 题等）用小写题名对。
  const CHECKIN_LAST = Object.create(null);
  function checkinKey(num, name) {
    return num != null ? String(num)
      : 'n:' + String(name || '').trim().toLowerCase();
  }
  function checkinBadgeHtml(ck) {
    const rec = CHECKIN_LAST[ck];
    if (!rec) return '';
    const m = /^\d{4}-(\d{2})-(\d{2})/.exec(String(rec.ts));
    if (!m) return '';
    return `<span class="sidebar-done">${+m[1]}/${+m[2]} · <span class="sidebar-done-score">${rec.score}</span></span>`;
  }

  const ALGO_TAG_CLS = { BFS: 'bfs', DFS: 'dfs', 'Union-Find': 'uf', 'Monotonic Deque': 'deque' };
  function algoTagsHtml(algo) {
    if (!algo) return '';
    // "BFS+DFS" 拆成两个独立小 pill，各自的颜色跟单独出现时一致
    return algo.split('+').map(part =>
      `<span class="algo-tag ${ALGO_TAG_CLS[part] || 'other'}">${part}</span>`
    ).join('');
  }

  function renderProblemItem(p) {
    const external = /^https?:\/\//.test(p.file);
    const ck = checkinKey(p.num, p.name);
    const ckAttr = ck.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `<a class="sidebar-item${p.pending ? ' pending' : ''}" data-ck="${ckAttr}" href="${p.file}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>` +
      // 🎬 放行首、题号前面（2026-08-27 用户要求）：有真动画（catalog 的
      // anim 字段）的题显示，page 图文页（OA 题解等）和 placeholder 壳页
      // 留一个同宽的空槽，题号/题名起点对齐
      (p.hasAnim ? `<span class="sidebar-anim-badge" title="有动画">🎬</span>` : `<span class="sidebar-anim-badge"></span>`) +
      (p.num ? `<span class="sidebar-num">${p.num}.</span>` : '') +
      `<span class="sidebar-main"><span class="sidebar-name">${p.name}</span>` +
        algoTagsHtml(p.algo) +
        // chapters 模式的题名后小勾：这题已收进 BFS / DFS 算法目录（三个
        // all-in-one 页面）。bfs / dfs 模式的侧栏本来就全是目录里的题，不打
        (sidebarMode === 'chapters' && p.num != null && ALGO_NUMS.has(p.num)
          ? `<span class="sidebar-check" title="已收进 BFS / DFS All-in-One">✓</span>` : '') +
      `</span>` +
      // OA 模式的章节标注（deriveOaGroups 只给"完美对应" 1–9 章的题挂 chap）
      (p.chap ? `<span class="sidebar-chap">Ch ${p.chap}</span>` : '') +
      // 打卡徽章永远排最后（初始渲染时 CHECKIN_LAST 还是空的，返回 ''；
      // updateSidebarWidth 的量宽走的也是这个函数，取到数据后重量就带上它）
      checkinBadgeHtml(ck) +
    `</a>`;
  }

  function renderSidebarGroup(id, title, contentHtml, count) {
    return `<div class="sidebar-group" data-sidebar-group="${id}">` +
      `<button class="sidebar-tab" type="button" data-sidebar-tab="${id}">` +
        `<span class="sidebar-tab-label">${title}</span>` +
        (count ? `<span class="sidebar-tab-count">${count}</span>` : '') +
      `</button>` +
      `<div class="sidebar-panel" data-sidebar-panel="${id}">${contentHtml}</div>` +
    `</div>`;
  }

  // 卡片头右侧只标这一章有多少题（纯数字，不显示做了几个动画的进度）
  function groupCount(problems) {
    return problems.length ? String(problems.length) : '';
  }

  // 测宽用的题目行集合——按当前模式取"实际会显示的那批行"：oa / bfs / dfs
  // 模式只量自己卡里的行，不然侧栏会被章节里最长的题名撑宽（2026-08-17）。
  // 函数定义在 sidebarMode / derive* 之前，但只在 updateSidebarWidth 里被
  // 调用（那时都已就绪）。
  function getAllSidebarProblems() {
    if (sidebarMode === 'oa') {
      return deriveOaGroups().flatMap(g => g.problems);
    }
    if (sidebarMode === 'tiktok') {
      return deriveTiktokGroups().flatMap(g =>
        g.sections.flatMap(sec => sec.problems));
    }
    if (sidebarMode === 'all') {
      return [
        ...PROBLEMS,
        ...CHAPTERS.flatMap(ch => ch.sections.flatMap(section => section.problems)),
        ...deriveOaGroups().flatMap(g => g.problems),
      ];
    }
    if (sidebarMode === 'bfs' || sidebarMode === 'dfs') {
      return deriveAlgoGroups(sidebarMode).flatMap(g =>
        g.sections.flatMap(sec => sec.problems));
    }
    return [
      ...PROBLEMS,
      ...CHAPTERS.flatMap(ch => ch.sections.flatMap(section => section.problems)),
    ];
  }

  // chId 给了（chapters 模式）分类名就是分类页链接；算法视角里如果
  // section.page 存在（例如 BFS 的 Tree/Grid/Graph 分类页），分类名也直达
  // 对应页面，否则保持纯文字。
  function renderChapterSections(sections, chId) {
    if (!sections.length) return `<div class="sidebar-section-note">coming soon</div>`;
    return sections.map(section =>
      (section.page && section.title
        ? `<a class="sidebar-section-title sidebar-sec-link" href="${section.page}">${section.title}</a>`
        : chId && section.title
        ? `<a class="sidebar-section-title sidebar-sec-link" href="section-notes.html?ch=${chId}&sec=${encodeURIComponent(section.title)}">${section.title}</a>`
        : `<div class="sidebar-section-title">${section.title}</div>`) +
      (section.note ? `<div class="sidebar-section-note">${section.note}</div>` : '') +
      section.problems.map(renderProblemItem).join('')
    ).join('');
  }

  // ── 侧栏模式（2026-08-14；2026-08-16 加 'oa'；2026-09-01 加 'tiktok'）──
  // 'chapters' = Others + 全部章节（Lyon's Class 视角）；'bfs' / 'dfs' = 只出
  // 对应算法的那张卡（LC_ALGO_CATALOG 的类型作卡内分类小标题）；'oa' =
  // 按"每一次 OA"一张卡（场次从 catalog 题名的 "(<公司> OA, <日期>)" 后缀
  // 派生，见 deriveOaGroups）；'tiktok' = 跟 chapters 一样的章节卡 + 分类
  // 小标题，但只留 catalog 里标了 tiktok: true 的题（见 deriveTiktokGroups）；
  // 'all'（2026-09-02）= 上面三个视角摞在一起：Lyon's Chapters 全部卡 → OA
  // 场次卡 → TikTok 高频章节卡（id 加 tt- 前缀避免撞 Lyon 的章节卡），块间
  // 一行小标签分隔。入口页各自强制一种模式，其它页面（题目页/打卡页等）
  // 沿用上次的模式。
  const SIDEBAR_MODE_KEY = 'lc-sidebar-mode';
  const currentFile = location.pathname.split('/').pop() || '';
  const currentHref = currentFile + location.search;
  let sidebarMode;
  const BFS_BLOCK_FILES = new Set(
    (((window.LC_ALGO_CATALOG || {}).bfs || {}).blocks || [])
      .map(b => b.page)
      .filter(Boolean)
  );
  if (currentFile === 'bfs-all-in-one.html' || BFS_BLOCK_FILES.has(currentFile)) sidebarMode = 'bfs';
  else if (currentFile === 'dfs-all-in-one.html') sidebarMode = 'dfs';
  else if (currentFile === 'online-assessments.html') sidebarMode = 'oa';
  else if (currentFile === 'class.html') sidebarMode = 'chapters';
  // TikTok 高频页：同一套 Chapter 1–9 + 分类小标题的骨架，只填高频题
  else if (currentFile === 'tiktok-frequent.html') sidebarMode = 'tiktok';
  else if (currentFile === 'all-in-one.html') sidebarMode = 'all';
  else {
    const saved = localStorage.getItem(SIDEBAR_MODE_KEY);
    sidebarMode = (saved === 'bfs' || saved === 'dfs' || saved === 'oa' || saved === 'tiktok' || saved === 'all') ? saved : 'chapters';
  }
  localStorage.setItem(SIDEBAR_MODE_KEY, sidebarMode);

  // bfs / dfs 模式的卡：一种模式一张卡（Breadth / Depth First Search），
  // LC_ALGO_CATALOG 里的每个类型（Tree BFS / Grid BFS / …）作为卡内的分类
  // 小标题，类型自己的子小节（Traversal / Combinations 等）在侧栏里摊平
  // 不再细分。题目按题号从上面的派生数据反查（不复制事实）；纯题号的条目
  // 不带 tag（卡名已经写明算法），{ num, tag } 的混合题带小 pill。
  function deriveAlgoGroups(colKey) {
    const src = window.LC_ALGO_CATALOG;
    const col = src && src[colKey];
    if (!col) return [];
    const lookup = {};
    [...CHAPTERS, OTHERS].forEach(g => g.sections.forEach(sec => sec.problems.forEach(p => {
      if (p.num != null && !(p.num in lookup)) lookup[p.num] = p;
    })));
    return [{
      id: 'algo-' + colKey,
      title: col.heading,
      sections: (col.blocks || []).map(b => ({
        title: b.title,
        page: b.page,
        problems: b.sections.flatMap(sec => sec.items).map(it => {
          const num = typeof it === 'number' ? it : it.num;
          const p = lookup[num];
          if (!p) return null;
          return { ...p, algo: typeof it === 'number' ? undefined : it.tag };
        }).filter(Boolean),
      })),
    }];
  }

  // 'oa' 模式的卡：一场 OA 一张卡（标题 "公司 · 日期"，新场次排前面）。
  // 场次不在 catalog 里单独存——OA 题的 name 统一带 "(<公司> OA, <日期>)"
  // 后缀（题目本身仍在各自 chapter 里），这里按后缀扫出来分组；行里显示
  // 干净题名（pageName）。online-assessments.html 主区域是同一份派生的
  // 另一个展示（那边多个"在哪个 chapter"标注）。
  const OA_RE = /^(.*)\s+\(([^,()]+) OA, (\d{4}-\d{2}-\d{2})\)$/;
  function deriveOaGroups() {
    const sessions = new Map();
    [...(CATALOG.chapters || []), CATALOG.others].forEach(g =>
      (g.sections || []).forEach(sec => (sec.problems || []).forEach(p => {
        const m = OA_RE.exec(p.name);
        if (!m) return;
        const key = m[2] + ' · ' + m[3];
        if (!sessions.has(key)) sessions.set(key, { company: m[2], date: m[3], problems: [] });
        // 章节标注：这题归档在 chapter 几。只标"完美对应"的 1–9 章；
        // chapter-10 是"归不进任何套路"的 OA 兜底章，不算对应，不标
        const chm = /^chapter-(\d+)$/.exec(g.id);
        const chap = chm && chm[1] !== '10' ? chm[1] : null;
        sessions.get(key).problems.push({
          num: null,
          name: p.pageName || m[1],
          file: p.anim || p.page || placeholderFile(null, p.pageName || m[1], p.slug),
          ...(p.anim ? { hasAnim: true } : {}),
          ...(chap ? { chap } : {}),
        });
      })));
    return [...sessions.values()]
      .sort((a, b) => b.date.localeCompare(a.date) || a.company.localeCompare(b.company))
      .map(s => ({
        id: 'oa-' + (s.company + '-' + s.date).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: s.company + ' · ' + s.date,
        problems: s.problems,
      }));
  }

  // 'tiktok' 模式的卡（2026-09-01）：Lyon 的章节骨架原样套用——每章一张卡、
  // 卡里沿用 catalog 的分类小标题（分类名照样链到 section-notes），只留
  // 标了 tiktok: true 的题；一道高频题都没有的分类 / 章整个不出（Others
  // 也不出）。catalog 最后的 tiktok-uncat 兜底 block 跟章节一样对待。
  // 卡 id 直接用章 id：Chapter 3 / 4 的 BFS / DFS 染色规则、展开状态
  // 都跟 chapters 模式共用，两边看到的是"同一章"。
  function deriveTiktokGroups(idPrefix) {
    return CHAPTERS.map(ch => ({
      ...ch,
      id: (idPrefix || '') + ch.id,
      sections: ch.sections
        .map(sec => ({ ...sec, problems: sec.problems.filter(p => p.tiktok) }))
        .filter(sec => sec.problems.length),
    })).filter(ch => ch.sections.length);
  }

  // ── HTML ──────────────────────────────────────────────────────────────────
  const nav = document.createElement('nav');
  nav.className = 'sidebar';
  const othersHtml = PROBLEMS.map(renderProblemItem).join('');
  // 一张章节卡（chapters / tiktok / all 三种模式共用）。chId 是 catalog 里的
  // 章 id（课件链接 / 分类页链接用它），卡 id 可以另给（all 模式里 TikTok
  // 那份加 tt- 前缀）
  function renderChapterCard(ch, chId) {
    return renderSidebarGroup(ch.id, ch.title,
      // LC Notes（Life OS 集成）：每章面板顶部一个章级笔记直达链接。
      // 文案带上章号（从 "Chapter N · 主题" 的 title 里取 "Chapter N" 前缀），
      // 不再是每章都一样的 "Chapter Notes"（2026-08-06 用户要求）。
      `<a class="sidebar-item sidebar-notes-link" href="chapter-notes.html?ch=${chId}">${ch.title.split(' · ')[0]} - 课件</a>` +
      renderChapterSections(ch.sections, chId),
      groupCount(ch.sections.flatMap(sec => sec.problems)));
  }
  const lyonHtml = () =>
    renderSidebarGroup('others', 'Others', othersHtml, groupCount(PROBLEMS)) +
    CHAPTERS.map(ch => renderChapterCard(ch, ch.id)).join('');
  const oaHtml = () => deriveOaGroups().map(g => renderSidebarGroup(g.id, g.title,
    g.problems.map(renderProblemItem).join(''), groupCount(g.problems))).join('');
  const tiktokHtml = idPrefix => deriveTiktokGroups(idPrefix)
    .map(ch => renderChapterCard(ch, ch.id.slice((idPrefix || '').length))).join('');
  const blockLabel = text => `<div class="sidebar-block-label">${text}</div>`;
  const groupsHtml = sidebarMode === 'oa'
    ? oaHtml()
    : sidebarMode === 'tiktok'
    ? tiktokHtml('')
    : sidebarMode === 'all'
    ? blockLabel("Lyon's Chapters") + lyonHtml() +
      blockLabel('OA') + oaHtml() +
      blockLabel('TikTok 高频') + tiktokHtml('tt-')
    : sidebarMode !== 'chapters'
    ? deriveAlgoGroups(sidebarMode).map(g => renderSidebarGroup(g.id, g.title,
        renderChapterSections(g.sections),
        groupCount(g.sections.flatMap(sec => sec.problems)))).join('')
    : lyonHtml();
  nav.innerHTML =
    // 顶上三行入口打包成 sticky header（2026-08-27）：侧栏往下滚时钉在顶部
    `<div class="sidebar-head">` +
    `<div class="sidebar-top-row">` +
      // Check-in 汇总页（Life OS 集成）：2026-08-05 从 Life OS 的 Practice 视图移过来
      // Monitor / Laptop 全局布局开关（2026-09-04，用户要求放 Check-in 左边）
      `<span class="sb-view-switch" title="Layout: Monitor = two columns, Laptop = one column (applies to every page)">` +
        `<button type="button" data-view="monitor">Monitor</button>` +
        `<button type="button" data-view="laptop">Laptop</button>` +
      `</span>` +
      `<a class="sidebar-checkin" href="checkin.html">Leetcode Check-in</a>` +
      `<a class="sidebar-algo" href="script.html">script</a>` +
      `<a class="sidebar-algo" href="python-grammar.html">Python grammar</a>` +
      `<button class="sb-collapse-btn" type="button" title="Collapse sidebar" aria-label="Collapse sidebar">«</button>` +
      // （顶行原来的 Class 链接 2026-08-14 删了——class.html 的入口现在是
      //   下面那行的 "Lyon's Chapters"）
    `</div>` +
    // 几个入口（2026-08-14）：第二行是 BFS / DFS 算法视角——对照页 +
    // 两个单算法页（短名 BFS / DFS）挤同一行；第三行 Lyon's Class 章节
    // 视角。点谁侧栏就切到谁的模式（见顶部 sidebarMode；对照页不强制
    // 模式，沿用上次）。Lyon's Class 打开的是 class.html 上课记录页。
    `<div class="sidebar-algo-row">` +
      `<a class="sidebar-algo" href="bfs-dfs-all-in-one.html">BFS / DFS All-in-One</a>` +
      `<a class="sidebar-algo" href="bfs-all-in-one.html">BFS</a>` +
      `<a class="sidebar-algo" href="dfs-all-in-one.html">DFS</a>` +
    `</div>` +
    `<div class="sidebar-algo-row">` +
      `<a class="sidebar-algo" href="class.html">Lyon's Chapters</a>` +
      // OA 场次视角（2026-08-16）：同一批 OA 题按"每一次 OA"再列一遍，
      // 题目本身仍在各自 chapter 里，两边都能进
      `<a class="sidebar-algo" href="online-assessments.html">OA</a>` +
      // TikTok 高频题（2026-09-01）：catalog 里标 tiktok: true 的题按 Lyon
      // 的章节骨架再列一遍（侧栏 'tiktok' 模式），题目本身仍在各自 chapter 里
      `<a class="sidebar-algo" href="tiktok-frequent.html">TikTok 高频</a>` +
      // 三个视角摞一起看（2026-09-02）：侧栏 'all' 模式
      `<a class="sidebar-algo" href="all-in-one.html">All-in-One</a>` +
    `</div>` +
    `</div>` +
    groupsHtml;

  // ── Inject + highlight (synchronous — script runs at top of <body>) ───────
  const thisScript = document.currentScript;
  thisScript.parentNode.insertBefore(nav, thisScript);

  nav.querySelectorAll('.sidebar-item, .sidebar-sec-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentFile || href === currentHref) a.classList.add('active');
  });

  // LC Notes（Life OS 集成）：每页动态加载 notes.js——接不上 Life OS 后端时
  // notes.js 自己整体不注入，动画站单独部署/直接 file:// 打开完全不受影响。
  // 用本脚本自己的 src 推导路径，任何目录深度/挂载前缀下都指得对。
  try {
    const notesScript = document.createElement('script');
    notesScript.src = new URL('notes.js', thisScript.src).href;
    document.body.appendChild(notesScript);
  } catch (e) { /* 拿不到 src（内联执行等）就算了 */ }
  if (currentFile === 'checkin.html') {
    nav.querySelector('.sidebar-checkin').classList.add('active');
  }
  nav.querySelectorAll('.sidebar-algo').forEach(a => {
    if (a.getAttribute('href') === currentFile) a.classList.add('active');
  });
  const modeHref = {
    bfs: 'bfs-all-in-one.html',
    dfs: 'dfs-all-in-one.html',
    oa: 'online-assessments.html',
    tiktok: 'tiktok-frequent.html',
    all: 'all-in-one.html',
    chapters: 'class.html',
  }[sidebarMode];
  if (modeHref) {
    nav.querySelectorAll('.sidebar-algo').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === modeHref || a.classList.contains('active'));
    });
  }

  const marginStyle = document.createElement('style');
  document.head.appendChild(marginStyle);
  let sidebarContentWidth = 0;
  function updateSidebarWidth() {
    const measure = document.createElement('div');
    measure.className = 'sidebar-measure';
    // 卡片化之后量的是"整张卡"的宽（边框 + 面板内边距都算进去）：
    // 章节头直接克隆真实 tab（带右侧计数），题目全塞进一个假面板里量最宽的。
    // 顶部入口不参与定宽；它们可以在这个宽度里自然换行。sidebar 的宽度
    // 只由题目行 + 行末标注（算法 tag / 打卡 / 章节标注 / ✓）决定。
    const titleHtml = [...nav.querySelectorAll('.sidebar-group > .sidebar-tab')].map(tab =>
      `<div class="sidebar-group">${tab.outerHTML}</div>`
    ).join('');
    // 分类下的一行小字说明（catalog 的 note）不折行，也要量进去
    const noteHtml = [...nav.querySelectorAll('.sidebar-section-note')].map(n => n.outerHTML).join('');
    const problemHtml =
      `<div class="sidebar-group"><div class="sidebar-panel open">` +
      getAllSidebarProblems().map(renderProblemItem).join('') + noteHtml +
      `</div></div>`;
    measure.innerHTML = titleHtml + problemHtml;
    nav.appendChild(measure);
    const maxItemWidth = Math.max(...Array.from(measure.children).map(item => item.scrollWidth));
    measure.remove();
    const navStyle = getComputedStyle(nav);
    const horizontalPadding = parseFloat(navStyle.paddingLeft) + parseFloat(navStyle.paddingRight);
    sidebarContentWidth = Math.max(sidebarContentWidth, Math.ceil(maxItemWidth + horizontalPadding));
    nav.style.width = `${sidebarContentWidth}px`;
  }
  function updateContentMargin() {
    updateSidebarWidth();
    // Reading offsetWidth forces a synchronous reflow and captures the sidebar's current chapter-title-based width.
    marginStyle.textContent = `.content-wrapper { margin-left: ${nav.offsetWidth}px !important; padding-right: 100px !important; }`;
  }

  function getOpenSidebarGroups() {
    const saved = localStorage.getItem(SIDEBAR_GROUP_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [saved];
    } catch {
      return [saved];
    }
  }

  function saveOpenSidebarGroups(ids) {
    localStorage.setItem(SIDEBAR_GROUP_KEY, JSON.stringify([...new Set(ids)]));
  }

  function setSidebarGroupOpen(id, isOpen) {
    const group = nav.querySelector(`.sidebar-group[data-sidebar-group="${id}"]`);
    const tab = nav.querySelector(`.sidebar-tab[data-sidebar-tab="${id}"]`);
    const panel = nav.querySelector(`.sidebar-panel[data-sidebar-panel="${id}"]`);
    if (group) group.classList.toggle('open', isOpen); // 卡片开合态：阴影加深 + 标题行下压黑线
    if (tab) tab.classList.toggle('active', isOpen);
    if (panel) panel.classList.toggle('open', isOpen);
  }

  function toggleSidebarGroup(id) {
    const openGroups = getOpenSidebarGroups();
    const isOpen = openGroups.includes(id);
    const nextGroups = isOpen
      ? openGroups.filter(groupId => groupId !== id)
      : [...openGroups, id];
    saveOpenSidebarGroups(nextGroups);
    setSidebarGroupOpen(id, !isOpen);
    updateContentMargin();
  }

  nav.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', event => {
      if (event.detail > 1) return;
      toggleSidebarGroup(tab.dataset.sidebarTab);
    });
  });
  nav.querySelectorAll('.sidebar-item, .sidebar-sec-link').forEach(item => {
    item.addEventListener('click', () => {
      const group = item.closest('[data-sidebar-group]');
      if (!group) return;
      const openGroups = getOpenSidebarGroups();
      saveOpenSidebarGroups([...openGroups, group.dataset.sidebarGroup]);
    });
  });

  const activeLink = nav.querySelector('.sidebar-item.active, .sidebar-sec-link.active');
  const activeGroup = activeLink && activeLink.closest('[data-sidebar-group]');
  const initialOpenGroups = getOpenSidebarGroups();
  if (sidebarMode !== 'chapters' && sidebarMode !== 'all') {
    // bfs / dfs / oa / tiktok 模式默认全展开（2026-08-14 用户要求）：每次进来
    // 卡都打开，页内可以手动收起，但下次加载还是全开。all 模式卡太多，
    // 跟 chapters 一样记住上次开着哪些
    nav.querySelectorAll('[data-sidebar-group]').forEach(g =>
      initialOpenGroups.push(g.dataset.sidebarGroup));
  } else if (initialOpenGroups.length === 0) {
    initialOpenGroups.push(activeGroup ? activeGroup.dataset.sidebarGroup : 'others');
  }
  saveOpenSidebarGroups(initialOpenGroups);
  initialOpenGroups.forEach(id => setSidebarGroupOpen(id, true));
  updateContentMargin();

  // 当前题的行滚到侧栏竖直居中（2026-08-26 用户要求）：翻到下一题时当前
  // chapter 不再顶到最上/滚出视野。直接设 scrollTop（不用 smooth）——
  // 脚本在 body 顶部同步执行，第一帧就该就位，不闪动。scrollTop 超界
  // 浏览器自己会夹住，不用管头尾两章。
  {
    const activeRow = nav.querySelector('.sidebar-item.active, .sidebar-sec-link.active');
    if (activeRow) {
      const rowRect = activeRow.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      nav.scrollTop += (rowRect.top + rowRect.height / 2) - (navRect.top + navRect.height / 2);
    }
  }

  // ── 打卡徽章：异步取数据，补进已渲染的行里 ────────────────────────────
  fetch('/api/leetcode/checkins')
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(rows => {
      (rows || []).forEach(r => {
        const mm = /^(\d+)\.\s*/.exec(r.name || '');
        const key = mm ? mm[1]
          : 'n:' + String(r.name || '').trim().toLowerCase();
        const prev = CHECKIN_LAST[key];
        if (!prev || String(r.ts) > String(prev.ts)) {
          CHECKIN_LAST[key] = { ts: r.ts, score: r.score };
        }
      });
      nav.querySelectorAll('.sidebar-item[data-ck]').forEach(a => {
        const html = checkinBadgeHtml(a.dataset.ck);
        if (html) a.insertAdjacentHTML('beforeend', html);
      });
      // 徽章加宽了最宽的行，重量一次侧栏宽度（量宽用 renderProblemItem，
      // 此时 CHECKIN_LAST 已就位，量出来的宽自带徽章）
      updateContentMargin();
    })
    .catch(() => { /* 后端不在（file:// 打开等）：不显示徽章，列表照常 */ });

  // ── Sidebar 收起/展开（想让 Notes / 动画全屏时用；状态记 localStorage）──
  // 收起后左上角浮一个小 tab：显示当前页属于哪个 chapter / 哪个分类，
  // 点它重新展开侧栏。
  /* Monitor / Laptop 全局视图（2026-09-04）：存 localStorage，一处切换全站
     跟着变（其他已开标签页靠 storage 事件同步）。类打在 <html> 上，
     notes.css 里 html.lcn-laptop 的规则接管布局；本脚本先于 notes.js 跑，
     首屏就是对的、不闪。 */
  const LCN_VIEW_KEY = 'lcn-view';
  function lcnView() {
    try { return localStorage.getItem(LCN_VIEW_KEY) === 'laptop' ? 'laptop' : 'monitor'; }
    catch (e) { return 'monitor'; }
  }
  function lcnApplyView() {
    const v = lcnView();
    document.documentElement.classList.toggle('lcn-laptop', v === 'laptop');
    nav.querySelectorAll('.sb-view-switch button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
    sidebarContentWidth = 0;
    nav.style.width = '';
    updateContentMargin();
  }
  lcnApplyView();
  nav.querySelector('.sb-view-switch').addEventListener('click', e => {
    const b = e.target.closest('button[data-view]');
    if (!b) return;
    try { localStorage.setItem(LCN_VIEW_KEY, b.dataset.view); } catch (e2) { /* 隐私模式/禁用存储 */ }
    lcnApplyView();
  });
  window.addEventListener('storage', e => { if (e.key === LCN_VIEW_KEY) lcnApplyView(); });

  const SB_COLLAPSE_KEY = 'lc-anim-sidebar-collapsed';
  const sbExtraStyle = document.createElement('style');
  sbExtraStyle.textContent = `
    /* 2026-08-04 选型定稿 Option A（lc-loctab-mockup.html）：黑框小卡，
       白底 + 1.5px 黑框 + 硬阴影，hover 整卡变黄。
       第一行章节（Chapter 几 + 名字）、第二行分类、提示居右。 */
    .sb-loc-tab {
      position: fixed; top: 12px; left: 12px; z-index: 260;
      background: #fff; border: var(--ink-border); border-radius: 10px;
      box-shadow: var(--ink-shadow); cursor: pointer;
      padding: 9px 14px; max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .sb-loc-tab:hover { background: var(--ink-hl); }
    .sb-loc-tab:active { transform: translate(2px, 2px); box-shadow: var(--ink-shadow-xs); }
    .sb-loc-ch { font-size: 12.5px; font-weight: 800; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sb-loc-sec { font-size: 11px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sb-loc-hint {
      font-family: var(--ink-mono); font-size: 9.5px;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); margin-top: 3px;
      text-align: right;
    }
    .sb-loc-only { font-size: 12.5px; font-weight: 800; color: var(--ink); text-align: center; white-space: nowrap; padding: 2px 4px; }
  `;
  document.head.appendChild(sbExtraStyle);

  function sbCurrentLocation() {
    if (currentFile === 'chapter-notes.html') {
      const id = new URLSearchParams(location.search).get('ch');
      const c = CHAPTERS.find(x => x.id === id);
      return { ch: c ? c.title : 'Chapter Notes', sec: '📓 Chapter Notes' };
    }
    for (const ch of CHAPTERS)
      for (const sec of ch.sections)
        for (const p of sec.problems)
          if (p.file === currentFile) return { ch: ch.title, sec: sec.title || '' };
    for (const p of PROBLEMS) if (p.file === currentFile) return { ch: 'Others', sec: '' };
    return { ch: 'LeetCode Animation', sec: '' };
  }

  const collapseBtn = nav.querySelector('.sb-collapse-btn');

  const locTab = document.createElement('div');
  locTab.className = 'sb-loc-tab';
  locTab.title = 'Show sidebar';
  // 2026-08-04 定稿：所有页面统一就一行黑色加粗的 "» Show Sidebar"（居中），
  // 不再显示 chapter/分类信息——共享页头本来就写着在哪，这里不重复。
  locTab.innerHTML = `<div class="sb-loc-only">» Show Sidebar</div>`;
  locTab.style.display = 'none';
  document.body.appendChild(locTab);

  function sbApplyCollapsed(collapsed) {
    nav.style.display = collapsed ? 'none' : '';
    locTab.style.display = collapsed ? '' : 'none';
    if (collapsed) {
      marginStyle.textContent = `.content-wrapper { margin-left: 24px !important; padding-right: 100px !important; }`;
    } else {
      updateContentMargin();
    }
  }
  collapseBtn.addEventListener('click', () => { localStorage.setItem(SB_COLLAPSE_KEY, '1'); sbApplyCollapsed(true); });
  locTab.addEventListener('click', () => { localStorage.setItem(SB_COLLAPSE_KEY, '0'); sbApplyCollapsed(false); });
  if (localStorage.getItem(SB_COLLAPSE_KEY) === '1') sbApplyCollapsed(true);
})();
