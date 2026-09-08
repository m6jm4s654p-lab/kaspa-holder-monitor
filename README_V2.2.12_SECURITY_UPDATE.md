# v2.2.12 Security Update

## Changes

- Cron authentication now fails closed when `CRON_SECRET` is missing.
- Bearer-token comparison uses a timing-safe comparison.
- A unique Supabase index prevents duplicate snapshots for the same JST day.
- Public API responses no longer expose upstream or database error details.
- Per-instance API burst limits and CDN cache headers reduce abusive upstream traffic.
- CSP, HSTS, clickjacking, MIME-sniffing, referrer, permissions, and cross-origin headers were added.
- The health endpoint no longer reveals whether database credentials are configured.

## Required upgrade steps

1. In Supabase SQL Editor, run `supabase/v2.2.12_security.sql` once.
2. Confirm that Vercel has a strong `CRON_SECRET` environment variable for Production.
3. Deploy the updated source.

If `CRON_SECRET` is absent, the snapshot endpoint intentionally returns HTTP 503 and does not write data.

The included in-memory rate limiter is best-effort per server instance. For stronger distributed protection, enable rate limiting or a WAF at the hosting/CDN layer as well.
