import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { getAuthCookies } from '@/utils/cookieUtils'
import { BankAccountValidationResponse, BankAccountData } from '@/types/bankAccount'

const ERROR_MESSAGE = 'Bank Account Service Error'

export class BankAccountService {
  /**
   * Validate bank account by account number
   */
  static async validateAccount(accountNumber: string): Promise<BankAccountValidationResponse> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const validationResponse = await apiClient.get<BankAccountValidationResponse>(
        API_ENDPOINTS.VALIDATION.CORE_BANK_ACCOUNT(accountNumber),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      
      
      return validationResponse
    } catch (error) {
     
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Save bank account data
   */
  static async saveBankAccount(bankAccountData: BankAccountData): Promise<any> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      
      
      const saveResponse = await apiClient.post(
        API_ENDPOINTS.REAL_ESTATE_BANK_ACCOUNT.SAVE,
        bankAccountData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
     
      
      return saveResponse
    } catch (error) {
     
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update bank account data
   */
  static async updateBankAccount(bankAccountData: BankAccountData): Promise<any> {
    try {
      const { token } = getAuthCookies()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      if (!bankAccountData.id) {
        throw new Error('Account ID is required for update operation')
      }
      
     
      
      const updateResponse = await apiClient.put(
        API_ENDPOINTS.REAL_ESTATE_BANK_ACCOUNT.UPDATE(bankAccountData.id.toString()),
        bankAccountData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
    
      
      return updateResponse
    } catch (error) {
      
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Save multiple bank accounts
   */
  static async saveMultipleBankAccounts(bankAccounts: BankAccountData[]): Promise<any[]> {
    try {
      // Validate that bankAccounts is an array
      if (!Array.isArray(bankAccounts)) {
       
        throw new Error('bankAccounts must be an array')
      }

     
      
      const savePromises = bankAccounts.map(account => this.saveBankAccount(account))
      const results = await Promise.all(savePromises)
      
     
      
      return results
    } catch (error) {
      
      throw new Error(`${ERROR_MESSAGE}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
