import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { AuthorizedSignatoryData } from './partyTypes'
import { DATE_FIELDS, BOOLEAN_FIELDS } from './constants'


export const createDateConverter = (dateField: string) => (data: Record<string, unknown>): Dayjs | null => {
  const dateValue = data[dateField]
  return dateValue && typeof dateValue === 'string' ? dayjs(dateValue) : null
}


export const createBooleanConverter = (field: string) => (data: Record<string, unknown>): boolean => {
  const value = data[field]
  if (typeof value === 'string') return value === 'true'
  if (typeof value === 'boolean') return value
  return false
}


export const safeParseInt = (value: string | number | undefined, fallback = 0): number => {
  if (typeof value === 'number') return value
  return parseInt(value?.toString() || '0', 10) || fallback
}


export const processDateFields = (data: Record<string, unknown>): Record<string, unknown> => {
  const processed = { ...data }
  DATE_FIELDS.forEach(field => {
    processed[field] = createDateConverter(field)(data)
  })
  return processed
}


export const processBooleanFields = (data: Record<string, unknown>): Record<string, unknown> => {
  const processed = { ...data }
  BOOLEAN_FIELDS.forEach(field => {
    processed[field] = createBooleanConverter(field)(data)
  })
  return processed
}


export const processAuthorizedSignatoryData = (authorizedSignatoryStepData: unknown): AuthorizedSignatoryData[] => {
  if (!authorizedSignatoryStepData) return []
  
  // Handle API response structure with content array
  const stepData = authorizedSignatoryStepData as { content?: unknown[] } | unknown[]
  const contentArray = (stepData && typeof stepData === 'object' && 'content' in stepData ? (stepData as { content?: unknown[] }).content : stepData) as unknown[]
  if (!contentArray || !Array.isArray(contentArray) || contentArray.length === 0) {
    return []
  }
  
  const mapAuthorizedSignatoryItem = (authorizedSignatory: {
    id?: number
    customerCifNumber?: string | null
    signatoryFullName?: string | null
    addressLine1?: string | null
    addressLine2?: string | null
    addressLine3?: string | null
    telephoneNumber?: string | null
    mobileNumber?: string | null
    emailAddress?: string | null
    notificationContactName?: string | null
    signatoryCifNumber?: string | null
    notificationEmailAddress?: string | null
    notificationSignatureFile?: string | null
    notificationSignatureMimeType?: string | null
    active?: boolean | null
    cifExistsDTO?: unknown | null
    partyDTO?: unknown | null
    notificationSignatureDTO?: unknown | null
    enabled?: boolean | null
    deleted?: boolean | null
  }): AuthorizedSignatoryData => ({
    id: authorizedSignatory.id,
    customerCifNumber: authorizedSignatory.customerCifNumber || null,
    signatoryFullName: authorizedSignatory.signatoryFullName || null,
    addressLine1: authorizedSignatory.addressLine1 || null,
    addressLine2: authorizedSignatory.addressLine2 || null,
    addressLine3: authorizedSignatory.addressLine3 || null,
    telephoneNumber: authorizedSignatory.telephoneNumber || null,
    mobileNumber: authorizedSignatory.mobileNumber || null,
    emailAddress: authorizedSignatory.emailAddress || null,
    notificationContactName: authorizedSignatory.notificationContactName || null,
    signatoryCifNumber: authorizedSignatory.signatoryCifNumber || null,
    notificationEmailAddress: authorizedSignatory.notificationEmailAddress || null,
    notificationSignatureFile: authorizedSignatory.notificationSignatureFile || null,
    notificationSignatureMimeType: authorizedSignatory.notificationSignatureMimeType || null,
    active: authorizedSignatory.active ?? null,
    cifExistsDTO: authorizedSignatory.cifExistsDTO || null,
    partyDTO: authorizedSignatory.partyDTO || null,
    notificationSignatureDTO: authorizedSignatory.notificationSignatureDTO || null,
    enabled: authorizedSignatory.enabled ?? null,
    deleted: authorizedSignatory.deleted ?? null,
    authorizedSignatoryStatusDate: null, // Not available from API response
  } as AuthorizedSignatoryData)

  return contentArray.map((item: unknown) => mapAuthorizedSignatoryItem(item as {
    id?: number
    customerCifNumber?: string | null
    signatoryFullName?: string | null
    addressLine1?: string | null
    addressLine2?: string | null
    addressLine3?: string | null
    telephoneNumber?: string | null
    mobileNumber?: string | null
    emailAddress?: string | null
    notificationContactName?: string | null
    signatoryCifNumber?: string | null
    notificationEmailAddress?: string | null
    notificationSignatureFile?: string | null
    notificationSignatureMimeType?: string | null
    active?: boolean | null
    cifExistsDTO?: unknown | null
    partyDTO?: unknown | null
    notificationSignatureDTO?: unknown | null
    enabled?: boolean | null
    deleted?: boolean | null
  }))
}





