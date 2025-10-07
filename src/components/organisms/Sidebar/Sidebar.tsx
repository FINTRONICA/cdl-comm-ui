'use client'

import React, {
  useState,
  useMemo,
  useCallback,
  Suspense,
  lazy,
  useEffect,
} from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, HelpCircle } from 'lucide-react'
import {
  type SidebarItem,
  type SidebarSection,
} from '@/constants/sidebarConfig'
import { useSidebarConfigWithLoading } from '@/hooks/useSidebarConfig'
import { usePermissionFilteredSidebar } from '@/utils/sidebarPermissions'

const Logo = lazy(() => import('./Logo'))

const SidebarComponent = () => {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [userToggledItems, setUserToggledItems] = useState<Set<string>>(
    new Set()
  )
  const [userToggledSections, setUserToggledSections] = useState<Set<string>>(
    new Set()
  )

  const expandedItemsSet = useMemo(
    () => new Set(expandedItems),
    [expandedItems]
  )
  const expandedSectionsSet = useMemo(
    () => new Set(expandedSections),
    [expandedSections]
  )

  const isActive = useCallback(
    (href: string) => {
      if (pathname === href) return true
      if (pathname.startsWith(href + '/')) return true

      return false
    },
    [pathname]
  )
  const isExpanded = useCallback(
    (itemId: string) => expandedItemsSet.has(itemId),
    [expandedItemsSet]
  )
  const isSectionExpanded = useCallback(
    (sectionId: string) => expandedSectionsSet.has(sectionId),
    [expandedSectionsSet]
  )

  const toggleExpanded = useCallback((itemId: string) => {
    setUserToggledItems((prev) => new Set([...prev, itemId]))
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  const toggleSection = useCallback((sectionId: string) => {
    setUserToggledSections((prev) => new Set([...prev, sectionId]))
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }, [])

  const isParentActive = useCallback(
    (item: SidebarItem) => {
      if (item.href && isActive(item.href)) return true
      if (item.children) {
        return item.children.some((child) => child.href && isActive(child.href))
      }
      return false
    },
    [isActive]
  )

  const { sections: navigationSections, isLoading } =
    useSidebarConfigWithLoading()

  const filteredSections = usePermissionFilteredSidebar(
    navigationSections || []
  )
  const memoizedNavigationSections = useMemo(
    () => filteredSections,
    [filteredSections]
  )

  useEffect(() => {
    setUserToggledItems(new Set())
    setUserToggledSections(new Set())
  }, [pathname])

  useEffect(() => {
    if (!memoizedNavigationSections || memoizedNavigationSections.length === 0)
      return

    const sectionsToExpand: string[] = []
    const itemsToExpand: string[] = []

    memoizedNavigationSections.forEach((section) => {
      let hasActiveChild = false

      if (section.href && isActive(section.href)) {
        hasActiveChild = true
      }

      section.items.forEach((item) => {
        if (item.href && isActive(item.href)) {
          hasActiveChild = true
          if (!userToggledSections.has(section.id)) {
            sectionsToExpand.push(section.id)
          }
        }

        if (item.children) {
          item.children.forEach((child) => {
            if (child.href && isActive(child.href)) {
              hasActiveChild = true
              if (!userToggledSections.has(section.id)) {
                sectionsToExpand.push(section.id)
              }
              if (!userToggledItems.has(item.id)) {
                itemsToExpand.push(item.id)
              }
            }
          })
        }
      })

      if (hasActiveChild && !userToggledSections.has(section.id)) {
        sectionsToExpand.push(section.id)
      }
    })

    setExpandedSections((prev) => {
      const newSet = new Set([...prev, ...sectionsToExpand])
      const newArray = Array.from(newSet)
      if (
        newArray.length !== prev.length ||
        !newArray.every((id, index) => id === prev[index])
      ) {
        return newArray
      }
      return prev
    })

    setExpandedItems((prev) => {
      const newSet = new Set([...prev, ...itemsToExpand])
      const newArray = Array.from(newSet)
      if (
        newArray.length !== prev.length ||
        !newArray.every((id, index) => id === prev[index])
      ) {
        return newArray
      }
      return prev
    })
  }, [
    pathname,
    memoizedNavigationSections,
    isActive,
    userToggledItems,
    userToggledSections,
  ])

  const handleHelpClick = useCallback(() => {
    router.push('/help')
  }, [router])

  if (
    isLoading ||
    !navigationSections ||
    navigationSections.length === 0 ||
    !filteredSections ||
    filteredSections.length === 0
  ) {
    return (
      <div className="w-62 flex flex-col px-4 border border-[#FFFFFF80] ml-4 mt-[15px] bg-[#FFFFFF40] rounded-2xl">
        <div className="w-32 h-8 mb-4 bg-gray-200 rounded animate-pulse"></div>

        <div className="flex-1 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>

        <div className="p-4 text-center text-sm text-gray-500">
          {isLoading ? 'Loading...' : 'Waiting for labels...'}
        </div>
      </div>
    )
  }

  return (
    <div className="w-62 flex flex-col px-4 border border-[#FFFFFF80] ml-4 mt-[15px] bg-[#FFFFFF40] rounded-2xl">
      {/* Logo with Suspense for better loading */}
      <div>
        <Suspense
          fallback={
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
          }
        >
          <Logo />
        </Suspense>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 border-t border-t-[#CAD5E2]">
        {memoizedNavigationSections.map((section: SidebarSection) => (
          <div key={section.id} className="">
            {/* Section Header */}
            {section.label && (
              <div
                className={`flex items-center gap-2 p-2 ${
                  section.items.length > 0
                    ? 'cursor-pointer hover:bg-gray-100 transition-colors rounded'
                    : ''
                }`}
                onClick={
                  section.items.length > 0
                    ? () => toggleSection(section.id)
                    : undefined
                }
              >
                {section.href ? (
                  <Link
                    href={section.href}
                    className={`flex items-center gap-2 flex-1 ${
                      isActive(section.href)
                        ? 'text-[#155DFC]'
                        : 'text-[#4A5565]'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <section.icon
                      className={`w-5 h-5 ${
                        isActive(section.href)
                          ? 'text-[#155DFC]'
                          : 'text-[#4A5565]'
                      }`}
                    />
                    <h3 className="text-start font-sans font-medium text-[11px] leading-none uppercase align-middle">
                      {section.label}
                    </h3>
                  </Link>
                ) : (
                  <>
                    <section.icon className="w-4 h-4 text-[#4A5565]" />
                    <h3 className="text-[#4A5565] text-start font-sans font-medium text-[11px] leading-none uppercase align-middle">
                      {section.label}
                    </h3>
                  </>
                )}
                {section.items.length > 0 && (
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isSectionExpanded(section.id) ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>
            )}

            {/* Section Items */}
            {(!section.label || isSectionExpanded(section.id)) && (
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div key={item.id}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isParentActive(item)
                              ? ' '
                              : 'text-[#4A5565] hover:bg-gray-100'
                          }`}
                        >
                          <item.icon
                            className={`w-4 h-4 ${
                              isParentActive(item) ? '' : 'text-gray-700'
                            }`}
                          />
                          <span className="text-[#4A5565] font-sans font-medium text-[11px] leading-none uppercase align-middle flex-1 text-left">
                            {item.label}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              isExpanded(item.id) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isExpanded(item.id) && (
                          <div className="mt-1 ml-8 space-y-1 ">
                            {item.children.map((child) => (
                              <Link
                                key={child.id}
                                href={child.href || '#'}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                  child.href && isActive(child.href)
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <child.icon
                                  className={`w-4 h-4 ${
                                    child.href && isActive(child.href)
                                      ? 'text-blue-600'
                                      : 'text-gray-600'
                                  }`}
                                />
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        className={`flex items-center gap-2 pl-[34px] py-2 pr-2 rounded-lg text-sm transition-colors font-outfit font-sans text-[13px] leading-[20px] align-middle ${
                          item.href && isActive(item.href)
                            ? 'bg-[#DBEAFE] text-[#155DFC] font-medium'
                            : 'text-[#1E2939] font-normal hover:bg-gray-100'
                        }`}
                      >
                        <item.icon
                          className={`w-4 h-4 ${
                            item.href && isActive(item.href)
                              ? 'text-[#155DFC]'
                              : 'text-[#1E2939]'
                          }`}
                        />
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Help & Collapse */}
        <div className="pt-6 space-y-2 border-t border-gray-300">
          <button
            onClick={handleHelpClick}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 stroke-2" />
            Help
          </button>
        </div>
      </nav>
    </div>
  )
}

SidebarComponent.displayName = 'Sidebar'

export const Sidebar = React.memo(SidebarComponent)
