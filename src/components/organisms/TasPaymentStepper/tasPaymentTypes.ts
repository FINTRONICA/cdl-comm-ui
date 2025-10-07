export interface ProjectData {
  // Basic Information
  paymentRefNumber?: string
  paymentDate?: string
  buildPartnerId?: string
  realEstateAssetId?: string
  paymentType?: string
  paymentSubType?: string
  expenseType?: string
  paymentStatus?: string
  paymentCurrency?: string
  
  // Amount Details
  engineerApprovedAmt?: number
  totalEligibleAmtInv?: number
  amtPaidAgainstInv?: number
  capExceeded?: string
  totalAmountPaid?: number
  debitFromEscrow?: number
  curEligibleAmt?: number
  debitFromRetention?: number
  totalPayoutAmt?: number
  amountInTransit?: number
  varCapExceeded?: string
  invoiceRefNo?: string
  specialRate?: boolean
  corporatePayment?: boolean
  dealRefNo?: string
  ppcNumber?: string
  indicativeRate?: number
  
  // Dates and References
  invoiceDate?: string
  
  // Narration
  narration?: string
  remarks?: string
  
  // Documents
  documents?: DocumentItem[]
}

export interface DocumentItem {
  id: string
  name: string
  type: string
  size: number
  url?: string
  uploadedAt?: string
}
