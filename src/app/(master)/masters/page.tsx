'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Redirect /masters to /master (which will redirect to /master/party)
const MastersPage = () => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/masters') {
      router.replace('/master')
    }
  }, [pathname, router])

  return null
}

export default MastersPage
