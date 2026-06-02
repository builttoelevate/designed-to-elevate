# Quote Wizard Form Audit — Auto Detailing Landing Page

**Page:** `/auto-detailing-websites` (Google Ads landing page)
**Component audited:** [QuoteFlowSection.astro](src/components/landing/QuoteFlowSection.astro) — the 5-step "Build My Estimate" form only
**Submit handler:** [LandingLayout.astro](src/layouts/LandingLayout.astro)
**Pricing source of truth:** [PRICING.md](PRICING.md)
**Date:** 2026-05-29
**PDF:** `AUTO_DETAILING_FORM_AUDIT.pdf` (same content, formatted)

---

## Bottom line

The form is **well built and on the right strategy.** It uses the single highest-converting pattern available for a local-service site — an interactive quote calculator instead of a "contact us" box (independent studies put that at **200–400% more conversions**). The 5-step structure, the progress bar, the no-personal-info first question, the partial-lead capture, and the price positioning are all things you'd want to see. Pricing is **100% consistent** across the form, the page, and `PRICING.md`, and the internal-only care plans are correctly kept off it.

**One thing must be fixed before you spend a dollar on Google Ads:** the form fires **no conversion signal** when someone submits. No Google Ads tag, no GA4, no GTM container exist anywhere, and the submit success branch doesn't even push an internal event. You'd be paying for clicks blind. **This is a launch blocker.**

Beyond that: one functional bug to verify/harden (Enter key can submit early), and two conversion levers worth testing (requiring a phone number, and gating the price reveal behind contact info). Everything else is polish.

### Priority scoreboard

| Priority | Count | Meaning |
|---|---|---|
| 🔴 P0 — launch blocker | 1 | Do not run paid ads until fixed |
| 🟠 P1 — fix before launch | 3 | A real bug or measurable conversion leak |
| 🟡 P2 — test / fix soon | 4 | Low effort, likely upside |
| ⚪ P3 — polish | 3 | Nice to have |
| ✅ Verified strong | 10+ | No action — see "What's already working" |

---

## What's already working (validated against research)

| Strength in the form | Why it matters |
|---|---|
| It's a quote calculator, not a contact form | Interactive quote tools convert **200–400% better** and self-qualify leads |
| Multi-step (5) + progress bar + "Step X of 5" + "~60 sec" | Multi-step converts ~**86% higher**; visible progress adds **20–30%**; 4–5 steps is ideal for high-consideration buys |
| Step 1 asks zero personal info | Easy, commitment-free opener = more people start (and finishers) |
| Only 2 required fields (name + phone) | 3–5 fields is optimal; business + email correctly optional |
| Partial-lead capture before the reveal | Name/phone saved a step *before* the price, so abandoners still land in the inbox |
| Honeypot anti-spam + graceful error fallback | Blocks bots; failed sends tell the user to call/text instead of dead-ending |
| Accessibility fundamentals | Live step announcement, progress-bar ARIA, alert roles, focus management, no-JS fallback |
| Honest expectation-setting copy | "Ballpark, not a contract," "replies within 24 hours," "no spam, no list-selling" |

---

## Findings by priority

### 🔴 P0 — No conversion tracking fires on submit

No Google Ads tag, GA4, or GTM container exists. The form pushes `quote_step` / `quote_partial_lead` to a `dataLayer`, but nothing receives them — and the **success branch pushes no event and fires no Ads conversion.** [LandingLayout.astro](src/layouts/LandingLayout.astro) (~line 387) still has only the placeholder comment.

**Why it blocks launch:** you'd pay per click with zero signal on quotes; Smart Bidding has nothing to optimize; cost-per-lead is invisible. The page's own FAQ even sells "a clean conversion event to optimize against."

**Fix — Part A (accounts, not code):** create a "Quote Wizard Submit" conversion action in Google Ads (→ Conversion ID + Label); optionally add GA4/GTM for the funnel data the form already emits; exclude your own IP.

**Fix — Part B (code):** load the tag async in the shared `<head>`, then in the `if (response.ok && result.success)` block:
```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: 'quote_submit' });
gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXXX/yyyyyyyy' });
```
> Matches the project memory note "No site-wide conversion tracking." It's a site-wide gap, not just this page.

