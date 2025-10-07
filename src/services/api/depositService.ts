import { apiClient } from '@/lib/apiClient'

export interface DepositData {
  id?: number
  depositRefNo: string
  dealNo: string
  clientName: string
  depositReceivableCategory: string
  depositReceivableAmount: string
  subDepositType: string
  transactionDate: string
  transactionReference: string
  escrowAccountNumber: string
  transactionDescription: string
  transactionAmount: string
  transactionDate2: string
  narration: string
}

export interface CreateDepositRequest {
  depositRefNo: string
  dealNo: string
  clientName: string
  depositReceivableCategory: string
  depositReceivableAmount: string
  subDepositType: string
  transactionDate: string
  transactionReference: string
  escrowAccountNumber: string
  transactionDescription: string
  transactionAmount: string
  transactionDate2: string
  narration: string
}

export interface UpdateDepositRequest {
  depositRefNo?: string
  dealNo?: string
  clientName?: string
  depositReceivableCategory?: string
  depositReceivableAmount?: string
  subDepositType?: string
  transactionDate?: string
  transactionReference?: string
  escrowAccountNumber?: string
  transactionDescription?: string
  transactionAmount?: string
  transactionDate2?: string
  narration?: string
}

export interface DepositFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

export interface DepositResponse {
  content: DepositData[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface DropdownOption {
  id: string
  displayName: string
  settingValue?: string
}

export const depositService = {
  // Get deposits with filters and pagination
  getDeposits: async (filters: DepositFilters = {}): Promise<DepositResponse> => {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.page !== undefined) params.append('page', filters.page.toString())
      if (filters.size !== undefined) params.append('size', filters.size.toString())

      const response = await apiClient.get(`/api/deposits?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching deposits:', error)
      throw error
    }
  },

  // Get a single deposit by ID
  getDeposit: async (id: string): Promise<DepositData> => {
    try {
      const response = await apiClient.get(`/api/deposits/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching deposit ${id}:`, error)
      throw error
    }
  },

  // Create a new deposit
  createDeposit: async (data: CreateDepositRequest): Promise<DepositData> => {
    try {
      const response = await apiClient.post('/api/deposits', data)
      return response.data
    } catch (error) {
      console.error('Error creating deposit:', error)
      throw error
    }
  },

  // Update an existing deposit
  updateDeposit: async (id: string, data: UpdateDepositRequest): Promise<DepositData> => {
    try {
      const response = await apiClient.put(`/api/deposits/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating deposit ${id}:`, error)
      throw error
    }
  },

  // Delete a deposit
  deleteDeposit: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/deposits/${id}`)
    } catch (error) {
      console.error(`Error deleting deposit ${id}:`, error)
      throw error
    }
  },

  // Get deposit categories for dropdown
  getDepositCategories: async (): Promise<DropdownOption[]> => {
    try {
      const response = await apiClient.get('/api/deposits/categories')
      return response.data
    } catch (error) {
      console.error('Error fetching deposit categories:', error)
      // Return mock data if API fails
      return [
        { id: 'initial', displayName: 'Initial Deposit', settingValue: 'INITIAL_DEPOSIT' },
        { id: 'security', displayName: 'Security Deposit', settingValue: 'SECURITY_DEPOSIT' },
        { id: 'performance', displayName: 'Performance Deposit', settingValue: 'PERFORMANCE_DEPOSIT' },
      ]
    }
  },

  // Get sub deposit types for dropdown
  getSubDepositTypes: async (): Promise<DropdownOption[]> => {
    try {
      const response = await apiClient.get('/api/deposits/sub-types')
      return response.data
    } catch (error) {
      console.error('Error fetching sub deposit types:', error)
      // Return mock data if API fails
      return [
        { id: 'property', displayName: 'Property Deposit', settingValue: 'PROPERTY_DEPOSIT' },
        { id: 'rental', displayName: 'Rental Deposit', settingValue: 'RENTAL_DEPOSIT' },
        { id: 'contract', displayName: 'Contract Deposit', settingValue: 'CONTRACT_DEPOSIT' },
      ]
    }
  },

  // Get deal options for dropdown
  getDealOptions: async (): Promise<DropdownOption[]> => {
    try {
      const response = await apiClient.get('/api/deals/options')
      return response.data
    } catch (error) {
      console.error('Error fetching deal options:', error)
      // Return mock data if API fails
      return [
        { id: 'deal001', displayName: 'DEAL001', settingValue: 'DEAL001' },
        { id: 'deal002', displayName: 'DEAL002', settingValue: 'DEAL002' },
        { id: 'deal003', displayName: 'DEAL003', settingValue: 'DEAL003' },
      ]
    }
  },

  // Get client options for dropdown
  getClientOptions: async (): Promise<DropdownOption[]> => {
    try {
      const response = await apiClient.get('/api/clients/options')
      return response.data
    } catch (error) {
      console.error('Error fetching client options:', error)
      // Return mock data if API fails
      return [
        { id: 'client001', displayName: 'ABC Corporation', settingValue: 'ABC_CORP' },
        { id: 'client002', displayName: 'XYZ Ltd', settingValue: 'XYZ_LTD' },
        { id: 'client003', displayName: 'Global Enterprises', settingValue: 'GLOBAL_ENT' },
      ]
    }
  },

  // Get escrow account options for dropdown
  getEscrowAccountOptions: async (): Promise<DropdownOption[]> => {
    try {
      const response = await apiClient.get('/api/escrow-accounts/options')
      return response.data
    } catch (error) {
      console.error('Error fetching escrow account options:', error)
      // Return mock data if API fails
      return [
        { id: 'esc001', displayName: 'ESC001', settingValue: 'ESC001' },
        { id: 'esc002', displayName: 'ESC002', settingValue: 'ESC002' },
        { id: 'esc003', displayName: 'ESC003', settingValue: 'ESC003' },
      ]
    }
  },

  // Generate deposit reference number
  generateDepositRefNo: async (): Promise<string> => {
    try {
      const response = await apiClient.get('/api/deposits/generate-ref-no')
      return response.data.refNo
    } catch (error) {
      console.error('Error generating deposit reference number:', error)
      // Return mock generated ID if API fails
      return `DEP${Date.now().toString().slice(-6)}`
    }
  },
}
