export const SURETY_BOND_LABELS = {
  FALLBACKS: {
    // Provided mappings
    CDL_SB_REF_NO: 'Surety Bond Ref No',
    CDL_SB_TYPE: 'Surety Bond Type',
    CDL_SB_DATE: 'Surety Bond Date',
    CDL_SB_BPA_CIF: 'Build Partner Assets CIF',
    CDL_SB_BP_NAME: 'Build Partner Name',
    CDL_SB_OPEN_ENDED: 'Open Ended',
    CDL_SB_BPA_COMPLETION_DATE: 'Completion Date',
    CDL_SB_NO_OF_AMEND: 'No Of Amendments',
    CDL_SB_EXPIARY_DATE: 'Expiry Date',
    CDL_SB_AMOUNT: 'Amount',
    CDL_SB_NEW_READING: 'New Reading(Amendments)',
    CDL_SB_BANK: 'Issuer Bank',
    CDL_SB_STATUS: 'Status',

    // Common stepper/buttons and section titles used in surety bond UI
    CDL_SB_STEP_DETAILS: 'Details',
    CDL_SB_STEP_DOCUMENTS: 'Documents',
    CDL_SB_STEP_REVIEW: 'Review',
    CDL_SB_CANCEL: 'Cancel',
    CDL_SB_BACK: 'Back',
    CDL_SB_NEXT: 'Next',
    CDL_SB_SUBMIT: 'Submit',
    CDL_SB_SAVE_NEXT: 'Save and Next',
    CDL_SB_UPDATE: 'Update',
    CDL_SB_CREATING: 'Creating...',
    CDL_SB_UPDATING: 'Updating...',
    CDL_SB_ERROR: 'Error Loading Surety Bond',
    CDL_SB_RETRY: 'Try Again',
    CDL_SB_DETAILS: 'Guarantee Details',
    CDL_SB_GENERAL_INFO: 'General Information',
    CDL_SB_GUARANTEE_INFO: 'Guarantee Information',
    CDL_SB_DOCUMENTS_SECTION: 'Documents',
    CDL_SB_DOCUMENTS: 'Uploaded Documents',
    CDL_SB_CREATED_SUCCESS: 'Surety bond created successfully! Moving to document upload step.',
    CDL_SB_CREATE_FAILED: 'Failed to create surety bond',
    CDL_SB_CREATE_ERROR: 'Error creating surety bond',
    CDL_SB_UPDATED_SUCCESS: 'Surety bond updated successfully!',
    CDL_SB_UPDATE_ERROR: 'Error updating surety bond',
    CDL_SB_NO_ID_ERROR: 'No guarantee ID available for document upload',
    CDL_SB_GO_BACK_MESSAGE: 'Please go back to Step 1 and save the guarantee first.',
    CDL_SB_FORM_RESET: 'Form reset successfully. All data cleared.',
    CDL_SB_MOVED_BACK_TO: 'Moved back to',
    CDL_SB_STEP: 'step',
    CDL_SB_EDIT: 'Edit',
  } as Record<string, string>,
}

export const getSuretyBondLabel = (configId: string): string => {
  return SURETY_BOND_LABELS.FALLBACKS[configId] || configId
}


