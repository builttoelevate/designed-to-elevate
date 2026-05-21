# Designed to Elevate — Post-Build Audit: Local SEO Safety + Page Quality

## Strategic Context (read before starting)

The 7 new pages and meta title updates have shipped. This audit is a quality and safety pass over the work. The goal is to confirm three things:

1. **Local Google ranking signals are intact.** Nothing that drives local pack visibility — verified business info, schema, geographic mentions, internal links — was accidentally stripped, broken, or weakened during the page build.
2. **The pages aren't thin SEO doorways.** Each new page reads as something a real shop owner would find useful, not a template with industry words swapped.
3. **The full site is free of any Google penalty triggers.** Every page on the site is scanned for keyword stuffing, hidden text, cloaking, doorway content, misleading claims, duplicate content, broken links, and 12 other penalty risk categories. The site is launching from a clean foundation.

You have full authority to make final calls throughout this audit. Where the spec is unclear, where you spot something better, where a small fix improves quality or safety — make the call. The owner trusts your judgment as the developer with the code in front of you. Document anything you change in verification so the reasoning is visible.

If you find a genuine concern (a critical signal stripped, fabricated proof slipped in, a page that reads as low-quality filler, hidden text, cloaking, or any serious penalty trigger), flag it clearly at the top of verification rather than burying it.

---

## How Google Local Ranking Actually Works (the why behind this audit)

Google's local pack ranks businesses by:

- **Relevance** — does the business match what the searcher wants?
- **Distance** — how close is the business to the searcher?
- **Prominence** — how trusted and known is the business?

These are driven by:

- A verified, complete Google Business Profile
- Reviews (count, recency, response rate)
- Citations and NAP consistency (name, address, phone)
- LocalBusiness schema markup
- Geographic mentions in body copy and case studies
- Local backlinks
- Internal linking structure
- Domain authority and content depth

**Website meta titles and keyword content are supporting signals, not primary drivers of local pack ranking.** The recent meta title pivot from "[city] Ohio" keywords to "small business" keywords does not — by itself — affect local pack visibility. What WOULD affect local pack visibility is if the build accidentally stripped LocalBusiness schema, removed phone number consistency, deleted geographic references, or broke citation NAP. This audit checks for those exact failure modes.

---

## Part 1 — Local SEO Safety Audit

Verify each of the following. If anything is missing, broken, or weakened, restore it. Use your judgment on the cleanest restoration approach.

### 1. LocalBusiness JSON-LD Schema

- Confirm schema is present on the homepage and valid JSON
- Confirm it includes all 6 Ohio cities: Coshocton, Zanesville, Newark, Cambridge, Mount Vernon, Carrollton
- Confirm business name "Designed to Elevate" is correct
- Confirm phone (740) 617-6488 is present
- Confirm email bilsonxnc@gmail.com is present (if previously included)
- Confirm URL designedtoelevate.co is present
- Validate JSON syntax — no broken brackets, missing commas, or trailing characters that would invalidate the schema

If schema is missing or broken, restore it using the original 6-city configuration as the baseline. If you can improve the schema (add aggregateRating placeholder for future reviews, add sameAs links to social profiles if any exist, etc.), do so — your call.

### 2. Phone Number Consistency

- Confirm (740) 617-6488 appears identically everywhere it shows up
- Format must be consistent across the entire site
- Acceptable format: (740) 617-6488
- Unacceptable: mixing formats like 740.617.6488 or 740-617-6488 in different places

If you find inconsistencies, normalize all instances to (740) 617-6488. NAP consistency is a top citation signal for Google.

### 3. Email Consistency

- Confirm bilsonxnc@gmail.com appears identically everywhere
- Same logic as phone — normalize any inconsistencies

### 4. Footer Geographic Signals

- Footer should reference Ohio service area
- Should mention "Ohio" or specific cities served
- If the footer was simplified during the build and lost geographic context, restore appropriate geographic mentions

You have judgment on the exact wording. Aim for natural, not stuffed. Examples of good footer geographic context: "Serving local service businesses across Ohio," "Based in Ohio. Working with shops in Coshocton, Zanesville, Newark, and surrounding communities," etc.

### 5. Homepage About Section

