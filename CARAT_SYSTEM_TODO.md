# カラットシステム実装 - 残課題

## 完了した項目 ✅

1. **データベース設定**
   - `users`テーブルに`carats`カラムを追加
   - PostgreSQL本番環境で動作確認

2. **UI変更**
   - ハートアイコン(❤️) → ダイヤモンドアイコン(💎)に変更
   - 「いいね」→「カラット」に表示変更
   - ホームページ、カテゴリページ、モーダル全てで統一

3. **API実装**
   - `/api/posts` エンドポイントで`like_count`、`comment_count`、`user_display_name`を返すように修正
   - エラーハンドリング追加

4. **フロントエンド実装**
   - ダミーデータを削除し、APIから返された実際の値を使用
   - ポイント表示（107pt）を削除
   - 自分の投稿へのカラット制限を実装（警告メッセージ表示）

## 未解決の課題 ❌

### 1. **カラットクリック機能が動作しない（最優先）**

**症状:**
- 他人の投稿の💎をクリックしても、カウントが増えない
- APIコールは実行されているが、データベースに反映されていない可能性

**調査が必要な箇所:**
- `PostDetailModal.tsx`の`handleLike`関数
- `/api/posts/{post_id}/like` エンドポイントのレスポンス
- データベースの`reactions`テーブルへの書き込み

**デバッグ手順:**
1. ブラウザのコンソールでAPIレスポンスを確認
2. バックエンドログで`/api/posts/{post_id}/like`のリクエストを確認
3. データベースで`reactions`テーブルのレコードを確認

```sql
-- 確認用SQL
SELECT * FROM reactions WHERE target_type='post' ORDER BY created_at DESC LIMIT 10;
```

### 2. **カラット付与ロジックの実装**

**未実装の機能:**
- [ ] 新規投稿時に投稿者に5カラット付与
- [ ] いいね（カラット）を受けた時に投稿者に1カラット付与
- [ ] チャットメッセージ送信時に1カラット付与
- [ ] お気に入りマッチング時に1カラット付与

**実装場所:**
- バックエンド: `app/routers/posts.py`, `app/routers/chat.py`, `app/routers/matching.py`
- データベース: `users.carats`カラムの更新

### 3. **アカウントページでの総カラット表示**

**未実装:**
- ユーザーのアカウントページに総カラット数を表示
- 実装ファイル: `frontend/src/pages/members/AccountPage.tsx`

## 技術的メモ

### データベース構造
```
users テーブル:
  - carats: INTEGER DEFAULT 0

reactions テーブル:
  - target_type: 'post'
  - target_id: post.id
  - reaction_type: 'like'
  - user_id: ユーザーID
```

### API エンドポイント
- `GET /api/posts` - like_count, comment_count を含む
- `POST /api/posts/{post_id}/like` - いいね/取り消し
- `GET /api/users/{user_id}` - ユーザー情報（carats含む）

### 環境
- フロントエンド: Netlify (https://carat-rainbow-community.netlify.app)
- バックエンド: AWS App Runner (https://ddxdewgmen.ap-northeast-1.awsapprunner.com)
- データベース: PostgreSQL on AWS RDS

## 次のステップ

1. **カラットクリック機能の修正**（最優先）
   - APIレスポンスとデータベース連携の確認
   - 楽観的更新とサーバー同期の修正

2. **カラット付与ロジックの実装**
   - 各アクションでのカラット付与処理を追加

3. **アカウントページでの表示**
   - 総カラット数の表示UI実装

---
作成日: 2025-11-15
最終更新: 2025-11-15
