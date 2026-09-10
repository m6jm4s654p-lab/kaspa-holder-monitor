# v2.2.17 Update

- Kaspalyticsの公開データから流通供給量を取得
- KasLensの上位100アドレス実データからTop10／Top100保有比率を計算
- Top1000が取得できない場合は0と表示せず、Top100までの構成で表示
- 取得値の件数・順位・数値形式を検証し、異常時はSupabaseへ保存しない
- 30日固定チャート、Kaspalytics実履歴、Bybit OI・Funding Rate取得を維持
