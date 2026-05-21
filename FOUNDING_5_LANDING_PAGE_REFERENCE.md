# Designed to Elevate — Founding 5 Landing Page Reference

**For:** Claude Code
**From:** Bill (project owner)
**Status:** Reference document — use this for context, judgment, and intent. You have creative latitude on implementation.

---

## What this document is

This is a strategy and intent document, not a step-by-step checklist. Read it the way a senior developer reads a design brief — to understand the goal, the audience, and the constraints — then make the call on the cleanest way to ship it.

If you spot a better approach than what I describe here, take it. If you see contradictions in this doc, resolve them in favor of whatever helps a service business owner click the CTA. I trust your judgment on file structure, component breakdown, and code-level decisions.

The pieces I'm *not* flexible on are flagged clearly. Everything else is a recommendation.

---

## The 60-second context

I'm Bill. I run Designed to Elevate, a brand-new agency for local service businesses. The current landing page (in `src/pages/grow.astro`) is well-designed but it's a brochure with a free audit at the end — it doesn't sell. I'm about to spend money on Google Ads to drive traffic to it, and I need to fix it first or I'll burn cash.

The fix: turn the page into a **Founding 5 offer**. I'm taking 5 service businesses at heavily discounted launch pricing in exchange for testimonials, case studies, and referrals. After 5, prices jump to standard rates. This gives me a real reason to be cheaper without looking desperate.

The whole page needs to orbit around this offer.

---

## What's already good (don't break these)

The current page has strong bones. Specifically:

- The "Google search → quote request → booked job" framing is the brand. Keep that line — it shows up in the hero subhead, the system section, and the final CTA. It's the whole pitch in one sentence.
- The Fitchin quote wizard screenshots and the live site showcase are real proof. Don't cut them.
- The dark theme, orange accent color, Space Grotesk + Inter type pairing, and the existing card / eyebrow / btn-primary / btn-ghost component patterns all work. Match these — don't reinvent the design system.
- The grid-bg and accent-glow effects used in the hero and final CTA are good visual texture. Reuse them.
- The mobile-first layout is fine. The page works on phones today; keep it that way.

The general aesthetic should NOT change. This is a re-positioning, not a redesign.

---

## What's wrong with the current page

In priority order:

1. **No offer ladder.** The only path is "free audit → ???". A buyer who's ready right now can't see what working with me costs or what packages exist. This is the #1 problem.
2. **Pain points sound like agency-speak**, not like what people actually type into Google when they're frustrated.
3. **The hero leads with features** ("websites, Google listing, quote system") instead of pain or outcome.
4. **No phone number anywhere.** Service business owners call. They don't fill out forms first.
5. **No FAQ section.** Every objection a buyer has goes unanswered.
6. **The audit name is generic.** "Free Growth Audit" is what every agency offers.
7. **The form's "biggest challenge" textarea** is a friction point. People hate blank boxes.

We're fixing all seven in this pass.

---

## The Founding 5 offer — the heart of the page

This is the framing for the entire page:

> We're opening 5 founding client spots at locked-in, heavily discounted pricing. In exchange, founding clients agree to give honest feedback, a testimonial if happy, and permission to use the project as a case study. After 5 spots, prices return to standard rates.

Why this works: it's not "I'm cheap." It's "I'm strategically discounted while building proof." It's confident, finite, and gives the visitor a reason to act *now*.

This framing should appear:

- In a banner or callout near the top of the page (above or inside the hero)
- In the hero copy itself
- In the pricing section
- In the FAQ
- On every primary CTA button

Treat the founding offer as the spine. Every section either sets it up, supports it, or closes it.

---

## Final pricing — these numbers are locked

Three packages. Lead Engine is "Most Popular."

### Foundation
- **Founding price:** $1,495 one-time
- **Future price:** $2,500 (show as strikethrough)
- **For:** A business that has something online but it isn't bringing in calls or quote requests
- **Includes:** Conversion-focused homepage or landing page improvement, mobile-first layout, clear service sections, call/text/quote CTAs, basic local SEO structure, Google Business Profile review, lead form improvement
- **Delivery:** 7–14 days

### Lead Engine ⭐ Most Popular
- **Founding price:** $2,495 one-time + $245/month
- **Future price:** $4,500 + $500/month (show as strikethrough)
- **For:** A service business that wants the whole path improved — Google search to website visitor to quote request to booked job
- **Includes:** Everything in Foundation, plus conversion-focused service pages, custom quote/contact flow, Google Ads landing page, local SEO content direction, review/trust strategy, monthly improvement support, performance check-ins
- **Delivery:** 14–21 days

