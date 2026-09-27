# LeetCode Animation UI Requirements

> Note: This document summarizes the UI requirements reflected in the current
> project implementation. It is based on the existing HTML/CSS/JS files in this
> repository rather than a full transcript of prior conversations.

## Product Positioning

1. The project is an interactive algorithm animation tool, not a static solution
   article.
2. The first screen should show the usable learning interface directly: code,
   state variables, visualization, and controls.
3. Each problem should be implemented as a standalone HTML page.
4. Each page title should show the LeetCode problem number and name, with a link
   to the original LeetCode problem.

## Shared Header Component

1. Never hand-write the page header, step controls, or legend markup. Every page
   must call the shared `renderHeader()` component (defined in `shared.js`) from
   an inline script placed right after `<div class="content-wrapper">`.
2. The header always follows the same line order:
   - line 1: the heading — problem number and name, linking to the LeetCode
     problem;
   - line 2: the different examples or methods, when the page has more than one
     (rendered as switcher buttons);
   - line 3: the steps — `Step x / y` counter plus `Prev`, `Next`, `Auto`, and
     `Reset`;
   - line 4: the legend explaining what the different colors mean.
3. Usage:

   ```html
   <script>
   renderHeader({
     title: '76. Minimum Window Substring',
     link: 'https://leetcode.com/problems/minimum-window-substring/',
     examples: [                       // optional — only multi-example pages
       { id: 'leetcode', label: 'ADOBECODEBANC / ABC' },
       { id: 'aab', label: 'aab / ab' },
     ],
     examplesLabel: 'Example:',        // optional — e.g. 'Method:'
     legend: [                         // optional
       { color: 'rgba(249,203,66,0.50)', label: 's[j] enters window' },
       { color: '#f0f0f0', extra: 'opacity:0.4;', label: 'processed' },
     ],
     controls: false,                  // stub pages only — hides line 3
   });
   </script>
   ```

4. Each example button gets id `ex-<id>` and calls `loadExample('<id>')`; the
   page's own JS implements `loadExample` and may toggle the button's
   `auto-active` class to mark the current example.
5. The step controls keep the standard ids (`prog`, `btnPrev`, `btnNext`,
   `btnAuto`) so `renderCtrl()`, `go()`, `toggleAuto()`, and `doReset()` from
   `shared.js` work unchanged.
6. The per-step explanation text (`.step-info`, id `info`) is not part of the
   header; it stays at the top of the code column.

## Standard Page Structure

1. Use a consistent teaching layout:
   - code panel on the left;
   - visualization panel on the right;
   - controls and legend near the top.
2. The code panel and the visualization panel must sit on either side of the
   page's center line — the midpoint of the centered problem title. The code
   panel's right edge ends at the center line and the visualization panel's
   left edge starts at it (the 20px column gap straddles the line).
   - The shared `.main.layout-grid` enforces this with two equal `1fr` columns
     plus `justify-self: end` on `.code-half` and `justify-self: start` on
     `.viz-panel`.
   - Pages that need fixed panel widths (e.g. 303, 252, 253) must set the width
     on `.code-half` / `.viz-panel` themselves — never on the grid columns —
     so the split stays on the center line.
3. Let simple pages use the shared two-column layout.
4. Allow complex pages to customize the split, such as fixed panel widths,
   while preserving the same visual hierarchy and the centered split line.
5. Keep code, state, and visualization visible together whenever possible.

## Controls

1. Every animation page should include the standard controls (rendered by
   `renderHeader()` — see Shared Header Component):
   - `Prev`;
   - `Next`;
   - `Auto`;
   - `Reset`;
   - a step counter such as `Step 3 / 20`.
2. `Auto` should cycle through stopped, `1x`, `2x`, `3x`, then stopped again.
3. Manual navigation or reset should stop autoplay.
4. The disabled state for navigation buttons should be visually clear.
5. The active autoplay state should be visually distinct.

## Code Panel

1. The code panel is a core teaching surface.
2. Never hand-write the code panel markup or token spans. Every page calls the
   shared `renderCodeBox()` component (in `shared.js`) from an inline script
   placed where the code half belongs — the first panel inside `.main`:

   ```html
   <script>
   renderCodeBox({
     code: `
   class Solution:
       def lengthOfLongestSubstring(self, s: str) -> int:
           ...`,
   });
   </script>
   ```

   It generates the whole `.code-half` / `.code-stack` / `.step-info#info` /
   `.code-panel` / `.code-block` structure with automatic Python syntax
   highlighting, line numbers, and sequential `data-l` attributes (blank lines
   included) that `highlightLine()` targets.
3. Options for non-standard panels:
   - `prereq` — a commented prelude block shown above the code (23, 378); its
     lines are numbered first and the main code continues the count;
   - `append: { line: html }` — inline HTML (e.g. `code-note` pills) added at
     the end of a line (252, 253);
   - `raw: { line: html }` — full custom markup for a line that needs inline
     wrappers such as `code-token` (252, 253);
   - `blocks: [{ html }, { code }]` — multi-block panels with chrome between
     blocks such as phase badges (clone graph); numbering continues across
     blocks.
4. Code should include:
   - line numbers;
   - syntax highlighting;
   - current-line highlighting.
5. The highlighted line must match the current animation step; `data-l`
   numbers are what `STEPS` references, so keep the source lines in the same
   order when editing code.
6. Use concise inline notes for complex conditions when useful.
7. Avoid turning the code panel into long-form explanation text.

## State Variables

