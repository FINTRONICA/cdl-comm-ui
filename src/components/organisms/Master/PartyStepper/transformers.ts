import { useMemo } from 'react'
import { PartyDataStepsData } from './partyTypes'
import { safeParseInt } from './utils'


export const useStepDataTransformers = () => {
  return useMemo(() => ({
    1: (formData: PartyDataStepsData) => {
      // Helper to convert empty string to null for API (API expects null, not empty strings)
      const toNullIfEmpty = (value: string | null | undefined): string | null => {
        if (value === null || value === undefined) return null
        const str = String(value).trim()
        return str === '' ? null : str
      }
      
      return {
        // Convert empty strings to null for API (matching API contract)
        partyCifNumber: toNullIfEmpty(formData.partyCifNumber),
        partyFullName: toNullIfEmpty(formData.partyFullName),
        addressLine1: toNullIfEmpty(formData.addressLine1),
        addressLine2: toNullIfEmpty(formData.addressLine2),
        addressLine3: toNullIfEmpty(formData.addressLine3),
        telephoneNumber: formData.telephoneNumber || '',
        mobileNumber: toNullIfEmpty(formData.mobileNumber),
        emailAddress: toNullIfEmpty(formData.emailAddress),
        bankIdentifier: formData.bankIdentifier || '',
        passportIdentificationDetails: toNullIfEmpty(formData.passportIdentificationDetails),
        backupProjectAccountOwnerName: toNullIfEmpty(formData.backupProjectAccountOwnerName),
        projectAccountOwnerName: toNullIfEmpty(formData.projectAccountOwnerName),
        assistantRelationshipManagerName: toNullIfEmpty(formData.assistantRelationshipManagerName),
        teamLeaderName: toNullIfEmpty(formData.teamLeaderName),
        additionalRemarks: toNullIfEmpty(formData.additionalRemarks),
        relationshipManagerName: toNullIfEmpty(formData.relationshipManagerName),
        active: formData.active ?? true,
        partyConstituentDTO: formData.partyConstituentDTO ? {
          id: safeParseInt(formData.partyConstituentDTO.id),
        } : null,
        roleDTO: formData.roleDTO ? {
          id: safeParseInt(formData.roleDTO.id),
        } : null,
        taskStatusDTO: formData.taskStatusDTO ? {
          id: safeParseInt(formData.taskStatusDTO.id),
        } : null,
      }
    },
    2: (formData: PartyDataStepsData, partyId?: string) => {
      // Step 2 form fields are set directly on formData, not in an array
      // Check if we have the fields directly or in authorizedSignatoryData array
      type FormDataWithStep2Fields = PartyDataStepsData & {
        customerCifNumber?: string | null
        signatoryFullName?: string | null
      }
      const formDataWithStep2 = formData as FormDataWithStep2Fields
      const hasDirectFields = formDataWithStep2.customerCifNumber !== undefined || formDataWithStep2.signatoryFullName !== undefined
      const authorizedSignatory = hasDirectFields 
        ? formDataWithStep2
        : formData.authorizedSignatoryData?.[0]
      
      if (!authorizedSignatory) {
        throw new Error('Authorized signatory data is required for step 2')
      }
      
      // Determine partyDTO.id: prioritize formData.partyDTO.id (from dropdown), then partyId parameter, then formData.id
      type PartyDTO = { id?: number }
      let partyDTOId: number | undefined
      if (authorizedSignatory.partyDTO && typeof authorizedSignatory.partyDTO === 'object' && 'id' in authorizedSignatory.partyDTO) {
        partyDTOId = safeParseInt((authorizedSignatory.partyDTO as PartyDTO).id)
      } else if (partyId) {
        partyDTOId = parseInt(partyId)
      } else if (formData.id) {
        partyDTOId = parseInt(formData.id)
      }
      
      return {
        customerCifNumber: authorizedSignatory.customerCifNumber,
        signatoryFullName: authorizedSignatory.signatoryFullName,
        addressLine1: authorizedSignatory.addressLine1,
        addressLine2: authorizedSignatory.addressLine2,
        addressLine3: authorizedSignatory.addressLine3,
        telephoneNumber: authorizedSignatory.telephoneNumber,
        mobileNumber: authorizedSignatory.mobileNumber,
        emailAddress: authorizedSignatory.emailAddress,
        notificationContactName: authorizedSignatory.notificationContactName,
        signatoryCifNumber: authorizedSignatory.signatoryCifNumber,
        notificationEmailAddress: authorizedSignatory.notificationEmailAddress,
        notificationSignatureFile: authorizedSignatory.notificationSignatureFile,
        notificationSignatureMimeType: authorizedSignatory.notificationSignatureMimeType,
        active: authorizedSignatory.active ?? true,
        cifExistsDTO: authorizedSignatory.cifExistsDTO && typeof authorizedSignatory.cifExistsDTO === 'object' && 'id' in authorizedSignatory.cifExistsDTO ? {
          id: safeParseInt((authorizedSignatory.cifExistsDTO as { id?: number }).id),
        } : null,
        notificationSignatureDTO: authorizedSignatory.notificationSignatureDTO && typeof authorizedSignatory.notificationSignatureDTO === 'object' && 'id' in authorizedSignatory.notificationSignatureDTO ? {
          id: safeParseInt((authorizedSignatory.notificationSignatureDTO as { id?: number }).id),
        } : null,
        partyDTO: partyDTOId ? {
          id: partyDTOId,
        } : undefined,
      }
    },
    3: (formData: PartyDataStepsData) => ({
      reviewData: formData,
      termsAccepted: true,
    }),
  }), [])
}


export const transformStepData = (
  step: number, 
  formData: PartyDataStepsData, 
  transformers: ReturnType<typeof useStepDataTransformers>,
  partyId?: string
) => {
  const transformer = transformers[step as keyof typeof transformers]
  if (!transformer) {
    throw new Error(`Invalid step: ${step}`)
  }
  
  // For step 2, pass partyId to the transformer
  type Step2Result = {
    partyDTO?: { id: number }
    [key: string]: unknown
  }
  let result: Step2Result | unknown
  if (step === 2) {
    result = (transformer as (formData: PartyDataStepsData, partyId?: string) => Step2Result)(formData, partyId)
  } else {
    result = transformer(formData)
  }
  
  // For step 2, ensure partyDTO.id is set if partyId is available
  if (step === 2 && partyId && result && typeof result === 'object' && result !== null) {
    const step2Result = result as Step2Result
    if ('partyDTO' in step2Result) {
      const currentPartyDTO = step2Result.partyDTO
      if (!currentPartyDTO || !currentPartyDTO.id) {
        step2Result.partyDTO = { id: parseInt(partyId) }
      }
    } else {
      // If partyDTO is still undefined and we have partyId, set it
      step2Result.partyDTO = { id: parseInt(partyId) }
    }
  }
  
  return result
}
