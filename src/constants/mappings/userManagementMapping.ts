// User Management label mapping from USER_MANAGEMENT API response
// Maps configId to configValue for easy lookup and usage in components

export const USER_MANAGEMENT_LABELS = {
  // Main User Management Labels from API
  CDL_ADD_NEW_USER: 'Add New Stakeholder',
  CDL_FIRST_NAME: 'First Name',
  CDL_LAST_NAME: 'Last Name',
  CDL_USER_NAME: 'User Name',
  CDL_EMAIL_ID: 'Email Id',
  CDL_STATUS: 'Status',
  CDL_ROLES: 'Entitlement',
  CDL_PERMISSIONS: 'Access Grant',
  CDL_ACTION: 'Action',
  CDL_EDIT_USER: 'Edit Stakeholder',
  
  // Panel Labels
  CDL_USER_VIEW_ONLY: 'View Only',
  CDL_VIEW_ONLY: 'View Only',
  CDL_USER_NAME_HELPER: 'User name is required',
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
export const getUserManagementLabel = (configId: string): string => {
  return (USER_MANAGEMENT_LABELS as Record<string, string>)[configId] || configId
}