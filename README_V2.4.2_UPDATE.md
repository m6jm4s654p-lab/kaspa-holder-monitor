# v2.4.2 — Free Kaspa API fallback

## Changes

- Keeps NOWNodes as the primary BlockDAG provider when `NOWNODES_API_KEY` is configured.
- Automatically retries through the keyless public Kaspa REST API when NOWNodes returns `401`, expires, times out, or otherwise fails.
- Continues the existing shared CDN snapshot across providers, avoiding a viewer-specific upstream request.
- Adds `provider` and `source: "live-fallback"` to the BlockDAG response while the free provider is active.
- Supports the optional `KASPA_PUBLIC_API_URL` environment variable. If omitted, `https://api.kaspa.org` is used.

No API key is required for the fallback. The public endpoint is community infrastructure, so availability and rate limits are not guaranteed; the existing CDN cache limits upstream load.
