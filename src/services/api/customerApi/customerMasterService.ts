import { apiClient } from '@/lib/apiClient'
import {
  buildApiUrl,
  buildPaginationParams,
  API_ENDPOINTS,
} from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

// Customer Master DTO interface
export interface CustomerMasterDTO {
  id: number
  customerId: string
  cifExist: boolean
  partyCif: string | null
  personName: string | null
  personAddress1: string | null
  personAddress2: string | null
  personAddress3: string | null
  telephoneNo: string | null
  mobileNo: string | null
  emailId: string | null
  cifOfPerson: string | null
  noticePerson: string | null
  noticePersonEmailId: string | null
  noticePersonSignature: string | null
  cifNumber: string | null
  customerName: string | null
  address1: string | null
  address2: string | null
  address3: string | null
  telephone: string | null
  mobile: string | null
  email: string | null
  emiratesId: string | null
  passportDetails: string | null
  partyConstituent: string | null
  role: string | null
  rmName: string | null
  backupProjectAccountOwner: string | null
  projectAccountOwner: string | null
  armName: string | null
  teamLeader: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
  deleted: boolean
  enabled: boolean
}

// Create Customer Master Request interface
export interface CreateCustomerMasterRequest {
  customerId: string
  cifExist: boolean
  partyCif?: string
  personName?: string
  personAddress1?: string
  personAddress2?: string
  personAddress3?: string
  telephoneNo?: string
  mobileNo?: string
  emailId?: string
  cifOfPerson?: string
  noticePerson?: string
  noticePersonEmailId?: string
  noticePersonSignature?: string
  cifNumber?: string
  customerName?: string
  address1?: string
  address2?: string
  address3?: string
  telephone?: string
  mobile?: string
  email?: string
  emiratesId?: string
  passportDetails?: string
  partyConstituent?: string
  role?: string
  rmName?: string
  backupProjectAccountOwner?: string
  projectAccountOwner?: string
  armName?: string
  teamLeader?: string
  remarks?: string
}

// Update Customer Master Request interface
export interface UpdateCustomerMasterRequest {
  customerId?: string
  cifExist?: boolean
  partyCif?: string
  personName?: string
  personAddress1?: string
  personAddress2?: string
  personAddress3?: string
  telephoneNo?: string
  mobileNo?: string
  emailId?: string
  cifOfPerson?: string
  noticePerson?: string
  noticePersonEmailId?: string
  noticePersonSignature?: string
  cifNumber?: string
  customerName?: string
  address1?: string
  address2?: string
  address3?: string
  telephone?: string
  mobile?: string
  email?: string
  emiratesId?: string
  passportDetails?: string
  partyConstituent?: string
  role?: string
  rmName?: string
  backupProjectAccountOwner?: string
  projectAccountOwner?: string
  armName?: string
  teamLeader?: string
  remarks?: string
}

// Customer Master Filters interface
export interface CustomerMasterFilters {
  customerId?: string
  customerName?: string
  partyCif?: string
  email?: string
  mobile?: string
  enabled?: boolean
}

// UI-friendly Customer Master interface for table display
export interface CustomerMasterUIData {
  id: string
  customerId: string
  customerName: string
  partyCif: string
  email: string
  mobile: string
  role: string
  createdAt?: string
  updatedAt?: string
  status: string
}

// Customer Master field constants
export const CUSTOMER_FIELDS = {
  customerId: "customerId",
  cifExist: "cifExist",
  partyCif: "partyCif",
  personName: "personName",
  personAddress1: "personAddress1",
  personAddress2: "personAddress2",
  personAddress3: "personAddress3",
  telephoneNo: "telephoneNo",
  mobileNo: "mobileNo",
  emailId: "emailId",
  cifOfPerson: "cifOfPerson",
  noticePerson: "noticePerson",
  noticePersonEmailId: "noticePersonEmailId",
  noticePersonSignature: "noticePersonSignature",
  cifNumber: "cifNumber",
  customerName: "customerName",
  address1: "address1",
  address2: "address2",
  address3: "address3",
  telephone: "telephone",
  mobile: "mobile",
  email: "email",
  emiratesId: "emiratesId",
  passportDetails: "passportDetails",
  partyConstituent: "partyConstituent",
  role: "role",
  rmName: "rmName",
  backupProjectAccountOwner: "backupProjectAccountOwner",
  projectAccountOwner: "projectAccountOwner",
  armName: "armName",
  teamLeader: "teamLeader",
  remarks: "remarks",
}

// Utility function to map API CustomerMaster to UI CustomerMasterUIData
export const mapCustomerMasterToUIData = (
  apiData: CustomerMasterDTO
): CustomerMasterUIData => {
  return {
    id: apiData.id.toString(),
    customerId: apiData.customerId || 'N/A',
    customerName: apiData.customerName || 'N/A',
    partyCif: apiData.partyCif || 'N/A',
    email: apiData.email || 'N/A',
    mobile: apiData.mobile || 'N/A',
    role: apiData.role || 'N/A',
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    status: apiData.enabled ? 'Active' : 'Inactive',
  }
}

