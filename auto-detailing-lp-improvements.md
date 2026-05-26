# Auto Detailing Landing Page — Improvement Prompts

A bundled set of focused, sequential prompts for Claude Code to improve
`/auto-detailing-websites` (and its `QuoteFlowSection` component).

## Files in scope

- `src/pages/auto-detailing-websites.astro`
- `src/components/landing/QuoteFlowSection.astro`

## How to use this file

Run each prompt **one at a time, in order**. After each prompt:

1. Review the diff Claude Code shows you before applying.
1. Commit the change with a clean message.
1. Move on to the next prompt.

Do not paste multiple prompts at once. Previous attempts at large multi-change
prompts have only landed about half the changes. Smaller, focused prompts land
reliably.

## Priority rationale

- **Prompt 1** is the highest-leverage single change on the page. It fixes
  shipping bugs *and* wires every CTA to the conversion mechanism.
- **Prompt 2** addresses the biggest unspoken objection at this price point
  (lock-in fear) and resolves the pricing inconsistency between the FAQ and
  the dynamic widget tiers.
- **Prompt 3** is copy polish — none of it is critical, but cumulatively it
  makes the page feel more premium and defensible.
- **Prompt 4** is optional mobile performance work.

-----

## Prompt 1 — Bug fixes + CTA rewiring

```
Apply the following targeted edits to src/pages/auto-detailing-websites.astro
and src/components/landing/QuoteFlowSection.astro. Do not modify anything else.

CONTEXT
The page currently has several URL strings with stray angle brackets that break
schema.org validation, the Fitchin live link, and possibly form submission.
The page also routes every primary CTA to /contact, bypassing the embedded
QuoteFlowSection entirely — visitors never reach the conversion mechanism
unless they scroll through 9 sections first.

CHANGES

1. STRIP ANGLE BRACKETS — auto-detailing-websites.astro
   Find each of these and remove the surrounding < > characters from the URL:

   a. const SITE = '<https://designedtoelevate.co>';
      → const SITE = 'https://designedtoelevate.co';

   b. In serviceSchema:
      '@context': '<https://schema.org>',
      → '@context': 'https://schema.org',

   c. In faqSchema (same fix as above):
      '@context': '<https://schema.org>',
      → '@context': 'https://schema.org',

   d. The Fitchin live site link:
      <a href="<https://fitchinautodetail.com>" target="_blank" ...>
      → <a href="https://fitchinautodetail.com" target="_blank" ...>

2. STRIP ANGLE BRACKETS — QuoteFlowSection.astro
   Find:
     action="<https://api.web3forms.com/submit>"
   Replace with:
     action="https://api.web3forms.com/submit"

3. REWIRE CTAs TO THE EMBEDDED WIDGET — auto-detailing-websites.astro
   Find the QUOTE_HREF constant near the top of the frontmatter:
     const QUOTE_HREF = '/contact?service=auto-detailing&from=auto-detailing-websites';
   Replace with:
     const QUOTE_HREF = '#quote';

   This single change rewires the header button, the hero primary CTA, the
   sticky mobile CTA, and the final CTA primary button — all of which already
   reference QUOTE_HREF.

4. REMOVE THE SEO LEAK BUTTON FROM FINAL CTA
   In the final CTA section (#apply), find this anchor and DELETE it entirely:

     <a href="/seo" class="btn-ghost">
       How we build for SEO
       <span aria-hidden="true">→</span>
     </a>

   The remaining two buttons (primary + call/text) stay as-is.

5. MOVE QuoteFlowSection BEFORE THE FAQ SECTION
   In the JSX, the current order in the bg-bg wrapper is:
     PAIN → WHAT YOU GET → CASE STUDY → SIGNATURE FEATURES → PROOF →
     HOW IT WORKS → FIT CHECK → FAQ → <QuoteFlowSection /> → FINAL CTA

   New order:
     PAIN → WHAT YOU GET → CASE STUDY → SIGNATURE FEATURES → PROOF →
     HOW IT WORKS → FIT CHECK → <QuoteFlowSection /> → FAQ → FINAL CTA

   Only the QuoteFlowSection moves. Move it so it renders immediately AFTER
   the Fit Check section and immediately BEFORE the FAQ section.

CONSTRAINTS
- Do not change any other copy, styling, or structure.
- Do not modify the QuoteFlowSection component beyond the angle-bracket fix.
- Do not change the noindex setting, meta title, or meta description.
- Do not touch the sticky mobile CTA HTML — just let it pick up the new
  QUOTE_HREF value automatically.

VERIFICATION
- View the rendered page source: no <...> angle brackets appear in any URL
  inside schema.org JSON-LD, the Fitchin link, or the form action.
- Clicking the hero "Book a Detailing Website Call" button scrolls to the
  embedded quote flow (#quote anchor), not navigating to /contact.
- Clicking the header "Get a Free Quote" button also scrolls to #quote.
- The final CTA has exactly two buttons: primary + call/text. No SEO button.
- The Quote Flow section appears between Fit Check and FAQ.
- The dev server compiles without errors.

Show me the full diff before applying.
```

