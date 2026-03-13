# GTI V1 Interactive Roadmap UI/UX Specification

## 1. Components List
- **Timeline Container**: Vertical list with subtle connection lines between show nodes.
- **Show Row (Collapsed)**:
    - `DateNode`: Day/Month in a high-contrast mono block.
    - `LocationBlock`: City and Country.
    - `VenueInfo`: Venue name + Capacity progress bar.
    - `StatusChip`: Dynamic label (On Sale, Low Pacing, Sold Out, Past).
    - `QuickStats`: Gross revenue (Desktop only).
    - `ExpandTrigger`: Chevron icon with rotation state.
- **Detail Panel (Expanded)**:
    - `ContextGrid`: 3-column layout (Desktop) / Stacked (Mobile).
    - `MiniMap`: Geographic pin with radius protection indicator.
    - `SparklineCard`: 7-day sales pacing trend.
    - `InsightGrid`: Demographics (Age/Gender) and Financial Waterfall.
    - `ActionModule`: Horizontal button group for workflow tasks.

## 2. Interaction Spec
- **Expansion**: Single-click on the row toggles expansion. Uses `motion` for a smooth height transition (300ms ease-in-out).
- **Mutual Exclusivity**: Opening one row closes others (optional, but preferred for focus).
- **Mobile Behavior**: 
    - Swiping left on a row reveals quick actions (Flag/Note).
    - Tapping expands to a full-width card.
    - Progress bars become full-width below the venue name.
- **Hover States**: Subtle background lift (`bg-white/5`) and border glow on the active row.

## 3. Visual Hierarchy & Copy
- **Primary**: City Name (Bold, 16px).
- **Secondary**: Venue Name (Muted, 12px).
- **Status Colors**:
    - `Sold Out`: GTI Green (`#00FF94`)
    - `Low Pacing`: Warning Yellow or Alert Red.
    - `Past`: Muted Gray (`opacity-40`).
    - `On Sale`: Standard White/Glass.
- **Copy Tones**: Professional, data-driven. Use "Est. Net" instead of "Profit".

## 4. Loading Skeleton Behavior
- **Initial Load**: Shimmer effect on 5-8 placeholder rows.
- **Expansion Load**: If data is fetched on-demand, the panel should show a skeleton grid with shimmering blocks for the map and charts.
- **Transition**: Skeleton fades out as real data "slams" in with a slight scale-up animation.

## 5. Acceptance Criteria ("Feels Premium" Checklist)
- [ ] **Zero Layout Shift**: The expansion doesn't cause the page to jump jarringly.
- [ ] **Micro-animations**: Chevrons rotate, progress bars animate from 0% on load.
- [ ] **Typography**: Mono fonts used for all numeric data to ensure alignment.
- [ ] **Contrast**: Status chips are legible against dark backgrounds.
- [ ] **Responsiveness**: No horizontal scrolling on iPhone SE (320px).
- [ ] **Feedback**: Buttons show a "pressed" state or loader when clicked.
