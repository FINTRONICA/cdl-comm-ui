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

export interface BuildPartnerData {
  id: number
  bpDeveloperId: string
  bpCifrera: string | null
  bpDeveloperRegNo: string
  bpName: string | null
  bpMasterName: string | null
  bpNameLocal: string | null
  bpOnboardingDate: string | null
  bpContactAddress: string | null
  bpContactTel: string | null
  bpPoBox: string | null
  bpMobile: string | null
  bpFax: string | null
  bpEmail: string | null
  bpLicenseNo: string | null
  bpLicenseExpDate: string | null
  bpWorldCheckFlag: boolean | null
  bpWorldCheckRemarks: string | null
  bpMigratedData: boolean | null
  bpremark: string | null
  bpRegulatorDTO: unknown | null
  bpActiveStatusDTO: unknown | null
}

export interface ProjectDetailsData {
  sectionId: string
  developerId: string
  developerName: string
  masterDeveloperName: string
  projectName: string
  projectLocation: string
  projectAccountCif: string
  projectStatus: string
  projectAccountStatusDate: Dayjs | null
  projectRegistrationDate: Dayjs | null
  projectStartDate: Dayjs | null
  projectCompletionDate: Dayjs | null
  retention: string
  additionalRetention: string
  totalRetention: string
  retentionEffectiveStartDate: Dayjs | null
  projectManagementExpenses: string
  marketingExpenses: string
  realEstateBrokerExpense: string
  advertisingExpense: string
  landOwnerName: string
  projectCompletionPercentage: string
  currency: string
  actualConstructionCost: string
  noOfUnits: string
  remarks: string
  specialApproval: string
  paymentType: string
  managedBy: string
  backupRef: string
  relationshipManager: string
  assistantRelationshipManager: string
  teamLeaderName: string
}

export interface AccountData {
  trustAccountNumber: string
  ibanNumber: string
  dateOpened: Dayjs | null
  accountTitle: string
  currency: string
}

export interface ContactData extends Record<string, unknown> {
  name: string
  address: string
  email: string
  pobox: string
  countrycode: string
  mobileno: string
  telephoneno: string
  fax: string
  buildPartnerDTO?: {
    id: number
  }
}

export interface FeeData extends Record<string, unknown> {
  feeType: string
  frequency: string
  debitAmount: string
  feeToBeCollected: string
  nextRecoveryDate: Dayjs | null
  feePercentage: string
  amount: string
  vatPercentage: string
  buildPartnerDTO?: {
    id: number
  }
}

export interface BeneficiaryData extends Record<string, unknown> {
  id: string
  transferType: string
  name: string
  bankName: string
  swiftCode: string
  routingCode: string
  account: string
  buildPartnerDTO?: {
    id: number
  }
}

export interface PaymentPlanData {
  installmentNumber: number
  installmentPercentage: string
  projectCompletionPercentage: string
}

export interface FinancialData {
  projectEstimatedCost: string
  actualCost: string
  projectBudget: string
}

export interface ProjectData extends ProjectDetailsData {
  // Step 1: Build Partner Details
  bpDeveloperId: string
  bpCifrera: string
  bpDeveloperRegNo: string
  bpName: string
  bpMasterName: string
  bpNameLocal: string
  bpOnboardingDate: Dayjs | null
  bpContactAddress: string
  bpContactTel: string
  bpPoBox: string
  bpMobile: string
  bpFax: string
  bpEmail: string
  bpLicenseNo: string
  bpLicenseExpDate: Dayjs | null
  bpWorldCheckFlag: boolean
  bpWorldCheckRemarks: string
  bpMigratedData: boolean
  bpremark: string
  bpRegulatorDTO: {
    id: number
  }

  // Step 2: Documents (Optional)
  documents: DocumentItem[]

  // Step 3: Account Details
  contactData: ContactData[]
  accounts: AccountData[]

  // Step 4: Fee Details
  fees: FeeData[]

  // Step 5: Beneficiary Details
  beneficiaries: BeneficiaryData[]

  // Step 6: Payment Plan
  paymentPlan: PaymentPlanData[]

  // Step 7: Financial (extensive financial data)
  financialData: FinancialData
}
