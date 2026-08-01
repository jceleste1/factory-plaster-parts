# UI Wireframes & Interface Specifications

**Version**: 1.0.0 | **Date**: 2026-08-01 | **Platform**: Mobile-First (320px baseline)

---

## Page Layout Specifications

All pages follow consistent header, content, and footer structure:

```
┌─────────────────────────────────────┐
│  HEADER                             │
│  [Logo] [Title] [User Menu ⋮]      │
└─────────────────────────────────────┘
│                                     │
│  MAIN CONTENT AREA                 │
│  (page-specific layout)             │
│                                     │
│                                     │
└─────────────────────────────────────┘
│  FOOTER (on desktop)               │
│  Copyright, Links, Branding        │
└─────────────────────────────────────┘
```

**Header Navigation**:
- Logo / Home link (left)
- Current page title or breadcrumb (center)
- User name + logout button (right)
- Mobile: Hamburger menu ☰ (right)

**Colors**:
- Background: #F5F5F5 (light gray)
- Primary text: #003366 (navy blue)
- Accent: #00897B (teal)
- Warning: #FF9800 (amber)
- Success: #4CAF50 (green)
- Error: #F44336 (red)

---

## 1. Login Page (Public)

**Route**: `/auth/login`

**Layout**:
```
┌─────────────────────────────────────┐
│  Factory Plaster Parts              │
│  Manufacturing Tracking System      │
│                                     │
│  [Sign In with Google] [blue btn]   │
│                                     │
│  Or scan QR code for mobile link    │
│  [QR Code Image]                    │
│                                     │
│  Contact: support@factory.com       │
└─────────────────────────────────────┘
```

**Components**:
- Logo (centered, 100px × 100px)
- Title "Gypsum Tile Manufacturing Tracking"
- Subtitle "Secure access via Google Workspace"
- Large blue button "Sign In with Google" (minimum 44px height)
- QR code linking to OAuth flow (optional)
- Footer: Support email, privacy link

**On Desktop** (1024px+):
- Logo on left (200px)
- Login form on right
- Background gradient (navy → teal)

---

## 2. Dashboard - Production Status (Protected)

**Route**: `/dashboard`  
**Access**: All authenticated roles

**Layout**:
```
┌─────────────────────────────────────┐
│  Dashboard  [Notifications 🔔]      │
│  Last updated: 2026-08-01 15:00:00 │
└─────────────────────────────────────┘
│                                     │
│  [METRICS OVERVIEW]                 │
│  Production Velocity: 47 batches/day│
│  Bottleneck: CURING (25.5 hrs avg)  │
│                                     │
│  [STAGE CARDS - Vertical Stack]     │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ PLANNING          [Green ●]     │ │
│  │ 12 batches                      │ │
│  │ Avg: 2.5 hrs ↓ (faster)        │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━     │ │
│  │ Last completed: 2 min ago       │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ MIXING            [Green ●]     │ │
│  │ 8 batches                       │ │
│  │ Avg: 1.2 hrs                    │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━     │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ MOLDING           [Yellow ●]     │ │
│  │ 15 batches                      │ │
│  │ Avg: 4.0 hrs ↑ (attention)      │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━     │ │
│  └────────────────────────────────┘ │
│                                     │
│  [Similar cards for: CURING,        │
│   FINISHING, QUALITY, PACKAGING,    │
│   SHIPPING]                         │
│                                     │
│  [QUICK ACTIONS - Bottom Sticky]    │
│  [Log Completion] [Search Batch]   │
│  [View Reports] [My Profile]        │
│                                     │
└─────────────────────────────────────┘
```

**Stage Card Details**:
- Stage name (left, large text)
- Status indicator (colored circle: Green=OK, Yellow=Slow, Red=Critical)
- Batch count (center, large number)
- Average stage duration (with trend indicator ↑↓ →)
- Visual progress bar (0-100% filled)
- Last completed timestamp (small text)
- Interactive: Tap to drill into stage details

