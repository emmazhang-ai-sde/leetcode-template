# leetcode-all-in-one 结构说明

这个文件夹是刷题站的全部：题目动画 + LC Notes 笔记 + 打卡 + 上课记录。
本文记录**整体结构、各文件分工、共享 CSS 的分层**，供以后（人或 AI）改动时先读。

同目录另外几份文档，别混：

| 文档 | 管什么 |
|---|---|
| `ARCHITECTURE.md`（本文） | 结构、文件分工、共享 CSS 分层、加载顺序、数据流 |
| `ANIMATION_GUIDE.md` | **做新动画页的硬性规则**（紫色行必须逐行走等），做题前必读 |
| `UI_REQUIREMENTS.md` | 动画页的 UI 设计规范（配色语义、布局稳定性、控件行为） |
| `CH4_DFS_ANIMATION_SPEC.md` | 第四章 DFS 十页动画的专用规范（调用链块、一次调用一种颜色、例子多大画得下）。做第四章的题看这份，通用规则仍以 `ANIMATION_GUIDE.md` 为准 |

---

## 1. 在 `leetcode/` 里的位置

```
leetcode/
├── standard-answers/       标准答案（答案权威，原样不改）
└── leetcode-all-in-one/    ← 本目录：动画 + 笔记 + 打卡
```

本地私人资料目录不属于 template 结构：`user-answers/`、`2-leetcode-speak/`、
`3-leetcode-lecture-notes/`、`4-leetcode-fill-in/`、`0-oa-real-problems/`。
有这些目录时项目会使用它们；导出的 template 不包含它们。

两个"唯一权威"，其它地方一律引用、不复制：

- **题目目录**（章节 / 分类 / 有没有动画）→ `leetcode-all-in-one/catalog.js`
- **题目答案** → `standard-answers/`（原样不改）；本地可选补充答案可放
  `user-answers/`（后端按题号现扫，标准答案优先，改完不用重启）

私人资料目录和本目录互相不直接依赖。改这里通常不用管它们。

---

## 2. 本目录文件清单

### 地基（7 个文件，所有页面共用）

| 文件 | 行数 | 职责 |
|---|---:|---|
| `catalog.js` | 234 | **纯数据**：`window.LC_CATALOG` = 全部章节/分类/题目 |
| `sidebar.js` | 457 | 侧栏渲染 + 从 catalog 派生 `LC_ANIM_DATA` + 注入 `notes.js` |
| `shared.js` | 317 | 动画页步进地基：`renderHeader` / `renderCodeBox` / 步进控件 |
| `notes.js` | 1380 | LC Notes：打卡、笔记、Solution、星标、章级笔记（走后端）+ 编辑块地基 |
| `shared.css` | 194 | 动画页样式地基：reset、双栏布局、代码面板、控件、card |
| `ink.css` | 46 | Ink & Border 设计 token（`--ink-*` 变量），**只有变量没有组件类** |
| `notes.css` | 358 | LC Notes 的全部组件样式（`lcn-` 前缀） |

### 页面（52 个 HTML）

