# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site for **Designed to Elevate** — a digital marketing studio for local service businesses (detailers, tint shops, barbershops, contractors, etc.). Static site built with Astro 5 + Tailwind v4, deployed on Vercel at `designedtoelevate.co`.

`SITE_CONTEXT.md` and `FOUNDER_PROFILE.md` are reference material for content/voice. Read them before writing or editing user-facing copy — they define the founder story, services, voice rules ("Built From the Bay, Not a Boardroom," no agency-speak, no "solutions"), Stripe-readiness requirements, and which information is private vs. public.

## Commands

```bash
npm install        # install deps
npm run dev        # local dev server (astro dev)
npm run build      # production build to dist/
npm run preview    # preview the build
```

There is no test suite, no linter, and no formatter configured. TypeScript runs in `strict` mode via `astro/tsconfigs/strict` — type errors surface during `astro build`.

## Architecture

### Two parallel UX surfaces, sharing one base layout

The site has **two distinct page types** that share a single HTML shell but use different headers/footers:

1. **Marketing site** (`/`, `/pricing`, `/work`, `/contact`) — full nav via `src/components/site/SiteHeader.astro` + `SiteFooter.astro`.
2. **Ads landing page** (`/grow`) — minimal conversion-focused chrome via `src/components/landing/LandingHeader.astro` + an inline footer baked into `FinalCTASection.astro`. **No nav menu by design** (kills conversion). This page hosts the "Founding 5" offer and is the ad destination.
3. **Legal pages** (`/privacy`, `/terms`, `/refund`) — wrapped in `src/components/LegalLayout.astro`, which itself wraps `LandingLayout`. Required for Stripe payment-processor review (currently placeholder content).

`src/layouts/LandingLayout.astro` is the **base layout for every page** — it owns `<head>` (meta, OG, fonts), the global skip link, and three pieces of global JS:
- Smooth-scroll for in-page anchors
- Sticky mobile CTA visibility (IntersectionObserver on `[data-hero-cta]` + `#audit-form` — only shows when neither hero CTA nor the audit form is visible, so one orange CTA is on screen at a time)
- Audit form submission to `https://api.web3forms.com/submit` (multipart `FormData`, NOT JSON — multi-value `help[]` checkboxes must round-trip natively)

When adding a new page, decide: marketing (use `SiteHeader`/`SiteFooter`) or landing (use `LandingHeader` + a custom CTA-driven footer). The `pathname` prop on `LandingLayout` controls the canonical URL.

### Component organization

- `src/components/landing/` — page-section components for `/grow` (Hero, PainPoints, GrowthSystem, FoundingPricing, AuditOfferForm, FAQ, FinalCTA, StickyMobileCTA, etc.). These are tightly coupled to the Founding 5 conversion flow.
- `src/components/site/` — `SiteHeader` and `SiteFooter` for the marketing site.
- `src/components/LegalLayout.astro` — wrapper for legal pages.
- `src/data/founding-packages.ts` — single source of truth for the three pricing tiers (Foundation / Lead Engine / Custom Lead System). Used by both `/grow`'s `FoundingPricingSection` and `/pricing`. Edit prices/inclusions here, not in the components.

### Styling: Tailwind v4 + custom theme

- `src/styles/landing.css` is imported by `LandingLayout` and is the only stylesheet. It uses Tailwind v4's `@theme` block to define CSS custom properties (`--color-bg`, `--color-accent`, `--font-display`, etc.) which Tailwind exposes as utility classes (`bg-bg`, `text-accent`, `font-display`).
- The dark-mode-only palette is anchored on `#FF6B1A` (accent orange) against `#0E1014` (bg). Pulled from the logo per `SITE_CONTEXT.md`.
- Reusable component classes (`.btn-primary`, `.btn-ghost`, `.eyebrow`, `.card`, `.card-hover`, `.grid-bg`, `.accent-glow`) are defined in `landing.css` — prefer these over re-rolling button/card styles inline.
- `html.landing` class is set on the root element; landing-only typography rules (Space Grotesk for headings, Inter for body) hang off it.
- Tailwind is wired through `@tailwindcss/vite` in `astro.config.mjs` — no `tailwind.config.js`.

### Form submission

The audit form posts to **Web3Forms** with the access key embedded as a hidden input. Submission logic lives in `LandingLayout.astro` (not the form component). Two non-obvious constraints:
- Snapshot `FormData` **before** disabling inputs — disabled fields are excluded from `FormData` per spec, which would strip `access_key`.
- Send as `multipart/form-data` (no `Content-Type` header — let the browser set the boundary). JSON breaks multi-value `help[]` checkbox handling.