**Desktop Layout** (1024px+):
- Stage cards in 2-column grid (Planning, Mixing in row 1; Molding, Curing in row 2, etc.)
- Metrics overview in sidebar (sticky)
- Larger text for screen real estate usage

**Mobile Layout** (≤768px):
- Stage cards stack vertically (single column)
- Full-width cards with clear tap targets
- Sticky footer with quick actions
- Notifications bell in header

---

## 3. Batch Detail & Traceability Timeline

**Route**: `/batch/{batch_id}`  
**Access**: All authenticated roles

**Layout**:
```
┌─────────────────────────────────────┐
│  Batch 2026-08-00042                │
│  Status: ACTIVE | Quality: PENDING  │
└─────────────────────────────────────┘
│                                     │
│  BATCH INFO BOX                     │
│  ┌────────────────────────────────┐ │
│  │ Batch ID: 2026-08-00042         │ │
│  │ Created: 2026-08-01 06:00       │ │
│  │ Material: MAT-2026-08-0015      │ │
│  │ Current Stage: CURING           │ │
│  │ Time in Stage: 12 hours 5 min   │ │
│  │ Status: [Green ●] On Target    │ │
│  └────────────────────────────────┘ │
│                                     │
│  STAGE TIMELINE                     │
│                                     │
│  ✓ PLANNING                         │
│  │ 2026-08-01 06:00 → 08:15       │
│  │ Duration: 2h 15m                │
│  │ Completed by: Sarah Manager     │
│  │ Notes: "Batch created..."       │
│  │                                 │
│  ✓ MIXING                           │
│  │ 2026-08-01 08:15 → 09:45       │
│  │ Duration: 1h 30m                │
│  │ Completed by: John Doe          │
│  │ Notes: "Mixture consistent..."  │
│  │                                 │
│  ✓ MOLDING                          │
│  │ 2026-08-01 09:45 → 14:00       │
│  │ Duration: 4h 15m                │
│  │ Completed by: John Doe          │
│  │ Notes: (none)                   │
│  │                                 │
│  ◆ CURING (ACTIVE)                  │
│  │ 2026-08-01 14:00 → (ongoing)   │
│  │ Duration so far: 12h 5m         │
│  │                                 │
│  ○ FINISHING (pending)              │
│  │ (not yet started)                │
│  │                                 │
│  ○ QUALITY (pending)                │
│  │ (not yet started)                │
│                                     │
│  [DOWNLOAD AUDIT TRAIL PDF/CSV]     │
│                                     │
│  [QUALITY RESULTS] (if available)   │
│  (section appears after Quality)    │
│                                     │
│  [SHIPPING INFO] (if applicable)    │
│  (section appears after Shipping)   │
│                                     │
└─────────────────────────────────────┘
```

**Expandable Sections**:
- Tap any stage in timeline to expand and see detailed metadata:
  - For MIXING: Material batch, ratios, temperature
  - For MOLDING: Mold type, temperature, pressure, cycle time
  - For CURING: Duration, temperature, humidity profile
  - For FINISHING: Surface treatment details
  - For QUALITY: Inspection results, defects, photos (if attached)
  - For SHIPPING: Destination, carrier, tracking number

**Actions**:
- If batch in MOLDING/CURING and user is WORKER: "Log Stage Completion" button
- Download button: Export audit trail as PDF or CSV
- Share button: Generate shareable deep link (unique read-only token)

---

## 4. Worker: Log Stage Completion

**Route**: `/batch/{batch_id}/log-completion`  
**Access**: WORKER, SUPERVISOR roles