| 页面 | 数量 | 说明 |
|---|---:|---|
| 题目动画页 `<题号>-<slug>.html` | 46 | 一题一页，手工精调 |
| `bfs-all-in-one.html` / `dfs-all-in-one.html` | 2 | 算法汇总页（BFS 版兼落地页：原 `index.html` 首页 2026-08-14 删了，`/` 指到 BFS）：每个类型一行——左题目卡右 Lyon Python 模板卡，顶对齐，卡宽收缩到内容（代码完整展开不横滚）。俩页只有 hero 标题和 `renderAlgoPage('bfs'/'dfs')` 一行不同——样式在 `algo-all-in-one.css`、渲染在 `algo-all-in-one.js`，分类数据来自 `catalog.js` 的 `LC_ALGO_CATALOG`（跟侧栏共用）。进这页侧栏切对应算法模式；侧栏的 "Lyon's Chapters" 入口开 `class.html` 并把侧栏切回 chapters 模式 |
| `bfs-dfs-all-in-one.html` | 1 | BFS / DFS 对照页（`renderAlgoComboPage()`）：category 按 block id 配对（`algo-all-in-one.js` 的 `COMBO_ROWS`），每个 category 一个小标题 + 双列——左 BFS 单元、右 DFS 单元（各自题目卡+模板卡上下摞，2×2 感觉）；Topo / Dijkstra 只有 BFS 侧、Backtracking 只有 DFS 侧，另一边留空。不强制侧栏模式（沿用上次） |
| `placeholder.html` | 1 | 没做动画的题共用，靠 `?num=&name=&link=` 显示题名 |
| `chapter-notes.html` | 1 | 章级笔记页（`?ch=chapter-3`），Notes / Templates 两栏 |
| `section-notes.html` | 1 | 分类页（`?ch=chapter-1&sec=<分类标题>`）：题目列表 + Lyon 模板 + 自建 block（lc_custom_blocks，"+ New block" 随便加）。入口：侧栏的分类标题、章节页分类名旁的 "notes →" |
| `checkin.html` | 1 | 打卡汇总：SM-2 复习、Check-in Calendar（2026-09-02 起 Monthly 柱状图卡在上、Biweekly 两周上下摞的 Agenda 卡在下，各自 ‹ › 翻页）、Due for Review、All Items |
| `python-grammar.html` | 1 | Python grammar 自由笔记页，入口紧接 script；复用 `buildFreeNotesPage` 和 `noteCardEl`，笔记卡单列排列，独立存储 key 为 `python-grammar-notes:global`。 |
| `class.html` | 1 | 上课记录：每节课的 Zoom 链接存档 |
| `script.html` | 1 | 独立自由笔记页，入口位于侧栏 Leetcode Check-in 后。`notes.js` 的 `buildFreeNotesPage(notesKey)` 复用题目页 `noteCardEl`，支持多张笔记、标题、富文本和自动保存；存入 `lc_note_cards`，独立 key 为 `script-notes:global`。 |
| `all-in-one.html` | 1 | All-in-One（2026-09-02）：入口页，主区域只有标题 + 统计行。进这页侧栏强制 `all` 模式：Lyon's Chapters 全部卡 → OA 场次卡 → TikTok 高频章节卡摞在一起，块间一行小标签分隔；TikTok 那份章节卡 id 加 `tt-` 前缀避免跟 Lyon 的撞。展开状态跟 chapters 一样记住（不强制全开）。侧栏入口在 "TikTok 高频" 后面 |
| `tiktok-frequent.html` | 1 | TikTok 高频题（2026-09-01）：入口页，主区域只有标题 + 题数统计行，题目列表全在侧栏——进这页侧栏强制 `tiktok` 模式（`sidebar.js` 的 `deriveTiktokGroups`）：套 Lyon 的 Chapter 1–9 + 分类小标题骨架，只填 catalog 里带 `tiktok: true` 的题，空分类/空章不出；归不进 1–9 章的收在 catalog 最后的 `tiktok-uncat` 独立 block。加/删高频题只改 catalog 的标记。侧栏入口在 "OA" 后面 |

> 例外：`3-longest-substring-consider-ending.html` 是唯一不带侧栏的独立页
> （只用 `shared.css`），改全站脚本时它不受影响。

> 例外：`checkin.html` 是唯一拆成三件套的页面——2026-08-07 把它的内联
> `<style>` / `<script>` 搬进了同名的 `checkin.css`（224 行）和
> `checkin.js`（629 行），原文件从 983 行降到 131 行只剩 markup。
> 动机是它长到跟 `notes.css` / `notes.js`、`cards/` 的 html+css+js
> 三件套不一致，也没法被浏览器单独缓存。**样式规则和逻辑一条没改**，
> `checkin.js` 仍是同步 classic script、仍挂在 `</body>` 前（顶层要取
> markup 里的元素，别改成 `defer` / `type="module"`）。
> 其余页面继续用内联 `<style>` + 内联 `<script>`，不用跟着拆。

