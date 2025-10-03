# Rainbow Community - プロジェクト引き継ぎドキュメント

## 概要
LGBTQ+コミュニティ向けの安心・品位あるコミュニティサイト（MVP）。日本語対応、ピンク系・薄いグリーン・オレンジ系のカラーテーマを採用。

## 🚀 デプロイ済みURL
- **フロントエンド**: https://lgbtq-community-app-kuijp5dt.devinapps.com
- **バックエンドAPI**: https://app-rosqqdae.fly.dev
- **API仕様書**: https://app-rosqqdae.fly.dev/docs

## ☁️ AWS App Runner への移行（準備完了）

FastAPI バックエンドを Fly.io から AWS App Runner に移行するための Terraform インフラストラクチャが `infra/` ディレクトリに用意されています。

### 主な機能
- **ECR**: Docker イメージの自動管理とライフサイクルポリシー
- **App Runner**: コンテナ化された FastAPI アプリのホスティング
- **VPC Connector**: プライベート RDS への安全な接続
- **Secrets Manager**: DATABASE_URL の安全な管理
- **CloudWatch**: RDS モニタリングとアラーム
- **GitHub Actions**: ECR への自動デプロイ（OIDC 認証）

### 移行手順
詳細な移行手順、ロールバック方法、トラブルシューティングについては [`infra/README.md`](./infra/README.md) を参照してください。

**段階的な移行**:
1. Terraform でインフラを構築（RDS は Public のまま）
2. App Runner の動作確認
3. レガシー CIDR ルールの削除
4. RDS を Private に変更
5. Fly.io のシャットダウン

### クイックスタート
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して認証情報を設定
terraform init
terraform plan
terraform apply
```

## 🗄️ 本番DB（AWS RDS）接続情報と運用指針（非機密）

以下は機密を含まない情報のみを記載します。パスワード等の秘密は Secrets にのみ保存し、このリポジトリには絶対にコミットしません。

- 接続先ホスト（RDS エンドポイント）
  - `rainbow-community-db.czqogwkequrm.ap-northeast-3.rds.amazonaws.com`
- データベース名
  - `lgbtq_community`
- ユーザー名（マスター）
  - `dbadmin`
- ドライバ/プロトコル
  - SQLAlchemy 2.x では `postgresql+psycopg2` を推奨
- 接続文字列フォーマット（例）
  - `postgresql+psycopg2://dbadmin:<PASSWORD>@rainbow-community-db.czqogwkequrm.ap-northeast-3.rds.amazonaws.com:5432/lgbtq_community?sslmode=require`

### Secrets（Fly.io）への設定手順

1. このリポジトリには秘密を記載しないこと（.env/fly.toml に直書き禁止）
2. Fly.io にてアプリ `rainbow-community` の Secrets に設定

```bash
fly secrets set DATABASE_URL='postgresql+psycopg2://dbadmin:<PASSWORD>@rainbow-community-db.czqogwkequrm.ap-northeast-3.rds.amazonaws.com:5432/lgbtq_community?sslmode=require' -a rainbow-community
```

### マイグレーション（Alembic）の適用

- 本番起動時 `start.sh` で `alembic upgrade head` が自動実行されます
- 手動で実行したい場合（Fly マシン内）

```bash
fly ssh console -a rainbow-community --command "cd /app && alembic upgrade head"
```

### 運用時の注意

- RDS をパブリックアクセス可にする場合は、セキュリティグループの 5432/TCP を最小限の送信元に限定してください
- 本番では `backend/app/database.py` が `DATABASE_URL` 未設定時に起動失敗するため、SQLite にはフォールバックしません
- 変更反映後は `/healthz`（内部） および `/api/health`（外部）で疎通を確認してください

## 📁 プロジェクト構成
```
lgbtq_community/
├── backend/           # FastAPI バックエンド
├── frontend/          # React + TypeScript フロントエンド
├── database/          # PostgreSQL マイグレーション・スキーマ
└── README.md         # このファイル
```

## ✅ 実装完了機能

