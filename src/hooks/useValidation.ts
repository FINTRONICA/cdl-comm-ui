import { useMutation } from '@tanstack/react-query'
import { 
  ValidationService, 
  type AccountValidationRequest,
  type BICValidationRequest,
  type SwiftValidationRequest,
  type IBANValidationRequest,
  type ValidationResponse
} from '@/services/api/validationService'

// Hook for account validation
export const useValidateAccount = () => {
  return useMutation({
    mutationFn: (data: AccountValidationRequest): Promise<ValidationResponse> => 
      ValidationService.validateAccount(data),
    retry: 1, // Don't retry validation failures
    onError: (error) => {
      console.error('Account validation error:', error)
    },
  })
}

// Hook for BIC validation
export const useValidateBIC = () => {
  return useMutation({
    mutationFn: (data: BICValidationRequest): Promise<ValidationResponse> => 
      ValidationService.validateBIC(data),
    retry: 1, // Don't retry validation failures
    onError: (error) => {
      console.error('BIC validation error:', error)
    },
  })
}

// Hook for SWIFT validation
export const useValidateSwift = () => {
  return useMutation({
    mutationFn: (data: SwiftValidationRequest): Promise<ValidationResponse> => 
      ValidationService.validateSwift(data),
    retry: 1, // Don't retry validation failures
    onError: (error) => {
      console.error('SWIFT validation error:', error)
    },
  })
}

// Hook for IBAN validation
export const useValidateIBAN = () => {
  return useMutation({
    mutationFn: (data: IBANValidationRequest): Promise<ValidationResponse> => 
      ValidationService.validateIBAN(data),
    retry: 1, // Don't retry validation failures
    onError: (error) => {
      console.error('IBAN validation error:', error)
    },
  })
}

// Combined hook for beneficiary data validation
export const useValidateBeneficiaryData = () => {
  return useMutation({
    mutationFn: (data: {
      accountNumber?: string
      swiftCode?: string
      bankName?: string
      countryCode?: string
    }) => ValidationService.validateBeneficiaryData(data),
    retry: 1, // Don't retry validation failures
    onError: (error) => {
      console.error('Beneficiary data validation error:', error)
    },
  })
}

// Utility hook for getting validation status
export const useValidationStatus = () => {
  const validateAccount = useValidateAccount()
  const validateSwift = useValidateSwift()
  
  return {
    // Account validation
    isAccountValidating: validateAccount.isPending,
    accountValidationResult: validateAccount.data,
    accountValidationError: validateAccount.error,
    validateAccount: validateAccount.mutate,
    resetAccountValidation: validateAccount.reset,
    
    // SWIFT validation
    isSwiftValidating: validateSwift.isPending,
    swiftValidationResult: validateSwift.data,
    swiftValidationError: validateSwift.error,
    validateSwift: validateSwift.mutate,
    resetSwiftValidation: validateSwift.reset,
    
    // Combined status
    isAnyValidating: validateAccount.isPending || validateSwift.isPending,
    hasAnyError: !!validateAccount.error || !!validateSwift.error,
  }
}
