# GTI V1 Calculation Engine Specification

This document defines the core logic for the Global Touring Intelligence (GTI) V1 MVP.

## 1. Core Formulas

### 1.1 Sell-Through %
*   **Per Show**: `(Sold / Capacity) * 100`
*   **Per Tour**: `(Σ Sold_all_shows / Σ Capacity_all_shows) * 100`

### 1.2 Sales Pacing (Velocity)
*   **7-Day Pacing**: `(Sold_current - Sold_7_days_ago) / 7` (Tickets per day)
*   **30-Day Pacing**: `(Sold_current - Sold_30_days_ago) / 30` (Tickets per day)
*   **Acceleration**: `7-Day Pacing / 30-Day Pacing` (Value > 1 indicates sales are speeding up).

### 1.3 Cold Zone Logic (Alert Triggers)
A "Cold Zone" alert is triggered if any of the following conditions are met:
1.  **Low Volume**: `Sell-Through < 40%` AND `Days_to_Show < 45`.
2.  **Stagnation**: `7-Day Pacing < (Target_Sell_Through_at_Date - Current_Sell_Through) / Days_to_Show`.
3.  **Critical**: `Sell-Through < 20%` AND `Days_to_Show < 21`.

### 1.4 Net Payout Estimate
The "Take-Home" calculation follows this waterfall:
1.  **Adjusted Gross**: `Gross - (Gross * Venue_Fee_Assumption)`
2.  **Net Revenue**: `Adjusted Gross + (Gross * Merch_Net_Assumption) + VIP_Revenue`
3.  **Gross Profit**: `Net Revenue - Production_Expenses - Travel_Expenses - Marketing_Spend`
4.  **Artist Share**: `Gross Profit * Artist_Split_Assumption`
5.  **Net Payout**: `Artist Share - (Artist Share * Management_Fee) - (Artist Share * Agent_Fee) - (Artist Share * Tax_Reserve)`

### 1.5 Confidence Scoring
*   **Input Confidence**: Assigned during ingestion (Confirmed = 1.0, Estimated = 0.7, Partial = 0.4).
*   **Calculated Confidence**: `Confidence_Result = Π (Confidence_Inputs)`.
*   **Labeling Rules**:
    *   **CONFIRMED**: `Confidence >= 0.95` AND `Source == 'confirmed'`.
    *   **ESTIMATED**: `Confidence < 0.95`.

---

## 2. Recommended Default Assumptions
*These values are used when specific data points are missing from settlements.*

| Parameter | Default Value | Logic |
| :--- | :--- | :--- |
| **Venue Fees** | 15% | Covers facility fees, credit card processing, and local taxes. |
| **Merch Net** | 20% | Estimated artist profit after venue commission (30%) and COGS. |
| **Artist Split** | 85% | Standard split for headline club/theater tours. |
| **Management Fee** | 15% | Standard commission on artist share. |
| **Agent Fee** | 10% | Standard commission on artist share. |
| **Tax Reserve** | 20% | Default withholding for federal/state income tax. |

---

## 3. Edge Case Handling

### 3.1 Missing Capacity
*   **Action**: Use the `Average Capacity` of the current tour's other dates.
*   **Confidence Penalty**: Set `Capacity_Confidence = 0.5`.

### 3.2 Missing Sold (Gross Only)
*   **Action**: `Sold = Gross / Average_Ticket_Price_of_Tour`.
*   **Confidence Penalty**: Set `Sold_Confidence = 0.6`.

### 3.3 Comps & Manifest
*   **Logic**: `Comps = Capacity - Available - Sold`.
*   **Flag**: If `Comps > 15%` of Capacity, trigger a "Manifest Audit" alert.

### 3.4 Multi-Currency
*   **Action**: All financial lines are converted to the `Artist.base_currency` using the exchange rate at the `Show.date`.
*   **Confidence Penalty**: If using a historical estimate rather than a confirmed rate, apply a `-0.05` penalty to confidence.
