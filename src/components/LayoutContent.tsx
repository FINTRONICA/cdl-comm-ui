'use client'

import { usePathname } from 'next/navigation'
import { useMemo, memo } from 'react'
import { Sidebar } from './organisms/Sidebar'
import { useAppInitialization } from '@/hooks/useAppInitialization'

const AUTHENTICATED_ROUTES = [
  '/dashboard',
  '/activities',
  '/entities',
  '/entity',
  '/entity/deal-primary',
  '/entity/accounts',
  '/entity/party-signatory',
  '/entity/beneficiary',
  '/entity/parameter',
  '/entity/fees',
  '/transactions',
  '/transactions',
  '/guarantee',
  '/fee-reconciliation',
  '/reports',
  '/admin',
  '/investors',
  '/projects',
  '/developers',
  '/master-customers/customers',
  '/master-customers/account-purpose',
  '/master-customers/investment-master',
  '/master-customers/business-segment',
  '/master-customers/business-sub-segment',
  '/master-customers/deal-type',
  '/master-customers/deal-subtype',
  '/master-customers/product-program',
  '/master-customers/document',
  '/master-customers/deal-segment',
  '/master-customers/ledger-account',
  '/master-customers/country-code',
  '/master-customers/currency-code',
  '/master-customers/beneficiary',
  '/master-customers',
  '/customers-deposit',
  '/customers-payments',
  '/help',
]

interface LayoutContentProps {
  children: React.ReactNode
}

const LayoutContentComponent = ({ children }: LayoutContentProps) => {
  const pathname = usePathname()

  useAppInitialization({
    enableLabelLoading: true,
    enableRetryOnFailure: true,
    retryCount: 3,
  })

  const shouldShowSidebar = useMemo(() => {
    if (pathname === '/login') {
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
          pathname === '/entities/developers' ||
          pathname === '/entities/projects' ||
          pathname?.startsWith('/entities/developers/') ||
          pathname?.startsWith('/entities/projects/')
        )
      }
      if (route === '/entity') {
        return (
          pathname === '/entity/deal-primary' ||
          pathname === '/entity/accounts' ||
          pathname === '/entity/party-signatory' ||
          pathname === '/entity/beneficiary' ||
          pathname === '/entity/parameter' ||
          pathname === '/entity/fees' ||
          pathname?.startsWith('/entity/')
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
      if (route === '/guarantee') {
        return (
          pathname === '/guarantee' ||
          pathname === '/guarantee/new' ||
          pathname?.startsWith('/guarantee/new/')
        )
      }
      if (route === '/fee-reconciliation') {
        return pathname === '/fee-reconciliation'
      }
      if (route === '/reports') {
        return (
          pathname === '/reports/business' ||
          pathname?.startsWith('/reports/')
        )
      }
      if (route === '/admin') {
        return (
          pathname === '/admin/bank-management' ||
          pathname === '/admin/user-management' ||
          pathname === '/admin/role-management' ||
          pathname === '/admin/fee-types' ||
          pathname === '/admin/security' ||
          pathname?.startsWith('/admin/')
        )
      }
      if (route === '/investors') {
        return pathname === '/investors' || pathname?.startsWith('/investors/')
      }
      if (route === '/projects') {
        return pathname === '/projects' || pathname?.startsWith('/projects/')
      }
      if (route === '/developers') {
        return pathname === '/developers' || pathname?.startsWith('/developers/')
      }
      // Handle all master-customers routes
      if (route.startsWith('/master-customers/')) {
        return pathname === route || pathname?.startsWith(`${route}/`)
      }
      if (route === '/master-customers') {
        return pathname === '/master-customers' || pathname?.startsWith('/master-customers/')
      }
      if (route === '/customers-deposit') {
        return (
          pathname === '/customers-deposit/deposit' ||
          pathname?.startsWith('/customers-deposit/')
        )
      }
      if (route === '/customers-payments') {
        return (
          pathname === '/customers-payments/payment' ||
          pathname?.startsWith('/customers-payments/')
        )
      }
      if (route === '/help') {
        return pathname === '/help'
      }
      return pathname?.startsWith(route)
    })

    return isValidRoute
  }, [pathname])

  if (shouldShowSidebar) {
    return (
      <div className="flex h-screen bg-[#F3F4F6]">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">{children}</div>
      </div>
    )
  }

  return <>{children}</>
}

export const LayoutContent = memo(LayoutContentComponent)
LayoutContent.displayName = 'LayoutContent'
