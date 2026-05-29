# Google Ads Landing Page — Build & Verification Checklist
### Auto Detailing · Ceramic Coating · Window Tint · PPF — quote-system pages only (Designed to Elevate)

> ## ⚠️ SCOPE GUARD — READ FIRST (Claude Code)
> **This checklist is ONLY for automotive appearance & protection landing pages** where pricing is variable by vehicle and the conversion is a *quote / captured lead*. Before using it, confirm the page being built is in the IN-SCOPE list. **If it is not, STOP — do not adapt this checklist to fit.** Tell the operator:
> *"Heads up — this is the DETAIL_TINT quote-page checklist, scoped to auto detailing, ceramic, window tint, and PPF. The page you're pointing me at is [X], which is out of scope. You probably want a different checklist. Want me to flag the right one or build one?"*
>
> **✅ IN SCOPE (use this file):**
> - Auto detailing / interior + exterior detailing
> - Ceramic coating
> - Window tint (automotive film)
> - Paint protection film (PPF / clear bra)
>
> *These four share the same Fitchin DNA: per-vehicle/variable pricing, tier logic, and a "what's it cost?" buying motion that ends in a quote → text → book handoff.*
>
> **❌ OUT OF SCOPE → use a different checklist:**
> - **Other variable-quote service niches** (contractors, roofing, HVAC, fencing, concrete, pressure washing, vinyl wraps, powder coating, mobile mechanic, auto glass, landscaping, junk removal/moving, tree service, pool service) → use the **general quote-page checklist** (`QUOTE_PAGE_CHECKLIST.md` — planned). The bones are ~90% the same, but the niche examples here are auto-specific.
> - **Fixed-price / appointment-based services** (barbershop, salon, nails, lashes, massage) → use the **booking-page checklist** (`BOOKING_PAGE_CHECKLIST.md` — planned). These convert on *booking a time*, not pricing a job; the quote-wizard spine below does not apply.
>
> If unsure whether a niche fits, apply the test: **does the price change job-to-job, and is "get a quote" the natural first action?** Yes on both → this checklist (if it's one of the four IN-SCOPE automotive niches) or the general quote checklist. No → booking checklist.

---

**Purpose:** A drop-in spec for building or hardening a single paid-traffic landing page for an auto detailing, ceramic, tint, or PPF business, whose one job is to convert a Google Ads click into a qualified quote/lead.

**How to use this (Claude Code):**
- Confirm the page is IN SCOPE (see Scope Guard above) before anything else.
- Treat each `[ ]` as an acceptance criterion. Implement it, then verify it.
- **Verify by code inspection, `curl`, or Lighthouse CLI — never by screenshot.** Confirm copy/markup by reading the files; confirm performance with measured numbers; confirm behavior by describing what the code does.
- This is goal-oriented. Where copy is specified, treat it as a *pattern/example* to adapt to the specific niche (detailing vs. tint vs. ceramic vs. PPF), not literal text to paste.
- A/B testing is intentionally **out of scope** — one version ships first. Tracking is in scope so data exists for testing later.

**Before building, confirm these inputs are decided** (ask the operator if any are unknown — they drive every copy choice below):
- [ ] **Target keyword / ad group** this page receives (e.g., "auto detailing website design," "window tint website")
- [ ] **Audience** in one line (e.g., "auto detailing & ceramic shop owners," "window tint shop owners")
- [ ] **Awareness stage** of that ad group — *Problem-Aware* (they feel the pain, don't know the fix → lead with the problem) or *Solution-Aware* (they've seen quote tools → lead with the mechanism). This decides the hero hook.
- [ ] **One big promise** (e.g., "turn ad clicks into quote requests before they bounce")
- [ ] **One primary CTA** for the whole page (everything else is secondary)

**Then pick ONE page type** — the page must not sell all four equally. Every section supports the one chosen angle:
- [ ] **Niche service page** — "Auto detailing websites" / "Window tint websites" (default for most ad groups)
- [ ] **Offer page** — "Quote system for detail & tint shops"
- [ ] **Local-SEO/ads page** — "Landing pages for detail & tint shops"
- [ ] **Case-study-led page** — "See how Fitchin's system works"

**Brand thesis — the spine of every page:** *"Most websites stop at the click. We build the path after it."* This positions Designed to Elevate as a conversion-system builder, not another website vendor. Every section should ladder back to it.

---

## 1. MESSAGE MATCH (highest-impact — do this first)
Raises conversion *and* Quality Score (lower CPC) simultaneously. Mismatched/homepage traffic converts ~4–5x worse.

- [ ] H1 mirrors the ad headline and contains the target keyword. (Ad: "Auto Detailing Website Design" → H1 leads with auto detailing websites, not "Websites That Grow Local Businesses.")
- [ ] The ad's specific promise is delivered in the first viewport (price/quote system, code ownership, etc.).
- [ ] This page serves **one** ad group / niche. Don't merge detailing and tint ads onto one page if they have separate ad groups — match each to its own. No paid clicks land on the homepage or a generic multi-service page.
- [ ] Page answers in ~5 seconds, above the fold: *Who is this for? What do you build? Why is it different? What result? What do I do next?*
- [ ] **AI Max note:** keep the page content-rich and specific (services, vehicle logic, tier names, use cases, proof). Google's AI reads page content to decide which searches trigger the ad — do not strip it to a bare squeeze page.

---

## 2. CANONICAL PAGE STRUCTURE
Build the page in this order (this is the proven persuasion arc — Problem → Cost → New Way → Proof → Offer → Close):

1. Hero
2. Problem (pain cards)
3. Old way vs. new way (contrast)
4. "What happens after the click?" (flow visual)
5. What you get (outcomes-first deliverables)
6. Proof (case study + real screens)
7. How it works (simple steps)
8. Fit check (good fit / not a fit)
9. Offer + pricing
10. Risk reversal (ownership / no lock-in)
11. FAQ (objection handling)
12. Final CTA

---

## 3. HERO
The hero wins or loses the click. Formula: **For [audience], we build [mechanism] that helps [result] without [frustration].**

- [ ] **Eyebrow:** names the audience (e.g., "Auto Detailing + Ceramic Websites" / "Window Tint Websites")
- [ ] **H1:** outcome + mechanism, message-matched, keyword-bearing. Clear over clever.
  - Problem-Aware example (detailing): *"Auto Detailing Websites That Quote the Job Before the Customer Calls Another Shop"*
  - Solution-Aware example (detailing): *"A Detailing Website With a Real Quote System — Priced by Vehicle, Texted to Your Phone"*
  - Tint example: *"Window Tint Websites That Price the Job by Vehicle and Film Tier — Before the Customer Bounces"*
- [ ] **Subhead:** one sentence naming the mechanism in plain English (guided quote flow → prices by vehicle/film tier → captures the lead → texts the quote to book).
- [ ] **Primary CTA** visible without scrolling.
- [ ] **Secondary CTA** present but visually subordinate (ghost button, lower contrast).
- [ ] **Hero visual** = the actual product (live phone mockup of the quote flow), not generic stock.
- [ ] **Micro-trust line** under the CTA: e.g., "You own the code · Quote system included · 3–5 week build."
- [ ] **A proof element in the hero** if possible: "Live in Production" badge, star rating, review count, or "Built for [real shop]."

---

## 4. PROBLEM SECTION (pain cards)
Pain-led copy is correct for this buyer — they're frustrated, not casually shopping. Hook with pain, agitate the *cost*, bridge to the fix. Don't wallow.

- [ ] Headline frames the gap (e.g., "Your website should do more than describe your services.")
- [ ] **3–4 pain cards max.** Each follows: **Title (what they recognize) → Body (how it costs money/time) → implicit bridge (why a quote path fixes it).**
- [ ] Each pain is **specific**, tied to lost money/time — not "your site is outdated."

Pattern to adapt:
> **Your contact form is a dead end.** Most customers don't want to "request info" — they want a price, the right package/film tier, and a next step. Make them wait for a callback and they book the shop that gave them clarity first.

Pain bank for this niche: phone tag from every form submission · layered pricing a flat form can't handle (vehicle size, condition, ceramic tier, film tier) · the lead vanishes the second they leave · premium work shown on a generic, slow site · wasted ad spend on clicks with no next step.

---

## 5. OLD WAY vs. NEW WAY (contrast block)
Justifies costing more than a $500 template. Two columns, side by side.

- [ ] Render as an explicit two-column comparison.

**A normal website:**
- Lists services, shows a gallery
- Ends at a contact form
- Leaves quoting to your phone
- Loses visitors who wanted a price

**A Designed to Elevate quote system:**
- Guides the customer by service
- Shows packages / ceramic & film tiers and prices by vehicle
- Captures the lead before they leave
- Texts quote details to the shop to book

---

## 6. "WHAT HAPPENS AFTER THE CLICK?" (flow visual)
The product's value is invisible (it's a *system*, not pages) — make it tangible.

