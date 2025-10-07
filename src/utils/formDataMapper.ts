import { FundEgressRequest } from '@/services/api/fundEgressService';
import { PaymentExpenseType, PaymentExpenseSubType, Currency, DepositMode, PaymentMode, TransferType, BuildAssetAccountStatus } from '@/services/api/applicationSettingService';
import { RealEstateAsset } from '@/services/api/realEstateAssetService';

// Form data interface (based on our current form fields)
export interface FormData {
  // Basic fields
  tasReference?: string
  developerName?: string
  developerId?: string
  projectName?: string
  projectId?: string
  projectStatus?: string
  
  // Account balances
  escrowAccount?: string
  corporateAccount?: string
  corporateAccount1?: string
  corporateAccount2?: string
  
  // Balance fields (right side data from account balance fields)
  subConstructionAccount?: string  // Escrow balance
  retentionAccount?: string        // Sub Construction balance
  retentionAccount1?: string       // Corporate balance
  retentionAccount2?: string       // Retention balance
  
  // Payment type fields
  paymentType?: string
  paymentSubType?: string
  paymentType1?: string // Regular Approval Ref No
  paymentSubType1?: string // Regular Approval Date
  
  // Invoice fields
  invoiceRef?: string
  invoiceCurrency?: string
  invoiceValue?: string
  invoiceDate?: string
  
  // Amount fields
  engineerApprovedAmount?: string
  totalEligibleAmount?: string
  amountPaid?: string
  amountPaid1?: string // Cap Exceeded
  totalAmountPaid?: string
  totalAmountPaid1?: string // Payment Currency
  debitCreditToEscrow?: string
  currentEligibleAmount?: string
  debitFromRetention?: string
  totalPayoutAmount?: string
  amountInTransit?: string
  vatCapExceeded?: string
  vatCapExceeded1?: string // Invoice Ref no
  vatCapExceeded2?: string // Payment Sub Type
  vatCapExceeded3?: string // Indicative Rate
  vatCapExceeded4?: string // Corporate Certification Engineer's Fees
  
  // Checkbox fields
  specialRate?: boolean
  corporateAmount?: boolean
  Forfeit?: boolean
  Refundtounitholder?: boolean
  Transfertootherunit?: boolean
  EngineerFeePaymentNeeded?: boolean
  'reviewNote*'?: boolean
  
  // Other fields
  delRefNo?: string
  ppcNo?: string
  narration1?: string
  narration2?: string
  remarks?: string
  unitNo?: string
  towerName?: string
  unitStatus?: string
  amountReceived?: string
  forfeitAmount?: string
  regulatorApprovalRef?: string
  paymentDate?: string
  bankCharges?: string
  paymentMode?: string
  engineerFeePayment?: string
  uploadDocuments?: string // Amount to be Released
  engineerFeePayment1?: string // Payment Date
  uploadDocuments1?: string // VAT Payment Amount
  EngineerFeesPayment?: string
  engineerFeePayment2?: string // Bank Charges
  uploadDocuments2?: string // Payment to be made from CBS
}

// Helper function to create a default DTO
function createDefaultDTO(id: number = 0) {
  return {
    id,
    settingKey: '',
    settingValue: '',
    languageTranslationId: {
      id: 0,
      configId: '',
      configValue: '',
      content: null,
      status: null,
      enabled: true,
      deleted: false
    },
    remarks: null,
    status: null,
    enabled: true,
    deleted: false
  };
}

// Helper function to find real estate asset by name
function findRealEstateAssetByName(assets: RealEstateAsset[], name: string): RealEstateAsset | undefined {
  return assets.find(asset => asset.reaName === name);
}

// Helper function to find build partner by name
function findBuildPartnerByName(partners: any[], name: string): any | undefined {
  return partners.find(partner => partner.bpName === name);
}

/**
 * Map form data to FundEgressRequest
 * @param formData - Form data from the form
 * @param options - Additional data needed for mapping (dropdowns, assets, partners)
 * @returns FundEgressRequest object
 */
