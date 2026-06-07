# MiCA License Tracker — Acceptance Criteria

**Date:** 2026-06-05  
**Status:** Authoritative, all criteria derived from primary regulatory sources (ESMA, national acts)

> **Note:** Some criteria below describe target behaviour. See the authority-credibility roadmap for current coverage vs planned. Where current implementation differs from a target, it is called out inline.

---

## AC-1: Regulatory deadline accuracy

| # | Criterion | Pass condition |
|---|---|---|
| 1.1 | Global hard deadline displayed | UI shows **1 July 2026** as the EU-wide outer boundary. No other date used as "the deadline." |
| 1.2 | Countdown timer | Live countdown to 1 July 2026 00:00 UTC on every page. Stops at zero; does not go negative. |
| 1.3 | Per-state transitional dates | Each EU-27 + Norway state displays its correct period length per the ESMA Article 143(3) official list. Test cases: NL = 6 months (~30 Jun 2025), DE = 12 months (~31 Dec 2025), FR/ES/CY/MT/LU/BE = 18 months (~1 Jul 2026). |
| 1.4 | Poland exception displayed | Poland shown as 18-month / 1 Jul 2026 (not "6 months") with a note that the shorter national act was vetoed Dec 2025. |
| 1.5 | Italy clarification | Italy's operating end-date displayed as **30 Jun 2026**; 30 Dec 2025 noted only as the application-filing deadline — not the operating-period end. |
| 1.6 | Denmark no-transitional-period | Denmark displayed as having **no transitional period** (application cutoff 30 Dec 2024); pre-existing Danish CASPs needed authorization from day one. |
| 1.7 | "Whichever is sooner" caveat | Methodology page explains a firm exits the transitional regime at authorization grant/refusal OR 1 Jul 2026, whichever comes first. |

---

## AC-2: Data sources and provenance

| # | Criterion | Pass condition |
|---|---|---|
| 2.1 | ESMA register as primary | Every "Authorized" status traces to an ESMA interim CSV (CASPS.csv, ARTZZ.csv, EMTWP.csv, OTHER.csv, NCASP.csv). Direct URL or row reference required. Current automated ingestion covers CASPS + EMTWP; NCASP was loaded once; ARTZZ and OTHER are not yet automatically processed. |
| 2.2 | NCA registers as secondary | Where a firm's CASP authorization predates ESMA CSV inclusion, it may be sourced to a named NCA register (BaFin, AFM, AMF/GECO, CBI, MFSA, CySEC, CSSF, CNMV, Bank of Italy/CONSOB) with a URL. |
| 2.3 | Source field never empty | Database constraint: `source_url` NOT NULL on every firm-status row. Admin UI rejects submission without source. |
| 2.4 | `last_verified` field never empty | `last_verified` date required on every status row. Rows older than **30 days** surface as "stale" in the admin panel. |
| 2.5 | Confidence field present | Every row has `confidence` in {high, medium, reported}. ESMA CSV = high. NCA-only = high. Firm statement = reported. Press-only = medium. |
| 2.6 | Source shown publicly | Every firm's detail page shows source type, source URL (clickable), and last-verified date. Not hidden in admin. |
| 2.7 | ESMA CSV ingestion pipeline | A scheduled job fetches the ESMA CSVs weekly and diffs against current DB. New entries and status changes are surfaced to admins as "pending review", not auto-published. Current coverage: CASPS + EMTWP only. The remaining ESMA files (ARTZZ, OTHER) and the once-loaded NCASP list are a roadmap item, not yet part of the weekly automated job. |
| 2.8 | Article 93 NCA mapping | System uses the ESMA Article 93 competent-authorities list to map member state → supervising NCA. This mapping is stored in the DB and shown on state detail pages. |

---

## AC-3: Firm registry — coverage and completeness

