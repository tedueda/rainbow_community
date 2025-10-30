#!/usr/bin/env bash
set -euo pipefail

# backend 直下で実行しても、リポジトリルートからでも動くように調整
dir="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$dir/backend"

# Python 3.12 確認
if ! command -v python3.12 >/dev/null 2>&1; then
  echo "[ERROR] Python 3.12 が見つかりません。" >&2
  exit 1
fi

# venv 準備
if [ ! -d venv ]; then
  python3.12 -m venv venv
fi
source venv/bin/activate

# Poetry が無ければ入れる
if ! command -v poetry >/dev/null 2>&1; then
  pip install poetry
fi

# 依存関係
poetry install || true

# ローカルは SQLite を利用（環境変数に残っている DATABASE_URL を無効化）
unset DATABASE_URL || true

# uvicorn 起動（venv 監視は除外する場合は --reload-exclude を付与）
exec uvicorn app.main:app --host 127.0.0.1 --port 8000
