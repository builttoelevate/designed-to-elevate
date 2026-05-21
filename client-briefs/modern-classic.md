Modern Classic — Client Brief Summary

Source: Read-only review of the Modern Classic repo at C:\Users\sshuser\OneDrive\Desktop\All Websites\modern-classic
Files referenced: `README.md`, `PHASE_2_BOOKING_WIZARD.md`, `PHASE_3_BOOKING_WRITES.md`, `PHASE_4_POLISH.md`, `src/styles/tokens.css`, `src/pages/index.astro`, `src/components/Hero.astro`, `src/components/Story.astro`, `src/components/QuickActions.astro`, `src/components/MobileBookCTA.astro`, `src/lib/square/`.

- Customer-facing features
  - Primary booking flow:
    - 5-step booking wizard at `/book` (Service → Barber → Date/Time → Customer Info → Confirm).
    - Deep links into booking (Quick Actions and modals can preselect service variation ids).
    - Fallback to Square-hosted booking on gh-pages; self-hosted wizard on Vercel using server endpoints under `/api/square/*`.
    - Mobile sticky CTA (`MobileBookCTA`) and persistent Book buttons across the site.
    - "Any barber" option, per-barber variations, and per-service primaryVariationIds for deep-linking.
  - Waitlist & personalization:
    - Hero-level waitlist trigger (sheet) that can prefill signed-in customer info and target specific barber/service.
    - Waitlist cron/notify feature that polls availability and emails customers when matches appear.
  - Customer account & admin surfaces:
    - `My Bookings` page and password-protected admin bookings dashboard at `/admin/bookings`.
    - Customer lookup + bookings endpoints; customer sessions and optional sign-in flows referenced in code.
  - Integrations & automations:
    - Square API integration (typed wrapper in `src/lib/square/`) for availability, bookings, customers, team, catalog.
    - Cron endpoints: daily service-catalog rebuild, waitlist-notify, review-request cron.
    - Booking confirmation relies on Square's built-in confirmation emails (site does not send booking emails by default).
  - E-commerce & content:
    - Product shop links to Shopify; product cards and featured product panels on the homepage.
    - Rich homepage sections: Hero (with earliest availability), Quick Actions, Barbers roster, Story, Products, Reviews, Location, FAQ, Final CTA.
  - Accessibility & UX details:
    - Keyboard focus states, reduced-motion respect, semantic landmarks, aria attributes on modals and forms.

- Brand voice and tone (from site copy)
  - Short thesis: "Get the Cut. Keep the Style." Direct, confident, craft-forward.
  - Tone: masculine, no-nonsense, premium-but-approachable, rooted in barbering craft and product utility.
  - Language characteristics:
    - Uses first-person plural and shop-origin storytelling ("As seasoned barbers...", "The cut happens in Zanesville.").
    - Benefits-focused, pragmatic claims (confidence, style that lasts), avoids hyperbolic or agency language.
    - Uses simple imperatives for CTAs ("Book an Appointment", "Shop Our Products", "Book Now").
    - Product copy emphasizes "made by barbers" and practical product benefits (no residue, scent worth wearing).

- Color palette and fonts (exact tokens)
  - Fonts (from `src/styles/tokens.css` and README):
    - Display: Fraunces (variable serif) as `--font-display`.
    - Body: Manrope as `--font-body`.
  - Palette (design tokens in `src/styles/tokens.css`):
    - Warm near-black base: `--color-bg: #0b0a08`.
    - Surface/greys: `#100e0b`, `#161311`, `#1d1916`, `#251f1a`.
    - Gold scale:
      - `--color-gold: #c9a35c`
      - `--color-gold-light: #e6c785`
      - `--color-gold-soft: #d8b878`
      - `--color-gold-dark: #8a6e35`
      - `--color-gold-deep: #5a4520`
    - Text: warm off-white `--color-text: #f3ece0`, muted `--color-text-muted: #b0a695`.
  - Note: The project does not use Tailwind — tokens are plain CSS variables. There is no `tailwind.config.js` to extract.

- Unique selling points (USPs) worth featuring on the landing page
  - Barber + Product line in one: "A Zanesville barbershop and a grooming line" — emphasizes real shop roots and products made by practitioners.
  - Founder story & craft origin: Products designed from shop experience; founder-led authenticity.
  - Personalized booking & roster: Ability to choose barber, see earliest availability, and join waitlist targeted to barber/service.
  - Premium aesthetic: Warm gold on near-black, serif display type, tactile UI details (hairline frames, gold halo) — supports a premium, vintage-modern feel.
  - Privacy & reliability signals: Square + Shopify integrations, server-side availability endpoints, cron-driven rebuilds — reliability story for bookings & product accuracy.
  - Accessibility and thoughtful UX: keyboard focus, reduced-motion, mobile-first sticky CTA — highlight that mobile booking is smooth and reliable.

Notes / Implementation constraints
- The site is implemented with Astro + plain CSS tokens; no Tailwind present.
- Booking features are built around Square — availability, bookings, and customers live in `src/lib/square/`.
- For the landing page build in this repo, preserve the brand fonts, gold palette, and concise craft-focused voice.

Prepared by: automated repo scan (read-only)
Date: 2026-05-21
