# Rainbow Community - プロジェクト引き継ぎドキュメント

## 概要
LGBTQ+コミュニティ向けの安心・品位あるコミュニティサイト（MVP）。日本語対応、ピンク系・薄いグリーン・オレンジ系のカラーテーマを採用。

## 🚀 デプロイ済みURL
- **フロントエンド**: https://lgbtq-community-app-kuijp5dt.devinapps.com
- **バックエンドAPI**: https://app-rosqqdae.fly.dev
- **API仕様書**: https://app-rosqqdae.fly.dev/docs

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