-----

## Prompt 2 — Code ownership messaging + pricing alignment

```
Apply targeted copy edits to src/pages/auto-detailing-websites.astro to add
the "you own the code" thread across the page and resolve the pricing
inconsistency between the FAQ and the QuoteFlowSection's dynamic tiers.

CONTEXT
The biggest unspoken objection to $545/mo at this price point is lock-in
fear — buyers have been burned by SEO firms, Wix, Jobber, and other vendors
who hold the site hostage. Bill's actual differentiator: every shop owns
the full code. The current page never mentions this anywhere. Adding it in
three places turns the monthly fee from "ransom payment" into "ongoing
services you can cancel anytime."

Separately, the FAQ currently states a flat $4,495 + $545/mo, but the
QuoteFlowSection can recommend three different tiers ($2,495/$295, $4,495/$545,
or $5,995/$695). A visitor who reads the FAQ and then takes the quote will
see a different number and lose trust. The FAQ needs to acknowledge the tiers.

CHANGES

1. HERO SUBTEXT — ADD CODE OWNERSHIP
   In the hero section, find:
     <div class="mt-6 text-[0.9rem] text-text-muted">
       Custom quote system &nbsp;·&nbsp; priced around your shop &nbsp;·&nbsp; 3–5 week build
     </div>
   Replace the inner text (keep the surrounding div and styling) with:
     Custom quote system &nbsp;·&nbsp; You own the code &nbsp;·&nbsp; 3–5 week build

2. WHAT YOU GET — ADD CODE OWNERSHIP BULLET
   In the whatYouGet array near the top of the frontmatter, add this as the
   LAST item in the array:
     'Full code ownership at handoff — your repo, your Vercel account, no platform lock-in',

3. REWRITE THE PRICING FAQ
   In the faqs array, find the first FAQ object whose q starts with
   "How much does a detailing website with a quote system cost?" and replace
   its `a` field entirely with this new answer:

   "Three tiers, depending on scope. The Custom Lead System — the same build
   Fitchin runs — is $4,495 setup + $545/month. Smaller single-service quote
   sites start at $2,495 setup + $295/month. Multi-service builds (detailing
   + ceramic + tint + PPF in one flow) run $5,995 setup + $695/month. All
   tiers are month-to-month with no long-term contract. Prefer to spread the
   build cost out? The Custom Lead System can be paid as $1,498/month for
   three months, then $545/month. And the code is yours — cancel the monthly
   anytime and the site stays. No platform lock-in."

4. ADD A NEW FAQ — "WHAT HAPPENS IF I CANCEL"
   Add this new FAQ object to the faqs array, immediately after the existing
   "What's the monthly fee for?" FAQ:

   {
     q: 'What happens if I cancel the monthly?',
     a: "You keep the site. The code is yours, the repo is yours, the Vercel and domain accounts are in your name. The monthly covers ongoing services — hosting we manage, pricing updates, dashboard support, software costs. Cancel anytime and the site keeps running; you'd just take those pieces over yourself or hand them to another developer. Most of our competitors at this price point can't say that.",
   },

CONSTRAINTS
- Do not change any other FAQ.
- Do not modify the JSX structure.
- Do not change the QuoteFlowSection component in this prompt.
- Do not change any other copy on the page.

VERIFICATION
- The hero subtext reads: "Custom quote system · You own the code · 3–5 week build"
- "What You Get" has a final bullet about code ownership at handoff.
- The first FAQ now explains all three tiers and ends with the ownership line.
- A new "What happens if I cancel the monthly?" FAQ appears after "What's the
  monthly fee for?" and before "Do I have to change how I take bookings?"

Show me the full diff before applying.
```

