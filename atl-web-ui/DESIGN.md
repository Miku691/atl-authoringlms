# EduFlow — Design System Documentation

> **Source**: Stitch MCP · Project ID `15155094690541932935`  
> **Generated**: 2026-04-17  
> **Device Target**: Desktop (1376 × 768 baseline)  
> **Visibility**: Private  

---

## 1. Project Overview

**EduFlow Modern Landing Page** is a SaaS-grade, desktop-first public marketing site for an Institute Management System. The project contains two primary screens:

| Screen | Purpose | Dimensions |
|--------|---------|------------|
| `EduFlow Modern Landing Page` | Hero, features, testimonials, CTA | 1376 × 768 |
| `EduFlow Pricing and Plans` | Pricing tiers, plan comparison | 1376 × 768 |

The design is crafted to communicate trust, modernity, and educational authority — targeting institutional decision-makers (school principals, college administrators, coaching directors).

---

## 2. Design Theme

### 2.1 Color Mode
```
Mode:       LIGHT
```

### 2.2 Brand Color (Primary)
```
Primary:    #2A6DF4   (Vibrant Institutional Blue)
```

This is a confident, high-saturation blue that signals authority and innovation — ideal for an EdTech SaaS product. It is used for:
- Primary CTAs ("Get Started", "Book a Demo")
- Active states and focus rings
- Accent lines and highlights
- Link colors

**Derived Palette** (inferred from theme + saturation level):

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#2A6DF4` | Buttons, links, accents |
| `--color-primary-hover` | `#1A5CE0` | Hover states |
| `--color-primary-light` | `#EBF1FE` | Badge backgrounds, soft panels |
| `--color-primary-dark` | `#1A3D8A` | Headings over light bg, footer |
| `--color-surface` | `#FFFFFF` | Card backgrounds, modals |
| `--color-background` | `#F7F9FF` | Page background — subtle blue-tinted white |
| `--color-border` | `#E2E8F8` | Dividers, card borders |
| `--color-text-primary` | `#0F1D3A` | Headings, key text |
| `--color-text-secondary` | `#5A6B88` | Subheadings, descriptions |
| `--color-text-muted` | `#8FA3C0` | Captions, placeholders |
| `--color-success` | `#16A34A` | Success badges, checkmarks |
| `--color-error` | `#DC2626` | Validation errors |
| `--color-warning` | `#D97706` | Alert banners |

### 2.3 Saturation Level
```
Saturation: 3   (High — brand colors are vivid, not muted)
```
At saturation level 3, UI elements are vibrant and modern without being aggressive. Backgrounds remain soft while interactive elements pop.

---

## 3. Typography

### 3.1 Font Family
```
Font:   Inter (Google Fonts)
```

**Inter** is the canonical SaaS UI typeface — highly readable at all sizes, with excellent rendering at small and large scales. It is variable-weight, enabling precise typographic hierarchy.

### 3.2 Type Scale (Desktop)

| Role | Tag | Size | Weight | Line Height | Letter Spacing |
|------|-----|------|--------|-------------|----------------|
| Display Hero | `h1` | 56–64px | 800 (ExtraBold) | 1.1 | -0.02em |
| Section Heading | `h2` | 36–40px | 700 (Bold) | 1.2 | -0.01em |
| Card Title | `h3` | 22–24px | 600 (SemiBold) | 1.3 | 0 |
| Subheading | `h4` | 18px | 600 | 1.4 | 0 |
| Body Large | `p.lead` | 18px | 400 | 1.6 | 0 |
| Body Default | `p` | 16px | 400 | 1.6 | 0 |
| Body Small | `p.sm` | 14px | 400 | 1.5 | 0 |
| Caption | `span.caption` | 12px | 500 | 1.4 | 0.02em |
| Button | `button` | 15px | 600 | 1 | 0.01em |
| Nav Label | `nav a` | 14px | 500 | 1 | 0 |
| Badge | `span.badge` | 11–12px | 700 | 1 | 0.04em |

