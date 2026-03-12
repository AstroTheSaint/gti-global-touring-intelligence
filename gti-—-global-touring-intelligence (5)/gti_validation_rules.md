# GTI V1 Data Validation Rules

## 1. Show Uniqueness
- **Rule**: Every show must be unique based on the combination of `date`, `venue_name`, and `city`.
- **Reasoning**: Prevents duplicate entries when merging historical data from multiple sources (e.g., a settlement PDF and a booking agent's CSV).

## 2. Numeric Field Integrity
- **Rule**: All numeric fields representing currency or counts (Capacity, Sold, Revenue, Expense) MUST include metadata:
    - `value`: The actual number.
    - `currency`: ISO 4217 code (required for financial fields).
    - `source_type`: Must be one of `['confirmed', 'estimated', 'partial']`.
    - `confidence`: A float between `0.0` and `1.0`.
- **Reasoning**: GTI's core value is distinguishing between "hard data" (settlements) and "projections" (pacing).

## 3. Financial Balancing
- **Rule**: `Total Revenue` - `Total Expenses` must equal `Net Payout` within a 0.01 margin of error for `confirmed` entries.
- **Rule**: If `source_type` is `estimated`, the confidence of the calculated `Net Payout` should be the product of the confidences of its inputs.

## 4. Ticketing Logic
- **Rule**: `sold` value cannot exceed `capacity` value.
- **Rule**: If `sold` is `confirmed` and `gross` is `estimated`, the `average_ticket_price` (gross/sold) must be flagged for review if it deviates >20% from the tour's average.

## 5. Split Assumptions
- **Rule**: The sum of all `percentage_value` entries for a show's splits (Artist + Agent + Manager + Taxes) should not exceed `1.0` (100%), unless accounting for overages/bonuses which must be explicitly labeled.

## 6. Date Formatting
- **Rule**: All dates must be in `YYYY-MM-DD` format to ensure correct chronological sorting in the Road Map view.
