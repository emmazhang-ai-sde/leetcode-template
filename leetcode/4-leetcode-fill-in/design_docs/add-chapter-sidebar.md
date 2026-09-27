# 把课件题目写进 Sidebar

把某个 Chapter 课件里的题目分类和题目条，按照 Ch6 的模式接入左侧 sidebar。

---

## 前置信息

执行前先告诉我：

1. **Chapter 编号**（如 7）
2. **Chapter 标题**（如 `Heap + TOP K + Monotonic Stack`）
3. **分组结构**：每个大分组名称、每个子分类的编号+名称、每道题的题号+题名+LeetCode URL

示例格式：

```
大分组：Heap
  ① 基础 Top K → 703. Kth Largest, 215. Kth Largest in Array
  ② 合并K个链表 → 23. Merge K Sorted Lists

大分组：Monotonic Stack
  ③ 单调栈模板 → 496. Next Greater Element I
```

---

## 涉及的文件

| 文件 | 作用 |
|---|---|
| `assets/ch0X-problems-bundle.js` | 题目数据 |
| `index.html` | sidebar HTML 结构 |
| `assets/layout-app-shell.css` | sidebar 样式 |
| `assets/fill-exercise-index.js` | JS 数据、buildTabs、openProblem 等逻辑 |
| `assets/index-app.js` | 入口：调用 buildTabs、处理 hash 路由 |

---

## 第一步：bundle 数据（`assets/ch0X-problems-bundle.js`）

用 IIFE 包裹，每个子分类对应一个 `window.CH0X_FILL_XXX` 数组。没有填空 HTML 的题用 `placeholderRow` 占位：

```js
(function () {
  'use strict';

  const placeholderRow =
    '<tr><td class="ln">1</td><td class="lc"><span class="seg">Blank-fill template for this problem is not in the repo yet — use the LeetCode link in the title bar.</span></td></tr>';

  function p(num, name, url) {
    return { num: String(num), name, url, codeTableHtml: placeholderRow };
  }

  window.CH07_FILL_GRP1 = [
    p('703', 'Kth Largest Element in a Stream', 'https://leetcode.com/problems/kth-largest-element-in-a-stream/'),
  ];

  // ... 其余子分类
})();
```

命名规则：`CH0X_FILL_` + 子分类 key（全大写），key 用简短英文，如 `GRP1`、`LL1`、`TP1`。

---

## 第二步：sidebar HTML（`index.html`）

在对应 `<div class="chapter-panel" data-chapter="X">` 里，按三层结构写：

```html
<div class="chapter-panel" data-chapter="7" hidden>
  <h1 class="chapter-sidebar-title">Chapter 7: Heap + TOP K + Monotonic Stack</h1>
  <button type="button" class="nav-category-head" id="navCategoryNotesCh7" aria-controls="chapter7NotesPanel" aria-expanded="false">Chapter 7 - 课件</button>

  <!-- 大分组标题：nav-category-head，透明背景，13px -->
  <div class="nav-category-head" id="navCh7GroupHeap">Heap</div>

  <!-- 子分类：nav-category-head，透明背景，12px（JS 控制高亮） -->
  <div class="nav-category-block nav-category-block--follow">
    <div class="nav-category-head" id="navCategoryCh7Grp1">① 基础 Top K</div>
    <!-- prob-tabs 容器：JS 动态注入题目按钮 -->
    <div class="prob-tabs prob-tabs--ch2" id="ch7Grp1Tabs" role="tablist" aria-label="基础 Top K 题单"></div>
  </div>

  <!-- ... 其余子分类 -->
</div>
```

**命名规则**：
- 大分组 id：`navCh7Group` + 简称（如 `Heap`）
- 子分类 id：`navCategoryCh7` + key（如 `Grp1`）
- tab 容器 id：`ch7` + key + `Tabs`（如 `ch7Grp1Tabs`）

---

## 第三步：CSS（`assets/layout-app-shell.css`）

在已有的透明背景规则和字号规则里，追加新 chapter 的所有分类 ID。

### 3a. 透明背景（大分组 + 子分类都加）

```css
#navCh7GroupHeap.nav-category-head,
#navCategoryCh7Grp1.nav-category-head,
/* ... 所有子分类 id */ {
  background: transparent;
}
```

同时在 `.is-active` 版本里也加一遍：