**Layout**:
```
┌─────────────────────────────────────┐
│  Log Stage Completion               │
└─────────────────────────────────────┘
│                                     │
│  CURRENT BATCH INFO                 │
│  ┌────────────────────────────────┐ │
│  │ Batch ID: 2026-08-00042         │ │
│  │ Current Stage: MOLDING          │ │
│  │ Time in Stage: 4h 15m           │ │
│  └────────────────────────────────┘ │
│                                     │
│  CONFIRMATION                       │
│  Are you ready to complete          │
│  MOLDING stage for batch            │
│  2026-08-00042?                     │
│                                     │
│  [OPTIONAL NOTES]                   │
│  ┌────────────────────────────────┐ │
│  │ Notes:                          │ │
│  │ [text input - max 500 chars]    │ │
│  │                                 │ │
│  │ e.g., "Temperature slightly     │ │
│  │       high but within tolerance"│ │
│  └────────────────────────────────┘ │
│                                     │
│  [ACTIONS]                          │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Cancel       │  │ Mark Complete │ │ (blue, 44px)
│  └──────────────┘  └──────────────┘ │
│                                     │
│  [UNDO TIMER - if already completed]
│  Undo available for: 4 seconds      │
│  [Undo] button                      │
│                                     │
└─────────────────────────────────────┘
```

**Confirmation State** (after completion):
```
┌─────────────────────────────────────┐
│  ✓ Success                          │
│                                     │
│  Batch 2026-08-00042               │
│  completed MOLDING stage            │
│                                     │
│  Next stage: CURING                 │
│                                     │
│  [Back to Dashboard]                │
│                                     │
└─────────────────────────────────────┘
```

**Mobile Optimizations**:
- Large "Mark Complete" button (full-width, 56px height minimum)
- High contrast: Navy background, white text
- No mandatory fields except confirmation
- Notes field optional (tap to reveal)

---

## 5. Quality Controller: Inspection Form

**Route**: `/quality/{batch_id}/inspect`  
**Access**: QUALITY_CONTROLLER role

