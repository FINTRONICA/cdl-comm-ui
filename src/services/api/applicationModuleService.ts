import { apiClient } from '@/lib/apiClient'
import { buildApiUrl, buildPaginationParams, API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { PaginatedResponse } from '@/types'

// ================== APPLICATION MODULE TYPES ==================

export interface ApplicationModule {
  id: number
  moduleName: string
  moduleCode: string
  moduleDescription: string
  active: boolean
}

export interface CreateApplicationModuleRequest {
  moduleName: string
  moduleCode: string
  moduleDescription?: string
  active?: boolean
}

export interface UpdateApplicationModuleRequest {
  moduleName?: string
  moduleCode?: string
  moduleDescription?: string
  active?: boolean
}

export interface ApplicationModuleFilters {
  moduleName?: string
  moduleCode?: string
  active?: boolean
}

// UI-friendly interface for table display
export interface ApplicationModuleUIData {
  id: number
  moduleName: string
  moduleCode: string
  moduleDescription: string
  active: boolean
}

// ================== SERVICE CLASS ==================

export class ApplicationModuleService {
  async getApplicationModules(
    page = 0,
    size = 20,
    filters?: ApplicationModuleFilters
  ): Promise<PaginatedResponse<ApplicationModule>> {
    const apiFilters: Record<string, string | boolean> = {}
    if (filters) {
      if (filters.moduleName) apiFilters.moduleName = filters.moduleName
      if (filters.moduleCode) apiFilters.moduleCode = filters.moduleCode
      if (filters.active !== undefined) apiFilters.active = filters.active
    }

    const params = {
      ...buildPaginationParams(page, size),
      ...Object.fromEntries(
        Object.entries(apiFilters).map(([key, value]) => [key, String(value)])
      ),
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${buildApiUrl(API_ENDPOINTS.APPLICATION_MODULE.FIND_ALL)}?${queryString}`
    
    console.log('🔧 ApplicationModuleService.getApplicationModules Called:', { 
      page, 
      size, 
      filters, 
      apiFilters, 
      url,
      timestamp: new Date().toISOString() 
    })
    
    try {
      const result = await apiClient.get<PaginatedResponse<ApplicationModule>>(url)
      console.log('✅ ApplicationModuleService.getApplicationModules Success:', { 
        hasResult: !!result, 
        resultType: typeof result, 
        hasContent: !!result?.content, 
        contentLength: result?.content?.length || 0,
        pagination: result?.page,
        timestamp: new Date().toISOString() 
      })
      return result
    } catch (error) {
      console.error('❌ ApplicationModuleService.getApplicationModules Failed:', { 
        url, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw error
    }
  }

  async getApplicationModule(id: string): Promise<ApplicationModule> {
    console.log('🔧 ApplicationModuleService.getApplicationModule Called:', { id, timestamp: new Date().toISOString() })
    try {
      const result = await apiClient.get<ApplicationModule>(buildApiUrl(API_ENDPOINTS.APPLICATION_MODULE.GET_BY_ID(id)))
      console.log('✅ ApplicationModuleService.getApplicationModule Success:', { 
        id, 
        hasResult: !!result, 
        resultType: typeof result,
        timestamp: new Date().toISOString() 
      })
      return result
    } catch (error) {
      console.error('❌ ApplicationModuleService.getApplicationModule Failed:', { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw error
    }
  }

  async createApplicationModule(data: CreateApplicationModuleRequest): Promise<ApplicationModule> {
    console.log('🔧 ApplicationModuleService.createApplicationModule Called:', { 
      data, 
      timestamp: new Date().toISOString() 
    })
    try {
      const result = await apiClient.post<ApplicationModule>(buildApiUrl(API_ENDPOINTS.APPLICATION_MODULE.SAVE), data)
      console.log('✅ ApplicationModuleService.createApplicationModule Success:', { 
        hasResult: !!result, 
        resultType: typeof result,
        timestamp: new Date().toISOString() 
      })
      return result
    } catch (error) {
      console.error('❌ ApplicationModuleService.createApplicationModule Failed:', { 
        data, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw error
    }
  }

  async updateApplicationModule(id: string, updates: UpdateApplicationModuleRequest): Promise<ApplicationModule> {
    console.log('🔧 ApplicationModuleService.updateApplicationModule Called:', { 
      id, 
      updates, 
      timestamp: new Date().toISOString() 
    })
    try {
      const result = await apiClient.put<ApplicationModule>(buildApiUrl(API_ENDPOINTS.APPLICATION_MODULE.UPDATE(id)), updates)
      console.log('✅ ApplicationModuleService.updateApplicationModule Success:', { 
        id, 
        hasResult: !!result, 
        resultType: typeof result,
        timestamp: new Date().toISOString() 
      })
      return result
    } catch (error) {
      console.error('❌ ApplicationModuleService.updateApplicationModule Failed:', { 
        id, 
        updates, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw error
    }
  }

  async deleteApplicationModule(id: string): Promise<void> {
    console.log('🔧 ApplicationModuleService.deleteApplicationModule Called:', { 
      id, 
      timestamp: new Date().toISOString() 
    })
    try {
      await apiClient.delete(buildApiUrl(API_ENDPOINTS.APPLICATION_MODULE.DELETE(id)))
      console.log('✅ ApplicationModuleService.deleteApplicationModule Success:', { 
        id, 
        timestamp: new Date().toISOString() 
      })
    } catch (error) {
      console.error('❌ ApplicationModuleService.deleteApplicationModule Failed:', { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        errorType: error instanceof Error ? error.name : 'Unknown', 
        timestamp: new Date().toISOString() 
      })
      throw error
    }
  }

  // ================== UTILITY METHODS ==================

  // Map API ApplicationModule to UI-friendly format
  mapApplicationModuleToUIData = (apiData: ApplicationModule): ApplicationModuleUIData => {
    return {
      id: apiData.id,
      moduleName: apiData.moduleName,
      moduleCode: apiData.moduleCode,
      moduleDescription: apiData.moduleDescription,
      active: apiData.active,
    }
  }

  // Transform API response to UI-friendly format
  transformToUIData(apiResponse: PaginatedResponse<ApplicationModule>): PaginatedResponse<ApplicationModuleUIData> {
    return {
      content: apiResponse.content.map(item => this.mapApplicationModuleToUIData(item)),
      page: apiResponse.page
    }
  }

  // Get UI-friendly data directly
  async getApplicationModulesUIData(
    page = 0,
    size = 20,
    filters?: ApplicationModuleFilters
  ): Promise<PaginatedResponse<ApplicationModuleUIData>> {
    const apiResponse = await this.getApplicationModules(page, size, filters)
    return this.transformToUIData(apiResponse)
  }
}

// ================== EXPORT SINGLETON ==================
export const applicationModuleService = new ApplicationModuleService()