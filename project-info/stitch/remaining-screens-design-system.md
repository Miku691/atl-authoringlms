# Remaining Student Portal Screens — Design System Reference
## Academic Curator · "Proportional Elegance"

This document captures the extracted Stitch design for the **4 remaining student-facing pages**:
1. **My Profile** (Student Profile - EduFlow)
2. **My Leaves / Leave Requests** (Academic Curator - My Leaves)
3. **My Results** (The Curator - My Results)
4. **My Finance** — enriched variant (The Academic Curator - Financial Ledger & Fees)

All screens share the same tokens already established in `student-portal-design-system.md`.
This document only records what is **new or additional** for these screens.

---

## 1. Shared Design Tokens (Reminder)

| Token | Value |
|---|---|
| Background | `#f7f9ff` |
| Structural Section / Page Header | `#f1f3f9` |
| Card Background | `#ffffff` |
| Border / Dividers | Never use lines — use tonal bg shifts |
| Primary Blue | `#0054d1` |
| Accent Blue | `#2a6df4` |
| Deep Navy (headings) | `#1a3d8a` |
| Body Text | `#181c20` |
| Secondary Text | `#424655` |
| Muted Text | `#64748b` |
| Border Color (if absolutely needed) | `#e6e8ee` or `#f1f3f9` |
| Danger | `#ba1a1a` |
| Danger Bg | `#ffdad6` |
| Warning | `#9e3f00` |
| Warning Bg | `#fff3ec` |
| Ambient Shadow (cards) | `0 2px 16px -4px rgba(26,61,138,0.06)` |
| Hover Shadow (cards) | `0 8px 32px -4px rgba(26,61,138,0.10)` |
| Card Radius (main) | `rounded-2xl` = 16px |
| Inner Elements | `rounded-xl` = 12px |
| Badge / Tag | `rounded-full` |
| Font | `Inter`, via system stack |
| Page Header Pattern | `bg-[#f1f3f9]` block, with eyebrow label above h1, decorative blur circle top-right |

---

## 2. Student Profile Page

### Screen ID
`1520df177eec4858b699e5d3a5aac839` — "Student Profile - EduFlow"

### Page Layout
- **Page Header Banner**: Same `#f1f3f9` pattern with eyebrow "Student Identity" + h1 "My Profile".
- **Sub-heading**: "Personal & Academic Information"
- **Student Badge / ID chip**: Small pill showing admission number e.g. `STU-2024-0042` — styled `bg-[#dae1ff] text-[#0054d1]`, with a `badge` icon prefix.

### Card Sections (3 vertical sections)
Each section is a white `rounded-2xl` card with ambient shadow, containing:
- A **section header row** with:
  - Icon in `w-9 h-9 rounded-xl` container (tonal bg based on section type)
  - Section title in `text-xs font-semibold text-[#64748b] uppercase tracking-widest`
- **2-column field grid** inside for info rows

#### Section 1 — Personal Details
- Icon: `person_book` → use `User` from lucide
- Icon container bg: `#f1f3f9`
- Fields displayed in a `grid grid-cols-2` layout:
  - Date of Birth
  - Gender
  - Blood Group
  - Phone
  - Email
  - Address (full width, spans 2 cols)

#### Section 2 — Guardian Information
- Icon: `family_restroom` → use `Users` from lucide
- Icon container bg: `#fff3ec` (warm tint)
- Fields:
  - Guardian Name
  - Relation
  - Guardian Phone
  - Occupation

#### Section 3 — Academic Context
- Icon: `school` → use `BookOpen` from lucide
- Icon container bg: `#dae2ff`
- Fields:
  - Department
  - Program Duration
  - Academic Advisor (with avatar placeholder)

### Field Row Design Pattern
```
Label  (10px, semibold, #64748b, uppercase, tracking-widest, mb-0.5)
Value  (14px, semibold, #181c20)
```
Each field pair is in its own `div`, inside a `grid grid-cols-2 gap-x-8 gap-y-5`.
For full-width fields like address: `col-span-2`.

### No Edit Forms
The Stitch screen is **view-only / read-only**. No inline editing shown.
Values appear as printed text, not inputs.

### Avatar / Profile Picture
- Top of card or in header area
- `w-24 h-24 rounded-2xl` (square, rounded) avatar container
- Background: `#dae2ff` with initials monogram if no photo
- Below avatar: name + student ID chip

---

## 3. My Leaves Page

