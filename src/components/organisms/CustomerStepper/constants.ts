import dayjs from 'dayjs'
import { CUSTOMER_FIELD_CONFIG, PARTY_SIGNATORY_LABELS } from '../../../constants/mappings/customerMapping'
import { CustomerData } from './customerTypes'

// Customer-specific step labels
export const STEP_LABELS = [
  'Customer',
  'Party Signatory', 
  'Document',
  'Review',
] as const


export const DEFAULT_FORM_VALUES: CustomerData = {
  // Step 1: Customer Details
  customerId: '',
  cifExist: false,
  partyCif: '',
  personName: '',
  partyName: '',
  personAddress1: '',
  personAddress2: '',
  personAddress3: '',
  telephoneNo: '',
  mobileNo: '',
  emailId: '',
  cifOfPerson: '',
  noticePerson: '',
  noticePersonEmailId: '',
  noticePersonSignature: '',
  cif: '',
  customerName: '',
  address1: '',
  address2: '',
  address3: '',
  telephone: '',
  mobile: '',
  email: '',
  emiratesId: '',
  passportDetails: '',
  partyConstituent: '',
  role: '',
  rmName: '',
  backupProjectAccountOwner: '',
  projectAccountOwner: '',
  armName: '',
  teamLeader: '',
  remarks: '',

  // Step 2: Party Signatory
  partySignatories: [{
    cifExist: false,
    partyCif: '',
    personName: '',
    personAddress1: '',
    personAddress2: '',
    personAddress3: '',
    telephoneNo: '',
    mobileNo: '',
    emailId: '',
    cifOfPerson: '',
    noticePerson: '',
    noticePersonEmailId: '',
    noticePersonSignature: '',
  }],

  // Step 3: Documents
  documents: [],
}


export const DATE_FIELDS = [
  // Add date fields if needed for customer
] as const

export const BOOLEAN_FIELDS = [
  'cifExist',
  // Add other boolean fields if needed
] as const

export const SKIP_VALIDATION_STEPS = [1, 2] as const // Skip validation for Document step

// Steps that reset form when customerId changes
export const RESET_FORM_STEPS = [1, 2] as const

// Dropdown options for customer fields
export const DROPDOWN_OPTIONS = {
  cifExist: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ],
  partyConstituent: [
    { value: 'individual', label: 'Individual' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'trust', label: 'Trust' }
  ],
  role: [
    { value: 'buyer', label: 'Buyer' },
    { value: 'seller', label: 'Seller' },
    { value: 'agent', label: 'Agent' },
    { value: 'broker', label: 'Broker' },
    { value: 'developer', label: 'Developer' },
    { value: 'investor', label: 'Investor' }
  ]
}
