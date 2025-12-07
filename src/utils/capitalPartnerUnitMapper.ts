export interface Step2FormData {
  projectNameDropdown: string
  projectId: string
  developerIdInput: string
  developerNameInput: string
  floor: string
  bedroomCount: string
  unitNoQaqood: string
  unitStatus: string
  buildingName: string
  plotSize: string
  propertyId: string
  unitIban: string
  registrationFees: string
  agentName: string
  agentNationalId: string
  grossSalePrice: string
  VatApplicable: boolean
  SalesPurchaseAgreement: boolean
  ProjectPaymentPlan: boolean
  salePrice: string
  deedNo: string
  contractNo: string
  agreementDate: any
  ModificationFeeNeeded: boolean
  ReservationBookingForm: boolean
  OqoodPaid: boolean
  worldCheck: boolean
  paidInEscrow: string
  paidOutEscrow: string
  totalPaid: string
  qaqoodAmount: string
  unitAreaSize: string
  forfeitAmount: string
  dldAmount: string
  refundAmount: string
  transferredAmount: string
  unitRemarks: string
}

export interface DropdownOption {
  id: number
  displayName: string
  settingValue: string
  settingKey?: string
  languageTranslationId?: any
  remarks?: string
  status?: string
  enabled?: boolean
  deleted?: boolean
}