- [ ] Render a simple horizontal/stepped flow (lightweight SVG or styled divs — no heavy library):
  **Google ad click → service-specific page → choose service/package/tier → guided quote path (prices by vehicle) → lead captured → booking / text handoff**
- [ ] Headline: "What happens after the click?"
- [ ] Keep it scannable on mobile (stacks vertically, no horizontal scroll).

---

## 7. WHAT YOU GET (outcomes first, features second)
Owners want booked jobs and fewer tire-kickers — not "Astro," "schema," or "conditional logic."

- [ ] Every item leads with the **outcome**, then names the feature underneath.
  - Outcome-first: *"Customers get a clear quote path instead of a dead-end form — and you get the lead before they disappear."*
  - Supported by: *"Behind the scenes: service-aware questions, vehicle logic, ceramic/film tiers, add-ons, partial-lead capture."*
- [ ] Deliverables covered: custom site/page · quote or booking flow · local SEO structure · mobile-first build · conversion tracking · code ownership/handoff · monthly support.
- [ ] No raw tech jargon in the customer-facing copy.

---

## 8. PROOF (place early — before skepticism sets in)
Proof should appear in the first third of the page and again near the offer. Peer-level proof converts best — a shop owner wants to hear from another shop owner.

- [ ] **Named case study with real numbers** (Fitchin): "378 vehicle configs priced," "Live in Production," PageSpeed/SEO scores. Lead with the metrics.
- [ ] **Real product screens**, captioned "Real screens from a live quote system — not a mockup."
- [ ] **Real customer testimonial with a result in it** (a quote from Eric that names a concrete outcome). Generic praise doesn't convert.
- [ ] **Operator credibility line:** "Built by someone who actually built and marketed a real detail/tint shop — not someone selling theory."
- [ ] **Placement rule:** put a testimonial **adjacent to the primary CTA**, not only in a siloed proof section. Same words, near the button, convert measurably better.
- [ ] Client logos (Fitchin, etc.) as a small trust bar after the hero.
- [ ] Avoid: stock-photo headshots, vague quotes, a suspiciously perfect 5.0 with no volume.

