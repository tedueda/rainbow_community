# Carat - Windsurf 引き継ぎドキュメント

最終更新: 2025年10月11日

## 🎯 プロジェクト概要

**Carat API（FastAPI / SQLAlchemy）+ React Frontend**
- LGBTQコミュニティプラットフォーム
- 投稿、プロフィール、メディアアップロード機能を提供
- AWS App Runner（東京リージョン）でデプロイ済み

---

## 🗄️ データベース情報

### 本番環境（Tokyo RDS）

**接続情報:**
```
Host: rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com
Port: 5432
Database: lgbtq_community
User: dbadmin
Password: 0034caretLgbtQ
SSL Mode: require
```

**DATABASE_URL (完全な接続文字列):**
```
postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require
```

**AWS Secrets Manager:**
- キー名: `/rainbow-community-api/DATABASE_URL`
- 値: 上記のDATABASE_URL

**セキュリティ:**
- セキュリティグループ: `sg-0a850cbcb94bd0c82 (default)`
- 許可IP: App Runner + 特定の固定IP のみ
- 直接接続: セキュリティグループで許可されていないため、App Runnerまたはバックエンド経由でアクセス

### ステージング環境

**Database:** `lgbtq_staging` (同じRDSインスタンス上)
```
postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_staging?sslmode=require
```

---

## 🚀 デプロイ環境

### フロントエンド
- **本番URL:** https://rainbow-community-app-8osff5fg.devinapps.com
- **デプロイ:** Devin Apps (手動デプロイ)
- **ビルドコマンド:** `pnpm run build`
- **技術スタック:** React + TypeScript + Vite + TailwindCSS

### バックエンド
- **本番URL:** https://7cjpf7nunm.ap-northeast-1.awsapprunner.com
- **デプロイ:** AWS App Runner（東京リージョン）
- **自動デプロイ:** mainブランチへのpush/マージで自動デプロイ
- **技術スタック:** FastAPI + SQLAlchemy + PostgreSQL + Poetry

**App Runner設定:**
- サービス名: `rainbow-community-api`
- リージョン: `ap-northeast-1`
- 起動コマンド: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level debug`
- 環境変数: AWS Secrets Managerから自動注入

---

## 📁 リポジトリ構成

```
rainbow_community/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI アプリケーション
│   │   ├── database.py          # DB接続設定
│   │   ├── models.py            # SQLAlchemyモデル
│   │   ├── schemas.py           # Pydanticスキーマ
│   │   ├── auth.py              # 認証ロジック
│   │   └── routers/             # APIエンドポイント
│   │       ├── auth.py
│   │       ├── posts.py
│   │       ├── media.py         # 画像アップロード
│   │       ├── profiles.py
│   │       └── ...
│   ├── alembic/                 # DBマイグレーション
│   │   └── versions/
│   │       ├── 20250926_0001_constraints.py
│   │       ├── 68253ac0121c_sync_with_tokyo_rds_schema.py
│   │       ├── cb9c88170ba1_bootstrap_missing_base_tables_for_ci_.py
│   │       └── 5d536f3622f2_add_post_media_junction_table_for_.py
│   ├── tests/                   # テスト
│   ├── pyproject.toml           # Poetry依存関係
│   ├── Dockerfile
│   ├── .env                     # ローカル開発用（gitignore）
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.tsx     # ホームページ（カルーセル）
│   │   │   ├── CreatePost.tsx   # 投稿作成（画像5枚まで）
│   │   │   ├── PostDetailPage.tsx
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # 認証状態管理
│   │   └── types/
│   │       └── Post.ts
│   ├── package.json
│   ├── .env                     # ローカル開発用
│   └── .env.production          # 本番環境用
└── .github/
    └── workflows/
        └── api-ci.yml           # CI/CD（GitHub Actions）
```

---

## 🔧 開発環境セットアップ

### バックエンド

```bash
cd ~/repos/rainbow_community/backend

# 依存関係インストール
poetry install

# 環境変数設定（.envファイル作成）
export DATABASE_URL="postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"

# マイグレーション実行
poetry run alembic upgrade head

# 開発サーバー起動
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API確認
# http://localhost:8000/docs (Swagger UI)
```

### フロントエンド

```bash
cd ~/repos/rainbow_community/frontend

# 依存関係インストール
pnpm install

# 環境変数設定（.envファイル）
VITE_API_URL=http://localhost:8000

# 開発サーバー起動
pnpm run dev