### 🟠 P1 — Pressing Enter on Step 4 can submit the form early

Step 4 has four text inputs; the only `type="submit"` is on Step 5 ([line 360](src/components/landing/QuoteFlowSection.astro#L360)). Validation is wired to the "Continue" buttons, **not** the form submit event, and there's no `keydown` guard. So hitting Enter after typing a phone/email can trigger implicit submission — skipping the estimate and sending an incomplete payload, possibly showing "Quote request sent" without a price.

**Fix:**
```js
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && !steps[current].hasAttribute('data-estimate-step')) {
    e.preventDefault();
    steps[current].querySelector('[data-next]')?.click();
  }
});
```
Verify live on phone + desktop before launch regardless.

### 🟠 P1 — Phone required, email optional — consider "phone OR email"

A **mandatory phone field is the biggest field-level conversion killer** (up to ~50% drop). This is a higher-intent B2B lead so a phone is useful — the fix isn't to drop it, it's to require **at least one** of phone/email.

**Fix:** remove `required` from phone ([line 265](src/components/landing/QuoteFlowSection.astro#L265)); enforce "≥1 of phone/email" in `stepValid()` ([line 623](src/components/landing/QuoteFlowSection.astro#L623)); update the error copy ([line 277](src/components/landing/QuoteFlowSection.astro#L277)); add `inputmode="tel"` for the mobile number pad.

### 🟠 P1 — Price is shown only after contact is taken — test reversing it

Quote calculators out-convert contact forms largely because they give the number **first**, killing "is this even in my budget?" anxiety. The current flow takes contact on Step 4, reveals price on Step 5 — trading some lift for guaranteed capture (softened because full prices appear above the form).

**Recommendation:** once tracking is live, A/B test showing the ballpark on Step 4 and asking contact on Step 5 ("Send the detailed quote to…"), keeping partial capture by firing when the estimate displays. This is the single highest-leverage test on the page — don't change it blind.

### 🟡 P2 — Every completed lead emails Bill twice

A `[PARTIAL]` email fires leaving Step 4, then the full email on submit (lines [645–657](src/components/landing/QuoteFlowSection.astro#L645)). The 30s de-dupe only stops rapid back/forth, not the partial+final pair. Confirm Bill wants both, or thread/label them (filter `[PARTIAL]` into its own Gmail label). Recommended to keep for a new page — never lose a lead.

### 🟡 P2 — Whole form depends on one free third-party (Web3Forms)

Submissions go to Web3Forms with a public access key. If it's down/rate-limited/disabled, leads fail silently. **Do a live end-to-end test, confirm the inbox + spam, and consider a paid plan / backup recipient + periodic test once ads spend.**

### 🟡 P2 — Phone field accepts anything

`type="tel"` with no pattern → "asdf" passes. Add a light ≥10-digit check in `stepValid()` (not a strict format) plus the `inputmode="tel"` above.

### 🟡 P2 — Step 2 asks the buyer to make a product decision

"Just the wizard / new site / not sure" adds mild cognitive load, but is needed for pricing and well-mitigated by "not sure." Watch its drop-off once analytics are live.

### ⚪ P3 — Polish
- "About 60 seconds" is realistically ~90s — fine as a hook.
- Add a "see your price next →" cue near the Step-4 submit.
- Consider auto-advancing single-choice steps (2, timeline, budget) — not the multi-selects (1, 3).

---

## Pricing audit — all consistent, no drift

| Tier | Form logic | Page cards | PRICING.md | Match |
|---|---|---|---|---|
| Form T1 — Quote | $997 | $997 | $997 | ✅ |
| Form T2 — Quote + Reviews | $1,497 | $1,497 | $1,497 | ✅ |
| Form T3 — Quote + Booking | $2,497 | $2,497 | $2,497 | ✅ |
| Website T1 — Starter Site | $1,497 | $1,497 | $1,497 | ✅ |
| Website T2 — Quote Site | $2,497 | $2,497 | $2,497 | ✅ |
| Website T3 — The Works | $4,497 | $4,497 | $4,497 | ✅ |

- **Care plans correctly hidden** ($97/$197/$297 never appear in the estimate; panel says "install only / no required monthly").
- **Budget buckets map to the right tiers**; the over/under-budget mismatch note is logically sound.
- **Routing floor is sensible** — a "new site with the wizard" visitor is never recommended the wizard-less Starter Site.
- **Schema matches** ($997–$4,497).

**Market positioning:** 2025 guides put a custom small-business site at **$3,000–$15,000** (freelancers $1k–$5k; 10+ page custom w/ SEO & lead-gen $5k–$8k), plus **$150–$500/mo** ongoing. Your form quotes **$997–$4,497 one-time, no required monthly, full ownership** — and delivers a working quote engine, not a brochure. Affordable end of the market, higher-value product. Confirms the internal note that there's room to raise prices later with proof.

---

## Step-by-step copy & "right questions?" review

| Step | Question | Verdict |
|---|---|---|
| 1 — Services | "Which of these does your shop do?" (multi, no PII) | ✅ Right question, right place — easy opener. Keep. |
| 2 — Product line | "What do you need from us?" | Needed for pricing; well-written + "not sure" escape. Minor load — watch drop-off (P2). |
| 3 — Goals | "What should the site actually do?" (7 options) | ✅ Outcome-framed, drives the recommendation. Seven is the max — fine as multi. |
| 4 — Timeline/budget/contact | "Last few — then your estimate." | Strong momentum + trust copy. Test phone-required (P1) and contact-before-price (P1). |
| 5 — Estimate + submit | "Your shop looks like a fit for [tier]." | ✅ Personalized reward, honest framing, clean CTA, call/text fallback. |

**Voice check:** no "solutions," no "guaranteed results," no fake metrics, no Fitchin dollar figures. Reassurance copy on-brand and well-placed. Passes.

---

## Pre-launch checklist (form)

1. **[P0]** Create the Ads conversion action + (rec.) GA4/GTM; fire it in the submit success branch.
2. **[P1]** Add the `keydown` guard so Enter advances, not submits; test phone + desktop.
3. **[P1]** Switch contact to "phone OR email" required; add `inputmode="tel"`.
4. **[P2]** Live end-to-end test submission → confirm inbox (not spam) + correct routing.
5. **[P2]** Decide on partial-vs-final double email (keep, or thread/label).
6. **[P2]** Add a light phone-format check.
7. **[P1]** After ~2 weeks of data, run the "show price before contact" A/B test.

---

## Sources

- **Multi-step / step count:** [Venture Harbour](https://ventureharbour.com/multi-step-lead-forms-get-300-conversions/), [LeadGen Economy](https://www.leadgen-economy.com/blog/multi-step-forms-conversion-optimization/), [Zuko](https://www.zuko.io/blog/single-page-or-multi-step-form)
- **Field count / phone-vs-email:** [Keap](https://keap.com/small-business-automation-blog/marketing/digital-marketing/lead-gen-form-best-practices), [REM Web Solutions](https://www.remwebsolutions.com/blog/best-form-fields-number), [Neil Patel](https://neilpatel.com/blog/the-definitive-guide-to-lead-generation-form-optimization/), [Brixon (B2B)](https://brixongroup.com/en/lead-forms-in-b2b-the-perfect-balancing-act-between-data-depth-and-conversion-rate)
- **Quote calculators vs contact forms:** [Silver Spider Media](https://silverspidermedia.com/blog/quote-calculator-vs-contact-forms), [Quotify](https://quotify.app/quoting-tools-vs-traditional-contact-forms-whats-more-effective/)
- **Website pricing benchmarks (2025):** [Devine Solutions Group](https://devinedigitalmarketing.com/how-much-does-a-website-cost-in-2025-real-industry-averages-small-business-owners-can-trust/), [Leadpages](https://leadpages.com/blog/average-cost-of-website-design-for-small-business), [Lounge Lizard](https://www.loungelizard.com/blog/small-business-website-development-cost/)
