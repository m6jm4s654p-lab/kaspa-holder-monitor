# v2.2.21 BlockDAG API provider update

- 登録ページが利用できない Kaspa Developer Platform への依存を廃止
- NOWNodes Kaspa REST API（`https://kas.nownodes.io`）へ切り替え
- APIキーは `NOWNODES_API_KEY` としてVercel環境変数から安全に読み込み
- 実ブロック、取引件数、送金総額、大口送金をライブBlockDAG画面へ提供
- 無料枠（月10万リクエスト）を超えないよう、上流データは120秒キャッシュ

## NOWNodesの登録

1. `https://account.nownodes.io/auth/signup` で無料アカウントを作成
2. Kaspa用APIキーを発行
3. Vercelの Project Settings → Environment Variables に以下を追加

   - Name: `NOWNODES_API_KEY`
   - Value: 発行されたAPIキー
   - Environment: Production / Preview / Development

4. Vercelで最新デプロイを Redeploy
5. `https://kaspa-holder-monitor-five.vercel.app/api/blockdag` を開き、`"ok":true` を確認

## 更新間隔について

1回の更新で4つのKaspa REST APIを使用します。60秒更新では月間約17.3万リクエストとなるため、無料枠で安定運用できる120秒更新に設定しています。
