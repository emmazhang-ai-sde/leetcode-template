#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"
VENV="${VIRTUAL_ENV:-$PWD/.venv}"

if [[ ! -x "$VENV/bin/uvicorn" ]]; then
  echo "Could not find uvicorn in $VENV."
  echo "Run:"
  echo "  python3 -m venv .venv"
  echo "  .venv/bin/pip install -r requirements.txt"
  exit 1
fi

exec "$VENV/bin/uvicorn" main:app --app-dir backend --host 127.0.0.1 --port 9009 --reload