-----

## Prompt 3 — Section polish

```
Apply targeted copy refinements to src/pages/auto-detailing-websites.astro
and src/components/landing/QuoteFlowSection.astro. These are small individual
changes; they're bundled because they're all small and cumulatively make the
page feel sharper.

CHANGES

1. REFRAME FITCHIN AS "PROVING GROUND"
   In the case study section, find the paragraph that begins:
     "Fitchin is the founder's own shop — the build that became the blueprint
     for this offer."
   Replace the entire paragraph (the one containing that sentence) with:

   "Fitchin became the proving ground for this system. It's a real detailing,
   ceramic coating, and window tinting shop in Coshocton, Ohio — with real
   pricing complexity, real service combinations, and real customers who need
   clear answers before they book. The old site could describe the services,
   but it still couldn't price the work. The rebuild replaced the basic
   contact-form experience with a guided quote flow that handles detailing,
   ceramic coating, tint, add-ons, vehicle logic, lead capture, and booking
   handoff in one system."

2. REPLACE THE ASTRO/VERCEL CASE BULLET
   In the caseFacts array, find:
     'Built on Astro + Vercel for sub-second mobile loads',
   Replace with:
     'Sub-second mobile loads built for Google Ads, SEO, and local traffic',

3. SOFTEN THE CERAMIC-TIERS CLAIM
   In the Signature Features section, find the paragraph for "Ceramic tiers
   that sell the upgrade for you". The current copy ends with:
     "...showing the tiers inline raises the average ticket better than any
     sales pitch."
   Replace that final sentence (the one containing "raises the average ticket
   better than any sales pitch") with:
     "Showing the tiers side by side helps customers understand the value gap
     before they ever ask why it costs more."

4. SOFTEN THE QUALITY SCORE CLAIM
   In the howItWorks array, find the entry labeled "Fast on a phone, ad-ready".
   The current value contains: "...which keeps Google Ads Quality Score high
   and stops paid clicks from bouncing."
   Replace the entire `value` field for this entry with:
     "Built on Astro and deployed on Vercel — sub-second mobile loads that support a stronger landing page experience for paid traffic and reduce bounced ad clicks."

5. SOFTEN THE "SYSTEM X" REFERENCE
   In the painCards array, find the card whose title is "Your site looks
   nothing like the work you do". The current body mentions "System X by
   hand." Replace the entire `body` field with:
     'You polish paint, install coatings, restore interiors, and build trust in person — then send people to a slow, generic site that looks like every other shop in the county.',

6. ADD "NOT A FIT IF" LIST TO FIT CHECK
   In the Fit Check section, find the italic paragraph that currently reads:
     "This isn't for shops that want the cheapest one-page template or a
     contact form bolted onto a stock theme."
   Replace that ENTIRE <p> element with this block:

     <p class="mt-9 text-[0.95rem] text-text font-display font-semibold">
       Not a fit if:
     </p>
     <ul class="mt-4 space-y-3">
       <li class="flex items-start gap-3 text-[1rem] text-text-soft leading-snug">
         <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-text-muted/15 text-text-muted flex-shrink-0" aria-hidden="true">
           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
         </span>
         <span>You want the cheapest possible template</span>
       </li>
       <li class="flex items-start gap-3 text-[1rem] text-text-soft leading-snug">
         <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-text-muted/15 text-text-muted flex-shrink-0" aria-hidden="true">
           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
         </span>
         <span>Your pricing is so inconsistent it can't be modeled</span>
       </li>
       <li class="flex items-start gap-3 text-[1rem] text-text-soft leading-snug">
         <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-text-muted/15 text-text-muted flex-shrink-0" aria-hidden="true">
           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
         </span>
         <span>A basic contact form is all you actually need</span>
       </li>
     </ul>

7. UPDATE QUOTEFLOWSECTION INTRO COPY
   In QuoteFlowSection.astro, find the intro paragraph that currently reads:
     "Tap through a few questions, see what we'd build and what it runs,
     then leave your info for an exact quote priced to your menu. No phone tag."
   Replace with:
     "Tap through a few questions, see the build tier that fits your shop, then leave your info if you want Bill to price it around your exact menu. No phone tag."

CONSTRAINTS
- Do not change anything not explicitly listed above.
- Do not modify the JSX outside the listed targets.
- Preserve all existing classes, attributes, and surrounding markup.

VERIFICATION
- The case study paragraph leads with "Fitchin became the proving ground".
- The case facts list no longer says "Astro + Vercel".
- The Ceramic Tiers feature paragraph ends with "before they ever ask why
  it costs more."
- The "Fast on a phone" how-it-works card no longer claims to "keep Quality
  Score high."
- Pain card 4 no longer mentions "System X."
- Fit Check has a visible "Not a fit if:" subhead with three bulleted items.
- QuoteFlowSection's intro paragraph mentions "build tier that fits your shop."

Show me the full diff before applying.
```

