# Auto Detailing Landing Page — Pre-Launch Audit

**Page:** `/auto-detailing-websites` ([src/pages/auto-detailing-websites.astro](src/pages/auto-detailing-websites.astro))
**Wizard:** [src/components/landing/QuoteFlowSection.astro](src/components/landing/QuoteFlowSection.astro)
**Date:** 2026-05-29
**Method:** 7 parallel audit lenses (wizard QA, Google Ads readiness, conversion/copy, voice/brand, performance/SEO, accessibility, checklist compliance) against the real source + [DETAIL_TINT_QUOTE_PAGE_CHECKLIST.md](DETAIL_TINT_QUOTE_PAGE_CHECKLIST.md). Every launch-critical finding was then independently re-verified against the code. 54 findings total.

---

## Bottom line

The page is **strong**. Copy, structure, the persuasion arc, message-match, pricing consistency, and voice rules all pass the checklist. The wizard logic works. Color contrast passes. Schema is valid.

There is **one hard blocker** before Google Ads: **the page has zero conversion tracking.** Everything else is fix-before-launch or polish.

> **Heads-up — what's live now is a stale deploy.** The version being launched lives on the `claude/pricing-public-internal-split` branch and still needs to merge + deploy. (That's why the live page shows PageSpeed scores that aren't in the current source.)

### Priority summary

| Priority | Count | Meaning |
|----------|-------|---------|
| 🔴 P0 — launch blocker | 1 root issue (tracking) | Do not run ads until fixed |
| 🟠 P1 — fix before launch | 4 | Hurts conversion or money |
| 🟡 P2 — quick wins | 6 | Should fix soon, low effort |
| ⚪ P3 — polish | several | Nice-to-have |
| ✅ Verified clean | many | No action — see "What passed" |

---

## 🔴 P0 — LAUNCH BLOCKER: No conversion tracking exists

