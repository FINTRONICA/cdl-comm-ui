import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

// Task Status DTO interface
export interface TaskStatusDTO {
  id: number
  code: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  deleted: boolean
  enabled: boolean
}

// Real Estate Asset types matching the actual API response structure
export interface BuildPartnerDTO {
  id: number
  bpDeveloperId: string
  bpCifrera: string
  bpDeveloperRegNo: string
  bpName: string
  bpMasterName: string
  bpNameLocal?: string
  bpOnboardingDate?: string
  bpContactAddress?: string
  bpContactTel?: string
  bpPoBox?: string
  bpMobile?: string
  bpFax?: string
  bpEmail?: string
  bpLicenseNo?: string
  bpLicenseExpDate?: string
  bpWorldCheckFlag?: string
  bpWorldCheckRemarks?: string
  bpMigratedData?: string
  bpremark?: string
  bpRegulatorDTO?: any
  bpActiveStatusDTO?: any
}

export interface StatusDTO {
  id: number
  settingKey: string
  settingValue: string
  languageTranslationId: {
    id: number
    configId: string
    configValue: string
    content?: string
    status?: string
    enabled: boolean
  }
  remarks?: string
  status?: string
  enabled: boolean
}

export interface RealEstateAsset {
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
  reaRemarks?: string
  reaSpecialApproval?: string
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
  buildPartnerDTO: BuildPartnerDTO
  reaStatusDTO: StatusDTO
  reaTypeDTO: StatusDTO
  reaAccountStatusDTO: StatusDTO
  reaConstructionCostCurrencyDTO: StatusDTO
  status: string
  taskStatusDTO: TaskStatusDTO | null
}

// For backward compatibility with existing UI
export interface ProjectData extends Record<string, unknown> {
  id: number
  name: string
  developerId: string
  developerCif: string
  developerName: string
  projectStatus: string
  approvalStatus: string
  location: string
  reraNumber: string
  startDate: string
  completionDate: string
  percentComplete: string
  constructionCost: number
  currency: string
  totalUnits: number
  remarks?: string
}

export interface CreateRealEstateAssetRequest {
  reaId?: string
  reaCif?: string
  reaName: string
  reaLocation: string
  reaReraNumber: string
  reaAccoutStatusDate?: string
  reaRegistrationDate?: string
  reaStartDate: string
  reaCompletionDate: string
  reaPercentComplete?: string
  reaConstructionCost: number
  reaAccStatusDate?: string
  reaNoOfUnits: number
  reaRemarks?: string
  reaSpecialApproval?: string
  reaManagedBy: string
  reaBackupUser: string
  reaRetentionPercent?: string
  reaAdditionalRetentionPercent?: string
  reaTotalRetentionPercent?: string
  reaRetentionEffectiveDate?: string
  reaManagementExpenses?: string
  reaMarketingExpenses?: string
  reaTeamLeadName: string
  reaRelationshipManagerName: string
  reaAssestRelshipManagerName: string
  reaRealEstateBrokerExp?: number
  reaAdvertisementExp?: number
  reaLandOwnerName: string
  buildPartnerDTO: {
    id: number
  }
  reaStatusDTO: {
    id: number
  }
  reaTypeDTO: {
    id: number
  }
  reaAccountStatusDTO: {
    id: number
  }
  reaConstructionCostCurrencyDTO: {
    id: number
  }
  status?: string
  reaBlockPaymentTypeDTO?: any
}

export interface UpdateRealEstateAssetRequest
  extends Partial<CreateRealEstateAssetRequest> {
  id: number
}

export interface RealEstateAssetFilters {
  search?: string
  status?: string
  type?: string
  location?: string
  developerId?: string
}

export interface RealEstateAssetStats {
  total: number
  active: number
  closed: number
  frozen: number
  approved: number
  inReview: number
  rejected: number
  incomplete: number
}

// Real Estate Asset Service
export class RealEstateAssetService {
  private static instance: RealEstateAssetService

  private constructor() {}

  static getInstance(): RealEstateAssetService {
    if (!RealEstateAssetService.instance) {
      RealEstateAssetService.instance = new RealEstateAssetService()
    }
    return RealEstateAssetService.instance
  }