### 1. 認証システム
- ユーザー登録・ログイン機能
- JWT トークン認証
- 匿名モード対応
- テストユーザー: `premium@test.com` / `premium123`

### 2. データベース設計
- PostgreSQL 17 対応
- 完全なER図とマイグレーション
- ユーザー、投稿、コメント、リアクション、フォロー機能
- 権限管理（dbadmin / app_user）

### 3. 投稿機能
- カテゴリ別投稿（アート、音楽、掲示板、ニュース等）
- 画像アップロード・表示
- YouTube URL 埋め込み
- タグ機能
- いいね・コメント機能

### 4. UI/UX
- 日本語完全対応
- レスポンシブデザイン
- ピンク系・薄いグリーン・オレンジ系カラーテーマ
- モーダル形式の投稿詳細表示

### 5. デプロイメント
- バックエンド: Fly.io
- フロントエンド: Devin Apps
- 本番環境での動作確認済み

## ❌ 未完了・問題のある機能

### 1. 投稿編集・削除機能（最重要課題）
**状況**: バックエンドAPIは実装済みだが、フロントエンドで編集・削除ボタンが表示されない

**技術詳細**:
- `PostDetailModal.tsx` に編集・削除機能のコードは実装済み
- 認証チェック `currentUser && currentUser.id === post.user_id` が正常に動作しない
- `useAuth()` フックからの `currentUser` が正しく取得できていない可能性
- デバッグログが出力されない状態

**バックエンドAPI（実装済み）**:
```
PUT /api/posts/{post_id}    # 投稿編集
DELETE /api/posts/{post_id} # 投稿削除
```

**フロントエンド実装箇所**:
- `frontend/src/components/PostDetailModal.tsx` (行315-649)
- 編集フォーム、削除確認ダイアログ実装済み
- 権限チェックロジック実装済み

### 2. 画像サムネイル表示
- 一部の投稿で画像が正しく表示されない
- メディアディレクトリパスの問題（ローカル開発環境）

### 3. プロフィール機能
- 基本実装はあるが、詳細設定が未完成
- アバター画像アップロード機能

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

## 🐛 既知の問題

### 1. PostDetailModal の編集・削除ボタン非表示問題
**症状**: 投稿者本人でも編集・削除ボタンが表示されない
**原因**: `useAuth()` からの `currentUser` 取得に問題
**影響**: 全カテゴリの投稿で編集・削除ができない

**デバッグ情報**:
- 認証は正常動作（Premium Test User ID: 15）
- `localStorage` にトークン保存済み
- `PostDetailModal` のデバッグログが出力されない
- `CategoryPage.tsx` で `currentUser` がpropsとして渡されていない

### 2. メディアディレクトリパス
**ファイル**: `backend/app/routers/media.py`
**問題**: 絶対パスが使用されており、ローカル開発で問題
**修正必要**: 相対パス `Path("media")` に変更

### 3. 画像表示の不整合
- 一部投稿で画像サムネイルが404エラー
- メディアファイルのURL生成に問題の可能性

## 🔄 次のステップ（windsurf.ai への引き継ぎ）

### 最優先タスク
1. **投稿編集・削除機能の修正**
   - `PostDetailModal.tsx` の `currentUser` 取得問題を解決
   - 編集・削除ボタンの表示確認
   - 全カテゴリでの動作テスト

### 中優先タスク
2. **画像表示問題の解決**
   - メディアディレクトリパスの修正
   - サムネイル生成の確認
   
3. **プロフィール機能の完成**
   - 詳細設定画面の実装
   - アバター画像機能の完成

### 低優先タスク
4. **追加機能の実装**
   - 通知システム
   - フォロー機能の UI
   - 検索機能

## 📝 重要なファイル

### 設定ファイル
- `backend/.env` - バックエンド環境変数
- `frontend/.env` - フロントエンド環境変数
- `backend/fly.toml` - Fly.io デプロイ設定

### 主要コンポーネント
- `frontend/src/components/PostDetailModal.tsx` - 投稿詳細（編集・削除機能含む）
- `frontend/src/contexts/AuthContext.tsx` - 認証コンテキスト
- `backend/app/routers/posts.py` - 投稿API（編集・削除エンドポイント含む）

