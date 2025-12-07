import { useQuery } from '@tanstack/react-query'
import type { TaskStatusDTO } from '@/services/api/masterApi/Customer/businessSegmentService'

export const TASK_STATUSES_QUERY_KEY = 'taskStatuses'

export function useTaskStatuses() {
  return useQuery({
    queryKey: [TASK_STATUSES_QUERY_KEY],
    queryFn: async (): Promise<TaskStatusDTO[]> => {
      try {
        // TODO: Replace with actual API endpoint when available
        // For now, return empty array
        return []
      } catch {
        return []
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}


