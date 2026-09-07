# KASPA Holder Monitor v2.2.1

## 修正内容

- `/api/history` をSupabaseのHolder履歴取得処理へ修正
- Holder履歴の画面取得範囲を直近120日に制限
- 日次スナップショット保存後、120日より古いデータを自動削除
- 日本時間の同じ日に複数回保存されることを防止
- Kaspatrolの取得失敗時にフォールバック値を履歴へ保存しないよう修正

価格履歴はCoinGecko、OIとFunding RateはBybitから取得するため、Supabaseの120日削除対象には含まれません。

過去に保存されていないHolderデータは推測で補完せず、更新後から実データを毎日蓄積します。

## Supabaseで1回だけ実行

SupabaseのSQL Editorで `supabase/v2.2.1_retention.sql` の内容を実行してください。自動削除に必要な権限を設定し、既存の120日より古い行も削除します。