export function mapFormDataToFundEgress(
  formData: FormData,
  options: {
    paymentTypes: PaymentExpenseType[]
    paymentSubTypes: PaymentExpenseSubType[]
    currencies: Currency[]
    depositModes: DepositMode[]
    paymentModes: PaymentMode[]
    transferTypes: TransferType[]
    buildAssetAccountStatuses: BuildAssetAccountStatus[]
    realEstateAssets: RealEstateAsset[]
    buildPartners: any[]
  }
): FundEgressRequest {
  const {
    paymentTypes,
    paymentSubTypes,
    currencies,
    depositModes,
    paymentModes,
    transferTypes,
    buildAssetAccountStatuses,
    realEstateAssets,
    buildPartners
  } = options;

  // Find selected real estate asset - projectName now contains the project ID
  const selectedAsset = formData.projectName ? realEstateAssets.find(asset => asset.id === parseInt(formData.projectName)) : undefined;
  
  // Find selected build partner
  const selectedPartner = formData.developerName ? findBuildPartnerByName(buildPartners, formData.developerName) : undefined;

  const request: FundEgressRequest = {
    // Core required fields
    fePaymentDate: formData.paymentDate || new Date().toISOString(),
    fePaymentAmount: parseFloat(formData.totalAmountPaid || '0'),
    feIsManualPayment: true,
    feIsTasPayment: false,
    status: 'INITIATED',
    enabled: true,

    // Basic fields - pass null for missing fields
    fePaymentRefNumber: formData.tasReference || null,
    feInvoiceRefNo: formData.invoiceRef || null,
    feInvoiceValue: parseFloat(formData.invoiceValue || '0'),
    feInvoiceDate: formData.invoiceDate || null,
    feRemark: formData.remarks || null,
    feNarration1: formData.narration1 || null,
    feNarration2: formData.narration2 || null,

    // Amount fields - pass null for missing fields
    feEngineerApprovedAmt: parseFloat(formData.engineerApprovedAmount || '0'),
    feTotalEligibleAmtInv: parseFloat(formData.totalEligibleAmount || '0'),
    feAmtPaidAgainstInv: parseFloat(formData.amountPaid || '0'),
    feCapExcedded: formData.amountPaid1 || null,
    feTotalAmountPaid: parseFloat(formData.totalAmountPaid || '0'),
    feDebitFromEscrow: parseFloat(formData.debitCreditToEscrow || '0'),
    feCurEligibleAmt: parseFloat(formData.currentEligibleAmount || '0'),
    feDebitFromRetention: parseFloat(formData.debitFromRetention || '0'),
    feTotalPayoutAmt: parseFloat(formData.totalPayoutAmount || '0'),
    feAmountInTransit: parseFloat(formData.amountInTransit || '0'),
    feVarCapExcedded: formData.vatCapExceeded || null,
    feIndicativeRate: parseFloat(formData.vatCapExceeded3 || '0'),
    feCorpCertEngFee: formData.vatCapExceeded4 || null,

    // Unit holder fields - pass null for missing fields
    feAmtRecdFromUnitHolder: parseFloat(formData.amountReceived || '0'),
    feForFeit: formData.Forfeit || false,
    feForFeitAmt: parseFloat(formData.forfeitAmount || '0'),
    feRefundToUnitHolder: formData.Refundtounitholder || false,
    feTransferToOtherUnit: formData.Transfertootherunit || false,
    feUnitReraApprovedRefNo: formData.regulatorApprovalRef || null,
    feUnitTransferAppDate: formData.paymentDate || null,

    // Payment fields - pass null for missing fields
    feAmountToBeReleased: parseFloat(formData.uploadDocuments || '0'),
    feBeneDateOfPayment: formData.engineerFeePayment1 || null,
    feBeneVatPaymentAmt: parseFloat(formData.uploadDocuments1 || '0'),
    feIsEngineerFee: formData.EngineerFeePaymentNeeded || false,
    feCorporatePaymentEngFee: parseFloat(formData.EngineerFeesPayment || '0'),
    fbbankCharges: parseFloat(formData.engineerFeePayment2 || '0'),

    // Account balances - using the balance fields (right side data) instead of account numbers
    feCurBalInEscrowAcc: parseFloat(formData.subConstructionAccount || '0'),
    feCorporateAccBalance: parseFloat(formData.retentionAccount1 || '0'),
    feSubConsAccBalance: parseFloat(formData.retentionAccount || '0'),
    feCurBalInRetentionAcc: parseFloat(formData.retentionAccount2 || '0'),

    // Special fields - pass null for missing fields
    feSpecialRate: formData.specialRate || false,
    feCorporatePayment: formData.corporateAmount || false,
    feDealRefNo: formData.delRefNo || null,
    fePpcNumber: formData.ppcNo || null,

    // Additional required fields that might be missing
    feInvoiceNumber: formData.invoiceRef || null,
    feGlAccountNumber: null,
    feGlBranchCode: null,
    feUnitRegistrationFee: null,
    feResponseObject: null,
    feSplitPayment: false,
    feRtZeroThree: null,
    feEngineerRefNo: null,
    feEngineerApprovalDate: null,
    feReraApprovedRefNo: null,
    feReraApprovedDate: null,
    feUniqueRefNo: null,
    fePaymentResponseObj: null,
    fePaymentStatus: 'PENDING',
    feResPaymentRefNo: null,
    feResUniqueRefNo: null,
    feResHeader: null,
    feSpecialField1: null,
    feSpecialField2: null,
    feSpecialField3: null,
    feSpecialField4: null,
    feSpecialField5: null,
    feSpecialField6: null,
    feTasPaymentStatus: null,
    feSpecialField7: null,
    feEngineerFeePayment: null,
    feErrorResponseObject: null,
    fePropertyRegistrationFee: null,
    feBalanceAmount: null,
    feDocVerified: false,
    fePaymentBodyObj: null,
    feTreasuryRate: null,
    feBenefFromProject: false,
    feIncludeInPayout: false,
    feTasPaymentSuccess: false,
    fetasPaymentRerun: false,
    feDiscardPayment: false,
    feBeneficiaryToMaster: false,
    feRefundAmount: null,
    feTransferAmount: null,

    // DTOs - Send only the id field for dropdown selections, pass null if not found or arrays are empty
    expenseTypeDTO: formData.paymentType ? { id: parseInt(formData.paymentType) } : null,
    expenseSubTypeDTO: formData.paymentSubType ? { id: parseInt(formData.paymentSubType) } : null,
    invoiceCurrencyDTO: formData.invoiceCurrency ? { id: parseInt(formData.invoiceCurrency) } : null,
    paymentCurrencyDTO: formData.totalAmountPaid1 ? { id: parseInt(formData.totalAmountPaid1) } : null,
    chargedCodeDTO: formData.bankCharges ? { id: parseInt(formData.bankCharges) } : null,
    paymentModeDTO: formData.paymentMode ? { id: parseInt(formData.paymentMode) } : null,
    transactionTypeDTO: formData.engineerFeePayment ? { id: parseInt(formData.engineerFeePayment) } : null,

    // Real estate asset - pass null if not found
    realEstateAssestDTO: selectedAsset ? { id: selectedAsset.id } : null,

    // Build partner - pass null if not found
    buildPartnerDTO: selectedPartner ? { id: selectedPartner.id } : null,

    // Capital partner unit - pass null if not found
    capitalPartnerUnitDTO: formData.unitNo ? {
      id: 0,
      unitRefId: formData.unitNo,
      altUnitRefId: null,
      name: formData.unitNo,
      isResale: false,
      resaleDate: null,
      unitSysId: null,
      otherFormatUnitNo: null,
      virtualAccNo: null,
      towerName: formData.towerName || null,
      unitPlotSize: null,
      floor: null,
      noofBedroom: null,
      isModified: false,
      partnerUnitDTO: null,
      capitalPartnerUnitTypeDTO: null,
      realEstateAssestDTO: selectedAsset!,
      unitStatusDTO: formData.unitStatus ? {
        id: 0,
        settingKey: 'UNIT_STATUS',
        settingValue: formData.unitStatus,
        languageTranslationId: {
          id: 0,
          configId: `CDL_UNIT_STATUS_${formData.unitStatus}`,
          configValue: formData.unitStatus,
          content: null,
          status: null,
          enabled: true,
          deleted: false
        },
        remarks: null,
        status: null,
        enabled: true,
        deleted: false
      } : null,
      deleted: false
    } : null,

    // Additional DTOs that might be required
    paymentStatusOptionDTO: null,
    voucherPaymentTypeDTO: null,
    voucherPaymentSubTypeDTO: null,
    beneficiaryFeePaymentDTO: null,
    payoutToBeMadeFromCbsDTO: null,
    transferCapitalPartnerUnitDTO: null,
    realEstateAssestBeneficiaryDTO: null,
    suretyBondDTO: null,
    taskStatusDTO: null,
    deleted: false
  };

  // Log the request for debugging
  console.log('🔍 FormDataMapper: Generated API payload:', {
    requestKeys: Object.keys(request),
    requestSize: JSON.stringify(request).length,
    hasRequiredFields: {
      fePaymentDate: !!request.fePaymentDate,
      fePaymentAmount: !!request.fePaymentAmount,
      feIsManualPayment: request.feIsManualPayment,
      status: !!request.status,
      enabled: request.enabled
    },
    dtoFields: {
      expenseTypeDTO: !!request.expenseTypeDTO,
      expenseSubTypeDTO: !!request.expenseSubTypeDTO,
      invoiceCurrencyDTO: !!request.invoiceCurrencyDTO,
      paymentCurrencyDTO: !!request.paymentCurrencyDTO,
      chargedCodeDTO: !!request.chargedCodeDTO,
      paymentModeDTO: !!request.paymentModeDTO,
      transactionTypeDTO: !!request.transactionTypeDTO,
      realEstateAssestDTO: !!request.realEstateAssestDTO,
      buildPartnerDTO: !!request.buildPartnerDTO,
      capitalPartnerUnitDTO: !!request.capitalPartnerUnitDTO
    }
  });

  return request;
}

