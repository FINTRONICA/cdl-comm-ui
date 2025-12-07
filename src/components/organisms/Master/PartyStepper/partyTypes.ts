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

// API response interface for documents
export interface ApiDocumentResponse {
  id: number
  rea: string | null
  documentName: string
  content: string | null
  location: string
  module: string
  recordId: number | string
  storageType: string
  uploadDate: string
  documentSize: string
  validityDate: string | null
  version: number
  eventDetail: string | null
  documentType?: {
    id: number
    settingKey: string
    settingValue: string
    remarks: string | null
    enabled: boolean
    deleted: boolean | null
  } | null
  documentTypeDTO?: {
    id: number
    settingKey: string
    settingValue: string
    languageTranslationId: {
      id: number
      configId: string
      configValue: string
      content: string | null
      status: string | null
      enabled: boolean
      deleted: boolean | null
    } | null
    remarks: string | null
    status: string | null
    enabled: boolean
    deleted: boolean | null
  } | null
  enabled: boolean
  deleted: boolean | null
}

// Paginated response for document list
export interface PaginatedDocumentResponse {
  content: ApiDocumentResponse[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}



export interface PartyData {
  id: number
  partyCifNumber: string | null,
  partyFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string,
  mobileNumber: string | null,
  emailAddress: string | null,
  bankIdentifier: string,
  passportIdentificationDetails: string | null,
  backupProjectAccountOwnerName: string | null,
  projectAccountOwnerName: string | null,
  assistantRelationshipManagerName: string | null,
  teamLeaderName: string | null,
  additionalRemarks: string | null,
  relationshipManagerName: string | null,
  partyConstituentDTO: unknown | null,
  roleDTO: unknown | null,
  taskStatusDTO: unknown | null,
  partyStatusDate: Dayjs | null,
  active: boolean | null,
  enabled: boolean | null,
  deleted: boolean | null
}

export interface AuthorizedSignatoryData {
  id: number
  customerCifNumber: string | null,
  signatoryFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string | null,
  mobileNumber: string | null,
  emailAddress: string | null,
  notificationContactName: string | null,
  signatoryCifNumber: string | null,
  notificationEmailAddress: string | null,
  notificationSignatureFile: string | null,
  notificationSignatureMimeType: string | null,
  active: boolean | null,
  cifExistsDTO: unknown | null,
  partyDTO: unknown | null,
  notificationSignatureDTO: unknown | null,
  authorizedSignatoryStatusDate: Dayjs | null,
  enabled: boolean | null,
  deleted: boolean | null
}




export interface PartyDetailsData {
  partyCifNumber: string | null,
  partyFullName: string | null,
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  telephoneNumber: string,
  mobileNumber: string | null,
  emailAddress: string | null,
  bankIdentifier: string,
  passportIdentificationDetails: string | null,
  backupProjectAccountOwnerName: string | null,
  projectAccountOwnerName: string | null,
  assistantRelationshipManagerName: string | null,
  teamLeaderName: string | null,
  additionalRemarks: string | null,
  relationshipManagerName: string | null,
  active: boolean | null,
  partyConstituentDTO: {
    id: number
  } | null,
  roleDTO: {
    id: number
  } | null,
  taskStatusDTO: {
    id: number
  } | null
}


export interface PartyDataStepsData extends PartyDetailsData {
  // Step 1: Party Details
  id: string
  partyCifNumber: string,
  partyFullName: string,
  addressLine1: string,
  addressLine2: string,
  addressLine3: string,
  telephoneNumber: string,
  mobileNumber: string,
  emailAddress: string,
  bankIdentifier: string,
  passportIdentificationDetails: string,
  backupProjectAccountOwnerName: string,
  projectAccountOwnerName: string,
  assistantRelationshipManagerName: string,
  teamLeaderName: string,
  additionalRemarks: string,
  relationshipManagerName: string,
  active: boolean,
  partyConstituentDTO: {
    id: number
  } | null
  roleDTO: {
    id: number
  } | null
  taskStatusDTO: {
    id: number
  } | null

  // Step 2: Documents (Optional)
  documents: DocumentItem[]

  // Step 3: Authorized Signatory Details
  authorizedSignatoryData: AuthorizedSignatoryData[]

}