Google Ads conversion tracking goes inside the success branch when wired up.

## Conventions

- **Astro components only** — no React/Vue/Svelte. Page sections are `.astro` files with frontmatter for data.
- **No client-side framework runtime.** All interactivity is vanilla `<script>` tags in components/layouts. Keep it that way unless there's a real reason.
- **One H1 per page** — the hero headline. Stripe review requirement.
- **Mobile-first.** Test breakpoint behavior at `sm` (640px), `md` (768px), `lg` (1024px). The mobile menu in `SiteHeader` uses native `<details>` for zero-JS open/close.
- **Copy lives in component frontmatter** as typed const arrays (see `index.astro` `painPoints`, `services`, `whyDifferent`). Keep it there rather than inlining in markup, so it can be reordered/edited without diff noise.
- **Phone number `740-617-6488` and email `bilsonxnc@gmail.com`** appear in many places (header, footer, forms, legal). If they change, grep-replace.
- **Voice rules from `SITE_CONTEXT.md` are binding for any user-facing copy:** no "solutions," no "guaranteed results," no fake testimonials/client counts, no dollar amounts about Fitchin. Signature lines like "Built From the Bay, Not a Boardroom" and "It's not a hustle problem. It's a system problem." should be used verbatim.
- **`/grow` is the ads landing page** — keep it conversion-tight. Do not add navigation links that lead away from the audit form.

## When opening a pull request

Every PR description must include a **plain-English summary block at the very top of the body, inside a fenced code block** so the user can copy it as a single unit. This is the user's running log of what's been shipped — they don't want to dig through diffs or technical PR bodies to remember what changed.

Rules for the summary block:

- **Plain English.** No jargon, no file paths, no function names, no acronyms unless universally known. Write it like you're texting the user.
- **Short.** 3–6 bullets max. One short line per bullet.
- **What changed and what it means for them**, not how it was implemented. "Files now have an Open button" — not "Refactored signed-URL minting to expose two URLs per file."
- **Skip the boring stuff.** Don't mention build passing, no schema changes, dependency bumps, internal refactors that don't affect what the user sees or does. Only call them out if they actually matter to the user.
- **End with one line about what to test or where to look** so the user knows the verification path.

The detailed technical PR body (Summary / Implementation notes / Test plan / Rollback) still goes below the code block — that section is for code review and the user's future self. The code block on top is the only thing the user is expected to read in normal use.

Example structure:

````markdown
```
What changed (plain English):

• Files in the request page now have Open and Download buttons instead of just a clickable filename.
• Image attachments show a real thumbnail so you can see what's in them without tapping.
• Each file says who uploaded it — "Client" vs "Bill — Designed to Elevate".

Where to check: open any client request in the admin portal.
```

## Summary

<detailed technical summary follows here…>
````

## How to give the user instructions

Whenever you tell the user to do something outside the code (run commands, click through a UI, apply a migration, deploy, test in a browser, open a PR, etc.), put **the entire walk-through inside one fenced code block** so it can be copied as a single unit. Outside that block goes prose only — context, caveats, follow-up questions.

Rules for what goes inside the block:

- **Number every step.** `1.`, `2.`, `3.` — even if it's just two steps.
- **Be specific and descriptive, not terse.** Don't write `apply the migration`. Write `apply the migration: run \`supabase db reset\` locally, or in production paste the contents of supabase/migrations/0005_owner_todos.sql into the Supabase Dashboard → SQL editor and click Run`.
- **Spell out every command on its own indented line under the step it belongs to.** No bare commands floating between numbered steps.
- **Say what to expect after each step.** `→ you should see "Migration applied"`, `→ the row moves to "Recently completed"`, `→ build finishes with "Complete!"`. If the user doesn't see that, they know something's off.
- **Include exact URLs, file paths, button labels, and field names.** `http://localhost:4321/portal/admin/todos`, click the **Todos** link, type in the **"Add a todo…"** input.
- **Call out anything destructive or one-way before the step, not after.** `WARNING: \`supabase db reset\` wipes local data` goes on the line above the command, not below it.
- **End with a verification step.** A final numbered step that confirms the whole thing worked end-to-end (load a page, check a row, look at the deployed URL).

Prose explanations, "why this matters," and follow-up questions go **outside** the code block, before or after it. The block itself should be pure do-this-then-that with no decoration.
