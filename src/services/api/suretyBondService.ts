import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS, buildApiUrl } from '@/constants/apiEndpoints'

export interface SuretyBondTypeDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: string | null
  remarks: string | null
  status: string | null
  enabled: boolean
  deleted: boolean | null
}

export interface RealEstateAssetDTO {
  id: number
  reaId: string
  reaCif: string
  reaName: string
  reaNameLocal: string
  reaLocation: string
  reaReraNumber: string
  reaStartDate: string
  reaCompletionDate: string
  reaPercentComplete: string
  reaConstructionCost: number
  reaAccStatusDate: string
  reaRegistrationDate: string
  reaNoOfUnits: number
  reaRemarks: string
  reaSpecialApproval: string
  reaManagedBy: string
  reaBackupUser: string
  reaRetentionPercent: string
  reaAdditionalRetentionPercent: string
  reaTotalRetentionPercent: string
  reaRetentionEffectiveDate: string
  reaManagementExpenses: string
  reaMarketingExpenses: string
  reaAccoutStatusDate: string
  reaTeamLeadName: string
  reaRelationshipManagerName: string
  reaAssestRelshipManagerName: string
  reaRealEstateBrokerExp: number
  reaAdvertisementExp: number
  reaLandOwnerName: string
  buildPartnerDTO: BuildPartnerDTO | null
  reaStatusDTO: any | null
  reaTypeDTO: any | null
  reaAccountStatusDTO: any | null
  reaConstructionCostCurrencyDTO: any | null
  status: any | null
  reaBlockPaymentTypeDTO: any | null
  deleted: boolean
  enabled: boolean
  taskStatusDTO: any | null
}

export interface BuildPartnerDTO {
  id: number
}

export interface IssuerBankDTO {
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
  branchDTOS: any | null
  deleted: boolean
  enabled: boolean
}

export interface SuretyBondRequest {
  suretyBondReferenceNumber?: string | null
  suretyBondDate?: string | null
  suretyBondName?: string | null
  suretyBondTypeDTO?: { id: number } | null
  realEstateAssestDTO?: { id: number } | null
  buildPartnerDTO?: { id: number } | null
  suretyBondOpenEnded?: boolean | null
  suretyBondNoOfAmendment?: string | null
  suretyBondExpirationDate?: string | null
  suretyBondAmount?: number | null
  issuerBankDTO?: { id: number } | null
  suretyBondNewReadingAmendment?: string | null
}

export interface SuretyBondResponse {
  id: number
  suretyBondReferenceNumber: string
  suretyBondDate: string
  suretyBondName: string
  suretyBondOpenEnded: boolean
  suretyBondExpirationDate: string
  suretyBondAmount: number
  suretyBondProjectCompletionDate: string | null
  suretyBondNoOfAmendment: string
  suretyBondContractor: any | null
  deleted: boolean | null
  enabled: boolean | null
  suretyBondNewReadingAmendment: string
  suretyBondTypeDTO: SuretyBondTypeDTO
  realEstateAssestDTO: RealEstateAssetDTO
  issuerBankDTO: IssuerBankDTO
  suretyBondStatusDTO: any | null
  taskStatusDTO: any | null
  buildPartnerDTO: BuildPartnerDTO | null
  createdDate?: string
  lastModifiedDate?: string
  createdBy?: string
  lastModifiedBy?: string
}