-----

## Prompt 4 — Mobile performance (optional)

```
Apply a small mobile performance fix to src/pages/auto-detailing-websites.astro.

CONTEXT
The hero currently loads two images with high priority on mobile: the
detailing-bay background photo (fetchpriority="high") AND the Fitchin mobile
phone screenshot (loading="eager"). The background is the proper LCP
candidate. The phone screenshot competing for bandwidth can push LCP past
2.5s on a slow mobile connection.

CHANGE

In the hero section, find the <img> tag for /showcase/fitchin-mobile.png.
It currently has:
  loading="eager"
  decoding="async"

Change to:
  loading="lazy"
  decoding="async"

Leave the background image (/auto-detail/detailing-bay-hero.jpg) loading
attributes unchanged — that one stays eager + high priority.

VERIFICATION
- Run Lighthouse mobile audit on the deployed page.
- LCP should be the detailing-bay background image, not the phone mockup.
- LCP score should be under 2.5s on simulated Fast 3G.

Show me the full diff before applying.
```

-----

## Notes after running

After all four prompts:

1. Test the form end-to-end. Submit a real quote request. Confirm the email
   arrives in Bill’s Web3Forms inbox with the correct subject, tier name,
   and selected services. The angle-bracket fix on the form action may
   reveal that submissions have been broken; check Web3Forms dashboard
   for any backlog or failed submissions from before the fix.
1. Test all CTA buttons on mobile. Every primary button should scroll to
   the #quote anchor, not navigate away.
1. Validate the schema. Paste the page HTML into
   <https://validator.schema.org/> and confirm both the Service schema and
   FAQPage schema parse without errors.
1. Run Lighthouse mobile audit. Aim for LCP < 2.5s, CLS < 0.1.

## Things deliberately NOT in these prompts

- Hero H1 rewrite (current version is fine, change isn’t worth the risk)
- Real Screens / Case Study reorder (current order works)
- “Custom website design for auto detailers” SEO bullet (page is noindex)
- Hero paragraph rewrite (current version is good)
- Pain card 1/2/3 rewrites (side-grades only)
- Adding more FAQs beyond the cancellation one (bloat)
- Adding new form fields to QuoteFlowSection (friction)
- Header CTA changing to #quote (intentionally kept as escape hatch — see
  notes; if you decide to change it, swap header button’s href from
  QUOTE_HREF to #quote in a separate single-line edit)