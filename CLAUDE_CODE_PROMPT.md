# Designed to Elevate — Keyword-Driven Site Update + 7 New Pages

## Strategic Context (read before starting)

This update is driven by validated Google Keyword Planner data. ~250 keywords were tested across 9 clusters in the Ohio search market. The data revealed that local-city keywords (e.g., "web design Zanesville", "web design Coshocton") have near-zero monthly search volume, while "small business" framed keywords have 100x–1000x more volume with low competition. Geography will be handled by Google Business Profile and local schema, not by keyword content.

This prompt has two parts:

- **Part 1** — update meta titles and key copy on existing pages to align with validated keywords
- **Part 2** — build 7 new pages targeting validated high-volume, low-competition keywords

Both parts ship in this single session. You have authority to make tactical and design decisions throughout. Where the spec is unclear, where a better call exists, or where a small inconsistency in the existing site needs fixing to support these changes — make the call and document it in verification.

---

## Validated Keyword Data (the basis for every decision below)

### Tier A — High volume, low competition (build around these)

```
small business web designer        1K–10K   Low    ⭐ biggest
small business website redesign    1K–10K   Low    ⭐
contractor website design          1K–10K   Low    ⭐ biggest vertical
local SEO for small business       1K–10K   Low    ⭐
small business website design      1K–10K   (cluster 2)
build a website for my business    1K–10K   High
```

### Tier B — Real volume, low competition

```
hvac website design                100–1K   Low
landscaping website design         100–1K   Low
pressure washing website design    100–1K   Low
lead generation website design     100–1K   Low
business website design services   100–1K   Low
small business website cost        100–1K   Low
```

### Tier C — Marginal volume, real intent

```
auto detailing website design      10–100   Low
barbershop website design          10–100   Low
window tint seo                    10–100   Low
high converting website design     10–100   Low
landing page for service business  10–100   Medium
```

### Confirmed dead (zero volume — do NOT optimize for these)

```
web design Zanesville              0–10
web design Coshocton               0–10
web designer Zanesville Ohio       0–10
window tint shop website design    0–10
ceramic coating website design     0–10
party bus website designer         0–10
dog grooming website designer      0–10
pest control website designer      0–10
event transportation website       0–10
website redesign Ohio              0–10
```

---

## Critical Honesty Constraint

**The owner of this business has client work in:**

