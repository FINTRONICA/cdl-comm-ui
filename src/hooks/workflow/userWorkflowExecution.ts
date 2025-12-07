import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  workflowExecutionService,
  type CreateWorkflowExecutionRequest,
  type UpdateWorkflowExecutionRequest,
  type WorkflowExecutionFilters,
  type WorkflowExecution,
  type WorkflowExecutionUIData,
} from '@/services/api/workflowApi/workflowExecutionService'

export const WORKFLOW_EXECUTIONS_QUERY_KEY = 'workflowExecutions'

export function useWorkflowExecutions(
  page = 0,
  size = 20,
  filters?: WorkflowExecutionFilters
) {
  return useQuery({
    queryKey: [WORKFLOW_EXECUTIONS_QUERY_KEY, page, size, filters],
    queryFn: () => workflowExecutionService.getWorkflowExecutions(page, size, filters),
  })
}

export function useWorkflowExecution(id: string) {
  return useQuery({
    queryKey: [WORKFLOW_EXECUTIONS_QUERY_KEY, id],
    queryFn: () => workflowExecutionService.getWorkflowExecution(id),
    enabled: !!id,
  })
}

export function useCreateWorkflowExecution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workflowId, data }: { workflowId: string; data: CreateWorkflowExecutionRequest }) => {
      const result = await workflowExecutionService.createWorkflowExecution(workflowId, data)
      return result
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_EXECUTIONS_QUERY_KEY] })
    },
    onError: (error) => {
      console.error('Workflow execution failed:', error)
    },
    retry: 2,
  })
}

export function useUpdateWorkflowExecution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateWorkflowExecutionRequest }) => {
      const result = await workflowExecutionService.updateWorkflowExecution(id, updates)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_EXECUTIONS_QUERY_KEY] })
    },
    onError: (error) => {
      console.error(error)
    },
    retry: 2,
  })
}

export function useDeleteWorkflowExecution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await workflowExecutionService.deleteWorkflowExecution(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKFLOW_EXECUTIONS_QUERY_KEY] })
    },
    onError: (error) => {
      console.error(error)
    },
    retry: 2,
  })
}

// Export the service methods for direct usage
export const workflowExecutionMethods = {
  createWorkflowExecution: workflowExecutionService.createWorkflowExecution.bind(
    workflowExecutionService
  ),
  getWorkflowExecutions: workflowExecutionService.getWorkflowExecutions.bind(
    workflowExecutionService
  ),
  getWorkflowExecution: workflowExecutionService.getWorkflowExecution.bind(
    workflowExecutionService
  ),
  updateWorkflowExecution: workflowExecutionService.updateWorkflowExecution.bind(
    workflowExecutionService
  ),
  deleteWorkflowExecution: workflowExecutionService.deleteWorkflowExecution.bind(
    workflowExecutionService
  ),
}