export interface LanguageTranslation {
  id: number
  configId: string
  configValue: string
  content: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface DocumentTypeDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: LanguageTranslation
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface CountryOptionDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: LanguageTranslation
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean
}

export interface InvestorTypeDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: LanguageTranslation
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface CapitalPartnerResponse {
  id: number
  capitalPartnerId: string
  capitalPartnerName: string
  capitalPartnerMiddleName: string
  capitalPartnerLastName: string
  capitalPartnerOwnershipPercentage: number | null
  capitalPartnerIdNo: string
  capitalPartnerTelephoneNo: string
  capitalPartnerMobileNo: string
  capitalPartnerEmail: string
  capitalPartnerOwnerNumber: number
  isCurrent: boolean
  idExpiaryDate: string
  capitalPartnerLocaleName: string
  documentTypeDTO: DocumentTypeDTO
  countryOptionDTO: CountryOptionDTO
  investorTypeDTO: InvestorTypeDTO
  capitalPartnerBankInfoDTOS: any | null
  capitalPartnerUnitDTO: any | null
  deleted: boolean
  enabled: boolean
  taskStatusDTO: any | null
}

export interface PaymentPlanResponse {
  id?: number
  cpppInstallmentNumber: number
  cpppInstallmentDate: string
  cpppBookingAmount: number
  capitalPartnerDTO: {
    id: number
  }
  deleted: boolean
}

export interface PayModeDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationDTO: LanguageTranslation | null
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface BankDetailsResponse {
  id: number
  cpbiPayeeName: string
  cpbiPayeeAddress: string
  cpbiBankName: string
  cpbiBankAddress: string
  cpbiBicCode: string
  cpbiBeneRoutingCode: string
  cpbiAccountNumber: string
  capitalPartnerDTO: CapitalPartnerResponse
  payModeDTO: PayModeDTO
  deleted: boolean
}

export interface UnitStatusDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationDTO: LanguageTranslation | null
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface PropertyIdDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: LanguageTranslation | null
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean
}

export interface RealEstateAssetDTO {
  id: number
  reaId: string
  reaCif: string
  reaName: string
  reaNameLocal: string
  reaLocation: string
  reaReraNumber: string
  reaStartDate: string
  reaCompletionDate: string
  reaPercentComplete: string
  reaConstructionCost: number
  reaAccStatusDate: string
  reaRegistrationDate: string
  reaNoOfUnits: number
  reaRemarks: string
  reaSpecialApproval: string
  reaManagedBy: string
  reaBackupUser: string
  reaRetentionPercent: string
  reaAdditionalRetentionPercent: string
  reaTotalRetentionPercent: string
  reaRetentionEffectiveDate: string
  reaManagementExpenses: string
  reaMarketingExpenses: string
  reaAccoutStatusDate: string
  reaTeamLeadName: string
  reaRelationshipManagerName: string
  reaAssestRelshipManagerName: string
  reaRealEstateBrokerExp: number
  reaAdvertisementExp: number
  reaLandOwnerName: string
  buildPartnerDTO: any | null
  reaStatusDTO: any | null
  reaTypeDTO: any | null
  reaAccountStatusDTO: any | null
  reaConstructionCostCurrencyDTO: any | null
  status: any | null
  reaBlockPaymentTypeDTO: any | null
  deleted: boolean
  taskStatusDTO: any | null
}

export interface CapitalPartnerUnitResponse {
  id: number
  unitRefId: string
  altUnitRefId: string | null
  name: string | null
  isResale: boolean
  resaleDate: string | null
  unitSysId: string | null
  otherFormatUnitNo: string | null
  virtualAccNo: string
  towerName: string
  unitPlotSize: string
  floor: string
  noofBedroom: string
  isModified: boolean
  partnerUnitDTO: any | null
  capitalPartnerUnitTypeDTO: any | null
  realEstateAssestDTO: RealEstateAssetDTO
  unitStatusDTO: UnitStatusDTO
  propertyIdDTO: PropertyIdDTO
  paymentPlanTypeDTO: any | null
  capitalPartnerUnitBookingDTO: any | null
  childCapitalPartnerUnitDTO: any | null
  capitalPartnerDTOS: any | null
  deleted: boolean
}

export interface CapitalPartnerUnitBookingResponse {
  id: number
  cpubAmountPaid: number | null
  cpubAreaSize: number
  cpubForFeitAmount: number
  cpubDldAmount: number
  cpubRefundAmount: number
  cpubTransferredAmount: number
  cpubRemarks: string
  capitalPartnerUnitDTOS: CapitalPartnerUnitResponse | null
  deleted: boolean
}

export interface CapitalPartnerUnitPurchaseResponse {
  id: number
  cpuPurchaseDate: string | null
  cpupSaleRate: number | null
  cpuPurchasePrice: number | null
  cpupUnitRegistrationFee: number | null
  cpupAgentName: string
  cpupAgentId: string
  cpupGrossSaleprice: number
  cpupVatApplicable: boolean
  cpupDeedNo: string
  cpupAgreementNo: string
  cpupAgreementDate: string
  cpupSalePurchaseAgreement: boolean
  cpupWorldCheck: boolean
  cpupAmtPaidToDevInEscorw: number
  cpupAmtPaidToDevOutEscorw: number
  cpupTotalAmountPaid: number
  cpupUnitIban: string
  cpupOqood: string | null
  cpupOqoodPaid: boolean
  cpupOqoodAmountPaid: string
  cpupUnitAreaSize: string
  cpupForfeitAmount: string
  cpupDldAmount: string
  cpupRefundAmount: string
  cpupRemarks: string
  cpupTransferredAmount: string
  cpupUnitNoOtherFormat: string
  cpupSalePrice: number
  cpupProjectPaymentPlan: boolean
  cpupReservationBookingForm: boolean
  cpupModificationFeeNeeded: boolean
  cpupCreditCurrencyDTO: any | null
  cpuPurchasePriceCurrencyDTO: any | null
  capitalPartnerUnitDTO: CapitalPartnerUnitResponse
  deleted: boolean
}