---

## 3. 共享 CSS 的三层分工

这是本目录样式的核心结构——**三份 CSS 各管一层，不重叠**：

```
ink.css      设计 token（--ink-* 变量）        ← 只定义变量
   ↑ 被引用
shared.css   动画页骨架（布局/代码面板/控件）   ← 不依赖 token，自带字面值
notes.css    LC Notes 组件（.lcn-*）           ← 大量引用 token
```

### `ink.css` — 只有变量，没有组件类

2026-08-06 从各处抽出来的设计 token。故意**不放组件类**：各文件的类名和布局
都已稳定，强行合并要改一堆 HTML/JS；把"黑黄配色、黑框、硬阴影、等宽标签字体"
这些**设计决策**收进变量就够了，改一处全站生效，类名一个不动。

```css
:root {
  --ink: #111;              /* 主墨：文字、边框、实心按钮底 */
  --ink-soft / --ink-muted / --ink-faint / --ink-ghost   /* 灰阶，深→浅 */
  --ink-panel: #f5f5f5;     /* 代码块底、hover 底 */
  --ink-chip: #f2f2f2;      /* chip / inline code 底 */
  --ink-hl: #FFD84D;        /* 黄色荧光：active、选中、hover 反色 */
  --ink-danger / --ink-safe /* 删除红 / 确认绿 */
  --ink-border: 1.5px solid #111;
  --ink-shadow-xs/-sm/(默认)/-lg/-focus/-hover   /* 6 档硬阴影 */
  --ink-mono: 'SF Mono', Menlo, monospace;
}
```

**规矩**：新写样式一律用 `var(--ink-*)`，不要再写 `#111` / `#FFD84D` /
`3px 3px 0 rgba(17,17,17,0.9)` 这种字面值。

**当前依赖 token 的文件**：`notes.css`、`sidebar.js`（注入的 `<style>`）、
`checkin.css`、`class.html`、`algo-all-in-one.css`、`102-*.html`。

⚠️ **ink.css 没有 JS 兜底**——只靠每个页面 `<body>` 里的静态
`<link rel="stylesheet" href="ink.css">`。新加页面必须自己写上这一行，
否则所有 `var(--ink-*)` 会变成空值（黑框消失、文字变默认色）。

### `shared.css` — 动画页骨架，独立自足

不引用任何 ink token（全是字面值），所以没有 ink.css 也能单独工作。提供：

- reset + 页面底色 `#f9f9f9`
- `.main.layout-grid` 双栏主布局：两列都按 `max-content` 实宽，整块
  `width: max-content` + `margin: 0 auto` 居中。比视口窄就正中，比视口宽时
  只向右溢出、左边不会被裁掉
- `.code-panel` / `.code-block` / `.code-line` / `.ln` + Copy 按钮
- 语法高亮 7 个类：`.kw .fn .va .nu .op .cm .st`
- `.code-line.hl` — **紫色当前行高亮**（`rgba(199,146,234,0.12)`）
- `.step-info` 步骤说明框、`.var-bar` 变量栏、`.var-name/.var-eq/.var-val`
- `.btn` 控件、`.legend` 图例、`.card` 白卡
- `.heap-*` 堆可视化（多道堆题共用）

### `notes.css` — LC Notes 组件

全部 `lcn-` 前缀，不碰动画页自己的样式。由 `notes.js` 动态注入
（`checkin.html` / `class.html` 因为整页就是 LC Notes，另外静态 link 一份）。

---

## 4. 加载顺序（每个页面都一样）

