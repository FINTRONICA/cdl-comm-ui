export interface ActivityData {
  developer: string
  maker: string
  recentActor: string
  comment: string
  createdDate: string
  updatedDate: string
  status: string
  activityId: string
  activityType: string
  projectName: string
  priority: string
  dueDate: string
  documents: Array<{ name: string; status: string; color: string }>
  recentActivity: Array<{ date: string; action: string; color: string }>
  [key: string]: unknown
}

export interface SearchState {
  developer: string
  maker: string
  recentActor: string
  comment: string
  createdDate: string
  updatedDate: string
  status: string
}

export interface StatusCardData {
  label: string
  count: number
  color: string
  textColor: string
  dotColor: string
}

export interface Tab {
  id: string
  label: string
  count?: number
} 