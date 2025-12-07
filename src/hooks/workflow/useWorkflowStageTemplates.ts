import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  workflowStageTemplateService,
  type CreateWorkflowStageTemplateRequest,
  type UpdateWorkflowStageTemplateRequest,
  type WorkflowStageTemplateFilters,
} from '@/services/api/workflowApi/workflowStageTemplateService'
import { useIsAuthenticated } from '../useAuthQuery'
import {
  workflowDefinitionService,
  type WorkflowDefinition,
} from '@/services/api/workflowApi/workflowDefinitionService'
import {
  WorkflowStageTemplateLabelsService,
  type ProcessedWorkflowStageTemplateLabels,
} from '@/services/api/workflowApi/workflowStageTemplateLabelsService'
import { toast } from 'react-hot-toast'

export const WORKFLOW_STAGE_TEMPLATES_QUERY_KEY = 'workflowStageTemplates'

export function useWorkflowStageTemplates(
  page = 0,
  size = 20,
  filters?: WorkflowStageTemplateFilters
) {
  const filtersKey = JSON.stringify(filters ?? {})

  return useQuery({
    queryKey: [
      WORKFLOW_STAGE_TEMPLATES_QUERY_KEY,
      'list',
      page,
      size,
      filtersKey,
    ],
    queryFn: async () => {
      const result =
        await workflowStageTemplateService.getWorkflowStageTemplates(
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

export function useFindAllWorkflowStageTemplates(
  page = 0,
  size = 20,
  filters?: WorkflowStageTemplateFilters
) {
  const filtersKey = JSON.stringify(filters ?? {})

  return useQuery({
    queryKey: [
      WORKFLOW_STAGE_TEMPLATES_QUERY_KEY,
      'uiData',
      page,
      size,
      filtersKey,
    ],
    queryFn: async () => {
      const result =
        await workflowStageTemplateService.getWorkflowStageTemplates(
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

export function useSearchWorkflowStageTemplates(
  queryString: string,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: [
      WORKFLOW_STAGE_TEMPLATES_QUERY_KEY,
      'search',
      { q: queryString, page, size },
    ],
    queryFn: () => {
      const filters: WorkflowStageTemplateFilters = {
        name: queryString,
      }
      return workflowStageTemplateService.getWorkflowStageTemplates(
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

export function useWorkflowStageTemplate(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_STAGE_TEMPLATES_QUERY_KEY, id],
    queryFn: () => workflowStageTemplateService.getWorkflowStageTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useCreateWorkflowStageTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkflowStageTemplateRequest) => {
      const result =
        await workflowStageTemplateService.createWorkflowStageTemplate(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_STAGE_TEMPLATES_QUERY_KEY],
      })
    },
    onError: (error) => {
      toast.error(`${error}`)
    },
    retry: 2,
  })
}

export function useUpdateWorkflowStageTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateWorkflowStageTemplateRequest
    }) => {
      const result =
        await workflowStageTemplateService.updateWorkflowStageTemplate(
          id,
          updates
        )
      return result
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_STAGE_TEMPLATES_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_STAGE_TEMPLATES_QUERY_KEY, 'detail', variables.id],
      })
    },
    onError: (error) => {
      toast.error(`${error}`)
    },
    retry: 2,
  })
}

export function useDeleteWorkflowStageTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result =
        await workflowStageTemplateService.deleteWorkflowStageTemplate(id)
      return result
    },
    onSuccess: (_, deletedId) => {
     

      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_STAGE_TEMPLATES_QUERY_KEY],
      })

      queryClient.invalidateQueries({
        queryKey: [WORKFLOW_STAGE_TEMPLATES_QUERY_KEY, 'list'],
      })
    },
    onError: (error) => {
      toast.error(`${error}`)
    },
    retry: false,
  })
}

export function useWorkflowStageTemplateLabels() {
  const { isAuthenticated } = useIsAuthenticated()

  return useQuery({
    queryKey: ['workflowStageTemplateLabels'],
    queryFn: async (): Promise<ProcessedWorkflowStageTemplateLabels> => {
      const raw = await WorkflowStageTemplateLabelsService.fetchLabels()
      return WorkflowStageTemplateLabelsService.processLabels(raw)
    },
    enabled: !!isAuthenticated,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

export function useWorkflowStageTemplateLabelsWithUtils() {
  const query = useWorkflowStageTemplateLabels()

  return {
    ...query,
    hasLabels: () =>
      WorkflowStageTemplateLabelsService.hasLabels(
        (query.data as ProcessedWorkflowStageTemplateLabels) || {}
      ),
    getLabel: (configId: string, language: string, fallback: string) =>
      WorkflowStageTemplateLabelsService.getLabel(
        (query.data as ProcessedWorkflowStageTemplateLabels) || {},
        configId,
        language,
        fallback
      ),
    getAvailableLanguages: () =>
      WorkflowStageTemplateLabelsService.getAvailableLanguages(
        (query.data as ProcessedWorkflowStageTemplateLabels) || {}
      ),
  }
}

export function useRefreshWorkflowStageTemplates() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_STAGE_TEMPLATES_QUERY_KEY],
    })
    queryClient.invalidateQueries({
      queryKey: [WORKFLOW_STAGE_TEMPLATES_QUERY_KEY, 'all'],
    })
  }
}

