# KASPA Holder Monitor v1.8 — Address Total + Home Screen Icon

## 変更
- 「総アドレス数」を「残高保有アドレス総数」に変更
- 定義は `≥ 0.0001 KAS` を保有するネットワーク全体のアドレス
- Kaspatrolの Plankton (0.0001 KAS+) tier + 1 KAS以上を合算して表示
- 1 KAS以上は同カード内の独立項目および保有量別テーブルで表示
- ホーム画面追加用のKaspaアイコンを設定
- Android/PWA: 192×192 / 512×512
- iPhone: apple-touch-icon 180×180
- favicon 64×64
- manifest.webmanifest にicons / scopeを追加

## 上書きファイル
- lib/holders.js
- app/components/Dashboard.js
- app/globals.css
- app/layout.js
- public/manifest.webmanifest
- public/icon-192.png
- public/icon-512.png
- public/apple-touch-icon.png
- public/favicon-64.png

## 注意
「残高保有アドレス総数」は「過去に一度でも使われた全アドレス」ではありません。
現在残高が0.0001 KAS以上あるアドレスを対象としたオンチェーン保有アドレス数です。