### データベース
- `database/migrations/0001_initial.sql` - 初期マイグレーション
- `database/seed.sql` - シードデータ
- `database/er_diagram.mmd` - ER図

## 🔐 認証情報

### テストアカウント
- **Email**: premium@test.com
- **Password**: premium123
- **User ID**: 15
- **表示名**: Premium Test User

### データベース接続
- 本番環境の接続情報は `backend/.env` を参照
- ローカル開発では SQLite フォールバック使用

## 📞 サポート情報

### デプロイ済み環境
- フロントエンド: Devin Apps プラットフォーム
- バックエンド: Fly.io
- データベース: AWS RDS PostgreSQL 17

### 開発者情報
- **依頼者**: TED UEDA (@tedueda)
- **Devin セッション**: https://app.devin.ai/sessions/1b06a00a95ac4d9e85ce1b77d093ab63

---

## ⚠️ 重要な注意事項

1. **投稿編集・削除機能は未完成** - 最優先で修正が必要
2. **本番環境は稼働中** - 変更時は慎重に
3. **日本語UI必須** - 全ての新機能は日本語対応必要
4. **カラーテーマ維持** - ピンク系・薄いグリーン・オレンジ系を継続

このドキュメントは windsurf.ai への引き継ぎ用として作成されました。
追加の技術詳細が必要な場合は、各ファイルのコメントとコードを参照してください。

## 🧩 現在のDB課題と方針（試作段階メモ）

本試作ではローカル実行時に SQLite フォールバックを使用していますが、環境依存でバックエンドの待受が不安定になる事象がありました（`/healthz` が読み込み中のままとなる等）。今後は AWS RDS(PostgreSQL) に接続して安定動作を図ります。

- 現状の症状
  - `http://localhost:8001/healthz` が応答しない場合がある
  - フロント `http://localhost:5173/feed` でデータ取得が止まることがある

- 当面の方針
  - バックエンドを RDS(PostgreSQL) に接続して起動（ローカル SQLite から切替）
  - フロントは `VITE_API_URL=http://localhost:8001` で固定し疎通確認

- 次回作業（手順）
  1) `backend/.env` に本番相当の接続情報を設定（例）
     ```env
     DATABASE_URL=postgresql+psycopg2://<USER>:<PASSWORD>@<HOST>:5432/<DBNAME>?sslmode=require
     SECRET_KEY=change-me-please
     ```
     - 秘密情報は必ず .env にのみ記載し、リポジトリにコミットしないこと（.gitignore維持）
  2) PostgreSQL ドライバ導入
     ```bash
     pip3 install psycopg2-binary
     ```
  3) バックエンド再起動（RDS接続）
     ```bash
     # 既存 8001 を停止
     lsof -ti :8001 | xargs kill -9 2>/dev/null || true
     # RDS 接続で起動
     python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
     ```
  4) 疎通確認
     ```bash
     curl -i [http://127.0.0.1](http://127.0.0.1):8001/healthz
     curl -i [http://127.0.0.1](http://127.0.0.1):8001/api/health
     ```
  5) フロント設定（固定化 & 再起動）
     ```bash
     # frontend/.env.local
     echo "VITE_API_URL=http://localhost:8001" > frontend/.env.local
     # 再起動
     lsof -ti :5173 | xargs kill -9 2>/dev/null || true
     (cd frontend && npm run dev)
     ```

- 事前条件（RDS側）
  - セキュリティグループで、ローカルのグローバルIPから 5432/TCP を許可
  - 初回起動時は `Base.metadata.create_all(bind=engine)` によりスキーマが自動生成

- セキュリティ注意
  - 接続文字列・パスワード等の秘密は [.env](cci:7://file:///Users/tedueda/Desktop/LGBTQ_Community/rainbow_community-2/frontend/.env:0:0-0:0) のみに保存（VCSへコミット禁止）
  - 将来的にパスワードローテーションを実施
