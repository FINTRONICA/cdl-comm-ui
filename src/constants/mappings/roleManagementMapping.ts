// Role Management label mapping from ROLE_MANAGEMENT API response
// Maps configId to configValue for easy lookup and usage in components

export const ROLE_MANAGEMENT_LABELS = {
  // Main Role Management Labels from API
  CDL_ROLE: 'Entitlement',
  CDL_ROLE_NAME: 'Entitlement Name',
  CDL_ROLE_DESC: 'Entitlement Description',
  CDL_ROLE_STATUS: 'Status',
  CDL_ROLE_ACTION: 'Action',
  
  // Panel Labels
  CDL_EDIT_ROLE: 'Edit Entitlement',
  CDL_ROLE_VIEW_ONLY: 'View Only',
  CDL_ADD_NEW_ROLE: 'Add New Entitlement',
  CDL_VIEW_ONLY: 'View Only',
  CDL_ROLE_NAME_HELPER: 'Entitlement Name is required',
  CDL_SAVING: 'Saving',
  CDL_CREATING: 'Creating',
  CDL_DEACTIVATE: 'Deactivate',
  CDL_ACTIVATE: 'Activate',
  CDL_DOWNLOAD: 'Download',
  CDL_ADD: 'Add',
  
  // Top 5 High Priority Labels
  CDL_SAVE: 'Save',
  CDL_CANCEL: 'Cancel',
  CDL_EDIT: 'Edit',
  CDL_DELETE: 'Delete',
}

// Helper function to get label with fallback
export const getRoleManagementLabel = (configId: string): string => {
  return (ROLE_MANAGEMENT_LABELS as Record<string, string>)[configId] || configId
}