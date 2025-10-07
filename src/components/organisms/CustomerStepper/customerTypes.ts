import { Dayjs } from 'dayjs'

export interface DocumentItem {
  id: string
  name: string
  size: number
  type: string
  uploadDate: Date
  status: 'uploading' | 'completed' | 'error' | 'failed'
  progress?: number
  file?: File
  url?: string
  classification?: string
}

export interface PartySignatoryData {
  id?: string
  cifExist: boolean
  partyCif: string
  personName: string
  personAddress1: string
  personAddress2: string
  personAddress3: string
  telephoneNo: string
  mobileNo: string
  emailId: string
  cifOfPerson: string
  noticePerson: string
  noticePersonEmailId: string
  noticePersonSignature: string
}

export interface CustomerData {
  // Step 1: Customer Details
  customerId: string
  cifExist: boolean
  partyCif: string
  personName: string
  partyName: string
  personAddress1: string
  personAddress2: string
  personAddress3: string
  telephoneNo: string
  mobileNo: string
  emailId: string
  cifOfPerson: string
  noticePerson: string
  noticePersonEmailId: string
  noticePersonSignature: string
  cif: string
  customerName: string
  address1: string
  address2: string
  address3: string
  telephone: string
  mobile: string
  email: string
  emiratesId: string
  passportDetails: string
  partyConstituent: string
  role: string
  rmName: string
  backupProjectAccountOwner: string
  projectAccountOwner: string
  armName: string
  teamLeader: string
  remarks: string

  // Step 2: Party Signatory (array of signatories)
  partySignatories: PartySignatoryData[]

  // Step 3: Documents
  documents: DocumentItem[]

  // Step 4: Review (no additional fields needed)
}

export interface CustomerFormData extends CustomerData {
  // Additional form-specific fields if needed
}
