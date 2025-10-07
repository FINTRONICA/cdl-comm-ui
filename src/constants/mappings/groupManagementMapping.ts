// Group Management label mapping from GROUP_MANAGEMENT API response
// Maps configId to configValue for easy lookup and usage in components

export const GROUP_MANAGEMENT_LABELS = {
  // Main Group/Access Grant Labels from API
  CDL_ACCESS_GRANT: 'Access Grant',
  CDL_ACCESS_GRANT_NAME: 'Access Grant Name',
  CDL_ACCESS_GRANT_DESC: 'Access Grant Description',
  CDL_ACCESS_GRANT_STATUS: 'Status',
  CDL_ACCESS_GRANT_ACTION: 'Action',
  
  // Panel Labels
  CDL_EDIT_GROUP: 'Edit Group',
  CDL_GROUP_VIEW_ONLY: 'View Group',
  CDL_ADD_NEW_GROUP: 'Add New Group',
  CDL_VIEW_ONLY: 'View Only',
  CDL_GROUP_NAME_HELPER: 'Group name is required',
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
export const getGroupManagementLabel = (configId: string): string => {
  return (GROUP_MANAGEMENT_LABELS as Record<string, string>)[configId] || configId
}

// Helper function to get multiple labels
export const getGroupManagementLabels = (configIds: string[]): Record<string, string> => {
  const labels: Record<string, string> = {}
  configIds.forEach(configId => {
    labels[configId] = getGroupManagementLabel(configId)
  })
  return labels
}
