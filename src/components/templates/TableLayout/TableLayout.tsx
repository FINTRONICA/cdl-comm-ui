import React from 'react'
import { DashboardLayout } from '../DashboardLayout'
import { DataTable } from '../../organisms/DataTable'

interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'badge' | 'date' | 'amount' | 'actions'
  badgeVariant?: 'approved' | 'rejected' | 'incomplete' | 'inReview' | 'default'
}

interface TableLayoutProps {
  title: string
  data: Record<string, string | React.ReactNode>[]
  columns: Column[]
  showActions?: boolean
  actions?: {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }[]
  onRowAction?: (action: string, data: Record<string, string | React.ReactNode>) => void
}

export const TableLayout: React.FC<TableLayoutProps> = ({
  title,
  data,
  columns,
  showActions = false,
  actions = [],
  onRowAction,
}) => {
  return (
    <DashboardLayout title={title} showActions={showActions} actions={actions}>
      <DataTable
        data={data}
        columns={columns}
        onRowAction={onRowAction}
      />
    </DashboardLayout>
  )
}