---

## 9. HOW IT WORKS (simple steps)
- [ ] 3–5 plain steps, e.g.: Review your site/goals → Map your service & quote path (vehicle + tier logic) → Build page + system → Launch & track → Improve on real data.
- [ ] Frame as "simple for your customer, powerful behind the scenes."

---

## 10. FIT CHECK (good fit / not a fit)
Counterintuitively raises conversion *and* lead quality — signals confidence and lets bad-fit leads self-deselect.

- [ ] Two columns.

**Good fit if:** you do quality detailing / ceramic / tint / PPF · pricing varies by vehicle, condition, package, or film tier · you're running or about to run Google Ads / GBP · you're tired of every quote becoming a phone call · you want the lead captured even when they don't call.

**Not a fit if:** you just want the cheapest template · your pricing can't be modeled · a basic contact form is genuinely all you need.

---

## 11. OFFER + PRICING (reduce uncertainty)
Hiding all pricing hurts conversion for comparison-shoppers. Show enough to anchor and filter tire-kickers — but only the **install** price. Care plans are sold on the call, not on the page.
**Authoritative source: `PRICING.md` — pull all numbers from the PUBLIC section. Internal pricing (care plans) never goes on the page.**

- [ ] Page reflects the **two product lines, six tiers** from `PRICING.md` → PUBLIC section.
- [ ] **Form/Wizard line** (shops keeping their site): T1 **$997** · T2 **$1,497** · T3 **$2,497** install.
- [ ] **Website line** (full site build): T1 **$1,497** · T2 **$2,497** · T3 **$4,497** install.
- [ ] Each tier card shows **install price only**, plus a small ownership note ("You own everything. No required monthly.").
- [ ] Timeline stated (Website 3–5 weeks · Form 1–3 weeks).
- [ ] Upgrade path stated (Form install credits against later Website tier).
- [ ] "Ballpark, not a contract" disclaimer on any estimate.
- [ ] If full pricing tables on the page feel too dense, present the **Form line and Website line as a side-by-side picker**, anchored on the question "Do you already have a website you're keeping?" — then surface the three tiers in the chosen line. Mirrors the wizard branching in §15.
- [ ] 🔒 **Care plans ($97 / $197 / $297 monthly) are INTERNAL only — do not render on public landing pages.** They're sold on the call, post-build. See `PRICING.md` → INTERNAL section for the structure and the sales script for explaining the tier differential.

