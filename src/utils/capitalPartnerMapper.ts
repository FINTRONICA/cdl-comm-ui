import { CapitalPartnerRequest } from '../services/api/capitalPartnerService'

// Interface for Step1 form data
export interface Step1FormData {
  investorType: string
  investorId: string
  investorFirstName: string
  investorMiddleName: string
  investorLastName: string
  arabicName: string
  ownership: string
  investorIdType: string
  idNumber: string
  idExpiryDate: any // Dayjs object
  nationality: string
  accountContact: string
  mobileNumber: string
  email: string
}

// Interface for dropdown option data
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

/**
 * Maps Step1 form data to Capital Partner API payload
 */
export function mapStep1ToCapitalPartnerPayload(
  formData: Step1FormData,
  investorTypes: DropdownOption[] = [],
  idTypes: DropdownOption[] = [],
  countries: DropdownOption[] = []
): any {
  // Find the selected options from dropdowns
  const selectedInvestorType = investorTypes.find(
    (type) => type.settingValue === formData.investorType
  )
  const selectedIdType = idTypes.find(
    (type) => type.settingValue === formData.investorIdType
  )
  const selectedCountry = countries.find(
    (country) => country.settingValue === formData.nationality
  )

  // Format the expiry date to ISO string if it exists
  const formatExpiryDate = (date: any): string | undefined => {
    if (!date) return undefined
    try {
      // If it's a Dayjs object
      if (date && typeof date.toISOString === 'function') {
        return date.toISOString()
      }
      // If it's already a string
      if (typeof date === 'string') {
        return new Date(date).toISOString()
      }
      // If it's a Date object
      if (date instanceof Date) {
        return date.toISOString()
      }
    } catch (error) {
      console.warn('Error formatting expiry date:', error)
    }
    return undefined
  }

  // Create the OptionDTO structure with only non-null values
  const createOptionDTO = (option?: DropdownOption) => {
    if (!option) return undefined

    const dto: any = {
      id: option.id,
    }

    // Only add non-null/non-undefined values
    if (option.enabled !== undefined && option.enabled !== null) {
      dto.enabled = option.enabled
    } else {
      dto.enabled = false // Default value
    }

    return dto
  }

  // Build the payload with only non-empty values
  const payload: any = {}

  // Only add fields that have actual values from UI
  if (formData.investorId) {
    payload.capitalPartnerId = formData.investorId
  }

  if (formData.investorFirstName) {
    payload.capitalPartnerName = formData.investorFirstName
  }

  if (formData.investorMiddleName) {
    payload.capitalPartnerMiddleName = formData.investorMiddleName
  }

  if (formData.investorLastName) {
    payload.capitalPartnerLastName = formData.investorLastName
  }

  if (formData.ownership) {
    payload.capitalPartnerOwnershipPercentage = parseFloat(formData.ownership)
  }

  if (formData.idNumber) {
    payload.capitalPartnerIdNo = formData.idNumber
  }

  if (formData.accountContact) {
    payload.capitalPartnerTelephoneNo = formData.accountContact
  }

  if (formData.mobileNumber) {
    payload.capitalPartnerMobileNo = formData.mobileNumber
  }

  if (formData.email) {
    payload.capitalPartnerEmail = formData.email
  }

  if (formData.arabicName) {
    payload.capitalPartnerLocaleName = formData.arabicName
  }

  // Add expiry date if it exists
  const expiryDate = formatExpiryDate(formData.idExpiryDate)
  if (expiryDate) {
    payload.idExpiaryDate = expiryDate
  }

  // Add DTO IDs only if they exist
  if (selectedIdType) {
    payload.documentTypeDTO = { id: selectedIdType.id }
  }

  if (selectedCountry) {
    payload.countryOptionDTO = { id: selectedCountry.id }
  }

  if (selectedInvestorType) {
    payload.investorTypeDTO = { id: selectedInvestorType.id }
  }

  // Add required defaults
  payload.capitalPartnerOwnerNumber = 1073741824
  payload.isCurrent = true
  payload.deleted = false

  return payload
}

/**
 * Validates Step1 form data before mapping
 */
export function validateStep1Data(formData: Step1FormData): string[] {
  const errors: string[] = []

  if (!formData.investorType) {
    errors.push('Investor Type is required')
  }
  if (!formData.investorId) {
    errors.push('Investor ID is required')
  }
  if (!formData.investorFirstName) {
    errors.push('Investor Name is required')
  }
  if (!formData.investorLastName) {
    errors.push('Last Name is required')
  }
  if (!formData.investorIdType) {
    errors.push('Investor ID Type is required')
  }
  if (!formData.nationality) {
    errors.push('Nationality is required')
  }

  return errors
}
