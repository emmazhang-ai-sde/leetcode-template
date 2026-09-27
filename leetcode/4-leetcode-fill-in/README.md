# Leetcode Fill-in — Project Framework

Static HTML/CSS/JS practice app: **fill-in-the-blank** coding exercises alongside **courseware** pages (lecture notes) embedded in the main shell or opened standalone.

---

## Page types

| Type | Role | Typical entry |
|------|------|----------------|
| **Main app shell** | Sidebar navigation + either courseware (iframe) or fill exercise | [`index.html`](index.html) |
| **Courseware** | Chapter notes (Markdown-style sections, TOC, code templates, LeetCode links) | [`chapters/ch01/ch01-notes.html`](chapters/ch01/ch01-notes.html), [`ch02/ch02-notes.html`](chapters/ch02/ch02-notes.html), [`ch07/ch07-notes.html`](chapters/ch07/ch07-notes.html) |
| **Standalone fill** | Single-problem page without the full sidebar | [`chapters/ch01/TEMPLATE-problem.html`](chapters/ch01/TEMPLATE-problem.html) and generated `*-*.html` under `chapters/ch01/` |

---

## CSS architecture

Styles are split so **global tokens**, **app chrome**, **courseware body**, and **fill UI** do not all live in one file. New courseware pages should pull in **`globals.css` + `courseware.css`** (or the barrel [`assets/ch01-notes.css`](assets/ch01-notes.css)). New fill-only pages should use **`fill-theme.css`** (or the same layers manually).

### Layers (`assets/`)

| File | Responsibility |
|------|------------------|
| **`globals.css`** | Design tokens (`:root`), dark mode overrides, reset, `body`, shared **`.prob-title`** (problem title line used in multiple contexts) |
| **`layout-app-shell.css`** | **Index only**: `page-shell`, sidebar (`.chapter-nav`), `.main-content`, problem list tabs (`.prob-tab`), responsive rules for the shell |
| **`courseware-embed.css`** | **Index only**: wrapper around embedded notes — `.chapter-notes-panel`, `.notes-iframe`, `[hidden]` |
| **`courseware.css`** | **Courseware pages** (including inside iframes): notes layout, TOC, sections, template cards, syntax-colored blocks, LeetCode link rows, optional `notes-standalone-wrap` / `notes-courseware-page` width |
| **`fill-exercise.css`** | **Fill UI**: `.prob-panel`, code table (`.code-table`), blanks (`.blank`), indicators, controls, score, copy toast |
| **`repo-corner.css`** | Top-right “0-Lyon-Python” / “本题 .py” corner links (also used by [`repo-corner.js`](assets/repo-corner.js)) |

### Import barrels

- **[`assets/app.css`](assets/app.css)** (used by `index.html`):  
  `globals` → `layout-app-shell` → `courseware-embed` → `fill-exercise`

- **[`assets/ch01-notes.css`](assets/ch01-notes.css)** (courseware standalone + iframe documents):  
  `repo-corner` → `globals` → `courseware`

- **[`assets/fill-theme.css`](assets/fill-theme.css)** (standalone single-problem pages):  
  `repo-corner` → `globals` → `fill-exercise` + small wrappers (e.g. `.problem-main`, optional `.notes-page` placeholder)

`index.html` also links **`repo-corner.css`** directly in `<head>` (alongside `app.css`).

---

## JavaScript architecture

Scripts are split by **shared fill engine**, **shell layout**, **fill-specific index behavior**, **courseware panel toggling**, and a thin **router** entry.

| File | Responsibility |
|------|----------------|
| **`fill-blanks.js`** | Core fill logic: init blanks, check/reset, merge copy, score — exposed as `window.FillBlanks` |
| **`ch01-problems-bundle.js`** | Generated list `window.CH01_PROBLEMS` (run `npm run build:ch01` after editing chapter HTML sources) |
| **`ch02-problems-bundle.js`** | Generated lists `window.CH02_FILL_TRAVERSAL` / `window.CH02_FILL_DFS` (run `npm run build:ch02` after editing chapter HTML sources) |
| **`ch02-tree-python-template.js`** | Optional Chapter 2 tree template payload `window.CH02_TREE_PYTHON_TEMPLATE` |
| **`ch09-problems-desc.js`** | Generated `window.CH09_PROBLEM_DESC` — LeetCode problem statements (HTML) keyed by problem number, shown in the `#probDesc` block above the code table. Regenerate (plus `chapters/ch09/ch09-problems-md/*.md`) with `python3 scripts/fetch-ch09-problems.py` |
| **`app-shell-layout.js`** | `window.AppShellLayout.syncNavFromTitle` — measures sidebar title width and keeps layout stable on resize/fonts |
| **`fill-exercise-index.js`** | `window.FillExerciseIndex` — Chapter 1 problem list, tab building, render problem, hash parse/set, toolbar buttons, Ch2 tree template fill mode |
| **`courseware-index.js`** | `window.CoursewareIndex` — show/hide courseware iframes vs fill panel; wires “Chapter N — 课件” nav buttons |
| **`index-app.js`** | Entry: reads hash, calls `FillExerciseIndex` / `CoursewareIndex` to show the right view |
| **`fill-core.js`** | Used on standalone problem pages (with `fill-blanks.js`) for DOMContentLoaded wiring |
| **`repo-corner.js`** | Injects/updates the top-right corner links: `/lyon/` (local 0-Lyon-Python + 0-my-answers listing) and `/lyon/<num>` (this problem's answer file, plain text) — served by `backend/main.py`; the teacher's GitHub repo is offline |

### Script load order (`index.html`)

1. `fill-blanks.js`  
2. `ch01-problems-bundle.js`  
3. `ch02-tree-python-template.js`  
4. `ch02-problems-bundle.js`
5. `app-shell-layout.js`  
6. `fill-exercise-index.js`  
7. `courseware-index.js`  
8. `index-app.js`  
9. `repo-corner.js` (deferred)

---

## Content and build

- **Chapter 1** fill problems are authored as HTML under [`chapters/ch01/`](chapters/ch01/); the bundle is regenerated with:

  ```bash
  npm run build:ch01
  ```

  See [`chapters/ch01/STRUCTURE.txt`](chapters/ch01/STRUCTURE.txt) for naming and workflow notes.

- **Chapter 2** fill problems are authored as HTML under [`chapters/ch02/`](chapters/ch02/); the bundle is regenerated with:

  ```bash
  npm run build:ch02
  ```

  See [`chapters/ch02/STRUCTURE.txt`](chapters/ch02/STRUCTURE.txt) for naming and workflow notes.

- **Deep links** on the main app include `#p-<题号>`, `#notes-ch1`, `#notes-ch2`, `#notes-ch7`, and `#ch2-tree-py` (Chapter 2 tree template mode).

---

## Adding new pages (quick guide)

- **New courseware chapter page**: Add an HTML file under `chapters/…`, link **`assets/ch01-notes.css`** (or `globals.css` + `courseware.css` + `repo-corner.css` as needed), reuse the same structural classes as existing `*-notes.html` files. Register an iframe + nav button in `index.html` if it should appear in the main shell.

- **New fill-only page**: Start from [`chapters/ch01/TEMPLATE-problem.html`](chapters/ch01/TEMPLATE-problem.html) and **`fill-theme.css`**; keep using `fill-blanks.js` + `fill-core.js` for behavior.

This structure keeps **global**, **courseware**, and **fill** concerns separate so each new page only pulls the CSS/JS layer it needs.
