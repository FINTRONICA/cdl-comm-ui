// Permission interface based on the API response structure
export interface Permission {
  id: string
  name: string
  path: string
  parentId: string | null
  subGroupCount: number | null
  subGroups: Permission[]
  attributes: Record<string, any> | null
  realmRoles: string[] | null
  clientRoles: Record<string, string[]> | null
  access: Record<string, boolean> | null
}

// Pageable request interface for the API
export interface PageableRequest {
  page: number
  size: number
  sort?: string[]
}

// Response interface for group mapping API
export interface GroupMappingResponse {
  content: Permission[]
  pageable: {
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    pageSize: number
    pageNumber: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

// Simplified permission for easy access
export interface UserPermission {
  name: string
  path: string
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

// Permission constants for build partner operations
export const PERMISSION_NAMES = {
  BUILD_PARTNER_CREATE: 'build_partner_create',
  BUILD_PARTNER_DELETE: 'build_partner_delete',
  BUILD_PARTNER_UPDATE: 'build_partner_update',
  BUILD_PARTNER_VIEW: 'build_partner_view',
} as const

export type PermissionName = typeof PERMISSION_NAMES[keyof typeof PERMISSION_NAMES]
