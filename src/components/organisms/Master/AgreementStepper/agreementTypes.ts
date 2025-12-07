
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
    id: number;
    primaryEscrowCifNumber: string;
    productManagerName: string;
    clientName: string;
    relationshipManagerName: string;
    operatingLocationCode: string;
    customField1: string;
    customField2: string;
    customField3: string;
    customField4: string;
    active: boolean;
    agreementParametersDTO: unknown | null;
    agreementFeeDTO: unknown | null;
    clientNameDTO: unknown | null;
    businessSegmentDTO: unknown | null;
    businessSubSegmentDTO: unknown | null;
    dealStatusDTO: unknown | null;
    feesDTO: unknown | null;
    dealTypeDTO: unknown | null;
    dealSubTypeDTO: unknown | null;
    productProgramDTO: unknown | null;
    dealPriorityDTO: unknown | null;
    taskStatusDTO: unknown | null;
    enabled: boolean;
    deleted: boolean;
    uuid: string;
}






export interface AgreementData  {
  // Step 1: Build Partner Details
  id: number;
  primaryEscrowCifNumber: string;
  productManagerName: string;
  clientName: string;
  relationshipManagerName: string;
  operatingLocationCode: string;
  customField1: string;
  customField2: string;
  customField3: string;
  customField4: string;
  active: boolean;
  agreementParametersDTO: {
    id: number
  };
  agreementFeeDTO: {
    id: number
  };
  clientNameDTO: {
    id: number
  };
  businessSegmentDTO: {
    id: number
  };
  businessSubSegmentDTO: {
    id: number
  };
  dealStatusDTO: {
    id: number
  };
  feesDTO: {
    id: number
  };
  dealTypeDTO: {
    id: number
  };
  dealSubTypeDTO: {
    id: number
  };
  productProgramDTO: {
    id: number
  };
  dealPriorityDTO: {
    id: number
  };
  taskStatusDTO: unknown | null;
  enabled: boolean;
  deleted: boolean;
  uuid: string;
  

  // Step 2: Documents (Optional)
  documents: DocumentItem[]

 


}
