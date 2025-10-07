// Types for sidebar labels API response (used by service layer)
export interface SidebarLabelResponse {
  id: number
  configId: string
  configValue: string
  content: string | null
  appLanguageCode: {
    id: number
    languageCode: string
    nameKey: string
    nameNativeValue: string
    enabled: boolean
    rtl: boolean
  }
  applicationModuleDTO: {
    id: number
    moduleName: string
    moduleDescription: string
    active: boolean
  }
  status: string | null
  enabled: boolean
}

// Processed labels type (used by store and components)
export type ProcessedLabels = Record<string, Record<string, string>> // configId -> language -> label

// UI Store state interface (simplified for UI state only)
export interface SidebarLabelsUIState {
  currentLanguage: string
  labels: ProcessedLabels // For backward compatibility
}

// UI Store actions interface (simplified for UI actions only)
export interface SidebarLabelsUIActions {
  setLanguage: (language: string) => void
  setLabels: (labels: ProcessedLabels) => void
  clearLabels: () => void
}

// Combined UI store interface
export type SidebarLabelsUIStore = SidebarLabelsUIState & SidebarLabelsUIActions

// React Query hook return type
export interface SidebarLabelsQueryResult {
  data: ProcessedLabels | undefined
  isLoading: boolean
  error: Error | null
  isStale: boolean
  refetch: () => void
}

// Integration hook return type
export interface SidebarLabelsIntegrationResult {
  // React Query data
  data: ProcessedLabels | undefined
  isLoading: boolean
  error: Error | null
  
  // Store UI state
  currentLanguage: string
  setLanguage: (language: string) => void
  
  // Combined state
  hasData: boolean
  labelsCount: number
}
