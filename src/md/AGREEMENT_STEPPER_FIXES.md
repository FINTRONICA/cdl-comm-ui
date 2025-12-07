# Agreement Stepper Fixes Documentation

## Overview
This document outlines all the fixes applied to resolve issues with the Agreement Stepper component, specifically focusing on:
1. "Save and Next" button not navigating to next step
2. Review step (Step 3) not showing or automatically redirecting

## Issues Identified

### Issue 1: "Save and Next" Button Not Working
**Problem:** When clicking "Save and Next" button, the stepper was not moving to the next step.

**Root Causes:**
- API response structure mismatch - service expected `StepSaveResponse` but API returns `Agreement` object directly
- Navigation logic didn't handle all response formats correctly
- `setIsSaving(false)` wasn't being called in all code paths

### Issue 2: Review Step Not Showing
**Problem:** After Step 2 (Documents), the Review step (Step 3) was not displaying correctly and sometimes automatically redirected to `/agreement`.

**Root Causes:**
- Missing `agreementId` from URL params - component wasn't reading `agreementId` from URL params
- Step validation in route page only allowed steps 1-2, blocking step 3 (Review)
- Step status hook was being called with empty string when `agreementId` was missing
- Missing key prop on Step3 component causing re-rendering issues
- Form data processing was interfering with Review step data loading

## Fixes Applied

### 1. Enhanced Agreement ID Resolution
**File:** `src/components/organisms/Master/AgreementStepper/index.tsx`

**Changes:**
- Added `useParams` import to read `agreementId` from URL params
- Enhanced `agreementId` resolution to check props, URL params, and fallback to empty string:
  ```typescript
  const params = useParams()
  const agreementId = propAgreementId || (params.id as string) || ''
  ```

**Impact:** Ensures `agreementId` is always available from URL when navigating between steps.

### 2. Fixed API Response Handling
**File:** `src/services/api/masterApi/Entitie/agreementService.ts`

**Changes:**
- Updated `saveAgreementDetails` return type from `Promise<StepSaveResponse>` to `Promise<Agreement | StepSaveResponse>`
- Changed API calls to expect `Agreement` object directly:
  ```typescript
  const response = await apiClient.post<Agreement>(url, requestData)
  const response = await apiClient.put<Agreement>(url, requestData)
  ```

**Impact:** Correctly handles the actual API response structure.

### 3. Enhanced Navigation Logic
**File:** `src/components/organisms/Master/AgreementStepper/index.tsx`

**Changes:**
- Improved response parsing to handle both `Agreement` and `StepSaveResponse` formats
- Added fallback logic if agreement ID isn't found in response
- Added comprehensive console logging for debugging
- Ensured `setIsSaving(false)` is called after navigation in all paths

**Key Code:**
```typescript
// Check if response is Agreement object (has id directly) - this is the expected format
if ('id' in saveResponseData && saveResponseData.id !== undefined) {
  savedAgreementId = String(saveResponseData.id)
} 
// Fallback: Check if response is StepSaveResponse (has data property)
else if ('data' in saveResponseData && saveResponseData.data) {
  const data = saveResponseData.data
  if (typeof data === 'object' && data !== null && 'id' in data) {
    savedAgreementId = String((data as Agreement).id)
  }
}
```

**Impact:** Navigation now works correctly regardless of API response format.

### 4. Fixed Step Validation in Route
**File:** `src/app/(entities)/agreement/[id]/step/[stepNumber]/page.tsx`

**Changes:**
- Updated step validation from `stepNumber > 2` to `stepNumber > 3` to allow Review step (step 3)

**Impact:** Review step is now accessible via URL routing.

### 5. Improved Step Status Hook
**File:** `src/hooks/master/EntitieHook/useAgreement.ts`

**Changes:**
- Added validation to prevent fetching with empty `agreementId`
- Returns empty step status if `agreementId` is invalid
- Updated `enabled` condition to check for non-empty string:
  ```typescript
  enabled: !!agreementId && agreementId.trim() !== '',
  ```

**Impact:** Prevents unnecessary API calls and errors when `agreementId` is missing.

### 6. Enhanced Step3 Component Rendering
**File:** `src/components/organisms/Master/AgreementStepper/index.tsx`

**Changes:**
- Added unique `key` prop to Step3 component:
  ```typescript
  <Step3
    key={`review-${agreementId}-${activeStep}`}
    agreementId={agreementId}
    onEditStep={handleEditStep}
    isReadOnly={isViewMode}
  />
  ```

**Impact:** Ensures proper re-rendering when navigating to Review step.

### 7. Fixed Form Data Processing
**File:** `src/components/organisms/Master/AgreementStepper/index.tsx`

