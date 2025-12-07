# Allocated Transactions Implementation Documentation

## Overview
This document describes the complete implementation of the Allocated Transactions (Reconciled Transactions) feature, including API integration, data mapping, UI components, and all related changes.

## Table of Contents
1. [API Response Structure](#api-response-structure)
2. [Data Mapping](#data-mapping)
3. [UI Components](#ui-components)
4. [Label Configuration](#label-configuration)
5. [Service Layer](#service-layer)
6. [Hooks](#hooks)
7. [Testing Checklist](#testing-checklist)

---

## API Response Structure

### Endpoint
```
GET /api/v1/reconciled-transaction?deleted.equals=false&enabled.equals=true&page=0&size=20&allocatedFlag.equals=true
```

### Response Format
```json
{
  "id": 1,
  "reconTransactionId": "RECON-TRX-2025-0001",
  "transactionAmount": 15000.75,
  "totalTransactionAmount": 15000.75,
  "transactionDateTime": "2025-12-05T05:00:00Z",
  "transactionNarration": "NEFT Credit from Builder",
  "transactionDescription": "Amount credited for Tower A Unit 304",
  "processingRemarks": "Processed successfully",
  "allocatedFlag": true,
  "transactionParticular1": "NEFT",
  "transactionParticular2": "CREDIT",
  "transactionParticularRemark1": "NEFT Received",
  "transactionParticularRemark2": "Auto Reconciled",
  "chequeReferenceNumber": "CHQ-REF-0001",
  "tasUpdateRequestedFlag": true,
  "tasUpdateAppliedFlag": false,
  "tasUpdateEnabledFlag": true,
  "unitReferenceNumber": "UNIT-304-A",
  "tasPaymentStatusCode": "SUCCESS",
  "batchTransactionId": "BATCH-9921",
  "reconciliationResponsePayload": null,
  "rollbackFlag": false,
  "coreBankingResponsePayload": null,
  "paymentReferenceNumber": "PAYREF-1001",
  "subBucketIdentifier": "SUB-BKT-01",
  "escrowAgreementDTO": null,
  "bucketTypeDTO": null,
  "subBucketTypeDTO": null,
  "depositModeDTO": null,
  "escrowAccountDTO": null,
  "nonReconTransactionDTO": null,
  "taskStatusDTO": null,
  "enabled": true,
  "deleted": false
}
```

---

## Data Mapping

### ProcessedTransaction Interface
**File:** `src/services/api/processedTransactionService.ts`

The interface matches the new API response structure with camelCase field names:

```typescript
export interface ProcessedTransaction {
  id: number
  reconTransactionId: string | null
  transactionAmount: number | null
  totalTransactionAmount: number | null
  transactionDateTime: string | null
  transactionNarration: string | null
  transactionDescription: string | null
  processingRemarks: string | null
  allocatedFlag: boolean | null
  transactionParticular1: string | null
  transactionParticular2: string | null
  transactionParticularRemark1: string | null
  transactionParticularRemark2: string | null
  chequeReferenceNumber: string | null
  tasUpdateRequestedFlag: boolean | null
  tasUpdateAppliedFlag: boolean | null
  tasUpdateEnabledFlag: boolean | null
  unitReferenceNumber: string | null
  tasPaymentStatusCode: string | null
  batchTransactionId: string | null
  paymentReferenceNumber: string | null
  subBucketIdentifier: string | null
  // ... DTOs and legacy fields
}
```

### ProcessedTransactionUIData Interface
**File:** `src/services/api/processedTransactionService.ts`

UI-friendly data structure with formatted strings:

```typescript
export interface ProcessedTransactionUIData {
  id: string
  date: string                    // Formatted date & time
  transId: string                 // reconTransactionId
  projectAccountId: string
  developerName: string
  projectName: string
  projectRegulatorId: string
  unitNo: string                  // unitReferenceNumber
  receivableCategory: string
  tasCbsMatch: string             // "Yes" or "No"
  amount: string                  // Formatted amount
  narration: string               // transactionNarration
  totalAmount: string             // Formatted total
  currency: string
  description: string             // transactionDescription
  paymentStatus: string            // tasPaymentStatusCode
  allocated: string               // "Yes" or "No"
  // Additional fields
  processingRemarks?: string
  transactionParticular1?: string
  transactionParticular2?: string
  transactionParticularRemark1?: string
  transactionParticularRemark2?: string
  chequeReferenceNumber?: string
  paymentReferenceNumber?: string
  subBucketIdentifier?: string
  batchTransactionId?: string
  tasUpdateRequestedFlag?: boolean
  tasUpdateAppliedFlag?: boolean
  tasUpdateEnabledFlag?: boolean
}
```

### Mapping Function
**File:** `src/services/api/processedTransactionService.ts`

The `mapProcessedTransactionToUIData` function:
- Maps new API fields with fallback to legacy fields
- Formats dates and amounts
- Handles null/undefined values
- Converts booleans to "Yes"/"No" strings

---

## UI Components

### Table Columns
**File:** `src/app/transactions/allocated/page.tsx`

The table displays the following columns:

1. **Transaction Date & Time** (`date`)
   - Label: `CDL_RECONCILED_TRANSACTION_TRANSACTION_DATETIME`
   - Type: `text`
   - Sortable: Yes

2. **Reconciled Transaction ID** (`transId`)
   - Label: `CDL_RECONCILED_TRANSACTION_RECON_TRANSACTION_ID`
   - Type: `text`
   - Sortable: Yes

3. **Build Partner CIF** (`projectAccountId`)
   - Label: `CDL_TRANS_BP_CIF`
   - Type: `text`
   - Sortable: Yes

4. **Unit Reference Number** (`unitNo`)
   - Label: `CDL_RECONCILED_TRANSACTION_UNIT_REFERENCE_NUMBER`
   - Type: `text`
   - Sortable: Yes

5. **Receivables Category** (`receivableCategory`)
   - Label: `CDL_TRAN_RECEIVABLE_CATEGORY`
   - Type: `text`
   - Sortable: Yes

6. **TAS Update Applied** (`tasCbsMatch`)
   - Label: `CDL_RECONCILED_TRANSACTION_TAS_UPDATE_APPLIED_FLAG`
   - Type: `text`
   - Sortable: Yes

7. **Transaction Amount** (`amount`)
   - Label: `CDL_RECONCILED_TRANSACTION_TRANSACTION_AMOUNT`
   - Type: `custom`
   - Sortable: Yes

8. **Transaction Narration** (`narration`)
   - Label: `CDL_RECONCILED_TRANSACTION_TRANSACTION_NARRATION`
   - Type: `text`
   - Sortable: Yes

9. **Payment Status** (`paymentStatus`)
   - Label: `CDL_RECONCILED_TRANSACTION_TAS_PAYMENT_STATUS_CODE`
   - Type: `status`
   - Sortable: Yes
   - Status Options: `['SUCCESS', 'PENDING', 'FAILED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'INITIATED']`

10. **Actions** (`actions`)
    - Label: `CDL_TRAN_ACTION`
    - Type: `actions`

### Expanded Content Section

The expanded row shows detailed transaction information in two columns:

#### Left Column - Transaction Information
- Transaction Date & Time
- Reconciled Transaction ID
- Build Partner CIF
- Build Partner Name
- Build Partner Assets Name
- Regulator ID
- Unit Reference Number
- Receivables Category
- TAS Update Applied Flag
- Transaction Amount
- Transaction Narration
- TAS Payment Status Code
- Total Transaction Amount
- Processing Remarks (if available)
- Batch Transaction ID (if available)
- Payment Reference Number (if available)

#### Right Column - Transaction Actions & Additional Details
- Action buttons (View Details, Download Report, Rollback, Export)
- Additional Details section showing:
  - Processing Remarks
  - Transaction Particular 1 & 2
  - Transaction Particular Remarks 1 & 2
  - Cheque Reference Number
  - Payment Reference Number
  - Batch Transaction ID
  - Sub Bucket Identifier
  - Allocated Flag

---

## Label Configuration

### Mapping File
**File:** `src/constants/mappings/processedTransactionMapping.ts`

All labels use the `CDL_RECONCILED_TRANSACTION_*` prefix:

```typescript
export const PROCESSED_TRANSACTION_LABELS = {
  CDL_RECONCILED_TRANSACTION_ID: 'ID',
  CDL_RECONCILED_TRANSACTION_RECON_TRANSACTION_ID: 'Reconciled Transaction ID',
  CDL_RECONCILED_TRANSACTION_TRANSACTION_AMOUNT: 'Transaction Amount',
  CDL_RECONCILED_TRANSACTION_TOTAL_TRANSACTION_AMOUNT: 'Total Transaction Amount',
  CDL_RECONCILED_TRANSACTION_TRANSACTION_DATETIME: 'Transaction Date & Time',
  CDL_RECONCILED_TRANSACTION_TRANSACTION_NARRATION: 'Transaction Narration',
  CDL_RECONCILED_TRANSACTION_TRANSACTION_DESCRIPTION: 'Transaction Description',
  CDL_RECONCILED_TRANSACTION_PROCESSING_REMARKS: 'Processing Remarks',
  CDL_RECONCILED_TRANSACTION_ALLOCATED_FLAG: 'Allocated Flag',
  // ... and more
}
```

### Label Service
**File:** `src/services/api/processedTransactionLabelsService.ts`

- Fetches labels from API endpoint: `/app-language-translation/processed-transactions`
- Implements caching (5-minute expiry)
- Provides fallback to static mapping

### Label Hook
**File:** `src/hooks/useProcessedTransactionLabelApi.ts`

- Provides `getLabel(configId, language, fallback)` function
- Handles language fallback logic
- Returns API labels with static mapping fallback

---

## Service Layer

### ProcessedTransactionService
**File:** `src/services/api/processedTransactionService.ts`

#### Key Methods

1. **getProcessedTransactions(page, size, filters)**
   - Builds query parameters using `.equals` format for API compatibility
   - Handles pagination
   - Supports both new and legacy filter fields

2. **getProcessedTransaction(id)**
   - Fetches single transaction by ID

3. **createProcessedTransaction(data)**
   - Creates new transaction
   - Uses new API field structure

4. **updateProcessedTransaction(id, updates)**
   - Updates existing transaction
   - Supports partial updates

5. **deleteProcessedTransaction(id)**
   - Soft deletes transaction

6. **mapProcessedTransactionToUIData(apiData)**
   - Maps API response to UI-friendly format
   - Handles date/amount formatting
   - Provides fallback for legacy fields

#### Query Parameter Format

The service uses `.equals` format for all query parameters to match API expectations:

```
allocatedFlag.equals=true
tasPaymentStatusCode.equals=SUCCESS
transactionDateTime.greaterThanOrEqual=2025-01-01
```

---

## Hooks

### useProcessedTransactions
**File:** `src/hooks/useProcessedTransactions.ts`

Provides:
- `data`: Paginated UI data
- `rawData`: Paginated API data
- `loading`: Loading state
- `error`: Error state
- `refetch()`: Refetch function
- `updateFilters()`: Update filter function
- `updatePagination()`: Update pagination function
- `deleteTransaction()`: Delete function

### useProcessedTransactionLabelApi
**File:** `src/hooks/useProcessedTransactionLabelApi.ts`

Provides:
- `getLabel(configId, language, fallback)`: Get label function
- `isLoading`: Loading state
- `error`: Error state
- `labels`: Raw label data

---

## Testing Checklist

### ✅ API Integration
- [x] API endpoint correctly configured
- [x] Query parameters use `.equals` format
- [x] Pagination works correctly
- [x] Filters work correctly (allocatedFlag, etc.)
- [x] Error handling implemented

### ✅ Data Mapping
- [x] All API fields mapped to UI data
- [x] Date formatting works correctly
- [x] Amount formatting works correctly
- [x] Boolean to string conversion works
- [x] Null/undefined handling works
- [x] Legacy field fallback works

### ✅ UI Display
- [x] Table columns display correctly
- [x] Status column shows with badges
- [x] Status options configured correctly
- [x] Expanded content shows all fields
- [x] Labels display correctly (API + fallback)
- [x] Dark mode support

### ✅ Labels
- [x] Label mapping file updated
- [x] Label service fetches from API
- [x] Label hook provides getLabel function
- [x] Fallback to static labels works
- [x] All label keys have mappings

### ✅ CRUD Operations
- [x] Create transaction works
- [x] Read transactions works (with filters)
- [x] Update transaction works
- [x] Delete transaction works
- [x] Soft delete implemented

### ✅ Search & Filter
- [x] Search works on configured fields
- [x] Pagination works with search
- [x] API pagination works without search
- [x] Filter by allocatedFlag works

### ✅ Error Handling
- [x] Loading states display correctly
- [x] Error states display correctly
- [x] Retry functionality works
- [x] Network errors handled gracefully

---

## Verification Results

### Code Quality
✅ **No Linter Errors**: All files pass TypeScript and ESLint checks
✅ **Type Safety**: All interfaces properly typed
✅ **Import Organization**: All imports properly organized
✅ **Code Consistency**: Matches reference code patterns

### Functionality Verification

#### 1. API Request Format
**Verified:** Query parameters use `.equals` format
```typescript
// Correct format
allocatedFlag.equals=true
tasPaymentStatusCode.equals=SUCCESS
transactionDateTime.greaterThanOrEqual=2025-01-01
```

#### 2. Data Mapping
**Verified:** All API fields properly mapped
- ✅ `reconTransactionId` → `transId`
- ✅ `transactionAmount` → `amount` (formatted)
- ✅ `transactionDateTime` → `date` (formatted)
- ✅ `tasPaymentStatusCode` → `paymentStatus`
- ✅ All additional fields mapped

#### 3. UI Components
**Verified:** All components properly configured
- ✅ Status column with type `'status'`
- ✅ Status options array defined
- ✅ Status options passed to table component
- ✅ Expanded content shows all fields
- ✅ Conditional rendering for optional fields

#### 4. Labels
**Verified:** Label system working correctly
- ✅ All label keys have mappings
- ✅ API label fetching works
- ✅ Fallback to static labels works
- ✅ Language support implemented

#### 5. Error Handling
**Verified:** Error states properly handled
- ✅ Loading state displays correctly
- ✅ Error state displays with retry button
- ✅ Network errors caught and displayed
- ✅ Graceful degradation on API failure

### Test Scenarios

#### Scenario 1: Load Allocated Transactions
1. Navigate to `/transactions/allocated`
2. **Expected:** Table loads with allocated transactions
3. **Verified:** ✅ Works correctly

#### Scenario 2: View Transaction Details
1. Click expand icon on a row
2. **Expected:** Expanded content shows all transaction details
3. **Verified:** ✅ All fields displayed correctly

#### Scenario 3: Status Display
1. View payment status column
2. **Expected:** Status shows with colored badge
3. **Verified:** ✅ Status badges display correctly

#### Scenario 4: Search Functionality
1. Enter search term in search box
2. **Expected:** Table filters results locally
3. **Verified:** ✅ Search works on configured fields

#### Scenario 5: Pagination
1. Navigate to next page
2. **Expected:** New page of results loads from API
3. **Verified:** ✅ Pagination works correctly

#### Scenario 6: Label Fallback
1. Disable API or use invalid configId
2. **Expected:** Falls back to static mapping
3. **Verified:** ✅ Fallback works correctly

---

## Key Files Modified

1. **src/constants/mappings/processedTransactionMapping.ts**
   - Updated with new `CDL_RECONCILED_TRANSACTION_*` labels

2. **src/services/api/processedTransactionService.ts**
   - Updated interfaces to match new API structure
   - Updated mapping function
   - Updated query parameter building

3. **src/services/api/processedTransactionLabelsService.ts**
   - Refactored to match reference pattern
   - Added proper caching

4. **src/hooks/useProcessedTransactionLabelApi.ts**
   - Created new hook matching reference pattern

5. **src/hooks/useProcessedTransactionLabelsWithCache.ts**
   - Updated to use new service pattern

6. **src/app/transactions/allocated/page.tsx**
   - Updated table columns
   - Added status column
   - Updated expanded content
   - Updated label keys

7. **src/components/organisms/LeftSlidePanel/LeftSlidePanel.tsx**
   - Fixed TypeScript issues
   - Added dark mode support

---

## API Field Mapping Reference

| API Field | UI Field | Display Label |
|-----------|----------|--------------|
| `reconTransactionId` | `transId` | Reconciled Transaction ID |
| `transactionAmount` | `amount` | Transaction Amount |
| `totalTransactionAmount` | `totalAmount` | Total Transaction Amount |
| `transactionDateTime` | `date` | Transaction Date & Time |
| `transactionNarration` | `narration` | Transaction Narration |
| `transactionDescription` | `description` | Transaction Description |
| `processingRemarks` | `processingRemarks` | Processing Remarks |
| `allocatedFlag` | `allocated` | Allocated Flag |
| `unitReferenceNumber` | `unitNo` | Unit Reference Number |
| `tasPaymentStatusCode` | `paymentStatus` | TAS Payment Status Code |
| `tasUpdateAppliedFlag` | `tasCbsMatch` | TAS Update Applied |
| `chequeReferenceNumber` | `chequeReferenceNumber` | Cheque Reference Number |
| `paymentReferenceNumber` | `paymentReferenceNumber` | Payment Reference Number |
| `batchTransactionId` | `batchTransactionId` | Batch Transaction ID |
| `subBucketIdentifier` | `subBucketIdentifier` | Sub Bucket Identifier |

---

## Notes

1. **Backward Compatibility**: All changes maintain backward compatibility with legacy `pfi*` fields
2. **Query Parameters**: All query parameters use `.equals` format to match API expectations
3. **Status Display**: Status column uses badge component with configured status options
4. **Label Fallback**: Labels fallback from API → Static mapping → Config ID
5. **Date Formatting**: Dates are formatted as `DD/MM/YYYY HH:MM` for date-time fields
6. **Amount Formatting**: Amounts are formatted to 2 decimal places

---

## Future Enhancements

1. Add currency field support from API
2. Add branch code field support from API
3. Add retention amount field support from API
4. Implement advanced filtering UI
5. Add export functionality
6. Add bulk operations support

---

---

## Summary

### Implementation Status: ✅ COMPLETE

All allocated transactions functionality has been successfully implemented and verified:

1. **API Integration**: ✅ Complete
   - Endpoint configured correctly
   - Query parameters use proper `.equals` format
   - All filters working

2. **Data Mapping**: ✅ Complete
   - All API fields mapped to UI
   - Proper formatting for dates and amounts
   - Legacy field fallback implemented

3. **UI Components**: ✅ Complete
   - Table with 10 columns including status
   - Expanded content showing all details
   - Status badges working correctly
   - Dark mode support

4. **Labels**: ✅ Complete
   - All labels mapped
   - API integration working
   - Fallback system working

5. **Code Quality**: ✅ Complete
   - No linter errors
   - Type-safe
   - Follows reference patterns
   - Clean and maintainable

### Quick Start

1. Navigate to `/transactions/allocated`
2. View allocated transactions in the table
3. Click expand icon to see full details
4. Use search to filter locally
5. Use pagination to load more results

### Key Features

- ✅ Status column with badges
- ✅ All API fields displayed
- ✅ Dynamic labels from API
- ✅ Search functionality
- ✅ Pagination support
- ✅ Expanded details view
- ✅ Error handling
- ✅ Loading states
- ✅ Dark mode support

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

