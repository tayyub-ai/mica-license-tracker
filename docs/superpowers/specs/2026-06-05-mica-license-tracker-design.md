# MiCA License Tracker — Design Spec

**Date:** 2026-06-05
**Owners:** Tayyab + Guneet (cost & work shared)
**Status:** Draft for build

---

## 1. One-line

A free, public, premium-quality web tracker showing which crypto firms are (and aren't) **MiCA-licensed to operate in the EU**, anchored to the **1 July 2026** authorization deadline — built as a credibility asset and lead magnet.

## 2. Why now (the hook) — verified regulatory facts

MiCA (Markets in Crypto-Assets Regulation) became fully applicable on **30 Dec 2024**. Firms already operating under national regimes got a transitional "grandfathering" window under **MiCA Article 143(3)**: they may continue operating until **1 July 2026 OR until their Article 63 authorization is granted/refused, whichever is sooner**. 1 July 2026 is the hard EU-wide ceiling — no member state may exceed it.

**Critically: member states could shorten (but not lengthen) their window**, and many did. The per-state periods from ESMA's official Article 143(3) list (source: ESMA official PDF, primary law):

| Period | Member states |
|---|---|
| **6 months** (→ ~30 Jun 2025) | Latvia, Hungary, **Netherlands**, Poland*, Slovenia, Finland |
| **9 months** (→ ~30 Sep 2025) | Sweden |
| **12 months** (→ ~31 Dec 2025) | **Germany**, Ireland, Lithuania, Austria, Slovakia, Norway (EEA) |
| **18 months** (→ 1 Jul 2026) | France, Spain, Italy†, Cyprus, Luxembourg, Malta, Belgium, and all others |

\* Poland vetoed its own Crypto-Assets Market Act (Dec 2025), so it defaults to the EU-max 1 Jul 2026. The 6-month period listed was never enacted.
† Italy's transitional operating end-date is **30 Jun 2026** (Decreto Legge 95/2025, in force 1 Jul 2025); 30 Dec 2025 is only Italy's application-filing deadline, not the operating-period end.

Application-cutoff dates that differ from operating-period end-dates: Bulgaria (apply by 8 Oct 2025), Czechia (31 Jul 2025), Denmark (30 Dec 2024 — no transitional period at all), Italy (file by 30 Dec 2025 but operate until 30 Jun 2026).

**The "at-risk" headline:** ~204 CASPs were authorized as of 22 May 2026 (ESMA register), versus ~2,747 legacy VASP registrations counted across Europe in 2024 (Coincub). That implies roughly **7–8% conversion** — defensibly "most firms still unlicensed." However, the denominator is contestable (includes dormant shell registrations, non-EU firms, entities that don't need CASP auth); the tracker should cite the explicit numerator/denominator and note the caveat rather than asserting a bare "80%+." Germany leads with ~53 authorized CASPs, Netherlands ~26, France and Poland trailing.

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
- **Authoritative sources (primary, verified):**
  - ESMA interim MiCA register: 5 weekly-updated CSV files (`CASPS.csv`, `ARTZZ.csv`, `EMTWP.csv`, `OTHER.csv`, `NCASP.csv`) at `esma.europa.eu/sites/default/files/2024-12/` — no public API yet; CSV-only until ESMA migrates to formal register IT systems (mid-2026, parser-migration risk).
  - ESMA Article 93 competent-authorities PDF (master state → NCA mapping).
  - ESMA non-compliant entities list (Articles 109/110) — useful for warning-label sourcing.
  - Key NCAs: BaFin (DE) MiCAR hub, AFM (NL) crypto register, AMF (FR) GECO + CASP whitelist + warning list, CBI (IE), MFSA (MT), CySEC (CY), CSSF (LU), CNMV (ES), Bank of Italy/CONSOB (IT).
  - Firm announcements and geoblock evidence for "Exited / restricting EU" status.
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

## 11. Legal / reputational safety (verified best practice)

- **Never assert illegality** — only assert register presence or absence: "not found in the ESMA MiCA CASP register as of [date]." Illegality assertions are actionable; evidence-of-absence statements are not.
- **Disambiguate on legal entity identifier** (LEI or national registration number), not trading name — a trading name shared with a clone firm could defame the legitimate authorized entity.
- **Published methodology + dispute/correction channel** with a review SLA, evidence requirements, and a change audit trail. Route formal corrections through counsel; a poorly worded retraction can be read as an admission of liability.
- **"Not being on the list does NOT mean a firm is authorized"** — carry this explicit absence-of-evidence caveat to handle the inverse case cleanly.
- ESMA itself models the right standard: it asserts authorization positively from the register and frames non-presence as "verify your provider is listed," never as a flat illegality claim.

## 12. Open questions (resolved at design time)

- Watchlist size: **150 firms** at launch. ✓
- Purpose: **free lead magnet / credibility asset.** ✓
- Architecture: **Next.js + Supabase + Vercel.** ✓
- Remaining open: domain name, email/ESP provider for alerts, whether to add UK/non-EU comparison rows in v2.
