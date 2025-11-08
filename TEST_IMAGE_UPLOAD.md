# 画像アップロードテスト手順

## 🎯 目的
S3への画像アップロードが正しく機能することを確認

## ✅ 事前確認

### 1. デプロイ完了確認
```bash
curl -s "https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/debug/env"
```

**期待される結果**:
```json
{
  "USE_S3": true,
  "S3_BUCKET": "rainbow-community-media-prod",
  "S3_REGION": "ap-northeast-1",
  "USE_S3_env": "true",
  "AWS_S3_BUCKET_env": "rainbow-community-media-prod",
  "AWS_REGION_env": "ap-northeast-1"
}
```

### 2. /media/ リダイレクト確認
```bash
curl -I "https://ddxdewgmen.ap-northeast-1.awsapprunner.com/media/test.png"
```

**期待される結果**:
```
HTTP/1.1 307 Temporary Redirect
Location: https://rainbow-community-media-prod.s3.ap-northeast-1.amazonaws.com/media/test.png
```

---

## 📸 画像アップロードテスト

### 手順1: プロフィール編集画面にアクセス
1. https://carat-rainbow-community.netlify.app にアクセス
2. ログイン（test@example.com / test123）
3. プロフィール編集画面に移動

### 手順2: テスト画像をアップロード
1. 「画像を選択」ボタンをクリック
2. 任意の画像を選択（推奨: 1MB以下のPNG/JPG）
3. アップロード完了を待つ

### 手順3: アップロード結果を確認

#### ブラウザで確認
- ✅ 画像がプレビュー表示される
- ✅ エラーメッセージが表示されない

#### データベースで確認
```bash
# 最新の画像URLを確認
curl -s "https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/media/user/images" \
  -H "Authorization: Bearer YOUR_TOKEN" | python3 -m json.tool
```

**期待される結果**:
```json
{
  "items": [
    {
      "id": 165,
      "url": "https://rainbow-community-media-prod.s3.ap-northeast-1.amazonaws.com/media/xxx.png",
      "created_at": "2025-11-08T09:45:00+09:00",
      "size_bytes": 123456
    }
  ]
}
```

#### S3で確認
```bash
# S3バケットの内容を確認
aws s3 ls s3://rainbow-community-media-prod/media/ --recursive
```

**期待される結果**:
```
2025-11-08 09:45:00   123456 media/xxx.png
```

---

## 🔍 トラブルシューティング

### エラー1: "S3 upload failed"
- **原因**: AWS認証情報が正しくない
- **解決**: App Runnerの環境変数を再確認

### エラー2: 画像が表示されない
- **原因**: S3バケットのパブリック読み取り権限がない
- **解決**: S3バケットポリシーを確認

### エラー3: "File too large"
- **原因**: ファイルサイズが10MBを超えている
- **解決**: より小さい画像を使用

---

## 📊 成功基準

- ✅ 画像アップロードが成功する
- ✅ データベースにS3のURLが保存される
- ✅ ブラウザで画像が表示される
- ✅ S3バケットにファイルが存在する
- ✅ デプロイ後も画像が表示され続ける

---

## 🎉 完了後の作業

1. デバッグエンドポイント（`/api/debug/env`）を削除
2. 本番環境での動作確認
3. 全ページの画像表示を確認
