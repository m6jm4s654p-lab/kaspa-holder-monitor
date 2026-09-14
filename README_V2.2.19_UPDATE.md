# v2.2.19 BlockDAG relay

- LIVE BlockDAG用の `/api/blockdag` 中継APIを追加
- 最新ブロックから直近DAG範囲を取得し、48ブロックへ正規化
- 100K / 1M KASの大口Output判定、3秒キャッシュ、レート制限、限定CORSを追加
- 上流API障害時は503を返し、実データとデモデータを混同しない設計