export interface SuretyBondListResponse {
  content: SuretyBondResponse[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface SuretyBondSearchParams {
  page?: number
  size?: number
  sort?: string
  search?: string
  suretyBondReferenceNumber?: string
  suretyBondName?: string
  suretyBondTypeId?: number
  realEstateAssetId?: number
  buildPartnerId?: number
  issuerBankId?: number
  suretyBondOpenEnded?: boolean
  suretyBondAmountMin?: number
  suretyBondAmountMax?: number
  suretyBondDateFrom?: string
  suretyBondDateTo?: string
  suretyBondExpirationDateFrom?: string
  suretyBondExpirationDateTo?: string
}

export class SuretyBondService {
  /**
   * Get all surety bonds with pagination
   * @param params - Search parameters
   * @returns Promise<SuretyBondListResponse>
   */
  async getSuretyBonds(
    params: SuretyBondSearchParams = {}
  ): Promise<SuretyBondListResponse> {
    try {
      const {
        page = 0,
        size = 20,
        sort,
        search,
        suretyBondReferenceNumber,
        suretyBondName,
        suretyBondTypeId,
        realEstateAssetId,
        buildPartnerId,
        issuerBankId,
        suretyBondOpenEnded,
        suretyBondAmountMin,
        suretyBondAmountMax,
        suretyBondDateFrom,
        suretyBondDateTo,
        suretyBondExpirationDateFrom,
        suretyBondExpirationDateTo,
      } = params

      let url = buildApiUrl(API_ENDPOINTS.SURETY_BOND.FIND_ALL)
      const queryParams = new URLSearchParams()

      if (page !== undefined) queryParams.append('page', page.toString())
      if (size !== undefined) queryParams.append('size', size.toString())
      if (sort) queryParams.append('sort', sort)
      if (search) queryParams.append('search', search)
      if (suretyBondReferenceNumber)
        queryParams.append(
          'suretyBondReferenceNumber',
          suretyBondReferenceNumber
        )
      if (suretyBondName) queryParams.append('suretyBondName', suretyBondName)
      if (suretyBondTypeId)
        queryParams.append('suretyBondTypeId', suretyBondTypeId.toString())
      if (realEstateAssetId)
        queryParams.append('realEstateAssetId', realEstateAssetId.toString())
      if (buildPartnerId)
        queryParams.append('buildPartnerId', buildPartnerId.toString())
      if (issuerBankId)
        queryParams.append('issuerBankId', issuerBankId.toString())
      if (suretyBondOpenEnded !== undefined)
        queryParams.append(
          'suretyBondOpenEnded',
          suretyBondOpenEnded.toString()
        )
      if (suretyBondAmountMin !== undefined)
        queryParams.append(
          'suretyBondAmountMin',
          suretyBondAmountMin.toString()
        )
      if (suretyBondAmountMax !== undefined)
        queryParams.append(
          'suretyBondAmountMax',
          suretyBondAmountMax.toString()
        )
      if (suretyBondDateFrom)
        queryParams.append('suretyBondDateFrom', suretyBondDateFrom)
      if (suretyBondDateTo)
        queryParams.append('suretyBondDateTo', suretyBondDateTo)
      if (suretyBondExpirationDateFrom)
        queryParams.append(
          'suretyBondExpirationDateFrom',
          suretyBondExpirationDateFrom
        )
      if (suretyBondExpirationDateTo)
        queryParams.append(
          'suretyBondExpirationDateTo',
          suretyBondExpirationDateTo
        )

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }

      const result = await apiClient.get<SuretyBondListResponse>(url)

      return result
    } catch (error) {
      console.error(
        'SuretyBondService.getSuretyBonds Failed:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async getSuretyBondById(id: string | number): Promise<SuretyBondResponse> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.SURETY_BOND.GET_BY_ID(id.toString())
      )

      const result = await apiClient.get<SuretyBondResponse>(url)

      return result
    } catch (error) {
      console.error(
        'SuretyBondService.getSuretyBondById Failed:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async createSuretyBond(data: SuretyBondRequest): Promise<SuretyBondResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SURETY_BOND.SAVE)

      this.validateSuretyBondData(data)

      const result = await apiClient.post<SuretyBondResponse>(url, data)

      return result
    } catch (error) {
      console.error(
        'SuretyBondService.createSuretyBond Failed:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async updateSuretyBond(
    id: string | number,
    data: Partial<SuretyBondRequest>
  ): Promise<SuretyBondResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SURETY_BOND.UPDATE(id.toString()))

      const result = await apiClient.put<SuretyBondResponse>(url, data)

      return result
    } catch (error) {
      console.error(
        'SuretyBondService.updateSuretyBond Failed:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async deleteSuretyBond(id: string | number): Promise<void> {
    try {
      const url = buildApiUrl(
        API_ENDPOINTS.SURETY_BOND.SOFT_DELETE(id.toString())
      )

      await apiClient.delete(url)
    } catch (error) {
      console.error(
        'SuretyBondService.deleteSuretyBond Failed:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async searchSuretyBonds(
    searchTerm: string,
    page: number = 0,
    size: number = 20
  ): Promise<SuretyBondListResponse> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SURETY_BOND.FIND_ALL)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        search: searchTerm,
      })

      const fullUrl = `${url}?${queryParams.toString()}`

      const result = await apiClient.get<SuretyBondListResponse>(fullUrl)

      return result
    } catch (error) {
      console.error(
        'SuretyBondService.searchSuretyBonds Failed:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async getAllSuretyBonds(): Promise<SuretyBondResponse[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SURETY_BOND.GET_ALL)

      const result = await apiClient.get<SuretyBondResponse[]>(url)

      return result
    } catch (error) {
      console.error(
        'SuretyBondService.getAllSuretyBonds Failed:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  private validateSuretyBondData(data: SuretyBondRequest): void {
    if (
      data.suretyBondReferenceNumber !== null &&
      data.suretyBondReferenceNumber !== undefined &&
      (!data.suretyBondReferenceNumber ||
        data.suretyBondReferenceNumber.trim() === '')
    ) {
      throw new Error('Surety bond reference number is required')
    }

    if (
      data.suretyBondDate !== null &&
      data.suretyBondDate !== undefined &&
      (!data.suretyBondDate || data.suretyBondDate.trim() === '')
    ) {
      throw new Error('Surety bond date is required')
    }

    if (
      data.suretyBondTypeDTO !== null &&
      data.suretyBondTypeDTO !== undefined &&
      (!data.suretyBondTypeDTO || !data.suretyBondTypeDTO?.id)
    ) {
      throw new Error('Surety bond type is required')
    }

    if (
      data.realEstateAssestDTO !== null &&
      data.realEstateAssestDTO !== undefined &&
      (!data.realEstateAssestDTO || !data.realEstateAssestDTO?.id)
    ) {
      throw new Error('Real estate asset is required')
    }

    if (
      data.buildPartnerDTO !== null &&
      data.buildPartnerDTO !== undefined &&
      (!data.buildPartnerDTO || !data.buildPartnerDTO?.id)
    ) {
      throw new Error('Build partner is required')
    }

    if (
      data.issuerBankDTO !== null &&
      data.issuerBankDTO !== undefined &&
      (!data.issuerBankDTO || !data.issuerBankDTO?.id)
    ) {
      throw new Error('Issuer bank is required')
    }

    if (
      data.suretyBondAmount !== null &&
      data.suretyBondAmount !== undefined &&
      data.suretyBondAmount < 0
    ) {
      throw new Error('Surety bond amount must be greater than or equal to 0')
    }

    if (
      data.suretyBondExpirationDate !== null &&
      data.suretyBondExpirationDate !== undefined &&
      (!data.suretyBondExpirationDate ||
        data.suretyBondExpirationDate.trim() === '')
    ) {
      throw new Error('Surety bond expiration date is required')
    }
  }
}

export const suretyBondService = new SuretyBondService()
