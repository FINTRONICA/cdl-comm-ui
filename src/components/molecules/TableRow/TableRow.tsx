import React from 'react'
import { Badge } from '../../atoms/Badge'
import { Typography } from '../../atoms/Typography'
import { MoreHorizontal } from 'lucide-react'

interface TableRowProps {
  data: Record<string, string | React.ReactNode>
  columns: {
    key: string
    type?: 'text' | 'badge' | 'date' | 'amount' | 'actions'
    badgeVariant?: 'approved' | 'rejected' | 'incomplete' | 'inReview' | 'default'
  }[]
  onActionClick?: (action: string, data: Record<string, string | React.ReactNode>) => void
}

export const TableRow: React.FC<TableRowProps> = ({
  data,
  columns,
  onActionClick,
}) => {
  const renderCell = (column: { key: string; type?: 'text' | 'badge' | 'date' | 'amount' | 'actions'; badgeVariant?: 'approved' | 'rejected' | 'incomplete' | 'inReview' | 'default' }, value: string | React.ReactNode) => {
    switch (column.type) {
      case 'badge':
        return <Badge variant={column.badgeVariant || 'default'}>{value}</Badge>
      case 'date':
        return (
          <Typography variant="body">
            {new Date(value as string).toLocaleDateString()}
          </Typography>
        )
      case 'amount':
        return (
          <Typography variant="body" className="font-medium">
            {typeof value === 'number'
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value)
              : value}
          </Typography>
        )
      case 'actions':
        return (
          <button
            onClick={() => onActionClick?.('more', data)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        )
      default:
        return <Typography variant="body">{value}</Typography>
    }
  }

  return (
    <tr className="border-b border-gray-200 align-middle hover:bg-gray-50">
      {columns.map((column) => (
        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-base align-middle">
          {renderCell(column, data[column.key])}
        </td>
      ))}
    </tr>
  )
}
