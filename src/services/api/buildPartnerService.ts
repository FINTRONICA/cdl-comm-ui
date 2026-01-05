// import { apiClient } from '@/lib/apiClient'
// import {
//   buildApiUrl,
//   buildPaginationParams,
//   API_ENDPOINTS,
// } from '@/constants/apiEndpoints'
// import type { PaginatedResponse } from '@/types'
// import type {
//   ApiDocumentResponse,
//   PaginatedDocumentResponse,
// } from '@/components/organisms/DeveloperStepper/developerTypes'

// // Task Status DTO interface
// export interface TaskStatusDTO {
//   id: number
//   code: string
//   name: string
//   description: string
//   createdAt: string
//   updatedAt: string
//   deleted: boolean
//   enabled: boolean
// }

// // Build Partner types - Updated to match API response structure
// export interface BuildPartner {
//   id: number
//   bpDeveloperId: string
//   bpCifrera: string | null
//   bpDeveloperRegNo: string
//   bpName: string | null
//   bpMasterName: string | null
//   bpNameLocal: string | null
//   bpOnboardingDate: string | null
//   bpContactAddress: string | null
//   bpContactTel: string | null
//   bpPoBox: string | null
//   bpMobile: string | null
//   bpFax: string | null
//   bpEmail: string | null
//   bpLicenseNo: string | null
//   bpLicenseExpDate: string | null
//   bpWorldCheckFlag: string | null
//   bpWorldCheckRemarks: string | null
//   bpMigratedData: boolean | null
//   bpremark: string | null
//   bpRegulatorDTO: unknown | null
//   bpActiveStatusDTO: unknown | null
//   buildPartnerBeneficiaryDTOS: unknown[] | null
//   buildPartnerContactDTOS: unknown[] | null
//   taskStatusDTO: TaskStatusDTO | null
// }

// export interface CreateBuildPartnerRequest {
//   bpName: string
//   bpDeveloperId: string
//   bpCifrera: string
//   bpNameLocal?: string
//   bpWorldCheckFlag?: string
//   bpContactAddress?: string
//   bpContactTel?: string
//   bpEmail?: string
//   bpMobile?: string
//   bpLicenseNo?: string
//   bpLicenseExpDate?: string
// }

// export interface UpdateBuildPartnerRequest {
//   bpName?: string
//   bpDeveloperId?: string
//   bpCifrera?: string
//   bpNameLocal?: string
//   bpWorldCheckFlag?: string
//   bpContactAddress?: string
//   bpContactTel?: string
//   bpEmail?: string
//   bpMobile?: string
//   bpLicenseNo?: string
//   bpLicenseExpDate?: string
// }

// export interface BuildPartnerFilters {
//   status?:
//     | 'PENDING'
//     | 'APPROVED'
//     | 'REJECTED'
//     | 'IN_PROGRESS'
//     | 'DRAFT'
//     | 'INITIATED'
//   name?: string
//   developerId?: string
// }

// export interface BuildPartnerLabel {
//   id: string
//   key: string
//   value: string
//   language: string
//   category: string
// }

// // Step-specific response types
// export interface StepSaveResponse {
//   success: boolean
//   message: string
//   stepId?: string
//   nextStep?: number
//   data?: unknown
// }

// export interface StepValidationResponse {
//   isValid: boolean
//   errors?: string[]
//   warnings?: string[]
// }

// // Build Partner form data types
// export interface BuildPartnerDetailsData {
//   bpName: string
//   bpDeveloperId: string
//   bpCifrera: string
//   bpNameLocal: string
//   bpWorldCheckFlag?: string
// }

// // UI-friendly BuildPartner interface for table display
// export interface BuildPartnerUIData {
//   id: string
//   name: string
//   developerId: string
//   developerCif: string
//   localeNames: string
//   status: string
//   registrationDate?: string | undefined
//   lastUpdated?: string | undefined
//   contactPerson?: string | undefined
//   documents?:
//     | Array<{
//         name: string
//         type: string
//         url: string
//       }>
//     | undefined
// }

// // Utility function to map API BuildPartner to UI BuildPartnerUIData
// export const mapBuildPartnerToUIData = (
//   apiData: BuildPartner
// ): BuildPartnerUIData => {
//   const mapApiStatus = (taskStatusDTO: TaskStatusDTO | null): string => {
//     if (!taskStatusDTO) {
//       return 'INITIATED'
//     }

//     // Use the code from taskStatusDTO directly as it matches our new status options
//     return taskStatusDTO.code || 'INITIATED'
//   }

