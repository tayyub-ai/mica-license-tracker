# MiCA License Tracker: Authority and Credibility Roadmap

**Date:** 2026-06-07  
**Primary audience:** Compliance professionals  
**Secondary audiences:** Journalists, researchers, and consumers  
**Primary objective:** Become the most credible, cite-worthy public reference for EU MiCA authorization status.

## Strategic Decision

MiCA License Tracker should develop as an evidence-first regulatory reference.

Accuracy, source coverage, reproducibility, and clear language should take priority over feature volume, monetization, or decorative expansion. Every public claim should be independently verifiable from an official source.

The tracker should not become a general crypto news site, subjective scoring product, or broad compliance platform until its core authorization dataset is demonstrably complete and reproducible.

## Critical Audit

### Critical Issues

#### 1. Negative-status verification scope is unclear

The site uses "Not Licensed" or "Not authorized" for firms that were not found, but it does not record exactly which registers were searched for each negative finding.

**Risk:** A negative status may appear more definitive than the evidence supports.

**Correction:** Store and publish a verification-scope record listing the official registers checked, check date, result, and reviewer.

#### 2. Source evidence is not immutable

Firm statuses link to live register pages, which can change after verification.

**Risk:** Historical claims cannot be reproduced or audited reliably.

**Correction:** Retain evidence snapshots, source-file checksums, retrieval timestamps, and stable row identifiers for every verification.

#### 3. ESMA ingestion does not detect removals

The ingestion job detects new authorized entities and tracked firms that become authorized. It does not create review items when a previously authorized entity disappears or its authorization details change.

**Risk:** Removed or amended authorizations may remain displayed as current.

**Correction:** Diff the full current register against the previous accepted snapshot and queue removals and field-level changes for human review.

#### 4. Claimed ESMA coverage exceeds implemented coverage

The methodology says five ESMA CSV files are checked. Current ingestion processes only `CASPS.csv` and `EMTWP.csv`.

**Risk:** Published methodology overstates actual source coverage.

**Correction:** Either process all claimed files or explicitly publish the narrower current coverage until full ingestion exists.

#### 5. Claimed NCA review process is not evidenced

The site says national NCA registers are checked monthly, but there is no NCA ingestion pipeline or public/manual verification log.

**Risk:** Users cannot determine whether the monthly review claim is being fulfilled.

**Correction:** Create a source-review ledger for each NCA showing the last check date, reviewer, result, and next scheduled review.

### High-Priority Issues

#### 6. "Live" language is misleading

Data is cached hourly and source checks primarily occur weekly or monthly.

**Correction:** Replace "live" with "regularly updated" or "latest verified data." Show exact freshness timestamps.

#### 7. Latest firm verification is not dataset freshness

The homepage displays the newest `last_verified` date across all firms. This does not prove the full dataset was reviewed on that date.

**Correction:** Separate:

- Official register last checked
- Entire dataset last reviewed
- Individual firm last verified
- Public site last generated

#### 8. Country-level regulatory evidence is missing

The map shows country deadlines and counts but there are no stable country detail pages.

**Correction:** Add citation-ready country pages with legal basis, NCA, official register links, deadline, exceptions, authorized entities, and source-review dates.

#### 9. Correction workflow is email-only

Corrections are submitted through email with no structured public case record.

**Correction:** Add a structured correction form and internal review queue. Record accepted corrections in the changelog with evidence, while keeping sensitive correspondence private.

#### 10. No versioned methodology or dataset releases

Users cannot cite a stable dataset version and reproduce an earlier result.

**Correction:** Publish immutable versioned releases with checksums, methodology version, source coverage, release notes, and suggested citation.

### Medium-Priority Issues

1. API and CSV exports lack documentation, schema version, generation timestamp, and explicit licence terms.
2. The registry does not clearly distinguish curated watchlist records from complete official-register coverage.
3. Firm pages lack authorization date, authorization/reference number, competent authority, authorized services, and direct source-row identifiers.
4. The countdown will become obsolete after 1 July 2026 and needs a post-deadline replacement.
5. The generic Next.js starter README weakens repository credibility.
6. The acceptance criteria contain claims and routes that no longer match implementation, including `/api/export.csv` and firm-specific alerts.
7. The site promises status-change alerts, but the current email system sends a general weekly digest and has no firm watchlists.
8. Source URLs are visible, but source labels and citation formats are not optimized for journalists or researchers.

## Recommended Roadmap

## Phase 0: Correct Trust Gaps

Complete this before adding broader public features.

### Work

1. Replace misleading "live" and firm-specific alert language.
2. Introduce separate dataset, source-check, and firm-verification timestamps.
3. Align methodology claims with implemented source coverage.
4. Process every relevant ESMA register file or explicitly document exclusions.
5. Detect register removals and changed authorization details.
6. Add verification scope for negative findings.
7. Publish which sources are automated, manually checked, or not yet covered.
8. Reconcile acceptance criteria with actual implementation.
9. Replace the starter README with project purpose, methodology, architecture, source coverage, and contribution policy.
10. Document the post-1 July 2026 product state.

### Success Criteria

- No public claim exceeds the implemented process.
- Users can distinguish source freshness from individual record freshness.
- Every negative status states what was checked.
- Methodology and acceptance criteria match production behavior.

## Phase 1: Evidence Ledger

This is the highest-value product addition.

### Evidence Record

For every status verification, retain:

- Firm and legal entity identifier
- Status asserted
- Official source URL
- Source document or file name
- Source type
- Source publication date, when available
- Retrieval timestamp
- Source row identifier or register reference
- Evidence snapshot location
- Source-file checksum
- Verification scope
- Reviewer
- Verification timestamp
- Notes and interpretation
- Superseded evidence link

### Public Presentation

Firm pages should show a concise evidence block containing:

- Current status
- Exact legal entity
- Official authority
- Verification date
- Source reference
- Registers checked
- Downloadable citation
- Link to historical evidence

### Success Criteria

- A journalist can independently reproduce a firm-status claim.
- Historical status claims remain auditable after source pages change.
- Every current status points to an accepted evidence record.

## Phase 2: Country Regulatory Pages

Create stable pages at `/countries/[code]`.

### Each Page Should Include

- Country name and EU/EEA status
- Transitional-period status
- Exact end date and application deadline
- Legal basis and official source
- Country-specific exceptions
- National competent authority
- Official authorization-register links
- Source-review date
- Tracked firms domiciled in the country
- Officially authorized entities
- Recent country-specific authorization changes
- Suggested citation

### Success Criteria

- Country pages answer compliance and journalist questions without requiring map interaction.
- Every deadline and exception links to an official source.
- Pages are indexable and included in the sitemap.

## Phase 3: Citation-Ready Dataset Releases

Publish immutable periodic releases.

### Release Contents

- Versioned CSV
- Versioned JSON
- Dataset checksum
- Generation date and time
- Source coverage statement
- Methodology version
- Schema version
- Change summary
- Known limitations
- Suggested citation
- Archived previous releases

### Example Citation

> MiCA License Tracker, EU CASP Authorization Dataset, version 2026-06-07.

### Success Criteria

- Researchers can reproduce historical analyses.
- Journalists can cite a stable release rather than a changing webpage.
- Dataset changes are explained and auditable.

## Phase 4: Better Entity and Authorization Records

Extend records only with official, verifiable fields.

### Recommended Fields

- Authorization date
- Authorization/reference number
- Competent authority
- Authorized MiCA services
- Official register classification
- Legal entity aliases
- Trading brands
- Passporting or host-state information, where officially available
- Authorization conditions or restrictions, where officially available
- Register-row identifier

### Important Boundary

Clearly distinguish:

- A tracked consumer-facing brand
- The authorized legal entity
- Other group entities that are not authorized

Do not infer group-wide authorization from one licensed entity.

## Phase 5: Regulatory Timeline and Deadline Transition

### Before 1 July 2026

Publish a sourced regulatory timeline covering:

- MiCA entry into force
- Stablecoin provisions becoming applicable
- Full MiCA application
- Member-state transitional deadlines
- Major ESMA statements
- EU-wide transitional deadline

### After 1 July 2026

Replace the countdown with:

- Days since the EU-wide transition ended
- Number of authorized entities
- Number of tracked entities without confirmed authorization
- Recent authorization, removal, and exit activity
- ESMA enforcement and wind-down guidance

Avoid language implying that every unlicensed firm is necessarily operating illegally. Some entities may have exited, be out of scope, or not serve EU clients.

## Phase 6: Press and Research Toolkit

Build only after the evidence ledger and versioned releases are reliable.

### Recommended Tools

- Downloadable charts with source notes
- Stable chart URLs
- Monthly authorization trend
- Newly authorized entities
- Removed or amended authorizations
- Country comparison table
- Methodology one-page summary
- Suggested citations
- Press contact
- Embeddable evidence-backed charts

### Success Criteria

- Every chart links to a stable dataset release.
- Charts state their denominator, source coverage, and generation date.
- Press users can verify figures without contacting the team.

## Features to Reject or Defer

These features do not support the authority-first strategy yet:

- Paid plans and team accounts
- Firm popularity rankings
- Subjective compliance scores
- Investment recommendations
- AI-generated regulatory summaries without human review
- General crypto news
- Price and market data
- Social or community features
- Large editorial article operation
- Firm-specific alerts until real watchlists exist
- Additional decorative homepage sections
- Broad non-EU regulatory comparison
- Self-service firm profile editing

## Corrected Priority Order

1. Correct public claims and freshness language.
2. Build the evidence ledger.
3. Complete ESMA and NCA source coverage.
4. Add removal and change detection.
5. Publish country regulatory pages.
6. Publish versioned dataset releases.
7. Enrich entity and authorization records.
8. Prepare the post-deadline product state.
9. Add press and research tooling.

## Product Principles

1. Evidence before opinion.
2. Official sources before secondary reporting.
3. Legal entity before trading brand.
4. Reproducibility before visual novelty.
5. Exact timestamps before "live" language.
6. Published limitations before implied completeness.
7. Human review before public status changes.
8. Removal and correction history must remain visible.
9. Negative findings must state their verification scope.
10. Every chart and headline number must define its denominator.

## Source References

- ESMA, Article 143 Transitional Measures:  
  https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-143-transitional-measures

- ESMA, Statement on the End of Transitional Periods under MiCA, 17 April 2026:  
  https://www.esma.europa.eu/sites/default/files/2026-04/ESMA75-113276571-1679_Statement_on_the_end_of_transitional_periods_under_MiCA.pdf

- EBA, EU Supervisory Authorities Warning on Crypto-Assets and Providers:  
  https://www.eba.europa.eu/publications-and-media/press-releases/eu-supervisory-authorities-warn-consumers-risks-and-limited-protection-certain-crypto-assets-and

- EBA, Asset-Referenced and E-Money Tokens under MiCA:  
  https://www.eba.europa.eu/regulation-and-policy/asset-referenced-and-e-money-tokens-mica
