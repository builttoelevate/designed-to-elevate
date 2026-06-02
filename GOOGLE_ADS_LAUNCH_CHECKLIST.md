# Pre-Launch Checklist — Google Ads (Search) for /auto-detailing-websites

**Campaign:** B2B Search driving detailing / ceramic / tint **shop owners** to https://designedtoelevate.co/auto-detailing-websites/ — selling website + quote-wizard builds ($997–$4,497 one-time, shop owns everything, no required monthly). Brand-new advertiser, modest local budget, thin conversion history.

**How to use this:** Work top to bottom — the phases are ordered so nothing downstream breaks. Do **every P0 item before you spend a single dollar.** Each line is a checkbox tagged with who owns it (**[Bill]** = account/business, **[Dev]** = code, **[Either]**) and a priority (P0 = blocker, P1 = before launch, P2 = soon after, P3 = nice-to-have). Numbers (budgets, CPCs, lead values) are planning *assumptions* — adjust once real data lands.

**Bottom line — the hard blockers:** Nothing on this site tracks anything yet. The Google tag IDs are still `AW-PLACEHOLDER` / `G-PLACEHOLDER` and the Ads conversion fires nothing, so today a paid click that completes the quote wizard registers **zero** conversions and Smart Bidding would be blind. You cannot launch until: (1) the branch is merged and deployed, (2) real GA4 + Google Ads IDs are wired and the conversion is **verified firing** on the live page, (3) the consumer-intent **negative keyword list** is built (or the budget gets eaten by homeowners searching "detailing near me"), (4) the privacy policy is rewritten (it currently lies — says "no third-party analytics or advertising cookies"), and (5) Advertiser Identity Verification is started. Everything else is tuning.

## At a glance

| Phase | What it covers | Gate |
|---|---|---|
| 1. P0 Hard Blockers | The must-do-first list, pulled forward | Before ANY spend |
| 2. Tracking & Analytics | GA4 + Ads tag, conversions, Enhanced Conversions, Consent Mode, verification | Before ANY spend |
| 3. Keyword Research | Ad-group themes, seed keywords, the negative list | Before keywords go live |
| 4. Campaign Structure, Bidding & Budget | One Search campaign, bidding ladder, budget, geo | Campaign build |
| 5. Ad Creative & Assets | RSAs, sitelinks, callouts, snippets, call/image assets | Before ads enabled |
| 6. Landing Page Readiness | In-repo audit fixes, two wizard fixes, merge/deploy | Before ANY spend |
| 7. Policy, Legal & Privacy | Identity verification, privacy rewrite, destination rules | Before ANY spend |
| 8. Launch Day | Final pre-flight | Day of |
| 9. First 2–4 Weeks | Monitor, switch bidding, mine search terms | Post-launch |

---

## 1. P0 Hard Blockers — do ALL of these before any spend

- [ ] **[Either]** (P0) Merge the `claude/pricing-public-internal-split` branch to `main` and confirm the Vercel production deploy finishes — the live site is a **stale** deploy; everything below depends on the new version being live first.
- [ ] **[Bill]** (P0) Create the Google Ads account, accept the **customer-data terms** (Tools → conversions/Goals → Settings → Customer data terms), and note the 10-digit Conversion ID (the number after `AW-`).
- [ ] **[Bill]** (P0) Create a **GA4 property** ("Designed to Elevate", US/Eastern, USD) with a Web data stream for `https://designedtoelevate.co`; copy the Measurement ID (`G-XXXXXXXXXX`).
- [ ] **[Bill]** (P0) Create the **primary Ads conversion action** for the quote-wizard lead (Website → Set up manually → Category "Submit lead form", Count = One, 30-day click / 1-day view, Data-driven attribution); copy the `AW-XXXXXXXXXX/AbCdEf123` send_to value.
- [ ] **[Dev]** (P0) Swap the three placeholder IDs: `GOOGLE_ADS_ID` and `GA4_ID` in `src/layouts/LandingLayout.astro` (lines ~35–36) and `ADS_CONVERSION_SEND_TO` in `src/pages/auto-detailing-websites.astro` (line ~1161).
- [ ] **[Bill]** (P0) Turn **auto-tagging (gclid) ON** (Account Settings → Auto-tagging) — required to attribute conversions off the Web3Forms form.
- [ ] **[Either]** (P0) Designate **exactly ONE primary conversion** (the quote-wizard lead); everything else (phone/text, partial-lead, micro-events) is Secondary.
- [ ] **[Either]** (P0) Build the **account-level negative keyword list** ("B2B - Consumer Exclusions") and apply it to the campaign before any keyword goes live (full list in §3).
- [ ] **[Either]** (P0) **Pre-launch verification:** with the campaign PAUSED, complete a real test lead on the deployed page and confirm the conversion shows "Recording conversions" in Ads Tag Diagnostics and the funnel shows in GA4 DebugView (full steps in §2).
- [ ] **[Dev]** (P0) Rewrite the privacy policy's cookies/analytics section in the **same deploy** as the tag-ID swap — it currently says the site uses no third-party analytics/advertising cookies, which becomes a false statement the moment the tags fire (§7).
- [ ] **[Bill]** (P0) Start **Advertiser Identity Verification** the day the account is created — 30-day window, account auto-pauses if missed (§7).

---

## 2. Tracking & Analytics Setup

**Architecture decision: gtag.js directly, NOT Google Tag Manager.** The scaffold is gtag-native and this is a single landing page — GTM adds a container and a consent template for zero benefit. **Native Ads conversion = Primary** (fast, supports Enhanced Conversions + view-through). **Imported GA4 `generate_lead` key event = Secondary** (context only, no double-count in bid targets).

