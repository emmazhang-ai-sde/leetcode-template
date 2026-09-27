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
  --exclude='leetcode/0-my-answers/' \
  --exclude='leetcode/0-oa-real-problems/' \
  --exclude='leetcode/2-leetcode-speak/' \
  --exclude='leetcode/3-leetcode-lecture-notes/' \
  --exclude='leetcode/4-leetcode-fill-in/node_modules/' \
  --exclude='leetcode/4-leetcode-fill-in/PRACTICE_JOURNAL.md' \
  --exclude='Tiktok面经.pdf' \
  "$SRC_ROOT/" "$DEST/"

touch "$DEST/$MARKER"

JOURNAL_DIR="$DEST/leetcode/4-leetcode-fill-in"
if [[ -f "$JOURNAL_DIR/PRACTICE_JOURNAL.example.md" ]]; then
  cp "$JOURNAL_DIR/PRACTICE_JOURNAL.example.md" "$JOURNAL_DIR/PRACTICE_JOURNAL.md"
fi

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
