在 index 页面增加一个 Chapter 4: DFS，同时在左上方增加对应的 tab
● 先看完整的 index.html 结构，再看 ch07 的 notes 页作参考。
● 再看 app-shell-layout.js 和 index-app.js 了解 tab 切换逻辑。
● 现在清楚全貌了，需要改 6 处：
创建 chapters/ch04/ch04-notes.html
创建 assets/ch04-problems-bundle.js
更新 index.html（tab + panel + iframe + script）
更新 fill-exercise-index.js（parseHash + updateNavCategoryHeads）
更新 courseware-index.js（showNotesCh4 + 监听器）
更新 index-app.js（hash 路由）

-----------


# Extract all content from the provided image

## Task
- Extract all content from the provided image
- Insert it into the sidebar under:
  - **Section title:** `Chapter 3: BFS + Topological Sorting
  - Create a new subsection:
    - **Title:** `Chapter 5 - 课件`

## Content Requirements
- Extract **all text exactly as shown** in the image
- Include Python/Java template
- **Do NOT:**
  - Add new content
  - Modify wording
  - Summarize anything
- Preserve:
  - Code structure
  - Indentation
  - Line breaks

## Code Styling Rules
- Remove all **highlight background colors**
- Preserve **text colors** (keywords, comments, variables)
- Keep syntax highlighting consistent with the existing project style

## UI Requirements
- Place the new subsection correctly under the sidebar
- Copy the UI design from `Chapter 2 - 课件`
- Follow:
  - The **overall existing UI style**
  - A **simple and clean layout**
- Avoid:
  - Extra decorations
  - Complex components

## Output Requirements
- Return a markdown file
- No explanations
- Ensure clean integration with the existing project structure



----------------------------

The goal is to map this section of content in chapters/ch06/ch06-notes.html to the clickable structure of index.html on the left, following these rules:

Notes-sub-titles (e.g., BFS / DFS / Backtracking / Graph Theory (BFS + DFS)...) correspond to the type group headings in the sidebar.

Each notes-prob-item (e.g., 127..797...) corresponds to the title tab button under that group.

Refer to the UI of the chapter 3 sidebar.



-------------------