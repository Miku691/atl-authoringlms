# Student Portal Enhancement — Design System Documentation
> Extracted from Stitch Project: **Student portal enhancement** (`projects/3640980767494605424`)  
> Design System: **Proportional Elegance / The Academic Curator**  
> Asset ID: `assets/e97694a0c3e04d00a6816a5da2cdb397`

---

## 1. Design Philosophy — "The Academic Curator"

Rather than treating a student portal as a cluttered utility, the system treats it as a **high-end digital sanctuary**. The core philosophy:

- **Reduce cognitive load** through extreme spatial harmony and editorial precision.
- **Intentional asymmetry** and "breathable" layouts — away from traditional "boxed-in" dashboard templates.
- **Prioritize focus** through generous whitespace and a sophisticated tonal palette.
- The student's journey must feel **premium, authoritative, and calm**.

---

## 2. Color Palette

### Stitch Design Theme Settings
```
colorMode: LIGHT
font: INTER
roundness: ROUND_EIGHT (8px base radius)
customColor: #2A6DF4
saturation: 2
overridePrimaryColor: #2A6DF4
overrideSecondaryColor: #1A3D8A
overrideNeutralColor: #F7F9FF
```

### Named Color Tokens
| Token | Value | Usage |
|---|---|---|
| `background` | `#f7f9ff` | Page foundation |
| `surface` | `#f7f9ff` | Base surface |
| `surface-container-lowest` | `#ffffff` | Cards, active surfaces |
| `surface-container-low` | `#f1f3f9` | Large structural areas |
| `surface-container` | `#eceef4` | Containers |
| `surface-container-high` | `#e6e8ee` | Hover states |
| `surface-container-highest` | `#e0e2e8` | Emphasized areas |
| `primary` | `#0054d1` | Primary brand color |
| `primary-container` | `#2a6df4` | CTA buttons, highlights |
| `secondary` | `#3c5ba9` | Supporting accents |
| `secondary-container` | `#8eabff` | Badges, pills |
| `on-primary` | `#ffffff` | Text on primary |
| `on-surface` | `#181c20` | Body text |
| `on-surface-variant` | `#424655` | Muted text |
| `outline` | `#737686` | Borders (sparingly) |
| `outline-variant` | `#c2c6d7` | Ghost borders |
| `error` | `#ba1a1a` | Error states |
| `error-container` | `#ffdad6` | Error bg |
| `tertiary` | `#9e3f00` | Warm accent |
| `tertiary-container` | `#c65100` | Warm CTA |