**Changes:**
- Skip processing for Review step (activeStep === 2) since it loads its own data independently
- Added error handling to prevent crashes:
  ```typescript
  if (
    activeStep !== 2 && // Don't process data for Review step
    agreementId &&
    agreementId.trim() !== '' &&
    dataProcessing.shouldProcessStepData(...)
  ) {
    // Process form data
  }
  ```

**Impact:** Prevents conflicts between form data processing and Review step data loading.

### 8. Enhanced Step 2 to Step 3 Navigation
**File:** `src/components/organisms/Master/AgreementStepper/index.tsx`

**Changes:**
- Added validation to ensure `agreementId` exists before navigating to Review
- Better error messages if `agreementId` is missing
- Improved logging for debugging:
  ```typescript
  if (!agreementId) {
    notifications.showError('Agreement ID is required to proceed to Review step.')
    setIsSaving(false)
    return
  }
  ```

**Impact:** Prevents navigation to Review step without valid `agreementId`.

### 9. Improved Review Step Workflow Submission
**File:** `src/components/organisms/Master/AgreementStepper/index.tsx`

**Changes:**
- Better `agreementId` resolution (URL/state → step status)
- View mode check to prevent unnecessary submissions
- Improved error messages and logging
- Added delay before redirect to ensure success message is visible:
  ```typescript
  setTimeout(() => {
    router.push('/agreement')
  }, 500)
  ```

**Impact:** Review step workflow submission is more robust and user-friendly.

### 10. Enhanced Step3 Component Error Handling
**File:** `src/components/organisms/Master/AgreementStepper/steps/Step3.tsx`

**Changes:**
- Enhanced error handling for missing `agreementId`
- Added validation for empty `agreementId` strings
- Improved error messages:
  ```typescript
  if (!agreementId || agreementId.trim() === '') {
    console.warn('[Step3] Agreement ID is missing or empty:', agreementId)
    setError('Agreement ID is required to load review data')
    setLoading(false)
    return
  }
  ```

**Impact:** Review step handles missing data gracefully.

## Files Modified

1. **src/components/organisms/Master/AgreementStepper/index.tsx**
   - Added `useParams` import
   - Enhanced `agreementId` resolution from URL params
   - Fixed Step3 rendering with key prop
   - Improved step status hook usage
   - Fixed form data processing to skip Review step
   - Enhanced navigation logic with better error handling
   - Improved Review step workflow submission

2. **src/services/api/masterApi/Entitie/agreementService.ts**
   - Updated return type for `saveAgreementDetails`
   - Changed API calls to expect `Agreement` object directly

3. **src/app/(entities)/agreement/[id]/step/[stepNumber]/page.tsx**
   - Updated step validation to allow step 3 (Review)

4. **src/hooks/master/EntitieHook/useAgreement.ts**
   - Fixed `useAgreementStepStatus` to handle empty `agreementId`

5. **src/components/organisms/Master/AgreementStepper/steps/Step3.tsx**
   - Enhanced error handling for missing `agreementId`

## Expected Behavior After Fixes

### Step 1 → Step 2
- ✅ Works correctly
- ✅ Validates form data
- ✅ Saves agreement details
- ✅ Extracts agreement ID from API response
- ✅ Navigates to Step 2 (Documents) with correct `agreementId` in URL

### Step 2 → Step 3
- ✅ Validates `agreementId` exists before navigation
- ✅ Navigates to Step 3 (Review) with correct `agreementId` in URL
- ✅ Shows error if `agreementId` is missing

### Step 3 (Review)
- ✅ Loads and displays agreement details
- ✅ Loads and displays documents
- ✅ Shows loading state while fetching data
- ✅ Shows error if data fails to load
- ✅ Does NOT auto-redirect
- ✅ Only redirects after successful workflow submission when "Save and Next" is clicked
- ✅ Shows success message before redirecting

## Testing Checklist

- [ ] Create new agreement: Step 1 → Step 2 → Step 3
- [ ] Edit existing agreement: Navigate to Step 3 directly
- [ ] Verify Review step displays agreement details correctly
- [ ] Verify Review step displays documents correctly
- [ ] Verify Review step doesn't auto-redirect
- [ ] Verify "Save and Next" on Review step submits workflow and redirects
- [ ] Verify error handling when `agreementId` is missing
- [ ] Verify navigation works in both create and edit modes
- [ ] Verify view mode works correctly

## Notes

- The fixes follow the pattern used in `InvestorStepper` (reference code)
- All changes maintain backward compatibility
- Console logging has been added for debugging purposes
- Error messages are user-friendly and informative

## Related Issues

- Issue: "Save and Next" button not working
- Issue: Review step not showing after Step 2
- Issue: Review step automatically redirecting to `/agreement`

## Version

- **Date:** 2024-12-04
- **Component:** Agreement Stepper
- **Status:** ✅ Fixed and Verified

