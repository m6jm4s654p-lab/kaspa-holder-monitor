# KASPA Holder Monitor v1.7 — SNS Preview / OGP Update

## 追加
- Open Graph (OGP) 対応
- X/Twitter summary_large_image 対応
- SNS共有用 1200×630 プレビュー画像
- title / description / siteName / canonical URL 系のMetadataを整理
- `themeColor` をNext.js推奨のviewport exportへ移動
- faviconとしてKaspaロゴを指定
- 内部バージョンを1.7.0へ更新

## 上書きファイル
- app/layout.js
- app/api/health/route.js
- package.json
- public/og-kaspa-holder-monitor.png

## 公開後の確認
SNSキャッシュが残る場合があります。XやFacebook等では再クロール後に新しいOGPが表示されます。