# ブラウザで確認
# http://localhost:5173
```

---

## 📊 データベーススキーマ（主要テーブル）

### users
- ユーザーアカウント情報
- email（一意）、password_hash、display_name、membership_type

### profiles
- ユーザープロフィール詳細
- user_id（1対1）、bio、location、orientation、gender、pronoun

### posts
- 投稿データ
- user_id、title、body、visibility、youtube_url、media_id
- カテゴリ: board（掲示板）、tours（ツアー）、shops（お店）、comics（コミック・映画）

### media_assets
- アップロードされたメディアファイル
- user_id、url、mime_type、size_bytes、width、height

### post_media（新規追加）
- 投稿と画像の多対多リレーション
- post_id、media_asset_id、order_index
- 1投稿あたり最大5枚の画像

### comments
- 投稿へのコメント

### reactions
- いいね・リアクション

### follows
- フォロー関係

---

## 🎨 実装済み機能

### ✅ 完了済み

1. **認証システム**
   - ログイン（application/x-www-form-urlencoded形式）
   - JWT認証
   - トークン管理

2. **投稿機能**
   - 投稿作成・編集・削除
   - カテゴリ分類（掲示板、ツアー、お店、コミック・映画）
   - YouTube URL埋め込み
   - **画像アップロード（最大5枚）** ← NEW!

3. **画像管理**
   - S3へのアップロード（/api/media/upload）
   - サムネイル自動生成
   - post_media junction table による多対多リレーション

4. **UI/UX**
   - カルーセル表示（embla-carousel-react）
   - 投稿詳細ページ
   - レスポンシブデザイン
   - 日本語UI

5. **CI/CD**
   - GitHub Actions（PR時の自動テスト）
   - Alembic マイグレーション自動実行
   - App Runner 自動デプロイ（main ブランチ）

---

## 🛠️ ユーティリティスクリプト

### backend/delete_user.py
```bash
# ユーザーと関連データを削除
export DATABASE_URL="postgresql+psycopg2://dbadmin:0034caretLgbtQ@..."
poetry run python delete_user.py <email>
```

### backend/create_test_user.py
```bash
# テストユーザー作成
export DATABASE_URL="postgresql+psycopg2://dbadmin:0034caretLgbtQ@..."
poetry run python create_test_user.py
```

---

## 🔄 マイグレーション管理

### 新しいマイグレーション作成
```bash
cd backend
poetry run alembic revision --autogenerate -m "description"
```

### マイグレーション適用
```bash
poetry run alembic upgrade head
```

### マイグレーション履歴
```bash
poetry run alembic history
poetry run alembic current
```

### 重要な注意点
- `68253ac0121c_sync_with_tokyo_rds_schema.py`: 東京RDSとの同期（早期リターンあり）
- `cb9c88170ba1_bootstrap_missing_base_tables_for_ci_.py`: CI用ブートストラップ（空DBでもOK）
- `5d536f3622f2_add_post_media_junction_table_for_.py`: post_media テーブル追加

---

## 🧪 テスト

### バックエンドテスト
```bash
cd backend
export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/test_db"
poetry run pytest -v
```

### CI環境
- GitHub Actions で PostgreSQL サービスコンテナを使用
- 空DBから `alembic upgrade head` を実行
- テスト実行後にクリーンアップ

---

## 📝 既知の課題と注意点

### セキュリティグループ制限
- ローカルから直接RDSに接続できない（セキュリティグループで制限）
- データベース操作は以下のいずれかで実行:
  1. App Runner 経由（本番バックエンド）
  2. Python スクリプト（DATABASE_URL環境変数使用）
  3. セキュリティグループに一時的にIPを追加（非推奨）

### マイグレーション戦略
- 本番RDSには既存のテーブルとデータが存在
- CI環境では空DBからスタート
- ブートストラップマイグレーション（cb9c88170ba1）が空DBでのみテーブル作成
- インデックス作成は `CREATE INDEX IF NOT EXISTS` を使用

### 画像アップロード
- 現在はS3バケットにアップロード
- 最大ファイルサイズ: 10MB
- 対応フォーマット: image/jpeg, image/png, image/gif
- 1投稿あたり最大5枚

---

## 🚧 今後の開発予定

### Windsurf での開発タスク例

1. **ステージング環境の活用**
   - `lgbtq_staging` データベースの利用
   - develop ブランチとの連携

2. **機能拡張**
   - プロフィール編集機能
   - 検索機能
   - 通知機能
   - コメント機能の強化

3. **パフォーマンス改善**
   - 画像の遅延読み込み
   - キャッシュ戦略
   - DB クエリ最適化

4. **テスト拡充**
   - E2Eテスト
   - フロントエンドユニットテスト
   - APIインテグレーションテスト

---

## 📞 サポート

### 環境変数が必要な場合
```bash
# バックエンド
export DATABASE_URL="postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
export SECRET_KEY="your-secret-key-here"
export ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES="10080"

# フロントエンド（.env）
VITE_API_URL=https://7cjpf7nunm.ap-northeast-1.awsapprunner.com
```

### よく使うコマンド
```bash
# バックエンド起動
cd backend && poetry run uvicorn app.main:app --reload

# フロントエンド起動
cd frontend && pnpm run dev

# マイグレーション
cd backend && poetry run alembic upgrade head

# テスト
cd backend && poetry run pytest -v

# ビルド
cd frontend && pnpm run build
```

---

## 📚 リソース

- **本番フロントエンド:** https://rainbow-community-app-8osff5fg.devinapps.com
- **本番API:** https://7cjpf7nunm.ap-northeast-1.awsapprunner.com
- **API ドキュメント:** https://7cjpf7nunm.ap-northeast-1.awsapprunner.com/docs
- **GitHub:** https://github.com/tedueda/rainbow_community
- **最新PR:** https://github.com/tedueda/rainbow_community/pull/7 (merged)

---

**開発を引き継ぐ際は、まずローカル環境をセットアップし、本番環境で動作確認してから開発を始めてください。**

質問があれば、このドキュメントを参照するか、TED UEDAに確認してください。

Happy Coding! 🌈
