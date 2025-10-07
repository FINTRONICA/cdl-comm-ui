import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  realEstateAssetService,
  type CreateRealEstateAssetRequest,
  type UpdateRealEstateAssetRequest,
  type RealEstateAssetFilters,
} from '@/services/api/projectService'
import { BankAccountService } from '@/services/api/bankAccountService'

export const PROJECTS_QUERY_KEY = 'projects'


export function useProjects(
  page = 0,
  size = 20,
  filters?: RealEstateAssetFilters
) {
  const [pagination, setPagination] = useState({ page, size })
  const [apiPagination, setApiPagination] = useState({
    totalElements: 0,
    totalPages: 1,
  })

  const query = useQuery({
    queryKey: [
      PROJECTS_QUERY_KEY,
      { page: pagination.page, size: pagination.size, filters },
    ],
    queryFn: () =>
      realEstateAssetService.getProjects(
        pagination.page,
        pagination.size,
        filters
      ),
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
    retry: 3, 
  })

  
  if (query.data?.page) {
    const newApiPagination = {
      totalElements: query.data.page.totalElements,
      totalPages: query.data.page.totalPages,
    }
    if (JSON.stringify(newApiPagination) !== JSON.stringify(apiPagination)) {
      setApiPagination(newApiPagination)
    }
  }

  const updatePagination = useCallback((newPage: number, newSize?: number) => {
    setPagination((prev) => ({
      page: newPage,
      size: newSize !== undefined ? newSize : prev.size,
    }))
  }, [])

  return {
    ...query,
    updatePagination,
    apiPagination,
  } as typeof query & {
    updatePagination: typeof updatePagination
    apiPagination: typeof apiPagination
  }
}

// Hook to fetch a single project by ID
export function useProject(id: string) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id],
    queryFn: () => realEstateAssetService.getProject(parseInt(id)),
    enabled: !!id, // Only run if ID exists
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Hook to create a new project
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRealEstateAssetRequest) =>
      realEstateAssetService.createProject(data),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2, // Banking: retry on failure
  })
}

// Hook to update an existing project
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateRealEstateAssetRequest
    }) => realEstateAssetService.updateProject(parseInt(id), updates),
    onSuccess: (_, { id }) => {
      // Invalidate both the list and the specific project
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, id] })
    },
    retry: 2,
  })
}

// Hook to delete a project
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      realEstateAssetService.deleteProject(parseInt(id)),
    onSuccess: () => {
    
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 0, 
  })
}

// Hook to get project statistics
export function useProjectStats() {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, 'stats'],
    queryFn: () => realEstateAssetService.getProjectStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

// Hook to refetch all projects data (useful for manual refresh)
export function useRefreshProjects() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
  }
}