export class CustomerMasterService {
  async getCustomerMasters(
    page = 0,
    size = 20,
    filters?: CustomerMasterFilters
  ): Promise<PaginatedResponse<CustomerMasterDTO>> {
    // Map UI filter names to API field names
    const apiFilters: Record<string, string> = {}
    if (filters) {
      if (filters.customerId) {
        apiFilters.customerId = filters.customerId
      }
      if (filters.customerName) {
        apiFilters.customerName = filters.customerName
      }
      if (filters.partyCif) {
        apiFilters.partyCif = filters.partyCif
      }
      if (filters.email) {
        apiFilters.email = filters.email
      }
      if (filters.mobile) {
        apiFilters.mobile = filters.mobile
      }
      if (filters.enabled !== undefined) {
        apiFilters.enabled = filters.enabled.toString()
      }
    }

    const params = {
      ...buildPaginationParams(page, size),
      ...apiFilters,
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.CUSTOMER_MASTER.FIND_ALL)}?${queryString}`

    try {
      const result = await apiClient.get<PaginatedResponse<CustomerMasterDTO>>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async getCustomerMaster(id: string): Promise<CustomerMasterDTO> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.CUSTOMER_MASTER.GET_BY_ID(id))
      const result = await apiClient.get<CustomerMasterDTO>(url)
      return result
    } catch (error) {
      throw error
    }
  }

  async createCustomerMaster(
    data: CreateCustomerMasterRequest
  ): Promise<CustomerMasterDTO> {
    try {
      const result = await apiClient.post<CustomerMasterDTO>(
        buildApiUrl(API_ENDPOINTS.CUSTOMER_MASTER.SAVE),
        data
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async updateCustomerMaster(
    id: string,
    updates: UpdateCustomerMasterRequest
  ): Promise<CustomerMasterDTO> {
    try {
      const result = await apiClient.put<CustomerMasterDTO>(
        buildApiUrl(API_ENDPOINTS.CUSTOMER_MASTER.UPDATE(id)),
        updates
      )
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteCustomerMaster(id: string): Promise<void> {
    try {
      await apiClient.delete<string>(
        buildApiUrl(API_ENDPOINTS.CUSTOMER_MASTER.SOFT_DELETE(id))
      )
    } catch (error) {
      throw error
    }
  }

  async getCustomerMasterByCif(cif: string): Promise<CustomerMasterDTO> {
    try {
      const params = { partyCif: cif }
      const queryString = new URLSearchParams(params).toString()
      const url = `${buildApiUrl(API_ENDPOINTS.CUSTOMER_MASTER.FIND_ALL)}?${queryString}`

      const result = await apiClient.get<PaginatedResponse<CustomerMasterDTO>>(url)

      if (result?.content && result.content.length > 0) {
        const customerMaster = result.content[0]
        if (customerMaster) {
          return customerMaster
        }
      }
      throw new Error(`No customer master found with CIF: ${cif}`)
    } catch (error) {
      throw error
    }
  }

  /**
   * Search customer masters by name with pagination
   * Used for autocomplete functionality
   */
  async searchCustomerMasters(
    query: string,
    page = 0,
    size = 20
  ): Promise<CustomerMasterDTO[]> {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }

      const params = {
        ...buildPaginationParams(page, size),
        'customerName.contains': query.trim(),
        'deleted.equals': 'false',
        'enabled.equals': 'true',
      }
      const url = `${buildApiUrl(API_ENDPOINTS.CUSTOMER_MASTER.SAVE)}?${new URLSearchParams(params).toString()}`
      const response = await apiClient.get(url)
      
      // Handle both single object and paginated response formats
      let customerMasters: CustomerMasterDTO[] = []
      
      if (Array.isArray(response)) {
        // Direct array response
        customerMasters = response
      } else if (response && typeof response === 'object') {
        if ('content' in response && Array.isArray(response.content)) {
          // Paginated response format
          customerMasters = response.content
        } else if ('id' in response || 'customerName' in response) {
          // Single object response - wrap in array
          customerMasters = [response as CustomerMasterDTO]
        }
      }
      
      return customerMasters
    } catch (error) {
      throw new Error('Failed to search customer masters')
    }
  }

  // Utility method to transform API response to UI-friendly format
  transformToUIData(
    apiResponse: PaginatedResponse<CustomerMasterDTO>
  ): PaginatedResponse<CustomerMasterUIData> {
    return {
      content: apiResponse.content.map((item) => mapCustomerMasterToUIData(item)),
      page: apiResponse.page,
    }
  }

  // Utility method to get UI-friendly data directly
  async getCustomerMastersUIData(
    page = 0,
    size = 20,
    filters?: CustomerMasterFilters
  ): Promise<PaginatedResponse<CustomerMasterUIData>> {
    const apiResponse = await this.getCustomerMasters(page, size, filters)
    return this.transformToUIData(apiResponse)
  }
}

export const customerMasterService = new CustomerMasterService()