- **Modern Classic Barbershop** (Zanesville, OH — Michael's shop) → barbershop / booking
- **Fitchin Auto Detail & Tint** (Coshocton, OH — Eric's shop) → auto detail, tint, ceramic coating, the 378-vehicle quote wizard
- **All Transport Party Bus Rentals** (Carrollton, OH) → event transportation

**The owner does NOT have client work in contractor, HVAC, landscaping, pressure washing, cleaning, pest control, or any other vertical.**

For pages targeting verticals where there is no client proof (`/contractor-websites`, `/hvac-websites`, `/landscaping-websites`):

- **Do NOT fabricate case studies, screenshots, testimonials, outcomes, or example sites.**
- **Do NOT invent client names, businesses, or quotes.**
- Frame the page around principles of lead generation in that vertical.
- Reference real client work as proof of execution capability, with explicit framing that the same conversion principles apply across service industries.
- It is acceptable — and honest — to say something like "While my recent local work has been in auto detail, barbershop, and event transportation, every site I build follows the same conversion principles that work for [contractors / HVAC companies / landscapers]."

If you're ever unsure whether a piece of content crosses the honesty line, leave it out. A shorter, honest page beats a longer, fabricated one.

---

## Design System (match the existing site)

- Background: `#0F0F10`
- Accent orange: `#FF7A1A`
- Body gray: `#B8B8BC`
- Headings: Montserrat
- Body: Inter
- Use the existing `SiteHeader` component (multi-page nav)
- Match structural patterns from `/web-design`, `/local-seo`, and `/custom-lead-systems`
- Primary CTA on every page: **`Get a Free Quote ↗`** linking to `/contact`
- Industry pages and the redesign page are depth pages — not homepage-style. They use the multi-page nav, not the homepage's minimal sticky header.

You have judgment freedom on:

- Mobile responsive breakpoints and layout
- Spacing rhythm matching existing sections
- Visual treatment of feature boxes, callouts, and proof sections
- Internal linking density and placement
- How "Industries we build for" surfaces on the homepage and `/web-design` (see Navigation section below)
- Any small inconsistencies you spot in existing pages while doing this work — fix and note

---

## PART 1 — Meta Title + H1 Updates on Existing Pages

### Homepage (`/`)

- **Current title:** `Designed to Elevate | Local Web Design & Lead Systems in Ohio`
- **New title:** `Small Business Web Designer in Ohio | Designed to Elevate`

**Reasoning:** "small business web designer" = 1K–10K monthly searches, low competition. "web design Zanesville" / "web design Coshocton" = 0–10 monthly. Pivoting to validated keyword. Geography is handled by Google Business Profile and LocalBusiness JSON-LD schema (already in place), not by keyword content.

- **H1 stays:** `Websites built to get found — and built to convert.` (brand line — do not change)
- **About section body copy:** weave in the phrase **"Designed to Elevate is a small business web designer based in Ohio"** naturally. Don't keyword-stuff — one natural placement.

### `/web-design`

- **Current title:** `Web Design for Local Service Businesses | Designed to Elevate`
- **New title:** `Small Business Website Design for Ohio Service Businesses | Designed to Elevate`
- **H1 update:** include "Small Business Website Design" naturally. Suggested direction: `Small business website design built around how local customers actually decide.` (Use this or a better variant — your call.)

### `/local-seo`

- **Keep title as-is.** Already targets validated keyword "local SEO for small business" (1K–10K monthly). No changes needed.

### `/custom-lead-systems`

- **Current title:** `Custom Quote & Booking Systems for Local Service Businesses | Designed to Elevate`
- **New title:** `Lead Generation Website Design for Service Businesses | Designed to Elevate`
- **H1 update:** include "Lead Generation Website Design" prominently. Keep "lead systems" language elsewhere in body so brand vocabulary is preserved.

---

## PART 2 — Build 7 New Pages

All pages target validated keywords. All use the design system above. All have a primary `Get a Free Quote ↗` CTA. All use the multi-page `SiteHeader`. Apply the honesty constraint where flagged.

### 1. `/website-redesign`

- **Primary keyword:** small business website redesign (1K–10K monthly, low competition)
- **Title:** `Small Business Website Redesign in Ohio | Designed to Elevate`
- **Hero headline:** `Your website should bring you customers — not embarrass you.`
  - This exact line is approved — pain-driven and on-brand.
- **Page intent:** "My current website is bad and I'm ready to replace it"

**Sections:**

- Hero with Free Quote CTA
- "Signs your website needs a redesign" — 5–7 problem signals (slow load, mobile broken, no leads, outdated look, hard to update, no clear CTA, doesn't rank, etc.)
- "What I rebuild and why" — process overview, with emphasis on conversion improvements not just visual refresh
- Recent work proof — link to existing case studies
- Pricing reference — link to homepage Pricing section
- Final CTA

### 2. `/barbershop-websites`

- **Primary keyword:** barbershop website design (10–100 monthly, low competition)
- **Title:** `Barbershop Website Design for Booking-Focused Shops | Designed to Elevate`
- **Hero headline:** `Barbershop websites built around booking and brand.`
- **Real proof available:** Modern Classic Barbershop (Zanesville, OH)

**Sections:**

- Hero with Free Quote CTA
- "What barbershops need from a website" (booking flow, brand identity, mobile-first, product integration)
- Modern Classic feature box with real screenshots and outcomes (Square booking integration, Shopify product line for MDRN Classic Grooming Essentials, brand unification across both businesses)
- Square / Shopify integration capability framed as repeatable for other shops
- Final CTA

### 3. `/auto-detail-websites`

- **Primary keyword:** auto detailing website design (10–100 monthly, low competition)
- **Title:** `Auto Detailing Website Design Built for Quote Requests | Designed to Elevate`
- **Hero headline:** `Detailing websites that turn curious visitors into quote requests.`
- **Real proof available:** Fitchin Auto Detail & Tint (Coshocton, OH)

**Sections:**

- Hero with Free Quote CTA
- "What detail shops need" (vehicle types, package complexity, lead capture, local SEO)
- Fitchin feature box highlighting the 378-vehicle quote system as the centerpiece
- Local SEO for service-area shops
- Final CTA

### 4. `/window-tint-websites`

- **Primary keywords:** window tint shop website design + window tint seo (10–100 monthly combined)
  - Note: "window tint shop website design" alone showed 0–10. "window tint seo" showed 10–100. Combine related variations naturally in body copy.
- **Title:** `Window Tint Shop Websites with Custom Quote Systems | Designed to Elevate`
- **Hero headline:** `Window tint websites built for vehicle-specific quote flows.`
- **Real proof available:** Fitchin Auto Detail & Tint — the 378-vehicle quote wizard

**Sections:**

- Hero with Free Quote CTA
- "What tint shops actually need" (vehicle complexity, film options, per-section pricing logic)
- Fitchin feature box — the 378-vehicle quote wizard is the centerpiece. Show how it handles split darkness selection, per-section logic, and live API pricing.
- Lead capture and booking flow with deposit, calendar, and confirmation
- Final CTA

### 5. `/contractor-websites` ⚠ HONESTY CONSTRAINT

- **Primary keyword:** contractor website design (1K–10K monthly, low competition — biggest single opportunity in the validated set)
- **Title:** `Contractor Website Design for Lead Generation | Designed to Elevate`
- **Hero headline:** `Contractor websites built around how homeowners actually decide.`

**HONESTY APPROACH:** No fabricated contractor proof.

- Lead with principles of contractor lead generation (trust signals, fast quote response, local SEO, mobile-first, before/after proof, license display)
- Reference real local work as proof of execution capability
- Be explicit that the same conversion principles apply across service industries
- Do NOT invent contractor case studies, testimonials, or example sites
- Do NOT generate fake screenshots of contractor websites

**Sections:**

- Hero with Free Quote CTA
- "How homeowners actually find and choose contractors" (Google searches, reviews, response time)
- "What separates contractor sites that book jobs from ones that don't" (principles)
- "How my work translates to contractor businesses" — link to real case studies (Fitchin, Modern Classic, All Transport) as execution proof
- Local SEO for contractors
- Final CTA

### 6. `/hvac-websites` ⚠ HONESTY CONSTRAINT

- **Primary keyword:** hvac website design (100–1K monthly, low competition)
- **Title:** `HVAC Website Design for Service Calls and Estimates | Designed to Elevate`
- **Hero headline:** `HVAC websites built to capture emergency calls and estimate requests.`

**HONESTY APPROACH:** Same as contractor page. No fake HVAC client.

**Sections:**

- Hero with Free Quote CTA
- "What HVAC sites need that generic websites miss" (urgency framing, service areas, emergency vs scheduled, financing options)
- "Principles that work" — link to real case studies as execution proof
- Local SEO for HVAC
- Final CTA

### 7. `/landscaping-websites` ⚠ HONESTY CONSTRAINT

- **Primary keyword:** landscaping website design (100–1K monthly, low competition)
- **Title:** `Landscaping Website Design for Quote Requests and Bookings | Designed to Elevate`
- **Hero headline:** `Landscaping websites built around how homeowners actually buy.`

**HONESTY APPROACH:** Same as contractor page. No fake landscaping client.

**Sections:**

- Hero with Free Quote CTA
- "What landscaping sites need" (visual portfolio, service areas, seasonal demand, project gallery)
- "Principles that work" — link to real case studies as execution proof
- Local SEO for landscapers
- Final CTA

---

## Navigation Updates

### Services Dropdown — add Website Redesign

**Current:**

- Web Design
- Google Ads Landing Pages
- Local SEO & Google Business
- Custom Lead Systems

**New:**

- Web Design
- **Website Redesign** ← NEW
- Google Ads Landing Pages
- Local SEO & Google Business
- Custom Lead Systems

### Industry Pages — NOT in top-level nav

The 6 industry pages (`/barbershop-websites`, `/auto-detail-websites`, `/window-tint-websites`, `/contractor-websites`, `/hvac-websites`, `/landscaping-websites`) should not clutter the main nav.

**Surface them via these channels — use your judgment on best UX:**

- A new "Industries" section on `/web-design` listing all 6 with short descriptions and links
- An "Industries we build for" block on the homepage (placement is your call — somewhere it doesn't disrupt existing flow). Suggested placement: between "What I Build" and the new Pricing section, or between Pricing and Featured Build.
- Internal links from case studies (e.g., Modern Classic case study links to `/barbershop-websites`, Fitchin case study links to `/auto-detail-websites` and `/window-tint-websites`, All Transport links to a future page or stays decoupled)

You have full freedom on the visual treatment of "Industries we build for" — could be a grid, a list, badges, cards, etc. Match the existing design system.

---

## Final Authority Granted

You have authority to:

1. **Adjust hero headlines** if you find a stronger variant on the day. The headlines above are approved starting points — improve them if you can.
2. **Reorganize section order** within any page if it improves flow.
3. **Add or trim sections** if a page would benefit. Don't pad — but if a page feels thin, add what's missing (FAQ, process, social proof framing, etc.).
4. **Choose visual treatment** for feature boxes, proof sections, internal links, and the "Industries we build for" block.
5. **Fix any inconsistencies** you spot in existing pages while doing this work (broken anchors, missing alt text, awkward mobile breakpoints, schema validation errors). Fix and note in verification.
6. **Make any small homepage updates** needed to support new internal linking from industry pages back to the homepage Pricing section, About section, or case studies.
7. **Decide breakpoint behavior** for mobile responsive layouts.
8. **Add any internal links** that strengthen overall site authority — case study cross-links, service-page cross-links, etc.

You do NOT have authority to:

1. Fabricate any client proof, testimonials, screenshots, outcomes, or case studies for verticals where the owner has no client work (contractor, HVAC, landscaping, pressure washing, cleaning, pest control).
2. Change pricing on the homepage Pricing section (those are locked: $1,500 / $3,000 / $5,000).
3. Change the primary CTA phrase. It is **`Get a Free Quote ↗`** site-wide. Do not vary it.
4. Add the industry pages to the top-level nav. Surface them via the channels described above.

---

## Verification (do not screenshot — cat the relevant content)

### Part 1 verification

- Updated `<title>` tag on `/` (homepage)
- Updated `<title>` tag on `/web-design`
- Confirmation that `/local-seo` title is unchanged
- Updated `<title>` tag on `/custom-lead-systems`
- Updated H1s where applicable
- Confirmation that "small business web designer" phrase appears naturally in homepage About section

### Part 2 verification

- Each new page's `<title>` tag and H1
- Confirmation that honesty constraint is met on `/contractor-websites`, `/hvac-websites`, `/landscaping-websites` — no fabricated proof
- Confirmation that `Get a Free Quote ↗` CTA is on every new page
- Confirmation that pages match design system (colors, fonts, structure)
- Services dropdown now includes Website Redesign
- Industry pages surfaced visibly but NOT in main top-level nav
- A summary of where industry pages are linked from (homepage section, `/web-design` section, case studies)

### Final summary

- A brief executive summary at the top: "What changed, what shipped, what's now consistent across the site"
- Any judgment calls made beyond the spec, with reasoning
- Any inconsistencies fixed in existing pages, with reasoning
- Any sections trimmed or added beyond the spec, with reasoning

Ship clean. Ship honest. Ship something that holds up to a buyer reading every word.
