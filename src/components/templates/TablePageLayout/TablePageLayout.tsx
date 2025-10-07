import React from 'react'
import { DashboardLayout } from '../DashboardLayout'
import { TabNavigation } from '../../molecules/TabNavigation'
import { StatusCards } from '../../molecules/StatusCards'
import { ActionButtons } from '../../molecules/ActionButtons'
import { Tab, StatusCardData } from '../../../types/activities'

interface TablePageLayoutProps {
  title: string
  subtitle?: string
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  statusCards?: StatusCardData[]
  actionButtons?: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'danger'
    icon?: string
    iconAlt?: string
  }>
  children: React.ReactNode
  className?: string
}

export const TablePageLayout: React.FC<TablePageLayoutProps> = ({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  statusCards,
  actionButtons,
  children,
  className = '',
}) => {
  return (
    <DashboardLayout title={title} subtitle={subtitle || ''}>
      <div
        className={`bg-[#FFFFFFBF] border border-[#FFFFFF] rounded-2xl flex flex-col h-full ${className}`}
      >
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-10 rounded-t-2xl">
          {/* Tabs */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />

          {/* Status Cards */}
          {statusCards && statusCards.length > 0 && (
            <div className="px-4 py-6">
              <StatusCards cards={statusCards} />
            </div>
          )}
          
          {/* Action Buttons */}
          {actionButtons && actionButtons.length > 0 && (
            <div>
              <ActionButtons buttons={actionButtons} />
            </div>
          )}
        </div>

        {/* Table Container with Fixed Pagination */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
