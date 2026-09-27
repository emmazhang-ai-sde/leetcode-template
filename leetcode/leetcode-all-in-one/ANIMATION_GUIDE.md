# LeetCode 动画页生成规范

给以后（人或 AI）在 `leetcode-all-in-one/` 里新做题目动画页用的规则。
2026-08-06 起生效；此前的老页面不强制回改，但新页面必须遵守。

---

## 核心规则：紫色高亮必须逐行走，一行都不许跳

**这是本文档最重要的一条（用户明确要求）。**

紫色行高亮（`.code-line.hl`）代表"解释器现在执行到哪一行"。它必须像调试器
单步执行一样，**按真实执行顺序经过每一行会被执行的代码**——哪怕这一行
不产生任何画面变化，也要单独给它一步，绝不能"这行没动画就跳过"。

具体地：

- **每一行可执行代码 ≥ 1 步**。`res = []`、`import collections`、
  `size = len(queue)` 这类"没画面"的行也各自一步，info 文案解释它在做什么。
- **不许把多行合并成一步**。"Line 25-26: 左右孩子入队"是违规的——
  25 一步、26 一步，各自展示自己入队后的队列状态。
- **循环每一轮都要重新走**。`for` / `while` 的头部行每轮迭代都高亮一次；
  条件判断行（`if curr:`）不管 True 还是 False 都要停一步，False 时
  info 里说明"条件不成立，跳过"。
- **函数调用行走两遍**：发起调用时一步（"调用 bfs(root, res)"），
  被调函数返回后回到这一行再一步（"递归返回，left_depth = 2"）——
  参照 104 页 LEFT_CALL 的做法。
- **进入函数也要走**：`def` 行（进入函数那一刻）、函数体第一行都不跳。
- 空行、注释行不执行，不用停。

判断标准：把 STEPS 里的 line 序列抄出来，应该能像 pdb 的 `step` 输出一样
读——从头到尾是一条完整的执行轨迹，没有断档。

---

## 文件与上架

- 文件名：`<题号>-<lc-slug>.html`，放 `leetcode-all-in-one/` 根目录。
- `<title>` 必须是 `NUM. Problem Name`（可加 ` — 副标题`，notes.js 会把
  ` — ` 后面截掉）。这个 title 就是打卡/笔记的 key，题名必须跟 catalog.js
  里的 `name` 一字不差，否则历史数据断链。
- **上架只做一件事**：`catalog.js` 对应题目加 `anim: '<文件名>'` 字段。
  sidebar、首页卡片、Chapter Notes 链接、placeholder 替换全部自动跟上。

## 页面骨架（照抄现有页，别自创）

```html
<head>
  <link rel="stylesheet" href="shared.css?v=info-hud">
  <style>/* 本页专属的可视化样式，颜色用 var(--ink-*) */</style>
</head>
<body>
<link rel="stylesheet" href="ink.css">
<script src="catalog.js"></script>
<script src="sidebar.js"></script>
<script src="shared.js?v=copybtn"></script>

<div class="content-wrapper">
  <script>renderHeader({ title, link, legend })</script>
  <div class="main layout-grid">
    <script>renderCodeBox({ prereq, code })</script>
    <script>/* 见下面「步骤说明 + 颜色图例搬到代码框下面」，紧跟在 renderCodeBox 后面 */</script>
    <div class="viz-panel"> …卡片… </div>
  </div>
</div>
<script> /* TREE/POS 常量 + buildSteps() + render 函数 */ </script>
```

shared.js 提供步进地基：`highlightLine` / `renderCtrl` / `go` / `doReset` /
Auto 播放 / `lockStableSizes`（自动锁卡片高度防抖动）。页面只需要暴露
`STEPS`（数组）、`cur`（当前步下标）、`render`（全量渲染函数），
结尾 `var render = renderAll; doReset();`。

## 步骤说明 + 颜色图例搬到代码框下面（2026-08-10 起硬性规则）

`renderHeader` 默认把颜色图例（`legend`）渲染在页头、代码框上面；
`renderCodeBox` 默认把步骤说明（`#info`）渲染在代码框上面（`.code-stack`
的第一个子元素）。**新页面一律不用这个默认位置**——两块都要挪到代码框
（`.code-panel`）下面，跟 `46-permutations.html` / `79-word-search.html`
一样。页头只留标题 + 步进控件（Step x/y、Prev/Next/Auto/Reset）。

`renderCodeBox` 调用之后紧跟着加这段（一字不改照抄，`.legend` /
`#info` 的 id/class 是固定的，不用照页面改名）：

```html
<script>
(function () {
  const stack = document.querySelector('.code-stack');
  stack.appendChild(document.getElementById('info'));
  const legend = document.querySelector('.legend');
  const legendRow = legend.parentElement;
  legend.classList.add('legend-below');
  stack.appendChild(legend);
  legendRow.remove();
})();
</script>
```

