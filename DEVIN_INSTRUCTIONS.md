# Devinへの指示（2025-11-05）

## 🎯 目的

App Runnerデプロイとローカル開発環境の修正。RDSスキーマ不一致問題の解決。

---

## 🚨 緊急課題

### 1. RDSスキーマとコードの不一致

現在、以下のエラーが発生している：
```
column matching_profiles.avatar_url does not exist
column users.phone_number does not exist
column posts.video_url does not exist
```

### 2. App Runnerデプロイ失敗

- ヘルスチェックが常に失敗
- アプリケーションログが出力されない

---

## 📋 Devinが実施すべきタスク

### 優先度1：RDSスキーマの完全一致

1. **RDSの全テーブルスキーマをダンプ**
   ```bash
   PGPASSWORD='NewPassword123!' psql -h rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com -U dbadmin -d lgbtq_community -c "\d users"
   PGPASSWORD='NewPassword123!' psql -h rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com -U dbadmin -d lgbtq_community -c "\d matching_profiles"
   PGPASSWORD='NewPassword123!' psql -h rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com -U dbadmin -d lgbtq_community -c "\d posts"
   # 他の全テーブルも同様に
   ```

2. **models.pyとRDSスキーマを比較**
   - `backend/app/models.py` の各モデルとRDSテーブルを比較
   - 余分なカラムをすべて削除
   - 足りないカラムを追加（必要な場合）

3. **修正後、ローカルでテスト**
   ```bash
   docker build -t rainbow-api-local .
   docker run --rm -p 8000:8000 \
     -e 'DATABASE_URL=postgresql://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require' \
     -e SECRET_KEY=rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5 \
     -e ADMIN_SECRET=rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5 \
     -e CORS_ORIGINS=http://localhost:5173 \
     -e PORT=8000 \
     rainbow-api-local
   ```

4. **ログインAPIをテスト**
   ```bash
   curl -X POST 'http://localhost:8000/api/auth/token' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     -d 'username=testuser001@example.com&password=Testpass123!'
   ```

### 優先度2：App Runnerデプロイ

1. **新しいDockerイメージをビルド**
   ```bash
   docker build -t rainbow-community-api:prod-v12 .
   ```

2. **ECRにプッシュ**
   ```bash
   aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com
   docker tag rainbow-community-api:prod-v12 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:prod-v12
   docker push 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:prod-v12
   ```

3. **App Runnerサービスを更新**
   - 新しいイメージタグ（prod-v12）を使用
   - 環境変数が正しいか確認
   - ヘルスチェック設定を確認

---

## 🔧 技術的な詳細

### RDS接続情報
```bash
HOST: rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com
PORT: 5432
DATABASE: lgbtq_community
USER: dbadmin
PASSWORD: NewPassword123!
```

### 現在の環境変数
```bash
DATABASE_URL=postgresql://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require
SECRET_KEY=rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5
ADMIN_SECRET=rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5
CORS_ORIGINS=http://localhost:5173,https://carat-rainbow-community.netlify.app,https://beautiful-sunburst-ba98c9.netlify.app
PORT=8000
```

### App Runner設定
- Service: rainbow-community-api
- Region: ap-northeast-1
- Health Check: `/healthz` (HTTP, port 8000)
- Source: ECR image `rainbow-community-api`

---

## 📁 重要なファイル

### 修正が必要な可能性があるファイル
- `backend/app/models.py` - データベースモデル定義
- `backend/app/routers/auth.py` - 認証関連
- `backend/app/routers/matching.py` - マッチング機能
- `backend/app/routers/posts.py` - 投稿機能
- `backend/Dockerfile` - Docker設定
- `backend/start.sh` - 起動スクリプト

### 参考ドキュメント
- `DEPLOYMENT_ISSUES.md` - 詳細な問題記録
- `TROUBLESHOOTING.md` - トラブルシューティングガイド

---

## ⚠️ 注意事項

1. **RDSのデータは消さないでください**
2. **変更を加える前に、必ずGitでコミットしてください**
3. **ローカルで動作確認してから、App Runnerにデプロイしてください**
4. **エラーが発生した場合は、詳細なログを記録してください**

---

## 🎯 成功条件

1. **ローカルでログインが成功すること**
   - `testuser001@example.com` / `Testpass123!`
   
2. **マッチング検索APIが動作すること**
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" \
     "http://localhost:8000/api/matching/search?page=1&size=20&identity=gay"
   ```

3. **App Runnerで正常にデプロイされること**
   - ヘルスチェックが成功
   - アプリケーションログが正常に出力

---

## 📞 連絡先不明の場合

不明な点がある場合は、以下の情報を参考にしてください：

- GitHub Repository: https://github.com/tedueda/rainbow_community
- Branch: 25-11-3
- ECR Repository: 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api

---

**作成日**: 2025-11-05  
**対象**: Devin AI Assistant  
**優先度**: 高
