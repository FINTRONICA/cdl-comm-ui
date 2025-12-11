export const PARTY_LABELS = {
  // Party Details
  'CDL_PARTY_DETAILS': 'Party Details',
  'CDL_MP_PARTY_CIF_NUMBER': 'Party cif ',
  'CDL_MP_PARTY_ID': ' ID',
  'CDL_MP_PARTY_NAME': ' Name',
  'CDL_MP_PARTY_ADDRESS_1': ' Address 1',
  'CDL_MP_PARTY_ADDRESS_2': ' Address 2',
  'CDL_MP_PARTY_ADDRESS_3': ' Address 3',
  'CDL_MP_PARTY_TELEPHONE_NO': 'Telephone No',
  'CDL_MP_PARTY_MOBILE_NO': 'Mobile No',
  'CDL_MP_PARTY_EMAIL': 'Email',
  'CDL_MP_PARTY_BANK_IDENTIFIER': 'Bank identifier',
  'CDL_MP_PARTY_PASSPORT_IDENTIFICATION_DETAILS': 'Passport identification details',
  'CDL_MP_PARTY_PROJECT_ACCOUNT_OWNER_NAME':'Project Account owner ame',
  'CDL_MP_PARTY_ARM_NAME':'Assistant relationship manager name',
  'CDL_MP_PARTY_TEAM_LEADER_NAME':'Team leader name',
  'CDL_MP_PARTY_REMARKS':'Remarks',
  'CDL_MP_PARTY_RM_NAME':'Relationship manager name',
  'CDL_MP_PARTY_BACKUP_PROJECT_ACCOUNT_OWNER_NAME': 'Backup project account owner name',
  'CDL_MP_PARTY_CONSTITUENT_DTO':'Constituent ',
  'CDL_MP_PARTY_ROLE_DTO':'Role ',
  'CDL_MP_PARTY_TASK_STATUS_DTO':'Task status ',
  



  // AuthorizedSignatory Signatory
  'CDL_AUTHORIZED_SIGNATORY_DETAILS': 'Authorized Signatory Details',
  'CDL_MP_AUTHORIZED_SIGNATORY_CUSTOMER_CIF_NUMBER': ' Authorized signatory cif',
  'CDL_MP_AUTHORIZED_SIGNATORY_NAME': 'Name',
  'CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_1': ' Address 1',
  'CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_2': ' Address 2',
  'CDL_MP_AUTHORIZED_SIGNATORY_ADDRESS_3': ' Address 3',
  'CDL_MP_AUTHORIZED_SIGNATORY_TELEPHONE_NO': ' Telephone No',
  'CDL_MP_AUTHORIZED_SIGNATORY_MOBILE_NO': ' Mobile No',
  'CDL_MP_AUTHORIZED_SIGNATORY_EMAIL_ID': ' Email ID',
  'CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_CONTACT_NAME': 'Notification Contact Name',
  'CDL_MP_AUTHORIZED_SIGNATORY_CIF_NUMBER':' Cif Number',
  'CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_EMAIL':'Notification Email Address',
  'CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_SIGNATURE_FILE':'Notification Signature File',
  'CDL_MP_AUTHORIZED_SIGNATORY_NOTIFICATION_SIGNATURE_MIME_TYPE':'Notification SignatureMime Type',
  'CDL_MP_AUTHORIZED_SIGNATORY_ACTIVE':'active',
  'CDL_MP_AUTHORIZED_SIGNATORY_CIF_EXISTS_DTO':'Cif Exists DTO',
  'CDL_MP_AUTHORIZED_SIGNATORY_PARTY_DTO':'Party DTO',
  'CDL_MP_AUTHORIZED_SIGNATORY_REMARKS':'remarks',
  'CDL_MP_AUTHORIZED_SIGNATORY_STATUS':'status',
  'CDL_MP_AUTHORIZED_SIGNATORY_ENABLED':'enabled',
  'CDL_MP_AUTHORIZED_SIGNATORY_DELETED':'deleted',
  'CDL_MP_AUTHORIZED_SIGNATORY_ACTIONS':'Actions',
  'CDL_MP_AUTHORIZED_SIGNATORY_PARTY_SELECT': 'Party',


   // Common UI labels
   'CDL_COMMON_ACTION': 'Action',
   'CDL_COMMON_STATUS': 'Status',
   'CDL_COMMON_ACTIONS': 'Actions',
   'CDL_COMMON_RETRY': 'Retry',
   'CDL_COMMON_CANCEL': 'Cancel',
   'CDL_COMMON_ADD': 'Add',
   'CDL_COMMON_UPDATE': 'Update',
   'CDL_COMMON_ADDING': 'Adding...',
   'CDL_COMMON_UPDATING': 'Updating...',
   'CDL_COMMON_LOADING': 'Loading...',
   'CDL_COMMON_VALIDATE_ACCOUNT': 'Validate Account',
   'CDL_COMMON_VALIDATE_BIC': 'Validate BIC',
   'CDL_COMMON_REQUIRED_FIELDS_PREFIX': 'Please fill in the required fields:',
   'CDL_COMMON_DROPDOWNS_LOAD_FAILED': 'Failed to load dropdown options. Please refresh the page.',
   'CDL_COMMON_SUBMIT_WAIT': 'Please wait for dropdown options to load before submitting.',
   'Documents (Optional)': 'CDL_DOCUMENT',  //stepper label

}
export const getPartyLabel = (configId) => {
return PARTY_LABELS[configId] || configId
}

// Export the full mapping object for direct access
export default PARTY_LABELS



