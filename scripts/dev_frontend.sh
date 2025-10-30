#!/usr/bin/env bash
set -euo pipefail

dir="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$dir/frontend"

# 依存インストール（初回のみ）
if [ ! -d node_modules ]; then
  npm install
fi

# Vite 起動
exec npm run dev
