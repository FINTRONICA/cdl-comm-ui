import { apiClient } from '@/lib/apiClient'
import type { Activity, PaginatedResponse } from '@/types'

export class ActivityService {
  async getActivities(page = 1, limit = 20): Promise<PaginatedResponse<Activity>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    return apiClient.get<PaginatedResponse<Activity>>(`/activities?${params}`)
  }

  async getActivity(id: string): Promise<Activity> {
    return apiClient.get<Activity>(`/activities/${id}`)
  }
}

export const activityService = new ActivityService() 