### 3.3 Font Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

---

## 4. Shape & Border Radius

```
Roundness:  ROUND_TWELVE  (12px base radius)
```

| Component | Border Radius |
|-----------|--------------|
| Cards | `12px` |
| Buttons (default) | `10px` |
| Buttons (pill/CTA) | `999px` |
| Input fields | `10px` |
| Badges/Tags | `999px` |
| Modal | `16px` |
| Feature icons | `12px` |
| Avatars | `50%` |
| Navbar | `0` (full width) |
| Tooltip | `8px` |

---

## 5. Spacing System

Uses an 8px base grid:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Icon gap, tight spacing |
| `--space-2` | `8px` | Text pairs, dense layouts |
| `--space-3` | `12px` | Badge padding, small gaps |
| `--space-4` | `16px` | Card padding (inner) |
| `--space-5` | `20px` | Form fields |
| `--space-6` | `24px` | Component gaps |
| `--space-8` | `32px` | Section element spacing |
| `--space-10` | `40px` | Card padding (outer) |
| `--space-12` | `48px` | Section padding vertical |
| `--space-16` | `64px` | Major section margins |
| `--space-20` | `80px` | Hero section padding |
| `--space-24` | `96px` | Full section height padding |

---

## 6. Screens & Layout Architecture

### 6.1 Screen 1 — EduFlow Modern Landing Page

**Layout**: Full-width, vertically stacked sections  
**Breakpoint**: 1376px desktop canvas

#### Section Structure:

```
┌─────────────────────────────────────────────┐
│  NAV BAR (sticky)                           │
│  Logo · Menu links · Login · Get Started    │
├─────────────────────────────────────────────┤
│  HERO SECTION                               │
│  Headline · Subheadline · Dual CTAs         │
│  ──── Floating UI Preview Card ────         │
│  Social proof: X+ institutions              │
├─────────────────────────────────────────────┤
│  TRUST BAR                                  │
│  Logos of partner institutions              │
├─────────────────────────────────────────────┤
│  FEATURES SECTION                           │
│  3-column grid · Icon · Title · Desc        │
├─────────────────────────────────────────────┤
│  HOW IT WORKS                               │
│  Numbered steps · Supporting visuals        │
├─────────────────────────────────────────────┤
│  TESTIMONIALS                               │
│  Quote cards · Avatar · Name · Institution  │
├─────────────────────────────────────────────┤
│  CTA BANNER                                 │
│  Final conversion nudge                     │
├─────────────────────────────────────────────┤
│  FOOTER                                     │
│  Links · Socials · Copyright                │
└─────────────────────────────────────────────┘
```

#### Navbar Spec:
- Height: `64px`
- Background: `#FFFFFF` with `box-shadow: 0 1px 0 #E2E8F8`
- Logo: left-aligned, `Inter 700`, primary blue
- Nav links: `14px / 500`, text-secondary, underline on hover
- Actions: "Login" (ghost), "Get Started" (primary pill button)
- Position: `sticky top-0`, `z-index: 100`

#### Hero Section Spec:
- Background: subtle gradient `linear-gradient(135deg, #F7F9FF 0%, #EBF1FE 100%)`
- Headline: `56–64px / 800`, text-primary, max-width `640px`
- Subheadline: `18px / 400`, text-secondary, max-width `520px`
- CTA Row: Primary button (filled blue) + Secondary ("Watch Demo", ghost/outlined)
- Floating UI Card: right-aligned, `border-radius: 16px`, drop shadow, preview of dashboard
- Padding: `96px 80px`

#### Features Section Spec:
- Background: `#FFFFFF`
- Layout: `3-column CSS grid`, gap `32px`
- Feature card: icon (48×48 in `--color-primary-light` container), `h3`, `p.sm`
- Section heading: `40px / 700`, centered
- Section subheading: `18px / 400`, text-secondary, centered

