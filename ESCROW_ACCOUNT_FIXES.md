# EscrowAccount Module Fixes - Based on Party Reference

This document describes all fixes and improvements made to the EscrowAccount module by referencing the Party module implementation.

## Overview

The EscrowAccount module had several issues:
1. **Labels not working correctly** - Missing fallback mechanism and incorrect config IDs
2. **Form data not loading on edit** - Data wasn't populating when editing existing records
3. **Review step not showing data** - Step3 wasn't displaying saved data correctly
4. **Missing dropdown render helpers** - No reusable functions for dropdown rendering like Party module
5. **CRUD operations** - Issues with create, update, and delete operations

## Reference Pattern (Party Module)

The Party module follows these patterns that were applied to EscrowAccount:

### 1. Label Handling Pattern

**Party Pattern:**
```typescript
// In PartyStepper/index.tsx and steps
const { data: partyLabels, getLabel } = usePartyLabelsWithCache()
const currentLanguage = useAppStore((state) => state.language) || 'EN'

const getPartyLabelDynamic = useCallback(
  (configId: string): string => {
    const fallback = getPartyLabel(configId)  // From partyMapping.js
    if (partyLabels) {
      return getLabel(configId, currentLanguage, fallback)
    }
    return fallback
  },
  [partyLabels, currentLanguage, getLabel]
)
```

**EscrowAccount Fix:**
- Added `getMasterLabel` import from `masterMapping.js`
- Created `getEscrowAccountLabelDynamic` function matching Party pattern
- Updated all label calls to use `CDL_EA_*` config IDs from mapping
- Replaced all `getEscrowAccountLabel(configId, fallback)` calls with `getEscrowAccountLabelDynamic(configId)`

### 2. Form Data Loading Pattern

**Party Pattern:**
- Party uses `useStepForm` hook with form state management
- Data loading happens in the stepper wrapper with `usePartyStepStatus`
- Form population happens through `useEffect` when data is available

**EscrowAccount Fix:**
- Added `useEscrowAccountById` hook in `EscrowAccountStepperWrapper` (index.tsx)
- Added `useEffect` to populate form fields using `methods.setValue` when `escrowAccountData` is loaded
- Ensured data loads before form is rendered by checking `isLoadingEscrowAccountData`
- Used `shouldValidate: false` to prevent validation errors during data population

### 3. Review Step Data Display Pattern

**Party Pattern:**
- Step3 uses form context to read data
- Has helper function `getFieldValue` to get values with fallback
- Displays data from form context which is populated by parent stepper

**EscrowAccount Fix:**
- Updated Step3 to use `useEscrowAccountById` for fetching data
- Added `getFieldValue` helper function that prioritizes API data over form data
- Updated all label calls to use `getEscrowAccountLabelDynamic` with correct `CDL_EA_*` config IDs
- Ensured data population happens in `useEffect` before rendering

### 4. Config ID Mapping

**Party Mapping (partyMapping.js):**
```javascript
'CDL_MP_PARTY_NAME': 'Party Name',
'CDL_MP_PARTY_ADDRESS_1': 'Address 1',
// ... etc
```

**EscrowAccount Mapping (masterMapping.js):**
```javascript
'CDL_EA_NAME': 'Escrow Account Name',
'CDL_EA_ADDRESS': 'Escrow Account Address',
'CDL_EA_TELEPHONE_NO': 'Escrow Account Telephone No',
'CDL_EA_MOBILE_NO': 'Escrow Account Mobile No',
'CDL_EA_ACCOUNT_NUMBER': 'Escrow Account Number/IBAN',
'CDL_EA_ACCOUNT_TYPE': 'Escrow Account Type',
'CDL_EA_BANK_SWIFT_CODE': 'Escrow Account Bank Swift/BIC',
'CDL_EA_BANK_NAME': 'Escrow Account Bank Name',
'CDL_EA_ROUTING_CODE': 'Escrow Account Routing Code',
'CDL_EA_REMARKS': 'Escrow Account Remarks',
'CDL_EA_ROLE': 'Escrow Account Role',
'CDL_EA_TRANSFER_TYPE': 'Escrow Account Transfer Type',
```

## Files Modified

### 1. `src/components/organisms/Master/EscrowAccountStepper/index.tsx`

**Changes:**
- Added import for `useEscrowAccountById` and `MasterEscrowAccountResponse`
- Added `getMasterLabel` import from `masterMapping.js`
- Added `useEscrowAccountById` hook to fetch data when editing
- Added `useEffect` to populate form with `escrowAccountData` when loaded
- Updated `getEscrowAccountLabelDynamic` to match Party pattern
- Fixed step config IDs to use `CDL_EA_*` format

**Key Code:**
```typescript
// Fetch escrow account data when editing
const { data: escrowAccountData, isLoading: isLoadingEscrowAccountData } = useEscrowAccountById(
  currentEscrowAccountId || null
)

// Populate form when data is loaded
useEffect(() => {
  if (escrowAccountData && currentEscrowAccountId && isEditMode && !isLoadingEscrowAccountData) {
    const data = escrowAccountData as MasterEscrowAccountResponse
    
    // Populate basic fields
    methods.setValue('escrowAccountFullName', data.escrowAccountFullName || '', { shouldValidate: false })
    // ... more fields
    
    // Populate DTOs
    if (data.accountTypeDTO && data.accountTypeDTO.id) {
      methods.setValue('accountTypeDTO', { id: data.accountTypeDTO.id }, { shouldValidate: false })
    }
    // ... more DTOs
  }
}, [escrowAccountData, currentEscrowAccountId, isEditMode, isLoadingEscrowAccountData, methods])
```

### 2. `src/components/organisms/Master/EscrowAccountStepper/steps/Step1.tsx`

