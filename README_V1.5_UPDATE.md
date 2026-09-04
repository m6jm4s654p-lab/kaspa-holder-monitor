# KASPA Holder Monitor v1.5 — Holder Analytics Update

## 実装
- Supabaseの日次実履歴だけでHolder分析
- 7D / 30D / 90D切替
- 100K+ / 1M+の絶対増減と変化率
- Top100集中度の変化（percentage points）
- Holder Momentum（期間前半と後半の100K+増加速度差）
- KAS価格と100K+のダイバージェンス判定
- 履歴カバレッジ表示
- 履歴不足なら値を捏造せず「履歴不足」
- アプリ内部バージョンを1.5.0へ更新

## 上書きファイル
- app/components/Dashboard.js
- app/globals.css
- app/api/health/route.js
- package.json

価格チャートv1.4のCoinGecko実OHLC対応は維持しています。
