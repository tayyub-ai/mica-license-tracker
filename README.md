# MiCA License Tracker

An independent, sourced record of which crypto firms hold an EU MiCA licence, counting down to the 1 July 2026 deadline.

Live site: https://mica-license-tracker.vercel.app

## What it is

MiCA License Tracker is an independent information resource that tracks the EU MiCA licence status of named crypto firms. Under MiCA Article 143(3), firms operating under prior national regimes may continue during a transitional window that ends no later than 1 July 2026 EU-wide, or when their authorisation is granted or refused, whichever is sooner.

Current data: 376 named firms, 226 licensed, 150 not licensed, across 25 member states.

## How the data is sourced and verified

A scheduled job runs weekly. It fetches the ESMA register files, compares them to our database, and queues any changes for a human to review before publishing. Nothing is auto-published.

- **Checked automatically every week:** the ESMA CASP register (CASPS.csv) and the e-money/asset-referenced token issuer register (EMTWP.csv). New entries and changes are queued for human review before they appear on the site.
- **Included but not yet automated:** the ESMA non-compliant-entities list (NCASP), loaded once and shown as Not Licensed with the regulator's note.
- **Not yet covered automatically:** the ESMA ARTZZ and OTHER files, and the national authority (NCA) registers. A few entries are checked by hand against a named authority.

The site is statically generated and refreshes hourly. Source checks happen weekly, so the data is not live or real-time.

Source links: licensed firms link to the exact ESMA CSV file they came from. Not-licensed majors link to the official searchable ESMA register.

## Architecture and stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres) for data
- Resend for email
- Deployed on Vercel

## Key routes

Public pages:

- `/` home and headline statistics
- `/firms` and `/firms/[slug]` firm registry and detail pages
- `/methodology` how the data is sourced and verified
- `/changelog` public status-change log

Data and feeds:

- `GET /api/firms` JSON array of all firm records; `GET /api/firms/[slug]` a single firm. No auth required for read.
- `GET /api/export` CSV export of the full firm registry
- `/changelog.xml` RSS feed of status changes
- `/embed` and `/embed.js` embeddable widget for third-party pages

## Email

Confirmed subscribers receive a single weekly digest summarising what changed on the EU MiCA register. There are no per-firm watchlists or firm-specific alerts. Every email includes an unsubscribe link.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `NEXT_PUBLIC_SITE_URL`

## Corrections

Named firms that believe their status is incorrect can email corrections@mica-tracker.eu with their legal entity name, LEI or national registration number, the status in question, and a link to the relevant register entry. We aim to review within 5 business days.

## Disclaimer

This project is not affiliated with ESMA, any national competent authority, or any listed firm. Nothing here constitutes legal advice.

GitHub: tayyub-ai/mica-license-tracker