1. Each page should expose key runtime state in a visible variable bar.
2. Common examples include `i`, `j`, `left`, `right`, `maps`, `stack`, `heap`,
   `visited`, `res`, and other problem-specific values.
3. Use monospace type for algorithm data.
4. Keep variable formatting consistent:
   - variable names have their own color;
   - equals signs have their own color;
   - important values have their own color and weight.
5. State changes should stay synchronized with the current code line and
   visualization.

## Visualization Behavior

1. Every animation step should connect three things:
   - the current code line;
   - the changed state variables;
   - the changed visual element.
2. The user should be able to tell what changed at each step without reading a
   long explanation.
3. Visualizations should represent the actual algorithm structure:
   - sliding window pages show cells, window bars, and left/right pointers;
   - stack pages show stack order, top, bottom, and active comparisons;
   - heap pages show heap contents, push/pop states, and visited state;
   - graph pages show nodes, edges, queue/map state, and traversal progress;
   - interval pages show timelines, interval blocks, event streams, and counters.
4. Use empty states such as `maps = {}`, `visited = set()`, `[]`, `no calls yet`,
   `还未开始`, or `还没有 push` where appropriate.

## Legend

1. Pages should include a clear legend when multiple visual states appear.
2. Legend colors must match the colors used in the visualization.
3. Typical legend states include:
   - current element;
   - current window;
   - element entering or leaving;
   - valid state;
   - best answer;
   - conflict;
   - completed;
   - newly added item.

## Visual Style

1. The overall style should be clean, light, and macOS-like.
2. Use system UI fonts for normal interface text:
   `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
3. Use monospace fonts for algorithm data:
   `SF Mono`, `Menlo`, `monospace`.
4. Keep the palette light:
   - page background: light gray, such as `#f9f9f9`;
   - panels/cards: white;
   - primary text: near-black, such as `#1a1a1a`;
   - secondary text: gray.
5. Avoid heavy shadows, decorative backgrounds, and marketing-style visuals.
6. The design should feel like a focused learning tool.

## Color Semantics

1. Colors should carry stable algorithm meaning.
2. Common semantic colors:
   - purple: data structures, maps, heaps, stacks, windows, variable names;
   - yellow: current item, active comparison, item entering the window;
   - green: success, valid state, newly added item, covered requirement;
   - orange/red: result, conflict, important value, false path, leaving item;
   - blue: one side of a pointer pair or secondary pointer;
   - gray: empty state, inactive state, completed or faded-out items.
3. Avoid arbitrary color changes between pages unless the algorithm requires a
   clearer distinction.

## Layout Stability

1. Blocks whose content changes per step must never resize *vertically* while
   stepping: the white background of each block is sized to the maximum
   height it will ever need across all steps.
2. This is enforced automatically by `lockStableSizes()` in `shared.js`: on
   load (and again once fonts settle) it dry-runs every step before first
   paint, measures each `.step-info`, `.var-bar`, and `.card`, and pins its
   `min-height` to the largest height observed. Pages that rebuild `STEPS`
   (example switchers) call `lockStableSizes()` again after rebuilding; pinned
   heights only ever grow, so re-running is safe.
3. Never give the step-info a fixed `height` (it would clip long explanations);
   use `min-height` as a baseline and let the lock pin the real maximum.
4. Width is intentionally NOT locked or pre-stretched. Each animation block on
   the right (`.var-bar`, `.card`) sizes to its own current content and is
   allowed to be narrower or wider than its neighbors, and to change width as
   the user steps through the animation:
   - a short row (`i = 3`) must not be padded out to match a long row
     (`maps = {'a': 1, 'b': 2, 'c': 1}'`) elsewhere on the same page;
   - a block must not be pre-stretched to accommodate the single longest line
     it will ever show across the whole animation — only *that* step needs to
     be wide, not every step.
   - This is `.viz-panel { align-items: flex-start }` in `shared.css`: the
     flexbox default (`stretch`) is what forces every sibling block to match
     the widest one, so it is explicitly overridden. Only override this back
     to `stretch` for a page that has a genuinely fixed-width design with
     intentionally equal-width cards side by side (e.g. a deliberate card
     grid), not merely because content happens to be long.
5. Blocks that appear mid-animation (like 23's variable inspector) should
   toggle `visibility`, not `display`, so their reserved space never shifts
   the layout.
6. Fixed-format elements should have stable dimensions: cells, pointer rows,
   stack items, heap nodes, result cells, and counters define fixed sizes or
   meaningful minimums.
7. Text changes should not cause vertical layout jumps; long code lines may
   scroll horizontally inside the code block.
8. Dynamic text should wrap or be constrained so it does not overlap neighboring
   elements.

## Shape And Spacing

1. Use restrained, consistent border radii.
2. Small cells and pills usually use 6-8px radius.
3. Larger panels and code cards usually use around 12px radius.
4. Avoid exaggerated pill shapes unless they clearly represent a compact token or
   status chip.
5. Keep spacing compact enough for code and visualization to remain visible
   together.

## Animation

1. Animations should be short and purposeful.
2. Common transition durations should stay around 0.15-0.25s.
3. Appropriate emphasis effects include:
   - background color change;
   - slight scale;
   - slight translate;
   - opacity change.
4. Avoid excessive or distracting animation.

## Content Style

1. The UI should explain through interaction, not through long paragraphs.
2. Step text should be concise and directly tied to the current action.
3. Prefer visual state, code highlight, and variable updates over prose.
4. Use bilingual or Chinese labels where they already improve clarity, but keep
   the page visually compact.