**Layout**:
```
┌─────────────────────────────────────┐
│  Quality Inspection                 │
│  Batch: 2026-08-00040               │
└─────────────────────────────────────┘
│                                     │
│  BATCH INFO                         │
│  ┌────────────────────────────────┐ │
│  │ Material: Standard Gray Tile     │ │
│  │ Entered Quality: 2026-08-01 12:30│ │
│  │ Wait Time: 2h 30m                │ │
│  │ Acceptance Criteria:             │ │
│  │ • Max 3 defects allowed          │ │
│  │ • No critical defects            │ │
│  │ • Surface finish required ✓      │ │
│  └────────────────────────────────┘ │
│                                     │
│  INSPECTION RESULT                  │
│  ┌────────────────────────────────┐ │
│  │ ○ PASSED (all criteria met)     │ │
│  │ ○ FAILED (return to Finishing)  │ │
│  │ ● CONDITIONAL (minor defects)   │ │
│  │   [text: "Approved with rework"]│ │
│  └────────────────────────────────┘ │
│                                     │
│  DEFECT DOCUMENTATION (if needed)   │
│  ┌────────────────────────────────┐ │
│  │ Defect Type: [DROPDOWN]         │ │
│  │   □ SURFACE_DEFECTS             │ │
│  │   □ DIMENSIONAL_OOT             │ │
│  │   □ STRUCTURAL_FAILURE          │ │
│  │   □ COLOR_ISSUE                 │ │
│  │   □ CONTAMINATION               │ │
│  │   □ OTHER                       │ │
│  │                                 │ │
│  │ Location: [text input]          │ │
│  │ Quantity: [number input]        │ │
│  │ Severity: [1-5 slider]          │ │
│  │ Root Cause: [DROPDOWN]          │ │
│  │   - FINISHING_SANDING_INCOMPLETE│ │
│  │   - MOLDING_TEMPERATURE         │ │
│  │   - etc.                        │ │
│  │                                 │ │
│  │ [+ Add Another Defect]          │ │
│  │                                 │ │
│  │ [Upload Photo] [camera icon]    │ │
│  └────────────────────────────────┘ │
│                                     │
│  REWORK INSTRUCTIONS (if CONDITIONAL)
│  ┌────────────────────────────────┐ │
│  │ Rework Steps: [textarea]        │ │
│  │ "Re-sand surface smooth,         │ │
│  │  apply finish evenly, reinspect" │ │
│  └────────────────────────────────┘ │
│                                     │
│  INSPECTOR NOTES                    │
│  ┌────────────────────────────────┐ │
│  │ Notes: [textarea, max 1000]     │ │
│  │ "Minor surface irregularities..."│ │
│  └────────────────────────────────┘ │
│                                     │
│  [ACTIONS]                          │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Cancel       │  │ Submit        │ │ (blue)
│  └──────────────┘  └──────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Desktop Layout** (1024px+):
- Left column: Batch info, decision radio buttons
- Right column: Defect list builder (dynamically add/remove defects)
- Dropdowns expand in-place
- Photo upload shows thumbnail preview

---

## 6. Reports: Efficiency Analysis

**Route**: `/reports/efficiency`  
**Access**: MANAGER, SUPERVISOR roles

**Layout**:
```
┌─────────────────────────────────────┐
│  Efficiency Analysis Report         │
└─────────────────────────────────────┘
│                                     │
│  DATE RANGE FILTER                  │
│  [Start Date] - [End Date]          │
│  [7-day view selected]              │
│  Frequency: ○ Daily ○ Weekly       │
│                                     │
│  [Generate Report]                  │
│                                     │
│  METRICS OVERVIEW                   │
│  ┌──────────────────────────────┐   │
│  │ Total Batches: 385            │   │
│  │ Avg Production: 48/day        │   │
│  │ Efficiency: 96.25%            │   │
│  │ Scrap Cost: $1,200.50         │   │
│  └──────────────────────────────┘   │
│                                     │
│  STAGE PERFORMANCE (RANKED)         │
│  ┌──────────────────────────────┐   │
│  │ Stage    │ Avg Time │ Trend  │   │
│  │──────────┼──────────┼────────│   │
│  │ PLANNING │ 2.3 hrs  │ ↓ -8% │   │
│  │ MIXING   │ 1.2 hrs  │ → 0%  │   │
│  │ MOLDING  │ 4.0 hrs  │ ↑ +2% │   │
│  │ CURING   │ 25.5 hrs │ ↑ +6% ⚠ │ │
│  │ FINISHING│ 3.5 hrs  │ → 0%  │   │
│  │ QUALITY  │ 0.75 hrs │ ↓ -3% │   │
│  │ PACKAGING│ 1.0 hrs  │ → 0%  │   │
│  │ SHIPPING │ 0.5 hrs  │ → 0%  │   │
│  └──────────────────────────────┘   │
│                                     │
│  BOTTLENECK ALERT                   │
│  ⚠ CURING stage 20% slower than     │
│  historical average (24.0 hrs).     │
│  Investigate temperature/humidity.  │
│                                     │
│  SCRAP & REWORK ANALYSIS            │
│  ┌──────────────────────────────┐   │
│  │ Top Defect Types:             │   │
│  │ • SURFACE_DEFECTS: 14 (41%)   │   │
│  │ • COLOR_ISSUE: 8 (24%)        │   │
│  │ • DIMENSIONAL_OOT: 7 (21%)    │   │
│  │                               │   │
│  │ Rework Rate: 8.5%             │   │
│  │ Rejection Rate: 2.1%          │   │
│  │ Total Defects: 34             │   │
│  └──────────────────────────────┘   │
│                                     │
│  [DRILL-DOWN: Click stage/defect   │
│   type to see detail by shift/worker]
│                                     │
│  [EXPORT TO PDF]                    │
│  [EXPORT TO CSV]                    │
│                                     │
└─────────────────────────────────────┘
```

**Charts** (Desktop view):
- Line chart: Stage duration over time (7 days)
- Bar chart: Defect count by type
- Pie chart: Rejection vs. rework vs. passed (quality summary)
- Trend arrows: ↑ (slower), ↓ (faster), → (stable)

---

## 7. Search Batch

**Route**: `/search` (modal or overlay)  
**Access**: All authenticated roles

**Layout**:
```
┌─────────────────────────────────────┐
│  Search Batches                  [✕] │
│                                     │
│  [Search box with magnifying glass]  │
│  "Enter Batch ID or material ID"    │
│  [placeholder text]                 │
│                                     │
│  RECENT SEARCHES                    │
│  • 2026-08-00042 (viewed 2 min ago) │
│  • 2026-08-00041 (viewed 1h ago)    │
│  • MAT-2026-08-0015 (viewed 2d ago) │
│                                     │
│  [SEARCH RESULTS]                   │
│  ┌────────────────────────────────┐ │
│  │ 2026-08-00042                   │ │
│  │ Status: ACTIVE | Stage: CURING  │ │
│  │ Time in Stage: 12h 5m [tap] →   │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ 2026-08-00041                   │ │
│  │ Status: COMPLETED | Shipped     │ │
│  │ Time Total: 48h [tap] →         │ │
│  └────────────────────────────────┘ │
│                                     │
│  [No more results]                  │
│                                     │
└─────────────────────────────────────┘
```

**Interactions**:
- Autocomplete as user types (shows matching batch IDs)
- Tap result to navigate to batch detail
- On mobile: Full-screen modal, X button to close
- On desktop: Dropdown overlay below search field

---

## 8. Mobile Worker: "My Current Work"

**Route**: `/work` (Worker role only)  
**Access**: WORKER role

**Layout**:
```
┌─────────────────────────────────────┐
│  My Current Work                    │
│  Stage: MOLDING                     │
└─────────────────────────────────────┘
│                                     │
│  YOUR ASSIGNED BATCHES              │
│  [Total: 3 batches assigned]        │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ Priority: HIGH        [Star ★]   │ │
│  │ Batch: 2026-08-00042            │ │
│  │ Status: In Progress             │ │
│  │ Time: 4h 15m                    │ │
│  │                                 │ │
│  │ [Mark Complete Button - full]    │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ Priority: NORMAL                 │ │
│  │ Batch: 2026-08-00038            │ │
│  │ Status: In Queue                │ │
│  │ Expected: 30 min                │ │
│  │                                 │ │
│  │ [View Details]                   │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ Priority: LOW                    │ │
│  │ Batch: 2026-08-00035            │ │
│  │ Status: Waiting                 │ │
│  │                                 │ │
│  │ [View Details]                   │ │
│  └────────────────────────────────┘ │
│                                     │
│  [OFFLINE STATUS]                   │
│  ⚠ Offline - Queued 1 completion    │
│  Will sync when connection restored │
│  [Retry Sync] button                │
│                                     │
└─────────────────────────────────────┘
```

---

## Component Library (ShadcnUI + Tailwind)

All pages use these reusable components from ShadcnUI:

- **Button**: Variants (primary/secondary/ghost), sizes (sm/md/lg), states (hover/disabled)
- **Card**: Container for grouped content (stage cards, info boxes)
- **Input**: Text, number, email inputs with validation states
- **Select/Dropdown**: Stage selection, role filter, date range
- **Textarea**: Notes, rework instructions, inspector observations
- **Modal**: Confirmation dialogs (before stage completion), alerts
- **Tabs**: Tab between Daily/Weekly/Monthly report views
- **Badge**: Status indicator (PASSED/FAILED/PENDING), priority labels
- **Progress**: Visual bar for stage completion duration
- **Alert**: Warning/error messages (batch delays, quality issues)
- **Tooltip**: Help text on hover (accessibility info, stage details)
- **Pagination**: For batch search results

**Typography**:
- Heading 1 (H1): 32px, bold, navy blue (page title)
- Heading 2 (H2): 24px, bold, navy blue (section titles)
- Heading 3 (H3): 18px, semibold, navy blue (subsection)
- Body: 14px, regular, #333 (main text)
- Caption: 12px, regular, #666 (secondary text, timestamps)

**Spacing**:
- Gutters: 16px on mobile, 24px on desktop
- Card padding: 16px mobile, 20px desktop
- Button height: 44px minimum (WCAG touch target)

**Accessibility Features**:
- All interactive elements keyboard-navigable (Tab, Enter, Escape)
- Color contrast ≥ 4.5:1 for all text
- ARIA labels on buttons and form fields
- Error messages linked via `aria-describedby`
- Focus visible state on all inputs (2px blue border)
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`