```html
<head>
  <link rel="stylesheet" href="shared.css?v=info-hud">   <!-- ① 骨架 -->
  <style> /* 本页专属可视化样式 */ </style>
</head>
<body>
  <link rel="stylesheet" href="ink.css">                  <!-- ② 设计 token -->
  <script src="catalog.js"></script>                      <!-- ③ 数据 -->
  <script src="sidebar.js"></script>                      <!-- ④ 侧栏 -->
  <script src="shared.js?v=copybtn"></script>             <!-- ⑤ 步进地基 -->
```

`catalog.js` 必须排在 `sidebar.js` 前面（sidebar 要读 `LC_CATALOG`）。
sidebar 漏读 catalog 时有兜底（侧栏空着但页面不炸）。

唯一的变体是 `checkin.html`：① 之后多一行 `<link href="checkin.css">`
（它的 `<style>` 已经外置），并在 `</body>` 前多一行
`<script src="checkin.js"></script>`——位置就是原来内联 `<script>` 的位置，
必须保持在 markup 之后。

之后是运行时的连锁：

```
sidebar.js  →  注入 <script src="notes.js">
notes.js    →  注入 <link href="notes.css">
            →  ping /api/leetcode/notes-scope/ping
                 ├─ 通  → 按页面形态注入 LC Notes
                 └─ 不通 → 整体不注入，页面保持原样（动画照常能用）
```

这个降级是刻意设计的：动画站单独部署、直接 `file://` 打开都不受影响。

---

## 5. 数据流

### catalog.js → 全站

```js
window.LC_CATALOG = {
  others:   { id, title, sections: [{ title, problems }] },
  chapters: [{ id: 'chapter-3', title: 'Chapter 3 · …', sections: [...] }],
}
// 每题只存事实：{ num, name, slug, anim?, pageName? }
//   anim 有 → 链到动画页；没有 → 自动指到 placeholder.html
```

`sidebar.js` 把它派生成 `window.LC_ANIM_DATA`（补上 `file` / `pending`），
供侧栏、`algo-all-in-one.js`（BFS/DFS 汇总页）、`notes.js` 反查章节共用——三处永远一致。

**加一道题**只改 catalog 一行（标准答案放进 `standard-answers/`；本地个人补充
可放进 `user-answers/`）。
**上架动画**只加一个 `anim:` 字段，侧栏/汇总页/章节页链接全部自动跟上。

Life OS 那边（`frontend/js/views/lccheckin.js`）也 fetch 这个 `catalog.js`
拿题目补全和章节标签，用假 `window` 跑一遍取 `LC_CATALOG`。

### 答案文件 → Solution 卡

后端 `_answer_index()` 每次请求现扫 `standard-answers/` + `user-answers/`
（标准答案优先），按文件名前导数字建"题号 → 文件"索引。标准答案的文件名不规则
（`1.TwoSum.py`、`127. Word Ladder` 连扩展名都没有），索引只认前导数字。
题目页的 Solution 卡显示的就是它（用户改过的话显示自己的副本，可一键 ↺
还原）。加答案文件不用重启服务。
无题号的 OA 题（2026-08-16 起）走 `_answer_index_by_slug()` 兜底：按文件
名（stem）驼峰拆词后小写连字符化对题名 slug（`FindKPairCount` /
`debugger-actions.py` → `find-k-pair-count` / `debugger-actions`），
用户自己的放进 `user-answers/` 即可被 Solution 卡认到。

---

## 6. 后端集成

2026-08-10 起这是独立项目 `~/Desktop/LeetCode` 的一部分（不再是 Life OS 的
一部分），有自己的后端 `backend/main.py` + 数据库 `backend/leetcode.db`。
后端把整个 `leetcode/` 目录挂在根路径下：

```python
app.mount("/", NoCacheStaticFiles(directory=CONTENT, html=True))
```

所以本目录访问地址是 `http://127.0.0.1:8789/leetcode-all-in-one/`（./run.sh
启动，同源，不需要 CORS）。