/**
 * Simplified mapper that only includes the fields from your JSON format
 * Sends strings instead of parsing to float
 */
export function mapFormDataToFundEgressSimplified(
  formData: FormData,
  options: {
    paymentTypes: PaymentExpenseType[]
    paymentSubTypes: PaymentExpenseSubType[]
    currencies: Currency[]
    depositModes: DepositMode[]
    paymentModes: PaymentMode[]
    transferTypes: TransferType[]
    realEstateAssets: RealEstateAsset[]
    buildPartners: any[]
  }
): FundEgressRequest {
  const {
    paymentTypes,
    paymentSubTypes,
    currencies,
    depositModes,
    paymentModes,
    transferTypes,
    realEstateAssets,
    buildPartners
  } = options;

  // Find selected real estate asset - projectName now contains the project ID
  const selectedAsset = formData.projectName ? realEstateAssets.find(asset => asset.id === parseInt(formData.projectName)) : undefined;
  
  // Find selected build partner
  const selectedPartner = formData.developerName ? buildPartners.find(partner => partner.bpName === formData.developerName) : undefined;

  const request: FundEgressRequest = {
    // Core required fields
    fePaymentDate: formData.paymentDate || new Date().toISOString(),
    fePaymentAmount: formData.totalAmountPaid || '0',
    feIsManualPayment: true,
    feIsTasPayment: false,
    status: 'INITIATED',
    enabled: true,

    // Basic fields
    fePaymentRefNumber: formData.tasReference || null,
    feInvoiceRefNo: formData.invoiceRef || null,
    feInvoiceValue: formData.invoiceValue || '0',
    feInvoiceDate: formData.invoiceDate || null,
    feRemark: formData.remarks || null,
    feNarration1: formData.narration1 || null,
    feNarration2: formData.narration2 || null,

    // Amount fields - send as strings
    feEngineerApprovedAmt: formData.engineerApprovedAmount || '0',
    feTotalEligibleAmtInv: formData.totalEligibleAmount || '0',
    feAmtPaidAgainstInv: formData.amountPaid || '0',
    feTotalAmountPaid: formData.totalAmountPaid || '0',
    feDebitFromEscrow: formData.debitCreditToEscrow || '0',
    feCurEligibleAmt: formData.currentEligibleAmount || '0',
    feDebitFromRetention: formData.debitFromRetention || '0',
    feTotalPayoutAmt: formData.totalPayoutAmount || '0',
    feAmountInTransit: formData.amountInTransit || '0',
    feIndicativeRate: formData.vatCapExceeded3 || '0',

    // Unit holder fields
    feAmtRecdFromUnitHolder: formData.amountReceived || '0',
    feForFeit: formData.Forfeit || false,
    feForFeitAmt: formData.forfeitAmount || '0',
    feRefundToUnitHolder: formData.Refundtounitholder || false,
    feTransferToOtherUnit: formData.Transfertootherunit || false,
    feUnitTransferAppDate: formData.paymentDate || null,
    feUnitReraApprovedRefNo: formData.regulatorApprovalRef || null,
    fePaymentAmount: formData.totalAmountPaid || '0',

    // Payment fields
    feAmountToBeReleased: formData.uploadDocuments || '0',
    feBeneVatPaymentAmt: formData.uploadDocuments1 || '0',
    feIsEngineerFee: formData.EngineerFeePaymentNeeded || false,
    feCorporatePaymentEngFee: formData.EngineerFeesPayment || '0',
    fbbankCharges: formData.engineerFeePayment2 || '0',

    // Account balances - using the balance fields (right side data) instead of account numbers
    feCurBalInEscrowAcc: formData.subConstructionAccount || '0',
    feCorporateAccBalance: formData.retentionAccount1 || '0',
    feSubConsAccBalance: formData.retentionAccount || '0',
    feCurBalInRetentionAcc: formData.retentionAccount2 || '0',

    // Special fields
    feSpecialRate: formData.specialRate || false,
    feCorporatePayment: formData.corporateAmount || false,
    feDealRefNo: formData.delRefNo || null,
    fePpcNumber: formData.ppcNo || null,
    feCorpCertEngFee: formData.vatCapExceeded4 || '0',
    feSplitPayment: false,
    fePaymentStatus: 'PENDING',
    feDocVerified: false,
    feBenefFromProject: false,
    feIncludeInPayout: false,
    feTasPaymentSuccess: false,
    fetasPaymentRerun: false,
    feDiscardPayment: false,
    feBeneficiaryToMaster: false,

    // DTOs - Send only the id field, pass null if arrays are empty
    expenseTypeDTO: formData.paymentType ? { id: parseInt(formData.paymentType) } : null,
    expenseSubTypeDTO: formData.paymentSubType ? { id: parseInt(formData.paymentSubType) } : null,
    invoiceCurrencyDTO: formData.invoiceCurrency ? { id: parseInt(formData.invoiceCurrency) } : null,
    paymentCurrencyDTO: formData.totalAmountPaid1 ? { id: parseInt(formData.totalAmountPaid1) } : null,
    chargedCodeDTO: formData.bankCharges ? { id: parseInt(formData.bankCharges) } : null,
    paymentModeDTO: formData.paymentMode ? { id: parseInt(formData.paymentMode) } : null,
    transactionTypeDTO: formData.engineerFeePayment ? { id: parseInt(formData.engineerFeePayment) } : null,

    // Real estate asset - send only id
    realEstateAssestDTO: selectedAsset ? { id: selectedAsset.id } : null,

    // Build partner - send only id
    buildPartnerDTO: selectedPartner ? { id: selectedPartner.id } : null,

    // Capital partner unit - send only id
    capitalPartnerUnitDTO: formData.unitNo ? { id: 0 } : null,

    deleted: false
  };

  return request;
}