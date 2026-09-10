# KASPA Holder Monitor v2.2.16 · @TechBit

Responsive Kaspa on-chain analytics PWA built with Next.js / React.

## Main features
- Official Kaspa logo and prominent @TechBit branding
- Japanese / English switching
- Fixed 4-hour KAS/USD chart with about 100 days of horizontal history
- 10MA / 25MA / 75MA / 200MA overlays
- Dedicated desktop dashboard and mobile layout
- Holder distribution dashboard
- 100K+ holder-address trend and daily change
- Price vs holder-address comparison
- Whale concentration meters (Top 10 / 100 / 1000)
- Holder Trend Score after sufficient real history exists
- PWA-ready mobile UI
- Supabase daily snapshot storage
- Rolling 120-day Holder history retention
- Duplicate and fallback snapshot protection
- Vercel Cron daily snapshot
- `/api/health` deployment health endpoint
- Security headers, API burst protection, and sanitized public errors

## Production architecture

`GitHub -> Vercel -> Next.js server APIs -> Supabase`

The Supabase secret key and `CRON_SECRET` are server-only. Never expose them via `NEXT_PUBLIC_*` or commit `.env.local`.

## Local start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Database

For a new database, run `supabase/schema.sql`. When upgrading an existing installation, run `supabase/v2.2.12_security.sql` once. Then configure `.env.local` from `.env.example`.

See `SETUP_GUIDE_JA.md` for the full Japanese GitHub / Vercel / Supabase deployment procedure.
