# App Runner 環境変数更新（S3対応）

## 🎯 追加が必要な環境変数

App Runnerのコンソールで以下の環境変数を追加してください：

### S3設定

1. **AWS_S3_BUCKET**
   ```
   rainbow-community-media-prod
   ```

2. **AWS_REGION**
   ```
   ap-northeast-1
   ```

3. **AWS_ACCESS_KEY_ID**
   ```
   （メモリーから取得してください）
   ```

4. **AWS_SECRET_ACCESS_KEY**
   ```
   （メモリーから取得してください）
   ```

5. **USE_S3**
   ```
   true
   ```

## 📋 設定手順

1. **AWS App Runnerコンソールにアクセス**
   ```
   https://ap-northeast-1.console.aws.amazon.com/apprunner/home?region=ap-northeast-1#/services/rainbow-community-api
   ```

2. **環境変数を追加**
   - 「Configuration」タブをクリック
   - 「Environment variables」セクションで「Edit」をクリック
   - 上記の5つの環境変数を追加
   - 「Save changes」をクリック

3. **デプロイ**
   - 自動的に新しいデプロイが開始されます
   - 完了まで5-10分程度かかります

## ✅ 確認方法

デプロイ完了後、画像アップロードをテストしてください：

1. プロフィール編集画面で画像をアップロード
2. アップロードされた画像のURLが `https://rainbow-community-media-prod.s3.ap-northeast-1.amazonaws.com/media/...` 形式になっていることを確認
3. 画像が正しく表示されることを確認

## 🔄 既存の画像データについて

既存のデータベースに保存されている画像URLは `/media/xxx.jpg` 形式のため、表示されません。
新しくアップロードされた画像のみがS3のURLで保存され、正しく表示されます。

## 📝 注意事項

- S3バケット `rainbow-community-media-prod` は既に作成済みです
- バケットポリシーでパブリック読み取りが許可されています
- IAMユーザー `rainbow-community-app` に S3FullAccess 権限が付与されています