  // Get projects with filtering and pagination (matching useBuildPartners pattern)
  async getProjects(
    page: number = 0,
    size: number = 20,
    filters?: RealEstateAssetFilters
  ): Promise<PaginatedResponse<RealEstateAsset>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...Object.fromEntries(
        Object.entries(filters || {}).filter(
          ([_, value]) => value !== undefined
        )
      ),
    })

    return apiClient.get<PaginatedResponse<RealEstateAsset>>(
      `${API_ENDPOINTS.REAL_ESTATE_ASSET.FIND_ALL}&${params.toString()}`
    )
  }

  // Get single project by ID
  async getProject(id: number): Promise<RealEstateAsset> {
    return apiClient.get<RealEstateAsset>(
      API_ENDPOINTS.REAL_ESTATE_ASSET.GET_BY_ID(id.toString())
    )
  }

  // Create new project
  async createProject(
    data: CreateRealEstateAssetRequest
  ): Promise<RealEstateAsset> {
    try {
      const response = await apiClient.post<RealEstateAsset>(
        API_ENDPOINTS.REAL_ESTATE_ASSET.SAVE,
        data
      )

      return response
    } catch (error) {
      throw error
    }
  }

  // Update existing project
  async updateProject(
    id: number,
    data: UpdateRealEstateAssetRequest
  ): Promise<RealEstateAsset> {
    return apiClient.put<RealEstateAsset>(
      API_ENDPOINTS.REAL_ESTATE_ASSET.UPDATE(id.toString()),
      data
    )
  }

  // Update project details (Step 1)
  async updateProjectDetails(projectId: string, data: any): Promise<any> {
    try {
      console.log('🔄 updateProjectDetails called with:', { projectId, data })
      
      const response = await apiClient.put(
        API_ENDPOINTS.REAL_ESTATE_ASSET.UPDATE(projectId),
        data
      )
      
      console.log('✅ Project details updated successfully:', response)
      return response
    } catch (error) {
      console.error('❌ Error updating project details:', error)
      throw error
    }
  }

  // Update project accounts (Step 3)
  async updateProjectAccounts(projectId: string, accounts: any[]): Promise<any> {
    try {
      console.log('🔄 updateProjectAccounts called with:', { projectId, accounts })
      
      // For now, we'll update each account individually
      // In the future, this could be a batch update endpoint
      const results = []
      for (const account of accounts) {
        if (account.id) {
          const response = await apiClient.put(
            API_ENDPOINTS.REAL_ESTATE_BANK_ACCOUNT.UPDATE(account.id),
            account
          )
          results.push(response)
        }
      }
      
      console.log('✅ Project accounts updated successfully:', results)
      return results
    } catch (error) {
      console.error('❌ Error updating project accounts:', error)
      throw error
    }
  }

  // Update project fees (Step 4)
  async updateProjectFees(projectId: string, fees: any[]): Promise<any> {
    try {
      console.log('🔄 updateProjectFees called with:', { projectId, fees })
      
      const results = []
      for (const fee of fees) {
        if (fee.id) {
          const response = await apiClient.put(
            `${API_ENDPOINTS.REAL_ESTATE_ASSET_FEE.UPDATE(fee.id)}`,
            fee
          )
          results.push(response)
        }
      }
      
      console.log('✅ Project fees updated successfully:', results)
      return results
    } catch (error) {
      console.error('❌ Error updating project fees:', error)
      throw error
    }
  }

  // Update project beneficiaries (Step 5)
  async updateProjectBeneficiaries(projectId: string, beneficiaries: any[]): Promise<any> {
    try {
      console.log('🔄 updateProjectBeneficiaries called with:', { projectId, beneficiaries })
      
      const results = []
      for (const beneficiary of beneficiaries) {
        if (beneficiary.id) {
          const response = await apiClient.put(
            `${API_ENDPOINTS.REAL_ESTATE_ASSET_BENEFICIARY.UPDATE(beneficiary.id)}`,
            beneficiary
          )
          results.push(response)
        }
      }
      
      console.log('✅ Project beneficiaries updated successfully:', results)
      return results
    } catch (error) {
      console.error('❌ Error updating project beneficiaries:', error)
      throw error
    }
  }

  // Update project payment plans (Step 5)
  async updateProjectPaymentPlans(projectId: string, paymentPlans: any[]): Promise<any> {
    try {
      console.log('🔄 updateProjectPaymentPlans called with:', { projectId, paymentPlans })
      
      const results = []
      for (const plan of paymentPlans) {
        if (plan.id) {
          const response = await apiClient.put(
            `${API_ENDPOINTS.REAL_ESTATE_ASSET_PAYMENT_PLAN.UPDATE(plan.id)}`,
            plan
          )
          results.push(response)
        }
      }
      
      console.log('✅ Project payment plans updated successfully:', results)
      return results
    } catch (error) {
      console.error('❌ Error updating project payment plans:', error)
      throw error
    }
  }

  // Update project financial data (Step 6)
  async updateProjectFinancialData(projectId: string, financialData: any): Promise<any> {
    try {
      console.log('🔄 updateProjectFinancialData called with:', { projectId, financialData })
      
      if (financialData.id) {
        const response = await apiClient.put(
          `${API_ENDPOINTS.REAL_ESTATE_ASSET_FINANCIAL_SUMMARY.UPDATE(financialData.id)}`,
          financialData
        )
        
        console.log('✅ Project financial data updated successfully:', response)
        return response
      } else {
        // If no ID, create new financial summary
        return this.saveProjectFinancialSummary(financialData, projectId)
      }
    } catch (error) {
      console.error('❌ Error updating project financial data:', error)
      throw error
    }
  }

  // Update project closure (Step 7)
  async updateProjectClosure(closureId: number, closureData: any, projectId: number): Promise<any> {
    try {
      console.log('🔄 updateProjectClosure called with:', { closureId, closureData, projectId })
      
      // Transform closure data to include project ID
      const transformedData = {
        ...closureData,
        id: closureId,
        realEstateAssestDTO: {
          id: projectId
        },
        deleted: false,
        enabled: true
      }
      
      console.log('🔄 Project Closure PUT request - Endpoint:', API_ENDPOINTS.REAL_ESTATE_ASSET_CLOSURE.UPDATE(closureId.toString()))
      console.log('🔄 Project Closure PUT request - Payload:', transformedData)
      
      const response = await apiClient.put(
        `${API_ENDPOINTS.REAL_ESTATE_ASSET_CLOSURE.UPDATE(closureId.toString())}`,
        transformedData
      )
      
      console.log('🔄 Project Closure PUT response:', response)
      return response
    } catch (error) {
      console.error('❌ Error updating project closure:', error)
      throw error
    }
  }

  // Delete project
  async deleteProject(id: number): Promise<void> {
    try {
      await apiClient.delete<string>(
        API_ENDPOINTS.REAL_ESTATE_ASSET.SOFT_DELETE(id.toString())
      )
    } catch (error) {
      throw error
    }
  }

  // Save project fee
  async saveProjectFee(feeData: any): Promise<any> {
    try {
      // const url = API_ENDPOINTS.REAL_ESTATE_ASSET_FEE.SAVE
      const response = await apiClient.post(
        API_ENDPOINTS.REAL_ESTATE_ASSET_FEE.SAVE,
        feeData
      )

      return response
    } catch (error) {
      throw error
    }
  }

  // Save project financial summary
  async saveProjectFinancialSummary(financialData: any, projectId: string): Promise<any> {
    try {
      console.log('🔄 saveProjectFinancialSummary called with:', financialData)
      
      // Transform frontend data to backend payload format
      const transformedData = this.transformFinancialSummaryData(financialData, projectId)
      
      console.log("🔄 ===== POST REQUEST (Financial Summary) =====")
      console.log("🔄 Method: POST")
      console.log("🔄 Endpoint:", API_ENDPOINTS.REAL_ESTATE_ASSET_FINANCIAL_SUMMARY.SAVE)
      console.log("🔄 Payload (transformedData):", transformedData)
      
      const response = await apiClient.post(
        API_ENDPOINTS.REAL_ESTATE_ASSET_FINANCIAL_SUMMARY.SAVE,
        transformedData
      )
      console.log('🔄 POST Response:', response)
      return response
    } catch (error) {
      console.error('❌ saveProjectFinancialSummary error:', error)
      throw error
    }
  }

  // Transform financial summary data to backend format
  private transformFinancialSummaryData(data: any, projectId: string): any {
    const parseValue = (value: any): number => {
      if (typeof value === 'string') {
        const parsed = parseFloat(value)
        return isNaN(parsed) ? 0.1 : parsed
      }
      return typeof value === 'number' ? value : 0.1
    }

    const formatDate = (date: any): string => {
      if (!date) return new Date().toISOString()
      if (typeof date === 'string') return date
      if (date instanceof Date) return date.toISOString()
      return new Date().toISOString()
    }

    return {
      // Estimated fields
      reafsEstRevenue: data.estimate?.revenue || "",
      reafsEstConstructionCost: parseValue(data.estimate?.constructionCost),
      reafsEstProjectMgmtExpense: parseValue(data.estimate?.projectManagementExpense),
      reafsEstLandCost: parseValue(data.estimate?.landCost),
      reafsEstMarketingExpense: parseValue(data.estimate?.marketingExpense),
      reafsEstimatedDate: formatDate(data.estimate?.date),
      reafsEstExceptionalCapVal: data.estimate?.exceptionalCapVal || "",
      
      // Actual fields
      reafsActualSoldValue: parseValue(data.actual?.soldValue),
      reafsActualConstructionCost: parseValue(data.actual?.constructionCost),
      reafsActualInfraCost: parseValue(data.actual?.infraCost),
      reafsActualLandCost: parseValue(data.actual?.landCost),
      reafsActualMarketingExp: parseValue(data.actual?.marketingExpense),
      reafsActualProjectMgmtExpense: parseValue(data.actual?.projectManagementExpense),
      reafsActualDate: formatDate(data.actual?.date),
      reafsActualexceptCapVal: data.actual?.exceptCapVal || "",
      
      // Current Cash Received fields (breakdown section 0)
      reafsCurrentCashReceived: parseValue(data.breakdown?.[0]?.total),
      reafsCurCashRecvdOutEscrow: parseValue(data.breakdown?.[0]?.outOfEscrow),
      reafsCurCashRecvdWithinEscrow: parseValue(data.breakdown?.[0]?.withinEscrow),
      reafsCurCashRecvdTotal: parseValue(data.breakdown?.[0]?.total),
      reafsCurCashexceptCapVal: data.breakdown?.[0]?.exceptionalCapValue || "",
      
      // Current Land Cost fields (breakdown section 1)
      reafsCurrentLandCost: parseValue(data.breakdown?.[1]?.total),
      reafsCurLandCostOut: parseValue(data.breakdown?.[1]?.outOfEscrow),
      reafsCurLandCostWithin: parseValue(data.breakdown?.[1]?.withinEscrow),
      reafsCurLandTotal: parseValue(data.breakdown?.[1]?.total),
      reafsCurLandexceptCapVal: data.breakdown?.[1]?.exceptionalCapValue || "",
      
      // Current Construction Cost fields (breakdown section 2)
      reafsCurrentConstructionCost: parseValue(data.breakdown?.[2]?.total),
      reafsCurConsCostWithin: parseValue(data.breakdown?.[2]?.withinEscrow),
      reafsCurConsCostOut: parseValue(data.breakdown?.[2]?.outOfEscrow),
      reafsCurConsCostTotal: parseValue(data.breakdown?.[2]?.total),
      reafsCurConsExcepCapVal: data.breakdown?.[2]?.exceptionalCapValue || "",
      
      // Current Marketing Expense fields (breakdown section 3)
      reafsCurrentMarketingExp: parseValue(data.breakdown?.[3]?.total),
      reafsCurrentMktgExpWithin: parseValue(data.breakdown?.[3]?.withinEscrow),
      reafsCurrentMktgExpOut: parseValue(data.breakdown?.[3]?.outOfEscrow),
      reafsCurrentMktgExpTotal: parseValue(data.breakdown?.[3]?.total),
      reafsCurrentmktgExcepCapVal: data.breakdown?.[3]?.exceptionalCapValue || "",
      
      // Current Project Management Expense fields (breakdown section 4)
      reafsCurrentProjectMgmtExp: parseValue(data.breakdown?.[4]?.total),
      reafsCurProjMgmtExpWithin: parseValue(data.breakdown?.[4]?.withinEscrow),
      reafsCurProjMgmtExpOut: parseValue(data.breakdown?.[4]?.outOfEscrow),
      reafsCurProjMgmtExpTotal: parseValue(data.breakdown?.[4]?.total),
      reafsCurProjExcepCapVal: data.breakdown?.[4]?.exceptionalCapValue || "",
      
      // Current Mortgage fields (breakdown section 5)
      reafsCurrentMortgage: parseValue(data.breakdown?.[5]?.total),
      reafsCurrentMortgageWithin: parseValue(data.breakdown?.[5]?.withinEscrow),
      currentMortgageOut: parseValue(data.breakdown?.[5]?.outOfEscrow),
      reafsCurrentMortgageTotal: parseValue(data.breakdown?.[5]?.total),
      reafsCurMortgageExceptCapVal: data.breakdown?.[5]?.exceptionalCapValue || "",
      
      // Current VAT Payment fields (breakdown section 6)
      reafsCurrentVatPayment: parseValue(data.breakdown?.[6]?.total),
      reafsCurrentVatPaymentWithin: parseValue(data.breakdown?.[6]?.withinEscrow),
      reafsCurrentVatPaymentOut: parseValue(data.breakdown?.[6]?.outOfEscrow),
      reafsCurrentVatPaymentTotal: parseValue(data.breakdown?.[6]?.total),
      reafsCurVatExceptCapVal: data.breakdown?.[6]?.exceptionalCapValue || "",
      
      // Current Oqood fields (breakdown section 7)
      reafsCurrentOqood: parseValue(data.breakdown?.[7]?.total),
      reafsCurrentOqoodWithin: parseValue(data.breakdown?.[7]?.withinEscrow),
      reafsCurrentOqoodOut: parseValue(data.breakdown?.[7]?.outOfEscrow),
      reafsCurrentOqoodTotal: parseValue(data.breakdown?.[7]?.total),
      reafsCurOqoodExceptCapVal: data.breakdown?.[7]?.exceptionalCapValue || "",
      
      // Current Refund fields (breakdown section 8)
      reafsCurrentRefund: parseValue(data.breakdown?.[8]?.total),
      reafsCurrentRefundWithin: parseValue(data.breakdown?.[8]?.withinEscrow),
      reafsCurrentRefundOut: parseValue(data.breakdown?.[8]?.outOfEscrow),
      reafsCurrentRefundTotal: parseValue(data.breakdown?.[8]?.total),
      reafsCurRefundExceptCapVal: data.breakdown?.[8]?.exceptionalCapValue || "",
      
      // Current Balance in Retention Account fields (breakdown section 9)
      reafsCurrentBalInRetenAcc: parseValue(data.breakdown?.[9]?.total),
      reafsCurBalInRetenAccWithin: parseValue(data.breakdown?.[9]?.withinEscrow),
      reafsCurBalInRetenAccOut: parseValue(data.breakdown?.[9]?.outOfEscrow),
      reafsCurBalInRetenAccTotal: parseValue(data.breakdown?.[9]?.total),
      reafsCurBalInRetenExceptCapVal: data.breakdown?.[9]?.exceptionalCapValue || "",
      
      // Current Balance in Trust Account fields (breakdown section 10)
      reafsCurrentBalInTrustAcc: parseValue(data.breakdown?.[10]?.total),
      reafsCurBalInTrustAccWithin: parseValue(data.breakdown?.[10]?.withinEscrow),
      reafsCurBalInTrustAccOut: parseValue(data.breakdown?.[10]?.outOfEscrow),
      reafsCurBalInTrustAccTotal: parseValue(data.breakdown?.[10]?.total),
      reafsCurBalInExceptCapVal: data.breakdown?.[10]?.exceptionalCapValue || "",
      
      // Current Technical Fee fields (breakdown section 12)
      reafsCurrentTechnicalFee: parseValue(data.breakdown?.[12]?.total),
      reafsCurTechnFeeWithin: parseValue(data.breakdown?.[12]?.withinEscrow),
      reafsCurTechnFeeOut: parseValue(data.breakdown?.[12]?.outOfEscrow),
      reafsCurTechnFeeTotal: parseValue(data.breakdown?.[12]?.total),
      reafsCurTechFeeExceptCapVal: data.breakdown?.[12]?.exceptionalCapValue || "",
      
      // Current Unidentified Fund fields (breakdown section 13)
      reafsCurrentUnIdentifiedFund: parseValue(data.breakdown?.[13]?.total),
      reafsCurUnIdeFundWithin: parseValue(data.breakdown?.[13]?.withinEscrow),
      reafsCurUnIdeFundOut: parseValue(data.breakdown?.[13]?.outOfEscrow),
      reafsCurUnIdeFundTotal: parseValue(data.breakdown?.[13]?.total),
      reafsCurUnIdeExceptCapVal: data.breakdown?.[13]?.exceptionalCapValue || "",
      
      // Current Loan Installment fields (breakdown section 14)
      reafsCurrentLoanInstal: parseValue(data.breakdown?.[14]?.total),
      reafsCurLoanInstalWithin: parseValue(data.breakdown?.[14]?.withinEscrow),
      reafsCurLoanInstalOut: parseValue(data.breakdown?.[14]?.outOfEscrow),
      reafsCurLoanInstalTotal: parseValue(data.breakdown?.[14]?.total),
      reafsCurLoanExceptCapVal: data.breakdown?.[14]?.exceptionalCapValue || "",
      
      // Current Infrastructure Cost fields (breakdown section 15)
      reafsCurrentInfraCost: parseValue(data.breakdown?.[15]?.total),
      reafsCurInfraCostWithin: parseValue(data.breakdown?.[15]?.withinEscrow),
      reafsCurInfraCostOut: parseValue(data.breakdown?.[15]?.outOfEscrow),
      reafsCurInfraCostTotal: parseValue(data.breakdown?.[15]?.total),
      reafsCurInfraExceptCapVal: data.breakdown?.[15]?.exceptionalCapValue || "",
      
      // Current Others Cost fields (breakdown section 16)
      reafsCurrentOthersCost: parseValue(data.breakdown?.[16]?.total),
      reafsCurOthersCostWithin: parseValue(data.breakdown?.[16]?.withinEscrow),
      reafsCurOthersCostOut: parseValue(data.breakdown?.[16]?.outOfEscrow),
      reafsCurOthersCostTotal: parseValue(data.breakdown?.[16]?.total),
      reafsCurOthersExceptCapVal: data.breakdown?.[16]?.exceptionalCapValue || "",
      
      // Current Transferred Cost fields (breakdown section 17)
      reafsCurrentTransferredCost: parseValue(data.breakdown?.[17]?.total),
      reafsCurTransferCostWithin: parseValue(data.breakdown?.[17]?.withinEscrow),
      reafsCurTransferCostOut: parseValue(data.breakdown?.[17]?.outOfEscrow),
      reafsCurTransferCostTotal: parseValue(data.breakdown?.[17]?.total),
      reafsCurTransferExceptCapVal: data.breakdown?.[17]?.exceptionalCapValue || "",
      
      // Current Forfeited Cost fields (breakdown section 18)
      reafsCurrentForfeitedCost: parseValue(data.breakdown?.[18]?.total),
      reafsCurForfeitCostWithin: parseValue(data.breakdown?.[18]?.withinEscrow),
      reafsCurForfeitCostOut: parseValue(data.breakdown?.[18]?.outOfEscrow),
      reafsCurForfeitCostTotal: parseValue(data.breakdown?.[18]?.total),
      reafsCurForfeitExceptCapVal: data.breakdown?.[18]?.exceptionalCapValue || "",
      
      // Current Developer Equity Cost fields (breakdown section 19)
      reafsCurrentDeveloperEquitycost: parseValue(data.breakdown?.[19]?.total),
      reafsCurDeveEqtycostWithin: parseValue(data.breakdown?.[19]?.withinEscrow),
      reafsCurDeveEqtycostOut: parseValue(data.breakdown?.[19]?.outOfEscrow),
      reafsCurDeveEqtycostTotal: parseValue(data.breakdown?.[19]?.total),
      reafsCurDeveExceptCapVal: data.breakdown?.[19]?.exceptionalCapValue || "",
      
      // Current Amount Fund fields (breakdown section 20)
      reafsCurrentAmantFund: parseValue(data.breakdown?.[20]?.total),
      reafsCurAmntFundWithin: parseValue(data.breakdown?.[20]?.withinEscrow),
      reafsCurAmntFundOut: parseValue(data.breakdown?.[20]?.outOfEscrow),
      reafsCurAmntFundTotal: parseValue(data.breakdown?.[20]?.total),
      reafsCurAmntExceptCapVal: data.breakdown?.[20]?.exceptionalCapValue || "",
      
      // Current Other Withdrawals fields (breakdown section 21)
      reafsCurrentOtherWithdrawls: parseValue(data.breakdown?.[21]?.total),
      reafsCurOtherWithdWithin: parseValue(data.breakdown?.[21]?.withinEscrow),
      reafsCurOtherWithdOut: parseValue(data.breakdown?.[21]?.outOfEscrow),
      reafsCurOtherWithdTotal: parseValue(data.breakdown?.[21]?.total),
      reafsCurOtherExceptCapVal: data.breakdown?.[21]?.exceptionalCapValue || "",
      
      // Current Oqood Other Fee Payment fields (breakdown section 22)
      reafsCurrentOqoodOtherFeePay: parseValue(data.breakdown?.[22]?.total),
      reafsCurOqoodOthFeeWithin: parseValue(data.breakdown?.[22]?.withinEscrow),
      reafsCurOqoodOthFeeOut: parseValue(data.breakdown?.[22]?.outOfEscrow),
      reafsCurOqoodOthFeeTotal: parseValue(data.breakdown?.[22]?.total),
      
      // Current VAT Deposit fields (breakdown section 23)
      reafsCurrentVatDeposit: parseValue(data.breakdown?.[23]?.total),
      reafsCurVatDepositWithin: parseValue(data.breakdown?.[23]?.withinEscrow),
      reafsCurVatDepositOut: parseValue(data.breakdown?.[23]?.outOfEscrow),
      reafsCurVatDepositTotal: parseValue(data.breakdown?.[23]?.total),
      reafsCurVatDepositCapVal: data.breakdown?.[23]?.exceptionalCapValue || "",
      
      // Current Balance Construction fields (breakdown section 24)
      reafsCurBalConstructionTotal: parseValue(data.breakdown?.[24]?.total),
      reafsCurBalConstructionWithin: parseValue(data.breakdown?.[24]?.withinEscrow),
      reafsCurBalConstructionOut: parseValue(data.breakdown?.[24]?.outOfEscrow),
      reafsCurBalExcepCapVal: data.breakdown?.[24]?.exceptionalCapValue || "",
      
      // Additional fields (breakdown sections 25-28)
      reafsCreditInterest: parseValue(data.breakdown?.[25]?.total),
      reafsPaymentForRetentionAcc: parseValue(data.breakdown?.[26]?.total),
      reafsDeveloperReimburse: parseValue(data.breakdown?.[27]?.total),
      reafsUnitRegFees: parseValue(data.breakdown?.[28]?.total),
      reafsCreditInterestProfit: parseValue(data.breakdown?.[29]?.total),
      reafsVatCappedCost: parseValue(data.breakdown?.[30]?.total),
      reafsExceptionalCapVal: data.breakdown?.[31]?.exceptionalCapValue || "",
      
      // Current Balance in Sub Construction Account fields (breakdown section 11)
      reafsCurrentBalInSubsConsAcc: parseValue(data.breakdown?.[11]?.total),
      reafsCurBalInRSubsConsWithin: parseValue(data.breakdown?.[11]?.withinEscrow),
      reafsCurBalInSubsConsOut: parseValue(data.breakdown?.[11]?.outOfEscrow),
      reafsCurBalInSubsConsTotal: parseValue(data.breakdown?.[11]?.total),
      reafsCurBalInSubsConsCapVal: data.breakdown?.[11]?.exceptionalCapValue || "",
      
      // Other fields
      reafsOtherFeesAnPaymentExcepVal: data.breakdown?.[32]?.exceptionalCapValue || "",
      
      // Project reference
      realEstateAssestDTO: {
        id: parseInt(projectId)
      },
      
      // System fields
      deleted: false,
      enabled: true
    }
  }


  async saveProjectBeneficiary(beneficiaryData: any): Promise<any> {
    try {
      console.log('checkk', JSON.stringify(beneficiaryData, null, 2))
      const response = await apiClient.post(
        API_ENDPOINTS.REAL_ESTATE_ASSET_BENEFICIARY.SAVE,
        beneficiaryData
      )

      return response
    } catch (error) {
      throw error
    }
  }

  // Transform frontend financial data to backend payload format
  private transformFinancialData(frontendData: any, projectId?: number): any {
    const { estimate, actual, breakdown } = frontendData
    
    console.log("🔄 transformFinancialData - frontendData:", frontendData)
    console.log("🔄 transformFinancialData - estimate:", estimate)
    console.log("🔄 transformFinancialData - actual:", actual)
    console.log("🔄 transformFinancialData - breakdown:", breakdown)
    console.log("🔄 transformFinancialData - breakdown is array:", Array.isArray(breakdown))
    console.log("🔄 transformFinancialData - breakdown is object:", typeof breakdown === 'object')

    // Helper function to parse string values to numbers
    const parseValue = (value: string | number): number => {
      if (typeof value === 'number') return value
      if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/,/g, ''))
        return isNaN(parsed) ? 0 : parsed
      }
      return 0
    }

    // Helper function to format date
    const formatDate = (date: any): string => {
      if (!date) return new Date().toISOString()
      if (typeof date === 'string') return new Date(date).toISOString()
      if (date.toISOString) return date.toISOString()
      return new Date().toISOString()
    }

    // Transform breakdown data
    const transformBreakdown = (breakdownData: any) => {
      if (!breakdownData) {
        console.log("🔄 transformBreakdown - No breakdown data provided")
        return {}
      }
      
      console.log("🔄 transformBreakdown - breakdownData:", breakdownData)
      console.log("🔄 transformBreakdown - is array:", Array.isArray(breakdownData))
      console.log("🔄 transformBreakdown - is object:", typeof breakdownData === 'object')

      const result: any = {}
      
      // Convert object to array if needed (breakdown might be an object with numeric keys)
      const breakdownArray = Array.isArray(breakdownData) 
        ? breakdownData 
        : Object.keys(breakdownData).map(key => breakdownData[key])
      
      console.log("🔄 transformBreakdown - breakdownArray:", breakdownArray)
      
      // Map each breakdown section to backend fields
      breakdownArray.forEach((item, index) => {
        if (!item) return

        const outOfEscrow = parseValue(item.outOfEscrow || 0)
        const withinEscrow = parseValue(item.withinEscrow || 0)
        const total = parseValue(item.total || 0)
        const exceptionalCapValue = item.exceptionalCapValue || ''

        // Map to specific backend field names based on index
        switch (index) {
          case 0: // Cash Received from the Unit Holder
            result.reafsCurrentCashReceived = total
            result.reafsCurCashRecvdOutEscrow = outOfEscrow
            result.reafsCurCashRecvdWithinEscrow = withinEscrow
            result.reafsCurCashRecvdTotal = total
            result.reafsCurCashexceptCapVal = exceptionalCapValue
            break
          case 1: // Land Cost
            result.reafsCurrentLandCost = total
            result.reafsCurLandCostOut = outOfEscrow
            result.reafsCurLandCostWithin = withinEscrow
            result.reafsCurLandTotal = total
            result.reafsCurLandexceptCapVal = exceptionalCapValue
            break
          case 2: // Construction Cost
            result.reafsCurrentConstructionCost = total
            result.reafsCurConsCostWithin = withinEscrow
            result.reafsCurConsCostOut = outOfEscrow
            result.reafsCurConsCostTotal = total
            result.reafsCurConsExcepCapVal = exceptionalCapValue
            break
          case 3: // Marketing Expense
            result.reafsCurrentMarketingExp = total
            result.reafsCurrentMktgExpWithin = withinEscrow
            result.reafsCurrentMktgExpOut = outOfEscrow
            result.reafsCurrentMktgExpTotal = total
            result.reafsCurrentmktgExcepCapVal = exceptionalCapValue
            break
          case 4: // Project Management Expense
            result.reafsCurrentProjectMgmtExp = total
            result.reafsCurProjMgmtExpWithin = withinEscrow
            result.reafsCurProjMgmtExpOut = outOfEscrow
            result.reafsCurProjMgmtExpTotal = total
            result.reafsCurProjExcepCapVal = exceptionalCapValue
            break
          case 5: // Mortgage
            result.reafsCurrentMortgage = total
            result.reafsCurrentMortgageWithin = withinEscrow
            result.currentMortgageOut = outOfEscrow
            result.reafsCurrentMortgageTotal = total
            result.reafsCurMortgageExceptCapVal = exceptionalCapValue
            break
          case 6: // VAT Payment
            result.reafsCurrentVatPayment = total
            result.reafsCurrentVatPaymentWithin = withinEscrow
            result.reafsCurrentVatPaymentOut = outOfEscrow
            result.reafsCurrentVatPaymentTotal = total
            result.reafsCurVatExceptCapVal = exceptionalCapValue
            break
          case 7: // Deposit
            result.reafsCurrentOqood = total
            result.reafsCurrentOqoodWithin = withinEscrow
            result.reafsCurrentOqoodOut = outOfEscrow
            result.reafsCurrentOqoodTotal = total
            result.reafsCurOqoodExceptCapVal = exceptionalCapValue
            break
          case 8: // Refund
            result.reafsCurrentRefund = total
            result.reafsCurrentRefundWithin = withinEscrow
            result.reafsCurrentRefundOut = outOfEscrow
            result.reafsCurrentRefundTotal = total
            result.reafsCurRefundExceptCapVal = exceptionalCapValue
            break
          case 9: // Balance in Retention A/C
            result.reafsCurrentBalInRetenAcc = total
            result.reafsCurBalInRetenAccWithin = withinEscrow
            result.reafsCurBalInRetenAccOut = outOfEscrow
            result.reafsCurBalInRetenAccTotal = total
            result.reafsCurBalInRetenExceptCapVal = exceptionalCapValue
            break
          case 10: // Balance in Trust A/C
            result.reafsCurrentBalInTrustAcc = total
            result.reafsCurBalInTrustAccWithin = withinEscrow
            result.reafsCurBalInTrustAccOut = outOfEscrow
            result.reafsCurBalInTrustAccTotal = total
            result.reafsCurBalInExceptCapVal = exceptionalCapValue
            break
          case 11: // Balance in Sub Construction A/C
            result.reafsCurrentBalInSubsConsAcc = total
            result.reafsCurBalInRSubsConsWithin = withinEscrow
            result.reafsCurBalInSubsConsOut = outOfEscrow
            result.reafsCurBalInSubsConsTotal = total
            result.reafsCurBalInSubsConsCapVal = exceptionalCapValue
            break
          case 12: // Technical Fees
            result.reafsCurrentTechnicalFee = total
            result.reafsCurTechnFeeWithin = withinEscrow
            result.reafsCurTechnFeeOut = outOfEscrow
            result.reafsCurTechnFeeTotal = total
            result.reafsCurTechFeeExceptCapVal = exceptionalCapValue
            break
          case 13: // Unidentified Funds
            result.reafsCurrentUnIdentifiedFund = total
            result.reafsCurUnIdeFundWithin = withinEscrow
            result.reafsCurUnIdeFundOut = outOfEscrow
            result.reafsCurUnIdeFundTotal = total
            result.reafsCurUnIdeExceptCapVal = exceptionalCapValue
            break
          case 14: // Loan/Installments
            result.reafsCurrentLoanInstal = total
            result.reafsCurLoanInstalWithin = withinEscrow
            result.reafsCurLoanInstalOut = outOfEscrow
            result.reafsCurLoanInstalTotal = total
            result.reafsCurLoanExceptCapVal = exceptionalCapValue
            break
          case 15: // Infrastructure Cost
            result.reafsCurrentInfraCost = total
            result.reafsCurInfraCostWithin = withinEscrow
            result.reafsCurInfraCostOut = outOfEscrow
            result.reafsCurInfraCostTotal = total
            result.reafsCurInfraExceptCapVal = exceptionalCapValue
            break
          case 16: // Others
            result.reafsCurrentOthersCost = total
            result.reafsCurOthersCostWithin = withinEscrow
            result.reafsCurOthersCostOut = outOfEscrow
            result.reafsCurOthersCostTotal = total
            result.reafsCurOthersExceptCapVal = exceptionalCapValue
            break
          case 17: // Transferred
            result.reafsCurrentTransferredCost = total
            result.reafsCurTransferCostWithin = withinEscrow
            result.reafsCurTransferCostOut = outOfEscrow
            result.reafsCurTransferCostTotal = total
            result.reafsCurTransferExceptCapVal = exceptionalCapValue
            break
          case 18: // Developer's Equity
            result.reafsCurrentDeveloperEquitycost = total
            result.reafsCurDeveEqtycostWithin = withinEscrow
            result.reafsCurDeveEqtycostOut = outOfEscrow
            result.reafsCurDeveEqtycostTotal = total
            result.reafsCurDeveExceptCapVal = exceptionalCapValue
            break
          case 19: // Manager Funds
            result.reafsCurrentAmantFund = total
            result.reafsCurAmntFundWithin = withinEscrow
            result.reafsCurAmntFundOut = outOfEscrow
            result.reafsCurAmntFundTotal = total
            result.reafsCurAmntExceptCapVal = exceptionalCapValue
            break
          case 20: // Others Withdrawals
            result.reafsCurrentOtherWithdrawls = total
            result.reafsCurOtherWithdWithin = withinEscrow
            result.reafsCurOtherWithdOut = outOfEscrow
            result.reafsCurOtherWithdTotal = total
            result.reafsCurOtherExceptCapVal = exceptionalCapValue
            break
          case 21: // Deposit/Other Fees and Payments
            result.reafsCurrentOqoodOtherFeePay = total
            result.reafsCurOqoodOthFeeWithin = withinEscrow
            result.reafsCurOqoodOthFeeOut = outOfEscrow
            result.reafsCurOqoodOthFeeTotal = total
            result.reafsOtherFeesAnPaymentExcepVal = exceptionalCapValue
            break
          case 22: // VAT Deposit
            result.reafsCurrentVatDeposit = total
            result.reafsCurVatDepositWithin = withinEscrow
            result.reafsCurVatDepositOut = outOfEscrow
            result.reafsCurVatDepositTotal = total
            result.reafsCurVatDepositCapVal = exceptionalCapValue
            break
          case 23: // Credit Transfer/Profit Earned for Retention A/C
            result.reafsCreditInterest = total
            break
          case 24: // Payments for Retention Account
            result.reafsPaymentForRetentionAcc = total
            break
          case 25: // Re-imbursements (Developer)
            result.reafsDeveloperReimburse = total
            break
          case 26: // Unit Registration Fee
            result.reafsUnitRegFees = total
            break
          case 27: // Credit Interest/Profit Earned for ESCROW A/C
            result.reafsCreditInterestProfit = total
            break
          case 28: // VAT Support
            result.reafsVatCappedCost = total
            break
        }
      })

      return result
    }

    // Build the complete payload
    const payload = {
      // Estimate fields
      reafsEstRevenue: estimate?.revenue || '',
      reafsEstConstructionCost: parseValue(estimate?.constructionCost || 0),
      reafsEstProjectMgmtExpense: parseValue(estimate?.projectManagementExpense || 0),
      reafsEstLandCost: parseValue(estimate?.landCost || 0),
      reafsEstMarketingExpense: parseValue(estimate?.marketingExpense || 0),
      reafsEstimatedDate: formatDate(estimate?.date),
      reafsEstExceptionalCapVal: estimate?.exceptionalCapValue || '',

      // Actual fields
      reafsActualSoldValue: parseValue(actual?.soldValue || 0),
      reafsActualConstructionCost: parseValue(actual?.constructionCost || 0),
      reafsActualInfraCost: parseValue(actual?.infraCost || 0),
      reafsActualLandCost: parseValue(actual?.landCost || 0),
      reafsActualMarketingExp: parseValue(actual?.marketingExpense || 0),
      reafsActualProjectMgmtExpense: parseValue(actual?.projectManagementExpense || 0),
      reafsActualDate: formatDate(actual?.date),
      reafsActualexceptCapVal: actual?.exceptionalCapValue || '',

      // Breakdown fields
      ...transformBreakdown(breakdown),

      // Project reference
      realEstateAssestDTO: {
        id: projectId || 0
      },

      // Default values
      deleted: false,
      enabled: true
    }

    console.log('🔄 Transformed financial payload:', payload)
    return payload
  }

  // Save financial summary (first time)
  async saveFinancialSummary(data: any, projectId?: number): Promise<any> {
    const transformedData = this.transformFinancialData(data, projectId)
    return apiClient.post(
      API_ENDPOINTS.REAL_ESTATE_ASSET_FINANCIAL_SUMMARY.SAVE,
      transformedData
    )
  }

  // Update financial summary (edit mode)
  async updateFinancialSummary(
    id: number,
    data: any,
    projectId?: number
  ): Promise<any> {
    const transformedData = this.transformFinancialData(data, projectId)
    
    // Add the id field for PUT request
    const payloadWithId = {
      id: id,
      ...transformedData
    }
    
    console.log("🔄 ===== PUT REQUEST (Financial Summary) =====")
    console.log("🔄 Method: PUT")
    console.log("🔄 Endpoint:", API_ENDPOINTS.REAL_ESTATE_ASSET_FINANCIAL_SUMMARY.UPDATE(id.toString()))
    console.log("🔄 Payload (with id):", payloadWithId)
    
    const response = await apiClient.put(
      API_ENDPOINTS.REAL_ESTATE_ASSET_FINANCIAL_SUMMARY.UPDATE(id.toString()),
      payloadWithId
    )
    
    console.log("🔄 PUT Response:", response)
    return response
  }

  // Save payment plan (new payment plan without ID)
  async savePaymentPlan(paymentPlanData: any, projectId?: number): Promise<any> {
    try {
      // Parse percentages and validate they don't exceed 100
      const installmentPercentage = parseInt(paymentPlanData.installmentPercentage)
      const projectCompletionPercentage = parseInt(paymentPlanData.projectCompletionPercentage)
      
      // Validate percentages
      if (installmentPercentage > 100) {
        throw new Error(`Installment percentage (${installmentPercentage}) cannot exceed 100%`)
      }
      if (projectCompletionPercentage > 100) {
        throw new Error(`Project completion percentage (${projectCompletionPercentage}) cannot exceed 100%`)
      }
      
      // Use the provided installment number (frontend already handles uniqueness)
      const finalInstallmentNumber = paymentPlanData.installmentNumber
      
      // Transform the data to match API payload format
      const transformedData = {
        reappInstallmentNumber: finalInstallmentNumber,
        reappInstallmentPercentage: installmentPercentage,
        reappProjectCompletionPercentage: projectCompletionPercentage,
        realEstateAssestDTO: {
          id: projectId || paymentPlanData.projectId
        }
      }
      
      console.log("🔄 ===== POST REQUEST =====")
      console.log("🔄 Method: POST")
      console.log("🔄 Endpoint:", API_ENDPOINTS.REAL_ESTATE_ASSET_PAYMENT_PLAN.SAVE)
      console.log("🔄 Payload (transformedData):", transformedData)
      
      const response = await apiClient.post(
        API_ENDPOINTS.REAL_ESTATE_ASSET_PAYMENT_PLAN.SAVE,
        transformedData
      )
      return response
    } catch (error) {
      throw error
    }
  }

  // Update payment plan (existing payment plan with ID)
  async updatePaymentPlan(id: number, paymentPlanData: any): Promise<any> {
    try {
      console.log("🔄 updatePaymentPlan called with:", { id, paymentPlanData })
      const installmentPercentage = parseInt(paymentPlanData.installmentPercentage)
      const projectCompletionPercentage = parseInt(paymentPlanData.projectCompletionPercentage)
      
      // Validate percentages
      if (installmentPercentage > 100) {
        throw new Error(`Installment percentage (${installmentPercentage}) cannot exceed 100%`)
      }
      if (projectCompletionPercentage > 100) {
        throw new Error(`Project completion percentage (${projectCompletionPercentage}) cannot exceed 100%`)
      }
      
      // Transform the data to match API payload format
      const transformedData = {
        id: id,
        reappInstallmentNumber: paymentPlanData.installmentNumber,
        reappInstallmentPercentage: installmentPercentage,
        reappProjectCompletionPercentage: projectCompletionPercentage,
        realEstateAssestDTO: {
          id: paymentPlanData.projectId || id
        }
      }

    
      
      console.log("🔄 ===== PUT REQUEST =====")
      console.log("🔄 Method: PUT")
      console.log("🔄 Endpoint:", API_ENDPOINTS.REAL_ESTATE_ASSET_PAYMENT_PLAN.UPDATE(id.toString()))
      console.log("🔄 Payload (transformedData):", transformedData)
      
      const response = await apiClient.put(
        API_ENDPOINTS.REAL_ESTATE_ASSET_PAYMENT_PLAN.UPDATE(id.toString()),
        transformedData
      )

      console.log("🔄 PUT Response:", response)
      return response
    } catch (error) {
      throw error
    }
  }

  // Get payment plans by project ID
  async getPaymentPlansByProjectId(projectId: number): Promise<any[]> {
    try {
      console.log('🔄 getPaymentPlansByProjectId called with projectId:', projectId)
      const endpoint = API_ENDPOINTS.REAL_ESTATE_ASSET_PAYMENT_PLAN.GET_BY_PROJECT_ID(projectId.toString())
      console.log('🔄 API endpoint:', endpoint)
      
      const response = await apiClient.get(endpoint)
      console.log('🔄 Payment plans response:', response)
      return (response as any).content || []
    } catch (error) {
      console.error('Error fetching payment plans:', error)
      return []
    }
  }

  // Save project closure (new closure without ID)
  async saveProjectClosure(closureData: any, projectId?: number): Promise<any> {
    try {
      console.log('🔄 saveProjectClosure called with:', { closureData, projectId })
      
      // Parse values and convert to numbers
      const parseValue = (value: string | number): number => {
        if (typeof value === 'number') return value
        if (typeof value === 'string') {
          const parsed = parseFloat(value.replace(/,/g, ''))
          return isNaN(parsed) ? 0 : parsed
        }
        return 0
      }
      
      // Transform the data to match API payload format
      const transformedData = {
        reacTotalIncomeFund: parseValue(closureData.totalIncomeFund || closureData.projectEstimatedCost || 0),
        reacTotalPayment: parseValue(closureData.totalPayment || closureData.actualCost || 0),
        realEstateAssestDTO: {
          id: projectId || closureData.projectId
        }
      }
      
      console.log('Transformed closure data:', transformedData)
      
      const response = await apiClient.post(
        API_ENDPOINTS.REAL_ESTATE_ASSET_CLOSURE.SAVE,
        transformedData
      )
      return response
    } catch (error) {
      throw error
    }
  }

  // Get project closure for review
  async getProjectClosure(projectId: string): Promise<any> {
    try {
      console.log('🔄 getProjectClosure called for projectId:', projectId)
      const response = await apiClient.get(API_ENDPOINTS.REAL_ESTATE_ASSET_CLOSURE.GET_BY_PROJECT_ID(projectId))
      console.log('🔄 getProjectClosure response:', response)
      return response
    } catch (error) {
      console.error('❌ getProjectClosure error:', error)
      return null
    }
  }

  // Get project statistics for status cards
  async getProjectStats(): Promise<RealEstateAssetStats> {
    try {
      const response = await this.getProjects(0, 1000) // Get all projects for stats
      const projects = response.content || []

      const stats: RealEstateAssetStats = {
        total: projects.length,
        active: 0,
        closed: 0,
        frozen: 0,
        approved: 0,
        inReview: 0,
        rejected: 0,
        incomplete: 0,
      }

      projects.forEach((project) => {
        const status =
          project.reaStatusDTO?.languageTranslationId?.configValue?.toLowerCase()
        const accountStatus =
          project.reaAccountStatusDTO?.languageTranslationId?.configValue?.toLowerCase()

        if (status?.includes('active')) stats.active++
        if (status?.includes('closed')) stats.closed++
        if (status?.includes('frozen')) stats.frozen++

        if (accountStatus?.includes('approved')) stats.approved++
        if (accountStatus?.includes('review')) stats.inReview++
        if (accountStatus?.includes('rejected')) stats.rejected++
        if (accountStatus?.includes('incomplete')) stats.incomplete++
      })

      return stats
    } catch (error) {
      throw error
    }
  }

  // Project Review Data Fetching Methods
  // Get project details for review
  async getProjectDetails(projectId: string): Promise<any> {
    try {
      console.log('🔄 getProjectDetails called for projectId:', projectId)
      const response = await apiClient.get(API_ENDPOINTS.REAL_ESTATE_ASSET.GET_BY_ID(projectId))
      console.log('🔄 getProjectDetails response:', response)
      return response
    } catch (error) {
      console.error('❌ getProjectDetails error:', error)
      throw error
    }
  }

  // Get project accounts for review
  async getProjectAccounts(projectId: string): Promise<any[]> {
    try {
      console.log('🔄 getProjectAccounts called for projectId:', projectId)
      const response = await apiClient.get(API_ENDPOINTS.REAL_ESTATE_BANK_ACCOUNT.GET_BY_PROJECT_ID(projectId))
      console.log('🔄 getProjectAccounts response:', response)
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response
      } else if (response && typeof response === 'object' && 'content' in response) {
        return Array.isArray((response as any).content) ? (response as any).content : []
      }
      return []
    } catch (error) {
      console.error('❌ getProjectAccounts error:', error)
      return []
    }
  }

  // Get project fees for review
  async getProjectFees(projectId: string): Promise<any[]> {
    try {
      console.log('🔄 getProjectFees called for projectId:', projectId)
      const response = await apiClient.get(API_ENDPOINTS.REAL_ESTATE_ASSET_FEE.GET_BY_PROJECT_ID(projectId))
      console.log('🔄 getProjectFees response:', response)
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response
      } else if (response && typeof response === 'object' && 'content' in response) {
        return Array.isArray((response as any).content) ? (response as any).content : []
      }
      return []
    } catch (error) {
      console.error('❌ getProjectFees error:', error)
      return []
    }
  }

  // Get project beneficiaries for review
  async getProjectBeneficiaries(projectId: string): Promise<any[]> {
    try {
      console.log('🔄 getProjectBeneficiaries called for projectId:', projectId)
      const response = await apiClient.get(API_ENDPOINTS.REAL_ESTATE_ASSET_BENEFICIARY.GET_BY_PROJECT_ID(projectId))
      console.log('🔄 getProjectBeneficiaries response:', response)
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response
      } else if (response && typeof response === 'object' && 'content' in response) {
        return Array.isArray((response as any).content) ? (response as any).content : []
      }
      return []
    } catch (error) {
      console.error('❌ getProjectBeneficiaries error:', error)
      return []
    }
  }

  // Get project payment plans for review
  async getProjectPaymentPlans(projectId: string): Promise<any[]> {
    try {
      console.log('🔄 getProjectPaymentPlans called for projectId:', projectId)
      const response = await apiClient.get(API_ENDPOINTS.REAL_ESTATE_ASSET_PAYMENT_PLAN.GET_BY_PROJECT_ID(projectId))
      console.log('🔄 getProjectPaymentPlans response:', response)
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response
      } else if (response && typeof response === 'object' && 'content' in response) {
        return Array.isArray((response as any).content) ? (response as any).content : []
      }
      return []
    } catch (error) {
      console.error('❌ getProjectPaymentPlans error:', error)
      return []
    }
  }

  // Get project financial summary for review
  async getProjectFinancialSummary(projectId: string): Promise<any> {
    try {
      console.log('🔄 getProjectFinancialSummary called for projectId:', projectId)
      const response = await apiClient.get(API_ENDPOINTS.REAL_ESTATE_ASSET_FINANCIAL_SUMMARY.GET_BY_PROJECT_ID(projectId))
      console.log('🔄 getProjectFinancialSummary response:', response)
      return response
    } catch (error) {
      console.error('❌ getProjectFinancialSummary error:', error)
      return null
    }
  }

  // Get project documents for review
  async getProjectDocuments(projectId: string): Promise<any[]> {
    try {
      console.log('🔄 getProjectDocuments called for projectId:', projectId)
      const params = new URLSearchParams({
        'module.equals': 'REAL_ESTATE_ASSET',
        'recordId.equals': projectId,
      })
      const response = await apiClient.get(`${API_ENDPOINTS.REAL_ESTATE_DOCUMENT.GET_ALL}?${params.toString()}`)
      console.log('🔄 getProjectDocuments response:', response)
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response
      } else if (response && typeof response === 'object' && 'content' in response) {
        return Array.isArray((response as any).content) ? (response as any).content : []
      }
      return []
    } catch (error) {
      console.error('❌ getProjectDocuments error:', error)
      return []
    }
  }
}