### Account provisioning (Bill)
- [ ] **[Bill]** (P0) Create the GA4 property + Web data stream; copy `G-XXXXXXXXXX` (item also in §1).
- [ ] **[Bill]** (P0) Create the primary Ads conversion ("Submit lead form", Count = One, value = "Don't use a value" OR a flat proxy like `50 USD` so Smart Bidding has a target — assumption, adjust later); copy the `AW-XXXXXXXXXX/label` (item also in §1).
- [ ] **[Bill]** (P1) Create a **second Ads conversion** for phone/text clicks (Category "Contact" or "Phone call lead", Count = One); mark it **Secondary** so click-to-call doesn't compete with the form lead.
- [ ] **[Bill]** (P1) **Link Google Ads ↔ GA4** (GA4 Admin → Product links → Google Ads); enable auto-tagging + "Personalized advertising".

### Wiring (Dev)
- [ ] **[Dev]** (P0) Swap the three placeholder IDs (item also in §1). The `TRACKING_IDS` filter then auto-activates the async loader and config loop — no other change there.
- [ ] **[Dev]** (P0) Confirm the config loop fires `gtag('config', id)` for **both** the `G-` and `AW-` IDs — the Ads conversion needs the `AW-` tag configured on the page, not just GA4.
- [ ] **[Dev]** (P1) Fire the GA4 `generate_lead` event alongside the native Ads conversion in the `audit-form:success` handler (`gtag('event','generate_lead',{currency:'USD', value:50})`).
- [ ] **[Dev]** (P1) Mark `generate_lead` (and optionally `phone_tap`) as a **GA4 Key event** so it can be imported into Ads as a Secondary conversion. Existing taxonomy already pushes `cta_click`, `phone_tap`, `form_view`, `quote_step`, `quote_partial_lead`, `form_submit_success/error`, `thank_you_view`.
- [ ] **[Dev]** (P3) Optional `scroll_depth` (25/50/75%) listener — GA4 Enhanced Measurement already auto-collects 90% scroll, so don't block launch on it.

### Conversion config (Either)
- [ ] **[Either]** (P1) Keep the **native gtag Ads conversion = Primary**; import the GA4 `generate_lead` key event (Goals → Conversions → + New → Import → Google Analytics 4) and set it **Secondary**. Do not set both as Primary.
- [ ] **[Either]** (P1) **Enable Enhanced Conversions for leads** (worth it — the form collects email + phone). Account side: open the form-lead conversion → Enhanced conversions → turn on → method "Google tag (gtag.js)" → accept terms. Code side: set `user_data` from the wizard's `email`/`phone` inputs BEFORE the conversion fire (send UNHASHED — gtag SHA-256 hashes client-side; phone must be E.164 `+1` + 10 digits).
- [ ] **[Dev]** (P2) Add an `event_callback` to the conversion fire for safety (and to gate navigation if a redirect is ever added).

Copy-pasteable Enhanced Conversions + callback block (replace the `gtag('event','conversion',...)` block ~line 1208–1210 in `auto-detailing-websites.astro`):

```js
if (typeof w.gtag === 'function' && !ADS_CONVERSION_SEND_TO.includes('PLACEHOLDER')) {
  // Enhanced Conversions for leads — send UNHASHED; gtag hashes (SHA-256) client-side.
  const form = document.querySelector('#quote form');
  const emailEl = form && form.querySelector('input[name="email"]');
  const phoneEl = form && form.querySelector('input[name="phone"]');
  const ud = {};
  const em = emailEl && emailEl.value.trim().toLowerCase();
  if (em) ud.email = em;
  const digits = phoneEl && phoneEl.value.replace(/[^0-9]/g, '');
  if (digits && digits.length === 10) ud.phone_number = '+1' + digits; // E.164, US
  if (Object.keys(ud).length) w.gtag('set', 'user_data', ud);

  // GA4 key event (import into Ads as SECONDARY)
  w.gtag('event', 'generate_lead', { currency: 'USD', value: 50 });

  // PRIMARY native Ads conversion (count=One)
  w.gtag('event', 'conversion', {
    send_to: ADS_CONVERSION_SEND_TO,
    value: 50,
    currency: 'USD',
    event_callback: function () { /* navigate here if a redirect is ever added */ }
  });
}
```

### Consent + compliance (see also §7)
- [ ] **[Dev]** (P1) Add **Consent Mode v2** default-denied BEFORE the config loop in `LandingLayout.astro` `<head>` (right after `gtag('js', new Date());`, ~line 94). Use **Advanced** mode (cookieless pings model EEA conversions vs Basic blocking outright). All four signals are mandatory.

```js
// Consent Mode v2 — default DENIED before any user choice (required for EEA/UK/CH).
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
// Your consent banner calls this on Accept:
// gtag('consent', 'update', { ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted', analytics_storage:'granted' });
```

