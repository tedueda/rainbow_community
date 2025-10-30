# Phase 1: UI リニューアル + カテゴリー再構築

## 📋 概要

Phase 1では、Cartier風の高級感あるUIデザインと、新しいカテゴリー体系を実装します。

**期間**: 2週間  
**優先度**: 高  
**実装日**: 2025-10-29

---

## 🎯 実装内容

### 1. デザインシステム

#### カラーパレット
- **ベースカラー**: 白・シルバー・ゴールド
- **アクセント**: 控えめなレインボーグラデーション
- **ゴールド**: `hsl(47 94% 69%)` - 高級感を演出

#### タイポグラフィ
- **見出し**: Cormorant Garamond (セリフ体)
- **本文**: Inter (サンセリフ体)
- **特徴**: エレガントで読みやすい

#### UIコンポーネント
- 白背景 + 繊細なボーダー
- 大きめの角丸 (`border-radius: 0.75rem`)
- ホバー時の滑らかなトランジション

### 2. カテゴリー体系

#### 新カテゴリー構造

| カテゴリー | スラッグ | アイコン | サブカテゴリー |
|-----------|---------|---------|--------------|
| サブカルチャー | `subculture` | Sparkles | コミック、映画、ドラマ、アニメ、ゲーム |
| Queer アート | `queer-art` | Palette | 絵画、写真、デジタルアート、パフォーマンス、インスタレーション |
| ライフスタイル | `lifestyle` | Heart | ファッション、美容、健康、料理 |
| 観光・トラベル | `travel` | MapPin | 国内旅行、海外旅行、イベント、プライドパレード |
| ショップ・ビジネス | `shops` | Store | カフェ・レストラン、バー・クラブ、ショップ、サービス |
| 掲示板 | `board` | MessageSquare | 雑談、相談、質問、告知 |

#### データベーススキーマ

```sql
-- Categories テーブル
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),  -- Lucide icon name
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories テーブル
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- Posts テーブルに外部キー追加
ALTER TABLE posts ADD COLUMN category_id INTEGER REFERENCES categories(id);
ALTER TABLE posts ADD COLUMN subcategory_id INTEGER REFERENCES subcategories(id);
```

### 3. 実装コンポーネント

#### バックエンド

1. **マイグレーション**
   - `588b4fd8ab1a_add_categories_and_subcategories_tables.py`
   - categories, subcategories テーブル作成
   - posts テーブルに外部キー追加

2. **API エンドポイント** (`backend/app/routers/categories.py`)
   - `GET /api/categories` - 全カテゴリー取得
   - `GET /api/categories/{slug}` - 特定カテゴリー取得
   - `GET /api/categories/{slug}/subcategories` - サブカテゴリー一覧

3. **シードスクリプト** (`backend/seed_phase1_categories.py`)
   - Phase 1 カテゴリーデータの投入
   - 実行方法:
     ```bash
     cd backend
     export DATABASE_URL="postgresql+psycopg2://..."
     export PYTHONPATH=$(pwd):$PYTHONPATH
     poetry run python seed_phase1_categories.py
     ```

#### フロントエンド

1. **デザインシステム** (`frontend/src/index.css`)
   - Cartier風カラーパレット
   - カスタムクラス: `.pride-gradient`, `.gold-accent`, `.gold-border`
   - タイポグラフィ設定

2. **CategoryNavigation コンポーネント** (`frontend/src/components/CategoryNavigation.tsx`)
   - デスクトップ/モバイル対応
   - ドロップダウンでサブカテゴリー表示
   - アクティブ状態のハイライト

3. **CategoryPageNew コンポーネント** (`frontend/src/components/CategoryPageNew.tsx`)
   - 動的カテゴリー読み込み
   - サブカテゴリーフィルター
   - 投稿一覧表示

4. **ルーティング** (`frontend/src/App.tsx`)
   - `/category/:categorySlug` - カテゴリーページ
   - `/category/:categorySlug/:subcategorySlug` - サブカテゴリーページ

---

## 🚀 セットアップ手順

### 1. バックエンド

```bash
cd backend

# 依存関係インストール
poetry install

# 環境変数設定
export DATABASE_URL="postgresql+psycopg2://username:password@host:5432/database?sslmode=require"
export PYTHONPATH=$(pwd):$PYTHONPATH

# マイグレーション実行
poetry run alembic upgrade head

# カテゴリーデータ投入
poetry run python seed_phase1_categories.py

# 開発サーバー起動
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. フロントエンド

```bash
cd frontend

# 依存関係インストール
npm install

# 環境変数設定
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 開発サーバー起動
npm run dev
```

### 3. 動作確認

1. ブラウザで http://localhost:5173 にアクセス
2. ヘッダー下のカテゴリーナビゲーションを確認
3. カテゴリーをクリックして投稿一覧を表示
4. サブカテゴリーフィルターの動作を確認

---

## 📝 主な変更点

### デモデータ削除
- 既存のモックユーザーと投稿を削除
- 新規登録ユーザーの投稿のみ表示

### 旧カテゴリーからの移行
- 旧カテゴリー（文字列）は後方互換性のため残存
- 新カテゴリー（外部キー）を優先的に使用
- 段階的に旧カテゴリーから新カテゴリーへ移行

---

## 🎨 デザインガイドライン

### 参考サイト
- **UI**: [Cartier 公式サイト](https://www.cartier.jp/)
- **機能**: [Queer Art](https://www.queer-art.org/)

### デザインコンセプト
「ダイヤモンドの輝き × レインボープライド」

### 実装のポイント
1. **余白を贅沢に使う** - Cartierのような高級感
2. **控えめなレインボー** - 派手すぎない配色
3. **エレガントなタイポグラフィ** - セリフ体の見出し
4. **滑らかなアニメーション** - ホバー時の変化

---

## 🧪 テスト

### 手動テスト項目

- [ ] カテゴリーナビゲーションの表示
- [ ] カテゴリーページへの遷移
- [ ] サブカテゴリーフィルターの動作
- [ ] 投稿一覧の表示
- [ ] 新規投稿の作成（カテゴリー選択）
- [ ] レスポンシブデザイン（モバイル/デスクトップ）

### API テスト

```bash
# 全カテゴリー取得
curl http://localhost:8000/api/categories

# 特定カテゴリー取得
curl http://localhost:8000/api/categories/subculture

# サブカテゴリー一覧
curl http://localhost:8000/api/categories/subculture/subcategories
```

---

## 📊 次のステップ（Phase 2）

Phase 1 完了後は、Phase 2（マッチング機能完成）に進みます。

- マッチングアルゴリズムの実装
- リアルタイムチャット機能
- 通知システム

---

## 🐛 既知の問題

1. **SQLite 互換性**
   - ローカル開発でSQLiteを使用する場合、一部のマイグレーションが失敗する
   - PostgreSQLの使用を推奨

2. **旧カテゴリーとの互換性**
   - 旧カテゴリー（文字列）と新カテゴリー（外部キー）が混在
   - 段階的に移行が必要

---

**最終更新**: 2025-10-29  
**作成者**: Devin AI
