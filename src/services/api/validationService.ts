import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'

// Types for validation requests and responses
export interface AccountValidationRequest {
  accountNumber: string
  bankName?: string | undefined
  countryCode?: string | undefined
}

export interface BICValidationRequest {
  bicCode: string
  bankName?: string | undefined
}

export interface SwiftValidationRequest {
  swiftCode: string
  bankName?: string | undefined
}

export interface IBANValidationRequest {
  iban: string
  countryCode?: string | undefined
}

export interface ValidationResponse {
  isValid: boolean
  message: string
  details?: {
    bankName?: string
    bankCode?: string
    country?: string
    branchCode?: string
    accountType?: string
    status?: string
  }
  errorCode?: string
  suggestions?: string[]
}

export interface ValidationError {
  code: string
  message: string
  field?: string
}

const ERROR_MESSAGE = 'Failed to validate data'

export class ValidationService {
  
  static async validateAccount(data: AccountValidationRequest): Promise<ValidationResponse> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const accountNumber = data.accountNumber
      const apiUrl = API_ENDPOINTS.VALIDATION.CORE_BANK_ACCOUNT(accountNumber)
      
     
      
      const response = await apiClient.get<any>(
        apiUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      )
      
      // Transform the response to match our ValidationResponse interface
      const validationResponse = this.transformCoreBankResponse(response, data.accountNumber)
      
     
      
      return validationResponse
    } catch (error) {
      
      throw new Error(ERROR_MESSAGE)
    }
  }



  /**
   * Transform core bank API response to ValidationResponse format
   */
  private static transformCoreBankResponse(response: any, accountNumber: string): ValidationResponse {
    try {
   
      let isValid = false
      let message = 'Account validation failed'
      
      
      
      // Primary check: If we have account details, it's valid
      if (response?.accountNumber && response?.cif && response?.bankName) {
        isValid = true
        message = `Account ${response.accountNumber} is valid`
   
      }
      
      // Secondary check: If we have any account-related fields
      else if (response?.accountNumber || response?.cif || response?.name || response?.details) {
        isValid = true
        message = 'Account found and validated'
        
      }
      
      // Fallback checks for other response formats
      else if (response?.accountStatus === 'valid' || 
               response?.isValid === true ||
               response?.success === true ||
               response?.valid === true ||
               response?.accountValid === true ||
               response?.isAccountValid === true) {
        isValid = true
        message = 'Account is valid'
      
      }
   
     
      
      return {
        isValid,
        message: message || (isValid ? 'Account is valid' : 'Account validation failed'),
        details: {
          bankName: response?.bankName,
          bankCode: response?.bankCode,
          accountType: response?.schemeType || response?.accountType,
          branchCode: response?.branchCode,
        },
        suggestions: response?.suggestions || []
      }
    } catch (error) {
      
      return {
        isValid: false,
        message: 'Failed to process validation response',
        suggestions: ['Please check the account number and try again']
      }
    }
  }

  /**
   * Transform core bank SWIFT API response to ValidationResponse format
   */
  private static transformCoreBankSwiftResponse(response: any, swiftCode: string): ValidationResponse {
    try {
     
      
      // Check if response contains SWIFT information (indicates success)
      // Based on the actual API response structure
      let isValid = false
      let message = 'SWIFT validation failed'
      
    
      
      // Primary check: If we have valid SWIFT response
      if (response?.valid === true && response?.swiftCode) {
        isValid = true
        message = response?.message || `SWIFT code ${response.swiftCode} is valid`
      }
      
      // Secondary check: If we have SWIFT code and success indicators
      else if (response?.swiftCode && (response?.valid === true || response?.status === 'valid')) {
        isValid = true
        message = 'SWIFT code found and validated'
      }
      
      // Fallback checks for other response formats
      else if (response?.isValid === true ||
               response?.success === true) {
        isValid = true
        message = 'SWIFT code is valid'
      }
      
    
      
      return {
        isValid,
        message: message || (isValid ? 'SWIFT code is valid' : 'SWIFT validation failed'),
        suggestions: response?.suggestions || []
      }
    } catch (error) {
     
      return {
        isValid: false,
        message: 'Failed to process SWIFT validation response',
        suggestions: ['Please check the SWIFT code and try again']
      }
    }
  }

 
  static async validateBIC(data: BICValidationRequest): Promise<ValidationResponse> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
     
      
      const response = await apiClient.post<ValidationResponse>(
        API_ENDPOINTS.VALIDATION.BIC,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
  
      
      return response
    } catch (error) {
     
      throw new Error(ERROR_MESSAGE)
    }
  }

  /**
   * Validate SWIFT code using core bank API
   */
  static async validateSwift(data: SwiftValidationRequest): Promise<ValidationResponse> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      
      // Use the new core bank SWIFT API endpoint
      const swiftCode = data.swiftCode
      const apiUrl = API_ENDPOINTS.VALIDATION.CORE_BANK_SWIFT(swiftCode)
      
    
      
      const response = await apiClient.get<any>(
        apiUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      )
      
      const validationResponse = this.transformCoreBankSwiftResponse(response, data.swiftCode)
      
   
      
      return validationResponse
    } catch (error) {
     
      throw new Error(ERROR_MESSAGE)
    }
  }

  /**
   * Validate IBAN
   */
  static async validateIBAN(data: IBANValidationRequest): Promise<ValidationResponse> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
     
      
      const response = await apiClient.post<ValidationResponse>(
        API_ENDPOINTS.VALIDATION.IBAN,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
     
      
      return response
    } catch (error) {
      
      throw new Error(ERROR_MESSAGE)
    }
  }

  /**
   * Validate multiple fields at once
   */
  static async validateBeneficiaryData(data: {
    accountNumber?: string
    swiftCode?: string
    bankName?: string
    countryCode?: string
  }): Promise<{
    account?: ValidationResponse
    swift?: ValidationResponse
    overall: ValidationResponse
  }> {
    try {
      const results: any = { overall: { isValid: true, message: 'All validations passed' } }
      
      // Validate account number if provided
      if (data.accountNumber) {
        results.account = await this.validateAccount({
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          countryCode: data.countryCode
        })
        if (!results.account.isValid) {
          results.overall.isValid = false
          results.overall.message = 'Account validation failed'
        }
      }
      
      // Validate SWIFT code if provided
      if (data.swiftCode) {
        results.swift = await this.validateSwift({
          swiftCode: data.swiftCode,
          bankName: data.bankName
        })
        if (!results.swift.isValid) {
          results.overall.isValid = false
          results.overall.message = 'SWIFT validation failed'
        }
      }
      
      return results
    } catch (error) {
      
      throw new Error(ERROR_MESSAGE)
    }
  }
}
