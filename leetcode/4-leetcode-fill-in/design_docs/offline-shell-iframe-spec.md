# 离线入口页 + 侧栏 + iframe 内容区 — 规范与实现 Prompt

本文档描述「一个入口 HTML + 左侧全集导航 + 右侧 iframe 加载各章课件/各题页面」的架构，用于 **离线双击 `file://` 打开**、持续扩展 9 章、且与现有 `fill-skill.md` / `all-in-one_fill+lyon's-note.html` 视觉风格可对齐。

---

## 1. 目标与约束

| 目标 | 说明 |
|------|------|
| 单入口 | 用户只打开一个 `index.html`（名称可自定），即可看到 **9 章全部** 课件与题目入口。 |
| 内容拆分 | 每道题、每份课件仍是 **独立 `.html`（或 PDF 链接）**，不把所有正文塞进入口文件。 |
| 离线 | **不依赖**本地服务器；用相对路径 + iframe 切换 `src`（避免用 `fetch` 拉本地片段，以免 `file://` 被拦截）。 |
| 格式延续 | CSS 变量与字体可与 `all-in-one_fill+lyon's-note.html` 的 `:root` / Inter / mono 保持一致。 |

---

## 2. 页面信息架构

```
┌─────────────────────────────────────────────────────────────┐
│  [可选] 顶栏：课程标题 / 当前选中项标题                         │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  侧栏         │  iframe：主内容区                             │
│  - Ch1 课件   │  src = 相对路径，指向某课件/某题 .html         │
│  - Ch1 题…   │  整页替换，无需 fetch                          │
│  - Ch2 …     │                                              │
│  - …         │                                              │
│  (9 章全集)  │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

- **侧栏**：唯一维护「章 → 课件 / 题」树状结构的地方（推荐用 **一份 JSON 数据** 在 JS 里渲染，避免手写 9 章 HTML 重复）。
- **主区**：单个 `<iframe id="content-frame">`，点击侧栏项时设置 `iframe.src` 为对应相对路径。

---

## 3. 推荐目录结构（示例）

```
leetocde填空/
  index.html                 ← 入口（唯一需要「双击」的壳；可改名但需自洽）
  assets/
    shell.css                ← 仅壳：布局 + 侧栏 + iframe（可选拆分）
    shell.js                 ← 读 NAV 数据、渲染侧栏、切换 iframe
    nav.json                 ← 导航树（也可内嵌在 shell.js 里）
  chapters/
    ch01/
      ch01-notes.html        ← 课件页（或放 pdf，见下）
      套模板类型-704-binary-search.html   ← 可按分类加文件名前缀
      ...
    ch02/
      ...
    ...
```

- 若课件是 **PDF**：`nav.json` 里该项 `type: "pdf"`，`href` 指向 `chapters/ch01/slides.pdf`；点击时用 **新窗口** `window.open(href)` 或 iframe（部分浏览器对 `file://` 下 PDF 表现不一，可优先新窗口）。
- 题目页仍为独立 HTML，与 `fill-skill.md` 生成物一致，仅去掉「整站侧栏」若曾嵌入。

---

## 4. 侧栏 UI 框架（语义与类名）

与现有大页保持可读对齐时可沿用以下 **命名约定**（实现时可微调，但建议在 Prompt 里写死以便一次生成）。

### 4.1 外层

- `<aside class="chapter-nav" aria-label="章节与课件与题单">`
- 内层按章分组：`<section class="nav-chapter" data-chapter-id="1">`

### 4.2 每一章

- **章标题**（可点击展开/折叠）：`<button class="nav-chapter-head" aria-expanded="true|false">` 或 `<h2 class="nav-chapter-title">`
- **章内分组**（可选，与现有一致）：
  - `课件` → `<div class="nav-group"><div class="nav-group-label">课件</div><ul class="nav-list">…</ul></div>`
  - `题目` → 同上，`nav-group-label` 为「题目」或「套模板 / OOXX」等子类

### 4.3 每一项（叶子）

- 题目或课件链接：`<button type="button" class="nav-item" data-src="chapters/ch01/704.html">` 或 `<a class="nav-item" href="..." …>`  
  - 若用 **button**，由 JS 设置 `iframe.src`，并 `preventDefault` 避免整页跳转。  
  - 若用 **`<a target="content-frame" href="...">`** 且 iframe 有 `name="content-frame"`，可 **无 JS** 切换 iframe（离线也适用）。两种二选一，推荐 **button + JS** 便于统一「当前选中」样式。

### 4.4 选中态

- 当前选中：`.nav-item.is-active`（或 `aria-current="page"` 在侧栏语义上需注意，通常用于 `is-active` 即可）。

### 4.5 响应式

