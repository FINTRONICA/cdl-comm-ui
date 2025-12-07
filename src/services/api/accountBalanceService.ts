import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, API_ENDPOINTS } from '@/constants/apiEndpoints'

// Account Balance Response Types based on the API response
export interface AccountBalanceDetails {
  genLedgerSubHeadCode: string
  iban: string
  lastStatementDate: number
  lastModificationDate: number
  interestFrequencyType: string
  interestFrequencyStartDate: string
  interestFrequencyWeeknumber: string
  accruedInterest: number
  interestRateCode: string
  interestRate: number
  referAllDebits: boolean
  referAllCredits: boolean
  transferLimits: {
    debitTransfer: number
    creditTransfer: number
  }
}

export interface AccountBalanceResponse {
  id: string
  accountNumber: string
  cif: string
  currencyCode: string
  branchCode: string
  name: string
  shortName: string
  schemeType: string
  schemeCode: string
  transferType: string
  bankName: string
  swiftCode: string
  routingCode: string
  beneficiaryId: string
  details: AccountBalanceDetails
}

export interface AccountBalanceRequest {
  accountNumber: string
  bankCode?: string // Default to 'sbi' but can be made dynamic in future
}

export class AccountBalanceService {
  private static readonly DEFAULT_BANK_CODE = 'sbi'

  /**
   * Fetch account balance by account number
   * @param accountNumber - The account number to fetch balance for
   * @param bankCode - Bank code (defaults to 'sbi')
   * @returns Promise<AccountBalanceResponse>
   */
  async getAccountBalance(accountNumber: string, bankCode: string = AccountBalanceService.DEFAULT_BANK_CODE): Promise<AccountBalanceResponse> {
    try {
      const url = buildApiUrl(`/core-bank-get/${bankCode}/apis/account-status?accountNumber=${accountNumber}`)
      
      
      
      const result = await apiClient.get<AccountBalanceResponse>(url)
      
     
      
      return result
    } catch (error) {
      
      throw error
    }
  }

  /**
   * Get available bank codes (for future dynamic bank selection)
   * @returns Array of available bank codes
   */
  getAvailableBankCodes(): string[] {
    return ['sbi', 'hdfc', 'icici', 'axis', 'kotak'] // Future: fetch from API
  }

  /**
   * Get default bank code
   * @returns Default bank code
   */
  getDefaultBankCode(): string {
    return AccountBalanceService.DEFAULT_BANK_CODE
  }
}

// Create service instance
export const accountBalanceService = new AccountBalanceService()