| # | Criterion | Pass condition |
|---|---|---|
| 3.1 | Minimum 150 named firms at launch | Registry contains ≥ 150 uniquely named firms at go-live. |
| 3.2 | Category distribution | At least: 40 exchanges/trading platforms, 25 custodians, 20 stablecoin/EMT/ART issuers, 20 brokers/on-ramps, 15 wallet providers, 10 DeFi/other in-scope services, 20 additional. |
| 3.3 | Geographic spread | Firms headquartered or primarily operating in at least 10 different EU/EEA member states represented. |
| 3.4 | Authorized firms coverage | All ~204 authorized CASPs visible in the ESMA register as of launch are represented (or documented why excluded from the named watchlist). |
| 3.5 | Major names present | Binance, Coinbase, Kraken, OKX, Crypto.com, Bitstamp, Bitpanda, Nexo, Bitget — all present and with a sourced status. |
| 3.6 | Legal entity disambiguation | Each firm row uses its legal entity name + LEI or national registration number (not trading name alone). Prevents clone-firm defamation risk. |
| 3.7 | "Out of scope" label justified | Any firm labelled "Out of scope" has a one-sentence rationale (e.g., "DeFi protocol with no identifiable issuer/CASP"). |

---

## AC-4: Status taxonomy accuracy

| # | Criterion | Pass condition |
|---|---|---|
| 4.1 | "Authorized" = register-backed only | Only applied when firm is positively listed in ESMA CSV or named NCA register with a link. Never based on press or firm self-report alone. |
| 4.2 | "Not authorized" phrasing | Displayed as: *"Not found in any EU MiCA register as of [last_verified date]."* Never phrased as "illegal," "non-compliant," or "operating illegally." |
| 4.3 | "Application pending" confidence | Shown only when a regulator or the firm has made a public statement confirming an application is in progress. Confidence = reported. |
| 4.4 | "Exited / restricting EU" evidence | Requires a firm announcement URL or documented geoblock/service restriction — not inferred from absence. |
| 4.5 | Clone-firm guard | If two entries share a trading name, system flags them. "Not authorized" label on a name-matched entry requires LEI-level disambiguation before publishing. |
| 4.6 | Status change timestamped | Every status change is recorded with old status, new status, source, date, and admin actor. Visible in public changelog and firm history. |

---

## AC-5: "At-risk" headline statistic

| # | Criterion | Pass condition |
|---|---|---|
| 5.1 | Numerator = register-derived | The "X authorized" count is derived directly from the ESMA CSV row count + confirmed NCA entries, not from third-party trackers. |
| 5.2 | Denominator = named watchlist | The headline "X of 150 named firms not authorized" uses our 150-firm watchlist as the denominator — not a contested EU-wide count. This is transparent and unchallengeable. |
| 5.3 | No bare "80%+" claim | The site does not assert "80%+ of EU crypto firms lack a license" without sourcing. If a contextualization figure is used, it must cite: ~204 authorized vs. ~2,747 prior VASP registrations (Coincub 2024), with the caveat that the denominator includes dormant/non-EU entities. |
| 5.4 | Methodology page explains denominator | The methodology page describes exactly what the watchlist covers and what it doesn't, so no reader can claim the headline stat is misleading. |

---

## AC-6: Map

| # | Criterion | Pass condition |
|---|---|---|
| 6.1 | EU-27 + EEA choropleth | All 27 EU member states + Norway, Iceland, Liechtenstein displayed. Color intensity = number of authorized CASPs domiciled in that state. |
| 6.2 | Click-to-filter | Clicking a state filters the firm registry to firms with home/host authorization in that state. |
| 6.3 | Per-state transitional deadline shown | Hovering / clicking a state shows its transitional period length and end-date per the verified table in AC-1.3. |
| 6.4 | UK shown as "out of scope / for reference" | UK may be displayed in a neutral color with a "Not EU — separate regime" label if included at all. |

---

## AC-7: Methodology and legal-safety page