- 窄屏：侧栏可改为**顶栏折叠**（`<details>`）或 **横向滚动**，避免挤压 iframe；最小宽度建议侧栏 `240px–280px`，iframe `min-height: 70vh`。

---

## 5. iframe 约定

```html
<iframe
  id="content-frame"
  title="当前课件或题目"
  class="content-frame"
  src="about:blank"
></iframe>
```

- 初始 `src`：`about:blank` 或第一章默认页（如 `chapters/ch01/ch01-notes.html`）。
- **相对路径**均以 **入口 `index.html` 所在目录** 为基准。
- 子页面（题目 HTML）内 **不要** 再嵌一层全站侧栏，避免双栏；子页仅内容区。

---

## 6. `nav.json` 数据结构（示例）

实现时可把下列 JSON 作为唯一真相来源；`shell.js` 遍历渲染侧栏。

```json
{
  "siteTitle": "算法课 · 填空练习",
  "chapters": [
    {
      "id": "ch01",
      "title": "Chapter 1：Binary Search",
      "sections": [
        {
          "label": "课件",
          "items": [
            { "title": "洛岩老师课件", "type": "html", "src": "chapters/ch01/ch01-notes.html" }
          ]
        },
        {
          "label": "题目",
          "items": [
            { "title": "704. Binary Search", "type": "html", "src": "chapters/ch01/套模板类型-704-binary-search.html" }
          ]
        }
      ]
    },
    {
      "id": "ch02",
      "title": "Chapter 2：…",
      "sections": [
        { "label": "课件", "items": [] },
        { "label": "题目", "items": [] }
      ]
    }
  ]
}
```

- `type`: `"html"` | `"pdf"` | `"external"`（外链少用，离线可能无效）。
- 扩展新章：在 `chapters` 数组追加对象；新题：在对应 `items` 里追加一行并放入对应 `chapters/chXX/*.html` 文件。

---

## 7. 可复制：给实现者 / Cursor 的 **Implementation Prompt**

将下面整段复制为一条任务说明即可用于生成 `index.html` + `assets/shell.css` + `assets/shell.js` + 示例 `nav.json`。

---

### Prompt（英文，便于模型严格执行）

```
Implement an offline-first static shell for a course site:

- Single entry file: index.html at repo folder "leetocde填空".
- Layout: left sidebar (full width ~260px, sticky top) + right main area with ONE iframe#content-frame.
- Sidebar must list 9 chapters (use placeholder titles Ch2–Ch9 if empty). Each chapter is collapsible. Under each chapter, two groups: "课件" (slides) and "题目" (problems). Items are buttons that set iframe.src to a relative path from index.html. Do NOT use fetch() to load content.
- Load navigation from assets/nav.json via a synchronous inline script embedding the JSON OR fetch only if you document that file:// may require opening via server—prefer embedding the JSON in shell.js for maximum file:// compatibility, OR paste JSON as a JS constant.
- Styling: Use CSS variables compatible with existing theme (--color-background, --color-background-secondary, --color-text, --color-focus, Inter + system mono). Support prefers-color-scheme dark/light like the existing all-in-one HTML.
- Accessibility: aside[aria-label], buttons have focus-visible outline, iframe has a title updated when selection changes.
- Provide minimal placeholder pages under chapters/ch01/ch01-notes.html and one problem page so the structure works when double-clicking index.html.
- Keep shell.css only for layout/nav/iframe; problem pages can be minimal stubs.
```

---

### Prompt（中文简版）

```
在 leetocde填空 下实现离线可用的入口：index.html 左侧为全集侧栏（9 章，章可折叠，每章下分「课件」「题目」），右侧单个 iframe 显示内容。点击侧栏用 JavaScript 设置 iframe 的相对路径 src，不要用 fetch 加载本地文件。导航数据来自 nav.json；若 file:// 下读 JSON 不便，可将同一份数据写进 shell.js 常量。样式用 CSS 变量做深浅色，侧栏宽约 260px、iframe 最小高度约 70vh。附带 ch01 示例课件与一题占位 HTML。子页面不含整站侧栏。
```

---

## 8. 后续与 `fill-skill.md` 的配合

- 用 skill **生成的题目 HTML** 保存为 `chapters/chXX/题号-标题.html`，在 `nav.json` 增加条目即可。
- 壳层 **不负责** 填空逻辑；仅提供导航与展示容器。

---

## 9. 版本与维护

| 变更 | 操作 |
|------|------|
| 新增一章 | 新建 `chapters/chXX/`，更新 `nav.json` |
| 新增一题 | 新 HTML + `nav.json` 一条 |
| 改侧栏样式 | 只改 `assets/shell.css` |

---

*文档结束。*
