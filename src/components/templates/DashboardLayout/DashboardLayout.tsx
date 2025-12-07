import React from 'react'
import { Header } from '../../organisms/Header'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showActions?: boolean
  showFilters?: boolean
  actions?: {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }[]
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  showActions = false,
  showFilters = false,
  actions = [],
}) => {
  return (
    <>
      <Header
        title={title}
        subtitle={subtitle || ''}
        showActions={showActions}
        showFilters={showFilters}
        actions={actions}
      />
      {/* <main className="flex-1 overflow-y-auto pl-5 pr-7 pb-[9px] pt-[22px]"></main> */}
      <main className="flex-1 overflow-y-auto pl-5 pr-7 pb-[9px]">
        {children}
      </main>
    </>
  )
}