export const processStepData = (activeStep: number, stepStatus: { stepData: Record<string, unknown> }): Record<string, unknown> => {

  const currentStepData = stepStatus.stepData[`step${activeStep + 1}`] as Record<string, unknown> | undefined
  if (!currentStepData) return {}

  let processedData: Record<string, unknown> = {}


  if (activeStep === 0) {
    // Process date fields first
    processedData = processDateFields(currentStepData)
    // Process boolean fields
    processedData = processBooleanFields(processedData)
    
    // List of text fields that should be converted from null to empty string
    const textFields = [
      'partyCifNumber', 'partyFullName', 'addressLine1', 'addressLine2', 'addressLine3',
      'telephoneNumber', 'mobileNumber', 'emailAddress', 'bankIdentifier',
      'passportIdentificationDetails', 'backupProjectAccountOwnerName',
      'projectAccountOwnerName', 'assistantRelationshipManagerName',
      'teamLeaderName', 'additionalRemarks', 'relationshipManagerName', 'id'
    ]
    
    // Copy all other fields from currentStepData (matching DeveloperStepper pattern)
    // This ensures all fields from the API are properly mapped to the form
    Object.keys(currentStepData).forEach(key => {
      const value = currentStepData[key]
      
      // Convert null/undefined to empty string for text fields to prevent React warnings
      // This ensures controlled components always have a string value
      if (textFields.includes(key)) {
        // Convert null/undefined to empty string for text fields
        processedData[key] = (value === null || value === undefined) ? '' : (typeof value === 'string' ? value : String(value))
      } else if (!(key in processedData)) {
        // For non-text fields, copy as-is
        processedData[key] = value
      }
    })
    
    // Ensure id field is properly set if available (convert to string for form)
    if (currentStepData.id !== undefined && currentStepData.id !== null) {
      processedData.id = currentStepData.id.toString()
    } else if (!processedData.id) {
      processedData.id = ''
    }
    
    // Ensure all text fields have empty string default instead of null (final check)
    textFields.forEach(field => {
      if (processedData[field] === null || processedData[field] === undefined) {
        processedData[field] = ''
      }
    })
    
    // Ensure nested DTOs are properly structured
    if (currentStepData.partyConstituentDTO && typeof currentStepData.partyConstituentDTO === 'object' && 'id' in currentStepData.partyConstituentDTO) {
      processedData.partyConstituentDTO = currentStepData.partyConstituentDTO
    }
    if (currentStepData.roleDTO && typeof currentStepData.roleDTO === 'object' && 'id' in currentStepData.roleDTO) {
      processedData.roleDTO = currentStepData.roleDTO
    }
    if (currentStepData.taskStatusDTO && typeof currentStepData.taskStatusDTO === 'object' && 'id' in currentStepData.taskStatusDTO) {
      processedData.taskStatusDTO = currentStepData.taskStatusDTO
    }
  }


  // Process step 2 (Authorized Signatory) data
  if (activeStep === 1) {
    const step2Data = stepStatus.stepData.step2 as AuthorizedSignatoryData[] | AuthorizedSignatoryData | undefined
    if (step2Data) {
      // Step2 form expects fields directly on formData, not in an array
      // If step2Data is an array, take the first item
      const authorizedSignatory = Array.isArray(step2Data) ? step2Data[0] : step2Data
      if (authorizedSignatory) {
        // Set fields directly on processedData for Step2 form
        processedData.customerCifNumber = authorizedSignatory.customerCifNumber || null
        processedData.signatoryFullName = authorizedSignatory.signatoryFullName || null
        processedData.addressLine1 = authorizedSignatory.addressLine1 || null
        processedData.addressLine2 = authorizedSignatory.addressLine2 || null
        processedData.addressLine3 = authorizedSignatory.addressLine3 || null
        processedData.telephoneNumber = authorizedSignatory.telephoneNumber || null
        processedData.mobileNumber = authorizedSignatory.mobileNumber || null
        processedData.emailAddress = authorizedSignatory.emailAddress || null
        processedData.notificationContactName = authorizedSignatory.notificationContactName || null
        processedData.signatoryCifNumber = authorizedSignatory.signatoryCifNumber || null
        processedData.notificationEmailAddress = authorizedSignatory.notificationEmailAddress || null
        processedData.notificationSignatureFile = authorizedSignatory.notificationSignatureFile || null
        processedData.notificationSignatureMimeType = authorizedSignatory.notificationSignatureMimeType || null
        processedData.active = authorizedSignatory.active ?? true
        if (authorizedSignatory.cifExistsDTO) {
          processedData.cifExistsDTO = authorizedSignatory.cifExistsDTO
        }
        if (authorizedSignatory.notificationSignatureDTO) {
          processedData.notificationSignatureDTO = authorizedSignatory.notificationSignatureDTO
        }
        // Set partyDTO and partyDropdown for party selection dropdown
        if (authorizedSignatory.partyDTO && typeof authorizedSignatory.partyDTO === 'object' && 'id' in authorizedSignatory.partyDTO) {
          const partyId = (authorizedSignatory.partyDTO as { id?: number }).id
          processedData.partyDTO = authorizedSignatory.partyDTO
          if (partyId) {
            processedData.partyDropdown = partyId.toString()
          }
        }
      }
      // Also set as array for compatibility
      processedData.authorizedSignatoryData = Array.isArray(step2Data) ? step2Data : [step2Data]
    }
  }

  return processedData
}
