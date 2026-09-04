# KASPA Holder Monitor v1.2 · @TechBit

Mobile-first Kaspa on-chain analytics PWA built with Next.js / React.

## Main features
- Official Kaspa logo and prominent @TechBit branding
- Japanese / English switching
- Live KAS/USD market chart and volume history
- Holder distribution dashboard
- 100K+ holder-address trend and daily change
- Price vs holder-address comparison
- Whale concentration meters (Top 10 / 100 / 1000)
- Holder Trend Score after sufficient real history exists
- PWA-ready mobile UI
- Supabase daily snapshot storage
- Vercel Cron daily snapshot
- `/api/health` deployment health endpoint

## Production architecture

`GitHub -> Vercel -> Next.js server APIs -> Supabase`

The Supabase secret key is server-only. Never expose it via `NEXT_PUBLIC_*` or commit `.env.local`.

## Local start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Database

Run `supabase/schema.sql`, then configure `.env.local` from `.env.example`.

See `SETUP_GUIDE_JA.md` for the full Japanese GitHub / Vercel / Supabase deployment procedure.
