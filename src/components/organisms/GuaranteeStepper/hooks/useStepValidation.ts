import { useFormContext } from 'react-hook-form'

export const useStepValidation = () => {
  const { trigger, formState: { errors } } = useFormContext()

  // Validate Guarantee Details fields
  const validateGuaranteeDetails = async () => {
    const detailsFields = [
      'guaranteeRefNo',
      'guaranteeType', 
      'guaranteeDate',
      'projectCif',
      'projectName',
      'developerName',
      'guaranteeAmount',
      'issuerBank'
    ]
    return await trigger(detailsFields)
  }

  // Validate Guarantee Documents fields
  const validateGuaranteeDocuments = async () => {
    return await trigger(['documents'])
  }

  // Validate current step based on step number
  const validateCurrentStep = async (stepNumber: number) => {
    switch (stepNumber) {
      case 0: 
        return await validateGuaranteeDetails()
      case 1: 
        return await validateGuaranteeDocuments()
      case 2: 
        return true // Review step - no validation needed
      default: 
        return false
    }
  }

  // Get step-specific error messages
  const getStepErrors = (stepNumber: number) => {
    switch (stepNumber) {
      case 0:
        return {
          guaranteeRefNo: errors.guaranteeRefNo?.message,
          guaranteeType: errors.guaranteeType?.message,
          guaranteeDate: errors.guaranteeDate?.message,
          projectCif: errors.projectCif?.message,
          projectName: errors.projectName?.message,
          developerName: errors.developerName?.message,
          guaranteeAmount: errors.guaranteeAmount?.message,
          issuerBank: errors.issuerBank?.message,
        }
      case 1:
        return {
          documents: errors.documents?.message,
        }
      default:
        return {}
    }
  }

  // Check if step has any errors
  const hasStepErrors = (stepNumber: number) => {
    const stepErrors = getStepErrors(stepNumber)
    return Object.values(stepErrors).some(error => !!error)
  }

  return {
    validateGuaranteeDetails,
    validateGuaranteeDocuments,
    validateCurrentStep,
    getStepErrors,
    hasStepErrors,
    errors,
  }
}
