# Landing-Page Feature Inventory — Quote Wizard

A copy-mining reference for the **Designed to Elevate** Google Ads landing pages
(Window Tint and Auto Detailing). Everything below is pulled verbatim or
structurally from the live quote wizard (`fitchin-quote-wizard.html`) and the
shop-owner dashboard (`pricing.html`, `settings.html`).

**Ground rules used while compiling this:**
- Verbatim user-facing copy is in quotes so you can lift it directly.
- **No dollar amounts** — pricing is described structurally only (the wizard
  pulls real numbers per-shop from config).
- **PPF / paint protection film does NOT exist anywhere in the product.** Do not
  claim it. The only "protection" products are **ceramic coating** (System X
  paint coatings) and a lightweight **glass ceramic** upsell. The word "paint
  protection" appears only in the ceramic coating tile description.

---

# PART 1 — SERVICES

## 1. Auto / Vehicle Window Tint

The flagship instant-pricing flow. Customer picks vehicle → film tier → coverage
→ darkness → add-ons, and sees a real price before talking to anyone.

### Tier / package structure (Good / Better / Best)

| Tier | Film name | Badge | Differentiating one-liner (verbatim) |
|------|-----------|-------|--------------------------------------|
| **Good** | **Carbon** | — | "Clean finished look · Everyday comfort" |
| **Better** | **Nano Ceramic** | ★ Best Value | "Less glare · Less heat · Premium clarity" |
| **Best** | **Ceramic IR** | ★ Best Performance | "Max heat reduction · Best clarity · Top performance" |

- Step framing: eyebrow "Your Quote", title **"Pick your tint film"**, sub
  **"All films block heat — upgraded films block more."**
- The two upper tiers are visually promoted ("popular" styling). "Best Value"
  is deliberately a value/price-to-performance claim, not social proof.

### Vehicle types handled