// Step-specific API methods for project forms
export interface ProjectStepData {
  step1?: RealEstateAsset // Project Details
  step2?: any // Account Details
  step3?: any // Fee Details
  step4?: any // Beneficiary Details
  step5?: any // Payment Plan
  step6?: any // Financial
  step7?: any // Project Closure
}

export interface ProjectStepValidationResponse {
  isValid: boolean
  errors: string[]
  source: 'client' | 'server'
}

// Extend the service with step-specific methods
export class ProjectStepService {
  private realEstateAssetService: RealEstateAssetService

  constructor() {
    this.realEstateAssetService = RealEstateAssetService.getInstance()
  }
  // Get project step data
  async getProjectStepData(projectId: string, step: number): Promise<any> {
    switch (step) {
      case 1:
        return this.realEstateAssetService.getProject(parseInt(projectId))
      case 2:
        // TODO: Implement account-specific API when available
        return Promise.resolve(null)
      case 3:
        // TODO: Implement fees-specific API when available
        return Promise.resolve(null)
      case 4:
        // TODO: Implement beneficiary-specific API when available
        return Promise.resolve(null)
      case 5:
        // TODO: Implement payment plan-specific API when available
        return Promise.resolve(null)
      case 6:
        // TODO: Implement financial-specific API when available
        return Promise.resolve(null)
      case 7:
        // TODO: Implement closure-specific API when available
        return Promise.resolve(null)
      default:
        throw new Error(`Invalid step: ${step}`)
    }
  }