//   return {
//     id: apiData.id.toString(),
//     name: apiData.bpName || 'N/A',
//     developerId: apiData.bpDeveloperId || 'N/A',
//     developerCif: apiData.bpCifrera || 'N/A',
//     localeNames: apiData.bpNameLocal || '---',
//     status: mapApiStatus(apiData.taskStatusDTO),
//     registrationDate: apiData.bpOnboardingDate || undefined,
//     lastUpdated: apiData.bpOnboardingDate || undefined,
//     contactPerson: apiData.bpContactAddress || undefined,
//   }
// }

// export interface BuildPartnerContactData {
//   id?: number | string
//   bpcFirstName: string
//   bpcLastName: string
//   bpcContactEmail: string
//   bpcContactmpaddressLine1: string
//   bpcContactmpaddressLine2: string
//   bpcContactPoBox: string
//   bpcCountryMobCode: string
//   bpcContactTelNo: string
//   bpcContactMobNo: string
//   bpcContactFaxNo: string
//   enabled?: boolean
//   deleted?: boolean | null
//   workflowStatus?: string | null
//   buildPartnerDTO?: {
//     id?: number
//   }
// }

// // API Response interface for contact data (includes nested buildPartnerDTO)
// export interface BuildPartnerContactResponse {
//   id: number
//   bpcContactName: string | null
//   bpcFirstName: string
//   bpcLastName: string
//   bpcContactTelCode: string | null
//   bpcContactTelNo: string
//   bpcCountryMobCode: string
//   bpcContactMobNo: string
//   bpcContactEmail: string
//   bpcContactAddress: string | null
//   bpcContactmpaddressLine1: string
//   bpcContactmpaddressLine2: string
//   bpcContactPoBox: string
//   bpcContactFaxNo: string
//   enabled: boolean
//   workflowStatus: string | null
//   deleted: boolean | null
//   buildPartnerDTO?: {
//     id: number
//     [key: string]: any
//   }
// }

// export interface BuildPartnerFeesData {
//   feeStructure: {
//     setupFee: number
//     transactionFee: number
//     monthlyFee: number
//   }
//   collectionMethod: 'automatic' | 'manual'
//   paymentTerms: string
// }

// export interface BuildPartnerIndividualFeeData {
//   id?: number | string
//   bpFeeCategoryDTO: {
//     id: number
//   }
//   bpFeeFrequencyDTO: {
//     id: number
//   }
//   bpAccountTypeDTO: {
//     id: number
//   }
//   debitAmount: number
//   totalAmount: number
//   feeCollectionDate: string
//   feeNextRecoveryDate: string
//   feePercentage: number
//   vatPercentage: number
//   bpFeeCurrencyDTO: {
//     id: number
//   }
//   buildPartnerDTO?: {
//     id: number
//   }
// }

// // API Response interface for fee data
// export interface BuildPartnerFeeResponse {
//   id: number
//   debitAmount?: number
//   totalAmount?: number
//   feeCollectionDate?: string
//   feeNextRecoveryDate?: string
//   feePercentage?: number
//   vatPercentage?: number
//   feeCollected?: any
//   bpFeeCategoryDTO?: {
//     id?: number
//     settingKey?: string
//     settingValue?: string
//     languageTranslationId?: {
//       id?: number
//       configId?: string
//       configValue?: string
//       content?: string | null
//       status?: string | null
//       enabled?: boolean
//       deleted?: boolean | null
//     }
//     remarks?: string | null
//     status?: string | null
//     enabled?: boolean
//     deleted?: boolean | null
//   }
//   bpFeeFrequencyDTO?: {
//     id?: number
//     settingKey?: string
//     settingValue?: string
//     languageTranslationId?: {
//       id?: number
//       configId?: string
//       configValue?: string
//       content?: string | null
//       status?: string | null
//       enabled?: boolean
//       deleted?: boolean | null
//     }
//     remarks?: string | null
//     status?: string | null
//     enabled?: boolean
//     deleted?: boolean | null
//   }
//   bpAccountTypeDTO?: {
//     id?: number
//     settingKey?: string
//     settingValue?: string
//     languageTranslationId?: {
//       id?: number
//       configId?: string
//       configValue?: string
//       content?: string | null
//       status?: string | null
//       enabled?: boolean
//       deleted?: boolean | null
//     }
//     remarks?: string | null
//     status?: string | null
//     enabled?: boolean
//     deleted?: boolean | null
//   }
//   bpFeeCurrencyDTO?: {
//     id?: number
//     settingKey?: string
//     settingValue?: string
//     languageTranslationId?: {
//       id?: number
//       configId?: string
//       configValue?: string
//       content?: string | null
//       status?: string | null
//       enabled?: boolean
//       deleted?: boolean | null
//     }
//     remarks?: string | null
//     status?: string | null
//     enabled?: boolean
//     deleted?: boolean | null
//   }
// }