// Step-specific save hooks for project forms
export function useSaveProjectDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => realEstateAssetService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      realEstateAssetService.updateProject(parseInt(projectId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectFees() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      realEstateAssetService.updateProject(parseInt(projectId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectIndividualFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feeData: any) =>
      realEstateAssetService.saveProjectFee(feeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectFinancialSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ financialData, projectId, isEdit = false, realProjectId }: { 
      financialData: any; 
      projectId: string; 
      isEdit?: boolean;
      realProjectId?: string;
    }) => {
      console.log('🔄 useSaveProjectFinancialSummary - isEdit:', isEdit, 'projectId:', projectId, 'realProjectId:', realProjectId)
      console.log('🔄 financialData received:', financialData)
      
      if (isEdit) {
        // Use update API for editing
        // projectId here is actually the financial summary ID (76)
        // realProjectId is the actual project ID (3074)
        const financialSummaryId = parseInt(projectId)
        const actualProjectId = realProjectId ? parseInt(realProjectId) : parseInt(projectId)
        
        console.log('🔄 Financial Summary - Using UPDATE API for editing (PUT)')
        console.log('🔄 Financial Summary ID for endpoint:', financialSummaryId)
        console.log('🔄 Project ID for payload:', actualProjectId)
        
        return realEstateAssetService.updateFinancialSummary(financialSummaryId, financialData, actualProjectId)
      } else {
        // Use create API for new financial summary
        console.log('🔄 Financial Summary - Using CREATE API for new (POST)')
        console.log('🔄 Calling saveProjectFinancialSummary with projectId:', projectId)
        return realEstateAssetService.saveProjectFinancialSummary(financialData, projectId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      realEstateAssetService.updateProject(parseInt(projectId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectIndividualBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (beneficiaryData: any) =>
      realEstateAssetService.saveProjectBeneficiary(beneficiaryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectPaymentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, data, isEdit = false }: { 
      projectId: string; 
      data: any; 
      isEdit?: boolean 
    }) => {
      console.log("check if inside mutation of payment plan:",JSON.stringify(data,null,2))
      console.log("🔄 Payment Plan - isEdit:", isEdit)
      
      const paymentArray = data?.paymentPlan || data
      console.log("check paymentArray of payment plan:",paymentArray)
      
      if (Array.isArray(paymentArray)) {
        console.log("check if array - processing payment plans")
        const results = []
        
        for (const item of paymentArray) {
          console.log("check item of payment plan:",item)
          console.log("🔄 Payment Plan Item - isEdit:", isEdit, "item.id:", item.id, "typeof item.id:", typeof item.id)
          try {
            let result
            // If in edit mode AND item has an ID, use PUT to update
            if (isEdit && item.id) {
              console.log("🔄 Updating existing payment plan with ID:", item.id)
              result = await realEstateAssetService.updatePaymentPlan(parseInt(item.id), {
                ...item,
                projectId: parseInt(projectId)
              })
            } else {
              // Otherwise, use POST to create new payment plan
              console.log("🔄 Creating new payment plan - isEdit:", isEdit, "item.id:", item.id)
              result = await realEstateAssetService.savePaymentPlan(item, parseInt(projectId))
            }
            console.log("check result of payment plan:",result)
            results.push(result)
          } catch (error) {
            console.error("Error saving payment plan item:", error)
            results.push({ error: error instanceof Error ? error.message : 'Unknown error', item })
          }
        }
        console.log("check result array of payment plan:",results)
        return results
      } else {
        // Single payment plan object
        if (isEdit && paymentArray.id) {
          console.log("🔄 Updating single payment plan with ID:", paymentArray.id)
          return realEstateAssetService.updatePaymentPlan(parseInt(paymentArray.id), {
            ...paymentArray,
            projectId: parseInt(projectId)
          })
        } else {
          console.log("🔄 Creating single payment plan")
          return realEstateAssetService.savePaymentPlan(paymentArray, parseInt(projectId))
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectFinancial() {
  const queryClient = useQueryClient()
 
  return useMutation({
    mutationFn: async ({ projectId, data, isEdit = false }: { 
      projectId: string; 
      data: any; 
      isEdit?: boolean 
    }) => {
     
      if (isEdit) {
        
        return realEstateAssetService.updateFinancialSummary(parseInt(projectId), data, parseInt(projectId))
      } else {
       
        if (Array.isArray(data)) {
          
          const results = []
          for (const item of data) {
            try {
              const result = await realEstateAssetService.saveFinancialSummary(item, parseInt(projectId))
              results.push(result)
            } catch (error) {
             
              results.push({ error: error instanceof Error ? error.message : 'Unknown error', item })
            }
          }
          return results
        } else {
          // Create new financial summary (single item)
          return realEstateAssetService.saveFinancialSummary(data, parseInt(projectId))
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectClosure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, data, isEdit = false, realProjectId }: { 
      projectId: string; 
      data: any; 
      isEdit?: boolean;
      realProjectId?: string;
    }) => {
      console.log("🔄 useSaveProjectClosure called with:", { projectId, data, isEdit, realProjectId })
      
      if (isEdit) {
        // Use update API for editing
        // projectId here is actually the project closure ID
        // realProjectId is the actual project ID
        const closureId = parseInt(projectId)
        const actualProjectId = realProjectId ? parseInt(realProjectId) : parseInt(projectId)
        
        console.log('🔄 Project Closure - Using UPDATE API for editing (PUT)')
        console.log('🔄 Project Closure ID for endpoint:', closureId)
        console.log('🔄 Project ID for payload:', actualProjectId)
        
        return realEstateAssetService.updateProjectClosure(closureId, data, actualProjectId)
      } else {
        // Handle array data - send individual POST requests for each item
        if (Array.isArray(data)) {
          const results = []
          for (const item of data) {
            try {
              const result = await realEstateAssetService.saveProjectClosure(item, parseInt(projectId))
              results.push(result)
            } catch (error) {
              console.error('Error saving closure item:', error)
              results.push({ error: error instanceof Error ? error.message : 'Unknown error', item })
            }
          }
          return results
        } else {
          // Create new closure (single item)
          return realEstateAssetService.saveProjectClosure(data, parseInt(projectId))
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

export function useSaveProjectReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      realEstateAssetService.updateProject(parseInt(projectId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    retry: 2,
  })
}

// Special hook for Step 2 (Bank Accounts) - uses bank account service
export function useSaveProjectBankAccounts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bankAccounts: any[]) => {
      try {
        const result =
          await BankAccountService.saveMultipleBankAccounts(bankAccounts)
       
        return result
      } catch (error) {
       
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
    onError: () => {
      // Handle error if needed
    },
    retry: 2,
  })
}

// Hook to validate step data
export function useValidateProjectStep() {
  return useMutation({
    mutationFn: (): Promise<any> => {
      return Promise.resolve({
        isValid: true,
        errors: [],
        source: 'client',
      })
    },
    retry: 1, 
  })
}

// Parallel API calls hook for step status
export function useProjectStepStatus(projectId: string) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, 'stepStatus', projectId],
    queryFn: async () => {
      // Make all API calls in parallel
      const [
        step1Result,
        step2Result,
        step3Result,
        step4Result,
        step5Result,
        step6Result,
        step7Result,
      ] = await Promise.allSettled([
        realEstateAssetService.getProject(parseInt(projectId)),
        // TODO: Add specific API calls for each step when available
        Promise.resolve(null), // Step 2 - Account
        Promise.resolve(null), // Step 3 - Fees
        Promise.resolve(null), // Step 4 - Beneficiary
        Promise.resolve(null), // Step 5 - Payment Plan
        Promise.resolve(null), // Step 6 - Financial
        Promise.resolve(null), // Step 7 - Project Closure
      ])

      const stepStatus = {
        step1: step1Result.status === 'fulfilled' && step1Result.value !== null,
        step2: step2Result.status === 'fulfilled' && step2Result.value !== null,
        step3: step3Result.status === 'fulfilled' && step3Result.value !== null,
        step4: step4Result.status === 'fulfilled' && step4Result.value !== null,
        step5: step5Result.status === 'fulfilled' && step5Result.value !== null,
        step6: step6Result.status === 'fulfilled' && step6Result.value !== null,
        step7: step7Result.status === 'fulfilled' && step7Result.value !== null,
        lastCompletedStep: 0,
        stepData: {
          step1: step1Result.status === 'fulfilled' ? step1Result.value : null,
          step2: step2Result.status === 'fulfilled' ? step2Result.value : null,
          step3: step3Result.status === 'fulfilled' ? step3Result.value : null,
          step4: step4Result.status === 'fulfilled' ? step4Result.value : null,
          step5: step5Result.status === 'fulfilled' ? step5Result.value : null,
          step6: step6Result.status === 'fulfilled' ? step6Result.value : null,
          step7: step7Result.status === 'fulfilled' ? step7Result.value : null,
        },
        errors: {
          step1: step1Result.status === 'rejected' ? step1Result.reason : null,
          step2: step2Result.status === 'rejected' ? step2Result.reason : null,
          step3: step3Result.status === 'rejected' ? step3Result.reason : null,
          step4: step4Result.status === 'rejected' ? step4Result.reason : null,
          step5: step5Result.status === 'rejected' ? step5Result.reason : null,
          step6: step6Result.status === 'rejected' ? step6Result.reason : null,
          step7: step7Result.status === 'rejected' ? step7Result.reason : null,
        },
      }

      // Determine last completed step
      if (stepStatus.step7) stepStatus.lastCompletedStep = 7
      else if (stepStatus.step6) stepStatus.lastCompletedStep = 6
      else if (stepStatus.step5) stepStatus.lastCompletedStep = 5
      else if (stepStatus.step4) stepStatus.lastCompletedStep = 4
      else if (stepStatus.step3) stepStatus.lastCompletedStep = 3
      else if (stepStatus.step2) stepStatus.lastCompletedStep = 2
      else if (stepStatus.step1) stepStatus.lastCompletedStep = 1

      return stepStatus
    },
    enabled: !!projectId,
    staleTime: 0, // Always refetch when navigating back
    retry: 1,
  })
}

// Unified step management hook
export function useProjectStepManager() {
  const saveDetails = useSaveProjectDetails()
  const saveAccount = useSaveProjectAccount()
  const saveBankAccounts = useSaveProjectBankAccounts()
  const saveFees = useSaveProjectFees()
  const saveBeneficiary = useSaveProjectBeneficiary()
  const savePaymentPlan = useSaveProjectPaymentPlan()
  const saveFinancial = useSaveProjectFinancial()
  const saveFinancialSummary = useSaveProjectFinancialSummary()
  const saveClosure = useSaveProjectClosure()
  const saveReview = useSaveProjectReview()
  const validateStep = useValidateProjectStep()

  const saveStep = useCallback(
    async (step: number, data: unknown, projectId?: string, isEdit: boolean = false) => {
      console.log('🔄 StepManager - saveStep called:', { step, projectId, isEdit })

      switch (step) {
        case 1:
          if (isEdit && projectId) {
            // Use update API for editing
            console.log('🔄 Step 1 - Using UPDATE API for editing')
            return await realEstateAssetService.updateProjectDetails(projectId, data as any)
          } else {
            // Use create API for new projects
            console.log('🔄 Step 1 - Using CREATE API for new project')
            return await saveDetails.mutateAsync(data as any)
          }
        case 2:
          return await saveBankAccounts.mutateAsync(data as any[])
        case 3:
          // Step 4: Fees - always use POST request (ignore isEdit parameter)
          console.log('🔄 Step 4 - Fees (always POST request)')
          return await saveFees.mutateAsync({
            projectId: projectId!,
            data: data as any,
          })
        case 4:
          // Step 5: Beneficiaries - always use POST request (ignore isEdit parameter)
          console.log('🔄 Step 5 - Beneficiaries (always POST request)')
          return await saveBeneficiary.mutateAsync({
            projectId: projectId!,
            data: data as any,
          })
        case 5:
          // Step 6: Payment Plans - use PUT for edit, POST for create
          console.log("🔄 Step 6 - Payment Plans (isEdit:", isEdit, ")")
          return await savePaymentPlan.mutateAsync({
            projectId: projectId!,
            data: data as any,
            isEdit: isEdit, // Use the isEdit parameter
          })
        case 6:
          // Step 7: Financial Summary - use PUT for edit, POST for create
          console.log("🔄 Step 7 - Financial Summary (isEdit:", isEdit, ")")
          return await saveFinancialSummary.mutateAsync({
            financialData: data as any,
            projectId: projectId!,
            isEdit: isEdit, // Pass the isEdit parameter
          })
        case 7:
          console.log("🔄 Step 7 - Project Closure")
          return await saveClosure.mutateAsync({
            projectId: projectId!,
            data: data as any,
            isEdit: false, // Always create new closure for now
          })
        case 8:
          
          return await saveReview.mutateAsync({
            projectId: projectId!,
            data: data as any,
          })
        default:
          
          throw new Error(`Invalid step: ${step}`)
      }
    },
    [
      saveDetails,
      saveBankAccounts,
      saveFees,
      saveBeneficiary,
      savePaymentPlan,
      saveFinancial,
      saveFinancialSummary,
      saveClosure,
      saveReview,
    ]
  )

  return {
    saveStep,
    validateStep,
    isLoading:
      saveDetails.isPending ||
      saveAccount.isPending ||
      saveBankAccounts.isPending ||
      saveFees.isPending ||
      saveBeneficiary.isPending ||
      savePaymentPlan.isPending ||
      saveFinancial.isPending ||
      saveFinancialSummary.isPending ||
      saveClosure.isPending ||
      saveReview.isPending,
    error:
      saveDetails.error ||
      saveAccount.error ||
      saveBankAccounts.error ||
      saveFees.error ||
      saveBeneficiary.error ||
      savePaymentPlan.error ||
      saveFinancial.error ||
      saveFinancialSummary.error ||
      saveClosure.error ||
      saveReview.error,
  }
}

// Hook to fetch payment plans by project ID
export function usePaymentPlans(projectId: string) {
  return useQuery({
    queryKey: ['paymentPlans', projectId],
    queryFn: () => realEstateAssetService.getPaymentPlansByProjectId(parseInt(projectId)),
    enabled: !!projectId,
    retry: 2,
  })
}