### Screen ID
`403b3a74a3ac471892a044c9f9846fb9` — "Student Leave Management - EduFlow Redesign"

### Page Title Pattern
- Eyebrow: "Leave Management"
- h1: "My Leaves"
- Sub-title: "Apply and track your leave requests across the academic term."

### Leave Type Quota Row
Three leave type cards shown in a `grid grid-cols-3` row at top:

| Type | Icon | Color | Notes |
|---|---|---|---|
| Casual Leave | `CalendarOff` | Blue (`#2a6df4`, bg `#eef2ff`) | "General absence" |
| Medical Leave | `HeartPulse` | Amber (`text-amber-700`, bg `amber-50`) | "Requires certificate" |
| Emergency Leave | `Zap` | Danger Red (`#ba1a1a`, bg `#ffdad6`) | "Urgent matters" |

Each card shows:
- Icon in colored `w-10 h-10 rounded-xl`
- Leave type name (`text-sm font-bold text-[#181c20]`)
- Sub-note (`text-xs text-[#64748b]`)
- Quota info e.g. `X / Y days used` with a horizontal progress bar

### Apply Leave Form Card
White `rounded-2xl` card with:
- Header: "Apply Leave" + sub "Submit a new request for approval."
- **Leave Type selector** — styled tab buttons (not a dropdown), three button-pills for Casual / Medical / Emergency
- **From Date** and **To Date** — two date fields side by side (using `DatePicker` or plain `input[type=date]` styled to match design system — label above, `rounded-xl bg-[#f7f9ff]` input)
- **Reason textarea** — `rounded-xl bg-[#f7f9ff] border-0`, placeholder "Describe the reason for your leave..."
- **Document Upload zone** — dashed border `rounded-xl`, "Click to upload or drag and drop / PDF, JPG or PNG (max. 5MB)"
- **Submit CTA** — full-width `bg-gradient-to-br from-[#0054d1] to-[#2a6df4]` button, `text-white text-sm font-semibold rounded-xl py-3`

### Leave History Card
White `rounded-2xl` card below form:
- Header: "Leave History" + sub "Recent applications and status."
- Each leave item is a row inside the card with:
  - Left: colored dot + leave type badge (`bg-[#dae2ff] text-[#0054d1]` for Casual, etc.) + `X Days`
  - Middle: date range text
  - Middle: reason text (`text-xs text-[#424655]`)
  - Right: status pill (`APPROVED` → `bg-[#dae2ff] text-[#0054d1]`, `PENDING` → `bg-[#fff3ec] text-[#9e3f00]`, `REJECTED` → `bg-[#ffdad6] text-[#ba1a1a]`)
- Rows separated by tonal bg on hover (`hover:bg-[#f7f9ff]`), no lines

---

## 4. My Results Page

### Screen ID
`8257a4f789cc4521a358b0fb166d36c0` — "My Academic Results - EduFlow Redesign"

### Page Title Pattern
- Eyebrow: "Academic Performance"
- h1: "My Results"
- Sub: "B.Tech Computer Science — Semester 4"

### Top-Level GPA Banner
Three stat chips in the page header `#f1f3f9` area (or directly below it):
- **Cumulative GPA** — main large number (`text-4xl font-bold text-[#1a3d8a]`)
- **This Semester** — secondary stat
- **Total Credits Earned** — secondary stat
Each in a small white `rounded-xl` pill card (`px-6 py-4`, ambient shadow)

### Semester Performance Trend Chart
White `rounded-2xl` card:
- Header: "Semester-wise Performance Trend"
- **Bar chart or line chart** using SVG / any charting lib
  - Y axis: GPA 0.0 → 10.0
  - X axis: Semester 1, 2, 3, 4…
  - Bars: gradient fill from `#2a6df4` → `#0054d1`
  - Hover tooltip showing GPA value
- If no charting lib available: render a simple visual list showing per-semester GPA with a horizontal bar per row

### Subject-wise Results Table
White `rounded-2xl` card:
- Header: "Subject Results"
- Table columns:
  - Subject Name
  - Credits
  - Internal Marks
  - External Marks
  - Total / Max
  - Grade (letter: A, B+, etc.)
  - Status (`PASS` → `bg-[#dae2ff] text-[#0054d1]`, `FAIL` → `bg-[#ffdad6] text-[#ba1a1a]`)
- Table header row: `bg-[#f7f9ff]`, 10px uppercase tracking-widest labels
- Row hover: `hover:bg-[#f7f9ff]`
- No heavy lines — row separator via `border-t border-[#f7f9ff]`

