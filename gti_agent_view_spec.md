# GTI V1 Agent/Manager View Specification

## 1. Screen Components
- **Global Intelligence Bar**: Top-level metrics (Global Sell-Through, Total Gross, Est. Net Payout).
- **Opportunity Matrix**: A ranked list of shows where "Money is on the Table" (High Capacity, Low Sell-Through).
- **Interactive Roadmap (Agent Mode)**: Includes "Settlement Status" (Missing, Draft, Final) and "Profitability" indicators.
- **Financial Wallet**: The source of truth for all money moving in/out of the tour.
- **Export Center**: Quick-action buttons for "Settlement PDF" and "Tour CSV".

## 2. Key Differences from Artist View
| Feature | Artist View (Simple) | Agent View (Pro/Ops) |
| :--- | :--- | :--- |
| **Primary Metric** | "Vibe" / Health | Gross Revenue / Net Payout |
| **Financials** | Big Picture only | Granular Ledger (Line items) |
| **Alerts** | "Shoutout needed" | "Pacing deviation" / "Expense spike" |
| **Logistics** | Next 3 shows | Full timeline with settlement tracking |
| **Control** | None | Data ingestion, Note adding, Flagging |

## 3. 10 "Agent-Grade" Insights (V1 Data)
1.  **Inventory Scarcity**: "90% of inventory sold in [City] with 14 days left. High secondary market risk."
2.  **Pacing Deviation**: "[City] is pacing 2.5x faster than tour average. Viral momentum detected."
3.  **Expense Efficiency**: "Production costs in [Region] are 18% higher than tour average."
4.  **Revenue Upside**: "Unsold inventory in [City] represents $42,500 in potential gross."
5.  **Break-Even Point**: "Show in [City] requires 342 more tickets to reach break-even."
6.  **Settlement Lag**: "4 shows from the EU leg are missing final settlements. Using AI estimates."
7.  **Profitability Leader**: "[City] is currently the most profitable stop per-ticket ($42.50 net/head)."
8.  **Tax Exposure**: "Estimated $85k tax withholding for upcoming leg. Reserve accordingly."
9.  **Marketing ROI**: "Toronto campaign spend is $450 with 45 conversions ($10/ticket acquisition)."
10. **Capacity Risk**: "[City] venue has 20% of manifest held for production. Review release schedule."

## 4. Financial Wallet (V1 Ledger)

### Data Structure
- **Revenue Lines**: `Ticket Sales`, `Merch (Est)`, `VIP Packages`, `Sponsorships`.
- **Expense Lines**: `Venue Fees (15% Default)`, `Production`, `Travel/Hotels`, `Crew`, `Marketing`, `Commissions`.

### UI Specification
- **The "Waterfall" Header**: Gross -> Expenses -> Commissions -> Taxes -> Net Payout.
- **Ledger Table**:
    - `Date` | `Category` | `Label` | `Amount` | `Source` (Settlement vs Projection).
- **Safety & Estimation Rules**:
    - **Confirmed** values are shown in **GTI Green**.
    - **Estimated** values are shown in **Muted White** with an `(Est)` suffix.
    - **Missing** data triggers a "Data Needed" flag with a link to the Admin Ingestion portal.
    - **Assumptions Panel**: A sidebar listing the default % used (e.g., "15% Venue Fee applied to all non-settled dates").

## 5. Export Options
- **Tour Summary (PDF)**: A high-level, branded report for investors/partners.
- **Settlement Ledger (CSV)**: A raw data dump for accountants.
- **Market Opportunity (CSV)**: A list of lagging markets for the marketing team.