// // UI-friendly FeeData interface for table display
// export interface FeeUIData extends Record<string, unknown> {
//   id: string
//   feeType: string
//   frequency: string
//   debitAmount: string
//   debitAccount?: string
//   feeToBeCollected: string
//   nextRecoveryDate: string
//   feePercentage: string
//   amount: string
//   vatPercentage: string
//   currency: string
// }

// export interface BuildPartnerBeneficiaryData {
//   bpbBeneficiaryId: string
//   bpbBeneficiaryType: string
//   bpbName: string
//   bpbBankName: string
//   bpbSwiftCode: string
//   bpbRoutingCode: string
//   bpbAccountNumber: string
//   enabled: boolean
// }

// // API Response interface for beneficiary data
// export interface BuildPartnerBeneficiaryResponse {
//   id: number
//   bpbBeneficiaryId: string
//   bpbBeneficiaryType: string
//   bpbName: string
//   bpbBankName: string
//   bpbSwiftCode: string
//   bpbRoutingCode?: string
//   bpbAccountNumber: string
//   buildPartnerId?: number
//   createdAt?: string
//   updatedAt?: string
//   status?: string
//   enabled?: boolean
// }

// // Update request interface for beneficiary
// export interface UpdateBuildPartnerBeneficiaryData {
//   bpbBeneficiaryId?: string
//   bpbBeneficiaryType?: string
//   bpbName?: string
//   bpbBankName?: string
//   bpbSwiftCode?: string
//   bpbRoutingCode?: string
//   bpbAccountNumber?: string
// }

// export interface BuildPartnerReviewData {
//   reviewData: unknown
//   termsAccepted: boolean
// }

// // Customer Details API Response Types
// export interface CustomerDetailsResponse {
//   customerId: string
//   cif: string
//   name: {
//     firstName: string
//     shortName: string
//   }
//   type: string
//   contact: {
//     preferredEmail: string
//     preferredPhone: string
//     address: {
//       line1: string
//       line2: string
//       city: string
//       state: string
//       country: string
//       pinCode: string
//     }
//   }
// }

// export class BuildPartnerService {
//   async getBuildPartners(
//     page = 0,
//     size = 20,
//     filters?: BuildPartnerFilters
//   ): Promise<PaginatedResponse<BuildPartner>> {
//     // Map UI filter names to API field names
//     const apiFilters: Record<string, string> = {}
//     if (filters) {
//       if (filters.status) {
//         // Map UI status values to API status values
//         const statusMapping: Record<string, string> = {
//           Approved: 'CLEAR',
//           'In Review': 'PENDING',
//           Rejected: 'REJECTED',
//           Incomplete: 'INCOMPLETE',
//         }
//         apiFilters.bpWorldCheckFlag =
//           statusMapping[filters.status] || filters.status
//       }
//       if (filters.name) {
//         apiFilters.bpName = filters.name
//       }
//       if (filters.developerId) {
//         apiFilters.bpDeveloperId = filters.developerId
//       }
//     }

//     const params = {
//       ...buildPaginationParams(page, size),
//       ...apiFilters,
//     }
//     const queryString = new URLSearchParams(params).toString()
//     const url = `${buildApiUrl(API_ENDPOINTS.BUILD_PARTNER.GET_ALL)}&${queryString}`

//     try {
//       const result = await apiClient.get<PaginatedResponse<BuildPartner>>(url)

//       return result
//     } catch (error) {
//       throw error
//     }
//   }

//   async getBuildPartner(id: string): Promise<BuildPartner> {
//     try {
//       const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER.GET_BY_ID(id))

//       const result = await apiClient.get<BuildPartner>(url)

//       return result
//     } catch (error) {
//       throw error
//     }
//   }

//   async getBuildPartnerContact(id: string): Promise<unknown> {
//     try {
//       const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER_CONTACT.GET_BY_ID(id))

//       const result = await apiClient.get(url)