#### Testimonials Spec:
- Background: `#F7F9FF`
- Layout: `3-column grid` or carousel on narrow viewports
- Card: white background, `12px radius`, subtle shadow
- Quote mark: large `#2A6DF4` decorative glyph
- Avatar: 48×48 circular

---

### 6.2 Screen 2 — EduFlow Pricing and Plans

**Layout**: Full-width, pricing-focused  
**Breakpoint**: 1376px desktop canvas

#### Section Structure:

```
┌─────────────────────────────────────────────┐
│  NAV BAR (same as landing page)             │
├─────────────────────────────────────────────┤
│  PRICING HERO                               │
│  Heading · Sub · Monthly/Annual toggle      │
├─────────────────────────────────────────────┤
│  PRICING CARDS (3 tiers)                    │
│  Starter · Professional · Enterprise        │
│  Highlighted: "Most Popular" (middle card)  │
├─────────────────────────────────────────────┤
│  FEATURE COMPARISON TABLE                   │
│  Rows of features vs. tier availability     │
├─────────────────────────────────────────────┤
│  FAQ SECTION                                │
│  Accordion-style Q&A                        │
├─────────────────────────────────────────────┤
│  FOOTER (same as landing page)              │
└─────────────────────────────────────────────┘
```

#### Pricing Card Spec:

| Tier | Style | CTA |
|------|-------|-----|
| Starter | White card, grey border | "Get Started" (ghost) |
| Professional ✦ Most Popular | White card, `2px solid #2A6DF4` border, elevated shadow | "Start Free Trial" (primary filled) |
| Enterprise | White card, grey border | "Contact Sales" (ghost) |

- Card padding: `40px`
- Card radius: `12px`
- Price: `48px / 800`, text-primary
- Price period: `16px / 400`, text-muted
- Feature list: `14px / 400`, checkmark icon (`✓` in `--color-success`)

#### Billing Toggle Spec:
- Monthly / Annual toggle pill
- Annual shows "Save 20%" badge in `--color-primary-light`
- `background: #F1F5FD`, `border-radius: 999px`, inline-flex

---

## 7. Component Library

### 7.1 Buttons

```css
/* Primary Button */
.btn-primary {
  background: #2A6DF4;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font: 600 15px/1 'Inter', sans-serif;
  letter-spacing: 0.01em;
  transition: background 150ms ease, transform 100ms ease, box-shadow 150ms ease;
  box-shadow: 0 2px 8px rgba(42, 109, 244, 0.30);
}
.btn-primary:hover {
  background: #1A5CE0;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(42, 109, 244, 0.40);
}

/* Pill Variant */
.btn-primary.pill { border-radius: 999px; }

/* Ghost / Outlined */
.btn-ghost {
  background: transparent;
  color: #2A6DF4;
  border: 1.5px solid #2A6DF4;
  border-radius: 10px;
  padding: 11px 24px;
}
.btn-ghost:hover {
  background: #EBF1FE;
}
```

### 7.2 Cards

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F8;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.card:hover {
  box-shadow: 0 8px 24px rgba(42, 109, 244, 0.10);
  transform: translateY(-2px);
}
```

### 7.3 Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  font: 700 12px/1 'Inter', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.badge-primary { background: #EBF1FE; color: #2A6DF4; }
.badge-success { background: #DCFCE7; color: #16A34A; }
.badge-popular {
  background: #2A6DF4;
  color: #FFFFFF;
}
```

### 7.4 Feature Icon Containers

```css
.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #EBF1FE;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2A6DF4;
  font-size: 22px;
  margin-bottom: 16px;
}
```

### 7.5 Section Wrapper

