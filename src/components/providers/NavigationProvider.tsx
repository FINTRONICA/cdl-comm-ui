'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setGlobalRouter } from '@/utils/navigation'

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter()

  useEffect(() => {
    setGlobalRouter(router)

    return () => {
      setGlobalRouter(null)
    }
  }, [router])

  return <>{children}</>
}
