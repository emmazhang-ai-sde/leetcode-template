/* =========================================================================
   algo-all-in-one.js — BFS / DFS 算法汇总页共用的渲染逻辑
   （2026-08-14 从合并版 bfs-dfs-all-in-one.html 的内联 <script> 抽出）。

   页面在 catalog.js / sidebar.js 之后加载本文件，然后调
   renderAlgoPage('bfs' | 'dfs')（单算法页）或 renderAlgoComboPage()
   （BFS / DFS 对照页 bfs-dfs-all-in-one.html）。分类数据来自 catalog.js
   的 LC_ALGO_CATALOG（跟侧栏 algo 模式共用一份），题目条目只写题号，
   题名 / 链接 / 🎬 从 LC_ANIM_DATA 按题号反查——catalog 变了页面自动跟上。

   布局：单算法页每个类型一行——左题目卡右模板卡（.algo-sec-grid）；
   对照页每个 category 左 BFS 右 DFS，每张卡一个 grid 格子按行配对
   （.combo-grid，左右卡上下边全对齐）。卡宽都收缩到内容
   （题目行 / 代码完整展开，不横向滚动）。
   ========================================================================= */
(function () {

  /* Lyon Python 模板——原文照抄 notes.js 的 LYON_TEMPLATES（chapter-3/4/5），
     那份是章级笔记页用的、藏在 notes.js 的闭包里拿不到，这里存第二份展示用
     的拷贝（跟打分色板 JS/CSS 双拷贝一个性质）：改模板记得两边一起动。
     key 是 LC_ALGO_CATALOG 里的 block id，渲染时贴在对应题目卡下面；
     卡角灰字统一显示 "Python 模板"。 */
  const TEMPLATES = {
    'bfs-tree': [
      { title: 'BFS Level order',
        code: 'def bfs(self, node, res):\n' +
          '    import collections\n' +
          '    queue = collections.deque([])\n' +
          '    queue.append(node)\n' +
          '\n' +
          '    while len(queue) > 0:\n' +
          '        size = len(queue)\n' +
          '        temp = []\n' +
          '        for _ in range(size):\n' +
          '            curr = queue.popleft()\n' +
          '            if curr:\n' +
          '                levelRes.append(curr.val)\n' +
          '                queue.append(curr.left)\n' +
          '                queue.append(curr.right)\n' +
          '        if temp:\n' +
          '            res.append(temp)' },
    ],
    'bfs-grid': [
      { title: 'BFS 坐标类',
        code: 'def bfs(self, grid, queue, visited):\n' +
          '    step = -1\n' +
          '    while len(queue) > 0:\n' +
          '        size = len(queue)\n' +
          '        for _ in range(size):\n' +
          '            x,y = queue.popleft()\n' +
          '            for dx,dy in [(0,1),(0,-1),(1,0),(-1,0)]:\n' +
          '                newx = x + dx\n' +
          '                newy = y + dy\n' +
          '                if self.isValid(newx,newy, grid, visited):\n' +
          '                    visited.add((newx,newy))\n' +
          '                    queue.append((newx,newy))\n' +
          '        step +=1\n' +
          '    return step\n' +
          '\n' +
          'def isValid(self,x,y,grid, visited):\n' +
          '    return 0<=x<len(grid) and 0<=y<len(grid[0]) and (x,y) not in visited and grid[x][y] == 1' },
    ],
    'bfs-graph': [
      { title: 'BFS Traverse Graph',
        code: 'graphs = collections.defaultdict(list)\n' +
          '# Create Graph\n' +
          'for edge in edges:\n' +
          '    start = edge[0]\n' +
          '    end = edge[1]\n' +
          '    graphs[start].append(end)\n' +
          '    graphs[end].append(start)\n' +
          '\n' +
          'queue = collections.deque([])\n' +
          'visited = {1}\n' +
          'queue.append(1)\n' +
          'while len(queue) > 0:\n' +
          '    size = len(queue)\n' +
          '    for _ in range(size):\n' +
          '        curr = queue.popleft()\n' +
          '        neighbours = graphs.get(curr, [])\n' +
          '        for neighbour in neighbours:\n' +
          '            if neighbour not in visited:\n' +
          '                visited.add(neighbour)\n' +
          '                queue.append(neighbour)\n' +
          '\n' +
          'return len(visited) == n' },
    ],
    'bfs-dijkstra': [
      { title: 'Dijkstra',
        code: 'def dijkstra(self, heap, n, graph):\n' +
          '    visited = {}\n' +
          '\n' +
          '    while len(heap) > 0:\n' +
          '        curr, node = heapq.heappop(heap)\n' +
          '\n' +
          '        if node in visited and visited[node] < curr:\n' +
          '            continue\n' +
          '        visited[node] = curr\n' +
          '        if len(visited) == n:\n' +
          '            return curr\n' +
          '        for val, nextNode in graph[node]:\n' +
          '            if nextNode not in visited:\n' +
          '                heapq.heappush(heap, (val + curr, nextNode))\n' +
          '\n' +
          '    return -1' },
    ],
    // 照抄自 leetcode/4-leetcode-fill-in/chapters/ch02/ch02-notes.html
    // （2026-08-14）：只搬 Python 模板（Java 版没搬，跟全站 "python only"
    // 一致；概念 + 对比表在 Chapter 2 课件页，本页不重复）。
    'dfs-tree': [
      { title: 'Tree Divide and Conquer DFS',
        code: 'def dfs(self, root):\n' +
          '    if not root:\n' +
          '        return 0\n' +
          '\n' +
          '    leftReturn = self.dfs(root.left)\n' +
          '    rightReturn = self.dfs(root.right)\n' +
          '\n' +
          '    # Optional Leaf processing\n' +
          '    if root.left is None and root.right is None:\n' +
          '        return 1\n' +
          '\n' +
          '    height = max(leftReturn, rightReturn) + 1\n' +
          '    return height' },
    ],
    'dfs-grid': [
      { title: 'DFS 坐标类',
        code: 'def dfs(self, i, j, board, index, word, visited):\n' +
          '    if index < len(word) and word[index] != board[i][j]:\n' +
          '        return False\n' +
          '    if index == len(word) - 1:\n' +
          '        return True\n' +
          '\n' +
          '    visited.add((i,j))\n' +
          '    for (di, dj) in [(0,1), (0,-1), (1,0), (-1,0)]:\n' +
          '        newi = i + di\n' +
          '        newj = j + dj\n' +
          '        if not (0<=newi<len(board) and 0<=newj<len(board[0])):\n' +
          '            continue\n' +
          '        if (newi,newj) in visited:\n' +
          '            continue\n' +
          '        if self.dfs(newi, newj, board, index + 1, word, visited):\n' +
          '            return True\n' +
          '    visited.remove((i,j))  # 回溯：这条路走不通，把格子还回去' },
    ],
    'dfs-graph': [
      { title: 'DFS Traverse Graph',
        code: 'def DFS(self, graph, node, target, path):\n' +
          '    if node == target:\n' +
          '        self.paths.append(list(path))\n' +
          '        return\n' +
          '\n' +
          '    for node_next in graph[node]:\n' +
          '        path.append(node_next)\n' +
          '        self.DFS(graph, node_next, target, path)\n' +
          '        path.pop()' },
    ],
    'dfs-backtracking': [
      { title: 'DFS Combination',
        code: 'def dfs(self, candidates, temp, res, target, startIndex):\n' +
          '    if sum(temp) == target:\n' +
          '        res.append(temp + [])  # deepcopy\n' +
          '        return\n' +
          '\n' +
          '    if sum(temp) > target:  # early terminate\n' +
          '        return\n' +
          '\n' +
          '    for i in range(startIndex, len(candidates)):\n' +
          '        # 以 startIndex 对应数字开始\n' +
          '        num = candidates[i]\n' +
          '        temp.append(num)\n' +
          '        self.dfs(candidates, temp, res, target, i)  # i or i+1\n' +
          '        temp.pop(-1)' },
      { title: 'DFS Permutation',
        code: 'def dfs(self, nums, temp, res, visited):\n' +
          '    if len(temp) == len(nums):\n' +
          '        res.append(temp + [])  # deepcopy\n' +
          '        return\n' +
          '\n' +
          '    for i in range(0, len(nums)):  # 每次都从头开始，不用 startIndex\n' +
          '        if i in visited:           # 已经在 temp 里的跳过\n' +
          '            continue\n' +
          '        num = nums[i]\n' +
          '        visited.add(i)\n' +
          '        temp.append(num)\n' +
          '        self.dfs(nums, temp, res, visited)\n' +
          '        visited.remove(i)\n' +
          '        temp.pop(-1)' },
    ],
  };

  const TAG_CLS = { BFS: 'bfs', DFS: 'dfs' };
  function tagHtml(tag) {
    if (!tag) return '';
    return tag.split('+').map(t =>
      `<span class="algo-tag ${TAG_CLS[t] || 'other'}">${t}</span>`).join('');
  }
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 题号 → 派生条目（name/file/pending）。chapters 在前：同号重复时
  // （496 暴力版在 Others 也有一份）优先用章节里的干净题名。
  let LOOKUP = null;
  function ensureLookup() {
    if (LOOKUP) return LOOKUP;
    const data = window.LC_ANIM_DATA;
    if (!data) return null;
    LOOKUP = {};
    [...data.chapters, data.others].forEach(ch =>
      ch.sections.forEach(sec => sec.problems.forEach(p => {
        if (p.num != null && !(p.num in LOOKUP)) LOOKUP[p.num] = p;
      })));
    return LOOKUP;
  }

  function problemRow(entry, pageTag) {
    const spec = typeof entry === 'number' ? { num: entry } : entry;
    const p = LOOKUP[spec.num];
    if (!p) return '';
    return `<a class="tree-item" href="${p.file}">` +
      `<span class="tree-num">${spec.num}.</span>` +
      `<span class="tree-name">${p.name}</span>` +
      (p.hasAnim ? `<span class="tree-anim" title="有动画">🎬</span>` : '') +
      tagHtml(spec.tag || pageTag) +
    `</a>`;
  }

  function groupRows(g, pageTag) {
    const head = g.title
      ? `<div class="tree-sub"><span class="tree-sub-name">${g.title}</span></div>`
      : '';
    return head + g.items.map(it => problemRow(it, pageTag)).join('');
  }

  function problemCardHtml(block, pageTag) {
    return `<div class="algo-card">` +
      `<div class="algo-card-head">` +
        `<span class="algo-card-name">${block.title}</span>` +
      `</div>` +
      block.sections.map(g => groupRows(g, pageTag)).join('') +
    `</div>`;
  }

  function tmplCardHtml(t) {
    // 卡角灰字统一写 "Python 模板"——分类名上面的题目卡已经写了，不重复
    return `<div class="algo-card">` +
      `<div class="algo-card-head">` +
        `<span class="algo-card-name">${t.title}</span>` +
        `<span class="tmpl-for">Python 模板</span>` +
      `</div>` +
      `<pre class="tmpl-code">${esc(t.code)}</pre>` +
    `</div>`;
  }

  /* ── 单算法页（bfs-all-in-one.html / dfs-all-in-one.html）────────────────
     每个类型一行：左边题目卡、右边这个类型的 Lyon Python 模板卡，同一行
     顶对齐；没有模板的类型右边留空。（模板贴题目下面的摞法只在对照页用。） */
  window.renderAlgoPage = function renderAlgoPage(colKey) {
    const ALGO = window.LC_ALGO_CATALOG;
    const col = ALGO && ALGO[colKey];
    if (!ensureLookup() || !col) return;
    document.getElementById('algo-sections').innerHTML =
      `<div class="algo-sec-grid">` +
      col.blocks.map(b =>
        `<div class="pair-left">${problemCardHtml(b, col.tag)}</div>` +
        `<div class="pair-right">${(TEMPLATES[b.id] || []).map(tmplCardHtml).join('')}</div>`
      ).join('') +
      `</div>`;
  };

  window.renderAlgoBlockPage = function renderAlgoBlockPage(colKey, blockId) {
    const ALGO = window.LC_ALGO_CATALOG;
    const col = ALGO && ALGO[colKey];
    if (!ensureLookup() || !col) return;
    const block = (col.blocks || []).find(b => b.id === blockId);
    if (!block) return;
    document.getElementById('algo-sections').innerHTML =
      `<div class="algo-sec-grid">` +
        `<div class="pair-left">${problemCardHtml(block, col.tag)}</div>` +
        `<div class="pair-right">${(TEMPLATES[block.id] || []).map(tmplCardHtml).join('')}</div>` +
      `</div>`;
  };

  /* ── BFS / DFS 对照页（bfs-dfs-all-in-one.html）──────────────────────────
     category 从 LC_ALGO_CATALOG 的 block id 提取：Tree / Grid / Graph 两边
     都有，成对同行；Topo / Dijkstra 只有 BFS 侧、Backtracking 只有 DFS 侧，
     另一边留空。这里只写 id 配对关系，不复制题目/模板事实。 */
  const COMBO_ROWS = [
    { title: 'Tree',                 bfs: 'bfs-tree',     dfs: 'dfs-tree' },
    { title: 'Grid',                 bfs: 'bfs-grid',     dfs: 'dfs-grid' },
    { title: 'Graph',                bfs: 'bfs-graph',    dfs: 'dfs-graph' },
    { title: 'Topological Sorting',  bfs: 'bfs-topo',     dfs: null },
    { title: 'BFS + Heap · Dijkstra', bfs: 'bfs-dijkstra', dfs: null },
    { title: 'Backtracking',         bfs: null,           dfs: 'dfs-backtracking' },
  ];

  window.renderAlgoComboPage = function renderAlgoComboPage() {
    const ALGO = window.LC_ALGO_CATALOG;
    if (!ensureLookup() || !ALGO) return;
    const byId = {};
    ['bfs', 'dfs'].forEach(k =>
      ((ALGO[k] && ALGO[k].blocks) || []).forEach(b => {
        byId[b.id] = { block: b, tag: ALGO[k].tag };
      }));
    // 整页一个大 grid：分类标题横跨两列占一行，下面每张卡一个格子，
    // 按行配对（同 category 里第 1 行左右题目卡、第 2 行起左右模板卡）。
    // 左右两条列轨各自 max-content（CSS 里定义），grid 行高把矮的一边
    // 拉到等高——左右卡上下边全对齐，但左右列宽互不牵连。
    // 窄屏退化见 CSS 的 combo-cell / combo-cat 覆盖。
    let html = '';
    let rowNo = 1;
    COMBO_ROWS.forEach(row => {
      html += `<div class="combo-cat" style="grid-row:${rowNo}">${row.title}</div>`;
      rowNo++;
      let maxCards = 0;
      [{ id: row.bfs, cls: 'combo-l' }, { id: row.dfs, cls: 'combo-r' }]
        .forEach(({ id, cls }) => {
          const e = id && byId[id];
          if (!e) return;
          const cards = [
            problemCardHtml(e.block, e.tag),
            ...(TEMPLATES[e.block.id] || []).map(tmplCardHtml),
          ];
          maxCards = Math.max(maxCards, cards.length);
          cards.forEach((card, i) => {
            html += `<div class="combo-cell ${cls}" style="grid-row:${rowNo + i}">${card}</div>`;
          });
        });
      rowNo += maxCards;
    });
    const mount = document.getElementById('algo-sections');
    mount.innerHTML = `<div class="combo-grid">${html}</div>`;
  };
})();