### Grade Legend
Small row of pills below or alongside the table:
- O (Outstanding, 10) → `bg-[#dae2ff] text-[#0054d1]`
- A+ (Excellent, 9–9.9) → `bg-[#eef2ff] text-[#2a6df4]`
- A (Very Good, 8–8.9) → `bg-[#f0f4ff] text-[#3c5ba9]`
- B+ → `bg-[#fff3ec] text-[#9e3f00]`
- B → `bg-amber-50 text-amber-700`
- F (Fail) → `bg-[#ffdad6] text-[#ba1a1a]`

---

## 5. Finance Page — Enriched Variant

### Screen ID
`fc4a60e7b367430a9fb58082266e855f` — "My Finance - Student Portal Redesign"

The Stitch screen adds an inner **tab navigation** within the finance page (not in our current implementation):

### Inner Tabs (Finance Sub-sections)
Below the KPI summary cards, a tab strip with:
- **Overview** (current summary)
- **Payments** (transaction history)
- **Scholarships** (if applicable)
- **Documents** (receipts and certificates)

Tab styling:
- Active tab: `bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white rounded-xl shadow-sm`
- Inactive: `text-[#424655] hover:bg-[#f1f3f9] rounded-xl`

### Fee Structure Card — Visual Enhancement
- Each fee row now has a **progress micro-bar** below the amount row:
  - `h-1 w-full bg-[#e6e8ee] rounded-full` container
  - Filled portion: % of (amountPaid / amountDue) with `bg-gradient-to-r from-[#0054d1] to-[#2a6df4]`
- **Overdue indicator**: if past dueDate and unpaid → red `bg-[#ffdad6] text-[#ba1a1a]` row tint + `AlertCircle` icon in the row

### Quick Pay CTA
If balance > 0, show a floating bottom bar or card:
- `bg-gradient-to-br from-[#9e3f00] to-[#c65100]` (warm orange-red for urgency)
- Text: "You have an outstanding balance of ₹X" 
- CTA button: "Pay Now" → white button on the warm card

---

## 6. Component Patterns Shared Across All 4 Screens

### Page Header Block (All screens)
```
bg-[#f1f3f9] rounded-2xl p-8 md:p-10 relative overflow-hidden
  ├── eyebrow span: text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest
  ├── h1: text-3xl font-bold text-[#1a3d8a]
  ├── p: text-sm text-[#424655]
  └── decorative circle: absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/8 rounded-full blur-3xl
```

### Info Field Pattern
```
<div>
  <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest mb-1">Label</p>
  <p className="text-sm font-semibold text-[#181c20]">Value</p>
</div>
```

### Status Badge Pattern
```
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold {colorClasses}">
  <span className="w-1.5 h-1.5 rounded-full {dotColor}" />
  {label}
</span>
```

### Action Button (Primary)
```
bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white
rounded-xl text-sm font-semibold shadow-md hover:opacity-90
```

### Section Header inside Card
```
<div className="px-6 py-5 border-b border-[#f1f3f9] flex items-center justify-between">
  <div className="flex items-center gap-3">
    <IconComponent className="w-4 h-4 text-[#2a6df4]" />
    <h3 className="text-sm font-semibold text-[#181c20]">Section Title</h3>
  </div>
  <p className="text-xs text-[#64748b]">Supplementary Info</p>
</div>
```

---

## 7. Implementation Priority Order

| # | Page | File | Priority |
|---|---|---|---|
| 1 | My Results | `MyResultsPage.tsx` | High — complex GPA/chart layout |
| 2 | My Profile | `MyProfilePage.tsx` | High — read-only info display |
| 3 | My Leaves | `LeaveRequestPage.tsx` | Medium — form + history list |
| 4 | My Finance (enriched) | `MyFinancePage.tsx` | Low — already done, minor upgrades |

---

## 8. Screens With No HTML (screenshot-only, infer from style)

These screens exist in Stitch but have no exported HTML. Use screenshots mentally and infer from the design system:
- `36f302d4531f44aa883a92952bd7250e` — "Academic Results Transcript" (older version, superseded by 8257a4f7)
- `10a8bb76f9c24ed8ad2d1eeaa9601fd5` — "Student Leave Management" (older version, superseded by 403b3a74)
- `fd66b24add004191aa67512df8ad96d1` — "Student Profile Details" (older version, superseded by 1520df17)

Always prefer the EduFlow Redesign variants which have HTML.