Pattern (general anchor on the page): *"Add the wizard to your existing site from $997, or build a new site with the system from $1,497. You own everything, outright — no required monthly, cancel anytime, site is yours."*

---

## 12. RISK REVERSAL (ownership / no lock-in)
This is your strongest objection-killer — feature it, don't bury it.

- [ ] Explicit: "You own the code. Repo and domain in your name. Cancel the monthly anytime and the site keeps running. No platform lock-in."
- [ ] Contrast vs. Wix/Squarespace rent ("a locked template you'll never own").
- [ ] Hosting framed honestly: free tier for shops this size, so the fee covers the work, not the server.

---

## 13. FAQ (objection handling, no corporate fog)
Direct answers. Each FAQ is a silent objection neutralized. **Pull pricing from `PRICING.md`.**

- [ ] Cover at minimum: cost (with the real ranges — both product lines) · how long · do I own it · what if I cancel · works with my booking tool/POS · can you match my exact pricing (vehicle + tier) · do I need new logo/photos · helps with Google Ads · helps with local SEO · what if I already have a site · how is this different from Wix/Squarespace/WordPress · can I update prices later.
- [ ] **Add these FAQs specifically for the two-line structure:**
  - "Do I need a new website, or can you just add the wizard to mine?" — Both. Form line starts at $997 if you keep your site; Website line starts at $1,497 if we build it.
  - "Is there a monthly fee?" — No required monthly. You own your site outright. Optional care plans available if you'd rather not manage hosting and maintenance yourself — covered on the call.
  - "Can I start with the wizard and upgrade to a full site later?" — Yes. Original install credits against the new tier (see `PRICING.md` → "Upgrade path").
- [ ] 🔒 **Do NOT add a public FAQ about the $97 / $197 / $297 monthly tiers.** That conversation happens on the sales call, not on the landing page. See `PRICING.md` → INTERNAL → sales script.
- [ ] First item open by default; rest collapsed.
- [ ] Answers are specific and plain — no "we'd be happy to discuss your needs" filler.

---

## 14. CTA SYSTEM
One job, one primary action, repeated.

- [ ] **One primary CTA phrase** used consistently across the page. First-person + value, not the mechanical action.
  - Use one of: **"Get My Website Quote"** · **"See If My Shop Is a Fit"** · **"Build My Ballpark Estimate"** · "See My Price in 60 Seconds."
  - Avoid: "Submit," "Learn More," "Schedule a Consultation."
- [ ] Primary CTA repeats roughly every 1–2 screens of scroll, and again after each major persuasion section.
- [ ] Secondary CTAs (live example, case study) are visually subordinate — they must not compete with the primary.
- [ ] A secondary CTA must **support belief, not open a new decision path.** Good: "See Live Example," "Read the Fitchin Case Study." Bad: "View All Services," "About Us," "Browse Portfolio" — those send the visitor away from the one action.
- [ ] **Microcopy under the button** reduces fear: "Takes ~60 seconds. No spam, no pushy sales call." / "Bill replies within 24 hrs."
- [ ] Button uses a contrast color used **nowhere else** on the page; thumb-sized tap target.
- [ ] **Sticky mobile CTA** appears once the user scrolls past the hero.
- [ ] On this paid page, the full site nav is **stripped** — the header contains logo + the primary CTA only. No nav menu, no blog/portfolio links, no service dropdowns, no social icons above the footer. Every link that isn't the primary or an approved belief-supporting secondary is an exit leak.

---

## 15. LEAD FORM (multi-step quote wizard)
Every extra field costs conversions. Multi-step quote wizard is the preferred pattern (commitment/momentum; contact asked last). **The wizard must branch on product line so the estimate shown matches what the shop actually needs.**