### The "No-Line" Rule
Boundaries must be defined through **background color shifts** and **tonal transitions**, NOT 1px solid borders. If a border is absolutely required, use a "Ghost Border": `outline-variant` (#c2c6d7) at **20% opacity max**.

### Surface Hierarchy
```
Level 0 (Base)      → background (#f7f9ff)           — Page canvas
Level 1 (Sections)  → surface-container-low (#f1f3f9) — Structural areas  
Level 2 (Cards)     → surface-container-lowest (#fff) — Cards, interactives
```

### Signature Effects
- **Glass Effect** (modals/dropdowns): `surface-container-lowest` at **85% opacity** + `20px backdrop-blur`
- **Soulful Gradient** (primary CTAs): `linear-gradient(135deg, #0054d1, #2a6df4)`
- **Ambient Shadow** (hover/floating): `box-shadow: 0 8px 32px -4px rgba(26,61,138,0.06)`

---

## 3. Typography

**Font Family**: Inter (exclusively)

| Role | Style | Color | Notes |
|---|---|---|---|
| Headlines / Branding | `Semi-Bold`, Large | `#1A3D8A` ("Deep Tone") | Authoritative editorial anchor |
| Body Content | `Regular`, 14-16px | `#1E293B` (near-black) | High contrast for readability |
| Labels / Metadata | `Medium`, 12px | `#64748B` | +2% letter-spacing for premium feel |
| Page Title | `Bold`, 20-24px | `#181c20` | Section identity |
| Stat Numbers | `Bold/Black`, 32px+ | `#0054d1` / `#1A3D8A` | KPI values in cards |

Typography relies on **weight and scale** rather than decorative fonts.

---

## 4. Elevation & Depth

### The Layering Principle
Achieve depth by "stacking" surface tiers:
- A `#ffffff` card on a `#f1f3f9` section creates a natural, soft lift.
- Avoid hard shadows for standard layout components.

### Ambient Shadow (Hover/Floating)
```css
box-shadow: 0 8px 32px -4px rgba(26, 61, 138, 0.06);
```

### Forbidden
- **No** pure black (#000000) in borders or shadows.
- **No** standard "Material" drop shadows.
- **No** 100% opacity solid borders for layout containment.

---

## 5. Component Design Rules

### Buttons
| Variant | Background | Text | Radius | Notes |
|---|---|---|---|---|
| Primary | `linear-gradient(135deg, #0054d1, #2a6df4)` | `#ffffff` | `12px` | Main CTA |
| Secondary | `surface-container-high` | `on_secondary_container` | `12px` | No border |
| Tertiary | Transparent | `#0054d1` | `12px` | Hover: `surface-container-low` bg |

### Cards
- **Outer radius**: `16px` (xl)
- **Inner radius** (nested elements): `12px` (lg)
- **Background**: `#ffffff`
- **No hard borders** — rely on tonal separation
- **Hover**: Apply ambient shadow + scale micro-animation
- **The Divider Rule**: Forbid horizontal divider lines; use 16px vertical spacing or 2-unit bg shift on hover

### Inputs / Fields
- Background: `#ffffff`
- Border: Ghost border (outline-variant at 20% opacity)
- Focus: `1px solid #2a6df4` + ambient shadow
- Labels: `label-md` (#64748B) **above** the field, never inside

### Progress & Status
- **Progress bar fill**: `#2a6df4`
- **Progress bar track**: `#e6e8ee`
- **Badges**: `8px` radius, low-vibrancy

### Navigation Sidebar
- Background: `#ffffff`
- Width: `240px-260px`
- Active item: Left-border indicator + `#f1f3f9` bg tint
- Active text: `#0054d1`
- Inactive text: `#424655`
- Icons: Thin-line Material Symbols Outlined

### Icons
- Library: **Material Symbols Outlined** (thin) or **Lucide React** (1.5px stroke)
- Size: 20px standard, 16px for labels

---

## 6. Layout Principles

### Grid & Spacing
- **Sidebar**: Fixed ~240px left
- **Main content**: Remaining width, max-w-7xl
- **Asymmetrical**: wide primary content + slim sidebar
- **Dashboard main grid**: 2-col (2:1 ratio) — content vs. sidebar
- **Card padding**: `24px` standard, `32px` for KPI cards
- **Gaps**: `16px`–`24px` between cards
- **Spacing scale**: `3`

### The Whitespace Priority
> If a layout feels "full," increase the padding by 1.5×.

### Progressive Disclosure
If data density is high, hide details until hover or click.

---

## 7. Screen-by-Screen Design Specifications

---

### Screen 1: Student Dashboard Hub Redesign
**Stitch ID**: `518d09ca2e6b4951ba35373998abc127`

#### Layout
```
┌──────────────────┬────────────────────────────────────┐
│  LEFT SIDEBAR    │  Hero Welcome Banner (light bg)     │
│  ─ Logo          │  Quick Stats Row (4 cards)          │
│  ─ Student Info  │  Today's Schedule (list)            │
│  ─ Nav Links     │  Quick Actions (2 buttons)          │
│  ─ Logout        │  Announcements Feed                 │
└──────────────────┴────────────────────────────────────┘
```

#### Hero Welcome Banner
- **BG**: `surface-container-low` (#f1f3f9) — NOT dark
- **Greeting**: "Good Morning, [Name] 👋"
- **Font**: Semi-Bold, `#1A3D8A`, large headline
- **Subtitle**: Body text, muted `#424655`

#### Quick Stats Row (4 cards)
| Card | Value | Accent |
|---|---|---|
| Overall Attendance | `87%` | `#2a6df4` primary |
| Next Class | Name + `09:30 AM · Room 204` | neutral |
| Pending | `3 Due This Week` | amber/warning |
| Fees Status | `₹12,000 Due · May 15` | warm `tertiary` |

#### Today's Schedule
- Section label: uppercase, muted, tracking-wide
- Each row: time range | subject | instructor
- BG: `#ffffff`, hover: `#f1f3f9`

#### Quick Actions
- `calendar_month` → Timetable
- `assignment` → Assignments
- Cards: `#ffffff`, icon on `surface-container-low`, hover effect

#### Announcements Feed
- Title (bold) + "Read More →" link
- Priority badge: URGENT = `error` variant

---

### Screen 2: Attendance Overview & Stats
**Stitch ID**: `8d9f3264ec264293986985c05cac57a9`

#### Layout
```
┌──────────────────┬────────────────────────────────────┐
│  LEFT SIDEBAR    │  "My Attendance"                    │
│                  │  "Semester 4 — B.Tech CS"           │
│                  │  Stats Row (Overall% | Present | Absent)
│                  │  Subject-Wise Table                 │
│                  │  Monthly Calendar Heatmap           │
└──────────────────┴────────────────────────────────────┘
```

#### Stats Row
- 3 cards on `#ffffff`, `radius: 16px`
- Overall %: Large number in `#2a6df4`
- Present count: green accent
- Absent count: `error` accent

#### Subject-Wise Table
- No table border — row spacing only
- % column color-coding: ≥75% green, 65-74% amber, <65% red
- Header: `surface-container-low`
- Row data: `#ffffff`

#### Monthly Calendar Heatmap
- Present days: `#2a6df4` light tint
- Absent days: `#ffdad6` (error-container)
- Holiday/weekend: `#e6e8ee`
- Future: `#f1f3f9`

---

### Screen 3: My Timetable
**Stitch ID**: `3cb60319a0224bbaa6bfb961dd4eb526`

#### Layout
```
┌──────────────────┬────────────────────────────────────┐
│  LEFT SIDEBAR    │  "My Timetable"                     │
│                  │  "Semester 4 — B.Tech CS"           │
│                  │  Day Selector Tabs (Mon–Sat)        │
│                  │  Time Grid (class blocks)           │
└──────────────────┴────────────────────────────────────┘
```

#### Day Selector Tabs
- Pill chips: `#f1f3f9` default, `#2a6df4` filled active
- Active text: `#ffffff`, inactive: `#424655`

#### Class Block Cards
- `#ffffff`, `radius: 16px`
- Left accent bar: unique color per subject
- Columns: Time | Subject name (bold) | Room + Instructor (muted)
- Hover: ambient shadow

---

### Screen 4: Assignment Tracking Board
**Stitch ID**: `5b36be916510493c96a92997e09613cd`

#### Layout
```
┌──────────────────┬────────────────────────────────────┐
│  LEFT SIDEBAR    │  "Assignments"                      │
│  + Student ID    │  "Track and submit your tasks"      │
│                  │  Status Tabs: Pending | Submitted | Overdue
│                  │  Assignment Cards Grid              │
└──────────────────┴────────────────────────────────────┘
```

#### Status Tabs
- Pending (3): amber accent
- Submitted (5): green/`secondary` accent
- Overdue (1): `error` accent
- Active tab: filled pill

#### Assignment Card
- `#ffffff`, `radius: 16px`
- Status badge (top-right)
- Title: bold `#181c20`
- Description: 2-line clamp, muted
- Subject chip: `secondary-fixed` bg
- Due date: `label-sm` + clock icon
- CTA:
  - Pending → "Submit" (primary gradient)
  - Submitted → "View Submission →" (tertiary link)
  - Overdue → "Submit Now" (error filled)

---

### Screen 5: Financial Ledger & Fees
**Stitch ID**: `e88111ba73b54dd2b099d89c103bae2f`

#### Layout
```
┌──────────────────┬────────────────────────────────────┐
│  LEFT SIDEBAR    │  "My Finance"                       │
│                  │  "Financial Ledger & Fees"          │
│                  │  Summary Cards (3)                  │
│                  │  Fee Structure Table                │
│                  │  Payment History + Pay Now CTA      │
└──────────────────┴────────────────────────────────────┘
```

#### Summary Cards (3)
- Total Fees: neutral
- Paid: green accent
- Outstanding: `tertiary` warm accent

#### Fee Table
- Status: PAID (green badge), DUE (amber), OVERDUE (red)
- Amounts right-aligned, bold
- No table borders — row bg alternation

#### Pay Now CTA
- Primary gradient button, full-width
- Icon: `payments`

---

## 8. Sidebar Navigation — Full Spec

### Student Header
```
[Avatar/Initials circle]
Student Name
Program · Semester
```

### Nav Items
| Icon | Label | Route |
|---|---|---|
| `dashboard` | Dashboard | `/student` |
| `calendar_month` | My Timetable | `/student/timetable` |
| `how_to_reg` | My Attendance | `/student/attendance` |
| `school` | My Academics | `/student/academics` |
| `analytics` | My Results | `/student/results` |
| `payments` | My Finance | `/student/finance` |
| `assignment` | Assignments | `/student/assignments` |
| `event_busy` | My Leaves | `/student/leaves` |
| `person` | My Profile | `/student/profile` |
| `logout` | Logout | action |

---

## 9. Tailwind Token Mapping (for ATL React Implementation)

```css
/* Page backgrounds */
bg-[#f7f9ff]        ← surface (page)
bg-white            ← surface-container-lowest (cards)
bg-[#f1f3f9]        ← surface-container-low (sections/hero)

/* Brand colors */
bg-[#2a6df4]        ← primary-container (filled buttons)
text-[#0054d1]      ← primary (text links, accents)
text-[#1a3d8a]      ← secondary deep tone (headlines)

/* Text */
text-[#181c20]      ← on-surface (body)
text-[#424655]      ← on-surface-variant (muted)
text-[#64748b]      ← labels, metadata

/* Border (ghost) */
border-[#c2c6d7]/20 ← outline-variant at 20% opacity

/* Radius */
rounded-2xl         ← 16px cards
rounded-xl          ← 12px inner elements

/* Shadow (ambient) */
shadow-[0_8px_32px_-4px_rgba(26,61,138,0.06)]

/* Gradient CTA */
bg-gradient-to-br from-[#0054d1] to-[#2a6df4]
```

---

## 10. Implementation Notes

### Key Change from Current Implementation
The existing `StudentDashboardHome.tsx` uses a **dark** `#0A0C10` hero banner.  
Per the Stitch design spec, ALL screens use **LIGHT mode** with `#f1f3f9` or `#ffffff` backgrounds.

The redesign will:
1. **Replace** the dark hero with a light editorial hero (soft blue-gray, `#f1f3f9`)
2. **Replace** `rounded-[3rem]` / `rounded-[2.5rem]` with the token-aligned `rounded-2xl` (16px)
3. **Keep** Inter font ✅
4. **Shift** color from indigo-centric (`slate-900/indigo`) to the blue palette (`#2a6df4`, `#1a3d8a`, `#f7f9ff`)
5. **Apply** the no-border rule — bg color shifts replace borders
6. **Apply** ambient shadows instead of `shadow-2xl`

### Screens to Implement
| File | Screen |
|---|---|
| `StudentDashboardHome.tsx` | Screen 1: Dashboard Hub |
| `MyAttendancePage.tsx` | Screen 2: Attendance |
| `MyTimetablePage.tsx` | Screen 3: Timetable |
| `MyAssignmentsPage.tsx` | Screen 4: Assignments |
| `MyFinancePage.tsx` | Screen 5: Finance |
