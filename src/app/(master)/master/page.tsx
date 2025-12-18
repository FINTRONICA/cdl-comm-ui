'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { stripBasePath } from '@/utils/basePath'

// Tab configuration mapping tab IDs to routes
const TAB_ROUTES: Record<string, string> = {
  customer: '/master/party',
  account: '/account-purpose',
  investment: '/investment',
  segment: '/business-segment',
  subSegment: '/business-sub-segment',
  dealType: '/agreement-Type',
  dealSubType: '/agreement-Sub-Type',
  product: '/product',
  dealSegment: '/agreement-segment',
  ledgerAccount: '/general-ledger-account',
  beneficiary: '/beneficiary',
  countryCode: '/country',
  currencyCode: '/currency',
}

const TAB_CONFIG: Array<{ id: string }> = [
  { id: 'customer' },
  { id: 'account' },
  { id: 'investment' },
  { id: 'segment' },
  { id: 'subSegment' },
  { id: 'dealType' },
  { id: 'dealSubType' },
  { id: 'product' },
  { id: 'dealSegment' },
  { id: 'ledgerAccount' },
  { id: 'beneficiary' },
  { id: 'countryCode' },
  { id: 'currencyCode' },
]


// Redirect /master to first tab (party)
const MasterPage = () => {
  const router = useRouter()
  const pathname = stripBasePath(usePathname())

  useEffect(() => {
    if (pathname === '/master') {
      const defaultTabId = TAB_CONFIG[0]?.id || 'customer'
      const defaultRoute = TAB_ROUTES[defaultTabId] ?? '/master/party'
      router.replace(defaultRoute)
    }
  }, [pathname, router])

  

  return null
}



export default MasterPage
