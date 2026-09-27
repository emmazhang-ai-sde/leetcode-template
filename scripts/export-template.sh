#!/usr/bin/env bash
set -euo pipefail

SRC_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_DEST="$(cd "$SRC_ROOT/../.." && pwd)/leetcode-template"
DEST="${1:-$DEFAULT_DEST}"
MARKER=".leetcode-template-export"

usage() {
  cat <<USAGE
Usage:
  scripts/export-template.sh [destination]

Exports a clean leetcode-template repo from the current progress project.
Default destination:
  $DEFAULT_DEST

The exporter keeps shared structure/content and omits personal progress data.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

DEST="$(python3 -c 'import os,sys; print(os.path.abspath(sys.argv[1]))' "$DEST")"

if [[ "$DEST" == "$SRC_ROOT" ]]; then
  echo "Refusing to export into the source project: $DEST" >&2
  exit 1
fi

if [[ -e "$DEST" && ! -f "$DEST/$MARKER" ]]; then
  if [[ -n "$(find "$DEST" -mindepth 1 -maxdepth 1 2>/dev/null | head -n 1)" ]]; then
    echo "Refusing to overwrite a directory that was not created by this exporter:" >&2
    echo "  $DEST" >&2
    echo "Choose an empty directory, or remove it yourself if it is safe." >&2
    exit 1
  fi
fi

mkdir -p "$DEST"
touch "$DEST/$MARKER"

rsync -a --delete \
  --exclude='.git/' \
  --exclude='.DS_Store' \
  --exclude='.claude/' \
  --exclude='.venv/' \
  --exclude='backend/__pycache__/' \
  --exclude='backend/leetcode.db' \
  --exclude='backend/leetcode.db.bak-*' \
  --exclude='backend/note_images/' \
  --exclude='leetcode/user-answers/' \
  --exclude='leetcode/0-oa-real-problems/' \
  --exclude='leetcode/2-leetcode-speak/' \
  --exclude='leetcode/3-leetcode-lecture-notes/' \
  --exclude='leetcode/4-leetcode-fill-in/' \
  --exclude='Tiktok面经.pdf' \
  "$SRC_ROOT/" "$DEST/"

touch "$DEST/$MARKER"

rm -rf \
  "$DEST/.DS_Store" \
  "$DEST/.claude" \
  "$DEST/.venv" \
  "$DEST/backend/__pycache__" \
  "$DEST/backend/leetcode.db" \
  "$DEST/backend"/leetcode.db.bak-* \
  "$DEST/backend/note_images" \
  "$DEST/leetcode/user-answers" \
  "$DEST/leetcode/0-oa-real-problems" \
  "$DEST/leetcode/2-leetcode-speak" \
  "$DEST/leetcode/3-leetcode-lecture-notes" \
  "$DEST/leetcode/4-leetcode-fill-in" \
  "$DEST/Tiktok面经.pdf"

cat > "$DEST/README.md" <<'README'
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
README

(
  cd "$DEST"
  if [[ ! -d .git ]]; then
    git init -b main >/dev/null 2>&1 || {
      git init >/dev/null
      git checkout -b main >/dev/null
    }
  fi

  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "Export leetcode template" >/dev/null || {
      echo "Template files exported, but git commit failed. Check git user config, then commit manually." >&2
      exit 0
    }
  fi
)

echo "Template repo ready:"
echo "  $DEST"
echo
echo "Next step, after creating an empty GitHub repo:"
echo "  cd \"$DEST\""
echo "  git remote add origin <template-repo-url>"
echo "  git push -u origin main"
