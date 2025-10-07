import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { formatDate } from '@/utils'
import { ContactData, FeeData, BeneficiaryData } from './developerTypes'
import { DATE_FIELDS, BOOLEAN_FIELDS } from './constants'


export const createDateConverter = (dateField: string) => (data: any): Dayjs | null => {
  const dateValue = data[dateField]
  return dateValue && typeof dateValue === 'string' ? dayjs(dateValue) : null
}


export const createBooleanConverter = (field: string) => (data: any): boolean => {
  const value = data[field]
  if (typeof value === 'string') return value === 'true'
  if (typeof value === 'boolean') return value
  return false
}


export const safeParseInt = (value: string | number | undefined, fallback = 0): number => {
  if (typeof value === 'number') return value
  return parseInt(value?.toString() || '0', 10) || fallback
}


export const processDateFields = (data: any): any => {
  const processed = { ...data }
  DATE_FIELDS.forEach(field => {
    processed[field] = createDateConverter(field)(data)
  })
  return processed
}


export const processBooleanFields = (data: any): any => {
  const processed = { ...data }
  BOOLEAN_FIELDS.forEach(field => {
    processed[field] = createBooleanConverter(field)(data)
  })
  return processed
}


export const processContactData = (contactStepData: any): ContactData[] => {
  if (!contactStepData) return []
  
  // Handle API response structure with content array
  const contentArray = contactStepData.content || contactStepData
  if (!contentArray || !Array.isArray(contentArray) || contentArray.length === 0) {
    return []
  }
  
  const mapContactItem = (contact: any): ContactData => ({
    ...contact,
    name: `${contact.bpcFirstName || ''} ${contact.bpcLastName || ''}`.trim() || 'N/A',
    address: `${contact.bpcContactAddressLine1 || ''} ${contact.bpcContactAddressLine2 || ''}`.trim() || 'N/A',
    email: contact.bpcContactEmail || 'N/A',
    pobox: contact.bpcContactPoBox || 'N/A',
    countrycode: contact.bpcCountryMobCode || 'N/A',
    mobileno: contact.bpcContactMobNo || 'N/A',
    telephoneno: contact.bpcContactTelNo || 'N/A',
    fax: contact.bpcContactFaxNo || 'N/A',
    ...(typeof contact.isActive === 'string' && {
      isActive: contact.isActive === 'true',
    }),
  })

  return contentArray.map(mapContactItem)
}


export const processFeeData = (feesStepData: any): FeeData[] => {
  if (!feesStepData) return []
  
  // Handle API response structure with content array
  const contentArray = feesStepData.content || feesStepData
  if (!contentArray || !Array.isArray(contentArray) || contentArray.length === 0) {
    return []
  }
  
  const mapFeeItem = (fee: any): FeeData => ({
    ...fee,
    FeeType: fee.bpFeeCategoryDTO?.languageTranslationId?.configValue || 'N/A',
    Frequency: fee.bpFeeFrequencyDTO?.languageTranslationId?.configValue || 'N/A',
    DebitAmount: fee.debitAmount?.toString() || 'N/A',
    Feetobecollected: fee.feeCollectionDate 
      ? formatDate(fee.feeCollectionDate, 'MMM DD, YYYY') 
      : 'N/A',
    NextRecoveryDate: fee.feeNextRecoveryDate 
      ? formatDate(fee.feeNextRecoveryDate, 'MMM DD, YYYY') 
      : 'N/A',
    FeePercentage: fee.feePercentage?.toString() || 'N/A',
    Amount: fee.totalAmount?.toString() || 'N/A',
    VATPercentage: fee.vatPercentage?.toString() || 'N/A',
    ...(typeof fee.enabled === 'string' && {
      isActive: fee.enabled === 'true',
    }),
  })

  return contentArray.map(mapFeeItem)
}


export const processBeneficiaryData = (beneficiaryStepData: any): BeneficiaryData[] => {
  if (!beneficiaryStepData) return []
  
  // Handle API response structure with content array
  const contentArray = beneficiaryStepData.content || beneficiaryStepData
  if (!contentArray || !Array.isArray(contentArray) || contentArray.length === 0) {
    return []
  }
  
  const mapBeneficiaryItem = (beneficiary: any): BeneficiaryData => ({
    id: beneficiary.id?.toString() || '',
    transferType: beneficiary.bpbBeneficiaryType || '',
    name: beneficiary.bpbName || '',
    bankName: beneficiary.bpbBankName || '',
    swiftCode: beneficiary.bpbSwiftCode || '',
    routingCode: beneficiary.bpbRoutingCode || '',
    account: beneficiary.bpbAccountNumber || '',
    buildPartnerDTO: beneficiary.buildPartnerDTO,
    ...(typeof beneficiary.enabled === 'boolean' && {
      enabled: beneficiary.enabled,
    }),
  })

  return contentArray.map(mapBeneficiaryItem)
}


export const processStepData = (activeStep: number, stepStatus: any): any => {
  console.log("🔄 UTILS - Processing step data for step", activeStep, "stepStatus:", stepStatus)
  const currentStepData = stepStatus.stepData[`step${activeStep + 1}`]
  console.log("🔄 UTILS - Current step data:", currentStepData)
  if (!currentStepData) return {}

  let processedData: any = {}


  if (activeStep === 0) {
    processedData = processDateFields(currentStepData)
    processedData = processBooleanFields(processedData)
    

    Object.keys(currentStepData).forEach(key => {
      if (!processedData[key]) {
        processedData[key] = currentStepData[key]
      }
    })
  }


  const stepDataProcessors = {
    contactData: () => processContactData(stepStatus.stepData.step2),
    fees: () => processFeeData(stepStatus.stepData.step3),
    beneficiaries: () => processBeneficiaryData(stepStatus.stepData.step4),
  }

  Object.entries(stepDataProcessors).forEach(([key, processor]) => {
    const result = processor()
    processedData[key] = result
  })

  return processedData
}
