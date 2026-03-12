# GTI V1 Demo Data Strategy

## 1. Compelling UI: Minimum Data Requirements
To make the GTI dashboard feel "alive" and premium, each show in the demo must have:
- **Venue Metadata**: Name, Capacity, City, Country, and Lat/Lng (for the map).
- **Ticketing Snapshot**: Current `sold` count and `gross` revenue.
- **Historical Pacing**: At least 3-5 snapshot points (e.g., On-Sale, 30 Days Out, 14 Days Out, 7 Days Out, Today).
- **Financial Ledger**: At least 3 expense categories (Travel, Production, Marketing) and 2 revenue streams (Tickets, Merch).
- **Audience Insights**: Mocked gender split and top age bracket.

## 2. Data Completeness Score
Each show should display a "Data Integrity" percentage based on:
- **100% (Verified)**: Final settlement uploaded + all ledger items confirmed.
- **75% (High)**: Ticketing API connected + standard expense assumptions applied.
- **50% (Partial)**: Manual entry of gross/sold only.
- **25% (Low)**: Projection based on similar markets (no actual data yet).

## 3. Believable Historical Pacing
To create realistic sparklines without real APIs:
- **The "S-Curve" Pattern**:
    - **Day 1 (On-Sale)**: 30-50% spike.
    - **Week 2-4**: Flat plateau (the "quiet period").
    - **14 Days Out**: 10-15% bump (marketing push).
    - **7 Days Out**: 20% surge (FOMO period).
    - **Day of Show**: Final 5% (walk-ups).
- **Variation**: Introduce 1 "Cold Zone" (linear growth, never spikes) and 1 "Viral Market" (sudden 40% jump in the middle).

## 4. Labeling Strategy: Confirmed vs. Estimated
- **Confirmed (GTI Green)**:
    - Shows that are "Past".
    - Shows with a "Settlement Uploaded" flag.
    - Any data point with `confidence: 1.0`.
- **Estimated (Muted White/Italic)**:
    - Future shows without a settlement.
    - Merch revenue (usually calculated as $X per head).
    - Venue fees (defaulted to 15% until settled).

## 5. Ideal Demo Scale: 12-15 Shows
- **Why?**: 
    - Enough to show a "Timeline" without it feeling endless.
    - Allows for 3 distinct "Regions" (e.g., North America, Europe, Africa).
    - Provides enough data points for the "Global Pacing" area chart to look complex and professional.
    - Fits perfectly in a single scroll on the Roadmap view.

---

## 6. Population Checklist: Uncle Waffles + Metro/Future

### Uncle Waffles (The "Viral/Global" Demo)
- [ ] **15 Shows**: Focus on major global hubs (Lagos, London, NYC, Toronto, Paris).
- [ ] **1 "Cold Zone"**: Paris (pacing at 30%).
- [ ] **1 "Sold Out"**: London (100% capacity, 14 days early).
- [ ] **Financials**: High Merch-to-Ticket ratio (Artist brand is strong).

### Metro Boomin & Future (The "High-Stakes/Arena" Demo)
- [ ] **12 Shows**: Major US Arenas (Atlanta, LA, Chicago, Miami).
- [ ] **1 "Cold Zone"**: Chicago (pacing at 45%).
- [ ] **2 "Sold Out"**: Atlanta & LA.
- [ ] **Financials**: High Production costs ($400k+ per night) to show "Net Payout" pressure.
- [ ] **Insights**: High "Platinum Ticket" revenue to show agent-grade yield management.
