# v2.2.14 Update

- Vercel Functionsの実行リージョンを東京（`hnd1`）へ変更
- Kaspatrol取得をブラウザ互換ヘッダーとキャッシュ無効化で改善
- BybitのTicker／OI取得エラーをVercelログで識別可能に改善
- Holder履歴を15分ごと、および画面復帰時に自動更新
- フォールバック値をSupabaseへ保存しない安全機能は維持
- 履歴が存在しない日を推測値で補完しない仕様は維持
