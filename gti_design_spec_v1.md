# GTI Design Specification V1: Institutional Touring Intelligence

## SECTION 1 — Brand & Emotional Tone
GTI is the financial command center for the global touring economy. The aesthetic is **Institutional Luxury**. It avoids the "neon SaaS" look in favor of a high-density, high-precision interface that evokes the calm of a private banking portal and the utility of a Bloomberg Terminal.

- **Emotional Goal**: Calm, powerful, organized, in control.
- **Visual Pillars**: Sharp geometry, monospace data alignment, deep navy foundations, and high-contrast typography.

---

## SECTION 2 — Color System
A restricted, high-contrast palette designed for legibility and financial authority.

### Base (Dark Mode)
- **Background (Surface 0)**: `#0A0C10` (Deep Obsidian)
- **Surface 1 (Cards/Sidebar)**: `#12151C` (Midnight Navy)
- **Surface 2 (Hover/Active)**: `#1C212B` (Steel Navy)
- **Border (Subtle)**: `#242A35` (1px Solid)
- **Border (Strong)**: `#3B4455` (Focus/Active)

### Accents
- **Primary (Action)**: `#2E66FF` (Institutional Blue)
- **Success (Positive)**: `#10B981` (Emerald)
- **Warning (Pacing)**: `#F59E0B` (Amber)
- **Critical (Cold Zone)**: `#EF4444` (Red)

### Typography
- **Text Primary**: `#FFFFFF` (High emphasis)
- **Text Secondary**: `#94A3B8` (Medium emphasis)
- **Text Tertiary**: `#475569` (Low emphasis/Micro-labels)

---

## SECTION 3 — Typography Scale
Primary Font: **Inter** (Sans-serif)
Data Font: **JetBrains Mono** or **SF Mono** (Monospace)

| Role | Size | Weight | Tracking | Case |
| :--- | :--- | :--- | :--- | :--- |
| **Display H1** | 48px | 700 | -0.04em | Sentence |
| **Section Header** | 24px | 600 | -0.02em | Sentence |
| **Card Header** | 14px | 600 | 0.02em | Uppercase |
| **Body Text** | 14px | 400 | 0 | Sentence |
| **Data Value** | 16px | 500 | -0.02em | Monospace |
| **Micro-label** | 10px | 700 | 0.1em | Uppercase |

---

## SECTION 4 — Layout Grid System
- **Sidebar**: 260px (Fixed, left-aligned).
- **Main Content**: Fluid with max-width of 1440px.
- **Gutter**: 32px (Standard spacing between modules).
- **Padding**: 40px (Page edges).
- **Grid**: 12-column system for dashboard widgets.

---

## SECTION 5 — Navigation & App Shell
- **Sidebar**: Vertical navigation with high-contrast active states. No icons for primary nav to maintain "Institutional" purity (or very minimal 1.5px stroke icons).
- **Top Bar**: Contextual breadcrumbs + Artist/Tour Selector + Simple/Pro Toggle.
- **Footer**: Legal, versioning, and "Data Integrity" status indicator.

---

## SECTION 6 — Screen-by-Screen Layout Breakdown

### 1. Tour Health (Overview)
- **Bento Grid Layout**: 4 primary KPI cards at the top.
- **Pacing Chart**: High-density line chart with 1px stroke. No area fills.
- **Cold Zone Alert Bar**: A slim, high-priority notification strip above the fold.

### 2. Roadmap (Expandable Timeline)
- **Table-First View**: Date | Venue | City | Status | Confidence.
- **Expansion UX**: Rows expand vertically to reveal "Geographic Context" (Map) and "Audience Insights" (Demographics).
- **Visuals**: Use vertical lines to connect dates, creating a "thread" of the tour.

### 3. Financial Wallet
- **Waterfall Module**: A vertical breakdown of Gross -> Net.
- **Ledger**: High-density list of transactions with verified/estimated status chips.
- **Summary**: Large-scale Net Take-Home display with "Confidence Interval" subtext.

---

## SECTION 7 — Motion & Micro-Interaction Rules
- **Transitions**: 200ms Ease-out (Fast, purposeful). No "bouncy" animations.
- **Hover States**: Subtle background color shift (Surface 1 -> Surface 2).
- **Loading**: Linear indeterminate progress bar at the top of the viewport.
- **Expansion**: Smooth height interpolation for Roadmap rows.

---

## SECTION 8 — Component Library Definition

### 1. Status Chips
- **Verified**: Emerald text, transparent background, 1px Emerald border.
- **Estimated**: Amber text, transparent background, 1px Amber border.
- **Settled**: White text, Midnight Navy background.

### 2. Buttons
- **Primary**: Institutional Blue background, White text, 4px border-radius.
- **Secondary**: Transparent background, 1px Border (Subtle), White text.
- **Ghost**: Transparent, White text (Hover: Surface 2).

### 3. Inputs
- **Standard**: Midnight Navy background, 1px Border (Subtle), Monospace text for numbers.

---

## SECTION 9 — Accessibility Standards
- **Contrast**: Minimum 4.5:1 for all text.
- **Focus States**: 2px Blue ring for keyboard navigation.
- **Screen Readers**: Aria-labels for all data visualizations and status icons.
- **Scalability**: Layout must remain functional at 150% browser zoom.

---

## SECTION 10 — Implementation Notes for Developers
- **Tailwind Config**: Extend colors with the hex codes provided.
- **Border Radius**: Use `rounded-md` (6px) or `rounded-lg` (8px). Avoid `rounded-2xl` or `rounded-full` for cards.
- **Charts**: Use `recharts` with `strokeWidth={1.5}` and `dot={false}` for a clean, technical look.
- **Numbers**: Always wrap financial figures in `font-mono`.
