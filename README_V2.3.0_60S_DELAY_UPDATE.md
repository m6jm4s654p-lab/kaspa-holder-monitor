# v2.3.0 Infinite Flight — 60-second delayed LIVE

- Camera implementation is unchanged. `app/components/InfiniteFlightCanvas.js` is byte-for-byte identical to the supplied v2.3.0 package.
- `/api/blockdag` refreshes on a 60-second CDN cache.
- The API returns the newest 48 blocks whose real block timestamp is at least 60 seconds behind the fetch time.
- The browser refreshes data every 60 seconds.
- Parent relationships, transaction counts, output totals and whale thresholds remain sourced from the normalized Kaspa block data.
