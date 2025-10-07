import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'

// Financial Institution Types
export interface BankBranchDTO {
  id: number
  bankBranchName: string
  bankBranchAddress: string
  bankBranchCode: string
  bankBranchIfscCode: string
  bankBranchSwiftCode: string
  bankBranchRoutingCode: string
  bankBranchTtcCode: string
  deleted: boolean
}

export interface FinancialInstitution {
  id: number
  fiName: string
  fiAddress: string
  fiContactNumber: string
  fiCode: string
  fiAccountNumber: string
  fiAccountBalance: number
  fiIbanNo: string
  fiOpeningDate: string
  fiAccountTitle: string
  fiSwiftCode: string
  fiRoutingCode: string
  fiSchemeType: string
  branchDTOS: BankBranchDTO[] | null
  deleted: boolean
  enabled: boolean
}

export interface FinancialInstitutionRequest {
  id?: number
  fiName: string
  fiAddress: string
  fiContactNumber: string
  fiCode: string
  fiAccountNumber: string
  fiAccountBalance?: number
  fiIbanNo: string
  fiOpeningDate: string
  fiAccountTitle: string
  fiSwiftCode: string
  fiRoutingCode: string
  fiSchemeType: string
  branchDTOS?: BankBranchDTO[]
  deleted?: boolean
  enabled?: boolean
}

export interface FinancialInstitutionResponse {
  id: number
  fiName: string
  fiAddress: string
  fiContactNumber: string
  fiCode: string
  fiAccountNumber: string
  fiAccountBalance: number
  fiIbanNo: string
  fiOpeningDate: string
  fiAccountTitle: string
  fiSwiftCode: string
  fiRoutingCode: string
  fiSchemeType: string
  branchDTOS: BankBranchDTO[] | null
  deleted: boolean
  enabled: boolean
}

