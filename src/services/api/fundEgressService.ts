import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'

export interface LanguageTranslationId {
  id: number
  configId: string
  configValue: string
  content: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface StatusDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: LanguageTranslationId
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface BuildPartnerDTO {
  id: number
  bpDeveloperId: string
  bpCifrera: string
  bpDeveloperRegNo: string
  bpName: string
  bpMasterName: string
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
  bpWorldCheckFlag: string | null
  bpWorldCheckRemarks: string | null
  bpMigratedData: boolean | null
  bpremark: string | null
  bpRegulatorDTO: StatusDTO | null
  bpActiveStatusDTO: StatusDTO | null
  beneficiaryIds: number[]
  deleted: boolean | null
  taskStatusDTO: any | null
}

export interface RealEstateAssetDTO {
  id: number
  reaId: string
  reaCif: string
  reaName: string
  reaNameLocal: string | null
  reaLocation: string
  reaReraNumber: string
  reaStartDate: string | null
  reaCompletionDate: string | null
  reaPercentComplete: string | null
  reaConstructionCost: number
  reaAccStatusDate: string | null
  reaRegistrationDate: string | null
  reaNoOfUnits: number
  reaRemarks: string | null
  reaSpecialApproval: string | null
  reaManagedBy: string | null
  reaBackupUser: string | null
  reaRetentionPercent: string | null
  reaAdditionalRetentionPercent: string | null
  reaTotalRetentionPercent: string | null
  reaRetentionEffectiveDate: string | null
  reaManagementExpenses: string | null
  reaMarketingExpenses: string | null
  reaAccoutStatusDate: string | null
  reaTeamLeadName: string | null
  reaRelationshipManagerName: string | null
  reaAssestRelshipManagerName: string | null
  reaRealEstateBrokerExp: number
  reaAdvertisementExp: number
  reaLandOwnerName: string | null
  buildPartnerDTO: BuildPartnerDTO
  reaStatusDTO: StatusDTO
  reaTypeDTO: StatusDTO
  reaAccountStatusDTO: StatusDTO
  reaConstructionCostCurrencyDTO: StatusDTO
  status: string | null
  reaBlockPaymentTypeDTO: StatusDTO | null
  deleted: boolean | null
  taskStatusDTO: any | null
}

export interface CapitalPartnerUnitDTO {
  id: number
  unitRefId: string
  altUnitRefId: string | null
  name: string
  isResale: boolean
  resaleDate: string | null
  unitSysId: string | null
  otherFormatUnitNo: string | null
  virtualAccNo: string | null
  towerName: string | null
  unitPlotSize: string | null
  floor: string | null
  noofBedroom: string | null
  isModified: boolean
  partnerUnitDTO: string | null
  capitalPartnerUnitTypeDTO: any | null
  realEstateAssestDTO: RealEstateAssetDTO
  unitStatusDTO: StatusDTO
  propertyIdDTO: StatusDTO
  paymentPlanTypeDTO: StatusDTO
  capitalPartnerUnitBookingDTO: any | null
  childCapitalPartnerUnitDTO: string[] | null
  deleted: boolean | null
}

export interface FundEgressRequest {
  id?: number
  feInvoiceNumber?: string
  fePaymentDate: string
  fePaymentAmount: string | number
  feGlAccountNumber?: string
  feGlBranchCode?: string
  feUnitRegistrationFee?: string
  feRemark?: string
  feResponseObject?: Record<string, any>
  fePaymentRefNumber?: string
  feSplitPayment?: boolean
  feInvoiceDate?: string
  feRtZeroThree?: string
  feEngineerRefNo?: string
  feEngineerApprovalDate?: string
  feReraApprovedRefNo?: string
  feReraApprovedDate?: string
  feInvoiceRefNo?: string
  feEngineerApprovedAmt?: string | number
  feTotalEligibleAmtInv?: string | number
  feAmtPaidAgainstInv?: string | number
  feCapExcedded?: string
  feTotalAmountPaid?: string | number
  feDebitFromEscrow?: string | number
  feCurEligibleAmt?: string | number
  feDebitFromRetention?: string | number
  feTotalPayoutAmt?: string | number
  feAmountInTransit?: string | number
  feVarCapExcedded?: string
  feIndicativeRate?: string | number
  fePpcNumber?: string
  feCorporatePayment?: boolean
  feNarration1?: string
  feNarration2?: string
  feAmtRecdFromUnitHolder?: string | number
  feForFeit?: boolean
  feForFeitAmt?: string | number
  feRefundToUnitHolder?: boolean
  feRefundAmount?: string | number
  feTransferToOtherUnit?: boolean
  feTransferAmount?: string | number
  feUnitReraApprovedRefNo?: string
  feUnitTransferAppDate?: string
  feBeneficiaryToMaster?: boolean
  feAmountToBeReleased?: string | number
  feBeneDateOfPayment?: string
  feBeneVatPaymentAmt?: string | number
  feIncludeInPayout?: boolean
  feTasPaymentSuccess?: boolean
  fetasPaymentRerun?: boolean
  feDiscardPayment?: boolean
  feIsTasPayment?: boolean
  feIsManualPayment?: boolean
  feSpecialField1?: string
  feSpecialField2?: string
  feSpecialField3?: string
  feUniqueRefNo?: string
  fePaymentResponseObj?: Record<string, any>
  fePaymentStatus?: string
  feResPaymentRefNo?: string
  feResUniqueRefNo?: string
  feResHeader?: Record<string, any>
  feInvoiceValue?: string | number
  feSpecialField4?: string
  feSpecialField5?: string
  feSpecialField6?: string
  feTasPaymentStatus?: string
  feCorpCertEngFee?: string
  feSpecialField7?: string
  feCurBalInEscrowAcc?: string | number
  feCurBalInRetentionAcc?: string | number
  feEngineerFeePayment?: string
  feCorporateAccBalance?: string | number
  feSubConsAccBalance?: string | number
  feErrorResponseObject?: Record<string, any>
  fePropertyRegistrationFee?: string
  feBalanceAmount?: string | number
  feDocVerified?: boolean
  fePaymentBodyObj?: Record<string, any>
  feDealRefNo?: string
  feSpecialRate?: boolean
  feTreasuryRate?: string | number
  feBenefFromProject?: boolean
  feCorporatePaymentEngFee?: string | number
  feIsEngineerFee?: boolean
  status?: string
  enabled?: boolean
  paymentStatusOptionDTO?: StatusDTO
  voucherPaymentTypeDTO?: StatusDTO | { id: number }
  voucherPaymentSubTypeDTO?: StatusDTO | { id: number }
  expenseTypeDTO?: { id: number }
  expenseSubTypeDTO?: { id: number }
  invoiceCurrencyDTO?: { id: number }
  paymentCurrencyDTO?: { id: number }
  chargedCodeDTO?: { id: number }
  paymentModeDTO?: { id: number }
  transactionTypeDTO?: { id: number }
  beneficiaryFeePaymentDTO?: StatusDTO | { id: number }
  payoutToBeMadeFromCbsDTO?: StatusDTO | { id: number }
  realEstateAssestDTO?: RealEstateAssetDTO | { id: number }
  capitalPartnerUnitDTO?: CapitalPartnerUnitDTO | { id: number }
  transferCapitalPartnerUnitDTO?: CapitalPartnerUnitDTO | { id: number }
  buildPartnerDTO?: BuildPartnerDTO | { id: number }
  realEstateAssestBeneficiaryDTO?: any
  suretyBondDTO?: any
  deleted?: boolean
  taskStatusDTO?: any
  fbbankCharges?: string | number
}

export interface FundEgressResponse {
  id: number
  fePaymentRefNumber: string
  fePaymentStatus: string
  feUniqueRefNo: string
  feResPaymentRefNo: string
  feResUniqueRefNo: string
  status: string
  message?: string
  timestamp: string
}

export interface FundEgressData {
  id: number
  fePaymentRefNumber: string
  fePaymentDate: string
  fePaymentAmount: number
  feInvoiceNumber?: string
  fePaymentStatus: string
  feIsManualPayment: boolean
  feDocVerified: boolean
  feDealRefNo?: string
  feRemark?: string
  feNarration1?: string
  feNarration2?: string
  feEngineerApprovedAmt?: number
  feTotalEligibleAmtInv?: number
  feAmtPaidAgainstInv?: number
  feCapExcedded?: string
  feTotalAmountPaid?: number
  feDebitFromEscrow?: number
  feCurEligibleAmt?: number
  feDebitFromRetention?: number
  feTasPaymentStatus?: string
  feErrorResponseObject?: any
  feDiscardPayment?: boolean
  expenseTypeDTO?: {
    languageTranslationId?: {
      configValue?: string
    }
  }
  expenseSubTypeDTO?: {
    languageTranslationId?: {
      configValue?: string
    }
  }
  realEstateAssestBeneficiaryDTO?: {
    name?: string
  }
  feTotalPayoutAmt?: number
  feAmountInTransit?: number
  feVarCapExcedded?: string
  feIndicativeRate?: number
  fePpcNumber?: string
  feSpecialRate?: boolean
  feCorporatePayment?: boolean
  feCorpCertEngFee?: string
  feAmtRecdFromUnitHolder?: number
  feForFeit?: boolean
  feForFeitAmt?: number
  feRefundToUnitHolder?: boolean
  feTransferToOtherUnit?: boolean
  feUnitReraApprovedRefNo?: string
  feUnitTransferAppDate?: string
  feAmountToBeReleased?: number
  feBeneDateOfPayment?: string
  feBeneVatPaymentAmt?: number
  feIsEngineerFee?: boolean
  feCorporatePaymentEngFee?: number
  fbbankCharges?: number
  feInvoiceRefNo?: string
  feInvoiceValue?: number
  feInvoiceDate?: string
  feReraApprovedRefNo?: string
  feReraApprovedDate?: string
  feCurBalInEscrowAcc?: number
  feSubConsAccBalance?: number
  feCorporateAccBalance?: number
  feCurBalInRetentionAcc?: number
  buildPartnerDTO?: {
    id: number
    bpName: string
    bpDeveloperId: string
  }
  realEstateAssestDTO?: {
    id: number
    reaName: string
    reaId: string
    reaAccountStatusDTO?: {
      settingValue: string
    }
  }
  voucherPaymentTypeDTO?: {
    id: number
    name: string
  }
  voucherPaymentSubTypeDTO?: {
    id: number
    name: string
  }
  invoiceCurrencyDTO?: {
    id: number
    name: string
  }
  paymentCurrencyDTO?: {
    id: number
    name: string
  }
  chargedCodeDTO?: {
    id: number
    name: string
  }
  paymentModeDTO?: {
    id: number
    name: string
  }
  transactionTypeDTO?: {
    id: number
    name: string
  }
  capitalPartnerUnitDTO?: {
    id: number
    unitNumber: string
    towerName: string
    unitStatus: string
  }
  payoutToBeMadeFromCbsDTO?: {
    id: number
    name: string
  }
  taskStatusDTO?: any | null
}

export class FundEgressService {
  async submitFundEgress(
    paymentData: FundEgressRequest
  ): Promise<FundEgressResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FUND_EGRESS.SAVE)