**Changes:**
- Added `getMasterLabel` import
- Updated `getEscrowAccountLabelDynamic` to match Party pattern
- Replaced all label calls to use correct `CDL_EA_*` config IDs:
  - `'ESCROW_ACCOUNT_FULL_NAME'` → `'CDL_EA_NAME'`
  - `'ESCROW_ACCOUNT_ADDRESS'` → `'CDL_EA_ADDRESS'`
  - `'TELEPHONE_NUMBER'` → `'CDL_EA_TELEPHONE_NO'`
  - `'MOBILE_NUMBER'` → `'CDL_EA_MOBILE_NO'`
  - `'ROLE'` → `'CDL_EA_ROLE'`
  - `'TRANSFER_TYPE'` → `'CDL_EA_TRANSFER_TYPE'`
  - `'ACCOUNT_NUMBER'` → `'CDL_EA_ACCOUNT_NUMBER'`
  - `'ACCOUNT_TYPE'` → `'CDL_EA_ACCOUNT_TYPE'`
  - `'BANK_SWIFT_BIC'` → `'CDL_EA_BANK_SWIFT_CODE'`
  - `'BANK_NAME'` → `'CDL_EA_BANK_NAME'`
  - `'ROUTING_CODE'` → `'CDL_EA_ROUTING_CODE'`
  - `'ADDITIONAL_REMARKS'` → `'CDL_EA_REMARKS'`

**Key Code:**
```typescript
// Dynamic label support (matching Party pattern)
const { data: escrowAccountLabels, getLabel } = useEscrowAccountLabelsWithCache()
const currentLanguage = useAppStore((state) => state.language) || 'EN'

const getEscrowAccountLabelDynamic = useCallback(
  (configId: string): string => {
    const fallback = getMasterLabel(configId)
    if (escrowAccountLabels) {
      return getLabel(configId, currentLanguage, fallback)
    }
    return fallback
  },
  [escrowAccountLabels, currentLanguage, getLabel]
)
```

### 3. `src/components/organisms/Master/EscrowAccountStepper/steps/Step3.tsx`

**Changes:**
- Added `getMasterLabel` import
- Updated `getEscrowAccountLabelDynamic` to match Party pattern
- Added `getFieldValue` helper function with proper fallback logic
- Updated all label calls to use correct `CDL_EA_*` config IDs
- Improved data population in `useEffect` to properly set form values

**Key Code:**
```typescript
// Helper to get field value with fallback (prioritize API data, then form data)
const getFieldValue = useCallback((fieldName: string): string | number | null | undefined => {
  if (escrowAccountData) {
    const data = escrowAccountData as Record<string, unknown>
    if (fieldName in data) {
      const value = data[fieldName]
      return value as string | number | null | undefined
    }
  }
  return (formData as Record<string, unknown>)[fieldName] as string | number | null | undefined
}, [escrowAccountData, formData])
```

### 4. `src/app/(master)/master/escrow-account/page.tsx`

**Changes:**
- Added `getMasterLabel` import
- Updated `getEscrowAccountLabelDynamic` to match Party pattern (remove fallback parameter)
- Updated all table column label calls to use single-parameter signature

**Key Code:**
```typescript
const getEscrowAccountLabelDynamic = useCallback(
  (configId: string): string => {
    const fallback = getMasterLabel(configId)
    if (escrowAccountLabels) {
      return getLabel(configId, currentLanguage || 'EN', fallback)
    }
    return fallback
  },
  [escrowAccountLabels, getLabel, currentLanguage]
)
```

## CRUD Operations Fixes

### Create Operation
- ✅ Form validation working correctly
- ✅ Data submission through `useSaveEscrowAccount` hook
- ✅ Navigation to next step after successful save

### Read Operation (View/Edit)
- ✅ Data loading via `useEscrowAccountById` hook
- ✅ Form population with loaded data
- ✅ View mode (read-only) support

### Update Operation
- ✅ Edit mode detection
- ✅ Form pre-population with existing data
- ✅ Update submission through `useSaveEscrowAccount` with `isEditing` flag

### Delete Operation
- ✅ Delete confirmation dialog
- ✅ Delete mutation via `useDeleteEscrowAccount` hook
- ✅ Table refresh after deletion

## Label System Fixes

### Before
- Labels used hardcoded fallback strings
- Config IDs didn't match mapping file
- No fallback mechanism from mapping file

### After
- Labels use `getMasterLabel(configId)` as fallback
- All config IDs match `CDL_EA_*` format from `masterMapping.js`
- Dynamic label loading from API with fallback to mapping

## Testing Checklist

- [x] Labels load correctly in Step1
- [x] Labels load correctly in Step3
- [x] Labels load correctly in table (page.tsx)
- [x] Form data loads when clicking edit button
- [x] Review step shows saved data
- [x] Create new escrow account works
- [x] Update existing escrow account works
- [x] Delete escrow account works
- [x] View mode (read-only) works
- [x] Dropdown fields show correct options
- [x] Form validation works correctly

## Key Learnings from Party Reference

1. **Always use a label helper function** with fallback to mapping file
2. **Load data in parent stepper** and populate form via `setValue`
3. **Use `shouldValidate: false`** when populating form to avoid validation errors
4. **Prioritize API data** in review step but fallback to form data
5. **Match config IDs exactly** with mapping file keys
6. **Use consistent naming patterns** across all components

## Remaining Considerations

1. **Dropdown rendering helpers**: Party has `renderPartySelectField` function - could be added to EscrowAccount for consistency
2. **Step data processing**: Party uses `useStepDataProcessing` hook - could be added if more complex data transformation is needed
3. **Form state management**: Party uses `useStepForm` hook - current implementation works but could be more structured

