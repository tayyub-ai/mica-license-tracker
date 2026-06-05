# MiCA License Tracker — Design Spec

**Date:** 2026-06-05
**Owners:** Tayyab + Guneet (cost & work shared)
**Status:** Draft for build

---

## 1. One-line

A free, public, premium-quality web tracker showing which crypto firms are (and aren't) **MiCA-licensed to operate in the EU**, anchored to the **1 July 2026** authorization deadline — built as a credibility asset and lead magnet.

## 2. Why now (the hook)

MiCA (Markets in Crypto-Assets Regulation) became fully applicable on **30 Dec 2024**. Firms already operating under national regimes got a transitional "grandfathering" window under **MiCA Article 143** — a maximum of **18 months**, expiring **1 July 2026** (several member states shortened it). After that hard EU backstop, a firm without a MiCA license (CASP authorization) **cannot legally serve EU clients**.

As of today (June 2026), a large share of firms operating in the EU are still not authorized. A tracker that names who is and isn't licensed, with a live countdown, is timely, press-citable, and positions the owners as MiCA authorities.

## 3. Audience & purpose

- **Primary purpose:** credibility / lead magnet. The asset *is* the marketing — drives press, backlinks, inbound, and email capture; feeds future consulting or a paid product.
- **Audience:** crypto-firm execs/compliance teams, investors, lawyers, journalists, regulators-watchers.
- **Not (now):** a paid subscription product or an internal firm-compliance checklist tool. Architecture leaves a clean path to monetize later.

## 4. What it tracks

**Unit = a named crypto firm operating in / targeting the EU.** Curated named watchlist (target ~100–150 firms at launch: major exchanges, custodians, stablecoin/EMT/ART issuers, brokers, wallet providers, trading platforms).

A defined, *named* universe is the accuracy strategy: every data point is a real, checkable firm with a source — far more defensible than a vague percentage.

### Status taxonomy (per firm)

| Status | Meaning | Evidence standard |
|---|---|---|
| **Authorized** | Holds a MiCA CASP authorization (or ART/EMT issuer authorization) | On ESMA register or an NCA register — link required |
| **Application pending** | Has applied / regulator confirms in-process | Regulator or firm public statement — "as reported", lower confidence |
| **Not authorized** | No MiCA authorization found | "Not found on ESMA/NCA registers as of [date]" — factual, not an accusation |
| **Exited / restricting EU** | Withdrawn, geoblocked, or limiting EU service | Firm announcement / geoblock evidence |
| **Out of scope** | Activity doesn't require MiCA authorization | Brief rationale |

## 5. Accuracy & methodology (non-negotiable)

Accuracy is the product's whole value. Enforced **by the data model**, not by good intentions:

- **Every status carries:** `source_url`, `source_type` (ESMA / NCA / firm / press), `last_verified` date, and a `confidence` flag (high / medium / reported).
- **Public Methodology page:** explains the universe, sources, status definitions, the "not found = not authorized" framing, update cadence, and a **correction/dispute channel** (email) so named firms can request review. This is legal and reputational protection.
- **"Not authorized" is always phrased as evidence-of-absence** ("not found on any EU register as of [date]"), never as an accusation of illegality.
- **Authoritative sources:** ESMA registers (CASPs, ART/EMT issuers, white papers, non-compliant-entity warnings) + national competent authorities (BaFin, AMF, CySEC, Central Bank of Ireland, MFSA, etc.).
- **Change history:** every status change is timestamped and shown on the firm's detail page and in a public changelog.

## 6. Features (premium scope)

1. **Headline dashboard** — live counts (authorized / pending / not authorized / exited), the **at-risk gap** ("X of N named firms still unlicensed"), and a **countdown to 1 July 2026**.
2. **Interactive EU map** — choropleth of the EU-27 (+EEA) colored by # of authorized firms / activity, click a state to filter.
3. **Firm registry** — searchable, filterable, sortable table (by status, jurisdiction, category, last-verified). The core data view.
4. **Firm detail pages** — profile, current status with evidence, status-change timeline, sources, home/host member states. SEO landing pages.
5. **Changelog / "what changed this week"** — a reason to return and to cite; also an RSS/email feed.
6. **Methodology page** — see §5.
7. **Email capture** — "Get deadline & status-change alerts" — the lead-magnet conversion mechanism.
8. **Data export + public read API** — CSV download and a simple JSON API; fuels citations and embeds.
9. **Embeddable widget** — countdown + headline stat that blogs/press can embed → backlinks (the flywheel).
10. **SEO/GEO optimized** — structured data, fast static delivery, designed to be cited by search and AI answer engines.

## 7. Architecture (elite / premium)

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind. Static/ISR rendering for speed, reliability, and cite-ability. Distinctive, premium custom design (not a generic dashboard template).
- **Data layer:** Supabase (Postgres) as the source of truth for the registry, with row-level history/audit and a changelog table. Read path is cached/static; write path is curation-only.
- **Curation / admin:** a protected admin UI for Tayyab + Guneet to add/edit firms and statuses, with validation that *requires* source + date + confidence on every status entry. Edit history retained.
- **Ingestion helpers (assist, not auto-publish):** scheduled jobs that fetch ESMA/NCA registers and **flag** diffs for human verification — accuracy stays human-in-the-loop; automation only surfaces candidates.
- **Map:** EU choropleth via a vetted SVG/topojson approach.
- **Hosting:** Vercel (frontend) + Supabase (data). Email via a transactional/ESP provider for alerts.

## 8. Design direction

Premium, editorial, trustworthy — closer to a respected policy institute / FT-grade data product than a crypto-startup landing page. Clear typographic hierarchy, restrained palette with a single strong accent for "at-risk," excellent table and map UX, fast. The countdown and the at-risk gap are the emotional anchors above the fold.

## 9. Non-goals (YAGNI for v1)

- No user accounts / paid tiers (capture emails only).
- No firm self-service compliance checklist.
- No real-time auto-publishing of scraped data without human verification.
- No coverage of every EU crypto firm — a curated named set, transparently scoped.

## 10. Success criteria

- Accurate: every status traceable to a dated source; zero unsourced "not authorized" labels.
- Credible: methodology + correction channel published; survives scrutiny from a named firm.
- Cite-worthy: clean data, shareable embed, public API → press links and inbound.
- Converts: visible email capture tied to the deadline urgency.

## 11. Open questions

- Initial watchlist size for launch (50 fast-launch vs 150 fuller) and the curation source list to seed it.
- Email/ESP choice for alerts.
- Domain name.
- Whether to include UK/non-EU "for comparison" rows later (out of scope v1).
