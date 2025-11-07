#!/bin/bash

# App Runner デプロイメント動作確認スクリプト

API_URL="https://7cjpf7nunm.ap-northeast-1.awsapprunner.com"

echo "==================================="
echo "App Runner デプロイメント動作確認"
echo "==================================="
echo ""

# 1. ヘルスチェック
echo "1. ヘルスチェック (/healthz)"
echo "-----------------------------------"
curl -s "${API_URL}/healthz" | jq '.'
echo ""

# 2. APIヘルスチェック
echo "2. APIヘルスチェック (/api/health)"
echo "-----------------------------------"
curl -s "${API_URL}/api/health" | jq '.'
echo ""

# 3. ログインテスト
echo "3. ログインテスト"
echo "-----------------------------------"
echo "Email: testuser001@example.com"
echo "Password: Testpass123!"
echo ""

TOKEN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=testuser001@example.com&password=Testpass123!')

echo "$TOKEN_RESPONSE" | jq '.'
echo ""

# トークンを抽出
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
  echo "✅ ログイン成功！"
  echo ""
  
  # 4. ユーザー情報取得
  echo "4. ユーザー情報取得 (/api/auth/me)"
  echo "-----------------------------------"
  curl -s "${API_URL}/api/auth/me" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" | jq '.'
  echo ""
  
  echo "✅ すべてのテストが成功しました！"
else
  echo "❌ ログインに失敗しました"
fi

echo ""
echo "==================================="
echo "テスト完了"
echo "==================================="
