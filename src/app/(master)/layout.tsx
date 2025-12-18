'use client'

import React, { useMemo, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TablePageLayout } from '@/components/templates/TablePageLayout'
import { Tab } from '@/types/activities'
import { useSidebarLabels } from '@/hooks/useSidebarLabels'
import { SidebarLabelsService } from '@/services/api/sidebarLabelsService'
import { useAppStore } from '@/store'
import { stripBasePath } from '@/utils/basePath'

// Tab configuration mapping tab IDs to routes
// Note: (master) is a route group, so it doesn't appear in the URL
// (master)/master/party/page.tsx → /master/party
// (master)/master/account-purpose/page.tsx → /master/account-purpose
const TAB_ROUTES: Record<string, string> = {
  customer: '/master/party',
  account: '/master/account-purpose',
  investment: '/master/investment',
  segment: '/master/business-segment',
  subSegment: '/master/business-sub-segment',
  dealType: '/master/agreement-Type',
  dealSubType: '/master/agreement-Sub-Type',
  product: '/master/product',
  dealSegment: '/master/agreement-segment',
  ledgerAccount: '/master/general-ledger-account',
  beneficiary: '/master/beneficiary',
  countryCode: '/master/country',
  currencyCode: '/master/currency',
}

// Reverse mapping: route to tab ID
const ROUTE_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tabId, route]) => [route, tabId])
)

// Tab configuration with sidebar IDs for label lookup
const TAB_CONFIG: Array<{ id: string; sidebarId: string; fallbackLabel: string }> = [
  { id: 'customer', sidebarId: 'Party', fallbackLabel: 'Party' },
  { id: 'account', sidebarId: 'AccountPurpose', fallbackLabel: 'Account' },
  { id: 'investment', sidebarId: 'InvestmentType', fallbackLabel: 'Investment ' },
  { id: 'segment', sidebarId: 'BusinessSegment', fallbackLabel: 'Business ' },
  { id: 'subSegment', sidebarId: 'BusinessSubSegment', fallbackLabel: 'Sub Business  ' },
  { id: 'dealType', sidebarId: 'AgreementType', fallbackLabel: 'Agreement Type' },
  { id: 'dealSubType', sidebarId: 'AgreementSubType', fallbackLabel: 'Sub Agreement' },
  { id: 'product', sidebarId: 'ProductProgram', fallbackLabel: 'Product' },
  { id: 'dealSegment', sidebarId: 'AgreementSegment', fallbackLabel: 'Agreement' },
  { id: 'ledgerAccount', sidebarId: 'GeneralLedgerAccount', fallbackLabel: 'General  Account' },
  { id: 'beneficiary', sidebarId: 'Beneficiary', fallbackLabel: 'Beneficiary' },
  { id: 'countryCode', sidebarId: 'Country', fallbackLabel: 'Country ' },
  { id: 'currencyCode', sidebarId: 'Currency', fallbackLabel: 'Currency ' },
]

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const fullPathname = usePathname()
  const pathname = stripBasePath(fullPathname)
  const { data: sidebarLabels } = useSidebarLabels()
  const currentLanguage = useAppStore((state) => state.language)

  // Determine active tab from current pathname
  const activeTab = useMemo(() => {
    // Normalize pathname (remove trailing slash)
    const normalizedPathname = pathname.replace(/\/$/, '')
    
    // Exclude payment routes from showing tabs
    if (normalizedPathname.startsWith('/payment/')) {
      return null
    }
    
    // Check if current pathname matches any route (routes already include /master/)
    for (const [route, tabId] of Object.entries(ROUTE_TO_TAB)) {
      const normalizedRoute = route.replace(/\/$/, '')
      // Exact match or starts with route followed by /
      if (normalizedPathname === normalizedRoute || normalizedPathname.startsWith(normalizedRoute + '/')) {
        return tabId
      }
    }
    
    // Default to first tab if no match
    return TAB_CONFIG[0]?.id || 'customer'
  }, [pathname])

  // Get label for a tab
  const getTabLabel = useCallback(
    (sidebarId: string, fallback: string): string => {
      if (sidebarLabels && SidebarLabelsService.hasLabels(sidebarLabels)) {
        return SidebarLabelsService.getLabelBySidebarId(
          sidebarLabels,
          sidebarId,
          currentLanguage,
          fallback
        )
      }
      return fallback
    },
    [sidebarLabels, currentLanguage]
  )

  // Create tabs with labels
  const tabs: Tab[] = useMemo(() => {
    return TAB_CONFIG.map(({ id, sidebarId, fallbackLabel }) => {
      return {
        id,
        label: getTabLabel(sidebarId, fallbackLabel),
      }
    })
  }, [getTabLabel])

  // Prefetch tab routes for faster navigation (only prefetch visible/adjacent tabs)
  useEffect(() => {
    // Prefetch all tab routes in the background for instant navigation
    const prefetchRoutes = async () => {
      // Use requestIdleCallback for non-blocking prefetch
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          Object.values(TAB_ROUTES).forEach((route) => {
            router.prefetch(route)
          })
        })
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          Object.values(TAB_ROUTES).forEach((route) => {
            router.prefetch(route)
          })
        }, 100)
      }
    }
    prefetchRoutes()
  }, [router])

  // Handle tab change - navigate to corresponding route with optimized performance
  const handleTabChange = useCallback(
    (tabId: string) => {
      const route = TAB_ROUTES[tabId]
      if (route && route !== pathname) {
        // Use replace instead of push for faster navigation when switching tabs
        // This prevents adding to history stack and improves performance
        router.replace(route)
      }
    },
    [router, pathname]
  )

  // Get active tab label for title
  const activeTabLabel = useMemo(() => {
    const tab = TAB_CONFIG.find((t) => t.id === activeTab)
    return tab ? getTabLabel(tab.sidebarId, tab.fallbackLabel) : 'Master'
  }, [activeTab, getTabLabel])

  // Redirect to default tab if on /master or /masters without a specific route
  useEffect(() => {
    if (pathname === '/master' || pathname === '/masters') {
      const defaultTabId = TAB_CONFIG[0]?.id || 'customer'
      const defaultRoute = TAB_ROUTES[defaultTabId] ?? '/master/party'
      router.replace(defaultRoute)
    }
  }, [pathname, router])

  // Don't show tabs for payment routes
  if (pathname.startsWith('/payment/')) {
    return <>{children}</>
  }

  return (
    <TablePageLayout
      title={`Master : ${activeTabLabel}`}
      tabs={tabs}
      activeTab={activeTab || TAB_CONFIG[0]?.id || 'customer'}
      onTabChange={handleTabChange}
    >
      {/* Children - React Query handles caching, no need to force remount */}
      {children}
    </TablePageLayout>
  )
}