**Verified by 4 independent agents.** There is no Google Ads tag, no GA4, no GTM container, and no PostHog anywhere in the project. [LandingLayout.astro:317](src/layouts/LandingLayout.astro#L317) is only a comment: *"Add Google Ads conversion tracking inside the success branch when ready."*

**Why it blocks launch:** You would pay Google for every click with zero signal on whether anyone submitted a quote. Smart Bidding has nothing to optimize toward, and cost-per-lead is invisible. Fails the §18 + §19 "Launch Gate" of the checklist. Ironically the page's own FAQ ([line 326](src/pages/auto-detailing-websites.astro#L326)) sells "a clean conversion event to optimize against" — a promise it doesn't keep.

**It's a site-wide gap, not just this page.** The `/upgrade` page has a `dataLayer` event scaffold, but it's currently inert because no container is loaded anywhere to receive it.

### Fix — Part A (needs your accounts; I can't do this)

```
1. Google Ads → Tools → Conversions → New conversion action → Website
   → Name "Quote Wizard Submit", category "Submit lead form"
   → Gives you a Conversion ID (AW-XXXXXXXXXX) + Label (yyyyyyyy)

2. (Recommended) Create a GA4 property OR a GTM container
   → GA4 → Measurement ID (G-XXXXXXXXXX)
   → or GTM → Container ID (GTM-XXXXXXX)
   → This is what actually collects the funnel/drop-off events.

3. In GA4 + Google Ads, exclude your own IP so test submits
   don't pollute day-one bidding data.
```

### Fix — Part B (code; can be built with placeholder IDs you swap in)

- Add the tag to the shared `<head>` in [LandingLayout.astro](src/layouts/LandingLayout.astro) (async — non-render-blocking).
- Fire the Ads conversion on the wizard's existing `audit-form:success` event ([LandingLayout.astro:367](src/layouts/LandingLayout.astro#L367)).
- Port the `/upgrade` event scaffold ([upgrade.astro:143-197](src/pages/upgrade.astro#L143)) into this page, but point the observer at `#quote` (the wizard), **not** `#apply`, and change the CTA-click selector to `a[href^="#quote"]`.
- Add per-step `quote_step` events in the wizard's `show()` function ([QuoteFlowSection.astro:581](src/components/landing/QuoteFlowSection.astro#L581)) so you can see exactly where people drop off.

---

## 🟠 P1 — Fix before launch

### 1. Sticky mobile CTA covers the wizard's own buttons
**Verified (downgraded P0→P1 — not a hard block, but hits the conversion tap).**
On mobile, while a user fills the wizard, the bottom "Build My Estimate / Call-Text" bar stays on screen and can sit on top of the **"Continue" / "Send my detailed quote"** buttons. Its "Build My Estimate" button also just re-scrolls to where the user already is.
- **Cause:** the observer in [LandingLayout.astro:282](src/layouts/LandingLayout.astro#L282) only watches `#apply` (bottom CTA), not `#quote` (the wizard).
- **Fix:** add a third IntersectionObserver on `#quote` with a low threshold (0.01) and hide the bar when the wizard is visible: `const show = !heroVisible && !formVisible && !quoteVisible;`. Also update the stale comment at [auto-detailing-websites.astro:1103](src/pages/auto-detailing-websites.astro#L1103).

### 2. Phone mockup is a 1.87 MB PNG
[fitchin-mobile.png](src/pages/auto-detailing-websites.astro#L453) is a photo-like screenshot saved as PNG (~10× too big). All images ship as raw JPG/PNG with no AVIF/WebP.
- **Fix:** convert `fitchin-mobile.png` and the 3 `/wizard/*.png` screenshots to WebP/AVIF (→ well under 200 KB). Consider serving a smaller hero variant to mobile via Astro `<Image>`.

### 3. Testimonial has no result in it
The Eric Fitch quote ([line 730](src/pages/auto-detailing-websites.astro#L730)) is real and on-brand but all process praise ("smooth and stress-free") — zero outcome. Checklist §8/§19 explicitly require *"a testimonial with a result."*
- **Fix:** ask Eric for one outcome sentence (e.g. "customers get a price before they call now"). **Do not invent a metric** in his voice (voice rules).

### 4. Speed has never been measured
Checklist §17/§19 make "<3s, verified by Lighthouse" a hard gate. It's only been assumed.
```
1. Build + deploy this branch (or run a preview build).
2. Run Lighthouse mobile + desktop on the deployed URL
   (Chrome DevTools → Lighthouse, or PageSpeed Insights).
   → record Performance / Accessibility / Best-Practices / SEO
3. Confirm LCP < 2.5s and CLS < 0.1 on mobile.
```

---

## 🟡 P2 — Quick wins (batch these)

- **Remove Montserrat from the font load** — [LandingLayout.astro:92](src/layouts/LandingLayout.astro#L92) downloads it but it's used **zero** times. Change the href to `family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap`.
- **"Sending your application…" is wrong copy** — leftover from `/grow`. Change [LandingLayout.astro:347](src/layouts/LandingLayout.astro#L347) to `'Sending your request…'` and [line 397](src/layouts/LandingLayout.astro#L397) to "Couldn't send your request…".
- **This noindex page is in the sitemap** — [astro.config.mjs](astro.config.mjs) excludes `/grow` but not this page. Add `&& !page.includes('/auto-detailing-websites')` (and audit other noindex landing pages the same way).
- **Make the wizard require phone OR email, not both** — drop `required` from the email input ([QuoteFlowSection.astro:263](src/components/landing/QuoteFlowSection.astro#L263)), enforce "at least one" in `stepValid`, and update the error copy at [line 271](src/components/landing/QuoteFlowSection.astro#L271). Safe win — prices are already visible above the wizard.
- **Budget options lose the keyboard focus ring** — the JS re-render at [QuoteFlowSection.astro:489](src/components/landing/QuoteFlowSection.astro#L489) drops the `has-[input:focus-visible]:ring-*` classes. Reuse the shared `cardCls` constant instead of a hardcoded string.
- **Skip link points to the wrong target** — [LandingLayout.astro:96](src/layouts/LandingLayout.astro#L96) says "Skip to application form" but `#apply` is the bottom CTA, not the form. Make it page-driven and point this page's at `#quote`.

---

## ⚪ P3 — Polish

- **Delete the leftover `console.log`** on every submit ([LandingLayout.astro:361](src/layouts/LandingLayout.astro#L361)) — its own comment says "remove later." (Confirmed not an info-leak; just hygiene.)
- **Wizard step changes aren't announced to screen readers** — focus drops to `<body>` on each transition. Move focus to the new step's heading and add `aria-live="polite"` to the "Step X of 5" label ([QuoteFlowSection.astro:112](src/components/landing/QuoteFlowSection.astro#L112)).
- **Validation errors aren't announced** — add `role="alert"` to each `[data-error]` paragraph (lines 150, 175, 198, 271).
- **Progress bar has no ARIA** — add `role="progressbar"` + `aria-valuenow` to [line 116](src/components/landing/QuoteFlowSection.astro#L116).
- **H1 opens lowercase** — title-casing "Auto Detailing Websites That Quote the Job…" sharpens the match to a title-case Google ad headline.
- **Pricing = 6 stacked cards on mobile** — add a one-line "Keeping your site? / Need a new site?" framer above each line so skimmers self-select.
- **Operator-credibility line missing** — a short "built by someone who ran a real shop, not an agency theorist" line near the case study (revenue-free, per voice rules).
- **Proof screenshot alt text is thin** — uses the 3-word title; the fuller description sits adjacent so it's acceptable.
- **No-JS dead-end** — if JS fails, a visitor is stuck on step 1. Add a small `<noscript>` "call/text Bill" fallback in the wizard card.

---

## Form wizard walkthrough (traced all 5 steps)

**It is set up correctly and working:** services → product-line routing → goals → timeline+budget+contact → estimate. Every step validates (nothing can be skipped), the tier recommendation matches checklist §15, the honeypot anti-spam is present, and **partial-lead capture works** — name/phone/email is captured the step *before* the reveal, so abandoners still land in the inbox.

Upgrades worth making:
- **Recommendation edge case:** a "new website *with the wizard*" visitor whose only goal is "Rank on Google locally" gets recommended the **Starter Site — the one tier with no wizard** ([QuoteFlowSection.astro:453](src/components/landing/QuoteFlowSection.astro#L453)). Make the Quote Site the floor for that path, or add the "wizard is one upgrade away" note the checklist calls for.
- **Two emails per completed lead** (a `[PARTIAL]` then the full one), and the partial is missing the recommended tier because `buildEstimate()` runs after `firePartial()`. Compute the estimate before firing the partial, and confirm Bill wants the double email.
- **No-JS fallback** (see P3).

---

## What passed — verified clean (no action)

- **Voice/brand:** no "solutions," no "guaranteed results," no skyrocket/10X/dominate, no fake scarcity, no Fitchin dollar amounts. Brand-thesis line "Most websites stop at the click…" used verbatim in the right spots.
- **Pricing consistency:** all six tiers match across the cards, FAQ, and wizard `TIERS` object, and against `PRICING.md`. Care plans ($97/$197/$297) correctly absent (install-only).
- **Message match / Quality Score:** keyword in H1, single conversion path, nav stripped, primary CTA repeated. `noindex` confirmed does **not** block Google Ads.
- **Structure:** matches the checklist's canonical section order.
- **Accessibility fundamentals:** native controls, real `aria-live` status, decorative images handled. **Color contrast passes** (dimmest text is 7.24:1 — well above AA).
- **Markup/SEO:** exactly one H1, clean heading hierarchy, valid Service + FAQ + Breadcrumb JSON-LD, AggregateOffer bounds correct, hero LCP image eager + `fetchpriority=high` with explicit dimensions (no CLS), 390px above-the-fold fits.

---

## §19 Launch Gate status

9 of ~11 gate clusters pass. The failing/at-risk ones:
- **Tracking** — hard fail (P0). No Ads conversion, no events firing, no internal-traffic filter.
- **Proof** — testimonial-with-a-result not met (P1).
- **UX/Technical (speed)** — not verified by Lighthouse (P1).

**Verdict: do not send paid traffic until conversion tracking exists.** Everything else is conversion polish that can follow.

---

*Full machine-readable findings (all 54, with evidence and verification verdicts) were produced by the audit workflow run `wf_7206c4f8-f68`.*
