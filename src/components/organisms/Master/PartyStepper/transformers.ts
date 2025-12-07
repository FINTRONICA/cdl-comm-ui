import { useMemo } from 'react'
import { PartyDataStepsData, AuthorizedSignatoryData } from './partyTypes'
import { safeParseInt } from './utils'


export const useStepDataTransformers = () => {
  return useMemo(() => ({
    1: (formData: PartyDataStepsData) => ({
      partyCifNumber: formData.partyCifNumber,
      partyFullName: formData.partyFullName,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      addressLine3: formData.addressLine3,
      telephoneNumber: formData.telephoneNumber,
      mobileNumber: formData.mobileNumber,
      emailAddress: formData.emailAddress,
      bankIdentifier: formData.bankIdentifier,
      passportIdentificationDetails: formData.passportIdentificationDetails,
      backupProjectAccountOwnerName: formData.backupProjectAccountOwnerName,
      projectAccountOwnerName: formData.projectAccountOwnerName,
      assistantRelationshipManagerName: formData.assistantRelationshipManagerName,
      teamLeaderName: formData.teamLeaderName,
      additionalRemarks: formData.additionalRemarks,
      relationshipManagerName: formData.relationshipManagerName,
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
    }),
    2: (formData: PartyDataStepsData, partyId?: string) => {
      // Step 2 form fields are set directly on formData, not in an array
      // Check if we have the fields directly or in authorizedSignatoryData array
      const hasDirectFields = (formData as any).customerCifNumber !== undefined || (formData as any).signatoryFullName !== undefined
      const authorizedSignatory = hasDirectFields 
        ? formData as any
        : formData.authorizedSignatoryData?.[0]
      
      if (!authorizedSignatory) {
        throw new Error('Authorized signatory data is required for step 2')
      }
      
      // Determine partyDTO.id: prioritize formData.partyDTO.id (from dropdown), then partyId parameter, then formData.id
      let partyDTOId: number | undefined
      if (authorizedSignatory.partyDTO && typeof authorizedSignatory.partyDTO === 'object' && 'id' in authorizedSignatory.partyDTO) {
        partyDTOId = safeParseInt((authorizedSignatory.partyDTO as any).id)
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
        cifExistsDTO: authorizedSignatory.cifExistsDTO ? {
          id: safeParseInt((authorizedSignatory.cifExistsDTO as any).id),
        } : null,
        notificationSignatureDTO: authorizedSignatory.notificationSignatureDTO ? {
          id: safeParseInt((authorizedSignatory.notificationSignatureDTO as any).id),
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
  let result
  if (step === 2) {
    result = (transformer as (formData: PartyDataStepsData, partyId?: string) => any)(formData, partyId)
  } else {
    result = transformer(formData)
  }
  
  // For step 2, ensure partyDTO.id is set if partyId is available
  if (step === 2 && partyId && result && typeof result === 'object' && 'partyDTO' in result) {
    const currentPartyDTO = (result as any).partyDTO
    if (!currentPartyDTO || !currentPartyDTO.id) {
      (result as any).partyDTO = { id: parseInt(partyId) }
    }
  }
  
  // For step 2, if partyDTO is still undefined and we have partyId, set it
  if (step === 2 && partyId && result && typeof result === 'object' && !('partyDTO' in result)) {
    (result as any).partyDTO = { id: parseInt(partyId) }
  }
  
  return result
}