//       return result
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get contacts with pagination
//   async getBuildPartnerContactsPaginated(
//     buildPartnerId: string,
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<BuildPartnerContactResponse>> {
//     try {
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_CONTACT.GET_BY_ID(buildPartnerId)
//       )
//       const params = buildPaginationParams(page, size)
//       const queryString = new URLSearchParams(params).toString()
//       const finalUrl = `${url}&${queryString}`

//       const result =
//         await apiClient.get<PaginatedResponse<BuildPartnerContactResponse>>(
//           finalUrl
//         )

//       return result
//     } catch (error) {
//       throw error
//     }
//   }

//   async getBuildPartnerFees(id: string): Promise<BuildPartnerFeeResponse[]> {
//     try {
//       const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER_FEES.GET_BY_ID(id))
//       const result = await apiClient.get(url)

//       // Handle different response formats
//       let feeArray: BuildPartnerFeeResponse[] = []
//       if (Array.isArray(result)) {
//         feeArray = result as BuildPartnerFeeResponse[]
//       } else if (result && typeof result === 'object' && 'content' in result) {
//         feeArray = Array.isArray((result as any).content)
//           ? ((result as any).content as BuildPartnerFeeResponse[])
//           : []
//       }
//       return feeArray
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get fees with UI transformation
//   async getBuildPartnerFeesUIData(id: string): Promise<FeeUIData[]> {
//     try {
//       const feeResponse = await this.getBuildPartnerFees(id)

//       const transformedFees = this.transformFeeResponseToUIData(feeResponse)

//       return transformedFees
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get fees with pagination
//   async getBuildPartnerFeesPaginated(
//     buildPartnerId: string,
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<FeeUIData>> {
//     try {
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_FEES.GET_BY_ID(buildPartnerId)
//       )
//       const params = buildPaginationParams(page, size)
//       const queryString = new URLSearchParams(params).toString()
//       const finalUrl = `${url}&${queryString}`

//       const result =
//         await apiClient.get<PaginatedResponse<BuildPartnerFeeResponse>>(
//           finalUrl
//         )

//       // Transform the fees in the content array
//       const transformedContent = result.content.map((fee) =>
//         this.mapFeeResponseToUIData(fee)
//       )

//       return {
//         content: transformedContent,
//         page: result.page,
//       }
//     } catch (error) {
//       throw error
//     }
//   }

//   async getBuildPartnerByCif(cif: string): Promise<BuildPartner> {
//     try {
//       const params = { bpCifrera: cif }
//       const queryString = new URLSearchParams(params).toString()
//       const url = `${buildApiUrl(API_ENDPOINTS.BUILD_PARTNER.GET_ALL)}?${queryString}`

//       const result = await apiClient.get<PaginatedResponse<BuildPartner>>(url)

//       if (result?.content && result.content.length > 0) {
//         const buildPartner = result.content[0]
//         if (buildPartner) {
//           return buildPartner
//         }
//       }
//       throw new Error(`No build partner found with CIF: ${cif}`)
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get customer details by CIF from core bank API
//   async getCustomerDetailsByCif(cif: string): Promise<CustomerDetailsResponse> {
//     try {
//       const url = buildApiUrl(API_ENDPOINTS.CUSTOMER_DETAILS.GET_BY_CIF(cif))

//       const result = await apiClient.get<CustomerDetailsResponse>(url)

//       if (result) {
//         return result
//       }
//       throw new Error(`No customer details found with CIF: ${cif}`)
//     } catch (error) {
//       throw error
//     }
//   }

//   async createBuildPartner(
//     data: CreateBuildPartnerRequest
//   ): Promise<BuildPartner> {
//     try {
//       const result = await apiClient.post<BuildPartner>(
//         buildApiUrl(API_ENDPOINTS.BUILD_PARTNER.SAVE),
//         data
//       )

//       return result
//     } catch (error) {
//       throw error
//     }
//   }

//   async updateBuildPartner(
//     id: string,
//     updates: UpdateBuildPartnerRequest
//   ): Promise<BuildPartner> {
//     try {
//       const result = await apiClient.put<BuildPartner>(
//         buildApiUrl(API_ENDPOINTS.BUILD_PARTNER.UPDATE(id)),
//         updates
//       )

//       return result
//     } catch (error) {
//       throw error
//     }
//   }

//   async deleteBuildPartner(id: string): Promise<void> {
//     try {
//       await apiClient.delete<string>(
//         buildApiUrl(API_ENDPOINTS.BUILD_PARTNER.SOFT_DELETE(id))
//       )
//     } catch (error) {
//       throw error
//     }
//   }

//   async getBuildPartnerLabels(): Promise<BuildPartnerLabel[]> {
//     return apiClient.get<BuildPartnerLabel[]>(
//       buildApiUrl(API_ENDPOINTS.APP_LANGUAGE_TRANSLATION.BUILD_PARTNER)
//     )
//   }

//   // Build Partner form save methods
//   async saveBuildPartnerDetails(
//     data: BuildPartnerDetailsData,
//     isEditing = false,
//     developerId?: string
//   ): Promise<StepSaveResponse> {
//     if (isEditing && developerId) {
//       // Use PUT for editing existing details - include buildPartnerDTO in data
//       const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER.UPDATE(developerId))
//       const requestData = {
//         ...data,
//         id: parseInt(developerId),
//       }

//       const response = await apiClient.put<StepSaveResponse>(url, requestData)
//       return response
//     } else {
//       // Use POST for creating new details
//       const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER_CREATE.DETAILS_SAVE)

//       const response = await apiClient.post<StepSaveResponse>(url, data)
//       return response
//     }
//   }

//   async saveBuildPartnerContact(
//     data: BuildPartnerContactData,
//     isEditing = false,
//     developerId?: string
//   ): Promise<StepSaveResponse> {
//     if (isEditing && data.id) {
//       // Use PUT for updating existing contact with ID
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_CONTACT.UPDATE(data.id.toString())
//       )
//       // Destructure to remove any existing buildPartnerDTO to avoid sending nested data
//       const { buildPartnerDTO, ...contactDataWithoutBuildPartner } = data
//       const requestData = {
//         ...contactDataWithoutBuildPartner,
//         // Preserve workflow-related fields from original data
//         enabled: true,
//         deleted: false,
//         workflowStatus: data.workflowStatus ?? null,
//         buildPartnerDTO: { id: parseInt(developerId || '0') },
//       }

//       const response = await apiClient.put<StepSaveResponse>(url, requestData)
//       return response
//     } else {
//       // Use POST for creating new contact
//       const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER_CREATE.CONTACT_SAVE)
//       // Destructure to remove any existing buildPartnerDTO to avoid sending nested data
//       const { buildPartnerDTO, ...contactDataWithoutBuildPartner } = data
//       const requestData = {
//         ...contactDataWithoutBuildPartner,
//         buildPartnerDTO: developerId
//           ? { id: parseInt(developerId) }
//           : undefined,
//       }

//       const response = await apiClient.post<StepSaveResponse>(url, requestData)
//       return response
//     }
//   }

//   async deleteBuildPartnerContact(contactId: string | number): Promise<void> {
//     const url = buildApiUrl(
//       API_ENDPOINTS.BUILD_PARTNER_CONTACT.SOFT_DELETE(contactId.toString())
//     )
//     await apiClient.delete(url)
//   }

//   async getBuildPartnerContactById(
//     contactId: string
//   ): Promise<BuildPartnerContactResponse> {
//     const url = buildApiUrl(`/build-partner-contact/${contactId}`)
//     const response = await apiClient.get<BuildPartnerContactResponse>(url)
//     return response
//   }

//   async deleteBuildPartnerFee(feeId: string | number): Promise<void> {
//     const url = buildApiUrl(
//       API_ENDPOINTS.BUILD_PARTNER_FEES.SOFT_DELETE(feeId.toString())
//     )
//     await apiClient.delete(url)
//   }

//   async getBuildPartnerFeeById(feeId: string | number): Promise<unknown> {
//     const url = buildApiUrl(
//       API_ENDPOINTS.BUILD_PARTNER_FEES.GET_FEE_BY_ID(feeId.toString())
//     )
//     const response = await apiClient.get(url)
//     return response
//   }

//   async saveBuildPartnerFees(
//     data: BuildPartnerFeesData,
//     isEditing = false,
//     developerId?: string
//   ): Promise<StepSaveResponse> {
//     if (isEditing && developerId) {
//       // Use POST for editing existing fees - wrap data with isEditing and developerId
//       const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER_CREATE.FEES_SAVE)
//       // Destructure to remove any existing buildPartnerDTO to avoid sending nested data
//       const { buildPartnerDTO, ...feesDataWithoutBuildPartner } = data as any
//       const requestData = {
//         data: {
//           ...feesDataWithoutBuildPartner,
//           buildPartnerDTO: { id: parseInt(developerId) },
//         },
//         isEditing: false,
//         developerId: developerId,
//       }

//       const response = await apiClient.post<StepSaveResponse>(url, requestData)
//       return response
//     } else {
//       // Use POST for creating new fees - send data directly
//       const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER_CREATE.FEES_SAVE)

//       const response = await apiClient.post<StepSaveResponse>(url, data)
//       return response
//     }
//   }

//   async saveBuildPartnerIndividualFee(
//     data: BuildPartnerIndividualFeeData,
//     isEditing = false,
//     developerId?: string
//   ): Promise<unknown> {
//     try {
//       const feeId = (data as any).id

//       if (isEditing && feeId) {
//         // Use PUT for updating existing individual fee
//         const url = buildApiUrl(
//           API_ENDPOINTS.BUILD_PARTNER_FEES.UPDATE(feeId.toString())
//         )
//         // Destructure to remove any existing buildPartnerDTO to avoid sending nested data
//         const { buildPartnerDTO, ...feeDataWithoutBuildPartner } = data as any
//         const requestData = {
//           ...feeDataWithoutBuildPartner,
//           enabled: true,
//           deleted: false,
//           buildPartnerDTO: { id: parseInt(developerId || '0') },
//         }

//         const result = await apiClient.put(url, requestData)
//         return result
//       } else {
//         // Use POST for creating new individual fee
//         const result = await apiClient.post(
//           buildApiUrl(API_ENDPOINTS.BUILD_PARTNER_FEES.SAVE),
//           data
//         )
//         return result
//       }
//     } catch (error) {
//       throw error
//     }
//   }

//   async saveBuildPartnerBeneficiary(
//     data: BuildPartnerBeneficiaryData,
//     isEditing = false,
//     developerId?: string,
//     beneficiaryId?: string | number
//   ): Promise<StepSaveResponse> {
//     if (isEditing && beneficiaryId) {
//       // Use PUT for editing existing beneficiary
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_BENEFICIARY.UPDATE(String(beneficiaryId))
//       )
//       // Destructure to remove any existing buildPartnerDTO or buildPartnerId to avoid sending nested data
//       const { buildPartnerDTO, buildPartnerId, ...beneficiaryDataClean } =
//         data as any
//       const requestData = {
//         ...beneficiaryDataClean,
//         enabled: true,
//         deleted: false,
//         ...(developerId && {
//           buildPartnerDTO: [{ id: parseInt(developerId) }],
//         }),
//       }

//       const response = await apiClient.put<StepSaveResponse>(url, requestData)
//       return response
//     } else {
//       // Use POST for creating new beneficiary
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_CREATE.BENEFICIARY_SAVE
//       )
//       // Destructure to remove any existing buildPartnerDTO or buildPartnerId to avoid sending nested data
//       const { buildPartnerDTO, buildPartnerId, ...beneficiaryDataClean } =
//         data as any
//       const requestData = {
//         ...beneficiaryDataClean,
//         ...(developerId && {
//           buildPartnerDTO: [{ id: parseInt(developerId) }],
//         }),
//       }

//       const response = await apiClient.post<StepSaveResponse>(url, requestData)
//       return response
//     }
//   }

//   async getBuildPartnerBeneficiaries(
//     buildPartnerId?: string
//   ): Promise<BuildPartnerBeneficiaryResponse[] | undefined> {
//     try {
//       if (!buildPartnerId) {
//         return []
//       }

//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_BENEFICIARY.GET_BY_ID(buildPartnerId)
//       )

//       const response = await apiClient.get<{
//         content: BuildPartnerBeneficiaryResponse[]
//         page: {
//           size: number
//           number: number
//           totalElements: number
//           totalPages: number
//         }
//       }>(url)

//       return response?.content || []
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get beneficiaries with pagination
//   async getBuildPartnerBeneficiariesPaginated(
//     buildPartnerId?: string,
//     page = 0,
//     size = 20
//   ): Promise<PaginatedResponse<BuildPartnerBeneficiaryResponse>> {
//     try {
//       if (!buildPartnerId) {
//         return {
//           content: [],
//           page: {
//             size,
//             number: page,
//             totalElements: 0,
//             totalPages: 0,
//           },
//         }
//       }

//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_BENEFICIARY.GET_BY_ID(buildPartnerId)
//       )
//       const params = buildPaginationParams(page, size)
//       const queryString = new URLSearchParams(params).toString()
//       const finalUrl = `${url}&${queryString}`

//       const response =
//         await apiClient.get<PaginatedResponse<BuildPartnerBeneficiaryResponse>>(
//           finalUrl
//         )

//       return response
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get a specific beneficiary by ID
//   async getBuildPartnerBeneficiary(
//     id: string
//   ): Promise<BuildPartnerBeneficiaryResponse> {
//     try {
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_BENEFICIARY.GET_BY_ID(id)
//       )
//       const response = await apiClient.get<BuildPartnerBeneficiaryResponse>(url)

//       return response
//     } catch (error) {
//       throw error
//     }
//   }

//   // Update a beneficiary
//   async updateBuildPartnerBeneficiary(
//     id: string,
//     data: UpdateBuildPartnerBeneficiaryData
//   ): Promise<BuildPartnerBeneficiaryResponse> {
//     try {
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_BENEFICIARY.UPDATE(id)
//       )

//       const response = await apiClient.put<BuildPartnerBeneficiaryResponse>(
//         url,
//         data
//       )

//       return response
//     } catch (error) {
//       throw error
//     }
//   }

//   // Delete a beneficiary (soft delete)
//   async deleteBuildPartnerBeneficiary(id: string): Promise<void> {
//     try {
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_BENEFICIARY.SOFT_DELETE(id)
//       )

//       await apiClient.delete(url)
//     } catch (error) {
//       throw error
//     }
//   }

//   // Soft delete a beneficiary
//   async softDeleteBuildPartnerBeneficiary(id: string): Promise<void> {
//     try {
//       const url = buildApiUrl(
//         API_ENDPOINTS.BUILD_PARTNER_BENEFICIARY.SOFT_DELETE(id)
//       )

//       await apiClient.delete(url)
//     } catch (error) {
//       throw error
//     }
//   }

//   // Get a specific beneficiary by ID for editing
//   async getBuildPartnerBeneficiaryById(
//     beneficiaryId: string | number
//   ): Promise<unknown> {
//     const url = buildApiUrl(`/build-partner-beneficiary/${beneficiaryId}`)
//     const response = await apiClient.get(url)
//     return response
//   }

//   async saveBuildPartnerReview(
//     data: BuildPartnerReviewData
//   ): Promise<StepSaveResponse> {
//     const url = buildApiUrl(API_ENDPOINTS.BUILD_PARTNER_CREATE.REVIEW_SAVE)
//     return apiClient.post<StepSaveResponse>(url, data)
//   }

//   // Get uploaded documents for any entity with configurable module
//   async getBuildPartnerDocuments(
//     entityId: string,
//     module: string,
//     page: number = 0,
//     size: number = 20
//   ): Promise<PaginatedDocumentResponse> {
//     try {
//       // Build URL with query parameters to filter by module and recordId, plus pagination
//       const params = new URLSearchParams({
//         'module.equals': module,
//         'recordId.equals': entityId,
//         page: page.toString(),
//         size: size.toString(),
//       })
//       const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.GET_ALL)}?${params.toString()}`

//       const result = await apiClient.get<PaginatedDocumentResponse>(url)

//       // Return the full paginated response
//       return (
//         result || {
//           content: [],
//           page: {
//             size: size,
//             number: page,
//             totalElements: 0,
//             totalPages: 0,
//           },
//         }
//       )
//     } catch (error) {
//       throw error
//     }
//   }

//   // Document upload method with configurable module
//   async uploadBuildPartnerDocument(
//     file: File,
//     entityId: string,
//     module: string,
//     documentType?: string
//   ): Promise<ApiDocumentResponse> {
//     try {
//       const formData = new FormData()
//       formData.append('file', file)

//       // Build URL with query parameters following the API specification
//       const params = new URLSearchParams({
//         module: module,
//         recordId: entityId,
//         storageType: 'LOCAL',
//       })

//       // Add document type if provided
//       if (documentType) {
//         params.append('documentType', documentType)
//       }

//       const url = `${buildApiUrl(API_ENDPOINTS.REAL_ESTATE_DOCUMENT.UPLOAD)}?${params.toString()}`

//       // Override Content-Type header to let browser set it automatically for FormData
//       const config = {
//         headers: {
//           'Content-Type': 'multipart/form-data' as const,
//         },
//       }

//       const result = await apiClient.post<ApiDocumentResponse>(
//         url,
//         formData,
//         config
//       )

//       return result
//     } catch (error) {
//       throw error
//     }
//   }

//   // Step data retrieval and validation methods
//   async getStepData(step: number, developerId?: string): Promise<unknown> {
//     let url = buildApiUrl(
//       API_ENDPOINTS.BUILD_PARTNER_CREATE.GET_STEP_DATA(step)
//     )

//     // Add developer ID as query parameter if provided
//     if (developerId) {
//       url += `?developerId=${encodeURIComponent(developerId)}`
//     }

//     return apiClient.get(url)
//   }

//   async validateStep(
//     step: number,
//     data: unknown
//   ): Promise<StepValidationResponse> {
//     const url = buildApiUrl(
//       API_ENDPOINTS.BUILD_PARTNER_CREATE.VALIDATE_STEP(step)
//     )
//     return apiClient.post<StepValidationResponse>(url, data)
//   }

//   // Utility method to transform API response to UI-friendly format
//   transformToUIData(
//     apiResponse: PaginatedResponse<BuildPartner>
//   ): PaginatedResponse<BuildPartnerUIData> {
//     return {
//       content: apiResponse.content.map((item) => mapBuildPartnerToUIData(item)),
//       page: apiResponse.page,
//     }
//   }

//   // Utility method to get UI-friendly data directly
//   async getBuildPartnersUIData(
//     page = 0,
//     size = 20,
//     filters?: BuildPartnerFilters
//   ): Promise<PaginatedResponse<BuildPartnerUIData>> {
//     const apiResponse = await this.getBuildPartners(page, size, filters)
//     return this.transformToUIData(apiResponse)
//   }

//   // Data mapping functions for beneficiaries
//   mapBeneficiaryToUI(
//     apiData: BuildPartnerBeneficiaryResponse
//   ): Record<string, unknown> {
//     return {
//       id: apiData.id.toString(),
//       bpbBeneficiaryId: apiData.bpbBeneficiaryId,
//       bpbBeneficiaryType: apiData.bpbBeneficiaryType,
//       bpbName: apiData.bpbName,
//       bpbBankName: apiData.bpbBankName,
//       bpbSwiftCode: apiData.bpbSwiftCode,
//       bpbRoutingCode: apiData.bpbRoutingCode || '',
//       bpbAccountNumber: apiData.bpbAccountNumber,
//       buildPartnerId: apiData.buildPartnerId,
//       createdAt: apiData.createdAt,
//       updatedAt: apiData.updatedAt,
//       status: apiData.status,
//       enabled: apiData.enabled,
//     }
//   }

//   mapUIToBeneficiaryAPI(
//     uiData: Record<string, unknown>
//   ): UpdateBuildPartnerBeneficiaryData {
//     return {
//       bpbBeneficiaryId: uiData.bpbBeneficiaryId as string,
//       bpbBeneficiaryType: uiData.bpbBeneficiaryType as string,
//       bpbName: uiData.bpbName as string,
//       bpbBankName: uiData.bpbBankName as string,
//       bpbSwiftCode: uiData.bpbSwiftCode as string,
//       bpbRoutingCode: uiData.bpbRoutingCode as string,
//       bpbAccountNumber: uiData.bpbAccountNumber as string,
//     }
//   }

//   mapFormToBeneficiaryAPI(
//     formData: Record<string, unknown>
//   ): BuildPartnerBeneficiaryData {
//     return {
//       bpbBeneficiaryId: (formData.bpbBeneficiaryId as string) || '',
//       bpbBeneficiaryType: (formData.bpbBeneficiaryType as string) || 'RTGS',
//       bpbName: (formData.bpbName as string) || '',
//       bpbBankName: (formData.bpbBankName as string) || '',
//       bpbSwiftCode: (formData.bpbSwiftCode as string) || '',
//       bpbRoutingCode: (formData.bpbRoutingCode as string) || '',
//       bpbAccountNumber: (formData.bpbAccountNumber as string) || '',
//       enabled: true,
//     }
//   }

//   /**
//    * Search build partners by name with pagination
//    * Used for autocomplete functionality
//    */
//   async searchBuildPartners(
//     query: string,
//     page = 0,
//     size = 20
//   ): Promise<BuildPartner[]> {
//     try {
//       if (!query || query.trim().length === 0) {
//         return []
//       }

//       const params = {
//         ...buildPaginationParams(page, size),
//         'bpName.contains': query.trim(),
//         'deleted.equals': 'false',
//         'enabled.equals': 'true',
//       }
//       const url = `${buildApiUrl(API_ENDPOINTS.BUILD_PARTNER.SAVE)}?${new URLSearchParams(params).toString()}`
//       const response = await apiClient.get(url)
//       // Handle both single object and paginated response formats
//       let buildPartners: BuildPartner[] = []

//       if (Array.isArray(response)) {
//         // Direct array response
//         buildPartners = response
//       } else if (response && typeof response === 'object') {
//         if ('content' in response && Array.isArray(response.content)) {
//           // Paginated response format
//           buildPartners = response.content
//         } else if ('id' in response || 'bpName' in response) {
//           // Single object response - wrap in array
//           buildPartners = [response as BuildPartner]
//         }
//       }

//       return buildPartners
//     } catch (error) {
//       throw new Error('Failed to search build partners')
//     }
//   }
//   // Data mapping functions for fees
//   mapFeeResponseToUIData(apiData: BuildPartnerFeeResponse): FeeUIData {
//     const mapped = {
//       id: apiData.id.toString(),
//       feeType:
//         apiData.bpFeeCategoryDTO?.languageTranslationId?.configValue ||
//         apiData.bpFeeCategoryDTO?.settingValue ||
//         '',
//       frequency:
//         apiData.bpFeeFrequencyDTO?.languageTranslationId?.configValue ||
//         apiData.bpFeeFrequencyDTO?.settingValue ||
//         '',
//       debitAmount: apiData.debitAmount?.toString() || '',
//       debitAccount:
//         apiData.bpAccountTypeDTO?.languageTranslationId?.configValue ||
//         apiData.bpAccountTypeDTO?.settingValue ||
//         '',
//       feeToBeCollected: apiData.feeCollectionDate || '',
//       nextRecoveryDate: apiData.feeNextRecoveryDate || '',
//       feePercentage: apiData.feePercentage?.toString() || '',
//       amount: apiData.totalAmount?.toString() || '',
//       vatPercentage: apiData.vatPercentage?.toString() || '',
//       currency:
//         apiData.bpFeeCurrencyDTO?.languageTranslationId?.configValue ||
//         apiData.bpFeeCurrencyDTO?.settingValue ||
//         '',
//     }

//     return mapped
//   }

//   // Transform fee API response to UI-friendly format
//   transformFeeResponseToUIData(
//     apiResponse: BuildPartnerFeeResponse[]
//   ): FeeUIData[] {
//     return apiResponse.map((item) => this.mapFeeResponseToUIData(item))
//   }
// }

// export const buildPartnerService = new BuildPartnerService()