| # | Criterion | Pass condition |
|---|---|---|
| 7.1 | Page exists and is linked from footer + every firm detail page | `/methodology` is live and linked persistently. |
| 7.2 | Explains the watchlist scope | States exactly: what 150 firms are included, how they were selected, what's excluded, and that absence from the watchlist ≠ authorized. |
| 7.3 | Explains "not authorized" framing | Explicitly states: "Not found in register" ≠ illegal. Explains evidence-of-absence standard. |
| 7.4 | Lists primary sources | Names the ESMA CSVs, the Article 93 NCA list, and each NCA register used. Links to each. |
| 7.5 | Update cadence disclosed | States: the CASPS + EMTWP ESMA registers are checked automatically every week with changes queued for human review; the site is statically generated and refreshes hourly (not live or real-time); firms can submit corrections at any time. NCA registers are not yet part of the automated weekly job; automated monthly NCA checks are a roadmap item not yet implemented. |
| 7.6 | Dispute / correction channel | Publishes an email address (or form) for named firms to submit corrections. States a review SLA (e.g., 5 business days). |
| 7.7 | Absence-of-evidence caveat | Explicitly states: "Absence from this tracker does not mean a firm is authorized." |

---

## AC-8: Changelog and freshness

| # | Criterion | Pass condition |
|---|---|---|
| 8.1 | Public changelog | `/changelog` page lists every status change with date, firm name, old → new status, and source. |
| 8.2 | RSS feed | Changelog is available as an RSS/Atom feed at `/changelog.xml`. |
| 8.3 | "Last updated" timestamp | Site header/footer shows the date of the most recent data update. Never more than 14 days old. |
| 8.4 | Stale-row alerting | Admin panel flags any row with `last_verified` > 30 days as requiring review. |

---

## AC-9: Email capture and weekly digest

| # | Criterion | Pass condition |
|---|---|---|
| 9.1 | Capture form present | Email signup form visible above the fold on homepage and on the firm registry. |
| 9.2 | Signup confirms scope | Confirmation email states subscribers will receive a weekly email summarising what changed on the EU MiCA register. No per-firm watchlists or firm-specific alerts are promised. |
| 9.3 | Weekly digest | Confirmed subscribers receive a single weekly digest listing all status changes that occurred that week (old → new status per firm), with a link to the changelog. There are no per-firm watchlists or firm-specific alerts. |
| 9.4 | No spam | Unsubscribe link present in every email. GDPR-compliant opt-in. |

---

## AC-10: Public data API and export

| # | Criterion | Pass condition |
|---|---|---|
| 10.1 | CSV download | `/api/export` returns the full firm registry with all public fields (firm, category, status, last_verified, source_type, source_url). |
| 10.2 | JSON API | `GET /api/firms` returns JSON array of all firm records. `GET /api/firms/:slug` returns a single firm. No auth required for read. |
| 10.3 | Embeddable widget | A `<script>` embed snippet is available that renders a countdown + headline stat (authorized count / total watchlist) on third-party pages. |

---

## AC-11: Performance and SEO

| # | Criterion | Pass condition |
|---|---|---|
| 11.1 | Core Web Vitals | LCP < 2.5s, CLS < 0.1, INP < 200ms on mobile (Chrome field data or Lighthouse). |
| 11.2 | Firm detail pages are indexed | Each of the 150 firm pages has a unique URL, title tag, meta description, and is included in sitemap.xml. |
| 11.3 | Structured data | JSON-LD `Dataset` schema on the registry page; `FAQPage` schema on methodology page. |
| 11.4 | Open Graph / social preview | Every page has og:title, og:description, og:image. Firm detail pages generate dynamic OG images. |

---

## AC-12: Admin / curation UI

| # | Criterion | Pass condition |
|---|---|---|
| 12.1 | Protected route | Admin UI requires authentication. Not accessible to the public. |
| 12.2 | Mandatory fields enforced | Cannot save a firm status without `source_url`, `last_verified`, `confidence`. |
| 12.3 | ESMA diff review queue | Weekly ESMA CSV diff surfaces as a review queue: new entries (propose adding to watchlist?), status changes (update existing row?). Admin approves/rejects each. |
| 12.4 | Edit history retained | All edits are append-only in the DB; previous values are retained and visible in admin history. |
