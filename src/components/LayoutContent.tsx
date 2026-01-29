'use client'

import { usePathname } from 'next/navigation'
import { useMemo, memo } from 'react'
import { Sidebar } from './organisms/Sidebar'
import { useAuthStore } from '@/store/authStore'
import { stripBasePath } from '@/utils/basePath'

const AUTHENTICATED_ROUTES = [
  '/dashboard',
  '/activities',
  '/entities',
  '/transactions',
  '/transactions',
  '/surety_bond',
  '/fee-reconciliation',
  '/reports',
  '/admin',
  '/capital-partner',
  '/build-partner-assets',
  '/build-partner',
  '/master',
  '/party',
  '/investment',
  '/business-segment',
  '/business-sub-segment',
  '/agreement-segment',
  '/agreement-type',
  '/agreement-sub-type',
  '/product-program',
  '/beneficiary',
  '/general-ledger-account',
  '/country',
  '/currency',
  '/agreement',
  '/agreement-signatory',
  '/agreement-parameter',
  '/agreement-fee-schedule',
  '/escrow-account',
  '/payment-beneficiary',
  '/payment-instruction',
  '/help',
]

interface LayoutContentProps {
  children: React.ReactNode
}

const LayoutContentComponent = ({ children }: LayoutContentProps) => {
  const fullPathname = usePathname()

  const pathname = stripBasePath(fullPathname)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const shouldShowSidebar = useMemo(() => {
    // Never show sidebar on login page
    if (pathname === '/login') {
      return false
    }

    // Don't show sidebar if not authenticated, even on protected routes
    if (!isAuthenticated) {
      return false
    }

    const isValidRoute = AUTHENTICATED_ROUTES.some((route) => {
      if (route === '/dashboard') {
        return pathname === '/dashboard'
      }
      if (route === '/activities') {
        return (
          pathname === '/activities/pending' ||
          pathname === '/activities/involved' ||
          pathname?.startsWith('/activities/')
        )
      }
      if (route === '/entities') {
        return (
          pathname === '/build-partner' ||
          pathname === '/build-partner-assets' ||
          pathname === '/capital-partner' ||
          pathname?.startsWith('/build-partner/') ||
          pathname?.startsWith('/build-partner-assets/') ||
          pathname?.startsWith('/capital-partner/')
        )
      }
      if (route === '/transactions') {
        return (
          pathname === '/transactions/unallocated' ||
          pathname === '/transactions/discarded' ||
          pathname === '/transactions/allocated' ||
          pathname?.startsWith('/transactions/')
        )
      }
      if (route === '/transactions') {
        return (
          pathname === '/transactions/manual' ||
          pathname === '/transactions/tas' ||
          pathname?.startsWith('/transactions/')
        )
      }
      if (route === '/surety_bond') {
        return (
          pathname === '/surety_bond' ||
          pathname === '/surety_bond/new' ||
          pathname?.startsWith('/surety_bond/new/')
        )
      }
      if (route === '/fee-reconciliation') {
        return pathname === '/fee-reconciliation'
      }
      if (route === '/reports') {
        return (
          pathname === '/reports/business' || pathname?.startsWith('/reports/')
        )
      }
      if (route === '/admin') {
        return (
          pathname === '/admin/bank-management' ||
          pathname === '/admin/stakeholder' ||
          pathname === '/admin/entitlement' ||
          pathname === '/admin/access-grant' ||
          pathname === '/admin/security' ||
          pathname?.startsWith('/admin/')
        )
      }
      if (route === '/build-partner') {
        return (
          pathname === '/build-partner' ||
          pathname?.startsWith('/build-partner/')
        )
      }
      if (route === '/build-partner-assets') {
        return (
          pathname === '/build-partner-assets' ||
          pathname?.startsWith('/build-partner-assets/')
        )
      }
      if (route === '/capital-partner') {
        return (
          pathname === '/capital-partner' ||
          pathname?.startsWith('/capital-partner/')
        )
      }
      if (route === '/master') {
        return (
          pathname === '/master' ||
          pathname === '/masters' ||
          pathname?.startsWith('/master/') ||
          pathname?.startsWith('/masters/') ||
          pathname === '/party' ||
          pathname === '/account-purpose' ||
          pathname === '/investment' ||
          pathname === '/business-segment' ||
          pathname === '/business-sub-segment' ||
          pathname === '/agreement-Type' ||
          pathname === '/agreement-sub-type' ||
          pathname === '/product' ||
          pathname === '/agreement-segment' ||
          pathname === '/general-ledger-account' ||
          pathname === '/beneficiary' ||
          pathname === '/country' ||
          pathname === '/currency' ||
          pathname?.startsWith('/master/party/') ||
          pathname?.startsWith('/account-purpose/') ||
          pathname?.startsWith('/investment/') ||
          pathname?.startsWith('/business-segment/') ||
          pathname?.startsWith('/business-sub-segment/') ||
          pathname?.startsWith('/agreement-Type/') ||
          pathname?.startsWith('/agreement-sub-type/') ||
          pathname?.startsWith('/product/') ||
          pathname?.startsWith('/agreement-segment/') ||
          pathname?.startsWith('/general-ledger-account/') ||
          pathname?.startsWith('/beneficiary/') ||
          pathname?.startsWith('/country/') ||
          pathname?.startsWith('/currency/')
        )
      }
      if (route === '/party') {
        return pathname === '/master/party' || pathname?.startsWith('/master/party/')
      }
      if (route === '/investment') {
        return (
          pathname === '/investment' || pathname?.startsWith('/investment/')
        )
      }
      if (route === '/business-segment') {
        return (
          pathname === '/business-segment' ||
          pathname?.startsWith('/business-segment/')
        )
      }
      if (route === '/business-sub-segment') {
        return (
          pathname === '/business-sub-segment' ||
          pathname?.startsWith('/business-sub-segment/')
        )
      }
      if (route === '/agreement-segment') {
        return (
          pathname === '/agreement-segment' ||
          pathname?.startsWith('/agreement-segment/')
        )
      }
      if (route === '/agreement-type') {
        return (
          pathname === '/agreement-type' ||
          pathname?.startsWith('/agreement-type/')
        )
      }
      if (route === '/agreement-sub-type') {
        return (
          pathname === '/agreement-sub-type' ||
          pathname?.startsWith('/agreement-sub-type/')
        )
      }
      if (route === '/product-program') {
        return (
          pathname === '/product-program' ||
          pathname?.startsWith('/product-program/')
        )
      }
      if (route === '/beneficiary') {
        return (
          pathname === '/beneficiary' || pathname?.startsWith('/beneficiary/')
        )
      }
      if (route === '/general-ledger-account') {
        return (
          pathname === '/general-ledger-account' ||
          pathname?.startsWith('/general-ledger-account/')
        )
      }
      if (route === '/country') {
        return pathname === '/country' || pathname?.startsWith('/country/')
      }
      if (route === '/currency') {
        return pathname === '/currency' || pathname?.startsWith('/currency/')
      }
      if (route === '/agreement') {
        return pathname === '/agreement' || pathname?.startsWith('/agreement/')
      }
      if (route === '/agreement-signatory') {
        return pathname === '/agreement-signatory' || pathname?.startsWith('/agreement-signatory/')
      }
      if (route === '/escrow-account') {
        return pathname === '/escrow-account' || pathname?.startsWith('/escrow-account/')
      }
      if (route === '/agreement-parameter') {
        return pathname === '/agreement-parameter' || pathname?.startsWith('/agreement-parameter/')
      }
      if (route === '/agreement-fee-schedule') {
        return pathname === '/agreement-fee-schedule' || pathname?.startsWith('/agreement-fee-schedule/')
      }
      if (route === '/payment-beneficiary') {
        return (
          pathname === '/payment-beneficiary' ||
          pathname?.startsWith('/payment-beneficiary/')
        )
      }
      if (route === '/payment-instruction') {
        return (
          pathname === '/payment-instruction' ||
          pathname?.startsWith('/payment-instruction/')
        )
      }
      if (route === '/help') {
        return pathname === '/help'
      }
      return pathname?.startsWith(route)
    })

    return isValidRoute
  }, [pathname, isAuthenticated])

  if (shouldShowSidebar) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">{children}</div>
      </div>
    )
  }

  return <>{children}</>
}

export const LayoutContent = memo(LayoutContentComponent)
LayoutContent.displayName = 'LayoutContent'