`legendRow.remove()` 是必须的一步——不删的话页头会留一条空的
`.header-row`（居中 flex 行），占位置但里面空了。

本页专属 `<style>` 里要带上这条（图例挪到代码框下面后改纵向单列排列，
跟页头那种居中横排 flex-wrap 不一样）：

```css
.legend-below { flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 0; max-width: none; }
```

如果页面还有别的想放代码框下面的元素（不是 `var-bar`），用同样的
`appendChild` 手法接着挪，顺序看 `.code-stack` 里 append 的先后——先挪的排
前面。

## var-bar（参数读数行）跟调用链卡片放一行（2026-08-14 起硬性规则）

页面如果同时有「调用链」卡片和 `var-bar`，**不要**把 `var-bar` 塞进
`.code-stack`（那是老页面的做法，2026-08-14 起弃用）——改成在 `.viz-panel`
里让两者并排一行，`var-bar` 放右边，其余卡片各自另起一行排在这一行下面：

```html
<div class="viz-panel">
  <div class="viz-row">
    <div class="card">
      <h3>调用链 — 现在这行代码是谁在跑</h3>
      <div class="call-chain" id="call-chain"></div>
    </div>
    <div class="var-bar" id="var-bar"></div>
  </div>

  <div class="card">…其他卡片，一张一行…</div>
</div>
```

```css
.viz-row { display: flex; align-items: flex-start; gap: 16px; }
```

`var-bar` 自带白底圆角（`shared.css` 里已经是 `.card` 同款视觉），不用再套
一层 `.card`。页面没有调用链卡片（比如纯 BFS、没有递归栈）就不适用这条，
`var-bar` 照旧单独一行摆在 `.viz-panel` 最上面。

## 代码面板

- 答案代码必须是 `standard-answers/` 里的标准答案（本地补充可放
  `user-answers/`），**逐字保留**
  （包括 `return res;` 这种分号、`levelRes` 这种命名）。按题号取文件。
- 数据结构定义（TreeNode/ListNode 注释）放 `prereq`，行号从 1 开始连续
  编；正文行号紧接 prereq。页面里定义 `const L = { POP: 22, … }` 一张
  行号表，`snap()` 只用常量，不写裸数字。
- 改完用模拟测试核对行号（见"验证"节）。

## 步骤生成

- **必须用 `buildSteps()` 真实模拟算法本身**生成步骤——跑一遍真算法，
  在每行执行处 `snap(line, info)` 快照，绝不手写步骤数组。
- 快照存全量状态的深拷贝（queue/stack/res/done/…），render 函数只读
  快照、无副作用，保证任意跳步（Prev/Reset/lockStableSizes 的干跑）正确。
- info 文案用中文，格式 `Line N: <代码在干什么> — <为什么/要注意什么>`。
  首步（line=null）说明"点击 Next 开始"，末步 `✅ … 最终答案 = …`。
- 步数不设上限——逐行规则会让步数变多，这是预期行为，Auto 播放（1-3 倍速）
  就是为这个准备的。不要为了压步数合并行。

## 可视化约定

- 风格走 Ink & Border：颜色引用 `ink.css` 的 `var(--ink-*)` token，
  等宽字体用 `var(--ink-mono)`，不写字面值。
- 节点/元素状态配色沿用站内既有语义（跟 102/104 一致）：
  - 黄 `rgba(249,203,66,0.55)` = 当前正在处理（curr / 栈顶）
  - 蓝 `rgba(120,160,225,0.3)` = 在队列/待处理
  - 绿 `rgba(93,202,165,0.4)` = 已完成/已收进结果
  - 灰 `#f5f5f5` 描边 `#c9c9c9` = 未访问 / None
- 每种用到的颜色都要进 `renderHeader` 的 `legend`。
- 例子优先用 LeetCode 官方示例（题目页第一个 Example）。
- 变量读数（`size`/`len(queue)`/`curr` 这类）放卡片下方的 mono 小字行，
  用 `.var-name`/`.var-eq`/`.var-val` 三件套。

## 验证（发布前必做）

1. `node -c` 不适用于 HTML——把 `// ── Tree definition` 到
   `const STEPS = buildSteps();` 的片段抽出来 eval，断言：
   - 最终答案正确（跟 LeetCode 官方示例输出一致）；
   - 每步的 `line` 都在 `L` 常量集合 ∪ {null} 里；
   - **line 序列是完整执行轨迹**（核心规则，肉眼过一遍）。
2. `curl` 页面 200；刷新浏览器点几步，确认高亮、卡片、Auto 都正常。
3. `catalog.js` 加了 `anim` 后 `node -c catalog.js`。