### Required flow (in order)
- [ ] **Step 1 — Services they offer.** (Detailing · ceramic · tint · PPF · other.) Multi-select.
- [ ] **Step 2 — Product-line routing question.** This is what drives which tier set the shop sees at the end. Required answer, single-select. Suggested copy:
  > **"What do you need from us?"**
  > - *"Just the quote wizard added to my current site"* → routes to **Form line**
  > - *"A new website with the wizard built in"* → routes to **Website line**
  > - *"Not sure yet — show me both options"* → shows both lines side-by-side on the estimate step
- [ ] **Step 3 — Goals / what the system should do** (lead capture, sell tiers, take deposits, rank locally, work with my booking tool, etc.). Multi-select. Drives which tier *within* the routed line is recommended.
- [ ] **Step 4 — Timeline and budget.** Budget options **must adapt to the routed line:**
  - Form line: $0.5k–$1k · $1k–$2k · $2k–$3k · Not sure
  - Website line: $1k–$2k · $2k–$3k · $3k–$5k · Not sure
- [ ] **Step 5 — Estimate + contact.** Shows the recommended tier from the routed line, with the **install price only** (no monthly). All numbers pulled from `PRICING.md` → PUBLIC section. The wizard is part of the public page — care plans are introduced on the call, not in the estimate panel.

### Recommendation logic (how to pick the tier shown)
- **Form line routing:**
  - Goal includes "take deposits/online booking" → recommend **Form T3 ($2,497 install)**
  - Goal includes "auto review requests" but not booking → recommend **Form T2 ($1,497 install)**
  - Otherwise → recommend **Form T1 ($997 install)**
- **Website line routing:**
  - Goal includes "take deposits/online booking" or "everything Fitchin has" → recommend **Website T3 ($4,497 install)**
  - Goal includes "price jobs by vehicle / capture leads / sell tiers" → recommend **Website T2 ($2,497 install)**
  - If goals are minimal / they only want a fast new site → recommend **Website T1 ($1,497 install)** with a note that T2 is one upgrade away
- **"Not sure" routing:** show **Form T2 ($1,497 install) and Website T2 ($2,497 install) side by side** as the most common picks, with a one-liner under each ("for shops keeping their site" / "for shops building new").

### General wizard rules (apply to every step)
- [ ] Ask only what qualifies a first contact: **name + phone + email**; shop name optional. Cut anything you won't use.
- [ ] Each step is simple; deliver value (a ballpark) before asking for contact info.
- [ ] **Capture partial leads** — get contact a step *before* the final screen so abandons still land in the dashboard.
- [ ] Inline validation; large, thumb-friendly inputs on mobile.
- [ ] Confirmation state gives a clear next step (call/text now) — never dead-end on "thanks."
- [ ] Tell them what happens next at submission: "Bill reviews your answers and replies within 24 hrs."
- [ ] Estimate panel disclaimer: "Ballpark, not a contract. Bill will price the final build around your exact menu and answers before you commit."

---

## 16. COPY RULES (apply everywhere)
- [ ] Specificity beats adjectives — numbers and concrete scenarios ("a heavy-soil 3-row SUV isn't a Crystal+ sedan"; "a full windshield tint isn't two front doors").
- [ ] Write in the owner's voice; headlines can mirror their internal monologue ("Tired of every quote turning into a phone call?").
- [ ] Plain language, ~6th–8th grade reading level (they skim on a phone between jobs).
- [ ] One idea per section.
- [ ] Lead with the **mechanism**, not "we build great websites."
- [ ] **Skim test:** every section must read top-down on its own — headline communicates the point, subhead explains it, cards/bullets prove it. A visitor scanning on a phone should understand the whole page without reading a single full paragraph.

**Banned phrasing — do not use:**
- "Skyrocket your growth" / "10X your leads" / "Dominate your market"
- "Revolutionary AI-powered solution" / "stunning digital experiences"
- "Your one-stop shop for web design and marketing"
- "We help businesses grow" as the main message
- Fake scarcity, guaranteed-leads claims (unless genuinely guaranteed), inflated numbers

**Best master angle for the brand:** *"Most websites stop at the click. We build the path after it."* Strong candidate for the hero or final CTA.

---

## 17. TECHNICAL — SPEED, MOBILE, QUALITY SCORE
Paid traffic means you pay for the click before the page converts. Slow = wasted spend.