- [ ] **[Dev]** (P2) Add a **lightweight consent banner (CMP)** that calls `gtag('consent','update',{...:'granted'})` on accept and stores the choice in localStorage — a hand-rolled vanilla banner is acceptable for a US-focused budget; a Google-certified CMP (Cookiebot, CookieYes, Usercentrics, iubenda) is required only for EEA audience features at scale.
- [ ] **[Either]** (P1) **Exclude Bill's own IP + use debug mode** so test submits don't pollute bidding. GA4: Admin → Data Streams → Configure tag settings → Define internal traffic (add Bill's public IP) → Admin → Data Filters → set Internal Traffic filter Active. Google Ads: Account Settings → Excluded IP addresses. Run all pre-launch test leads with `?debug_mode=true` so they land only in DebugView. Never run live test submits after the campaign is spending.

### Verification (the gate)
- [ ] **[Either]** (P0) **Confirm the conversion registers BEFORE spending** — run end-to-end on the **deployed** page with the campaign PAUSED:
  1. Install **Tag Assistant** (tagassistant.google.com); load the page; confirm both the `AW-` and `G-` tags fire and a `page_view` is recorded.
  2. GA4 **DebugView** (with `?debug_mode=true`): walk the wizard and confirm `form_view`, `quote_step` (steps 1–5), `quote_partial_lead` (after step 4), and `generate_lead` + `form_submit_success` on final submit.
  3. Complete one real test lead; in Ads open the conversion action → Tag/Diagnostics; "Recent conversions" / Tag Diagnostics should move from "No recent conversions" to **"Recording conversions"** within a few hours.
  4. Enhanced Conversions: in the conversion's Diagnostics tab, confirm user-provided data is being received (match-rate diagnostic appears within ~24–48h).
  5. Click the call/text popup and a `tel:`/`sms:` link with DebugView open; confirm `phone_tap` fires.
  - **Only enable the campaign once the form-lead conversion shows "Recording conversions" and DebugView shows the funnel.**

---

## 3. Keyword Research

**Structural reality:** every "detailing"/"ceramic coating"/"tint" term is dominated by **consumer** intent (people wanting their own car done). The **negative list matters more than the keyword list.** B2B owner-intent terms are real but **low volume**, so launch **Phrase + Exact heavy**; add a single Broad ad group only after tracking is live and you have ~15–30 conversions to support tCPA.

- [ ] **[Either]** (P1) Run **Keyword Planner** ("Get search volume and forecasts") on each theme below. Expect low monthly volume on owner-intent terms (often <100–500/mo nationally for exact B2B phrases) and higher CPCs than consumer terms (consumer detailing ~$3–12; B2B "website design" terms commonly ~$8–25+). Treat as planning ranges.
- [ ] **[Either]** (P3) Sanity-check volume/CPC with Google Trends, Keywords Everywhere / Ubersuggest free tiers, and a Semrush/Ahrefs trial for competitor-gap vs Detailers Roadmap / Shop Positioner / Mojo Media.

### Ad-group themes + seed keywords (launch Exact-heavy, then Phrase)

**Theme 1 — Detailing website design** (Exact + Phrase)
```
auto detailing website design        [Exact]
car detailing website design         [Exact]
website for auto detailing business  [Phrase]
website for my detailing business    [Phrase]
detailing shop website builder       [Phrase]
auto detailing web design company    [Phrase]
website design for detailers         [Phrase]
detailing business website           [Phrase]
mobile detailing website design      [Phrase]
custom website for detailing shop    [Phrase]
professional auto detailing website  [Phrase]
detailing website developer          [Phrase]
```

**Theme 2 — Ceramic coating website design** (Exact + Phrase)
```
ceramic coating website design          [Exact]
website for ceramic coating business    [Phrase]
ceramic coating shop website            [Phrase]
website for ppf and ceramic coating     [Phrase]
ceramic coating business website design [Phrase]
paint protection film website design    [Phrase]
ppf shop website design                 [Phrase]
coating shop website builder            [Phrase]
website for my ceramic coating shop     [Phrase]
ceramic coating marketing website       [Phrase]
```

**Theme 3 — Window tint website design** (Exact + Phrase)
```
window tint website design          [Exact]
tint shop website design            [Exact]
website for window tinting business [Phrase]
auto tint shop website              [Phrase]
window tinting business website     [Phrase]
website for my tint shop            [Phrase]
tinting company web design          [Phrase]
window film shop website design     [Phrase]
```

**Theme 4 — Get more customers / leads for a detailing business** (Phrase — watch for lead-reseller intent)
```
get more detailing customers             [Phrase]
how to get more car detailing clients    [Phrase]
auto detailing lead generation           [Phrase]
more leads for detailing business        [Phrase]
detailing business marketing             [Phrase]
grow my auto detailing business          [Phrase]
auto detailing advertising               [Phrase]
ceramic coating lead generation          [Phrase]
get more ceramic coating customers       [Phrase]
detailing shop marketing system          [Phrase]
car detailing google ads landing page    [Phrase]
auto detailing website to get customers  [Phrase]
```

**Theme 5 — Quote / booking system for detailers** (Phrase + Exact — competes with Jobber/Urable/Zenbooker; lean on "owned, no monthly")
```
auto detailing quote system                  [Exact]
online quote system for detailing            [Phrase]
detailing booking system for website         [Phrase]
instant quote tool for detailing website     [Phrase]
car detailing estimate calculator for website[Phrase]
detailing price calculator website           [Phrase]
ceramic coating quote calculator             [Phrase]
online booking system for detailing shop     [Phrase]
detailing website with online booking        [Phrase]
quote form for detailing business            [Phrase]
add quote system to detailing website        [Phrase]
```

**Theme 6 — Replace Wix/Squarespace for a detailing shop** (Phrase — GENERIC "alternative" intent, NOT bidding the bare trademark)
```
alternative to wix for detailing website            [Phrase]
replace squarespace detailing site                  [Phrase]
custom website instead of wix small business        [Phrase]
detailing website without monthly fee               [Phrase]
own my detailing website no subscription            [Phrase]
move detailing site off wix                         [Phrase]
squarespace alternative for service business website[Phrase]
stop paying monthly for my business website         [Phrase]
```

- [ ] **[Either]** (P0) Set up the **4–6 ad groups exactly as themed above** (one intent each), all pointing to `/auto-detailing-websites/` with theme-matched headlines.
- [ ] **[Either]** (P1) Launch **Phrase + Exact only**. Hold Broad until tracking is live + ~15–30 conversions support a tCPA / Max Conversions strategy.
- [ ] **[Bill]** (P2) **Skip brand/competitor bidding at launch** (Wix, Squarespace, GoHighLevel, Durable, Jobber, Urable, Detailers Roadmap) — can't use the trademark in copy, low QS, high CPC; Theme 6 already captures switch intent generically. Revisit a small, well-negatived "alternatives" group only once the core campaign is profitable.

### Negative keyword list (apply as account-level shared list, mix of phrase/exact)

- [ ] **[Either]** (P0) Create the shared list **"B2B - Consumer Exclusions"** (Tools → Shared library → Negative keyword lists), load ALL terms below, and apply it to the campaign.

**Consumer / "I want my own car done" (highest priority):**
```
near me, near by, cost, costs, price, prices, pricing, how much, cheap, cheapest,
deals, coupon, coupons, discount, groupon, same day, mobile detailing service,
interior detailing, full detail, wash and wax, engine detailing, headlight restoration,
appointment, book a detail, schedule a detail
```

**How-to / DIY / hobby:**
```
how to, how to detail a car, diy, do it yourself, tips, tutorial, youtube, at home,
products, best products, kit, supplies, polisher, wax, meaning, definition, what is detailing
```

**Jobs / training / careers / education:**
```
jobs, job, hiring, careers, salary, pay, wage, training, course, courses, certification,
school, class, classes, how to start a detailing business, business plan, apprenticeship, resume
```

**Free / template / DIY-builder intent (wrong buyer):**
```
free, free website, wix free, free template, templates, theme, themeforest, envato,
wordpress theme, godaddy website builder, make a free website, website builder free
```

**Wrong meaning / adjacent industries:**
```
detailing meaning, parts detailing, architectural detailing, steel detailing, rebar detailing,
nail detailing, eyebrow detailing, car wash franchise, detailing franchise, detailing equipment,
pressure washer, steam cleaner
```

**Lead-reseller / marketplace confusion (for Theme 4):**
```
buy detailing leads, detailing leads for sale, lead list, fiverr, 99calls, thumbtack, angi, yelp ads
```

- [ ] **[Either]** (P1) Re-mine the **Search Terms report every 2–3 days** for the first month and keep adding negatives.

---

## 4. Campaign Structure, Bidding & Budget

**Why Search, not PMax/Demand Gen:** a brand-new account with ~0 conversion history and a modest local B2B budget can't feed PMax's ML (~15–30+ conversions/30 days), and Search's keyword-level intent control is essential to enforce owner-vs-consumer targeting. Run Search now; revisit PMax/Demand Gen as a *separate* campaign later.

### Starting configuration

| Setting | Launch value | Why / when to change |
|---|---|---|
| Campaign type | Search only (no Display expansion) | Intent control + clean data |
| Search partners | ON at launch, monitor separately | Scrapes extra inventory for thin volume (note: keep an eye on quality) |
| Campaign count | 1 campaign | Don't fragment thin budget/data |
| Ad groups | 4–6, one theme each | Tight themes lift Quality Score, cut CPC |
| Bidding (launch) | Maximize Clicks + max-CPC cap (~$3–6, validate w/ Planner) — or Manual CPC | ~0 conversions; buy data + learn real CPCs |
| Bidding (after ~5–15 conv) | Maximize Conversions (no target) | Builds a CPA baseline; 7–14d learning |
| Bidding (after 15–30 conv/30d) | Target CPA at observed CPA | Google min 15, practical min 30; don't lowball |
| Daily budget | ~3–5× expected cost-per-lead (≈ $30–60/day starting range, assumption) | Enough to win a few leads/day; concentrate if volume thin |
| Geo | United States (or tighter states/Ohio metros to start) | Tighten to reduce waste / remove EEA |
| Location option | **Presence** (people in/regularly in target) — NOT "Presence or interest" | Cuts wasted spend; also removes Consent Mode v2 obligation if US-only |
| Auto-tagging (gclid) | ON | Required for attribution off Web3Forms |
| Ad schedule | All hours at launch, trim after 2–4 weeks | Need data before cutting dayparts |
| Devices | No bid adjustments at launch (LP is mobile-first) | Adjust only after device-level conversion data |
| Audiences | Observation mode only (in-market Web Design, custom-intent, remarketing) | Don't restrict reach early |
| Final URL | `https://designedtoelevate.co/auto-detailing-websites/` (trailing slash) | Matches canonical, avoids redirect hop |
| Tracking template | `?utm_source=google&utm_medium=cpc&utm_campaign=detailing-websites&utm_term={keyword}&utm_content={creative}` | GA4 reporting only; gclid does Ads attribution |
| Primary conversion | Quote Wizard Lead (Count: One) | Single primary; phone/text + micro-events = Secondary |

### Build & bidding ladder
- [ ] **[Either]** (P0) Launch as a **single Search campaign** (created "without a goal's guidance" for full control); uncheck Display Network expansion.
- [ ] **[Either]** (P1) Build **3–5 (up to 6) tightly themed ad groups** mapped to §3, ~5–15 keywords each.
- [ ] **[Either]** (P1) Open bidding on **Maximize Clicks with a max-CPC cap** (or Manual CPC) to gather data. *(Note: Enhanced CPC was retired for Search the week of Mar 31, 2025 — not an option.)*
- [ ] **[Either]** (P0) **Do NOT switch to Smart Bidding** until the single conversion reads "Recording conversions" and test submissions appear.
- [ ] **[Either]** (P2) After tracking is verified + ~5–15 conversions, step up to **Maximize Conversions (no target)**; expect a 7–14 day learning period — don't also change budget/goals in that window.
- [ ] **[Either]** (P2) After **≥15 (ideally ≥30) conversions in trailing 30 days**, add **Target CPA** near the observed CPA (don't lowball); then hands-off 1–2 weeks.
- [ ] **[Bill]** (P1) Set **daily budget ≈ 3–5× expected cost-per-lead** (≈ $30–60/day starting assumption). If volume is tiny, **concentrate budget into the 1–2 best ad groups** rather than spreading thin. Google can spend up to ~2× the daily budget on a given day (monthly cap governs).

### Targeting
- [ ] **[Either]** (P1) **Geo = US**, Location option = **Presence** (not "Presence or interest"); add country-exclusions if overseas clicks appear.
- [ ] **[Either]** (P1) Set a campaign-level **Tracking template** with the UTMs above (GA4 reporting only); use the **Test** button to confirm it resolves to a 200.
- [ ] **[Either]** (P2) Add **audience signals in Observation mode only** (in-market "Business Services > Web Design/Development", custom-intent from B2B website/lead-gen searches, remarketing once GA4 has traffic) — do not Target at launch.
- [ ] **[Either]** (P2) Run **all-hours** at launch; review Day/Hour + Devices reports after 2–4 weeks before any bid adjustments.
- [ ] **[Either]** (P2) Once tracking + ~30 conversions exist, plan a **small Performance Max or Demand Gen test** on a separate budget (audience-signal targeting of shop owners) to compensate for thin Search volume — never as a replacement for Search.

---

## 5. Ad Creative & Assets

**Rule: message match = Quality Score.** Mirror the LP word-for-word (H1 "Auto Detailing Websites That Quote the Job," proof "Live in Production / Built for Fitchin," ownership "you own the code, no monthly," the quote-wizard differentiator). Ship **2–3 RSAs per ad group** at Good/Excellent Ad Strength. **Pin only the keyword headline to Position 1** so consumer searchers self-deselect; leave all others unpinned. Char limits are load-bearing — **headline ≤30, description ≤90, sitelink title ≤25 / desc line ≤35, callout ≤25, snippet value ≤25, business name ≤25, display path ≤15** (spaces count).

### RSA #1 — Primary (B2B owner intent)
**Final URL:** `https://designedtoelevate.co/auto-detailing-websites/` · **Paths:** `detail-websites` / `quote-system`

- [ ] **[Either]** (P1) Build RSA #1; **PIN "Detailing Website Builder" to Position 1**, leave the rest unpinned, target Ad Strength Good+.

Headlines (14 valid):
```
Detailing Website Builder        [25]  ← PIN Position 1
Auto Detailing Websites          [23]  (alt P1 keyword)
Websites That Quote the Job      [27]
A Quote System, Not a Form       [26]
Prices the Job by Vehicle        [25]
You Own the Code, No Monthly     [28]
Built for Detail Shop Owners     [28]
Live in Production for Fitchin   [30]
Stop Quoting Over the Phone      [27]
Capture Every Lead               [18]   (replaces over-limit "Capture the Lead, Not Just a Name")
The Quote Texts You to Book      [27]
Ceramic + Detail Pricing         [24]
For Your Detailing Business      [27]
Built by a Real Shop Operator    [29]
No Wix Rent, Site Is Yours       [26]
```
Descriptions:
```
We build detail-shop websites with a real quote system that prices the job by vehicle. [86]
Captures the lead before they bounce, then texts the quote to your phone to book.       [80]
You own the code, the repo, the domain. No required monthly. Built for shop owners.     [82]
Live in production for Fitchin Auto Detail. Built by a real shop operator, not an agency.[88]
```

### RSA #2 — Variant (lead-gen / phone-tag angle)
**Final URL:** same · **Paths:** `detail-websites` / `more-leads`

- [ ] **[Either]** (P2) Build RSA #2; **PIN "Auto Detailing Websites" to Position 1**; don't duplicate RSA #1 headlines verbatim.

Headlines (12):
```
Auto Detailing Websites      [23]  ← PIN Position 1
More Detailing Customers     [24]
Turn Clicks Into Quotes      [23]
End the Quote Phone Tag      [23]
A Site That Prices the Job   [26]
Detail + Ceramic Quote Tool  [27]
Lead Capture Built In        [21]
You Own It, No Monthly Fee   [26]
Get More Detailing Leads     [24]
Quote by Vehicle in 60 Sec   [26]
Built for Detailers, by One  [27]
3-5 Week Build, You Own It    [26]
```
Descriptions:
```
Every contact form is phone tag. Give your shop a site that prices the job and books it. [88]
Detailing, ceramic, and tint priced by vehicle. The lead lands even if they don't call.  [87]
Custom-built around how your shop quotes. You own the code at handoff — no Wix rent.      [83]
See the live Fitchin build. Built by someone who ran a real detail shop, not an agency.   [87]
```

- [ ] **[Either]** (P2) Set **Display Paths** (cosmetic): `detail-websites` [15] / `quote-system` [12]. Note "detailing-websites" is 18 chars — use "detail-websites".
- [ ] **[Either]** (P3) Optional single **Keyword Insertion** headline with a safe default (`{KeyWord:Detailing Websites}`) — at most one; pinned static headlines are safer here.

### Assets / extensions
- [ ] **[Bill]** (P0) Add the **Call asset** — phone (740) 617-6488 — with **call reporting ON** (Google forwarding number) and a "Calls from ads" conversion (count calls ≥30–60s). Schedule it to real answer hours. *(Requires the phone number to be verified in-account — see §7.)*
- [ ] **[Either]** (P1) Add **4 Sitelinks** (both description lines each; all deep-link to the same LP — never the marketing site):
```
See the Pricing      | Install $997-$4,497, one-time | No required monthly fee       | /auto-detailing-websites/#pricing
The Fitchin Build    | A live shop running the system | Detailing, ceramic, and tint  | /auto-detailing-websites/#case-study
Build My Estimate    | Price your build in ~60 seconds| No pushy sales call           | /auto-detailing-websites/#quote
Common Questions     | Cost, ownership, timeline      | Honest answers, no fine print | /auto-detailing-websites/#faq
```
- [ ] **[Either]** (P1) Add **6–8 Callouts** (all ≤25):
```
You Own The Code · No Monthly Fees · Quote System Included · Built By a Shop Operator
No More Phone Tag · Texts You The Quote · 3-5 Week Build · $0 Required Hosting
```
*(Over-limit originals corrected: "Built By a Real Shop Operator" → "Built By a Shop Operator"; "Lead Captured, No Phone Tag" → "No More Phone Tag".)*
- [ ] **[Either]** (P2) Add **Structured Snippets** — Header "Services" (values ≤25):
```
Detailing Websites · Ceramic Coating Sites · Window Tint Websites · Quote Wizard System · Lead Capture · Online Booking
```
Optional 2nd header "Featured": `Quote by Vehicle · Ceramic Tier Upsell · Partial-Lead Capture · Text-to-Book Handoff`.
- [ ] **[Either]** (P2) Add **Business Name** asset (`Designed to Elevate` [19]) and **Logo** asset — export a 1:1 square mark (≥128×128) AND a 4:1 landscape from `public/logo-wordmark-orange.webp`.
- [ ] **[Either]** (P3) Add **Image assets** matched to the LP — `public/showcase/fitchin-mobile.webp`, `public/wizard/step-6-final-quote.webp`, `public/auto-detail/detailing-bay-hero.webp` — each exported as 1.91:1 (1200×628) AND 1:1 (1200×1200), minimal text overlay.
- [ ] **[Bill]** (P3) **Skip the Lead Form asset** at launch — it would bypass the on-page quote wizard (the whole value prop) and lower lead intent. Drive 100% of traffic to the LP.

### QA
- [ ] **[Either]** (P1) **Message-match check:** the ad's lead headline/description must promise the same thing the LP H1 delivers; confirm every Final URL + sitelink resolves to `/auto-detailing-websites/` (the noindex paid LP), not the SEO page or marketing home.
- [ ] **[Either]** (P1) **Char-limit + policy check** on every asset (counter in-editor or a free RSA validator). Scrub banned voice: no "solutions," no "guaranteed"/"guaranteed results," no 10X/skyrocket/dominate, no Fitchin dollar amounts, no fake client counts.

---

## 6. Landing Page Readiness

The page is content- and structure-complete (correct B2B copy, valid schema, passing contrast, consistent $997–$4,497 pricing, working 5-step wizard with partial-lead capture). The hard gate is tracking (§2) + **merge/deploy**, plus verifying two wizard fixes that are NOT yet in source.

### Deploy & go-live
- [ ] **[Either]** (P0) **Merge `claude/pricing-public-internal-split` to `main` and confirm the Vercel production deploy finishes** (item also in §1) — every "verify on deployed build" item depends on this.

### Tracking on the LP (cross-ref §2)
- [ ] **[Either]** (P0) **Swap the real Ads `send_to` into the already-wired conversion fire.** The fire is built and inert in `auto-detailing-websites.astro` (~line 1204–1211, on `audit-form:success`), gated behind the `AW-PLACEHOLDER/CONVERSION_LABEL` check — just replace `ADS_CONVERSION_SEND_TO` (~line 1161) with the real value (also in §1/§2). No new wiring needed.
- [ ] **[Either]** (P0) **tel:/sms: click tracking is already wired** (a `phone_tap` handler on `[data-call-text], a[href^="tel:"], a[href^="sms:"]`, ~line 1178). Remaining work is account-side: create the secondary "Call/Text Click" Ads conversion (§2) and, if you want it counted, fire it from that handler once its `send_to` exists.
- [ ] **[Dev]** (P1) Once real IDs are in, verify in GA4 DebugView that the existing events all arrive: `form_view`, `cta_click`, `phone_tap`, `quote_step` (steps 1–5, already pushed from the wizard's `show()`), `quote_partial_lead`, and `form_submit_success` (note: the success event is named `form_submit_success`, not `quote_submit`).
- [ ] **[Bill]** (P1) **Exclude your own IP** from GA4 and Ads before any test traffic (item also in §2).

### Wizard fixes — NOW APPLIED in source (on the branch); VERIFY after deploy
- [ ] **[Either]** (P1) **Enter-key guard (applied):** a `keydown` handler now makes Enter inside any input on a non-estimate step advance (click Continue) instead of submitting; only Step 5 submits. After deploy, on phone + desktop: type a phone/email on Step 4 and press Enter — it must **advance**, never submit.
- [ ] **[Either]** (P1) **Phone-OR-email, not phone-only (applied):** phone is no longer `required`; `stepValid()` now requires at least one valid phone (≥10 digits) or email, `inputmode="tel"` is set, and the Step-4 error reads "Add your name and a phone or email so Bill can send your quote." After deploy, verify: email-only submits, phone-only submits, both-empty blocks advancement.
- [ ] **[Bill]** (P1) **Run a real end-to-end test lead** (after deploy + IP exclusion): complete all 5 steps on a phone and confirm BOTH the `[PARTIAL]` email (fires leaving Step 4) and the final full email arrive at `bilsonxnc@gmail.com` — **check spam**. Verify the payload contains services/goals/timeline/budget/contact + recommended tier. If it lands in spam, add a Gmail filter / consider Web3Forms paid + a backup recipient.

### Performance & polish
- [ ] **[Either]** (P1) **Verify the sticky mobile CTA no longer overlaps the wizard buttons** — the new `#quote` IntersectionObserver should hide the bottom bar when the wizard is visible. Scroll into the wizard on a real phone; confirm the bar disappears. Also clean up the stale comment in `auto-detailing-websites.astro` lines ~1117–1118 that still says the observer only watches `[data-hero-cta]` and `#apply`.
- [ ] **[Dev]** (P1) **Confirm WebP weights** — each `.webp` (especially `fitchin-mobile.webp`) is well under ~200 KB and no `.png` variants still load. Update the Organization schema logo in `LandingLayout.astro` line ~53 (still points at `logo-wordmark-orange.png`) to `.webp`, or confirm the PNG still exists for crawlers.
- [ ] **[Either]** (P1) **Run Lighthouse + PageSpeed Insights** on the LIVE URL (mobile + desktop); confirm load <3s, mobile LCP <2.5s, CLS <0.1. Record Performance/Accessibility/Best-Practices/SEO.
- [ ] **[Dev]** (P2) Confirm **Montserrat is gone** (only Inter + Space Grotesk download) via DevTools Network.
- [ ] **[Dev]** (P2) Confirm submit copy reads **"Sending your request…"** (not "application"), the error copy reads "Couldn't send your request…", and the skip-link label is sensible for a wizard.
- [ ] **[Dev]** (P2) Confirm `/auto-detailing-websites` is **excluded from the sitemap** (fetch `/sitemap-0.xml` after deploy) — noindex URL in the sitemap is a soft-404 mixed signal.
- [ ] **[Dev]** (P3) Remove the leftover `console.log` on submit (`LandingLayout.astro` ~line 361).

### Conversion / proof & a11y
- [ ] **[Bill]** (P1) **Add a testimonial with a real result** — the Eric Fitch quote is all process praise, zero outcome. Ask Eric for one outcome sentence (e.g. "customers see a price before they call now"). Do NOT invent a metric or a Fitchin dollar amount.
- [ ] **[Dev]** (P2) Add a **light phone-format validation** (≥10-digit check in `stepValid()`) paired with `inputmode="tel"` — keep it lenient.
- [ ] **[Dev]** (P2) **Fix the budget-option focus ring** — the JS re-render drops the `has-[input:focus-visible]:ring-*` classes; reuse the shared `cardCls` constant so keyboard focus is preserved.
- [ ] **[Dev]** (P3) **Wizard a11y polish:** move focus to the new step's heading on each transition; add `aria-live="polite"` to "Step X of 5"; `role="alert"` on each `[data-error]`; `role="progressbar"` + `aria-valuenow` on the progress bar.
- [ ] **[Dev]** (P3) Add a `<noscript>` "Call or text Bill at (740) 617-6488" fallback inside the wizard card so a JS failure still captures the lead.
- [ ] **[Dev]** (P3) Title-case the H1 to mirror the title-case ad headline; add mobile "Keeping your site? / Need a new site?" framers above each pricing line.

---

## 7. Policy, Legal & Privacy Compliance

Two hard blockers: **Advertiser Identity Verification** and the **false privacy disclosure**. Good news confirmed: the LP's `noindex` does **not** affect Ads eligibility — just never block AdsBot.

### Identity & account verification
- [ ] **[Bill]** (P0) **Start Advertiser Identity Verification the day the account is created** — government photo ID with the name **exactly** as in the Google Ads payments profile (Bill Chicha), plus tax info (EIN preferred over SSN) and proof of legal operation. Sole proprietor → verify as an individual; if a DBA is used, payments-profile name + ID + registration must all match. 30-day window from prompt, review up to ~5 business days, account auto-pauses if missed. Settings → Verification.
- [ ] **[Bill]** (P1) **Verify the business phone number** (740) 617-6488 in-account before adding any call asset or call conversion — 2025 enforcement blocks unverified/mismatched numbers. Keep the LP `tel:`/`sms:` links identical.
- [ ] **[Bill]** (P1) **Accept conversion-tracking + first-party-data terms** in-account (Customer Data terms + Enhanced Conversions terms). Only use first-party data the customer shares directly (the wizard name/email/phone) — no purchased/third-party lists.

### Privacy content (ship in the SAME deploy as the tag-ID swap)
- [ ] **[Dev]** (P0) **Rewrite the privacy policy's cookies/analytics section** (`src/pages/privacy.astro` lines ~71–75). It currently says the site "does not currently use third-party analytics or advertising cookies" — **false** the moment the tags fire, and a direct violation of Google's honest-destination + Enhanced Conversions privacy-policy requirements. Replace with: discloses GA4 + Google Ads conversion tracking; cookies/identifiers + IP processed by Google; purpose (measuring ad performance, conversions, lawful remarketing); Enhanced Conversions hashing of submitted email/phone; link to Google's privacy policy + the opt-out (`tools.google.com/dlpage/gaoptout`).
- [ ] **[Dev]** (P1) **Remove the hardcoded "Placeholder" banner** in `src/components/LegalLayout.astro` (lines ~50–53) — the underlying privacy/terms/refund text is real and substantive, but a reviewer reading "The founder will replace this" can flag the destination as under-construction. Delete the `<div role=note>` block.
- [ ] **[Dev]** (P3) **Bump the privacy effective date** when the rewrite ships (LegalLayout default `effective='April 2026'`) and add a short **US state-privacy-rights** paragraph (right to know/access/delete, opt out of sale/sharing/targeted ads) pointing to the existing contact.

### Destination & crawlability
- [ ] **[Dev]** (P1) **Confirm noindex stays scoped to the LP and AdsBot is NOT blocked** — never add `AdsBot-Google`/`AdsBot-Google-Mobile` to noindex or `Disallow` them in `public/robots.txt`, or Quality Score craters and the ad is disapproved as "destination not accessible." A page-level `noindex` is fine for Ads.
- [ ] **[Either]** (P1) **Verify the LP meets destination-experience rules** — loads on common mobile browsers, no broken links, HTTPS, reachable from every targeted region, no login wall, visible business name + contact + clear pricing (all present). Test the quote wizard completing and `tel:`/`sms:` firing on a real phone. Ensure a privacy link is reachable from the LP footer.

### Consent posture
- [ ] **[Bill]** (P2) **Confirm Consent Mode v2 is not required for US/Ohio-only** — restrict Location targeting to the US with "Presence" (not "Presence or interest") so EEA users aren't served; this removes the CMv2 obligation. If geo ever widens to the EEA, a Google-certified CMP with CMv2 becomes a hard requirement.
- [ ] **[Dev]** (P2) Add the **Consent Mode v2 default + lightweight banner** anyway for honest disclosure + US state laws (code in §2). Pair with a "Do not sell/share my info" note.

### Email follow-up & account safety
- [ ] **[Bill]** (P2) **Make Bill's lead follow-up emails CAN-SPAM compliant** — truthful from/subject, clear identification as Designed to Elevate, a valid physical postal address (PO box OK), and a working unsubscribe honored within 10 business days once any promotional content is included.
- [ ] **[Bill]** (P1) **Set up billing cleanly + ramp gradually** — billing info matching the verification ID/payments profile; start conservative (≈ $20–50/day assumption for a single-metro B2B search campaign) and ramp ~20–30%/week over 2–4 weeks. Avoid overnight 3–5× budget spikes (triggers new-account fraud detection).

---

## 8. Launch Day — final pre-flight

- [ ] **[Either]** (P0) Branch merged + Vercel production deploy live (re-confirm the LP loads at the canonical URL).
- [ ] **[Either]** (P0) Conversion action reads **"Recording conversions"** and a test lead has shown in Tag Diagnostics + GA4 DebugView.
- [ ] **[Either]** (P0) Negative keyword list **"B2B - Consumer Exclusions"** is applied to the campaign.
- [ ] **[Dev]** (P0) Privacy policy rewrite is **live** (no "no third-party cookies" line, no "Placeholder" banner).
- [ ] **[Bill]** (P0) Advertiser Identity Verification **started** (or complete); billing method added.
- [ ] **[Bill]** (P0) Internal-traffic IP exclusion is **Active** in GA4 and Ads.
- [ ] **[Either]** (P1) Each ad group has **2–3 RSAs at Good+ Ad Strength**, keyword pinned to Position 1, all under char limits.
- [ ] **[Either]** (P1) Call asset live with **call reporting ON**; sitelinks/callouts/snippets attached; all URLs resolve to `/auto-detailing-websites/`.
- [ ] **[Either]** (P1) Geo = US, **Presence** only; auto-tagging ON; bidding = Maximize Clicks (capped) or Manual CPC; daily budget set.
- [ ] **[Bill]** (P1) Phone (740) 617-6488 verified in-account and you can actually answer during scheduled call hours.
- [ ] **[Either]** (P0) **Enable the campaign** — and immediately confirm impressions/clicks start registering and the conversion column isn't throwing errors.

---

## 9. First 2–4 Weeks After Launch

### Daily / every 2–3 days
- [ ] **[Either]** (P1) **Mine the Search Terms report every 2–3 days** — push every consumer/irrelevant term into the negative list; promote winning owner-intent terms to Exact.
- [ ] **[Either]** (P1) Watch the **conversion column** — confirm leads are recording and reconcile against actual emails in `bilsonxnc@gmail.com` (catch silent Web3Forms failures or spam-foldering).
- [ ] **[Either]** (P2) Watch **Search Partners** quality separately; pause it if its traffic doesn't convert.

### Weekly
- [ ] **[Bill]** (P1) **Ramp budget ~20–30%/week** (not overnight spikes) and audit ads + LP for policy drift before each increase.
- [ ] **[Either]** (P2) Review **Day/Hour, Devices, and Geo** reports — trim dead dayparts, note which states/metros convert; apply device/geo bid adjustments only once you have device/geo-level conversion data.
- [ ] **[Either]** (P2) Check **Enhanced Conversions match-rate** diagnostic (appears ~24–48h) and confirm the imported GA4 `generate_lead` is logging as Secondary without double-counting.

### Bidding ladder (gated on conversion volume — don't rush)
- [ ] **[Either]** (P2) After tracking verified + **~5–15 conversions**, switch to **Maximize Conversions (no target)**; expect 7–14 days learning — don't change budget/goals in that window.
- [ ] **[Either]** (P2) After **≥15 (ideally ≥30) conversions in trailing 30 days**, add **Target CPA** near the observed CPA (don't lowball); hands-off 1–2 weeks. Every target/budget/goal change resets learning — batch changes.
- [ ] **[Either]** (P2) If volume stays thin, **concentrate budget into the 1–2 best ad groups** rather than spreading across all 4–6.

### Later / scale
- [ ] **[Either]** (P3) Once Search produces **~30+ conversions/30 days** (and ideally offline-conversion import shows which leads became customers), test a **small Performance Max or Demand Gen** campaign on a separate budget — never as a replacement for Search.
- [ ] **[Bill]** (P3) Revisit a small, well-negatived **"alternatives" (competitor) ad group** only once the core campaign is profitable.
- [ ] **[Either]** (P3) Reassess whether to keep the **double (partial + final) lead email** or thread/label the `[PARTIAL]` ones, based on how the lead flow feels in practice.