      this.validatePaymentData(paymentData)

      const transformedData = this.transformPaymentData(paymentData)

      const result = await apiClient.post<FundEgressResponse>(
        url,
        transformedData
      )

      return result
    } catch (error) {
      if (error instanceof Error && error.message.includes('500')) {
        throw new Error(
          `Server Error (500): ${error.message}. Please check the request payload and try again.`
        )
      }

      throw error
    }
  }

  private validatePaymentData(paymentData: FundEgressRequest): void {
    const requiredFields = ['fePaymentDate', 'fePaymentRefNumber']
    const missingFields = requiredFields.filter(
      (field) => !paymentData[field as keyof FundEgressRequest]
    )

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    const dtoFields = [
      'buildPartnerDTO',
      'realEstateAssestDTO',
      'voucherPaymentTypeDTO',
      'voucherPaymentSubTypeDTO',
      'invoiceCurrencyDTO',
      'paymentCurrencyDTO',
      'transactionTypeDTO',
      'payoutToBeMadeFromCbsDTO',
      'chargedCodeDTO',
    ]

    dtoFields.forEach((field) => {
      const dto = paymentData[field as keyof FundEgressRequest] as {
        id?: number
      }
      if (dto && dto.id === undefined) {
        throw new Error(`${field} must have an id property`)
      }
    })
  }

  private transformPaymentData(
    paymentData: FundEgressRequest
  ): FundEgressRequest {
    const transformed = { ...paymentData }

    const numericFields = [
      'feCurBalInEscrowAcc',
      'feCurBalInRetentionAcc',
      'feCorporateAccBalance',
      'feSubConsAccBalance',
      'feInvoiceValue',
      'feTotalEligibleAmtInv',
      'feEngineerApprovedAmt',
      'feTotalAmountPaid',
      'feDebitFromRetention',
      'feDebitFromEscrow',
      'feAmtPaidAgainstInv',
      'feTotalPayoutAmt',
      'feAmountInTransit',
      'feIndicativeRate',
      'feCorporatePaymentEngFee',
      'feAmtRecdFromUnitHolder',
      'feForFeitAmt',
      'feBeneVatPaymentAmt',
      'fbbankCharges',
    ]

    numericFields.forEach((field) => {
      const value = transformed[field as keyof FundEgressRequest]
      if (value !== undefined && value !== null) {
        ;(transformed as any)[field] = Number(value)
      }
    })

    const booleanFields = [
      'feSpecialRate',
      'feForFeit',
      'feRefundToUnitHolder',
      'feTransferToOtherUnit',
      'feIsEngineerFee',
      'feDocVerified',
    ]

    booleanFields.forEach((field) => {
      const value = transformed[field as keyof FundEgressRequest]
      if (value !== undefined && value !== null) {
        ;(transformed as any)[field] = Boolean(value)
      }
    })

    return transformed
  }

  async getFundEgressData(
    page: number = 0,
    size: number = 20
  ): Promise<{
    content: FundEgressData[]
    page: {
      size: number
      number: number
      totalElements: number
      totalPages: number
    }
  }> {
    try {
      const url = buildApiUrl(
        `${API_ENDPOINTS.FUND_EGRESS.GET_ALL}&page=${page}&size=${size}`
      )

      const result = await apiClient.get<
        FundEgressData[] | { content: FundEgressData[]; page: any }
      >(url)

      let fundEgressData: FundEgressData[] = []
      let pageInfo = { size, number: page, totalElements: 0, totalPages: 0 }

      if (Array.isArray(result)) {
        fundEgressData = result
        pageInfo = {
          size,
          number: page,
          totalElements: result.length,
          totalPages: Math.ceil(result.length / size),
        }
      } else if (result && typeof result === 'object' && 'content' in result) {
        fundEgressData = result.content || []
        pageInfo = result.page || pageInfo
      } else {
        fundEgressData = []
      }

      return {
        content: fundEgressData,
        page: pageInfo,
      }
    } catch (error) {
      throw error
    }
  }

  async deleteFundEgress(id: string): Promise<void> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.FUND_EGRESS.SOFT_DELETE(id.toString())
      )

      await apiClient.delete(url)
    } catch (error) {
      throw error
    }
  }

  async approveFundEgress(id: string): Promise<void> {
    try {
      const url = buildApiUrl(
        `${API_ENDPOINTS.FUND_EGRESS.GET_BY_ID(id)}/approve`
      )

      await apiClient.put(url, {})
    } catch (error) {
      throw error
    }
  }

  async rejectFundEgress(id: string, reason: string): Promise<void> {
    try {
      const url = buildApiUrl(
        `${API_ENDPOINTS.FUND_EGRESS.GET_BY_ID(id)}/reject`
      )

      await apiClient.put(url, { reason })
    } catch (error) {
      throw error
    }
  }

  createSamplePayload(): FundEgressRequest {
    return {
      fePaymentRefNumber: 'PAY-20250914-TEST001',
      fePaymentDate: '2025-09-14T12:00:00.000Z',
      fePaymentAmount: 100000.0,
      buildPartnerDTO: {
        id: 501,
      },
      realEstateAssestDTO: {
        id: 201,
      },
      feCurBalInEscrowAcc: 100000.5,
      feCurBalInRetentionAcc: 50000.25,
      feCorporateAccBalance: 750000.0,
      feSubConsAccBalance: 250000.0,
      voucherPaymentTypeDTO: {
        id: 2001,
      },
      voucherPaymentSubTypeDTO: {
        id: 2002,
      },
      feReraApprovedRefNo: 'RERA-TEST-12345',
      feReraApprovedDate: '2025-09-13T09:38:40.050Z',
      feInvoiceRefNo: 'INV-20250914-001',
      invoiceCurrencyDTO: {
        id: 356,
      },
      feInvoiceValue: 150000.75,
      feInvoiceDate: '2025-09-13T09:38:40.050Z',
      feTotalEligibleAmtInv: 120000.0,
      feEngineerApprovedAmt: 115000.0,
      feCapExcedded: 'NO',
      feTotalAmountPaid: 100000.0,
      paymentCurrencyDTO: {
        id: 356,
      },
      feDebitFromRetention: 5000.0,
      feDebitFromEscrow: 20000.0,
      feAmtPaidAgainstInv: 95000.0,
      feTotalPayoutAmt: 105000.0,
      feAmountInTransit: 10000.0,
      feVarCapExcedded: 'NO',
      feSpecialRate: true,
      feDealRefNo: 'DEAL-TEST-2025-01',
      fePpcNumber: 'PPC-2025-XYZ',
      feIndicativeRate: 7.5,
      feCorporatePaymentEngFee: 2500.0,
      feNarration1: 'Payment for project Phase 1',
      feNarration2: 'Escrow fund disbursement',
      feAmtRecdFromUnitHolder: 150000.0,
      feForFeit: false,
      feForFeitAmt: 0.0,
      feRefundToUnitHolder: false,
      feTransferToOtherUnit: false,
      payoutToBeMadeFromCbsDTO: {
        id: 3001,
      },
      fbbankCharges: 250.0,
      feEngineerFeePayment: 'ENGFEE-2025-001',
      feIsEngineerFee: true,
      feBeneVatPaymentAmt: 1500.0,
      transactionTypeDTO: {
        id: 4001,
      },
      chargedCodeDTO: {
        id: 5001,
      },
      feDocVerified: true,
    }
  }

  async submitSampleFundEgress(): Promise<FundEgressResponse> {
    const samplePayload = this.createSamplePayload()
    return this.submitFundEgress(samplePayload)
  }

  async getFundEgressById(id: string): Promise<FundEgressData> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FUND_EGRESS.GET_BY_ID(id))

      const response = await apiClient.get<FundEgressData>(url)

      const result = (response as any)?.data || response

      return result
    } catch (error) {
      throw error
    }
  }

  async updateFundEgress(
    id: string,
    updateData: FundEgressRequest
  ): Promise<FundEgressResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FUND_EGRESS.UPDATE(id))

      this.validatePaymentData(updateData)

      const transformedData = this.transformPaymentData(updateData)

      const result = await apiClient.put<FundEgressResponse>(
        url,
        transformedData
      )

      return result
    } catch (error) {
      if (error instanceof Error && error.message.includes('500')) {
        throw new Error(
          `Server Error (500): ${error.message}. Please check the request payload and try again.`
        )
      }

      throw error
    }
  }
}

export const fundEgressService = new FundEgressService()
