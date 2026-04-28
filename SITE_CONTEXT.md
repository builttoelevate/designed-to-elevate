# Designed to Elevate — Site Context

This document is reference material for Claude Code. It contains everything you need to know about the business, the founder, the voice, and the sections of the homepage. It does **not** tell you how to design anything. Design direction is yours — pull palette, typography, mood, and layout entirely from the logo. Make confident creative decisions and commit to them.

---

## The business

**Name:** Designed to Elevate

**What it is:** A digital marketing studio for local service-based businesses. Brand new — no extensive client portfolio yet, but two live project examples already exist. The site needs to look polished and complete without faking proof.

**Who it serves:** Local service-based businesses that depend on appointments, quotes, and repeat customers. Specifically:
- Auto detailing shops
- Window tint shops
- Barbershops and grooming businesses
- Home service providers
- Small local service brands

**Founder email:** bilsonxnc@gmail.com

**Founder phone:** 740-617-6488

**Based in:** Zanesville, Ohio

**Service area:** Local roots, but available to work with service businesses anywhere.

---

## The founder story

I started Fitchin Automotive Detailing & Window Tinting from nothing. In the beginning I was close to all of it — the work, the customers, the quotes, the messages.

Over time I trained my sister's boyfriend to handle the tint work and stepped out of the install side completely. That freed me up to focus on what was actually keeping the business growing: the marketing. The website, the service pages, the quote flow, the Google presence, the way customers found us and trusted us before they ever called.

Designed to Elevate is the system I built for Fitchin, now offered to other service-business owners. I'm not a marketer who learned from theory — I'm a service-business owner who had to figure marketing out in the real world to keep my own shop growing.

### Framing rules for the founder story

- Fitchin is my own business, **not a client case study.** Frame it as founder background.
- **No dollar amounts.** No revenue figures, no client counts, no specific numbers.
- **No fake proof.** No invented testimonials, no fake reviews, no fake client logos, no "trusted by" claims.
- **No empty claims.** Avoid phrases like "proven system," "guaranteed results," "award-winning," "industry-leading."

---

## Services

Six services to feature:

1. **Website Design** — clean, mobile-friendly websites for service businesses
2. **Landing Pages** — focused pages for specific services, ads, promotions, or campaigns
3. **Local SEO Structure** — service page planning, keyword-focused content, headings, metadata, FAQs, local search alignment
4. **Lead Generation Systems** — quote forms, booking paths, intake flows, follow-up strategy
5. **Website Copywriting** — clear copy that explains services, builds trust, handles objections
6. **Marketing Strategy** — practical guidance for offers, website flow, customer journey

---

## The Elevate System

This is the signature framework. Four parts:

1. **Clear Offer** — what you sell and why customers should care
2. **Conversion Page** — how the page guides visitors toward contact, quotes, or bookings
3. **Local Visibility** — content structured around services, locations, and search intent
4. **Lead Flow** — what happens after someone clicks, calls, or fills out a form

---

## Voice and tone

Direct. Grounded. No fluff. Sounds like a service-business owner talking to another service-business owner — not a marketing agency talking down to a small business.

### Signature lines (use verbatim somewhere on the site)

- **"Built From the Bay, Not a Boardroom"** — this is the founder section headline
- **"It's not a hustle problem. It's a system problem."**
- **"More customers. Less chasing."**

### Voice rules

- Avoid agency-speak and stacked marketing buzzwords
- Avoid the word "solutions"
- Vary phrasing — don't repeat "local service businesses" more than necessary in any single section
- Plain language over jargon
- Short sentences land harder than long ones

---

## Sections the site needs

Twelve sections total. Listed here as information, not as layout instructions — sequencing and placement are yours to decide if you see a stronger structure.

1. **Header** — logo, navigation (Services, Process, Projects, Contact), primary CTA "Request a Quote"

2. **Hero** — headline, supporting paragraph, primary CTA "Request a Quote," secondary CTA "View Services," micro trust line listing service categories

3. **Who This Is For** — the five service-business types listed above

4. **Problem Section** — the gap most service businesses have online: unclear messaging, weak calls-to-action, thin local SEO, no real lead path

5. **Services** — the six services listed above

6. **The Elevate System** — the four-part framework

7. **Founder Section** — headline "Built From the Bay, Not a Boardroom." The Fitchin story, framed as founder background, no dollar amounts.

8. **Projects** — two real, live projects to feature with working links:
   - **Modern Classic** — barbershop website. Live at https://builttoelevate.github.io/modern-classic/
   - **Fitchin — Auto Detailing** — service page from the founder's own shop. Live at https://fitchin-website.vercel.app/auto-detailing

   These are real work, not placeholders. Both should link out to the live sites. Frame Modern Classic as a client project. Frame the Fitchin page as the founder's own shop and the system in action.

9. **Process** — five steps: Discovery, Strategy, Build, Launch, Improve

10. **Ways to Work Together** — four cards, no prices:
    - One-Time Website Projects
    - Landing Page Projects
    - Monthly Marketing Support
    - Marketing Strategy Consulting

11. **FAQ** — questions covering: what Designed to Elevate does, who it works with, that the brand is new, no guarantees on rankings or leads, how to get started, service area (based in Ohio, available anywhere)

12. **Final CTA + Footer** — final call-to-action, contact form, footer with brand name, tagline, email, phone, location/service area, nav links, and three legal page links (Privacy Policy, Terms of Service, Refund Policy)

---

## Contact form

Fields:
- Name
- Business Name
- Email
- Phone
- Website URL
- "What do you need help with?" — dropdown with these options:
  - Website Design
  - Landing Page
  - SEO
  - Lead Generation System
  - Marketing Strategy
  - Not Sure Yet
- Message

Submit button: **Send Request**

---

## Stripe readiness

This site needs to pass Stripe's business website review so the business can process payments.

Requirements:
- Business name "Designed to Elevate" appears clearly in the header, footer, and at least one body section
- Services described in plain language — what's sold, who it's for, how it works
- Visible contact information: email (bilsonxnc@gmail.com), phone (740-617-6488), and location (Zanesville, Ohio — available anywhere) in the footer; working contact form on the page
- Three legal pages exist as real, reachable pages linked in the footer:
  - Privacy Policy
  - Terms of Service
  - Refund Policy
  Stub them with clearly-marked placeholder content for the founder to fill in later — but the routes must work and the links must resolve.
- Copyright line in the footer with the business name and current year
- Site is publicly accessible — no login walls, no "coming soon" splash blocking the homepage
- Pricing language: "project-based" or "custom quote" is fine instead of listed prices, but services and what's included must be described clearly enough that a reviewer understands what customers are paying for
- No claims that could trigger flags: no "guaranteed results," no medical/financial/legal claims, no get-rich-quick language

---

## Technical notes

- Astro framework
- Mobile-first, fully responsive
- Accessible: semantic HTML, proper heading hierarchy with one H1, alt text on images, sufficient color contrast against whatever palette is built from the logo
- Clean and performant — no heavy frameworks or bloated dependencies unless there's a real reason
- One H1 only (the hero headline)
- Proper meta tags: title, description, open graph

---

## What you have full freedom on

- Color palette (pull from the logo)
- Typography pairing
- Layout, spacing, and visual rhythm
- Animation and interaction
- Imagery, iconography, and any decorative elements
- Section order if you see a stronger sequence than the one listed
- Component structure
- Copy phrasing — keep the voice rules and signature lines, but write the rest in your own words

Don't ask design questions. Make decisions and commit to them. If you find yourself wanting to ask for clarification on a design choice, make the call and explain it briefly in your response.
