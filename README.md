# カラット (Karat) - LGBTQ+ プレミアムコミュニティプラットフォーム

> ダイヤモンドの輝き × レインボープライド  
> 高級ジュエリーブランドのような洗練されたUIで、LGBTQ+コミュニティの交流・発信・支援を実現

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📖 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [マイグレーション運用](#マイグレーション運用)
- [デプロイ](#デプロイ)
- [プロジェクト構成](#プロジェクト構成)
- [ロードマップ](#ロードマップ)
- [環境変数](#環境変数)
- [コントリビュート](#コントリビュート)

---

## 概要

**カラット**は、LGBTQ+コミュニティのための次世代SNS/マーケットプレイスです。

### デザインコンセプト

「**ダイヤモンドの輝き × レインボープライド**」

- 白・シルバー・ゴールドを基調とした高級感あるデザイン
- 控えめで繊細なレインボーグラデーション
- Cartier のような贅沢な余白とエレガントなタイポグラフィ

### 参考サイト

- **UI**: [Cartier 公式サイト](https://www.cartier.jp/)
- **機能**: [Queer Art](https://www.queer-art.org/)

### デプロイ済み環境

- **バックエンド API**: https://7cjpf7nunm.ap-northeast-1.awsapprunner.com
- **データベース**: AWS RDS PostgreSQL 17.4 (ap-northeast-1)
- **API ドキュメント**: https://7cjpf7nunm.ap-northeast-1.awsapprunner.com/docs

---

## 主な機能

### 🌈 コアコミュニティ機能

- **投稿・フィード**
  - 画像・テキスト投稿、タグ付け
  - カテゴリー/サブカテゴリー機能（正規化済み）
  - いいね、コメント、シェア
  - 公開範囲設定（public/members/followers/private）
  
- **新カテゴリー体系**
  - **サブカルチャー**: コミック、映画、ドラマ、アニメ、ゲーム
  - **Queer アート**: 絵画、写真、デジタルアート、パフォーマンス、インスタレーション
  - その他: ライフスタイル、観光・トラベル、ショップ・ビジネス、掲示板

### 👥 会員限定機能

- **マッチング**
  - スワイプ式カード
  - 趣味・興味・距離ベースのマッチングアルゴリズム
  - リアルタイムチャット（WebSocket）
  - 通知システム

- **マーケット（C2C）**
  - 会員同士で商品の売買
  - 出品・購入フロー
  - 取引管理、トラッキング

- **EC サイト（ジュエリー販売）**
  - オリジナルジュエリーの販売
  - カート・チェックアウト
  - Stripe 決済統合

- **クラウドファンディング**
  - プロジェクト作成・管理
  - リワード設定
  - 支援・進捗管理

### 🎊 特別機能

- **バーチャル・ウェディング**
  - 申し込みフォーム
  - 管理者承認フロー
  - Zoom リンク設定

---

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 18.3 | UI フレームワーク |
| TypeScript | 5.6 | 型安全 |
| Vite | 6.0 | ビルドツール |
| Tailwind CSS | 3.4 | スタイリング |
| shadcn/ui | - | UI コンポーネント（Radix UI ベース） |
| React Router | 7.9 | ルーティング |
| Framer Motion | - | アニメーション |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| FastAPI | 0.116 | Web フレームワーク |
| SQLAlchemy | 2.0 | ORM |
| Alembic | 1.12 | マイグレーション |
| PostgreSQL | 17.4 | データベース |
| Psycopg2 | 2.9 | PostgreSQL ドライバ |
| WebSocket | - | リアルタイム通信 |
| Stripe | - | 決済処理 |

### インフラ

- **AWS App Runner**: API コンテナホスティング
- **AWS RDS (PostgreSQL)**: データベース
- **AWS S3**: 画像ストレージ（予定）
- **AWS ECR**: Docker イメージレジストリ
- **CloudWatch**: ログ・モニタリング

---

## セットアップ

### 前提条件

- Python 3.12+
- Node.js 18+
- PostgreSQL 17+（ローカル開発時）
- Docker（デプロイ時）

### 1. バックエンド

```bash
cd backend

# 仮想環境作成・有効化
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt
# または
poetry install

# 環境変数設定
export DATABASE_URL="postgresql+psycopg2://dbadmin:<PASSWORD>@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
export PYTHONPATH=$(pwd):$PYTHONPATH
export PORT=8000

# マイグレーション適用
alembic upgrade head

# 開発サーバー起動
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**API ドキュメント**: http://127.0.0.1:8000/docs

### 2. フロントエンド

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

**アプリケーション**: http://localhost:5173

---

## マイグレーション運用

### ⚠️ 重要: スキーマ変更は必ず Alembic を使用

SQLAlchemy の `Base.metadata.create_all()` は**既存テーブルの更新をしません**。  
カラム追加・変更は必ず Alembic マイグレーションで行います。

### マイグレーション手順

#### 1. models.py を変更

```python
# backend/app/models.py
class Post(Base):
    # ... 既存カラム ...
    new_column = Column(String(100))  # 新しいカラム追加
```

#### 2. マイグレーションファイル自動生成

```bash
cd backend
source venv/bin/activate

# 環境変数設定
export DATABASE_URL="postgresql+psycopg2://dbadmin:<PASSWORD>@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
export PYTHONPATH=$(pwd):$PYTHONPATH

# 差分から自動生成
alembic revision --autogenerate -m "add new_column to posts"
```

#### 3. 生成されたファイルを確認

```bash
# alembic/versions/<HASH>_add_new_column_to_posts.py を確認
```

#### 4. ローカルで適用

```bash
alembic upgrade head
```

#### 5. コミット・プッシュ

```bash
git add alembic/versions/*.py
git commit -m "migration: add new_column to posts"
git push origin <branch>
```

#### 6. デプロイ

App Runner にデプロイすると、`start.sh` が自動的に `alembic upgrade head` を実行します。

### マイグレーションの確認

```bash
# 現在のバージョン
alembic current

# 最新バージョン
alembic heads

# 履歴
alembic history
```

---

## デプロイ

### バックエンド（App Runner）

#### 1. Docker イメージビルド

```bash
cd backend
docker build -t 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:latest .
```

#### 2. ECR にプッシュ

```bash
# ECR ログイン
aws ecr get-login-password --region ap-northeast-1 \
  | docker login --username AWS --password-stdin 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com

# プッシュ
docker push 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:latest
```

#### 3. App Runner で手動デプロイ

AWS コンソール → App Runner → `rainbow-community-api` → **Deploy**

**API URL**: https://7cjpf7nunm.ap-northeast-1.awsapprunner.com

### フロントエンド（予定）

- Netlify / Vercel / Cloudflare Pages

## 🛠 技術スタック

### バックエンド
- **フレームワーク**: FastAPI
- **データベース**: PostgreSQL 17
- **認証**: JWT + OAuth2
- **デプロイ**: Fly.io
- **ORM**: SQLAlchemy

### フロントエンド
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API
- **デプロイ**: Devin Apps

### データベース
- **本番**: PostgreSQL 17 (AWS RDS)
- **ローカル**: SQLite (開発用フォールバック)
- **接続情報**: `backend/.env` 参照

## 🔧 ローカル開発環境

### 前提条件
- Node.js 18+
- Python 3.12+
- PostgreSQL 17 (または SQLite)

### セットアップ手順

#### 1. バックエンド起動
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. フロントエンド起動
```bash
cd frontend
npm install
npm run dev
```

#### 3. アクセス
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8000
- API仕様書: http://localhost:8000/docs

---

## ロードマップ

[ROADMAP.md](./ROADMAP.md) を参照

---

## 環境変数

**バック**: `DATABASE_URL`, `PORT`, `STRIPE_SECRET_KEY`  
**フロント**: `VITE_API_BASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`

---

## データポリシー

- デモデータ削除済み
- 新規登録ユーザーの投稿のみ表示
- 会員限定機能は認証必須

---

## コントリビュート

- `main`: 本番 / 日付ブランチ: 作業用
- PR に目的・変更・マイグレーション情報を記載
- 秘密鍵は `.env` のみ、コミット禁止

---

## トラブルシューティング

- DB接続: `DATABASE_URL` 確認
- マイグレーション: `PYTHONPATH` 設定確認
- デプロイ後 500: CloudWatch Logs 確認

---

## ライセンス

現在検討中

---

**最終更新**: 2025-10-26  
**作成者**: Cascade AI + プロジェクトチーム

