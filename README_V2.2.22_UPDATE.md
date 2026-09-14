# v2.2.22 NOWNodes response compatibility fix

- `blocks-from-bluescore` がブロック本体ではなくハッシュ配列を返す場合に対応
- 配列、`blocks`、`blockHashes`、`block_hashes` の各応答形式からアンカーハッシュを取得
- `anchor_hash_unavailable` エラーを修正
