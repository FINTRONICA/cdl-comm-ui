/**
 * TypeScript types for label configuration data
 * Based on the API response structure for transaction labels
 */

export interface AppLanguageCode {
  id: number
  languageCode: string
  nameKey: string
  nameNativeValue: string
  deleted: boolean
  enabled: boolean
  rtl: boolean
}

export interface ApplicationModuleDTO {
  id: number
  moduleName: string
  moduleCode: string
  moduleDescription: string
  deleted: boolean
  enabled: boolean
  active: boolean
}

export interface LabelConfig {
  id: number
  configId: string
  configValue: string
  content: string | null
  appLanguageCode: AppLanguageCode
  applicationModuleDTO: ApplicationModuleDTO
  status: any
  enabled: boolean
  deleted: boolean
}

export interface ProcessedTransactionLabels {
  labels: LabelConfig[]
  totalCount: number
}

export interface LabelConfigFilters {
  configId?: string
  languageCode?: string
  moduleCode?: string
  enabled?: boolean
  deleted?: boolean
}

export interface LabelConfigSearchParams {
  page?: number
  size?: number
  sort?: string
  search?: string
  configId?: string
  languageCode?: string
  moduleCode?: string
  enabled?: boolean
  deleted?: boolean
}