Life OS 那边还留着一个独立的"LeetCode · Class"上课笔记页（打卡表单 +
Notes/Follow-up + 讲题顺序），没有搬过来，继续用它自己的 life.db；lc_checkins
/ lc_class_links 是 2026-08-10 从 life.db 迁移过来的一份快照，之后两边各自
累计，不互相同步。

**接口**（全部 `/api/leetcode/*`，`notes.js` 调用）：
`notes` · `notes-scope` · `notes/card` · `solution` · `checkins` ·
`expressions` · `stars` · `struggles` · `note-image`

**特殊路由**：`/leetcode-notes/{num}` —— 后端现生成的"空壳笔记页"，给没有动画
的题用。模板里引的仍是本目录的 `shared.css` / `ink.css` / `notes.css` /
`catalog.js` / `sidebar.js` / `notes.js`，**改本目录文件名时记得同步改它**。

---

## 7. notes.js 的五种页面形态

`notes.js` 在入口按当前页自动判断该渲染什么：

| 判断依据 | 形态 | 内容 |
|---|---|---|
| `body[data-lc-num]` | 空壳页 | 只有 Notes 区（没有动画） |
| `file === 'index.html'` | 首页（页面已删，分支还在） | 目前什么都不注入 |
| `file === 'chapter-notes.html'` | 章节页 | Notes / Templates 两栏 + Mock Expressions + 分类笔记；右上 Notes 卡带 "+ New note"，往下追加任意多张笔记卡（跟题目页同一个 `noteCardEl` 组件、同一张 `lc_note_cards` 表，key = `ch-notes:<章标题>`） |
| `file === 'section-notes.html'` | 分类页（2026-08-21） | 顶行左题目列表、右 Lyon 模板（跟章节页那一行同一对卡），下面 Blocks 列："+ New block" 加自命名 block（标题自己起 + 富文本正文，`blockEl` 组件、`lc_custom_blocks` 表，key = `sec:<章标题>\|<分类标题>`） |
| `document.title` 以 `数字. ` 开头 | 题目页 | 页面原内容包进 Animation 区 + Notes 区 + 顶部双区开关；Solution 块正上方固定一张只读 Problem 卡（2026-08-27 起所有题目页都有，含空壳页）：题面来源按顺序——页面里写了 `.oa-layout` 题面块（OA 图文页）就搬进来；否则 fetch `problems/<题号>.html` 片段（无题号按题名 slug；纯 innerHTML，正文 `<p>` + `<h3>Example N</h3>` / `<h3>Constraints</h3>` 小节，Chapter 8 的 10 道有题号的题手写；Chapter 9 的 10 道由 `4-leetcode-fill-in/scripts/fetch-ch09-problems.py` 从 LeetCode 抓取后生成；Chapter 1–7 全部 + Chapter 8/9 缺的（2026-09-01/02，共 129 道）由本目录 `scripts/fetch-problems.py <chapter-id>…` 抓取生成——它直接读 catalog.js 拿 slug，premium 题走 doocs/leetcode 镜像，已有的片段默认跳过、`--force` 才覆盖。生成的片段别手改，重跑脚本即刷新）；都没有就放 "not fetched yet" 占位 + 力扣链接。样式统一在 `notes.css` 的 `.lcn-problem-*` |
| 文件名对上 catalog 的 `page:` 条目 | 图文页（OA 题解等，无题号） | 同题目页（Notes / Animation，2026-08-16 改，原来开关叫 Problem）：页面里的题面（`.oa-layout`）挪进 Notes 区底部当只读 Problem 块，Animation 区放占位等以后补动画；打卡 key = 页面标题（= catalog 的 `pageName`）；Solution 块按题名 slug 对 standard-answers / user-answers 的无题号答案文件 |

题目页的 **Notes / Animation 开关**记忆在 localStorage，刷新后停在原地。
没用 URL hash——`3-longest-substring-consider-starting.html` 自己拿 hash 选
解法变体，会冲突。

**localStorage key 一览**：

