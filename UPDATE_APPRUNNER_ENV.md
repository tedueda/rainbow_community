# AWS App Runner 環境変数更新手順

## 🎯 目的
App Runnerのバックエンドを東京リージョンのデータベースに接続する

## 📋 更新が必要な環境変数

### DATABASE_URL
**旧（大阪リージョン - 廃止）:**
```
postgresql://app_user:3831ueda@lgbtq-dev.czqogwkequrm.ap-northeast-3.rds.amazonaws.com:5432/lgbtq_community?sslmode=require
```

**新（東京リージョン）:**
```
postgresql://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require
```

## 🔧 更新方法

### 方法1: AWS コンソール（推奨）

1. **AWS App Runnerコンソールにアクセス**
   - https://ap-northeast-1.console.aws.amazon.com/apprunner/home?region=ap-northeast-1

2. **サービスを選択**
   - サービス名: `rainbow-community-backend` または類似の名前

3. **環境変数を更新**
   - 「Configuration」タブをクリック
   - 「Environment variables」セクションで「Edit」をクリック
   - `DATABASE_URL` を新しい値に更新
   - 「Save changes」をクリック

4. **デプロイ**
   - 自動的に新しいデプロイが開始されます
   - 完了まで5-10分程度かかります

### 方法2: AWS CLI

```bash
# App Runnerサービス名を確認
aws apprunner list-services --region ap-northeast-1

# サービスARNを取得（例）
SERVICE_ARN="arn:aws:apprunner:ap-northeast-1:YOUR_ACCOUNT_ID:service/rainbow-community-backend/SERVICE_ID"

# 環境変数を更新
aws apprunner update-service \
  --service-arn $SERVICE_ARN \
  --source-configuration '{
    "CodeRepository": {
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "main"
      }
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB",
    "InstanceRoleArn": "YOUR_INSTANCE_ROLE_ARN"
  }' \
  --region ap-northeast-1
```

## ✅ 確認方法

更新後、以下のエンドポイントで確認：

```bash
# ヘルスチェック
curl https://ddxdewgmen.ap-northeast-1.awsapprunner.com/health

# 投稿一覧（食レポ）
curl https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/posts/?category=food

# メディアアセット数
curl https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/media/user/images \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 期待される結果

- **Users**: 20名
- **Posts**: 24件
- **Media Assets**: 64件
- **Food posts**: 3件（ID: 57, 58, 59）

## ⚠️ 注意事項

1. **パスワードに特殊文字が含まれる**
   - `NewPassword123!` の `!` はURLエンコードが必要な場合があります
   - App Runnerの環境変数では通常そのまま使用できます

2. **デプロイ時間**
   - 環境変数変更後、自動デプロイに5-10分かかります

3. **ダウンタイム**
   - デプロイ中は一時的にサービスが利用できなくなります

## 🔄 ロールバック方法

問題が発生した場合、AWS コンソールから以前のデプロイメントに戻すことができます：

1. App Runnerコンソールで「Deployments」タブを開く
2. 以前の成功したデプロイメントを選択
3. 「Redeploy」をクリック
