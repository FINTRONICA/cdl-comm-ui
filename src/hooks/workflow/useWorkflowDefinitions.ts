import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import {
  workflowDefinitionService,
  type CreateWorkflowDefinitionRequest,
  type UpdateWorkflowDefinitionRequest,
  type WorkflowDefinitionFilters,
  type ApplicationModuleDTO,
  type WorkflowActionDTO,
} from '@/services/api/workflowApi/workflowDefinitionService'
import {
  WorkflowDefinitionLabelsService,
  type ProcessedWorkflowDefinitionLabels,
} from '@/services/api/workflowApi/workflowDefinitionLabelsService'
import { useIsAuthenticated } from '../useAuthQuery'

export const WORKFLOW_DEFINITIONS_QUERY_KEY = 'workflowDefinitions'

export function useWorkflowDefinitions(
  page = 0,
  size = 20,
  filters?: WorkflowDefinitionFilters
) {
  const filtersKey = JSON.stringify(filters ?? {})

  return useQuery({
    queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY, 'list', page, size, filtersKey],
    queryFn: async () => {
      const result = await workflowDefinitionService.getWorkflowDefinitions(
        page,
        size,
        filters
      )
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useFindAllWorkflowDefinitions(
  page = 0,
  size = 20,
  filters?: WorkflowDefinitionFilters
) {
  const filtersKey = JSON.stringify(filters ?? {})

  return useQuery({
    queryKey: [
      WORKFLOW_DEFINITIONS_QUERY_KEY,
      'uiData',
      page,
      size,
      filtersKey,
    ],
    queryFn: async () => {
      const result = await workflowDefinitionService.getWorkflowDefinitions(
        page,
        size,
        filters
      )
      return result
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useSearchWorkflowDefinitions(
  queryString: string,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: [
      WORKFLOW_DEFINITIONS_QUERY_KEY,
      'search',
      { q: queryString, page, size },
    ],
    queryFn: () => {
      const filters: WorkflowDefinitionFilters = {
        name: queryString,
      }
      return workflowDefinitionService.getWorkflowDefinitions(
        page,
        size,
        filters
      )
    },
    enabled: !!queryString,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useWorkflowDefinition(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY, id],
    queryFn: () => workflowDefinitionService.getWorkflowDefinition(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useCreateWorkflowDefinition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkflowDefinitionRequest) => {
      const result =
        await workflowDefinitionService.createWorkflowDefinition(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY],
      })
      toast.success('Workflow definition created successfully!')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to create workflow definition: ${errorMessage}`)
    },
    retry: 2,
  })
}

export function useUpdateWorkflowDefinition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateWorkflowDefinitionRequest
    }) => {
      const result = await workflowDefinitionService.updateWorkflowDefinition(
        id,
        updates
      )
      return result
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY, 'detail', variables.id],
      })
      toast.success('Workflow definition updated successfully!')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to update workflow definition: ${errorMessage}`)
    },
    retry: 2,
  })
}

export function useDeleteWorkflowDefinition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result =
        await workflowDefinitionService.deleteWorkflowDefinition(id)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY],
      })
      toast.success('Workflow definition deleted successfully')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to delete workflow definition: ${errorMessage}`)
    },
    retry: false,
  })
}

export function useWorkflowDefinitionLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['workflowDefinitionLabels'],
    queryFn: async (): Promise<ProcessedWorkflowDefinitionLabels> => {
      const raw = await WorkflowDefinitionLabelsService.fetchLabels()
      return WorkflowDefinitionLabelsService.processLabels(raw)
    },
    enabled: !!isAuthenticated,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useWorkflowDefinitionLabelsWithUtils() {
  const query = useWorkflowDefinitionLabels()

  return {
    ...query,
    hasLabels: () =>
      WorkflowDefinitionLabelsService.hasLabels(
        (query.data as ProcessedWorkflowDefinitionLabels) || {}
      ),
    getLabel: (configId: string, language: string, fallback: string) =>
      WorkflowDefinitionLabelsService.getLabel(
        (query.data as ProcessedWorkflowDefinitionLabels) || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      WorkflowDefinitionLabelsService.getAvailableLanguages(
        (query.data as ProcessedWorkflowDefinitionLabels) || {}
      ),
  }
}

export function useRefreshWorkflowDefinitions() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY],
    })
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY, 'all'],
    })
  }
}

export function useApplicationModules() {
  return useQuery({
    queryKey: ['applicationModules'],
    queryFn: () =>
      workflowDefinitionService.getWorkflowDefinitionApplicationModules(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useWorkflowActions() {
  return useQuery({
    queryKey: ['workflowActions'],
    queryFn: () => workflowDefinitionService.getWorkflowDefinitionActions(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useStageTemplates() {
  return useQuery({
    queryKey: ['stageTemplates'],
    queryFn: () =>
      workflowDefinitionService.getWorkflowDefinitionStageTemplates(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useAmountRules() {
  return useQuery({
    queryKey: ['amountRules'],
    queryFn: () => workflowDefinitionService.getWorkflowDefinitionAmountRules(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useWorkflowDefinitionsUIData(
  page = 0,
  size = 20,
  filters?: WorkflowDefinitionFilters
) {
  return useQuery({
    queryKey: [WORKFLOW_DEFINITIONS_QUERY_KEY, 'ui', { page, size, filters }],
    queryFn: async () => {
      const apiResponse =
        await workflowDefinitionService.getWorkflowDefinitions(
          page,
          size,
          filters
        )
      return workflowDefinitionService.transformToUIData(apiResponse)
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: true,
  })
}

export function useWorkflowDefinitionForm() {
  const applicationModules = useApplicationModules()
  const workflowActions = useWorkflowActions()
  const create = useCreateWorkflowDefinition()
  const update = useUpdateWorkflowDefinition()

  const moduleOptions =
    applicationModules.data?.map((module: ApplicationModuleDTO) => ({
      id: module.id,
      label: module.moduleDescription,
      value: module.id,
      code: module.moduleCode,
      description: module.moduleDescription,
    })) || []

  const actionOptions =
    workflowActions.data?.map((action: WorkflowActionDTO) => ({
      id: action.id,
      label: action.description,
      value: action.id,
      key: action.actionKey,
      description: action.description,
    })) || []

  const createDefinition = useCallback(
    (formData: {
      name: string
      version?: number
      amountBased?: boolean
      moduleCode?: string
      actionCode?: string
      applicationModuleId?: number | null
      workflowActionId?: number | null
      enabled?: boolean
    }) => {
      const createRequest: CreateWorkflowDefinitionRequest = {
        name: formData.name,
        ...(formData.version !== undefined && { version: formData.version }),
        ...(formData.amountBased !== undefined && {
          amountBased: formData.amountBased,
        }),
        ...(formData.moduleCode && { moduleCode: formData.moduleCode }),
        ...(formData.actionCode && { actionCode: formData.actionCode }),
        ...(formData.applicationModuleId && {
          applicationModuleId: formData.applicationModuleId,
        }),
        ...(formData.workflowActionId && {
          workflowActionId: formData.workflowActionId,
        }),
        ...(formData.enabled !== undefined && { enabled: formData.enabled }),
      }
      return create.mutateAsync(createRequest)
    },
    [create]
  )

  const updateDefinition = useCallback(
    (
      id: string,
      formData: {
        name?: string
        version?: number
        amountBased?: boolean
        moduleCode?: string
        actionCode?: string
        applicationModuleId?: number | null
        workflowActionId?: number | null
        enabled?: boolean
      }
    ) => {
      const updateRequest: UpdateWorkflowDefinitionRequest = {
        ...(formData.name && { name: formData.name }),
        ...(formData.version !== undefined && { version: formData.version }),
        ...(formData.amountBased !== undefined && {
          amountBased: formData.amountBased,
        }),
        ...(formData.moduleCode && { moduleCode: formData.moduleCode }),
        ...(formData.actionCode && { actionCode: formData.actionCode }),
        ...(formData.applicationModuleId && {
          applicationModuleId: formData.applicationModuleId,
        }),
        ...(formData.workflowActionId && {
          workflowActionId: formData.workflowActionId,
        }),
        ...(formData.enabled !== undefined && { enabled: formData.enabled }),
      }
      return update.mutateAsync({ id, updates: updateRequest })
    },
    [update]
  )

  return {
    applicationModules,
    workflowActions,

    moduleOptions,
    actionOptions,

    createDefinition,
    updateDefinition,

    isLoading: applicationModules.isLoading || workflowActions.isLoading,
    isSubmitting: create.isPending || update.isPending,

    errors: {
      modules: applicationModules.error,
      actions: workflowActions.error,
      create: create.error,
      update: update.error,
    },

    getModuleById: (id: number) =>
      applicationModules.data?.find((m) => m.id === id),
    getActionById: (id: number) =>
      workflowActions.data?.find((a) => a.id === id),
  }
}

export function useWorkflowDefinitionManager() {
  const create = useCreateWorkflowDefinition()
  const update = useUpdateWorkflowDefinition()
  const remove = useDeleteWorkflowDefinition()
  const refresh = useRefreshWorkflowDefinitions()

  const createDefinition = useCallback(
    (data: CreateWorkflowDefinitionRequest) => create.mutateAsync(data),
    [create]
  )
  const updateDefinition = useCallback(
    ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateWorkflowDefinitionRequest
    }) => update.mutateAsync({ id, updates }),
    [update]
  )
  const deleteDefinition = useCallback(
    (id: string) => remove.mutateAsync(id),
    [remove]
  )

  return {
    createDefinition,
    updateDefinition,
    deleteDefinition,
    isAnyLoading: create.isPending || update.isPending || remove.isPending,
    errors: create.error || update.error || remove.error,
    refreshDefinitions: refresh,
  }
}

export function extractApplicationModuleId(
  applicationModuleDTO: string
): number | null {
  try {
    const id = parseInt(applicationModuleDTO, 10)
    return isNaN(id) ? null : id
  } catch {
    return null
  }
}

export function extractWorkflowActionId(
  workflowActionDTO: string
): number | null {
  try {
    const id = parseInt(workflowActionDTO, 10)
    return isNaN(id) ? null : id
  } catch {
    return null
  }
}

export function formatApplicationModuleDTO(
  applicationModuleDTO: string,
  applicationModules?: ApplicationModuleDTO[]
): string {
  const id = extractApplicationModuleId(applicationModuleDTO)
  if (!id) return applicationModuleDTO

  const foundModule = applicationModules?.find((mod) => mod.id === id)
  if (foundModule) {
    return `${foundModule.moduleName || 'Unnamed'} (ID: ${id})`
  }

  return `ID: ${id}`
}

export function formatWorkflowActionDTO(
  workflowActionDTO: string,
  workflowActions?: WorkflowActionDTO[]
): string {
  const id = extractWorkflowActionId(workflowActionDTO)
  if (!id) return workflowActionDTO

  const action = workflowActions?.find((act) => act.id === id)
  if (action) {
    return `${action.name || 'Unnamed'} (ID: ${id})`
  }

  return `ID: ${id}`
}