- Confirm "Designed to Elevate is a small business web designer based in Ohio" or natural variant is present
- Confirm Ohio service area is mentioned
- Confirm the 6 city names appear somewhere in homepage content (in About section, service area mention, case study cards, or footer — they don't all need to be in one section)

If the About section reads stilted, rewrite for natural flow while preserving both the keyword phrase and the geographic mentions.

### 6. Case Study City References

- /case-studies/fitchin-auto-detail-tint should reference Coshocton, OH
- /case-studies/modern-classic-barbershop should reference Zanesville, OH
- /case-studies/all-transport-party-bus should reference Carrollton, OH

These city mentions are critical local relevance signals. If any are missing or were softened during the build, restore them.

### 7. New Industry Pages — Geographic Signal Check

For each of the 7 new pages (/website-redesign, /barbershop-websites, /auto-detail-websites, /window-tint-websites, /contractor-websites, /hvac-websites, /landscaping-websites):

- Confirm Ohio is mentioned naturally somewhere in body copy
- Confirm at least one specific city (Coshocton, Zanesville, Newark, etc.) appears where natural — typically in a service area reference, a "based in Ohio" line, or via case study links
- Do NOT force city names into titles or H1s — keep them in body copy
- Do NOT keyword stuff. Natural mentions only.

If any new page has zero geographic mentions, add a natural reference. Use judgment on placement — could be a service area line, a "Based in Ohio" footer-style mention, or a contextual reference like "Auto detail shops across Ohio face the same conversion challenge..."

### 8. Robots / Indexing Check

- Confirm /grow has noindex meta tag (paid traffic landing page)
- Confirm /brochure has noindex meta tag (printable HTML)
- Confirm all 7 new pages are indexable (no accidental noindex)
- Confirm sitemap.xml (if present) includes all 7 new pages
- Confirm robots.txt (if present) doesn't block any of the new pages

Fix any indexing issues you spot.

### 9. Internal Linking Audit

- New industry pages should link back to the homepage at least once
- New industry pages should link to relevant case studies
- Modern Classic case study should link to /barbershop-websites
- Fitchin case study should link to /auto-detail-websites and /window-tint-websites
- /custom-lead-systems should link to /auto-detail-websites and /window-tint-websites (those are the strongest quote-system examples)

If links are missing, add them. Use natural anchor text, not keyword-stuffed anchors. Example of good anchor: "see how we built this for Modern Classic Barbershop in Zanesville." Example of bad anchor: "barbershop website design Ohio."

### 10. Canonical Tags

- Confirm each new page has a canonical tag pointing to itself
- Confirm no duplicate content issues from accidentally serving the same page at multiple URLs

---

## Part 2 — Page Quality Audit

The biggest risk with shipping 7 industry pages at once is that they all read as the same template with industry words swapped. Google views that as low-quality doorway content. This part of the audit checks for that.

### 1. Distinctness Check

Compare /contractor-websites, /hvac-websites, and /landscaping-websites side by side. Each must have at least one section that could not belong on the other two.

If they share the same structure with only industry words swapped, rewrite the weak sections to reflect genuinely different buyer psychology:

- **Contractor**: trust signals, before/after proof, license/insurance display, financing options, project galleries, review placement, service area pages
- **HVAC**: urgency framing (urgent repairs vs scheduled estimates), seasonal demand spikes, replacement vs repair decision factors, financing options, mobile click-to-call patterns, after-hours considerations
- **Landscaping**: visual portfolio depth, project galleries by type, seasonal timing (spring cleanup, summer maintenance, fall prep), recurring maintenance plan structures, lawn care vs hardscaping vs design distinctions

You have full authority to rewrite any section that reads generic. If a page needs more substance, add it. If a section is filler, cut it. The goal is each page being genuinely useful to the specific buyer it's targeting.

### 2. No Fabricated Proof Check

On /contractor-websites, /hvac-websites, and /landscaping-websites:

- Confirm zero fabricated client names, businesses, testimonials, or screenshots
- Confirm zero specific outcome numbers ("increased leads by X%", "boosted bookings by Y", "drove $Z in revenue") that cannot be backed by real data
- Confirm references to real case studies (Fitchin, Modern Classic, All Transport) are framed as "execution capability" rather than "we did this for contractors/HVAC companies/landscapers"

The ONLY specific number permitted across these three pages is the 378-vehicle Fitchin quote system, which is a real product spec — and it should only appear if Fitchin is being referenced as an execution example.

If you find any fabricated proof, remove it. A shorter, honest page beats a longer page with invented credibility.

### 3. Content Depth Check

Each page should have:

- A clear hero with a specific headline (not generic "We build great websites")
- At least 3 distinct content sections with substance
- At least one piece of guidance or insight specific to that industry that a shop owner would find genuinely useful
- A clear CTA (Get a Free Quote ↗)

If any page feels under ~400 words of meaningful body content, expand it with industry-specific guidance — not filler. Use judgment on what additions strengthen the page.

### 4. FAQ Section Decision

You have authority to add an FAQ section to any of these pages if it strengthens depth and captures long-tail searches:

- /website-redesign
- /contractor-websites
- /hvac-websites
- /landscaping-websites
- /custom-lead-systems

Rules if you add FAQs:

- 3 to 5 questions max per page
- Each question must be one a real buyer in that vertical would actually ask
- No generic filler questions like "Why is web design important?"
- Answers should be honest and specific
- No fabricated outcomes or statistics in answers

If FAQs would strengthen the page, add them. If they'd feel like filler, skip.

### 5. /custom-lead-systems Positioning Check

Confirm this page still positions custom quote systems and booking flows as the specialty.

If the title shipped as "Lead Generation Website Design for Service Businesses | Designed to Elevate" and the page now reads as generic "lead generation" rather than emphasizing the differentiator, consider updating to:

`Lead Generation Websites with Custom Quote Systems | Designed to Elevate`

Use judgment on whether the body copy still emphasizes the differentiator (the 378-vehicle wizard, custom booking flows, integrations) or got genericized during the build. If it lost specificity, restore it.

### 6. CTA Consistency

- Confirm "Get a Free Quote ↗" is the primary CTA on every new page
- No variations like "Get a Custom Quote", "Start a Conversation", or "Contact Me" as primary buttons
- The phrase must match site-wide

### 7. Hero Headlines Quality Pass

Review the hero headlines on each new page. If any feel generic or weaker than they could be, you have authority to improve them. Approved starting points were:

- /website-redesign: "Your website should bring you customers — not embarrass you."
- /barbershop-websites: "Barbershop websites built around booking and brand."
- /auto-detail-websites: "Detailing websites that turn curious visitors into quote requests."
- /window-tint-websites: "Window tint websites built for vehicle-specific quote flows."
- /contractor-websites: "Contractor websites built around how homeowners actually decide."
- /hvac-websites: "HVAC websites built to capture emergency calls and estimate requests." (Note: only use "emergency" framing if appropriate; consider "urgent repair calls and scheduled estimates" as a more universally applicable variant)
- /landscaping-websites: "Landscaping websites that turn project interest into quote requests." (consider this revised version vs. the original "built around how homeowners actually buy")

Improve any that read flat. Don't change what's already strong.

---

## Part 3 — Full-Site Google Penalty Risk Audit

Beyond the new pages, scan **every page on the site** for anything that could trigger a Google manual action, algorithmic penalty, or quality demotion. This is a defensive sweep — the goal is to confirm the site has zero penalty exposure before traffic builds.

Pages to audit (the full current site):

- /
- /about
- /contact
- /web-design
- /local-seo
- /custom-lead-systems
- /google-ads-landing-pages
- /case-studies
- /case-studies/fitchin-auto-detail-tint
- /case-studies/modern-classic-barbershop
- /case-studies/all-transport-party-bus
- /website-redesign
- /barbershop-websites
- /auto-detail-websites
- /window-tint-websites
- /contractor-websites
- /hvac-websites
- /landscaping-websites
- /privacy
- /terms
- /refund
- /grow (noindex'd, but still audit content)
- /brochure (noindex'd, but still audit content)

For each page, check for the following penalty risk categories. If you find any issue, fix it and document what was wrong and what you did.

### 1. Keyword Stuffing

Google penalizes pages that repeat the same keyword unnaturally. Look for:

- Same keyword phrase appearing 5+ times in close proximity
- Keyword phrases stuffed into meta descriptions or title tags awkwardly
- Locations stuffed into copy: "web design Coshocton, web design Zanesville, web design Newark, web design Cambridge..." style listing
- H1, H2, and H3 headers all containing the same primary keyword
- Footer or sidebar text packed with city names or service keywords

Fix any keyword stuffing you find. Replace with natural, varied language. Synonyms are good — repetition of the exact phrase is the trigger.

### 2. Hidden Text or Hidden Links

These are clear penalty triggers. Look for:

- Text styled the same color as the background
- Text positioned off-screen via CSS (text-indent: -9999px, position: absolute with negative offsets)
- Text hidden via display: none or visibility: hidden that contains keywords
- Tiny font sizes (under 8px) used to cram keywords
- Links with no anchor text or single-character anchors used to manipulate link signals

Fix any hidden text or hidden links by either making them visible or removing them entirely.

### 3. Doorway / Thin Content Pages

Google penalizes pages built solely to rank for keywords that don't add real value. Beyond the new industry pages already audited in Part 2, check:

- Are any existing pages thin (under 300 words of meaningful body copy)?
- Are there pages that exist only to target a keyword variation without substance?
- Does any page read as "copy-paste with industry/city swapped"?

If you find thin pages, either expand them with genuine content or recommend they be merged or removed. Don't delete pages without flagging — note the recommendation in verification.

### 4. Cloaking

Cloaking is showing different content to Googlebot vs human visitors. Confirm:

- No user-agent-based content switching exists
- No JavaScript-rendered content differs significantly from the HTML served
- No redirects based on user agent

If any cloaking patterns exist, remove them. This is one of the fastest ways to trigger a manual action.

### 5. Sneaky Redirects

Google penalizes deceptive redirects. Confirm:

- All redirects are 301 (permanent) or 302 (temporary) where appropriate
- No redirects send mobile users to different content than desktop users
- No redirects send organic search visitors to different content than direct visitors
- The known redirects (/work → /case-studies, /pricing → /custom-lead-systems) work correctly

### 6. Unnatural Outbound Linking

Google can penalize sites with patterns of paid or manipulative outbound links. Confirm:

- All outbound links are to legitimate sources (no link farms, low-quality directories, or pay-per-link schemes)
- Affiliate links (if any) use rel="sponsored" or rel="nofollow"
- No comment or footer link sections accept user-generated outbound links

### 7. Duplicate Content

Google demotes duplicate content. Check:

- No two pages serve substantially the same content
- Service pages (/web-design, /local-seo, /custom-lead-systems, /google-ads-landing-pages) each have unique angles
- Industry pages don't share more than 30-40% identical body copy
- Case study pages don't recycle large blocks of text from each other

If you find duplicate or near-duplicate content, rewrite one version to be substantially different.

### 8. Mobile Usability

Google's mobile-first indexing means mobile issues hurt rankings. Confirm:

- All pages render correctly on mobile (~380px viewport)
- Buttons and tappable elements are at least 44x44px
- Text is readable without zooming
- No horizontal scrolling on standard mobile viewports
- Forms work correctly on mobile
- The new industry pages are fully mobile-responsive (not just desktop-tested)

Fix any mobile usability issues.

### 9. Page Speed Signals

Slow pages get demoted. While full Lighthouse audits aren't possible here, check:

- No oversized images (>500KB) without lazy loading
- No unminified CSS or JS in production
- No render-blocking scripts in <head> that could be moved or deferred
- Images use modern formats (WebP) where possible
- No external scripts loading from slow third-party CDNs

Note any obvious performance issues. Fix what you can; document what would need a separate optimization pass.

### 10. Broken Links and 404s

A site full of broken links signals low quality. Check:

- All internal links return 200 OK
- All external links resolve (or are removed if broken)
- No links point to pages that no longer exist
- The redirects (/work, /pricing) still work

Fix or remove broken links.

### 11. Duplicate Meta Tags

- Confirm no two pages share the same <title> tag
- Confirm no two pages share the same meta description
- Each page should have unique, descriptive metadata

### 12. Spammy Structured Data

Google penalizes misleading schema markup. Confirm:

- LocalBusiness schema accurately represents the business (no fake reviews, fake aggregate ratings, fake awards)
- No schema markup describes content that doesn't appear on the page (e.g., FAQ schema without visible FAQs)
- Review schema (if added) only includes real reviews
- Service schema accurately represents what's actually offered

If any schema describes content not actually present on the page, remove the false schema or add the missing content.

### 13. Misleading Claims

Google's quality guidelines penalize misleading content. Confirm:

- No claims of "#1 web designer in Ohio" or similar superlatives that can't be substantiated
- No fake testimonials, fake awards, or fake certifications
- No "as seen on" media logos that aren't real
- No claims of partnerships, affiliations, or memberships that don't exist

### 14. Affiliate or Auto-Generated Content

Confirm:

- No auto-generated content (AI-spun articles, content farms)
- No affiliate-only pages with thin content wrapped around outbound links
- All content reads as genuinely written for the business and audience

### 15. Standard Housekeeping (rolled into this audit)

While doing the penalty sweep, also fix:

- Broken anchor links
- Missing alt text on key images
- Schema validation errors
- Inconsistent header/footer across pages
- Any place where "Free Website Review" wasn't replaced with "Get a Free Quote ↗"
- Inconsistent design system application (wrong colors, fonts, or spacing)
- Any other small inconsistencies that could affect Google's perception of site quality

---

## Final Authority Granted

You have authority to:

1. **Rewrite any section** that reads generic, thin, or template-like
2. **Add or remove sections** to improve page quality, depth, or distinctness
3. **Improve hero headlines** if you find stronger variants
4. **Add FAQ sections** to strengthen depth and long-tail capture
5. **Update titles or H1s** if a stronger variant improves both SEO and brand
6. **Fix any inconsistencies** spotted during the audit
7. **Add internal links** that strengthen topical authority and local relevance
8. **Add geographic mentions** to pages that lack them (naturally, not stuffed)
9. **Adjust footer or About section copy** to restore lost geographic signals
10. **Make any small homepage updates** needed to support the audit findings
11. **Remove or rewrite any content** that triggers a Google penalty risk (keyword stuffing, hidden text, doorway content, misleading claims, etc.)
12. **Fix mobile responsive issues** on any page across the site
13. **Update or remove broken links, redirects, and 404s** anywhere on the site

You do NOT have authority to:

1. Fabricate client proof, testimonials, screenshots, outcomes, or case studies for verticals where the owner has no client work (contractor, HVAC, landscaping, pressure washing, cleaning, pest control)
2. Change pricing on the homepage Pricing section ($1,500 / $3,000 / $5,000 stays locked)
3. Change the primary CTA phrase from "Get a Free Quote ↗"
4. Add the industry pages to the top-level navigation
5. Remove the LocalBusiness schema or weaken any geographic signals — only restore or strengthen them
6. Make changes that would risk Google penalties (keyword stuffing, hidden text, doorway content)

---

## Verification

When the audit is complete, output the following.

### Part 1 Local SEO Safety — Checklist Format

```
✅ LocalBusiness schema intact with 6 cities, valid JSON
✅ Phone (740) 617-6488 consistent everywhere
✅ Email bilsonxnc@gmail.com consistent everywhere
✅ Footer mentions Ohio service area
✅ Homepage About section has "small business web designer based in Ohio"
✅ Homepage references all 6 cities somewhere
✅ Case studies reference correct cities (Coshocton, Zanesville, Carrollton)
✅ All 7 new pages mention Ohio naturally
✅ All 7 new pages reference at least one specific Ohio city
✅ /grow and /brochure remain noindex
✅ All 7 new pages are indexable
✅ Sitemap (if present) includes new pages
✅ Internal linking between case studies and industry pages
✅ Canonical tags on all new pages
```

If any item is ❌ or ⚠️, describe what was wrong and what you did to fix it.

### Part 2 Page Quality — Narrative Format

For each of the 7 new pages, briefly describe:

- What was already strong
- What was generic or weak (if anything)
- What you rewrote or added
- Whether the page is now genuinely distinct from the others

Specifically address:

- Are /contractor-websites, /hvac-websites, /landscaping-websites distinct from each other?
- Was any fabricated proof found and removed?
- Was the /custom-lead-systems title updated, and why or why not?
- Were FAQ sections added to any pages, and which ones?

### Part 3 Penalty Risk Audit — Checklist Format

For each of the 15 risk categories, output ✅ Clean or ⚠️ Issue Found. If issues were found, describe what was wrong and what you did to fix it. Pages should be referenced by URL when relevant.

```
✅ Keyword stuffing: clean across all pages
✅ Hidden text or links: none found
✅ Doorway / thin content pages: all pages have substance
✅ Cloaking: none detected
✅ Sneaky redirects: all redirects clean and legitimate
✅ Unnatural outbound linking: clean
✅ Duplicate content: pages are distinct
✅ Mobile usability: all pages responsive
✅ Page speed signals: no major issues found / [list any]
✅ Broken links and 404s: all internal links resolve
✅ Duplicate meta tags: each page has unique title and description
✅ Spammy structured data: schema accurately represents content
✅ Misleading claims: no fake testimonials, awards, or superlatives
✅ Affiliate or auto-generated content: all content is genuine
✅ Standard housekeeping: small inconsistencies fixed
```

For any ⚠️, describe what was wrong, what page(s) were affected, and what you did to fix it.

### Executive Summary

Four sentences at the top of the verification:

1. "Site is local-SEO-safe because [your reasoning]."
2. "Pages are distinct and honest because [your reasoning]."
3. "Site has zero / low / moderate / high penalty risk because [your reasoning across the 15 categories]."
4. "Recommended next steps for ongoing SEO health: [your top 1-3 recommendations]."

If anything genuinely concerning surfaced during the audit (a critical signal stripped, fabricated proof slipped in, a page that reads as low-quality filler, hidden text, cloaking, or any of the more serious penalty triggers), flag it clearly at the top of the verification rather than burying it.

Ship clean. Ship honest. Ship something that holds up to a buyer reading every word — and to Google's quality algorithms reviewing every signal.