  // Save project step data
  async saveProjectStep(
    projectId: string,
    step: number,
    data: any
  ): Promise<any> {
    switch (step) {
      case 1:
        return this.realEstateAssetService.createProject(data)
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        return this.realEstateAssetService.updateProject(
          parseInt(projectId),
          data
        )
      default:
        throw new Error(`Invalid step: ${step}`)
    }
  }

  // Validate project step data
  async validateProjectStep(
    _step: number,
    _data: any
  ): Promise<ProjectStepValidationResponse> {
    // TODO: Implement actual validation API when available
    // For now, return mock validation
    return Promise.resolve({
      isValid: true,
      errors: [],
      source: 'client',
    })
  }
}

// Export singleton instance
export const realEstateAssetService = RealEstateAssetService.getInstance()
export const projectStepService = new ProjectStepService()

// Utility function to map API response to UI format
export function mapRealEstateAssetToProjectData(
  asset: RealEstateAsset
): ProjectData {
  const mapApiStatus = (taskStatusDTO: TaskStatusDTO | null): string => {
    if (!taskStatusDTO) {
      return 'INITIATED'
    }
    
    // Use the code from taskStatusDTO directly as it matches our new status options
    return taskStatusDTO.code || 'INITIATED'
  }

  const result: ProjectData = {
    id: asset.id,
    name: asset.reaName,
    developerId: asset.buildPartnerDTO.bpDeveloperId,
    developerCif: asset.buildPartnerDTO.bpCifrera,
    developerName: asset.buildPartnerDTO.bpName,
    projectStatus: mapApiStatus(asset.taskStatusDTO),
    approvalStatus: asset.status,
    location: asset.reaLocation,
    reraNumber: asset.reaReraNumber,
    startDate: asset.reaStartDate,
    completionDate: asset.reaCompletionDate,
    percentComplete: asset.reaPercentComplete,
    constructionCost: asset.reaConstructionCost,
    currency:
      asset.reaConstructionCostCurrencyDTO?.languageTranslationId
        ?.configValue || 'N/A',
    totalUnits: asset.reaNoOfUnits,
  }

  if (asset.reaRemarks) {
    result.remarks = asset.reaRemarks
  }

  return result
}
