# v2.3.0 LIVE BLOCKDAG integration

- Added `/blockdag` as a KASPA Holder Monitor feature.
- Added a `LIVE DAG` entry button to the existing dashboard header.
- Integrated Infinite Flight v2.3.2 with continuous space-flight camera motion.
- Keeps growing parent-child connections visible while the camera follows the DAG frontier.
- Visualizes block Output tiers: 1K+ yellow, 10K+ orange, 100K+ red, and 1M+ purple.
- Preserves Block Inspector, DAA Score, transaction count, Output volume, transaction links, pause/resume, and mobile Canvas optimization.
- Reuses the existing `/api/blockdag` relay and `NOWNODES_API_KEY` environment variable.

Existing Holder, price, chart, derivatives, Supabase, and snapshot features are unchanged.
