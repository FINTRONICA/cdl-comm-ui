# Search/Filter Functionality Verification

## Search Fields Configuration

### Current Search Fields
All searchable columns are now included in the `searchFields` array:

```typescript
searchFields: [
  'date',              // Transaction Date & Time
  'transId',           // Reconciled Transaction ID
  'unitNo',            // Unit Reference Number
  'tasCbsMatch',       // TAS Update Applied (Yes/No)
  'amount',            // Transaction Amount
  'narration',         // Transaction Narration
  'paymentStatus',     // TAS Payment Status Code (dropdown)
]
```

## Search Behavior by Field Type

### 1. Text Fields (Substring Match - Case Insensitive)
These fields use substring matching:
- ✅ **date** - Searches in formatted date string
- ✅ **transId** - Searches in transaction ID
- ✅ **unitNo** - Searches in unit reference number
- ✅ **tasCbsMatch** - Searches in "Yes"/"No" string
- ✅ **amount** - Searches in formatted amount string (e.g., "15000.75")
- ✅ **narration** - Searches in transaction narration

**Example:**
- Searching "RECON" in `transId` will match "RECON-TRX-2025-0001"
- Searching "15000" in `amount` will match "15000.75"
- Searching "NEFT" in `narration` will match "NEFT Credit from Builder"

### 2. Status Field (Exact Match - Case Insensitive)
The `paymentStatus` field uses exact matching with a dropdown:

- ✅ **paymentStatus** - Exact match with dropdown options
- Dropdown options: `['SUCCESS', 'PENDING', 'FAILED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'INITIATED']`

**Example:**
- Selecting "SUCCESS" will only match rows with paymentStatus = "SUCCESS"
- Case-insensitive matching (e.g., "success" = "SUCCESS")

## Search Implementation Details

### useTableState Hook Updates
The hook now handles `paymentStatus` field for exact matching:

```typescript
// For status fields, use exact match (case-insensitive)
if (field === 'status' || field === 'paymentStatus' || field === 'approvalStatus') {
  return String(value ?? '').toUpperCase() === searchVal.toUpperCase()
}
```

### TableSearchRow Component
- Text fields show text input boxes
- Status fields (`type: 'status'`) show dropdown selectors
- All search fields are initialized with empty strings
- Search is case-insensitive

## Search Functionality Tests

### Test Case 1: Text Search - Transaction ID
**Input:** Search "RECON-TRX" in Transaction ID column
**Expected:** Shows all transactions with IDs containing "RECON-TRX"
**Status:** ✅ Working

### Test Case 2: Text Search - Unit Reference
**Input:** Search "UNIT-304" in Unit Reference Number column
**Expected:** Shows all transactions with unit numbers containing "UNIT-304"
**Status:** ✅ Working

### Test Case 3: Text Search - Amount
**Input:** Search "15000" in Transaction Amount column
**Expected:** Shows all transactions with amounts containing "15000"
**Status:** ✅ Working

### Test Case 4: Text Search - Narration
**Input:** Search "NEFT" in Transaction Narration column
**Expected:** Shows all transactions with narration containing "NEFT"
**Status:** ✅ Working

### Test Case 5: Status Dropdown - Payment Status
**Input:** Select "SUCCESS" from Payment Status dropdown
**Expected:** Shows only transactions with paymentStatus = "SUCCESS"
**Status:** ✅ Working

### Test Case 6: Multiple Field Search
**Input:** 
- Transaction ID: "RECON"
- Payment Status: "SUCCESS"
**Expected:** Shows transactions matching both criteria (AND logic)
**Status:** ✅ Working

### Test Case 7: Empty Search
**Input:** Clear all search fields
**Expected:** Shows all transactions (no filtering)
**Status:** ✅ Working

## Search Field Mapping

| Column | Field Key | Search Type | UI Component |
|--------|-----------|-------------|--------------|
| Transaction Date & Time | `date` | Text (substring) | Text Input |
| Reconciled Transaction ID | `transId` | Text (substring) | Text Input |
| Unit Reference Number | `unitNo` | Text (substring) | Text Input |
| TAS Update Applied | `tasCbsMatch` | Text (substring) | Text Input |
| Transaction Amount | `amount` | Text (substring) | Text Input |
| Transaction Narration | `narration` | Text (substring) | Text Input |
| TAS Payment Status Code | `paymentStatus` | Status (exact) | Dropdown Select |
| Action | `actions` | N/A | No Search |

## Search Logic

### AND Logic
All search fields use AND logic - a row must match ALL non-empty search criteria:
```
Row matches if:
  (date matches OR date is empty) AND
  (transId matches OR transId is empty) AND
  (unitNo matches OR unitNo is empty) AND
  (tasCbsMatch matches OR tasCbsMatch is empty) AND
  (amount matches OR amount is empty) AND
  (narration matches OR narration is empty) AND
  (paymentStatus matches OR paymentStatus is empty)
```

### Case Insensitivity
- All text searches are case-insensitive
- Status searches are case-insensitive
- Example: "recon" matches "RECON", "Recon", "recon"

### Substring Matching
- Text fields use substring matching
- Example: "304" matches "UNIT-304-A", "304-B", "304-C"

### Exact Matching
- Status fields use exact matching
- Example: "SUCCESS" only matches exactly "SUCCESS" (case-insensitive)

## Pagination with Search

When search is active:
- Pagination works on filtered results
- Total rows count reflects filtered data
- Page resets to 1 when search changes

When search is inactive:
- Pagination works on API data
- Total rows count reflects API total
- Page navigation fetches from API

## Verification Checklist

- [x] All searchable columns included in searchFields
- [x] Text fields show text input boxes
- [x] Status field shows dropdown selector
- [x] Search works with substring matching for text fields
- [x] Search works with exact matching for status field
- [x] Multiple field search works (AND logic)
- [x] Case-insensitive search works
- [x] Empty search shows all results
- [x] Pagination works with search
- [x] Search state persists during pagination
- [x] Search resets page to 1 when changed

## Status: ✅ ALL SEARCH FUNCTIONALITY WORKING

All search fields are properly configured and working correctly:
- 6 text search fields (substring matching)
- 1 status dropdown field (exact matching)
- Proper AND logic for multiple field searches
- Case-insensitive matching
- Proper integration with pagination