- Year / Make / Model dropdowns, with a **manual-entry fallback** ("Can't find
  your vehicle? Enter it manually") and a **"Use your last vehicle"** one-tap chip
  for returning visitors.
- A **disambiguation step** when one model has multiple body styles: "Which
  version matches your vehicle?" → "Not sure? Choose the closest match. We'll
  verify it before the final price is confirmed."
- A **3-row size question** for large SUVs: "Is your vehicle the larger 3-row
  version?" → "Yes, larger 3-row model / Usually fits 7+ passengers" vs "No,
  2-row model / Usually fits 5 passengers".
- Behind the scenes the engine maps every vehicle to one of **17 body-class
  buckets** (coupe, convertible, sedan, hatchback/wagon, compact SUV, mid 2-row,
  mid 3-row, full 3-row, extended full SUV, 2-door off-road, 4-door
  Wrangler/Bronco, regular/extended/crew-cab trucks, minivan, commercial van) so
  pricing is body-style accurate.

### Coverage options ("What are you getting tinted?")

- "Full vehicle tint" — "All side and rear windows. Windshield is an optional add-on."
- "Front two windows only" — "Driver and passenger front side windows."
- "Just the windshield" — "Full windshield tint."
- "Just a sun strip" — "Only the strip across the top of the windshield."

### Darkness / VLT selection (this is a strong UX/education angle)

A plain-language **darkness visualizer** maps VLT % to look + effect:
- "70% (Very light) — Barely visible tint."
- "50% (Light) — Subtle tint, max visibility."
- "35% (Medium) — Sleek look."
- "20% (Dark) — Privacy + sun protection."
- "15% (Very dark) — Between Dark and Limo."
- "5% (Limo — very dark) — Maximum privacy."

Plus a **"Same darkness all around"** toggle ("Pick once and apply to every
window") and per-zone control (Front Two Windows / Back Side Windows / Back
Glass). A **"Not sure — recommend for me"** branch asks "What matters most to
you?" (Privacy / Heat rejection / Subtle look / Best of all) and recommends a
darkness. Windshield gets its own 70/50/35 picker.

### Add-ons / upsells

- **Sun strip** — "Tint strip across the top of the windshield to block overhead
  sun." Style options include "AS-1 line" (above mirror) and "Down to bottom of
  mirror" (tagged *most popular*).
- **Full windshield tint** — "Tints the entire windshield."
- **Roof / sunroof tint** — "Tint the sunroof glass to reduce overhead heat."
  (shown only when the vehicle has a sunroof/panoramic roof)
- **Old tint removal** — "Yes, my windows already have tint that needs removed."
  with note: "Severely bubbled, layered, or difficult film may need review at
  drop-off." Priced per window.

### Pricing logic structure (no $)

Price = **vehicle body-class bucket × film tier × coverage**, with add-ons priced
separately and tint removal priced per window. Darkness/VLT is **flat-priced**
("Same price regardless of darkness"). Upgrade deltas render between tiers
("Only +$X from Carbon"). All numbers load per-shop from config at page load.

### UX / persuasion features

- Tier badges ("★ Best Value", "★ Best Performance").
- Vehicle-confirm reassurance card (green check + resolved body style).
- Reassurance microcopy: "We'll verify it before the final price is confirmed."
- Compliance microcopy: "Check your local laws — tint regulations vary by state."

---

## 2. Residential Window Tint

Custom-quote path (no instant price — quoted after the shop reviews the glass).

- **Intake tile:** badge "Custom quote", "Residential Window Tinting — Home
  windows — heat, glare, privacy, UV."
- **Goals (multi-select):** "Reduce heat", "Reduce glare", "Add privacy",
  "Protect furniture & floors from fading", "Improve comfort", "Not sure yet".
- **Window count:** "1–3", "4–7", "8–12", "13–20", "21+ windows" — framed with
  "A rough count is fine — we'll measure on site."
- **Glass types (multi-select):** "Standard home windows", "Large living room
  windows", "Patio or sliding doors", "Bathroom or privacy windows", "Mixed
  sizes", "Not sure".
- **Existing film:** "Is there existing film on the glass?" → "Old film that
  needs removed adds time to the job."
- **Property intake:** property type (Residential home / Commercial property),
  approximate window count, address (optional), and project notes ("ground floor
  or second story, privacy goals, heat/glare issues, timing, or special access").

**Pricing structure (no $):** a "How pricing works" info panel; per-shop config
exposes job tiers **Per Window / Small / Medium / Large Project**, each with an
optional "Manual?" (quote-only) flag.

---

## 3. Commercial Window Tint

Custom-quote path. Designed to capture the full scope of a B2B glass job.

- **Intake tile:** badge "Custom quote", "Commercial Window Tinting —
  Storefronts, offices, and other business glass."
- **Project type:** "Storefront", "Office building", "Interior privacy glass",
  "Restaurant or retail", "School, church, or facility", "Other".
- **Problem solving (multi-select):** "Heat", "Glare", "Privacy", "Security or
  safety", "Decorative or frosted look", "UV or fading", "Energy efficiency".
- **Glass amount:** "Small / Medium / Large project / Not sure", with optional
  "I know the approximate square footage" capture ("Captured for context only —
  not used for an automated quote").
- **Access / floor:** "Ground-level storefront", "Ground-level office", "Second
  floor", "Multi-story building", "Lift or scaffold may be needed", "Not sure".
- **Existing film removal:** No / Yes / Not sure.
- **After-hours:** "Does the work need done after hours?" — No / Maybe / Yes.

**Pricing structure (no $):** per-shop config exposes **Small / Medium / Large
Commercial Job** and **Custom / Quote Only** tiers, each with a "Manual?" flag.

---

## 4. Auto Detailing

### Service structure

| Service | Description (verbatim) | Time estimate |
|---------|------------------------|---------------|
| **Exterior Only** | "Hand wash, wheels, tires, windows, and exterior wipe-down." | ~1 hr |
| **Interior Only** | "Vacuum, wipe-down, mats, dash, doors, and interior glass." | ~2 hrs |
| **Complete Detail** *(★ Most Popular)* | "Interior and exterior cleaning in one service." | ~3–5 hrs |

- Step framing: eyebrow "Auto Detailing", title **"What do you need?"**, sub
  "Pick the service that fits. We'll ask a few questions to give you an accurate
  estimate."

### Condition-aware questions (a strong differentiator — honest, transparent pricing)

- **Interior condition:** "Light Cleaning — Mostly clean. Light dust, crumbs, or
  normal maintenance." / "Moderate Cleaning — Normal daily use. Some crumbs,
  dirt, smudges, or light buildup." / "Heavy Cleaning — Visible dirt, heavy
  buildup, sticky areas, or hasn't been cleaned in 6+ months."
- **Pet hair:** "None / Very Little", "Light Pet Hair — Some hair on seats,
  floors, or cargo areas.", "Heavy Pet Hair — Hair throughout the vehicle or
  embedded in carpet/fabric." ("Pet hair can take extra time to remove,
  especially from carpet and fabric seats.")

### Interior add-ons / extras ("Does the interior have any of these issues?")

- "Stains or spills — Food, drinks, mud, makeup, or other visible spots. Heavy
  or set-in stains may need extra treatment."
- "Biohazard, mold, or mildew — Vomit, blood, urine, feces, mold, mildew, or
  similar contamination. Inspection required before pricing." *(shows
  "Inspection required" instead of a price)*
- "Ozone treatment for heavy smoke or strong odor — For vehicles with strong
  cigarette, cigar, or persistent smoke smell that needs more than a standard
  detail."

### Exterior add-ons / extras ("Anything special about the outside?")

- "Heavy bug splatter, tar, or tree sap"
- "Heavy mud or off-road dirt"

### Optional detail add-ons (per-shop togglable)

- **Engine Bay Detail** — "Degrease, clean, and dress the engine bay."
- **Headlight Restoration** — "Polish hazy or yellowed headlight lenses."
- **Clay Bar (Decontamination)** — "Remove embedded contaminants from paint."
- **Paint Correction (Multi-Step)** — "Compound + polish to remove swirls and
  oxidation."

### Cross-sell: window ceramic upsell shown to detailing customers

- Title "Window ceramic coating?", sub: **"Ceramic-coated glass repels rain,
  bugs, and road grime. Wipers work better. Visibility improves at night. Lasts
  1–2 years."**
- Options: "Windshield only — Front-glass protection where it matters most." /
  "All windows / whole vehicle — Full glass protection — every window, front to
  back." *(★ Best Value)*

### Pricing logic structure (no $)

Price = **detailing package × vehicle size/bucket**, with additive modifiers for
interior condition, pet-hair level, interior/exterior extras, and the ceramic
upsell. Detail quotes use **"estimate" / "Starting at"** language and confirm at
drop-off: "Final price is confirmed at drop-off. If your vehicle is cleaner than
described, your price may be lower."

---

## 5. Ceramic Coating

### Tier structure (Good → Better → Best → Ultimate, System X)

| Tier | Protection (verbatim) | Benefit (verbatim) | Warranty |
|------|----------------------|--------------------|---------|
| **Ceramic Crystal+** | "System X 3-Year Protection · Good" | "A solid entry package for easier washing, added gloss, and everyday protection." | 3-year |
| **Ceramic Pro+** *(⭐ Most Popular, default)* | "System X 6-Year Protection · Better" | "The best balance of durability, gloss, and value for most daily drivers." | 6-year |
| **Ceramic Max G+** | "System X Lifetime Protection · Best" | "Long-term protection for vehicles you plan to keep looking sharp for years." | Lifetime |
| **Ceramic Diamond SS** | "System X Lifetime Protection · Ultimate" | "Premium finish, maximum gloss, and the highest level of ceramic protection." | Lifetime |

- Step framing: eyebrow "Ceramic Coating", title **"Choose your ceramic
  protection package"**, sub: **"Every package includes professional System X
  ceramic application, wash, and surface prep. Higher tiers add longer-lasting
  protection, stronger warranty coverage, and deeper gloss."**
- Recommendation helper: **"Not sure which package is right? Most daily drivers
  choose Ceramic Pro+ for the best balance of protection, gloss, and value."**

### Add-ons ("Protect more of your vehicle")

Sub: "Add extra protection for high-touch and high-exposure areas. You can skip
this and still get your ceramic coating quote."
- **Wheel Coating** — "Helps brake dust and road grime clean off easier."
- **Glass Coating** — "Improves water beading and makes glass easier to clean."
- **Trim Coating** — "Helps protect exterior plastic trim from fading."

Add-ons are per-tier intelligent: each can be **Available** (purchasable),
**Included** ("Included with your package" — a value signal on higher tiers), or
**Hidden**.

### Paint inspection (trust angle)

A static notice (not an upsell): **"Paint inspection included"** — "Every ceramic
coating includes basic prep. If heavier paint correction is needed for swirls,
scratches, haze, or oxidation, we'll explain your options before any work begins."

### Pricing logic structure (no $)

Price = **ceramic tier × vehicle size/bucket** + selected add-ons. Quote copy:
"Final price is confirmed after paint inspection. If your vehicle needs less prep
than expected, your price may be lower."

---

## 6. PPF / Paint Protection Film — NOT OFFERED

There is **no PPF, clear-bra, or paint-protection-film** product anywhere in the
wizard, config, or codebase. Do not feature it on the landing pages. Use
**ceramic coating** for paint protection messaging.

---

# PART 2 — PLATFORM / WIZARD-LEVEL FEATURES (sales angles in themselves)

These are the "look how deep this is" capabilities — useful for demonstrating the
caliber of what we build for tint and detailing shops.

### Configurable per-tenant pricing & branding

- **One platform, every shop is a tenant** resolved by a `?shop=` slug. Every
  shop runs the same wizard with its own pricing, branding, hours, deposits, and
  enabled services — nothing is hardcoded.
- Branding (business name, owner name, phone, website) and all pricing load from
  per-shop config at page load. When a shop edits config, the wizard reflects it
  on the next load — no redeploy.
- **17 vehicle buckets**, six darkness levels, and granular per-service feature
  flags are all shop-configurable.

### Service-aware URL pre-selection (great for matching ad → landing page → wizard)

- A `?service=<slug>` parameter **auto-advances** the customer straight past the
  service picker into the right flow. Accepted slugs include: `window-tint`,
  `auto-detailing`, `ceramic-coating`, `residential-tint`, `commercial-tint`
  (plus aliases like `tint`, `detailing`, `coating`, `home-tint`).
- A `?source=<label>` parameter captures attribution and is attached to the
  funnel's first event — so you can tag which ad/campaign sent the visitor.
- The loading screen even hydrates the service name from the URL on first paint
  ("Loading your [Window Tint] quote").

### Analytics integration (PostHog)

Full client-side funnel tracking, auto-tagged with the shop slug. Events fired:
- `wizard_started` (with `source` attribution)
- `step_viewed` / `step_completed` (with per-step timing)
- `quote_summary_viewed`
- `quote_submitted`
- `booking_completed`

Cross-domain identity stitching is supported (`?ph_distinct_id=`), so a visitor's
journey from the marketing site into the wizard is one stitched session.

### Booking redirects (SMS / online / calendar / deposit)

- **Booking method is per-shop:** "Text to Book" (recommended) or "Online Booking".
- **SMS deep-link CTA** opens the customer's texting app with a pre-filled message
  (shop name, customer name, vehicle, services, total, quote ID). CTA copy adapts:
  "Text [Business] to Book", "Book Online Now", "Request Coating Appointment",
  "Request Inspection", plus a secondary "Text [Owner] to Schedule".
- **Calendar + slot picker:** month view → "Pick your drop-off time" with
  live-fetched available slots sized to the job duration.
- **Deposit step (optional, per-service):** "A small deposit holds your slot —
  the rest is due at drop-off." Routes through Stripe checkout; the slot only
  confirms after payment.
- **Confirmation screen:** "✅ Booked!" with an **Add to Calendar** (.ics)
  download.

### Quote submission flow

- **Progressive two-stage lead capture** — the lead is created the moment contact
  info is entered (so a lead is never lost), then upgraded with the full quote
  detail when the quote renders.
- The full payload captures vehicle, coverage, VLT/darkness, film tier, add-ons,
  ceramic tier + add-ons, detailing package + condition answers, and
  residential/commercial scope.
- **Editable quote screen** — the customer sees an itemized breakdown ("Here's
  your quote/estimate") they can toggle line items on/off, with live subtotal +
  tax + total, before booking.
- Price-confidence footnote on every quote: **"Prices confirmed when we see your
  vehicle. Final amount verified at drop-off."**

### Multi-step UX, resume & trust

- **Five-phase progress indicator:** Service → Vehicle → Options → Quote → Book
  (the middle label changes per service).
- **Sticky bottom nav** + a **sticky running "Estimated subtotal"** preview that
  updates live as the customer configures.
- **Start-over** escape hatch and a **Home** link back to the marketing site.
- **Resume:** a completed quote persists locally (honoring an expiry window) so a
  returning visitor picks up where they left off; the last vehicle is cached for
  one-tap re-selection.
- **Custom-quote escape path** for anything unusual — "boat, RV, motorcycle, ATV,
  semi, box truck, equipment, or oversized vehicle" — with **photo upload** ("A
  picture helps us quote faster") and a "Got it — we'll be in touch … Usually
  within an hour during shop hours" confirmation.
- **Footer trust line:** "🔒 We'll never share your info. No payment taken
  online. Quotes confirmed before any work begins."

---

# Quick copy bank (lift-ready phrases)

**Tint**
- "All films block heat — upgraded films block more."
- "Max heat reduction · Best clarity · Top performance" (Ceramic IR)
- "Less glare · Less heat · Premium clarity" (Nano Ceramic)
- "Privacy + sun protection" / "Maximum privacy" (darkness ladder)

**Detailing**
- "Interior and exterior cleaning in one service." (Complete Detail)
- "Ceramic-coated glass repels rain, bugs, and road grime. Wipers work better.
  Visibility improves at night."

**Ceramic**
- "Every package includes professional System X ceramic application, wash, and
  surface prep."
- "The best balance of durability, gloss, and value for most daily drivers."
- "Paint inspection included."

**Trust / platform**
- "Quotes confirmed before any work begins."
- "Prices confirmed when we see your vehicle. Final amount verified at drop-off."
- "A rough count is fine — we'll measure on site." (residential/commercial)
