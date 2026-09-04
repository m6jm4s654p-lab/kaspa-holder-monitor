# KASPA Holder Monitor v1.2 公開手順

構成:

GitHub → Vercel (Next.js) → Supabase (Holder履歴DB)

## 1. ローカル確認

```bat
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 2. Supabaseを作る

1. Supabaseで新規Projectを作成します。
2. SQL Editorを開きます。
3. `supabase/schema.sql` の内容を実行します。
4. Project URLを控えます。
5. API Keysから server-side の Secret key (`sb_secret_...`) を作成・取得します。

秘密鍵はGitHubへ絶対にアップロードしません。

## 3. ローカルでDBを接続する

プロジェクト直下に `.env.local` を作成します。

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxx
CRON_SECRET=十分に長いランダム文字列
```

`npm run dev` を再起動します。

確認URL:

- `/api/health`
- `/api/holders`
- `/api/history?days=90`

## 4. 最初のスナップショットを保存する

Vercel公開前の手動テストではAuthorizationヘッダーが必要です。
本番ではVercel Cronが毎日自動実行します。

アプリは毎日 UTC 15:15（日本時間 00:15）にHolder状態とKAS価格を保存する設定です。

## 5. GitHubへアップロード

GitHubで新しいRepositoryを作ります。

プロジェクトフォルダで:

```bat
git init
git add .
git commit -m "Initial KASPA Holder Monitor v1.2"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

`.env.local` は `.gitignore` によりアップロード対象外です。

## 6. Vercelで公開

1. VercelへGitHubでログイン。
2. Add New Project。
3. 作成したGitHub RepositoryをImport。
4. Environment Variablesへ以下を登録:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `CRON_SECRET`
5. Deploy。

公開後はVercelがGitHubのmainブランチへのpushを検知して自動更新します。

## 7. 公開前チェック

- Kaspaロゴが表示される
- @TechBitが表示される
- JA / ENが切り替わる
- KAS価格チャートが表示される
- `/api/health` が `ok:true`
- Holder現在値が取得できる
- 日次スナップショットがSupabaseへ保存される
- `.env.local` がGitHubに存在しない

## Holder履歴について

公開直後は履歴が1件しかないため7D/30D/90DとHolder Trend Scoreは表示できません。
毎日のスナップショットが蓄積すると自動的に表示されます。
