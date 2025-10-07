import { useMemo } from 'react'
import { useReactivePermissionCheck } from '@/store/reactivePermissionsStore'
import type { SidebarItem, SidebarSection } from '@/constants/sidebarConfig'

export const hasNavigationPermission = (
  permissions: string[] | undefined,
  userPermissions: string[]
): boolean => {
  if (!permissions || permissions.length === 0) {
    return true
  }

  if (permissions.includes('*')) {
    return true
  }

  if (userPermissions.includes('nav_menu_all')) {
    return true
  }

  const hasPermission = permissions.some(permission => 
    userPermissions.includes(permission)
  )

  return hasPermission
}

export const filterSidebarItems = (
  items: SidebarItem[],
  userPermissions: string[]
): SidebarItem[] => {
  return items.filter(item => {
    const hasItemPermission = hasNavigationPermission(item.permissions, userPermissions)
    if (item.children && item.children.length > 0) {
      const filteredChildren = filterSidebarItems(item.children, userPermissions)
      const shouldShowParent = filteredChildren.length > 0 || hasItemPermission
      
      return shouldShowParent
    }
    
    return hasItemPermission
  }).map(item => {
    if (item.children && item.children.length > 0) {
      const filteredChildren = filterSidebarItems(item.children, userPermissions)
      return {
        ...item,
        children: filteredChildren
      }
    }
    return item
  })
}

export const filterSidebarSections = (
  sections: SidebarSection[],
  userPermissions: string[]
): SidebarSection[] => {
  
  return sections.filter(section => {
    const hasSectionPermission = hasNavigationPermission(section.permissions, userPermissions)
    const filteredItems = filterSidebarItems(section.items, userPermissions)
    
    const shouldShowSection = (hasSectionPermission && (section.href || filteredItems.length > 0)) || 
                             (!hasSectionPermission && filteredItems.length > 0)
    
    return shouldShowSection
  }).map(section => {
    const filteredItems = filterSidebarItems(section.items, userPermissions)
    return {
      ...section,
      items: filteredItems
    }
  })
}

export const usePermissionFilteredSidebar = (sections: SidebarSection[]) => {
  const { getAllPermissions } = useReactivePermissionCheck()
  const userPermissions = getAllPermissions().map((p: { name: string }) => p.name)
  
  // Memoize the filtered sections to prevent unnecessary re-renders
  const filteredSections = useMemo(() => {
    return filterSidebarSections(sections, userPermissions)
  }, [sections, userPermissions])
  
  return filteredSections
}
