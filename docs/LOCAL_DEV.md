# ローカル開発ガイド（Backend/Frontend）

- 対象OS: macOS (Apple Silicon も可)
- 必須: Python 3.12 / Node.js 18+ / Poetry / npm

## セットアップ（初回）
- Python 3.12 で仮想環境構築（Poetry経由）
- backend 配下で実行

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install poetry
poetry install
```

## DB設定（ローカル）
- ローカルでは SQLite を使用します
- `DATABASE_URL` を未設定にするか、`.env.local` を用意

`.env.local`（例）
```
# SQLite（相対パス）
DATABASE_URL=sqlite:///./lgbtq_community.db
# CORS 許可（Vite）
ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## バックエンド起動
- 自動リロードの監視範囲で `venv` を外すか、リロードなしで起動します
- 下記スクリプト推奨

```bash
./scripts/dev_backend.sh
```

### 直接コマンドで起動する場合
```bash
cd backend
source venv/bin/activate
unset DATABASE_URL  # SQLite を利用するため
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- ヘルスチェック
```bash
curl http://127.0.0.1:8000/api/health
```

## フロントエンド起動
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```
または
```bash
./scripts/dev_frontend.sh
```

## Alembic（マイグレーション）
- 既存テーブルの変更は必ず Alembic を使います
- 手順（例）
```bash
cd backend
source venv/bin/activate
export DATABASE_URL="postgresql+psycopg2://<user>:<pass>@<host>:5432/<db>?sslmode=require"
export PYTHONPATH=$(pwd):$PYTHONPATH
alembic revision --autogenerate -m "Add column ..."
alembic upgrade head
```

## トラブルシュート
- Python 3.14 では `pydantic-core` のビルド失敗が発生するため Python 3.12 を使用
- `DATABASE_URL` が RDS を指しているとローカルで接続タイムアウトするため未設定（SQLite）に
- `--reload` は `venv` を監視対象から外す（`--reload-exclude 'venv/*'`）か、オフで起動
- 起動時の `Base.metadata.create_all()` は使用せず、スキーマ変更は Alembic に一本化