### Custom Lead System
- **Founding price:** $4,495 one-time + $545/month
- **Future price:** $8,500 + $1,200/month (show as strikethrough)
- **For:** A higher-ticket service business that wants a real custom system — not just a website
- **Includes:** Everything in Lead Engine, plus a custom quote wizard with tiered package logic, upsell and add-on flow, advanced lead capture, multi-service quote paths, booking/request strategy, performance reviews
- **Delivery:** 21–30 days

**Important:** Show all three prices clearly. Do not hide them. Do not say "starting at" — say the actual founding price with the future price struck through next to it. The strikethrough is what creates urgency.

The pricing section needs a counter line: **"3 of 5 founding spots remaining"** (placeholder — I'll update manually as spots fill).

---

## The new hero

Replace the current hero copy with this direction. You can polish the wording — what matters is the structure.

**Eyebrow:** Founding Client Offer · 5 Spots Remaining

**H1:** Get More Calls, Quote Requests, and Booked Jobs From Your Website

**Subhead:** Designed to Elevate helps local service businesses fix the online gaps that cost them leads. We build the path from Google search to quote request to booked job — and we're opening 5 founding client spots at locked-in launch pricing.

**Primary CTA:** Claim My Founding 5 Spot

**Secondary CTA:** See the Founding Pricing (anchor link to the pricing section)

**Trust line:** Built from real service business experience, not agency theory.

**Three pill bullets (keep these):** Websites That Convert · Quote Forms That Help Sell · Google Visibility That Grows

**Right-side visual:** Keep the existing Fitchin wizard screenshot. It's the strongest single piece of proof on the page.

**Below the hero, add a proof line:** "Builder of the Fitchin quote wizard — a custom 378-vehicle pricing system that turns Google searches into booked tint jobs."

---

## Pain points — rewrite using searched language

Five cards. The current cards are written in agency-speak. Replace them with these — written the way an owner actually thinks at 11pm when they're frustrated.

### Card 1
**Headline:** Your phone isn't ringing and you don't know why.
**Body:** You're paying for a website. You're on Google. You've got reviews. But the calls aren't coming in. Usually it's not a traffic problem — it's that nothing on the site tells the visitor what to do, when to do it, or why you over the next guy.
**Link text:** Fix website conversion

### Card 2
**Headline:** Your competitors keep showing up above you on Google.
**Body:** The shop down the road has worse work and better rankings. Usually that's three things — Google Business Profile setup, review velocity, and on-site service pages. All fixable.
**Link text:** Improve Google visibility

### Card 3
**Headline:** You're spending money on ads and getting nothing back.
**Body:** Local service ads cost $80–$150+ per lead in 2026. If you're sending paid traffic to a homepage instead of a built-for-ads landing page, you're lighting money on fire. The ads aren't broken. The page is.
**Link text:** Fix the landing page first

### Card 4
**Headline:** Customers ask for a quote and ghost you.
**Body:** You text back, they don't reply. They say "we'll think about it" and book the cheaper guy. The quote process itself is where you lose them — too slow, too vague, no anchor pricing, no easy yes.
**Link text:** Build a smarter quote flow

### Card 5
**Headline:** Customers keep choosing the cheapest option.
**Body:** When your value isn't explained well, price wins by default. The right service packaging, copy, and quote logic helps customers understand why your work is worth more before they ever call.
**Link text:** Package your services better

---

## New section: Founding Pricing

This is a new section that goes between the existing live work showcase and the audit form. It's the most important new section on the page.

**Section eyebrow:** Founding Pricing · Limited

**Section H2:** Founding Client Pricing — Locked In For Life

**Subhead:** We're opening 5 spots at heavily discounted launch pricing. After 5, prices return to standard rates. Founding clients lock in their rate for as long as they stay subscribed — even when standard rates double.

**Below the headline:** A "3 of 5 spots remaining" counter line.

**Then the three pricing cards** (Foundation / Lead Engine / Custom Lead System) — Lead Engine in the middle, marked "Most Popular" with a clear visual highlight (orange accent, slightly elevated, badge).

**Each card needs:**
- Package name
- The "for who" line
- Founding price (large, prominent)
- Future price (small, strikethrough, next to or below the founding price)
- "Locked in for life" mention
- Bulleted what's-included list (pull from the pricing section above)
- Delivery timeline
- CTA button: "Claim This Founding Spot"

**Below the cards, a small line:** "Not sure which package fits? Start with a free Lead Leak Audit and we'll recommend the right one." (Anchor link to the audit form.)

---

## Rename the audit everywhere

Every instance of "Free Growth Audit" or "Growth Audit" becomes **Free Lead Leak Audit**.

This includes:
- Hero secondary CTA
- The dedicated audit section
- The form button
- The sticky mobile CTA
- The header CTA
- Final CTA section
- Page title and meta description

The category can still be called "growth" elsewhere if it makes a sentence flow — but the *named offer* is the Lead Leak Audit.

---

## New section: How It Works (replaces or merges with current Process section)

Keep this short. Four steps:

1. **Apply** — Tell us about your business and pick the package that fits (or let us recommend).
2. **Free Lead Leak Audit** — We review your website, Google presence, quote flow, and lead path. You get a clear report whether you hire us or not.
3. **Build** — Once you're in as a founding client, we ship in 7–30 days depending on the package.
4. **Launch & Improve** — We launch, track performance, and keep optimizing the customer path.

The existing Process section is fine structurally. Replace the copy with the above.

---

## New section: FAQ

Add this between the audit form and the final CTA. Six questions.

1. **What's the catch with founding pricing?**
   No catch. We're trading discounted rates for testimonials, case studies, and referrals — the things every new agency needs to grow. After 5 founding clients, prices return to standard rates.

2. **What happens to my rate after the founding period ends?**
   Founding clients keep their locked-in rate for as long as they stay subscribed. When prices go up, yours doesn't.

3. **Do I need a brand-new website, or can you improve what I have?**
   Sometimes the fastest win is fixing the homepage, service pages, quote form, or landing page before rebuilding everything. The free Lead Leak Audit will tell us which.

4. **Who is this for?**
   Local service businesses doing $200K+/year — auto detail shops, tint shops, barbershops, contractors, cleaners, landscapers, HVAC, roofing, pest control, and similar. Not for brand-new startups, e-commerce, or non-service businesses.

5. **Do you run Google Ads for me too?**
   Lead Engine and Custom Lead System include the landing page and strategy. Ad management itself is a separate add-on once we know the page is converting.

6. **What makes this different from a regular agency?**
   The system was built inside real local service businesses, not in an agency conference room. Everything I recommend has been tested where it had to actually work. If it didn't move the needle, I don't sell it.

Use a simple accordion pattern or just stacked Q&A — your call. Match the existing card aesthetic.

---

## Form changes

Current form has a "biggest challenge" textarea. Replace with checkboxes:

**What do you need help with most?** (multi-select checkboxes)
- Website not bringing in leads
- Not showing up high enough on Google
- Need more quote requests
- Ads aren't working
- Need a better booking or quote flow
- Getting too many cheap leads
- Need help packaging services
- Not sure what's wrong

**Add a small textarea below:** "Anything else you want us to know? (Optional)"

**Add a new dropdown above the checkboxes:** "Which package interests you most?"
- Just want the free Lead Leak Audit
- Foundation ($1,495)
- Lead Engine ($2,495 + $245/mo)
- Custom Lead System ($4,495 + $545/mo)
- Not sure yet

This dropdown is critical — it tells me which leads are warm and which are cold so I can prioritize follow-up.

**Keep these existing fields:** Name, Business Name, Website URL, Phone, Email.

**Submit button text:** "Claim My Founding 5 Spot"

---

## Phone number — required

Phone number to use: **740-617-6488**

Add it in three places:

1. **Header** — Replace or sit next to the current "Get My Free Growth Audit" CTA in the header. Make it a tap-to-call link (`tel:7406176488`). Show a phone icon.
2. **Sticky mobile bottom bar** — Currently there's a single "Get My Free Growth Audit" button. Split it into two equal-width buttons: "Call/Text Bill" (left, ghost style) and "Claim Founding Spot" (right, primary style).
3. **Above the audit form** — A small line like "Prefer to talk? Call or text Bill at (740) 617-6488"

---

## CTA hierarchy across the page

Standardize on one primary CTA throughout. The button text everywhere should be **"Claim My Founding 5 Spot"** (or close variants — feel free to vary slightly section by section so it doesn't feel robotic).

The audit form is the conversion event. All primary CTAs anchor to `#audit-form`.

Secondary CTAs can include:
- "See the Founding Pricing" → anchors to pricing section
- "See It Working" → anchors to live showcase
- "Call/Text Bill" → tel: link

Don't have more than 2 CTAs visible in any one section. Don't repeat "Get My Free Growth Audit" anywhere — that name is dead.

---

## Recommended page order

This is the order I think works. If you see a reason to reorder, do it.

1. Header (logo + phone + CTA)
2. Hero (with Founding 5 framing)
3. Pain points (5 cards, rewritten)
4. The Money Line / Growth System (existing — keep)
5. Live work showcase (existing — keep, lightly polish)
6. Quote wizard spotlight (existing — keep)
7. **NEW: Founding Pricing section** (the 3 cards)
8. How It Works (4-step process)
9. Lead Leak Audit form section
10. **NEW: FAQ**
11. Final CTA
12. Footer
13. Sticky mobile bottom bar (Call + Apply)

The current "What We'll Review For You" section is redundant with the pricing section and the audit form. Cut it or merge its bullets into the audit form's "what you get" list.

---

## SEO and meta updates

Update the title and description to match the new positioning:

**Title:** Founding 5 Pricing — Lead Systems for Local Service Businesses | Designed to Elevate

**Meta description:** We're opening 5 founding client spots at locked-in launch pricing. Get more calls, quote requests, and booked jobs from your website. Free Lead Leak Audit included.

Update OG and Twitter card metadata to match.

---

## Things I'm flexible on (use your judgment)

- Component breakdown (one big page vs. multiple Astro components — do whatever's cleanest)
- Exact wording on subheadlines, button microcopy, FAQ phrasing — polish freely
- How the "Most Popular" badge looks visually
- Whether the FAQ uses an accordion, plain stacked Q&A, or a two-column grid
- Mobile sticky CTA exact styling
- Whether the founding banner is a separate component above the hero or integrated into the hero itself
- Animation, hover states, micro-interactions

If you're 50/50 on a decision, pick the option that makes the offer clearer to a tired contractor reading this on his phone at 9pm.

---

## Things I'm NOT flexible on

- The three package prices and what's included in each (locked exactly as written above)
- The Founding 5 framing — that's the whole strategy
- Phone number 740-617-6488 must be tap-to-call on mobile
- "Lead Leak Audit" name (replace every "Growth Audit")
- The form must include the package-interest dropdown
- The proof line about the Fitchin wizard must appear near the hero
- Existing dark theme, orange accent, type pairing, and component design language stay

---

## What "done" looks like

When this is shipped, a service business owner should:

1. Land on the page from a Google ad
2. See within 5 seconds: an offer with real urgency (5 founding spots), a clear outcome (more calls/quotes/booked jobs), and a phone number to call
3. Scroll and immediately recognize one of their pain points in the first card
4. See the three packages with clear prices
5. Understand the founding offer is real (case study + testimonial in exchange for the discount)
6. Either tap-to-call, fill out the form, or bounce — but never feel confused about what to do

If a buyer ready to spend $2,495 today can't figure out how to give me money in under 30 seconds, the page failed.

---

## Notes on the form backend

The form currently uses a placeholder handler. Don't wire backend integration in this pass — keep the placeholder. I'll wire it to my email or a service like Formspree/Web3Forms separately. Just make sure the form structure and fields are correct so the wiring will be straightforward later.

On submit, show a clear success state in-place: "Thanks! Bill will reach out within 24 hours. If you'd like to talk now, call or text 740-617-6488."

---

## A note to Claude Code

You have full latitude on:
- Whether to refactor existing components or extend them
- File structure for any new sections
- Cleaning up unused code as you go
- Suggesting improvements I didn't think of (in your final summary, not in the code itself)

Treat this document as the brief, not the build instructions. If you read this and immediately see five things I missed or got wrong, fix them.

When you're done, give me a summary of:
1. What you changed and where
2. Any decisions you made that diverged from this doc, and why
3. Anything you noticed but didn't change (e.g., "the privacy page is broken" or "there's a console warning")
4. What I should do before turning ads on (form wiring, real Open Graph image, etc.)

Don't take screenshots — you can't. Verify visually by describing the structure or by checking the rendered HTML.

— Bill
