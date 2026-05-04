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