export interface FinancialInstitutionListResponse {
  content: FinancialInstitution[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface FinancialInstitutionSearchParams {
  page?: number
  size?: number
  sort?: string
  search?: string
  fiName?: string
  fiCode?: string
  fiAccountNumber?: string
  fiIbanNo?: string
  fiAccountTitle?: string
  fiSwiftCode?: string
  fiSchemeType?: string
  enabled?: boolean
}

export class FinancialInstitutionService {
  /**
   * Get all financial institutions with pagination
   * @param params - Search parameters
   * @returns Promise<FinancialInstitutionListResponse>
   */
  async getFinancialInstitutions(
    params: FinancialInstitutionSearchParams = {}
  ): Promise<FinancialInstitutionListResponse> {
    try {
      const { 
        page = 0, 
        size = 20, 
        sort, 
        search, 
        fiName, 
        fiCode, 
        fiAccountNumber, 
        fiIbanNo, 
        fiAccountTitle, 
        fiSwiftCode, 
        fiSchemeType,
        enabled
      } = params
      
      let url = buildApiUrl(API_ENDPOINTS.FINANCIAL_INSTITUTION.FIND_ALL)
      const queryParams = new URLSearchParams()
      
      if (page !== undefined) queryParams.append('page', page.toString())
      if (size !== undefined) queryParams.append('size', size.toString())
      if (sort) queryParams.append('sort', sort)
      if (search) queryParams.append('search', search)
      if (fiName) queryParams.append('fiName', fiName)
      if (fiCode) queryParams.append('fiCode', fiCode)
      if (fiAccountNumber) queryParams.append('fiAccountNumber', fiAccountNumber)
      if (fiIbanNo) queryParams.append('fiIbanNo', fiIbanNo)
      if (fiAccountTitle) queryParams.append('fiAccountTitle', fiAccountTitle)
      if (fiSwiftCode) queryParams.append('fiSwiftCode', fiSwiftCode)
      if (fiSchemeType) queryParams.append('fiSchemeType', fiSchemeType)
      if (enabled !== undefined) queryParams.append('enabled', enabled.toString())
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }
      
      const result = await apiClient.get<FinancialInstitutionListResponse>(url)
      
      return result
    } catch (error) {
      console.error('FinancialInstitutionService.getFinancialInstitutions Failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Get financial institution by ID
   * @param id - Financial institution ID
   * @returns Promise<FinancialInstitution>
   */
  async getFinancialInstitutionById(id: string | number): Promise<FinancialInstitution> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FINANCIAL_INSTITUTION.GET_BY_ID(id.toString()))
      
      const result = await apiClient.get<FinancialInstitution>(url)
      
      return result
    } catch (error) {
      console.error('FinancialInstitutionService.getFinancialInstitutionById Failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Create new financial institution
   * @param data - Financial institution data
   * @returns Promise<FinancialInstitutionResponse>
   */
  async createFinancialInstitution(data: FinancialInstitutionRequest): Promise<FinancialInstitutionResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FINANCIAL_INSTITUTION.SAVE)
      
      // Validate required fields
      this.validateFinancialInstitutionData(data)
      
      const result = await apiClient.post<FinancialInstitutionResponse>(url, data)
      
      return result
    } catch (error) {
      console.error('FinancialInstitutionService.createFinancialInstitution Failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Update financial institution
   * @param id - Financial institution ID
   * @param data - Updated financial institution data
   * @returns Promise<FinancialInstitutionResponse>
   */
  async updateFinancialInstitution(
    id: string | number, 
    data: Partial<FinancialInstitutionRequest>
  ): Promise<FinancialInstitutionResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FINANCIAL_INSTITUTION.UPDATE(id.toString()))
      
      const result = await apiClient.put<FinancialInstitutionResponse>(url, data)
      
      return result
    } catch (error) {
      console.error('FinancialInstitutionService.updateFinancialInstitution Failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Delete financial institution
   * @param id - Financial institution ID
   * @returns Promise<void>
   */
  async deleteFinancialInstitution(id: string | number): Promise<void> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FINANCIAL_INSTITUTION.DELETE(id.toString()))
      
      await apiClient.delete(url)
    } catch (error) {
      console.error('FinancialInstitutionService.deleteFinancialInstitution Failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Search financial institutions by name or code
   * @param searchTerm - Search term
   * @param page - Page number
   * @param size - Page size
   * @returns Promise<FinancialInstitutionListResponse>
   */
  async searchFinancialInstitutions(
    searchTerm: string,
    page: number = 0,
    size: number = 20
  ): Promise<FinancialInstitutionListResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FINANCIAL_INSTITUTION.FIND_ALL)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        search: searchTerm
      })
      
      const fullUrl = `${url}?${queryParams.toString()}`
      
      const result = await apiClient.get<FinancialInstitutionListResponse>(fullUrl)
      
      return result
    } catch (error) {
      console.error('FinancialInstitutionService.searchFinancialInstitutions Failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Get all financial institutions as a simple list (for dropdowns)
   * @returns Promise<FinancialInstitution[]>
   */
  async getAllFinancialInstitutions(): Promise<FinancialInstitution[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FINANCIAL_INSTITUTION.GET_ALL)
      
      const result = await apiClient.get<FinancialInstitution[]>(url)
      
      return result
    } catch (error) {
      console.error('FinancialInstitutionService.getAllFinancialInstitutions Failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Get enabled financial institutions only (for dropdowns)
   * @returns Promise<FinancialInstitution[]>
   */
  async getEnabledFinancialInstitutions(): Promise<FinancialInstitution[]> {
    try {
      const result = await this.getFinancialInstitutions({ enabled: true })
      return result.content.filter(fi => fi.enabled)
    } catch (error) {
      console.error('FinancialInstitutionService.getEnabledFinancialInstitutions Failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Transform financial institution for dropdown usage
   * @param fi - Financial institution
   * @returns Dropdown option
   */
  transformForDropdown(fi: FinancialInstitution): { id: number; displayName: string; settingValue: string } {
    return {
      id: fi.id,
      displayName: fi.fiName,
      settingValue: fi.fiCode
    }
  }

  /**
   * Transform financial institutions list for dropdown usage
   * @param institutions - Financial institutions list
   * @returns Dropdown options
   */
  transformListForDropdown(institutions: FinancialInstitution[]): { id: number; displayName: string; settingValue: string }[] {
    return institutions.map(fi => this.transformForDropdown(fi))
  }

  /**
   * Validate financial institution data
   * @param data - Financial institution data to validate
   */
  private validateFinancialInstitutionData(data: FinancialInstitutionRequest): void {
    if (!data.fiName || data.fiName.trim() === '') {
      throw new Error('Financial institution name is required')
    }
    
    if (!data.fiAddress || data.fiAddress.trim() === '') {
      throw new Error('Financial institution address is required')
    }
    
    if (!data.fiContactNumber || data.fiContactNumber.trim() === '') {
      throw new Error('Financial institution contact number is required')
    }
    
    if (!data.fiCode || data.fiCode.trim() === '') {
      throw new Error('Financial institution code is required')
    }
    
    if (!data.fiAccountNumber || data.fiAccountNumber.trim() === '') {
      throw new Error('Account number is required')
    }
    
    if (!data.fiIbanNo || data.fiIbanNo.trim() === '') {
      throw new Error('IBAN number is required')
    }
    
    if (!data.fiAccountTitle || data.fiAccountTitle.trim() === '') {
      throw new Error('Account title is required')
    }
    
    if (!data.fiSwiftCode || data.fiSwiftCode.trim() === '') {
      throw new Error('SWIFT code is required')
    }
    
    if (!data.fiRoutingCode || data.fiRoutingCode.trim() === '') {
      throw new Error('Routing code is required')
    }
    
    if (!data.fiSchemeType || data.fiSchemeType.trim() === '') {
      throw new Error('Scheme type is required')
    }
    
    if (!data.fiOpeningDate || data.fiOpeningDate.trim() === '') {
      throw new Error('Opening date is required')
    }
  }
}

// Export singleton instance
export const financialInstitutionService = new FinancialInstitutionService()
