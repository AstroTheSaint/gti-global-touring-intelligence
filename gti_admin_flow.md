# GTI V1 Admin Portal Flow Specification

This document defines the ingestion and publishing workflow for GTI administrators.

## 1. Step-by-Step Workflow

### Step 1: Context Selection
- **Action**: Admin selects the **Artist** and **Tour** from the dropdown.
- **Validation**: If "New Tour" is selected, the system prepares to create a new tour entity.

### Step 2: Data Ingestion
- **Input Methods**:
    - **Paste Settlement**: Raw text from emails or PDF copy-pastes.
    - **CSV Upload**: Raw data dumps from ticketing platforms (Ticketmaster, Eventbrite).
    - **Notes/Manual**: Qualitative notes (e.g., "Lagos production cost was actually $50k").
- **Processing**: AI (Gemini) parses the unstructured data into the GTI V1 JSON schema.

### Step 3: Review & Diff (The "Pre-Flight" Check)
- **Action**: System compares incoming data with existing database records.
- **UI**: A side-by-side diff highlighting:
    - **New Shows**: Green rows.
    - **Updated Values**: Yellow highlights on specific cells (e.g., Gross changed from $120k to $125k).
    - **Conflicts**: Red flags for logical errors (e.g., Sold > Capacity).

### Step 4: Approval & Publish
- **Action**: Admin clicks "Publish to Profile".
- **Execution**: Database transaction updates `shows`, `ticketing_snapshots`, and `financial_ledger`.
- **Instant Update**: Dashboard views for Artists and Agents refresh immediately.

---

## 2. Review Screen Design (Diff UI)

### Layout
- **Header**: "Review Changes for [Tour Name]"
- **Table Columns**: `Field` | `Current Value` | `New Value` | `Confidence`.
- **Visual Cues**:
    - `+` icon for additions.
    - `Δ` icon for modifications.
    - `!` icon for high-priority warnings.

### Example Row
| Show | Field | Current | New | Status |
| :--- | :--- | :--- | :--- | :--- |
| Toronto | Sold | 2,100 | 2,450 | `Δ Updated` |
| Toronto | Gross | $105k | $122k | `Δ Updated` |
| Montreal | All | - | [New Data] | `+ New Show` |

---

## 3. Audit Log Requirements
Every publish action must be logged in a `system_audit` table:
- **Timestamp**: ISO 8601.
- **Admin ID**: User email/ID.
- **Action**: `TOUR_PUBLISH` | `SHOW_UPDATE` | `LEDGER_ADJUST`.
- **Payload**: JSON blob of the changes made.
- **Source**: Reference to the raw text/file used for ingestion.

---

## 4. Permission Rules
- **Super Admin**: Can create artists, tours, and publish data.
- **Tour Manager**: Can ingest and review data, but requires "Agent" approval to publish (V2). In V1, TM has full publish rights.
- **Artist/Agent**: Read-only access to dashboards. No access to the Admin Portal.

---

## 5. Acceptance Criteria
- [ ] **Data Integrity**: AI must correctly identify `city`, `date`, and `gross` with >90% accuracy.
- [ ] **Conflict Handling**: System must block publishing if `Sold > Capacity`.
- [ ] **Speed**: AI processing must complete in under 10 seconds.
- [ ] **Instant Refresh**: Dashboard must reflect new numbers without a hard page reload (via state update or re-fetch).
- [ ] **Safety**: "Publish" button is disabled until an artist is selected and data is processed.
