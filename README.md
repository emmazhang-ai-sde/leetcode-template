# LeetCode Study OS

An open-source LeetCode study workspace with interactive algorithm pages, local progress tracking, notes, answer browsing, and spaced review.

The project is designed to be self-hosted locally. Your check-ins, notes, screenshots, starred problems, struggle flags, and personal solution copies stay in your local SQLite database.

## What It Does

- Browse a structured LeetCode catalog by chapter, topic, and curated views.
- Open interactive algorithm pages with code, visual state, and step controls.
- Track practice sessions with score, mode, source, notes, and code snapshots.
- Review problems with a local check-in history and review dashboard.
- Write rich notes per problem, chapter, topic, or custom block.
- Star important problems and flag problems you are currently struggling with.
- View read-only standard answers from `leetcode/standard-answers/`.
- Add your own local answers in `leetcode/user-answers/` without changing the template.

## Quick Start

```bash
python3 -m venv ~/.venvs/leetcode-app
~/.venvs/leetcode-app/bin/pip install -r requirements.txt
./run.sh
```

Then open:

```text
http://127.0.0.1:8789
```

## Project Structure

```text
backend/
├── main.py                 FastAPI app, API routes, static file mounting
├── db.py                   SQLite schema and storage helpers
├── leetcode.db             Local user data, gitignored
└── note_images/            Local note screenshots, gitignored

leetcode/
├── standard-answers/       Read-only standard answer files included with the template
└── leetcode-all-in-one/    Interactive pages, catalog, notes UI, review dashboard
```

Optional local-only directories:

```text
leetcode/user-answers/      Your own answer files, not included in the template
```

Answer files can be named by LeetCode number or by problem-title slug. The app reads `standard-answers/` first, then uses `user-answers/` as an optional fallback.

## Local Data

The app stores personal data locally:

- `backend/leetcode.db`
- `backend/note_images/`
- `leetcode/user-answers/`

These paths are intentionally excluded from the template export. Share the template repository when you want to share the system; keep your local data in your private workspace.

## Core API

| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST | `/api/leetcode/checkins` | Read or add practice check-ins |
| PUT | `/api/leetcode/checkins/{id}` | Update one check-in |
| DELETE | `/api/leetcode/items/{name}` | Delete a problem and its check-in history |
| GET | `/api/leetcode/notes/{name}` | Load problem notes, answer data, and solution versions |
| PUT / DELETE | `/api/leetcode/notes/card` | Save or delete line-linked note cards |
| PUT / DELETE | `/api/leetcode/notes/block` | Save or delete custom note blocks |
| GET / PUT | `/api/leetcode/notes-scope/{scope_key}` | Read or save chapter/topic/global notes |
| GET / POST / DELETE | `/api/leetcode/expressions` | Manage expression-bank entries |
| GET / PUT / DELETE | `/api/leetcode/stars` | Manage starred problems |
| GET / PUT / DELETE | `/api/leetcode/struggles` | Manage struggle flags |
| POST / GET | `/api/leetcode/note-image` | Upload or read note images |
| GET | `/answers/` | Browse local answer files |

## Customizing

- Edit `leetcode/leetcode-all-in-one/catalog.js` to add or reorganize problems.
- Add standard shared answers to `leetcode/standard-answers/`.
- Add private local answers to `leetcode/user-answers/`.
- Keep personal notes and check-ins in your local database rather than committing them.

## License

Add your preferred license before publishing.