export function mapStep2ToCapitalPartnerUnitPayload(
  formData: Step2FormData,
  capitalPartnerId: number,
  unitStatuses: DropdownOption[] = [],
  selectedProject?: any,
  propertyIds: DropdownOption[] = []
): { unitPayload: any; bookingPayload: any; purchasePayload: any } {
  const selectedUnitStatus = unitStatuses.find(
    (status) => status.settingValue === formData.unitStatus
  )

  const selectedPropertyId = propertyIds.find(
    (property) => property.settingValue === formData.propertyId
  )
  const formatAgreementDate = (date: any): string | undefined => {
    if (!date) return undefined
    try {
      if (date && typeof date.format === 'function') {
        return date.startOf('day').toISOString()
      }
      if (typeof date === 'string') {
        const parsedDate = new Date(date)
        parsedDate.setHours(0, 0, 0, 0)
        return parsedDate.toISOString()
      }
      if (date instanceof Date) {
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate.toISOString()
      }
    } catch (error) {
      return undefined
    }
    return undefined
  }
  const payload: any = {}

  if (formData.floor) {
    payload.floor = formData.floor
  }

  if (formData.bedroomCount) {
    payload.noofBedroom = formData.bedroomCount
  }

  if (formData.unitNoQaqood) {
    payload.unitRefId = formData.unitNoQaqood
  }

  if (formData.buildingName) {
    payload.towerName = formData.buildingName
  }

  if (formData.plotSize) {
    payload.unitPlotSize = formData.plotSize
  }

  if (formData.unitIban) {
    payload.virtualAccNo = formData.unitIban
  }

  if (selectedProject && selectedProject.id) {
    payload.realEstateAssestDTO = {
      id: selectedProject.id,
    }
  }

  if (selectedUnitStatus) {
    payload.unitStatusDTO = {
      id: selectedUnitStatus.id,
    }
  }

  if (selectedPropertyId) {
    payload.propertyIdDTO = {
      id: selectedPropertyId.id,
    }
  }

  const bookingData: any = {}

  if (formData.unitAreaSize) {
    bookingData.cpubAreaSize = parseFloat(formData.unitAreaSize)
  }

  if (formData.forfeitAmount) {
    bookingData.cpubForFeitAmount = parseFloat(formData.forfeitAmount)
  }

  if (formData.dldAmount) {
    bookingData.cpubDldAmount = parseFloat(formData.dldAmount)
  }

  if (formData.refundAmount) {
    bookingData.cpubRefundAmount = parseFloat(formData.refundAmount)
  }

  if (formData.transferredAmount) {
    bookingData.cpubTransferredAmount = parseFloat(formData.transferredAmount)
  }

  if (formData.unitRemarks) {
    bookingData.cpubRemarks = formData.unitRemarks
  }
  const purchaseData: any = {}

  if (formData.registrationFees) {
    purchaseData.cpupUnitRegistrationFee = parseFloat(formData.registrationFees)
  }

  if (formData.agentName) {
    purchaseData.cpupAgentName = formData.agentName
  }

  if (formData.agentNationalId) {
    purchaseData.cpupAgentId = formData.agentNationalId
  }

  if (formData.grossSalePrice) {
    purchaseData.cpupGrossSaleprice = parseFloat(formData.grossSalePrice)
  }

  if (formData.VatApplicable !== undefined) {
    purchaseData.cpupVatApplicable = formData.VatApplicable
  }

  if (formData.SalesPurchaseAgreement !== undefined) {
    purchaseData.cpupSalePurchaseAgreement = formData.SalesPurchaseAgreement
  }

  if (formData.ProjectPaymentPlan !== undefined) {
    purchaseData.cpupProjectPaymentPlan = formData.ProjectPaymentPlan
  }

  if (formData.salePrice) {
    purchaseData.cpupSalePrice = parseFloat(formData.salePrice)
  }

  if (formData.deedNo) {
    purchaseData.cpupDeedNo = formData.deedNo
  }

  if (formData.contractNo) {
    purchaseData.cpupAgreementNo = formData.contractNo
  }

  if (formData.agreementDate) {
    const formattedDate = formatAgreementDate(formData.agreementDate)
    if (formattedDate) {
      purchaseData.cpupAgreementDate = formattedDate
    }
  }

  if (formData.ModificationFeeNeeded !== undefined) {
    purchaseData.cpupModificationFeeNeeded = formData.ModificationFeeNeeded
  }

  if (formData.ReservationBookingForm !== undefined) {
    purchaseData.cpupReservationBookingForm = formData.ReservationBookingForm
  }

  if (formData.OqoodPaid !== undefined) {
    purchaseData.cpupOqoodPaid = formData.OqoodPaid
  }

  if (formData.qaqoodAmount) {
    purchaseData.cpupOqoodAmountPaid = parseFloat(formData.qaqoodAmount)
  }

  if (formData.worldCheck !== undefined) {
    purchaseData.cpupWorldCheck = formData.worldCheck
  }

  if (formData.paidInEscrow) {
    purchaseData.cpupAmtPaidToDevInEscorw = parseFloat(formData.paidInEscrow)
  }

  if (formData.paidOutEscrow) {
    purchaseData.cpupAmtPaidToDevOutEscorw = parseFloat(formData.paidOutEscrow)
  }

  if (formData.totalPaid) {
    purchaseData.cpupTotalAmountPaid = parseFloat(formData.totalPaid)
  }

  if (formData.unitIban) {
    purchaseData.cpupUnitIban = formData.unitIban
  }

  if (formData.unitNoQaqood) {
    purchaseData.cpupUnitNoOtherFormat = formData.unitNoQaqood
  }

  if (formData.unitAreaSize) {
    purchaseData.cpupUnitAreaSize = parseFloat(formData.unitAreaSize)
  }

  if (formData.forfeitAmount) {
    purchaseData.cpupForfeitAmount = parseFloat(formData.forfeitAmount)
  }

  if (formData.dldAmount) {
    purchaseData.cpupDldAmount = parseFloat(formData.dldAmount)
  }

  if (formData.refundAmount) {
    purchaseData.cpupRefundAmount = parseFloat(formData.refundAmount)
  }

  if (formData.unitRemarks) {
    purchaseData.cpupRemarks = formData.unitRemarks
  }

  if (formData.transferredAmount) {
    purchaseData.cpupTransferredAmount = parseFloat(formData.transferredAmount)
  }

  payload.isResale = false
  payload.isModified = true

  payload.capitalPartnerDTOS = [
    {
      id: capitalPartnerId,
    },
  ]

  payload.deleted = false

  const bookingPayload: any = {}
  if (Object.keys(bookingData).length > 0) {
    Object.assign(bookingPayload, bookingData)
    bookingPayload.deleted = false
  }

  const purchasePayload: any = {}
  if (Object.keys(purchaseData).length > 0) {
    Object.assign(purchasePayload, purchaseData)
    purchasePayload.deleted = false
  }

  return {
    unitPayload: payload,
    bookingPayload: bookingPayload,
    purchasePayload: purchasePayload,
  }
}