```css
.section {
  padding: 80px 0;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}
.section-heading {
  font: 700 40px/1.2 'Inter', sans-serif;
  color: #0F1D3A;
  text-align: center;
  margin-bottom: 16px;
}
.section-subheading {
  font: 400 18px/1.6 'Inter', sans-serif;
  color: #5A6B88;
  text-align: center;
  max-width: 560px;
  margin: 0 auto 48px;
}
```

---

## 8. Elevation & Shadow System

| Level | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Subtle borders, inputs |
| `shadow-md` | `0 2px 8px rgba(0,0,0,0.08)` | Cards default |
| `shadow-lg` | `0 8px 24px rgba(42,109,244,0.10)` | Cards hover, modals |
| `shadow-xl` | `0 16px 48px rgba(42,109,244,0.18)` | Hero floating UI, dropdowns |
| `shadow-brand` | `0 4px 16px rgba(42,109,244,0.35)` | Primary buttons hover |

---

## 9. Animation & Motion

All interactions follow **ease-out** curves for natural feel:

| Property | Duration | Timing |
|----------|----------|--------|
| Button hover | `150ms` | `ease-out` |
| Card hover | `200ms` | `ease-out` |
| Nav active | `200ms` | `ease-out` |
| Section fade-in | `400ms` | `ease-out` |
| Toggle switch | `250ms` | `ease-in-out` |
| Tooltip appear | `120ms` | `ease-out` |

Scroll-triggered section reveals use `opacity: 0 → 1` + `translateY(20px → 0)`.

---

## 10. Icon System

- **Icon Library**: Heroicons or Lucide (outlined, 24px base)
- **Size Variants**: `16px` (inline), `20px` (compact UI), `24px` (feature icons)
- **Color**: Inherits from parent context (`currentColor`)
- **Stroke Width**: `1.5px` (Heroicons) for a clean, premium look

---

## 11. Design Principles

> The EduFlow landing page is built around four cornerstones:

1. **Trust** — Institutional imagery, clean whitespace, and a professional blue palette signal reliability to education administrators.
2. **Clarity** — Information hierarchy is strict: hero → evidence → features → proof → conversion, with no visual clutter.
3. **Action** — Every section has a clear CTA; primary buttons are placed above the fold and at every section exit.
4. **Adaptability** — The design adapts labels (School / College / Coaching) without structural change, mirroring the multi-tenant backend philosophy of IMS.

---

## 12. Alignment with ATL Web UI (`atl-web-ui`)

The EduFlow design tokens are intended to be **the source of truth** for the public-facing `LandingPage.tsx` and related components in `atl-web-ui`. The following mapping applies:

| DESIGN.md Token | ATL UI Usage |
|-----------------|-------------|
| `#2A6DF4` primary | `--color-primary` in `index.css` |
| `Inter` font | Already in use via Google Fonts |
| `12px` border radius | `--radius-card` |
| `LIGHT` mode | Default theme for public routes |
| Hero gradient | `LandingPage.tsx` hero background |
| 3-col feature grid | `Features.tsx` component layout |
| Pricing card spec | Future `Pricing.tsx` component |

---

## 13. File Structure Guidance

```
atl-web-ui/src/public/
├── LandingPage.tsx           # Root page assembler
├── components/
│   ├── Navbar.tsx            # Sticky nav with CTA buttons
│   ├── HeroSection.tsx       # Headline + CTAs + floating UI preview
│   ├── TrustBar.tsx          # Partner logos
│   ├── Features.tsx          # 3-col feature grid (currently open)
│   ├── HowItWorks.tsx        # Numbered steps
│   ├── Testimonials.tsx      # Quote cards
│   ├── CtaBanner.tsx         # Final conversion section
│   ├── Footer.tsx            # Links + copyright
│   └── Sections.tsx          # Shared section wrapper (currently open)
└── pages/
    └── PricingPage.tsx       # Pricing tiers + comparison
```

---

*This DESIGN.md is a living document. Update it whenever the Stitch project is modified or the ATL Web UI design tokens change.*
