# デプロイ問題の記録（2025-11-05）

## 問題の概要

App RunnerとローカルでのRDS接続において、データベーススキーマとアプリケーションコードの不一致により、複数のエラーが発生。

---

## 発見された問題

### 1. RDSスキーマとコードの不一致

以下のカラムがコードには存在するが、RDSには存在しない：

#### `users`テーブル
- `phone_number`
- `phone_verified`
- `phone_verification_code`
- `phone_verification_expires`

#### `posts`テーブル
- `video_url`
- `video_meta`
- `category_id`
- `subcategory_id`

#### `matching_profiles`テーブル
- `avatar_url`
- `image_public`
- `field_visibility`

### 2. App Runnerデプロイ失敗

- ヘルスチェックが常に失敗（`/healthz`エンドポイント）
- アプリケーションログが全く出力されない
- 原因：アプリケーションが起動時にスキーマエラーでクラッシュ

### 3. フロントエンドの設定問題

以下のファイルにApp Runner URLがハードコードされていた：
- `src/contexts/AuthContext.tsx`
- `src/components/HomePage.tsx`
- `src/components/RegisterForm.tsx`
- `src/components/matching/MatchingSearchPage.tsx`
- `src/components/matching/MatchCard.tsx`
- `src/components/matching/MatchingProfileDetailPage.tsx`

---

## 実施した修正

### バックエンド

1. `backend/app/models.py`から以下のカラムを削除：
   - `User.phone_number`
   - `User.phone_verified`
   - `Post.video_url`
   - `Post.video_meta`
   - `Post.category_id`
   - `Post.subcategory_id`
   - `MatchingProfile.avatar_url`
   - `MatchingProfile.image_public`
   - `MatchingProfile.field_visibility`

2. `backend/app/routers/auth.py`に`OAuth2PasswordRequestForm`のインポートを追加

3. Dockerfileの`CMD`を簡素化：
   ```dockerfile
   CMD ["./start.sh"]
   ```

4. `start.sh`をシンプル化（デバッグ情報追加）

### フロントエンド

1. すべてのハードコードされたURLを環境変数に置き換え：
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   ```

2. `.env.production`を一時的にローカルホストに設定：
   ```
   VITE_API_URL=http://localhost:8000
   ```

---

## 現在の状態

### ✅ 動作確認済み
- バックエンドがローカルで起動（Docker）
- `/healthz`エンドポイントが応答
- トークン取得API（`/api/auth/token`）が成功

### ❌ 未解決
- ログイン後のユーザー情報取得でスキーマエラー
- App Runnerでのデプロイが失敗
- フロントエンドからのログインが完了しない

---

## 推奨される解決策

### 短期的（緊急）

1. **新しいRDSインスタンスを作成**
2. **Alembicマイグレーションを実行**してスキーマを作成
3. **テストデータを投入**
4. **ローカルで完全に動作確認**
5. **App Runnerで再デプロイ**

### 長期的（根本対策）

1. **CI/CDパイプラインにスキーマ検証を追加**
2. **Alembicマイグレーションを必須化**
3. **開発環境とRDSのスキーマを常に同期**
4. **App Runnerの代わりにECS Fargateを検討**（より柔軟な設定が可能）

---

## 技術的な詳細

### RDSの実際のスキーマ

```sql
-- users テーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    membership_type VARCHAR(20),
    is_active BOOLEAN
);

-- matching_profiles テーブル
CREATE TABLE matching_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    display_flag BOOLEAN NOT NULL,
    prefecture VARCHAR(100) NOT NULL,
    age_band VARCHAR(50),
    occupation VARCHAR(100),
    income_range VARCHAR(100),
    meet_pref VARCHAR(50),
    bio TEXT,
    identity VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    romance_targets JSON
);

-- posts テーブル
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(200),
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    visibility VARCHAR(20),
    youtube_url VARCHAR(500),
    media_id INTEGER,
    category VARCHAR(50),
    subcategory VARCHAR(100),
    post_type VARCHAR(20) NOT NULL DEFAULT 'post',
    slug VARCHAR(200) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    og_image_url VARCHAR(500),
    excerpt TEXT
);
```

### ビルドしたDockerイメージ

- `rainbow-api-local:latest`（ローカル用）
- `192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:prod-v11`（ECR）

### 環境変数

```bash
DATABASE_URL=postgresql://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require
SECRET_KEY=rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5
ADMIN_SECRET=rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5
CORS_ORIGINS=http://localhost:5173
PORT=8000
```

---

## 次のセッションで確認すべきこと

1. RDSの全テーブルのスキーマをダンプ
2. `models.py`の全モデルとRDSスキーマを比較
3. 不一致があるすべてのカラムをリストアップ
4. Alembicマイグレーションファイルを確認

---

## 参考情報

- RDS Endpoint: `rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com`
- ECR Repository: `192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api`
- App Runner Service: `rainbow-community-api`
- Frontend URL: http://localhost:5173 (local)
- Backend URL: http://localhost:8000 (local)

---

**作成日**: 2025-11-05  
**最終更新**: 2025-11-05 19:56 JST