export function useWorkflowDefinitions() {
  return useQuery({
    queryKey: ['workflowDefinitions'],
    queryFn: () => workflowDefinitionService.getWorkflowDefinitions(0, 1000),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useWorkflowStageTemplatesUIData(
  page = 0,
  size = 20,
  filters?: WorkflowStageTemplateFilters
) {
  return useQuery({
    queryKey: [
      WORKFLOW_STAGE_TEMPLATES_QUERY_KEY,
      'ui',
      { page, size, filters },
    ],
    queryFn: async () => {
      const apiResponse =
        await workflowStageTemplateService.getWorkflowStageTemplates(
          page,
          size,
          filters
        )
      return workflowStageTemplateService.transformToUIData(apiResponse)
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: true,
  })
}

export function useWorkflowStageTemplateForm() {
  const workflowDefinitions = useWorkflowDefinitions()
  const create = useCreateWorkflowStageTemplate()
  const update = useUpdateWorkflowStageTemplate()

  // Transform data for dropdowns
  const workflowDefinitionOptions =
    workflowDefinitions.data?.content?.map((def) => ({
      id: def.id,
      label: def.name || 'Unnamed',
      value: def.id,
      name: def.name,
      version: def.version,
      moduleCode: def.moduleCode,
      actionCode: def.actionCode,
    })) || []

  const createStageTemplate = useCallback(
    (formData: {
      stageOrder: number
      stageKey: string
      keycloakGroup: string
      requiredApprovals: number
      name: string
      description: string
      slaHours: number
      workflowDefinitionId?: number | string
    }) => {
      const createRequest: CreateWorkflowStageTemplateRequest = {
        stageOrder: formData.stageOrder,
        stageKey: formData.stageKey,
        keycloakGroup: formData.keycloakGroup,
        requiredApprovals: formData.requiredApprovals,
        name: formData.name,
        description: formData.description,
        slaHours: formData.slaHours,
        workflowDefinitionDTO: formData.workflowDefinitionId
          ? String(formData.workflowDefinitionId)
          : '',
      }
      return create.mutateAsync(createRequest)
    },
    [create]
  )

  const updateStageTemplate = useCallback(
    (
      id: string,
      formData: {
        stageOrder?: number
        stageKey?: string
        keycloakGroup?: string
        requiredApprovals?: number
        name?: string
        description?: string
        slaHours?: number
        workflowDefinitionId?: number | string
      }
    ) => {
      const updateRequest: UpdateWorkflowStageTemplateRequest = {
        ...(formData.stageOrder !== undefined && {
          stageOrder: formData.stageOrder,
        }),
        ...(formData.stageKey && { stageKey: formData.stageKey }),
        ...(formData.keycloakGroup && {
          keycloakGroup: formData.keycloakGroup,
        }),
        ...(formData.requiredApprovals !== undefined && {
          requiredApprovals: formData.requiredApprovals,
        }),
        ...(formData.name && { name: formData.name }),
        ...(formData.description && { description: formData.description }),
        ...(formData.slaHours !== undefined && { slaHours: formData.slaHours }),
        ...(formData.workflowDefinitionId && {
          workflowDefinitionDTO: String(formData.workflowDefinitionId),
        }),
      }
      return update.mutateAsync({ id, updates: updateRequest })
    },
    [update]
  )

  return {
    workflowDefinitions,

    workflowDefinitionOptions,

    createStageTemplate,
    updateStageTemplate,

    isLoading: workflowDefinitions.isLoading,
    isSubmitting: create.isPending || update.isPending,

    errors: {
      workflowDefinitions: workflowDefinitions.error,
      create: create.error,
      update: update.error,
    },

    getWorkflowDefinitionById: (id: number | string) =>
      workflowDefinitions.data?.content?.find(
        (def) => def.id === id
      ),
  }
}

export function useWorkflowStageTemplateManager() {
  const create = useCreateWorkflowStageTemplate()
  const update = useUpdateWorkflowStageTemplate()
  const remove = useDeleteWorkflowStageTemplate()
  const refresh = useRefreshWorkflowStageTemplates()

  const createStageTemplate = useCallback(
    (data: CreateWorkflowStageTemplateRequest) => create.mutateAsync(data),
    [create]
  )
  const updateStageTemplate = useCallback(
    ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateWorkflowStageTemplateRequest
    }) => update.mutateAsync({ id, updates }),
    [update]
  )
  const deleteStageTemplate = useCallback(
    (id: string) => remove.mutateAsync(id),
    [remove]
  )

  return {
    createStageTemplate,
    updateStageTemplate,
    deleteStageTemplate,
    isAnyLoading: create.isPending || update.isPending || remove.isPending,
    errors: create.error || update.error || remove.error,
    refreshStageTemplates: refresh,
  }
}

export function extractWorkflowDefinitionId(
  workflowDefinitionDTO: string
): number | null {
  try {
    const id = parseInt(workflowDefinitionDTO, 10)
    return isNaN(id) ? null : id
  } catch {
    return null
  }
}

export function formatWorkflowDefinitionDTO(
  workflowDefinitionDTO: string,
  workflowDefinitions?: WorkflowDefinition[]
): string {
  const id = extractWorkflowDefinitionId(workflowDefinitionDTO)
  if (!id) return workflowDefinitionDTO

  const definition = workflowDefinitions?.find((def) => def.id === id)
  if (definition) {
    return `${definition.name || 'Unnamed'} (ID: ${id})`
  }

  return `ID: ${id}`
}
