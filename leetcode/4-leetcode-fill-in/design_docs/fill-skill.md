# Fill-Skill (Simplified)

Converts a standard solution you've written under `chapters/chxx/` (typically a `.md` file) into a fill-in-the-blank exercise and registers it in the corresponding chapter's sidebar tab.

---

## 1) Your Fixed Workflow (Context)

- You write a standard solution file in a chapter directory: `chapters/chxx/`.
- File names follow one of these patterns:
  - `<number>.md`, e.g. `94.md`
  - `<number>. <title>.md`, e.g. `144. Binary Tree Preorder Traversal.md`
- You then ask me to convert that solution into a fill-in-the-blank exercise and add it to the sidebar list for that chapter.

---

## 2) Generation Tasks (What I Need to Do)

When you provide a solution file, I will:

1. Read the solution content and preserve the original structure and code intent.
2. Generate the corresponding fill-in-the-blank exercise page under the chapter directory.
3. Update the chapter's problem list / manifest so the problem appears in the correct sidebar tab.
4. Run the chapter's build command so the new problem is visible in the index.

---

## 3) Simplified Constraints (High-Value Rules Only)

### A. Source Content

- The solution file you provide is the single source of truth.
- Do not rewrite the solution logic beyond blanking; do not invent an alternative solution.
- Minimal formatting adjustments (e.g. HTML escaping, necessary wrappers) are allowed as long as they don't change semantics.

### B. Blanking Strategy

- Prioritize blanking positions with learning value that are easy to get wrong:
  - Key boundary conditions
  - Core state transitions / recursive return values
  - Error-prone API calls and their arguments
- Avoid blanking out entire blocks; keep the exercise readable and solvable.

### C. Engineering Constraints

- Output must go under the corresponding `chapters/chxx/` directory.
- The problem number must match the source file (extracted from the filename).
- The chapter manifest / problems bundle must be updated in sync.
- The problem must be clickable from the sidebar after the build.

---

## 4) Problem Number and Title Parsing (Filename Rules)

- Extract the leading digits from the filename as the problem number.
  - `94.md` → `94`
  - `144. Binary Tree Preorder Traversal.md` → `144`
- If the filename contains a title, treat it as the default display title candidate; if the repo already has an authoritative title source, defer to that.

---

## 5) Minimum Output Format After Each Run

Reply with a short structured summary:

- `Source`: path of the source file used
- `Generated`: path of the newly created / updated problem page
- `Manifest`: manifest file updated
- `Build`: chapter build command executed
- `Sidebar`: added to the corresponding chapter tab (yes / no)
- `Notes`: only items requiring your manual confirmation (write `none` if there are none)

---

## 6) Default Assumptions

- Unless you specify otherwise, I treat the task as "turn this problem into a fill-in-the-blank exercise ready for use on the current site."
- Unless you specify a chapter, I infer it from the `chxx` segment in the source file path.
- If multiple files with the same problem number exist, I will ask you to confirm before writing, to avoid overwriting.
- Unless you specify a blanking mode, I default to **B1 functional-value-oriented mode**; I switch to **B2 gaze-guided mode** only when you explicitly request it.

---

## 7) UI Reference

- The UI style, spacing, button layout, and tab appearance of a new problem default to matching the most recently added fill-in-the-blank tab.
- Unless explicitly asked, do not introduce new styles or refactor existing UI; keep new problem pages consistent with the nearest existing one.
- Only make style adjustments when you explicitly ask for them.