| key | 存什么 |
|---|---|
| `lc-anim-sidebar-group` | 侧栏展开着哪些章节组 |
| `lc-anim-sidebar-collapsed` | 侧栏是否收起 |
| `lc-sidebar-mode` | 侧栏模式：`chapters`（Others + 全部章节）/ `bfs` / `dfs`（对应算法那张卡）/ `oa`（每场 OA 一张卡）/ `tiktok`（章节骨架只填 TikTok 高频题，卡 id 跟 chapters 共用）/ `all`（chapters + oa + tiktok 三块摞一起）。各入口页各自强制一种，其它页面沿用上次的 |
| `lcn-zone:<pathname><search>` | 该页上次看的是 Notes 还是 Animation |
| `lcn-view` | 全站布局：`monitor`（默认，Check in │ Rubric、Solution │ Notes 两列）/ `laptop`（外接屏不在时的单列纵排，复用 notes.css 960px 断点那套规则）。侧栏顶行 Leetcode Check-in 左边的 Monitor / Laptop 开关切换（sidebar.js），一处改全站题目页 + 章节页跟着变；sidebar.js 一跑就把 `lcn-laptop` 打到 `<html>` 上，先于 notes.js，不闪 |

---

## 8. 常见任务速查

| 想做什么 | 改哪里 |
|---|---|
| 加一道题到某章 | `catalog.js` 加一行（标准答案进 `standard-answers/`，个人补充进 `user-answers/`） |
| 上架一个新动画 | 先读 `ANIMATION_GUIDE.md`，做完页面 → `catalog.js` 加 `anim:` 字段 |
| 给一题补题面（Problem 卡） | 跑 `python3 scripts/fetch-problems.py chapter-N`（整章）或 `--slug <题名slug>`（单题）自动抓；抓不到的手写 `problems/<题号>.html` 片段（照 `problems/252.html` 的结构）。都不用改 JS |
| 换配色 / 调阴影 | 只改 `ink.css` 的变量，全站跟着变 |
| 改动画页布局/代码面板 | `shared.css`（影响全部 46 个动画页，改前想清楚） |
| 改笔记/打卡的样式 | `notes.css` |
| 给编辑器加/改一个工具栏按钮 | `notes.js` 的 `TB_DEF` 一处（5 个编辑块自动跟上） |
| 新加一个可编辑块 | `lcnToolbarHtml(cmds)` 出 HTML + `lcnEditor(bar, body, opt)` 接线 |
| 改侧栏 | `sidebar.js` 顶部的 `<style>` 模板串 |
| 改章节标题 | `catalog.js`——⚠️ 章标题是章级笔记的 scope key，改了旧笔记会断链 |
| 改题名 | ⚠️ 题名进 `"num. name"` 是打卡/笔记的 key，改了历史会断链，尽量别改 |
| 新建任意页面 | 记得写上 `<link href="ink.css">`（没有 JS 兜底） |

---

## 9. 已知的待办

- `UI_REQUIREMENTS.md` 的 "Standard Page Structure" 第 2 条还在描述旧的
  "代码右边线压页面中线 / 两列 `1fr` + justify-self" 规则，但 `shared.css`
  2026-08-04 已改成"两列 max-content、整块居中"。以那份 CSS 的注释为准。
- 字色盘在 `notes.js` 的 `NT_COLORS` 和 `cards/cards.js` 的 `CARD_NT_COLORS` 各存
  一份（Cards 是外置站，不加载 notes.js），改一边要同步另一边。荧光底色盘
  `NT_HILITES` 目前只有 LC Notes 有，Cards 站还没加。
- 打分色板在 `notes.css`（`.lcn-s0`~`.lcn-s5`）和 `notes.js`（`SCORE_BG`）
  各存一份，JS/CSS 双拷贝，改的时候两边都要动。
- 动画页自己的 `<style>` 里大多仍是字面色值（102 / 200 用了部分 token）。
  以后逐步换成 `var(--ink-*)`，不急。