```css
#navCh7GroupHeap.nav-category-head.is-active,
#navCategoryCh7Grp1.nav-category-head.is-active,
/* ... */ {
  background: transparent;
}
```

### 3b. 子分类字号缩小（只加子分类，不加大分组）

```css
#navCategoryCh7Grp1.nav-category-head,
/* ... 其余子分类 id */ {
  font-size: 12px;
}
```

---

## 第四步：fill-exercise-index.js

### 4a. 声明数据变量（文件顶部 CH6 变量附近）

```js
const CH7_GRP1 = window.CH07_FILL_GRP1 || [];
// ... 其余子分类
```

### 4b. `findCh7Problem(num, group)`

```js
function findCh7Problem(num, group) {
  const map = { grp1: CH7_GRP1, /* ... */ };
  return (map[group] || []).find(function(p) { return p.num === String(num); }) || null;
}
```

### 4c. `setCh7CategoryHeads(group)`（控制激活态高亮）

```js
function setCh7CategoryHeads(group) {
  var defs = [
    ['navCategoryCh7Grp1', 'grp1'],
    // ...
  ];
  defs.forEach(function(pair) {
    var el = document.getElementById(pair[0]);
    if (el) el.classList.toggle('is-active', pair[1] === group);
  });
}
```

### 4d. `clearCh7TabSelection()`

```js
function clearCh7TabSelection() {
  document.querySelectorAll(
    '#ch7Grp1Tabs .prob-tab, /* ... */'
  ).forEach(function(btn) {
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-selected', 'false');
  });
}
```

### 4e. `buildCh7Tabs()`

```js
function buildCh7Tabs() {
  const groups = [
    { id: 'ch7Grp1Tabs', key: 'grp1', arr: CH7_GRP1 },
    // ...
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
```

### 4f. `openCh7Problem(p, group)`

```js
function openCh7Problem(p, group) {
  if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(7);
  // 隐藏所有课件面板
  ['chapterNotesPanel','chapter2NotesPanel','chapter3NotesPanel','chapter7NotesPanel'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.hidden = true;
  });
  hideChapterNotesPanels456();
  document.getElementById('probPanel').hidden = false;

  // 清除所有 tab 选中态
  document.querySelectorAll('#probTabs .prob-tab, #ooxxTabs .prob-tab').forEach(function(btn) {
    btn.classList.remove('is-selected'); btn.setAttribute('aria-selected', 'false');
  });
  clearCh2TabSelection(); clearCh3TabSelection();
  clearCh5TabSelection(); clearCh6TabSelection(); clearCh7TabSelection();
  setCh2TemplateTabSelected(false);

  // 高亮当前 tab
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
```

### 4g. updateNavCategoryHeads 里加 ch7 支持

在函数里加：
- 参数解构：`const ch7FillGroup = opts.ch7FillGroup;`
- 判断：`const ch7ProblemFill = /* ch7 所有 group key */;`
- 分支：`if ('ch7FillGroup' in opts) { setCh7CategoryHeads(opts.ch7FillGroup); } else { setCh7CategoryHeads(null); }`

### 4h. parseHash 里加 ch7 路由识别

```js
const ch7m = /^ch7-(grp1|grp2|...)-(.+)$/.exec(raw);
if (ch7m) return { kind: 'ch7Problem', group: ch7m[1], num: ch7m[2] };
```

### 4i. exports 里追加

```js
buildCh7Tabs,
openCh7Problem,
clearCh7TabSelection,
setCh7CategoryHeads,
findCh7Problem,
```

---

## 第五步：index-app.js

```js
// 初始化时构建
F.buildCh7Tabs();

// hash 路由
if (route.kind === 'ch7Problem') {
  const p = F.findCh7Problem(route.num, route.group);
  if (p) { F.openCh7Problem(p, route.group); return; }
  C.showNotesCh7(); return;
}
```

---

## 检查清单

- [ ] bundle 数据：所有题目 num/name/url 正确，有 codeTableHtml
- [ ] HTML：每个 prob-tabs 容器 id 唯一，命名一致
- [ ] CSS：所有分类 id 加入透明背景规则（含 `.is-active`），子分类加入 12px 规则
- [ ] JS：find / set / clear / build / open 五个函数齐全，exports 已更新
- [ ] index-app.js：buildTabs 调用、hash 路由分支都加了
