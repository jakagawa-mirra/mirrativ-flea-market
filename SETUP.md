# ミラティブフリマ セットアップガイド

## 1. Slack App の作成

### 1-1. App を作る
1. https://api.slack.com/apps にアクセス
2. **「Create New App」** → **「From scratch」** を選択
3. App Name: `ミラティブフリマ` （好きな名前でOK）
4. Workspace: ミラティブのワークスペースを選択
5. **「Create App」**

### 1-2. OAuth & Permissions 設定
1. 左メニューの **「OAuth & Permissions」** をクリック
2. **Redirect URLs** に以下を追加：
   ```
   http://localhost:3000/api/auth/callback/slack
   ```
3. **Bot Token Scopes** に以下を追加：
   - `chat:write` （メッセージ送信用）
   - `users:read` （ユーザー情報取得用）
4. **User Token Scopes** に以下を追加：
   - `identity.basic`
   - `identity.email`
   - `identity.avatar`

### 1-3. Sign in with Slack 設定
1. 左メニューの **「Sign in with Slack」** をクリック
2. **Redirect URLs** に以下を追加：
   ```
   http://localhost:3000/api/auth/callback/slack
   ```

### 1-4. App をワークスペースにインストール
1. 左メニューの **「Install App」** をクリック
2. **「Install to Workspace」** → **「許可する」**
3. 表示される **Bot User OAuth Token**（`xoxb-`で始まる）をメモ

### 1-5. Client ID と Secret を取得
1. 左メニューの **「Basic Information」** をクリック
2. **App Credentials** セクションから：
   - `Client ID` をメモ
   - `Client Secret` をメモ

### 1-6. チャンネルにBotを追加
1. Slackで `#z_club_papamama` チャンネルを開く
2. チャンネル名をクリック → **「インテグレーション」** → **「App」** → **「アプリを追加する」**
3. 先ほど作った `ミラティブフリマ` を追加

### 1-7. チャンネルIDの取得
1. Slackで `#z_club_papamama` チャンネルを開く
2. チャンネル名をクリック → 一番下にチャンネルIDが表示される（`C`で始まる文字列）

## 2. 環境変数の設定

プロジェクトのルートで `.env.local.example` をコピー：

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して値を入力：

```env
SLACK_CLIENT_ID=1234567890.1234567890       # 1-5で取得したClient ID
SLACK_CLIENT_SECRET=abcdef1234567890abcdef   # 1-5で取得したClient Secret
SLACK_BOT_TOKEN=xoxb-xxxx-xxxx-xxxx          # 1-4で取得したBot Token
SLACK_CHANNEL_ID=C0123456789                  # 1-7で取得したチャンネルID

NEXTAUTH_SECRET=any-random-string-here        # ランダムな文字列（何でもOK）
NEXTAUTH_URL=http://localhost:3000
```

💡 `NEXTAUTH_SECRET` は以下で生成できます：
```bash
openssl rand -base64 32
```

## 3. 起動

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

http://localhost:3000 にアクセスして「Slackでログイン」！

## トラブルシューティング

### ログインできない
- Slack AppのRedirect URLが正しいか確認
- `.env.local` のClient IDとSecretが正しいか確認

### Slackに投稿されない
- Bot Tokenが正しいか確認
- チャンネルにBotが追加されているか確認
- チャンネルIDが正しいか確認

### 画像がアップロードできない
- `public/uploads/` ディレクトリが存在するか確認