- [ ] **Load time: under 1s ideal, 3s hard launch max.** Verify with Lighthouse CLI / measured timing, not impression. (Rationale for the gate: on paid traffic you pay for the click before the page can convert, so every slow second is wasted ad spend.)
- [ ] Core Web Vitals pass (LCP, CLS, INP). Verify via Lighthouse output.
- [ ] **Mobile-first.** The majority of paid local-service traffic is mobile. Build the phone view first, verify desktop second.
- [ ] **390px above-the-fold check (verify by code inspection):** confirm the hero markup/CSS sizes the image so the eyebrow, H1, subhead, primary CTA, and one trust line all sit in the first viewport at 390px wide — the image must not push them below the fold. Check the hero's max-height/order rules and image constraints in the source, not by eyeballing a render.
- [ ] Hero image compressed, modern format (AVIF/WebP), explicit dimensions to avoid layout shift.
- [ ] Below-fold media lazy-loaded; no large background video; no parallax that janks on mobile; no horizontal scroll.
- [ ] Fonts: minimal families, critical font preloaded.
- [ ] No unnecessary third-party scripts on the paid page.
- [ ] **Quality Score factors satisfied:** message match (§1) + speed + clear single-path navigation + ad-to-page consistency. Strong landing-page experience improves Google's ad-quality signals, which lowers wasted spend and CPC.

**Verification (no screenshots):**
- [ ] Run Lighthouse mobile + desktop; record Performance/SEO/Best-Practices/Accessibility scores in the PR notes.
- [ ] `curl -sI` the URL to confirm 200, correct caching headers, and HTTPS.
- [ ] Inspect the rendered HTML to confirm one canonical H1, single primary CTA repeated, and no leftover site-nav links.

---

## 18. TRACKING / ANALYTICS SETUP (so data exists for later)
Not testing yet — just instrument the page so testing is possible once traffic arrives.

- [ ] Google Ads conversion tracking fires on the primary conversion (quote submit / call booked). Verify the event fires.
- [ ] Step-level analytics on the quote wizard (PostHog) — capture per-step drop-off.
- [ ] Events instrumented: CTA clicks, form starts, form completions, phone clicks, email clicks, booking/calendar clicks, quote-flow step completions, thank-you view, scroll depth.
- [ ] Conversions categorized: **primary** (booked call / submitted quote) · **secondary** (phone click, case-study/live-example click) · **micro** (form start, quote step completed).
- [ ] Internal/operator traffic filtered out.
- [ ] Confirm all tags load without blocking render (check they're async/deferred).

---

## 19. LAUNCH GATE (final pass/fail before ads go live)
All must pass:

**Scope**
- [ ] Page is one of: auto detailing, ceramic, window tint, or PPF (if not, this is the wrong checklist — see Scope Guard)

**Strategy**
- [ ] One audience, one offer, one primary CTA
- [ ] Keyword in H1; ad promise delivered above the fold
- [ ] Page built for cold paid traffic, not warm referrals

**Hero**
- [ ] Audience named · outcome stated · mechanism clear · CTA above fold · trust line · real product visual

**Copy**
- [ ] Pain is specific and tied to money/time · solution clear · features tied to outcomes · no banned phrasing · no raw tech-speak

**Proof**
- [ ] Real case study + real screens · testimonial with a result · proof in first third AND next to CTA · claims specific and believable

**Offer**
- [ ] Deliverables, timeline, pricing/range, ownership, monthly scope, cancellation terms all stated

**CTA**
- [ ] One primary phrase repeated · fear-reducing microcopy · sticky mobile CTA · secondary CTAs subordinate

**Form**
- [ ] Minimal fields · easy on mobile · contact asked after value · partial-lead capture · confirmation explains next step

**UX / Technical**
- [ ] <1s ideal (<3s hard max), verified · CWV pass · mobile-first verified · clean section hierarchy
- [ ] At 390px, hero shows eyebrow + H1 + subhead + primary CTA + trust line above the fold (image not pushing them down) — verified by code inspection
- [ ] Header is logo + primary CTA only; no nav menu, dropdowns, blog/portfolio links, or social icons above the footer; no horizontal scroll
- [ ] Page passes the skim test — understandable top-to-bottom without reading full paragraphs

**Tracking**
- [ ] Ads conversion + form + phone + CTA + quote-step + thank-you events firing · internal traffic filtered

---
*Scope: auto detailing · ceramic · window tint · PPF only. For other variable-quote niches use the general quote-page checklist; for fixed-price/appointment niches (barber, salon) use the booking-page checklist. Keep the structure, the awareness-stage hook logic, and the launch gate.*
