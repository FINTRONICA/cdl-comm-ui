
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

export interface AccountData {
  // Step 1: Account Details
  id?: number;
  accountNumber: string;
  productCode: string;
  accountDisplayName: string;
  ibanNumber: string;
  officialAccountTitle: string;
  virtualAccountNumber?: string;
  accountTypeCode: string;
  assignmentStatus: string;
  assignedToReference?: string;
  accountOpenDateTime: string;
  referenceField1?: string;
  referenceField2?: string;
  active?: boolean;
  taxPaymentDTO?: { id: number } | number | null | undefined;
  currencyDTO?: { id: number } | number | null | undefined;
  accountPurposeDTO?: { id: number } | number | null | undefined;
  accountCategoryDTO?: { id: number } | number | null | undefined;
  primaryAccountDTO?: { id: number } | number | null | undefined;
  bulkUploadProcessingDTO?: { id: number } | number | null | undefined;
  unitaryPaymentDTO?: { id: number } | number | null | undefined;
  accountTypeDTO?: { id: number } | number | null | undefined;
  accountTypeCategoryDTO?: { id: number } | number | null | undefined;
  escrowAgreementDTO?: { id: number } | number | null | undefined;
  enabled?: boolean;
  deleted?: boolean;
  documents: DocumentItem[]
}
