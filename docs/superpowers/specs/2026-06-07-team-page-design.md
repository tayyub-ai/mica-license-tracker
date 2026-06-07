# MiCA License Tracker Team Page — Design Spec

**Date:** 2026-06-07  
**Status:** Approved

## Goal

Add a credible, understated team presence to the public site without distracting from the license tracker’s core data product.

## Team

- **Tayyub Yaqoob** — AI Implementation Expert  
  Owns data systems, automation, and product implementation.  
  LinkedIn: https://www.linkedin.com/in/tayyubyaqoob/

- **Guneet Kaur** — Fintech & Blockchain Expert  
  Contributes digital-asset research, regulatory context, and editorial quality.  
  LinkedIn: https://www.linkedin.com/in/connectwithguneet-kaur/

## Information Architecture

- Add a compact team section near the end of the homepage, after the trust section.
- Add a dedicated `/team` page with fuller profiles and an explanation of the team’s shared approach.
- Add a Team link to the footer’s Explore navigation.
- Keep Team out of the header to avoid crowding the primary product navigation.

## Components

- Store team profile content in one static shared module so homepage and team-page copy remain consistent.
- Create a reusable profile card that supports compact and full presentations.
- Use initial-based portraits (`TY` and `GK`) rather than photographs.

## Visual Direction

Follow the existing “Midnight Editorial” design:

- Gold-accented monograms
- Existing Fraunces and Outfit typography
- Restrained glass-panel cards
- Clear role labels, concise biographies, and visible LinkedIn links

## Content

The homepage section uses the heading **“Built by specialists”** and brief profile summaries. It links to `/team`.

The team page explains that the tracker combines implementation discipline with fintech and blockchain expertise. It also reinforces that the tracker is independently maintained and that published statuses remain sourced and dated.

## Accessibility and SEO

- Use semantic headings and descriptive LinkedIn link labels.
- Ensure monograms are decorative or have appropriate accessible labels.
- Add page metadata for `/team`.
- Preserve keyboard focus and contrast conventions from the existing design system.

## Testing

- Run lint and production build.
- Verify `/`, `/team`, and footer navigation render correctly.
- Confirm both LinkedIn links use the intended public profile URLs.
